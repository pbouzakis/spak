import Q from "q";
import { iocSpecs } from "./iocSpecBuilder";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`);
}

export default class Bootstrapper {
    constructor(components) {
        this._components = components;
        this._specs = iocSpecs();
        this._container = null;
    }
    get specs() {
        return this._specs;
    }
    get container() {
        return this._container;
    }
    get actions() {
        return this._specs.actions;
    }
    bootstrap() {
        return Q.try(() => this._components.onBeforeAppBootstrapped(this))
            .then(() => this._components.register(this._specs))
            .then(() => this._components.onAppComponentsRegistered(this))
            .then(() => this._specs.wire())
            .then((container) => {
                this._components.onAppBootstrapped(this);
                return container;
            });
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
