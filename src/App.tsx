import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomList from './components/RoomList';
import ChatRoom from './pages/ChatRoom';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <RoomList />
        <Routes>
          <Route path="/room/:roomId" element={<ChatRoom />} />
          <Route path="/" element={<div className="flex-1 flex items-center justify-center text-gray-400">Select a room</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
