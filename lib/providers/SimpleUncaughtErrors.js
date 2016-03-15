import UncaughtErrors from "./UncaughtErrors";
import { logger } from "../decorators";

@logger("SimpleUncaught")
export default class SimpleUncaughtErrors extends UncaughtErrors {
    listen() {
        global.onerror = (error) => {
            this.logger.error("Uncaught Error!");
            this.logger.error(error);
            return true;
        };
    }

    _createPresentedError(error) {
        return error;
    }
}
