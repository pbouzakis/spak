# Docs

## PluginBroker

Allows subscribers to regiseter for application hooks.

### Current hooks
- startup
- accountAvailable

## plugins

### browserify transform: injectify

This browserify transform adds annotations to a "class" or default export of a module.

At the moment the following alterations are made to the class

- The class's constructor dependencies are listed as `inject` annotations.
- The UIComponent's name is added to the prototype (Applies only to UIComponents of course).
- The location of the module is outputted as a comment.

More details needed.
