import App from "./App";
import ProvidedAppDelegate from "./ProvidedAppDelegate";

export default [new App.Components(), new App.Config(), new ProvidedAppDelegate()];

export function defaultsWithDelegate(delegate) {
    return [new App.Components(), new App.Config(), delegate];
}

export function defaultsWith(delegateHooks) {
    return defaultsWithDelegate(new ProvidedAppDelegate(delegateHooks));
}
