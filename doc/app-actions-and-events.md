# App Actions and Events

## Actions

Action is a command that represents a single use case of a user story or feature.
Typically, a feature and functionality will be written across a family of objects and it is the action that brings these objects together, acting as a coordinator.

An action must have an `exec` method that accepts an object of options.
In addition, a `componentName` must be specified so that when an action is specified with the bootstrapper, it has a name that other modules can refer to when dispatching.

```javascript

// actions/addItem.js

class AddItem {
    get componentName() { return "addItem" }

    constructor(itemRepo) {
        this._repo = itemRepo;
    }
    exec({ item }) {
        this._repo.add(item);
    }
}

*NOTE: If you are using [decoratify](https://github.com/yuzujs/decoratify), you won't have to manually set your componentName. Instead this will happen for you based on the name of your action (as long as you place it inside an actions folder).*

// How to register action with the dispatcher.

bootstrapper.specs
    .action(AddItem);

// some other module

// Other modules can kick off this action using the `App` object.
App.dispatchAction("addItem", { item: new Item() });

```

### Action base class

A base class is available for actions. This base class includes a logger and easy access to the event bus.

```javascript
import { Action } from "spak";

class AddItem extends Action {
    get componentName() { return "addItem" }

    constructor(itemRepo) {
        this._repo = itemRepo;
        this.ns = "items"; // Provide a namespace for logging and events.
    }
    exec({ item }) {
        this._repo.add(item);
        this.logger.info("add item", item);                // Thank you base class.
        this.publish("itemAdded", item);                   // Thank you base class.
        this.dispatchAction("addItemToLibrary", { item }); // Thank you base class.

        this.event.on("items.itemRemoved", (item) => this._repo.remove(item));
    }
}
```

## Events

An event command bus is exposed on the `App` object.
This is a simple pubsub object that can be used by modules and objects to notify other interested parties of a state change or other key events that may have just occurred.

An event should represent something that just happened, NOT something about to happen.We recommend using `beforeFooOccurred` if you need to notify right before something occurs.

The command bus is implement by [`pubit-as-promised`](http://github.com/YuzuJS/pubit-as-promised).

Events should be namespaced using the following convention: `**namespace**.eventName`.


```javascript
import { App } from "spak";

export function foo() {
    // Here we listen to an event
    // with namespace of `item` and event is `favorited`.
    App.events.on("item.favorited", (item) => console.log("an item just favorited", item);

    favorites.add(item);
    App.events.publish("user.favoritesStored", favorites);

    // pubit-as-promised allows async promises
    App.events.publish.when("user.favoritesStored", favorites).done(log);
}

```

All events published by `App.events` can become be listened to automatically by creating an `AppHook` and adding the hook to the specs.

[See the `AppHooks` docs.](./app-hooks.md)

### App namespaced events.
Since the event bus is system wide, we can't list all events here.
However, `spak` owns the `app` namespace.

- `app.ready(app, delegate)` - Async event that is published right before the delegate.onReady is invoked.
