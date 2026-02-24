export const WEEKLY_BRIEF_CONTRACT_VERSION = 'v1';

export const WEEKLY_BRIEF_THRESHOLDS = {
    nextWeekStartOffsetDays: 0,
    nextWeekEndOffsetDays: 6,
    recentCompletedWindowDays: 7,
    recurrentRenegotiationMin: 2,
    highRiskMatrixScoreMin: 6,
} as const;

export type WeeklyBriefBlockKey =
    | 'NEXT_WEEK_DELIVERIES'
    | 'AT_RISK'
    | 'BLOCKED'
    | 'RECURRENT'
    | 'RECENT_COMPLETED';

export interface WeeklyBriefBlockDefinition {
    key: WeeklyBriefBlockKey;
    label: string;
    description: string;
}

export const WEEKLY_BRIEF_BLOCKS: WeeklyBriefBlockDefinition[] = [
    {
        key: 'NEXT_WEEK_DELIVERIES',
        label: 'Entregas da semana',
        description: 'Compromissos ativos com data esperada entre D0 e D+6.',
    },
    {
        key: 'AT_RISK',
        label: 'Em risco',
        description: 'Compromissos ativos vencidos, bloqueados, com risco alto aberto ou reincidentes.',
    },
    {
        key: 'BLOCKED',
        label: 'Bloqueados',
        description: 'Compromissos ativos com impedimento ativo.',
    },
    {
        key: 'RECURRENT',
        label: 'Reincidentes',
        description: 'Compromissos ativos com duas ou mais renegociações.',
    },
    {
        key: 'RECENT_COMPLETED',
        label: 'Concluídos nos últimos 7 dias',
        description: 'Compromissos concluídos recentemente para leitura de progresso.',
    },
];
