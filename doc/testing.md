# Testing yep-app components

If you're using the features `yep-app` has to offer, there are a couple additional steps you'll need to take in order to test your yep-app component:

### Make sure your tests support Babel

Create a `registerBabel` file in your `test/support` folder with the following:

```js
var register = require("babel/register");

register({
    ignore: /node_modules(?:\/|\\)(?!@yuzu)/,
    optional: ["es7.decorators"] // If you're using decorators, you'll need this too.
});
```
Add it to your `mocha.opts` file.

```
--compilers js:test/support/registerBabel
```

### Run the App in your test setup

You'll need to run the App before running your tests to ensure you modules can access providers, the action dispatcher, of the App object.

The `yep-app` package comes with a `TestApp` object that provides all the necessary defaults and runs the app for you.

You should import and run the `TestApp` in your `test/support/setup` module.

```js
import { TestApp } from "@yuzu/yep-app/providers";

TestApp.run(); // That was easy!
```

### Registering stub actions and objects in the IOC container.

The `TestApp` object comes with a special `registerAction` method and exposes the `IocContainer` object so you can easily stub objects for you tests.

```javascript

// Useful when an action you're testing dispatches to another action.
TestApp.registerAction("startSession", {
    exec: sinon.stub()
});

// Useful when using `@propInject`.
TestApp.container.fooService = stubbedFooService();
```
