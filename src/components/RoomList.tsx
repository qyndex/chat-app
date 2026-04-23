import { Link } from 'react-router-dom';

const rooms = [
  { id: 'general', name: 'General' },
  { id: 'random', name: 'Random' },
  { id: 'tech', name: 'Tech Talk' },
];

export default function RoomList() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Rooms</h2>
      <nav className="space-y-1">
        {rooms.map((r) => (
          <Link key={r.id} to={`/room/${r.id}`} className="block py-2 px-3 rounded hover:bg-gray-700">
            # {r.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
