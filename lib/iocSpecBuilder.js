"use strict";

import Q from "q";
import wire from "wire";

function mapArgs(func) {
    return func.inject.map(function (id) {
        return {
            $ref: id
        };
    });
}

// Looks at a list of dependencies and returns a new list by not including `Opts`.
function createDependenciesWithoutOptsFrom(inject) {
    return inject.filter(function (dependency) {
        return !/Opt$/.test(dependency);
    });
}

// Creates a list of resolved dependencies by checking if the dependency is first an option.
// If it's not, pull from the already resolved dependencies provided by the factory.
function createArgsWithOptsForInstance(Component, factoryArgs, options) {
    var resolvedDependencies = factoryArgs.slice();

    return Component.inject.map(function (dependency) {
        if (/Opt$/.test(dependency)) { // We have an option, look up in options hash.
            var argName = dependency.replace(/Opt$/, "");
            if (argName in options) {
                return options[argName];
            } else {
                throw new Error("Can not resolve dependency: " + dependency);
            }
        } else { // This dependency was already resolved by the component's factory
            return resolvedDependencies.shift();
        }
    });
}

function createFactoryFor(Component, specOpts) {
    function componentFactory() {
        var factoryArgs = [].slice.apply(arguments);

        return function (options) {
            var component;
            var instanceArgs = createArgsWithOptsForInstance(Component, factoryArgs, options);
            instanceArgs.push(options); // Push the entire opts as last argument for config components.

            if (specOpts.isConstructor) {
                component = Object.create(Component.prototype);
                Component.apply(component, instanceArgs);
            } else {
                component = Component.apply(null, instanceArgs);
            }
            return component;
        };
    }

    var inject = Component.inject;
    if (Array.isArray(inject)) {
        inject = createDependenciesWithoutOptsFrom(inject);
    }

    componentFactory.inject = inject;
    return componentFactory;
}

export function config(component, options) {
    options = options || {};
    var args;

    if ("args" in options) {
        args = options.args;
    } else if (typeof component === "function" && Array.isArray(component.inject)) {
        args = mapArgs(component);
    } else {
        args = [];
    }

    var type = "type" in options ? options.type : "create";
    var spec = {};

    if (type === "literal" || type === "module") {
        spec[type] = component;
    } else {
        spec[type] = {
            module: component,
            args: args,
            isConstructor: "isConstructor" in options? options.isConstructor : true
        };
    }

    return spec;
}

export function define() {
    var that = {};
    var specs = {};

    function specFactory(options) {
        return function (key, component, callback) {
            if ("isConstructor" in options && /UIFactory$/.test(key)) {
                component = createFactoryFor(component, options);
            }
            specs[key] = config(component, options);
            if (typeof callback === "function") {
                callback(specs[key]);
            }
            return that;
        };
    }

    that.creator = specFactory({ isConstructor: true });

    that.factory = specFactory({ isConstructor: false });

    that.literal = specFactory({ type: "literal" });

    that.module =  specFactory({ type: "module" });

    that.alias = (aliasKey, aliasFor) => {
        return that.factory(aliasKey, (instanceToAlias) => instanceToAlias, (spec) => {
            spec.create.args[0] = { $ref: aliasFor };
        });
    };

    // Sugar for specific chalk app components.
    /* jshint ignore:start */
    that.componentType = (type, ...args) => {
        var specKey = type.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        specKey += "UIFactory";

        return that.creator(specKey, ...args);
    };
    /* jshint ignore:end */

    that.componentInstance = that.creator;

    that.plugins = (pluginGroup, pluginHash) => {
        var specKey = pluginGroup + "Plugins";
        return that.literal(specKey, pluginHash);
    };

    that.custom = function (key, options) {
        specs[key] = options;
        return that;
    };

    that.spec = function (partialSpec) {
        partialSpec(that);
        return that;
    };

    that.wire = function () {
        return Q.when(wire(specs));
    };

    that.wireAsChildOf = function (parentContainer) {
        return Q.when(parentContainer.wire(specs));
    };

    return that;
}
