/* jshint -W100 */
// funcion que se llama con los mismos argumentos que se utilizarían en la llamada ga(...)
// pero que opera en todas las properties configuradas dentro del array `properties`
window.gaMany = function() {
    var args = [].splice.call(arguments, 0);
    var properties = ['fingerprint', 'email'];
    var method = args.splice(0, 1)[0];
    for (var i = 0; i < properties.length; i++) {
        var newArgs = [properties[i] + '.' + method].concat(args);
        ga.apply(null, newArgs);
    }
};

// codigo de analítica común a ambas properties
tagManager.utils.scriptLoad('//www.google-analytics.com/analytics.js', function() {
    var fingerprint = tagManager.data.userInfo.ids.fingerprint;
    var email = tagManager.data.userInfo.ids.email;
    var fingerprintGaAccount = tagManager.data.configuration.gaAccount.fingerprint;
    var emailGaAccount = tagManager.data.configuration.gaAccount.email;
    tagManager.log('fingerprint userId: ' + fingerprint);
    tagManager.log('email userId: ' + email);
    var flagGaView = false;
    var gaView = function() {
        if (!flagGaView) {
            ga('create', {
                trackingId: fingerprintGaAccount,
                cookieDomain: 'auto',
                name: 'fingerprint',
                userId: fingerprint
            });
            ga('create', {
                trackingId: emailGaAccount,
                cookieDomain: 'auto',
                name: 'email',
                userId: email
            });
            gaMany('require', 'ec');
            //setting the currency
            gaMany('set', '&cu', 'EUR');
            //setting speed sampler to 100%
            gaMany('set', 'siteSpeedSampleRate', 100);
            try {
                for (var i = 0; i < tagManager.data.pageInfo.sections.length; i++) {
                    gaMany('set', 'dimension' + (i + 1), tagManager.data.pageInfo.sections[i]);
                }
                gaMany('set', 'title', tagManager.data.pageInfo.pageName);
                // Custom Dimensions
                gaMany('set', 'dimension6', tagManager.data.pageInfo.url);
                gaMany('set', 'dimension7', tagManager.data.pageInfo.referrer);
                if (tagManager.data.pageInfo.pageType === tagManager.data.constants.pageType.SEARCH) {
                    gaMany('set', 'dimension8', tagManager.data.pageInfo.search.keyword);
                    gaMany('set', 'dimension9', tagManager.data.pageInfo.search.resultNum);
                }
                gaMany('set', 'dimension10', tagManager.data.pageInfo.pageType);

                // si estoy en una página de post se envía un product detail y otros datos que no sean
                // custom dimensions
                if ((tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG && jQuery('.blog_single').length > 0) && tagManager.data.pageInfo.post) {
                    gaMany('set', 'dimension11', tagManager.data.pageInfo.post.title);
                    gaMany('set', 'dimension13', tagManager.data.pageInfo.post.category);
                    var tags = tagManager.data.pageInfo.post.tags;
                    tags = Array.isArray(tags) ? tags.join(',') : tags;
                    gaMany('set', 'dimension16', tags);
                    gaMany('ec:addProduct', {
                        'name': tagManager.data.pageInfo.post.title,
                        'category': tagManager.data.pageInfo.post.category,
                        'dimension12': tagManager.data.pageInfo.post.author,
                        'dimension14': tagManager.data.pageInfo.post.date,
                        'dimension15': tagManager.data.pageInfo.post.readingTime
                    });
                    gaMany('ec:setAction', 'detail'); // Detail action.
                }

                
                gaMany('set', 'dimension17', tagManager.data.configuration.tealiumEnvironment);
                gaMany('set', 'dimension18', tagManager.data.userInfo.adblock);
                gaMany('set', 'dimension19', tagManager.data.userInfo.ids.email);
                gaMany('set', 'dimension20', tagManager.data.userInfo.ids.fingerprint);

                // post impressions
                var postImpressions = tagManager.data.pageInfo.postImpressions;
                for (i = 0; i < postImpressions.length; i++) {
                    gaMany('ec:addImpression', {
                        'name': postImpressions[i].title,
                        'category': postImpressions[i].category,
                        'list': tagManager.data.pageInfo.pageType,
                        'position': postImpressions[i].position,
                        'dimension12': postImpressions[i].author,
                        'dimension14': postImpressions[i].date
                    });
                }

                if (tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG_SEARCH) {
                    gaMany('set', 'metric4', 1);
                    if (!tagManager.data.pageInfo.search.resultNum) {
                        gaMany('set', 'metric5', 1);
                    }
                } else if (tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.BLOG) {

                    if (tagManager.data.configuration.pathArray[0] == "category") {
                        gaMany('set', 'metric3', 1);
                    } else if (jQuery('.blog_single').length > 0) {
                        gaMany('set', 'metric1', 1);
                    }
                }

                if (tagManager.data.pageInfo.postImpressions.length > 0) {
                    gaMany('set', 'metric2', 1);
                }

            } catch (e) {
                tagManager.error(e);
            }

            gaMany('send', 'pageview');
            flagGaView = true;
        }
    };

    // if there's still required data to fill it sets a listener
    // oterwhise it runs the pageview() right now
    if (tagManager.obligatoryData.dataLeft > 0) {
        tagManager.once('allDataFilled', function() {
            gaView();
        });
        tagManager.once('load',function(){
        //si no tras 3 segudos despues de producirse el load no se ha hecho la vista de página se fuerza la llamada 
        setTimeout(function(){
            gaView();
        }, 5000);
    });
    } else {
        gaView();
    }

    //Async Events
    tagManager.on("user.*", function(category, action, label, value) {
        tagManager.log(["evento asíncrono:" + this.event, category, action, label, value]);
        gaMany('send', 'event', category, action, label, value);
    });
    tagManager.on("social.*", function(socialNetwork, socialAction, socialTarget) {
        tagManager.log(["social Sharing", socialNetwork, socialAction, socialTarget]);
        gaMany('send', 'social', socialNetwork, socialAction, socialTarget);
        
    });
    tagManager.on("socialSharing", function(socialNetwork, socialAction, socialTarget) {
        tagManager.log(["social Sharing", socialNetwork, socialAction, socialTarget]);
        //gaMany('send', 'social', socialNetwork, socialAction, socialTarget);
        var postItem = tagManager.utils.find(tagManager.data.pageInfo.postImpressions, { title: socialAction });
        if (tagManager.data.pageInfo.post.title === socialAction) {
            postItem = tagManager.data.pageInfo.post;
        }
        if (postItem && postItem.title) {
            gaMany('ec:addProduct', {
                'name': postItem.title,
                'category': postItem.category,
                'variant': socialNetwork
            });
            gaMany('ec:setAction', 'purchase', {
                'id': tagManager.utils.uid(),
                'revenue': '1'
            });
        }
        gaMany('send', 'social', socialNetwork, socialAction, socialTarget);
    });

    tagManager.on('postClick', function(postItem) {
        tagManager.log(['postClick', postItem]);
        gaMany('ec:addProduct', {
            'name': postItem.title,
            'category': postItem.category,
            'list': tagManager.data.pageInfo.pageType,
            'position': postItem.position
        });
        gaMany('ec:setAction', 'click');
        gaMany('send', 'event', 'postImpression', 'click', tagManager.data.pageInfo.pageName);
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
                gaMany('set', 'metric' + metric, 1);
                gaMany('send', 'event', event, milestone + "%", pagename);
            }
        }
    });
});