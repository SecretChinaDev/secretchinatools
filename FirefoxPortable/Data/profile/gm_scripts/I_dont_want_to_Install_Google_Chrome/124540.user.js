// ==UserScript==
// @name           I don't want to Install Google Chrome
// @include        http://www.google.*/
// @include        https://www.google.*/
// @version        0.2
// ==/UserScript==

window.setTimeout(function(){
 document.getElementById('pmocntr2').style.visibility = 'hidden';
},500);

