# App Docs

The app object is a singleton root object for a `yep-app` application.

## Obtaining a reference

You should never need to directly `new` up the application.
For all modules (minus the main module), you can get access
by using the static `instance` method.
```javascript
import { app } from "@yuzu/yep-app";

export default class Foo {
    fooAllTheThings() {
        console.dir(app.instance()); // Easy.
    }
}
```

## App infrastructure

All objects in a `yep-app` should have access to the following resources

- current user session
- logger
- localization util
- application event bus
- an action dispatcher
- a way to start and run the app

`yep-app` will provide default implementation of these resources which can
help unit testing where the real implementation will not be found locally w/in the component.

However it is important the project provide real implementations via the
`App.Delegate` interface. [(See below for how to set these resources)](#app-delegate)

The static methods should not be invoked until after bootstrapping, which means
you should not attempt to access the resouces at the top of your module but inside
a class, function that is exported.

### session() and user()

The current logged in session can be referenced by the static `session` method.

```javascript
var currentSession = app.session();
console.log(currentSession.user.email);
```
There is no set interface for the session object returned other than
there being a user getter.

Projects can provide more session info (an auth token, browser info, etc).

See https://github.com/YuzuJS/yep-auth as an example of a yep component that implements the session object: `ClientSession`;

A sugar method for pulling the user out of the session exists.
Since most consumers will just want the user, `app.session().user` may get old after awhile.

```javascript
var user = app.user();
console.log(user.email); // That is nicer.

```

The `yep-app` expects a `user` to look like the following (minimum interface)

```typescript
interface YepAppUser {
    id: string;
    email: string;
}
```

### logger(namespace)

All objects in the system should have the ability to log without going thru hoops.

```javascript
import { app } from "@yuzu/yep-app";

class CriticalThing {
    constructor() {
        this._logger = app.logger("NAMESPACE");
    }

    somethingInteresting() {
        if (hasSomethingInterestingHappened) {
            this._logger.log("things that make you go hmm.");
        }
    }
}
```

The interface for the logger

```typescript
interface YepAppLogger {
    log();
    debug();
    info();
    warn();
    error();
    logError();
}
```

### localize(key:string)

Instead of hardcoding copy in the UI, objects should utilize the localize method
from the app.

```javascript
import { app } from "@yuzu/yep-app";

class UserProfileUI {
    get title() {
        return app.localize("key"); // Up to provided localization component to return a localized string.
    }
}
```

The default implementation from YepApp will simply return the key back.

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

This class expects to be injected with all top level yep app components.

```javascript
var components = App.Components(
    theAuthComponent,
    theDomainComponent,
    thePushNotificationsComponent,
    theJSLoggerComponent,
    theShoppingCartComponent
);

App.run(components, delegate); Provide components as first param to `run`.

```

Each component passed to the constructor will be bootstrapped and should
provide the following hooks.

```typescript
interface YepAppComponent {
    metadata: Object; // Info about the component (The `package.json` can be used);
    onBeforeAppBootstrapped(bootstrapper: Bootstrapper);
    bootstrap(): ?Promise<void>; // Optionally return a promise if async is needed.
    onAppBootstrapped(bootstrapper: Bootstrapper);

    // Optional hooks
    priority: number; // Components are bootstrapped by priority then placement in the `App.Components` constructor.
}
```

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

App.run(appComponents, delegate); // The delegate should be provided as the 2nd param to the `run`.
```

The following hooks can be set

```typescript
interface App.Delegate {
    app: YepApp;
    provideSession();
    provideLogger();
    provideLocalize();
    onBeforeBootstrapped(bootstrapper: YepAppBootstrapper);
    onBootstrapped(bootstrapper: YepAppBootstrapper);
    onReady();
    handleUncaughtError();
    handleRestart();
}
```
