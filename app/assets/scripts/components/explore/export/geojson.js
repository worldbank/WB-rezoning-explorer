import { saveAs } from 'file-saver';
import { formatThousands, toTitleCase, getTimestamp, round } from '../../../utils/format';
import config from '../../../config';
const { indicatorsDecimals } = config;
import { checkIncluded } from '../panel-data';
import difference from 'lodash.difference';

export default async function exportZonesGeoJSON (selectedArea, zones, selectedResource, filtersLists) {
  let filters = Object.entries( filtersLists ).map( ([name, filter]) => {
    if (filter.energy_type && !checkIncluded(filter, selectedResource)) {
      return;
    }
    let title = filter.title || filter.name;
    if (filter.unit) {
      title = `${title} (${filter.unit})`;
    }

    let value = filter.input.value;
    if (filter.isRange) {
      return {...filter, min_value: value.min, max_value: value.max};
    } else if ( typeof value === 'boolean' )
    {
      return {...filter, value: value};
    }
    return filter;
  } ).filter( (x) => x );

  const featureCollection = {
    type: 'FeatureCollection',
    features: zones.map((z) => {
      const { summary } = z.properties;
      return {
        ...z,
        properties: {
          name: z.properties.name,
          id: z.id,
          zone_score: round(summary.zone_score, indicatorsDecimals.zone_score),
          suitable_area: round(summary.suitable_area, 0),
          lcoe_usd_mwh: round(summary.lcoe, indicatorsDecimals.lcoe),
          generation_potential_gwh: round(
            summary.generation_potential,
            indicatorsDecimals.generation_potential
          ),
          zone_output_density_gwh_km2: round(
            summary.zone_output_density,
            indicatorsDecimals.zone_output_density
          ),
          installed_capacity_potential_mw: summary.icp,
          capacity_factor: round(summary.cf, indicatorsDecimals.cf),
        }
      };
    }),
    filters_values: filters,
  };

  const blob = new Blob([JSON.stringify(featureCollection)], {
    type: 'text/plain;charset=utf-8'
  });

  saveAs(blob, `WBG-REZoning-${selectedArea.id}-zones-${getTimestamp()}.geojson`);
}