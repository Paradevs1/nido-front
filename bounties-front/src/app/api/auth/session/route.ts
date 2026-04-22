import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

function getSecret() {
  if (!JWT_SECRET) return null;
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Valida formato basico do JWT (3 partes, payload decodificavel, nao expirado).
 * Usado como fallback quando JWT_SECRET nao esta configurado.
 */
function isValidJwtFormat(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/auth/session
 * Recebe o token no body e seta como cookie httpOnly.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validar o token antes de setar o cookie
    const secret = getSecret();
    if (secret) {
      // Caminho seguro: validar assinatura
      try {
        await jwtVerify(token, secret);
      } catch {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } else {
      // Fallback: validar apenas formato (remover quando JWT_SECRET estiver em todos os ambientes)
      if (!isValidJwtFormat(token)) {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }
    }

    const response = NextResponse.json({ success: true });

    // Cookie httpOnly, Secure, SameSite=Strict
    response.cookies.set('bounties_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Remove o cookie httpOnly (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('bounties_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('auth_user', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
