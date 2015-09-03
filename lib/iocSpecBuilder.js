/*jshint newcap: false */
import _ from "underscore";
import Q from "q";
import wire from "wire";
import wirePlugin from "./di/wirePlugin";
import { SpecFromFn, SpecFromClass, SpecFromValue, ActionSpec } from "./di";

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

    var providerPlugins = {};

    var specs = {
        $plugins: [wirePlugin]
    };

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

    // Use brand new spec api v2

    var specApi2 = (Spec) => (...args) => {
        var spec = new Spec(...args);
        spec.writeTo(specs);

        if (args.length > 2 && typeof args[args.length - 1] === "function") {
            var cb = args[args.length - 1];
            cb(specs[spec.specKey]);
        }
        return that;
    };

    that.creator = specApi2(SpecFromClass);

    that.factory = specApi2(SpecFromFn);

    that.literal = specApi2(SpecFromValue);

    that.action = specApi2(ActionSpec);

    // End api v2

    that.module =  specFactory({ type: "module" });

    that.alias = (aliasKey, aliasFor) => {
        return that.factory(aliasKey, (instanceToAlias) => instanceToAlias, (spec) => {
            spec.create.args[0] = { $ref: aliasFor };
        });
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

    that.wire = () => Q(wire(specs));

    that.wireAsChildOf = (parentContainer) => Q(parentContainer.wire(specs));

    return that;
}
