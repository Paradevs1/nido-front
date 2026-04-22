import { NextRequest, NextResponse } from 'next/server';

// EVITANDO CORS
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');

    if (!userName) {
      return NextResponse.json(
        { error: 'userName é obrigatório' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TWITTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'TWITTER_API_KEY não configurada' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(userName)}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do Twitter:', response.status, errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar dados do Twitter', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

