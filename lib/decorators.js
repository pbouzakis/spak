import App from "./App";
import SpecConfig from "./Registry"; // We can use a registry for the spec config.

export function inject(...args) {
    return (target) => {
        target.inject = args; // Provide IOC framework with a place to find out what to inject.
    };
}

var makePropInject = (getPropTarget) => (...nameOfRoles) => {
    var roles = nameOfRoles.map((nameOfRole) => {
        var property;
        if (Array.isArray(nameOfRole)) {
            [nameOfRole, property] = nameOfRole;
        } else {
            property = nameOfRole;
        }
        return { property, nameOfRole };
    });
    return (target) => {
        target = getPropTarget(target);
        roles.forEach(({ property, nameOfRole }) => {
            Object.defineProperty(target, property, {
                get() {
                    return App.instance().bootstrapper.container[nameOfRole];
                }
            });
        });
    };
};

export var propInject = makePropInject((target) => target.prototype);
export var staticPropInject = makePropInject((target) => target);

export function logger(ns) {
    return (target) => {
        Object.defineProperty(target.prototype, "logger", {
            get() {
                return App.logger(ns);
            }
        });
    };
}

// Create an emitter for an object via `pubit-as-promised`

var localEmitter = (publisher, { events }) => makeEmitter(publisher, events);
var dualEmitter = (publisher, opts) => App.events.makeDualEmitter(publisher, opts);

export function emitter(events, { appPrefix }) {
    var emitter = appPrefix ? dualEmitter : localEmitter;
    return (target) => {
        target.prototype._emitter = function () {
            return emitter(this, { events, prefix: appPrefix });
        };
    };
};

var specConfigs = Object.create(null);
export function component(name, metadata = {}) {
    return (target) => {
        metadata.name = name;
        Object.defineProperty(target.prototype, "metadata", {
            get() {
                return metadata;
            }
        });
        Object.defineProperty(target.prototype, "config", {
            get() {
                return App.config;
            }
        });
        target.prototype.createSpecConfig = function (name) {
            return this.addSpecConfig(new SpecConfig(name));
        };
        target.prototype.addSpecConfig = function (config) {
            specConfigs[config.name] = config;
            return config;
        };
        target.prototype.specConfig = function (name) {
            return specConfigs[name];
        };
    };
}
