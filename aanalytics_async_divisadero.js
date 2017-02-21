var flagAAnalyticsView = false;

var aAnalyticsView = function() {

    if (!flagAAnalyticsView) {
        flagAAnalyticsView = true;
        var s = s_gi(tagManager.data.configuration.sitecatalyst.s_account);
        s.t();
    }
};
if (tagManager.obligatoryData.dataLeft > 0) {

    tagManager.on('allDataFilled', function() {

        aAnalyticsView();

    });
    tagManager.on('load', function() {

        //si no tras 3 segudos despues de producirse el load no se ha hecho la vista de página se fuerza la llamada 
        setTimeout(function() {
            aAnalyticsView();
        }, 5000);
    });
} else {

    aAnalyticsView();
}
//Evento social (event12)
tagManager.onMany(["social.*", "socialSharing"], function(socialNetwork, socialAction, socialTarget) {
    var s = s_gi(tagManager.data.configuration.sitecatalyst.s_account); // Report suites ID que recibirán la información 
    s.linkTrackVars = 'prop26,eVar26,prop25,eVar25,prop24,eVar24,prop23,eVar23,eVar49,events';
    s.linkTrackEvents = 'event11';
    s.prop27 = socialNetwork;
    s.eVar27 = 'D=c27';
    s.prop28 = socialAction;
    s.eVar28 = 'D=c28';
    s.prop29 = socialTarget;
    s.eVar29 = 'D=c29';
    s.events = 'event12';
    s.tl(this, 'o', 'evento social asincrono');

});

//Evento generico (event11)

tagManager.on("user.*", function(category, action, label, value) {
    var s = s_gi(tagManager.data.configuration.sitecatalyst.s_account); // Report suites ID que recibirán la información 
    s.linkTrackVars = 'prop26,eVar26,prop25,eVar25,prop24,eVar24,prop23,eVar23,eVar49,events';
    s.linkTrackEvents = 'event11';
    s.prop23 = category;
    s.eVar23 = 'D=c23';
    s.prop24 = action;
    s.eVar24 = 'D=c24';
    s.prop25 = label;
    s.eVar25 = 'D=c25';
    s.prop26 = value;
    s.eVar26 = 'D=c26';
    s.events = 'event11';
    s.tl(this, 'o', 'evento asincrono');

});
tagManager.on("postClick", function(postItem) {
    var s = s_gi(tagManager.data.configuration.sitecatalyst.s_account); // Report suites ID que recibirán la información 
    s.linkTrackVars = 'prop26,eVar26,prop25,eVar25,prop24,eVar24,prop23,eVar23,eVar49,events';
    s.linkTrackEvents = 'event11';
    s.prop23 = 'postImpression';
    s.eVar23 = 'D=c23';
    s.prop24 = 'click';
    s.eVar24 = 'D=c24';
    s.prop25 = tagManager.data.pageInfo.pageName;
    s.eVar25 = 'D=c25';
    s.events = 'event11';
    s.tl(this, 'o', 'evento asincrono');

});

//Evento Scroll (event7, event8, event9, event 10)


tagManager.on("scroll", function(event, milestone, pagename) {
    var mapMetrics = {
        25: "event7",
        50: "event8",
        75: "event9",
        100: "event10"
    };
    var metric = mapMetrics[milestone];
    if (metric) {
        if ((tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG && jQuery('.blog_single').length > 0) || tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.HOME) {
            var s = s_gi(tagManager.data.configuration.sitecatalyst.s_account); // Report suites ID que recibirán la información 
            s.linkTrackVars = 'events';
            s.linkTrackEvents = 'event7,event8,event9,event10';
            s.events = metric;
            s.tl(this, 'o', 'scroll ' + milestone + '%');

        }
    }
});
