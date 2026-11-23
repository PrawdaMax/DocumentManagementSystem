import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { DocumentStatus } from '@/api';
import { AppButton } from '@/components/AppButton';
import { COLORS, STATUS } from '@/theme';

interface StatusChangeProps {
    status: DocumentStatus;
    onChange: (status: DocumentStatus, comment: string | null) => Promise<void>;
}

export function StatusChange({ status, onChange }: StatusChangeProps) {
    const [comment, setComment] = useState('');
    const nextStatuses = STATUS[status].next;

    async function changeTo(next: DocumentStatus) {
        await onChange(next, comment.trim() || null);
        setComment('');
    }

    if (nextStatuses.length === 0) {
        return <Text style={styles.final}>{STATUS[status].label} is a final status.</Text>;
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.comment}
                value={comment}
                onChangeText={setComment}
                placeholder="Comment (optional, max. 500 characters)"
                placeholderTextColor={COLORS.light}
                maxLength={500}
                multiline
            />
            <View style={styles.buttons}>
                {nextStatuses.map((next) => (
                    <AppButton key={next} title={`Move to ${STATUS[next].label}`} onPress={() => changeTo(next)} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 8 },
    comment: {
        minHeight: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        padding: 8,
        fontSize: 13,
        color: COLORS.text,
        textAlignVertical: 'top',
    },
    buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    final: { fontSize: 13, fontStyle: 'italic', color: COLORS.light },
});
