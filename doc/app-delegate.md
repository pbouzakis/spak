## App Delegate

This class allows projects to customize and hook into key application events as well as provide implementation of required resources expected by the `App`.

```javascript
var delegate = new App.Delegate(); // This provides no custom behavior.

// Okay, something more realistic

var delegate = new App.Delegate({
    provideLogger() {
        return new MyCustomLogger();
    }
    onReady() {
        console.log("We are ready to go!");
    }
});

// Supply `App.run` with your delegate.
App.run(appComponents, config, delegate);
```

The following hooks can be set

```typescript
interface App.Delegate {
    app: YepApp;
    provideSession();
    provideLogger();
    provideLocalize();
    provideUncaughtErrors();
    onBeforeBootstrapped(bootstrapper: Bootstrapper);
    onComponentsRegistered(bootstrapper: Bootstrapper)
    onBootstrapped(container: IocContainer);
    onReady();
    handleRunError();
    handleUncaughtError();
}
```

The `provide` methods must return objects that implement [app provider interfaces.](./app-providers.md)

The `on` hooks are optional and allow you to kick into the [`App.run` lifecycle.](./app-run-lifecycle.md) The `bootstrapper` object will you to add more specs to the dependency injection system. The `onBootstrapped` hook will give you the full `IocContainer` which gives you access to all objects created by the DI system.

The `handleRunError` is used if there is a fatal error during app bootstrap. This method should tear down your splash page and provide an error to the user.

The `handleUncaughtError` is for any other error that occurs after `onReady` that is not handled. Up to the delegate for how best to handle.

## ProvidedAppDelegate
When writing unit tests for a component, or simply prototyping you might will still need to call `App.run` in order to utilize any `App` resources. This means you must provide a delegate with proper implementation from above.

`yep-app` comes with `ProvidedAppDelegate` that does just that. It provides an implementation suitable for **NON PRODUCTION** environments. Coming with a logger that does nothing, a localization module that just returns the key back, a very simple and not useful session object. etc.

In practice, you will either provide all the necessary hooks by passing an object into `AppDelegate`OR extend `AppDelegate`.

```javascript
// Using AppDelegate and passing all hooks into it's constructor.
App.run(
    App.Components(...),
    App.Config(...),
    App.Delegate({
        provideLogger() {},
        ...,
        onReady() {}
   }
);

// OR Extend
class MyAppDelegate extends AppDelegate {
    provideLogger() {},
    ...
    onReady() {}
}

// You import the above and pass to App.
App.run(
    App.Components(...),
    App.Config(...),
    MyAppDelegate
);
```
