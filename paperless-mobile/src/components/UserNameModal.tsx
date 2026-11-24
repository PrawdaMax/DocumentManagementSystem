import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Dialog } from '@/components/Dialog';
import { COLORS, FORM } from '@/theme';

interface UserNameModalProps {
    name: string;
    onSave: (name: string) => void;
    onCancel: () => void;
}

export function UserNameModal({ name, onSave, onCancel }: UserNameModalProps) {
    const [value, setValue] = useState(name);

    return (
        <Dialog
            title="Your Name"
            onClose={onCancel}
            actions={
                <>
                    <AppButton title="Cancel" onPress={onCancel} />
                    <AppButton title="Save" variant="primary" onPress={() => onSave(value.trim())} />
                </>
            }
        >
            <Text style={styles.text}>
                Saved on this device and shown in the history when you upload a document or change its status.
            </Text>
            <View style={FORM.field}>
                <Text style={FORM.label}>Name</Text>
                <TextInput style={FORM.input} value={value} onChangeText={setValue} maxLength={100} autoFocus />
            </View>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    text: { fontSize: 14, color: COLORS.muted },
});
