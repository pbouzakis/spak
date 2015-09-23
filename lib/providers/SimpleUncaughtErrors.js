export default class SimpleUncaughtErrors {
    listen() {
        global.onerror = (error) => {
            this.logger.error("Uncaught Error!");
            this.logger.error(error);
            return true;
        };
    }
}
