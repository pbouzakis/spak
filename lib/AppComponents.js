import Q from "q";

export default class AppComponents {
    constructor(...listOfComponents) {
        this._list = listOfComponents;
    }
    register(specs) {
        return Q.all(this._list.map(
            (component) => Q.when(component.register(specs))
        ));
    }
}
