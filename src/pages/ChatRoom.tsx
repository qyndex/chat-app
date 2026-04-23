import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';
import { socket } from '../lib/socket';

interface Message { id: string; text: string; sender: string; timestamp: number }

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.emit('join', roomId);
    socket.on('message', (msg: Message) => setMessages((prev) => [...prev, msg]));
    return () => { socket.off('message'); socket.emit('leave', roomId); };
  }, [roomId]);

  const send = (): void => {
    if (!input.trim()) return;
    socket.emit('message', { roomId, text: input });
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="flex-1 border rounded p-2" placeholder="Type a message..." />
        <button onClick={send} className="bg-blue-600 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
}
