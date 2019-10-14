const presets = [
    "@babel/preset-typescript",
    [
        "@babel/env",
        {
            targets: {
                ie: "8",
            }
        },
    ]
];

module.exports = { presets };
