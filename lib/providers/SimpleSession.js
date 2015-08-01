export default class SimpleSession {
    constructor() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
    }

    start(token, user) {
        this.token = token;
        this.user = user;
    }

    end() {
        this.token = null;
        this.user = null;
    }
}
