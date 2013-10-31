// ==UserScript==
// @name           Google Images direct link
// @namespace      http://userscripts.org/users/lorentz
// @description    Add direct link to images and pages in google image search
// @include        http://images.google.*/images*
// @include        http://www.google.*/images*
// @include        http://www.google.*/webhp*
// @include        http://www.google.*/search?*
// @include        http://www.google.*/imgres*
// @include        http://images.google.*/search?*
// @include        https://images.google.*/images*
// @include        https://www.google.*/images*
// @include        https://www.google.*/webhp*
// @include        https://www.google.*/search?*
// @include        https://www.google.*/imgres*
// @include        https://images.google.*/search?*
// @include        https://encrypted.google.com/search?*
// @version        3.8
// ==/UserScript==

var parseUrl = function (url) {
  var qstr = url.split('?')[1];
  var rawparams = qstr.split('&');
  var par = new Array();
  var i;
  for (i=0 ; i<rawparams.length ; i++){
    var p = rawparams[i].split("=");
    par[p[0]] = p[1];
  }
  return par;
}

if (parseUrl(window.location.href)["directLink"]){
  var imglnk = document.getElementsByTagName('a')[2];
  if (imglnk){
    window.location.replace(imglnk.href)
  }
}

var getImageLinks = function (url){
  var param = parseUrl(url);
  var links = new Object();
  links.toImgHref = decodeURIComponent(param["imgurl"]);
  if (param["imgurl"] == undefined){
     links.toImgHref = url+'&directLink=true';
  }
  links.toPageHref = decodeURIComponent(param["imgrefurl"]);
  return links;  
}

String.prototype.endsWith = function(str){
  return ( this.lastIndexOf(str) + str.length ) == this.length;
}

var firstOrNull = function(sequence){
  if(sequence.length > 0)
    return sequence[0];
  else
    return null;
}

var imgTable = firstOrNull(document.getElementsByClassName('images_table'));

if (imgTable) { // for basic version
  var imgCell = imgTable.getElementsByTagName('td');
  for( j=0 ; j<imgCell.length ; j++ ) {
    var imageAnchor = imgCell[j].getElementsByTagName('a')[0];
    var domainText =  imgCell[j].getElementsByTagName('cite')[0];
    
    var links = getImageLinks(imageAnchor.href);

    domainText.innerHTML = '<a href="' + links.toPageHref + '">' + domainText.innerHTML + '/&hellip;<\a>';
    imageAnchor.href = links.toImgHref;
  }
}
else { // standard version

  var stopEvent = function(event){
	  event.stopPropagation()
  }
  
  var nodeHandler = function (event) {
    if(event.target.id!='rg_h') return;
    var domain = document.getElementById('rg_hr');
    var imageAnchor = document.getElementById('rg_hl');
    var links = getImageLinks(imageAnchor.href);

    imageAnchor.href = links.toImgHref;
    imageAnchor.addEventListener("mousedown", stopEvent, false);
    
    if (domain.getElementsByTagName('a').length == 0)
    domain.innerHTML = '<a onmousedown="event.stopPropagation();" ' +
							'style="color:green;" ' + 
							'href="' + links.toPageHref + '">' + domain.innerHTML + '/&hellip;</a>';
  }
  if(navigator.userAgent.indexOf("Firefox")!=-1) {//if firefox
    document.addEventListener("DOMSubtreeModified", nodeHandler, false);
  }
  else{//opera or chrome
    document.addEventListener( 'DOMNodeInserted', nodeHandler, false );
    document.addEventListener( 'DOMNodeRemoved',  nodeHandler, false );
  }
}
