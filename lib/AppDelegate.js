import _ from "underscore";

export default class AppDelegate {
    constructor(handlers) {
        this._app = null;
        if (handlers) {
            _.extend(this, handlers);
        }
    }

    startup(app) {
        this._app = app;
        this.onStartup();
    }

    get app() {
        return this._app;
    }
    get logger() {
        return this._app.logger("app");
    }

    // Required providers.
    provideSession() {
        throw new Error("App requires a session to be provided.");
    }
    provideLogger() {
        throw new Error("App requires a logger to be provided.");
    }
    provideLocalize() {
        throw new Error("App requires localization to be provided.");
    }

    // Hooks.
    onStartup() {
    }
    onBeforeBootstrapped() {
    }
    onBootstrapped() {
        this.logger.info("Bootstrapped.");
    }
    onReady() {
        this.logger.info("Ready.");
    }

    // Required handlers.
    handleUncaughtError() {
        throw new Error("App requires a handler for uncaught errors.");
    }
    handleRestart() {
        throw new Error("App requires a handler for restart.");
    }
    handleRunError(e) {
        console.error("Error running application!");
        throw e;
    }
}
