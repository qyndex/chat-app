import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ChatRoom from '../pages/ChatRoom';
import { socket } from '../lib/socket';

// socket is already mocked in setup.ts; cast for convenience
const mockSocket = socket as {
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

function renderChatRoom(roomId = 'general') {
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
  });

  it('renders the message input', () => {
    renderChatRoom();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  it('renders the Send button', () => {
    renderChatRoom();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('emits join event on mount with the correct room id', () => {
    renderChatRoom('tech');
    expect(mockSocket.emit).toHaveBeenCalledWith('join', 'tech');
  });

  it('emits message event when Send is clicked with non-empty input', () => {
    renderChatRoom();
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello!' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      roomId: 'general',
      text: 'Hello!',
    });
  });

  it('clears input after sending', () => {
    renderChatRoom();
    const input = screen.getByPlaceholderText(/type a message/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(input.value).toBe('');
  });

  it('does not emit message for blank input', () => {
    renderChatRoom();
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    // Only the join emit should have been called, not a message emit
    const messageCalls = mockSocket.emit.mock.calls.filter(
      ([event]) => event === 'message'
    );
    expect(messageCalls).toHaveLength(0);
  });

  it('sends message on Enter key press', () => {
    renderChatRoom();
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Enter test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      roomId: 'general',
      text: 'Enter test',
    });
  });

  it('registers a message listener on mount', () => {
    renderChatRoom();
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
