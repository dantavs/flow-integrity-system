import {
    WEEKLY_BRIEF_BLOCKS,
    WEEKLY_BRIEF_CONTRACT_VERSION,
    WEEKLY_BRIEF_THRESHOLDS,
} from '@/services/WeeklyBriefContract';

describe('WeeklyBriefContract', () => {
    it('should expose v1 contract metadata', () => {
        expect(WEEKLY_BRIEF_CONTRACT_VERSION).toBe('v1');
        expect(WEEKLY_BRIEF_BLOCKS).toHaveLength(5);
    });

    it('should keep deterministic thresholds', () => {
        expect(WEEKLY_BRIEF_THRESHOLDS.nextWeekStartOffsetDays).toBe(1);
        expect(WEEKLY_BRIEF_THRESHOLDS.nextWeekEndOffsetDays).toBe(7);
        expect(WEEKLY_BRIEF_THRESHOLDS.recentCompletedWindowDays).toBe(7);
        expect(WEEKLY_BRIEF_THRESHOLDS.recurrentRenegotiationMin).toBe(2);
        expect(WEEKLY_BRIEF_THRESHOLDS.highRiskMatrixScoreMin).toBe(6);
    });
});
