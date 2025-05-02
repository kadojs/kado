# Child Process
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const ChildProcess = require('kado/lib/ChildProcess')
```
This library provides an enhanced interface to use Node.js core `child_process`
module, making it easier to manage long-running child processes with automatic
respawning and message passing capabilities.

NOTE: This library is not to be confused with the core `ChildProcess` object
which is used internally.

## Examples

### Basic Worker Process
```js
const ChildProcess = require('kado/lib/ChildProcess')

// Create a child process that runs a worker file
const worker = new ChildProcess({
  path: './workers/data-processor.js',
  env: { WORKER_ID: '1' },
  respawn: true  // automatically restart if the process dies
})

// Start the worker
await worker.start()

// Send data to the worker for processing
worker.send({ type: 'PROCESS_DATA', data: [1, 2, 3] })

// Listen for results from the worker
worker.on('message', (message) => {
  if (message.type === 'RESULT') {
    console.log('Processed result:', message.data)
  }
})

// Later, stop the worker
await worker.stop()
```

### Example Worker File (data-processor.js)
```js
// This is the code that runs in the child process
process.on('message', (message) => {
  if (message.type === 'PROCESS_DATA') {
    // Do some CPU-intensive work
    const result = message.data.map(x => x * 2)
    
    // Send result back to parent
    process.send({ type: 'RESULT', data: result })
  }
})
```

The above example demonstrates how to:
- Create a worker process for CPU-intensive tasks
- Pass messages between parent and child processes
- Automatically restart crashed workers
- Handle graceful shutdown

## Class: ChildProcess extends EventEmitter

### ChildProcess.constructor(options)
* `options` {object} options used to setup the child process
* Return {ChildProcess} new instance tied to the child process.

Example:
```js
const child = new ChildProcess()
child.start()
```

### ChildProcess.setEnv(env)
* `env` {object} new environment parameters to merge in
* Return {ChildProcess} this instance

### ChildProcess.getEnv()
* Return {object} currently compiled environment object to be passed to new
calls to `cp.fork()`

### ChildProcess.setPath(path)
* `path` {string} set the child path to this new path.
* Return {ChildProcess} this instance

Change the path of the child process after instantiation.

### ChildProcess.send(message, sendHandler, options)
* `message` {mixed} data to send to the child
* `sendHandler` {Handle} special handle used to pass sockets to workers, see
the [core Node.js documentation](https://nodejs.org/dist/latest-v13.x/docs/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback)
* `options` {object} available options `keepOpen` which is also use specially
for sending sockets.
* Return {object} of results indexed by the child pid.

### ChildProcess.kill(signal = 'SIGTERM')
* `signal` {string} signal to be sent to the child process for termination.
* Return {object} result of `ChildProcess.onExit(signal)`

### ChildProcess.start()
* Return {Promise} resolved when all bound children have started.

### ChildProcess.stop()
* Return {Promise} resolved when all bound children have stopped.

### ChildProcess.setStatus(status)
* `status` {string} set the current status of the system.
* Return {ChildProcess} this instance

Change the state of the child process instance.

*Internal Use*

### ChildProcess.onExit(signal = 'SIGKILL')
* Return {number} of processes killed by this method.

*Internal Use*

### ChildProcess.registerExitHandler()
* Return {void}

*Internal Use*

### ChildProcess.handleMessage(proc, message)
* `proc` {cp} instance of core child_process object returned from fork.
* `message` {string} incoming message from child
* Return {void}

Passes the messages upwards via the `message` event.

*Internal Use*

### ChildProcess.respawnChild()
* Return {void}

If the child is closed, and respawns are enabled and the state of the class is
`started = true` this will start a new child process in the previous processes
place.

*Internal Use*

### ChildProcess.addChild(proc)
* `proc` {cp} instance of core child_process object returned from fork.
* Return {cp} proc instance passed in

This method will take a newly forked process and wrap it to work properly with
the `ChildProcess` internals.

*Internal Use*

### ChildProcess.stopChild(proc)
* `proc` {cp} instance of core child_process object returned from fork.
* Return {Promise} resolved when the `proc` instance is stopped.

*Internal Use*
