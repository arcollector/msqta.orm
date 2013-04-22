var MSQTA = MSQTA || {};
/***************************************/
/***************************************/
MSQTA._IndexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
MSQTA._IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
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
		console.log( 'MSQTA-ORM: default callback used: results:', arguments[0] );
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
		string: '""',
		integer: 0,
		object: '"{}"',
		array: '"[]"',
		date: '"0000-00-00"',
		time: '"00:00:00"',
		datetime: '"0000-00-00 00:00:00"',
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
		schemaFieldData.zero = allowNull ? ( implementation === 'webSQL' ? 'null' : null ) : dataTypeZeros[type];
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
		return value ? '"' + ( value + '' ).replace( /"/g, '\\"' ) + '"' : onZero;
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
			return '"' + value.getFullYear() + '-' + ( m < 10 ? '0' + m : m ) + '-' + ( d < 10 ? '0' + d : d ) + '"';
		} 
		m = /^(\d{4}-\d{2}-\d{2})(?: \d{2}:\d{2}(?::\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return '"' + m[1] + '"';
	},
	
	sanitizeTime: function( value, onZero ) {
		if( value instanceof Date && +value >= 0 ) {
			return '"' + value.toTimeString().substring( 0, 8 ) + '"';
		}
		var m = /^(?:\d{4}-\d{2}-\d{2} )?(\d{2}:\d{2})(:\d{2})?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return '"' + m[1] + ( m[2] || ':00' ) + '"';
	},
	
	sanitizeDatetime: function( value, onZero ) {
		var m, d;
		if( value instanceof Date && +value >= 0 ) {
			m = value.getMonth() + 1;
			d = value.getDate();
			return '"' + value.getFullYear() + '-' + ( m < 10 ? '0' + m : m ) + '-' + ( d < 10 ? '0' + d : d ) + ' ' + value.toTimeString().substring( 0, 8 ) + '"';
		}
		m = /^(\d{4}-\d{2}-\d{2})(?: |T)(\d{2}:\d{2})(?:(:\d{2})[^Z]+Z|(:\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return '"' + m[1] + ' ' + m[2] + ( m[3] || m[4] || ':00' ) + '"';
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
			return "'" + JSON.stringify( value ) + "'";
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
	},	
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
	
	settings.callback = typeof callback === 'function' ? callback : MSQTA._Helpers.defaultCallback;
	settings.context = context || window;
	
	MSQTA._ORM.prototype = MSQTA._Helpers.getORMPrototype( settings.prefered || '' );
	return new MSQTA._ORM( settings );
};
/***************************************/
MSQTA._ORM = function( settings ) {
	var databaseName = this._name = settings.name;
	
	this.devMode = settings.devMode || false;
	this.forceDestroy = settings.forceDestroy;
	
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
	if( this.forceDestroy ) {
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
	
	if( ORM._Schemas[schemaName] ) {
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
			if( !/^(integer|float|string|date|time|datetime)$/.test( fieldData.type ) ) {
				throw Error( 'MSQTA-Schema: index type must be of the type: integer|float|string|date|time|datetime, on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
			}
			schemaIndexes.push( fieldName );
		} else {
			fieldData.index = false;
		}
		if( fieldData.unique ) {
			// put also on indexes
			if( schemaIndexes.indexOf( fieldName ) === -1 ) {
				schemaIndexes.push( fieldName );
			}
			schemaUniques.push( fieldName );
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
	this.forceDestroy = options.forceDestroy;
	this.forceEmpty = this.forceDestroy ? false : options.forceEmpty;
	this._initCallback = typeof options.callback === 'function' ? options.callback : MSQTA._Helpers.defaultCallback;
	this._initContext = options.context || window;
};
MSQTA._ORM.IndexedDB = {
	
	Schema: function( schemaDefinition ) {
		return MSQTA._Helpers.instantiateSchema( { 
			ORM: this.constructor._ORM,
			schemaPrototype: MSQTA._Schema.IndexedDB,
			schemaDefinition: schemaDefinition,
			implementation: 'indexedDB',
			args: arguments
		} );
	},
	
	_open: function() {
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: opening the testigo database "__msqta__"' );
		}
		
		var self = this,
			databaseName = this._name,
			// __msqta__ is the place that all the know databases information are stores
			// we need this to take track of different version numbers of all user databases
			req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		
		// create the __msqta__ schema (this only ocucrrs in the first run, latter onupgradeneeded never agina will be called)
		req.onupgradeneeded = function( e ) {
			var db = e.target.result,
				tableDatabases;
			
			if( self.devMode ) {
				console.log( 'MSQTA-ORM: creating the schema for the testigo database "__msqta__" for the first time and never again' );
			}
			
			tableDatabases = db.createObjectStore( 'databases', { keyPath: 'id', autoIncrement: true } );
			tableDatabases.createIndex( 'name', 'name', { unique: true } );
			
			// store the records when we need a complete update a schema
			db.createObjectStore( 'dump' );
		};
		
		// now figure out the user database is a new one and get its current branch (version number)
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );

			// get the user database information in __msqta__
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = e.target.result;
		
				// first run
				if( !userDatabaseRecord ) {
					if( self.devMode ) {
						console.log( 'MSQTA-ORM: database "' + databaseName + '" is a new one, saving its metadata (branch and schema definition) in testigo "__msqta__" database' );
					}
					
					self._currentBranch = 0;
					
					objectStore.add( { name: databaseName, branch: 0, schemas: {} } ).onsuccess = function( e ) {
						db.close();
						self._init();
					};
				
				// not need to create the userDatabaseRecord
				} else {
					db.close();
					var currentBranch = userDatabaseRecord.branch;

					if( self.devMode ) {
						console.log( 'MSQTA-ORM: database "' + databaseName + '" is already created, its current branch (version number) is: ' +  currentBranch );
					}
					// get the current branch
					self._currentBranch = currentBranch;
					
					self._init();
				}
			};
		};
		
		// fail to open database
		req.onerror = function( e ) {
			// trigger event
			this._initCallback.call( this._initContext, null );
		};
	},
	
	_init: function() {
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: "' + this._name + '" database has been created!' );
		}
		// trigger event
		this._initCallback.call( this._initContext, true );
		// trigger the schemas process
		this._initSchemas();
	},
	
	_deleteUserDatabase: function( callback, context ) {
		var self = this,
			databaseName = this._name,
			req = MSQTA._IndexedDB.deleteDatabase( databaseName );
		
		req.onsuccess = function( e ) {
			// ahora debo borrar toda esa information de __msqta__.databases
			req = MSQTA._IndexedDB.open( '__msqta__' );
			req.onsuccess = function( e ) {
				var db = e.target.result,
					transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( 'databases' );
				
				objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
					var userDatabaseRecord = e.target.result;
					objectStore.delete( userDatabaseRecord.id ).onsuccess = function( e ) {
						db.close();
						
						MSQTA._Helpers.dimORMInstance( self );
						
						callback.call( context || window, true );
					};
				};
			};
		};
		
		req.onerror = function( e ) {
			callback.call( context || window, false );
		};
	},
/*********************/
/**** schema treatmentes functions **/
/********************/
	_initSchema: function( Schema ) {
		this._schemasToInit.push( Schema );
		if( !this._isBlocked ) {
			this._initSchemas();
		}
	},
	
	_initSchemas: function() {
		var self = this,
			databaseName = this._name,
			req;
		
		if( this._schemasToInit.length ) {			
			req = MSQTA._IndexedDB.open( '__msqta__', 1 );
			req.onsuccess = function( e ) {
				var db = e.target.result,
					transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( 'databases' );
				
				// we need to get the user database data to detect schemas changes
				objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
					// this is current schema and branch
					var userDatabaseRecord = e.target.result;
					self._initSchemas2( db, objectStore, userDatabaseRecord );
				};
			};
			
			req.onerror = this._initSchemaFail;
			
		} else {
			this._endSchemasInitialization();
		}
	},

	_initSchemas2: function( db, objectStore, userDatabaseRecord ) {
		var self = this,
			databaseName = this._name,
			// an instance of MSQTA._Schema,
			Schema = this._schemasToInit.shift(),
			schemaName = Schema._name,
			// this is from __msqta__.databases[databaseName]
			registeredSchemaDefinition = userDatabaseRecord.schemas[schemaName],
			currentSchemaDefinition = { fields: Schema._schemaFields, primaryKey: Schema._primaryKey };
		
		// save a reference
		this._currentSchema = Schema;

		// a new one schema
		if( !registeredSchemaDefinition ) {
			this._updateUserDatabaseRecord( objectStore, userDatabaseRecord );
			
			// close the __msqta__ database
			db.close();
			
			// now create the schema in [this._name]
			this._createSchema();
			
		// destroy directly the shcema
		} else if( Schema.forceDestroy ) {
			if( this.devMode ) {
				console.log( 'MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the database "' + databaseName + '", then it will recreate again' );
			}
			this._updateSchema3( this._updateSchema6 );
		
		} else if( Schema.forceEmpty ) {
			if( this.devMode ) {
				console.log( 'MSQTA-ORM: "forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the database "' + databaseName + '"' );
			}
			this._updateSchema7();

		// else check for schema changes
		} else {
			if( this.devMode ) {
				console.log( 'MSQTA-ORM: checking for changes in the schema "' + schemaName + '" schema from the database "' + databaseName + '"' );
			}
			
			// close the __msqta__ database
			db.close();
			
			if( this._checkSchemaChanges( registeredSchemaDefinition, currentSchemaDefinition ) ) {
				if( this.devMode ) {
					console.log( '\tnew changes has been detected, proceeding to update its schema!' );
				}
				
				this._updateSchema();
				
			} else {
				if( this.devMode ) {
					console.log( '\tno new changes has been detected!' );
				}
				
				this._nextSchemaToInit();
			}
		}
	},
	
	_checkSchemaChanges: function( registeredSchemaDefinition, currentSchemaDefinition ) {
		// check for schema changes
		var isNewSchema = false,
			registeredFields = registeredSchemaDefinition.fields,
			currentFields = currentSchemaDefinition.fields,
			registeredFieldData, currentFieldData;
		
		for( fieldName in registeredFields ) {
			registeredFieldData = registeredFields[fieldName];
			currentFieldData = currentFields[fieldName];
			
			// the fieldName is not more present in the new schecma
			if( !currentFieldData ||
			// same fieldName but different structure tyoe	
			registeredFieldData.type !== currentFieldData.type ||
			// index checks
			registeredFieldData.index !== currentFieldData.index ||
			registeredFieldData.unique !== currentFieldData.unique ) {
				isNewSchema = true;
				break;
			}
		}

		var registeredPK = registeredSchemaDefinition.primaryKey,
			currentPK = currentSchemaDefinition.primaryKey;
		// check for schema changes at primaryKey level
		if( !isNewSchema ) {
			// chaging/droping the primaryKey required a new schema too
			if( ( registeredPK && ( !currentPK || registeredPK !== currentPK ) ) ||
			// previoulsy there is not a primary key, but now yes
			( !registeredPK && currentPK ) ) {
				isNewSchema = true;
			}
		}
		
		return isNewSchema;
	},
	
	_updateUserDatabaseRecord: function( objectStore, userDatabaseRecord ) {
		var Schema = this._currentSchema,
			schemaName = Schema._name,
			primaryKey = Schema._primaryKey,
			schemaKeepTrack = Schema._schemaKeepTrack;
		
		userDatabaseRecord.schemas[schemaName] = {
			fields: schemaKeepTrack,
			primaryKey: primaryKey
		};
		// save the schema data in databaseData.schemas
		req = objectStore.put( userDatabaseRecord );

		return req;
	},
	
	_createSchema: function() {
		var self = this,
			Schema = this._currentSchema,
			databaseName = this._name,
			schemaName = Schema._name,
			req = this._openUserDatabaseForChanges();
		
		req.onupgradeneeded = function( e ) {
			var db = e.target.result;
			
			if( self.devMode ) {
				console.log( 'MSQTA-ORM: proceeding to create the schema "' + schemaName + '" for the "' + databaseName + '" database' );
			}
			
			self._createSchemaForReal( db );
		};
		
		req.onsuccess = function( e ) {
			var db = e.target.result;
			db.close();
			
			self._saveBranch( self._nextSchemaToInit, self );
		};
		
		req.onerror = this._initSchemaFail;
	},
	
	_updateSchema: function() {
		var self = this,
			req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		
		// cleaning any shit on dump (this is only happens when the user
		// shutdown the browser when this process was running for example)
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ 'dump' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'dump' );
			
			objectStore.clear().onsuccess = function( e ) {
				db.close();
				self._updateSchema2();
			};
		};
		
		req.onerror = this._initSchemaFail;
	},

	_updateSchema2: function() {
		var self = this,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			databaseName = this._name,
			key = 0, isAdvance = false,
			msqtaDB, userDatabase;
		
		if( this.devMode ) {
			console.log( '\t(1) saving temporaly all records from the schema in the testigo database' );
		}
		
		var getCursor = function() {
			var req = self._openUserDatabase();
			req.onsuccess = function( e ) {
				userDatabase = e.target.result;
				var transaction = userDatabase.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_ONLY ),
					objectStore = transaction.objectStore( schemaName );
				
				objectStore.openCursor().onsuccess = getRecord;
			};
			
			req.onerror = this._initSchemaFail;
		};
		
		var getRecord = function( e ) {
			var cursor = e.target.result;
			if( cursor ) {
				// cursor.advance() has been triggered
				if( isAdvance ) {
					saveRecord( cursor.value );
					isAdvance = false;
					userDatabase.close();
				// initial case
				} else if( key === 0 ) {
					saveRecord( cursor.value );
					key++;
					userDatabase.close();
				} else {
					cursor.advance( key );
					key++;
					isAdvance = true;
				}
			} else {
				userDatabase.close();
				done();
			}
		};
		
		var saveRecord = function( record ) {
			var req = MSQTA._IndexedDB.open( '__msqta__', 1 );
			req.onsuccess = function( e ) {
				msqtaDB = e.target.result;
				var transaction = msqtaDB.transaction( [ 'dump' ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( 'dump' );
			
				if( self.devMode ) {
					console.log( record );
				}
				objectStore.add( record, key ).onsuccess = nextRecord;
			};
			
			req.onerror = this._initSchemaFail;
		};
		
		var nextRecord = function( e ) {
			msqtaDB.close();
			getCursor();
		};
		
		var done = function() {
			self._updateSchema3( self._updateSchema4 );
		};
		
		// start
		getCursor();
	},
	
	_updateSchema3: function( next ) {
		var self = this,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			databaseName = this._name,
			req = this._openUserDatabaseForChanges();

		req.onupgradeneeded = function( e ) {
			var db = e.target.result;
			
			if( self.devMode ) {
				console.log( '\t(2) re-creating schema, we need to drop it and create it again with the newly schema' );
			}
			
			// first delete the schema
			db.deleteObjectStore( schemaName );
			
			// now process to create the schema with its new schema data
			self._createSchemaForReal( db );
		};
		
		req.onsuccess = function( e ) {
			var db = e.target.result;
			db.close();
			
			if( self.devMode ) {
				console.log( '\t(3) saving new branch of modified database' );
			}
			self._saveBranch( next, self );
		};
		
		req.onerror = this._initSchemaFail;
	},
	
	_updateSchema4: function() {
		var self = this,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			schemaFields = Schema._schemaFields,
			databaseName = this._name,
			msqtaDB, userDatabase, isAdvance = false, key = 0;
		
		if( self.devMode ) {
			console.log( '\t(4) restoring and recasting the saved temporaly records (if there any) to the recenlty updated schema' );
		}
		
		var getCursor = function() {
			var req = MSQTA._IndexedDB.open( '__msqta__', 1 );
			req.onsuccess = function( e ) {
				msqtaDB = e.target.result;
				var transaction = msqtaDB.transaction( [ 'dump' ], MSQTA._IDBTransaction.READ_ONLY ),
					objectStore = transaction.objectStore( 'dump' );
				
				objectStore.openCursor().onsuccess = getRecord;
			};
			
			req.onerror = this._initSchemaFail;
		};
		
		var getRecord = function( e ) {
			var cursor = e.target.result;
			if( cursor ) {
				// cursor.advance() has been triggered
				if( isAdvance ) {
					saveRecord( cursor.value );
					isAdvance = false;
					msqtaDB.close();
				// initial case
				} else if( key === 0 ) {
					saveRecord( cursor.value );
					key++;
					msqtaDB.close();
				} else {
					cursor.advance( key );
					key++;
					isAdvance = true;
				}
			} else {
				msqtaDB.close();
				done();
			}
		};
		
		var saveRecord = function( record ) {
			var req = self._openUserDatabase();
			req.onsuccess = function( e ) {
				userDatabase = e.target.result;
				var transaction = userDatabase.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( schemaName ),
					fieldName, schemaField, req;
			
				for( fieldName in record ) {
					schemaField = schemaFields[fieldName];
					if( schemaField ) {
						record[fieldName] = schemaField.sanitizer( record[fieldName], schemaField.zero );
					} else {
						delete record[fieldName];
					}
				}
				
				if( self.devMode ) {
					console.log( record );
				}
				req = objectStore.put( record );
				req.onsuccess = nextRecord;
				req.onerror = nextRecord;
			};
			
			req.onerror = this._initSchemaFail;
		};
		
		var nextRecord = function( e ) {
			userDatabase.close();
			getCursor();
		};
		
		var done = function() {
			self._updateSchema5();
		};
		
		// start
		getCursor();
	},
	
	_updateSchema5: function() {
		var self = this,
			databaseName = this._name,
			req;

		req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ 'dump' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'dump' );
			
			if( self.devMode ) {
				console.log( '\t(5) deleting the temporaly saved records' );
			}
			objectStore.clear().onsuccess = function( e ) {
				db.close();
				
				self._updateSchema6();
			};
		};
		
		req.onerror = this._initSchemaFail;
	},
	
	_updateSchema6: function() {
		var self = this,
			databaseName = this._name,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			req;
	
		req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
			
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = e.target.result,
					req;
				
				if( self.devMode ) {
					console.log( '\t(6) update schema information on testigo database to keep tracking future changes' );
				}
				// update the shchema information
				req = self._updateUserDatabaseRecord( objectStore, userDatabaseRecord );
				req.onsuccess = function( e ) {
					db.close();
					self._updateSchema8();
				};
			};
		};
		
		req.onerror = this._initSchemaFail;
	},
	
	_updateSchema7: function() {
		var self = this,
			databaseName = this._name,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			req;

		req = this._openUserDatabase();
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( schemaName );
			
			// truncate schema, this happend the the "forceEmpty" flag is actived
			objectStore.clear().onsuccess = function( e ) {
				self._updateSchema8();
			};
		};
		
		req.onerror = this._initSchemaFail;
	},
		
	_updateSchema8: function() {
		if( this.devMode ) {
			console.log( '\t(7) update schema process is done' );
		}
		// done
		this._nextSchemaToInit();
	},
	
	_initSchemaFail: function() {
		this._nextSchemaToInit( false );
	},
	
	/**
	* this is called from _createSchema and from _updateSchema (after deleting its current schema)
	*/
	_createSchemaForReal: function( db ) {
		var Schema = this._currentSchema,
			schemaFields = Schema._schemaFields,
			schemaName = Schema._name,
			primaryKey = Schema._primaryKey,
			fieldName, fieldData, isUnique,
			objectStore;
		
		if( this.devMode ) {
			console.log( '\tprimary key: ' + primaryKey );
		}
		objectStore = db.createObjectStore( schemaName, { keyPath: primaryKey, autoIncrement: true } );
		
		// create the indexes
		for( fieldName in schemaFields ) {
			fieldData = schemaFields[fieldName];
			if( fieldData.index ) {
				isUnique = fieldData.unique;
				if( this.devMode ) {
					console.log( '\tindex: ' + fieldName + ( isUnique ? ' (unique)' : '' ) );
				}
				objectStore.createIndex( fieldName, fieldName, isUnique ? { unique: true } : {} );
			}
		}
	},
	
	_nextSchemaToInit: function( statusCode ) {
		var Schema = this._currentSchema,
			callback = Schema._initCallback,
			context = Schema._initContext;
		
		// get back to the user
		callback.call( context, typeof statusCode === 'undefined' ? true: statusCode );
		// clean
		delete Schema._initCallback;
		delete Schema._initContext;
		delete this._currentSchema;
		
		// continue with more shit
		this._initSchemas();
	},
	
	_endSchemasInitialization: function() {
		// done mothefucker
		this._isBlocked = false;
	},
/*********************/
/**** helpers functions **/
/********************/
	_saveBranch: function( callback, context ) {
		var self = this,
			databaseName = this._name,
			newBranch = this._currentBranch,
			req;
		
		req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		req.onsuccess = function( e ) {
			var db = e.target.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
		
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = e.target.result;
				
				if( self.devMode ) {
					console.log( 'MSQTA-ORM: saving branch (version number) from the database "' + databaseName + '" to: ' + newBranch );
				}
				
				// update branch
				userDatabaseRecord.branch = newBranch;
				objectStore.put( userDatabaseRecord );
				
				db.close();
				
				if( callback ) {
					callback.call( context || window );
				}
			};
		};
	},
	/**
	* this method will cause to trigger onupgradeneeded event
	*/
	_openUserDatabaseForChanges: function() {
		var databaseName = this._name,
			nextBranch = this._currentBranch + 1;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: opening "' + databaseName + '" at branch: ' + nextBranch + ' to make schema changes' );
		}
		// keep track
		this._currentBranch = nextBranch;
		
		return MSQTA._IndexedDB.open( databaseName, nextBranch );	
	},
	
	/**
	* just open the database at the current branch
	*/
	_openUserDatabase: function() {
		var databaseName = this._name,
			currentBranch = this._currentBranch;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: opening "' + databaseName + '" at branch: ' + currentBranch );
		}
		
		return MSQTA._IndexedDB.open( databaseName, currentBranch );	
	},
	
	_preExec: function( queryData ) {
		if( !queryData.callback ) {
			queryData.callback = MSQTA._Helpers.defaultCallback;
		}
		if( !queryData.context ) {
			queryData.context = window;
		}
		
		// save the entred query
		this._queries.push( queryData );
		
		if( this._isWaiting ) {
			return;
		}
		this._isWaiting = true;
		
		this._exec();
	},
	
	_exec: function() {
		var self = this,
			q = this._queries.shift(),
			databaseName = this._name,
			schemaName = q.schema,
			type = q.type,
			req;

		// especial case
		if( type === 'destroy' ) {
			this._destroy( q );
		
		} else {
			req = this._openUserDatabase(); 
			req.onsuccess = function( e ) {
				var db = e.target.result
					type = q.type,
					transaction = db.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_WRITE );
					objectStore = transaction.objectStore( schemaName );
				
				// keep augmenting q (queryData)
				q.objectStore = objectStore;
				q.database = db;
				
				if( self.devMode ) {
					console.log( 'MSQTA-ORM: "' + schemaName + '" schema will be manipulate (' + type + ') with the data (may be undefined):', q.data );
				}
			
				self['_' + type]( q );
			};
		}
	},
	
	_continue: function() {
		this._isWaiting = false;
		if( this._queries.length ) {
			this._exec();
		}
	},
	
	// this one is called when _put, _set, _del, _empty finish
	_done: function( queryData, results ) {
		queryData.database.close();
		// come back to the user
		queryData.callback.call( queryData.context, results );
		// keep executing more queries
		this._continue();
	},
	
	_put: function( queryData ) {
		var self = this,
			objectStore = queryData.objectStore,
			datas = queryData.data,
		
			currentIndex = 0,
			totalQueries = datas.length;
		
		var next = function( lastID ) {
			if( currentIndex === totalQueries ) {
				self._done( queryData, lastID );
				
			} else {
				// insert the data
				process();
				currentIndex++;
			}
		};
		
		var process = function() {
			var data = datas[currentIndex],
				req = objectStore.add( data );
			
			req.onsuccess = function( e ) {
				// the lastID
				next( e.target.result );
			};
			
			req.onerror = function( e ) {
				next( null );
			};
		};
		
		next();
	},
	
	_set: function( queryData ) {
		var self = this,
			objectStore = queryData.objectStore,
			datas = queryData.data,
			indexes = queryData.indexes,
			pk = queryData.primaryKey,
		
			affectedRows = 0,
			
			currentIndex = 0, totalQueries = datas.length;
		
		var next = function() {
			if( currentIndex === totalQueries ) {
				self._done( queryData, affectedRows );
			
			} else {
				// update the data
				process();
				currentIndex++;
			}
		};
		
		var process = function() {
			var data = datas[currentIndex],
				setData = data.data,
				target = data.target,
				targetPk = target[pk], fieldName,
				colsCount = Object.keys( target ).length;
			
			if( targetPk ) {
				objectStore.get( targetPk ).onsuccess = function( e ) {
					var record = e.target.result,
						req;
					// update the record
					for( fieldName in setData ) {
						record[fieldName] = setData[fieldName];
					}
					
					req = objectStore.put( record );
					req.onsuccess = function( e ) {
						if( e.target.result ) {
							affectedRows++;
						}
						next();
					};
					req.onerror = function( e ) {
						next( null );
					};
				};
				
			} else {
				// get all the records, yes all of them!!
				// start iteration
				objectStore.openCursor().onsuccess = function( e ) {
					var cursor = e.target.result;
					if( cursor ) {
						// get the pointed 
						var record = cursor.value,
							match = 0, req;
						// compare
						for( fieldName in target ) {
							if( record[fieldName] === target[fieldName] ) {
								match++;
							}
						}
						// this is pathetic
						if( match === colsCount ) {
							// update the record
							for( fieldName in setData ) {
								record[fieldName] = setData[fieldName];
							}
							
							req = cursor.update( record );
							req.onsuccess = function( e ) {
								if( e.target.result ) {
									affectedRows++;
								}
								cursor.continue();
							};
							req.onerror = function( e ) {
								cursor.continue();
							};
							
						} else {
							cursor.continue();
						}
						
					// end
					} else {
						next();
					}
				};
			}
		};
		
		next();
	},
	
	_del: function( queryData ) {
		var self = this,
			objectStore = queryData.objectStore,
			datas = queryData.data,
			pk = queryData.primaryKey,
		
			affectedRows = 0,
		
			currentIndex = 0, totalQueries = datas.length;
		
		var next = function() {
			if( currentIndex === totalQueries ) {
				self._done( queryData, affectedRows );
				
			} else {
				// update the data
				process();
				currentIndex++;
			}
		};
		
		var process = function() {
			var data = datas[currentIndex];
			objectStore.delete( data[pk] ).onsuccess = function( e ) {
				if( e.target.result ) {
					affectedRows++;
				}
				next();
			};
		};
		
		next();
	},
	
	_empty: function( queryData ) {
		var self = this,
			affectedRows,
			objectStore = queryData.objectStore;
		
		objectStore.count().onsuccess = function( e ) {
			affectedRows = e.target.result;
			objectStore.clear().onsuccess = function( e ) {
				self._done( queryData, affectedRows );
			};
		};
	},
	
	_destroy: function( queryData ) {
		var self = this,
			schemaName = queryData.schema,
			req = this._openUserDatabaseForChanges();

		// delete the schema from the user database
		req.onupgradeneeded = function( e ) {
			var db = e.target.result;
			
			db.deleteObjectStore( schemaName );
		};
		
		req.onsuccess = function( e ) {
			var db = e.target.result;
			db.close();
			
			// now delete the schema in __msqta__ databases datas
			self._destroy2( queryData );
		};
	},
	
	_destroy2: function( queryData ) {
		var self = this,
			databaseName = this._name,
			schemaName = queryData.schema,
			Schema = this._Schemas[schemaName],
			req = MSQTA._IndexedDB.open( '__msqta__', 1 );
		
		req.onsuccess = function( e ) {
			// delete the schema from the testigo database
			var db = e.target.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
		
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var databaseData = e.target.result;
				// delete the schema from schemas
				delete databaseData.schemas[schemaName];
	
				objectStore.put( databaseData ).onsuccess = function( e ) {
					// because to delete the schema from the user database we need to trigger
					// and onupgradeneeded on the user database by incremeting its branch
					self._saveBranch( function() {
						queryData.database = db;
						// delete from here too
						delete self._Schemas[schemaName];
						MSQTA._Helpers.dimSchemaInstance( Schema );
						
						this._done( queryData, true );
					}, self );
				};
			};
		};
	},
/*********************/
/**** public functions **/
/********************/
	batch: function( data, callback, context ) {
		var databaseName = this._name,
			batchData;
		
		if( !( data instanceof Array ) || !data.length ) {
			MSQTA._Errors.batch1( databaseName, data )
		}
		
		if( typeof callback !== 'function' ) {
			callback = MSQTA._Helpers.defaultCallback;
		}
		if( typeof context !== 'object' ) {
			context = window;
		}
		// agrup params for a better manipulation
		batchData = {
			data: data,
			callback: callback, 
			context: context
		};
		
		if( this._isBatchMode ) {
			// cant continue
			this._batchsStack.push( batchData );
			return;
		}
		this._isBatchMode = true;
		
		// start the process
		this._batch( batchData );
	},
	
	_batch: function( batchData ) {
		var data = batchData.data,
			typeValids = [ 'set', 'put', 'del' ],
			i = 0, l = data.length, t,
			queryData, Schema, type;
		
		for( ; i < l; i++ ) {
			queryData = data[i],
			Schema = queryData.schema;
			if( !( Schema instanceof MSQTA._Schema ) ) {
				MSQTA._Errors.batch2( Schema );
			}
			type = queryData.type.toLowerCase();
			if( typeValids.indexOf( type ) === -1 ) {
				MSQTA._Errors.batch3( type );
			}

			this._queries = this._queries.concat( { 
				schema: Schema._name, 
				type: type, 
				data: Schema[type]( queryData.data ),
				callback: MSQTA._Helpers.noop,
				context: window
			} );
		}
		// the last one will the return point
		t = this._queries[this._queries.length-1];
		t.callback = batchData.callback;
		t.context = batchData.context;
		
		this._isBatchMode = false;

		if( !this._isWaiting ) {
			this._continue();
		}
	},
	
	destroy: function( callback, context ) {
		if( typeof callback !== 'function' ) {
			callback = MSQTA._Helpers.noop;
		}
		
		this._deleteUserDatabase( callback, context );
	},
};
MSQTA._Schema.IndexedDB = {
	
	_init: function() {
		var ORM = this._ORM,
			schemaFields = this._schemaFields, fieldName, fieldData,
			schemaKeepTrack = {};

		for( fieldName in schemaFields ) {
			fieldData = schemaFields[fieldName];
			this._resetSchemaAt( fieldName );
			// this is one is store in the testigo database to 
			// keep tracking future changes
			schemaKeepTrack[fieldName] = {
				type: fieldData.type,
				index: fieldData.index,
				unique: fieldData.unique
			};
		}
		this._schemaKeepTrack = schemaKeepTrack;
		
		ORM._initSchema( this );
	},
/***************************************/
	get: function( searchValue, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaFields = this._schemaFields,
			fieldName, fieldMapping = {},
			schemaName = this._name;
	
		if( !searchValue ) {
			MSQTA._Errors.get( databaseName, schemaName );
		}
		
		for( fieldName in schemaFields ) {
			fieldMapping[fieldName] = this._getValueBySchema( fieldName, searchValue );
		}
		
		var filterCallback = function( record, fields, comparator ) {
			for( var fieldName in record ) {
				if( record[fieldName] === comparator[fieldName] ) {
					return true;
				}
			}
			return false;
		};
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database' );
		}
		
		this._getAll( {
			callback: filterCallback, 
			comparator: fieldMapping,
			fields: null,
		}, userCallback, userContext );
	},
	
	getAll: function( userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name;
		
		var filterCallback = function() {
			return true;
		};
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching all records from "' + schemaName + '" schema from the "' + databaseName + '" database' );
		}
		
		this._getAll( {
			callback: filterCallback, 
			comparator: null,
			fields: null,
		}, userCallback, userContext );
	},

	getWithLike: function( fields, likeData, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaFields = this._schemaFields,
			schemaName = this._name,
			i, l, fieldName,
			likeType, searchValue;
			
		if( typeof likeData !== 'object' ) {
			MSQTA._Errors.getWithLike1();
		}
		
		likeType = Object.keys( likeData )[0];
		searchValue = likeData[likeType];
		if( !likeType || !searchValue ) {
			MSQTA._Errors.getWithLike1();
		}

		if( likeType === 'both' ) {
			searchValue = new RegExp( searchValue, 'i' );
		} else if( likeType === 'start' ) {
			searchValue = new RegExp( '^' + searchValue, 'i' );
		} else if( likeType === 'end' ) {
			searchValue = new RegExp( searchValue + '$', 'i' );
		}
		
		if( !( fields instanceof Array ) ) {
			fields = [ fields ];
		}
		for( i = 0, l = fields.length; i < l; i++ ) {
			fieldName = fields[i];
			if( !schemaFields[fieldName] ) {
				MSQTA._Errors.getWithLike2( databaseName, schemaName, fieldName );
			}
		}
		
		var filterCallback = function( record, fields, comparator ) {
			var fieldName,
				i = 0, l = fields.length;
			
			for( ; i < l; i++ ) {
				fieldName = fields[i];
				if( comparator.test( record[fieldName] ) ) {
					return true;
				}
			}
			
			return false;
		};

		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database with like' );
		}
		
		this._getAll( { 
			callback: filterCallback, 
			comparator: searchValue,
			fields: fields
		}, userCallback, userContext );
	},
	
	getByCallback: function( filterCallback, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name;
		
		if( typeof filterCallback !== 'function' ) {
			MSQTA._Errors.getByCallback( databaseName, schemaName );
		}
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database by "callback"' );
		}
		
		this._getAll( {
			callback: filterCallback,
			comparator: null,
			fields: null,
		}, userCallback, userContext );
	},
	
	_getAll: function( filterData, callback, context ) {
		// agriou all params
		var closureData = {
			filterData: filterData,
			callback: callback || MSQTA._Helpers.defaultCallback,
			context: context || window,
			self: this
		};
	
		(function( closureData ) {
			var self = closureData.self,
				ORM = self._ORM,
				req = ORM._openUserDatabase(),
				// IDBDatabase object of the user database
				userDatabase,
				databaseName = ORM._name,
				schemaName = self._name,
			
				fd = closureData.filterData,
				filterCallback = fd.callback,
				filterComparator = fd.comparator,
				filterFields = fd.fields,
			
				data = [];
			
			req.onsuccess = function( e ) {
				var db = e.target.result,
					transaction = db.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_ONLY );
					objectStore = transaction.objectStore( schemaName );
			
				userDatabase = db;
				
				objectStore.openCursor().onsuccess = function( e ) {
					var cursor = e.target.result,
						record;
					
					if( cursor ) {
						record = cursor.value;
						if( filterCallback( record, filterFields, filterComparator ) ) {
							data.push( record );
						}
						cursor.continue();
						
					} else {
						// done
						userDatabase.close();
						closureData.callback.call( closureData.context, data );
					}
				};
			};
		})( closureData );
	},
	
	getByIndex: function( fieldName, searchValue, userCallback, userContext ) {
		var ORM = this._ORM,	
			databaseName = ORM._name,
			schemaName = this._name,
			indexData = {}, fields = [],
			filterCallback,
			fieldValue, parsedValue, i, l;
		
		if( this._primaryKey !== fieldName ) {
			if( this._indexes.indexOf( fieldName ) === -1 ) {
				MSQTA._Errors.getByIndex1( databaseName, schemaName, fieldName );
			}
		}
		
		if( this._primaryKey === fieldName ) {
			indexData.pk = fieldName;
		} else {
			indexData.index = fieldName;
		}
		
		if( !searchValue ) {
			MSQTA._Errors.getByIndex2( databaseName, schemaName );
		}
		
		if( !( searchValue instanceof Array ) ) {
			searchValue = [ searchValue ];
		}
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database using ' + ( indexData.pk ? 'primary key: "' + indexData.pk + '"' : 'index: "' + indexData.index + '"' ) );
		}
		
		if( searchValue.length === 1 ) {
			indexData.keyRange = MSQTA._IDBKeyRange.only( this._getValueBySchema( fieldName, searchValue[0] ) );
			
			this._getWithIDBKeyRange( indexData, userCallback, userContext );
			
		} else {
			for( i = 0, l = searchValue.length; i < l; i++ ) {
				fieldValue = searchValue[i];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				fields.push( parsedValue );
			}
			
			filterCallback = function( record, fields, comparator ) {
				// comparator is the target col used to do the compariosin
				// fields conatins all the value to be compare agains record[comparator] 
				for( var i = 0, l = fields.length; i < l; i++ ) {
					if( fields[i] === record[comparator] ) {
						return true;
					}
				}
				return false;
			};
			
			this._getAll( { 
				callback: filterCallback, 
				comparator: indexData.pk || indexData.index,
				fields: fields,
			}, userCallback, userContext );
		}
	},
	
	getByIndexWithRange: function( fieldName, comparator, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			schemaFields = this._schemaFields,
			validOperators = /^(?:>|<|>=|<=|=)$/, operator,
			indexData = {}, operatorsMapping = {}, operatorsCount, keyRange,
			fieldData = schemaFields[fieldName], fieldValue, parsedValue;
		
		if( this._primaryKey !== fieldName ) {
			if( this._indexes.indexOf( fieldName ) === -1 ) {
				MSQTA._Errors.getByIndexWithRange1( databaseName, schemaName, fieldName );
			}
		}
		
		if( this._primaryKey === fieldName ) {
			indexData.pk = fieldName;
		} else {
			indexData.index = fieldName;
		}
		
		// if the field type is date, hence a date object, you can compare equally two date objects
		// so, converting to a comparator of the type >= and <=
		fieldValue = comparator['='];
		if( fieldValue && fieldData.isDate ) {
			comparator = {
				'>=': fieldValue,
				'<=': fieldValue
			};
		}
		
		for( operator in comparator ) {
			if( !validOperators.test( operator ) ) {
				MSQTA._Errors.getByIndexWithRange2( operator );
			}
			fieldValue = comparator[operator];
			parsedValue = this._getValueBySchema( fieldName, fieldValue );
			if( !parsedValue && parsedValue !== fieldData.zero ) {
				MSQTA._Errors.getByIndexWithRange3( databaseName, schemaName, fieldValue, parsedValue );
			}
			operatorsMapping[operator] = parsedValue;
		}
		operatorsCount = Object.keys( operatorsMapping ).length;
		
		if( operatorsCount === 2 ) {
			try {
				if( operatorsMapping['>'] && operatorsMapping['<'] ) {
					keyRange = MSQTA._IDBKeyRange.bound( operatorsMapping['>'], operatorsMapping['<'], true, true );
					
				} else if( operatorsMapping['>='] && operatorsMapping['<='] ) {
					keyRange = MSQTA._IDBKeyRange.bound( operatorsMapping['>='], operatorsMapping['<='] );
				
				} else if( operatorsMapping['>'] && operatorsMapping['<='] ) {
					keyRange = MSQTA._IDBKeyRange.bound( operatorsMapping['>'], operatorsMapping['<='], true, false );
				
				} else {
					keyRange = MSQTA._IDBKeyRange.bound( operatorsMapping['>='], operatorsMapping['<'], false, true );
				}
			} catch( e ) {
				MSQTA._Errors.getByIndexWithRange5();
			}
			
		} else if( operatorsCount === 1 ) {
			if( operatorsMapping['>'] ) {
				keyRange = MSQTA._IDBKeyRange.lowerBound( operatorsMapping['>'], true );
				
			} else if( operatorsMapping['>='] ) {
				keyRange = MSQTA._IDBKeyRange.lowerBound( operatorsMapping['>='] );
			
			} else if( operatorsMapping['<'] ) {
				keyRange = MSQTA._IDBKeyRange.upperBound( operatorsMapping['<'], true );
			
			} else if( operatorsMapping['<='] ) {
				keyRange = MSQTA._IDBKeyRange.upperBound( operatorsMapping['<='] );
			
			} else {
				keyRange = MSQTA._IDBKeyRange.only( operatorsMapping['='] );
			}
		}
		
		if( !keyRange ) {
			MSQTA._Errors.getByIndexWithRange4();
		}
		indexData.keyRange = keyRange;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database using ' + ( indexData.pk ? 'primary key: "' + indexData.pk + '"' : 'index: "' + indexData.index + '"' ) + ' with range' );
		}
		
		this._getWithIDBKeyRange( indexData, userCallback, userContext );
	},
	
	_getWithIDBKeyRange: function( range, callback, context ) {
		// agriou all params
		var closureData = {
			range: range,
			callback: callback || MSQTA._Helpers.defaultCallback,
			context: context || window,
			self: this
		};
	
		(function( closureData ) {
			var self = closureData.self,
				ORM = self._ORM,
				range = closureData.range,
				pk = range.pk, index = range.index, keyRange = range.keyRange,
				req = ORM._openUserDatabase(),
				// IDBDatabase object of the user database
				userDatabase,
				databaseName = ORM._name,
				schemaName = self._name,
				data = [];
			
			var grabRecords = function( e ) {
				var cursor = e.target.result;
				if( cursor ) {
					data.push( cursor.value );
					cursor.continue();
				} else {
					// done
					userDatabase.close();
					closureData.callback.call( closureData.context, data );
				}
			};
			
			req.onsuccess = function( e ) {
				var db = e.target.result,
					transaction = db.transaction( [ schemaName ], MSQTA._IDBTransaction.READ_ONLY );
					objectStore = transaction.objectStore( schemaName );
				
				// save the reference for the clsoe part
				userDatabase = db;
				
				if( pk ) {
					objectStore.openCursor( keyRange ).onsuccess = grabRecords;

				} else {
					objectStore.index( index ).openCursor( keyRange ).onsuccess = grabRecords;
				}
			};
		})( closureData );
	},
	/***************************************/
	put: function( datas, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			fields = this._fieldsName, fieldName,
			pk = this._primaryKey,
			schemaName = this._name,
			data, i, l, k, m = fields.length;
		
		if( !( datas instanceof Array ) && typeof datas === 'object' ) {
			datas = [ datas ];
		}
		
		for( i = 0, l = datas.length; i < l; i++ ) {
			data = datas[i];
			for( k = 0; k < m; k++ ) {
				fieldName = fields[k];
				data[fieldName] = this._getValueBySchema( fieldName, data[fieldName] );
				delete data[pk];
			}
		}

		if( ORM._isBatchMode ) {
			return datas;
		}
		
		ORM._preExec( {
			type: 'put',
			schema: schemaName,
			
			data: datas,
			callback: userCallback,
			context: userContext
		} );
	},
/***************************************/
	set: function( setDatas, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			schemaFields = this._schemaFields,
			databaseName = ORM._name,		
			whereData, setData,
			cmpFields, newValues,
			fieldName, fieldValue,
			whereClause = {}, setClause = {},
			queries = [], i, l;
		
		if( !setDatas || typeof setDatas !== 'object' ) {
			MSQTA._Errors.set1( databaseName, schemaName, setDatas );
		}
		
		if( !( setDatas instanceof Array ) ) {
			setDatas = [ setDatas ];
		}
		
		for( i = 0, l = setDatas.length; i < l; i++ ) {
			setData = setDatas[i];
			
			if( !setData.data || typeof setData.data !== 'object' || !Object.keys( setData.data ).length ) {
				MSQTA._Errors.set2( databaseName, schemaName, setData.data );
			}
			
			if( setData.target ) {
				if( typeof setData.target !== 'object' || !Object.keys( setData.target ).length ) {
					MSQTA._Errors.set3( databaseName, schemaName, setData.target );
				}
			// can be empty
			} else {
				setData.target = [];
			}
			
			cmpFields = setData.target;
			// check cmpFields validity
			for( fieldName in cmpFields ) {
				fieldValue = cmpFields[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
					MSQTA._Errors.set4( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				whereClause[fieldName] = parsedValue;
			}
			// whereClause can be empty
			
			newValues = setData.data;
			// check newValues validity
			for( fieldName in newValues ) {
				fieldValue = newValues[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
					MSQTA._Errors.set5( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				setClause[fieldName] = parsedValue;
			}
			
			queries.push( { data: setClause, target: whereClause } );
			
			setClause = {};
			whereClause = {};
		}
		
		if( ORM._isBatchMode ) {
			return queries;
		}
		
		ORM._preExec( {
			type: 'set',
			schema: schemaName,
			indexes: this._indexes,
			primaryKey: this._primaryKey,
			data: queries,
			callback: userCallback,
			context: userContext
		} );
	},
/***************************************/
	del: function( ids, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			pk = this._primaryKey,
			schemaName = this._name,
			id, parsedValue, 
			t, whereClause = [],
			i, l;
		
		if( !pk ) {
			MSQTA._Errors.del1( databaseName, schemaName );
		}
		
		if( !ids ) {
			MSQTA._Errors.del2( databaseName, schemaName );
		}
		
		if( !( ids instanceof Array ) ) {
			ids = [ ids ];
		}
		
		for( i = 0, l = ids.length; i < l; i++ ) {
			id = ids[i];
			parsedValue = this._getValueBySchema( pk, id );
			if( !parsedValue ) {
				MSQTA._Errors.del3( databaseName, schemaName, id, parsedValue );
			}
			t = {};
			t[pk] = parsedValue;
			whereClause.push( t );
		}
		
		// the only way that whereClause can be empty is that ids param must be a empty []
		if( ORM._isBatchMode ) {
			return whereClause;
		}
		
		ORM._preExec( {
			type: 'del',
			schema: schemaName,
			primaryKey: pk,
			
			data: whereClause,
			callback: userCallback,
			context: userContext
		} );
	},
/***************************************/
	destroy: function( userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: destroying "' + schemaName + '" from the "' + databaseName + '" database' );	
		}
		
		ORM._preExec( {
			type: 'destroy',
			schema: schemaName,
			callback: userCallback,
			context: userContext
		} );
	},
/***************************************/
	empty: function( userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name;

		if( this.devMode ) {
			console.log( 'MSQTA-ORM: emptying "' + schemaName + '" from the "' + databaseName + '" database' );	
		}
		
		ORM._preExec( {
			type: 'empty',
			schema: schemaName,
			callback: userCallback,
			context: userContext
		} );
	}
};
MSQTA._ORM.WebSQL = {
	
	Schema: function( schemaDefinition ) {
		return MSQTA._Helpers.instantiateSchema( { 
			ORM: this.constructor._ORM,
			schemaPrototype: MSQTA._Schema.WebSQL,
			schemaDefinition: schemaDefinition,
			implementation: 'webSQL',
			args: arguments
		} );
	},
	
	_open: function() {
		// put in a close to handle various open at "the same time"
		(function( self ) {
			self._testigoDB = window.openDatabase( '__msqta__', 1, '', MSQTA._Helpers.webSQLSize );
			self._testigoDB.transaction( function( tx ) {
				tx.executeSql( 'CREATE TABLE IF NOT EXISTS databases( id INTEGER PRIMARY KEY, name TEXT UNIQUE, schemas TEXT )' );
				tx.executeSql( 'SELECT * FROM databases WHERE name = "' + self._name + '"', [], function( tx, results ) {
					self._open2( results );
				} );
			} );
		})( this );
	},
	
	_open2: function( results ) {
		var rows = results.rows;
		// store here all the schemaKeepTrack definitions
		this._schemasDefinition = rows.length ? JSON.parse( rows.item( 0 ).schemas ) : {};
		
		// this holds queries to be run when a sql fails
		// this is used when the multiples queries are connected
		// but they cannot be runs all in a single transaction
		this._errorQueries = [];
		// this holds all the interal queries that are made when
		// a schema is initialized, these queries are more important
		// that this._queries in terms at the moment of execute the next query
		this._queriesInternal = [];
		
		this._userDB = window.openDatabase( this._name, 1, '', MSQTA._Helpers.webSQLSize );

		if( this._initCallback ) {
			this._initCallback.call( this.initContext || window );
		}
		
		this._initSchemas();
	},

	_initSchema: function( Schema ) {
		this._schemasToInit.push( Schema );
		if( !this._isBlocked ) {
			this._initSchemas();
		}
	},
	
	_initSchemas: function() {
		var self = this,
			databaseName = this._name;
		
		if( this._schemasToInit.length ) {
			this._schemasToInit.shift()._init2();
			
		} else {
			this._endSchemasInitialization();
		}
	},
	
	_endSchemasInitialization: function() {
		this._isBlocked = false;
	},
	
	_saveSchemaOnTestigoDatabase: function( callback, context ) {
		var self = this,
			databaseName = this._name,
			schemasDefinition = this._schemasDefinition;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: saving schema definition in the testigo database to keep tracking future changes on it' );
		}
		
		this._testigoDB.transaction( function( tx ) {
			tx.executeSql( 'REPLACE INTO databases( name, schemas ) VALUES( "' + databaseName + '", ' + "'" + JSON.stringify( schemasDefinition ) + "'" + ')', [], function() {
				callback.call( context );
			} );
		} );
	},
	
	_deleteUserDatabase: function( callback, context ) {
		this.destroy( callback, context );
	},
	
	_deleteUserSchema: function( Schema, queryData ) {
		var schemaName = Schema._name;
		
		delete this._Schemas[schemaName];
		MSQTA._Helpers.dimSchemaInstance( Schema );
	
		this._saveSchemaOnTestigoDatabase( queryData.userCallback, queryData.userContext );
	},
	
	/**
	* @context SQLTransaction
	*/
	_error: function( error ) {
		console.error( 'MSQTA-ORM: query has failed: \n\t' + 'code: ' + error.code + '\n\t' + 'message: ' + error.message );
		// continue with more shit
		this._results( false );
	},
/***************************************/
	_transaction: function( queryData ) {
		var callback = queryData.userCallback,
			context = queryData.userContext;
		
		if( callback && typeof callback !== 'function' ) {
			throw Error( 'MSQTA-ORM: supplied callback is not a function: ', callback );
		}
		// use default callback
		if( !callback ) {
			queryData.userCallback = MSQTA._Helpers.defaultCallback;
		}
		
		if( context && typeof context !== 'object' ) {
			throw Error( 'MSQTA-ORM: supplied context is not an object: ', context );
		}
		// use window as context
		if( !context ) {
			queryData.userContext = window;
		}

		// only allow a query per time
		if( this._isWaiting ) {
			if( queryData.isInternal ) {
				this._queriesInternal.push( queryData );
			} else {
				this._queries.push( queryData );
			}
			return;
		}
		this._isWaiting = true;
		
		this._transaction2( queryData );
	},
	
	_transaction2: function( queryData ) {
		// save a refenrece for when the transaction is done
		this._lastQuery = queryData;
		
		// save a reference used in the success and error functions
		var self = this,
			query = queryData.query;
		
		if( !( query instanceof Array ) ) {
			query = [ query ];
		}
		
		var success = function( tx, results ) {
			self._results( results );
		};
		
		var error = function( tx, error ) {
			self._error( error );
		};
		
		this._userDB.transaction( function( tx ) {			
			var q,
				l = query.length;

			while( l-- ) {
				q = query.shift();
				if( self.devMode ) {
					console.log( 'MSQTA-ORM: executing the query: \n\t' + q );
				}
				tx.executeSql( q, [], !l ? success : MSQTA._Helpers.noop, error );
			}
		} );
	},
	
	/**
	* @context SQLTransaction
	*/
	_results: function( results ) {
		queryData = this._lastQuery;
		
		this._isWaiting = false;
		// comes from _error()
		if( !results ) {
			results = false;
		}
		
		// still more processing (only select clauses falls here)
		if( queryData.callback && queryData.context ) {
			// go to the original caller
			queryData.callback.call( queryData.context, results, queryData );
			
		// get back with the user
		} else {
			// only delete, update, insert quries falls here
			queryData.userCallback.call( queryData.userContext, queryData.isInsert ? results.insertId : results.rowsAffected );
		}
		
		this._continue();
	},
	
	_continue: function() {
		if( !this._isWaiting ) {
			// more queries to be executed in the queue
			if( this._queriesInternal.length ) {
				this._transaction( this._queriesInternal.shift() );
			} else if( this._queries.length ) {
				this._transaction( this._queries.shift() );
			}
		}
	},
/***************************************/
/***************************************/
	batch: function( data, callback, context ) {
		var databaseName = this._name,
			batchData;
		
		if( !( data instanceof Array ) || !data.length ) {
			MSQTA._Errors.batch1( databaseName, data );
		}
		
		if( typeof callback !== 'function' ) {
			callback = MSQTA._Helpers.defaultCallback;
		}
		if( typeof context !== 'object' ) {
			context = window;
		}
		// agrup arguments for a better manipulation
		batchData = {
			data: data,
			callback: callback,
			context: context
		};
		
		if( this._isBatchMode ) {
			this._batchsStack.push( batchData );
			return;
		}
		// start batch mode, this means that the methods set, put and del
		// will not execute the query, instead them will be return the querty string
		this._isBatchMode = true;
		
		this._batch( batchData );
	},
	
	_batch: function( batchData ) {
		var data = batchData.data,
			typeValids = [ 'set', 'put', 'del' ],
			queryData, Schema, type,
			i = 0, l = data.length;
		
		for( ; i < l; i++ ) {
			queryData = data[i];
			Schema = queryData.schema;
			if( !( Schema instanceof MSQTA._Schema ) ) {
				MSQTA._Errors.batch2( Schema );
			}
			type = queryData.type.toLowerCase();
			if( typeValids.indexOf( type ) === -1 ) {
				MSQTA._Errors.batch3( type );
			}
			// save the queries
			this._queries = this._queries.concat( { query: Schema[type]( queryData.data ) } );
		}
		// the last one will the return point
		var t = this._queries[this._queries.length-1];
		t.callback = batchData.callback;
		t.context = batchData.context;
		
		this._isBatchMode = false;
		
		// exec the queries
		this._continue();

		// this happends when batch is called when another
		// batch process is running
		if( this._batchsStack.length ) {
			this._batch( this._batchsStack.shift() );
		}
	},
/***************************************/
/***************************************/
	destroy: function( callback, context ) {
		if( typeof callback !== 'function' ) {
			callback = MSQTA._Helpers.noop;
		}
		
		console.error( 'MSQTA: destroy: deleting a database is not implemented in webSQL standard and will never do.\n To delete a database you need to do manually.' );
		
		callback.call( context || window );
	},
/***************************************/
/***************************************/
	_addQueryError: function( query ) {
		this._errorQueries.push( query );
		return this._errorQueries.length-0;
	},
	
	_removeQueryError: function( id ) {
		this._errorQueries.splice( id, 1 );
	}
};
MSQTA._Schema.WebSQL = {

	_init: function() {
		var schemaFields = this._schemaFields,
			fieldData, fieldName,
			ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			tableStruc = [], primaryKey = this._primaryKey,
			attrs, indexesSQL = {}, isIndex, isUnique,
			createTableQuery,
			// used when forceDestroy property is setted
			dropTableQuery,
			schemaKeepTrack = {};
		
		for( fieldName in schemaFields ) {
			fieldData = schemaFields[fieldName];
			attrs = [];
			if( primaryKey === fieldName ) {
				attrs.push( 'PRIMARY KEY' );
				
			} else {
				isIndex = fieldData.index;
				isUnique = fieldData.unique;
				if( isIndex && isUnique ) {	
					// CREATE UNIQUE INDEX index_name ON table_name( column_name )
					indexesSQL[fieldName] = this._getIndexUniqueQuery( schemaName, fieldName );
					
				} else if( isUnique ) {
					attrs.push( 'UNIQUE' );
				
				} else if( isIndex ) {
					// CREATE INDEX index_name ON table_name( column_name )
					indexesSQL[fieldName] = this._getIndexQuery( schemaName, fieldName );
				}
			}
			
			// re set schema
			this._resetSchemaAt( fieldName );
			// this is one is store in the testigo database to 
			// keep tracking future changes
			schemaKeepTrack[fieldName] = {
				type: fieldData.type,
				index: fieldData.index,
				unique: fieldData.unique
			};
			
			// for the CREATE TABLE query string
			tableStruc.push( fieldName + ' ' + schemaFields[fieldName].real + ( attrs.length ? ' ' + attrs.join( ' ' ) : '' ) );
		}
		
		createTableQuery = 'CREATE TABLE "' + schemaName + '" ( ' + tableStruc.join( ', ' ) + ' )';
		// save a reference for latter usage
		this._createTableQuery = createTableQuery;
		// this used to detect schema changes
		this._schemaKeepTrack = schemaKeepTrack;
		// the indexes
		this._indexesSQL = indexesSQL;
		// this will ppoulated (if there the case) in this._checkSchemaChanges()
		this._indexesToDelete = [];
		
		ORM._initSchema( this );
	},
	
	_init2: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			
			createTableQuery = this._createTableQuery,
			dropTableQuery,
		
			registeredSchemaDefinition, currentSchemaDefinition;
		
		if( this.forceDestroy ) {
			this._isSchemaDropped = true;
			
			dropTableQuery = '--MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the "' + databaseName + '" ddatabase, then it will recreate again\n\tDROP TABLE ' + schemaName;
		
			ORM._transaction( { query: [ dropTableQuery, createTableQuery ], context: this, callback: this._updateSchema5, isQueryInternal: true } );
		
		// check for schema changes
		} else {
			if( this.devMode ) {
				console.log( 'MSQTA.ORM: checking for schema changes in "' + schemaName + '" from the "' + databaseName + '" datatabase' );
			}
			currentSchemaDefinition = { fields: this._schemaKeepTrack, primaryKey: this._primaryKey };
			registeredSchemaDefinition = ORM._schemasDefinition[schemaName];
			// a new schema to be created
			if( !registeredSchemaDefinition ) {
				// save a reference
				ORM._schemasDefinition[schemaName] = currentSchemaDefinition;
				this._ORM._saveSchemaOnTestigoDatabase( this._createSchema, this );

			// check for schema changes
			} else {
				this._checkSchemaChanges( registeredSchemaDefinition, currentSchemaDefinition );
			}
		}
	},
	
	_getIndexUniqueQuery: function( schemaName, fieldName ) {
		return 'CREATE UNIQUE INDEX ' + schemaName + '_' + fieldName + ' ON ' + schemaName + ' ( ' + fieldName + ' )';
	},
	
	_getIndexQuery: function( schemaName, fieldName ) {
		return  'CREATE INDEX ' + schemaName + '_' + fieldName + ' ON ' + schemaName + ' ( ' + fieldName + ' )';
	},
	
	_checkSchemaChanges: function( registeredSchemaDefinition, currentSchemaDefinition ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			isNewSchema = false,
			registeredFieldsData = registeredSchemaDefinition.fields,
			currentFieldsData = currentSchemaDefinition.fields,
			registeredFieldData, currentFieldData, fieldName,
			registeredIndexesSQL = {},
			currentIndexesSQL = this._indexesSQL;
		
		for( fieldName in registeredFieldsData ) {
			registeredFieldData = registeredFieldsData[fieldName];
			currentFieldData = currentFieldsData[fieldName];
			
			// the field has been deleted
			if( !currentFieldData ||
			// type field has changed
			registeredFieldData.type !== currentFieldData.type ) {
				isNewSchema = true;
				break;
			}
			
			// in the meantime, get the index of the regstered
			if( registeredFieldData.index && registeredFieldData.unique ) {
				registeredIndexesSQL[fieldName] = this._getIndexUniqueQuery( schemaName, fieldName );
			} else if( registeredFieldData.index ) {
				registeredIndexesSQL[fieldName] = this._getIndexQuery( schemaName, fieldName );
			}
			
		}
		
		var registeredPK = registeredSchemaDefinition.primaryKey,
			currentPK = currentSchemaDefinition.primaryKey
		
		if( !isNewSchema ) {
			// chaging/droping the primaryKey required a new schema too
			if( ( registeredPK && ( !currentPK || registeredPK !== currentPK ) ) ||
			// previoulsy there is not a primary key, but now yes
			( !registeredPK && currentPK ) ) {
				isNewSchema = true;
			}
		}
		
		// we must to update the table strcutre
		// the update schema procecss drop the current schema and the create it again
		if( isNewSchema ) {
			if( this.devMode ) {
				console.log( '\tspecified schema differs to the registered one.\n\tStarting process to update schema!' );
			}
			// start the damn updateing process
			ORM._schemasDefinition[schemaName] = currentSchemaDefinition;
			this._ORM._saveSchemaOnTestigoDatabase( this._updateSchema, this );
		
		// check for indexes changes
		} else {
			var registeredIndexQuery, 
				currentIndexQuery,
				indexesToDelete = [];

			for( fieldName in registeredIndexesSQL ) {
				registeredIndexQuery = registeredIndexesSQL[fieldName];
				currentIndexQuery = currentIndexesSQL[fieldName];
				// the index has been dropped
				if( ( !currentIndexQuery ) ||
				// still the index exists but now has a different compisition
				( currentIndexQuery && registeredIndexQuery !== currentIndexQuery ) ) {
					indexesToDelete.push( fieldName );
				}
			}
			
			if( indexesToDelete.length ) {
				this._indexesToDelete = indexesToDelete;
				
				if( this.devMode ) {
					console.log( '\tschema is still the same, but its index(s) has been changed.\n\tMoving directly to step 6!' );
				}
				ORM._schemasDefinition[schemaName] = currentSchemaDefinition;
				this._ORM._saveSchemaOnTestigoDatabase( this._updateSchema5, this );
			
			} else {
				if( this.devMode ) {
					console.log( '\tno changes detected on its schema nor its index(s)!' );
				}
				this._updateSchema7();
			}
		}
	},
	
	_createSchema: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			databaseName = ORM._name,
			createTableQuery = this._createTableQuery;
		
		if( this.devMode ) {
			console.log( '\tupdating is not needed it, starting creation process' );
		}
		
		// create the new table
		ORM._transaction( { query: [ createTableQuery ], context: this, callback: this._updateSchema5, isQueryInternal: true } );
	},
	
	_updateSchema: function() {
		var ORM = this._ORM,
			newSchema = this._createTableQuery,
			schemaName = this._name,
			tempschemaName = schemaName + (+new Date()),
			// based on the newSchema we need to create in a form a backup, and the end we just will rename it
			createTempTableQuery = newSchema.replace( 'CREATE TABLE "' + schemaName + '"', 'CREATE TABLE "' + tempschemaName + '"' );

		// prepare the offset for the step2
		this._offset = 0;
		// and tempschemaName too
		this._tempschemaName = tempschemaName;
		
		if( this.devMode ) {
			console.log( '\t\t1) Creating table "' + tempschemaName + '" (this will be the new one at the end of the process)' );
		}
		
		ORM._transaction( { query: [ createTempTableQuery ], context: this, callback: this._updateSchema2, isQueryInternal: true } );
	},
	
	_updateSchema2: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			tempschemaName = this._tempschemaName,
			offset = this._offset,
			selectQuery,
			// this is already the new schema
			schemaFields = this._schemaFields;
		
		// this is case that any error ocurr here we can restore, this is because
		// this porces is not enclosed in a transaction
		this._queryErrorID = ORM._addQueryError( 'DROP TABLE ' + tempschemaName );
		
		// get all the records from the table with the oldSchema
		selectQuery = 'SELECT * FROM ' + schemaName + ' LIMIT ' + offset + ', 500';		
		if( this.devMode ) {
			console.log( '\t\t2) Fetching all rows from old schema "' + schemaName + '" by 500 rows per time' );
		}
	
		ORM._transaction( { query: [ selectQuery ], context: this, callback: this._updateSchema3, isQueryInternal: true } );
	},
	
	_updateSchema3: function( results ) {
		var ORM = this._ORM,
			// this is already the new schema
			schemaFields = this._schemaFields,
			schemaName = this._name,
			tempschemaName = this._tempschemaName,
			rows = results.rows,
			rowData, fieldName,
			schemaColData,
			insertQueryCols = [],
			insertQueryValues = [], newValues = [],
			insertQueries = [],
			i, l;
		
		if( !results ) {
			throw Error( 'MSQTA.ORM: fatal error on "' + schemaName + '", you have to destroy this schema to continue, use the set the param "forceDestroy" when you create this schema in your code to recreate this schema, everything will be lost!' );
		}
		
		// the old schema is empty
		if( !rows.length ) {
			if( this.devMode ) {
				console.log( '\t\t3) Old schema "' + schemaName + '" has no records on it, moving to next step' );
			}
			this._updateSchema4();
			return;
		}
		
		// prepare the cols in the insert query
		rowData = rows.item( 0 );
		for( fieldName in rowData ) {
			if( schemaFields[fieldName] ) {
				insertQueryCols.push( fieldName );
			}
		}
		// now check the defaults values for the new rows (rows that in the current does not exists)
		for( fieldName in schemaFields ) {
			schemaColData = schemaFields[fieldName];
			if( insertQueryCols.indexOf( fieldName ) === -1 ) {
				insertQueryCols.push( fieldName );
				newValues.push( schemaColData.zero );
			}
		}
		
		for( i = 0, l = rows.length; i < l; i++ ) {
			rowData = rows.item( i );
			for( fieldName in rowData ) {
				// get how this fieldName has to been in the new schema
				schemaColData = schemaFields[fieldName];
				if( schemaColData ) {
					if( schemaColData.isJSON ) {
						insertQueryValues.push( "'" + rowData[fieldName] + "'" );
					} else {
						insertQueryValues.push( schemaColData.sanitizer( rowData[fieldName], schemaColData.zero ) );
					}
				}
			}
			
			// make a row insert values
			insertQueries.push( 'INSERT INTO ' + tempschemaName + ' ( ' + insertQueryCols.join( ', ' ) + ' ) VALUES ( ' + insertQueryValues.concat( newValues ).join( ', ' ) + ' )' );
			insertQueryValues = [];
		}
		
		if( self.devMode ) {
			console.log( '\t\t3) Inserting rows from old schema "' + schemaName + '" into the new schema "' + tempschemaName + '"' );
		}
		
		// get for more records
		if( l === 500 ) {
			this._offset += 500;
			ORM._transaction( { query: insertQueries, context: this, callback: this._updateSchema2, isQueryInternal: true } );
		} else {
			ORM._transaction( { query: insertQueries, context: this, callback: this._updateSchema4, isQueryInternal: true } );
		}
	},
	
	_updateSchema4: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			dropQuery = 'DROP TABLE '  + schemaName,
			tempschemaName = this._tempschemaName,
			renameQuery = 'ALTER TABLE ' + tempschemaName + ' RENAME TO ' + schemaName;
		
		if( this.devMode ) {
			console.log( '\t\t4) Deleting old schema "' + schemaName + '"' );
			console.log( '\t\t5) Renaming new schema "' + tempschemaName + '" to "' + schemaName + '"' );
		}
		
		// i need this, because when you drop a table, automatcally its index are dropped aswell,
		// to avoid this process in _updateSchema5
		this._isSchemaDropped = true;
		
		ORM._transaction( { query: [ dropQuery, renameQuery ], context: this, callback: this._updateSchema5, isQueryInternal: true } );
	},
	
	_updateSchema5: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			indexQueries = [],
			indexesToDelete = this._indexesToDelete,
			fieldName, indexesSQL = this._indexesSQL;
		
		if( this.devMode ) {
			console.log( '\t\t6) Creating/removing index(s) (if there is any one)' );
		}
		
		// not need to drop an index is the referenced table has been dropped
		if( !this._isSchemaDropped ) {
			while( indexesToDelete.length ) {
				indexQueries.push( 'DROP INDEX ' + databaseName + '_' + indexesToDelete.shift() );
			}
		} else {
			// no more need it
			delete this._isSchemaDropped;
		}
		
		// DROP INDEX queries + CREATE INDEX queries
		for( fieldName in indexesSQL ) {
			indexQueries.push( indexesSQL[fieldName] );
		}
		
		if( indexQueries.length ) {
			ORM._transaction( { query: indexQueries, context: this, callback: this._updateSchema6, isQueryInternal: true } );
			
		} else {
			this._updateSchema6();
		}
	},
	
	_updateSchema6: function() {
		var ORM = this._ORM;
		if( this.devMode ) {
			console.log( '\t\t7) Updating schema process has ended successful' );
		}

		// clean all
		ORM._removeQueryError( this._queryErrorID );
		delete this._tempschemaName;
		delete this._offset;
		delete this._queryErrorID;
		delete this._indexesToDelete;
		
		if( this.forceEmpty ) {
			this._updateSchema8();
		} else {
			this._updateSchema7();
		}
	},
	
	_updateSchema7: function() {
		var ORM = this._ORM;
		// clean more shit
		delete this._createTableQuery;
		delete this._indexesSQL;
		
		if( this._initCallback ) {
			this._initCallback.call( this._initContext || window );
		}
		delete this._initCallback;
		delete this._initContext;
		
		// continue
		ORM._initSchemas();
	},
	
	_updateSchema8: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			emptyQuery = '--MSQTA-ORM: "forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the "' + databaseName + '" database\n\tDELETE FROM ' + schemaName;
			
		ORM._transaction( { query: [ emptyQuery ], context: this, callback: this._updateSchema7, isQueryInternal: true } );
	},
/***************************************/
	get: function( searchValue, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaFields = this._schemaFields,
			fieldName,
			databaseName = ORM._name,
			schemaName = this._name,
			selectQuery,
			whereClause = [];
		
		if( !searchValue ) {
			MSQTA._Errors.get( databaseName, schemaName );
		}
		
		for( fieldName in schemaFields ) {
			whereClause.push( fieldName + ' = ' + this._getValueBySchema( fieldName, searchValue ) );
		}
		
		selectQuery = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' OR ' );
		
		ORM._transaction( { 
			query: selectQuery, 
			context: this,
			callback: this._processResults, 
			userCallback: userCallback, 
			userContext: userContext 
		} );
	},
	
	getByCallback: function( filterCallback, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaFields = this._schemaFields,
			fieldName,
			schemaName = this._name,
			selectQuery;

		if( typeof filterCallback !== 'function' ) {
			MSQTA._Errors.getByCallback( databaseName, schemaName );
		}
		
		selectQuery = 'SELECT * FROM ' + schemaName;
		
		ORM._transaction( { 
			query: selectQuery, 
			context: this, 
			callback: this._getByCallback, 
			userCallback: userCallback, 
			userContext: userContext,
			filterCallback: filterCallback
		} );
	},
	
	_getByCallback: function( results, queryData ) {
		var schemaFields = this._schemaFields,
			rows = results.rows,
			i = 0, l = rows.length,
			row, fieldName,
			filterCallback = queryData.filterCallback,
			t, data = [];
		
		for( ; i < l; i++ ) {
			row = rows.item( i );
			// copy each row to t, this is beacuse the results set is inumtable
			t = {};
			for( fieldName in row ) {
				t[fieldName] = schemaFields[fieldName].toJS( row[fieldName] );
			}
			if( filterCallback( t ) ) {
				data.push( t );
			}
		}
		
		// comeback
		queryData.userCallback.call( queryData.userContext, data );
	},
	
	getByIndex: function( fieldName, searchValue, userCallback, userContext ) {
		var ORM = this._ORM,	
			databaseName = ORM._name,
			schemaName = this._name,
			selectQuery, whereClause = [],
			fieldValue, parsedValue, i, l;
		
		if( this._primaryKey !== fieldName ) {
			if( this._indexes.indexOf( fieldName ) === -1 ) {
				MSQTA._Errors.getByIndex1( databaseName, schemaName, fieldName );
			}
		}
		
		if( !searchValue ) {
			MSQTA._Errors.getByIndex2( databaseName, schemaName );
		}
		
		if( !( searchValue instanceof Array ) ) {
			searchValue = [ searchValue ];
		}
		
		for( i = 0, l = searchValue.length; i < l; i++ ) {
			fieldValue = searchValue[i];
			parsedValue = this._getValueBySchema( fieldName, fieldValue );
			whereClause.push( fieldName + ' = ' + parsedValue );
		}
		
		// whereClause can be empty

		selectQuery = 'SELECT * FROM ' + schemaName + ( whereClause.length ? ' WHERE ' + whereClause.join( ' OR ' ) : '' );

		ORM._transaction( { 
			query: selectQuery, 
			context: this, 
			callback: this._processResults, 
			userCallback: userCallback, 
			userContext: userContext
		} );
	},
	
	getByIndexWithRange: function( fieldName, comparator, userCallback, userContext ) {
		var ORM = this._ORM,	
			databaseName = ORM._name,
			schemaName = this._name,
			schemaFields = this._schemaFields,
			validOperators = /^(?:>|<|>=|<=|=)$/, operator,
			whereClause = [], fieldValue, parsedValue,
			selectQuery;
		
		if( this._primaryKey !== fieldName ) {
			if( this._indexes.indexOf( fieldName ) === -1 ) {
				MSQTA._Errors.getByIndexWithRange1( databaseName, schemaName, fieldName );
			}
		}
		
		for( operator in comparator ) {
			if( !validOperators.test( operator ) ) {
				MSQTA._Errors.getByIndexWithRange2( operator );
			}
			fieldValue = comparator[operator];
			parsedValue = this._getValueBySchema( fieldName, fieldValue );
			if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
				MSQTA._Errors.getByIndexWithRange3( databaseName, schemaName, fieldValue, parsedValue );
			}
			whereClause.push( fieldName + ' ' + operator + ' ' + parsedValue );
		}
		
		if( !whereClause.length ) {
			MSQTA._Errors.getByIndexWithRange4();
		}
		
		selectQuery = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' AND ' );
		
		ORM._transaction( { 
			query: selectQuery, 
			context: this, 
			callback: this._processResults, 
			userCallback: userCallback, 
			userContext: userContext
		} );
	},

	getAll: function( userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			selectAllQuery = 'SELECT * FROM ' + schemaName;

		ORM._transaction( {
			query: selectAllQuery, 
			context: this, 
			callback: this._processResults, 
			userCallback: userCallback, 
			userContext: userContext
		} );
	},
	
	getWithLike: function( fields, likeData, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaFields = this._schemaFields,
			schemaName = this._name,
			i, l, fieldName,
			likeType, searchValue;
			selectAllQueryWithLike, whereClause = [];
		
		if( typeof likeData !== 'object' ) {
			MSQTA._Errors.getWithLike1();
		}
		
		likeType = Object.keys( likeData )[0];
		searchValue = likeData[likeType];
		if( !likeType || !searchValue ) {
			MSQTA._Errors.getWithLike1();
		}
		
		if( likeType === 'both' ) {
			searchValue = '"%' + searchValue + '%"';
		} else if( likeType === 'start' ) {
			searchValue = '"' + searchValue + '%"';
		} else if( likeType === 'end' ) {
			searchValue = '"%' + searchValue + '"';
		}
		
		if( !( fields instanceof Array ) ) {
			fields = [ fields ];
		}
		for( i = 0, l = fields.length; i < l; i++ ) {
			fieldName = fields[i];
			if( !schemaFields[fieldName] ) {
				MSQTA._Errors.getWithLike2( databaseName, schemaName, fieldName );
			}
			whereClause.push( fieldName + ' LIKE ' + searchValue );
		}
		
		selectAllQueryWithLike = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' OR ' );

		ORM._transaction( { 
			query: selectAllQueryWithLike, 
			context: this, 
			callback: this._processResults, 
			userCallback: userCallback, 
			userContext: userContext 
		} );
	},

	_processResults: function( results, queryData ) {
		var schemaFields = this._schemaFields,
			rows = results.rows,
			i = 0, l = rows.length,
			row, fieldName,
			t, data = [];
		
		for( ; i < l; i++ ) {
			row = rows.item( i );
			t = {};
			// copy each row to t, this is beacuse the results set is inumtable
			for( fieldName in row ) {
				t[fieldName] = schemaFields[fieldName].toJS( row[fieldName] );
			}
			data.push( t );
		}
		
		queryData.userCallback.call( queryData.userContext, data );
	},
/***************************************/
	put: function( datas, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			fields = this._fieldsName, fieldName,
			schemaName = this._name,
			insertQueryCols,
			insertQueryValues,
			insertQueries = [],
			data, i, l;
		
		if( !( datas instanceof Array ) && typeof datas === 'object' ) {
			datas = [ datas ];
		}
		
		for( i = 0, l = datas.length; i < l; i++ ) {
			data = datas[i];
			insertQueryCols = [];
			insertQueryValues = [];
			for( fieldName in data ) {
				if( fields.indexOf( fieldName ) === -1 ) {
					MSQTA._Errors.put1( databaseName, schemaName, fieldName );
				}
				insertQueryCols.push( fieldName );
				insertQueryValues.push( this._getValueBySchema( fieldName, data[fieldName] ) );
			}
			if( !insertQueryCols.length ) {
				MSQTA._Errors.put2( databaseName, schemaName );
			}
			insertQueries.push( 'INSERT INTO ' + schemaName + ' ( ' + insertQueryCols.join( ', ' ) + ' ) ' + 'VALUES ( ' + insertQueryValues.join( ' , ' ) + ' )' );
		}
		
		if( ORM._isBatchMode ) {
			return insertQueries;
		}
		
		ORM._transaction( { 
			query: insertQueries, 
			userCallback: userCallback, 
			userContext: userContext,
			// need it to get the lastID
			isInsert: true
		} );
	},	
/***************************************/
	/*
	set( {
		data: { comments: 'gay' }
	} );
	set( {
		data: { comments: 'gay' },
		target: { id: 1 } 
	} );
	set( [ {
		data: { comments: 'trolazo' },
		target: { id: 1 }
	} ] );
	*/
	set: function( setDatas, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			databaseName = ORM._name,
			schemaFields = this._schemaFields,
			whereData, setData,
			cmpFields, newValues,
			fieldName, fieldValue,
			whereClause = [],
			setClause = [],
			queries = [], i, l;
		
		if( !setDatas || typeof setDatas !== 'object' ) {
			MSQTA._Errors.set1( databaseName, schemaName, setDatas );
		}
		
		if( !( setDatas instanceof Array ) ) {
			setDatas = [ setDatas ];
		}
		
		for( i = 0, l = setDatas.length; i < l; i++ ) {
			setData = setDatas[i];
			
			if( !setData.data || typeof setData.data !== 'object' || !Object.keys( setData.data ).length ) {
				MSQTA._Errors.set2( databaseName, schemaName, setData.data );
			}
			
			if( setData.target ) {
				if( typeof setData.target !== 'object' || !Object.keys( setData.target ).length ) {
					MSQTA._Errors.set3( databaseName, schemaName, setData.target );
				}	
			// can be empty
			} else {
				setData.target = [];
			}
			
			cmpFields = setData.target;
			// check cmpFields validity
			for( fieldName in cmpFields ) {
				fieldValue = cmpFields[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue ) {
					MSQTA._Errors.set4( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				whereClause.push( fieldName + ' = ' + parsedValue );
			}
			// whereClause can be empty
			
			newValues = setData.data;
			// check newValues validity
			for( fieldName in newValues ) {
				fieldValue = newValues[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
					MSQTA._Errors.set5( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				setClause.push( fieldName + ' = ' + parsedValue );
			}
			
			queries.push( 'UPDATE ' + schemaName + ' SET ' + setClause.join( ', ' ) + ( whereClause.length ? ' WHERE ' + whereClause.join( ' AND ' ) : '' ) );
			
			setClause = [];
			whereClause = [];
		}
		
		if( ORM._isBatchMode ) {
			return queries;
		}
		
		ORM._transaction( { 
			query: queries, 
			userCallback: userCallback, 
			userContext: userContext 
		} );
	},
/***************************************/
	del: function( ids, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			pk = this._primaryKey,
			schemaName = this._name,
			id, parsedValue, 
			deleteQuery, whereClause = [],
			i, l;
		
		if( !pk ) {
			MSQTA._Errors.del1( databaseName, schemaName );
		}
		
		if( !ids ) {
			MSQTA._Errors.del2( databaseName, schemaName );
		}
		
		if( !( ids instanceof Array ) ) {
			ids = [ ids ];
		}
		
		for( i = 0, l = ids.length; i < l; i++ ) {
			id = ids[i];
			parsedValue = this._getValueBySchema( pk, id );
			if( !parsedValue ) {
				MSQTA._Errors.del3( databaseName, schemaName, id, parsedValue );
			}
			
			whereClause.push( pk + ' = ' + parsedValue );
		}
		
		// the only way that whereClause can be empty is that ids param must be a empty []
		
		deleteQuery = 'DELETE FROM ' + schemaName + ( whereClause.length ? ' WHERE ' + whereClause.join( ' OR ' ) : '' );
		
		if( ORM._isBatchMode ) {
			return [ deleteQuery ];
		}
		
		ORM._transaction( { 
			query: deleteQuery,
			primaryKey: pk,
			userCallback: userCallback, 
			userContext: userContext 
		} );
	},
/***************************************/
	destroy: function( userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			dropQuery = 'DROP TABLE ' + schemaName;
		
		ORM._transaction( {
			callback: this._destroy,
			context: this,
			query: dropQuery, 
			userCallback: userCallback, 
			userContext: userContext 
		} );
	},
	
	_destroy: function( results, queryData ) {
		var ORM = this._ORM;
		
		if( results ) {
			ORM._deleteUserSchema( this, queryData );
		}
	},
/***************************************/
	empty: function( userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			deleteQuery = 'DELETE FROM ' + schemaName;

		ORM._transaction( { 
			query: deleteQuery, 
			userCallback: userCallback, 
			userContext: userContext 
		} );
	}
};
