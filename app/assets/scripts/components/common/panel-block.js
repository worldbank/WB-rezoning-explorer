import styled from 'styled-components';
import { tint } from 'polished';

import { themeVal, stylizeFunction } from '../../styles/utils/general';
import { glsp } from '../../styles/utils/theme-values';
import Heading from '../../styles/type/heading';
import ShadowScrollbar from '../common/shadow-scrollbar';

const _tint = stylizeFunction(tint);

export const PanelBlock = styled.section`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  position: relative;
  z-index: 10;
  box-shadow: 0 -1px 0 0 ${themeVal('color.baseAlphaB')};
`;

export const PanelBlockHeader = styled.header`
  box-shadow: 0 1px 0 0 ${themeVal('color.baseAlphaC')};
  background: ${_tint(0.02, themeVal('color.surface'))};
  position: relative;
  z-index: 10;
  padding: ${glsp()} ${glsp(1.5)};
`;

export const PanelBlockFooter = styled.footer`
  box-shadow: 0px -1px 1px -1px ${themeVal('color.baseAlphaD')};
  background: ${_tint(0.02, themeVal('color.surface'))};
  position: relative;
  z-index: 10;
  padding: ${glsp()} ${glsp(1.5)};
  
`;

export const PanelBlockFooterRow = styled.footer`
  box-shadow: 0px -1px 1px -1px ${themeVal('color.baseAlphaD')};
  background: ${_tint(0.02, themeVal('color.surface'))};
`;

export const PanelBlockTitle = styled(Heading).attrs({ size: 'medium' })`
  margin: 0;
`;

export const PanelBlockBody = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  flex: 1;
`;

export const PanelBlockScroll = styled(ShadowScrollbar)`
  flex: 1;
  z-index: 12;
`;
