import type { MessageWithProfile } from '../types/database';

interface Props {
  message: MessageWithProfile;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: Props) {
  const senderName = message.profiles?.username ?? 'Unknown';
  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className="text-xs font-medium text-gray-400">{senderName}</span>
        <span className="text-xs text-gray-500">{timestamp}</span>
      </div>
      <div
        className={`rounded-lg px-4 py-2 max-w-md ${
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        <p className="break-words">{message.text}</p>
      </div>
    </div>
  );
}
