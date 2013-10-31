var supportedMimeTypes = ['video/mp4', 'video/x-ms-wmv'];
var supportedVideoExtensions = ['.mp4', '.wmv', '.mp4v', '.m4v'];

var doError = function(message, exception)
{
    // XX TODO extract information from the exception object
    self.postMessage("WMP Extension Error : "+message);
}

var doMessage = function(message)
{
    // XX Uncomment this during development for debug/testing
    //self.postMessage("WMP Extension Message : "+message);
}

var getSupportedMediaSource = function(videoElement)
{
    // If the video element source is supported, then we replace the tag.

    if (videoElement.src
        && isWMPSupported(videoElement))
    {
        doMessage("getSupportedMediaSource: found supported video source: '" + videoElement.src + "'");
        return videoElement.src;
    }

    // "If all src videos are [supported], the video tag is replaced otherwise
    // it is not. Basically if there is at least one video that WMP is not able
    // to play we should not replace the Video tag."

    var sources = videoElement.getElementsByTagName("source");
    var supportedSource = null;

    for (var i=0; i<sources.length; i++)
    {
        if (sources[i].src)
        {
            if (isWMPSupported(sources[i]))
            {
                doMessage("getSupportedMediaSource: found supported video source: '" + sources[i].src + "'");
                supportedSource = sources[i].src;
            }
            else
            {
                doMessage("getSupportedMediaSource: found unsupported video source: '" + sources[i].src + "'");
                return null;
            }
        }
    }

    return supportedSource;
}

var isWMPSupported = function(videoOrSourceElement)
{
    if (videoOrSourceElement.type)
    {
        var type = videoOrSourceElement.type.toLowerCase();
        var index = type.indexOf(';');

        if (index != -1)
            type = type.slice(0, index);

        doMessage("isWMPSupported: found a video/source element with mime type '" + type + "'");

        for (var i=0; i<supportedMimeTypes.length; i++)
        {
            if (supportedMimeTypes[i] == type)
                return true;
        }
    }
    else if (videoOrSourceElement.src)
    {
        var src = videoOrSourceElement.src.toLowerCase();
        var lastIndex = src.lastIndexOf(".");

        if (lastIndex != -1)
            src = src.slice(lastIndex);

        doMessage("isWMPSupported: found a video/source element with ext '" + src + "'");

        for (var i=0; i<supportedVideoExtensions.length; i++)
        {
            if (supportedVideoExtensions[i] == src)
                return true;
        }
    }

    return false;
}

var createControlFromVideo = function(videoElement)
{
    doMessage("createControlFromVideo: looking for supported media sources");
    var supportedMediaSource = getSupportedMediaSource(videoElement);

    if (!supportedMediaSource)
    {
        doMessage("createControlFromVideo: video element contains an unsupported media source");
        return null;
    }
    else
    {
        doMessage("createControlFromVideo: video element contains a supported media source: '" + supportedMediaSource + "'");
    }

    var control = document.createElement("object");
    control.type = "application/x-ms-wmp";

    if (videoElement.style.cssText != "")
    {
        control.style.cssText = videoElement.style.cssText;
    }

    // object tag in firefox defaults to zero height/width
    // https://bugzilla.mozilla.org/show_bug.cgi?id=162846
    // need to assign these explicitly (default to 320 x 240), if video tag does not list them

    // assign height/width
    var width = videoElement.width;
    if (width <= 0) 
    {
        // try to use clientWidth if the video element doesn't have explicit width
        if (videoElement.clientWidth > 0)
        {
            width = videoElement.clientWidth;

            // adjust for padding
            if (videoElement.style.paddingRight != "")
            {
                width -= parseInt(videoElement.style.paddingRight);
            }
            if (videoElement.style.paddingLeft != "")
            {
                width -= parseInt(videoElement.style.paddingLeft);
            }
        }
        else
        {
            // default to 320 if we can't get width or clientWidth
            width = 320;
        }

        width += 'px';
    }
    control.width = width;

    var height = videoElement.height;
    if (height <= 0) 
    {
        // try to use clientHeight if the video element doesn't have explicit height
        if (videoElement.clientHeight > 0)
        {
            height = videoElement.clientHeight;

            // adjust for padding
            if (videoElement.style.paddingTop != "")
            {
                height -= parseInt(videoElement.style.paddingTop);
            }
            if (videoElement.style.paddingBottom != "")
            {
                height -= parseInt(videoElement.style.paddingBottom);
            }
        }
        else
        {
            // default to 240 if we can't get height or clientHeight
            height = 240;
        }

        height += 'px';
    }
    control.height = height;

    // following standard attributes need to be assigned only when they are present in the video tag

    if (videoElement.id != "") { control.id = videoElement.id; }
    if (videoElement.dir != "") { control.dir = videoElement.dir; }
    if (videoElement.class != "") { control.class = videoElement.class; }
    if (videoElement.title != "") { control.title = videoElement.title; }
    if (videoElement.draggable) { control.draggable = true; }
    if (videoElement.lang != "") { control.lang = videoElement.lang; }
    if (videoElement.spellcheck) { control.spellcheck = true; }

    // controls attribute - boolean for video tag. 
    // for WMP, uiMode => "full" shows controls, "none" shows only video window
    var controls = (videoElement.controls == true) ? "full" : "none";
    control.setAttribute("uiMode", controls);

    var autostart = videoElement.autoplay;  // boolean - maps to object.autostart property
    var paramAutoStart = document.createElement("param");
    paramAutoStart.name = "autostart";
    paramAutoStart.value = autostart;
    control.appendChild(paramAutoStart);

    // OPEN: Should we always set autostart when "controls" are hidden ?

    var paramUrl = document.createElement("param");
    paramUrl.name = "url";
    paramUrl.value = supportedMediaSource;
    control.appendChild(paramUrl);

    // following attributes are not set on replacing object tag (see bug links/reasoning)
    // hidden - https://bugzilla.mozilla.org/show_bug.cgi?id=567663
    // accesskey - https://bugzilla.mozilla.org/show_bug.cgi?id=accesskey
    // style - only has getter for java script. The attribute needs inline assignment.
    // tabindex - https://bugzilla.mozilla.org/show_bug.cgi?id=530455, https://bugzilla.mozilla.org/show_bug.cgi?id=333927
    // loop - https://bugzilla.mozilla.org/show_bug.cgi?id=449157, https://bugzilla.mozilla.org/show_bug.cgi?id=457604

    /*
    try
    {
        control.play = control.controls.play;
        control.pause = control.controls.pause;
        control.stop = control.controls.stop;

        control.addEventListener("DOMAttrModified", function(event)
        {
            doMessage("DEBUG DOMAttrModified: "+  event.attrName);
            if (event.attrName && event.attrName.toLowerCase() == "src")
            {
                doMessage("DEBUG DOMAttrModified: " + event.newValue);
                control.URL = event.newValue;
            }
        }, true);
    }
    catch (e)
    {
        doError("createControlFromVideo: error adding controls mapping", e);
    }
     */

    return control;
}

var processVideoElements = function()
{
    var videoElements = document.getElementsByTagName("video");
    doMessage("processVideoElements: Document contains " + videoElements.length + " video elements");

    for (var i=0; i<videoElements.length; i++)
    {
        doMessage("processVideoElements: --- Processing video element #" + i + " ---");
        let videoElement = videoElements[i];
        videoElement.removeEventListener("DOMSubtreeModified", processVideoElements, true);

        var objectElement = createControlFromVideo(videoElement);

        if (objectElement)
        {
            doMessage("processVideoElements: *SUCCESSFULLY CONVERTED* a video element to an object");
            videoElement.parentNode.insertBefore(objectElement, videoElement);
            videoElement.setAttribute("class", "__wmpff_replaced");
        }
        else
        {
            doMessage("processVideoElements: Will not convert this video element to an object");

            doMessage("processVideoElements: adding a DOMSubtreeModified listener to this video element");
            videoElement.addEventListener("DOMSubtreeModified", processVideoElements, true);
        }
    }

    while (replacedVideoElement = document.querySelector(".__wmpff_replaced"))
    {
        replacedVideoElement.parentNode.removeChild(replacedVideoElement);
    }
}

setTimeout(function() {
             processVideoElements();
           }, 100);
