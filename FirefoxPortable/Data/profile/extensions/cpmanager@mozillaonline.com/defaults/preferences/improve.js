// In which folder do we bookmark the page:
// -1 last selected
// 1  the Places root
// 2  the bookmarks menu folder
// 3  the personal toolbar folder
// 4  the top-level folder that contain the tag "folders"
// 5  the unfiled-bookmarks folder
pref("extensions.cmimprove.bookmarks.parentFolder", -1);
pref("extensions.cmimprove.bookmarks.add.defaultFolder", 5);

// whether or not to show the edit-bookmark UI when adds a bookmark to the page
pref("extensions.cmimprove.bookmarks.add.showEditUI", true);

// Add Cert Exception
pref("extensions.cmimprove.iframe_cert_fix.whitelist", "dynamic.12306.cn");

// features enable
pref("extensions.cmimprove.features.tabcontextmenu.enable", true);
pref("extensions.cmimprove.features.undocloseanimation.enable", true);

pref("extensions.cmimprove.socialapi.whitelist", "http://firefox.com.cn,http://www.firefox.com.cn");

pref("extensions.cmimprove.gesture.enabled", true);

// number of days for auto clear history
// 0   =  disable auto clear
// -1  =  daily
// -2  =  weekly
// -3  =  monthly
// -4  =  querterly
// -6  =  yearly
pref("extensions.cpmanager@mozillaonline.com.sanitize.timeout", -4);
