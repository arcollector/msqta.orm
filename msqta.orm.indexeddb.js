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
			rangePk = queryData.rangePk,
			rangeIndex = queryData.rangeIndex,
			rangeKey = queryData.rangeKey,
			objectStore = queryData.activeObjectStore,
			data = [];
		
		var grabRecords = function( e ) {
			var cursor = this.result;
			if( cursor ) {
				data.push( cursor.value );
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
