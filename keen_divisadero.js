

//Keen.io
tagManager.utils.scriptLoad('//d26b395fwzu5fz.cloudfront.net/3.4.1/keen-tracker.min.js', function() {

    var client = new Keen({
        projectId: "5759378b709a39611f9cc038",
        writeKey: "2d6e4e862db45839124392d327ebbbcf6024725486f6f3b267a6a0b10ccadd411e77ed6fe64800b24ce4d419851b4ea315faf908aa2e5e6fb78dc638f3b0cc104fee1107ac580009714f3c7b2b3b47994491568de90a42fda48c9f71835d2d21",
        requestType: "jsonp"
    });
    var flagKeenView = false;

    var keenView = function() {

        if (!flagKeenView) {
            flagKeenView = true;
            client.addEvent("pageView", tagManager.data);
        }
    };
    if (tagManager.obligatoryData.dataLeft > 0) {
        tagManager.on('allDataFilled', function() {
            keenView();
        });
        tagManager.on('load', function() {
            //si no tras 3 segudos despues de producirse el load no se ha hecho la vista de página se fuerza la llamada 
            setTimeout(function() {
                keenView();
            }, 5000);
        });
    } else {
        keenView();
    }


    tagManager.on("user.*", function(category, action, label, value) {
        var argsObject = {
            category: category,
            action: action,
            label: label,
            value: value
        };
        client.addEvent("userEvent", argsObject);
    });
    tagManager.on("social.*", function(socialNetwork, socialAction, socialTarget) {
        var argsObject = {
            socialNetwork: socialNetwork,
            socialAction: socialAction,
            socialTarget: socialTarget
        };
        client.addEvent("socialEvent", argsObject);

    });
    tagManager.on("socialSharing", function(socialNetwork, socialAction, socialTarget) {
        var argsObject = {
            socialNetwork: socialNetwork,
            socialAction: socialAction,
            socialTarget: socialTarget
        };
        
        //gaMany('send', 'social', socialNetwork, socialAction, socialTarget);
        var postItem = tagManager.utils.find(tagManager.data.pageInfo.postImpressions, { title: socialAction });
        if (tagManager.data.pageInfo.post.title === socialAction) {
            postItem = tagManager.data.pageInfo.post;
        }
        if (postItem && postItem.title) {
            argsObject.postItem = postItem;
        }
        client.addEvent("socialEvent", argsObject);
    });

    tagManager.on('postClick', function(postItem) {
        client.addEvent("postClick", postItem);
    });


});
