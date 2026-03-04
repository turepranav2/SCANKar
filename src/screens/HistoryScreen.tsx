// SCANKar — History / Saved Scans Screen (Screen 10)
// Search, filter, sort, and real scan list from AsyncStorage

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { HistoryStackParamList } from '../navigation/MainNavigator';
import { Scan, DocumentType } from '../models/Scan';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { formatDate } from '../utils/formatters';
import { getConfidenceColor, getConfidenceBgColor, formatConfidence } from '../utils/confidence';
import { getAllScans, deleteScan } from '../services/storage/ScanStorage';

type NavProp = NativeStackNavigationProp<HistoryStackParamList>;
type SortKey = 'newest' | 'oldest' | 'confidence';
type FilterType = 'all' | DocumentType;

const DOC_TYPE_ICONS: Record<string, string> = {
    table: '📊',
    paragraph: '📝',
    form: '📋',
    mixed: '📄',
};

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'table', label: 'Tables' },
    { key: 'paragraph', label: 'Text' },
    { key: 'form', label: 'Forms' },
    { key: 'mixed', label: 'Mixed' },
];

const HistoryScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { colors } = useTheme();

    const [scans, setScans] = useState<Scan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [sortKey, setSortKey] = useState<SortKey>('newest');

    // Load scans on focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            setIsLoading(true);
            const loadedScans = await getAllScans();
            setScans(loadedScans);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [navigation]);

    const filteredScans = useMemo(() => {
        let list = [...scans];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(s => s.name.toLowerCase().includes(q));
        }

        // Filter
        if (activeFilter !== 'all') {
            list = list.filter(s => s.documentType === activeFilter);
        }

        // Sort
        switch (sortKey) {
            case 'newest':
                list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'confidence':
                list.sort((a, b) => b.overallConfidence - a.overallConfidence);
                break;
        }

        return list;
    }, [scans, searchQuery, activeFilter, sortKey]);

    const handleScanPress = useCallback((scan: Scan) => {
        if (scan.documentType === 'paragraph') {
            navigation.navigate(ROUTES.PARAGRAPH_REVIEW, { scanId: scan.id });
        } else {
            navigation.navigate(ROUTES.TABLE_REVIEW, { scanId: scan.id });
        }
    }, [navigation]);

    const handleDeleteScan = useCallback((scan: Scan) => {
        Alert.alert(
            'Delete Scan',
            `Delete "${scan.name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteScan(scan.id);
                        setScans(prev => prev.filter(s => s.id !== scan.id));
                    }
                },
            ]
        );
    }, []);

    const cycleSortKey = useCallback(() => {
        setSortKey(prev => {
            if (prev === 'newest') return 'oldest';
            if (prev === 'oldest') return 'confidence';
            return 'newest';
        });
    }, []);

    const renderScanItem = useCallback(({ item }: { item: Scan }) => {
        const cVal = item.overallConfidence > 1 ? item.overallConfidence / 100 : item.overallConfidence;
        const confColor = getConfidenceColor(cVal, colors);
        const confBg = getConfidenceBgColor(cVal, colors);
        const icon = DOC_TYPE_ICONS[item.documentType] || '📄';

        return (
            <TouchableOpacity
                style={[styles.scanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleScanPress(item)}
                onLongPress={() => handleDeleteScan(item)}
                activeOpacity={0.7}
            >
                {/* Thumbnail */}
                <View style={[styles.thumbArea, { backgroundColor: colors.primarySubtle }]}>
                    {item.thumbnailUri ? (
                        <Image source={{ uri: item.thumbnailUri }} style={styles.realThumb} resizeMode="cover" />
                    ) : (
                        <Text style={styles.thumbIcon}>{icon}</Text>
                    )}
                </View>

                {/* Info */}
                <View style={styles.scanInfo}>
                    <Text style={[styles.scanName, { color: colors.text1 }]} numberOfLines={1}>
                        {item.name.replace(/_/g, ' ')}
                    </Text>
                    <View style={styles.scanMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: colors.primarySubtle }]}>
                            <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                                {item.documentType.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.confPill, { backgroundColor: confBg }]}>
                            <Text style={[styles.confPillText, { color: confColor }]}>
                                {formatConfidence(cVal)}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.scanDate, { color: colors.text2 }]}>{formatDate(item.createdAt)}</Text>
                </View>

                {/* Arrow */}
                <Text style={[styles.arrow, { color: colors.text2 }]}>›</Text>
            </TouchableOpacity>
        );
    }, [colors, handleScanPress, handleDeleteScan]);

    if (isLoading && scans.length === 0) {
        return (
            <View style={[styles.container, styles.loadingCenter, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar title="History" showLogo={false} />

            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={[styles.searchInput, { color: colors.text1 }]}
                    placeholder="Search scans..."
                    placeholderTextColor={colors.text2}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={[styles.clearIcon, { color: colors.text2 }]}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips + Sort */}
            <View style={styles.filterRow}>
                <FlatList
                    data={FILTER_OPTIONS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={styles.filterChips}
                    renderItem={({ item }) => {
                        const isActive = item.key === activeFilter;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: isActive ? colors.primary : colors.surface,
                                        borderColor: isActive ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => setActiveFilter(item.key)}
                            >
                                <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : colors.text1 }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
                <TouchableOpacity style={styles.sortBtn} onPress={cycleSortKey}>
                    <Text style={[styles.sortLabel, { color: colors.primary }]}>
                        ↕ {sortKey === 'newest' ? 'Newest' : sortKey === 'oldest' ? 'Oldest' : 'Confidence'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results count */}
            <Text style={[styles.resultCount, { color: colors.text2 }]}>
                {filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''} found
            </Text>

            {/* Scan List */}
            {filteredScans.length > 0 ? (
                <FlatList
                    data={filteredScans}
                    renderItem={renderScanItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.scanList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text1 }]}>No scans found</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.text2 }]}>
                        {scans.length === 0 ? 'Start scanning to see your history' : 'Try a different search term'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.base,
        marginTop: spacing.md,
        height: 44,
        borderRadius: radius.input,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, height: '100%', fontSize: 14, fontFamily: typography.body.fontFamily },
    clearIcon: { fontSize: 16, padding: 4 },

    // Filters
    filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, paddingRight: spacing.base },
    filterChips: { paddingLeft: spacing.base, gap: spacing.sm },
    filterChip: { height: 32, paddingHorizontal: spacing.base, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    filterChipText: { fontSize: 12, fontWeight: '600', fontFamily: typography.caption.fontFamily },
    sortBtn: { paddingHorizontal: spacing.md },
    sortLabel: { fontSize: 12, fontWeight: '600', fontFamily: typography.caption.fontFamily },

    resultCount: { fontSize: 12, marginHorizontal: spacing.base, marginTop: spacing.md, marginBottom: spacing.sm, fontFamily: typography.caption.fontFamily },

    // Scan list
    scanList: { paddingHorizontal: spacing.base, gap: spacing.md, paddingBottom: spacing.xxl },
    scanCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.card, borderWidth: 1, overflow: 'hidden', ...shadows.sm },
    thumbArea: { width: 64, height: 72, justifyContent: 'center', alignItems: 'center' },
    thumbIcon: { fontSize: 28 },
    realThumb: { width: '100%', height: '100%' },
    scanInfo: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    scanName: { fontSize: 14, fontWeight: '600', fontFamily: typography.body.fontFamily },
    scanMeta: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
    typeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill },
    typeBadgeText: { fontSize: 9, fontWeight: '700', fontFamily: typography.caption.fontFamily },
    confPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill },
    confPillText: { fontSize: 9, fontWeight: '700', fontFamily: typography.caption.fontFamily },
    scanDate: { fontSize: 11, marginTop: spacing.xs, fontFamily: typography.caption.fontFamily },
    arrow: { fontSize: 24, paddingRight: spacing.md },

    // Empty state
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: '600', fontFamily: typography.h4.fontFamily },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: spacing.sm, fontFamily: typography.body.fontFamily },
});

export default HistoryScreen;
