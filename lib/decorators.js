import App from "./App";

export function inject(...args) {
    return (target) => {
        target.inject = args; // Provide IOC framework with a place to find out what to inject.
    };
}

export function logger(ns) {
    return (target) => {
        Object.defineProperty(target.prototype, "logger", {
            get() {
                return App.logger(ns);
            }
        });
    };
}
