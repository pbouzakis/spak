# App Providers

The `App` object is a singleton root object for a `yep-app` application.
Modules in the system can rely on the fact that the following resources will always be present in the application.

- ClientSession
- User (if session is authenticated)
- Localization
- Logger
- UncaughtError handling

## Default implementations
The `yep-app` package comes bundled with default implementations. These objects are not suitable for `production` but can aid in debugging an unit tests.

The `ProvidedAppDelegate` module is a `AppDelegate`object with these defaults all set and ready for the application. When setting up an unit test, prototype, debugging environment, it might be a good idea to use this delegate. [Check the `AppDelegate` docs for more.](./app-delegate.md).

## Accessing providers via `static` methods.

The static methods should not be invoked until after bootstrapping, which means you should not attempt to access the resources at the top of your module but inside your export classes and functions.

## Providers

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

### Uncaught errors
The uncaught error handling is not somethign modules will call directly, however the system via the `AppDelegate`, will ensure there is some module in charge of listening for uncaught errors. In addition, the `AppDelegate` will be responsible for handling these errors. [Check the `AppDelegate` docs for more on error handling.](./app-delegate.md).
