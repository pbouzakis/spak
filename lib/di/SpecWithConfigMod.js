export default class SpecWithConfigMod {
    constructor(spec, updateConfig) {
        this._spec = spec;
        this._updateConfig = updateConfig;
    }
    writeTo(config) {
        this._spec.writeTo(config);
        this._updateConfig(config[this._spec.specKey], this._spec);
    }
}
