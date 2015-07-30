import App from "./App";

export function inject(...args) {
    return (target) => {
        target.inject = args; // Provide IOC framework with a place to find out what to inject.
    };
}

export function ui(target) {
    target.prototype.dispatchAction = App.dispatchAction;
    target.prototype.localize = App.localize;
    target.prototype.user = App.user;

    Object.defineProperty(target.prototype, "logger", {
        get: () => App.logger("UI"),
        enumerable: true
    });
}
