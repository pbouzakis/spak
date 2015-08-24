## App Actions

Action is a command that represent a single use case of a user story or feature.
Typically a feature and functionality will be written across a family of objects, it is the action that brings these objects together acting as a coordinator.

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

// How to register action with the dispatcher.

bootstrapper.specs
    .action(AddItem);

// some other module

// Other modules can kick off this action using the `App` object.
App.dispatchAction("addItem", { item: new Item() });

```

### Action base class.

A base class is available for actions. This base class includes a logger, and easy access to the event bus.

```javascript
import { Action } from "@yuzu/yep-app";

class AddItem extends Action {
    get componentName() { return "addItem" }

    constructor(itemRepo) {
        this._repo = itemRepo;
        this.ns = "item"; // Provide a namespace for logging and events.
    }
    exec({ item }) {
        this._repo.add(item);
        this.logger.info("add item", item);                // Thank you base class.
        this.publish("itemAdded", item);                   // Thank you base class.
        this.dispatchAction("addItemToLibrary", { item }); // Thank you base class.

        this.event.on("itemRemoved", (item) => this._repo.remove(item));
    }
}
```

## App Events

An event command bus is exposed on the `App` object.
This is a simply pubsub object that can be used by modules and object to notify other interested parties of state change or other key events that have just occurred.
An event should represent that something just happened NOT about to. We recommend using `beforeFooOccurred` if you need to notify right before something occurs.

The command bus is implement by [`pubit-as-promised`](http://github.com/YuzuJS/pubit-as-promised).

```javascript
import { App } from "@yuzu/yep-app";

export function foo() {
    App.events.on("item.favorited", (item) => console.log("an item just favorited", item);

    favorites.add(item);
    App.events.publish("favoritesChanged", favorites);

    // pubit-as-promised allows async promised
    App.events.publish.when("favoritesChanged", favorites).done(log);
}

```
