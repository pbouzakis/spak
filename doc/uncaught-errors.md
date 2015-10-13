# Uncaught Errors

YepApp requires a provider for handling uncaught errors.

```typescript
interface UncaughtErrors {
    listen();
    handleUncaughtError(error)
    handleSystemError(error);
    handleActionError(error);
}
```

## Base Class
YepApp comes bundled with a base class `UncaughtErrors` which you can extend for app specific behavior.
It does most of the work for you, but the sub class must implement 2 methods.

### Implement `listen`
This is called by the application when the app is ready for uncaught errors to listen for anything thrown by the application.

### Implement `_createPresentedError` template method
`UncaughtErrors#_createPresentedError`: Returns an object of type YepError that also implements `show`. e.g. @yuzu/ui/PresentedError.
