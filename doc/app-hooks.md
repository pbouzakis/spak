# AppHooks

There are times when a module is not initiated by a user action directly and instead relies on the system and application for startup.

To make wiring up your module as easy as possible, `yep-app` exposes the class `AppHooks` which is base class to extend, where you can define hook methods that are automatically subscribed to on the `App.events` event bus.

The `AppHooks` class comes with a decorator for declaring what events you like the base class to subscribe to.

Your method hooks just start with `on` and then follow the event name camel cased with the period removed.

*NOTE Do not include `app.ready`. Instead see the `onAppReady` hook below.*

```javascript
import { AppHooks } from "@yuzu/yep-app";

@AppHooks.events("auth.signedIn", "sync.completed", "locker.itemAdded")
export default class MyHooks extends AppHooks {
    onAuthSignedIn() {
        // Hey we just signed in!
    }

    onSyncCompleted() {
        // Sync done!
    }

    onItemAdded() {
        // Item added!
    }
}

```

## Disposing of your hooks

When you no longer need to be notified, you can use the `dispose` method.
If you pass no arguments, then all hooks are disposed. Otherwise pass them as args

```javascript
onSyncCompleted() {
    // Dispose of all event listeners.
    this.dispose();
}


// Or we can dispose individually
onSyncCompleted() {
    // Dispose 2 event listeners.
    this.dispose("sync.completed", "auth.signedIn");
}

```

## Template hooks

You can also provide hooks for when your hooks are subscribed to `App.events` and when they are disposed.

```javascript
export default class MyHooks extends AppHooks {
    onAppReady() {
        // My hooks have been registered w/ `App.events`.
    }
    // This hook can be called multiple times if you dispose individually.
    onDispose(events: Array) {
        // Events in the array are no longer being listened to.
    }
}
```

## Adding your hooks to the DI specs.

```javascript
new SpecRegistration(
    new HooksSpec(MyHooks)
)
```
