/*jshint ignore: start */
import App from "./App";
import { logger } from "./decorators";

@logger("Uncaught")
export default class UncaughtErrors {

    _logAndPublishError(error) {
        this.logger.logError(error);
        App.events.publish("error.uncaughtErrorHandled", error);
    }

    createPresentedError(error) {
        throw new Error("`createPresentedError` has not been implemented.");
    }

    handleUncaughtError(error) {
        this._logAndPublishError(error);
    }

    handleSystemError(error) {
        this._logAndPublishError(this.createPresentedError(error));
    }

    handleActionError(error) {
        this.handleSystemError(error);
    }
}
