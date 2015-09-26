import App from "./App";

export default class Action {
    constructor() {
        // Need to save publishers on this instance so we can mutate the publish w/ when.
        this.publish = this.publish.bind(this);
        this.publish.when = this.publishWhen.bind(this);
    }

    dispatchAction(...args) {
        return App.dispatchAction(...args);
    }

    get logger() {
        return App.logger(this.ns);
    }

    get events() {
        return App.events;
    }

    publish(...args) {
        return this._publishWith(App.events.publish, ...args);
    }

    publishWhen(...args) {
        return this._publishWith(App.events.publish.when, ...args);
    }

    _publishWith(publish, ev, ...args) {
        return publish(`${this.ns}.${ev}`, ...args);
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
