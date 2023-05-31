import React, { useContext, useEffect, useState } from 'react';
import T from 'prop-types';
import styled, { css } from 'styled-components';
// import { Button } from '@devseed-ui/button';
import Button from '../../styles/button/button';

import { themeVal, stylizeFunction } from '../../styles/utils/general';
import { tint } from 'polished';
import { headingAlt } from '../../styles/type/heading';
import { panelSkin } from '../../styles/skins';
import { glsp } from '../../styles/utils/theme-values';
import media from '../../styles/utils/media-queries';
import ExploreContext from '../../context/explore-context';

const _tint = stylizeFunction(tint);

export const PanelSelf = styled.section`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  max-width: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  transition: all 0.16s ease 0s;

  ${({ revealed }) => revealed && css`
    ${panelSkin()}
    max-width: calc(100vw - 4rem);
    z-index: 15;

    ${media.largeUp`
      width: 16rem;
    `}
  `}
`;

const PanelHeader = styled.header`
  box-shadow: 0 1px 0 0 ${themeVal('color.baseAlphaB')};
  background: ${_tint(0.02, themeVal('color.surface'))};
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: ${glsp(1, 0)};
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width 0.16s ease 0s, padding 0.16s ease 0s, opacity 0.16s ease 0s;

  ${({ revealed }) => revealed && css`
    overflow: auto;
    max-width: 100vw;
    padding: ${glsp()};
    opacity: 1;
  `}
`;

export const PanelHeadline = styled.div`
  min-width: 0px;
`;

export const PanelToolbar = styled.div`
  margin-left: auto;
  padding-left: ${glsp()};
`;

export const PanelTitle = styled.h1`
  ${headingAlt}
  margin: 0;
`;

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width 0.16s ease 0s, opacity 0.16s ease 0s;

  ${({ revealed }) => revealed && css`
    max-width: 100vw;
    opacity: 1;
    overflow: visible;
    overflow-y: scroll !important;
  `}
`;

const PanelOffsetActions = styled.div`
  ${panelSkin()}
  border-radius: ${themeVal('shape.rounded')};
  max-width: fit-content;
`;

const PanelControls = styled.div`
  display: grid;
  grid-gap: 0.5rem;

  position: absolute;
  top: ${glsp(0.5)};
  transform: translate(0, 0);
  z-index: 120;

  ${({ direction }) => direction === 'right' && css`
    right: calc(100% + ${glsp(0.5)}); /* stylelint-disable-line */

    ${media.mediumDown`
      ${({ revealed }) => revealed && css`
        right: ${glsp(0.5)};
      `}
    `}
  `}

  ${({ direction }) => direction === 'left' && css`
    left: calc(100% + ${glsp(0.5)}); /* stylelint-disable-line */

    ${media.mediumDown`
      ${({ revealed }) => revealed && css`
        left: calc(100% - ${glsp(0.5)});
        transform: translate(-100%, 0);
      `}
    `}
  `}

`;

function Panel(props) {
  const [revealed, setRevealed] = useState(
    props.direction === 'left' ? props.initialState : false
  );
  const {
    headerContent,
    renderHeader,
    bodyContent,
    collapsible,
    direction,
    className,
    overrideControl,
    additionalControls,
    onPanelChange
  } = props;
  const { currentZones,selectedResource,tourStep } = useContext(ExploreContext);
  const [prevSelectedResource,setPrevSelectedResource] = useState(selectedResource)

  const onCollapseClick=()=> {
    if (overrideControl) {
      return onPanelChange(setRevealed(!revealed));
    }

    setRevealed(!revealed);
    onPanelChange && onPanelChange(setRevealed(!revealed) );
  }
 
  useEffect(()=>{
    setPrevSelectedResource(selectedResource)
    if(!(Object.keys(currentZones?.data).length === 0)){
      setRevealed(true)
    }
    else if(props.direction === 'right'){
      setRevealed(false)
    }
    if(selectedResource != prevSelectedResource && props.direction === 'right'){
      setRevealed(false)
    }  
  },[currentZones?.data, selectedResource])


  const icon =
    direction === 'left'
      ? revealed
        ? 'shrink-to-left'
        : 'expand-from-left'
      : revealed
        ? 'shrink-to-right'
        : 'expand-from-right';

  const header = typeof renderHeader === 'function'
    ? renderHeader({ revealed })
    : headerContent ? (
      <PanelHeader revealed={revealed}>
        {headerContent}
      </PanelHeader>
    ) : null;

  return (
    <PanelSelf revealed={revealed} className={className}>
      {header}
      <PanelBody revealed={revealed}>{bodyContent}</PanelBody>

      <PanelControls revealed={revealed} direction={direction}>
        {collapsible && (
          <PanelOffsetActions>
            <Button
              variation='base-plain'
              useIcon={icon}
              title='Show/hide prime panel'
              hideText
              onClick={onCollapseClick}
            >
              <span>Prime panel</span>
            </Button>
          </PanelOffsetActions>
        )}
        {
          additionalControls && additionalControls.map(ctrl => (
            <PanelOffsetActions key={`${ctrl.props.id}-wrapper`}>
              {ctrl}
            </PanelOffsetActions>
          ))
        }
      </PanelControls>

    </PanelSelf>
  );
}


Panel.propTypes = {
  initialState: T.bool,
  overrideControl: T.bool,
  direction: T.oneOf(['left', 'right']),
  revealed: T.bool,
  onPanelChange: T.func,
  className: T.string,
  collapsible: T.bool,
  additionalControls: T.array,
  headerContent: T.node,
  renderHeader: T.func,
  bodyContent: T.node
};

Panel.defaultProps = {
  initialState: true,
  direction: 'left'
};

export default Panel;
