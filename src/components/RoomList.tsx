import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';
import type { Room } from '../types/database';

export default function RoomList() {
  const { user, signOut } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRooms(data ?? []);
      }
      setLoading(false);
    }

    fetchRooms();
  }, []);

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col" aria-label="Room list">
      <h2 className="text-lg font-bold mb-4">Rooms</h2>

      {loading && (
        <p className="text-gray-400 text-sm" aria-live="polite">Loading rooms...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm" role="alert">{error}</p>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p className="text-gray-400 text-sm">No rooms yet.</p>
      )}

      <nav className="space-y-1 flex-1">
        {rooms.map((r) => (
          <Link
            key={r.id}
            to={`/room/${r.id}`}
            className="block py-2 px-3 rounded hover:bg-gray-700"
          >
            # {r.name}
          </Link>
        ))}
      </nav>

      {user && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 truncate mb-2" title={user.email}>
            {user.email}
          </p>
          <button
            onClick={signOut}
            className="w-full text-sm text-gray-400 hover:text-white py-1 px-3 rounded hover:bg-gray-700 transition-colors"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
