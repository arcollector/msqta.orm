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
