var MSQTA = MSQTA || {};
/***************************************/
/***************************************/
MSQTA._IndexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
MSQTA._IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
if( MSQTA._IDBTransaction && ( !MSQTA._IDBTransaction.READ_WRITE || !MSQTA._IDBTransaction.READ_ONLY ) ) {
	MSQTA._IDBTransaction = {
		READ_WRITE: 'readwrite',
		READ_ONLY: 'readonly'
	};
}
MSQTA._IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
/***************************************/
/***************************************/
MSQTA._Errors = {
	get: function( databaseName, schemaName ) {
		throw Error( 'MSQTA-ORM: get: missing search value on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getByIndexWithRange1: function( databaseName, schemaName, fieldName ) {
		throw Error( 'MSQTA-ORM: getByIndexWithRange: "' + fieldName + '" is not an index in the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getByIndexWithRange2: function( operator ) {
		throw Error( 'MSQTA-ORM: getByIndexWithRange: operator "' + operator + '" is not a valid one! You must use one of these: >, <, >=, <=, =' );
	},
	getByIndexWithRange3: function( databaseName, schemaName, fieldValue, parsedValue ) {
		throw Error( 'MSQTA-ORM: getByIndexWithRange: comparator value "' + fieldValue + '" has been casted to a non-value:', parsedValue, ' on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getByIndexWithRange4: function() {
		throw Error( 'MSQTA-ORM: getByIndexWithRange: comparator data has an invalid set of comparision operators!' );
	},
	getByIndexWithRange5: function() {
		throw Error( 'MSQTA-ORM: getByIndexWithRange: your range (>|>=) && (<|<=) is invalid!' );
	},
	getByCallback: function( databaseName, schemaName ) {
		throw Error( 'MSQTA-ORM: getByCallback: missing callback function on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getByIndex1: function( databaseName, schemaName, fieldName ) {
		throw Error( 'MSQTA-ORM: getByIndex: "' + fieldName + '" is not an index in the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getByIndex2: function( databaseName, schemaName ) {
		throw Error( 'MSQTA-ORM: getByIndex: missing search value in "getByIndex" method from "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	getWithLike1: function() {
		throw Error( 'MSQTA-ORM: getWithLike: like data is not valid, it must be something like this: "{type: "both", value: "john"}" !' );
	},
	getWithLike2: function( databaseName, schemaName, fieldName ) {
		throw Error( 'MSQTA-ORM: getWithLike: unknown "' + fieldName + '" column on the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	set1: function( databaseName, schemaName, setDatas ) {
		throw Error( 'MSQTA-ORM: set: data param is invalid for the "' + schemaName + '" schema from the "' + databaseName + '" database!', setDatas );
	},
	set2: function( databaseName, schemaName, data ) {
		throw Error( 'MSQTA-ORM: set: data to be set is invalid for the "' + schemaName + '" schema from the "' + databaseName + '" database!', data );
	},
	set3: function( databaseName, schemaName, target ) {
		throw Error( 'MSQTA-ORM: set: target data to be set is invalid for the "' + schemaName + '" schema from the "' + databaseName + '" database!', target );
	},
	set4: function( databaseName, schemaName, fieldName, fieldValue, parsedValue ) {
		throw Error( 'MSQTA-ORM: set: comparator value "' + fieldValue + '" of the field "' + fieldName + '" has been casted to a non-value:', fieldValue, ' on "' + schemaName + '" from the "' + databaseName + '" database!' );
	},
	set5: function( databaseName, schemaName, fieldName, fieldValue, parsedValue ) {
		throw Error( 'MSQTA-ORM: set: new value "' + fieldValue + '" of the field "' + fieldName + '" has been casted to a non-value:', parsedValue, ' on "' + schemaName + '" from the "' + databaseName + '" database!' );
	},
	del1: function( databaseName, schemaName ) {
		throw Error( 'MSQTA-ORM: del: schema "' + schemaName + '" from the "' + databaseName + '" database has not a primary key setted up!' );
	},
	del2: function( databaseName, schemaName ) {
		throw Error( 'MSQTA-ORM: del: missing id(s) param to make the deletion in "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	},
	del3: function( databaseName, schemaName, id, parsedValue ) {
		throw Error( 'MSQTA-ORM: del: comparator value "' + id + '" has been casted to a non-value:', parsedValue, ' on "' + schemaName + '" from the "' + databaseName + '" database!' );
	},
	batch1: function( databaseName, data ) {
		throw Error( 'MSQTA-ORM: batch: data param is invalid:', data, ' on the "' + databaseName + '" database!' );	
	},
	batch2: function( Schema ) {
		throw Error( 'MSQTA-ORM: batch: supplied Schema:', Schema, ' is not a instance of MSQTA'  );	
	},
	batch3: function( type ) {
		throw Error( 'MSQTA-ORM: batch: type method "' + type + '" is incorrect, the valid ones are: put, set and del' );
	}
};
/***************************************/
/***************************************/
MSQTA._Helpers = {
	noop: function() {
	},
	
	defaultCallback: function() {
		console.log( 'MSQTA-ORM: default callback used' );
		// is WebSQL
		if( arguments[1] && arguments[1].rows ) {
			var rows = arguments[1].rows, i = 0, l = rows.length;
			for( ; i < l; i++ ) {
				console.log( rows.item( i ) );
			}
		} else {
			console.log( arguments[0] );
		}
	},
	
	webSQLSize: 2 * 1024 * 1024,
/***************************************/
	getCaster: function( dataType ) {
		if( dataType === 'object' || dataType === 'array' ) {
			return this.castObj;
		}
		if( dataType === 'datetime' ) {
			return this.castDateTime;
		}
		if( dataType === 'date' ) {
			return this.castDate;
		} 
		if( dataType === 'time' ) {
			return this.castTime;
		} 
		if( dataType === 'boolean' ) {
			return this.castBoolean;
		} 
		return this.castGeneric;
	},
	
	castObj: function( value ) {
		return JSON.parse( value );
	},
	
	castDate: function( value ) {
		var d = value.split( '-' );
		return new Date( d[0], d[1]-1, d[2], 0, 0, 0, 0 );
	},
	
	castTime: function( value ) {
		var d = new Date(),
			t = value.split( ':' );
		
		d.setHours( t[0] );
		d.setMinutes( t[1] );
		d.setSeconds( t[2] );
		
		return d;
	},
	
	castDateTime: function( value ) {
		var d = value.split( ' ' ),
			d1 = d[0].split( '-' ),
			d2 = d[1].split( ':' );
		
		return new Date( d1[0], d1[1]-1, d1[2], d2[0], d2[1], d2[2], 0 );
	},
	
	castBoolean: function( value ) {
		return !!value;
	},
	
	castGeneric: function( value ) {
		return value;
	},
/***************************************/	
	ormMethods: [ 'batch', 'destroy' ],
	schemaMethods: [ 'del', 'destroy', 'empty', 'get', 'getAll', 'getWithLike', 'getByCallback', 'getByIndex', 'getByIndexWithRange', 'put', 'set' ],
	
	dimSchemaInstance: function( Schema ) {
		var schemaMethods = this.schemaMethods,
			noop = this.noop,
			i, l;
		
		for( i = 0, l = schemaMethods.length; i < l; i++ ) {
			Schema[schemaMethods[i]] = noop;
		}
	},
	
	dimORMInstance: function( ORM ) {
		var ormMethods = this.ormMethods,
			schemaMethods = this.schemaMethods, schemaName, Schema, schemas,
			noop = this.noop,
			i, l;
		
		for( i = 0, l = ormMethods.length; i < l; i++ ) {
			ORM[ormMethods[i]] = noop;
		}
		schemas = ORM._Schemas;
		for( schemaName in schemas ) {
			Schema = schemas[schemaName];
			for( i = 0, l = schemaMethods.length; i < l; i++ ) {
				Schema[schemaMethods[i]] = noop;
			}
		}
	},
/***************************************/
/***************************************/
	getORMPrototype: function( prefered ) {
		prefered = prefered.toLowerCase();
		
		if( prefered === 'websql' ) {
			if( window.openDatabase ) {
				return MSQTA._ORM.WebSQL;
			}
		} else if( prefered === 'indexeddb' ) {
			if( MSQTA._IndexedDB ) {
				return MSQTA._ORM.IndexedDB;
			}
		}
		
		if( window.openDatabase ) {
			return MSQTA._ORM.WebSQL;
		} else if( MSQTA._IndexedDB ) {
			return MSQTA._ORM.IndexedDB;
		}
	},

	instantiateSchema: function( setup ) {
		var ORM = setup.ORM,
			schemaPrototype = setup.schemaPrototype,
			implementation = setup.implementation,
			schemaDefinition = setup.schemaDefinition,
			args = setup.args,
			options = {},
			schema;

		if( !ORM ) {
			throw Error( 'MSQTA-ORM: Schema: missing new keyword at initializing a schema' );
		}

		if( typeof args[1] === 'function' ) {
			options.callback = args[1];
			options.context = args[2] || window;
		} else if( typeof args[1] === 'object' ) {
			options = args[1];
		}
		
		MSQTA._Schema.prototype = schemaPrototype;
		schema = new MSQTA._Schema( ORM, schemaDefinition, options );
		
		// stole methods
		schema._resetSchemaAt = MSQTA._Helpers.resetSchemaAt;
		schema._getValueBySchema = MSQTA._Helpers.getValueBySchema;
		
		schema._implementation = implementation;
		schema._init();
		
		return schema;
	},
/***************************************/
/** STOLED METHODS BY THE SCHEMAS PROTOTYPES **/
/***************************************/
	getValueBySchema: function( fieldName, fieldValue ) {
		var schemaFields = this._schemaFields,
			schemaName = this._name,
			fieldData = schemaFields[fieldName];
		
		if( !fieldData ) {
			throw Error( 'MSQTA-ORM: unknown column "' + fieldName + '" in the "' + schemaName + '" schema!' );
		}
		
		return fieldData.sanitizer( fieldValue, fieldData.zero );
	},
	
	supportedDataTypes: {
		string: 'TEXT',
		integer: 'INTEGER',
		object: 'TEXT',
		array: 'TEXT',
		date: 'DATE',
		time: 'TIME',
		datetime: 'DATETIME',
		float: 'REAL',
		boolean: 'INTEGER'
	},
	
	webSQLZeros: {
		string: '',
		integer: 0,
		object: '{}',
		array: '[]',
		date: '0000-00-00',
		time: '00:00:00',
		datetime: '0000-00-00 00:00:00',
		float: 0,
		boolean: 0
	},
	
	indexedDBZeros: {
		string: "",
		int: 0,
		integer: 0,
		text: "",
		object: {},
		array: [],
		date: new Date( 0, 0, 0 ),
		time: new Date( 0, 0, 0 ),
		datetime: new Date( 0, 0, 0 ),
		float: 0,
		boolean: false
	},
	
	resetSchemaAt: function( fieldName ) {
		var implementation = this._implementation,
			dataTypes = MSQTA._Helpers.supportedDataTypes,
			dataTypeZeros = implementation === 'webSQL' ? MSQTA._Helpers.webSQLZeros : MSQTA._Helpers.indexedDBZeros,
		
			schemaName = this._name,
			databaseName = this._ORM._name,
			fieldDefinition = this._schemaFields[fieldName],
			schemaFieldData,
			// integer || string || ...
			type = fieldDefinition.type,
			realDataType = dataTypes[type],
			allowNull = fieldDefinition.allowNull;

		if( !realDataType ) {
			throw Error( 'MSQTA-ORM: column "' + fieldName + '" with the data type "' + type + '" is invalid/not supported in the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
		}
		
		// now reset the schema for a more easy usage
		schemaFieldData = this._schemaFields[fieldName];
		// used when no values are specified to this col
		schemaFieldData.zero = allowNull ? ( implementation === 'webSQL' ? null : null ) : dataTypeZeros[type];
		// sanitizer function
		schemaFieldData.sanitizer = implementation === 'webSQL' ? MSQTA._Helpers.WebSQLSanitizers.getSanitizer( type ) : MSQTA._Helpers.IndexedDBSanitizers.getSanitizer( type );
		// need it is the abstract type is object, date, etc (on indexedDB implementation this not needed it)
		schemaFieldData.toJS = MSQTA._Helpers.getCaster( type );
		schemaFieldData.isDate = type === 'date' || type === 'time' || type === 'datetime';
		
		if( implementation === 'webSQL' ) {
			schemaFieldData.abstract = type;
			schemaFieldData.real = realDataType + ( allowNull ? ' NULL' : '' );
			schemaFieldData.isJSON = type === 'object' || type === 'array';
		
		}
	}
};
/***************************************/
MSQTA._Helpers.WebSQLSanitizers = {
	
	getSanitizer: function( dataType ) {
		if( dataType === 'string' || dataType === 'text' ) {
			return this.sanitizeString;
		}
		if( dataType === 'int' || dataType === 'integer'  || dataType === 'float' ) {
			return this.sanitizeInt;
		}
		if( dataType === 'object' || dataType === 'array' ) {
			return this.sanitizeObj;
		}
		if( dataType === 'date' ) {
			return this.sanitizeDate;
		} 
		if( dataType === 'time' ) {
			return this.sanitizeTime;
		} 
		if( dataType === 'datetime' ) {
			return this.sanitizeDatetime;
		} 
		if( dataType === 'boolean' ) {
			return this.sanitizeBoolean;
		}
	},
	
	sanitizeString: function( value, onZero ) {
		return value || onZero;
	},
	
	sanitizeInt: function( value, onZero ) {
		value -= 0;
		return !value ? onZero : value;
	},
	
	sanitizeDate: function( value, onZero ) {
		var m, d;
		if( value instanceof Date && +value >= 0 ) {
			m = value.getMonth() + 1;
			d = value.getDate();
			return value.getFullYear() + '-' + ( m < 10 ? '0' + m : m ) + '-' + ( d < 10 ? '0' + d : d );
		} 
		m = /^(\d{4}-\d{2}-\d{2})(?: \d{2}:\d{2}(?::\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return m[1];
	},
	
	sanitizeTime: function( value, onZero ) {
		if( value instanceof Date && +value >= 0 ) {
			return value.toTimeString().substring( 0, 8 );
		}
		var m = /^(?:\d{4}-\d{2}-\d{2} )?(\d{2}:\d{2})(:\d{2})?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return m[1] + ( m[2] || ':00' );
	},
	
	sanitizeDatetime: function( value, onZero ) {
		var m, d;
		if( value instanceof Date && +value >= 0 ) {
			m = value.getMonth() + 1;
			d = value.getDate();
			return value.getFullYear() + '-' + ( m < 10 ? '0' + m : m ) + '-' + ( d < 10 ? '0' + d : d ) + ' ' + value.toTimeString().substring( 0, 8 );
		}
		m = /^(\d{4}-\d{2}-\d{2})(?: |T)(\d{2}:\d{2})(?:(:\d{2})[^Z]+Z|(:\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return m[1] + ' ' + m[2] + ( m[3] || m[4] || ':00' );
	},
	
	sanitizeObj: function( value, onZero ) {
		if( typeof value === 'undefined' ) {
			return onZero;
		}
		
		if( typeof value !== 'object' ) {
			// is null or zero
			if( !value ) {
				return onZero;
			}
			if( typeof value === 'string' ) {
				return "'" + value + "'";
			}
			// number
			return value;
		}
		
		try {
			return JSON.stringify( value );
		} catch( e ) {
			return onZero;
		}
	},
	
	sanitizeBoolean: function( value, onZero ) {		
		if( typeof value === 'string' ) {
			value = value.toLowerCase();
			if( value === 'true' || value === '1' ) {
				return 1;
			} 
			if( value === 'false' || value === '0' ) {
				return 0;
			}
			return onZero;
		}
		if( value === 1 ) {
			return 1;
		}
		if( value === 0 ) {
			return 0;
		}
		
		return onZero;
	},
	
	sanitizeGeneric: function( value ) {
		return value;
	}
};
/***************************************/
MSQTA._Helpers.IndexedDBSanitizers = {
	
	getSanitizer: function( dataType ) {
		if( dataType === 'string' || dataType === 'text' ) {
			return this.sanitizeString;
		}
		if( dataType === 'int' || dataType === 'integer'  || dataType === 'float' ) {
			return this.sanitizeInt;
		}
		if( dataType === 'object' || dataType === 'array' ) {
			return this.sanitizeObj;
		}
		if( dataType === 'date' ) {
			return this.sanitizeDate;
		} 
		if( dataType === 'time' ) {
			return this.sanitizeTime;
		} 
		if( dataType === 'datetime' ) {
			return this.sanitizeDatetime;
		} 
		if( dataType === 'boolean' ) {
			return this.sanitizeBoolean;
		}
	},
	
	sanitizeString: function( value, onZero ) {
		return value ? value + '' : onZero;
	},
	
	sanitizeInt: function( value, onZero ) {
		value -= 0;
		return !value ? onZero : value;
	},
	
	sanitizeDate: function( value, onZero ) {
		var m, d;
		if( value instanceof Date && !isNaN( value-0 ) ) {
			value.setHours( 0 );
			value.setMinutes( 0 );
			value.setSeconds( 0 );
			value.setMilliseconds( 0 );
			return value;
		} 
		m = /^(\d{4}-\d{2}-\d{2})(?: \d{2}:\d{2}(?::\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		m = m[1].split( '-' );
		return new Date( m[0], m[1]-1, m[2], 0, 0, 0, 0 );
	},
	
	sanitizeTime: function( value, onZero ) {
		if( value instanceof Date && !isNaN( value-0 ) ) {
			return value;
		}
		var m = /^(\d{4}-\d{2}-\d{2} )?(\d{2}:\d{2})(:\d{2})?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		var y, hourAndMinutes, seconds;
		if( !m[1] ) {
			y = new Date();
			y = [ y.getFullYear(), y.getMonth(), y.getDate() ];
		} else {
			y = m[1].split( '-' );
			// decrease month number
			y[1] = y[1]-1;
		}
		hourAndMinutes = m[2].split( ':' );
		seconds = m[3] || 0;
		return new Date( y[0], y[1], y[2], hourAndMinutes[0], hourAndMinutes[1], seconds, 0 );
	},
	
	sanitizeDatetime: function( value, onZero ) {
		var m, d;
		if( value instanceof Date && !isNaN( value-0 ) ) {
			return value;
		}
		m = /^(\d{4}-\d{2}-\d{2})(?: |T)(\d{2}:\d{2})(?::(\d{2})[^Z]+Z|:(\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		var y, hourAndMinutes, seconds;
		y = m[1].split( '-' );
		hourAndMinutes = m[2].split( ':' );
		seconds = m[3] || m[4] || 0;
		return new Date( y[0], y[1]-1, y[2], hourAndMinutes[0], hourAndMinutes[1], seconds, 0 );
	},
	
	sanitizeObj: function( value, onZero ) {
		if( typeof value === 'undefined' ) {
			return onZero;
		}
		
		if( typeof value !== 'object' ) {
			// is null or zero
			if( !value ) {
				return onZero;
			}
			if( typeof value === 'string' ) {
				return "'" + value + "'";
			}
			// number
			return value;
		}
		
		return value;
	},
	
	sanitizeBoolean: function( value, onZero ) {		
		if( typeof value === 'string' ) {
			value = value.toLowerCase();
			if( value === 'true' || value === '1' ) {
				return true;
			} 
			if( value === 'false' || value === '0' ) {
				return false;
			}
			return onZero;
		}
		if( value === 1 ) {
			return true;
		}
		if( value === 0 ) {
			return false;
		}
		
		return onZero;
	},
	
	sanitizeGeneric: function( value ) {
		return value;
	}
};
/***************************************/
/***************************************/
MSQTA.ORM = function( settings, callback, context ) {
	if( typeof settings === 'string' ) {
		settings = { name: settings };
	}
	if( !settings.name ) {
		throw Error( 'MSQTA-ORM: not database name has been specify!' );
	}
	
	settings.callback = callback || MSQTA._Helpers.defaultCallback;
	settings.context = context || window;
	
	MSQTA._ORM.prototype = MSQTA._Helpers.getORMPrototype( settings.prefered || '' );
	return new MSQTA._ORM( settings );
};
/***************************************/
MSQTA._ORM = function( settings ) {
	var databaseName = this._name = settings.name;
	
	this.devMode = settings.devMode || false;
	
	// put here all query to be executed
	this._queries = [];
	this._Schemas = {};
	// used when multiple call to batch function are maded
	this._batchsStack = [];

	// this.Schema is the function that create schemas from
	// this particulaty database, this.Schema._ORM is there
	// reference to this instantice for each schema that is created
	this.Schema._ORM = this;

	this._isBlocked = true;
	// until this process is alive, we cannot init the schemas
	// so any call to this.schema() will put in this stack
	this._schemasToInit = [];
		
	this._initCallback = settings.callback;
	this._initContext = settings.context;

	// start the shit
	if( settings.forceDestroy ) {
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: "forceDestroy" flag detected for the "' + databaseName + '" database, initializing process, tthen it will recreate again' );
		}
		this._deleteUserDatabase( this._open, this );
		
	} else {
		this._open();
	}
};
/***************************************/
/***************************************/
MSQTA._Schema = function( ORM, schemaDefinition, options ) {
	
	var databaseName = ORM._name,
		schemaName = schemaDefinition.name;
	
	if( ORM._Schemas[schemaName] && !options.forceDestroy ) {
		throw Error( 'MSQTA-Schema: "' + schemaName + '" schema already exists on the "' + databaseName + '" database!' );
	}
	
	var schemaFields = schemaDefinition.fields;
	if( typeof schemaFields !== 'object' || !Object.keys( schemaFields ).length ) {
		throw Error( 'MSQTA-Schema: "' + schemaName + '" schema definition of the "' + databaseName + '" database is invalid!' );
	}
	
	var pk = schemaDefinition.primaryKey;
	// check if pk refers to a exisitnet colmun
	if( !pk || ( pk && !schemaFields[pk] ) ) {
		throw Error( 'MSQTA-Schema: primary key referes to a non-exisistent fieldName in the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	}
	if( schemaFields[pk].type !== 'integer' ) {
		throw Error( 'MSQTA-Schema: primary key must be of integer type on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	}
	// force null values on the primary key, to get working the auto_increment
	schemaFields[pk].allowNull = true;
	
	var fieldName, fieldData,
		schemaIndexes = [],
		schemaUniques = [];
	// get the indexes
	for( fieldName in schemaFields ) {
		fieldData = schemaFields[fieldName];
		if( fieldData.index ) {
			if( !/^(integer|float|string|date|time|datetime|boolean)$/.test( fieldData.type ) ) {
				throw Error( 'MSQTA-Schema: index type must be of the type: integer|float|string|date|time|datetime, on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
			}
			schemaIndexes.push( fieldName );
			fieldData.index = true;
		} else {
			fieldData.index = false;
		}
		if( fieldData.unique ) {
			// an unique needs to be an index also
			if( schemaIndexes.indexOf( fieldName ) === -1 ) {
				schemaIndexes.push( fieldName );
				fieldData.index = true;
			}
			schemaUniques.push( fieldName );
			fieldData.unique = true;
		} else {
			fieldData.unique = false;
		}
	}
	
	ORM._Schemas[schemaName] = this;

	this._ORM = ORM;
	this.devMode = ORM.devMode;
	this._name = schemaName;
	this._schemaFields = schemaFields;
	this._indexes = schemaIndexes;
	this._uniques = schemaUniques;
	this._primaryKey = pk;
	this._fieldsName = Object.keys( schemaFields );
	// options
	this._isForceDestroy = options.forceDestroy;
	this._isForceEmpty = this._isForceDestroy ? false : options.forceEmpty;
	this._initCallback = options.callback || MSQTA._Helpers.defaultCallback;
	this._initContext = options.context || window;
};
