module.exports = {
    entry: {
        "./examples/autocomplete/autocomplete.js": "./examples/autocomplete/autocomplete.ts"
    },
    output: {
        path: "",
        filename: "[name]"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}