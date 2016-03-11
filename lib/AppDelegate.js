import _ from "underscore";
import Bootstrapper from "./Bootstrapper";
import EventBus from "./EventBus";
import ActionDispatcher from "./ActionDispatcher";
import AppWorkflows from "./AppWorkflows";
import AppSpecifications from "./AppSpecifications";

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

    createBootstrapper(components) {
        return new Bootstrapper(components, this);
    }

    createEventBus() {
        return new EventBus();
    }

    createWorkflows() {
        return new AppWorkflows();
    }

    createActions(commands) {
        return new ActionDispatcher(commands);
    }

    createSpecs() {
        return new AppSpecifications(
            this.createSpecsBuilder()
        );
    }

    // AppSpecifications provides a default is none supplied.
    createSpecsBuilder() {
    }

    // Required providers.
    provide(container) {
        return {
            session: this.provideSession(container),
            logger: this.provideLogger(container),
            localization: this.provideLocalize(container),
            uncaughtErrors: this.provideUncaughtErrors(container)
        };
    }

    provideSession() {
        throw new Error("App requires a session to be provided.");
    }
    provideLogger() {
        throw new Error("App requires a logger to be provided.");
    }
    provideLocalize() {
        throw new Error("App requires localization to be provided.");
    }
    provideUncaughtErrors() {
        throw new Error("App requires an uncaught error listener to be provided.");
    }

    // Hooks.
    onStartup() {
    }
    onBeforeBootstrapped() {
    }
    onComponentsRegistered() {
    }
    onBootstrapped() {
        this.logger.info("Bootstrapped.");
    }
    onReady() {
        this.logger.info("Ready.");
    }

    // Required handlers.
    handleUncaughtError(e) {
        console.error(e); //eslint-disable-line no-console
        throw new Error("App requires a handler for uncaught errors.");
    }
    handleRestart() {
        throw new Error("App requires a handler for restart.");
    }
    handleRunError(e) {
        console.error("Error running application!"); //eslint-disable-line no-console
        throw e;
    }
}
