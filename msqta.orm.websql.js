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
		
		// this holds all the internal queries that are made when
		// a schema is initialized, these queries are more important
		// that this._queries in terms at the moment of execute the next query
		this._queriesInternal = [];
		
		this._userDB = window.openDatabase( this._name, 1, '', MSQTA._Helpers.webSQLSize );

		this._initCallback.call( this.initContext, true );
		
		this._initSchemas();
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
	
	_saveSchemaOnTestigoDatabase: function( callback, context, arg ) {
		var self = this,
			databaseName = this._name,
			schemasDefinition = this._schemasDefinition;
		
		if( this.devMode ) {
			console.log( 'MSQTA-ORM: saving schema definition in the testigo database to keep tracking future changes on it' );
		}
		this._testigoDB.transaction( function( tx ) {
			tx.executeSql( 'REPLACE INTO databases( name, schemas ) VALUES( "' + databaseName + '", ' + "'" + JSON.stringify( schemasDefinition ) + "'" + ')', [], function() {
				// true for success
				callback.call( context, arg );
			} );
		} );
	},
	
	_deleteUserDatabase: function( callback, context ) {
		this.destroy( callback, context );
	},
	
	_deleteUserSchema: function( Schema, queryData ) {
		var schemaName = Schema._name;
		
		delete this._Schemas[schemaName];
		delete this._schemasDefinition[schemaName];
		MSQTA._Helpers.dimSchemaInstance( Schema );
	
		this._saveSchemaOnTestigoDatabase( queryData.userCallback, queryData.userContext, true );
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
			// update an update at time is executed, so we need to keep tracking manually
			// the affected rows
			rowsAffected = 0,
			query = queryData.query;
		
		if( !( query instanceof Array ) ) {
			query = [ query ];
		}
		
		// when you trigger multiple update queries, we need to keep
		// track the rows affected in the operation
		var noop = queryData.isUpdate ? function( tx, results ) {
			rowsAffected += results.rowsAffected;
		} : MSQTA._Helpers.noop;
		
		var success = function( tx, results ) {
			if( queryData.isUpdate ) {
				// sum the last executed one
				queryData.returnValue = results.rowsAffected + rowsAffected;
		
			} else if( queryData.isInsert ) {
				queryData.returnValue = results.insertId;
			
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
		queryData = this._lastQuery;
		
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
			queryData.userCallback.call( queryData.userContext, queryData.returnValue );
		}
		
		this._continue();
	},
	
	_continue: function() {
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
