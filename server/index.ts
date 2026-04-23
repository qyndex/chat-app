import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Supabase server client
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Prefer service role key for server-side operations; fall back to anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

if (!supabaseUrl) {
  console.warn('SUPABASE_URL is not set — database persistence disabled.');
}

// ---------------------------------------------------------------------------
// Express + Socket.io setup
// ---------------------------------------------------------------------------
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

// ---------------------------------------------------------------------------
// Middleware: authenticate socket connections via JWT
// ---------------------------------------------------------------------------
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token || !supabaseUrl) {
    // Allow unauthenticated connections when Supabase is not configured
    // (for local development / testing without a DB)
    socket.data.userId = null;
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return next(new Error('Authentication failed'));
    }
    socket.data.userId = user.id;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

// ---------------------------------------------------------------------------
// Socket event handlers
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  // Join a room — send last 50 messages from DB
  socket.on('join', async (payload: { roomId: string; token?: string } | string) => {
    const roomId = typeof payload === 'string' ? payload : payload.roomId;
    socket.join(roomId);

    if (!supabaseUrl) return;

    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messages) {
        socket.emit('history', messages);
      }
    } catch (err) {
      console.error('Failed to fetch message history:', err);
    }
  });

  socket.on('leave', (room: string) => socket.leave(room));

  // Receive a message — persist to DB then broadcast
  socket.on('message', async (data: { roomId: string; message?: Record<string, unknown>; text?: string }) => {
    const { roomId } = data;
    const userId = socket.data.userId;

    // If the client already persisted the message (via Supabase client SDK),
    // just broadcast it to other clients in the room.
    if (data.message) {
      socket.to(roomId).emit('message', data.message);
      return;
    }

    // Fallback: server-side persistence (for clients that send raw text)
    if (!data.text) return;

    if (supabaseUrl && userId) {
      try {
        const { data: inserted, error } = await supabase
          .from('messages')
          .insert({ room_id: roomId, user_id: userId, text: data.text })
          .select('*, profiles(username, avatar_url)')
          .single();

        if (error) {
          console.error('Failed to persist message:', error.message);
          return;
        }

        io.to(roomId).emit('message', inserted);
      } catch (err) {
        console.error('Failed to persist message:', err);
      }
    } else {
      // No DB — broadcast in-memory only (development fallback)
      io.to(roomId).emit('message', {
        id: crypto.randomUUID(),
        text: data.text,
        user_id: userId ?? socket.id,
        room_id: roomId,
        created_at: new Date().toISOString(),
        profiles: null,
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
