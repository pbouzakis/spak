import App from "../App";
import { logger } from "../decorators";

@logger("Uncaught")
export default class UncaughtErrors {

    handleUncaughtError(error) {
        this._logAndPublishError(error, "Uncaught");
    }

    handleSystemError(error, type = "System") {
        this._logAndPublishError(this._createPresentedError(error), type);
    }

    handleActionError(error) {
        this.handleSystemError(error, "Action");
    }

    _logAndPublishError(error, type) {
        this.logger.info(`Handling: ${type} error.`);
        App.events.publish("error.uncaughtErrorHandled", error);
    }

    _createPresentedError() {
        throw new Error("`_createPresentedError` has not been implemented.");
    }
}
