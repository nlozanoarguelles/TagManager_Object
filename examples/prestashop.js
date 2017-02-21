//Ejemplo de objeto de configuración
var tagManagerSettings = {

    events: [{
        name: "user.productAttributeChange",
        details: "Evento que se genera cuando un usuario cambia un atributo del producto está viendo",
        params: ["eventType", "attributeChanged", "pageName"],
        listener: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.PRODUCT) {
                var attributeEvent = function() {
                    var attributeName = _self.utils.cleanText(jQuery(this).closest('fieldset').find('.attribute_label').text());
                    _self.emit("user.productAttributeChange", "product attribute change", attributeName, _self.data.pageInfo.pageName);
                };
                jQuery('#attributes .attribute_fieldset .attribute_list').each(function() {
                    if (jQuery(this).find('select').length == 0) {
                        jQuery(this).on('change click keypress', attributeEvent);
                    } else {
                        jQuery(this).on('change', attributeEvent);
                    }
                });
            }
        },
        trigger: "loadRules.pageType.*"
    }, {
        name: "user.productDisplay",
        details: "Evento que se genera cuando un usuario cambia un atributo del producto está viendo",
        params: ["eventType", "displayType", "pageName"],
        listener: function(pageType) {
            var _self = this;

            jQuery('#grid,#list').on('click', function() {
                var layoutText = _self.utils.cleanText(jQuery('.sortPagiBar .display .selected').text());
                _self.emit("user.productDisplay", "product display layoaut", layoutText, _self.data.pageInfo.pageName);
            });
        },
        trigger: "ready"
    }, {
        name: "user.videoView",
        details: "Evento que se genera cuando se hace clic sobre el video",
        params: ["eventType", "videoID", "pageName"],
        listener: function(pageType) {
            var _self = this;

            jQuery('.video_margin a').on('click', function() {
                if (jQuery(this).attr('href')) {
                    _self.emit("user.videoView", "video click", _self.utils.getYoutubeId(jQuery(this).attr('href')), _self.data.pageInfo.pageName);
                }

            });
        },
        trigger: "ready"
    }, {
        name: "user.quickView",
        details: "Evento que se genera cuando se hace clic sobre el botón de vista rápida",
        params: ["eventType", "productName", "pageName"],
        listener: function(pageType) {
            var _self = this;

            jQuery('[class*="quick-view"]').on('click', function() {
                if (jQuery(this).attr('href')) {
                    var getProductName = function(element) {
                        return _self.utils.cleanText(element.closest(".product-container").find('[itemprop="name"]').text());
                    }
                    _self.emit("user.quickView", "quick view", getProductName(jQuery(this)), _self.data.pageInfo.pageName);
                }

            });
        },
        trigger: "ready"
    }, {
        name: "user.filterHashChange",
        details: "Evento que se genera cuando en una página de categoria se modifican los filtros usados",
        params: ["eventType", "filter", "value"],
        listener: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.CATEGORY) {
                jQuery(window).on('hashchange', function() {
                    if (_self.data.pageInfo.filters) {
                        var oldFilters = _self.data.pageInfo.filters;
                        jQuery('#enabled_filters li').each(function() {
                            var productFilter = jQuery(this).text().split(':');
                            if (productFilter.length > 1) {
                                productFilter[0] = _self.utils.cleanText(productFilter[0]);
                                productFilter[1] = _self.utils.cleanText(productFilter[1]);
                                var isNew = true;
                                for (var i = 0; i < oldFilters.length; i++) {
                                    if (oldFilters[i][0] == productFilter[0] && oldFilters[i][1] == productFilter[1]) {
                                        isNew = false;
                                        break;
                                    }
                                }
                                if (isNew) {
                                    _self.emit("user.filterHashChange", "filter applied", productFilter[0], productFilter[1]);
                                }

                            }
                        });

                    } else {
                        var productFilter = jQuery('#enabled_filters li:first').text().split(':');
                        var productFilter = jQuery(this).text().split(':');
                        if (productFilter.length > 1) {
                            productFilter[0] = _self.utils.cleanText(productFilter[0]);
                            productFilter[1] = _self.utils.cleanText(productFilter[1]);
                            _self.emit("user.filterHashChange", "filter applied", productFilter[0], productFilter[1]);
                        }
                    }

                });
            }
        },
        trigger: "dataFilled.pageInfo.pageType"
    }, {
        name: "socialSharing",
        details: "Usuario pulsa sobre el botón de compartir en las redes sociales",
        params: ["socialNetwork", "pageName"],
        listener: function(pageType) {
            var _self = this;
            jQuery('.social-sharing').on('click', function() {

                _self.emit("socialSharing", _self.utils.cleanText(jQuery(this).data('type')), _self.data.pageInfo.pageName);

            });
            jQuery('.rrssb-buttons li').on('click', function() {

                _self.emit("socialSharing", _self.utils.cleanText(jQuery(this).attr('class')), _self.data.pageInfo.pageName);

            });
        },
        trigger: "ready"
    }, {
        name: "productHashChange",
        details: "Evento que se genera cuando en una página de producto cambia el hash de la url a causa de un cambio de atributo",
        params: ["hash"],
        listener: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.PRODUCT) {
                jQuery(window).on('hashchange', function() {
                    _self.emit("productHashChange", document.location.hash);
                });
            }
        },
        trigger: "ready"
    }, {
        name: "productClick",
        details: "Evento que se genera cuando se hace clic sobre un producto",
        params: ["productInfo"],
        listener: function() {
            var _self = this;
            jQuery('body').on('click','.product-container:visible a:not(.ajax_add_to_cart_button)', function(e) {
                var link = jQuery(this).attr('href');
                jQuery('.product-container:visible').each(function(index) {
                    if (jQuery(this).find('[href="' + link + '"]').length > 0) {
                        _self.emit("productClick", _self.data.ecommerce.productList[index])
                    }
                });
            });
        },
        trigger: "ready"
    }, {
        name: "nextStepCheckout",
        details: "Evento que se genera cuando se avanza en el proceso de compra",
        listener: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.PURCHASE) {
                if (_self.data.ecommerce.checkout.step != 4) {
                    jQuery('.standard-checkout').on('mousedown', function() {
                        switch (_self.data.ecommerce.checkout.step) {
                            case 3:
                                var deliveryService = _self.utils.cleanText(jQuery('.delivery_options .checked').closest('tr').find('strong').text());
                                _self.emit("nextStepCheckout", _self.data.ecommerce.checkout.step, deliveryService);
                                break;
                            default:
                                _self.emit("nextStepCheckout", _self.data.ecommerce.checkout.step);
                                break;
                        }
                    });
                } else {
                    jQuery('#HOOK_PAYMENT a').on('click', function() {
                        var paymentOption = _self.utils.cleanText(jQuery(this).attr('title'));
                        _self.emit("nextStepCheckout", _self.data.ecommerce.checkout.step, paymentOption);
                    });

                }



            }
        },
        trigger: "loadRules.pageType.*"
    }, {
        name: "loadRules.pageType",
        details: "Regla de carga que se lanza cuando se detecta que tipo de página se está mostrando",
        listener: function(pageType) {
            var _self = this;
            var eventName = 'loadRules.pageType.' + pageType;
            _self.emit(eventName, pageType);
        },
        trigger: ["dataFilled.pageInfo.pageType", "dataFilledError.pageInfo.pageType"]
    }, {
        name: "cartChanged",
        details: "Evento que se ejecuta cuando se produce un cambio en el carrito",
        listener: function(pageType) {
            var _self = this;
            var productInfoBuilder = function(productJSON) {
                var productName = _self.utils.cleanText(productJSON.name);
                var productBrand = 'amarsupiel';
                var productURL = productJSON.link;
                var productCategory = productURL && _self.utils.getProductCategory(productURL);
                var productVariant = productURL && _self.utils.getProductVariant(productURL);
                var productQuantity = parseInt(productJSON.quantity);
                var productPrice = _self.utils.cleanPrice(productJSON.priceByLine) / productQuantity;
                return {
                    name: productName,
                    brand: productBrand,
                    category: productCategory,
                    variant: productVariant,
                    price: productPrice,
                    quantity: productQuantity
                };
            };
            var compareCart = function(currentCart, oldCart) {
                var cartDifference = [];
                for (var i = 0; i < currentCart.length; i++) {
                    var keysObject = { name: currentCart[i].name, variant: currentCart[i].variant };
                    var currentQuantity = currentCart[i].quantity;
                    var oldProduct = oldCart && _self.utils.find(oldCart, keysObject);
                    if (oldProduct) {
                        if (oldProduct.quantity > currentQuantity) {
                            oldProduct.quatity = oldProduct.quantity - currentQuantity;
                            cartDifference.push(["remove", oldProduct]);
                        } else if (oldProduct.quantity < currentQuantity) {
                            oldProduct.quatity = currentQuantity - oldProduct.quantity;
                            cartDifference.push(["add", oldProduct]);
                        }
                    } else {

                        cartDifference.push(["add", currentCart[i]]);
                    }
                }
                if (currentCart.length < oldCart.length) {
                    for (var i = 0; i < oldCart.length; i++) {
                        var keysObject = { name: oldCart[i].name, variant: oldCart[i].variant };
                        var isProduct = _self.utils.find(currentCart, keysObject);
                        if (!isProduct) {
                            cartDifference.push(["remove", oldCart[i]]);
                        }
                    }
                }
                return cartDifference;
            }
            jQuery(document).ajaxComplete(function(event, response, settings) {

                try {
                    if (settings.data && settings.data.indexOf("controller=cart") > -1 && response.responseJSON && response.responseJSON.products) {
                        var cartArray = []
                        if (Array.isArray(response.responseJSON.products)) {
                            for (var i = 0; i < response.responseJSON.products.length; i++) {
                                cartArray.push(productInfoBuilder(response.responseJSON.products[i]));
                            }
                            var changedProducts = compareCart(cartArray, _self.data.ecommerce.cart);
                            _self.emit("cartChanged", cartArray, changedProducts);
                        }

                    }
                } catch (e) {
                    _self.error("Error[event cartChanged]: Ajax capture failed", e);
                }
            })
        },
        trigger: "ready"
    }],

    data: [{
        name: "configuration.gaAccount",
        details: "Contiene el ID de la cuenta de Google Analytics a la que se va a hacer el envío",
        extractor: function() {
            var _self = this;
            if ((document.location.hostname.indexOf('www.metodocanguro.') > -1 || document.location.hostname.indexOf('//metodocanguro.') > -1) && !_self.getDebug()) {
                return "UA-51340473-3";
            }
            return "UA-51340473-2";
        },
        trigger: "ready",
        obligatory: true,
        type: "array"
    }, {
        name: "configuration.pathArray",
        details: "Almacena el path de la URL en un Array. Este Array contiene las cadenas de texto en minisculas y los guiones traducidos a espacios",
        extractor: function() {
            var _self = this;
            var currentPathArray = document.location.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
            if (currentPathArray[0] == '') {
                currentPathArray.splice(0, 1);
            }
            for (var i = 0; i < currentPathArray.length; i++) {
                currentPathArray[i] = _self.utils.dashToSpace(currentPathArray[i].toLowerCase());
            }
            return currentPathArray;
        },
        trigger: "preloader",
        obligatory: true,
        type: "array"
    }, {
        name: "constants.pageType.HOME",
        details: "Constante que almacena el tipo de página Home",
        extractor: function() {
            return "home";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.PRODUCT",
        details: "Constante que almacena el tipo de página Producto",
        extractor: function() {
            return "product";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.CATEGORY",
        details: "Constante que almacena el tipo de página CATEGORY",
        extractor: function() {
            return "category";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.PURCHASE",
        details: "Constante que almacena el tipo de página purchase (el proceso de compra)",
        extractor: function() {
            return "purchase";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.SEARCH",
        details: "Constante que almacena el tipo de página busqueda",
        extractor: function() {
            return "search";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.OTHERS",
        details: "Constante que almacena el resto de tipos de páginas",
        extractor: function() {
            return "others";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.source",
        details: "Almacena la fuente de la campaña",
        extractor: function() {
            return _self.utils.getParameterByName("utm_source");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.medium",
        details: "Almacena el medio de la campaña",
        extractor: function() {
            return _self.utils.getParameterByName("utm_medium");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.term",
        details: "Almacena las palabras clave de la campaña",
        extractor: function() {
            return _self.utils.getParameterByName("utm_term");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.content",
        details: "Almacena el contenido de la campaña para diferenciar los anuncios o enlaces que llevan a la misma URL",
        extractor: function() {
            return _self.utils.getParameterByName("utm_content");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.name",
        details: "Almacena el nombre de la campaña",
        extractor: function() {
            return _self.utils.getParameterByName("utm_campaign");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.pageType",
        details: "Contiene la información relativa al tipo de página: [home,category,product,purchase,others]",
        extractor: function() {
            var _self = this;
            //Comprobamos si estamos en el path-root
            var isHome = function() {
                    return document.location.pathname === "/";
                }
                //Comprobamos si existe el bloque de meter en el carrito
            var isProduct = function() {
                    return jQuery('#buy_block').length > 0;
                }
                //Comprobamos si existe la opción de filtrar productos
            var isCategory = function() {

                    return Boolean(window.filters);
                }
                //Comprobamos si existe el apartado superior con el proceso de compra
            var isPurchase = function() {
                return jQuery('#order_step').length > 0;
            }

            var isSearch = function() {
                return Boolean(_self.utils.getParameterByName('controller') == "search");
            }

            if (isHome()) {

                return _self.data.constants.pageType.HOME;

            } else if (isProduct()) {

                return _self.data.constants.pageType.PRODUCT;

            } else if (isCategory()) {

                return _self.data.constants.pageType.CATEGORY;

            } else if (isPurchase()) {

                return _self.data.constants.pageType.PURCHASE;

            } else if (isSearch()) {

                return _self.data.constants.pageType.SEARCH;

            } else {

                return _self.data.constants.pageType.OTHERS;
            }
        },
        trigger: "ready",
        priority: 3,
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.sections",
        details: "Almacena todas las secciones asociadas a la página que se está visualizando",
        extractor: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.HOME) {
                return [_self.data.constants.pageType.HOME];
            } else if (_self.data.pageInfo.pageType == _self.data.constants.pageType.SEARCH) {
                var sectionArray = [_self.data.pageInfo.pageType];
                var searchKeyword = _self.utils.getParameterByName('search_query');
                sectionArray.push(searchKeyword);
                if (jQuery('.pagination .active').length > 0) {
                    var currentPage = isNaN(parseInt(jQuery('.pagination .active:first').text())) ? 1 : parseInt(jQuery('.pagination .active:first').text());
                    sectionArray.push('page-' + currentPage);
                }
                return sectionArray;
            } else if (jQuery('.breadcrumb').length > 0) {
                var breadCrumbData = _self.utils.cleanText(jQuery('.breadcrumb').text()).split(jQuery('.navigation-pipe:first').text());
                var breadCrumb = [];
                for (var i = 0; i < breadCrumbData.length; i++) {
                    if (breadCrumbData[i] && breadCrumbData[i] != '') {
                        breadCrumb.push(breadCrumbData[i]);
                    }
                }
                var sectionArray = [_self.data.pageInfo.pageType];
                for (var i = 0; i < breadCrumb.length; i++) {
                    sectionArray.push(breadCrumb[i].replace(/(^\s+|\s+$)/g, ''));
                }
                if (jQuery('.pagination .active').length > 0) {
                    var currentPage = isNaN(parseInt(jQuery('.pagination .active:first').text())) ? 1 : parseInt(jQuery('.pagination .active:first').text());
                    sectionArray.push('page-' + currentPage);
                }
                return sectionArray;
            } else {
                var sectionArray = [_self.data.pageInfo.pageType];
                for (var i = 0; i < _self.data.configuration.pathArray.length; i++) {
                    sectionArray.push(_self.data.configuration.pathArray[i].replace(/(\.html|\.php)/g,''));
                }

                if (jQuery('.pagination .active').length > 0) {
                    var currentPage = isNaN(parseInt(jQuery('.pagination .active:first').text())) ? 1 : parseInt(jQuery('.pagination .active:first').text());
                    sectionArray.push('page-' + currentPage);
                }
                return sectionArray;
            }
        },
        trigger: "ready",
        priority: 2,
        obligatory: true,
        type: "array"
    }, {
        name: "pageInfo.pageName",
        details: "Nombre de página formado por la concatenación de las secciones unidas por el separador :",
        extractor: function() {
            var _self = this,
                numberSections = _self.data.pageInfo.sections.length,
                pageName = '';
            for (var i = 0; i < numberSections - 1; i++) {
                pageName += _self.data.pageInfo.sections[i] + ':';
            }
            pageName += _self.data.pageInfo.sections[i];
            return pageName;
        },
        trigger: "ready",
        priority: 1,
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.productoDisplay",
        details: "Contiene el tipo de display de productos [cuadricula o lista]",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.sortPagiBar .display .selected').text());
        },
        trigger: ["ready", "user.productDisplay"],
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.title",
        details: "Contiene el titulo del post",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.OTHERS && jQuery('.info_blog:visible').length > 0) {
                return _self.utils.cleanText(document.title);
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.category",
        details: "Contiene la categoria del post que se está visualizando",
        extractor: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.OTHERS && jQuery('.info_blog:visible').length > 0) {

                return _self.data.pageInfo.sections[2];
            }
            return '';
        },
        trigger: "ready",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.search.keyword",
        details: "Keyword de busqueda",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.SEARCH) {
                return _self.utils.getParameterByName('search_query');
            }
            return '';

        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.search.orderBy",
        details: "Tipo de orden de la página de resultados",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.SEARCH) {
                return _self.utils.getParameterByName('orderby');
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.filters",
        details: "Almacena los filtros aplicados sobre una página de tipo Categoria. Es un array de este tipo [[filtro,valor],[filtro,valor]]",
        extractor: function(pageType) {
            var _self = this;
            //filters solo está definida en la página de categoria
            if (window.filters) {
                var filters = [];
                jQuery('#enabled_filters li').each(function() {
                    var productFilter = jQuery(this).text().split(':');
                    if (productFilter.length > 1) {
                        productFilter[0] = _self.utils.cleanText(productFilter[0]);
                        productFilter[1] = _self.utils.cleanText(productFilter[1]);
                        filters.push(productFilter);
                    }
                });
                return filters;
            }
            return [];
        },
        trigger: ["ready", "user.filterHashChange"],
        obligatory: true,
        type: "string"
    }, {
        name: "ecommerce.productDetail",
        details: "Información del producto que se encuentra actualmente en página",
        extractor: function(pageType) {
            var _self = this;
            if (jQuery('#product_reference').length > 0) {

                var productName = _self.utils.cleanText(jQuery('h1[itemprop="name"]').text());
                var productBrand = 'amarsupiel';
                var productCategory = _self.utils.getProductCategory(_self.data.pageInfo.url);
                var productVariant = _self.utils.getProductVariant(_self.data.pageInfo.url);
                var productPrice = parseFloat(jQuery('#our_price_display').attr('content'));
                var productAvailability = jQuery('#availability_value.label-warning:visible').length == 0;

                return {
                    name: productName,
                    brand: productBrand,
                    category: productCategory,
                    variant: productVariant,
                    price: productPrice,
                    available: productAvailability
                };
            }

            return '';

        },
        trigger: ["ready", "productHashChange"],
        obligatory: true,
        type: "string"
    }, {
        name: "ecommerce.productList",
        details: "Información de los productos que se muestran en pantalla",
        extractor: function(pageType) {
            var _self = this;

            function getProductInfo(productElement, index) {
                var productName = _self.utils.cleanText(productElement.find('[itemprop="name"]').text());
                var productBrand = 'amarsupiel';
                var productURL = productElement.find('a:first').attr('href');
                var productCategory = productURL && _self.utils.getProductCategory(productURL);
                var productVariantURL = productElement.find('.product_img_link').attr('href');
                var productVariant = productVariantURL && _self.utils.getProductVariant(productVariantURL);
                var productPrice = _self.utils.cleanPrice(productElement.find('.product-price').text());
                var position = index;
                var list = _self.data.pageInfo.pageType;
                return {
                    name: productName,
                    brand: productBrand,
                    category: productCategory,
                    variant: productVariant,
                    price: productPrice,
                    position: position,
                    list: list
                };
            };
            var productArray = [];
            jQuery('.product-container:visible').each(function(index) {
                index++;
                productArray.push(getProductInfo(jQuery(this), index));
            });

            return productArray;
        },
        trigger: "ready",
        obligatory: true,
        type: "string"
    }, {
        name: "ecommerce.cart",
        details: "Información de los productos que se encuentran en el carrito actual",
        extractor: function(cartJSON) {
            var _self = this;
            if (cartJSON) {
                return cartJSON;
            } else {
                var productArray = [];
                if (jQuery('.shopping_cart .products dt').length == 0) {
                    productArray = sessionStorage.getItem('tagManagerCart') ? JSON.parse(sessionStorage.getItem('tagManagerCart')) : [];
                } else {
                    jQuery('.shopping_cart .products dt').each(function() {
                        var productReference = jQuery(this).find('.product-name a');
                        var productBrand = 'amarsupiel';
                        var productName = _self.utils.cleanText(productReference.attr('title'));
                        var productURL = productReference.attr('href');
                        var productCategory = _self.utils.getProductCategory(productURL);
                        var productVariant = _self.utils.getProductVariant(productURL);
                        var productQuantity = parseInt(jQuery(this).find('.product-name .quantity').text());
                        var productPrice = _self.utils.cleanPrice(jQuery(this).find('.price').text()) / productQuantity;
                        productArray.push({
                            name: productName,
                            brand: productBrand,
                            category: productCategory,
                            variant: productVariant,
                            price: productPrice,
                            quantity: productQuantity
                        })
                    });
                    sessionStorage.setItem('tagManagerCart', JSON.stringify(productArray));

                }
                return productArray;
            }
        },
        trigger: ["ready", "cartChanged"],
        obligatory: true,
        type: "string"
    }, {
        name: "ecommerce.checkout.step",
        details: "Información del paso en el que se encuentra el usuario",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.PURCHASE) {
                var stepArray = ['.first', '.third', '.four', '.last'];
                for (var i = stepArray.length - 1; i >= 0; i--) {
                    if (jQuery('.step_current' + stepArray[i]).length > 0) {
                        if (document.location.pathname.indexOf('/confirmacion-pedido') > -1) {
                            return 5;
                        }
                        return i + 1;
                    }
                }

            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    },{
        name: "ecommerce.checkout.orderId",
        details: "Información ID de compra",
        extractor: function(checkoutStep) {
            var _self = this;
            if (checkoutStep == 5) {
                if(jQuery('[href*="id_order="]').length > 0){
                    return jQuery('[href*="id_order="]').attr('href').match(/id_order=[a-zA-Z1-9]+(&|$)/)[0].replace(/(id_order=|&)/g,'');
                }else{
                    return _self.utils.getParameterByName('id_order');
                }
                return Math.round(Math.random()*10000000);

            }
            return '';
        },
        trigger: "dataFilled.ecommerce.checkout.step",
        obligatory: true,
        type: "string"
    },{
        name: "ecommerce.checkout.revenue",
        details: "Coste total del carrito actual",
        extractor: function(checkoutStep) {
            var _self = this;
            if (checkoutStep == 4) {
                if(jQuery('#total_price').length > 0){
                    var revenue = _self.utils.cleanPrice(jQuery('#total_price').text());
                    sessionStorage.setItem('tagManagerCartRevenue',revenue);
                    return revenue;
                }else{
                    return sessionStorage.getItem('tagManagerCartRevenue');
                }
                

            }
            
            return sessionStorage.getItem('tagManagerCartRevenue');
        },
        trigger: "dataFilled.ecommerce.checkout.step",
        obligatory: true,
        type: "string"
    },{
        name: "ecommerce.checkout.shipping",
        details: "Coste de los gastos de envío",
        extractor: function(checkoutStep) {
            var _self = this;
            if (checkoutStep == 4) {
                if(jQuery('#total_shipping').length > 0){
                    var shipping = _self.utils.cleanPrice(jQuery('#total_shipping').text());
                    sessionStorage.setItem('tagManagerCartShipping',shipping);
                    return shipping;
                }else{
                    return sessionStorage.getItem('tagManagerCartShipping');
                }
                

            }
            
            return sessionStorage.getItem('tagManagerCartShipping');
        },
        trigger: "dataFilled.ecommerce.checkout.step",
        obligatory: true,
        type: "string"
    },{
        name: "ecommerce.checkout.tax",
        details: "Impuestos sobre el carrito actual",
        extractor: function(checkoutStep) {
            var _self = this;
            if (checkoutStep == 4) {
                if(jQuery('#total_price').length > 0){
                    var revenue = _self.utils.cleanPrice(jQuery('#total_price').text());
                    var tax = revenue * 0.21;
                    sessionStorage.setItem('tagManagerCartTax',tax);
                    return tax;
                }else{
                    return sessionStorage.getItem('tagManagerCartTax');
                }
                

            }

            return sessionStorage.getItem('tagManagerCartTax');
        },
        trigger: "dataFilled.ecommerce.checkout.step",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.referrer",
        details: "Contiene el referente a la página actual",
        extractor: function() {
            return document.referrer;
        },
        trigger: "preloader",
        type: "string"
    }, {
        name: "pageInfo.url",
        details: "Contiene la URL de la página actual",
        extractor: function() {
            return document.location.href;
        },
        trigger: "preloader",
        type: "string"
    }],

    debug: true,
    utils: [{
        name: "getCookie",
        util: function(name) {

            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    }, {
        name: "setCookie",
        util: function(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        }
    }, {
        name: "urlParser",
        util: function(url) {
            var urlSlashs = url;
            if (!url.match(/(\/\?|\/$)/)) {
                urlSlashs = url.indexOf('?') > 0 ? url.replace('?', '/?') : (url + "/");
            }
            var parser = document.createElement('a');
            parser.href = urlSlashs;
            return parser;
        }
    }, {
        name: "dashToSpace",
        util: function(str) {
            return str.replace(/\-/g, ' ');
        }
    }, {
        name: "trim",
        util: function(str) {
            var strNoBreakLines = str.replace(/^(\r\n)|(\n)/g, ' ');
            var strNoSpaces = strNoBreakLines.replace(/^\s\s*/g, '').replace(/\s\s*$/g, '').replace(/\s(\s)+/g, ' ');

            return strNoSpaces;

        }
    }, {
        name: "removeAccents",
        util: function(str) {

            var a = str;

            a = a.replace(/Á/g, "A");
            a = a.replace(/á/g, "a");
            a = a.replace(/À/g, "A");
            a = a.replace(/à/g, "a");
            a = a.replace(/Â/g, "A");
            a = a.replace(/â/g, "a");
            a = a.replace(/É/g, "E");
            a = a.replace(/é/g, "e");
            a = a.replace(/É/g, "E");
            a = a.replace(/è/g, "e");
            a = a.replace(/Ê/g, "E");
            a = a.replace(/ê/g, "e");
            a = a.replace(/Í/g, "I");
            a = a.replace(/í/g, "i");
            a = a.replace(/Ì/g, "I");
            a = a.replace(/ì/g, "i");
            a = a.replace(/Î/g, "I");
            a = a.replace(/î/g, "i");
            a = a.replace(/Ó/g, "O");
            a = a.replace(/ó/g, "o");
            a = a.replace(/Ò/g, "O");
            a = a.replace(/ò/g, "o");
            a = a.replace(/Ô/g, "O");
            a = a.replace(/ô/g, "o");
            a = a.replace(/Ú/g, "U");
            a = a.replace(/ú/g, "u");
            a = a.replace(/Ù/g, "U");
            a = a.replace(/ù/g, "u");
            a = a.replace(/Û/g, "U");
            a = a.replace(/û/g, "u");
            a = a.replace(/Ü/g, "U");
            a = a.replace(/ü/g, "u");
            a = a.replace(/Ñ/g, "N");
            a = a.replace(/ñ/g, "n");
            a = a.replace(/…/g, "");
            a = a.replace(/\?/g, "");
            a = a.replace(/¡/g, "");
            a = a.replace(/!/g, "");
            a = a.replace(/¿/g, "");
            a = a.replace(/“/g, "");
            a = a.replace(/”/g, "");
            a = a.replace(/…/g, " ");
            a = a.replace(/€/g, "euros");
            a = a.replace(/´/g, "");
            a = a.replace(/</g, "");
            a = a.replace(/\)/g, "");
            a = a.replace(/ /g, " ");

            return a;
        }
    }, {
        name: "cleanText",
        util: function(str) {
            var _self = this;
            var strTransform = str.toLowerCase();
            strTransform = _self.utils.removeAccents(strTransform);
            strTransform = _self.utils.trim(strTransform);
            return strTransform;
        }
    }, {
        name: "cleanPrice",
        util: function(price) {
            var _self = this;
            var priceNormalized = parseFloat(price.replace(',', '.'));
            return isNaN(priceNormalized) ? '' : priceNormalized;
        }
    }, {
        name: "getParameterByName",
        util: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }, {
        name: "getProductCategory",
        util: function(productURL) {
            var _self = this;
            productURL = _self.utils.urlParser(productURL);
            var productPath = productURL.pathname;
            var productCategory = productPath.split('/')[1];
            if (productCategory) {
                var categorySelector = '#block_top_menu [href*="' + productCategory + '"]'
                return _self.utils.cleanText(jQuery(categorySelector).text());
            }
            return '';
        }
    }, {
        name: "getProductVariant",
        util: function(productURL) {
            var _self = this;
            productURL = _self.utils.urlParser(productURL);
            var productHash = productURL.hash.replace("#", "") || "default";
            return productHash;
        }
    }, {
        name: "getYoutubeId",
        util: function(youtubeURL) {
            var _self = this;
            if (youtubeURL && youtubeURL.indexOf('youtube.com/embed/') > -1) {
                return youtubeURL.match(/embed\/.*\?/)[0].replace(/(embed\/|\?)/g, '');
            } else {
                return "no youtube id";
            }
        }
    }, {
        name: "scriptLoad",
        util: function(srcScript, callback) {
            var argumentos = Array.prototype.slice.call(arguments);
            var script = document.createElement('script');
            script.src = srcScript;
            var head = document.getElementsByTagName('head')[0];
            var done = false;
            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                    done = true;
                    if (typeof(callback) == "function") {
                        var argumentosSobrantes = 2;
                        argumentos.splice(0, argumentosSobrantes);
                        callback.apply(window, argumentos);
                    }
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                }
            };
            head.appendChild(script);
        }
    }]
};

window.tagManager = new TagManager(tagManagerSettings);
