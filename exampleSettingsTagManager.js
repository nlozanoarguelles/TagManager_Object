//Ejemplo de objeto de configuración
var tagManagerSettings = {

    events: [{
        name: "blogPost",
        details: "Evento que se produce cuando una página vinculada a un post",
        listener: function() {
            var _self = this;
            if (_self.data.pageContent.pageType === _self.data.constants.pageType.TYPE_BLOG && jQuery('.blog_single').length > 0) {
                _self.emit("blogPost");
            }

        },
        trigger: "ready"
    },{
        name: "gaIdAvailable",
        details: "Evento que se produce cuando el objeto ga devuelve un tracker que permite extraer el id",
        listener: function() {
            var _self = this;
            var gaIdCookie = _self.utils.getCookie('_gaid');
            if(gaIdCookie){
                _self.emit("gaIdAvailable",gaIdCookie);
            }else{
                if(typeof ga != "undefined"){
                    
                    ga(function(tracker) {
                        utag_data.gaIdCookie =  tracker.get('clientId');
                        setCookie('_gaid',tracker.get('clientId'),30);
                        _self.emit("gaIdAvailable",gaIdCookie);
                    });
                }
            }
        },
        trigger: "load"
    }],

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
        name: "pageContent.pageType",
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
        name: "digitalProcess.sections",
        details: "Almacena todas las secciones asociadas a la página que se está visualizando",
        extractor: function() {
            var _self = this;
            switch (_self.data.pageContent.pageType) {
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
        name: "digitalProcess.pageName",
        details: "Nombre de página formado por la concatenación de las secciones unidas por el separador :",
        extractor: function() {
            var _self = this,
                numberSections = _self.data.digitalProcess.sections.length,
                pageName = '';
            for(var i = 0; i < numberSections - 1;i++){
                pageName += _self.data.digitalProcess.sections[i] + ':';
            }
            pageName += _self.data.digitalProcess.sections[i];
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
        name: "pageContent.postTitle",
        details: "Contiene el título asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_content h2').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageContent.postCategory",
        details: "Contiene la categoria asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_category a').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageContent.postTags",
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
        name: "pageContent.postAuthor",
        details: "Contiene el autor del post",
        extractor: function() {
            var _self = this;
            return _self.utils.cleanText(jQuery('.post_author a').text());
        },
        trigger: "blogPost",
        type: "string"
    }, {
        name: "pageContent.postDate",
        details: "Contiene la fecha de publicación del post",
        extractor: function() {
            var _self = this;
            return utag_data['post_date'];
        },
        trigger: "blogPost",
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
                    var envWithUtag = tealiumURL.match('\/[a-z1-9]+\/utag\.');
                    if (envWithUtag.length > 0) {
                        return envWithUtag[0].replace(/(\/|utag\.)/g, '');
                    }
                    return null;
                }
                //Este util necesita del util getCookie
            var tealiumEnvCookie = _self.utils.getCookie('utag_env_divisadero_divisaderoweb');
            if (tealiumEnvCookie) {
                return extractTealiumEnv(tealiumEnvCookie);

            } else {
                var scriptTagEnv = document.querySelector('head [src*="//tags.tiqcdn.com/utag/"]');
                if (scriptTagEnv) {
                    return extractTealiumEnv(scriptTagEnv.src);
                }
            }
            return null;
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
            if(!url.match(/(\/\?|\/$)/)){
                urlSlashs = url.indexOf('?') > 0 ? url.replace('?','/?') : (url + "/");
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
    },{
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
