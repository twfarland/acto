module.exports = {

    context: __dirname + "/src",
    entry: "./main.js",

    output: {
        filename: "sig.js",
        path: __dirname + "/dist",
    },

    module: {
        loaders: [{
            test: /\.js$/,
            loader: "babel",
            query: {
                presets: ['es2015']
            }
        }]
    }
}
