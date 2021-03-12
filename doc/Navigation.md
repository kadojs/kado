# Navigation

*Introduced in 4.0.0*

> Stability: 2 - Stable

The `Navigation` library provides a way to build a navigation bars in your
application.

```js
const Navigation = require('kado/lib/Navigation')
```

## Class: Navigation

### static Navigation.checkActive()
* Return {Function} used to check the active navigation item in mustache

### static Navigation.getInstance()
* Return {Navigation} new instance of navigation class

### Navigation.constructor()
* Return {Navigation} new instance of navigation class

### Navigation.addGroup(uri,name,icon)
* `uri` {string} URI to navigate to
* `name` {string} Name of the navigation point, aka label
* `icon` {string} Name of icon go be shown be eg: fontawesome
* Return {object} containing the generated navigation group.

### Navigation.get(name)
* `name` {string} get name of group
* Return {object} containing name of group.

### Navigation.all()
* Return {Array} the stored group array

### Navigation.allNav()
* Return {object} the stored nav object

### Navigation.addItem(group,uri,name,icon)
* `group` {string} name of the group
* `uri` {string} URI to navigate to
* `name` {string} Name of navigation point, aka label
* `icon` {string} Name of icon go be shown be eg: fontawsome
* Return {object} Containing the generated navigation group.

