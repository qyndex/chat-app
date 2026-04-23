import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

io.on('connection', (socket) => {
  socket.on('join', (room: string) => socket.join(room));
  socket.on('leave', (room: string) => socket.leave(room));
  socket.on('message', (data: { roomId: string; text: string }) => {
    io.to(data.roomId).emit('message', {
      id: crypto.randomUUID(),
      text: data.text,
      sender: socket.id,
      timestamp: Date.now(),
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => { /* server running */ });
