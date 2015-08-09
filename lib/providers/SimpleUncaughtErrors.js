export default class SimpleUncaughtErrors {
    listen(handleUncaughtError) {
        global.onerror = (...args) => {
            handleUncaughtError(args);
            return true;
        };
    }
}
