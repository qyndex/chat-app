import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RoomList from '../components/RoomList';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <RoomList />
    </MemoryRouter>
  );
}

describe('RoomList', () => {
  it('renders the "Rooms" heading', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /rooms/i })).toBeInTheDocument();
  });

  it('renders all three default rooms', () => {
    renderWithRouter();
    expect(screen.getByRole('link', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /random/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tech talk/i })).toBeInTheDocument();
  });

  it('each room link points to the correct route', () => {
    renderWithRouter();
    expect(screen.getByRole('link', { name: /general/i })).toHaveAttribute(
      'href',
      '/room/general'
    );
    expect(screen.getByRole('link', { name: /tech talk/i })).toHaveAttribute(
      'href',
      '/room/tech'
    );
  });

  it('renders room names prefixed with #', () => {
    renderWithRouter();
    // Links contain "# General" etc.
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
    links.forEach((link) => {
      expect(link.textContent).toMatch(/^#\s/);
    });
  });
});
