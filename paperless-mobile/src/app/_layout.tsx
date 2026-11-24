import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/theme';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    title: 'Paperless DMS',
                    headerStyle: { backgroundColor: COLORS.primary },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: COLORS.background },
                }}
            />
        </>
    );
}
