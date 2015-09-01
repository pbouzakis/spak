export default class SpecRegistration {
    constructor(...specs) {
        this._specs = specs;
    }

    writeTo(config) {
        this._specs.forEach(
            (spec) => spec.writeTo(config)
        );
    }
}
