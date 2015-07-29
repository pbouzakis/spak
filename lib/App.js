class Delegate {
}

class Components {
}

var _instance = null;

export default class App {
    // private contructor
    constructor(components, delegate) {
        if (_instance) {
            throw new Error("App can only have one instance at a time. Try App.terminate() first.");
        }

        this._components = components;
        this._delegate = delegate;
        _instance = this;
    }

    bootstrap() {
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
