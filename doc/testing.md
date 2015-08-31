# Testing yep-app components

If you're using the features yep-app has to offer, there are a couple additional steps you'll need to take in order to test your yep-app component: 

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

You'll need to run the App before running your tests in order for them to pass. You can do this by running `App.runAsync()` and passing the default arguments.

```js
import { App } from "@yuzu/yep-app";
import defaultAppArgs from "@yuzu/yep-app/lib/defaultAppArgs";

App.runAsync(...defaultAppArgs).done(() => global.run(), (e) => console.error(e));
```
Then, in your `mocha.opts`, delay running your tests until the App has run by adding a delay flag.
```js
--delay
```

