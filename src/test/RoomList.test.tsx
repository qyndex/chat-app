import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RoomList from '../components/RoomList';
import { supabase } from '../lib/supabase';

// Get the mocked supabase for test configuration
const mockSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
};

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <RoomList />
    </MemoryRouter>
  );
}

describe('RoomList', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: return 3 rooms
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'r1', name: 'General', description: null, created_by: null, created_at: '2024-01-01T00:00:00Z' },
          { id: 'r2', name: 'Random', description: null, created_by: null, created_at: '2024-01-01T00:00:00Z' },
          { id: 'r3', name: 'Tech Talk', description: null, created_by: null, created_at: '2024-01-01T00:00:00Z' },
        ],
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('renders the "Rooms" heading', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /rooms/i })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText(/loading rooms/i)).toBeInTheDocument();
  });

  it('renders all three rooms after loading', async () => {
    renderWithRouter();
    expect(await screen.findByRole('link', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /random/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tech talk/i })).toBeInTheDocument();
  });

  it('renders room names prefixed with #', async () => {
    renderWithRouter();
    await screen.findByRole('link', { name: /general/i });
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link.textContent).toMatch(/^#\s/);
    });
  });

  it('shows sign out button for authenticated user', () => {
    renderWithRouter();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('shows error message on fetch failure', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    renderWithRouter();
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});
