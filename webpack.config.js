
const fullBuild = {
    entry: "./src/index.ts",
    output: {
        path: __dirname + "/dst",
        filename: "avSearch.min.js",
        libraryTarget: "window"
    },
    resolve: {
        extensions: [".ts"]
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: "ts-loader" }
        ]
    },
};


module.exports = [fullBuild];
