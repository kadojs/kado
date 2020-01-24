# Cluster
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Cluster = require('kado/lib/Cluster')
```
The `Cluster` library is an extension of the Node.JS `cluster` module that comes
bundled. This library adds features to the existing module such as:
* Connection counting
* Worker Recycling
* Worker Respawn on Unsafe Exit
* Easier cluster control via class API
* Graceful worker start and stop

## Class: Cluster

### event 'recycle'
Emitted when a worker has been recycled
* `worker` {worker} the worker that has been recycled
* `replacement` {worker} the new worker

### event 'orphan'
Emitted when a worker no longer has contact to the master
* `worker` {worker} the worker that has been recycled

### event 'exit'
Emitted when a worker exits
* `worker` {worker} the worker that has exited
* `code` {number} exit code of the worker
* `signal` {string} signal sent to the worker for exit

### event 'worker'
Emitted when a new worker comes online.
* `worker` {worker} the new worker

### event 'respawn'
Emitted when a worker has respawned
* `worker` {worker} the worker that crashed
* `replacement` {worker} the new worker
* `code` {number} the exit code of the crashed worker
* `signal` {signal} the signal sent to the crashed worker if any

### event 'path'
Emitted when a new worker path has been set
* `path` {string} the new worker path

### event 'starting'
Emitted when the cluster is starting

### event 'started'
Emitted when the cluster is started

### event 'stopping'
Emitted when the cluster is stopping

### event 'stopped'
Emitted when the cluster is stopped

### event 'messageError'
Emitted when an error occurs sending a worker a message
* `error` {Error} the thrown error

### event 'error'
Emitted when an error occurs
* `error` {Error} the thrown error

### static Cluster.handleSigint()
* Return {boolean} `true` when artificial SIGINT handling is used.

This adds proper SIGINT handling on win32 systems.

*Internal Use*

### static Cluster.child(server, title, start, stop)
* `server` {net.Server} instance of net server to track connections from
* `title` {string} title to set process.title to
* `start` {function} callback function returning a Promise on startup
* `stop` {function} callback function returning a Promise on shutdown
* Return {Promise} resolved when the child has finished starting

This method is used in cluster workers to setup communication with the master
process.

### static Cluster.getInstance(options)
* `options` {object} Runtime options to configure the cluster
* Return {Cluster} new cluster management object

### Cluster.constructor(options)
* `options` {object} Runtime options to configure the cluster
* Return {Cluster} new cluster management object

### Cluster.registerExitHandler()
* Return {void}

*Internal Use*

### Cluster.prepareWorker(worker)
* `worker` {worker} instance provided by the cluster module
* Return {worker} for use after modifications

This method sets up to remove listeners form workers to prevent a memory leak
over time.

*Internal Use*

### Cluster.checkRecycle(worker)
* `worker` {worker} instance provided by the cluster module
* Return {boolean} `true` when a worker is ready for recycle

*Internal Use*

### Cluster.recycleWorker(worker)
* `worker` {worker} instance provided by the cluster module
* Return {worker} the replacement worker

This will stop the existing `worker` passed in and start a `replacement` that is
returned.

*Internal Use*

### Cluster.handleWorkerMessage(worker, message)
* `worker` {worker} instance provided by the cluster module
* `message` {string} incoming message to be checked
* Return {boolean} `true` when all checks are okay or {worker} instance if a new
worker is needed by means of recycling.

*Internal Use*

### Cluster.setupWorker(worker)
* `worker` {worker} instance provided by the cluster module
* Return {worker} after being setup for use.

*Internal Use*

### Cluster.respawnWorker(worker, code, signal)
* `worker` {worker} instance provided by the cluster module
* `code` {number} exit code from the worker process
* `signal` {string} the signal used to end the worker process
* Return {Promise} resolved when the new worker is online

*Internal Use*

### Cluster.setupCluster()
* Return {void}

Used to setup the master process with the required options.

*Internal Use*

### Cluster.each(fn)
* `fn` {function} function to be called on by each worker `fn(worker)`
* Return {object} of results indexed by cluster.workers index

### Cluster.kill(signal = 'SIGTERM')
* `signal` {string} process signal to send the workers with a kill request
* Return {object} of results from each worker killed

### Cluster.exit(code)
* `code` {number} code to exit by.
* Return {void}

This method will immediately kill all workers with SIGKILL and then end the
master process with `code`.

### Cluster.send(message)
* `message` {string} message to be sent to all the workers
* Return {object} of results from workers that were sent the message

### Cluster.setEnv(env)
* `env` {object} of new environment properties to be merged
* Return {Cluster} this instance

### Cluster.getEnv()
* Return {object} of currently set environment properties

### Cluster.setPath(path)
* `path` {string} new path to execute workers on
* Return {Cluster} this instance

### Cluster.start()
* Return {Promise} resolved when all workers are online.

### Cluster.stop()
* Return {Promise} resolved when all workers have stopped.

### Cluster.restart()
* Return {Promise} resolved with `Cluster.stop()` and `Cluster.start()` have
finished.
