# Profiler
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Profiler = require('kado/lib/Profiler')
```
The Profiler library provides resource usage tracking and a built-in HTML output mode that prints statistics for development use.
### static profiler.getInstance()
* Return {Profiler} new instance of the profiler system

### profiler.constructor()
* Return {profiler} new instance of the profiler system

### profiler.addQuery
* Return {number} of queries executed including currently added

### profiler.startRender
* Return {Date} of when the render process was started
Note: this function starts or restarts the rendering timer

### profiler.build(version)
* Return build version as string
