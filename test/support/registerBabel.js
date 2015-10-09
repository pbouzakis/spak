var register = require("babel/register");

register({
    ignore: /node_modules(?:\/|\\)(?!@yuzu)/,
    optional: ["es7.decorators"] // If you're using decorators, you'll need this too.
});
