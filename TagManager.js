window.TagManager = function(settings) {
	/**
	 * Se almacena el contexto de la clase dentro de _self
	 * @type {TagManager}
	 */
    var _self = this;

    /**********************************************************************************************/
    ///////////////////////
    //VARIABLES PRIVADAS //
    ///////////////////////

    var debug = false;
    /**********************************************************************************************/
    //////////////////////
    //GETTER Y SETTERS  //
    //////////////////////
    
    /**
     * Permite establecer el valor de la variable debug usada para mostrar o no los mensajes por consola.
     * Si la variable debug se fija a true se mostrarán los mensajes por consola, de lo contrario no se hará
     * @param {boolean or function} Se puede pasar como parametro directamente el booleano al que sea igual o una función que devuelva un booleano
     */
    _self.setDebug = function(debugConfig){
    	if(debugConfig){
    		if(typeof debugConfig == "function"){
    			debugConfig = debugConfig.call(_self);
    			var errorMessage = "Error[setDebug] the function used as a parameter of setDebug must return a boolean";
    		}
    		if(typeof debugConfig == "boolean"){
    			debug = debugConfig;
    		}else{
    			var errorMessage = errorMessage || "Error[setDebug] the parameter of the setDebug function must be a function or a boolean";
    			_self.error(errorMessage);	
    		}
    	}
	    else{
	    	_self.error("Error[setDebug] while setting the variable debug. You must insert a parameter (the type of the parameter should be a boolean or a function returning a boolean)");
	    }
    	
    }

    /**
     * @return {boolean} Devuelve el contenido de la variable debug usada para mostrar (si es true) o no (si es false) los mensajes por consola.
     */
    _self.getDebug = function(){
    	return debug;
    }
    /**********************************************************************************************/
    ////////////////////////////////
    //LISTADO DE MÉTODOS PRIVADOS //
    ////////////////////////////////

    /**
     * Inicialización de la jerarquia de contenidos del objeto TagManager
     */
    var initHerarchy = function() {
        //Bajo events se almacenarán todos los eventos que el objeto TagManager escuchará
        _self.events = {};
        //La clave data se utiliza para almacenar todos la inforamción relativa al data-layer
        _self.data = {};
        //En types se encontrarán todos las clases/tipos de objetos que el objeto TagManager va a contener
        _self.types = {};
        //Utils es la sección que contiene todas las funciones de utilidad a la hora de realizar: transformaciones de datos, recuperación de datos, peticiones, etc.
        _self.utils = {};
        //En settings se incluye una copia de la información pasada como parámetro a la función
        _self.settings = {
        	data: [],
        	utils: [],
        	events: [],
        	types: []
        };
        
        //Array que almacena los nombres de los data que se marcan como obligatorios
        
        _self.obligatoryData = {
        	//Objetos {name:<Nombre del data obligatorio>,filled: <true si está rellenado, false si no, error si no lo va a estar>}
        	dataReference:[],
        	dataLeft: 0
        };


    };
    /**
     * Factory que escoge el parseador del elemento de Settings adecuado
     * @param  {String} Cualquier de las siguientes cadenas ['events','data','types','utils','debug']
     * @param  {TagManager Element} Un elemento de las settings correspondiente al tipo pasado como parametro
     */
    var settingsElementsParser = function(elementType,element) {
    	var elementTypes = [{
    		typeName: 'events',
    		typeParser: _self.addEvent,
    		varType: "Array"
    	},{
    		typeName: 'data',
    		typeParser: _self.addData,
    		varType: "Array"
    	},{
    		typeName: 'types',
    		typeParser: _self.addType,
    		varType: "Array"
    	},{
    		typeName: 'utils',
    		typeParser: _self.addUtil,
    		varType: "Array"
    	},{
    		typeName: 'debug',
    		typeParser: _self.setDebug,
    		varType: "Boolean"
    	}];

    	elementType = _self.utils.find(elementTypes,{typeName:elementType});

    	if(elementType){
    		if(elementType.varType == "Array"){
    			if(element.constructor === Array){
	    			element.forEach(function(component, index) {
			            try {
			                elementType.typeParser(component);
			            } catch (e) {
			                _self.error(e, "Error[private:settingsElementsParser] while parsing the list of " + elementType.typeName + ". Error produce in the element:" + index);
			            }
		        	});	
    			}else{
    				_self.error("Error[private:settingsElementsParser] the " + elementType.typeName + " type must be an array.");
    			}    			
    		}else{
    			elementType.typeParser(element);
    		}
    		
    	}else{
    		_self.error("Error[private:settingsElementsParser] The elementType passed in does not match any of the defined ones.");
    	}
    	
    }

   
   
   /**********************************************************************************************/
    //////////////////////////////////////////////////////////
    //INICIALIZACIÓN DE LAS SECCIONES DEL OBJETO TAGMANAGER //
    //////////////////////////////////////////////////////////
    initHerarchy();

    /**********************************************************************************************/
    ////////////////////////////////
    //LISTADO DE MÉTODOS PÚBLICOS //
    ////////////////////////////////
    /**
     * Permite evaluar si un objeto está vacio o no
     * @param  {Object} El objeto a evaluar
     * @return {Boolean} Devuelve true si el objeto está vacio y false si no lo está
     */
    _self.utils.isEmptyObject = function(obj) {
    	try{
    		for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        	}
    	}catch(e){
    		_self.error(e, "Error[utils.isEmptyObject] while checking is the object is empty.");
    		throw new Error('It can\'t be checked if the object is empty or not');
    	}
        
        return true;
    };

    /**
     * Función que busca si dentro de un array de objetos existe un objeto que contenga una clave-valor buscado.
     * Ejemplo:
     * Array de obtjetos: [{test1:"valor 1",test2:"valor 2"},{test1:"valor 3",test2:"valor 4"}];
     * Objeto de busqueda: {test1:"valor 3"}
     * Objeto retornado: {test1:"valor 3",test2:"valor 4"}
     * @param  {Object Array} Un array conteniendo una serie de objetos
     * @param  {Object} Un objeto conteniendo la clave y el valor buscado dentro del array de objetos
     * @return {Object} Si no existe el objeto buscado retorna false, si existe retorna el objeto completo
     */
    _self.utils.find = function(arrayOfObjects, objectToSearch) {
        var result = {};
        try{
        	arrayOfObjects.forEach(function(item) {
	            if (Object.keys(objectToSearch).every(function(key) {return item[key] == objectToSearch[key];})){
	                result = item;
	            }
        	});
        }catch(e){
        	_self.error(e, "Error[utils.find] while searching inside the array of objects.");
        }
        

        return _self.utils.isEmptyObject(result) ? false : result;
    };

    
    /**
     * El objetivo de esta función es crear una variable dentro de un objeto en base a un nombrado establecido.
     * La Lógica de la función es la siguiente:
     * Si no es ultimo elemento
     * 	Si no es clave se crea un objeto con esa clave
     * 	Si es clave tiene que ser un objeto
     * Si es ultimo elemento
     * 	Si la key no existe está ok
     * 	Si la key existe se devuelve false
     * @param  {Object} Objeto sobre el cual se va a comprobar si 
     * @param  {String} Un String conteniendo la variable a comprobar/crear
     * @return {function} Si es posible establecer la variable devuelve un setter function(value){variable =  value;} y si no devuelve un false
     */
    _self.utils.createVarFromName = function(obj, nameToCheck){
    	if(typeof obj === "object" && typeof nameToCheck === "string" ){
    		var namesArray =  nameToCheck.split('.');
    		var isKey = function(obj, keyName){
    			return obj[keyName] ? true : false;
    		}
    		var isObject = function(variable){
    			return  (typeof variable  === 'object');
    		}
    		var lastAccesedObj =  obj;
    		for(var i = 0; i < namesArray.length; i++){
    			var isLastElement = false;
    			if(i == namesArray.length - 1){
    				isLastElement = true;
    			}

    			if(isKey(lastAccesedObj,namesArray[i])){
    				if(isObject(lastAccesedObj[namesArray[i]]) && !isLastElement){
    					lastAccesedObj = lastAccesedObj[namesArray[i]];
    				}else{
    					return false;
    				}
    			}else{
    				if(isLastElement){
    					lastAccesedObj[namesArray[i]] = "";
    					return function(value){lastAccesedObj[namesArray[i]] = value};
    				}else{
    					lastAccesedObj[namesArray[i]] = {};
    					lastAccesedObj = lastAccesedObj[namesArray[i]];
    				}

    			}
    		}
    	}else{
    		_self.error("Error[utils.createVarFromName] The parameters received must be [object, string]");
    	}
    	
    }

    /**
     * Comprueba si dentro de un objeto existe una clave con un tipo específico
     * @param  {object} Objeto en el que se va a mirar
     * @param  {string} Clave que se va a comprobar dentro del objeto
     * @param  {string}	Tipo de la variable que se va a mirar	
     * @return {boolean} True si la variable dentro del objeto tiene el tipo correcto, false si no
     */
    _self.utils.checkExistanceType = function(obj, key, varType){
    	if((obj && typeof obj === 'object') && (key && typeof key === 'string') && (varType && typeof varType === 'string')){
    		if(obj[key] && typeof obj[key] === varType){
    			return true;
    		}else{
    			return false;
    		}
    	}else{
    		_self.error("Error[utils.checkExistanceType] The parameters received must be [object, string, string]");
    	}
    }

    /**
     * Dado un String con un nombre se retorna la variable asociada dentro de _self.data. Además permite acceso jerarquico si se utiliza el "." dentro del nombre de la variable.
     * @param  {String} dataName String con el nombre de la variable que se desea recuperar . El caracter "." se utiliza para navegar por la jerarquia
     * @return {value}           Devuelve el valor de la variable o undefined si no está definido.
     */
    _self.utils.getDataValueFromName = function(dataName){
		var nameArray = dataName.split('.');
		var lastAccesedObj = _self.data;
		for(var i = 0; i < nameArray.length; i++){
			lastAccesedObj = lastAccesedObj[nameArray[i]];
            if(!lastAccesedObj){
                return undefined;
            }
		}
		return lastAccesedObj;
	}

    /**
     * Permite fijar el contenido de un data a partir de su nombre como String.
     * @param  {String} dataName  String conteniendo el nombre de la variable dentro de data a la que se quiere acceder (recordar que el punto indica jerarquia)
     * @param  {whatever} dataValue Valor a introducir de la variable. Puede ser de cualquier tipo
     * @return {boolean} devuelve true si se puede fijar y false si no
     */
    _self.utils.setDataValueFromName = function(dataName, dataValue) {
        var nameArray = dataName.split('.');
        var lastAccesedObj = _self.data,
            arrayIndex;
        if (nameArray.length > 0) {
            for (arrayIndex = 0; arrayIndex < nameArray.length - 1; arrayIndex++) {
                lastAccesedObj = lastAccesedObj[nameArray[arrayIndex]];
                if (!lastAccesedObj){
                    return false;
                }
            }
            lastAccesedObj[nameArray[arrayIndex]] = dataValue;
            return true;
        }
        return false;

    }


    /**
     * Permite definir un data como obligatorio. Con esto se consigue que el evento "dataFilled" se lance cuando este data se rellene. Además hasta que este no esté rellenado no se lanzará el evento "dallDataFilled"
     * @param {[type]} dataName [description]
     */
	_self.utils.addObligatoryData = function(dataName){
		_self.obligatoryData.dataReference.push({name: dataName, filled: false});
		_self.obligatoryData.dataLeft++;

		//TO-DO: Modifcar esta parte para unificarlo con un factory
		_self.on(['dataFilled',dataName],function(){
			_self.utils.find(_self.obligatoryData.dataReference,{name:dataName}).filled = true;
			_self.obligatoryData.dataLeft--;
			if(_self.obligatoryData.dataLeft == 0){
				_self.emit('allDataFilled');
			}
			
		});
		_self.on(['dataFilledError',dataName],function(){
			_self.utils.find(_self.obligatoryData.dataReference,{name:dataName}).filled = "error";
			_self.obligatoryData.dataLeft--;
			if(_self.obligatoryData.dataLeft == 0){
				_self.emit('allDataFilled');
			}
			
		});
	}

    /**
     * Emite los eventos relacionados con la carga de la página ["ready","load"]. Permite simular la emisión de los mismos, generando una carga de página ficticia.
     */
	_self.utils.pageLoadEvents = function(){
		var currentDOMState = document.readyState;
		switch (currentDOMState) {
			case 'interactive':
				_self.emit('ready');
				document.onreadystatechange = function () {
					cachedOnReadyStateChange = window.onreadystatechange || function(){};
				  if (document.readyState == "complete") {
				    _self.emit('load');
				  }
				  return cachedOnReadyStateChange.apply(this,arguments);
				}
				break;
			case 'complete':
				_self.emit('ready');
				_self.emit('load');
				break;

			default:
				document.onreadystatechange = function () {
					cachedOnReadyStateChange = window.onreadystatechange || function(){};
				  if (document.readyState == "interactive") {
				    _self.emit('ready');
				  }
				  if (document.readyState == "complete") {
				    _self.emit('load');
				  }
				  return cachedOnReadyStateChange.apply(this,arguments);
				}
				break;
		}
		
	}

    /**
     * Permite añadir al objeto TagManager el data indicado en el objeto que lo describe
     * @param {[Object]} Se debe pasar un objeto con las siguientes claves:
     * 					 {
     * 					     name:[Obligatorio] string que contiene el nombre bajo el cual se va a almacenar el dato dentro de TagManager.data
     * 					     details:[Opcional] string con la explicación de la información que contiene dicho dato
     * 					     extractor:[Obligatorio] función que permite extraer el contenido a introducir dentro de data. Esta función debe tener un return con el valor a introducir dentro de la variable. Además la función recibe como parámetro una referencia al objeto TagManager
     * 					     trigger:[Obligatorio] string con el evento que producirá que se ejecute el extractor
     *                       priority:[Opcional] int definiendo la prioridad con la que se debe ejecutar dentro del trigger. Por defecto es 0 y cuanto más alta sea la prioridad antes se definirá el elemento   
     * 					     obligatory:[Opcional] booleano o una función que devuelva true/false. Este valor determina si este dato es obligatorio para cierta página. Por defecto False.
     * 					     type:[Opcinal] string que contiene el tipo del objeto almacenado. Permite saber el tipo de valor que contiene la variable. Posibles tipos: ["object","boolean","function","number","string","undefined"] más cualquiera definido en types dentro del objeto de configuración.
     * 					 }
     */
	_self.addData = function(dataInfo) {
		if(dataInfo && typeof dataInfo === "object"){
			var dataInfoChecker =  function(dataInfo){
				var obligatoryData = [{
					key: "name",
					type: "string"
				},{
					key: "extractor",
					type: "function"
				},{
					key: "trigger",
					type: "string"
				},];

				for(var i = 0; i < obligatoryData.length; i++){
					if(!_self.utils.checkExistanceType(dataInfo,obligatoryData[i].key,obligatoryData[i].type)){
						return "Error[addData] The " + obligatoryData[i].key + " of the data must be defined and has to be a " + obligatoryData[i].type + "string";
					}
				}
				return true;
			};
			var dataInfoValid = dataInfoChecker(dataInfo);
			if(dataInfoValid === true){
				var nameSetter = _self.utils.createVarFromName(_self.data,dataInfo.name);
				if(typeof nameSetter === "function"){
					var dataListenerSetter = function(){
						try{
							nameSetter(dataInfo.extractor.apply(_self,arguments));
							_self.emit(['dataFilled',dataInfo.name],_self.utils.getDataValueFromName(dataInfo.name));
							
						}catch(e){
							_self.error(e, "Error[addData] while setting the value");
							_self.emit(['dataFilledError',dataInfo.name]);
						}
					};
					if(dataInfo.obligatory){
						var obligatoryBoolean = typeof dataInfo.obligatory === "function" ? dataInfo.obligatory() : Boolean(dataInfo.obligatory);
						if(obligatoryBoolean){
							_self.utils.addObligatoryData(dataInfo.name);
						}
					}
					if(dataInfo.priority && dataInfo.priority === "max"){
						var triggerListeners = _self.listeners(dataInfo.trigger);
						triggerListeners.unshift(dataListenerSetter);
					}else{
						var priorityNumber = parseInt(dataInfo.priority);
						if(isNaN(priorityNumber) || priorityNumber < 0){
							priorityNumber = 0;
						}
						var priorityName = "priority-"+priorityNumber;
						if(!_self.events[dataInfo.trigger]){
							_self.events[dataInfo.trigger] = {};
							_self.on(dataInfo.trigger,function(){
								var argumentsEmitter = arguments || [];
								var priorityArray = Object.keys(_self.events[dataInfo.trigger]);
								priorityArray.sort(function(a,b){
									var getIndexNumber=function(priorityText){
										return parseInt(priorityText.replace('priority-',''));
									};
									a = getIndexNumber(a);
									b = getIndexNumber(b);
									return b - a;
								});
								priorityArray.forEach( function(element) {
									var argumentsEmitterPriority = [[dataInfo.trigger,element]];
									for(var i = 0; i < argumentsEmitter.length; i++){
										argumentsEmitterPriority.push(argumentsEmitter[i]);
									}

									_self.emit.apply(_self,argumentsEmitterPriority);
								});
							});
						}
						_self.events[dataInfo.trigger][priorityName] = _self.events[dataInfo.trigger][priorityName] || [];
						_self.events[dataInfo.trigger][priorityName].push(dataInfo.name);

						_self.on([dataInfo.trigger,priorityName], dataListenerSetter);
					}
					
				}else{
					_self.error("Error[addData] The name specified for the data is not valid:" + dataInfo.name);
					return;
				}
			}else{
				_self.error(dataInfoValid);
				return;
			}

		}else{
			_self.error("Error[addData] The function addData must have an object as a parameter. Check documetaion for the object structure.");
			return;
		}
	}

	/**
     * Permite añadir al objeto TagManager un evento indicado en el objeto que lo describe
     * @param {[Object]} Se debe pasar un objeto con las siguientes claves:
     * 					 {
     * 					     name:[Obligatorio] string que contiene el nombre del evento que se va a ejecutar (nombre que se emitirá)
     * 					     details:[Opcional] string con la explicación de la información de cuando se lanza dicho evento y que información se pasa como parámetros
     * 					     params:[Opcional] string array cada valor del array contiene un identificador del parámetro que se le pasará a los escuchadores. Además este nombre será el que se use para generar un data asociado.
     * 					     trigger:[Obligatorio] string con el evento que producirá que se ejecute el listener
     * 					     listener:[Obligatorio] function que se suscribirá al evento que desee. A esta función se le pasará como parámetro una referencia al objeto TagManager.
     * 					 }
     */
	_self.addEvent = function(eventInfo) {
		if(eventInfo && typeof eventInfo === "object"){
			var eventInfoChecker =  function(eventInfo){
				var obligatoryData = [{
					key: "name",
					type: "string"
				},{
					key: "listener",
					type: "function"
				},{
					key: "trigger",
					type: "string"
				},];

				for(var i = 0; i < obligatoryData.length; i++){
					if(!_self.utils.checkExistanceType(eventInfo,obligatoryData[i].key,obligatoryData[i].type)){
						return "Error[addEvent] The " + obligatoryData[i].key + " of the data must be defined and has to be a " + obligatoryData[i].type + "string";
					}
				}
				return true;
			};

			var createDataFromEvent = function(eventInfo) {
			    var dataInfoBuilder = function(eventName,paramName,paramIndex){
			    	var dataName = "events." + eventName + "." + paramName;
			    	return {
			    		name: dataName,
			    		details:"Data auto-generated from the event ["+eventName+"] parameters",
			            extractor: function() {
			            	if(typeof arguments != 'undefined'){
			            		return arguments[paramIndex];
			            	}else{
			            		return "";
			            	}
			                
			            },
			            trigger: eventInfo.name,
			            priority: "max"
			    	}
			    };
			    if(eventInfo.params){
			    	for(var i = 0; i < eventInfo.params.length; i++){
			    		_self.addData(dataInfoBuilder(eventInfo.name, eventInfo.params[i], i));
			    	}
			    }
			    
			}


			var eventInfoValid = eventInfoChecker(eventInfo);
			if(eventInfoValid === true){
				createDataFromEvent(eventInfo);
				_self.on(eventInfo.trigger,function(){
					eventInfo.listener.apply(_self,arguments);
				});
			}else{
				_self.error(eventInfoValid);
				return;
			}

		}else{
			_self.error("Error[addEvent] The function addEvent must have an object as a parameter. Check documetaion for the object structure.");
			return;
		}
	}

    /**
     * Permite añadir al objeto TagManager un tipo de objeto. Debe entenderse por tipo una clase javaScript.
     * @param {[Object]} Se debe pasar un objeto con las siguientes claves:
     *                   {
     *                       name:[Obligatorio] string con el nombre del tipo que se va a definir. El nombre será el asignado bajo _self.types y no habrá niveles jerarquicos
     *                       class:[Obligatorio] function con la definición de la clase que se va a definir como tipo
     *                   }
     */
	_self.addType = function(typeInfo) {
		//Comprobando que las claves necesarias están definidas
	    if (!typeInfo.name) {
	        _self.error("Error[addType] the type object has to have a \"name\" key defined");
	        return;
	    } else if (!typeInfo.class || !typeInfo.class.prototype) {
	        _self.error("Error[addType] the type object has to have a \"class\" key with a class (function object) as a value");
	        return;
	    }

	    //Se copia la clase al objeto TagManager para que se pueden inicializar los objetos desde la propia instancia del objeto TagManager
	    _self.type[typeInfo.name] = typeInfo.class;
	}

    /**
     * Permite añadir al objeto TagManager un metodo que se considere de utilidad (como puede ser el método getCookie). Este metodo se establecerá bajo la clave _self.utils
     * @param {[Object]} Se debe pasar un objeto con las siguientes claves:
     *                   {
     *                       name:[Obligatorio] string con el nombre del metodo que se va a definir. El nombre será el asignado bajo _self.utils y no habrá niveles jerarquicos
     *                       util:[Obligatorio] function con la definición del método que se va a definir
     *                   }
     */
	_self.addUtil = function(utilInfo) {
		//Comprobando que las claves necesarias están definidas
	    if (!utilInfo.name) {
	        _self.error("Error[addUtil] the util object has to have a \"name\" key defined");
	        return;
	    } else if (!utilInfo.util || typeof utilInfo.util !== "function") {
	        _self.error("Error[addUtil] the util object has to have a \"util\" key with a function as a value");
	        return;
	    }

	    //Se copia la función al objeto TagManager para que se puede utilizar en la definición de datos y en los escuchadores correspondientes
	    _self.utils[utilInfo.name] = utilInfo.util;
	}

    /**
     * Funcion utilizada para lanzar los mensajes de log asociados al objeto TagManager. Con cada llamada a log se hace una emisión de un evento "log" pasando como parametro el mensaje de log
     * @param  {whatever} dataToLog Debe tratarse esta función como si fuese un console.log interno 
     */
	_self.log = function(dataToLog) {
	    _self.emit('log',dataToLog);
        if (_self.getDebug()) {
	        console.log('------Tag Manager Object------');
	        console.log(dataToLog);
	        console.log('------Tag Manager Object------');
	    }
	};

    /**
     * Funcion utilizada para lanzar los mensajes de error asociados al objeto TagManager. Con cada llamada a error se hace una emisión de un evento "errors" pasando como parametro el/los mensaje de error
     * @param  {string} error  Mensaje de error principal
     * @param  {string} text Texto extra. El objetivo es añadir más contexto si hiciese falta al mensaje de error
     */
	_self.error = function(error, text) {
	    _self.emit('errors',error,text);
        if (_self.getDebug()) {
	        console.log('------Tag Manager Object------');
	        console.error(text);
	        console.error(error);
	        console.log('------Tag Manager Object------');
	    }
	};
    /**
     * El método Clear se utiliza para eliminar todo el contenido de la instancia de la clase TagManager
     */
    _self.clear = function() {
    	//TO-DO: Añadir un parámetro array que permite limpiar las claves que se pasan dentro del array
        initHerarchy();
        _self.removeAllListeners()
    };

    /**
    * Da valor a los diferentes elementos que componen el objeto TagManager en función de los datos de inicialización 
    * @param  {tagManagerSettings} Objeto Settings de inicialización del objeto TagManager
    */
    _self.init = function(settings) {
 		if (settings) {
        	if (settings.types) {
                settingsElementsParser('types',settings.types);
            }
            if (settings.utils) {
                settingsElementsParser('utils',settings.utils);
            }
            if (settings.data) {
                settingsElementsParser('data',settings.data);
                //Se ejecuta el evento Preloader
                _self.emit('preloader');
            }
            if (settings.debug) {
                settingsElementsParser('debug',settings.debug);
            }
            if (settings.events) {
                settingsElementsParser('events',settings.events);
            }
            _self.utils.pageLoadEvents();
        }
        
    };

    /*
    * En esta seccion se inicializan las claves del objeto en función del objeto settings pasado en el constructor
    */
    _self.init(settings);

};

//Event Emitter Library
//https://github.com/asyncly/EventEmitter2
//(function(){"use strict";function t(){}function i(t,n){for(var e=t.length;e--;)if(t[e].listener===n)return e;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var e=t.prototype,r=this,s=r.EventEmitter;e.getListeners=function(n){var r,e,t=this._getEvents();if(n instanceof RegExp){r={};for(e in t)t.hasOwnProperty(e)&&n.test(e)&&(r[e]=t[e])}else r=t[n]||(t[n]=[]);return r},e.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},e.getListenersAsObject=function(n){var e,t=this.getListeners(n);return t instanceof Array&&(e={},e[n]=t),e||t},e.addListener=function(r,e){var t,n=this.getListenersAsObject(r),s="object"==typeof e;for(t in n)n.hasOwnProperty(t)&&-1===i(n[t],e)&&n[t].push(s?e:{listener:e,once:!1});return this},e.on=n("addListener"),e.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},e.once=n("addOnceListener"),e.defineEvent=function(e){return this.getListeners(e),this},e.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},e.removeListener=function(r,s){var n,e,t=this.getListenersAsObject(r);for(e in t)t.hasOwnProperty(e)&&(n=i(t[e],s),-1!==n&&t[e].splice(n,1));return this},e.off=n("removeListener"),e.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},e.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},e.manipulateListeners=function(r,t,i){var e,n,s=r?this.removeListener:this.addListener,o=r?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(e=i.length;e--;)s.call(this,t,i[e]);else for(e in t)t.hasOwnProperty(e)&&(n=t[e])&&("function"==typeof n?s.call(this,e,n):o.call(this,e,n));return this},e.removeEvent=function(e){var t,r=typeof e,n=this._getEvents();if("string"===r)delete n[e];else if(e instanceof RegExp)for(t in n)n.hasOwnProperty(t)&&e.test(t)&&delete n[t];else delete this._events;return this},e.removeAllListeners=n("removeEvent"),e.emitEvent=function(r,o){var e,i,t,s,n=this.getListenersAsObject(r);for(t in n)if(n.hasOwnProperty(t))for(i=n[t].length;i--;)e=n[t][i],e.once===!0&&this.removeListener(r,e.listener),s=e.listener.apply(this,o||[]),s===this._getOnceReturnValue()&&this.removeListener(r,e.listener);return this},e.trigger=n("emitEvent"),e.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},e.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},e._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},e._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return r.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:r.EventEmitter=t}).call(this);
!function(e){function t(){this._events={},this._conf&&s.call(this,this._conf)}function s(e){e&&(this._conf=e,e.delimiter&&(this.delimiter=e.delimiter),e.maxListeners&&(this._events.maxListeners=e.maxListeners),e.wildcard&&(this.wildcard=e.wildcard),e.newListener&&(this.newListener=e.newListener),this.wildcard&&(this.listenerTree={}))}function i(e){this._events={},this.newListener=!1,s.call(this,e)}function n(e,t,s,i){if(!s)return[];var r,l,a,h,o,c,f,u=[],p=t.length,_=t[i],v=t[i+1];if(i===p&&s._listeners){if("function"==typeof s._listeners)return e&&e.push(s._listeners),[s];for(r=0,l=s._listeners.length;l>r;r++)e&&e.push(s._listeners[r]);return[s]}if("*"===_||"**"===_||s[_]){if("*"===_){for(a in s)"_listeners"!==a&&s.hasOwnProperty(a)&&(u=u.concat(n(e,t,s[a],i+1)));return u}if("**"===_){f=i+1===p||i+2===p&&"*"===v,f&&s._listeners&&(u=u.concat(n(e,t,s,p)));for(a in s)"_listeners"!==a&&s.hasOwnProperty(a)&&("*"===a||"**"===a?(s[a]._listeners&&!f&&(u=u.concat(n(e,t,s[a],p))),u=u.concat(n(e,t,s[a],i))):u=a===v?u.concat(n(e,t,s[a],i+2)):u.concat(n(e,t,s[a],i)));return u}u=u.concat(n(e,t,s[_],i+1))}if(h=s["*"],h&&n(e,t,h,i+1),o=s["**"])if(p>i){o._listeners&&n(e,t,o,p);for(a in o)"_listeners"!==a&&o.hasOwnProperty(a)&&(a===v?n(e,t,o[a],i+2):a===_?n(e,t,o[a],i+1):(c={},c[a]=o[a],n(e,t,{"**":c},i+1)))}else o._listeners?n(e,t,o,p):o["*"]&&o["*"]._listeners&&n(e,t,o["*"],p);return u}function r(e,t){e="string"==typeof e?e.split(this.delimiter):e.slice();for(var s=0,i=e.length;i>s+1;s++)if("**"===e[s]&&"**"===e[s+1])return;for(var n=this.listenerTree,r=e.shift();r;){if(n[r]||(n[r]={}),n=n[r],0===e.length){if(n._listeners){if("function"==typeof n._listeners)n._listeners=[n._listeners,t];else if(l(n._listeners)&&(n._listeners.push(t),!n._listeners.warned)){var h=a;"undefined"!=typeof this._events.maxListeners&&(h=this._events.maxListeners),h>0&&n._listeners.length>h&&(n._listeners.warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",n._listeners.length),console.trace&&console.trace())}}else n._listeners=t;return!0}r=e.shift()}return!0}var l=Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)},a=10;i.EventEmitter2=i,i.prototype.delimiter=".",i.prototype.setMaxListeners=function(e){this._events||t.call(this),this._events.maxListeners=e,this._conf||(this._conf={}),this._conf.maxListeners=e},i.prototype.event="",i.prototype.once=function(e,t){return this.many(e,1,t),this},i.prototype.many=function(e,t,s){function i(){0===--t&&n.off(e,i),s.apply(this,arguments)}var n=this;if("function"!=typeof s)throw new Error("many only accepts instances of Function");return i._origin=s,this.on(e,i),n},i.prototype.emit=function(){this._events||t.call(this);var e=arguments[0];if("newListener"===e&&!this.newListener&&!this._events.newListener)return!1;var s,i,r,l,a,h=arguments.length;if(this._all&&this._all.length){if(a=this._all.slice(),h>3)for(s=new Array(h),l=1;h>l;l++)s[l]=arguments[l];for(r=0,i=a.length;i>r;r++)switch(this.event=e,h){case 1:a[r].call(this,e);break;case 2:a[r].call(this,e,arguments[1]);break;case 3:a[r].call(this,e,arguments[1],arguments[2]);break;default:a[r].apply(this,s)}}if(this.wildcard){a=[];var o="string"==typeof e?e.split(this.delimiter):e.slice();n.call(this,a,o,this.listenerTree,0)}else{if(a=this._events[e],"function"==typeof a){switch(this.event=e,h){case 1:a.call(this);break;case 2:a.call(this,arguments[1]);break;case 3:a.call(this,arguments[1],arguments[2]);break;default:for(s=new Array(h-1),l=1;h>l;l++)s[l-1]=arguments[l];a.apply(this,s)}return!0}a&&(a=a.slice())}if(a&&a.length){if(h>3)for(s=new Array(h-1),l=1;h>l;l++)s[l-1]=arguments[l];for(r=0,i=a.length;i>r;r++)switch(this.event=e,h){case 1:a[r].call(this);break;case 2:a[r].call(this,arguments[1]);break;case 3:a[r].call(this,arguments[1],arguments[2]);break;default:a[r].apply(this,s)}return!0}if(!this._all&&"error"===e)throw arguments[1]instanceof Error?arguments[1]:new Error("Uncaught, unspecified 'error' event.");return!!this._all},i.prototype.emitAsync=function(){this._events||t.call(this);var e=arguments[0];if("newListener"===e&&!this.newListener&&!this._events.newListener)return Promise.resolve([!1]);var s,i,r,l,a,h=[],o=arguments.length;if(this._all){if(o>3)for(s=new Array(o),l=1;o>l;l++)s[l]=arguments[l];for(r=0,i=this._all.length;i>r;r++)switch(this.event=e,o){case 1:h.push(this._all[r].call(this,e));break;case 2:h.push(this._all[r].call(this,e,arguments[1]));break;case 3:h.push(this._all[r].call(this,e,arguments[1],arguments[2]));break;default:h.push(this._all[r].apply(this,s))}}if(this.wildcard){a=[];var c="string"==typeof e?e.split(this.delimiter):e.slice();n.call(this,a,c,this.listenerTree,0)}else a=this._events[e];if("function"==typeof a)switch(this.event=e,o){case 1:h.push(a.call(this));break;case 2:h.push(a.call(this,arguments[1]));break;case 3:h.push(a.call(this,arguments[1],arguments[2]));break;default:for(s=new Array(o-1),l=1;o>l;l++)s[l-1]=arguments[l];h.push(a.apply(this,s))}else if(a&&a.length){if(o>3)for(s=new Array(o-1),l=1;o>l;l++)s[l-1]=arguments[l];for(r=0,i=a.length;i>r;r++)switch(this.event=e,o){case 1:h.push(a[r].call(this));break;case 2:h.push(a[r].call(this,arguments[1]));break;case 3:h.push(a[r].call(this,arguments[1],arguments[2]));break;default:h.push(a[r].apply(this,s))}}else if(!this._all&&"error"===e)return arguments[1]instanceof Error?Promise.reject(arguments[1]):Promise.reject("Uncaught, unspecified 'error' event.");return Promise.all(h)},i.prototype.on=function(e,s){if("function"==typeof e)return this.onAny(e),this;if("function"!=typeof s)throw new Error("on only accepts instances of Function");if(this._events||t.call(this),this.emit("newListener",e,s),this.wildcard)return r.call(this,e,s),this;if(this._events[e]){if("function"==typeof this._events[e])this._events[e]=[this._events[e],s];else if(l(this._events[e])&&(this._events[e].push(s),!this._events[e].warned)){var i=a;"undefined"!=typeof this._events.maxListeners&&(i=this._events.maxListeners),i>0&&this._events[e].length>i&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),console.trace&&console.trace())}}else this._events[e]=s;return this},i.prototype.onAny=function(e){if("function"!=typeof e)throw new Error("onAny only accepts instances of Function");return this._all||(this._all=[]),this._all.push(e),this},i.prototype.addListener=i.prototype.on,i.prototype.off=function(t,s){function i(t){if(t!==e){var s=Object.keys(t);for(var n in s){var r=s[n],l=t[r];l instanceof Function||"object"!=typeof l||(Object.keys(l).length>0&&i(t[r]),0===Object.keys(l).length&&delete t[r])}}}if("function"!=typeof s)throw new Error("removeListener only takes instances of Function");var r,a=[];if(this.wildcard){var h="string"==typeof t?t.split(this.delimiter):t.slice();a=n.call(this,null,h,this.listenerTree,0)}else{if(!this._events[t])return this;r=this._events[t],a.push({_listeners:r})}for(var o=0;o<a.length;o++){var c=a[o];if(r=c._listeners,l(r)){for(var f=-1,u=0,p=r.length;p>u;u++)if(r[u]===s||r[u].listener&&r[u].listener===s||r[u]._origin&&r[u]._origin===s){f=u;break}if(0>f)continue;return this.wildcard?c._listeners.splice(f,1):this._events[t].splice(f,1),0===r.length&&(this.wildcard?delete c._listeners:delete this._events[t]),this.emit("removeListener",t,s),this}(r===s||r.listener&&r.listener===s||r._origin&&r._origin===s)&&(this.wildcard?delete c._listeners:delete this._events[t],this.emit("removeListener",t,s))}return i(this.listenerTree),this},i.prototype.offAny=function(e){var t,s=0,i=0;if(e&&this._all&&this._all.length>0){for(t=this._all,s=0,i=t.length;i>s;s++)if(e===t[s])return t.splice(s,1),this.emit("removeListenerAny",e),this}else{for(t=this._all,s=0,i=t.length;i>s;s++)this.emit("removeListenerAny",t[s]);this._all=[]}return this},i.prototype.removeListener=i.prototype.off,i.prototype.removeAllListeners=function(e){if(0===arguments.length)return!this._events||t.call(this),this;if(this.wildcard)for(var s="string"==typeof e?e.split(this.delimiter):e.slice(),i=n.call(this,null,s,this.listenerTree,0),r=0;r<i.length;r++){var l=i[r];l._listeners=null}else{if(!this._events||!this._events[e])return this;this._events[e]=null}return this},i.prototype.listeners=function(e){if(this.wildcard){var s=[],i="string"==typeof e?e.split(this.delimiter):e.slice();return n.call(this,s,i,this.listenerTree,0),s}return this._events||t.call(this),this._events[e]||(this._events[e]=[]),l(this._events[e])||(this._events[e]=[this._events[e]]),this._events[e]},i.prototype.listenersAny=function(){return this._all?this._all:[]},"function"==typeof define&&define.amd?define(function(){return i}):"object"==typeof exports?module.exports=i:window.EventEmitter2=i}();
//TagManager Herencia
TagManager.prototype = new EventEmitter2();
TagManager.prototype.constructor = TagManager;
