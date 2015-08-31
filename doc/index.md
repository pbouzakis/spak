# yep-app docs

## Quick Links

- [App API](#app-interface)
- [App providers](./app-providers.md)
- [Philosophy of `yep-app`](./philosophy.md)
- [Application components](./app-component.md)
- [Application action and events](./app-actions-and-events.md)
- [Application configuration](./app-config.md)
- [Custom functionality via AppDelegate](./app-delegate.md)
- [How to init and run an w/ App](./app-run.md)
- [Dependency Inject system](./di.md)
- [Bundled decorators](./decorators.md)
- [Testing your component](./testing.md)

## `App`

`App` is the root level object/class of your system that all modules in the project can depend on for application resources (providers). In addition the action dispatcher and event bus are also exposed.

`App` is an exported class, but you should never need to `new` up an instance. Instead most modules will simply call a `static` method which in turns message the instance.
If you need access to the instance itself, you can always call `instance()`.

```javascript
// I could do this.
var user = App.instance().user();
// But I think this is better.
var user = App.user();
```

## `App` interface

```typescript
interface App {
    static run(AppComponents, AppConfig, AppDelegate);
    static terminate();
    static session(): ClientSession;
    static user(): User;
    static localize(key: string): String;
    static logger(namespace: string): Logger;
    static events: EventBus;
    static dispatchAction(actionName: string, opts: Object);
    static config: AppConfig;
    bootstrapper: Bootstrapper;
}
```

All of the above `static` methods also can be referenced off the instance, but as shown above, this is usually unnecessary.

