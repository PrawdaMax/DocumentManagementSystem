import { StyleSheet, Text, View } from 'react-native';
import type { DocumentStatus } from '@/api';
import { STATUS } from '@/theme';

export function StatusBadge({ status }: { status: DocumentStatus }) {
    const { label, background, color } = STATUS[status];
    return (
        <View style={[styles.badge, { backgroundColor: background }]}>
            <Text style={[styles.text, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
    text: { fontSize: 12, fontWeight: '600' },
});
