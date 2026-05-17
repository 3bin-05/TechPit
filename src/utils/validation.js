import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Invalid kernel identity (email).'),
  password: z.string().min(6, 'Access Key must be at least 6 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username too long.').regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscores only.').optional(),
});

export const roomSchema = z.object({
  topic: z.string().min(10, 'Topic must be at least 10 characters.').max(120, 'Topic truncated at 120 characters.').trim(),
  category: z.enum(['Security', 'Languages', 'AI', 'OS', 'Web', 'Hardware']),
  position: z.enum(['PRO', 'CON']),
  timeLimit: z.enum(['15', '30', '60']),
  roomType: z.enum(['FREEFLOW', 'ROUNDS']),
  maxParticipants: z.enum(['10', '20', '50']),
});

export const messageSchema = z.object({
  text: z.string().min(1, 'Cannot send empty data.').max(1000, 'Data packet too large.').trim(),
});
