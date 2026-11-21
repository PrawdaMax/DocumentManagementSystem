import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { errorMessage } from '@/api';
import { AppButton } from '@/components/AppButton';
import { ErrorBox } from '@/components/ErrorBox';
import { COLORS } from '@/theme';

interface EditTitleModalProps {
    title: string;
    onSave: (title: string) => Promise<void>;
    onCancel: () => void;
}

export function EditTitleModal({ title, onSave, onCancel }: EditTitleModalProps) {
    const [value, setValue] = useState(title);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        if (!value.trim()) {
            setError('Please enter a title.');
            return;
        }
        try {
            await onSave(value.trim());
        } catch (e) {
            setError(errorMessage(e));
        }
    }

    return (
        <Modal transparent animationType="fade" onRequestClose={onCancel}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.dialog}>
                    <Text style={styles.heading}>Edit Document Title</Text>
                    <ErrorBox text={error} />
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        maxLength={255}
                        autoFocus
                    />
                    <View style={styles.buttons}>
                        <AppButton title="Cancel" onPress={onCancel} />
                        <AppButton title="Save" variant="primary" onPress={save} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(30, 41, 59, 0.5)' },
    dialog: { gap: 12, borderRadius: 8, padding: 20, backgroundColor: COLORS.card },
    heading: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    label: { marginBottom: -8, fontSize: 12, fontWeight: '600', color: COLORS.label },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: COLORS.text,
    },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 8 },
});
