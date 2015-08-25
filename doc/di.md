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

## DI Specifications
Okay we now know we need to declare our dependencies, but how we declare what we provide?

The specifications objects of course! The `specs` object is exposed via the `AppBootstrapper#spec` property.
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

## specs API
The spec methods are all chainable.

### specs#creator(name: string, Class)
The spec is expecting a JS class (function constructor).
The DI system will new the class up and save a reference in the `IocContainer` with `name`.

### specs#factory(name: string, factoryFn)
Same as `creator` only the spec is provided with a function instead of a class. The function should be a factory and a value.

### specs#literal(name, value: any)
Literal is used when you already have a created service/object/value ready to go. You just want this resource available for others.

```javascript
spec.literal("favoriteColor", "blue")
    .literal("sampleItem", { name: "Book 1", id: 123 })
    .literal("logger", (...args) => console.log(...args));
```

### specs#action(Action) and specs#(name: string, Action)
Declare an application [action](./app-actions-and-events.md).
If you're action self's describe's it's component name you dont need to pass in the name.

