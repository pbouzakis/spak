import Registry from "../Registry";
import SpecFromClass from "./SpecFromClass";

export default class RegistrySpec {
    constructor(configSpec, CustomRegistry) {
        this._registry = configSpec;
        this._spec = new SpecFromClass(configSpec.name, CustomRegistry || Registry);
    }
    writeTo(config) {
        this._spec.setAllArgs(...this._registry.all());
        this._spec.writeTo(config);
    }
}
