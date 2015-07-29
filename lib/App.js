import Q from "q";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`);
}

class Delegate {
}

class Components {
    constructor(...listOfComponents) {
        this._list = listOfComponents;
    }
    bootstrap(specs) {
        return Q.all(this._list.map(
            (component) => Q.when(component.bootstrap(specs))
        ));
    }
}

class Bootstrapper {
    constructor(components) {
        this._components = components;
        this._specs = {};
    }
    bootstrap() {
        if (this._components) {
            this._components.bootstrap(this._specs);
        }
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

var _instance = null;

export default class App {
    // private contructor
    constructor(components, delegate) {
        if (_instance) {
            throw new Error("App can only have one instance at a time. Try App.terminate() first.");
        }

        this._bootstrapper = new Bootstrapper(components);
        this._delegate = delegate;
        _instance = this;
    }

    bootstrap() {
        this._bootstrapper.bootstrap();
    }

    static instance() {
        if (!_instance) {
            throw new Error("Can not return App.instance(). App.run must be invoked first.");
        }
        return _instance;
    }

    static run(components, delegate) {
        var _app = new App(components, delegate);
        _app.bootstrap();
    }

    static terminate() {
        _instance = null;
    }

    static session() {
    }

    static user() {
    }

    static logger() {
    }

    static localize() {
    }

    static dispatchAction() {
    }

    static get events() {
    }

    static get Components() { return Components; }
    static get Delegate() { return Delegate; }
}
