import App from "./App";

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
        var target = getPropTarget(target);
        roles.forEach(({ property, nameOfRole }) => {
            Object.defineProperty(target, property, {
                get() {
                    return App.instance().bootstrapper.container[nameOfRole];
                }
            });
        });
    };
}

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

export function component(name, metadata = {}) {
    return (target) => {
        metadata.name = name;
        Object.defineProperty(target.prototype, "metadata", {
            get() {
                return metadata;
            }
        });
    };
}
