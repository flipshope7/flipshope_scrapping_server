const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    path: '/scrap_socket/socket.io',  // Add this line to set the path
    cors: {
        origin: "*",  // This allows any origin, adjust according to your needs
        methods: ["GET", "POST"]
    }
});

const PORT = 3030;

let connectedClients = [];

const store_min_version_support = {
    1:1,
    2:2,
    3:999,
    4:2,
    5:2,
    6:2,
    7:2,
    8:2,
    9:2,
    10:2,
    11:2,
    12:2,
    13:2,
    14:999,
    15:999,
    16:2,
    17:999,
    18:999,
    19:999,
    20:999,
}

io.on('connection', (socket) => {

    const version = socket.handshake?.query?.version || 1;
    console.log(`Client: ${socket.id} && version: ${version}`);
    // console.log('A client connected:', socket.id);
    socket.version = version;
    connectedClients.push(socket);
    // if(!connectedClients_wv.version) connectedClients_wv.version = [];
    // connectedClients_wv.version.push(socket);
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        connectedClients = connectedClients.filter(s => s.id !== socket.id);

    });

    socket.on('response', (data) => {
        console.log(data);
        if(data && data.status =='success') console.log(data.data);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
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


app.get('/scrap_socket/getData', (req, res) => {
    const sid = req.query.sid;
    const pid = req.query.pid;

    if (!sid || !pid) {
        return res.status(400).json({ error: 'Both sid and pid are required.' });
    }
    let min_supp_v = store_min_version_support[sid];
    if (!connectedClients.length) {
        return res.json({ error: 'No clients connected' });
    }
    let connectedEligibleClients = connectedClients.filter(s => s.version >= min_supp_v);
    if (!connectedEligibleClients.length) {
        return res.json({ error: 'No supported clients connected' });
    }
    const randomClientIndex = Math.floor(Math.random() * connectedEligibleClients.length);
    const clientSocket = connectedEligibleClients[randomClientIndex];
    const requestId = 1234; // uidv4(); // Generate a unique request ID

    //const clientSocket = connectedClients[0]; // select a client, modify as necessary
    clientSocket.emit('requestData', { sid, pid, requestId });

    // Use a timeout for the client to respond, adjust as needed
    const timeout = setTimeout(() => {
        res.json({ error: 'Client did not respond in time' });
    }, 7000); // 5 seconds timeout

    // Waiting for the client's response
    console.log(`response_${sid}_${pid}`,'response_${sid}_${pid}');
    clientSocket.on(`response_${sid}_${pid}`, (data) => {
        try{
            clearTimeout(timeout);
            res.json(data);
        }
        catch(e){}
    });
});
