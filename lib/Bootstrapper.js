import { iocSpecs } from "./iocSpecBuilder";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`);
}

export default class Bootstrapper {
    constructor(components) {
        this._components = components;
        this._specs = iocSpecs();
    }
    get specs() {
        return this._specs;
    }
    get actions() {
        return this._specs.actions;
    }
    bootstrap() {
        return this._components.bootstrap(this._specs)
            .then(() => this._specs.wire());
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
