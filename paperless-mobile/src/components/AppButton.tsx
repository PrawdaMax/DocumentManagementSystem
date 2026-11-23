import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '@/theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'danger';
    disabled?: boolean;
}

export function AppButton({ title, onPress, variant = 'outline', disabled = false }: AppButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [styles.button, styles[variant], (pressed || disabled) && styles.pressed]}
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
    pressed: { opacity: 0.6 },
    text: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    lightText: { color: '#ffffff' },
});
