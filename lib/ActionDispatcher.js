import Q from "q";

export default class ActionDispatcher {
    constructor(actionMap) {
        this._map = actionMap;
    }
    dispatch(name, ...actionArgs) {
        return Q.try(() => {
            var action = this._map[name];
            if (!action) {
                throw new Error("Action could not be dispatched: " + name);
            }
            var execAction = typeof action === "function" ? action : action.exec.bind(action);
            return execAction(...actionArgs);
        });
    }
}
