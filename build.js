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
var msqtaFilename = 'msqta.orm-' + versionString + '.js';
var msqtaBuildDir = 'release';
var msqtaBuildPath = './' + msqtaBuildDir + '/' + msqtaFilename;

var msqtaORM = './' + 'msqta.orm.js';
var msqtaIndexedDBORM = './' + 'msqta.orm.indexeddb.js';
var msqtaIndexedDBSchema = './' + 'msqta.orm.schema.indexeddb.js';
var msqtaWebSQLORM = './' + 'msqta.orm.websql.js';
var msqtaWebSQLSchema = './' + 'msqta.orm.schema.websql.js';


// ************************************** //
function clean() {
	shelljs.rm( '-rf', './release' );
}

function preBuild() {
	shelljs.mkdir( '-p', './release' );
}

// ************************************** //

function buildFull() {

	clean();
	preBuild();
	
	copy( {
		source: [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema, msqtaWebSQLORM, msqtaWebSQLSchema ],
		filter: copy.filter.uglifyjs,
		dest: msqtaBuildPath
	} );
	
}

// ************************************** //

function buildWebSQL() {
	
	clean();
	preBuild();

	copy( {
		source: [ msqtaORM, msqtaWebSQLORM, msqtaWebSQLSchema ],
		filter: copy.filter.uglifyjs,
		dest: msqtaBuildPath
	} );
}

// ************************************** //

function buildIndexedDB() {
	
	clean();
	preBuild();
	
	copy( {
		source: [ msqtaORM, msqtaIndexedDBORM, msqtaIndexedDBSchema ],
		filter: copy.filter.uglifyjs,
		dest: msqtaBuildPath
	} );
}

// ************************************** //

main()