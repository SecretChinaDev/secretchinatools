// ==UserScript==
// @name           Google Cache Browser
// @namespace      http://qixinglu.com
// @description    Continue browsing the page in Google cache
// @include        http://webcache.googleusercontent.com/search?*
// @include        https://webcache.googleusercontent.com/search?*
// ==/UserScript==

var parts = document.location.href.split(/q=cache:[^&]+/);
parts[0] += 'q=cache:';
parts[1] += '&';
var linkNodes = document.getElementsByTagName('body')[0].childNodes[1].getElementsByTagName("a");
for (var i = 0; i < linkNodes.length; i += 1) {
    var linkNode = linkNodes[i];
    linkNode.href = parts[0] + encodeURIComponent(linkNode.href) + parts[1];
}
