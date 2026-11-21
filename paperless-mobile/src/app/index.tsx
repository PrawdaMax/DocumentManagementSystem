import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentDto, errorMessage, getDocuments, searchDocuments } from '@/api';
import { ErrorBox } from '@/components/ErrorBox';
import { StatusBadge } from '@/components/StatusBadge';
import { COLORS, formatBytes, formatDate } from '@/theme';

export default function DocumentListScreen() {
    const insets = useSafeAreaInsets();
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const text = query.trim();
            setDocuments(text ? await searchDocuments(text) : await getDocuments());
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [query]);

    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(load, 300);
            return () => clearTimeout(timer);
        }, [load]),
    );

    return (
        <View style={[styles.screen, { paddingBottom: 12 + insets.bottom }]}>
            <View style={styles.card}>
                <Text style={styles.heading}>Documents</Text>
                <TextInput
                    style={styles.search}
                    placeholder="Search title or text..."
                    placeholderTextColor={COLORS.light}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
                <ErrorBox text={error} />
                <FlatList
                    data={documents}
                    keyExtractor={(document) => String(document.id)}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[COLORS.primary]} />}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    ListEmptyComponent={
                        loading ? undefined : (
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
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 12, backgroundColor: COLORS.background },
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
    heading: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    search: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: COLORS.text,
    },
    divider: { height: 1, backgroundColor: COLORS.divider },
    empty: { paddingVertical: 32, textAlign: 'center', fontSize: 14, color: COLORS.light },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
    rowText: { flex: 1, gap: 2 },
    title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    date: { fontSize: 12, color: COLORS.light },
    file: { fontSize: 12, color: COLORS.muted, fontFamily: 'monospace' },
});
