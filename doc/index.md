# Docs

## PluginBroker

Allows subscribers to regiseter for application hooks.

### Current hooks
- startup
- accountAvailable

## plugins

### browserify transform: decoratify

This browserify transform decorates a "class" or default export of a module.
The browserify tranform will delegate to decorator transforms to do the actually
transforming of the module with the help of a `TransformWriter`.

At the moment the following transformers are enabled:

- `AutoDecorateInjectTransformer`: The class's constructor dependencies are listed as `inject` annotations.
- `UIComponentNameSetter`: The UIComponent's name is added to the prototype (Applies only to UIComponents of course).
- `DecorateClassTransformer`: The main transformer that looks for `// @decorator(x)` comment blocks. This transformer can be registered with custom decorator transformers in order to handle custom transforming for a specific decorator.


