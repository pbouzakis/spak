import Q from "q";
import Workflow from "workflowit";
import Components from "./AppComponents";
import AppDelegate from "./AppDelegate";
import AppConfig from "./AppConfig";

var _instance = null;

export default class App {
    // private contructor
    constructor(components, config, delegate) {
        if (_instance) {
            throw new Error("App can only have one instance at a time. Try App.terminate() first.");
        }

        this._delegate = delegate;
        this._bootstrapper = delegate.createBootstrapper(components);
        this._events = delegate.createEventBus();
        this._workflows = delegate.createWorkflows();

        this._config = config;
        this._actions = null;

        // providers
        this._session = null;
        this._logger = null;
        this._localization = null;

        _instance = this;
        this._delegate.startup(this);
    }

    bootstrap() {
        return Q.when(
            this._bootstrapper.bootstrap(
                this._bootstrapComplete.bind(this)
            )
        );
    }

    _bootstrapComplete(actions, providers) {
        this._actions = actions;
        this._initProviders(providers);
        this._listenForUncaughtErrors();
    }

    _initProviders({ session, logger, localization , uncaughtErrors }) {
        this._session = session;
        this._logger = logger;
        this._localization = localization;
        this._uncaughtErrors = uncaughtErrors;
    }

    _listenForUncaughtErrors() {
        this._uncaughtErrors.listen(
            (...args) => this._delegate.handleUncaughtError(...args)
        );
    }

    static instance() {
        if (!_instance) {
            throw new Error("Can not return App.instance(). App.run must be invoked first.");
        }
        return _instance;
    }

    static runAsync(components, config, delegate) {
        return Q.try(() => new App(components, config, delegate))
            .then((_app) => _app.bootstrap())
            .then(() => delegate.onReady())
            .catch((e) => delegate.handleRunError(e));
    }

    static run(...args) {
        App.runAsync(...args).done();
    }

    static terminate() {
        _instance = null;
    }

    get bootstrapper() {
        return this._bootstrapper;
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

    get config() {
        return this._config;
    }
    static get config() {
        return App.instance().config;
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

    get workflows() {
        return this._workflows;
    }
    static get workflows() {
        return App.instance().workflows;
    }

    static get Components() { return Components; }
    static get Delegate() { return AppDelegate; }
    static get Config() { return AppConfig; }
    static get Workflow() { return Workflow; }
    static get WorkflowStep() { return Workflow.Step; }
}
