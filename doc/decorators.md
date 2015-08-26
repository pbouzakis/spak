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