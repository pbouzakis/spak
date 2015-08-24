# yep-app
A micro frontend framework providing the following

- top level application object for common application resources including
  - current client session
  - authenticated user
  - localization
  - logging
  - uncaught error handling
- component based architecture
- application configuration
- action dispatcher
- event command bus
- dependency injection wiring
- ES decorators

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
