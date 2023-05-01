import { saveAs } from 'file-saver';
import blobStream from 'blob-stream';
import { format } from '@fast-csv/format';
import { getTimestamp, round } from '../../../utils/format';
import config from '../../../config';
const { indicatorsDecimals } = config;

export async function exportSpatialFiltersCsv(selectedArea, selectedResource, selectedZoneType, filters) {
  const doc = format({ headers: true });
  console.log('selectedResource', selectedResource);
  console.log('selectedZoneType', selectedZoneType);

  const stream = doc.pipe(blobStream());

  // Parse filters
  const rows = filters
    .map(filter => {
      const filter_row = {
        id: filter.id,
        title: filter.title,
        description: filter.description,
        secondary_description: filter.secondary_description,
        category: filter.category,
        secondary_category: filter.secondary_category,
        layer: filter.layer,
        unit: filter.unit,
        active: filter.active,
        isRange: filter.isRange,
        value: !filter.isRange ? filter.input.value : undefined,
        min_value: filter.isRange ? filter.input.value.min : undefined,
        max_value: filter.isRange ? filter.input.value.max : undefined
      };
      return filter_row;
    });

  // Add filters to CSV
  rows.forEach((z) => doc.write(z));

  doc.end();

  return stream.on('finish', () => {
    saveAs(
      stream.toBlob('text/plain;charset=utf-8'),
      `WBG-REZoning-${selectedArea.id}-${selectedResource}-${selectedZoneType.name}-spatial-filters-${getTimestamp()}.csv`
    );
  });
}

function stringifyIfObject(value) {
  // Check if the value is an object and not an array or null
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return value;
}

export async function exportEconomicParametersCsv(selectedArea, selectedResource, selectedZoneType, lcoeValues) {
  const doc = format({ headers: true });

  const stream = doc.pipe(blobStream());

  // Parse economic parameters
  const rows = lcoeValues
    .map(param => {
      return {
        id: param.id,
        title: param.title,
        description: param.description.replace(';', ' '),
        category: param.category,
        type: param.type,
        priority: param.priority,
        value: stringifyIfObject(param.input.value)
      };
    });

  // Add economic parameters to CSV
  rows.forEach((z) => doc.write(z));

  doc.end();

  return stream.on('finish', () => {
    saveAs(
      stream.toBlob('text/plain;charset=utf-8'),
      `WBG-REZoning-${selectedArea.id}-${selectedResource}-${selectedZoneType.name}-economic-parameters-${getTimestamp()}.csv`
    );
  });
}

export async function exportZoneWeightsCsv(selectedArea, selectedResource, selectedZoneType, weightsValues) {
  const doc = format({ headers: true });

  const stream = doc.pipe(blobStream());

  // Parse economic parameters
  const rows = weightsValues
    .map(param => {
      return {
        id: param.id,
        title: param.title,
        description: param.description.replace(';', ' '),
        isPercentage: true,
        value: JSON.stringify(param.input.value)
      };
    });

  // Add economic parameters to CSV
  rows.forEach((z) => doc.write(z));

  doc.end();

  return stream.on('finish', () => {
    saveAs(
      stream.toBlob('text/plain;charset=utf-8'),
      `WBG-REZoning-${selectedArea.id}-${selectedResource}-${selectedZoneType.name}-zone-weights-${getTimestamp()}.csv`
    );
  });
}

export async function exportZonesCsv(selectedArea, selectedResource, selectedZoneType, zones) {
  const doc = format({ headers: true });

  const stream = doc.pipe(blobStream());

  // Parse zones
  const rows = zones
    .filter(
      ({
        /* eslint-disable camelcase */
        properties: {
          summary: { suitable_area }
        }
      }) => suitable_area > 0
    )
    .map(({ properties }) => {
      const { name, id, summary } = properties;

      let zone = {
        id,
        'Zone Score': round(summary.zone_score, indicatorsDecimals.zone_score),
        'Suitable Area (km²)': round(summary.suitable_area / 1000000, 0),
        'LCOE (USD/MWh)': round(summary.lcoe, indicatorsDecimals.lcoe),
        'Generation Potential (GWh)': round(
          summary.generation_potential,
          indicatorsDecimals.generation_potential
        ),
        'Zone Output Density (GWh/km²)': round(
          summary.zone_output_density,
          indicatorsDecimals.zone_output_density
        ),
        'Installed Capacity Potential (MW)': summary.icp,
        'Capacity Factor': round(summary.cf, indicatorsDecimals.cf)
      };

      // Add name if available
      if (name) zone = { Name: name, ...zone };

      return zone;
    });

  // Add zones to CSV
  rows.forEach((z) => doc.write(z));

  doc.end();

  return await stream.on('finish', function () {
    saveAs(
      stream.toBlob('text/plain;charset=utf-8'),
      `WBG-REZoning-${selectedArea.id}-${selectedResource}-${selectedZoneType.name}-zones-${getTimestamp()}.csv`
    );
  });
}
