import App from "./App";

export default class Action {
    dispatchAction(...args) {
        return App.dispatchAction(...args);
    }

    get logger() {
        return App.logger(this.ns);
    }

    get events() {
        return App.events;
    }

    publish(ev, ...args) {
        return App.events.publish(`${this.ns}.${ev}`, ...args);
    }

    get ns() {
        return this._ns || "app";
    }
    set ns(namespace) {
        this._ns = namespace;
    }

    static ns(key) { // Decorator for easily adding namespace.
        return (ActionWithNS) => {
            ActionWithNS.prototype.ns = key;
        };
    }
}
