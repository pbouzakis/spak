import _ from "underscore";
import CreateConfig from "./CreateConfig";
import SpecRoles from "./SpecRoles";

export default class SpecFromFn {
    constructor(roles, fn) {
        this._roles = new SpecRoles(roles);
        this._fn = fn;
        this._argsToOverride = [];
    }

    writeTo(config) {
        config[this.specKey] = this._createConfig().value;
        this._roles.writeAliasesTo(config);
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
        var config = new CreateConfig({
            fn: this._fn,
            args: this.specArgs,
            isConstructor: false
        });

        return this._onConfigCreated(config) || config; // Allow sub class to create brand new cfg.
    }

    // Template method.
    _onConfigCreated(/* config: SpecConfig */) {
    }

    get specKey() {
        return this._roles.specKey;
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

