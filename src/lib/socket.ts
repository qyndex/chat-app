import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

const URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const socket: Socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
});

/**
 * Connect the socket with the current user's JWT for server-side identity
 * validation. Call this after auth state is confirmed.
 */
export async function connectSocket(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    socket.auth = { token: session.access_token };
    socket.connect();
  }
}

export function disconnectSocket(): void {
  socket.disconnect();
}
