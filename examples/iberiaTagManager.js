/* Rule Id: 1314607 */
/* -------------------- 
OBJETO TAGMANAGER
2016.01.01: Creacion
2016.03.20: V2. AutoMapeo Datalayers Iberia
2016.04.01: V2.1. Reglas. Custom
- TODO: 
    Revisar Trayecto
    Revisar variables proceso compra completo (faltan) solo están las de la conversión
/* -------------------- */

if (typeof(window.TagManagerPre) == 'undefined') {
  // var reglas = {
  //     'General.searchdest': ['cookie ga', getSearchDest(1)]
  // }

  // Estructura
  window.TagManagerPre = {
    version: '2.2',
    Common: {
      getOwnVar: null
    },
    Custom: {
      getProp: null
    },
    OwnVars: {
      General: {
        ancillariesComprados: '',
        antelacionCompra: '',
        claseReserva: '',
        codigoSeguimiento: '',
        currencySymbol: '', // currency
        customerId: '',
        estadoUsuario: '',
        estanciaDestino: '',
        familiaNumerosaTipo: '',
        fecha: '',
        horarioVuelo: '',
        identifier: '',
        idioma: '',
        mercado: '',
        moneda: '',
        nombreTarifas: '',
        numeroPax: ['', extractNumeroPax(1)], // num_pax
        numeroAdult: ['', extractNumeroAdult(1)], // num_adult
        numeroChild: ['', extractNumeroChild(1)], // num_child
        numeroBaby: ['', extractNumeroBaby(1)], // num_baby
        operadoraVuelo: '', // operado por iberia/otras
        orderId: '', // order_id
        partnerId: '',
        partnerLink: '',
        paxMovilidadReducida: '',
        precioPax: '',
        quadrigam: '',
        quantity: '',
        residente: '',
        searchDest: ['', window.a = extractSearchDest(1), extractSearchDest(2, window.a)], // flightDest
        searchOrigin: ['', extractSearchOrigin(1), extractSearchOrigin(2)], // flightOrigin
        solicitudFactura: '',
        tarifaBarata: '',
        tipoPax: '',
        tipoTarjeta: '',
        tipoVuelo: '',
        titularIberiaPlus: '',
        trayecto: '', // flightTrayecto
        trayectoAeropuerto: '',
        trayectoBuscado: '',
        trayectoPais: '',
        totalPrice: '',
        totalPriceNoTaxFee: ''
      },
      Products: [],
      Transaction: {
        affiliation: '',
        id: '', // transId
        revenue: '', // reveneu
        shipping: '', // shipping
        tax: '', // tax
      },
    },
    Pixel: {
      loadAsImage: null,
      loadFacebook: null
    },
    init: null
  }

  window.TagManagerPre.init = function() {
    // Extraccion de datalayer_general
    if (typeof(datalayer_general) != 'undefined') {
      for (var v in window.TagManagerPre.OwnVars.General) {
        //window.TagManagerPre.OwnVars.General[v] = datalayer_general.getProp(v) || '';

        prop = window.TagManagerPre.OwnVars.General[v];

        // Si es un array (varios posible valores)
        if (typeof prop == 'object') {
          prop[0] = window.TagManagerPre.Custom.getProp(datalayer_general, v) || ''; // Se almacen en el primer elemento     
        } else {
          window.TagManagerPre.OwnVars.General[v] = window.TagManagerPre.Custom.getProp(datalayer_general, v) || '';
        }
      }
    }

    // Extraccion de datalayer_ecommerce
    if (typeof(datalayer_ecommerce) != 'undefined') {
      // Transaccion
      if (typeof(datalayer_ecommerce.transaction != 'undefined')) {
        for (var v in window.TagManagerPre.OwnVars.Transaction) {
          //window.TagManagerPre.OwnVars.Transaction[v] = datalayer_ecommerce.transaction.getProp(v) || '';
          window.TagManagerPre.OwnVars.Transaction[v] = window.TagManagerPre.Custom.getProp(datalayer_ecommerce.transaction, v) || '';
        }
      }
      // Productos
      if (typeof(datalayer_ecommerce.products != 'undefined')) {
        window.TagManagerPre.OwnVars.Products = datalayer_ecommerce.products;
      }
    }

    // Seteo manual
    window.TagManagerPre.OwnVars.General.trayecto = window.TagManagerPre.OwnVars.General.searchOrigin + window.TagManagerPre.OwnVars.General.searchDest;
  }


  // window.TagManagerPre.Common.getOwnVar(null, 'Transaction')
  // window.TagManagerPre.Common.getOwnVar('General', 'quadrigam')
  window.TagManagerPre.Common.getOwnVar = function(objeto, variable) {

    if (objeto) {
      // Existe el objeto
      if (window.TagManagerPre.OwnVars.hasOwnProperty(objeto)) {
        var obj = window.TagManagerPre.OwnVars[objeto];

        // Existe variable en el objeto
        if (obj.hasOwnProperty(variable)) {
          return obj[variable]
        } else {
          return -3;
        }

      } else {
        return -2;
      }
    }
    // Si no se define objeto, la variable cuelga de OwnVars
    else {
      if (window.TagManagerPre.OwnVars.hasOwnProperty(variable)) {
        return window.TagManagerPre.OwnVars[variable]
      } else {
        return -1;
      }
    }
  }

  /* DEFINICION DE LOS METODOS DEL OBJETO TAGMANGER.OWNVARS
    /* Variables propias de IBERIA, obtenidas a través de diferentes métodos
    /* Se recoge toda la informacion disponible y que puede ser utilizada en la solucion desplegada
    /* -------------------------------------------------------------------- */

  // Cookies - Prioridad 2
  // if (typeof(getCookie) == 'function') {

  // Origen de vuelo: Cookie ga_flight_originid
  // if (window.TagManagerPre.OwnVars.General.searchOrigin.length == 0 && getCookie('ga_flight_originid') != null && getCookie('ga_flight_originid') != '') {
  //     window.TagManagerPre.OwnVars.General.searchOrigin = getCookie('ga_flight_originid');
  // }

  // Destino de vuelo: Cookie ga_flight_destid
  // if (window.TagManagerPre.OwnVars.General.searchDest.length == 0 && getCookie('ga_flight_destid') != null && getCookie('ga_flight_destid') != '') {
  //     window.TagManagerPre.OwnVars.General.searchDest = getCookie('ga_flight_destid');
  // }

  // Origen - Destino de vuelo: Cookie Trayectos
  // if (getCookie('Trayectos') != null && getCookie('Trayectos') != '') {
  //     var trayecto = getCookie('Trayectos');

  //     if (trayecto.length > 0) {
  //         var trayectoArray = trayecto.split(/\,/i);

  //         // Seteo si no tiene valor
  //         if (window.TagManagerPre.OwnVars.General.searchDest.length == 0) {
  //             window.TagManagerPre.OwnVars.General.searchDest = trayectoArray[1].replace(/\)/g, '');
  //         }

  //         // Seteo si no tiene valor
  //         if (window.TagManagerPre.OwnVars.General.searchOrigin.length == 0) {
  //             window.TagManagerPre.OwnVars.General.searchOrigin = trayectoArray[0].replace(/\)/g, '');;
  //         }
  //     }
  // }

  // Numero de pasajeros adultos: Cookie ga_num_adult
  // if (getCookie('ga_num_adult') != null && getCookie('ga_num_adult') != '') {
  //     window.TagManagerPre.OwnVars.General.numeroAdult = getCookie('ga_num_adult');
  // }

  // Numero de pasajeros niños: Cookie ga_num_child
  // if (getCookie('ga_num_child') != null && getCookie('ga_num_child') != '') {
  //     window.TagManagerPre.OwnVars.General.numeroChild = getCookie('ga_num_child');
  // }

  // Numero de pasajeros bebes: Cookie ga_num_baby
  // if (getCookie('ga_num_baby') != null && getCookie('ga_num_baby') != '') {
  //     window.TagManagerPre.OwnVars.General.numeroBaby = getCookie('ga_num_baby');
  // }

  // Numero de pasajeros total
  // if (window.TagManagerPre.OwnVars.General.numeroPax.length == 0 && getCookie('ga_num_pax') != null && getCookie('ga_num_pax') != '') {
  //     window.TagManagerPre.OwnVars.General.numeroPax = getCookie('ga_num_pax');
  // }
  // }


  /* DEFINICION DE LOS METODOS DEL OBJETO TAGMANGER.CUSTOM
    /* Funciones propias
    /* -------------------------------------------------------------------- */

  /**
   * [getProp se obtiene el valor de una propiedad de un objeto, sin ser case-sensitive]
   * @param  {[Object]} datalayer [objeto del que se obtiene la propiedad]
   * @param  {[String]} prop      [nombre de la propiedad]
   * @return {[String]}           [valor de la propiedad]
   */
  window.TagManagerPre.Custom.getProp = function(datalayer, prop) {
    for (v in datalayer) {
      if (v.toLowerCase() == prop.toLowerCase()) {
        return datalayer[v];
      }
    }
  }

  /* DEFINICION DE LOS METODOS DEL OBJETO TAGMANGER.PIXEL
    /* Funciones auxiliares utilizadas para la gestión de pixeles
    /* -------------------------------------------------------------------- */

  /**
     * [loadAsImage añade al body un pixel en formato imagen]
     * @param  {[String]} pixelUrl  [url del pixel]
     * @return {[Bool]}             [exito en la insercción del pixel]
     * @example
                window.TagManagerPre.Pixel.loadAsImage('//bs.serving-sys.com/Serving/...');
     */
  window.TagManagerPre.Pixel.loadAsImage = function(pixelUrl) {
    if (typeof pixelUrl !== 'undefined') {
      jQuery('body').append("<img src='' + pixelUrl + '' width='0' height='0' border='0' style='display:none;' />");
      return true;
    }

    return false;
  }

  /**
     * [loadFacebook carga del script de Facebook para lanzamiento de pixeles]
     * @param  {function} callback [funcion callback]
     * @return {[Bool]}            [exito en la insercción del pixel]
     * @example
                window.TagManagerPre.Pixel.loadFacebook(function(){
                    fbq('init', '478308952329742');
                    fbq('track', 'PageView');
                    fbq('track','InitiateCheckout');
                });
    */
  window.TagManagerPre.Pixel.loadFacebook = function(callback) {
    if (typeof callback === 'function') {

      ! function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
      }(window,
      document, 'script', '//connect.facebook.net/en_US/fbevents.js');

      callback();

      return true;
    }

    return false;
  }

  // Inicializacion
  window.TagManagerPre.init();
}