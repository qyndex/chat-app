-- Seed data for development
-- Run after migrations: supabase db seed
-- Seed is idempotent — safe to run multiple times.

-- ----------------------------------------------------------------
-- Default rooms
-- ----------------------------------------------------------------
INSERT INTO public.rooms (id, name, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'General',   'General discussion for everyone'),
  ('a0000000-0000-0000-0000-000000000002', 'Random',    'Off-topic conversations and fun'),
  ('a0000000-0000-0000-0000-000000000003', 'Tech Talk', 'Technical discussions, code reviews, and debugging')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Sample messages (require auth users to exist first)
-- ----------------------------------------------------------------
-- NOTE: Create test users via Supabase Studio > Authentication first:
--   alice@example.com / password123
--   bob@example.com   / password123
-- Then uncomment the messages below.

-- INSERT INTO public.messages (room_id, user_id, text, created_at) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<alice-uuid>', 'Welcome to the General channel!', NOW() - INTERVAL '2 hours'),
--   ('a0000000-0000-0000-0000-000000000001', '<bob-uuid>',   'Thanks! Glad to be here.', NOW() - INTERVAL '1 hour'),
--   ('a0000000-0000-0000-0000-000000000001', '<alice-uuid>', 'Feel free to discuss anything.', NOW() - INTERVAL '30 minutes'),
--   ('a0000000-0000-0000-0000-000000000002', '<bob-uuid>',   'Anyone seen any good movies lately?', NOW() - INTERVAL '45 minutes'),
--   ('a0000000-0000-0000-0000-000000000002', '<alice-uuid>', 'I just watched Dune Part Two -- highly recommend!', NOW() - INTERVAL '40 minutes'),
--   ('a0000000-0000-0000-0000-000000000003', '<alice-uuid>', 'What is everyone using for state management these days?', NOW() - INTERVAL '3 hours'),
--   ('a0000000-0000-0000-0000-000000000003', '<bob-uuid>',   'Zustand for UI state, TanStack Query for server state.', NOW() - INTERVAL '2 hours 30 minutes');

SELECT 'Seed complete: 3 rooms created. Uncomment message INSERTs after creating auth users.' AS notice;
