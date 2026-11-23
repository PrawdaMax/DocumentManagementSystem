import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { DocumentDto, errorMessage, uploadDocument } from '@/api';
import { AppButton } from '@/components/AppButton';
import { Dialog } from '@/components/Dialog';
import { ErrorBox } from '@/components/ErrorBox';
import { COLORS, FORM, formatBytes } from '@/theme';

interface UploadModalProps {
    onUploaded: (document: DocumentDto) => void;
    onCancel: () => void;
}

export function UploadModal({ onUploaded, onCancel }: UploadModalProps) {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    async function pickFile() {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (!result.canceled) {
            setFile(result.assets[0]);
            setError(null);
        }
    }

    async function upload() {
        if (!file) {
            setError('Please select a PDF file.');
            return;
        }
        setUploading(true);
        try {
            onUploaded(await uploadDocument(file.uri, file.name, title.trim()));
        } catch (e) {
            setError(errorMessage(e));
            setUploading(false);
        }
    }

    return (
        <Dialog
            title="Upload Document"
            onClose={onCancel}
            actions={
                <>
                    <AppButton title="Cancel" onPress={onCancel} />
                    <AppButton
                        title={uploading ? 'Uploading…' : 'Upload'}
                        variant="primary"
                        onPress={upload}
                        disabled={uploading}
                    />
                </>
            }
        >
            <ErrorBox text={error} />
            <View style={FORM.field}>
                <Text style={FORM.label}>Title (optional)</Text>
                <TextInput
                    style={FORM.input}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={255}
                    placeholder="Default: file name"
                    placeholderTextColor={COLORS.light}
                />
            </View>
            <View style={FORM.field}>
                <Text style={FORM.label}>PDF File *</Text>
                <View style={styles.fileRow}>
                    <AppButton title="Choose PDF" onPress={pickFile} />
                    <Text style={styles.fileName} numberOfLines={1}>
                        {file ? `${file.name} (${formatBytes(file.size ?? null)})` : 'No file selected'}
                    </Text>
                </View>
            </View>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fileName: { flex: 1, fontSize: 13, color: COLORS.muted },
});
