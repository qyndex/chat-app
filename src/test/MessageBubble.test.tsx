import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageBubble from '../components/MessageBubble';
import type { MessageWithProfile } from '../types/database';

const baseMessage: MessageWithProfile = {
  id: 'msg-1',
  text: 'Hello, world!',
  user_id: 'user-1',
  room_id: 'room-1',
  created_at: '2024-01-01T12:00:00Z',
  profiles: { username: 'alice', avatar_url: null },
};

describe('MessageBubble', () => {
  it('renders the message text', () => {
    render(<MessageBubble message={baseMessage} isOwnMessage={false} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders the sender name from profile', () => {
    render(<MessageBubble message={baseMessage} isOwnMessage={false} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('shows "Unknown" when profile is null', () => {
    const msg = { ...baseMessage, profiles: null };
    render(<MessageBubble message={msg} isOwnMessage={false} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders different senders independently', () => {
    const { rerender } = render(<MessageBubble message={baseMessage} isOwnMessage={false} />);
    expect(screen.getByText('alice')).toBeInTheDocument();

    rerender(
      <MessageBubble
        message={{ ...baseMessage, id: 'msg-2', profiles: { username: 'bob', avatar_url: null }, text: 'Hi there' }}
        isOwnMessage={false}
      />
    );
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders empty text gracefully', () => {
    render(<MessageBubble message={{ ...baseMessage, text: '' }} isOwnMessage={false} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('applies own-message styling when isOwnMessage is true', () => {
    const { container } = render(<MessageBubble message={baseMessage} isOwnMessage={true} />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('items-end');
  });

  it('applies other-message styling when isOwnMessage is false', () => {
    const { container } = render(<MessageBubble message={baseMessage} isOwnMessage={false} />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('items-start');
  });
});
