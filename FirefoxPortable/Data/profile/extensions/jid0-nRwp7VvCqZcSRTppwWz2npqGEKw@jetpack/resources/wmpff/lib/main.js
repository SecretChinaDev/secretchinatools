const tabs = require("tabs");
const self = require("self");
const simpleStorage = require("simple-storage");
const notifications = require("notifications");
var {Cc, Ci} = require("chrome");

const addonfolder = "jid0-nRwp7VvCqZcSRTppwWz2npqGEKw@jetpack";

var pageMod = require('page-mod');

pageMod.PageMod(
{
    include: ["file:///*", '*'],
    contentScriptWhen: 'ready',
    contentScriptFile: require('self').data.url('replaceVideo.js'),

    onAttach: function onAttach(worker, mod)
    {
        worker.on('error', function(error)
        {
            console.error(error.message);
        });
        worker.on('message', function(data)
        {
            console.debug(data);
        });
    }
});

pageMod.PageMod(
{
    include: [require('self').data.url('firstrun.htm').toString()],
    contentScriptWhen: 'ready',
    contentScript: 'document.addEventListener("WMPRestart", function(e) { postMessage("restart") }, false, true);',
    onAttach: function(worker) { worker.on("message", function() { doRestart() }) }
});

function doPluginCopy()
{
	// First, create the folder if it is not there
	var profPluginsDir = Cc["@mozilla.org/file/directory_service;1"].  
	           getService(Ci.nsIProperties).  
	           get("DefProfRt", Ci.nsIFile);
	profPluginsDir = profPluginsDir.parent;
	profPluginsDir = profPluginsDir.parent;
	profPluginsDir.append("Plugins");  
	if( !profPluginsDir.exists() || !profPluginsDir.isDirectory() ) {   // if it doesn't exist, create  
	   profPluginsDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);  
	}

	// Now lets move the file in
	var pluginFile = Cc["@mozilla.org/file/directory_service;1"].  
	           getService(Ci.nsIProperties).  
	           get("ProfD", Ci.nsIFile);
	pluginFile.append("extensions");
	pluginFile.append(addonfolder);
	pluginFile.append("plugins");
	pluginFile.append("np-mswmp.dll");
	console.debug("WMP Plugin copy possible: "+pluginFile.exists()); 
	if( pluginFile.exists() ) { 
	   pluginFile.copyTo(profPluginsDir, "");  
	}	
}

var doRestart = function()
{
	var myIconURL = self.data.url("wmpicon.png");
	notifications.notify({
	  text: "Restarting Firefox to register the WMP plugin",
	  iconURL: myIconURL
	});

    var appStartup = Ci.nsIAppStartup;
    Cc["@mozilla.org/toolkit/app-startup;1"]
            .getService(appStartup).quit(appStartup.eRestart | appStartup.eAttemptQuit);
}

exports.main = function(options, callback)
{
    if (!simpleStorage.storage.hasDoneFirstRun)
    {
        try
        {
            doPluginCopy();
        }
        catch (e)
        {
            console.error("Plugin copy failed: " + e);
        }
        // XX TODO Clean this up on uninstall
        simpleStorage.storage.hasDoneFirstRun = true;
        /*
        tabs.open({
          url: self.data.url("/firstrun.htm"),
          onOpen: function(tab) {
              simpleStorage.storage.hasShownFirstRun = true;
          }
        });
        */
    }
};
