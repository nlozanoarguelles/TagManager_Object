//Ejemplo de objeto de configuración
var tagManagerSettings = {

    events: [{
        name: "blogPost",
        details: "Evento que se produce cuando una página vinculada a un post",
        listener: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType === _self.data.constants.pageType.TYPE_BLOG && jQuery('.blog_single').length > 0) {
                _self.emit("blogPost");
            }

        },
        trigger: "ready"
    }, {
        name: "gaIdAvailable",
        details: "Evento que se produce cuando el objeto ga devuelve un tracker que permite extraer el id",
        listener: function() {
            var _self = this;
            var gaIdCookie = _self.utils.getCookie('_gaid');
            if (gaIdCookie) {
                _self.emit("gaIdAvailable", gaIdCookie);
            } else {
                if (typeof ga != "undefined") {

                    ga(function(tracker) {
                        utag_data.gaIdCookie = tracker.get('clientId');
                        setCookie('_gaid', tracker.get('clientId'), 30);
                        _self.emit("gaIdAvailable", gaIdCookie);
                    });
                }
            }
        },
        trigger: "load"
    },{
        name: "fingerprintAvailable",
        details: "Evento que se produce cuando el objeto Fingerprint2 es capaz de generar un fingerprint del usuario",
        listener: function() {
            var _self = this;
            new Fingerprint2().get(function(result, components){
                _self.emit("fingerprintAvailable", result, components);
            });
        },
        trigger: "ready"
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
    },
    {
        name: "asDataLoaded",
        details: "Evento que se ejecuta cuando se recibe la respuesta del servidor de Audience Stream (AS) con los datos del usuario. Permite saber cuando se han integrado los datos en el objeto utag.data",
        listener: function(){
            var _self = this;
            var asInterval = setInterval(function(){
                if(document.querySelector('[src*="//visitor-service-"]')){
                    clearInterval(asInterval);
                    _self.emit("asDataLoaded");
                }
            },100);
        },
        trigger: "ready"
    },
    {
        name: "whoisReady",
        details: "Evento que indica que se ha recibido la información relativa a la red del usuario",
        listener: function(){
            var _self = this;
            jQuery.getJSON("http://130.211.101.65:8001/api/whois", function(whoisData) {
                _self.emit("whoisReady", whoisData);
            });
        },
        trigger: "ready"
    }
    ],

    data: [{
        name: "configuration.tealiumEnviroment",
        details: "Almacena el entorno de tealium utilizado",
        extractor: function() {
            var _self = this;
            var tealiumEnviroment = _self.utils.getTealiumEnviroment();
            return tealiumEnviroment || null;
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
        name: "constants.pageType.TYPE_HOME",
        details: "Constante que almacena el tipo de página Home",
        extractor: function() {
            return "home";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.TYPE_LANDING",
        details: "Constante que almacena el tipo de página Landing",
        extractor: function() {
            return "landing";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.TYPE_MAIN_SECTION",
        details: "Constante que almacena el tipo de página Sección Principal. Se considera sección principal todas aquellas que aparecen en la cabecera de la página",
        extractor: function() {
            return "seccion principal";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.TYPE_BLOG",
        details: "Constante que almacena el tipo de página Blog. Todas las páginas que van dentro del blog de actualidad",
        extractor: function() {
            return "blog actualidad";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.pageType",
        details: "Contiene la información relativa al tipo de página: [home,seccion principal,blog actualidad,landing]",
        extractor: function() {
            var _self = this;
            //Comprobamos si estamos en el path-root
            var isHome = function() {
                    return document.location.pathname === "/";
                }
                //Comprobamos si la url actual pertenece a una de las de la cabecera
            var isMainSection = function() {
                    var mainURLsArray = jQuery('.header_top_bottom_holder a:not([hreflang*="e"])'),
                        mainURLsLength = mainURLsArray.length;
                    for (var i = 0; i < mainURLsLength; i++) {
                        if (_self.utils.urlParser(mainURLsArray[i].href) == document.location.href) {
                            return true;
                        }
                    }
                    return false;
                }
                //Comprobamos si está presente el slider de publicaciones
            var isBlogActualidad = function() {
                var blogDetectElement = jQuery('.widget_wp_posts_carousel');
                return blogDetectElement.length > 0;
            }

            if (isHome()) {

                return _self.data.constants.pageType.TYPE_HOME;

            } else if (isMainSection()) {

                return _self.data.constants.pageType.TYPE_MAIN_SECTION;

            } else if (isBlogActualidad()) {

                return _self.data.constants.pageType.TYPE_BLOG;

            } else {

                return _self.data.constants.pageType.TYPE_LANDING;
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
            switch (_self.data.pageInfo.pageType) {
                case _self.data.constants.pageType.TYPE_HOME:
                    return [_self.data.constants.pageType.TYPE_HOME];
                    break;
                case _self.data.constants.pageType.TYPE_MAIN_SECTION:
                    var pathArray = _self.data.configuration.pathArray.slice();
                    pathArray.unshift(_self.data.constants.pageType.TYPE_MAIN_SECTION);
                    return pathArray;
                    break;
                case _self.data.constants.pageType.TYPE_LANDING:
                    var pathArray = _self.data.configuration.pathArray.slice();
                    pathArray.unshift(_self.data.constants.pageType.TYPE_LANDING);
                    return pathArray;
                    break;
                case _self.data.constants.pageType.TYPE_BLOG:
                    //Comprobamos si existe el grid de articulos
                    if (jQuery('.masonry_pagination.blog_holder').length > 0) {
                        var currentBlogPage = jQuery('.column1 .pagination .active').text();
                        return [_self.data.constants.pageType.TYPE_BLOG, "catalogo", "pagina-" + currentBlogPage];
                    } //Comprobamos si estamos en la página de un post
                    else if (jQuery('.blog_single').length > 0) {
                        var postTitle = _self.utils.cleanText(jQuery('.post_content h2').text());
                        return [_self.data.constants.pageType.TYPE_BLOG, "post", postTitle];
                    }
                    break;
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
        type: "string"
    }, {
        name: "userInfo.ids.tealiumAsId",
        details: "Es el id usado por Tealium Audience Stream para identificar el usuario a través de los diferentes dominios",
        extractor: function() {
            return utag.data._t_visitor_id;
        },
        trigger: "preloader",
        type: "string"
    }, {
        name: "userInfo.ids.mc4wpEmail",
        details: "ID de usuario vinculado al email de suscripción",
        extractor: function() {
            var _self = this;
            return _self.utils.getCookie("mc4wp_email");
        },
        trigger: "preloader",
        type: "string"
    }, {
        name: "userInfo.ids.gaId",
        details: "ID de usuario extraido de la cookie de Google Analytics",
        extractor: function(gaId) {
            return gaId;
        },
        trigger: "gaIdAvailable",
        type: "string"
    },{
        name: "userInfo.ids.fingerprint",
        details: "ID de usuario extraido a partir de la información del navegador/dispositivo",
        extractor: function(fingerprint) {
            return fingerprint;
        },
        trigger: "fingerprintAvailable",
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
    },, {
        name: "userInfo.network.netname",
        details: "Resultado de nombre de red extraido a partir del servicio whois",
        extractor: function(whoisData) {
            return whoisData.netname;
        },
        trigger: "whoisReady",
        type: "string"
    },, {
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
    }, 
    {
        "name": "userInfo.dmpBadges",
        "details": "Dato generado por AS y que contiene los badges asignados al usuario",
        "extractor": function() {
            var utagDataBagdeIds = [{"id":"va.badges.5248","name":"Testing Viewer"},{"id":"va.badges.32","name":"Unbadged"},{"id":"va.badges.5130","name":"Intense viewer"},{"id":"va.badges.5194","name":"Possible Worker"},{"id":"va.badges.5118","name":"Subscribed"},{"id":"va.badges.5299","name":"CEM Viewer"},{"id":"va.badges.5264","name":"TMs Viewer"},{"id":"va.badges.5297","name":"ADTECH Viewer"},{"id":"va.badges.5303","name":"Social Analytics Viewer"},{"id":"va.badges.5301","name":"Enterprise Reporting Viewer"},{"id":"va.badges.5307","name":"Web Analytics Viewer"},{"id":"va.badges.5305","name":"VOC Viewer"},{"id":"va.badges.5201","name":"Blog Actualidad Viewer"},{"id":"va.badges.31","name":"Frequent visitor"},{"id":"va.badges.30","name":"Fan"}];
            var badgesAssigned = [];
            for(var i = 0; i < utagDataBagdeIds.length; i++){
                var badgeAssigned = utag.data[utagDataBagdeIds[i].id];
                if(badgeAssigned){
                    badgesAssigned.push(utagDataBagdeIds[i].name);
                }
            }
            return badgesAssigned;
        },
        "trigger": "asDataLoaded",
        "type": "array"
    },
    {
        "name": "userInfo.dmpAudiences",
        "details": "Dato generado por AS y que contiene las audiencias a las cuales pertenece el usuario",
        "extractor": function() {
            var utagDataAudiencesIds = [{"id":"va.audiences.divisadero_divisaderoweb_109","name":"ADTECH Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_102","name":"Possible Worker (subscribed)"},{"id":"va.audiences.divisadero_divisaderoweb_114","name":"Web Analytics Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_101","name":"Possible New Worker (unsubscribed)"},{"id":"va.audiences.divisadero_divisaderoweb_113","name":"VOC Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_104","name":"Complete new User"},{"id":"va.audiences.divisadero_divisaderoweb_112","name":"Social Analytics Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_103","name":"Testing Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_106","name":"TMs Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_105","name":"Google ID"},{"id":"va.audiences.divisadero_divisaderoweb_108","name":"Super Blog Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_107","name":"Blog Actualidad Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_111","name":"Enterprise Reporting Viewer"},{"id":"va.audiences.divisadero_divisaderoweb_110","name":"CEM Viewer"}];
            var audiencesAssigned = [];
            for(var i = 0; i < utagDataAudiencesIds.length; i++){
                var audienceAssigned = utag.data[utagDataAudiencesIds[i].id];
                if(audienceAssigned){
                    audiencesAssigned.push(utagDataAudiencesIds[i].name);
                }
            }
            return audiencesAssigned;
        },
        "trigger": "asDataLoaded",
        "type": "array"
    },
    {
        name: "pageInfo.postTitle",
        details: "Contiene el título asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_content h2').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageInfo.postCategory",
        details: "Contiene la categoria asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_category a:last').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageInfo.postTags",
        details: "Contiene las etiquetas asociadas al post que se está visualizando",
        extractor: function() {
            var _self = this;
            var tagElements = jQuery('.single_tags a');
            var tagsArray = [];
            for (var i = 0; i < tagElements.length; i++) {
                tagsArray.push(_self.utils.cleanText(tagElements[i].innerHTML));
            }
            return tagsArray;
        },
        trigger: "blogPost",
        type: "array"
    }, {
        name: "pageInfo.postAuthor",
        details: "Contiene el autor del post",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_author a').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageInfo.postDate",
        details: "Contiene la fecha de publicación del post",
        extractor: function() {
            var _self = this;
            return utag_data['post_date'];
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageInfo.referrer",
        details: "Contiene el referente a la página actual",
        extractor: function() {
            return document.referrer;
        },
        trigger: "preloader",
        type: "string"
    }],

    debug: function() {
        var _self = this;
        return (_self.data.configuration.tealiumEnviroment && _self.data.configuration.tealiumEnviroment != "prod");
    },
    utils: [{
        name: "getTealiumEnviroment",
        util: function() {
            var _self = this;
            var extractTealiumEnv = function(tealiumURL) {
                var envWithUtag = tealiumURL.match('\/[a-z1-9]+(\/utag\.|\/$)');
                if (envWithUtag.length > 0) {
                    return envWithUtag[0].replace(/(\/|utag\.)/g, '');
                }
                return null;
            }

            return extractTealiumEnv(utag.cfg.path);
        }
    }, {
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
        name: "getParameterByName",
        util: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }]
};

window.tagManager = new TagManager(tagManagerSettings);
