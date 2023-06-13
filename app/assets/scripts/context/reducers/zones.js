import * as topojson from 'topojson-client';
import { fetchJSON, makeAPIReducer } from './reduxeed';
import config from '../../config';
import get from 'lodash.get';
import utf8 from 'utf8';
import zoneScoreColor from '../../styles/zoneScoreColors';
import theme from '../../styles/theme/theme';
import bbox from '@turf/bbox';
import circle from '@turf/circle';
import area from '@turf/area';
import point from 'turf-point';
import bboxPolygon from '@turf/bbox-polygon';
import pLimit from 'p-limit';
import distance from '@turf/distance';
import { polygon } from '@turf/helpers';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import { wrapLogReducer } from './../contexeed';
import { apiResourceNameMap, GRID } from '../../components/explore/panel-data';
import {
  updateLoadingProgress
} from '../../components/common/global-loading';

const limit = pLimit(20);
const { apiEndpoint } = config;

async function getZoneSummary (feature, filterString, weights, lcoe, countryResourcePath) {
  let summary = {
    lcoe: 0, zone_score: 0, generation_potential: 0, zone_output_density: 0, cf: 0
  };

  let validSummary = true;
  try {
    summary = (
      await fetchJSON(`${apiEndpoint}/zone${countryResourcePath}?${filterString}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          aoi: feature.geometry,
          weights,
          lcoe
        })
      })
    ).body;
  } catch (error) {
    // eslint-disable-next-line
    console.log(`Error fetching zone ${feature.properties.id} analysis.`);
    validSummary = false;
  }

  // Set negative values to zero
  Object.keys(summary).forEach(key => {
    if (summary[key] < 0) summary[key] = 0;
  });

  return {
    ...feature,
    id: feature.properties.id,
    properties: {
      color: theme.main.color.base,
      ...feature.properties,
      summary
    },
    is_valid_summary: validSummary,
  };
}

export const fetchZonesReducer = wrapLogReducer(makeAPIReducer('FETCH_ZONES'));
/*
 * Make all asynchronous requests to load zone score from REZoning API
 * dispatch updates to some context using 'dispatch' function
 */

function makeBoundingBoxSquare(bounds, cellSize) {
  const [minLng, minLat, maxLng, maxLat] = bounds;

  // Calculate the center point
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  // Calculate the maximum dimension
  const lngDiff = maxLng - minLng;
  const latDiff = maxLat - minLat;
  const maxDiff = Math.max(lngDiff, latDiff);

  // Convert the dimension difference from degrees to kilometers
  // Note: This is a simple conversion and might not be accurate over large distances
  let radius = maxDiff * 111.32 / 2; // ~111.32 kilometers per degree
  radius = Math.round(radius / cellSize) * cellSize;

  // Create a circle around the center point
  const _circle = circle([centerLng, centerLat], radius, { units: 'kilometers' });

  // Create a square bounding box around the circle
  const squareBbox = bbox(_circle);
  console.log('DEBUG - polygon', bboxPolygon(squareBbox));
  return squareBbox;
}

function booleanPointInLayer(pt, feature) {
  if (feature.geometry.type === 'Polygon') {
    if (booleanPointInPolygon(pt, feature)) {
      return true;
    }
  } else if (feature.geometry.type === 'MultiPolygon') {
    for (let j = 0; j < feature.geometry.coordinates.length; j++) {
      const _polygon = polygon(feature.geometry.coordinates[j]);
      if (booleanPointInPolygon(pt, _polygon)) {
        return true;
      }
    }
  }
  return false;
}

export function normalizeLongitude(lng) {
  let newLng = lng;
  if (newLng === -180.0) {
    newLng = 175;
  }
  while (newLng < -180.0 || newLng > 180.0) {
    if (newLng < 0) {
      newLng += 360.0;
    } else {
      newLng -= 360.0;
    }
  }
  return newLng;
}
function createGrid(bbox, cellSizeKm, areaLimit = null, offShoreLimit = null) {
  const min = point([bbox[0], bbox[1]]);
  const max = point([bbox[2], bbox[3]]);

  const xDistance = distance(min, point([max.geometry.coordinates[0], min.geometry.coordinates[1]]), { units: 'kilometers' });
  const yDistance = distance(min, point([min.geometry.coordinates[0], max.geometry.coordinates[1]]), { units: 'kilometers' });

  const xFraction = cellSizeKm / xDistance;
  const cellWidth = xFraction * (bbox[2] - bbox[0]);

  const yFraction = cellSizeKm / yDistance;
  const cellHeight = yFraction * (bbox[3] - bbox[1]);

  const xCells = Math.ceil(1 / xFraction);
  const yCells = Math.ceil(1 / yFraction);

  const grid = [];

  for (let i = 0; i < xCells; i++) {
    for (let j = 0; j < yCells; j++) {
      const minLon = bbox[0] + i * cellWidth;
      const minLat = bbox[1] + j * cellHeight;
      const maxLon = minLon + cellWidth;
      const maxLat = minLat + cellHeight;
      if (!areaLimit && !offShoreLimit) {
        grid.push(bboxPolygon([minLon, minLat, maxLon, maxLat]));
      } else {
        const cellCenter = point([
          normalizeLongitude((minLon + maxLon) / 2),
          (minLat + maxLat) / 2]);
        if (offShoreLimit && booleanPointInLayer(cellCenter, offShoreLimit)) {
          grid.push(bboxPolygon([minLon, minLat, maxLon, maxLat]));
        } else if (areaLimit) {
          if (booleanPointInPolygon(cellCenter, areaLimit)) {
            grid.push(bboxPolygon([minLon, minLat, maxLon, maxLat]));
          }
        }
      }
    }
  }
  return grid;
}

export async function fetchZones (
  selectedArea,
  selectedResource,
  selectedZoneType,
  filterString,
  weights,
  lcoe,
  dispatch
) {
  dispatch({ type: 'REQUEST_FETCH_ZONES' });
  try {
    const { id: areaId, type } = selectedArea;

    let features = [];
    // Get area topojson
    let countryTopojson = `/public/zones/${type}/${areaId}.topojson`;
    try {
      if (selectedArea.merged_exist && selectedZoneType.type === GRID) {
        countryTopojson = `/public/zones/${type}/${areaId}_merged.topojson`;
      }
    } catch (e) {
    }
    let areaLimits = null;

    const { body: zonesTopoJSON } = await fetchJSON(
      countryTopojson
    );

    if (selectedResource === 'Off-Shore Wind' || !selectedArea.size || selectedArea.size !== 'xs') {
      areaLimits = topojson.merge(
        zonesTopoJSON,
        zonesTopoJSON.objects[areaId].geometries
      );
    }

    if (selectedResource === 'Off-Shore Wind') {
      // if offshore wind, we are already in grid and bounds are eez bounds
      const areaGrid = createGrid(
        selectedArea.bounds,
        parseInt(selectedZoneType.size),
        areaLimits, selectedArea.eez[0]);
      features = areaGrid.map((ft, i) => ({
        ...ft,
        properties: { id: i }
      }));
    } else {
      // Get sub areas from Topojson
      if (selectedZoneType.type === GRID) {
        const areaGrid = createGrid(selectedArea.bounds, parseInt(selectedZoneType.size), areaLimits);
        features = areaGrid.map((ft, i) => ({
          ...ft,
          properties: { id: i }
        }));
      } else {
        const subAreas = topojson.feature(
          zonesTopoJSON,
          zonesTopoJSON.objects[areaId]
        ).features;

        // Set id from GID, if undefined
        features = subAreas.map((f) => {
          if (typeof f.properties.id === 'undefined') {
            f.properties.id = f.properties.GID_0;
          }
          if (typeof f.properties.name === 'undefined') {
            f.properties.name = f.properties.NAME_0;
          }
          // fix data utf8 encoding
          try {
            f.properties.name = utf8.decode(f.properties.name);
          } catch (error) {
            // eslint-disable-next-line
            console.log('Failed to decode ', f.properties);
          }
          return f;
        });
      }
    }

    // If area of country type, prepare country & resource path string to add to URL
    const countryResourcePath = `/${selectedArea.id}/${apiResourceNameMap[selectedResource]}`;

    // Fetch Lcoe for each sub-area
    const zoneUpdateInterval = setInterval(() => {
      const totalZones = features.length;
      const completeZones = features.length - limit.pendingCount - limit.activeCount;
      updateLoadingProgress(completeZones, totalZones);
    }, 5);

    const zones = await Promise.all(
      features.map((z) =>
        limit(() => getZoneSummary(z, filterString, weights, lcoe, countryResourcePath))
      )
    );
    updateLoadingProgress(0, 0);
    clearInterval(zoneUpdateInterval);

    const validZones = zones.filter(z => z.is_valid_summary);

    const minScore = Math.min(
      ...validZones.map((z) => get(z, 'properties.summary.zone_score', 0))
    );
    const maxScore = Math.max(
      ...validZones.map((z) => get(z, 'properties.summary.zone_score', 0))
    );

    const data = validZones.map((z, index) => {
      if (get(z, 'properties.summary.zone_score') === undefined || get(z, 'properties.summary.zone_score') === null) return z;

      const zoneScore = z.properties.summary.zone_score > 0 ? (z.properties.summary.zone_score / maxScore) : z.properties.summary.zone_score;
      const color = zoneScoreColor(zoneScore);
      return {
        ...z,
        properties: {
          ...z.properties,
          color,
          summary: {
            ...z.properties.summary,
            zone_score: zoneScore
          }
        }
      };
    });

    data.lcoe = lcoe;
    data.weights = weights;
    dispatch({ type: 'RECEIVE_FETCH_ZONES', data: data });
  } catch (err) {
    dispatch({ type: 'ERROR', error: err });
  }
}
