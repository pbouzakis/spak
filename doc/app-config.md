# Configuring the App


## AppConfig
`yep-app` comes with a simple object that provides configuration settings to the rest of the application.

```
You can pass as many options as you want. They are all `merged` (using underscore's extend).
var cfg = new App.Config(opt1, opt2, opt3);
```
*Be careful with nested options, options are NOT deeply copied when merged*

An app config must be passed as the 2nd argument to `App.run`.

```javascript
var opt1 = { size: 100 };
var opt2 = { color: blue };
var opt3 = { size: 200 };

App.run(
    App.Components(...),
    App.Config(opt1, opt2, opt3),
    App.Delegate({ ... })
);

// Later in your code
console.log(App.config.size); // 200 is outputted.
```

## Adding defaults to AppConfig for your component.
A component might want to expose a configuration to the rest of the application, but might need to initialize that config setting. The [`onAppConfig` component hook](./yep-component.md) is where you should set defaults.

When using the `@component` decorator you can access the `App.config` object directly off the component instance via the `config` getter.

The component that sets the default should use the `onAppConfig` hook. Components that want to alter this config, should use the `onBeforeAppBootstrapped` hook. This allows the config to ready for us in the `register` hook.

```javascript
@component("@app/my-component")
export default class MyComponent {
    onAppConfig()  { // AppConfig object. Same reference as App.config.
        this.config.colors = []; // Init to an array.
    }
    register() {
        return SpecRegistration(
            new SpecFromClass("pickers", ColorPickers)
                .setAllArgs(this.config.colors); // By now other components have had the change to add colors.
        );
    }
}

// Then another component and alter this config
@component("@app/other-component")
export default class OtherComponent {
    onBeforeAppBootstrapped() { // Before register called on my-component, alter config settings
        this.config.colors.push(...["red", "green", "blue"]);
    }
}
```

## Registry
When needing a more advanced configuration, components can utilize a `Registry`. A component can create a registry for other components/modules to register with. The registry implements a lookup API so the component that owns the registry can lookup by criteria for which objects it would like to use to configure it's DI spec.

```javascript
import { Registry } from "@yuzu/yep-app";

// Later in your code
var registry = new Registry("mappers"); // Give it a name.

// Register objects w/ it.
registry.register({
    name: "foo",    // Only required prop.
    items: ["red"],
    isMatchingFor(criteria) {
        return this.items.indexOf(criteria.item) >= 0;
    },
    doStuff() {}
});

// You can lookup by name.
registry.lookup("foo"); // Gets the object registered above.

// You can lookup by criteria. Criteria can be anything.
// Registered objects must have an `isMatchingFor` method.
registry.lookupWhere({ item: "red" }); // This will be hit.
registry.lookupWhere({ size: 500 }); // This won't.

// You can look up w/ a custom search method.
registry.lookupWhere((item) => {
    return typeof item.doStuff === "function";
});
```


## SpecConfig
You can combine the registry with a `SpecConfig` to make configuring your objects even easier.
The concept is the same as regular `App.config`. You initalize your `SpecConfig` in `onAppConfig`, other components can register with it during `onBeforeAppBootstrapped`. By the register hook, you can have spec config fully registered and ready for us to be put into the DI spec.

### RegistrySpec
The `RegistrySpec` is what you can place inside your `SpecRegistration` to turn your `SpecConfig` into a `Registry` object that your objects can use.

### @component decorator

When using the `@component` decorator you are provided with `createSpecConfig`, `addSpecConfig`, and `specConfig` helpers methods.

The `create/add` methods are used before `register`. Then when registering your components, you can have the DI system *create a registry from the spec config!*

*NOTE: The SpecConfig is also an instance of a `Registry`. Don't confuse this with the registry created by the DI system.*

```javascript
@component("@app/some-component")
export default class SomeComponent {
    onAppConfig() { // 
        this.mappers = this.createSpecConfig("mappers"); // Init/create your SpecConfig.
        // Alternative `add` api. Useful if you have a custom registry you'd like to use.
        // this.mapper = this.addSpecConfig(new CustomSpecConfig("mappers");
    }
    register() {
        return new SpecRegistration(
            new SpecRegistry(this.mappers), // `this.mappers` is fully registered. Convert to a registry object via DI system.
            new SpecFromClass("repo", MyRepo)
        );
    }
}

// Another component would like to register with the mappers spec config.
@component("@app/another-component")
export default class AnotherComponent {
    onBeforeAppBootstrapped() {
        this.specConfig("mappers").register(new SpecRef("mylabsMapper")); // Notice you can reference roles in your spec!
    }
    register() {
        return new SpecRegistration(
            // `mylabsMappers` will be placed into the mappers spec config once it's dependencies have been satisified.
            new SpecFromClass("mylabsMapper", MylabsMapper)
        );
    }
}
```

With the above in the spec, we could have the `MyRepo` class depend on that registry. That registry can be added to by any other component (as shown abe with `another-component`).

```javascript
export default class MyRepo {
    construct(mappers, storage) { // MyRepo depends on the mappers registry. You will get it once it's ready to go.
       this._mappers = mappers;
       this._storage = storage;
    }
    fetch(id) {
       var data = this._storage.get(id);
       var mapper = this._mappers.lookupWhere({ type: data.type }); // Lookup in your registry to find the object you want.
       return mapper.map(data); // Neat!
    }
}
```
