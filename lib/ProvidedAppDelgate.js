import AppDelegate from "./AppDelegate";
import SimpleSession from "./providers/SimpleSession";
import NullLogger from "./providers/NullLogger";
import KeyWordLocalization from "./providers/KeyWordLocalization";

// App Delegate is intended for prototype and unit tests as it provides
// the app with defaults.

export default class ProvidedAppDelegate extends AppDelegate {
    provideSession() {
        return new SimpleSession();
    }
    provideLogger() {
        return new NullLogger();
    }
    provideLocalize() {
        return new KeyWordLocalization();
    }
    handleUncaughtError() {
        this.logger.error("Uncaught Error!");
    }
    handleRestart() {
        this.logger.warn("Restart app.");
    }
}
