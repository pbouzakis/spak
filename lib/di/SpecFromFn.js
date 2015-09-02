import _ from "underscore";
import { specKeyFromName } from "./specKey";

export default class SpecFromFn {
    constructor(nameOfInstance, fn) {
        this._name = nameOfInstance;
        this._fn = fn;
        this._argsToOverride = [];
    }

    writeTo(config) {
        config[this.specKey] = this._createConfig();
    }

    setArg(index, value) {
        this._argsToOverride.push({ index, value });
        return this;
    }

    setAllArgs(...args) {
        this._argsToOverride = args.map((value, index) => {
            return { index, value };
        });
        return this;
    }

    _createConfig() {
        var config = {
            create: {
                module: this._fn,
                args: this.specArgs,
                isConstructor: false
            }
        };
        return this._onConfigCreated(config) || config; // Allow sub class to create brand new cfg.
    }

    // Template method.
    _onConfigCreated(/* config: SpecConfig */) {
    }

    get specKey() {
        return specKeyFromName(this._name);
    }

    get specArgs() {
        if (!Array.isArray(this._fn.inject)) { // RETURN EARLY if nothing to inject.
            return [];
        }

        var args = this._fn.inject.map((id) => {
            return { $ref: id };
        });

        this._argsToOverride.forEach((override) => {
            args[override.index] = override.value;
        });

        return args;
    }
}
// Mmm sugar.
var sugarMethods = ["setFirstArg", "setSecondArg", "setThirdArg", "setFourthArg"];
sugarMethods.forEach((method, index) => {
    SpecFromFn.prototype[method] = _.partial(SpecFromFn.prototype.setArg, index);
});

