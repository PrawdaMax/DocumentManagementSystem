import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import type { DocumentStatus } from '@/api';
import { STATUS } from '@/theme';

export function StatusBadge({ status }: { status: DocumentStatus }) {
    const { label, background, color } = STATUS[status];
    return (
        <View style={[styles.badge, { backgroundColor: background }]}>
            {status === 'PROCESSING' && <Ionicons name="time-outline" size={13} color={color} />}
            <Text style={[styles.text, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 3,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    text: { fontSize: 12, fontWeight: '600' },
});
