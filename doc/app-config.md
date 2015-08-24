# AppConfig

A simple object that provides configuration settings to the rest of the application.

```
You can pass as many options as you want. They are all `merged` (using underscore's extend).
var cfg = new App.Config(opt1, opt2, opt3);
```
*Be careful with nested options, options are deeply copied when merged*

An app config must be passed as the 2nd argument to `App.run`.

```
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
