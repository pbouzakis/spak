# App Delegate

An application delegate allows projects to override, customize and hook into key framework events as well as provide implementation of required resources expected by the `App`.

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

The following [template methods](https://en.wikipedia.org/wiki/Template_method_pattern) are available.

```typescript
interface App.Delegate {
    createBootstrapper(components: Array<YepAppComponent>);
    createEventBus();
    createActions(commands: Array<object>);
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

#### `createBootstrapper(components: Array<YepAppComponent>)` *(Optional)*
Create the bootstrapper for the application. The bootstrapper is in charge of instantiated and starting the system up. [See the `App#run` lifecycle for details on how this works](./app-run.md)
`App.Delegate` implementation return `Bootstrapper`.

#### `createEventBus()` *(Optional)*
Create the centralized event bus for the application. Will be saved and exposed as `App.events`.
`App.Delegate` implementation return `EventBus`.

#### `createActions(commands: Array<object>)` *(Optional)*
Create the action dispatcher for the application.
This is the object the application uses to implement `Action.dispatchAction`.
`App.Delegate` implementation returns `ActionDispatcher`.

#### `provideXXX(container: IocContainer)` *(Required)*
The `provide` methods must return objects that implement [app provider interfaces.](./app-providers.md)

#### `onXXX` *(Optional)* ###
The `on` hooks are optional and allow you to kick into the [`App.run` lifecycle.](./app-run.md) The `bootstrapper` object will allow you to add more specs to the dependency injection system. The `onBootstrapped` hook will give you the full `IocContainer`, which gives you access to all objects created by the DI system.

#### `handleRunError` *(Required)
The `handleRunError` is used if there is a fatal error during app bootstrap. This method should tear down your splash page and provide an error to the user.

#### `handleUncaughtError` *(Required)
The `handleUncaughtError` is for any other error that occurs after `onReady` that is not handled. Up to the delegate for how best to handle.

## ProvidedAppDelegate
When writing unit tests for a component or prototyping, if you are writing a module that depends on an App provider, you will still need to call `App.run` somewhere in your code to ensure the App providers exist. This means the delegate you inject `App.run` with must provide a delegate with required template methods implemented.

`yep-app` comes with `ProvidedAppDelegate` that does just that. It provides an implementation suitable for **NON PRODUCTION** environments. Bundled with a null logger, a localization module that just returns the key back, and an in memory simple and not useful session object.

### Using an AppDelegate

In practice, you will either provide all the necessary hooks by passing an object into `AppDelegate` OR extend `AppDelegate`.

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
