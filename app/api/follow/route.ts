import { type User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

const jsonResponse = (payload: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

class APIError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

async function getAuthenticatedUser(request: Request): Promise<User> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new APIError('Nicht authentifiziert', 401);
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    throw new APIError('Ungültiger Auth-Header', 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new APIError('Ungültiges Token', 401);
  }

  return user;
}

async function parseFollowTarget(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const followingId = typeof body.followingId === 'string' ? body.followingId.trim() : '';
    return followingId || null;
  } catch (error) {
    return null;
  }
}

async function handleFollow(request: Request, action: 'follow' | 'unfollow') {
  try {
    const user = await getAuthenticatedUser(request);

    const targetUserId = await parseFollowTarget(request);
    if (!targetUserId) {
      return jsonResponse({ error: 'Kein Ziel angegeben' }, 400);
    }

    if (targetUserId === user.id) {
      return jsonResponse({ error: 'Du kannst dir selbst nicht folgen' }, 400);
    }

    if (action === 'follow') {
      const { error } = await supabase
        .from('follows')
        .upsert(
          { follower_id: user.id, following_id: targetUserId },
          { onConflict: 'follower_id,following_id' }
        );

      if (error) {
        console.error('Follow API insert error:', error);
        return jsonResponse({ error: 'Folgen fehlgeschlagen' }, 500);
      }

      return jsonResponse({ success: true, following: true });
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) {
      console.error('Follow API delete error:', error);
      return jsonResponse({ error: 'Entfolgen fehlgeschlagen' }, 500);
    }

    return jsonResponse({ success: true, following: false });
  } catch (error) {
    if (error instanceof APIError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    console.error('Follow API error:', error);
    return jsonResponse({ error: 'Interner Server-Fehler' }, 500);
  }
}

export async function POST(request: Request) {
  return handleFollow(request, 'follow');
}

export async function DELETE(request: Request) {
  return handleFollow(request, 'unfollow');
}

export default async function handler(request: Request) {
  if (request.method === 'POST') return POST(request);
  if (request.method === 'DELETE') return DELETE(request);
  return new Response('Methode nicht erlaubt', { status: 405 });
}
