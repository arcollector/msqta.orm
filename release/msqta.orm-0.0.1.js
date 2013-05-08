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
MSQTA._ORM.IndexedDB = {
	
	Schema: function( schemaDefinition ) {
		return MSQTA._Helpers.instantiateSchema( this.constructor._ORM, MSQTA._Schema.IndexedDB, schemaDefinition, 'indexedDB', arguments );
	},
// ********************************/
// ********************************/
// ********************************/
	_SwapRecords: {
		init: function( settings ) {
			var ORM = settings.ORM,
				Schema = ORM._currentSchema,
				schemaName = Schema._name;

			this.ORM = ORM;
			this.key = 0;
			this.isAdvance = false;
			this.targetDB = null;
			this.baseDB = null;
			this.endCallback = settings.endCallback;
			this.endContext = settings.endContext;
			this.endArg = settings.endArg;
			this.processCallback = settings.processCallback;

			if( settings.isBaseDBMSQTA ) {
				this.openBaseDB = this.openTestigoDB;
				this.baseSchema = 'dump';
				this.openTargetDB = this.openUserDB;
				this.targetSchema = schemaName;
			} else {
				this.openBaseDB = this.openUserDB;
				this.baseSchema = schemaName;
				this.openTargetDB = this.openTestigoDB;
				this.targetSchema = 'dump';
			}
			
			this.getCursor();
		},
		
		openTestigoDB: function() {
			return this.ORM._openTestigoDatabase();
		},
		
		openUserDB: function() {
			return this.ORM._openUserDatabase();
		},
		
		getCursor: function() {
			var self = this,
				ORM = self.ORM,
				baseSchema = self.baseSchema,
				req = self.openBaseDB();
			
			req.onsuccess = function( e ) {
				self.baseDB = this.result;
				var transaction = self.baseDB.transaction( [ baseSchema ], MSQTA._IDBTransaction.READ_ONLY ),
					objectStore = transaction.objectStore( baseSchema ),
					req = objectStore.openCursor();
				
				req._self = self;
				req.onsuccess = self.getRecord;
			};
			
			req.onerror = ORM._initSchemaFail;
		},
		
		getRecord: function( e ) {
			var self = this._self,
				baseDB = self.baseDB,
				cursor = this.result;
			
			if( cursor ) {
				// cursor.advance() has been triggered
				if( self.isAdvance ) {
					self.isAdvance = false;
					baseDB.close();
					self.saveRecord( cursor.value );
				// initial case
				} else if( self.key === 0 ) {
					self.key++;
					baseDB.close();
					self.saveRecord( cursor.value );
				} else {
					self.isAdvance = true;
					cursor.advance( self.key );
					self.key++;
				}
			} else {
				baseDB.close();
				self.done();
			}
		},
		
		saveRecord: function( record ) {
			var self = this,
				ORM = self.ORM,
				targetSchema = self.targetSchema,
				req = self.openTargetDB();
			
			req.onsuccess = function( e ) {
				self.targetDB = this.result;
				var transaction = self.targetDB.transaction( [ targetSchema], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( targetSchema ),
					req = self.processCallback( objectStore, record, self.key );
				
				req._self = self;
				req.onsuccess = self.nextRecord;
				req.onerror = self.nextRecord;
			};
			
			req.onerror = ORM._initSchemaFail;
		},
		
		nextRecord: function( e ) {
			var self = this._self;
			
			self.targetDB.close();
			self.getCursor();
		},
		
		done: function() {
			this.endCallback.call( this.endContext, this.endArg );
		}
		
	},
// ********************************/
// ********************************/
// ********************************/
	_open: function() {
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: opening the testigo database "__msqta__"' );
		}
	
		MSQTA._Helpers.blockWindow();
		
		var self = this,
			databaseName = this._name,
			// __msqta__ is the place that all the know databases information are stores
			// we need this to take track of different version numbers of all user databases
			req = this._openTestigoDatabase();
		
		// create the __msqta__ schema (this only ocucrrs in the first run, latter onupgradeneeded never agina will be called)
		req.onupgradeneeded = function( e ) {
			var db = this.result,
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
			var db = this.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );

			// get the user database information in __msqta__
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = this.result;
		
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
		MSQTA._Helpers.unblockWindow();
		// trigger event
		this._initCallback.call( this._initContext, true );
		// trigger the schemas process
		this._initSchemas();
	},
	
	_deleteUserDatabase: function( callback, context ) {
		var self = this,
			databaseName = this._name,
			req = MSQTA._IndexedDB.deleteDatabase( databaseName );
		
		MSQTA._Helpers.blockWindow();
		req.onsuccess = function( e ) {
			// ahora debo borrar toda esa information de __msqta__.databases
			req = self._openTestigoDatabase();
			req.onsuccess = function( e ) {
				var db = this.result,
					transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( 'databases' );
				
				objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
					var userDatabaseRecord = this.result;
					objectStore.delete( userDatabaseRecord.id ).onsuccess = function( e ) {
						db.close();
						
						MSQTA._Helpers.dimORMInstance( self );
						MSQTA._Helpers.unblockWindow();
						
						callback.call( context || window, true );
					};
				};
			};
		};
		
		req.onerror = function( e ) {
			MSQTA._Helpers.unblockWindow();
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
			MSQTA._Helpers.blockWindow();
			
			req = this._openTestigoDatabase();
			req.onsuccess = function( e ) {
				var db = this.result,
					transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
					objectStore = transaction.objectStore( 'databases' );
				
				// we need to get the user database data to detect schemas changes
				objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
					// this is current schema and branch
					var userDatabaseRecord = this.result;
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
		} else if( Schema._isForceDestroy ) {
			if( this.devMode ) {
				console.log( 'MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the database "' + databaseName + '", then it will recreate again' );
			}
			this._updateSchema3( this._updateSchema6 );

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
				
				if( Schema._isForceEmpty ) {
					if( this.devMode ) {
						console.log( '\t"forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the database "' + databaseName + '", all records will be lost!' );
					}
					this._updateSchema3( this._updateSchema6, this );
					
				} else {
					this._updateSchema();
				}
				
			} else {
				if( this.devMode ) {
					console.log( '\tno new changes has been detected!' );
				}
				
				if( Schema._isForceEmpty ) {
					if( this.devMode ) {
						console.log( '\t"forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the database "' + databaseName + '", all records will be lost!' );
					}
					this._updateSchema7();
				
				} else {
					this._nextSchemaToInit();
				}
			}
		}
	},
	
	_checkSchemaChanges: function( registeredSchemaDefinition, currentSchemaDefinition ) {
		// check for schema changes
		var isNewSchema = false, fieldName,
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
			var db = this.result;
			
			if( self.devMode ) {
				console.log( 'MSQTA-ORM: proceeding to create the schema "' + schemaName + '" for the "' + databaseName + '" database' );
			}
			
			self._createSchemaForReal( db );
		};
		
		req.onsuccess = function( e ) {
			var db = this.result;
			db.close();
			
			self._saveBranch( self._nextSchemaToInit, self );
		};
		
		req.onerror = this._initSchemaFail;
	},
	
	_updateSchema: function() {
		var self = this,
			req = this._openTestigoDatabase();
		
		// cleaning any shit on dump (this is only happens when the user
		// shutdown the browser when this process was running for example)
		req.onsuccess = function( e ) {
			var db = this.result,
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
			schemaName = Schema._name;
		
		if( this.devMode ) {
			console.log( '\t(1) saving temporaly all records from the schema in the testigo database' );
		}
		
		var processRecord = function( objectStore, record, cursorPosition ) {
			// use cursorPosition as the key path
			return objectStore.add( record, cursorPosition );
		};
		
		this._SwapRecords.init( {
			ORM: this,
			// is __msqta__ the base database (the place to get the records to swap)
			isBaseDBMSQTA: false,
			endCallback: this._updateSchema3,
			endContext: this,
			endArg: this._updateSchema4,
			processCallback: processRecord
		} );
	},
	
	_updateSchema3: function( next ) {
		var self = this,
			Schema = this._currentSchema,
			schemaName = Schema._name,
			databaseName = this._name,
			req = this._openUserDatabaseForChanges();

		req.onupgradeneeded = function( e ) {
			var db = this.result;
			
			if( self.devMode ) {
				console.log( '\t(2) re-creating schema, we need to drop it and create it again with the newly schema' );
			}
			
			// first delete the schema
			db.deleteObjectStore( schemaName );
			
			// now process to create the schema with its new schema data
			self._createSchemaForReal( db );
		};
		
		req.onsuccess = function( e ) {
			var db = this.result;
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
			schemaFields = Schema._schemaFields;
		
		if( this.devMode ) {
			console.log( '\t(4) restoring and recasting the saved temporaly records (if there any) to the recenlty updated schema' );
		}
		
		var processRecord = function( objectStore, record ) {
			var schemaField, fieldName;
			
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
			
			return objectStore.put( record );
		};
		
		this._SwapRecords.init( {
			ORM: this,
			isBaseDBMSQTA: true,
			endCallback: this._updateSchema5,
			endContext: this,
			processCallback: processRecord
		} );
	},
	
	_updateSchema5: function() {
		var self = this,
			databaseName = this._name,
			req;

		req = this._openTestigoDatabase();
		req.onsuccess = function( e ) {
			var db = this.result,
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
	
		req = this._openTestigoDatabase();
		req.onsuccess = function( e ) {
			var db = this.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
			
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = this.result,
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
			var db = this.result,
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
		delete Schema._isForceDestroy;
		delete Schema._isForceEmpty;
		delete this._currentSchema;

		MSQTA._Helpers.unblockWindow();
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
		
		req = this._openTestigoDatabase();
		req.onsuccess = function( e ) {
			var db = this.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
		
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var userDatabaseRecord = this.result;
				
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
	
	_openTestigoDatabase: function() {
		return MSQTA._IndexedDB.open( '__msqta__', 1 );
	},
	
	_preExec: function( queryData ) {
		if( !queryData.userCallback ) {
			queryData.userCallback = MSQTA._Helpers.defaultCallback;
		}
		if( !queryData.userContext ) {
			queryData.userContext = window;
		}
		
		// save the entred query
		this._queries.push( queryData );
		
		if( this._isWaiting ) {
			return;
		}
		this._isWaiting = true;
		MSQTA._Helpers.blockWindow();
		
		this._exec();
	},
	
	_exec: function() {
		var queryData = this._queries.shift();

		// especial case
		if( queryData.type === 'destroy' ) {
			this._destroy( queryData );
		
		} else {
			this._getSchemaObjectStore( queryData, this._exec2, this );
		}
	},
	
	_exec2: function( queryData ) {
		var schemaName = queryData.schema,
			type = queryData.type;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: "' + schemaName + '" schema will be manipulate (' + type + ') with the data (may be undefined):', queryData.data );
		}
		
		this['_' + type]( queryData );
	},
	
	_getSchemaObjectStore: function( queryData, callback, context ) {
		var schemaName = queryData.schema,
			req = this._openUserDatabase();
		
		req.onsuccess = function( e ) {
			var db = this.result,
				transaction = db.transaction( [ schemaName ], MSQTA._IDBTransaction[queryData.isReadOnly ? 'READ_ONLY' : 'READ_WRITE'] ),
				objectStore = transaction.objectStore( schemaName );
			
			// keep augmenting q (queryData)
			queryData.activeObjectStore = objectStore;
			queryData.activeDatabase = db;
			
			callback.call( context, queryData );
		};
	},
	
	_continue: function() {
		this._isWaiting = false;
		if( this._queries.length ) {
			this._exec();
		}
	},
	
	// this one is called when _put, _set, _del, _empty finish
	_done: function( queryData, results, allIDs ) {
		MSQTA._Helpers.unblockWindow();
		
		queryData.activeDatabase.close();
		// come back to the user
		queryData.userCallback.call( queryData.userContext, results, allIDs );
		// keep executing more queries
		this._continue();
	},
	
	_put: function( queryData ) {
		var self = this,
			objectStore = queryData.activeObjectStore,
			datas = queryData.data,
			currentIndex = 0,
			// used when you insert multiple objects
			allIDs = [],
			totalQueries = datas.length;
		
		var next = function( lastID ) {
			if( lastID ) {
				allIDs.push( lastID );
			}
			
			if( currentIndex === totalQueries ) {
				self._done( queryData, lastID, allIDs );
				
			} else {
				// insert the data
				process();
				currentIndex++;
			}
		};
		
		var abort = function() {
			self._done( queryData, false );
		};
		
		var process = function() {
			var data = datas[currentIndex],
				req = objectStore.add( data );

			req.onsuccess = function( e ) {
				// the lastID
				next( this.result );
			};
			
			req.onerror = function( e ) {
				// a violation constraints has been produced
				abort();
			};
		};
		
		next();
	},
	
	_set: function( queryData ) {
		var self = this,
			objectStore = queryData.activeObjectStore,
			datas = queryData.data,
			indexes = queryData.indexes,
			pk = queryData.primaryKey,
		
			rowsAffected = 0,
			
			currentIndex = 0, totalQueries = datas.length;
		
		var next = function() {
			if( currentIndex === totalQueries ) {
				self._done( queryData, rowsAffected );
			
			} else {
				// update the data
				process();
				currentIndex++;
			}
		};
		
		var abort = function() {
			self._done( queryData, false );
		};
		
		var process = function() {
			var data = datas[currentIndex],
				setData = data.data,
				target = data.target,
				targetPk = target[pk], fieldName,
				colsCount = Object.keys( target ).length;
			
			if( targetPk ) {
				objectStore.get( targetPk ).onsuccess = function( e ) {
					var record = this.result,
						req;
					if( record ) {
						// update the record
						for( fieldName in setData ) {
							record[fieldName] = setData[fieldName];
						}
					
						req = objectStore.put( record );
						req.onsuccess = function( e ) {
							if( this.result ) {
								rowsAffected++;
							}
							next();
						};
						req.onerror = function( e ) {
							// a violation constraints has been ocurred
							abort();
						};
					} else {
						next();
					}
				};
				
			} else {
				// get all the records, yes all of them!!
				// start iteration
				objectStore.openCursor().onsuccess = function( e ) {
					var cursor = this.result;
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
								if( this.result ) {
									rowsAffected++;
								}
								cursor.continue();
							};
							req.onerror = function( e ) {
								// a violation constraints has been ocurred
								abort();
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
			objectStore = queryData.activeObjectStore;
		
		// indexedb dont provide a way to know if a deletion is successful or not
		// so, we first get the intial count records and then at end with get the total
		// count again to compare the changes
		objectStore.count().onsuccess = function( e ) {
			queryData.recordsAffected = this.result;
			self._del2( queryData );
		};
	},
	
	_del2: function( queryData ) {
		var self = this,
			datas = queryData.data,
			pk = queryData.primaryKey,
			objectStore = queryData.activeObjectStore,
			currentIndex = 0, totalQueries = datas.length;
		
		var next = function() {
			if( currentIndex === totalQueries ) {
				self._del3( queryData );
				
			} else {
				// update the data
				process();
				currentIndex++;
			}
		};
		
		var process = function() {
			var data = datas[currentIndex];
			objectStore.delete( data[pk] ).onsuccess = function( e ) {
				next();
			};
		};
		
		next();
	},
	
	_del3: function( queryData ) {
		var self = this,
			objectStore = queryData.activeObjectStore;
		
		// get the "rowsAffected"
		objectStore.count().onsuccess = function( e ) {
			self._done( queryData, queryData.recordsAffected - this.result );
		};
	},
	
	_empty: function( queryData ) {
		var self = this,
			rowsAffected,
			objectStore = queryData.activeObjectStore;
		
		objectStore.count().onsuccess = function( e ) {
			rowsAffected = this.result;
			objectStore.clear().onsuccess = function( e ) {
				self._done( queryData, rowsAffected );
			};
		};
	},
	
	_destroy: function( queryData ) {
		var self = this,
			schemaName = queryData.schema,
			req = this._openUserDatabaseForChanges();

		// delete the schema from the user database
		req.onupgradeneeded = function( e ) {
			var db = this.result;
			
			db.deleteObjectStore( schemaName );
		};
		
		req.onsuccess = function( e ) {
			var db = this.result;
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
			req = this._openTestigoDatabase();
		
		req.onsuccess = function( e ) {
			// delete the schema from the testigo database
			var db = this.result,
				transaction = db.transaction( [ 'databases' ], MSQTA._IDBTransaction.READ_WRITE ),
				objectStore = transaction.objectStore( 'databases' );
		
			objectStore.index( 'name' ).get( databaseName ).onsuccess = function( e ) {
				var databaseData = this.result;
				// delete the schema from schemas
				delete databaseData.schemas[schemaName];
	
				objectStore.put( databaseData ).onsuccess = function( e ) {
					// because to delete the schema from the user database we need to trigger
					// and onupgradeneeded on the user database by incremeting its branch
					self._saveBranch( function() {
						queryData.activeDatabase = db;
						// delete from here too
						delete self._Schemas[schemaName];
						MSQTA._Helpers.dimSchemaInstance( Schema );
						
						this._done( queryData, true );
					}, self );
				};
			};
		};
	},
	
	_getAll: function( queryData ) {
		var self = this,
			schemaName = queryData.schema,
			filterCallback = queryData.filterCallback,
			filterFields = queryData.filterFields,
			filterComparator = queryData.filterComparator,
			objectStore = queryData.activeObjectStore,
			data = [];
			
		objectStore.openCursor().onsuccess = function( e ) {
			var cursor = this.result,
				record;
			
			if( cursor ) {
				record = cursor.value;
				if( filterCallback( record, filterFields, filterComparator ) ) {
					// our implementation of indexeddb store dates in milliseconds
					// but the user needs to have access to a date obj
					self._checkDateTypeFields( schemaName, record );
					data.push( record );
				}
				cursor.continue();
				
			} else {
				self._done( queryData, data );
			}
		};
	},
	
	_getWithRange: function( queryData ) {
		var self = this,
			schemaName = queryData.schema,
			rangePk = queryData.rangePk,
			rangeIndex = queryData.rangeIndex,
			rangeKey = queryData.rangeKey,
			objectStore = queryData.activeObjectStore,
			data = [];
		
		var grabRecords = function( e ) {
			var cursor = this.result,
				record;
			if( cursor ) {
				record = cursor.value;
				// our implementation of indexeddb store dates in milliseconds
				// but the user needs to have access to a date obj
				self._checkDateTypeFields( schemaName, record );
				data.push( record );
				cursor.continue();
				
			} else {
				self._done( queryData, data );
			}
		};

		if( rangePk ) {
			objectStore.openCursor( rangeKey ).onsuccess = grabRecords;

		} else {
			objectStore.index( rangeIndex ).openCursor( rangeKey ).onsuccess = grabRecords;
		}
	},
	
	_checkDateTypeFields: function( schemaName, record ) {
		var Schema = this._Schemas[schemaName],
			schemaFields = Schema._schemaFields,
			fieldName;
		
		for( fieldName in record ) {
			if( schemaFields[fieldName].isDate ) {
				record[fieldName] = MSQTA._Helpers.castDateTypeOf( record[fieldName] );
			}
		}
	},
/*********************/
/**** public functions **/
/********************/
	batch: function( data, callback, context ) {
		var databaseName = this._name,
			batchData;
		
		if( !Array.isArray( data ) || !data.length ) {
			MSQTA._Errors.batch1( databaseName, data );
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
			userCallback: callback, 
			userContext: context
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

			t = Schema[type]( queryData.data );
			t.userCallback = MSQTA._Helpers.defaultCallback;
			t.userContext = window;
			this._queries.push( t );
		}
		// the last one will the return point
		t = this._queries[this._queries.length-1];
		t.userCallback = batchData.userCallback;
		t.userContext = batchData.userContext;
		
		this._isBatchMode = false;

		if( !this._isWaiting ) {
			this._continue();
		}
	},
	
	destroy: function( callback, context ) {
		this._deleteUserDatabase( callback || MSQTA._Helpers.noop, context );
	}
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
			schemaName = this._name,
			queryData;
	
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
		
		queryData = {
			type: 'getAll',
			isReadOnly: true,
			schema: schemaName,
			filterCallback: filterCallback,
			filterComparator: fieldMapping,
			userCallback: userCallback,
			userContext: userContext
		};
		
		ORM._preExec( queryData );
	},
	
	getAll: function( userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			queryData;
		
		var filterCallback = function() {
			return true;
		};
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching all records from "' + schemaName + '" schema from the "' + databaseName + '" database' );
		}
		
		queryData = {
			type: 'getAll',
			isReadOnly: true,
			schema: schemaName,
			filterCallback: filterCallback,
			userCallback: userCallback,
			userContext: userContext
		};
		
		ORM._preExec( queryData );
	},

	getWithLike: function( fields, likeData, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaFields = this._schemaFields,
			schemaName = this._name,
			i, l, fieldName,
			likeType, searchValue,
			queryData;
			
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
		
		if( !Array.isArray( fields ) ) {
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
		
		queryData = {
			type: 'getAll',
			isReadOnly: true,
			schema: schemaName,
			filterCallback: filterCallback,
			filterComparator: searchValue,
			filterFields: fields,
			userCallback: userCallback,
			userContext: userContext
		};
		
		ORM._preExec( queryData );
	},
	
	getByCallback: function( filterCallback, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			queryData;
		
		if( typeof filterCallback !== 'function' ) {
			MSQTA._Errors.getByCallback( databaseName, schemaName );
		}
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database by "callback"' );
		}
		
		queryData = {
			type: 'getAll',
			isReadOnly: true,
			schema: schemaName,
			filterCallback: filterCallback,
			userCallback: userCallback,
			userContext: userContext
		};
		
		ORM._preExec( queryData );
	},

	getByIndex: function( fieldName, searchValue, userCallback, userContext ) {
		var ORM = this._ORM,	
			databaseName = ORM._name,
			schemaName = this._name,
			indexData = {}, fields = [],
			filterCallback,
			fieldValue, parsedValue, i, l,
			queryData;
		
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
		
		if( !Array.isArray( searchValue ) ) {
			searchValue = [ searchValue ];
		}
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: fetching record(s) from "' + schemaName + '" schema from the "' + databaseName + '" database using ' + ( indexData.pk ? 'primary key: "' + indexData.pk + '"' : 'index: "' + indexData.index + '"' ) );
		}
		
		if( searchValue.length === 1 ) {
			queryData = {
				type: 'getWithRange',
				isReadOnly: true,
				schema: schemaName,
				// one of theses are undefined
				rangePk: indexData.pk,
				rangeIndex: indexData.index,
				rangeKey: MSQTA._IDBKeyRange.only( this._getValueBySchema( fieldName, searchValue[0] ) ),
				userCallback: userCallback,
				userContext: userContext
			};
			
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
			
			queryData = {
				type: 'getAll',
				isReadOnly: true,
				schema: schemaName,
				filterCallback: filterCallback,
				filterComparator: indexData.pk || indexData.index,
				filterFields: fields,
				userCallback: userCallback,
				userContext: userContext
			};
		}
		
		ORM._preExec( queryData );
	},
	
	getByIndexWithRange: function( fieldName, comparator, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			schemaFields = this._schemaFields,
			validOperators = /^(?:>|<|>=|<=|=)$/, operator,
			indexData = {}, operatorsMapping = {}, operatorsCount, keyRange,
			fieldData = schemaFields[fieldName], fieldValue, parsedValue,
			queryData;
		
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
	
		queryData = {
			type: 'getWithRange',
			isReadOnly: true,
			schema: schemaName,
			// one of theses are undefined
			rangePk: indexData.pk,
			rangeIndex: indexData.index,
			rangeKey: keyRange,
			userCallback: userCallback,
			userContext: userContext
		};
		
		ORM._preExec( queryData );
	},
	/***************************************/
	put: function( datas, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			fields = this._fieldsName, fieldName,
			pk = this._primaryKey,
			schemaName = this._name,
			data, i, l, k, m = fields.length,
			queryData;
		
		if( !Array.isArray( datas ) && typeof datas === 'object' ) {
			datas = [ datas ];
		}
		
		datas = MSQTA._Helpers.copyObject( datas );
		for( i = 0, l = datas.length; i < l; i++ ) {
			data = datas[i];
			for( k = 0; k < m; k++ ) {
				fieldName = fields[k];
				data[fieldName] = this._getValueBySchema( fieldName, data[fieldName] );
			}
			// lets the auto_increment works automatically if an id is not bee supplied
			if( data[pk] <= 0 ) {
				delete data[pk];
			}
		}

		queryData = {
			type: 'put',
			schema: schemaName,
			primaryKey: pk,
			data: datas,
			userCallback: userCallback,
			userContext: userContext
		};
		
		if( ORM._isBatchMode ) {
			return queryData;
		}
		
		ORM._preExec( queryData );
	},
/***************************************/
	set: function( setDatas, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			schemaFields = this._schemaFields,
			databaseName = ORM._name,		
			whereData, setData, parsedValue,
			cmpFields, newValues,
			fieldName, fieldValue,
			whereClause = {}, setClause = {},
			queries = [], i, l,
			queryData;
		
		if( !setDatas || typeof setDatas !== 'object' ) {
			MSQTA._Errors.set1( databaseName, schemaName, setDatas );
		}
		
		if( !Array.isArray( setDatas ) ) {
			setDatas = [ setDatas ];
		}
		
		setDatas = MSQTA._Helpers.copyObject( setDatas );
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
		
		queryData = {
			type: 'set',
			schema: schemaName,
			indexes: this._indexes,
			primaryKey: this._primaryKey,
			data: queries,
			userCallback: userCallback,
			userContext: userContext	
		};
		
		if( ORM._isBatchMode ) {
			return queryData;
		}
		
		ORM._preExec( queryData );
	},
/***************************************/
	del: function( ids, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			pk = this._primaryKey,
			schemaName = this._name,
			id, parsedValue, 
			t, whereClause = [],
			i, l,
			queryData;
		
		if( !pk ) {
			MSQTA._Errors.del1( databaseName, schemaName );
		}
		
		if( !ids ) {
			MSQTA._Errors.del2( databaseName, schemaName );
		}
		
		if( !Array.isArray( ids ) ) {
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
		
		queryData = {
			type: 'del',
			schema: schemaName,
			primaryKey: pk,
			data: whereClause,
			userCallback: userCallback,
			userContext: userContext
		};
		
		// the only way that whereClause can be empty is that ids param must be a empty []
		if( ORM._isBatchMode ) {
			return queryData;
		}
		
		ORM._preExec( queryData );
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
			userCallback: userCallback,
			userContext: userContext
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
			userCallback: userCallback,
			userContext: userContext
		} );
	}
};
MSQTA._ORM.WebSQL = {
	
	Schema: function( schemaDefinition ) {
		return MSQTA._Helpers.instantiateSchema( this.constructor._ORM, MSQTA._Schema.WebSQL, schemaDefinition, 'webSQL', arguments );
	},
	
	_open: function() {
		// put in a close to handle various open at "the same time"
		(function( self ) {
			MSQTA._Helpers.blockWindow();
			self._testigoDB = window.openDatabase( '__msqta__', 1, '', MSQTA._Helpers.webSQLSize );
			self._testigoDB.transaction( function( tx ) {
				if( self.devMode ) {
					console.log( 'MSQTA.ORM: creating if not exists (first run) the table "databases" on "__msqta__" internal database' );
				}
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
		
		// this holds all the internal queries that are made when
		// a schema is initialized, these queries are more important
		// that this._queries in terms at the moment of execute the next query
		this._queriesInternal = [];
		
		if( this.devMode ) {
			console.log( 'MSQTA.ORM: creating/opening the "' + this._name + '" user database' );
		}			
		
		this._userDB = window.openDatabase( this._name, 1, '', MSQTA._Helpers.webSQLSize );
		
		// create the __currents_ids__ table
		(function( self ) {
			self._userDB.transaction( function( tx ) {
				if( self.devMode ) {
					console.log( 'MSQTA.ORM: creating if not exists (first run) the table __currents_ids__ on "' + self._name + '" user database' );
				}
				tx.executeSql( 'CREATE TABLE IF NOT EXISTS __currents_ids__( id INTEGER PRIMARY KEY, table_name TEXT UNIQUE, last_id INTEGER )' );
				
			}, null, function() {
				MSQTA._Helpers.unblockWindow();
				self._initCallback.call( self.initContext, true );
				self._initSchemas();
			} );
		})( this );
	},

	_initSchema: function( Schema ) {
		this._schemasToInit.push( Schema );
		if( !this._isBlocked ) {
			this._isBlocked = true;
			this._initSchemas();
		}
	},
	
	_initSchemas: function() {
		var self = this,
			Schema,
			databaseName = this._name;
		
		if( this._schemasToInit.length ) {
			MSQTA._Helpers.blockWindow();
			// call _init2 using the Schema instance
			Schema = this._schemasToInit.shift();
			Schema._init2();
			
		} else {
			MSQTA._Helpers.unblockWindow();
			this._endSchemasInitialization();
		}
	},
	
	_endSchemasInitialization: function() {
		this._isBlocked = false;
	},
	
	_saveSchemaOnTestigoDatabase: function( callback, context, arg ) {
		var self = this,
			databaseName = this._name,
			schemasDefinition = this._schemasDefinition;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: saving schema definition in the testigo database to keep tracking future changes on it' );
		}
		this._testigoDB.transaction( function( tx ) {
			tx.executeSql( 'REPLACE INTO databases( name, schemas ) VALUES( "' + databaseName + '", ' + "'" + JSON.stringify( schemasDefinition ) + "'" + ')' );
			
		}, null, function() {
			// true for success
			callback.call( context, arg );
		} );
	},
	
	_deleteUserDatabase: function( callback, context ) {
		this.destroy( callback, context );
	},
	
	_deleteUserSchema: function( Schema, queryData ) {
		var self = this,
			schemaName = Schema._name;
		
		delete this._Schemas[schemaName];
		delete this._schemasDefinition[schemaName];
		MSQTA._Helpers.dimSchemaInstance( Schema );
	
		this._userDB.transaction( function( tx ) {
			if( self.devMode ) {
				console.log( 'MSQTA-ORM: stop tracking "last inserted id" from this schema' );
			}
			// stop tracking last_id from this table
			tx.executeSql( 'DELETE FROM __currents_ids__ WHERE table_name = "' + schemaName + '"' );
			
		}, null, function() {
			self._saveSchemaOnTestigoDatabase( queryData.userCallback, queryData.userContext, true );
		} );
	},
	
	/**
	* @context SQLTransaction
	*/
	_error: function( error ) {
		// if we use a throw Error the application will die
		console.error( 'MSQTA-ORM: query has failed: \n\t' + 'code: ' + error.code + '\n\t' + 'message: ' + error.message );
	},
/***************************************/
	_transaction: function( queryData ) {
		var callback = queryData.userCallback,
			context = queryData.userContext;

		// use default callback
		if( !callback ) {
			queryData.userCallback = MSQTA._Helpers.defaultCallback;
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
		MSQTA._Helpers.blockWindow();
		
		this._transaction2( queryData );
	},
	
	_transaction2: function( queryData ) {
		// save a refenrece for when the transaction is done
		this._lastQuery = queryData;

		// save a reference used in the success and error functions
		var self = this,
			// update an update at time is executed, so we need to keep tracking manually the affected rows
			rowsAffected = 0,
			// keep track of all new inserted ids
			allIDs = [],
			query = queryData.query;
		
		if( !Array.isArray( query ) ) {
			query = [ query ];
		}
		
		// when you trigger multiple update queries, we need to keep
		// track the rows affected in the operation
		var noop = queryData.isUpdate ? function( tx, results ) {
			rowsAffected += results.rowsAffected;
		// you can insert multiples rows in an single call the put method
		// we need to keep track these new ids
		} : ( queryData.isInsert ? function( tx, results ) {
			allIDs.push( results.insertId );
		// do nothing
		} : MSQTA._Helpers.noop );
		
		var success = function( tx, results ) {
			if( queryData.isUpdate ) {
				// sum the last executed one
				queryData.returnValue = results.rowsAffected + rowsAffected;
		
			} else if( queryData.isInsert ) {
				queryData.returnValue = results.insertId;
				// only a one row has been inserted
				if( !allIDs.length ) {
					allIDs.push( results.insertId );
				}
				queryData.insertedIDs = allIDs;
			
			} else if( queryData.isDelete ) {
				queryData.returnValue = results.rowsAffected;
			}
		
			self._results( results );
		};
		
		var error = function( error ) {
			self._error( error );
			self._results( false );
		};
		
		this._userDB.transaction( function( tx ) {			
			var q,
				l = query.length;

			while( l-- ) {
				q = query.shift();
				if( self.devMode ) {
					console.log( 'MSQTA-ORM: executing the query: \n\t' + q );
				}
				tx.executeSql( q, queryData.replacements ? queryData.replacements.shift() : [], l ? noop : success );
			}
			
		}, error );
	},
	
	/**
	* @context SQLTransaction
	*/
	_results: function( results ) {
		var queryData = this._lastQuery;
		
		this._isWaiting = false;
		// comes from _error()
		if( !results ) {
			queryData.returnValue = false;
		}
		
		// still more processing (only select clauses falls here)
		if( queryData.internalCallback ) {
			// go to the original caller
			queryData.internalCallback.call( queryData.internalContext, results, queryData );
			
		// get back with the user
		} else {
			// only delete, update, insert quries falls here
			queryData.userCallback.call( queryData.userContext, queryData.returnValue, queryData.insertedIDs );
		}
		
		this._continue();
	},
	
	_continue: function() {
		MSQTA._Helpers.unblockWindow();
		
		if( !this._isWaiting ) {
			// more queries to be executed in the queue
			if( this._queriesInternal.length ) {
				this._transaction( this._queriesInternal.shift() );
			} else if( this._queries.length && !this._isBlocked ) {
				this._transaction( this._queries.shift() );
			}
		}
	},
/***************************************/
/***************************************/
	batch: function( data, callback, context ) {
		var databaseName = this._name,
			batchData;
		
		if( !Array.isArray( data ) || !data.length ) {
			MSQTA._Errors.batch1( databaseName, data );
		}
		
		if( !callback ) {
			callback = MSQTA._Helpers.defaultCallback;
		}
		if( !context ) {
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
			this._queries.push( Schema[type]( queryData.data ) );
		}
		// the last one will the return point
		var t = this._queries[this._queries.length-1];
		t.userCallback = batchData.callback;
		t.userContext = batchData.context;
		
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
		console.error( 'MSQTA: destroy: deleting a database is not implemented in webSQL standard and will never do.\n To delete a database you need to do manually.' );
		
		( callback || MSQTA._Helpers.noop ).call( context || window, false );
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
			attrs, indexesToCreate = {}, isIndex, isUnique,
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
					// true means that this is an index is also unique
					indexesToCreate[fieldName] = true;
				
				} else if( isIndex ) {
					indexesToCreate[fieldName] = false;
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
		// save a reference for latter usage
		this._createTableQuery = 'CREATE TABLE "' + schemaName + '" ( ' + tableStruc.join( ', ' ) + ' )';
		// this used to detect schema changes
		this._schemaKeepTrack = schemaKeepTrack;
		// the indexes
		this._indexesToCreate = indexesToCreate;
		// this will ppoulated (if there the case) in this._checkSchemaChanges()
		this._indexesToDelete = [];

		ORM._initSchema( this );
	},
	
	_init2: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			dropTableQuery,
			registeredSchemaDefinition, currentSchemaDefinition;
		
		if( this._isForceDestroy ) {			
			dropTableQuery = '--MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the "' + databaseName + '" database, then it will recreate again--\n\tDROP TABLE IF EXISTS ' + schemaName;
		
			ORM._transaction( { query: dropTableQuery, internalContext: this, internalCallback: this._createSchema, isInternal: true } );
		
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
	
	_getIndexUniqueQuery: function( schemaName, fieldName, alternativeSchemaName ) {
		// CREATE UNIQUE INDEX index_name ON table_name( column_name )
		return 'CREATE UNIQUE INDEX ' + this._getIndexName( schemaName, fieldName ) + ' ON ' + ( alternativeSchemaName || schemaName ) + ' ( ' + fieldName + ' )';
	},
	
	_getIndexQuery: function( schemaName, fieldName, alternativeSchemaName ) {
		// CREATE INDEX index_name ON table_name( column_name )
		return  'CREATE INDEX ' + this._getIndexName( schemaName, fieldName ) + ' ON ' + ( alternativeSchemaName || schemaName ) + ' ( ' + fieldName + ' )';
	},
	
	_getIndexName: function( schemaName, fieldName ) {
		return  schemaName + '_' + fieldName;
	},
	
	_checkSchemaChanges: function( registeredSchemaDefinition, currentSchemaDefinition ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			isNewSchema = false,
			registeredFieldsData = registeredSchemaDefinition.fields,
			currentFieldsData = currentSchemaDefinition.fields,
			registeredFieldData, currentFieldData, fieldName;
		
		for( fieldName in registeredFieldsData ) {
			registeredFieldData = registeredFieldsData[fieldName];
			currentFieldData = currentFieldsData[fieldName];
			
			// the field has been deleted
			if( !currentFieldData ||
			// type field has changed
			registeredFieldData.type !== currentFieldData.type ||
			// unique chnages requires a new schema
			registeredFieldData.unique !== currentFieldData.unique ) {
				isNewSchema = true;
				break;
			}
		}
		
		var registeredPK = registeredSchemaDefinition.primaryKey,
			currentPK = currentSchemaDefinition.primaryKey;
		
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
				console.log( '\tspecified schema differs to the registered one, starting update process!' );
			}
			// start the damn updating process
			ORM._schemasDefinition[schemaName] = currentSchemaDefinition;
			this._ORM._saveSchemaOnTestigoDatabase( this._updateSchema, this );
		
		// check for indexes changes
		} else {
			var indexesToDelete = [],
				indexes = this._indexes,
				newIndexes = this._indexesToCreate;
			
			for( fieldName in registeredFieldsData ) {
				registeredFieldData = registeredFieldsData[fieldName];
				
				if( registeredFieldData.index ) {
					// index drop
					if( indexes.indexOf( fieldName ) === -1 ) {
						indexesToDelete.push( fieldName );
					// remove from indexesToCreate, and then end indexesToCreate will contain only the reail new indexes
					} else {
						delete newIndexes[fieldName];
					}
				}
				// we dont test for unique index because a change in a unique field requires a new schema
			}

			if( indexesToDelete.length || Object.keys( newIndexes ).length ) {
				this._indexesToDelete = indexesToDelete;
				
				if( this.devMode ) {
					console.log( '\tschema is still the same, but its index(s) has been changed, starting updating indexes process!' );
				}
				ORM._schemasDefinition[schemaName] = currentSchemaDefinition;
				// delete the index to be delete and create the new one (if any) and done
				this._ORM._saveSchemaOnTestigoDatabase( this._updateSchema10, this );
			
			} else {
				if( this.devMode ) {
					console.log( '\tno changes detected on its schema nor its index(s)!' );
				}
				if( this._isForceEmpty ) {
					this._updateSchema9();
				} else {
					this._updateSchema8();
				}
			}
		}
	},
	
	_createSchema: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			databaseName = ORM._name,
			pk = this._primaryKey,
			triggerUpdateLastID, setIntialLastID;
		
		if( this.devMode ) {
			console.log( '\tthe schema is a new one, starting creation process!' );
			console.log( '\t\t1) Creating the "' + schemaName + '" table and its "last_id" trigger' );
		}
		
		// we dont use the default auto_increment mechanism that offers sqlite3 because it's differs from the
		// indexeddb one, so, this triggers set the new id based on the current value that it's stored on the
		// table __currents_ids__ at every new insert query.
		triggerUpdateLastID = (
			'CREATE TRIGGER IF NOT EXISTS update_last_id_on_' + schemaName +
				' AFTER INSERT ON ' + schemaName +
				' BEGIN ' +
					// increment last_id of the related table by one
					' UPDATE __currents_ids__ SET last_id = ( ' +
					// but we need to know if the user at the insert query the id value was provided by the user
						' SELECT CASE ' +
						// the new row has an rowid greater than the current last_id, this happens when the user
						// uses a custom id, in this case last_id needs to be setted to this custom rowid
						' WHEN ( SELECT 1 WHERE NEW.rowid >= ( SELECT last_id FROM __currents_ids__ WHERE table_name = "' + schemaName + '" ) )' +
							' THEN NEW.rowid ' +
						// inserting a record with an ID less than the current, means dont change ANYTHING
						// to make this wil do this last_id - 1 + 1
						' WHEN ( SELECT 1 WHERE NEW.rowid < ( SELECT last_id FROM __currents_ids__ WHERE table_name = "' + schemaName + '" ) )' +
							' THEN ( SELECT last_id - 1 FROM __currents_ids__ WHERE table_name = "' + schemaName + '" ) ' +
						// or the id was getted directly form the __currents_ids__ table (default)
						// increment it by one
						' ELSE ' +
							' ( SELECT last_id FROM __currents_ids__ WHERE table_name = "' + schemaName + '" ) ' +
						' END ' +
					// rest of the update query
					' ) + 1 WHERE table_name = "' + schemaName + '" ; ' +
				// end outermost begin
				' END '
		);
		
		setIntialLastID = 'REPLACE INTO __currents_ids__ VALUES( null, "' + schemaName + '", 1 )';
		
		// create the new table
		ORM._transaction( { query: [ this._createTableQuery, triggerUpdateLastID, setIntialLastID ], internalContext: this, internalCallback: this._updateSchema10, isInternal: true } );
	},
	
	_updateSchema: function() {
		var ORM = this._ORM,
			newSchema = this._createTableQuery,
			schemaName = this._name,
			tempSchemaName = schemaName + (+new Date()),
			// based on the newSchema we need to create in a form a backup, and the end we just will rename it
			createTempTableQuery = newSchema.replace( 'CREATE TABLE "' + schemaName + '"', 'CREATE TABLE "' + tempSchemaName + '"' );

		// prepare the offset for the step2
		this._offset = 0;
		// and tempSchemaName too
		this._tempSchemaName = tempSchemaName;
		
		if( this.devMode ) {
			console.log( '\t\t1) Creating the "' + tempSchemaName + '" table (this will be the new one at the end of the process)' );
		}
		
		ORM._transaction( { query: createTempTableQuery, internalContext: this, internalCallback: this._updateSchema2, isInternal: true } );
	},
	
	_updateSchema2: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			tempSchemaName = this._tempSchemaName,
			indexQueries = [],
			indexesToCreate = this._indexesToCreate,
			fieldName;
		
		if( this.devMode ) {
			console.log( '\t\t2) Creating again the indexes (if there is any one)' );
		}
		
		for( fieldName in indexesToCreate ) {
			// destroy any index that has the same name
			indexQueries.push( 'DROP INDEX IF EXISTS ' + this._getIndexName( schemaName, fieldName ) );
			if( indexesToCreate[fieldName] ) {
				indexQueries.push( this._getIndexUniqueQuery( schemaName, fieldName, tempSchemaName ) );
			} else {
				indexQueries.push( this._getIndexQuery( schemaName, fieldName, tempSchemaName ) );
			}
		}
		
		if( indexQueries.length ) {
			ORM._transaction( { query: indexQueries, internalContext: this, internalCallback: this._updateSchema3, isInternal: true } );
			
		} else {
			this._updateSchema3();
		}
	},
	
	_updateSchema3: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			tempSchemaName = this._tempSchemaName,
			offset = this._offset,
			selectQuery;
		
		if( this._isForceEmpty ) {
			if( this.devMode ) {
				console.log( '\t\t"forceEmpty" flag detected, the records will no be saved!' );
			}
			// dont clean again
			this._isEmpty = true;
			// goto directly to step 
			this._updateSchema8();
		
		// not need to save records
		} else if( this._isForceDestroy ) {
			this._updateSchema7();
			
		} else {
			this._updateSchema4();
		}
	},
	
	_updateSchema4: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			tempSchemaName = this._tempSchemaName,
			// get all the records from the table with the oldSchema
			selectQuery =  'SELECT * FROM ' + schemaName + ' LIMIT ' + this._offset + ', 500';

		if( this.devMode ) {
			console.log( '\t\t2) Fetching all rows from old schema "' + schemaName + '" by 500 rows per time' );
		}
		
		ORM._transaction( { query: selectQuery, internalContext: this, internalCallback: this._updateSchema5, isInternal: true } );
	},
	
	_updateSchema5: function( results ) {
		var ORM = this._ORM,
			// this is already the new schema
			schemaFields = this._schemaFields,
			schemaName = this._name,
			tempSchemaName = this._tempSchemaName,
			rows = results.rows,
			rowData, fieldName,
			schemaColData,
			insertQueryCols = [],
			// holds the values to be passed to new schema
			curValueTokens, 
			// holds here the new values of the columns
			newValueTokens = [], newValueReplacements = [],
			insertQueries = [], 
			// holds here the replacements
			values = [], t,
			i, l,
			queryData;
		
		// the old schema is empty
		if( !rows.length ) {
			if( this.devMode ) {
				console.log( '\t\t3) Old schema "' + schemaName + '" ' + ( this._offset === 0 ? 'has no records on it' : 'has no more records to be saved' ) + ', moving to next step' );
			}
			this._updateSchema6();
			
		} else {
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
					newValueReplacements.push( schemaColData.zero );
					newValueTokens.push( '?' );
				}
			}
			
			for( i = 0, l = rows.length; i < l; i++ ) {
				t = [];
				curValueTokens = [];
				
				rowData = rows.item( i );
				for( fieldName in rowData ) {
					// get how this fieldName has to been in the new schema
					schemaColData = schemaFields[fieldName];
					if( schemaColData ) {
						curValueTokens.push( '?' );
						if( schemaColData.isJSON ) {
							t.push( rowData[fieldName] );
						} else {
							t.push( schemaColData.sanitizer( rowData[fieldName], schemaColData.zero ) );
						}
					}
				}
				
				// make a row insert values
				insertQueries.push( 'INSERT INTO ' + tempSchemaName + ' ( ' + insertQueryCols.join( ', ' ) + ' ) VALUES ( ' + curValueTokens.concat( newValueTokens ).join( ', ' ) + ' )' );
				// make the replacements (concat the default value of the columns)
				values.push( t.concat( newValueReplacements ) );	
			}
			
			if( this.devMode ) {
				console.log( '\t\t3) Inserting rows from old schema "' + schemaName + '" into the new schema "' + tempSchemaName + '" (rows may fail if they violated any constraints)' );
			}
			
			queryData = {
				query: insertQueries,
				replacements: values,
				internalContext: this,
				isInternal: true
			};
			
			// get for more records
			if( l === 500 ) {
				this._offset += 500;
				queryData.internalCallback = this._updateSchema4;
			} else {
				queryData.internalCallback = this._updateSchema6;
			}
			ORM._transaction( queryData );
		}
	},
	
	_updateSchema6: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			dropQuery = 'DROP TABLE ' + schemaName,
			tempSchemaName = this._tempSchemaName,
			renameQuery = 'ALTER TABLE ' + tempSchemaName + ' RENAME TO ' + schemaName;
		
		if( this.devMode ) {
			console.log( '\t\t4) Deleting old schema "' + schemaName + '" (any index left will be dropped aswell)' );
			console.log( '\t\t5) Renaming new schema "' + tempSchemaName + '" to "' + schemaName + '"' );
		}
		
		ORM._transaction( { query: [ dropQuery, renameQuery ], internalContext: this, internalCallback: this._updateSchema7, isInternal: true } );
	},
	
	_updateSchema7: function() {
		var ORM = this._ORM;
		
		if( this.devMode ) {
			console.log( '\t\t7) Initialization schema process has ended successful' );
		}
		
		if( this._isForceEmpty && !this._isEmpty ) {
			this._updateSchema9();
		} else {
			this._updateSchema8();
		}
	},
	
	_updateSchema8: function() {
		// clean
		delete this._createTableQuery;
		delete this._indexesToCreate;
		delete this._isEmpty;
		delete this._tempSchemaName;
		delete this._offset;
		delete this._indexesToDelete;
		delete this._isForceDestroy;
		delete this._isForceEmpty;
		
		this._initCallback.call( this._initContext, true );
		delete this._initCallback;
		delete this._initContext;
		
		// continue
		this._ORM._initSchemas();
	},
	
	_updateSchema9: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			emptyQuery = '--MSQTA-ORM: "forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the "' + databaseName + '" database--\n\tDELETE FROM ' + schemaName;
			
		ORM._transaction( { query: [ emptyQuery ], internalContext: this, internalCallback: this._updateSchema8, isInternal: true } );
	},
	
	_updateSchema10: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			indexQueries = [],
			indexesToDelete = this._indexesToDelete,
			indexesToCreate = this._indexesToCreate,
			fieldName;
		
		if( this.devMode ) {
			console.log( '\t\t2) Creating/removing index(s) (if there is any)' );
		}
		
		while( indexesToDelete.length ) {
			indexQueries.push( 'DROP INDEX ' + this._getIndexName( schemaName, indexesToDelete.shift() ) );
		}
		
		// DROP INDEX queries + CREATE INDEX queries
		for( fieldName in indexesToCreate ) {
			if( indexesToCreate[fieldName] ) {
				indexQueries.push( this._getIndexUniqueQuery( schemaName, fieldName ) );
			} else {
				indexQueries.push( this._getIndexQuery( schemaName, fieldName ) );
			}
		}
		
		if( indexQueries.length ) {
			ORM._transaction( { query: indexQueries, internalContext: this, internalCallback: this._updateSchema7, isInternal: true } );
		} else {
			this._updateSchema7();
		}
	},
/***************************************/
	get: function( searchValue, userCallback, userContext ) {
		var ORM = this._ORM,
			schemaFields = this._schemaFields,
			fieldName,
			databaseName = ORM._name,
			schemaName = this._name,
			selectQuery,
			whereClause = [], values = [];
		
		if( !searchValue ) {
			MSQTA._Errors.get( databaseName, schemaName );
		}
		
		for( fieldName in schemaFields ) {
			whereClause.push( fieldName + ' = ?' );
			values.push( this._getValueBySchema( fieldName, searchValue ) );
		}
		
		selectQuery = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' OR ' );
		
		ORM._transaction( { 
			query: selectQuery, 
			replacements: [ values ],
			internalCallback: this._processResults, 
			internalContext: this,
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
			internalContext: this, 
			internalCallback: this._getByCallback, 
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
			selectQuery, whereClause = [], values = [],
			fieldValue, parsedValue, i, l;
		
		if( this._primaryKey !== fieldName ) {
			if( this._indexes.indexOf( fieldName ) === -1 ) {
				MSQTA._Errors.getByIndex1( databaseName, schemaName, fieldName );
			}
		}
		
		if( !searchValue ) {
			MSQTA._Errors.getByIndex2( databaseName, schemaName );
		}
		
		if( !Array.isArray( searchValue ) ) {
			searchValue = [ searchValue ];
		}
		
		for( i = 0, l = searchValue.length; i < l; i++ ) {
			fieldValue = searchValue[i];
			parsedValue = this._getValueBySchema( fieldName, fieldValue );
			whereClause.push( fieldName + ' = ?' );
			values.push( parsedValue );
		}
		
		// whereClause can be empty

		selectQuery = 'SELECT * FROM ' + schemaName + ( whereClause.length ? ' WHERE ' + whereClause.join( ' OR ' ) : '' );

		ORM._transaction( { 
			query: selectQuery,
			replacements: [ values ],
			internalContext: this, 
			internalCallback: this._processResults, 
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
			whereClause = [], fieldValue, parsedValue, values = [],
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
			whereClause.push( fieldName + ' ' + operator + ' ?' );
			values.push( parsedValue );
		}
		
		if( !whereClause.length ) {
			MSQTA._Errors.getByIndexWithRange4();
		}
		
		selectQuery = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' AND ' );
		
		ORM._transaction( { 
			query: selectQuery,
			replacements: [ values ],
			internalContext: this, 
			internalCallback: this._processResults, 
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
			internalContext: this, 
			internalCallback: this._processResults, 
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
			likeType, searchValue, values = [],
			selectQueryWithLike, whereClause = [];
		
		if( typeof likeData !== 'object' ) {
			MSQTA._Errors.getWithLike1();
		}
		
		likeType = Object.keys( likeData )[0];
		searchValue = likeData[likeType];
		if( !likeType || !searchValue ) {
			MSQTA._Errors.getWithLike1();
		}
		
		if( likeType === 'both' ) {
			searchValue = '%' + searchValue + '%';
		} else if( likeType === 'start' ) {
			searchValue = searchValue + '%';
		} else if( likeType === 'end' ) {
			searchValue = '%' + searchValue;
		}
		
		if( !Array.isArray( fields ) ) {
			fields = [ fields ];
		}
		for( i = 0, l = fields.length; i < l; i++ ) {
			fieldName = fields[i];
			if( !schemaFields[fieldName] ) {
				MSQTA._Errors.getWithLike2( databaseName, schemaName, fieldName );
			}
			whereClause.push( fieldName + ' LIKE ?' );
			values.push( searchValue );
		}
		selectQueryWithLike = 'SELECT * FROM ' + schemaName + ' WHERE ' + whereClause.join( ' OR ' );

		ORM._transaction( { 
			query: selectQueryWithLike,
			replacements: [ values ],
			internalContext: this, 
			internalCallback: this._processResults, 
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
			fields = this._fieldsName, fieldName, fieldValue,
			schemaName = this._name,
			pk = this._primaryKey,
			insertQueryCols,
			insertQueryValues = [], values,
			insertQueryValuesTokens,
			insertQueries = [],
			data, i, l, k, m = fields.length,
			queryData;
		
		if( !Array.isArray( datas ) && typeof datas === 'object' ) {
			datas = [ datas ];
		}
		
		for( i = 0, l = datas.length; i < l; i++ ) {
			data = datas[i];
			insertQueryCols = [];
			values = [];
			insertQueryValuesTokens = [];
			for( k = 0; k < m; k++ ) {
				fieldName = fields[k];
				insertQueryCols.push( fieldName );
				fieldValue = this._getValueBySchema( fieldName, data[fieldName] );
				if( fieldName === pk &&
				// idValue maybe null or an negative number, in theses cases
				// we need to get the last_id from __currents_ids__
				( !fieldValue || fieldValue <= 0 ) ) {
					insertQueryValuesTokens.push( '( SELECT last_id FROM __currents_ids__ WHERE table_name = "' + schemaName + '" )' );

				} else {
					values.push( fieldValue );
					insertQueryValuesTokens.push( '?' );
				}
			}
			insertQueryValues.push( values );
			insertQueries.push( 'INSERT OR ROLLBACK INTO ' + schemaName + ' ( ' + insertQueryCols.join( ', ' ) + ' ) ' + 'VALUES ( ' + insertQueryValuesTokens.join( ' , ' ) + ' )' );
		}
		
		queryData = {
			query: insertQueries,
			replacements: insertQueryValues,
			userCallback: userCallback, 
			userContext: userContext,
			// need it to get the lastID
			isInsert: true
		};
		
		if( ORM._isBatchMode ) {
			return queryData;
		}
		
		ORM._transaction( queryData );
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
			whereData, setData, parsedValue,
			cmpFields, newValues,
			fieldName, fieldValue,
			whereClause,
			setClause,
			values = [], t,
			queries = [], i, l,
			queryData;
		
		if( !setDatas || typeof setDatas !== 'object' ) {
			MSQTA._Errors.set1( databaseName, schemaName, setDatas );
		}
		
		if( !Array.isArray( setDatas ) ) {
			setDatas = [ setDatas ];
		}
		
		for( i = 0, l = setDatas.length; i < l; i++ ) {
			setData = setDatas[i];
			
			t = [];
			setClause = [];
			whereClause = [];
			
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
			
			newValues = setData.data;
			// check newValues validity
			for( fieldName in newValues ) {
				fieldValue = newValues[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
					MSQTA._Errors.set5( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				setClause.push( fieldName + ' = ?' );
				t.push( parsedValue );
			}
			
			cmpFields = setData.target;
			// check cmpFields validity
			for( fieldName in cmpFields ) {
				fieldValue = cmpFields[fieldName];
				parsedValue = this._getValueBySchema( fieldName, fieldValue );
				if( !parsedValue && parsedValue !== schemaFields[fieldName].zero ) {
					MSQTA._Errors.set4( databaseName, schemaName, fieldName, fieldValue, parsedValue );
				}
				whereClause.push( fieldName + ' = ?' );
				t.push( parsedValue );
			}
			// whereClause can be empty
			
			queries.push( 'UPDATE OR ROLLBACK ' + schemaName + ' SET ' + setClause.join( ', ' ) + ( whereClause.length ? ' WHERE ' + whereClause.join( ' AND ' ) : '' ) );
			values.push( t );
		}
		
		queryData = { 
			query: queries,
			replacements: values,
			isUpdate: true,
			userCallback: userCallback, 
			userContext: userContext 
		};
		
		if( ORM._isBatchMode ) {
			return queryData;
		}

		ORM._transaction( queryData );
	},
/***************************************/
	del: function( ids, userCallback, userContext ) {
		var ORM = this._ORM,
			databaseName = ORM._name,
			pk = this._primaryKey,
			schemaName = this._name,
			id, parsedValue, 
			deleteQuery, whereClause = [],
			i, l,
			queryData;
		
		if( !pk ) {
			MSQTA._Errors.del1( databaseName, schemaName );
		}
		
		if( !ids ) {
			MSQTA._Errors.del2( databaseName, schemaName );
		}
		
		if( !Array.isArray( ids ) ) {
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
		
		queryData = { 
			query: deleteQuery,
			isDelete: true,
			userCallback: userCallback, 
			userContext: userContext 
		};
		
		if( ORM._isBatchMode ) {
			return queryData;
		}
		
		ORM._transaction( queryData );
	},
/***************************************/
	destroy: function( userCallback, userContext ) {
		var ORM = this._ORM,
			schemaName = this._name,
			dropQuery = 'DROP TABLE ' + schemaName;
		
		ORM._transaction( {
			internalCallback: this._destroy,
			internalContext: this,
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
			isDelete: true,
			userCallback: userCallback, 
			userContext: userContext 
		} );
	}
};
