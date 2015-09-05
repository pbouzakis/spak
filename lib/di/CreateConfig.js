import _ from "underscore";

export default class CreateConfig {
    constructor({ fn, args, isConstructor, opts }) {
        this._fn = fn;
        this._args = args;
        this._opts = opts || {};
        this.isConstructor = !!isConstructor;
    }
    get value() {
        return _.extend({
            create: {
                module: this._fn,
                args: this._args,
                isConstructor: this.isConstructor
            }
        }, this._opts);
    }
    extend(opts) {
        _.extend(this._opts, opts);
    }
}
