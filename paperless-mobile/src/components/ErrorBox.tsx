import { StyleSheet, Text } from 'react-native';
import { COLORS } from '@/theme';

export function ErrorBox({ text }: { text: string | null }) {
    if (!text) return null;
    return <Text style={styles.box}>{text}</Text>;
}

const styles = StyleSheet.create({
    box: {
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        backgroundColor: COLORS.errorBackground,
        color: COLORS.errorText,
        overflow: 'hidden',
    },
});
