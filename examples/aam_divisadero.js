window.partnerObject = DIL.create({
    partner: "divisadero",
    visitorService: {
        namespace: "4F2A6ED55755887D7F000101@AdobeOrg"
    },
    containerNSID: 0,
    uuidCookie: {
        "name": "aam_uuid",
        "days": 30
    }
});

var flagAamView = false;
var aAmView = function() {
    if (!flagAamView) {
        flagAamView = true;
        partnerObject.api.signals(tagManager.utils.flatten(tagManager.data)).submit();
    }
}

if (tagManager.obligatoryData.dataLeft > 0) {
    tagManager.once('allDataFilled', function() {
        aAmView();
    });
    tagManager.once('load', function() {
        //si no tras 3 segudos despues de producirse el load no se ha hecho la vista de página se fuerza la llamada 
        setTimeout(function() {
        
            aAmView();
        }, 5000);
    });
} else {
   
    aAmView();
}

//Seguimiento de asincronos

//Async Events
tagManager.on("user.*", function(category, action, label, value) {
    var eventKeys = {
        "event.category": category,
        "event.action": action,
        "event.label": label,
        "event.value": value
    };
    partnerObject.api.signals(eventKeys);
    partnerObject.api.submit();
});
tagManager.on("social.*", function(socialNetwork, socialAction, socialTarget) {
    var socialKeys = {
        "social.network": socialNetwork,
        "social.action": socialAction,
        "social.target": socialTarget
    };
    partnerObject.api.signals(socialKeys).submit();
});
tagManager.on("socialSharing", function(socialNetwork, socialAction, socialTarget) {
    var socialKeys = {
        "social.network": socialNetwork,
        "social.action": socialAction,
        "social.target": socialTarget
    };
    partnerObject.api.signals(socialKeys);
    var postItem = tagManager.utils.find(tagManager.data.pageInfo.postImpressions, { title: socialAction });
    if (tagManager.data.pageInfo.post.title === socialAction) {
        postItem = tagManager.data.pageInfo.post;
    }
    if (postItem && postItem.title) {

        partnerObject.api.signals(postItem);
    }
    partnerObject.api.submit();
});

tagManager.on('postClick', function(postItem) {
    partnerObject.api.signals(postItem).submit();
});

tagManager.on("scroll", function(event, milestone, pagename) {
    var mapMetrics = {
        25: 7,
        50: 8,
        75: 9,
        100: 10
    };
    var metric = mapMetrics[milestone];
    if (metric) {
        tagManager.log([event, metric, pagename]);
        if ((tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG && jQuery('.blog_single').length > 0) || tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.HOME) {

            var eventData = {
                "event.category": event,
                "event.action": milestone + "%",
                "event.label": pagename
            };
            partnerObject.api.signals(eventData).submit();
        }
    }
});
