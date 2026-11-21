import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '@/theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'danger';
}

export function AppButton({ title, onPress, variant = 'outline' }: AppButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}
        >
            <Text style={[styles.text, variant !== 'outline' && styles.lightText]}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
    outline: { backgroundColor: COLORS.card, borderColor: COLORS.border },
    primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    danger: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
    pressed: { opacity: 0.7 },
    text: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    lightText: { color: '#ffffff' },
});
