import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtPayloadSaysHostInactive } from '@/lib/auth/hostAccountStatus';

const DOCS_SUBPATH = /^\/(overview|protocolo|para-empresas|seguranca)(\/|$)/;

const LEGACY_HOSTS = new Set(['bounties.work', 'www.bounties.work']);
const LEGACY_REDIRECT_PATH = '/redirect-to-nido';

function isAllowedLegacyPath(pathname: string): boolean {
  // Allow only what the redirect page needs to render
  if (pathname === LEGACY_REDIRECT_PATH || pathname === '/') return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/assets')) return true;
  if (pathname === '/favicon.ico') return true;
  if (pathname === '/robots.txt') return true;
  if (pathname === '/sitemap.xml') return true;
  return false;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verifica e decodifica o JWT com validacao de assinatura via jose.
 * Fallback: se JWT_SECRET nao estiver configurado, faz apenas decode basico
 * (para nao quebrar ambientes legados durante a migracao).
 */
async function verifyToken(token: string): Promise<{
  role?: string;
  exp?: number;
  registerCompleted?: boolean;
  status?: string;
} | null> {
  const secret = getJwtSecret();

  if (secret) {
    // Caminho seguro: validar assinatura
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload as { role?: string; exp?: number; registerCompleted?: boolean; status?: string };
    } catch {
      return null; // Token invalido ou expirado
    }
  }

  // Fallback legado: decode sem validacao (remover quando JWT_SECRET estiver em todos os ambientes)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forwardedHost = request.headers.get('x-forwarded-host') ?? '';
  const hostHeader = forwardedHost || request.headers.get('host') || '';
  // Normalize:
  // - prefer x-forwarded-host on edge/proxies
  // - strip multiple hosts (comma-separated)
  // - lowercase
  // - strip port (":443")
  // - strip trailing dot ("example.com.")
  const host = hostHeader
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .split(':')[0];

  // --- Legacy host guard (bounties.work) ---
  // Nothing should work under bounties.work (including /api/*). Always show a friendly
  // redirect notice page, and let it navigate to https://nido.global afterwards.
  if (LEGACY_HOSTS.has(host)) {
    if (!isAllowedLegacyPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = LEGACY_REDIRECT_PATH;
      url.searchParams.set('from', pathname + request.nextUrl.search);
      return NextResponse.rewrite(url);
    }

    // Root should also render the redirect notice page.
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL(LEGACY_REDIRECT_PATH, request.url));
    }
  }

  // Subdomínio `docs.*`: servir docs na raiz (sem /docs na URL)
  if (host.startsWith('docs.')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/docs', request.url));
    }
    if (DOCS_SUBPATH.test(pathname)) {
      return NextResponse.rewrite(new URL(`/docs${pathname}`, request.url));
    }
  }

  // --- Protecao /host/* ---
  if (pathname.startsWith('/host')) {
    const token = request.cookies.get('bounties_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Token invalido ou expirado
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('bounties_token');
      response.cookies.delete('auth_user');
      return response;
    }

    // Verificar se o usuário é um HOST
    if (payload.role !== 'HOST') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const pendingPath = '/host/pending-activation';

    let authUser: { registerCompleted?: boolean } | null = null;
    const userDataString = request.cookies.get('auth_user')?.value;
    if (userDataString) {
      try {
        authUser = JSON.parse(decodeURIComponent(userDataString));
      } catch {
        authUser = null;
      }
    }

    const registrationDone =
      payload.registerCompleted === true || authUser?.registerCompleted === true;

    // Host inactive (admin approval): só pending DEPOIS do perfil (part two) concluído
    if (jwtPayloadSaysHostInactive(payload)) {
      if (!registrationDone) {
        if (pathname !== '/host/create') {
          return NextResponse.redirect(new URL('/host/create', request.url));
        }
        return NextResponse.next();
      }
      if (pathname === '/host/create') {
        return NextResponse.redirect(new URL(pendingPath, request.url));
      }
      if (!pathname.startsWith(pendingPath)) {
        return NextResponse.redirect(new URL(pendingPath, request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith(pendingPath)) {
      let to = '/host/campaign';
      if (authUser && authUser.registerCompleted === false) {
        to = '/host/create';
      }
      return NextResponse.redirect(new URL(to, request.url));
    }

    // Verificar se o usuario completou o registro
    if (authUser) {
      if (authUser.registerCompleted === false && pathname !== '/host/create') {
        return NextResponse.redirect(new URL('/host/create', request.url));
      }

      if (authUser.registerCompleted === true && pathname === '/host/create') {
        return NextResponse.redirect(new URL('/host/campaign', request.url));
      }
    }
  }

  // Legado: rota dedicada removida — mesmo login do company (modal na home)
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Protecao /admin/* ---
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('bounties_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('bounties_token');
      response.cookies.delete('auth_user');
      return response;
    }

    // Apenas admin pode acessar /admin/*
    if (payload.role !== 'ADMIN' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- Protecao /creator/* ---
  if (pathname.startsWith('/creator')) {
    const token = request.cookies.get('bounties_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('bounties_token');
      response.cookies.delete('auth_user');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Legacy host must intercept everything (including /api/*) to prevent any functionality.
    '/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/creator/:path*',
    '/',
    '/overview/:path*',
    '/protocolo/:path*',
    '/para-empresas/:path*',
    '/seguranca/:path*',
  ],
};
