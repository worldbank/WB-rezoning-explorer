import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';

import Panel from '../common/panel';
import {
  PanelBlock,
  PanelBlockHeader,
  PanelBlockBody
} from '../common/panel-block';

import Heading from '../../styles/type/heading';

import media, { isLargeViewport } from '../../styles/utils/media-queries';

import ExploreStats from './explore-stats';
import ExploreZones from './explore-zones';

const SecPanel = styled(Panel)`
  ${media.largeUp`
    width: 18rem;
  `}
  ${media.xlargeUp`
    width: 20rem;
  `}
`;
const PanelBlockBodyInner = styled.div`
  padding: 1rem 0;
  flex: 1;
  display: grid;
  /*grid-template-rows: 1fr 1.5fr;*/
  grid-template-rows: auto 1.5fr;
`;

function ExpMapSecPanel (props) {
  const { onPanelChange } = props;
  return (
    <SecPanel
      collapsible
      direction='right'
      onPanelChange={onPanelChange}
      initialState={isLargeViewport()}
      bodyContent={
        <>
          <PanelBlock>
            <PanelBlockHeader>
              <Heading size='large'>
                National
              </Heading>
            </PanelBlockHeader>
            <PanelBlockBody>
              <PanelBlockBodyInner>
                <ExploreStats />
                <ExploreZones />
              </PanelBlockBodyInner>
            </PanelBlockBody>
          </PanelBlock>
        </>
      }
    />
  );
}

ExpMapSecPanel.propTypes = {
  onPanelChange: T.func
};

export default ExpMapSecPanel;