import SpecFromFn from "./SpecFromFn";

// Currently no need to implement constructor.
// Done simply for documentation purposes.

export default class SpecFromClass extends SpecFromFn {
    constructor(roleNames, ImplementationClass) {
        super(roleNames, ImplementationClass);
    }

    _onConfigCreated(config) {
        config.isConstructor = true;
    }
}
