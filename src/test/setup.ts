import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock socket.io-client so tests never open real WebSocket connections
vi.mock('../lib/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));
