import App from "./App";
import ProvidedAppDelegate from "./ProvidedAppDelegate";

export default [new App.Components(), new App.Config(), new ProvidedAppDelegate()];

export function defaultsWith(delegateHooks) {
    return [new App.Components(), new App.Config(), new ProvidedAppDelegate(delegateHooks)];
}

