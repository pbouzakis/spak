import Q from "q";

export default class AppComponents {
    constructor(...listOfComponents) {
        this._list = listOfComponents;
    }
    onBeforeAppBootstrapped(bootstrapper) {
        return this._list.forEach(this._invokeHook("onBeforeAppBootstrapped", bootstrapper));
    }
    register(specs) {
        return Q.all(this._list.map(
            (component) => Q.when(component.register(specs))
        ));
    }
    onAppComponentsRegistered(bootstrapper) {
        return this._list.forEach(this._invokeHook("onAppComponentsRegistered", bootstrapper));
    }
    onAppBootstrapped(container) {
        return this._list.forEach(this._invokeHook("onAppBootstrapped", container));
    }

    _invokeHook(hook, ...args) {
        return (component) => {
            if (typeof component[hook] === "function") {
                return component[hook](...args);
            }
        };
    }
}
