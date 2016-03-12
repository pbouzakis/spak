# App Specifications

## Interfaces

```typescript
interface Specifications {
    register(specification);
    build(): IocContainer;
}

interface SpecificationsBuilder {
    builder(specs: Specifications): IocContainer;
}

// Container objects that contains objects build from `Specifications`
interface IocContainer {
    $actions: object;
}

interface CollectRegistrationsBuilderRegistration {
    $actions?: fn[] | Action[], [name: string, action:Action][]
    $hooks?: AppHook[]
}
```

## What are specifications?

Specifications are for objects/modules in your project that might need to be configured, created, registered across application components.

Although this may sound similar to the [`App.config`](./app-config.md), the difference is that these specifications are really specifications for the bootstrapper and should not be references once the app is ready. Compared to `App.config` which is available for the entire session of the application.

When components are being registered each component is asked to return a registration object via their `register` method.

When the bootstrapper has gone thru all components it will as the `Specifications` object to build an object based on the spec registration objects. The object build is called the `IocContainer`.

## What is this registration object?
The type of registration object you return from your component class depends on the builder being used by `Specfications.`

### Default builder: CollectRegistrationsBuilder

The system comes with a very simple builder `CollectRegistrationsBuilder`, that simply merges all the registrations together. 

In also creates a proper action map for applications `ActionDispatcher` as well as subscribing any application hook objects.

Components should return an object that looks like `CollectRegistrationsBuilderRegistration` defined above.

You can put your own objects in there, and the builder will simply merge them into the final IocContainer.

Since this a very primitive builder, **in most production systems you would want to use a builder that utilizes a DI system** such as the `spak-di` package.

The container can be accessed off the `App` object.

#### Example CollectRegistrationsBuilderRegistration
```javascript
import { component } from "spak/decorators";
import OrderLogs from "./lib/hooks/OrderLogs",
import PlaceOrder from "./lib/actions/PlaceOrder";
import OrderRepo from "./lib/repo/OrderRepoInStorage";
import StoreGateway from "./lib/gateways/StoreGateway";

@component("@app/order")
export default class OrderComponent {
    register() {
        return {
            $actions: [PlaceOrder],
            $hooks: [new OrderLogs()],
            orders: new OrderRepo(),
            stores: new StoreGateway()
        };
    }
}

## Provide different implementations of Specifications and SpecificationsBuilder

In your `AppDelegate` you can implement 2 hooks. One to provide a `Specifications` object and one for `SpecificationsBuilder`.

```js

// Your own specifications that defines it own builder.

App.run(
    App.Components(...),
    App.Config(...),
    App.Delegate({
        createSpecs() {
            return new MySpecifications();
        }
   }
);

// Just provide a builder to `AppSpecifications`. PREFERRED.

App.run(
    App.Components(...),
    App.Config(...),
    App.Delegate({
        createSpecsBuilder() {
            return new MyCustomDIBuilder();
        }
   }
);

```
