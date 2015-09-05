import SpecRoles from "./SpecRoles";

export default class SpecFromValue {
    constructor(roles, literalValue) {
        this._roles = new SpecRoles(roles);
        this._literal = literalValue;
    }

    writeTo(config) {
        config[this.specKey] = {
            literal: this._literal
        };
        this._roles.writeAliasesTo(config);
    }

    get specKey() {
        return this._roles.specKey;
    }
}
