import App from "./App";

export default class AppHooks {
    constructor() {
        this._disposeFns = Object.create(null);
    }

    subscribe() {
        if (!Array.isArray(this.events)) {
            throw new Error("AppHooks must be provided with an array of events.");
        }
        this.events.forEach((event) => {
            this._disposeFns[event] = App.events.on(event, this._methodFor(event));
        });
        this.onStartup();
    }

    subscribeTo(event) {
        App.events.once(event, () => this.subscribe());
    }

    dispose(...events) {
        events = events.length > 0 ? events : this.events;
        events.forEach((event) => {
            this._disposeFns[event]();
        });
        this.onDispose(events);
    }

    // TEMPLATE methods.
    onStartup() {
    }
    onDispose() {
    }

    _methodFor(event) {
        var nameOfMethod = event.split(".").reduce((name, eventPart) => {
            return name + eventPart[0].toUpperCase() + eventPart.slice(1);
        }, "");
        return this[`on${nameOfMethod}`].bind(this);
    }

    // Expose decorator for mixing in events to subscribe to.
    static events(...events) {
        return (target) => {
            Object.defineProperty(target.prototype, "events", {
                value: events
            });
        };
    }
}
