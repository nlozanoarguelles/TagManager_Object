tagManager.utils.scriptLoad('//www.google-analytics.com/analytics.js', function() {
    var flagPageView = false;
    var pageView = function() {
        if (!flagPageView) {
            ga('create', tagManager.data.configuration.gaAccount, 'auto', {
                siteSpeedSampleRate: 100
            });
            ga('require', 'ec');
            //setting the currency
            ga('set', '&cu', 'EUR');
            //setting speed sampler to 100%
            ga('set', 'siteSpeedSampleRate', 100);
            flagPageView = true;
            try {
                ga('set', 'title', tagManager.data.pageInfo.pageName);
                // Custom Dimensions
                ga('set', 'dimension1', tagManager.data.pageInfo.url);
                ga('set', 'dimension2', tagManager.data.pageInfo.referrer);
                ga('set', 'dimension3', tagManager.data.pageInfo.search.keyword);
                ga('set', 'dimension4', tagManager.data.pageInfo.search.orderBy);
                ga('set', 'dimension5', tagManager.data.pageInfo.productoDisplay);
                //filling section information
                var initialSection = 6;
                for (var i = 0; i < tagManager.data.pageInfo.sections.length; i++) {
                    var dimensionNumber = i + initialSection;
                    ga('set', 'dimension' + dimensionNumber, tagManager.data.pageInfo.sections[i]);
                }

                ga('set', 'dimension11', tagManager.data.pageInfo.post.title);
                ga('set', 'dimension12', tagManager.data.pageInfo.post.category);
                if (tagManager.data.pageInfo.post.title || tagManager.data.pageInfo.post.category) {
                    ga('set', 'metric6', 1);
                }
                //Custom events
                switch (tagManager.data.pageInfo.pageType) {
                    case tagManager.data.constants.pageType.PRODUCT:
                        ga('set', 'metric1', 1);
                        if (tagManager.data.ecommerce.productDetail && !tagManager.data.ecommerce.productDetail.available) {
                            ga('set', 'metric4', 1);
                        }
                        break;
                    case tagManager.data.constants.pageType.CATEGORY:
                        ga('set', 'metric2', 1);
                        break;
                    case tagManager.data.constants.pageType.SEARCH:
                        ga('set', 'metric3', 1);
                        break;
                }

                //ecommerce tagging
                //Product Impression

                //Avoid sending impressions over the checkout process
                if (tagManager.data.pageInfo.pageType != tagManager.data.constants.pageType.PURCHASE) {
                    function addImpression(productData) {
                        ga('ec:addImpression', productData);
                    }
                    if (tagManager.data.ecommerce.productList) {
                        for (var i = 0; i < tagManager.data.ecommerce.productList.length; i++) {
                            addImpression(tagManager.data.ecommerce.productList[i]);
                        }
                    }
                }
                //Product click
                tagManager.on('productClick', function(dataInfo) {
                    ga('ec:addProduct', dataInfo);
                    ga('ec:setAction', 'click', { list: tagManager.data.pageInfo.pageName });
                    ga('send', 'event', 'ecommerce', 'click', tagManager.data.pageInfo.pageName);
                });

                //Product detail
                if (tagManager.data.ecommerce.productDetail) {
                    ga('ec:addProduct', tagManager.data.ecommerce.productDetail);
                    ga('ec:setAction', 'detail');
                }
                //Add/Remove to cart
                tagManager.on("cartChanged", function(cartInfo, productChange) {
                    for (var i = productChange.length - 1; i >= 0; i--) {
                        var cartChangeType = productChange[i][0];
                        var productInfo = productChange[i][1];
                        ga('ec:addProduct', productInfo);
                        ga('ec:setAction', cartChangeType);
                        ga('send', 'event', 'ecommerce', 'cart interaction', cartChangeType);
                    }

                });
                //checkout steps
                if (tagManager.data.pageInfo.pageType == tagManager.data.constants.pageType.PURCHASE) {

                    for (var i = 0; i < tagManager.data.ecommerce.cart.length; i++) {
                        var product = tagManager.data.ecommerce.cart[i];
                        ga('ec:addProduct', product);
                    }

                    if (tagManager.data.ecommerce.checkout.step == 5) {
                        ga('ec:setAction', 'purchase', {
                            'id': tagManager.data.ecommerce.checkout.orderId,
                            'revenue': tagManager.data.ecommerce.checkout.revenue,
                            'tax': tagManager.data.ecommerce.checkout.tax,
                            'shipping': tagManager.data.ecommerce.checkout.shipping
                        });
                        sessionStorage.setItem('tagManagerCart', '');
                        sessionStorage.setItem('tagManagerCartRevenue', '');
                        sessionStorage.setItem('tagManagerCartShipping', '');
                        sessionStorage.setItem('tagManagerCartTax', '');
                    } else {
                        ga('ec:setAction', 'checkout', { step: tagManager.data.ecommerce.checkout.step });
                        tagManager.on('nextStepCheckout', function(stepNumber, checkoutOption) {
                            ga('ec:setAction', 'checkout_option', {
                                'step': stepNumber,
                                'option': checkoutOption
                            });

                            ga('send', 'event', 'ecommerce', 'checkout-' + stepNumber, checkoutOption);
                        });
                    }

                }

            } catch (e) {};

            ga('send', 'pageview');
        }
    }
    if (tagManager.obligatoryData.dataLeft > 0) {
        tagManager.once('allDataFilled', function() {
            pageView();
        });
    } else {
        pageView();
    }

    /*
    setTimeout(function() {
        pageView();
    }, 3500);
    */

    //Async Events
    tagManager.on("user.*", function(category, action, label, value) {
        if (this.event == "user.filterHashChange") {
            ga('set', 'metric5', 1);
        }
        ga('send', 'event', category, action, label, value);
    });

    tagManager.on("socialSharing", function(socialNetwork, socialAction, socialTarget) {
        ga('send', 'social', socialNetwork, socialAction, socialTarget);
    });
});
