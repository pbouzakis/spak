"use strict";

import Q from "q";

export default function PluginBroker() {
    var handlersByType = {
        startup: [],
        accountAvailable: []
    };

    function chainAndRunHandlers(handlers) {
        var chainPromise = (prevPromise, handler) => {
            return prevPromise.then((prevValue) => Q.when(handler(prevValue)));
        };

        handlers.reduce(chainPromise, Q.resolve())
            .catch(e => console.error(e))
            .done();
    }

    this.register = (type, handler) => {
        handlersByType[type].push(handler);
        return this;
    };

    // HOOKS //////////////////////

    this.onStartup = (isAccountAvailable) => {
        var handlers = handlersByType.startup;
        var accountAvailableHandlers = handlersByType.accountAvailable;

        // If user account exists, `accountAvailable` was already published by account service
        // So we need to add these handlers to the startup.
        if (isAccountAvailable) {
            handlers = handlers.concat(accountAvailableHandlers);
        }

        chainAndRunHandlers(handlers);
    };

    this.onAccountAvailable = () => chainAndRunHandlers(handlersByType.accountAvailable);
}

