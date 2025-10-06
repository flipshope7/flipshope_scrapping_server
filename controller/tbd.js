const socketIo = require("socket.io");
const { server, app } = require("../index");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

let Myntra_cookie =
  "at=ZXlKcmFXUWlPaUl5SWl3aWRIbHdJam9pU2xkVUlpd2lZV3huSWpvaVVsTXlOVFlpZlEuZXlKemRXSWlPaUkzTTJSaFlUYzNOeTR6Tm1aa0xqUTRPVEl1T0dSak9TNDNZVFkxTnpVNVlUazVNelpFTWpOMmVHVktabkkySWl3aVlYQndUbUZ0WlNJNkltMTViblJ5WVNJc0ltbHpjeUk2SWtsRVJVRWlMQ0owYjJ0bGJsOTBlWEJsSWpvaVlYUWlMQ0p6ZEc5eVpVbGtJam9pTWpJNU55SXNJbXh6YVdRaU9pSTNNalkyTW1KaFpTMHdOalJtTFRRME1qa3RZVFkwWlMwek5tSXdZV1JoTVRBeE56SXRNVGMwTURneE1Ua3pOVEF3TXlJc0luQWlPaUl5TWprM0lpd2lZWFZrSWpvaWJYbHVkSEpoTFRBeVpEZGtaV00xTFRoaE1EQXROR00zTkMwNVkyWTNMVGxrTmpKa1ltVmhOV1UyTVNJc0luQndjeUk2TVRBc0ltTnBaSGdpT2lKdGVXNTBjbUV0TURKa04yUmxZelV0T0dFd01DMDBZemMwTFRsalpqY3RPV1EyTW1SaVpXRTFaVFl4SWl3aWMzVmlYM1I1Y0dVaU9qQXNJbk5qYjNCbElqb2lRa0ZUU1VNZ1VFOVNWRUZNSWl3aVpYaHdJam94TnpVeE5UTTVNemd5TENKdWFXUjRJam9pWWpSbE1HVTROell0WVRBeE9TMHhNV1ZtTFRnM05HUXRZMkU1TWpZek9EQXpOelkySWl3aWFXRjBJam94TnpVeE5UTTFOemd5TENKMWFXUjRJam9pTnpOa1lXRTNOemN1TXpabVpDNDBPRGt5TGpoa1l6a3VOMkUyTlRjMU9XRTVPVE0yUkRJemRuaGxTbVp5TmlKOS5RTHNneGtPZmdIY2VXUVRYcXltd2ZmN0hONVlwbU9tYnc5bWFGdHJYREN4dkxUNl83Z0FJbU14c0kwLWU1eFJVRXNUUzhNRGN5SWZrZlVtbXp0dkVoNHBlQnFrNDF3YzYzZEk0eTZELTBHTHlYMDY5RjQ5cU9OOFQ4aHBWSFc2YjAxS3h4QkpncVFNZkZPdmt0OVZSRkRObXJLbUhtaW1US3BPWXlBZDY4MGc=";
const io = socketIo(server, {
  path: "/tbd/scrap_socket/socket.io", // Add this line to set the path
  cors: {
    origin: "*", // This allows any origin, adjust according to your needs
    methods: ["GET", "POST"],
  },
});

let connectedClients = [];

const store_min_version_support = {
  1: 1,
  2: 3,
  3: 999,
  4: 2,
  5: 2,
  6: 2,
  7: 2,
  8: 2,
  9: 4,
  10: 2,
  11: 2,
  12: 2,
  13: 2,
  14: 999,
  15: 5,
  16: 2,
  17: 999,
  18: 999,
  19: 999,
  20: 999,
};

io.on("connection", (socket) => {
  const version = socket.handshake?.query?.version || 1;
  console.log(`connected Client: ${socket.id} && version: ${version}`);
  console.log("A client connected:", socket.id);
  socket.version = version;
  connectedClients.push(socket);
  // if(!connectedClients_wv.version) connectedClients_wv.version = [];
  // connectedClients_wv.version.push(socket);
  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
    connectedClients = connectedClients.filter((s) => s.id !== socket.id);
  });

  socket.on("response", (data) => {
    // console.log(data);
    if (data && data.status == "success") console.log(data.data);
  });

  socket.on(`response_myncookie`, (data) => {
    Myntra_cookie = data;
    console.log("Myntra_cookie changed to: ", Myntra_cookie);
  });
});

// Function to send a message to a random client
// function sendMessageToRandomClient(message) {
//     if (connectedClients.length === 0) {
//         console.log('No connected clients');
//         return;
//     }
//     const randomClient = connectedClients[Math.floor(Math.random() * connectedClients.length)];
//     randomClient.emit('message', message);
// }

// Example: Send a message to a random client every 5 seconds
//setInterval(() => {
//    sendMessageToRandomClient({sid:1,pid:'PRNG8RM85CUZHD2E'});
//}, 5000);

app.get("/tbd/scrap_socket/getData", (req, res) => {
  const sid = req.query.sid;
  const pid = req.query.pid;

  if (!sid || !pid) {
    return res.status(400).json({ error: "Both sid and pid are required." });
  }
  let min_supp_v = store_min_version_support[sid];
  if (!connectedClients.length) {
    return res.json({ error: "No clients connected" });
  }
  let connectedEligibleClients = connectedClients.filter(
    (s) => s.version >= min_supp_v
  );
  if (!connectedEligibleClients.length) {
    return res.json({ error: "No supported clients connected" });
  }
  const randomClientIndex = Math.floor(
    Math.random() * connectedEligibleClients.length
  );
  const clientSocket = connectedEligibleClients[randomClientIndex];
  const requestId = uuidv4(); // uidv4(); // Generate a unique request ID

  //const clientSocket = connectedClients[0]; // select a client, modify as necessary
  if (sid == 7)
    clientSocket.emit("requestData", {
      sid,
      pid,
      cookie: Myntra_cookie,
      requestId,
    });
  else clientSocket.emit("requestData", { sid, pid, requestId });

  // Use a timeout for the client to respond, adjust as needed
  const timeout = setTimeout(() => {
    clientSocket.removeAllListeners(`response_${sid}_${pid}`);
    res.json({ error: "Client did not respond in time" });
  }, 7000); // 5 seconds timeout

  // Waiting for the client's response
  //   console.log(`response_${sid}_${pid}`, "response_${sid}_${pid}");
  clientSocket.once(`response_${sid}_${pid}`, (data) => {
    try {
      clearTimeout(timeout);
      clientSocket.removeAllListeners(`response_${sid}_${pid}`);
      res.json(data);
    } catch (e) {}
  });
});

app.get("/tbd/scrap_socket/client", (req, res) => {
  // res.sendFile(path.join(__dirname, 'public', 'client.html'));
  client_ids = connectedClients.map((client) => {
    const ip =
      client.handshake.headers["x-forwarded-for"] || client.handshake.address;
    console.log(ip);
    return { [client.id]: ip };
  });
  console.log(JSON.stringify(client_ids));
  res.json({ total: connectedClients.length, client_ids });
});
app.get("/tbd/scrap_socket/start_client", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "client.html"));
  // client_ids = connectedClients.map(client => client.id);
  // res.json({total: connectedClients.length, list: JSON.stringify(client_ids) });
});
