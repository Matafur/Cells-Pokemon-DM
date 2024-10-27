import { setDocumentCustomStyles, } from '@bbva-web-components/bbva-core-lit-helpers';
import { generateFlatGridZones, grid } from '@bbva-web-components/bbva-foundations-styles';
import { css, } from 'lit-element';

setDocumentCustomStyles(generateFlatGridZones(grid));

setDocumentCustomStyles(css`
  body {
    margin: 0;
  }
`);
