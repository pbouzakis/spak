import SpecGroup from "./SpecRegistration";

export default class CondSpecs {
    constructor(cond) {
        this._isTrue = Boolean(typeof cond === "function" ? cond() : cond);
        this._specGroup = null;
    }
    whenTrue(...specs) {
        if (this._isTrue) {
            this._specGroup = new SpecGroup(...specs);
        }
        return this;
    }
    whenFalse(...specs) {
        if (!this._isTrue) {
            this._specGroup = new SpecGroup(...specs);
        }
        return this;
    }
    writeTo(config) {
        if (this._specGroup) {
            this._specGroup.writeTo(config);
        }
    }
}
