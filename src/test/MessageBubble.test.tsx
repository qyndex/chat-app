import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageBubble from '../components/MessageBubble';

const baseMessage = {
  id: 'msg-1',
  text: 'Hello, world!',
  sender: 'alice',
  timestamp: 1700000000000,
};

describe('MessageBubble', () => {
  it('renders the message text', () => {
    render(<MessageBubble message={baseMessage} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders the sender name', () => {
    render(<MessageBubble message={baseMessage} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('renders different senders independently', () => {
    const { rerender } = render(<MessageBubble message={baseMessage} />);
    expect(screen.getByText('alice')).toBeInTheDocument();

    rerender(
      <MessageBubble message={{ ...baseMessage, id: 'msg-2', sender: 'bob', text: 'Hi there' }} />
    );
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders empty text gracefully', () => {
    render(<MessageBubble message={{ ...baseMessage, text: '' }} />);
    // Sender should still render; no crash
    expect(screen.getByText('alice')).toBeInTheDocument();
  });
});
