import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';
import { socket } from '../lib/socket';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';
import type { MessageWithProfile } from '../types/database';

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load message history from Supabase on mount / room change
  useEffect(() => {
    if (!roomId) return;

    async function fetchMessages() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setMessages((data as MessageWithProfile[]) ?? []);
      }
      setLoading(false);
    }

    fetchMessages();
  }, [roomId]);

  // Socket.io: join room, listen for new messages
  useEffect(() => {
    if (!roomId || !user) return;

    socket.emit('join', { roomId, token: user.id });

    const handleMessage = (msg: MessageWithProfile) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
      socket.emit('leave', roomId);
    };
  }, [roomId, user]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (): Promise<void> => {
    if (!input.trim() || !roomId || !user) return;

    const text = input.trim();
    setInput('');

    // Persist to Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: user.id, text })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // Broadcast via socket to other clients in the room
    socket.emit('message', { roomId, message: inserted });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Message area */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading && (
          <p className="text-gray-400 text-center" aria-live="polite">Loading messages...</p>
        )}
        {error && (
          <p className="text-red-400 text-center" role="alert">{error}</p>
        )}
        {!loading && !error && messages.length === 0 && (
          <p className="text-gray-500 text-center">No messages yet. Say something!</p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwnMessage={m.user_id === user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700 p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1 border border-gray-600 bg-gray-800 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          aria-label="Message input"
        />
        <button
          onClick={send}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded transition-colors"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
