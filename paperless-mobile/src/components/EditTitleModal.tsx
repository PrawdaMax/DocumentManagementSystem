import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { errorMessage } from '@/api';
import { AppButton } from '@/components/AppButton';
import { Dialog } from '@/components/Dialog';
import { ErrorBox } from '@/components/ErrorBox';
import { FORM } from '@/theme';

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
        <Dialog
            title="Edit Document Title"
            onClose={onCancel}
            actions={
                <>
                    <AppButton title="Cancel" onPress={onCancel} />
                    <AppButton title="Save" variant="primary" onPress={save} />
                </>
            }
        >
            <ErrorBox text={error} />
            <View style={FORM.field}>
                <Text style={FORM.label}>Title *</Text>
                <TextInput style={FORM.input} value={value} onChangeText={setValue} maxLength={255} autoFocus />
            </View>
        </Dialog>
    );
}
