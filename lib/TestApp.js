/*eslint-disable no-console */
import _ from "underscore";
import App from "./App";
import { defaultsWith } from "./defaultAppArgs";

class TestApp {
    constructor() {
        this.actions = {};
        this.container = {};
    }
    run(delegateHooks = {}) {
        // Make TestApp be the delegate.
        var appArgs = defaultsWith(_.extend(this, delegateHooks));
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
