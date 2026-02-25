import { NextResponse } from 'next/server';
import { Commitment } from '@/models/Commitment';
import { analyzeIntegrityInsights } from '@/services/GuardianInsightsService';

function parseCommitments(body: any): Commitment[] {
    if (!body || !Array.isArray(body.commitments)) return [];
    return body.commitments.map((commitment: any) => ({
        ...commitment,
        dataEsperada: new Date(commitment.dataEsperada),
        criadoEm: new Date(commitment.criadoEm),
        historico: (commitment.historico || []).map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp),
        })),
    }));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const commitments = parseCommitments(body);
        if (commitments.length === 0) {
            return NextResponse.json(
                { status: 'invalid_input', reason: 'Nenhum compromisso enviado para insights.' },
                { status: 400 },
            );
        }

        const result = await analyzeIntegrityInsights(commitments);
        return NextResponse.json(result, { status: 200 });
    } catch {
        return NextResponse.json(
            { status: 'unavailable', reason: 'Erro inesperado no Integrity Guardian.' },
            { status: 500 },
        );
    }
}
