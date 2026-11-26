const liveServer = require("live-server");
const path = require("path");

const params = {
    port: 3000,
    host: "127.0.0.1",
    root: __dirname,
    open: true,
    file: "index.html",
    wait: 500,
    logLevel: 2
};

console.log("Serving frontend from:", __dirname);
liveServer.start(params);
