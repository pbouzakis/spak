import { specKeyFromName } from "./specKey";

export default class SpecFromFn {
    constructor(nameOfInstance, fn) {
        this._name = nameOfInstance;
        this._fn = fn;
    }

    writeTo(config) {
        config[this.specKey] = {
            create: this._createConfig()
        };
    }

    _createConfig() {
        var cfg = {
            module: this._fn,
            args: this.specArgs,
            isConstructor: false
        };
        return this._onCreate(cfg) || cfg; // Allow sub class to create brand new cfg.
    }

    // Template method.
    _onCreate(/* createConfig */) {
    }

    get specKey() {
        return specKeyFromName(this._name);
    }

    get specArgs() {
        return this._fn.inject.map((id) => {
            return { $ref: id };
        });
    }
}
