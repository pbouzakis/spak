export function inject(...args) {
    return (target) => {
        target.inject = args; // Provide IOC framework with a place to find out what to inject.
    };
}
