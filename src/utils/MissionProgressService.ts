
const MISSION_PROGRESS_KEY = "mission_progress";

export const MissionProgressService = {

    isMissionActive(missionId: string): boolean {
        try {
            const active = JSON.parse(localStorage.getItem("active_missions") || "[]");
            return active.includes(missionId);
        } catch {
            return false;
        }
    },

    getAll(): Record<string, number> {
        try {
            return JSON.parse(localStorage.getItem(MISSION_PROGRESS_KEY) || "{}");
        } catch {
            return {};
        }
    },
    get(missionId: string): number {
        const all = MissionProgressService.getAll();
        return all[missionId] || 0;
    },
    increment(missionId: string, amount = 1) {
        const all = MissionProgressService.getAll();
        all[missionId] = (all[missionId] || 0) + amount;
        localStorage.setItem(MISSION_PROGRESS_KEY, JSON.stringify(all));
    },
    reset(missionId: string) {
        const all = MissionProgressService.getAll();
        all[missionId] = 0;
        localStorage.setItem(MISSION_PROGRESS_KEY, JSON.stringify(all));
    },
    resetAll() {
        localStorage.removeItem(MISSION_PROGRESS_KEY);
    }
};
