interface Message { id: string; text: string; sender: string; timestamp: number }

interface Props { message: Message }

export default function MessageBubble({ message }: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{message.sender}</span>
      <div className="bg-blue-100 rounded-lg px-4 py-2 max-w-xs">
        <p>{message.text}</p>
      </div>
    </div>
  );
}
