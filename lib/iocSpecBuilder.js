/*jshint module: false */
"use strict";

import _ from "underscore";
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


export function iocSpecs() {
    var that = {};
    var specs = {};
    var providerPlugins = {};
    var actions = {
        names: [],
        instances: {}
    };

    function saveActionsFrom(container) {
        actions.instances = _.object(
            actions.names.map((name) => [name, container[name]])
        );
    }

    function addProviderFor(key, provider) {
        if (!providerPlugins[key]) {
            providerPlugins[key] = [];
        }

        providerPlugins[key].push(provider);
    }

    function provideHook(key) {
        if (Array.isArray(providerPlugins[key])) {
            providerPlugins[key].forEach((plugin) => plugin(specs[key]));
        }
    }

    function specFactory(options) {
        return function (key, component, callback) {
            var aliasKeys;
            if (Array.isArray(key)) {
                [key, ...aliasKeys] = key;
            }
            if ("isConstructor" in options && /UIFactory$/.test(key)) {
                component = createFactoryFor(component, options);
            }
            specs[key] = config(component, options);

            if (typeof callback === "function") {
                callback(specs[key]);
            }

            if (aliasKeys) {
                aliasKeys.forEach(_.partial(that.alias, _, key));
            }

            provideHook(key);
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

    that.action = (...args) => {
        var name;
        var Action;

        if (args.length === 2) {
            [name, Action] = args;
        } else {
            [Action] = args;
            name = Action.prototype.componentName;
        }

        // If multiple names passed in, register them all.
        var actionNames = Array.isArray(name) ? name : [name];
        actions.names.push(...actionNames);
        return that.creator(name, Action);
    };

    that.custom = function (key, options) {
        specs[key] = options;
        provideHook(key);

        return that;
    };

    that.provideFor = (key, provider) => {
        addProviderFor(key, provider);

        if (specs[key]) {
            provideHook(key);
        }
    };

    that.spec = function (partialSpec) {
        partialSpec(that);
        return that;
    };

    that.wire = function () {
        return Q.when(wire(specs))
            .then((container) => {
                saveActionsFrom(container);
                return container;
            });
    };

    that.wireAsChildOf = function (parentContainer) {
        return Q.when(parentContainer.wire(specs));
    };

    Object.defineProperty(that, "actions", {
        get: () => actions.instances,
        enumerable: true
    });

    return that;
}
