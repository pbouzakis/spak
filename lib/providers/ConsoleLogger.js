class BrowserConsoleLogger {
    constructor(namespace) {
        this._namespace = namespace.toUpperCase();
    }

    logError(error, opts = {}) {
        var { prefixWith } = opts;
        var msg = this._messageFrom(error);

        if (prefixWith) {
            msg = `${prefixWith}: ${msg}`;
        }
        this.error(msg);
    }

    _write(type, ...args) {
        global.console[type](`[${this._namespace}]`, ...args);
    }

    _messageFrom(error) {
        var msg = typeof error === "string" ? error : error.message;
        var stack = typeof error === "string" ? "" : "\n" + error.stack;
        return msg + stack;
    }
}

["log", "debug", "info", "warn", "error"].forEach((type) => {
    BrowserConsoleLogger.prototype[type] = function (...args) {
        this._write(type, ...args);
    };
});

export default class ConsoleLogger {
    constructor() {
        this._loggers = {};
    }
    container(namespace) {
        if (!this._loggers[namespace]) {
            this._loggers[namespace] = new BrowserConsoleLogger(namespace);
        }
        return this._loggers[namespace];
    }
}
