# Common Issues and Tips

## `Error: Cannot resolve ref: $SOME_ROLE`
If you ever see this error this means that a module is depending on a spec rolename, and nobody is providing it. Check for typos or possible a missing app component (either not installed or not provided in the `App.run` invocation).

## Cyclic Dependencies
When mounting components, each component has a change to hook into the app run/bootstrap lifecycle. When modules depend on each other, if not careful, a cyclic dependency can occur where each module depends on the other.

If the issue is within DI system (compared to an `import` cyclic dependency) it can be very hard to track down which module is breaking.

Behind the scenes, `yep-app` uses the `wirejs` package for dependency injection.
You can supply `wire` with a debug plugin that will output tons of debug info in the console to help you track this down.

Goto the `iocSpecsBuilder` module and search for the following:

```javascript
var specs = {
    $plugins: [wirePlugin]
};
```

To add the debug plugin, update to the following:

```javascript
var specs = {
    $plugins: [() => require("wire/debug")({ trace: true }), wirePlugin]
};
```
The options in the above are: `{ trace: true }`. You can alter this to your liking.
Have a look at wire's debug module to see what you can provide: https://github.com/cujojs/wire/blob/master/debug.js
