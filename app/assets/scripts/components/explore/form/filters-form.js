import React, { useCallback, useContext, useEffect } from 'react';
import T from 'prop-types';
import styled from 'styled-components';

import {
  FormWrapper,
  FormGroupWrapper,
  PanelOption,
  OptionHeadline,
  PanelOptionTitle,
  EmptyState
} from '../../../styles/form/form';
import FormIntro from './form-intro';
import { Accordion, AccordionFold, AccordionFoldTrigger } from '../../../components/accordion';
import Heading from '../../../styles/type/heading';
import { makeTitleCase } from '../../../styles/utils/general';

import { FormSwitch } from '../../../styles/form/switch';
import { INPUT_CONSTANTS, RESOURCES, apiResourceNameMap } from '../panel-data';

import FormInput from './form-input';
import Dropdown from '../../common/dropdown';

import Button from '../../../styles/button/button';

import MapContext from '../../../context/map-context'
import ExploreContext from '../../../context/explore-context'
import FormContext from '../../../context/form-context'

import config from '../../../config';

const {
  BOOL,
} = INPUT_CONSTANTS;


const DropdownWide = styled(Dropdown)`
max-width: 600px;
background: rgba(0,0,0,0.8);
color: white;
`;

const StyledOptionHeadline = styled(OptionHeadline)`
display: grid;
grid-template-columns: 1fr repeat(0.05rem, 3);
gap: 0.5rem;
> ${PanelOptionTitle} {
  grid-column-start: 1;
  inline-size: 100%;
  word-break: break-word;
}
> ${Button}.info-button {
  grid-column-start: 2;
}
> ${FormSwitch} {
  grid-column-start: 3;
}
> ${Button}.layer-visibility-button {
  grid-column-start: 4;
}
`;

/* Filters form
 * @param outputFilters is an array of shape
 *  [
 *    [getFilter1 (value), setFilter1 (func), filter1Object (object) ],
 *    ...
 *  ]
 *  @param presets - required, accessed by parent TabbedBlockBody
 *  @param setPreset - requred, accessed by parent TabbedBlockBody
 */
function FiltersForm (props) {
  const {
    filters,
    checkIncluded,
    resource,
    active,
    disabled,
    selectedArea,
    handleSorteData
  } = props;

  const {
    map,
    mapLayers,
    setMapLayers,
  } = useContext(MapContext);

  const {
    getLayerFilterString,
  } = useContext(ExploreContext);

  useEffect(() => {
    if ( map )
    {
      filters.map( ([filter, _]) => filter )
            .map( (filter) => updateFilter( filter ) );
    }
  }, [map, filters]);

  useEffect(() => {
    if (map)
    {
      mapLayers.map( layer => {
        let visible = map.getLayoutProperty( layer.id, 'visibility' ) === 'visible';
        if ( layer.visible != visible )
        {
          map.setLayoutProperty( layer.id, 'visibility', layer.visible ? 'visible' : 'none' );
        }
      } );
    }
  }, [mapLayers]);

  const getLayerVisibility = ( filter ) => {
    return mapLayers.find( (layer) => layer.id == filter.layer )?.visible;
  };

  const updateFilter = ( filter ) => {
    if ( map )
    {
      const oldLayer = map.getStyle().layers.find( layer => layer.id == filter.layer );
      if ( oldLayer == undefined )
        return;
      
      let layerSourceId = filter.layer + "_source";
      const source = map.getSource( layerSourceId );

      const filterString = getLayerFilterString( filter );
      
      // Off-shore mask flag
      const offshoreWindMask = resource === RESOURCES.OFFSHORE ? 'offshore=true' : 'offshore=false';

      let newLayerSrcPath = `${config.apiEndpoint}/layers/${selectedArea.id}/${apiResourceNameMap[resource]}/${filter.layer}/{z}/{x}/{y}.png?colormap=viridis&${filterString}&${offshoreWindMask}`;
      
      // Do not update the source if it hasn't changed
      if ( Array.isArray( source.tiles ) && (newLayerSrcPath === source.tiles[0] ) )
        return;

      map.removeLayer( filter.layer );
      map.removeSource( layerSourceId );
      map.addSource( layerSourceId, {
        type: source.type, 
        tiles: [newLayerSrcPath], 
        tileSize: source.tileSize,
        data: source.data,
        promoteId: source.promoteId,
      } );
      map.addLayer( oldLayer );
    }
  };

  const onFilterVisibilityToggle = ( toggledFilter ) => {    
    const nonVectorMapLayers = mapLayers.filter( layer => !layer.id.endsWith('_vector') );
    const vectorMapLayers = mapLayers.filter( layer => layer.id.endsWith('_vector') );

    const toggledLayerId = toggledFilter.layer;
    const toggledLayerIndex = nonVectorMapLayers.findIndex((layer) => layer.id === toggledLayerId);
    let editedMapLayers = nonVectorMapLayers.map( l => l );
    
    if ( editedMapLayers[toggledLayerIndex].visible )
    {
      // Hide the toggled filter and show the non visible layer that has the highest timestamp
      editedMapLayers[toggledLayerIndex].visible = false;
      
      // If the layer is an exclusive raster layer, we find the layer that was hidden last and then show it
      let visibilityTimeStamps = editedMapLayers.map( l => l?.visibilityTimeStamp ? l.visibilityTimeStamp : 0 );
      let highestTimeStamp = Math.max( ...visibilityTimeStamps );

      while ( highestTimeStamp > 0 )
      {
        let ind = editedMapLayers.findIndex((l) => l.visibilityTimeStamp === highestTimeStamp);
        if ( ind !== -1 && !editedMapLayers[ind].visible )
        {
          editedMapLayers[ind].visible = true;
          editedMapLayers[ind].visibilityTimeStamp = 0;
          break;
        }
        else
        {
          highestTimeStamp--;
        }
      }
    }
    else
    {
      // Show the toggled filter and hide the currently visible layer and assign visiblity timestamp
      let visibilityTimeStamps = editedMapLayers.map( l => l?.visibilityTimeStamp ? l.visibilityTimeStamp : 0 );
      let highestTimeStamp = Math.max( ...visibilityTimeStamps );

      editedMapLayers = editedMapLayers.map( (f) => {
        if (f.visible)
        {
          f.visible = false;
          f.visibilityTimeStamp = highestTimeStamp + 1;
        }
        return f;
      } );
      editedMapLayers[toggledLayerIndex].visible = true;
    }

    vectorMapLayers.map( layer => {
      const rasterLayerName = layer.id.substr(0, layer.id.length - "_vector".length );
      const indexInEdited = editedMapLayers.findIndex( raster => raster.id === rasterLayerName );
      layer.visible = editedMapLayers[indexInEdited].visible;
      editedMapLayers.push( layer );
    } )

    setMapLayers( editedMapLayers );
  };

  return (
    <div>
      {disabled && (
        <EmptyState>
          Select Area and Resource to view and interact with input parameters.
        </EmptyState>
      )}
      <FormWrapper active={active} disabled={disabled}>
        <FormIntro
          formTitle='Spatial Filters'
          introText='This step identifies areas suitable for solar PV (or wind or offshore wind) development by applying spatial filters. Suitable areas will then be used to generate solar energy zones, which can be scored with user-provided weights and economic assumptions.'
        />
        <Accordion
          initialState={[
            ...filters
              .reduce((seen, [filt, setFilt]) => {
                if (!seen.includes(filt.category)) {
                  seen.push(filt);
                }
                return seen;
              }, [])
              .map((_) => true)
          ]}
          // foldCount={Object.keys(filters).length + 1}
          allowMultiple
        >
          {({ checkExpanded, setExpanded }) => (
            <>
              {Object.entries(
                filters.reduce((accum, filt) => {
                  const [get] = filt;
                  if (!accum[get.category]) {
                    accum[get.category] = [];
                  }
                  accum[get.category].push(filt);
                  return accum;
                }, {})
              ).map(([group, list], idx) => {
                /* Filters, built as AccordionFolds for each category */
                return (
                  <AccordionFold
                    key={group}
                    forwardedAs={FormGroupWrapper}
                    isFoldExpanded={checkExpanded(idx)}
                    setFoldExpanded={(v) => setExpanded(idx, v)}
                    renderHeader={({ isFoldExpanded, setFoldExpanded }) => (
                      <AccordionFoldTrigger
                        isExpanded={isFoldExpanded}
                        onClick={() => setFoldExpanded(!isFoldExpanded)}
                      >
                        <Heading size='small' variation='primary'>
                          {makeTitleCase(group.replace(/_/g, ' '))}
                        </Heading>
                      </AccordionFoldTrigger>
                    )}
                    renderBody={({ isFoldExpanded }) =>
                      list
                        .sort(([a, _a], [b, _b]) => {
                          return a.priority - b.priority;
                        })
                        .filter(
                          ([f, _]) => f.input.range[0] !== f.input.range[1]
                        )
                        .map(([filter, setFilter], ind) => {
                          const inputOnChange = useCallback(
                            (value) => {
                              if (filter.active) {
                                setFilter({
                                  ...filter,
                                  input: {
                                    ...filter.input,
                                    value
                                  }
                                });
                              }
                            },

                            [filter]
                          );

                          const switchOnChange = useCallback(() => {
                            setFilter({
                              ...filter,
                              active: !filter.active,
                              input: {
                                ...filter.input,
                                value:
                                  filter.input.type === BOOL
                                    ? !filter.active
                                    : filter.input.value
                              }
                            });
                          }, [filter]);
                          handleSorteData(filter)
                          return (
                            checkIncluded(filter, resource) && (
                              <PanelOption
                                key={filter.name}
                                hidden={!isFoldExpanded}
                              >
                                <StyledOptionHeadline>
                                  <PanelOptionTitle>
                                    {`${filter.name}`.concat(
                                      filter.unit ? ` (${filter.unit})` : ''
                                    )}  
                                  </PanelOptionTitle>
                                  {filter.info && (
                                    <DropdownWide
                                      alignment='center'
                                      direction='down'
                                      triggerElement={
                                        <Button
                                          hideText
                                          useIcon='circle-information'
                                          className='info-button'
                                        >
                                          Info
                                        </Button>
                                      }>
                                      <div>
                                        Usage: &nbsp;
                                        {filter.description}<br/>
                                        Data Source: &nbsp;
                                        <a href={filter.source_url} target="_blank"> {filter.source_url} </a>
                                      </div>
                                    </DropdownWide>
                                  )}

                                  <FormSwitch
                                    hideText
                                    name={`toggle-${filter.name.replace(
                                      / /g,
                                      '-'
                                    )}`}
                                    disabled={filter.disabled}
                                    checked={filter.active}
                                    onChange={switchOnChange}
                                  >
                                    Toggle filter
                                  </FormSwitch>
                                  <Button
                                    variation='base-plain'
                                    useIcon={getLayerVisibility(filter) ? 'eye' : 'eye-disabled'}
                                    title='toggle layer visibiliity'
                                    className='layer-visibility-button'
                                    hideText
                                    onClick={ () => {
                                          onFilterVisibilityToggle( filter );
                                        }
                                    }
                                    visuallyDisabled={props.disabled}
                                  >
                                    <span>Toggle Layer Visibility</span>
                                  </Button>
                                </StyledOptionHeadline>
                                <FormInput
                                  option={filter}
                                  onChange={inputOnChange}
                                />
                              </PanelOption>
                            )
                          );
                        })}
                  />
                );
              })}
            </>
          )}
        </Accordion>
      </FormWrapper>
    </div>
  );
}

FiltersForm.propTypes = {
  /* eslint-disable react/no-unused-prop-types */
  presets: T.object,
  setPreset: T.func,
  name: T.string,
  icon: T.string,
  filters: T.array,
  resource: T.string,
  setFilters: T.func,
  outputFilters: T.array,
  checkIncluded: T.func,
  active: T.bool,
  disabled: T.bool
};

export default FiltersForm;
