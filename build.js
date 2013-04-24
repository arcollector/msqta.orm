// ************************************** //
// Dependencies
var copy = require( 'dryice' ).copy,
	shelljs = require( 'shelljs' ),
	fs = require( 'fs' );
	
// ************************************** //

function help() {

	console.log( 'Usage: ' );
	console.log( '' );
	console.log( 'To build MSQTA.ORM with support for IndexedDB and WebSQL, run the command:' );
	console.log( '		$ node build.js' );
	console.log( '	The final product will be located in the "release" directory' );
	console.log( '' );
	console.log( 'To build MSQTA.ORM with only support for IndexedDB run the comand:' );
	console.log( '		$ node build.js -indexeddb' );
	console.log( '' );
	console.log( 'To build MSQTA.ORM with only support for WebSQL run the comand:' );
	console.log( '		$ node build.js -websql' );
	console.log( '' );
	
}

// ************************************** //

function main() {
	
	var args = process.argv,
		option;

	if( args.length === 2 ) {
		buildFull();
	} else if( args.length === 3 ) {
		option = args[2].toLowerCase();
		if( option === '-indexeddb' ) {
			buildIndexedDB();
		} else if( option === '-websql' ) {
			buildWebSQL();
		} else {
			help();
		}
	} else {
		help();
	}
}

// ************************************** //
// Globals
var packageFile = fs.readFileSync( __dirname + '/package.json' );
var versionString = JSON.parse( packageFile ).version;
var msqtaFilename = 'msqta.orm-' + versionString;
var msqtaBuildDir = 'release';

var currentDir = './';

var msqtaORM = currentDir + 'msqta.orm.js';
var msqtaIndexedDBORM = currentDir + 'msqta.orm.indexeddb.js';
var msqtaIndexedDBSchema = currentDir + 'msqta.orm.schema.indexeddb.js';
var msqtaWebSQLORM = currentDir + 'msqta.orm.websql.js';
var msqtaWebSQLSchema = currentDir + 'msqta.orm.schema.websql.js';


var letters = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7', 'j8', 'j9', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9' ];
var currentLetter = 0;

// ************************************** //
function clean() {
	shelljs.rm( '-rf', './release' );
}

function preBuild() {
	shelljs.mkdir( '-p', './release' );
}

function getMsqtaBuildName( isMinified ) {
	return currentDir + msqtaBuildDir + '/' + msqtaFilename + ( isMinified ? '.min' : '' ) + '.js';
}

// ************************************** //

function removeDevMode( value ) {
	return value.replace( /--.+?--[\\tn]+/g, '' ).replace( /console\.[^;]+?;/g, '' ).replace( /if\( (this|self)\.devMode \) {[^}]+?}/g, '' ).replace( /(this|self)\.devMode[^;]+?;/g, '' ).replace( /defaultCallback: function[\s\S]+?},/, 'defaultCallback: function(){},' );
}

function replaceErrors( value ) {
	return value.replace( /MSQTA\._Errors\.[^;]+?;/g, "throw Error( E );" ).replace( /MSQTA\._Errors = {[\s\S]+?};/, '' ).replace( /throw Error\([^;]+?;/g, "throw Error( E );" );
}

function replaceKeywords( value ) {
	var methods = [ 'noop', 'defaultCallback', 'getCaster', 'castObj', 'castDate', 'castDate', 'castTime', 'castDateTime', 'castBoolean', 'castGeneric', 'dimSchemaInstance', 'dimORMInstance', 'getORMPrototype', 'instantiateSchema', 'getValueBySchema', 'resetSchemaAt', '_getValueBySchema', '_resetSchemaAt', 'getSanitizer', 'sanitizeString', 'sanitizeInt', 'sanitizeDate', 'sanitizeTime', 'sanitizeDatetime', 'sanitizeObj', 'sanitizeBoolean', 'sanitizeGeneric', 'zero', 'sanitizer', 'toJS', 'isDate', 'abstract', 'real', 'isJSON' ];
	var properties = [ '_Helpers', 'WebSQLSanitizers', 'IndexedDBSanitizers', 'webSQLSize', 'supportedDataTypes', 'webSQLZeros', 'indexedDBZeros', 'schemaMethods', 'ormMethods', '_IndexedDB', '_IDBTransaction', '_IDBKeyRange', '_queries', '_Schemas', '_batchsStack', '_isBlocked', '_schemasToInit', '_initCallback', '_initContext', '_ORM', '_name', '_schemaFields', '_indexes', '_uniques', '_primaryKey', '_fieldsName', '_Schema', '_isBatchMode', '_isWaiting', '_schemaKeepTrack', '_implementation', 'IndexedDB', 'WebSQL', 'schemaPrototype', 'args', 'filterCallback', 'userCallback', 'userContext', 'activeObjectStore', 'activeDatabase' ];
	var all = methods.concat( properties );
	var i = 0, l = all.length, firstChar;
	for( ; i < l; i++ ) {
		firstChar = all[i].charAt( 0 );
		if( firstChar !== '_' || firstChar !== '.' ) {
			firstChar = '';
		}
		value = value.replace( new RegExp( '\\b' + all[i] + '\\b', 'g' ), firstChar + letters[currentLetter] );
		currentLetter++;
	}
	return value;	
}

function replaceWebSQLKeywords( value ) {
	var methods = [ '_open', '_open2', '_initSchema', '_initSchemas', '_endSchemasInitialization', '_saveSchemaOnTestigoDatabase', '_deleteUserDatabase', '_deleteUserSchema', '_error', '_transaction', '_transaction2', '_results', '_continue', '_batch', '_init', '_init2', '_getIndexUniqueQuery', '_getIndexQuery', '_checkSchemaChanges', '_createSchema', '_updateSchema', '_updateSchema2', '_updateSchema3', '_updateSchema4', '_updateSchema5', '_updateSchema6', '_updateSchema7', '_updateSchema8', '_getByCallback', '_processResults', '_destroy', '_updateSchema9', '_updateSchema10', '_updateSchema11', '_getIndexName' ];
	var properties = [ '_testigoDB', '_schemasDefinition', '_queriesInternal', '_userDB', '_lastQuery', 'query', 'replacements', 'isUpdate', 'isDelete', 'isInsert', '_createTableQuery', '_indexesSQL', '_indexesToDelete', '_offset', '_tempSchemaName', '_queryErrorID', '_isSchemaDropped', 'isInternal', 'internalCallback', 'internalContext', 'returnValue', '_isEmpty', '_indexesToCreate' ];
	var all = methods.concat( properties );
	var i = 0, l = all.length, firstChar;
	for( ; i < l; i++ ) {
		firstChar = all[i].charAt( 0 );
		if( firstChar !== '_' || firstChar !== '.' ) {
			firstChar = '';
		}
		value = value.replace( new RegExp( '\\b' + all[i] + '\\b', 'g' ), firstChar + letters[currentLetter] );
		currentLetter++;
	}
	return value;
}

function replaceIndexedDBKeywords( value ) {
	var methods = [ '_initSchemas2', '_updateUserDatabaseRecord', '_initSchemaFail', '_createSchemaForReal', '_nextSchemaToInit', '_saveBranch', '_openUserDatabaseForChanges', '_openUserDatabase', '_preExec', '_exec', '_done', '_destroy2', '_getAll', '_getWithIDBKeyRange', 'openUserDB', 'openTestigoDB', 'getCursor', 'init', 'getRecord', 'saveRecord', 'nextRecord', 'done', '_openTestigoDatabase', '_getSchemaObjectStore', '_del2', '_del3' ];
	var properties = [ '_SwapRecords', 'endCallback', 'endContext', 'endArg', '_self', 'processCallback', 'isAdvance', 'key', 'targetDB', 'baseDB', 'isBaseDBMSQTA', 'targetSchema', 'openBaseDB', 'baseSchema', 'openTargetDB', 'targetSchema', '_currentSchema', '_currentBranch', 'recordsAffected', 'indexes' ];
	var all = methods.concat( properties );
	var i = 0, l = all.length, firstChar;
	for( ; i < l; i++ ) {
		firstChar = all[i].charAt( 0 );
		if( firstChar !== '_' || firstChar !== '.' ) {
			firstChar = '';
		}
		value = value.replace( new RegExp( '\\b' + all[i] + '\\b', 'g' ), firstChar + letters[currentLetter] );
		currentLetter++;
	}
	return value;
}

// ************************************** //

function buildFull() {

	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema, msqtaWebSQLORM, msqtaWebSQLSchema ];
	var dest = copy.createDataObject();
	
	// all the js joined in a big file
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
	
	// all the js joined in a big file MINIFIED!!
	copy( {
		source: source,
		filter: [ removeDevMode, replaceErrors, replaceKeywords, replaceWebSQLKeywords, replaceIndexedDBKeywords ],
		dest: dest,
	} );
	dest.value = '(function( window ) {\nvar E = "MSQTA-ORM!", T = "__msqta__", D = "databases", I = "name", C = "dump";\n' + dest.value.replace( /'__msqta__'/g, 'T' ).replace( /'databases'/g, 'D' ).replace( /'name'/g, 'I' ).replace( /'dump'/g, 'C' ) + '\nwindow.MSQTA = MSQTA;\n})( window );'
	copy( {
		source: dest,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );
	
}

// ************************************** //

function buildWebSQL() {
	
	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaWebSQLORM, msqtaWebSQLSchema ];
	var dest = copy.createDataObject();
	
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
	
	copy( {
		source: source,
		filter:[ removeDevMode, replaceErrors, replaceKeywords, replaceWebSQLKeywords ],
		dest: dest,
	} );
	
	dest.value = '(function( window ) {\nvar E = "MSQTA-ORM!";\n' + dest.value + '\nwindow.MSQTA = MSQTA;\n})( window );'
	copy( {
		source: dest,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );
}

// ************************************** //

function buildIndexedDB() {
	
	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema ];
	var dest = copy.createDataObject();
	
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
	
	copy( {
		source: source,
		filter: [ removeDevMode, replaceErrors, replaceKeywords, replaceIndexedDBKeywords ],
		dest: getMsqtaBuildName( true )
	} );
	
	dest.value = '(function( window ) {\nvar E = "MSQTA-ORM!";\n' + dest.value + '\nwindow.MSQTA = MSQTA;\n})( window );'
	copy( {
		source: dest,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );

}

// ************************************** //

main()