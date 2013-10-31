// ==UserScript==
// @name          Google Search Tools Back
// @namespace     http://akr.tw/
// @version       1.5.0
// @description   Bring back Google search tools menu.
// @author        akiratw
// @license       MIT License
// @homepage      https://userscripts.org/scripts/show/152796
// @updateURL     https://userscripts.org/scripts/source/152796.meta.js
// @include       http://www.google.*/search*
// @include       https://www.google.*/search*
// @include       http://www.google.*/webhp*
// @include       https://www.google.*/webhp*
// @include       http://www.google.*/#*
// @include       https://www.google.*/#*
// @include       https://encrypted.google.*/search*
// @include       https://encrypted.google.*/webhp*
// @include       https://encrypted.google.*/#*
// @grant         GM_addStyle
// ==/UserScript==

var css = '',
    GM_addStyle = GM_addStyle || function (css) {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = css;
      document.head.appendChild(style);
    };

/* Adds normal style. */
var rules = {
  /* Left column */
  '#hdtb_tls': {
    'display': 'none'
  },
  '#hdtbMenus': {
    'display': 'block',
    'width': 'auto',
    'overflow': 'visible',
    'margin': '10px 0 0 0',
    'background': 'transparent'
  },
  '#hdtbMenus ul': {
    'display': 'block',
    'position': 'relative',
    'min-width': '200px',
    'max-width': '200px',
    'border': 'none',
    'box-shadow': 'none'
  },
  '#hdtbMenus span.mn-hd-txt, #hdtbMenus span.mn-dwn-arw': {
    'display': 'none'
  },
  '#hdtbMenus span.tnv-lt-sm': {
    'height': 'auto',
    'overflow': 'visible'
  },
  '#hdtb_rst': {
    'padding': '5px 30px'
  },
  /* Content */
  '#rcnt, #topabar': {
    'margin-left': '80px',
    'clear': 'none'
  },
  '#rg': {
    'max-width': '90%',
    'margin-left': '140px'
  },
  '#center_col': {
    'clear': 'none'
  },
  /* Page screen shot preview */
  '#nyc': {
    'margin-left': '750px'
  },
  'div.vspib': {
    'right': '-58px'
  },
  /* Google+ Profile box */
  '#rhs_block': {
    'margin-left': '120px'
  },
  /* Search bar and top bar. */
  '#tsf .tsf-p > div > table:first-child': {
    'margin-left': '80px'
  },
  '#gbq2': {
    'margin-left': '230px'
  },
  '#hdtb_msb > .hdtb_mitem:first-child, #hdtb_msb > .hdtb_mitem.hdtb_msel:first-child': {
    'margin-left': '230px'
  },
  '#topstuff': {
    'margin-left': '120px'
  }
};

for (var i in rules) {
  css = css + i + '{';
  for (var j in rules[i]) {
    css = css + j + ':' + rules[i][j] + ' !important;';
  }
  css = css + '}';
}

/* Injects styles to page. */
GM_addStyle(css);