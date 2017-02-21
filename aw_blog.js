/* jshint -W100 */
var tagManagerSettings = {

    tealium: true,
    tealiumObject: window.utag,
    // ----------------------------------------------------------- //
    //                          EVENTOS                            //
    // ----------------------------------------------------------- //
    events: [{
        name: "scroll",
        details: "Evento que se dispara cuando se hace scroll hasta ciertos milestones (por defecto 25, 50, 27 y 100% de la página)",
        listener: function() {
            var _self = this;
            window.progress = -1;
            jQuery(window).scroll(function() {
                var wintop = jQuery(window).scrollTop();
                var docheight = jQuery(document).height();
                var winheight = jQuery(window).height();
                var percent = (wintop / (docheight - winheight)) * 100;

                var ceilPercent = Math.ceil(percent);
                if (ceilPercent > progress) {
                    progress = ceilPercent;
                    _self.emit('scroll', 'scroll', ceilPercent, _self.data.pageInfo.pageName);
                }
            });
        },
        trigger: "ready"
    }, {
        name: "adBlockChecker",
        details: "Evento que indica que se ha recibido la información relativa a la red del usuario",
        listener: function() {
            var _self = this;
            var test = document.createElement('div');
            test.innerHTML = '&nbsp;';
            test.className = 'adsbox';
            document.body.appendChild(test);
            window.setTimeout(function() {
                if (typeof ga == "function") {
                    var adblockExists = test.offsetHeight === 0 ? 'adblock presente' : 'adblock no presente';
                    _self.emit("adBlockChecker", adblockExists);
                    test.remove();
                }
            }, 1000);
        },
        trigger: "ready"
    }, {
        name: "user.coopVideo",
        details: "Evento que se genera cuando se hace clic sobre el video Divisadero Empowering Digital through DATA",
        params: ["eventType", "video name", "pageName"],
        listener: function(pageType) {
            var _self = this;

            jQuery('.sidebar a[href*="youtube.com"]').on('click', function() {
                if (jQuery(this).attr('href')) {
                    _self.emit("user.coopVideo", "video click", _self.utils.getYoutubeId(jQuery(this).attr('href')), _self.data.pageInfo.pageName);
                }
            });
        },
        trigger: "ready"
    }, {
        name: "fingerprintAvailable",
        details: "evento que se ejecuta al inicio para obtener el fingerprint",
        params: ["eventType", "video name", "pageName"],
        listener: function(pageType) {
            var _self = this;
            new Fingerprint2().get(function(result, components) {
                _self.emit("fingerprintAvailable", result);
            });
        },
        trigger: "ready"
    }, {
        name: "user.emailChanged",
        details: "Se dispara cuando otro evento quiere cambiar el email asociado al userId",
        params: ["eventType", "email", "pageName"],
        listener: function(email, eventType) {
            var _self = this;
            var validEmail = _self.utils.checkEmail(email);
            if (validEmail) {
                var cemail = btoa(email);
                _self.log("email changed: " + email);
                localStorage.setItem('userId', cemail);
                eventType = eventType || 'unknown';
                _self.emit("user.emailChanged", eventType, _self.data.pageInfo.pageName, cemail);
            }
        },
        trigger: ["comment", "subscribeBlog"]
    }, {
        name: "user.subscribe.staisharp",
        details: "Evento que se genera cuando se hace clic sobre el botón de suscripción a la newsletter de Stay Sharp",
        params: ["eventType", "pageName"],
        listener: function(pageType) {
            var _self = this;
            jQuery('.sidebar div.content.cf a').on('click', function() {
                if (jQuery(this).attr('href')) {
                    _self.emit("user.subscribe.staisharp", "subscribe staysharp click", _self.data.pageInfo.pageName);
                }
            });
        },
        trigger: "ready"
    }, {
        name: "subscribeBlog",
        details: "Evento que se genera cuando se hace clic sobre el botón de suscripción al blog de Analitica web",
        params: ["eventType", "userEmail", "pageName"],
        listener: function(pageType) {
            var _self = this;
            jQuery('form#mc4wp-form-1').on('submit', function() {
                var email = jQuery(this).find('input.email').val();
                _self.emit("subscribeBlog", email, "suscripcion al blog");
            });
        },
        trigger: "ready"
    }, {
        name: "comment",
        details: "Usuario hace click en enviar un comentario",
        params: ["eventType", "pageName"],
        listener: function(pageType) {
            var _self = this;
            jQuery('form#commentform').on('submit', function() {
                var email = jQuery(this).find('input#email').val();
                _self.emit("comment", email, "comentario en el blog");
            });
        },
        trigger: "ready"

    }, {
        name: "config.subscribeId",
        details: "Evento que detecta si se tiene el email en la dirección como parámetro",
        listener: function(pageType) {
            var _self = this;
            var buuid = _self.utils.getParameterByName("buuid");
            var euuid = _self.utils.getParameterByName("euuid");
            var email = atob(buuid) || euuid;
            if (email) {
                _self.log("email por parametro" + email);
                localStorage.setItem('userId', email);
                _self.emit("config.subscribeId", email);
            }
        },
        trigger: "preloader",
    }, {
        name: "socialSharing",
        details: "Usuario pulsa sobre el botón de compartir en las redes sociales",
        params: ["socialNetwork", "pageName"],
        listener: function(pageType) {
            var _self = this;
            var socialNetwork = [{
                name: "twitter",
                link: "twitter.com"
            }, {
                name: "rss",
                link: "/feed/"
            }, {
                name: "youtube",
                link: "youtube.com/channel"
            }, {
                name: "linkedin",
                link: "linkedin.com"
            }, {
                name: "facebook",
                link: "facebook.com"
            }, {
                name: "google+",
                link: "plus.google.com"
            }, ];
            var closestSelectors = [{
                placement: function() {
                    return "header";
                },
                selector: ".top-bar",
            }, {
                placement: function(element) {
                    var postTitle = _self.utils.cleanText(element.closest('article').find('.post-title').text());
                    return postTitle;
                },
                selector: "article",
            }, {
                placement: function() {
                    return "coorporative video";
                },
                selector: "#bunyad-widget-about-2",
            }, ];
            for (var j = 0; j < socialNetwork.length; j++) {
                jQuery("a[href*='" + socialNetwork[j].link + "']").each(function() {
                    var $socialButton = jQuery(this);
                    for (var i = 0; i < closestSelectors.length; i++) {
                        if ($socialButton.closest(closestSelectors[i].selector).length > 0) {
                            var placement = closestSelectors[i].placement($socialButton);
                            var network = socialNetwork[j].name;
                            $socialButton.click((function(network, placement) {
                                return function() {
                                    _self.emit("socialSharing", network, placement, _self.data.pageInfo.pageName);
                                };
                            })(network, placement));
                        }
                    }
                });
            }
        },
        trigger: "ready"
    }, {
        name: "postClick",
        details: "Evento que se genera cuando se hace clic sobre la impresion de un post",
        params: ["postInfo"],
        listener: function() {
            var _self = this;
            var selector = _self.data.pageInfo.pageType === 'blog-post' ? 'article.grid-box:not(.the-post,.slick-cloned)' : 'article';
            jQuery(selector).on('mousedown', '.post-title a,.read-more a', function(e) {
                var title = _self.utils.cleanText(jQuery(this).closest('article').find('.post-title').text());
                var postInfo = _self.utils.find(_self.data.pageInfo.postImpressions, { title: title });
                _self.emit("postClick", postInfo);
            });
        },
        trigger: "ready"
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
        name: "geoData",
        details: "Evento que se produce cuando se recibe respuesta del servicio de geoposicionamiento en base a IP",
        listener: function() {
            var _self = this;
            jQuery.getJSON("http://ip-api.com/json", function(geoData) {
                _self.emit("geoData", geoData);
            });
        },
        trigger: "load"
    }, {
        name: "uaParser",
        details: "Evento que se produce cuando se optinen los datos relativos a los elementos que costituyen el User-Agent",
        listener: function() {
            var _self = this;
            var parser = new UAParser();
            _self.emit("uaParser", parser.getResult());

        },
        trigger: "ready"
    }, {
        name: "whoisReady",
        details: "Evento que indica que se ha recibido la información relativa a la red del usuario",
        listener: function() {
            var _self = this;
            jQuery.getJSON("http://130.211.101.65:8001/api/whois", function(whoisData) {
                _self.emit("whoisReady", whoisData);
            });
        },
        trigger: "ready"
    }],

    // ----------------------------------------------------------- //
    //                          DATAS                              //
    // ----------------------------------------------------------- //
    data: [{
        name: "configuration.gaAccount.fingerprint",
        details: "Contiene el ID de la cuenta de Google Analytics a la que se va a hacer el envío con el userId como fingerprint",
        extractor: function() {
            return "UA-22058072-1";
        },
        trigger: 'preloader',
        obligatory: true
    }, {
        name: "configuration.gaAccount.email",
        details: "Contiene el ID de la cuenta de Google Analytics a la que se va a hacer el envío con el userId como email",
        extractor: function() {
            return "UA-22058072-9";
        },
        trigger: 'preloader',
        obligatory: true
    }, {
        name: "configuration.tealiumEnvironment",
        details: "Contiene el perfil de Tealium",
        extractor: function() {
            return jQuery('script[src*="utag.js"').prop('src').split('/')[6];
        },
        trigger: "ready",
        obligatory: true
    }, {
        name: "userInfo.ids.fingerprint",
        details: "Fingerprint del usuario basado en su configuración del navegador",
        extractor: function(fingerprint) {
            return fingerprint;
        },
        trigger: "fingerprintAvailable",
        obligatory: true
    }, {
        name: "userInfo.ids.email",
        details: "Email del usuario introducido en algún formulario",
        extractor: function() {
            return localStorage.getItem('userId') || '';
        },
        trigger: ["ready", "user.emailChanged"],
        obligatory: true
    }, {
        name: "userInfo.ids.tealiumIqId",
        details: "Es el id usado por Tealium IQ para identificar el usuario o el parámetro \"tuuid\" pasado como parámetro (tiene prioridad el parámetro)",
        extractor: function() {
            var _self = this;
            var tuuidParameter = _self.utils.getParameterByName('tuuid');
            if (tuuidParameter) {
                _self.utils.setCookie('tuuid', tuuidParameter, 30);
                return tuuidParameter;
            } else if (_self.utils.getCookie("tuuid")) {
                return _self.utils.getCookie('tuuid');
            } else {
                return _self.utils.getCookie("utag_main").match(/v_id:[0-9a-zA-Z]+\$/)[0].replace(/(v_id:|\$)/g, '');
            }
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.ids.tealiumAsId",
        details: "Es el id usado por Tealium Audience Stream para identificar el usuario a través de los diferentes dominios",
        extractor: function() {
            return utag.data._t_visitor_id;
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "configuration.pathArray",
        details: "Almacena el path de la URL en un Array. Este Array contiene las cadenas de texto en minisculas y los guiones traducidos a espacios",
        extractor: function() {
            var _self = this;
            var currentPathArray = document.location.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
            if (currentPathArray[0] === '') {
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
        name: "constants.pageType.CATEGORY",
        details: "Constante que almacena el tipo de página CATEGORY",
        extractor: function() {
            return "blog-category";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.AUTHOR",
        details: "Constante que almacena el tipo de página autor",
        extractor: function() {
            return "blog-author";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.POST",
        details: "Constante que almacena el tipo de página post",
        extractor: function() {
            return "blog-post";
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
        name: "userInfo.geo.country",
        details: "Pais asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.country;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.countryCode",
        details: "Código del pais asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.countryCode;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.region",
        details: "Código de la provincia asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.region;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.regionName",
        details: "Nombre de la provincia asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.regionName;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.city",
        details: "Nombre de la ciudad asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.city;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.zip",
        details: "Código postal asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.zip;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.lat",
        details: "Latitud asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.lat;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.long",
        details: "Longitud asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.lon;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.timezone",
        details: "Zona horaria asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.timezone;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.geo.isp",
        details: "ISP asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.isp;
        },
        trigger: "geoData",
        type: "string"
    }, {
        name: "userInfo.network.netname",
        details: "Resultado de nombre de red extraido a partir del servicio whois",
        extractor: function(whoisData) {
            return whoisData.netname;
        },
        trigger: "whoisReady",
        type: "string"
    }, {
        name: "userInfo.network.description",
        details: "Descripción de la red usada por el usuario extraida a partir del servicio whois",
        extractor: function(whoisData) {
            var networkDescription = whoisData.descr.length > 0 ? whoisData.descr.join(":") : "";
            return networkDescription;
        },
        trigger: "whoisReady",
        type: "string"
    }, {
        name: "userInfo.device.model",
        details: "Modelo de dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.model;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.device.type",
        details: "Tipo de dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.type;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.device.vendor",
        details: "Fabricante del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.vendor;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.os.name",
        details: "Nombre del Sistema Operativo del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.os.name;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.os.version",
        details: "Version del Sistema Operativo del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.os.version;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.engine.name",
        details: "Nombre del motor web que usa el navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.engine.name;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.engine.version",
        details: "Versión del motor web que usa el navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.engine.version;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.browser.name",
        details: "Nombre del navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.browser.name;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.browser.version",
        details: "Versión del navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.browser.version;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "userInfo.cpu.architecture",
        details: "Arquitectura de CPU del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.cpu.architecture;
        },
        trigger: "uaParser",
        type: "string"
    }, {
        name: "pageInfo.pageType",
        details: "Contiene la información relativa al tipo de página: [home,category,product,purchase,others]",
        extractor: function() {
            var _self = this;
            //Comprobamos si estamos en el path-root sin parametros
            var isHome = function() {
                return (document.location.pathname === "/" && document.location.search === "");
            };
            //Comprobamos si solo se hace el display de un post
            var isPost = function() {
                return jQuery('body.single-post').length > 0;
            };
            //Comprobamos si existe el grid de articulos
            var isCategory = function() {
                return jQuery('body.category').length > 0;
            };
            //Comprobamos si existe el componente asociado al autor
            var isAuthor = function() {
                return jQuery('body.author').length > 0;
            };
            //
            var isSearch = function() {
                return jQuery('body.search').length > 0;
            };

            if (isHome()) {

                return _self.data.constants.pageType.HOME;

            } else if (isPost()) {

                return _self.data.constants.pageType.POST;

            } else if (isCategory()) {

                return _self.data.constants.pageType.CATEGORY;

            } else if (isAuthor()) {

                return _self.data.constants.pageType.AUTHOR;

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
            var sectionArray = [_self.data.pageInfo.pageType];
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.HOME) {
                return sectionArray;
            } else if (_self.data.pageInfo.pageType == _self.data.constants.pageType.SEARCH) {

                var searchKeyword = _self.utils.getParameterByName('s');
                sectionArray.push(searchKeyword);
                var currentPage = _self.utils.getCurrentPage() || 1;
                sectionArray.push('page-' + currentPage);

                return sectionArray;
            } else if (_self.data.pageInfo.pageType == _self.data.constants.pageType.CATEGORY) {

                var category = _self.utils.getCurrentCategory();
                sectionArray.push(category);
                var currentPage = _self.utils.getCurrentPage() || 1;
                sectionArray.push('page-' + currentPage);
                return sectionArray;
            } else if (_self.data.pageInfo.pageType == _self.data.constants.pageType.AUTHOR) {

                var author = _self.utils.getCurrentAuthor();
                sectionArray.push(author);
                var currentPage = _self.utils.getCurrentPage() || 1;
                sectionArray.push('page-' + currentPage);
                return sectionArray;
            } else if (_self.data.pageInfo.pageType == _self.data.constants.pageType.POST) {

                var category = _self.utils.getPostCategory();
                sectionArray.push(category);
                var postTitle = _self.utils.getPostTitle();
                sectionArray.push(postTitle);
                return sectionArray;
            } else {

                for (var i = 0; i < _self.data.configuration.pathArray.length; i++) {
                    sectionArray.push(_self.data.configuration.pathArray[i].replace(/(\.html|\.php)/g, ''));
                }

                var currentPage = _self.utils.getCurrentPage() || 1;
                sectionArray.push('page-' + currentPage);
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
        name: "pageInfo.post.title",
        details: "Contiene el titulo del post",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {
                return _self.utils.getPostTitle();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.category",
        details: "Contiene la categoria del post que se está visualizando",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {
                return _self.utils.getPostCategory();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.tags",
        details: "Contiene los tags del post que se está visualizando",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {

                return _self.utils.getPostTags();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.date",
        details: "Contiene la fecha de publicación del post que se está visualizando",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {

                return _self.utils.getPostDate();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.author",
        details: "Contiene el autor del post que se está visualizando",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {

                return _self.utils.getPostAuthor();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post.readingTime",
        details: "Contiene el tiempo de lectura aproximado en minutos del post que se está visualizando",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.POST) {

                return _self.utils.getPostReadingTime();
            }
            return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.postImpressions",
        details: "Contiene el listado de post que se mostrando",
        extractor: function() {
            var _self = this;
            var postImpressions = [];
            var selector = _self.data.pageInfo.pageType === 'blog-post' ? 'article.grid-box:not(.the-post,.slick-cloned)' : 'article';
            jQuery(selector).each(function(index) {
                index++;
                postImpressions.push(_self.utils.getPostImpression(jQuery(this), index));
            });
            return postImpressions;
        },
        trigger: "ready",
        obligatory: true,
        type: "array"
    }, {
        name: "pageInfo.search.keyword",
        details: "Keyword de busqueda",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.SEARCH) {
                var keyword = _self.utils.getParameterByName('s');
                _self.log('extraccion de palabra de busqueda: ' + keyword);
                return keyword;
            } else return '';
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.search.resultNum",
        details: "Almacena el numero de resultados disponibles para la keyword",
        extractor: function(pageType) {
            var _self = this;
            var numResults = 0;
            if (pageType == _self.data.constants.pageType.SEARCH) {
                numResults = jQuery('span.info strong').text();
            }
            return numResults;
        },
        trigger: "loadRules.pageType.*",
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
    }, {
        name: "userInfo.adblock",
        details: "Recoge true si el usuario tiene adblock activado y false si no",
        extractor: function(adblockState) {
            var _self = this;
            return adblockState;
        },
        trigger: "adBlockChecker",
        obligatory: true,
        type: "string"
    }],

    // ----------------------------------------------------------- //
    //                          DEBUG                              //
    // ----------------------------------------------------------- //
    debug: false,

    // ----------------------------------------------------------- //
    //                          UTILS                              //
    // ----------------------------------------------------------- //
    utils: [{
        name: "uid",
        util: function() {
            return Math.floor((1 + Math.random()) * 0x100000000).toString();
        }
    }, {
        name: "getCookie",
        util: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    }, {
        name: "setCookie",
        util: function(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
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
        name: "getParameterByName",
        util: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }, {
        name: "getCurrentPage",
        util: function() {
            var _self = this;
            if (document.location.pathname.indexOf('/page/') > -1) {
                var indexOfPage = _self.data.configuration.pathArray.indexOf('page');
                return indexOfPage > -1 ? _self.data.configuration.pathArray[indexOfPage + 1] : false;
            }
            return false;
        }
    }, {
        name: "getCurrentCategory",
        util: function() {
            var _self = this;
            var inPageCategory = _self.utils.cleanText(jQuery('.category .title-ribbon').text());
            var urlCategory = false;
            if (document.location.pathname.indexOf('/category/') > -1) {
                var indexOfCategory = _self.data.configuration.pathArray.indexOf('category');
                urlCategory = indexOfCategory > -1 ? _self.data.configuration.pathArray[indexOfCategory + 1] : false;
            }
            return inPageCategory || urlCategory || "unknown";
        }
    }, {
        name: "getCurrentAuthor",
        util: function() {
            var _self = this;
            var inPageAuthor = _self.utils.cleanText(jQuery('.author .archive-head .title').text());
            var urlAuthor = false;
            if (document.location.pathname.indexOf('/author/') > -1) {
                var indexOfAuthor = _self.data.configuration.pathArray.indexOf('author');
                urlAuthor = indexOfAuthor > -1 ? _self.data.configuration.pathArray[indexOfAuthor + 1] : false;
            }
            return inPageAuthor || urlAuthor || "unknown";
        }
    }, {
        name: "getPostCategory",
        util: function() {
            var _self = this;
            var postCategory = _self.utils.cleanText(jQuery('.the-post .post-cat').text());
            return postCategory || "unknown";
        }
    }, {
        name: "getPostTitle",
        util: function() {
            var _self = this;
            var postTitle = _self.utils.cleanText(jQuery('.the-post .post-title').text());
            return postTitle || "unknown";
        }
    }, {
        name: "getPostTags",
        util: function() {
            var _self = this;
            var tagsArray = [];
            jQuery('.post-tags a').each(function() {
                tagsArray.push(_self.utils.cleanText(jQuery(this).text()));
            });

            return tagsArray;
        }
    }, {
        name: "getPostDate",
        util: function() {
            var _self = this;

            var postTitle = _self.utils.cleanText(jQuery('.the-post .post-date').text());

            return postTitle;
        }
    }, {
        name: "getPostAuthor",
        util: function() {
            var _self = this;

            var postTitle = _self.utils.cleanText(jQuery('.author-box .author').text());

            return postTitle;
        }
    }, {
        name: "getPostImpression",
        util: function(postNode, index) {
            var _self = this;
            var postData = {
                title: _self.utils.cleanText(postNode.find('.post-title').text()),
                category: _self.utils.cleanText(postNode.find('.post-cat').text()),
                date: _self.utils.cleanText(postNode.find('.post-date').text()),
                position: index,
                list: _self.data.pageInfo.pageType
            };

            return postData;
        }
    }, {
        name: "getPostReadingTime",
        util: function() {
            var _self = this;
            var readingTimeText = jQuery('.the-post .estimated-time').text().match(/\d+/g);
            var readingTime = readingTimeText ? readingTimeText[0] : false;
            return readingTime;
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
        name: "checkEmail",
        util: function(email) {
            var emailRegexp = new RegExp(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
            return emailRegexp.test(email);
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
