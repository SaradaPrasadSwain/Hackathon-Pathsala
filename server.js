const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/auth/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'login.html'));
});

app.get('/auth/signUp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'signUp.html'));
});

app.get('/videocall.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videocall.html'));
});

const rooms = new Map();

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        // If room exists and has other users, notify them
        if (rooms.has(roomId)) {
            socket.to(roomId).emit('user-connected');
        }
        
        // Add user to room
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        // Handle signaling
        socket.on('offer', (data) => {
            socket.to(data.roomId).emit('offer', data);
        });

        socket.on('answer', (data) => {
            socket.to(data.roomId).emit('answer', data);
        });

        socket.on('ice-candidate', (data) => {
            socket.to(data.roomId).emit('ice-candidate', data);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (rooms.has(roomId)) {
                rooms.get(roomId).delete(socket.id);
                if (rooms.get(roomId).size === 0) {
                    rooms.delete(roomId);
                }
            }
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
