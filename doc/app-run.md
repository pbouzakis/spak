## App.run

Starting, bootstrapping, and running the application is fairly simple.

You must provide the following objects.

- [List of Components via `App.Components`.](./app-component.md)
- [An application config via `App.Config`.'](./app-config.md)
- [An application delegate via `App.Delegate`.](./app-delegate.md)

## `App#run(components, config, delegate)`

A realistic example

```javascript
App.run(
    new App.Components(
        new AuthComponent(),
        new StorageComponent(),
        new CloudComponent(),
        new PathfinderComponent(),
        new SyncComponent(),
        new PushNotificationsComponent(),
        new SearchComponent(),
        new WelcomeComponent(),
        new HubComponent(),
        new LockerComponent(),
        new AnnotationsComponent(),
        new ItemInfoComponent()
    ),
    new App.Config(config),
    new ProvidedAppDelegate({
        onStartup() {
            this._root = document.querySelector("main");
            this._router = Router.create({ routes });
        },
        onBeforeBootstrapped(bootstrapper) {
            bootstrapper.specs
                .action(LaunchApp)
                .action(ViewContent)
                .action(ViewTableOfContents);
        },
        onComponentsRegistered(bootstrapper) {
            bootstrapper.specs
                .creator("syncService", DummySync);
        },
        onBootstrapped({ syncService }) {
            console.log(syncService instanceof DummySync);
        }
        provideSession({ clientSession }) {
            return clientSession;
        },
        provideLogger() {
            return new ConsoleLogger();
        },
        onReady() {
            var renderUI = () => {
                this._router.run((Handler) => {
                    this._root.classList.add("y-app--is-ready");
                    React.render(<Handler/>, this._root)
                });
            };
            App.dispatchAction("launchApp", { renderUI });
        },
        handleRunError(e) {
            console.error("Error running application!");
            throw e;
        }
    }
));
```

The above showcases what App.run is used for, to start the application and ensure all required interfaces have implementations. The App.Delegate in the above example shows how it can be used to hook into key parts of the app run lifecycle.

### App.runAsync(components, config, delegate)

Same as `App#run` only a promise is returned.
This should not be needed for production code, but might be helpful in test code where you might want to run the app and **THEN** run your test environment.

## Sequence diagram

The following diagram shows the flow between the objects in order to get the app up and running.
If anything throws an error, the `AppDelegate#handleRunError` will be called, so that app can tear down and alert the user that the app can't be started. See the [delegate docs for more](./app-delegate.md#errors)

![enter image description here](./images/app-bootstrap-lifecycle.png)
