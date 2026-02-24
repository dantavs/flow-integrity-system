import { NextResponse } from 'next/server';
import { analyzeCommitmentWithAI, AdvisorInput } from '@/services/GuardianAdvisorService';

function validateInput(body: any): AdvisorInput | null {
    if (!body || typeof body !== 'object') return null;

    const required = ['titulo', 'owner', 'stakeholder', 'dataEsperada', 'tipo', 'impacto'];
    const hasRequired = required.every(key => String(body[key] || '').trim() !== '');
    if (!hasRequired) return null;

    return {
        titulo: String(body.titulo || ''),
        projeto: String(body.projeto || ''),
        owner: String(body.owner || ''),
        stakeholder: String(body.stakeholder || ''),
        dataEsperada: String(body.dataEsperada || ''),
        tipo: body.tipo,
        impacto: body.impacto,
        riscos: Array.isArray(body.riscos) ? body.riscos.map((risk: unknown) => String(risk)) : [],
        dependencias: Array.isArray(body.dependencias) ? body.dependencias.map((dep: unknown) => String(dep)) : [],
        dependencyContext: Array.isArray(body.dependencyContext)
            ? body.dependencyContext
                .filter((dep: any) => dep && typeof dep === 'object')
                .map((dep: any) => ({
                    id: String(dep.id || ''),
                    titulo: String(dep.titulo || ''),
                    projeto: dep.projeto ? String(dep.projeto) : undefined,
                    status: dep.status ? String(dep.status) : undefined,
                }))
                .filter((dep: { id: string; titulo: string }) => dep.id.trim() !== '' && dep.titulo.trim() !== '')
            : [],
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = validateInput(body);
        if (!input) {
            return NextResponse.json(
                { status: 'invalid_input', reason: 'Payload inválido para análise.' },
                { status: 400 },
            );
        }

        const result = await analyzeCommitmentWithAI(input);
        if (result.status === 'ok') {
            return NextResponse.json(result, { status: 200 });
        }

        const statusCode = result.status === 'disabled' ? 200 : 503;
        return NextResponse.json(result, { status: statusCode });
    } catch {
        return NextResponse.json(
            { status: 'unavailable', reason: 'Erro inesperado no advisor.' },
            { status: 500 },
        );
    }
}
