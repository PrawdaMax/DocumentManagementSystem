import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/theme';

interface DialogProps {
    title: string;
    onClose: () => void;
    actions: ReactNode;
    children: ReactNode;
}

export function Dialog({ title, onClose, actions, children }: DialogProps) {
    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.dialog}>
                    <Text style={styles.heading}>{title}</Text>
                    {children}
                    <View style={styles.actions}>{actions}</View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(30, 41, 59, 0.5)' },
    dialog: { gap: 12, borderRadius: 8, padding: 20, backgroundColor: COLORS.card },
    heading: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 8 },
});
