//Ejemplo de objeto de configuración
var tagManagerSettings = {
    data: [{
        name: "page.name",
        details: "Nombre de la página que se está visualizando",
        extractor: function() {
            return dataLayer.pageName;
        },
        trigger: "ready",
        obligatory: false,
        type: "String",
        priority: 10
    },
    {
        name: "page.info.currentUrl",
        details: "Coger la url actual y tiparla",
        extractor: function() {
            var currentUrl = document.location.href;
            var urlObject = new _self.types.url(currenUrl);

            return urlObject;
        },
        trigger: "ready",
        obligatory: false,
        type: "url",
        priority: 1000
    },
    {
        name: "pageName",
        details: "concatener dominio mas paths",
        extractor: function() {
            var urlType = _self.data.currentUrl;

        },
        trigger: "ready",
        obligatory: false,
        type: "url",
        priority: 1000
    }],
    events: [{
        name: "clic_nav_buttons",
        details: "Evento que se produce cuando un usuario hace clic sobre los botones del marcador superior",
        params: ["<nombre menú 1>", "<opción pulsada>"],
        listener: function() {
            var _self = this;
            jQuery('.navButton').click({
                var currentNode = jQuery(this);
                _self.emit(_self.name, currentNode.parent().text(), currentNode.text());
            });
        },
        trigger: "ready"
    }],
    debug: true,
    types: [{
        name: "url",
        class: url
    }, {
        name: "date",
        class: date
    }],
    utils: [{
    name: "pixelAsImage",
    util: function(pixelUrl) {
        if (typeof pixelUrl !== 'undefined') {
            jQuery('body').append("<img src='' + pixelUrl + '' width='0' height='0' border='0' style='display:none;' />");
            return true;
        }

        return false;
    }

}]

}