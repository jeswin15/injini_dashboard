
/**
 * Calculates the percentage growth between a current value and a baseline.
 * Formula: ((Current - Baseline) / Baseline) * 100
 */
export const calculateGrowth = (current: number, baseline: number): number => {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
};

/**
 * Calculates the Time-Weighted Average (TWA) for a set of values.
 * We weight the growth by the number of months of data available for that entity,
 * assuming more data points gives a more reliable growth metric.
 */
export const calculateTWA = (items: { value: number, weight: number }[]): number => {
    if (items.length === 0) return 0;

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = items.reduce((sum, item) => sum + (item.value * item.weight), 0);
    return weightedSum / totalWeight;
};

/**
 * Determines the Logic Phase based on months of data.
 * Logic i: 0-6 months
 * Logic ii: 7-12 months
 * Logic iii: 13-18 months
 * Logic iv: 19+ months
 */
export const determineLogicPhase = (months: number): string => {
    if (months <= 6) return 'Logic i';
    if (months <= 12) return 'Logic ii';
    if (months <= 18) return 'Logic iii';
    return 'Logic iv';
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-ZA').format(num);
};
