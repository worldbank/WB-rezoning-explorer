import React, { useContext } from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import Histogram from '../common/histogram';
import { themeVal } from '../../styles/utils/general';
import MbMap from '../common/mb-map/mb-map';
import MapContext from '../../context/map-context';
// import ExploreContext from '../../context/explore-context';

const ExploreCarto = styled.section`
  position: relative;
  height: 100%;
  background: ${themeVal('color.baseAlphaA')};
  display: grid;
  grid-template-rows: 1fr auto;
  min-width: 0;
  overflow: hidden;
`;

function Carto (props) {
  const {
    triggerResize,
    zoneData
  } = props;
  const { setFocusZone, setHoveredFeature, hoveredFeature } = useContext(MapContext);
  /*
   * Disable filtering temporarily
  const {
    maxZoneScore: { input: { value: maxZoneScore } },
    maxLCOE: { input: { value: maxLCOE } }
  } = useContext(ExploreContext);
  */

  return (
    <ExploreCarto>
      <MbMap
        triggerResize={triggerResize}
      />
      { zoneData && (
        <Histogram
          yProp='lcoe'
          xProp={['zone_output', 'lcoe']}
          data={
            zoneData
              /* Disable histogram filtering temporarily
               * .filter(datum => {
                const { zone_score, lcoe } = datum.properties.summary;
                const zs = zone_score >= maxZoneScore.min && zone_score <= maxZoneScore.max;
                const zl = maxLCOE.max ? (lcoe >= maxLCOE.min && lcoe <= maxLCOE.max) : true;
                return zs && zl;
              }) */
              .map(datum => ({ ...datum.properties.summary, color: datum.properties.color, ...datum }))
          }
          onBarClick={
            (e) => setFocusZone(e)
          }
          onBarMouseOver={
            (e) => setHoveredFeature(e.id)
          }
          onBarMouseOut={
            (e) => setHoveredFeature(null)
          }
          hoveredBar={hoveredFeature}

        />
      )}
    </ExploreCarto>

  );
}
Carto.propTypes = {
  triggerResize: T.bool,
  zoneData: T.array
};

export default Carto;
