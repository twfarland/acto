module.exports = {

    context: __dirname + "/test",
    entry: "./es6.js",

    output: {
        filename: "es5.js",
        path: __dirname + "/test",
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
