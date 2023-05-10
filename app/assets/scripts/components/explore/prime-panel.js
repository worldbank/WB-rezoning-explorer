import React, { useContext, useState, useRef } from 'react';
import T from 'prop-types';
import styled, { css } from 'styled-components';
import Panel from '../common/panel';
import media, { isLargeViewport } from '../../styles/utils/media-queries';
import ExploreContext from '../../context/explore-context';
import MapContext from '../../context/map-context';
import FormContext from '../../context/form-context';

import ModalSelect from './modal-select';
import { ModalHeadline } from '@devseed-ui/modal';
import ModalSelectArea from './modal-select-area';
import ModalSelectZoneType from './modal-select-zone-type';

import Button from '../../styles/button/button';
import InfoButton from '../common/info-button';

import { Card } from '../common/card-list';

import QueryForm, { EditButton, ZoneTypeSizeSubheading } from './query-form';
import RasterTray from './raster-tray';
import Heading, { Subheading } from '../../styles/type/heading';
import { PanelBlock, PanelBlockBody, PanelBlockHeader } from '../common/panel-block';
import { HeadOption, HeadOptionHeadline } from '../../styles/form/form';
import Prose from '../../styles/type/prose';
import { themeVal } from '../../styles/utils/general';
import { RESOURCES, BOUNDARIES } from './panel-data';

const PrimePanel = styled(Panel)`
  ${media.largeUp`
    width: 22rem;
  `}
`;

const RasterTrayWrapper = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: baseline;
  ${({ show }) => show && css`
    width: 20rem;
  `}

  > .info-button {
    grid-column: 1;
  }
  > ${Subheading} {
    grid-column: 2;
    ${({ show }) => !show && 'display: none;'}

  }

  > .raster-tray {
    grid-column: 1 /span 2;
    ${({ show }) => !show && 'display: none;'}
  }

  > .submit-issue-tray {
    grid-column: 1 /span 2;
    ${({ show }) => !show && 'display: none;'}

  }
`;

const PreAnalysisMessage = styled(Prose)`
  padding: 1rem 1.5rem;
  text-align: center;
`;

const Subheadingstrong = styled.strong`
  color: ${themeVal('color.base')};
`;

function ExpMapPrimePanel (props) {
  const { onPanelChange } = props;

  const firstLoad = useRef(true);

  /**
   * Get Explore context values
   */
  const {
    areas,
    availableResources,
    selectedResource,
    setSelectedResource,

    selectedArea,
    setSelectedAreaId,

    availableZoneTypes,
    selectedZoneType,
    setSelectedZoneType,

    tourStep,
    setTourStep,
    updateFilteredLayer,
    currentZones,
    importingData,
    setImportingData
  } = useContext(ExploreContext);

  const {
    showSelectAreaModal,
    setShowSelectAreaModal,
    showSelectResourceModal,
    setShowSelectResourceModal,
    showSelectZoneTypeModal,
    setShowSelectZoneTypeModal,
    setZonesGenerated,
    setInputTouched,
    filtersLists,
    weightsList,
    lcoeList,
    filterRanges
  } = useContext(FormContext);

  const {
    map,
    mapLayers, setMapLayers
  } = useContext(MapContext);

  const [showRasterPanel, setShowRasterPanel] = useState(false);
  const [showSubmitIssuePanel, setShowSubmitIssuePanel] = useState(false);

  const onAreaEdit = () => {
    setShowSelectAreaModal(true);
    setShowSelectResourceModal(false);
    setShowSelectZoneTypeModal(false);
  };
  const onResourceEdit = () => {
    setShowSelectAreaModal(false);
    setShowSelectResourceModal(true);
    setShowSelectZoneTypeModal(false);
  };
  const onZoneTypeEdit = () => {
    setShowSelectAreaModal(false);
    setShowSelectResourceModal(false);
    setShowSelectZoneTypeModal(true);
  };

  React.useEffect(() => {
    if (!(Object.keys(currentZones?.data).length === 0)) {
      setShowRasterPanel(true);
      
      setMapLayers(mapLayers.map(layer => {
        if (layer.category === 'output') {
          layer.disabled = false;
          if (layer.visible) {
            map.setLayoutProperty(layer.id, 'visibility', 'visible');
            layer.visible = true;
          }
        }
        return layer;
      })
      );
    }
  }, [currentZones?.data]);

  React.useEffect(() => {
    const availableZone = availableZoneTypes.filter(
      (zoneType) =>
        selectedResource !== RESOURCES.OFFSHORE || zoneType?.type !== BOUNDARIES
    );
    if (selectedResource === RESOURCES.OFFSHORE) {
      const targetZoneType = availableZone.find((zoneType) => selectedZoneType && selectedZoneType.size === '0' && zoneType.size === '25')
      if (targetZoneType) {
        setSelectedZoneType(targetZoneType);
    }
    }
  }, [selectedResource]);
  return (
    <>
      <PrimePanel
        collapsible
        additionalControls={[
          <Button
            key='open-tour-trigger'
            id='open-tour-trigger'
            variation='base-plain'
            useIcon='circle-question'
            title='Open tour'
            hideText
            onClick={() => setTourStep(0)}
            disabled={tourStep >= 0}
          >
            <span>Open Tour</span>
          </Button>,

          <RasterTrayWrapper key='toggle-raster-tray' id='toggle-raster-tray' show={showRasterPanel}>
            <InfoButton
              id='toggle-raster-tray'
              className='info-button'
              variation='base-plain'
              useIcon='iso-stack'
              info='Toggle contextual layers'
              width='20rem'
              hideText
              onClick={() => {
                setShowRasterPanel(!showRasterPanel);
              }}
            >
              <span>Contextual Layers</span>
            </InfoButton>
            <Subheading>Contextual Layers</Subheading>

            <RasterTray
              show={showRasterPanel}
              className='raster-tray'
              layers={filtersLists ? mapLayers.filter(layer => !filtersLists.map(filter => filter.layer).includes(layer.id)) : mapLayers}
              resource={selectedResource}
              onVisibilityToggle={(layer, visible) => {
                if (visible) {
                  // Show layer
                  if (layer.type === 'raster' && !layer.nonexclusive) {
                    const visibilityTimeStamps = mapLayers.map(l => (l?.visibilityTimeStamp ? l.visibilityTimeStamp : 0));
                    let highestTimeStamp = Math.max(...visibilityTimeStamps);

                    const ml = mapLayers.map((l) => {
                      if (l.type === 'raster' && !l.nonexclusive) {
                        if (l.visible && (l.id !== layer.id)) {
                          // Add time stamp to indicate this layer was hidden last
                          l.visibilityTimeStamp = highestTimeStamp + 1;
                          highestTimeStamp++;
                        }
                        map.setLayoutProperty(
                          l.id,
                          'visibility',
                          l.id === layer.id ? 'visible' : 'none'
                        );
                        l.visible = l.id === layer.id;
                      }
                      return l;
                    });
                    setMapLayers(ml);
                  } else {
                    map.setLayoutProperty(layer.id, 'visibility', 'visible');
                    const ind = mapLayers.findIndex((l) => l.id === layer.id);
                    setMapLayers([
                      ...mapLayers.slice(0, ind),
                      {
                        ...layer,
                        visible: true
                      },
                      ...mapLayers.slice(ind + 1)
                    ]);
                  }
                } else {
                  // Hide layer
                  map.setLayoutProperty(layer.id, 'visibility', 'none');
                  const ind = mapLayers.findIndex((l) => l.id === layer.id);
                  const ml = [
                    ...mapLayers.slice(0, ind),
                    {
                      ...layer,
                      visible: false
                    },
                    ...mapLayers.slice(ind + 1)
                  ];

                  // If the layer is an exclusive raster layer, we find the layer that was hidden last and then show it
                  if (layer.type === 'raster' && !layer.nonexclusive) {
                    const visibilityTimeStamps = ml.map(l => l?.visibilityTimeStamp ? l.visibilityTimeStamp : 0);
                    let highestTimeStamp = Math.max(...visibilityTimeStamps);

                    while (highestTimeStamp > 0) {
                      const ind = ml.findIndex((l) => l.visibilityTimeStamp === highestTimeStamp);
                      if (ind !== -1 && !ml[ind].visible) {
                        ml[ind].visible = true;
                        ml[ind].visibilityTimeStamp = 0;
                        map.setLayoutProperty(ml[ind].id, 'visibility', 'visible');
                        break;
                      } else {
                        highestTimeStamp--;
                      }
                    }
                  }
                  setMapLayers(ml);
                }
              }}
            />
          </RasterTrayWrapper>
        ]}
        direction='left'
        onPanelChange={onPanelChange}
        initialState={isLargeViewport()}
        bodyContent={
          filtersLists && weightsList && lcoeList && filterRanges ? (
            <QueryForm
              firstLoad={firstLoad}
              area={selectedArea}
              resource={selectedResource}
              filtersLists={filtersLists}
              filterRanges={filterRanges}
              updateFilteredLayer={updateFilteredLayer}
              weightsList={weightsList}
              lcoeList={lcoeList}
              selectedZoneType={selectedZoneType}
              onAreaEdit={onAreaEdit}
              onResourceEdit={onResourceEdit}
              onZoneTypeEdit={onZoneTypeEdit}
              onInputTouched={(status) => {
                setInputTouched(true);
              }}
              onSelectionChange={() => {
                setZonesGenerated(false);
              }}
              setSelectedAreaId={setSelectedAreaId}
              setSelectedResource={setSelectedResource}
              setSelectedZoneType={setSelectedZoneType}
              importingData={importingData}
              setImportingData={setImportingData}
            />
          ) : (
            <PanelBlock>
              <PanelBlockHeader>
                <HeadOption>
                  <HeadOptionHeadline id='selected-area-prime-panel-heading'>
                    <Heading size='large' variation='primary'>
                      {selectedArea ? selectedArea.name : 'Select Area'}
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
                        {selectedResource || 'Select Resource'}
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
                {selectedArea && selectedResource && selectedZoneType ? (
                  <PreAnalysisMessage> Loading parameters... </PreAnalysisMessage>
                ) : (
                  filterRanges
                    ? (
                      <PreAnalysisMessage>
                        Select Area, Resource, and Zone Type to view and interact with input
                        parameters.
                      </PreAnalysisMessage>
                    )
                    : (
                      <PreAnalysisMessage>
                          The filters are not available for the selected area. Please choose a different area.
                      </PreAnalysisMessage>
                    )
                )}
              </PanelBlockBody>
            </PanelBlock>
          )
        }
      />

      <ModalSelectArea
        revealed={showSelectAreaModal}
        areas={areas}
        closeButton={typeof selectedArea !== 'undefined'}
        selectedResource={selectedResource}
        showSelectAreaModal={showSelectAreaModal}
        showSelectZoneTypeModal={showSelectZoneTypeModal}
        setShowSelectAreaModal={setShowSelectAreaModal}
        setSelectedAreaId={setSelectedAreaId}
      />

      <ModalSelect
        revealed={!showSelectAreaModal && showSelectResourceModal}
        onOverlayClick={() => setShowSelectResourceModal(false)}
        onCloseClick={() => setShowSelectResourceModal(false)}
        data={availableResources}
        closeButton={typeof selectedResource !== 'undefined'}
        renderHeadline={() => (
          <ModalHeadline
            id='select-resource-modal-header'
            title='Select Resource'
            style={{ flex: 1, textAlign: 'center' }}
          >
            <h1>Select Resource</h1>
          </ModalHeadline>
        )}
        renderCard={(resource) => (
          <Card
            id={`resource-${resource.name}-card`}
            key={resource.name}
            title={resource.name}
            size='large'
            borderlessMedia
            iconPath={resource.iconPath}
            onClick={() => {
              setShowSelectResourceModal(false);
              setSelectedResource(resource.name);
            }}
          />
        )}
        nonScrolling
      />

      <ModalSelectZoneType
        revealed={!showSelectAreaModal && !showSelectResourceModal && showSelectZoneTypeModal}
        availableZoneTypes={availableZoneTypes.filter(zoneType =>
          selectedResource !== RESOURCES.OFFSHORE || zoneType?.type !== BOUNDARIES
        )}
        selectedZoneType={selectedZoneType}
        setSelectedZoneType={setSelectedZoneType}
        setShowSelectZoneTypeModal={setShowSelectZoneTypeModal}
      />
    </>
  );
}

ExpMapPrimePanel.propTypes = {
  onPanelChange: T.func
};

export default ExpMapPrimePanel;
