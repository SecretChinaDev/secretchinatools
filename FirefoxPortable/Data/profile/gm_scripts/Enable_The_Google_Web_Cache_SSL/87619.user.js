
// ==UserScript==
// @name         Enable The Google Web Cache SSL
// @author       Ejin
// @include      http*://*/search?*
// @include      http*://www.googleusercontent.com/*
// @version      1.2
// ==/UserScript==
// Source        http://www.x2009.net

	(function() {
		var allLinks = document.links;
			if (allLinks != null) {
				for (i = 0; i <allLinks.length; ++i) {
					if (allLinks [i].href.indexOf ("http://webcache.googleusercontent.com") > -1) {
						allLinks [i].href = allLinks [i].href.replace ("http://webcache.googleusercontent.com", "https://webcache.googleusercontent.com");
					}
					if (allLinks [i].getAttribute("onmousedown")!=null) {
						if (allLinks [i].getAttribute("onmousedown").indexOf ("rwt") > -1) {
							allLinks [i].setAttribute('onmousedown', '');
						}
					}
				}
			}
	}
	)();
