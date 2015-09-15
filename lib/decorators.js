import App from "./App";

export function inject(...args) {
    return (target) => {
        target.inject = args; // Provide IOC framework with a place to find out what to inject.
    };
}

export function propInject(...nameOfRoles) {
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
        roles.forEach(({ property, nameOfRole }) => {
            Object.defineProperty(target.prototype, property, {
                get() {
                    return App.instance().bootstrapper.container[nameOfRole];
                }
            });
        });
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
