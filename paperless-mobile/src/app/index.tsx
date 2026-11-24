import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentDto, errorMessage, getDocuments, searchDocuments } from '@/api';
import { AppButton } from '@/components/AppButton';
import { ErrorBox } from '@/components/ErrorBox';
import { StatusBadge } from '@/components/StatusBadge';
import { UploadModal } from '@/components/UploadModal';
import { UserNameModal } from '@/components/UserNameModal';
import { COLORS, FORM, formatBytes, formatDate } from '@/theme';
import { useAutoRefresh } from '@/useAutoRefresh';
import { loadUserName, saveUserName } from '@/userName';

export default function DocumentListScreen() {
    const insets = useSafeAreaInsets();
    const [documents, setDocuments] = useState<DocumentDto[] | null>(null);
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [nameOpen, setNameOpen] = useState(false);

    useEffect(() => {
        loadUserName().then(setUserName);
    }, []);

    const load = useCallback(async () => {
        try {
            const text = query.trim();
            setDocuments(text ? await searchDocuments(text) : await getDocuments());
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        }
    }, [query]);

    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(load, 300);
            return () => clearTimeout(timer);
        }, [load]),
    );

    useAutoRefresh(load, 10000);

    async function pullToRefresh() {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }

    async function changeUserName(name: string) {
        await saveUserName(name);
        setUserName(name);
        setNameOpen(false);
    }

    function openUploaded(document: DocumentDto) {
        setUploadOpen(false);
        router.push({ pathname: '/documents/[id]', params: { id: document.id } });
    }

    return (
        <View style={[styles.screen, { paddingBottom: 12 + insets.bottom }]}>
            <View style={styles.nameRow}>
                <Text style={styles.nameText}>{userName ? `Your name: ${userName}` : 'No name set'}</Text>
                <AppButton title={userName ? 'Change' : 'Set name'} onPress={() => setNameOpen(true)} />
            </View>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Documents</Text>
                    <AppButton title="+ New Document" variant="primary" onPress={() => setUploadOpen(true)} />
                </View>
                <TextInput
                    style={FORM.input}
                    placeholder="Search title or text..."
                    placeholderTextColor={COLORS.light}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
                <ErrorBox text={error} />
                <FlatList
                    data={documents ?? []}
                    keyExtractor={(document) => String(document.id)}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={pullToRefresh} colors={[COLORS.primary]} />
                    }
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    ListEmptyComponent={
                        documents === null ? undefined : (
                            <Text style={styles.empty}>
                                {query.trim() ? `No documents match "${query.trim()}".` : 'No documents found.'}
                            </Text>
                        )
                    }
                    renderItem={({ item }) => (
                        <Link href={{ pathname: '/documents/[id]', params: { id: item.id } }} asChild>
                            <Pressable style={styles.row}>
                                <View style={styles.rowText}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    {item.summary && (
                                        <Text style={styles.summary} numberOfLines={2}>
                                            {item.summary}
                                        </Text>
                                    )}
                                    <Text style={styles.date}>{formatDate(item.uploadedAt)}</Text>
                                    <Text style={styles.file}>
                                        {item.fileName ?? 'N/A'} · {formatBytes(item.fileSize)}
                                    </Text>
                                </View>
                                <StatusBadge status={item.status} />
                            </Pressable>
                        </Link>
                    )}
                />
            </View>

            {uploadOpen && <UploadModal onUploaded={openUploaded} onCancel={() => setUploadOpen(false)} />}
            {nameOpen && <UserNameModal name={userName} onSave={changeUserName} onCancel={() => setNameOpen(false)} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, gap: 12, padding: 12, backgroundColor: COLORS.background },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    nameText: { flex: 1, fontSize: 14, color: COLORS.label },
    card: {
        flex: 1,
        gap: 12,
        borderRadius: 8,
        padding: 16,
        backgroundColor: COLORS.card,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    heading: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    divider: { height: 1, backgroundColor: COLORS.divider },
    empty: { paddingVertical: 32, textAlign: 'center', fontSize: 14, color: COLORS.light },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
    rowText: { flex: 1, gap: 2 },
    title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    summary: { fontSize: 12, color: COLORS.label },
    date: { fontSize: 12, color: COLORS.light },
    file: { fontSize: 12, color: COLORS.muted, fontFamily: 'monospace' },
});
