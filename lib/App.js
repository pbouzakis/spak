import Q from "q";
import _ from "underscore";
import iocSpecBuilder from "./iocSpecBuilder";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`);
}

class Delegate {
    constructor(handlers) {
        _.extend(this, handlers);
    }
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
        this._specs = iocSpecBuilder.define();

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

class Actions {
    constructor(actionMap) {
        this._map = actionMap;
    }
    dispatch(name, ...actionArgs) {
        var action = this._map[name];
        if (!action) {
            throw new Error("Action could not be dispatched: " + name);
        }
        var execAction = typeof action === "function" ? action : action.exec.bind(action);

        return Q.when(execAction(...actionArgs));
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
        this._actions = null;

        // providers
        this._session = null;

        _instance = this;
    }

    bootstrap() {
        return Q.when(this._delegate.onBeforeBootstrapped(this._bootstrapper))
            .then(() => this._bootstrapper.bootstrap())
            .then(this._bootstrapComplete.bind(this));
    }

    _bootstrapComplete(container) {
        this._actions = new Actions(this._bootstrapper.actions);
        this._initProviders();
        return this._delegate.onBootstrapped(container, this._bootstrapper);
    }

    _initProviders() {
        this._session = this._delegate.provideSession();
    }

    static instance() {
        if (!_instance) {
            throw new Error("Can not return App.instance(). App.run must be invoked first.");
        }
        return _instance;
    }

    static run(components, delegate) {
        var _app = new App(components, delegate);
        return _app.bootstrap().then(() => delegate.onReady());
    }

    static terminate() {
        _instance = null;
    }

    get session() {
        return this._session;
    }
    static session() {
        return App.instance().session;
    }

    static user() {
        return App.session().user;
    }

    static logger() {
    }

    static localize() {
    }

    dispatchAction(...args) {
        return this._actions.dispatch(...args);
    }
    static dispatchAction(...args) {
        App.instance().dispatchAction(...args)
            .done();
    }

    static get events() {
    }

    static get Components() { return Components; }
    static get Delegate() { return Delegate; }
}