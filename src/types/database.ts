/** Database row types matching the Supabase schema. */

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

/** Message joined with the sender's profile. */
export interface MessageWithProfile extends Message {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
}
