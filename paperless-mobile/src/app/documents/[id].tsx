import { File, Paths } from 'expo-file-system';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    changeStatus,
    deleteDocument,
    DocumentDto,
    DocumentHistoryDto,
    DocumentStatus,
    documentFileUrl,
    errorMessage,
    getDocument,
    getHistory,
    retrySummary,
    summaryState,
    updateDocument,
} from '@/api';
import { AppButton } from '@/components/AppButton';
import { EditTitleModal } from '@/components/EditTitleModal';
import { ErrorBox } from '@/components/ErrorBox';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusChange } from '@/components/StatusChange';
import { COLORS, STATUS, formatBytes, formatDate, lockHint } from '@/theme';
import { useAutoRefresh } from '@/useAutoRefresh';

export default function DocumentScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const [document, setDocument] = useState<DocumentDto | null>(null);
    const [history, setHistory] = useState<DocumentHistoryDto[]>([]);
    const [editing, setEditing] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const [loaded, entries] = await Promise.all([getDocument(id), getHistory(id)]);
            setDocument(loaded);
            setHistory(entries);
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        }
    }, [id]);

    const state = document ? summaryState(document) : 'waiting-for-ocr';
    const polling = state === 'waiting-for-ocr' || state === 'pending';

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    useAutoRefresh(load, polling ? 3000 : 10000);

    if (!document) {
        return (
            <View style={styles.screen}>
                {error ? <ErrorBox text={error} /> : <Text style={styles.italic}>Loading…</Text>}
            </View>
        );
    }

    const doc = document;

    async function openPdf() {
        try {
            const target = new File(Paths.cache, doc.fileName ?? `document-${doc.id}.pdf`);
            const file = await File.downloadFileAsync(documentFileUrl(doc.id), target, { idempotent: true });
            await file.preview({ title: doc.title, mimeType: 'application/pdf' });
        } catch (e) {
            setError(errorMessage(e));
        }
    }

    async function saveTitle(title: string) {
        setDocument(await updateDocument(doc.id, title));
        setEditing(false);
    }

    async function moveTo(status: DocumentStatus, comment: string | null) {
        try {
            setDocument(await changeStatus(doc.id, status, comment));
            setHistory(await getHistory(id));
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        }
    }

    async function retry() {
        setRetrying(true);
        try {
            setDocument(await retrySummary(doc.id));
            setHistory(await getHistory(id));
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setRetrying(false);
        }
    }

    function confirmDelete() {
        Alert.alert('Delete document', 'Delete this document and its history?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDocument(doc.id);
                        router.back();
                    } catch (e) {
                        setError(errorMessage(e));
                    }
                },
            },
        ]);
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={[styles.content, { paddingBottom: 12 + insets.bottom }]}
            refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[COLORS.primary]} />}
        >
            <View style={styles.card}>
                <View>
                    <Text style={styles.title}>{doc.title}</Text>
                    <Text style={styles.small}>Uploaded at {formatDate(doc.uploadedAt)}</Text>
                </View>

                <View style={styles.buttons}>
                    <AppButton title="Open PDF" onPress={openPdf} />
                    {STATUS[doc.status].canEdit && <AppButton title="Edit" onPress={() => setEditing(true)} />}
                    {STATUS[doc.status].canDelete && (
                        <AppButton title="Delete" variant="danger" onPress={confirmDelete} />
                    )}
                </View>
                {lockHint(doc.status) && <Text style={styles.hint}>{lockHint(doc.status)}</Text>}

                <ErrorBox text={error} />

                <View style={styles.infoBox}>
                    <Info label="File" value={doc.fileName ?? 'N/A'} />
                    <Info label="Type" value={doc.contentType ?? 'N/A'} />
                    <Info label="Size" value={formatBytes(doc.fileSize)} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status:</Text>
                        <StatusBadge status={doc.status} />
                    </View>
                </View>

                {state !== 'unavailable' && (
                    <Section title="Summary">
                        {state === 'done' && <Text style={[styles.text, styles.summary]}>{doc.summary}</Text>}
                        {state === 'failed' && (
                            <View style={styles.summaryError}>
                                <Text style={styles.summaryErrorText}>
                                    Summary could not be generated: {doc.summaryError}
                                </Text>
                                {STATUS[doc.status].canEdit && (
                                    <AppButton title="Retry summary" variant="danger" onPress={retry} disabled={retrying} />
                                )}
                            </View>
                        )}
                        {state === 'pending' && <Text style={styles.italic}>Summary is being generated…</Text>}
                        {state === 'waiting-for-ocr' && (
                            <Text style={styles.italic}>The summary is created after text recognition.</Text>
                        )}
                    </Section>
                )}

                <Section title="Extracted Text">
                    {doc.content == null ? (
                        <Text style={styles.italic}>
                            Text recognition is still running. This section updates automatically.
                        </Text>
                    ) : doc.content.trim() === '' ? (
                        <Text style={styles.italic}>No text was found in this document.</Text>
                    ) : (
                        <ScrollView style={styles.textBox} nestedScrollEnabled>
                            <Text style={styles.text}>{doc.content}</Text>
                        </ScrollView>
                    )}
                </Section>

                <Section title="Change Status">
                    <StatusChange status={doc.status} onChange={moveTo} />
                </Section>

                <Section title="History">
                    {history.map((entry) => (
                        <View key={entry.id} style={styles.historyEntry}>
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyStatus}>
                                    {STATUS[entry.status].label}
                                    {entry.changedBy && <Text style={styles.historyBy}> by {entry.changedBy}</Text>}
                                </Text>
                                <Text style={styles.small}>{formatDate(entry.changedAt)}</Text>
                            </View>
                            {entry.comment && <Text style={styles.historyComment}>{entry.comment}</Text>}
                        </View>
                    ))}
                </Section>
            </View>

            {editing && <EditTitleModal title={doc.title} onSave={saveTitle} onCancel={() => setEditing(false)} />}
        </ScrollView>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeading}>{title}</Text>
            {children}
        </View>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 12 },
    card: {
        gap: 16,
        borderRadius: 8,
        padding: 16,
        backgroundColor: COLORS.card,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    small: { fontSize: 12, color: COLORS.light },
    buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoBox: { gap: 4, borderRadius: 6, padding: 12, backgroundColor: COLORS.background },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
    infoValue: { flexShrink: 1, fontSize: 14, color: COLORS.text },
    section: { gap: 8 },
    sectionHeading: { fontSize: 12, fontWeight: 'bold', color: COLORS.light, textTransform: 'uppercase' },
    text: { fontSize: 14, lineHeight: 20, color: COLORS.text },
    italic: { fontSize: 14, fontStyle: 'italic', color: COLORS.muted },
    summary: { borderRadius: 6, padding: 12, backgroundColor: COLORS.summaryBackground, overflow: 'hidden' },
    summaryError: { alignItems: 'flex-start', gap: 8, borderRadius: 6, padding: 12, backgroundColor: COLORS.errorBackground },
    summaryErrorText: { fontSize: 14, color: COLORS.errorText },
    textBox: { maxHeight: 300, borderRadius: 6, padding: 12, backgroundColor: COLORS.background },
    historyEntry: { gap: 2, borderLeftWidth: 2, borderLeftColor: COLORS.primaryLight, paddingLeft: 12 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    historyStatus: { fontSize: 12, fontWeight: 'bold', color: COLORS.text },
    historyBy: { fontWeight: 'normal', color: COLORS.muted },
    hint: { marginTop: -8, fontSize: 12, fontStyle: 'italic', color: COLORS.light },
    historyComment: { fontSize: 12, fontStyle: 'italic', color: COLORS.label },
});
