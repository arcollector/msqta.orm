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
MSQTA._Messages = {
	'app is working': 'The application is currently manipulating the database, please wait a moment, leaving the application right now will be cause that your database may get broken!',
};
/***************************************/
/***************************************/
MSQTA._Helpers = {
	noop: function() {
	},
	
	defaultCallback: function() {
		console.log( 'MSQTA-ORM: default callback used' );
		// is it WebSQL?
		if( arguments[1] && arguments[1].rows ) {
			var rows = arguments[1].rows, i = 0, l = rows.length;
			for( ; i < l; i++ ) {
				console.log( rows.item( i ) );
			}
		} else {
			console.log( arguments[0] );
		}
	},
	
	blockWindow: function() {
		window.addEventListener( 'beforeunload', this.preLeaveWindow );
	},
	unblockWindow: function() {
		window.removeEventListener( 'beforeunload', this.preLeaveWindow );
	},
	/**
	* @scope window [beforeunload]
	*/
	preLeaveWindow: function( e ) {
		return ( e.returnValue = MSQTA._Messages['app is working'] );
	},
	
	webSQLSize: 2 * 1024 * 1024,
/***************************************/
	getCaster: function( dataType ) {
		if( dataType === 'object' || dataType === 'array' ) {
			return this.castObj;
		}
		if( dataType === 'datetime' || dataType === 'date' || dataType === 'time' ) {
			return this.castDateTypeOf;
		}
		if( dataType === 'boolean' ) {
			return this.castBoolean;
		} 
		return this.castGeneric;
	},
	
	castObj: function( value ) {
		return JSON.parse( value );
	},
	
	castDateTypeOf: function( value ) {
		var d = new Date( value );
		d.setMinutes( d.getMinutes() + d.getTimezoneOffset() );
		return d;
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

	instantiateSchema: function( ORM, schemaPrototype, schemaDefinition, implementation, args ) {
		var options = {},
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
		date: 'INTEGER',
		time: 'INTEGER',
		datetime: 'INTEGER',
		float: 'REAL',
		boolean: 'INTEGER'
	},
	
	webSQLZeros: {
		string: '',
		integer: 0,
		object: '{}',
		array: '[]',
		date: -2209075200000,
		time: -2209075200000,
		datetime: -2209075200000,
		float: 0,
		boolean: 0
	},
	
	indexedDBZeros: {
		string: '',
		int: 0,
		integer: 0,
		text: '',
		object: {},
		array: [],
		date: -2209075200000,
		time: -2209075200000,
		datetime: -2209075200000,
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
		schemaFieldData.zero = allowNull ? null : dataTypeZeros[type];
		// sanitizer function
		schemaFieldData.sanitizer = implementation === 'webSQL' ? MSQTA._Helpers.WebSQLSanitizers.getSanitizer( type ) : MSQTA._Helpers.IndexedDBSanitizers.getSanitizer( type );
		// this is needed because on both implementation these fields type are stores in integers (milliseconds)
		// then when the user retrive a record with a data type field, we need to cast it to a date object
		schemaFieldData.isDate = type === 'date' || type === 'time' || type === 'datetime';
		
		if( implementation === 'webSQL' ) {
			schemaFieldData.abstract = type;
			schemaFieldData.real = realDataType + ( allowNull ? ' NULL' : '' );
			schemaFieldData.isJSON = type === 'object' || type === 'array';
			schemaFieldData.toJS = MSQTA._Helpers.getCaster( type );
		}
	},
	
	tryJSONDate: function( value ) {
		return (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/).test( value ) ? new Date( value ) : false;
	},
	
	tryMillisecondsDate: function( value ) {
		var d;
		value -= 0;
		if( value ) {
			d = new Date( value );
			if( isNaN( d-0 ) ) {
				return false;
			}
			return d;
		}
		return false;
	},
	
	resetTimeDate: function( dateObj ) {
		dateObj.setHours( 0 );
		dateObj.setMinutes( 0 );
		dateObj.setSeconds( 0 );
		dateObj.setMilliseconds( 0 );
	},
	
	resetDateDate: function( dateObj ) {
		dateObj.setFullYear( 0 );
		dateObj.setDate( 0 );
		dateObj.setMonth( 0 );
	},
	
	getUTCDateInMilliseconds: function( dateObj ) {
		return Date.UTC( dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds(), 0 )
	},
	
	copyObject: function( obj ) {
		return JSON.parse( JSON.stringify( obj ) );
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
			return MSQTA._Helpers.IndexedDBSanitizers.sanitizeDate;
		} 
		if( dataType === 'time' ) {
			return MSQTA._Helpers.IndexedDBSanitizers.sanitizeTime;
		} 
		if( dataType === 'datetime' ) {
			return MSQTA._Helpers.IndexedDBSanitizers.sanitizeDatetime;
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
	
	sanitizeObj: function( value, onZero ) {
		if( typeof value === 'undefined' ) {
			return onZero;
		}
		
		if( typeof value !== 'object' ) {
			// is null or zero
			if( !value ) {
				return onZero;
			}
			// number || string
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
		
		if( value instanceof Date ) {
			if( isNaN( value-0 ) ) {
				return onZero;
			}
			MSQTA._Helpers.resetTimeDate( value );
			return MSQTA._Helpers.getUTCDateInMilliseconds( value );
		}
		if( (d=MSQTA._Helpers.tryMillisecondsDate( value )) ) {
			MSQTA._Helpers.resetTimeDate( d );
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		if( (d=MSQTA._Helpers.tryJSONDate( value )) ) {
			MSQTA._Helpers.resetTimeDate( d );
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		// try to parse the date string
		m = /^(\d{4}-\d{2}-\d{2})/.exec( value );
		if( !m ) {
			return onZero;
		}
		m = m[1].split( '-' );
		return Date.UTC( m[0], m[1]-1, m[2], 0, 0, 0, 0 );
	},
	
	sanitizeTime: function( value, onZero ) {
		var m, d;
		
		if( value instanceof Date ) {
			if( isNaN( value-0 ) ) {
				return onZero;
			}
			MSQTA._Helpers.resetDateDate( value );
			return MSQTA._Helpers.getUTCDateInMilliseconds( value );
		}
		if( (d=MSQTA._Helpers.tryMillisecondsDate( value )) ) {
			MSQTA._Helpers.resetDateDate( d );
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		if( (d=MSQTA._Helpers.tryJSONDate( value )) ) {
			MSQTA._Helpers.resetDateDate( d );
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		// try to parse the date string
		m = /^(?:\d{4}-\d{2}-\d{2} )?(\d{2}):(\d{2})(?::(\d{2}))?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return Date.UTC( 0, 0, 0, m[1], m[2], m[3] || 0, 0 );
	},
	
	sanitizeDatetime: function( value, onZero ) {
		var m, d;
		
		if( value instanceof Date ) {
			if( isNaN( value-0 ) ) {
				return onZero;
			}
			MSQTA._Helpers.resetDateDate( value );
			return MSQTA._Helpers.getUTCDateInMilliseconds( value );
		}
		if( (d=MSQTA._Helpers.tryMillisecondsDate( value )) ) {
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		if( (d=MSQTA._Helpers.tryJSONDate( value )) ) {
			return MSQTA._Helpers.getUTCDateInMilliseconds( d );
		}
		// try to parse the date string
		m = /^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec( value );
		if( !m ) {
			return onZero;
		}
		return Date.UTC( m[1], m[2]-1, m[3], m[4]|| 0, m[5] || 0, m[6] || 0, 0 );
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
				try { 
					return JSON.parse( value );
				} catch( e ) {
					return onZero;
				}
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
	
	var databaseName = settings.name;
	if( !databaseName ) {
		throw Error( 'MSQTA-ORM: not database name has been specify!' );
	}
	if( databaseName === '__msqta__' ) {
		throw Error( 'MSQTA-ORM: __msqta__ is a reserved word!' );
	}
	if( !/^[\w][-.\w\d]+$/i.test( databaseName ) ) {
		throw Error( 'MSQTA-ORM: database name has invalid characters!' );
	}
	
	settings.callback = settings.callback || callback || MSQTA._Helpers.defaultCallback;
	settings.context = settings.context || context || window;
	
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

	// this.Schema is the function/constructor that creates schemas from
	// this current database, this.Schema._ORM holds the
	// reference to this database.
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
	
	if( schemaName === '__currents_ids__' ) {
		throw Error( 'MSQTA-ORM: __currents_ids__ is a reserved word!' );
	}
	if( !/^[\w][-\w\d]+$/i.test( schemaName ) ) {
		throw Error( 'MSQTA-ORM: schema name has invalid characters!' );
	}
	if( ORM._Schemas[schemaName] && !options.forceDestroy ) {
		throw Error( 'MSQTA-ORM: "' + schemaName + '" schema already exists on the "' + databaseName + '" database!' );
	}
	
	var schemaFields = schemaDefinition.fields;
	if( typeof schemaFields !== 'object' || !Object.keys( schemaFields ).length ) {
		throw Error( 'MSQTA-ORM: "' + schemaName + '" schema definition of the "' + databaseName + '" database is invalid!' );
	}
	
	var pk = schemaDefinition.primaryKey;
	// check if pk refers to a exisitnet colmun
	if( !pk || ( pk && !schemaFields[pk] ) ) {
		throw Error( 'MSQTA-ORM: primary key referes to a non-exisistent feld in the "' + schemaName + '" schema from the "' + databaseName + '" database!' );
	}
	if( schemaFields[pk].type !== 'integer' ) {
		throw Error( 'MSQTA-ORM: primary key must be of integer type on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
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
				throw Error( 'MSQTA-ORM: index type must be of the type: integer|float|string|date|time|datetime, on "' + schemaName + '" schema from the "' + databaseName + '" database!' );
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
