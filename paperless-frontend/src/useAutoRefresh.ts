import { useEffect } from 'react';

export function useAutoRefresh(refresh: () => void, intervalMs: number) {
    useEffect(() => {
        function refreshIfVisible() {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        }

        const interval = setInterval(refreshIfVisible, intervalMs);
        document.addEventListener('visibilitychange', refreshIfVisible);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', refreshIfVisible);
        };
    }, [refresh, intervalMs]);
}
