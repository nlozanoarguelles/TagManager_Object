var s_account = tagManager.data.configuration.sitecatalyst.s_account;
var s = s_gi(s_account);
/************************** CONFIG SECTION **************************/
/* You may add or alter any code config here. */
s.charSet = "UTF-8";
/* Conversion Config */
s.currencyCode = "EUR";
/* Link Tracking Config */
s.trackDownloadLinks = true;
s.trackExternalLinks = true;
s.trackInlineStats = true;
s.linkDownloadFileTypes = "exe,zip,wav,mp3,mov,mpg,avi,wmv,doc,pdf,xls";
s.linkLeaveQueryString = false;
s.linkTrackVars = "None";
s.linkTrackEvents = "None";

/*Dynamically setting the domain in s.linkInternalFilters*/
var dd = document.domain;
var cd = dd.substring(dd.indexOf(".") + 1, dd.length);
s.linkInternalFilters = 'javascript:,' + cd;
/* Plugin Config */
s.usePlugins = true;

//AAM
s.loadModule("AudienceManagement");

s.mappingSettings = {
    "prop1": tagManager.data.pageInfo.sections[0],
    "prop2": tagManager.data.pageInfo.sections[1],
    "prop3": tagManager.data.pageInfo.sections[2],
    "prop4": tagManager.data.pageInfo.sections[3],
    "prop5": tagManager.data.pageInfo.sections[4],
    "prop6": tagManager.data.pageInfo.url,
    "prop7": tagManager.data.pageInfo.referrer,
    "prop8": tagManager.data.pageInfo.search.keyword,
    "prop9": tagManager.data.pageInfo.search.resultNum,
    "prop10": tagManager.data.pageInfo.pageInfo,
    "prop11": tagManager.data.pageInfo.post.title,
    "prop12": tagManager.data.pageInfo.post.author,
    "prop13": tagManager.data.pageInfo.post.category,
    "prop14": tagManager.data.pageInfo.post.date,
    "prop15": tagManager.data.pageInfo.post.readingTime,
    "prop16": tagManager.data.pageInfo.post.tags,
    "prop17": tagManager.data.configuration.tealiumEnviroment,
    "prop18": tagManager.data.userInfo.adblock,
    "prop19": tagManager.data.userInfo.ids.email,
    "prop20": tagManager.data.userInfo.ids.fingerprint,
    "prop22": tagManager.data.pageInfo.timestamp,
    "prop29": tagManager.data.pageInfo.url,
    "prop30": tagManager.data.pageInfo.pageName,
    "prop31": tagManager.data.userInfo.campaign.source,
    "prop32": tagManager.data.userInfo.campaign.medium,
    "prop33": tagManager.data.userInfo.campaign.term,
    "prop34": tagManager.data.userInfo.campaign.content,
    "prop35": tagManager.data.userInfo.campaign.name
}

function s_doPlugins(s) {
    s.AudienceManagement.setup({
        "partner": "divisadero",
        "containerNSID": 0,
        "uuidCookie": {
            "name": "aam_uuid",
            "days": 30
        }

    });
    try {
        if (s.visitor) {
            s.visitor.setCustomerIDs({
                "fingerprint": {
                    "id": tagManager.data.userInfo.ids.fingerprint,
                    "authState": Visitor.AuthState.AUTHENTICATED
                },
                "email": {
                    "id": tagManager.data.userInfo.ids.email,
                    "authState": Visitor.AuthState.AUTHENTICATED
                }
            });
        }
    } catch (e) {}

    s.currencyCode = "EUR";
    // Servidor de la página
    s.server = window.location.host;

    //Nombre de la página
    s.pageName =  tagManager.data.pageInfo.pageName;

    //Canal
    s.channel =  "Divisadero";

    if(tagManager.data.userInfo.campaign.source){
      var trackingCode = '';
      if(tagManager.data.userInfo.campaign.medium){
        trackingCode += tagManager.data.userInfo.campaign.medium + ':';
      }
      if(tagManager.data.userInfo.campaign.name){
        trackingCode += tagManager.data.userInfo.campaign.name + ':';
      }
      if(tagManager.data.userInfo.campaign.content){
        trackingCode += tagManager.data.userInfo.campaign.content + ':';
      }
      if(tagManager.data.userInfo.campaign.term){
        trackingCode += tagManager.data.userInfo.campaign.term;
      }
      trackingCode = trackingCode.replace(/\:$/,'');
      s.campaign = trackingCode;
    }

    //Jerarquia
    s.hier1 = tagManager.data.pageInfo.sections.join(',');
    for (var i in s.mappingSettings) {
        s[i] = s.mappingSettings[i];
    }

    //New repeat visitor
    s.prop21 = s.getNewRepeat();

    //from prop to evar 
    for (var i in s.mappingSettings) {
        var variableNum = i.match(/\d+/)[0];
        s["eVar" + variableNum] = "D=c" + variableNum;
    }

    if (tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG_SEARCH) {
        s.apl(s.events, "event4", ",", 1)
        if (!tagManager.data.pageInfo.search.resultNum) {
            s.apl(s.events, "event5", ",", 1);
        }
    } else if (tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG) {

        if (tagManager.data.configuration.pathArray[0] == "category") {
            s.apl(s.events, "event3", ",", 1);
        } else if (jQuery('.blog_single').length > 0) {
            s.apl(s.events, "event1", ",", 1);
        }
    }

    if (tagManager.data.pageInfo.postImpressions.length > 0) {
        s.apl(s.events, "event2", ",", 1);
    }




}
s.doPlugins = s_doPlugins;
s.visitor = Visitor.getInstance("4F2A6ED55755887D7F000101@AdobeOrg", {
    trackingServer: "divisaderopartnersandbox.d3.sc.omtrdc.net",
    trackingServerSecure: "divisaderopartnersandbox.d3.sc.omtrdc.net",
    loadTimeout: 10000
});
s.visitorNamespace = "divisaderopartnersandbox"
s.trackingServer = "divisaderopartnersandbox.d3.sc.omtrdc.net"

/************************** PLUGINS SECTION *************************/
/* You may insert any plugins you wish to use here.                 */
/********************************************************************/

/*
 * Plugin: getValOnce 0.2 - get a value once per session or number of days
 */
s.getValOnce = new Function("v", "c", "e", "" + "var s=this,k=s.c_r(c),a=new Date;e=e?e:0;if(v){a.setTime(a.getTime(" + ")+e*86400000);s.c_w(c,v,e?a:0);}return v==k?'':v");

/*
 * Plugin: getNewRepeat 1.0 - Return whether user is new or repeat
 */
s.getNewRepeat = new Function("" + "var s=this,e=new Date(),cval,ct=e.getTime(),y=e.getYear();e.setTime" + "(ct+30*24*60*60*1000);cval=s.c_r('s_nr');if(cval.length==0){s.c_w(" + "'s_nr',ct,e);return 'New';}if(cval.length!=0&&ct-cval<30*60*1000){s" + ".c_w('s_nr',ct,e);return 'New';}if(cval<1123916400001){e.setTime(cv" + "al+30*24*60*60*1000);s.c_w('s_nr',ct,e);return 'Repeat';}else retur" + "n 'Repeat';");

/*
 * Plugin Utility: apl v1.1
 */
s.apl = new Function("l", "v", "d", "u", "" + "var s=this,m=0;if(!l)l='';if(u){var i,n,a=s.split(l,d);for(i=0;i<a." + "length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas" + "e()));}}if(!m)l=l?l+d+v:v;return l");

/*
 * Utility Function: split v1.5 - split a string (JS 1.0 compatible)
 */
s.split = new Function("l", "d", "" + "var i,x=0,a= new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x" + "++]=l.substring(0,i);l=l.substring(i+d.length);}return a");

/*
 * Utility manageVars v1.4 - clear variable values (requires split 1.5)
 */
s.manageVars = new Function("c", "l", "f", "" + "var s=this,vl,la,vla;l=l?l:'';f=f?f:1 ;if(!s[c])return false;vl='pa" + "geName,purchaseID,channel,server,pageType,campaign,state,zip,events" + ",products,transactionID';for(var n=1;n<76;n++){vl+=',prop'+n+',eVar" + "'+n+',hier'+n;}if(l&&(f==1||f==2)){if(f==1){vl=l;}if(f==2){la=s.spl" + "it(l,',');vla=s.split(vl,',');vl='';for(x in la){for(y in vla){if(l" + "a[x]==vla[y]){vla[y]='';}}}for(y in vla){vl+=vla[y]?','+vla[y]:'';}" + "}s.pt(vl,',',c,0);return true;}else if(l==''&&f==1){s.pt(vl,',',c,0" + ");return true;}else{return false;}");
s.clearVars = new Function("t", "var s=this;s[t]='';");
s.lowercaseVars = new Function("t", "" + "var s=this;if(s[t]&&t!='events'){s[t]=s[t].toString();if(s[t].index" + "Of('D=')!=0){s[t]=s[t].toLowerCase();}}");