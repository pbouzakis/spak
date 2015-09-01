import SpecFromFn from "./SpecFromFn";

// Currently no need to implement constructor.
// Done simply for documentation purposes.

export default class SpecFromClass extends SpecFromFn {
    constructor(nameOfInstance, ImplementationClass) {
        super(nameOfInstance, ImplementationClass);
    }

    _onCreate(cfg) {
        cfg.isConstructor = true;
    }
}
