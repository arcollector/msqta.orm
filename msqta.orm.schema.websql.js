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
					
				} else if( isUnique ) {
					attrs.push( 'UNIQUE' );
				
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
			
			createTableQuery = this._createTableQuery,
			dropTableQuery,
		
			registeredSchemaDefinition, currentSchemaDefinition;
		
		if( this.forceDestroy ) {			
			dropTableQuery = '--MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the "' + databaseName + '" database, then it will recreate again--\n\tDROP TABLE IF EXISTS ' + schemaName;
		
			ORM._transaction( { query: [ dropTableQuery, createTableQuery ], internalContext: this, internalCallback: this._updateSchema2, isInternal: true } );
		
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
				this._ORM._saveSchemaOnTestigoDatabase( this._updateSchema11, this );
			
			} else {
				if( this.devMode ) {
					console.log( '\tno changes detected on its schema nor its index(s)!' );
				}
				if( this.forceEmpty ) {
					this._updateSchema10();
				} else {
					this._updateSchema9();
				}
			}
		}
	},
	
	_createSchema: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			databaseName = ORM._name,
			createTableQuery = this._createTableQuery;
		
		if( this.devMode ) {
			console.log( '\tthe schema is a new one, starting creation process!' );
		}
		
		// create the new table
		ORM._transaction( { query: createTableQuery, internalContext: this, internalCallback: this._updateSchema8, isInternal: true } );
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
			console.log( '\t\t1) Creating table "' + tempSchemaName + '" (this will be the new one at the end of the process)' );
		}
		
		ORM._transaction( { query: createTempTableQuery, internalContext: this, internalCallback: this._updateSchema2, isInternal: true } );
	},
	
	_updateSchema2: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			tempSchemaName = this._tempSchemaName,
			indexQueries = [],
			indexesToCreate = this._indexesToCreate;
		
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
		
		if( this.forceEmpty ) {
			if( this.devMode ) {
				console.log( '\t\t"forceEmpty" flag detected, the records will no be saved!' );
			}
			// dont clean again
			this._isEmpty = true;
			// goto directly to step 
			this._updateSchema9();
		
		// not need to save records
		} else if( this.forceDestroy ) {
			this._updateSchema8();
			
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
			console.log( '\t\t7) Updating schema process has ended successful' );
		}
		
		this._updateSchema8();
	},
	
	_updateSchema8: function() {
		var ORM = this._ORM;
		
		if( this.forceEmpty && !this._isEmpty ) {
			this._updateSchema10();
		} else {
			this._updateSchema9();
		}
	},
	
	_updateSchema9: function() {
		// clean
		delete this._createTableQuery;
		delete this._indexesToCreate;
		delete this._isEmpty;
		delete this._tempSchemaName;
		delete this._offset;
		delete this._indexesToDelete;
		
		this._initCallback.call( this._initContext, true );
		delete this._initCallback;
		delete this._initContext;
		
		// continue
		this._ORM._initSchemas();
	},
	
	_updateSchema10: function() {
		var ORM = this._ORM,
			databaseName = ORM._name,
			schemaName = this._name,
			emptyQuery = '--MSQTA-ORM: "forceEmpty" flag detected: emptying the "' + schemaName + '" schema from the "' + databaseName + '" database--\n\tDELETE FROM ' + schemaName;
			
		ORM._transaction( { query: [ emptyQuery ], internalContext: this, internalCallback: this._updateSchema9, isInternal: true } );
	},
	
	_updateSchema11: function() {
		var ORM = this._ORM,
			schemaName = this._name,
			indexQueries = [],
			indexesToDelete = this._indexesToDelete,
			fieldName, indexesToCreate = this._indexesToCreate;
		
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
		
		ORM._transaction( { query: indexQueries, internalContext: this, internalCallback: this._updateSchema8, isInternal: true } );
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
		
		if( !( searchValue instanceof Array ) ) {
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
		
		if( !( fields instanceof Array ) ) {
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
			fields = this._fieldsName, fieldName,
			schemaName = this._name,
			insertQueryCols,
			insertQueryValues = [], values,
			insertQueryValuesTokens,
			insertQueries = [],
			data, i, l, k, m = fields.length,
			queryData;
		
		if( !( datas instanceof Array ) && typeof datas === 'object' ) {
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
				values.push( this._getValueBySchema( fieldName, data[fieldName] ) );
				insertQueryValuesTokens.push( '?' );
			}
			insertQueryValues.push( values );
			insertQueries.push( 'INSERT INTO ' + schemaName + ' ( ' + insertQueryCols.join( ', ' ) + ' ) ' + 'VALUES ( ' + insertQueryValuesTokens.join( ' , ' ) + ' )' );
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
		
		if( !( setDatas instanceof Array ) ) {
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
			
			queries.push( 'UPDATE ' + schemaName + ' SET ' + setClause.join( ', ' ) + ( whereClause.length ? ' WHERE ' + whereClause.join( ' AND ' ) : '' ) );
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
