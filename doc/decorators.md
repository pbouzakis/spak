# es decorators

`yep-app` comes with decorators for common utilities.
You can import them off of the special `@yuzu/yep-app/decorators` path.

## inject(...listOfDependencies)

```javascript
import { inject } from "@yuzu/yep-app/decorators";

@inject("fooCollection, storedFoos")
export default class FooService {
    constructor(list, repo) {
        this._list = list;
        this._repo = repo;
    }
    //... methods and stuff
}
```

The above adds metadata for the [DI system](./di.md) that this export needs to be injected with `fooCollection` and `storedFoo`.

## logger(namespace)

```javascript
@logger("items")
export default class ItemsInRepo {
    fetchAll() {
        this.logger.info("fetching items...");
        // ... more awesome code
    }
}
```

Add a `logger` getter property to your class specifying the namespace it belongs to.

## emitter(events: Array, opts: { appPrefix: string })
Mixin an emitter to your object. An `_emitter` method will added that you can call
to mixin the emitter trait and return a `publish` method.

If you provide an `appPrefix` in the opts object, the `_emitter` method will create a dual emitter. A dual emitter will cause the `publish` method to emit on the object AND the
`App.events` bus. The event on the event bus will be prefixed with the `appPrefix` to namespace
the event.

This decorator using the `pubit-as-promised` package behind the scenes.

```javascript

// Simple emitter.

@emitter(["added", "changed", "removed"])
export default class ItemsInRepo {
    constructor() {
        this._publish = this._emitter();
    }
    create(name) {
        // ... some sweet code
        this._publish("added", item);
    }
}

// `items` is an instanceof `ItemsInRepo`.

items.on("added", updateUI); // Client code can listen via `on/once`. As well as stop w/ `off`.
```

### Dual emitter

// Simple emitter.

```javascript
@emitter(["added", "changed", "removed"], { appPrefix: "locker.items" })
export default class ItemsInRepo {
    constructor() {
        this._publish = this._emitter();
    }
    create(name) {
        // ... some sweet code
        this._publish("added", item); // Event is published on `this` AND `App.events`.
    }
}

// `items` is an instanceof `ItemsInRepo`.
items.on("added", updateUI); // Client code can listen to an instance.

App.events.on("locker.itemsAdded", logItemsAdded); // OR on the event bus w/ namespace.
```

*The appPrefix if contains a prefix will append the event name and uppercase the first char. If there is no dot in the prefix, a dot will be appended, and the event will not be transformed*

Example prefix

- `{ appPrefix: "locker.items" }` with local event of "added" // Emits app event "locker.itemsAdded".
- `{ appPrefix: "locker" }` with local event of "added" // Emits app event "locker.added".

*NOTE The `pubit-as-promised` `publish.when` method works too!*

## component(nameOfComponent:string, additionalMetadata: Object)
Adding metadata component can be done through the `component` decorator.
This replaces the need to have to create a `metadata` getter that returns an object
with a name property. Most components only need to specify name.

```javascript
@component("@yuzu/my-component")
export default class MyComponent {
    register() {
        return new SpecRegistration(
            // ... more fun.
        );
    }
}
```
