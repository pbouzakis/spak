import Q from "q";
import { makeEmitter } from "pubit-as-promised";
import { iocSpecs } from "./iocSpecBuilder";
import AppDelegate from "./AppDelegate";

function throwNotImplemented(nameOfMethod) {
    console.warn(`[YepApp] ${nameOfMethod} not implemented!`);
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
        this._events = this._createEventBus();
        // providers
        this._session = null;
        this._logger = null;
        this._localization = null;

        _instance = this;
        this._delegate.startup(this);
    }

    _createEventBus() {
        var eventBus = {};
        eventBus.publish = makeEmitter(eventBus);
        return eventBus;
    }

    bootstrap() {
        this._delegate.startup(this);
        return Q.when(this._delegate.onBeforeBootstrapped(this._bootstrapper))
            .then(() => this._bootstrapper.bootstrap())
            .then(this._bootstrapComplete.bind(this));
    }

    _bootstrapComplete(container) {
        this._actions = new Actions(this._bootstrapper.actions);
        this._initProviders(container);
        return this._delegate.onBootstrapped(container, this._bootstrapper);
    }

    _initProviders(container) {
        this._session = this._delegate.provideSession(container);
        this._logger = this._delegate.provideLogger(container);
        this._localization = this._delegate.provideLocalize(container);
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

    logger(namespace) {
        return this._logger.container(namespace);
    }
    static logger(...args) {
        return App.instance().logger(...args);
    }

    localize(path) {
        return this._localization.localize(path);
    }
    static localize(...args) {
        return App.instance().localize(...args);
    }

    dispatchAction(...args) {
        return this._actions.dispatch(...args);
    }
    static dispatchAction(...args) {
        App.instance().dispatchAction(...args)
            .done();
    }

    get events() {
        return this._events;
    }
    static get events() {
        return App.instance().events;
    }

    static get Components() { return Components; }
    static get Delegate() { return AppDelegate; }
}
