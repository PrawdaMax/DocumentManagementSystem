import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState } from 'react-native';

export function useAutoRefresh(refresh: () => void, intervalMs: number) {
    useFocusEffect(
        useCallback(() => {
            const interval = setInterval(refresh, intervalMs);
            const subscription = AppState.addEventListener('change', (state) => {
                if (state === 'active') {
                    refresh();
                }
            });
            return () => {
                clearInterval(interval);
                subscription.remove();
            };
        }, [refresh, intervalMs]),
    );
}
