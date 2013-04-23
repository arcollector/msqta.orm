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
			
			dropTableQuery = '--MSQTA-ORM: "forceDestroy" flag detected: destroying the "' + schemaName + '" schema from the "' + databaseName + '" database, then it will recreate again\n\tDROP TABLE IF EXISTS ' + schemaName;
		
			ORM._transaction( { query: [ dropTableQuery, createTableQuery ], context: this, callback: this._updateSchema5, isInternal: true } );
		
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
		ORM._transaction( { query: [ createTableQuery ], context: this, callback: this._updateSchema5, isInternal: true } );
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
		
		ORM._transaction( { query: [ createTempTableQuery ], context: this, callback: this._updateSchema2, isInternal: true } );
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
	
		ORM._transaction( { query: [ selectQuery ], context: this, callback: this._updateSchema3, isInternal: true } );
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
			ORM._transaction( { query: insertQueries, context: this, callback: this._updateSchema2, isInternal: true } );
		} else {
			ORM._transaction( { query: insertQueries, context: this, callback: this._updateSchema4, isInternal: true } );
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
		
		ORM._transaction( { query: [ dropQuery, renameQuery ], context: this, callback: this._updateSchema5, isInternal: true } );
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
			ORM._transaction( { query: indexQueries, context: this, callback: this._updateSchema6, isInternal: true } );
			
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
		
		this._initCallback.call( this._initContext, true );
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
			
		ORM._transaction( { query: [ emptyQuery ], context: this, callback: this._updateSchema7, isInternal: true } );
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
			whereData, setData,
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
			isDelete: true,
			userCallback: userCallback, 
			userContext: userContext 
		} );
	}
};
