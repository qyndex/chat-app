import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ChatRoom from '../pages/ChatRoom';
import { socket } from '../lib/socket';
import { supabase } from '../lib/supabase';

// socket is already mocked in setup.ts; cast for convenience
const mockSocket = socket as {
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

// supabase is already mocked in setup.ts; cast for convenience
const mockSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
};

function renderChatRoom(roomId = 'room-1') {
  return render(
    <MemoryRouter initialEntries={[`/room/${roomId}`]}>
      <Routes>
        <Route path="/room/:roomId" element={<ChatRoom />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ChatRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: return empty messages
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('renders the message input', () => {
    renderChatRoom();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  it('renders the Send button', () => {
    renderChatRoom();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('emits join event on mount with room id and token', () => {
    renderChatRoom('room-2');
    expect(mockSocket.emit).toHaveBeenCalledWith('join', {
      roomId: 'room-2',
      token: 'test-user-id',
    });
  });

  it('clears input after sending', async () => {
    // Mock the insert chain for sending
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-msg',
              text: 'Hi',
              user_id: 'test-user-id',
              room_id: 'room-1',
              created_at: new Date().toISOString(),
              profiles: { username: 'test', avatar_url: null },
            },
            error: null,
          }),
        }),
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    renderChatRoom();
    const input = screen.getByPlaceholderText(/type a message/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    // Input clears immediately on send
    expect(input.value).toBe('');
  });

  it('does not send for blank input', () => {
    renderChatRoom();
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    // Only the join emit should have been called, not a message emit
    const messageCalls = mockSocket.emit.mock.calls.filter(
      ([event]: [string]) => event === 'message'
    );
    expect(messageCalls).toHaveLength(0);
  });

  it('registers a message listener on mount', () => {
    renderChatRoom();
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('fetches messages from Supabase on mount', () => {
    renderChatRoom();
    expect(mockSupabase.from).toHaveBeenCalledWith('messages');
  });

  it('shows loading state initially', () => {
    renderChatRoom();
    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });

  it('shows empty state when no messages', async () => {
    renderChatRoom();
    expect(await screen.findByText(/no messages yet/i)).toBeInTheDocument();
  });
});
