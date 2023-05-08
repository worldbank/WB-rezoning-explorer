import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import T from 'prop-types';
import { themeVal } from '../../styles/utils/general';
import useQsState from '../../utils/qs-state-hook';
import {
  PanelBlock,
  PanelBlockHeader,
  PanelBlockBody,
  PanelBlockFooter,
  PanelBlockFooterRow
} from '../common/panel-block';
import TabbedBlockBody from '../common/tabbed-block-body';
import Button from '../../styles/button/button';
import Heading, { Subheading } from '../../styles/type/heading';

import {
  INPUT_CONSTANTS,
  checkIncluded,
  apiResourceNameMap
} from './panel-data';
import { HeadOption, HeadOptionHeadline } from '../../styles/form/form';
import { FiltersForm, WeightsForm, LCOEForm } from './form';
import Prose from '../../styles/type/prose';

import {
  initByType,
  castByFilterType,
  filterQsSchema,
  weightQsSchema,
  lcoeQsSchema
} from '../../context/qs-state-schema';

import {
  exportSpatialFiltersCsv,
  exportEconomicParametersCsv,
  exportZoneWeightsCsv
} from './export/csv';

import ModalUpload from './modal-upload-files';
import CSVReader from './csv-upload';

const { GRID_OPTIONS } = INPUT_CONSTANTS;

const Subheadingstrong = styled.strong`
  color: ${themeVal('color.base')};
`;

export const EditButton = styled(Button).attrs({
  variation: 'base-plain',
  size: 'small',
  useIcon: 'pencil',
  hideText: true
})`
  opacity: 50%;
  margin-left: auto;
`;

const SubmissionSection = styled(PanelBlockFooter)`
  display: flex;
  flex-direction: column;
  grid-row-gap: 15px;
`;

const ButtonRow = styled(PanelBlockFooterRow)`
  display: flex;
  width: 100%;
  gap: 15px;
`;

const PreAnalysisMessage = styled(Prose)`
  padding: 1rem 1.5rem;
  text-align: center;
`;

const ExportButton = styled(Button)`
  grid-column-start: 1;
  grid-column-end: 3;
`;

const ImportButton = styled(Button)`
  grid-column-start: 1;
  grid-column-end: 3;
`;

export const ZoneTypeSizeSubheading = styled(Subheadingstrong)`
  margin-left: 5px;
`;

function QueryForm(props) {
  const {
    area,
    resource,
    filtersLists,
    weightsList,
    lcoeList,
    updateFilteredLayer,
    filterRanges,
    onAreaEdit,
    onResourceEdit,
    onInputTouched,
    onSelectionChange,
    selectedZoneType,
    onZoneTypeEdit,

    setSelectedAreaId,
    setSelectedResource,
    setSelectedZoneType,

    importingData,
    setImportingData,

    firstLoad
  } = props;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  let sortedData = [];
  let economicSortedData = [];

  /* Generate weights qs state variables
   */

  const weightsInd = weightsList.map((w) => {
    const [weight, setWeight] = useQsState(weightQsSchema(w));
    return [weight, setWeight];
  });
  const [weightsLocks, setWeightLocks] = useState({});

  const handleFilterSorteData = (list) => {
    if (checkIncluded(list, resource)) {
      sortedData = [...sortedData, list];
      const uniqueFilter = sortedData.reduce((filter, current) => {
        if (!filter.find((item) => item?.id === current?.id)) {
          filter.push(current);
        }
        return filter;
      }, []);

      sortedData = uniqueFilter;
    }
  };

  const handleEconomicSortedData = (cost) => {
    economicSortedData = [...economicSortedData, cost];
    const uniqueFilter = economicSortedData.reduce((filter, current) => {
      if (!filter.find((item) => item?.id === current?.id)) {
        filter.push(current);
      }
      return filter;
    }, []);
    economicSortedData = uniqueFilter;
  };
  /* Generate filters qs state variables */
  const filtersInd = filtersLists.map((f) => {
    const [filt, setFilt] = useQsState(
      filterQsSchema(f, filterRanges, resource)
    );
    return [filt, setFilt];
  });

  const initialize = (baseList, destList, options) => {
    const { reset, apiRange } = options || {};
    baseList.forEach((base, ind) => {
      const [object, setObject] = destList[ind];
      if (object && !reset) {
        // This filter has been set via the url
        // Does not need to be initialized
        const updated = {
          ...object,
          input: {
            ...initByType(object, apiRange || {}, apiResourceNameMap[resource])
          }
        };
        setObject(updated);
        return;
      }

      // Initialize the filter with default values
      setObject({
        ...base,
        input: {
          ...initByType(base, apiRange || {}, apiResourceNameMap[resource])
        },
        active: base.active === undefined ? true : base.active
      });
    });
  };

  const lcoeInd = lcoeList.map((c) => {
    const [cost, setCost] = useQsState(lcoeQsSchema(c, resource));
    return [cost, setCost];
  });

  const resetClick = () => {
    if (filterRanges) {
      initialize(filtersLists, filtersInd, {
        reset: true,
        apiRange: filterRanges
      });
    } else {
      initialize(filtersLists, filtersInd, { reset: true });
    }
    initialize(lcoeList, lcoeInd, { reset: true });

    // Apply defaults to weights
    weightsInd.forEach(([w, setW]) => {
      setW({
        ...w,
        input: {
          ...w.input,
          value: w.input.default
        }
      });
    });

    // Clear weight locks
    setWeightLocks({});
  };

  /* Reduce filters, weights, and lcoe
   * Call function to send values to api
   */
  const applyClick = () => {
    const weightsValues = weightsInd.reduce(
      (accum, [weight, _]) => ({
        ...accum,
        // The frontend deals with weights as 0 - 100
        // Convert to 0 - 1 decimal value before sending to backend
        [weight.id || weight.name]:
          castByFilterType(weight.input.type)(weight.input.value) / 100
      }),
      {}
    );

    const lcoeValues = lcoeInd.reduce((accum, [cost, _]) => {
      const val = castByFilterType(cost.input.type)(cost.input.value);
      return {
        ...accum,
        // Percentage values are served as decimal, rendered as integer 0 - 100
        [cost.id || cost.name]: cost.isPercentage ? val / 100 : val
      };
    }, {});

    // Get filters and discard setting functions
    const filters = filtersInd.map(([filter, _]) => filter);

    updateFilteredLayer(filters, weightsValues, lcoeValues);
  };
  useEffect(() => {
    /* if in the process of importing data then don't re-initialize */
    if (importingData) {
      setImportingData(false);
      return;
    }

    /* When filter ranges update we should reset to match ranges */
    initialize(filtersLists, filtersInd, {
      // On first load, we do not reset. Set values from url
      // On subsequent load, set values from range because ranges have changed
      reset: !firstLoad.current,
      apiRange: filterRanges
    });

    if (firstLoad.current && filterRanges) {
      firstLoad.current = false;
    }
  }, [filterRanges, resource]);

  useEffect(onInputTouched, [area, resource]);
  useEffect(onSelectionChange, [area, resource, selectedZoneType]);

  /* Update capacity factor options based on
   * what the current resource is
   */
  useEffect(() => {
    if (resource) {
      try {
        const [capacity, setCapacity] = lcoeInd.find(
          ([cost, _]) => cost.id === 'capacity_factor'
        );
        capacity.input.availableOptions =
          capacity.input.options[apiResourceNameMap[resource]];
        capacity.input.value = capacity.input.availableOptions[0];
        capacity.name =
          resource === 'Solar PV' ? 'Solar Unit Type' : 'Turbine Type';
        setCapacity(capacity);
      } catch (err) {
        /* eslint-disable-next-line */
        console.error(err);
      }
    }
  }, [resource]);

  const handleImportCSV = (results, fileInfo) => {
    const indexDict = {};
    setImportingData(true);
    results.data[0].map((i, index) => (indexDict[i] = index));
    try {
      if (
        fileInfo.name.match(
          /^WBG-REZoning-([A-Z]{3})-([^-]*)-(.*)-spatial-filters.*\.csv$/g
        )
      ) {
        filtersInd.forEach(([filter, setFilter]) => {
          const reqArray = results.data.find(
            (it) => it[indexDict['id']] == filter.id
          );
          if (typeof reqArray === 'undefined') {
            return; // Skip this
          }
          if (filter.input.type == 'multi-select') {
            filter.input.value = reqArray[indexDict['value']]
              .split(',')
              .map((num) => +num);
          } else if (filter.input.type == 'boolean') {
            filter.input.value = reqArray[indexDict['value']];
          } else {
            filter.input.value.max = parseFloat(reqArray[indexDict['max_value']]);
            filter.input.value.min = parseFloat(reqArray[indexDict['min_value']]);
          }
          setFilter(filter);
        });
      } else if (
        fileInfo.name.match(
          /^WBG-REZoning-([A-Z]{3})-([^-]*)-(.*)-economic-parameters.*\.csv$/g
        )
      ) {
        lcoeInd.forEach(([filter, setFilter]) => {
          const reqArray = results.data.find(
            (it) => it[indexDict['id']] == filter.id
          );
          if (filter.input.type == 'dropdown') {
            const selectedOption = filter.input.availableOptions.find(
              (option) =>
                JSON.parse(reqArray[indexDict['value']]).id == option.id
            );
            if (selectedOption) {
              filter.input.value = selectedOption.id;
            }
          } else {
            filter.input.value = reqArray[indexDict['value']];
          }
          setFilter(filter);
        });
      } else if (
        fileInfo.name.match(
          /^WBG-REZoning-([A-Z]{3})-([^-]*)-(.*)-zone-weights.*\.csv$/g
        )
      ) {
        weightsInd.forEach(([filter, setFilter]) => {
          const reqArray = results.data.find(
            (it) => it[indexDict['id']] == filter.id
          );
          filter.input.value = reqArray[indexDict['value']];
          setFilter(filter);
        });
      } else {
        alert('invalid file');
        return false;
      }
    } catch (error) {
      // In case the app gets supplied a wrong csv file
      console.error('Error reading file:', error);
      alert('invalid file');
      setImportingData(false);
      return false;
    }
    setShowUploadModal(false);
    return true;
  };

  /* Wait until elements have mounted and been parsed to render the query form */
  if (firstLoad.current) {
    return (
      <PanelBlock>
        <PanelBlockHeader>
          <HeadOption>
            <HeadOptionHeadline id='selected-area-prime-panel-heading'>
              <Heading size='large' variation='primary'>
                {area ? area.name : 'Select Area'}
              </Heading>
              <EditButton
                id='select-area-button'
                onClick={onAreaEdit}
                title='Edit Area'
              >
                Edit Area Selection
              </EditButton>
            </HeadOptionHeadline>
          </HeadOption>

          <HeadOption>
            <HeadOptionHeadline id='selected-resource-prime-panel-heading'>
              <Subheading>Resource: </Subheading>
              <Subheading variation='primary'>
                <Subheadingstrong>
                  {resource || 'Select Resource'}
                </Subheadingstrong>
              </Subheading>
              <EditButton
                id='select-resource-button'
                onClick={onResourceEdit}
                title='Edit Resource'
              >
                Edit Resource Selection
              </EditButton>
            </HeadOptionHeadline>
          </HeadOption>

          <HeadOption>
            <HeadOptionHeadline>
              <Subheading>Zone Type and Size: </Subheading>
              <Subheading variation='primary'>
                <ZoneTypeSizeSubheading>
                  { selectedZoneType ? selectedZoneType.size > 0 ? `${selectedZoneType.size} km²` : 'Boundaries' : 'Select Zone Type And Size'}
                </ZoneTypeSizeSubheading>
              </Subheading>

              <EditButton
                id='select-zone-type-button'
                onClick={onZoneTypeEdit}
                title='Edit Zone Type'
              >
                Edit Zone Type Selection
              </EditButton>
            </HeadOptionHeadline>
          </HeadOption>
        </PanelBlockHeader>
        <PanelBlockBody>
          <PreAnalysisMessage>Loading...</PreAnalysisMessage>
        </PanelBlockBody>
        <SubmissionSection>
          <Button
            size='small'
            type='reset'
            disabled={!area || !resource}
            onClick={resetClick}
            variation='primary-raised-light'
            useIcon='arrow-loop'
          >
            Reset
          </Button>
          <Button
            id='generate-zones'
            size='small'
            type='submit'
            disabled={!area || !resource}
            onClick={applyClick}
            variation='primary-raised-dark'
            useIcon='tick--small'
            title={
              !area || !resource
                ? 'Both area and resource must be set to generate zones'
                : 'Generate Zones Analysis'
            }
          >
            Generate Zones
          </Button>
        </SubmissionSection>
      </PanelBlock>
    );
  }

  const tabbedBlockBodyRef = React.createRef();

  return (
    <PanelBlock>
      <PanelBlockHeader>
        <HeadOption>
          <HeadOptionHeadline id='selected-area-prime-panel-heading'>
            <Heading size='large' variation='primary'>
              {area ? area.name : 'Select Area'}
            </Heading>
            <EditButton
              id='select-area-button'
              onClick={onAreaEdit}
              title='Edit Area'
            >
              Edit Area Selection
            </EditButton>
          </HeadOptionHeadline>
        </HeadOption>

        <HeadOption>
          <HeadOptionHeadline id='selected-resource-prime-panel-heading'>
            <Subheading>Resource: </Subheading>
            <Subheading variation='primary'>
              <Subheadingstrong>
                {resource || 'Select Resource'}
              </Subheadingstrong>
            </Subheading>
            <EditButton
              id='select-resource-button'
              onClick={onResourceEdit}
              title='Edit Resource'
            >
              Edit Resource Selection
            </EditButton>
          </HeadOptionHeadline>
        </HeadOption>

        <HeadOption>
          <HeadOptionHeadline>
            <Subheading>Zone Type and Size: </Subheading>
            <Subheading variation='primary'>
              <ZoneTypeSizeSubheading>
                { selectedZoneType ? selectedZoneType.size > 0 ? `${selectedZoneType.size} km²` : 'Boundaries' : 'Select Zone Type And Size'}
              </ZoneTypeSizeSubheading>
            </Subheading>

            <EditButton
              id='select-zone-type-button'
              onClick={onZoneTypeEdit}
              title='Edit Zone Type'
            >
              Edit Zone Type Selection
            </EditButton>
          </HeadOptionHeadline>
        </HeadOption>
      </PanelBlockHeader>

      <TabbedBlockBody setActivePanel={setActivePanel}>
        <FiltersForm
          id='filters-tab'
          name='Filters'
          icon='filter'
          disabled={!area || !resource}
          filters={filtersInd}
          checkIncluded={checkIncluded}
          resource={resource}
          selectedArea={area}
          handleSorteData={handleFilterSorteData}
        />
        <LCOEForm
          id='economics-tab'
          name='Economics'
          icon='disc-dollar'
          lcoe={lcoeInd}
          disabled={!area || !resource}
          selectedArea={area}
          handleEconomicSortedData={handleEconomicSortedData}
        />
        <WeightsForm
          id='weights-tab'
          name='weights'
          icon='sliders-horizontal'
          weights={weightsInd}
          disabled={!area || !resource}
          weightsLocks={weightsLocks}
          setWeightLocks={setWeightLocks}
          selectedArea={area}
        />
      </TabbedBlockBody>
      <SubmissionSection>
        <ButtonRow>
          <ExportButton
            id='import-tour-target'
            key='import-button'
            size='small'
            style={{ width: '50%', whiteSpace: 'normal' }}
            onClick={() => {
              setShowUploadModal(true);
            }}
            variation='primary-raised-light'
            useIcon='upload'
          >
            Import
          </ExportButton>
          <ExportButton
            id='export-tour-target'
            key='export-button'
            size='small'
            style={{ width: '50%', whiteSpace: 'normal' }}
            onClick={() => {
              switch (activePanel) {
                case 0:
                  exportSpatialFiltersCsv(
                    area,
                    resource,
                    selectedZoneType,
                    sortedData
                  );
                  break;
                case 1:
                  exportEconomicParametersCsv(
                    area,
                    resource,
                    selectedZoneType,
                    economicSortedData
                  );
                  break;
                case 2:
                  exportZoneWeightsCsv(
                    area,
                    resource,
                    selectedZoneType,
                    weightsInd.map((f) => f[0])
                  );
                  break;
              }
            }}
            variation='primary-raised-light'
            useIcon='download'
          >
            Export
          </ExportButton>
        </ButtonRow>
        <ButtonRow>
          <Button
            size='small'
            type='reset'
            style={{ width: '40%' }}
            disabled={!area || !resource}
            onClick={resetClick}
            variation='primary-raised-light'
            useIcon='arrow-loop'
          >
            Reset
          </Button>
          <Button
            id='generate-zones'
            size='small'
            type='submit'
            style={{ width: '60%' }}
            disabled={!area || !resource}
            onClick={applyClick}
            variation='primary-raised-dark'
            useIcon='tick--small'
            title={
              !area || !resource
                ? 'Both area and resource must be set to generate zones'
                : 'Generate Zones Analysis'
            }
          >
            Generate Zones
          </Button>
        </ButtonRow>
      </SubmissionSection>
      <ModalUpload
        revealed={showUploadModal}
        onOverlayClick={() => {
          setShowUploadModal(false);
        }}
        onCloseClick={() => {
          setShowUploadModal(false);
        }}
        data={[]}
        renderHeadline={() => <h1>Add file to upload</h1>}
      >
        <CSVReader
          setSelectedAreaId={setSelectedAreaId}
          setSelectedResource={setSelectedResource}
          setSelectedZoneType={setSelectedZoneType}
          selectedZoneType={selectedZoneType}
          handleImportCSV={handleImportCSV}
        />
      </ModalUpload>
    </PanelBlock>
  );
}

QueryForm.propTypes = {
  area: T.object,
  resource: T.string,
  setSelectedAreaId: T.func,
  setSelectedResource: T.func,
  setSelectedZoneType: T.func,
  filtersLists: T.array,
  weightsList: T.array,
  lcoeList: T.array,
  updateFilteredLayer: T.func,
  filterRanges: T.object,
  onResourceEdit: T.func,
  onAreaEdit: T.func,
  onInputTouched: T.func,
  onSelectionChange: T.func,
  selectedZoneType: T.object,
  onZoneTypeEdit: T.func,
  firstLoad: T.object,
  importingData: T.bool,
  setImportingData: T.func
};

export default QueryForm;
