# Dependency Injection System

To quote the Angular docs:

> "Dependency Injection (DI) is a software design pattern that deals
> with how components get hold of their dependencies."

Behind the scenes, `yep-app` implements DI via the [wire npm package by cujojs](https://github.com/cujojs/wire).

The DI system is in control of creating key objects of your system. Your modules declare what types of objects they want/depend on, which we will call `roles`. In turn, the modules that play those roles declare what the need. The DI system will traverse this tree until all dependencies have been resolved. This allows your module to get what it needs without worrying about *how* to go about creating it.

## Isn't that what `require` or `import` is for?
No. When you import another module that is a static dependency. Something that can not change. DI will declare run time dependencies. This is why we call it a role. You are not hardcoding your module to a particular module. Instead your module is saying "I need an object that can play this or `role`", in other words, an object that implements an `interface`. Your module now depends upon an abstraction rather than a detail or specific implementation.

## What's a role again?
A `role` is similar to an interface. It's a contract between 2 objects.
Let's say module A depends on 3 roles (foo, baz, and bar). Any object can play these roles as long as they have the right interface. An object can then play one or multiple roles. You define what objects are going to play these roles when registering your spec. [See below](#DI-Specifications) for more on specs.

## How to declare what you roles you need for an `export`
The class `AwesomeService` is declaring that it needs an object to play the `role` of `FooService`.

Below an `inject` property is saved on the export to declare what needs to be injected. The `inject` property is metadata about your  `export`.

```javascript
export default class AwesomeService {
    static get inject() { return ["fooService"]; }
    constructor(fooService) {
        this._service = fooService;
    }
}

// Or for you ES5 folk out there
function AwesomeService(fooService) {
    this._service = fooService;
}
AwesomeService.inject = ["fooService"];
export default AwesomeService;

// `yep-app comes with a decorator to make this a bit cleaner.
@inject("fooService")
export default AwesomeService {
    constructor(fooService) {
        this._service = fooService;
    }
}
```
*NOTE: If your export is the default export you can the have the awesome [decoratify plugin](https://github.com/yuzujs/decoratify) automatically declare your role depedencies for you. [See decoratify for more info](https://github.com/yuzujs/decoratify).*

### Property inject
You can also have a getter property injected into your export.
This is useful when your export is not a provided role, but you still depend on roles.

```javascript
@propInject("fooService", "orders")
export default AwesomeService {
    find() {
        var order = this.order.latest;
        return this.fooService.findById(order.id);
    }
}
```
You can specify multiple roles as shown above.
If you want to use another name of the propery inject that does not match the role, you must make the argument in array.

```javascript
@propInject(["fooService", "fooRepo"], "orders")
export default AwesomeService {
    find() {
        var order = this.order.latest;
        return this.fooRepo.findById(order.id);
    }
}
```

If you'd like to inject an object as a static property, use the `staticPropInject` decorator.

```javascript
@propInject("orders")
@staticPropInject("Dialog")
export default SomePanel extends React.Component {
    render() {
        <SomePanel.Dialog onClick={this.save.bind(this)}>
            Well hello!
        </SomePanel.Dialog>
    }
    save() {
        this.orders.save(); // `propInject` still works.
    }
}
```

## DI Specifications
*NOTE: The specs API have recently changed. Looking for the old api docs? [Click here.](./di-v1.md)*

When the `App` is run, the `Bootstrapper` will run through the components of the app, asking each to register their specifications. The specs registered by the components instructs the DI system on what `roles` that component provides and what `roles` those objects depend on (*via the `inject` metadata property mentioned above)*. It is the job of the DI system to construct these objects and resolve their dependencies.

When the DI system is done building the graph of objects, it returns an `IocContainer`. The container is simply of bag of all the object built by the DI system, with each key matching the role name. *This container object can be referenced by components, but should not be used by the modules inside your `lib` directly.*

Take a look at the [App.run and bootstrap lifecycle docs](./app-run.md#sequence-diagram) for more details. Anywhere you see the `Bootstrapper` or `Specs` being passed, you can register your modules.

### Example spec
```javascript
import { SpecRegistration, SpecFromClass, SpecFromFn, SpecFromValue } from "@yuzu/yep-app/di";
import { component } from "@yuzu/yep-app/decorators";

@component("@app/my-component")
export default class MyComponent {
    register() {
        return new SpecRegistration(
            new SpecFromClass("awesomeService", AwesomeService),
            new SpecFromFn("fooService", createFooService),
            new SpecFromValue("fooColors", ["red", "green", "blue"])
        };
    }
}
```

The above shows 3 roles being provided. The `register` method returns a `SpecRegistration` will 3 different ways to provide roles.
You can pass any many individual spec objects as arguments as you want.

If you are hooking into a lifecycle method, you can use the `Bootstrapper.specs.register` method.

```javascript
@component("@app/my-component")
export default class MyComponent {
    onBeforeAppBoostrapped(bootstrapper) {
        bootstrapper.specs.register(
            new SpecRegistration(
                new SpecFromClass("syncService", SyncService)
            )
        );
    }
    register() {
        return new SpecRegistration(
            new SpecFromClass("awesomeService", AwesomeService),
            new SpecFromFn("fooService", createFooService),
            new SpecFromValue("fooColors", ["red", "green", "blue"])
        };
    }
}
```

## The `Spec` API
The following classes are used to instruct the DI system on how to build your objects. Keep in mind that `role` names should not reveal *how* an object will play the role unless a module in the system *depends* on the implementation. The idea is that the `role` represents an abstraction. Despite this most of the time, your class might be named the same as the role name. Just remember that this is not always the case.

All `Spec` classes can take either a `roleName` string or an array of `roleNames`. This is because one object might play multiple roles.

### `SpecFromClass (roles: string|array<string>, Class)`
The DI system will `new` up your class. The object created will play the role or roles from `roleNames`. The object is also saved inside the `IocContainer`.

```javascript
// Create an instance of Orders to play the role of orders.
new SpecFromClass("Orders", Orders)

// Create an instance of Order` to play the role of `Orders` and `PlacementDelivery`.
new SpecFromClass(["Orders", "PlacementDelivery"], Orders);
```
In the both examples, any other object in the system can now depend on the `role` `Orders`. The `IocContainer` will contain a key of `Orders` with the object. In the 2nd example, another role, 'PlacementDelivery`, is also provided, and an additional `PlacementDelivery` key will be exposed pointing to the same object.

### `SpecFromFn(roles: string|array<string>, fn)`
Same API as `SpecFromClass` only the DI system will just call you function `fn. The function should be a factory and return an object .

```javascript
// The DI system will call `createOrders` fn.
new SpecFromFn("Orders", createOrders);
```

### `SpecFromValue(roles: string|array<string>, value: any)`
When you already have a created object/value and you don't need the DI to create it you can use the `SpecFromValue` class.

```javascript
new SpecFromValue("favoriteColor", "blue");
new SpecFromValue("sampleItem", { name: "Book 1", id: 123 });
new SpecFromValue("logger", (...args) => console.log(...args));
```

### `ActionSpec(Action)` and `ActionSpec(roles: string|array<string>, Action)`
Declare an application [action](./app-actions-and-events.md).
If your action's self describes its component name you don't need to pass in the name.

```javascript
new ActionSpec(SaveItem);
new ActionSpec("saveItem", SaveItem);
new ActionSpec(["saveItem", "storeItem"], SaveItem);
```

### `HooksSpec(Action)`
Declare an [application hooks](./app-hooks.md) for the application. No role is needed as they are not exposed to any other
module. The hook passed in, should be a class.

```javascript
new HooksSpec(LockerHooks);
```

### `RegistrySpec(configSpecs: Registry)`
Declare an registry that the DI system can create based on a spec config.
For more details see [spec configuration](./app-config.md#specconfig).

```javascript
new RegistrySpec(this.mappersConfig);
```

## Altering the arguments passed to your fn/Class.
When you need to manually set what arguments should be passed to your component you can use the `Spec#args` API.

*NOTE: The following does not apply to `SpecFromValue` as the object has already been created.*

#### `Spec#set(First|Second|Third|Fourth)Arg`

```javascript

// The first arg passed to the constructor will always be 5.
new SpecFromClass("foo", Foo).setFirstArg(5);

// The first arg will the object that plays the role `FooRepo`.
new SpecFromClass("foo", Foo).setFirstArg(new SpecRef("FooRepo"));
```

#### `Spec#setAllArgs`
```javascript
// Reset all args.
new SpecFromClass("foo", Foo).setAllArgs(1, 2, 3);

// Just as before you can pass references to roles
new SpecFromClass("foo", Foo).setAllArgs(1, new SpecRef("FooRepo"), 3);
```

#### `Spec#setArg`
```javascript
// Set the first arg (0 is the index).
new SpecFromClass("foo", Foo).setArg(0, new SpecRef("FooRepo"));
```

## Basing your specs on flags and conditionals
If you find yourself performing a bunch of checks in your registration,
you can use `CondSpecs` to group your specs.

### CondSpecs(flag: boolean|function:boolean)
Pass a boolean flag or fn that returns a boolean. Then use the
`whenTrue` and `whenFalse` methods to specify which set of specs to register
based on the flag.

```javascript
new SpecRegistration(
    new CondSpecs(App.config.isFooEnabled)
        .whenTrue(
            new SpecFromClass("foo", Foo),
            new SpecFromValue("maxCount", 100)
        )
        .whenFalse(
            new SpecFromClass("foo", NullFoo),
            new SpecFromValue("maxCount", 0)
        );
);

```

## Advanced API (Avoid usage if possible)

The follow spec types should **rarely** by used, but server as a last resort when needing
to modify the spec config manually.

### `ConfigMod(updateConfig: fn)`
Get back the raw specs config to modify yourself.
You pass in a function that takes one argument, the config.

```javascript
new ConfigMod((cfg) => cfg.foo.literal = 5);
```

### `SpecWithConfigMod(Spec, updateConfig: fn)`
Pass another spec object (one of the spec classes above), and pass in a function that takes
the config created by the spec.

```javascript
new SpecWithConfigMod(new SpecFromValue("favColor", favColor), (cfg) => cfg.init = "toHex");
```

### Retrieving objects from the `IocContainer` inside Application hooks.

As mentioned above, the DI system outputs an `IocContainer` object.

You can reference this object from within some application lifecycle hooks. *([See the App#run lifecycle for which hooks do](./app-run.md#sequence-diagram))*
are passed a reference to the `IocContainer`.

With the specs used above the following would be in the `IocContainer`

```javascript
onAppBootstrapped(container) {
    // Notice keys match the role name the object plays/implements
    console.log(container.awesomeService);
    console.log(container.fooService);
    console.log(container.settings);
}

// Or you can be ES6 fanboy
onAppBootstrapped({ awesomeService, fooService, settings }) {
    console.log(awesomeService);
    console.log(fooService);
    console.log(settings);
}
```
