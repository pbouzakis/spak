# yep-app
A micro application framework providing the following:

- Top level / root object that [provides common application resources](./doc/app-providers.md)
  - current client session
  - authenticated user
  - localization
  - logging
  - uncaught error handling
- [component based architecture](./doc/app-component.md)
- [application configuration](./doc/app-config.md)
- [action dispatcher](./doc/app-actions-and-events.md#actions)
- [event command bus](./doc/app-actions-and-events.md#events)
- [app workflow](./doc/app-workflows.md)
- [dependency injection wiring](./doc/di.md)
- [ES decorators](./doc/decorators.md)

### Docs

[See our docs for more](./doc/index.md)

### Githooks

For developers contributing to this repo's source code, please run the following npm script:

```
npm run githooks
```

This script provides:

- pre commit: Lints code before commit is added to history.
- pre push: Runs tests before code is pushed up to remote.
