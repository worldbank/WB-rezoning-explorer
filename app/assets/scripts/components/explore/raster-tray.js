import React, { useState, useContext, useEffect } from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import Button from '../../styles/button/button';
import InfoButton from '../common/info-button';
import Prose from '../../styles/type/prose';
import ShadowScrollbar from '../common/shadow-scrollbar';
import SliderGroup from '../common/slider-group';
import { Accordion, AccordionFold, AccordionFoldTrigger } from '../../components/accordion';
import Heading from '../../styles/type/heading';
import { makeTitleCase } from '../../styles/utils/general';
import { apiResourceNameMap } from '../../components/explore/panel-data';
import { ZONES_BOUNDARIES_LAYER_ID } from '../common/mb-map/mb-map';

import MapContext from '../../context/map-context'
import ExploreContext from '../../context/explore-context';

const TrayWrapper = styled(ShadowScrollbar)`
  padding: 0.25rem;
  height: 20rem;
`;
const ControlWrapper = styled.div`
  padding: 0.5rem 0;
  width: 100%;

  &:last-child {
    padding-bottom: 2rem;
  }
`;
const ControlHeadline = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  justify-content: space-between;
  align-items: baseline;

  ${Prose} {
    font-size: 0.875rem;
  }
`;
const ControlTools = styled.div`
  display: grid;
  grid-template-columns: 1fr 0 1fr;
  justify-content: end;
  #layer-visibility {
    grid-column: end;
  }
`;
const Legend = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;

  > div:first-child {
    grid-column: 1 / -1;
  }

  .grad-max {
    text-align: right;
  }
`;

const LayersWrapper = styled.div`
  opacity: ${({ show }) => show ? 1 : 0};
  transition: opacity .16s ease 0s;
  padding: 0.5rem;
  overflow-x: hidden;
  ${AccordionFold} {
    padding-bottom: 1rem;

    &:first-of-type {
      padding-top: 2rem;
    }
  }
`;

function LayerControl (props) {
  const { id, type, name, onVisibilityToggle, visible } = props;
  
  const {
    map,
    mapLayers, setMapLayers
  } = useContext(MapContext);

  const [knobPos, setKnobPos] = useState( 75 );

  useEffect(() => { 
    // Check if changes are applied to zones layer, which
    // have conditional paint properties due to filters
    if ( map && map.getLayer( id ) )
    {
      if (id === ZONES_BOUNDARIES_LAYER_ID) {
        const paintProperty = map.getPaintProperty(
          id,
          'fill-opacity'
        );

        // Zone boundaries layer uses a feature-state conditional
        // to detect hovering.
        // Here set the 3rd element of the array, which is the
        // non-hovered state value
        // to be the value of the knob
        paintProperty[3] = knobPos / 100;
        map.setPaintProperty(id, 'fill-opacity', paintProperty);
      } else {
        let property = type === 'vector' ? 'fill-opacity' : type == "line" ? 'line-opacity' : type == 'symbol' ? 'icon-opacity' : 'raster-opacity';
        map.setPaintProperty(
          id,
          property,
          knobPos / 100
        );
      }
    }
  });

  return (
    <ControlWrapper>
      <ControlHeadline>
        <Prose>{name}</Prose>
        <ControlTools>
          {props.info &&
            <InfoButton
              id={`${id}-info`}
              info={props.info || null}
            >
              <span>Open Tour</span>
            </InfoButton>}
          <Button
            id='layer-visibility'
            variation='base-plain'
            useIcon={visible ? 'eye' : 'eye-disabled'}
            title={visible ? 'toggle layer visibiliity' : 'Generate zones to view output layers'}
            hideText
            onClick={
              props.disabled
                ? null
                : () => {
                  onVisibilityToggle(props, !visible);
                }
            }
            visuallyDisabled={props.disabled}
          >
            <span>Toggle Layer Visibility</span>
          </Button>
        </ControlTools>
      </ControlHeadline>
      <Legend>
        <SliderGroup
          id={id}
          value={knobPos}
          onChange={(val) => {
            setKnobPos(val);
          }}
          range={[0, 100]}
          disabled={props.disabled || !visible}
        />
      </Legend>
    </ControlWrapper>
  );
}

LayerControl.propTypes = {
  id: T.string,
  name: T.string,
  disabled: T.bool,
  onVisibilityToggle: T.func,
  info: T.string,
  visible: T.bool
};

function RasterTray (props) {
  const { show, layers, onVisibilityToggle, className, resource } = props;

  const{
    currentZones
    } = useContext(ExploreContext);
  
    const [isVisible,seIsVisible] = React.useState(false)
  
  
    React.useEffect(()=>{
      if(!(Object.keys(currentZones?.data).length === 0) || isVisible){
        seIsVisible(true)
      }
    },[currentZones?.data])
  

  /*
   * Reduce layers into categories.
   * Layers with out a category will be stored under `undefined`
   * These layers are displayed outside of the accordion
  */
  const categorizedLayers = layers.reduce((cats, layer) => {
    if (!resource || !layer.energy_type ||
    layer.energy_type.includes(apiResourceNameMap[resource])) {
      if (!cats[layer.category]) {
        cats[layer.category] = [];
      }
      cats[layer.category].push(layer);
    }
    return cats;
  }, {});

  return (
    <TrayWrapper className={className}>
      <LayersWrapper show={show}>
        {
          layers.filter( layer => !layer.id.endsWith( '_vector' ) && ( !layer.energy_type || layer.energy_type.includes(apiResourceNameMap[resource]) ) )
                .map((l) => (
            <LayerControl
              key={l.id}
              {...l}
              onVisibilityToggle={onVisibilityToggle}
            />
          ))
        }
      </LayersWrapper>
    </TrayWrapper>
  );
}

RasterTray.propTypes = {
  size: T.oneOf(['small', 'medium', 'large', 'xlarge']),
  show: T.bool,
  layers: T.array,
  onVisibilityToggle: T.func,
  className: T.string,
  resource: T.string
};

export default RasterTray;
