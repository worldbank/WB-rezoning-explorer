import { css } from 'styled-components';

const catalog = require('./catalog.json');

export const collecticonsFont = () => css`
  @font-face {
    font-family: "${catalog.name}";
    src: url(data:application/font-woff2;charset=utf-8;base64,${catalog.fonts.woff2}) format('woff2');
    font-weight: normal;
    font-style: normal;
  }
`;

/**
 * Includes a collecticons icon by name.
 * If name is a unicode icon it will be displayed
 * @param {string} name Icon name
 */
export default function collecticon (name) {
  const catalog_name = `${catalog.className}-${name}`;
  const icon = catalog.icons.find(i => i.icon === catalog_name);
  let content = icon ? `\\${icon.charCode}` : name;
  
  return css`
    speak: none;
    font-family: "${catalog.name}";
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;

    /* Better font rendering */
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    content: "${content}";
  `;
}
