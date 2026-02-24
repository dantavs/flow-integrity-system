export const REFLECTION_FEED_CONTRACT_VERSION = 'v1';

export const REFLECTION_FEED_THRESHOLDS = {
    dependencyDoneWindowDays: 7,
    projectOpenRiskMin: 3,
    postponementMinRenegotiations: 2,
    unstableProjectSignalMin: 2,
    newCommitmentWindowDays: 3,
    cooldownHours: 24,
    maxFeedItems: 6,
} as const;

export type ReflectionTriggerType =
    | 'DEPENDENCY_COMPLETED'
    | 'PROJECT_RISK_CLUSTER'
    | 'POSTPONEMENT_PATTERN'
    | 'NEW_COMMITMENT_ON_UNSTABLE_PROJECT';

export type ReflectionSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReflectionActionType = 'OPEN_COMMITMENT' | 'FILTER_PROJECT';

export interface ReflectionAction {
    type: ReflectionActionType;
    label: string;
    commitmentId?: string;
    projeto?: string;
}

export interface ReflectionItem {
    id: string;
    dedupKey: string;
    triggerType: ReflectionTriggerType;
    severity: ReflectionSeverity;
    score: number;
    message: string;
    context: string;
    why: string;
    relatedCommitmentIds: string[];
    relatedProject?: string;
    actions: ReflectionAction[];
    createdAt: Date;
}
