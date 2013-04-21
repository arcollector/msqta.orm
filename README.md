MSQTA.ORM
=========
IndexedDB-WebSQL abstract layer ORM.

License
----------
MSQTA.ORM is free and open source software distributed under the [BSD License](http://opensource.org/licenses/BSD-3-Clause).

Build MSQTA.ORM
-----------------------
In order to build MSQTA.ORM run the following command:
(you need the packages [dryice](https://github.com/mozilla/dryice) and [shelljs](https://github.com/arturadib/shelljs))

	$ node build.js
	
The final `.js` will be located in the `./release` directory.

How to use it
============
Just place the following script tag pointing to wherever you have `msqta.orm.js` build file

	<script src="msqta.orm-1.0.0.js"></script>
	
Getting started
--------------------
Remember this: **MSQTA.ORM stores js objects into schemas**, and you do NOT need to care about **what is the current version number of my database?**, MSQTA.ORM it will take care of this.

A js object, is just a that, for example:
```javascript
	{ name: 'John Doe', age: 12, food: [ 'pizza', 'hamburger' ] }
```	
A schema is like a *table* that holds these objects, and every property name that composes the object refers to a field *(column)* name of that schema, each field support a particular variable type, these are:
* string
* integer
* float
* array
* object
* boolean

Every schema *(a table)* are placed into a database, creating the database is the first step that you need to do.

Creating a database
--------------------------
Creating is also opening a database, you only create a database the first time that you invock it. So to create/open a database do this:
```javascript
	var db = new MSQTA.ORM( settings, [callback], [context] );
```
`settings` is an object with the following information:
* `name`: the name of the database.
* `devMode` *(optional)*: output to the browser console what MSQTA.ORM are doing.
* `prefered` *(optional)*: some browsers supports WebSQL and IndexedDB, use this field to force it to use a specific implementation, if the browser don't support the prefered implementation it will use the implementation that it really support.
* `forceDestroy` *(optional)*: only useful in dev stage, it drop the named database to be recreated again, brings to you always an empty database. This only possible with an IndexedDB implementation.

`[callback]` an function to be called with a specified `[context]` after the database is created/opened.

## Creating a schema
A schema is just like a table, to set a schema do this:
```javascript
	var schema = new db.Schema( settings, [options] )
```	
`settings` is an object that dictates the name of the schema, its fields *(columns)* and the primary key, for example something like this (all are required):
```javascript
	name: 'clients',
	fields: {
		id: { type: 'integer' },
		name: { type: 'string', index: true },
		email: { type: 'string' },
		tel: { type: 'string', allowNull: true, index: true },
		address: { type: 'string' },
		comments: { type: 'string' }
	},
	primaryKey: 'id'
```	
* `name`: name of the schema
* `fields`: the columns definition of the schema according to this:

```javascript
	name_of_the_field(column): { 
		type: 'string|integer|float|object|array|boolean', // the field type
		index: true|false, // use this field as an index? (optional)
		unique: true|false, // only unique values are permitted? (optional)
		allowNull: true|false // can i store the null value? (optional)
	}
```

* `primaryKey`: the name of the field *(column)* that is the primary key. **You always has to specified a primary key and it must be of the type integer!**

`options` *(optional)*: an object that with the following information:
* `forceDestroy`: destroy the current schema to be recreated again, its useful is you want always an empty table.
* `forceEmpty`: this is a like forceDestroy, but will the difference that this one will not drop the schema, instead it will just empty that schema
* `callback`: a function to be called after the schema is setted with...
* `context`: ...a specified context

**THIS IS VERY IMPORTANT**: When you change a schema field type, MSQTA.ORM will recast the current values of that field to the new specified type, so in theory you will never lost information, for example if is the previously field type was `string` and now is `integer`, all the current values will casted to `0` or maybe `null` is the property `allowNull` is setted up.

## CRUDing
## Putting values on a schema (put)
This is like doing an `INSERT INTO...` on a speficied schema *(a table)*. To do so, do this:
```javascript	
	schema.put( {
		name: 'Juan Perez',
		email: 'bg@gmial.com',
		tel: '111945045406'
	}, [callback], [context] );
```
`schema` is the variable that MSQTA.ORM returns to you, when you instanciate an schema.
Remember that all values need to be casted to the specified column type, so for example is the column type is `string` and you pass to it the integer `1343` it will casted to `"1343"`, if the value is casted to a non-value, the zero value of that column is will used, for example in the case of string, an empty string will be used it.

You can also put multilpes objects *(rows)*, by passing array that contains severals object to be stored.
```javascript
	schema.put( [ { name: 'Elvis' }, { name: 'John' }, { name: 'Laura' } ], [callback], [context] );
```
The `callback` will be receibe a param that is the ID of the newly inserted row.

## Setting values on a schema (set)
This is like a `UPDATE table SET col = value WHERE id = 1`.

To do so, do this:
```javascript	
	schema.set( {
		data: {
			tel: '111945045406'
		},
		target: {
			id: 1
		}
	}, [callback], [context] );
```
To set *(update)* an exisiting object *(row)*, the update object must be contains two propeties:
* `data`: an object that contains the fields *(columns)* to be updated
* `target`: an oject that contains the fields with an specified value, that is used to detect what objects needs to be updated.

So in this example, it says, find the object(s) *(rows)* will the field *(column)* `id` that is equal to `1`, and then update its field *(column)* `tel` to the value `'111945045406'`

You can also set *(update)* multiple objects *(rows)* at a single call, by passing an array that contains multiple update objects.
```javascript
	schema.set( [ { data: { name: 'Elvis' }, target: { id: 1 } }, { { data: name: 'John' }, target: { id: 2 } } ], [callback], [context] );
```

The `callback` will be receibe a param that is the count of affected rows.

## Deleting on a schema (del)
This is like a `DELETE FROM table WHERE id = 1`, **just know that you can only delete by a primary key value!**

To delete an object *(row)* do this:
```javascript	
	schema.del( 1, [callback], [context] );
```

You can also delete various objects *(rows)* at a single call by passing an array, like this:
```javascript	
	schema.del( [ 1, 2, 3 ], [callback], [context] );
```

The `callback` will be receibe a param that is the count of affected rows.

## Truncating on a schema (empty)
This is like a `TRUNCATE TABLE table`.

To do so, do this:
```javascript	
	schema.empty( [callback], [context] );
```

## Deleting a schema (destroy)
This is like a `DROP TABLE table`.

To do so, do this:
```javascript	
	schema.destroy( [callback], [context] );
```
**Just know that also the schema instance will be dimmed!**

## Quering
## getAll
Retrieves all records.
```javascript	
	schema.getAll( [callback], [context] );
```

## get 
Retrieves all records that have any of its fields values equals to `searchValue`.
```javascript	
	schema.get( searchValue, [callback], [context] );
```

* `searchValue`: a string used to do the comparsion.

## getByIndex
Retrieves all records where the specified `indexName` that must to refers to a field that also must be an index where its value is equals to `searchValue`.
```javascript	
	schema.getByIndex( indexName, searchValue, [ callback ], [ context ] );
```

* `indexName`: a string that referes to field that must be also an index or the primary key.
* `searchValue`: can be a string OR an array with multiple strings used to do the comparsion.

## getByIndexWithRange
Retrieves all records where the specified `indexName` that must to refers to a field that also must be an index where its value falls in the specified range
```javascript	
	schema.getByIndex( indexName, rangeData, [ callback ], [ context ] );
```

* `indexName`: a string that referes to field that must be also an index or the primary key.
* `rangeData`: an object that its properties name are operators of the types: `>|<|>=|<=|=`, for example, something like this:
```javascript
	{ '>': 2010-10-10', '<': 2010-10-31' }
```

Check this example:
```javascript
	schema.getByIndexWithRange( 'date', { '>': '2010-10-10', '<': '2010-10-31' }, [ callback ], [ context ] );
```
This says, get all the records where its field/index `date` where its value falls into the range `date > '2010-10-10' **AND** date < '2010-10-31'`

## getAllWithLike
Retrieves all records where any of its fields are like the specified one, this like using the `LIKE %string%` operator from the sql standard.
```javascript
	schema.getAllWithLike( fieldsName, likeData, [ callback ], [ context ] );
```

* `fieldsName`: a string OR an array with fields name used to do the comparision.
* `likeData`: an object with the following information:

```javascript
	{
		// where to put the % operator
		'start|end|both': 'a string value'
	}
```

Check this example
```javascript
	schema.getAllWithLike( 'name', { end: 'doe' }, [ callback ], [ context ] );
```
Thinking in sql, this will translate to:
```sql
	SELECT * FROM table_name WHERE name LIKE "doe%"
```
	
## getByCallback
Retrieves all records that sastifies wherever you do in `filterCallback`

```javascript
	schema.getByCallback( filterCallback, [ callback ], [ context ] );
```

* `filterCallback`: will receibe at every iteration of the results set that MSQTA.ORM is currently processing, the current record, you only has to return `true` or `false`, to tells to MSQTA.ORM that this record must be part of the final results set or not.

Limitations
==========
* MSQTA.ORM don't offers the posibility to do joins, to simulate this situation you have to filter by the field that acts as a foreign key, by using any of the quering methods.
* Primary keys must be of the type integer and cannot be ommited. Composite primary keys are not supported.
* Indexes must only be of the type string or numeric.
* Only a single active connection to a database is supported.
