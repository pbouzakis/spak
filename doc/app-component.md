# Components

Quick Links

- [Component structure](#component-structure)
- [Creating components](#creating-components)
- [What goes inside the index module?](#example-index.js)

`yep-app` promotes a component based architecture with the `App` object requiring a list of components to register with the application.
For more on component based architecture, [see this article](https://msdn.microsoft.com/en-us/library/ee658117.aspx#ComponentBasedStyle).

The application is provided to all components on startup of the app when calling `App.run`. This is done in the main module of your project (The first code run).

```javascript
App.run(
    App.Components(...) // Supply your components as arguments here.
    App.Config(...),
    App.Delegate({ ... })
);

// Another example

import AuthComponent from "@app/auth";
import SyncComponent from "@app/sync";

App.run(
    App.Components(new AuthComponent(), new SyncComponent())
    App.Config(...),
    App.Delegate({ ... })
);

```

`yep-app` Components are made of js modules as well as docs, tests, styles, etc. that serve to encapsulate logical grouping of functionality about the system. In practice, that can translate into something as big a feature such as search (including UI, actions, models, db, etc) to a single module.

## Components === `npm` packages.

This allows shared components to be published (`npm` registry) and easily installed into an application via `npm install`. Although all components are expected to be reusable, they may only belong to one application. Therefore it is okay for components to be bundled locally into the application. We recommend [scoping these components](https://docs.npmjs.com/misc/scope) with `@app`.  We also recommend `npm` scopes for components you wish to publish but are private.

```
node_modules/
    @app/               // Any packages under @app are local.
        search/
            lib/
                Search.js
        dialogs/
            lib/
    @mycompany/         // published as private `npm` packages.
         orders/
             lib/
                 Order.js
                 ShoppingCart.js
```


## Component structure

### Top level folders
- doc (markdown files)
- lib (source code)
- test
- node_modules

### Suggested folders inside lib

```
    lib/
        actions/
        ui/
        gateways/
        repos/
        models/
```

### Top level files
- package.json (with npm scripts for running githooks, [lint](https://github.com/YuzuJS/yep-eslint-config), and tests)
- pre-commit and pre-push githook scripts
- README.md
- [lint](https://github.com/YuzuJS/yep-eslint-config) and gitignore configs
- index.js main module

### the main module (entry point)
An `npm` package can specify a main module, however, the standard is to have an `index.js` in the root of the package. Components use the index module to declare what internal modules can be used by other other components, as well as a `default export` of a `YepAppComponent` class that can register the component with the system and specify what services it implements.

## Example index.js
The following is a sample `index.js` module that would live in the root of the component.

```javascript
import PlaceOrder from "./lib/actions/PlaceOrder";
import OrderRepo from "./lib/repo/OrderRepoInStorage";
import StoreGateway from "./lib/gateways/StoreGateway";
import OrderItem from "./lib/OrderItem";
import OrderError from "./lib/AuthError";

export default class OrderComponent {
    get metadata() { return { name: "@yuzu/auth" }; }
    register(spec) {
        spec.action(PlaceOrder)
            .creator("clientSession", ClientSession)
            .creator("orderRepo", OrderRepo)
            .creator("storeGateway", StoreGateway);
    }
}

export { OrderItem, OrderError };
```
The above contains 2 exports for any modules to directly import (`OrderItem` and `OrderError`).

In addition, a `default export` class is **required** in order to register your component with the application. This the class that is imported by the application to include your component (via `App.run`).

The `default export` should be a class that implements the following interface:

```typescript
interface YepAppComponent {
    metadata: { name }; // Info about the component (Minimum is name attribute);
    register(): ?Promise<void>; // Optionally return a promise if async is needed.

    // Optional
    onBeforeAppBootstrapped(bootstrapper: Bootstrapper);
    onAppComponentsRegistered(bootstrapper: Bootstrapper);
    onAppBootstrapped(bootstrapper: Bootstrapper);
    priority: number; // Components are bootstrapped by priority then placement in the `App.Components` constructor.
}
```
*NOTE: ATM `priority` is not being respected by `App.run`.*


