# Uncaught Errors

This is will be the Base class for `UncaughtErrors`.

Objects that will extend this class have to implement `listen` and `createPresentedError`.

## Implement `listen` and `createPresentedError`

`UncaughtErrors#listen`: Start listening for uncaught errors.
`UncaughtErrors#createPresentedError`: Returns an object of type YepError that also implements `show`. e.g. @yuzu/ui/PresentedError.

## UncaughtErrors interface

```typescript
interface UncaughtErrors {
    listen();
    createPresentedError: PresentedError
    handleUncaughtError(normalizedError)
    handleSystemError(error);
    handleActionError(error);
}
```
