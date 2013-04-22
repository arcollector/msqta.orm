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

function buildFull() {

	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema, msqtaWebSQLORM, msqtaWebSQLSchema ];
	
	copy( {
		source: source,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );
	
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
	
}

// ************************************** //

function buildWebSQL() {
	
	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaWebSQLORM, msqtaWebSQLSchema ];
	
	copy( {
		source: source,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );
	
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
	
}

// ************************************** //

function buildIndexedDB() {
	
	clean();
	preBuild();
	
	var source = [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema ];
	
	copy( {
		source: source,
		filter: copy.filter.uglifyjs,
		dest: getMsqtaBuildName( true )
	} );
	
	copy( {
		source: source,
		dest: getMsqtaBuildName()
	} );
}

// ************************************** //

main()