const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const socket = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')))

const server = http.createServer(app);
const io = socket(server, { log: false, origins: '*:*' });

app.use(express.json());
app.use('/users', require('./routes/userRouter'));

// const PORT = process.env.SERVER_PORT || 4000;
const PORT = 4000;
const users = {};
const socketToRoom = {};

io.on('connection', (skt) => {
  global.console.clear();
  skt.on('join room', (roomID) => {
    if (users[roomID]) {
      if (users[roomID].length >= 3) {
        skt.emit('room full');
        return;
      }
      users[roomID].push(skt.id);
    } else {
      users[roomID] = [skt.id];
    }
    socketToRoom[skt.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== skt.id);
    skt.emit('all users', usersInThisRoom);
  });

  skt.on('sending signal', (payload) => {
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  skt.on('returning signal', (payload) => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: skt.id });
  });

  skt.on('disconnect', () => {
    const roomID = socketToRoom[skt.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== skt.id);
      users[roomID] = room;
      users[roomID].forEach((user) => {
        io.to(user).emit('user disconnected', skt.id);
      });
    }
  });
});
mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}, (err) => {
  if (err) throw err;
  global.console.log('connected to mongoDB');
});

server.listen(PORT, () => global.console.log(`listening on port ${PORT}`));
