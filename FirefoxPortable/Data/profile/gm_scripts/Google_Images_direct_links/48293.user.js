// ==UserScript==
// @name           Google Images direct links
// @author         Dwoo
// @version        2012.12.22
// @namespace      http://userscripts.org/scripts/show/48293
// @updateURL      https://userscripts.org/scripts/source/48293.meta.js
// @download       http://userscripts.org/scripts/source/48293.user.js
// @description    Makes images link directly to the original in Google Images search. The source website link is moved to the green URL below the image. Also gives the option to always use the basic (old) version of Google Images.
// @include        http*://*.google.*/
// @include        http*://*.google.*/#*
// @include        http*://*.google.*/search*
// @include        http*://*.google.*/webhp*
// @include        http*://*.google.*/img*
// @include        http*://images.google.*
// ==/UserScript==

(function () {

function cleanClick(e) {
	var a = e.target, url;
	if ((a.tagName === 'A' || (a.tagName === 'IMG' && (a = a.parentNode) && a.tagName === 'A')) && (url = a.href.match(/imgurl=([^&]+)/))) {
		a.href = decodeURIComponent(decodeURIComponent(url[1]));
	}
}

function removeTail(e) {
	var a = e.target;
	if ((a.tagName === 'A' || (a.tagName === 'IMG' && (a = a.parentNode) && a.tagName === 'A')) && (/iact=/).test(a.href)) {
		a.href = a.href.replace(/.iact=.*/, '');
	}
}

function cleanPopUp(e) {
	if (e.target.parentNode.id !== 'rg_haln') {
		return;
	}

	var img = document.getElementById('rg_hl');
	try {
		var site = document.getElementById('rg_hr');
		var a = document.createElement('a');
		a.innerHTML = site.innerHTML;
		a.setAttribute('style', 'text-decoration: inherit; color: inherit;');
		if ((/newwindow=1/).test(document.location.href)) {
			a.setAttribute('target', '_blank');
		}
		a.setAttribute('href', decodeURIComponent(decodeURIComponent(img.href.match(/imgrefurl=([^&]+)/)[1])));
		site.replaceChild(a, site.firstChild);
	} catch (e) {}
	var name = document.getElementById('rg_hta');
	name.href = img.href = decodeURIComponent(decodeURIComponent(img.href.match(/imgurl=([^&]+)/)[1]));
}

function cleanOld() {
	var imgs = document.querySelectorAll('a[href*="/imgres"]'),
		sites = document.getElementsByTagName('cite'),
		img, site, a;
	for (var i = 0; (img = imgs[i]) && (site = sites[i]); i++) {
		a = document.createElement('a');
		a.innerHTML = site.innerHTML;
		site.replaceChild(a, site.firstChild);
		a.setAttribute('href', decodeURIComponent(decodeURIComponent(img.href.match(/imgrefurl=([^&]+)/)[1])));
		a.setAttribute('style', 'text-decoration: inherit; color: inherit');
		img.href = decodeURIComponent(decodeURIComponent(img.href.match(/imgurl=([^&]+)/)[1]));
	}
}

function saveVersion(e) {
	var GM = (typeof GM_deleteValue !== 'undefined');
	if ((/sout=1/).test(e.target.href)) {
		if (GM) {
			GM_setValue('useBasic', 'true');
		}
		else {
			localStorage.setItem('useBasic', 'true');
		}
	}
	else {
		if (GM) {
			GM_deleteValue('useBasic');
		}
		else {
			localStorage.removeItem('useBasic');
		}
	}
}

function addBasicLink() {
	var link = document.querySelector('#bfl > a[href*="/search"][href*="tbm=isch"]');
	if (!link) {
		return;
	}

	var a = document.createElement('a');
	a.innerHTML = '(Always)';
	a.href = link.href;
	a.setAttribute('style', 'margin-left: -12px; font-size: smaller;');
	a.addEventListener('click', saveVersion);

	var holder = document.createElement('span');
	holder.setAttribute('class', 'flc');
	link = link.parentNode.replaceChild(holder, link);
	holder.appendChild(link);
	holder.appendChild(document.createTextNode(' '));
	holder.appendChild(a);
}

function useBasic() {
	if (typeof GM_deleteValue !== 'undefined') {
		return GM_getValue('useBasic', false);
	}
	else {
		return localStorage.getItem('useBasic');
	}
}

function setBasicParam(e) {
	var a, imgs = document.querySelectorAll('a[href*="tbm=isch"]:not([href*="sout=1"])');
	for (var i = 0; a = imgs[i]; i++) {
		if (a.parentNode.className !== 'flc') {
			a.href += '&sout=1';
		}
	}
}

if ((/\/imgres\?/).test(document.location.href)) {
	window.location.replace(decodeURIComponent(document.getElementById('il_fi').src));
}
else if ((/sout=1/).test(document.location.href) && (/tbm=isch/).test(document.location.href)) {
	cleanOld();
	addBasicLink();
}
else if (useBasic() && (/tbm=isch/).test(document.location.href)) {
	window.location.replace(window.location+'&sout=1');
}
else {
	document.addEventListener('click', cleanClick);
	document.addEventListener('mouseup', removeTail);
	document.addEventListener('DOMNodeInserted', cleanPopUp);
	document.addEventListener('DOMNodeInserted', addBasicLink);
}

if (useBasic()) {
	document.addEventListener('DOMNodeInserted', setBasicParam);
	var tophf = document.getElementById('tophf');
	if (tophf) {
		var i = document.createElement('input');
		i.setAttribute('type', 'hidden');
		i.setAttribute('name', 'sout');
		i.setAttribute('value', '1');
		tophf.appendChild(i);
	}
}
})();