const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const PORT = 3030;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = { server, app }; // 👈 export the server

require("./controller/tbd");
require("./controller/extensions");
