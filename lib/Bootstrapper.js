import Q from "q";
import { iocSpecs } from "./iocSpecBuilder";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`); //eslint-disable-line no-console
}

export default class Bootstrapper {
    constructor(components, delegate) {
        this._components = components;
        this._delegate = delegate;
        this._specs = iocSpecs();
        this._container = null;
    }

    get specs() {
        return this._specs;
    }
    get container() {
        return this._container;
    }
    get _actions() {
        return this._container.$actions;
    }

    bootstrap(onComplete) {
        this._onComplete = onComplete;
        return Q.try(() => this._delegate.onBeforeBootstrapped(this))
            .then(() => this._components.onBeforeAppBootstrapped(this))
            .then(() => this._components.register(this._specs))
            .then(() => this._components.onAppComponentsRegistered(this))
            .then(() => this._delegate.onComponentsRegistered(this))
            .then(() => this._specs.wire())
            .then(this._complete.bind(this));
    }

    _complete(container) {
        this._container = container;
        var providers = this._delegate.provide(container);
        var actions = this._delegate.createActions(this._actions);

        this._onComplete(actions, providers);
        this._components.onAppBootstrapped(container);
        this._delegate.onBootstrapped(container);
        return container;
    }

    register(registration) {
        return this._specs.register(registration);
    }

    getComponent() {
        throwNotImplemented("getComponent");
    }
    bootstrapBefore() {
        throwNotImplemented("bootstrapBefore");
    }
    bootstrapAfter() {
        throwNotImplemented("bootstrapAfter");
    }
}
