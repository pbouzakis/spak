/*eslint-disable no-console */
import _ from "underscore";
import App from "./App";
import ProvidedAppDelegate from "./ProvidedAppDelegate";
import { defaultsWithDelegate } from "./defaultAppArgs";

class TestApp extends ProvidedAppDelegate {
    constructor() {
        super();
        this.actions = {};
        this.container = {};
    }
    run(delegateHooks = {}) {
        _.extend(this, delegateHooks);
        var appArgs = defaultsWithDelegate(this);
        App.run(...appArgs);
    }
    registerAction(name, actionCmd) {
        this.actions[name] = actionCmd;
    }
    createBootstrapper() { // Make TestApp also the bootstrapper.
        return this;
    }
    bootstrap(onComplete) {
        var providers = this.delegate.provide(this.container);
        var actions = this.delegate.createActions(this.actions);
        onComplete(actions, providers);
    }
    handleRunError(error) {
        console.error(error);
    }
}

export default new TestApp();
