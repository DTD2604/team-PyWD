const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('join', room => {
        socket.join(room);
        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;

        if (numClients > 1) {
            io.to(socket.id).emit('ready');
        }
    });

    socket.on('offer', offer => {
        socket.to('room1').emit('offer', offer);
    });

    socket.on('answer', answer => {
        socket.to('room1').emit('answer', answer);
    });

    socket.on('candidate', candidate => {
        socket.to('room1').emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
<<<<<<< HEAD


// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const axios = require('axios');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static('public'));

// io.on('connection', (socket) => {
//     console.log('New client connected');

//     socket.on('frame', async (data) => {
//         try {
//             const response = await axios.post('http://localhost:5000/process_frame', data, {
//                 headers: { 'Content-Type': 'application/octet-stream' }
//             });
//             socket.emit('processed_frame', response.data);
//         } catch (error) {
//             console.error('Error processing frame:', error);
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// server.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });



=======
>>>>>>> 6e78306dbe3e420a7fd16ef56c928893e0f49209
