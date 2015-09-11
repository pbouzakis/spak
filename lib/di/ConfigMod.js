export default class ConfigMod {
    constructor(updateConfig) {
        this._update= updateConfig;
    }
    writeTo(config) {
        this._update(config);
    }
}
