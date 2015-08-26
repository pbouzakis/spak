# Dependency Injection System

To quote the Angular docs:

> "Dependency Injection (DI) is a software design pattern that deals
> with how components get hold of their dependencies.

Behind the scenes, `yep-app` implements DI via [wire js package by cujo](https://github.com/cujojs/wire).

The DI system is in control of creating key objects of your system. Your modules/object declare what they need, which in turn, those modules declare what the need. This allows your module to get what it needs without worrying about *how* to go about creating it.

## Declare what you need in your default export.
The class `AwesomeService` is declaring that it needs `fooService`.
Below an `inject` property is saved on the export to declare what needs to be injected.

```javascript
export default class AwesomeService {
    static get inject() { return ["fooService"] }
    constructor(fooService) {
        this._service = fooService;
    }
}

// Or w/ old school function constructor
function AwesomeService(fooService) {
    this._service = fooService;
}
AwesomeService.inject = ["fooService"];
export default AwesomeService;

// However we can use a decorator to make this a bit cleaner.
@inject("fooService")
export default AwesomeService {
    constructor(fooService) {
        this._service = fooService;
    }
}
```
However, if you are using the awesome [decoratify plugin](https://github.com/yuzujs/decoratify) you won't have to add the decorator mainly. If you have a default export [decoratify](https://github.com/yuzujs/decoratify) will add this for you during the browserify build.

## IOC Specifications
When the system is run, during bootstrap, the DI system will gather specifications aka `specs` provided by the components to build an `IocContainer`. This object is simply a bag of all the instantiated objects as *specified* by the components.

A `specs` object is exposed on the `AppBootstrapper#spec`.
Take a look at the [App.run lifecycle docs](./app-run.md#sequence-diagram). Anywhere you see the `bootstrapper` being passed, you can register with the specs.

```javascript
class MyComponent {
    get metadata() { return { name: "@app/my-component" }}
    register(bootstrapper) {
        console.log(bootstrapper.spec); // We have the specs object!
    }
}
```

When the `App.run` method is called, it runs through all components, with each registering it's services with the `specs` object. Once done, they are saved in the `IocContainer` object. Which is an object with references to everything specified, fully instantiated.

### Example spec
```javascript

bootstrapper.spec
    .creator("awesomeService", AwesomeService)
    .factory("fooService", makeFooService)
    .literal("settings", { color: "blue", size: 100})
```

You can see from our earlier module, we declare our `awesomeService` as well as the `fooService` it depends on. The system can now provide `awesomeService` with what it needs. If `fooService` depends on other modules, they need to be defined here or in some other module's register method.

## IOC `specs` API
*The spec methods are all chainable.*

Notice below that we are using the term `interface` for the key used in the `IocContainer`.
This is because to the objects in the system they are injected with **INTERFACES`** and not concrete implementations. Another way to think of it is objects playing *roles*. A module will ask (depend on) an object to be passed in to play a specific role (have the required methods and properties).

Interface names should not reveal *how* an object will play the role unless a module in the system *depends* on the implementation.

### specs#creator(interface: string|array<string>, Class)
The spec is expecting a JS class (function constructor).
The DI system will new the class up and save a reference in the `IocContainer` with key equaling the `interface`.

```javascript
// Specify the class `Orders` to play role of `orders in the system.
// Any object will be able to ask for an object playing the role of `orders` and get the correct interface.
spec.creator("orders", Orders);

// Specify the class `Order` to play the role of `orders` and `placementDelivery`.
spec.creator(["orders", "placementDelivery"], Orders);
```

### specs#factory(interface: string|array<string>, factoryFn)
Same as `creator` only the spec is provided with a function instead of a class. The function should be a factory and a value.

```
// The DI system will simply call `createOrders`, saving the returned value in the `IocContainer`.
spec.factory("orders", createOrders);
```

### specs#literal(interface: string|array<string>, value: any)
Literal is used when you already have a created service/object/value ready to go. You just want this resource available for others.

```javascript
spec.literal("favoriteColor", "blue")
    .literal("sampleItem", { name: "Book 1", id: 123 })
    .literal("logger", (...args) => console.log(...args));
```

### specs#alias(interfaceToAlias: string, aliasFor: string)
This allows you to add more roles to an object already registered in the spec.
The `aliasFor` param is interface of an object you want to add a new role for.

Most of the time the above methods will support this functionality as you can pass an array of interfaces.
For times when you are breaking the spec up, use `alias`.

```
spec.creator("orders", Orders)

// Later in the spec, probably in another component.

// This is saying whatever object implementing order is also going to implement `placementDelivery`.
spec.alias("placementDelivery", "orders");
```

### specs#action(Action) and specs#(interface: string, Action)
Declare an application [action](./app-actions-and-events.md).
If your action's self describes its component name you don't need to pass in the name.
