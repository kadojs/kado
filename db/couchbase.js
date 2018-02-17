'use strict';
var P = require('bluebird')
var couchbase = require('couchbase')
var debug = require('debug')('stretchfs:couchbase')

var N1Query = couchbase.N1qlQuery

var CouchSchema = require('./CouchSchema')
var logger = require('./logger')

var config = require('../config')

var buckets = {}
var dsn = ''
var isAuthenticated = false


/**
 * Couchbase connection timeout default
 * @type {number}
 */
couchbase.BucketImpl.connectionTimeout = config.couch.connectionTimeout || 60000


/**
 * Couchbase operation timeout default
 * @type {number}
 */
couchbase.BucketImpl.operationTimeout = config.couch.operationTimeout || 30000


/**
 * Connect to Couchbase
 * @param {object} conf
 * @return {object}
 */
var connectCouchbase = function(conf){
  var xopts = ('object' === typeof conf.options) ?
    '?' + conf.options.join('&') : ''
  dsn = (conf.protocol || 'couchbase://') +
    (conf.dsnHost || conf.host || '127.0.0.1') + xopts
  debug('connecting to couchbase',dsn)
  return P.promisifyAll(new couchbase.Cluster(dsn))
}
var cluster = connectCouchbase(config.couch)

var client = {
  cluster: cluster,
  type: {
    stretchfs: 'stretchfs'
  },
  initBucket: {
    stretchfs: function(manager){
      return manager.createPrimaryIndexAsync({
        name: 'stretchfsPrimary', ignoreIfExists: true
      })
        .then(function(){
          return manager.createIndexAsync(
            'name',['name'],{ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'handle',['handle'],{ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'createdAt',['createdAt'],{ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'updatedAt',['updatedAt'],{ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'jobAssign',['category','priority','status'],{ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'jobWorker',
            ['category','priority','status','workerKey','workerName'],
            {ignoreIfExists: true})
        })
        .then(function(){
          return manager.createIndexAsync(
            'inventorySizeType',['mimeType','size'],{ignoreIfExists: true}
          )
        })
        .then(function(){
          return manager.createIndexAsync(
            'inventoryCopies',['copies','desiredCopies'],{ignoreIfExists: true}
          )
        })
        .then(function(){
          return manager.createIndexAsync(
            'inventoryMap',['map','desiredMap'],{ignoreIfExists: true}
          )
        })
    }
  }
}


/**
 * Open Couchbase bucket
 * @param {string} name
 * @return {object}
 */
client.openBucket = function(name){
  debug('opening bucket',name)
  if(buckets[name]) return buckets[name]
  if(!isAuthenticated){
    debug('authenticating cluster',config.couch.username,config.couch.password)
    cluster.authenticate(config.couch.username,config.couch.password)
    isAuthenticated = true
  }
  buckets[name] = P.promisifyAll(cluster.openBucket(name,function(err){
    if(!err){
      debug('connected to',name)
      return
    }
    logger.log(
      'error',
      'Failed to connect to Couchbase bucket ' + dsn + ' ' +
      name + ': ' + err.message
    )
  }))
  buckets[name].type = client.type[name]
  return buckets[name]
}


/**
 * Close open bucket and make the next call reopen it
 * @param {string} name
 * @return {boolean}
 */
client.closeBucket = function(name){
  if(!buckets[name]) return false
  buckets[name].disconnect()
  delete buckets[name]
  return true
}


/**
 * Get a database name
 * @param {string} database
 * @param {boolean} escape
 * @return {string}
 */
client.getName = function(database,escape){
  if('undefined' === typeof escape) escape = true
  if(!config || !config.couch || !config.couch.bucket)
    throw new Error('Could not get database name, config missing!')
  if(!database)
    throw new Error('Could not get database name, request blank')
  if(!config.couch.bucket[database])
    throw new Error('Could not get database name, section doesnt exist')
  if(!config.couch.bucket[database].name)
    throw new Error('Could not get database name, name missing')
  var name = config.couch.bucket[database].name
  if(true === escape) name = '`' + name + '`'
  return name
}


/**
 * Disconnect any open buckets
 * @return {boolean}
 */
client.disconnect = function(){
  for(var bucket in buckets){
    if(bucket && bucket.disconnect && 'function' === typeof bucket.disconnect){
      bucket.disconnect()
    }
  }
  return true
}


/**
 * Get a promise friendly bucket manager
 * @param {object} bucket
 * @return {P}
 */
client.getBucketManager = function(bucket){
  return P.promisifyAll(bucket().manager())
}


/**
 * Get cluster manager
 * @return {p}
 */
client.getClusterManager = function(){
  debug('setup cluster manager',
    config.couch.admin.username,config.couch.admin.password)
  return P.promisifyAll(
    cluster.manager(config.couch.admin.username,config.couch.admin.password)
  )
}


/**
 * Create couchbase indexes a harmless repeatable way
 * @return {P}
 */
client.createIndexes = function(){
  return P.try(function(){
    var types = []
    for(var type in client.type){
      if(client.type.hasOwnProperty(type)){
        types.push(client.type[type])
      }
    }
    return types
  })
    .each(function(name){
      debug('Initializing bucket',name)
      var manager = client.getBucketManager(client[name])
      var initFn = client.initBucket[name]
      //skip undefined init functions
      if(!initFn) return
      debug('Got manager',name)
      return initFn(manager)
        .then(function(result){
          debug('Initialization complete',name,result)
        })
        .catch(function(err){
          console.log('Couchbase bucket init error',err)
        })
    })
}


/**
 * Create couchbase buckets
 * @return {P}
 */
client.createBuckets = function(){
  var manager = client.getClusterManager()
  var userRoles = []
  return P.try(function(){
    var types = []
    for(var type in client.type){
      if(client.type.hasOwnProperty(type)){
        types.push(client.type[type])
      }
    }
    return types
  })
    .each(function(name){
      var bucketName = config.couch.bucket[name].name
      var bucketParams = {
        ramQuotaMB: config.couch.bucket[name].ramQuotaMB,
        authType: 'sasl',
        bucketType: 'couchbase',
        replicaNumber: 1
      }
      debug('Creating bucket',bucketName,bucketParams)
      userRoles.push({role: 'bucket_full_access', bucket_name: bucketName})
      return manager.createBucketAsync(bucketName,bucketParams)
        .then(function(result){
          debug('Bucket creation complete',result.statusCode,result.body)
        })
        .catch(function(err){
          if(!err.message.match(/^Bucket with given name already exists/))
            console.log('Couchbase bucket creation error',err)
        })
    })
    .then(function(result){
      debug('user creation complete',result)
      return userRoles
    })


}


/**
 * Create cluster user
 * @param {string} username
 * @param {string} password
 * @param {array} roles
 * @return {P}
 */
client.createUser = function(username,password,roles){
  var manager = client.getClusterManager()
  debug('creating cluster user',username,password,roles)
  return manager.upsertUserAsync('local',username,{
    name: 'StretchFS Manager',
    password: password,
    roles: roles
  })
}


/**
 * Help use the couchbase counters better
 * @param {object} db
 * @param {string} key
 * @param {Number} increment
 * @return {P}
 */
client.counter = function(db,key,increment){
  if(!increment) increment = 1
  else increment = parseInt(increment,10)
  return db.counterAsync(key,increment,{initial: 1})
}


/**
 * Store hourly counters
 * @param {object} db
 * @param {string} key
 * @param {Number} increment
 * @return {P}
 */
client.counterHour = function(db,key,increment){
  key = key + ':' + Math.floor(+new Date() / 1000 / 3600)
  if(!increment) increment = 1
  else increment = parseInt(increment,10)
  return db.counterAsync(key,increment,{initial: 1, expiry: 172800})
}


/**
 * Helper to mutate in updates with brevity
 * @param {object} db
 * @param {string} key
 * @param {string} action
 * @param {string} path
 * @param {*} value
 * @return {P}
 */
client.mutateIn = function(db,key,action,path,value){
  return new P(function(resolve,reject){
    return db.mutateIn(key)[action](
      path,value,{createParents: true}
    ).execute(function(err){
      if(err){
        console.log('mutateIn error',key,action,path,value,err)
        reject(err)
      } else resolve()
    })
  })
}


/**
 * Clear counters in a bucket
 * @param {object} db
 * @return {P}
 */
client.clearCounters = function(db){
  var qstring = 'DELETE FROM ' +
    client.getName(db.type) + ' WHERE META().id LIKE $1 OR META().id LIKE $2'
  var params = [
    client.schema.counter() + '%',
    client.schema.counterError() + '%'
  ]
  var query = client.N1Query.fromString(qstring)
  var lastClearKey = client.schema.lastCounterClear()
  return db.queryAsync(query,params)
    .then(function(){
      return db.getAsync(lastClearKey)
    })
    .then(
      function(result){
        result.value.lastCounterClear = new Date().toJSON()
        return db.upsertAsync(lastClearKey,result.value,{cas: result.cas})
          .catch(function(err){
            console.log('Failed to update last counter clear',err)
          })
      },
      function(err){
        if(13 !== err.code) throw err
        var params = {lastCounterClear: new Date().toJSON()}
        return db.upsertAsync(lastClearKey,params)
      }
    )
}


/**
 * Clear slots in a bucket
 * @param {object} db
 * @return {P}
 */
client.clearSlots = function(db){
  var qstring = 'DELETE FROM ' +
    client.getName(db.type) + ' WHERE META().id LIKE $1'
  var params = [client.schema.slot() + '%']
  var query = client.N1Query.fromString(qstring)
  return db.queryAsync(query,params)
}


/**
 * Setup the StretchFS DB
 * @return {Object}
 */
client.stretchfs = function(){
  return client.openBucket(
    config.couch.bucket.stretchfs.name,
    config.couch.bucket.stretchfs.secret
  )
}


/**
 * Add schema to helper
 * @type {CouchSchema}
 */
client.schema = new CouchSchema(config.couch.prefix)


/**
 * Export N1Query object
 * @type {N1Query}
 */
client.N1Query = N1Query


/**
 * Export client
 * @return {object} client
 */
module.exports = client
