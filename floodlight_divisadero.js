function floodlightTrigger(paramConfig) {
    var axel = Math.random() + "";
    var a = axel * 10000000000000000;
    var flDiv = document.body.appendChild(document.createElement("div"));
    flDiv.setAttribute("id", "DCLK_FLDiv" + a);
    flDiv.style.position = "absolute";
    flDiv.style.top = "0";
    flDiv.style.left = "0";
    flDiv.style.width = "1px";
    flDiv.style.height = "1px";
    flDiv.style.display = "none";
    var iframeContent = '<iframe id="DCLK_FLIframe1" src="http://5123609.fls.doubleclick.net/activityi;src=5123609;type=dsd;cat=divis0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=' + a;
    if (paramConfig) {
        for (var param in paramConfig) {
            iframeContent += ';' + param + '=' + encodeURIComponent(paramConfig[param]);
        }
    }
    iframeContent += '?" width="1" height="1" frameborder="0"><\/iframe>';
    flDiv.innerHTML = iframeContent;

}

var floodlightMapping = {
    u1: tagManager.data.pageInfo.pageName,
    u2: tagManager.data.pageInfo.post.category,
    u5: tagManager.data.userInfo.ids.email,
    u7: tagManager.data.pageInfo.keyword,
    u9: tagManager.data.userInfo.adblock,
    u10: tagManager.data.userInfo.device.type,
    u11: tagManager.data.userInfo.ids.fingerprint,
    u12: tagManager.data.userInfo.campaign.source,
    u13: tagManager.data.userInfo.campaign.medium,
    u14: tagManager.data.userInfo.campaign.name,
    u15: tagManager.data.userInfo.network.netname
};


var flagFloodlightView = false;

var floodlightView = function() {

    if (!flagFloodlightView) {
        flagFloodlightView = true;
        var activeData = {};
        for (var param in floodlightMapping) {
            if (floodlightMapping[param]) {
                activeData[param] = floodlightMapping[param];
            }
        }
        floodlightTrigger(activeData);
    }
};
if (tagManager.obligatoryData.dataLeft > 0) {
    tagManager.on('allDataFilled', function() {
        floodlightView();
    });
    tagManager.on('load', function() {
        //si no tras 3 segudos despues de producirse el load no se ha hecho la vista de página se fuerza la llamada 
        setTimeout(function() {
            floodlightView();
        }, 5000);
    });
} else {
    floodlightView();
}

//u3: content_download
tagManager.on('user.donwload', function(category, type, documentName) {
    floodlightTrigger({ u3: documentName });
});
// u4: company
tagManager.onMany(["ssCompleteSubmit", "contactFormSubmitted"], function() {
    if (tagManager.data.userInfo.company) {
        floodlightTrigger({ u4: tagManager.data.userInfo.company });
    }
});

// u6: contact_event
tagManager.onMany(['contactFormSubmitted','ssCompleteSubmit','newsletterSubscription',''], function() {
    floodlightTrigger({ u6: true });
});

// u8: suscribed_webinar
tagManager.on('user.webinar', function(category, type, webinarName) {
    floodlightTrigger({ u8: webinarName });
});

// u16: social_share
tagManager.on('socialSharing', function(network) {
    floodlightTrigger({ u16: network });
});
