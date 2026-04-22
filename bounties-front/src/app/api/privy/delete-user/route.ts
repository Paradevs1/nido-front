import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Verifica o token JWT e retorna o payload.
 * Requer JWT_SECRET configurado; fallback faz decode basico (migracao).
 */
async function verifyCallerToken(request: NextRequest): Promise<{ role?: string; id?: string; sub?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('bounties_token')?.value;

  if (!token) return null;

  const secret = getJwtSecret();

  if (secret) {
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload as { role?: string; id?: string; sub?: string };
    } catch {
      return null;
    }
  }

  // Fallback legado (remover quando JWT_SECRET estiver em todos os ambientes)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticacao e autorizacao
    const caller = await verifyCallerToken(request);

    if (!caller) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Apenas admin pode deletar usuarios
    const callerRole = caller.role?.toLowerCase();
    if (callerRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: admin role required' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const basicAuth = Buffer.from(`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`).toString('base64');

    const response = await fetch(
      `https://api.privy.io/v1/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
        },
      }
    );

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    if (response.status === 404) {
      return NextResponse.json({
        success: true,
        message: 'User already deleted or not found'
      });
    }

    const errorData = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        error: errorData.message || 'Failed to delete user from Privy',
        status: response.status
      },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
