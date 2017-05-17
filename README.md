# Objeto TagManager

El objetivo de la librería TagManager es facilitar las labores de recolección y gestión de la capa de datos y al lanzamiento de eventos.

Es una librería que tiene como base Event Emitter (https://github.com/asyncly/EventEmitter2) a partir de la cual se construyen el resto de funcionalidades

# Componentes principales

A continuación se detallan cuales son los principales componentes que conforman la librería:

## Datas

Este componente tiene cómo objetivo almacenar todos los datos asociados al dataLayer. Permite la construcción de una jerarquía de valores a través de un anidamiento igual que el de un objeto JSON.

Los campos necesarios para la definición de un data son:

``` json
{
    "name":"myData",
    "details": "descripción del contenido",
    "extractor": "función que recupera el dato",
    "type": "tipo del dato contenido",
    "obligatory":"flag que indica si es un dato obligatorio",
    "priority":"prioridad de la ejecución del extactor. mas alta se ejecuta antes"
}

```

## Events

Son los motores de la ejecución de todas las acciones vinculadas a las instancias de TagManager. Al contar con la librería Event Emitter el core, la programación vinculada a esta clase debería seguir el paradigma event-driven. 

Los campos necesarios para la definición de un event son:

``` json
{
    "name":"customEvent",
    "details": "descripción del evento",
    "listener": "función escuchadora del evento personalizado",
    "trigger": "evento bajo el cual se ejecuta la función escuchadora",
    "params":"datos a pasar si hay algo escuchando el evento"
}
```

Hay una serie de eventos que se generan de manera automática y son:

- `preloader`: es el primer evento que se ejecuta 
- `ready`: evento asociado al evento ready del dom 
- `load`: evento asociado al evento load del dom
- `dataFilled.<data name>`: evento que se lanza cuando se rellena el valor de alguno de los datas
- `dataFilledError.<data name>`: evento que se lanza cuando se produce un error al intentar rellenar alguno de los datas
- `allDataFilled`: evento que se genera cuando todos los datas que se han establecido como obligatorios saltan

## Utils

Se corresponden con todas las funciones utiles que se quieren utilizar de manera global.

``` json
{ 
    "name":"myFunction",
    "details": "descripción de la funcion",
    "utils": "función a modo de plugin"
}

```
Hay una serie de funciones que pertenecen a la librería:

- `addData(<data config json>)`: permite añadir un data mediante código y no mediante el archivo de configuración
- `addObligatoryData(<data name>)`: permite marcar un data cómo obligatorio
- `getDataValueFromName(<data name>)`: devuelve el valor de un data a apartir de su nombre. Esto permite evaluar un string de manera directa
- `addEvent(<event config json)`: añade un nuevo escuchador de manera programática y no por el archivo de configuración
- `isEmptyObject(<object>)`: comprueba si el objeto pasado cómo parámetro está vacío (no tiene ninguna clave definida) o no 
- `find(<array of objects>, <keys to search for>)`: permite encontrar un objeto dentro de un array de objetos.
- `isObject(<object>)`: comprueba si la variable es de tipo objeto
- `flatten(<objecgt>)`: permite dejar en un único nivel de jerarquía objetos que poseen varios niveles de profundidad

# Inicialización del objeto 

Para comenzar con la inicialización del objeto es necesario haber incluido la librería TagManager.js previamente.
Una vez incluida la librería se puede pasar a instanciarla de la siguiente manera:

```javascript
var tagManagerSettings = {

    events: [],
    data: [],
    utils: [],
    debug: function() {
        var _self = this;
        return (_self.data.configuration.tealiumEnviroment && _self.data.configuration.tealiumEnviroment != "prod");
    },
    tealium: true,
    tealiumObject: utag
}

```
# Flujo de ejecución

1. Integraciones
2. Carga de tipos
3. Carga de utils
4. Carga de datas
5. Ejecución del evento preloader
6. Carga de eventos
7. Eventos de página y custom events

# Funciones de la librería

A continuación se listan las funciones vinculadas al uso de la librería

## emit()

Se utiliza para la emisión de eventos, será lo que permita la creación de triggers

```javascript
tagManager.emit('mievento.subtipo', parametro1, parametro2, parametro3);
```

## on()

Permite fijar escuchadores a los eventos emitidos

```javascript
tagManager.on('mievento.subtipo', function(parametro1, parametro2, parametro3){
    // utilizar aqui los parametros adjuntos al evento
});
```

## onMany()

Permite escuchar varios eventos de manera simultanea

```javascript
tagManager.onMany(['mievEnto.tipoA','otroEvento.tipoB'], function(parametro1, parametro2, parametro3){
    // utilizar aqui los parametros adjuntos al evento
});
```



## log()

Cuando la variable de configuración debug está activa, permite sacar mensajes de log por consola

```javascript
tagManager.log('Este mensaje se mostrara si se activa la variable de debug');
```

## error()

Cuando la variable de configuración debug está activa, permite sacar mensajes de error por consola

```javascript
try{
    // codigo que podría producir errores
} catch(e) {
    tagManager.error(e,'Este mensaje se mostrara si se activa la variable de debug');
}
```

## clear()

Permite partir de cero en la configuración del objeto `tagManager`

```javascript
tagManager.clear();
```


# Atributos del objeto

Estas son las claves que aparecen por defecto asociadas a la inicialización del objeto

## data

Bajo esta clave se almacenararán toda la estructura de datos definida. La clave `events` se genera por defecto y será donde se introduzcan todos los parámetros que un evento genere.

## utils

Al igual que para data, utils será dónde se almacenen todas las funciones añadidas a la librería

## obligatoryData

Aqui podremos encontrar que datos se han o no rellenado de los establecidos cómo obligatorios. También se indican cuales han producido algún error.

# Roadmap

- Definir varios niveles de prioridad para cada Trigger de manera independiente
- Definir una clave `evaluator` para comprobar que el contenido del data tiene la estructura correcta
- Capacidad para desuscribirse de un evento
- Capacidad para limitar el número de eventos que se van a ejecutar por cada escuchador
- Capacidad para definir eventos cómo obligatorios
- Definir la clave `eventDependent` para asociarla a los datas
- Introducir el concepto Super Eventos y Super Datas para definir varios datas y varios events de manera simultanea
- Visualizador gráfico del objeto de configuración 
