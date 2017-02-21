//Ejemplo de objeto de configuración
var tagManagerSettings = {

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
        name: "blogPost",
        details: "Evento que se produce cuando una página vinculada a un post",
        listener: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType === _self.data.constants.pageType.BLOG && jQuery('.blog_single').length > 0) {
                _self.emit("blogPost");
            }

        },
        trigger: "ready"
    }, {
        name: "fingerprintAvailable",
        details: "Evento que se produce cuando el objeto Fingerprint2 es capaz de generar un fingerprint del usuario",
        listener: function() {
            var _self = this;
            new Fingerprint2().get(function(result, components) {
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
                    if (test.offsetHeight === 0) {
                        //activado
                        _self.emit("adBlockChecker", true);
                    } else {
                        //desactivado
                        _self.emit("adBlockChecker", false);
                    };
                    test.remove();
                }
            }, 1000);
        },
        trigger: "ready"
    }, {
        name: "ssCompleteSubmit",
        details: "Evento que se lanza cuando un usuario hace un submit del formulario de suscripción de la StaySharp completo (el que tiene twitter, cargo y empresa). Pasa como parámetros twitter, company y job",
        params:["twitter","company","job"],
        listener: function() {
            var _self = this;
            jQuery('.wpcf7-submit').on('mousedown', function() {
                var twitter = jQuery('#mce-MMERGE4').val();
                var company = jQuery('#mce-MMERGE3').val()
                var job = jQuery('#mce-MMERGE5').val();
                _self.emit("ssCompleteSubmit", twitter, company, job);
            });
        },
        trigger: "ready"
    },{
        name: "ssEmailEntered",
        details: "Evento que se lanza recogiendo el tipo de recuadro y el email (es igual que ssCompleteSubmit pero cambia la paremitración del evento) cuando un usuario hace un submit del formulario de suscripción de la StaySharp completo (el que tiene twitter, cargo y empresa). Pasa como parámetros twitter, company y job",
        listener: function() {
            var _self = this;
           
                _self.emit("ssEmailEntered", jQuery('.wpcf7-email').val(), "staySharp subscribed");
        },
        trigger: "ssCompleteSubmit"
    }, {
        name: "user.headerLinks",
        details: "Evento que se genera cuando se pulsa sobre alguno de los enlaces superiores [twitter, youtube, mail, etc.]. OJO: no hacen referencia al menú de secciones de la web",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;

            jQuery('.header_top a').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text() || jQuery(this).attr('title');
                _self.emit("user.headerLinks", "header", _self.utils.cleanText(buttonText), href);
            });

        },
        trigger: "ready"
    }, {
        name: "newsletterSubscription",
        details: "Evento que se genera cuando se detecta que un usuario ha realizado un submit correcto del formulario de suscribción a la newsletter",
        listener: function() {
            var _self = this;

            //General form
            if (jQuery('.mc4wp-alert.mc4wp-success').length > 0) {
                _self.emit('.newsletterSubscription');
            }

            //Stay-sharp form
            if (jQuery('#mce-success-response').length > 0) {
                var subscriptionInterval = setInterval(function() {
                    if (jQuery('#mce-success-response:visible').length > 0) {
                        _self.emit('user.newsletterSubscription');
                        clearInterval(subscriptionInterval);
                    }
                }, 300);
            }


        },
        trigger: "ready"
    }, {
        name: "contactFormSubmitted",
        details: "Evento que se genera cuando se detecta que un usuario ha realizado un submit del formulario de contacto de una de las landings",
        params: ["eventType","email","company"],
        listener: function() {
            var _self = this;
            var email, company;

            if (jQuery('.wpcf7-form').length > 0) {
                jQuery('.wpcf7-submit').on('click',function(){
                    email = jQuery('.wpcf7-email').val();
                    company = jQuery('.wpcf7-form-control[name="empresa"]').val();
                });
                var subscriptionInterval = setInterval(function() {
                    if (jQuery('.wpcf7-mail-sent-ok:visible').length > 0) {
                        clearInterval(subscriptionInterval);
                        _self.emit('contactFormSubmitted', email, company);

                    }
                }, 300);
            }else if(_self.data.pageInfo.pageName == "seccion principal:contacto"){
                jQuery('#contact-form #email').on('mousedown',function(){
                    email = jQuery('#contact-form #email').val();
                })
            }
        },
        trigger: "ready"
    }, {
        name: "user.emailChanged",
        details: "Se dispara cuando otro evento quiere cambiar el email asociado al userId",
        params: ["eventType","pageName","email"],
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
        trigger: ["contactFormSubmitted", "subscribeBlog","ssEmailEntered"]
    },{
        name: "user.contactFormLink",
        details: "Evento que se genera cuando se hace clic sobre el botón \"contactanos\" del bloque inferior presente en casi todas las páginas del portal",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.home-newsletter-contacto .wpb_wrapper a').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text() || jQuery(this).attr('title');
                _self.emit("user.contactFormLink", "footer", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "social.socialFooterLinks",
        details: "Evento que se genera cuando se hace clic sobre alguno de los enlaces sociales que aparecen en la parte inferior de la página",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('#menu-footer-social li').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text() || jQuery(this).attr('title');
                _self.emit("user.socialFooterLinks", "footer", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.homeClientsSlider",
        details: "Evento que se genera cuando se hace clic sobre alguno de los clientes que aparecen en el slider",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.clients-carousel li, .clientes-carousel li').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).find('img').attr('alt');
                _self.emit("user.homeClientsSlider", "home", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.homeDigitalIntelligence",
        details: "Evento que se genera cuando se hace clic sobre el botón Inteligencia Digital de la Home",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('a.qbutton[href*="inteligencia-digital/"], a.qbutton[href*="digital-intelligence/"]').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text();
                _self.emit("user.homeDigitalIntelligence", "home", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.homeDigitalTransformation",
        details: "Evento que se genera cuando se hace clic sobre el botón Transformacion Digital de la Home",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('a.qbutton[href*="transformacion-digital/"], a.qbutton[href*="digital-transformation/"]').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text();
                _self.emit("user.homeDigitalTransformation", "home", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.homeBlog",
        details: "Evento que se genera cuando se hace clic sobre el botón Actualizate Ahora de la Home",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('a.qbutton[href*="actualidad/"]').on('mousedown', function() {
                var href = jQuery(this).attr('href');
                var buttonText = jQuery(this).text();
                _self.emit("user.homeDigitalTransformation", "home", _self.utils.cleanText(buttonText), href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.homePost",
        details: "Evento que se genera cuando se hace clic sobre uno de los posts que se promocionan en la home",
        params: ["placement", "elementClicked", "href"],
        listener: function() {
            var _self = this;
            var postDataListener = function(elementType, postIndex, href) {
                return function() {
                    _self.emit("user.homePost", "home", 'clic:post-' + postIndex + ':link-' + elementType, href);
                }
            }
            var basicSelector = '.latest_post_holder ul li';
            var elementType = [{
                name: 'title',
                selector: 'h4 a'
            }, {
                name: 'read more',
                selector: '.excerpt a'
            }];
            for (var i = 0; i < elementType.length; i++) {
                var selector = basicSelector + ' ' + elementType[i].selector;
                jQuery(selector).each(function(index, element) {
                    jQuery(this).on('mousedown', postDataListener(elementType[i].name, index, jQuery(this).attr('href')));
                });
            }
        },
        trigger: "ready"
    }, {
        name: "user.homePostCategory",
        details: "Evento que se genera cuando se hace clic sobre el botón Actualizate Ahora de la Home",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            var postDataListener = function(elementType, postIndex, href) {
                return function() {
                    _self.emit("user.homePostCategory", "home", 'clic:post-' + postIndex + ':link-categoria', href);
                }
            }

            jQuery('.latest_post_holder ul li .latest_post_categories a').each(function(index, element) {
                jQuery(this).on('mousedown', postDataListener(index, jQuery(this).attr('href')));
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalAnalyticsAnalytics",
        details: "Evento que se genera cuando se hace clic sobre alguno de los botones de la sección de Analytics de la categoría Digital Analytics",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;

            jQuery('a[href="#digitalanalytics"]').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalAnalyticsAnalytics", "inteligencia digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalAnalyticsManagement",
        details: "Evento que se genera cuando se hace clic sobre alguno de los botones de la sección de Tag/Data Management de la categoría Digital Analytics",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('a[href="#tagdatamanagement"],a[href*="tag-management"]').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalAnalyticsManagement", "inteligencia digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalAnalyticsPersonalization",
        details: "Evento que se genera cuando se hace clic sobre alguno de los botones de la sección de Personalización de la categoría Digital Analytics",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('a[href*="testing-y-personalizacion"]').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalAnalyticsPersonalization", "inteligencia digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalAnalyticsContact",
        details: "Evento que se genera cuando se hace clic el botón de contacto de la categoría Digital Analytics",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1432643724941 .section_inner_margin').on('mousedown', '.qbutton', function(e) {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalAnalyticsContact", "inteligencia digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalAnalyticsBlog",
        details: "Evento que se genera cuando se hace clic sobre el botón de acceso al Blog AW de la categoría Digital Analytics",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1431423587955 .section_inner_margin').on('mousedown', '.qbutton', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalAnalyticsBlog", "inteligencia digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalTransformationModel",
        details: "Evento que se genera cuando se hace clic sobre el botón Ver Modelo de la categoría Transformación Digital",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1431011527891 .qbutton').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalTransformationModel", "transformacion digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalTransformationStart",
        details: "Evento que se genera cuando se hace clic sobre el botón Empezar Ahora de la categoría Transformación Digital",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1432658359864 .section_inner_margin .qbutton').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalTransformationStart", "transformacion digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.digitalTransformationBlog",
        details: "Evento que se genera cuando se hace clic sobre el botón de enlace al blog de la categoría Transformación Digital",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1431423799873 .section_inner_margin .qbutton').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.digitalTransformationStart", "transformacion digital", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.usAbout",
        details: "Evento que se genera cuando se hace clic sobre los botones de la primera sección (trayectoria y unete al equipo) que están dentro de la sección Nosotros",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1432112652068 a').on('mousedown', function() {
                //El corazón de los 10 años es clicable pero no tiene texto
                var buttonText = _self.utils.cleanText(jQuery(this).text()) || 'vision';
                var href = jQuery(this).attr('href');
                _self.emit("user.usAbout", "nosotros", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.usTeam",
        details: "Evento que se genera cuando se hace clic sobre alguno de los elementos clickables que están encima de las fotos de los trabajadores en la sección Nosotros",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.q_team_social_inner').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).closest('.q_team').find('.q_team_position').text()) || "";
                var href = jQuery(this).find('a').attr('href') || "";
                _self.emit("user.usTeam", "nosotros", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.usContact",
        details: "Evento que se genera cuando se hace clic sobre el botón contactar que se encuentra dentro de la categoria Nosotros",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1432114952223 .qbutton').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.usContact", "nosotros", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.usEmail",
        details: "Evento que se genera cuando se hace clic sobre el enlace para escribir un correo a join[@]divisadero.es dentro de la categoria Nosotros",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.empresa-joinus-mail a').on('mousedown', function() {
                var buttonText = _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.usEmail", "nosotros", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.usVideo",
        details: "Evento que se genera cuando se hace clic sobre el video conocenos de la categoria Nosotros",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.vc_custom_1461084211582 a').on('mousedown', function() {
                var buttonText = "video conocenos";
                var href = jQuery(this).attr('href');
                _self.emit("user.usVideo", "nosotros", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.blogCategory",
        details: "Evento que se genera cuando se hace clic sobre alguna de las categorias del bloque superior de las páginas Blog",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.actualidad-categorias .cat-item a').on('mousedown', function() {
                var buttonText = "category-" + _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.blogCategory", "blog actualidad", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.blogSideCategory",
        details: "Evento que se genera cuando se hace clic sobre alguna de las categorias del blog presentes en el bloque del lateral derecho de algunas de las páginas del blog",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.widget_categories .cat-item a').on('mousedown', function() {
                var buttonText = "side category-" + _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.blogSideCategory", "blog actualidad", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.blogRecent",
        details: "Evento que se genera cuando se hace clic sobre alguno de los articulos dentro del bloque recientes de las páginas del blog",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.widget_recent_entries li a').on('mousedown', function() {
                var buttonText = "recent-" + _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.blogRecent", "blog actualidad", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "user.download",
        details: "Evento que se genera cuando se clic en la descarga de un documento",
        params: ["category", "type", "documentName"],
        listener: function() {
            var _self = this;
            jQuery('[href*=".pdf"]').on('click', function() {
                var articleName = _self.data.pageInfo.post.title || _self.data.pageInfo.pageName;
                _self.emit("user.download", "descarga", "paper", articleName);
            });
        },
        trigger: "ready"
    }, {
        name: "user.webinar",
        details: "Evento que se genera cuando un usuario hace clic sobre el registro de un webinar",
        params: ["category", "type", "webinarName"],
        listener: function() {
            var _self = this;
            jQuery('[href*="gotowebinar.com/register"]').on('click', function() {
                var articleName = _self.data.pageInfo.post.title || _self.data.pageInfo.pageName;
                _self.emit("user.webinar", "registro", "webinar", articleName);
            });
        },
        trigger: "ready"
    }, {
        name: "user.blogTags",
        details: "Evento que se genera cuando se hace clic sobre alguno de los tags dentro de la nube de tags",
        params: ["placement", "buttonText", "href"],
        listener: function() {
            var _self = this;
            jQuery('.tagcloud a').on('mousedown', function() {
                var buttonText = "tag-" + _self.utils.cleanText(jQuery(this).text());
                var href = jQuery(this).attr('href');
                _self.emit("user.blogTags", "blog actualidad", buttonText, href);
            });
        },
        trigger: "ready"
    }, {
        name: "recruitingFormSubmit",
        details: "Evento que se ejecuta cuando se detecta que un usuario ha realizado un submit del formulario de la Landing de Recruitment",
        listener: function() {
            var _self = this;
            jQuery(document).on('recruitment_submit', function() {
                if (jQuery('.recruitment-form[data-form="recruitmentName"] input').val().length > 0 && jQuery('.recruitment-form[data-form="recruitmentLastName"] input').val().length > 0 && jQuery('.recruitment-form[data-form="recruitmentEmail"] input').val().length > 0) {
                    var dataToSend = {};
                    //Mapeo de variables
                    jQuery('.recruitment-form[data-form*="recruitmen"] input').each(function() {
                        dataToSend[jQuery(this).closest('[data-form*="recruitment"]').data('form')] = jQuery(this).val();
                    });
                    _self.emit("recruitingFormSubmit", dataToSend);
                }
            });
        },
        trigger: "loadRules.landings.recruiting"
    }, {
        name: "postClick",
        details: "Evento que se genera cuando se hace clic sobre uno de los posts que se promocionan en la home",
        listener: function() {
            var _self = this;
            var postDataListener = function(postIndex) {
                    return function() {
                        _self.emit("postClick", _self.data.pageInfo.postImpressions[postIndex]);
                    }
                }
                //Post en la home
            var basicSelector = '.latest_post_holder ul li';
            var elementType = [{
                selector: 'h4 a'
            }, {
                selector: '.excerpt a'
            }];
            for (var i = 0; i < elementType.length; i++) {
                var selector = basicSelector + ' ' + elementType[i].selector;
                jQuery(selector).each(function(index, element) {
                    jQuery(this).on('mousedown', postDataListener(index));
                });
            }

            //Resto de posts
            var basicSelector = 'article';
            var elementType = [{
                selector: 'h2 a'
            }, {
                selector: 'a.more-link'
            }];
            for (var i = 0; i < elementType.length; i++) {
                var selector = basicSelector + ' ' + elementType[i].selector;
                jQuery(selector).each(function(index, element) {
                    jQuery(this).on('mousedown', postDataListener(index));
                });
            }
        },
        trigger: "ready"
    }, {
        name: "socialSharing",
        details: "Usuario pulsa sobre el botón de compartir en las redes sociales de los post",
        params: ["socialNetwork", "pageName"],
        listener: function(pageType) {
            var _self = this;
            var socialNetwork = [{
                name: "twitter",
                class: "twitter_share"
            }, {
                name: "linkedin",
                class: "linkedin_share"
            }, {
                name: "facebook",
                class: "facebook_share"
            }, {
                name: "google+",
                class: "google_share"
            }, {
                name: "pinterest",
                class: "pinterest_share"
            }];
            for (var j = 0; j < socialNetwork.length; j++) {
                jQuery("article .post_social ." + socialNetwork[j].class).each(function() {
                    var $socialButton = jQuery(this);
                    var $closestArticle = $socialButton.closest('article');
                    if ($closestArticle.find(':header').length > 0) {
                        var placement = _self.utils.cleanText($closestArticle.find(':header').first().text());
                        var network = socialNetwork[j].name;
                        console.log(placement);
                        $socialButton.click((function(network, placement) {
                            return function() {
                                _self.emit("socialSharing", network, placement, _self.data.pageInfo.pageName);
                            };
                        })(network, placement));
                    }
                });
            }
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
        name: "loadRules.landings.recruiting",
        details: "Regla de carga que se lanza cuando se detecta que la página cargada es la Landing de recruitment",
        listener: function() {
            var _self = this;
            if (document.location.pathname.indexOf('/recruiting-test') > -1) {
                _self.emit("loadRules.landings.recruiting");
            }
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
        name: "configuration.sitecatalyst.s_account",
        details: "Contiene el ID de la cuenta de la report suite de Adobe Analytics",
        extractor: function() {
            return "geo1xxdivisadero";
        },
        trigger: 'preloader',
        obligatory: true
    }, {
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
        name: "constants.pageType.LANDING",
        details: "Constante que almacena el tipo de página Landing",
        extractor: function() {
            return "landing";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.MAIN_SECTION",
        details: "Constante que almacena el tipo de página Sección Principal. Se considera sección principal todas aquellas que aparecen en la cabecera de la página",
        extractor: function() {
            return "seccion principal";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.BLOG",
        details: "Constante que almacena el tipo de página Blog. Todas las páginas que van dentro del blog de actualidad",
        extractor: function() {
            return "blog actualidad";
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "constants.pageType.BLOG_SEARCH",
        details: "Constante que almacena el tipo de busquea sobre la página Blog.",
        extractor: function() {
            return "busqueda blog actualidad";
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
            var _self = this;
            return _self.utils.getParameterByName("utm_medium");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.term",
        details: "Almacena las palabras clave de la campaña",
        extractor: function() {
            var _self = this;
            return _self.utils.getParameterByName("utm_term");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.content",
        details: "Almacena el contenido de la campaña para diferenciar los anuncios o enlaces que llevan a la misma URL",
        extractor: function() {
            var _self = this;
            return _self.utils.getParameterByName("utm_content");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.campaign.name",
        details: "Almacena el nombre de la campaña",
        extractor: function() {
            var _self = this;
            return _self.utils.getParameterByName("utm_campaign");
        },
        trigger: "preloader",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.company",
        details: "Almacena la compañia a la que pertenece el usuario",
        extractor: function() {
            var _self = this;
            return _self.data.events.contactFormSubmitted.company || _self.data.events.ssCompleteSubmit.company;
        },
        trigger: ["ssCompleteSubmit","contactFormSubmitted"],
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
                //Comprobamos si está presente el parametro "s" como query
            var isBlogSearch = function() {
                return jQuery('body.search').length > 0;
            }

            //Comprobamos si está presente el slider de publicaciones
            var isBlogActualidad = function() {
                var blogDetectElement = jQuery('.widget_wp_posts_carousel,.widget_tag_cloud');
                return blogDetectElement.length > 0;
            }

            if (isBlogSearch()) {

                return _self.data.constants.pageType.BLOG_SEARCH;

            } else if (isHome()) {

                return _self.data.constants.pageType.HOME;

            } else if (isMainSection()) {

                return _self.data.constants.pageType.MAIN_SECTION;

            } else if (isBlogActualidad()) {

                return _self.data.constants.pageType.BLOG;

            } else {

                return _self.data.constants.pageType.LANDING;
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
                case _self.data.constants.pageType.HOME:
                    return [_self.data.constants.pageType.HOME];
                    break;
                case _self.data.constants.pageType.MAIN_SECTION:
                    var pathArray = _self.data.configuration.pathArray.slice();
                    pathArray.unshift(_self.data.constants.pageType.MAIN_SECTION);
                    return pathArray;
                    break;
                case _self.data.constants.pageType.LANDING:
                    var pathArray = _self.data.configuration.pathArray.slice();
                    pathArray.unshift(_self.data.constants.pageType.LANDING);
                    return pathArray;
                    break;
                case _self.data.constants.pageType.BLOG_SEARCH:
                    var sectionArray = [_self.data.constants.pageType.BLOG_SEARCH];
                    var searchKeyword = _self.utils.getParameterByName('s');
                    sectionArray.push(searchKeyword);
                    var currentPage = jQuery('.column1 .pagination .active').text() || 1;
                    sectionArray.push('page-' + currentPage);
                    return sectionArray;
                    break;
                case _self.data.constants.pageType.BLOG:
                    //Comprobamos si existe el grid de articulos
                    if (jQuery('.masonry_pagination.blog_holder').length > 0) {
                        var currentBlogPage = jQuery('.column1 .pagination .active').text() || 1;
                        return [_self.data.constants.pageType.BLOG, "catalogo", "pagina-" + currentBlogPage];
                    } //Comprobamos si estamos en la página de un post
                    else if (jQuery('.blog_single').length > 0) {
                        var postTitle = _self.utils.cleanText(jQuery('.post_content h2').text());
                        return [_self.data.constants.pageType.BLOG, "post", postTitle];
                    } //Comprobamos si estamos en la página correspondiente a un listado de articulos por tag 
                    else if (_self.data.configuration.pathArray[0] == "tag") {
                        var tagName = _self.data.configuration.pathArray[1];
                        var currentTagPage = jQuery('.column1 .pagination .active').text() || 1;
                        return [_self.data.constants.pageType.BLOG, "tag", tagName, "pagina-" + currentTagPage];
                    } //Comprobamos si estamos en la página correspondiente a un listado de articulos por categoria 
                    else if (_self.data.configuration.pathArray[0] == "category") {
                        var categoryName = _self.utils.cleanText(jQuery('.actualidad-categorias .current-cat').text());
                        categoryName = categoryName || _self.data.configuration.pathArray[1];
                        var currentCategoryPage = jQuery('.column1 .pagination .active').text() || 1;
                        return [_self.data.constants.pageType.BLOG, 'category', categoryName, "pagina-" + currentCategoryPage];
                    } //Comprobamos si estamos en la página correspondiente a un listado de articulos por fecha
                    else if (!isNaN(parseInt(_self.data.configuration.pathArray[0])) && !isNaN(parseInt(_self.data.configuration.pathArray[1]))) {
                        var postsMonth = _self.data.configuration.pathArray[1];
                        var postsYear = _self.data.configuration.pathArray[0];
                        var completeDate = postsMonth + '/' + postsYear;
                        var currentPage = jQuery('.column1 .pagination .active').text() || 1;
                        return [_self.data.constants.pageType.BLOG, "date", completeDate, "pagina-" + currentPage];
                    } else {
                        return [_self.data.constants.pageType.BLOG, 'no-type', document.location.pathname];
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
        name: "pageInfo.search.keyword",
        details: "Keyword de busqueda",
        extractor: function(pageType) {
            var _self = this;
            if (pageType == _self.data.constants.pageType.BLOG_SEARCH) {
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
            if (pageType == _self.data.constants.pageType.BLOG_SEARCH) {
                numResults = utag_data.search_results;
            }
            return numResults;
        },
        trigger: "loadRules.pageType.*",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.adblock",
        details: "Recoge true si el usuario tiene adblock activado y false si no",
        extractor: function(adblockState) {
            var _self = this;
            return adblockState ? 'adblock presente' : 'adblock no presente';
        },
        trigger: "adBlockChecker",
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
        name: "userInfo.ids.email",
        details: "ID de usuario vinculado al email de suscripción",
        extractor: function() {
            var _self = this;
            return localStorage.getItem('userId') || btoa(_self.utils.getCookie("mc4wp_email"));
        },
        trigger: ["ready", "user.emailChanged"],
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.ids.fingerprint",
        details: "ID de usuario extraido a partir de la información del navegador/dispositivo",
        extractor: function(fingerprint) {
            return fingerprint;
        },
        trigger: "fingerprintAvailable",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.country",
        details: "Pais asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.country;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.countryCode",
        details: "Código del pais asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.countryCode;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.region",
        details: "Código de la provincia asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.region;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.regionName",
        details: "Nombre de la provincia asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.regionName;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.city",
        details: "Nombre de la ciudad asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.city;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.zip",
        details: "Código postal asociado a la IP recogida",
        extractor: function(geoData) {
            return geoData.zip;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.lat",
        details: "Latitud asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.lat;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.long",
        details: "Longitud asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.lon;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.timezone",
        details: "Zona horaria asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.timezone;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.geo.isp",
        details: "ISP asociada a la IP recogida",
        extractor: function(geoData) {
            return geoData.isp;
        },
        trigger: "geoData",
        obligatory: true,
        type: "string"
    }, , {
        name: "userInfo.network.netname",
        details: "Resultado de nombre de red extraido a partir del servicio whois",
        extractor: function(whoisData) {
            return whoisData.netname;
        },
        trigger: "whoisReady",
        obligatory: true,
        type: "string"
    }, , {
        name: "userInfo.network.description",
        details: "Descripción de la red usada por el usuario extraida a partir del servicio whois",
        extractor: function(whoisData) {
            var networkDescription = whoisData.descr.length > 0 ? whoisData.descr.join(":") : "";
            return networkDescription;
        },
        trigger: "whoisReady",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.device.model",
        details: "Modelo de dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.model;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.device.type",
        details: "Tipo de dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.type || "desktop";
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.device.vendor",
        details: "Fabricante del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.device.vendor;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.os.name",
        details: "Nombre del Sistema Operativo del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.os.name;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.os.version",
        details: "Version del Sistema Operativo del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.os.version;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.engine.name",
        details: "Nombre del motor web que usa el navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.engine.name;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.engine.version",
        details: "Versión del motor web que usa el navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.engine.version;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.browser.name",
        details: "Nombre del navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.browser.name;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.browser.version",
        details: "Versión del navegador extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.browser.version;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "userInfo.cpu.architecture",
        details: "Arquitectura de CPU del dispositivo extraido del User Agent",
        extractor: function(uaParsed) {
            return uaParsed.cpu.architecture;
        },
        trigger: "uaParser",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.post",
        details: "Contiene el título asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            if (_self.data.pageInfo.pageType === _self.data.constants.pageType.BLOG && jQuery('.blog_single').length > 0) {
                var getPostTags = function() {
                    var tagElements = jQuery('.single_tags a');
                    var tagsArray = [];
                    for (var i = 0; i < tagElements.length; i++) {
                        tagsArray.push(_self.utils.cleanText(tagElements[i].innerHTML));
                    }
                    return tagsArray;
                }
                var postDetail = {
                    title: _self.utils.cleanText(jQuery('.post_content h2').text()),
                    category: _self.utils.cleanText(jQuery('.post_category a:last').text()),
                    tags: getPostTags,
                    date: utag_data['post_date'],
                    author: _self.utils.cleanText(jQuery('.post_author a').text())
                }
                return postDetail;
            }
            return {
                title: "",
                category: "",
                tags: "",
                date: "",
                author: ""
            }
        },
        trigger: "dataFilled.pageInfo.pageType",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.postImpressions",
        details: "Contiene el título asociada al post que se está visualizando",
        extractor: function() {
            var _self = this;
            var postList = [];
            //getting home post
            jQuery('.latest_post_holder .clearfix').each(function(index) {
                var postPosition = parseInt(index) + 1;
                var postDate = _self.utils.cleanText(jQuery(this).find('.actualidad-fecha').text());
                //5 porque es la distancia entre las 4 cifras del año más el espacio
                postDateCommaPosition = postDate.length - 5;
                postDate = postDate.substring(0, postDateCommaPosition) + ',' + postDate.substring(postDateCommaPosition, postDate.length);
                var postDetail = {
                    title: _self.utils.cleanText(jQuery(this).find('.latest_post_title').text()),
                    category: _self.utils.cleanText(jQuery(this).find('.latest_post_categories a').eq(1).text()),
                    date: postDate,
                    list: _self.data.pageInfo.pageType,
                    position: postPosition
                };
                postList.push(postDetail);

            });

            //getting post of a category page 

            jQuery('article.type-post').each(function(index) {

                    if (jQuery(this).closest('.single-post').length === 0) {
                        var postPosition = parseInt(index) + 1;
                        var postDate = _self.utils.cleanText(jQuery(this).find('.time').text());
                        var postDetail = {
                            title: _self.utils.cleanText(jQuery(this).find('.post_text :header').first().text()),
                            category: _self.utils.cleanText(jQuery(this).find('.latest_post_categories a').eq(1).text()),
                            date: _self.utils.cleanText(jQuery(this).find('.time').text().replace(',', '')).replace('publicado: ', ''),
                            author: _self.utils.cleanText(jQuery(this).find('.post_author span').eq(1).text()),
                            list: _self.data.pageInfo.pageType,
                            position: postPosition
                        };

                        postList.push(postDetail);
                    }
                })
                //getting post list in a search page
            if (_self.data.pageInfo.pageType == _self.data.constants.pageType.BLOG_SEARCH) {
                jQuery('article .post_image').parent().each(function(index) {
                    var postPosition = parseInt(index) + 1;
                    var postDetail = {
                        title: _self.utils.cleanText(jQuery(this).find('.post_content :header').first().text()),
                        category: _self.utils.cleanText(jQuery(this).find('.post_category a').text()),
                        date: _self.utils.cleanText(jQuery(this).find('.post_info .time').text()),
                        author: _self.utils.cleanText(jQuery(this).find('.post_author_link').text()),
                        list: _self.data.pageInfo.pageType,
                        position: postPosition
                    };
                    postList.push(postDetail);

                });
            }

            return postList;

        },
        trigger: "ready",
        obligatory: true,
        type: "string"
    }, {
        name: "pageInfo.referrer",
        details: "Contiene el referente a la página actual",
        extractor: function() {
            return document.location.referrer;
        },
        trigger: "preloader",
        obligatory: true,
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
        name: "pageInfo.timestamp",
        details: "Marca temporal de la carga de la página",
        extractor: function() {
            return new Date().getTime();
        },
        trigger: "preloader",
        type: "string"
    }],
    utils: [{
        name: "uid",
        util: function() {
            return Math.floor((1 + Math.random()) * 0x100000000).toString();
        }
    }, {
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
    },{
        name: "checkEmail",
        util: function(email) {
            var emailRegexp = new RegExp(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
            return emailRegexp.test(email);
        }
    }],
    debug: function() {
        var _self = this;
        return (_self.data.configuration.tealiumEnviroment && _self.data.configuration.tealiumEnviroment != "prod");
    },
    tealium: true,
    tealiumObject: utag
};

window.tagManager = new TagManager(tagManagerSettings);
