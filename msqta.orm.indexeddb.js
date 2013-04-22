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
						
						callback.call( context || window );
					};
				};
			};
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
			
			objectStore.clear().onsuccess = function( e ) {
				self._updateSchema8();
			};
		};
	},
		
	_updateSchema8: function() {
		if( this.devMode ) {
			console.log( '\t(7) update schema process is done' );
		}
		// done
		this._nextSchemaToInit();
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
	
	_nextSchemaToInit: function() {
		var Schema = this._currentSchema,
			callback = Schema._initCallback,
			context = Schema._initContext;
		
		if( callback ) {
			// get back to the user
			callback.call( context || window );
		}
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
			
			if( pk && targetPk ) {
				objectStore.get( targetPk ).onsuccess = function( e ) {
					var record = e.target.result,
						req;
					// update the record
					for( fieldName in setData ) {
						record[fieldName] = setData[fieldName];
					}
					
					req = objectStore.put( record );
					req.onsuccess = function( e ) {
						affectedRows++;
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
								affectedRows++;
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
			Schema = self._Schemas[schemaName],
			schemaName = queryData.schema,
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
						
						this._done( queryData );
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