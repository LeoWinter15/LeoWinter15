/** Rolling six calendar months, inclusive of the first and current UTC dates. */
export const profilePeriod = (now: Date = new Date()): { from: string; to: string } => {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1));
    const lastDay = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0),
    ).getUTCDate();
    // Clamp month ends (e.g. 31 August -> 28/29 February).
    from.setUTCDate(Math.min(now.getUTCDate(), lastDay));
    return { from: from.toISOString(), to: now.toISOString() };
};
