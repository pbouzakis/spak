
### dispatchAction(nameOfAction: string, params: object)

App components should register actions with the application (via the bootstrapper).
Other modules can invoke an action by doing the following

```javascript
function onFormSubmit() {
    app.dispatchAction("signIn", {
        id: this._getId(),
        presenter: this
    });
}
```

### run(components, delegate)

To start the application, invoke the run static method with the app components, and app delegate
which are described below.

`app.run(new App.Components(...components), new App.Delegate());`

## App Components

A yep-app should be broken down into components. Each yep-app component represents
either a slice of the application (a slice being across the layers (ui, domain, data), a specific function (push-notifications), and even a single module that plugins into another.

When running a yep-app you can specify your components by using the class below which expects to be injected with all top level components.

```javascript
var components = App.Components(
    theAuthComponent,
    theDomainComponent,
    thePushNotificationsComponent,
    theJSLoggerComponent,
    theShoppingCartComponent
);

App.run(components, config, delegate); Provide components as first param to `run`.

```

Each component passed to the constructor will be bootstrapped and should
implement the `YepAppComponent interface.

For more see the [YepAppComponent docs.](./app-component.md)

As seen above, some hooks are provided the `Bootstrapper`. Which exposes the interface below:
```typescript
interface YepAppBootstrapper {
    getComponent(name:string);

    // You can reorder the component boostrapping. Call these in  `onBeforeAppBootstrapped` hook.
    bootstrapBefore(nameOfComponentToBootstrapBefore: string, component: YepAppComponent);
    bootstrapAfter(nameOfComponentToBootstrapAfter: string, component: YepAppComponent);
}

```

## App Delegate

This class allows projects to customize and hook into key application events as well as provide implementation of required resources mentioned above.

```javascript
var delegate = new App.Delegate(); // This provides no custom behavior.

// Okay, something more realistic

var delegate = new App.Delegate({
    provideLogger() {
        return new MyCustomLogger();
    }
    onBootstrapped() {
        console.log("We are just about ready to go!");
    }
});

App.run(appComponents, config, delegate); // The delegate should be provided as the 2nd param to the `run`.
```

The following hooks can be set

```typescript
interface App.Delegate {
    app: YepApp;
    provideSession();
    provideLogger();
    provideLocalize();
    provideUncaughtErrors();
    onBeforeBootstrapped(bootstrapper: YepAppBootstrapper);
    onBootstrapped(bootstrapper: YepAppBootstrapper);
    onReady();
    handleRunError();
    handleUncaughtError();
    handleRestart();
}
```
