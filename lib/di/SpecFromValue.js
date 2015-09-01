import { specKeyFromName } from "./specKey";

export default class SpecFromValue {
    constructor(nameOfInstance, literalValue) {
        this._name = nameOfInstance;
        this._literal = literalValue;
    }

    writeTo(config) {
        config[this.specKey] = {
            literal: this._literal
        };
    }

    get specKey() {
        return specKeyFromName(this._name);
    }
}
