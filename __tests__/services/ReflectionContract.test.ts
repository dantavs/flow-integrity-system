import {
    REFLECTION_FEED_CONTRACT_VERSION,
    REFLECTION_FEED_THRESHOLDS,
} from '@/services/ReflectionContract';

describe('ReflectionContract', () => {
    it('should expose v1 metadata', () => {
        expect(REFLECTION_FEED_CONTRACT_VERSION).toBe('v1');
    });

    it('should keep deterministic thresholds for feed behavior', () => {
        expect(REFLECTION_FEED_THRESHOLDS.dependencyDoneWindowDays).toBe(7);
        expect(REFLECTION_FEED_THRESHOLDS.projectOpenRiskMin).toBe(3);
        expect(REFLECTION_FEED_THRESHOLDS.postponementMinRenegotiations).toBe(2);
        expect(REFLECTION_FEED_THRESHOLDS.unstableProjectSignalMin).toBe(2);
        expect(REFLECTION_FEED_THRESHOLDS.newCommitmentWindowDays).toBe(3);
        expect(REFLECTION_FEED_THRESHOLDS.cooldownHours).toBe(24);
        expect(REFLECTION_FEED_THRESHOLDS.maxFeedItems).toBe(6);
    });
});
