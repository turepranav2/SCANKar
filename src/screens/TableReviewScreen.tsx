// SCANKar — Table Review Screen (Screen 06)
// Fetches real scan from AsyncStorage and displays dynamic extractions

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { getConfidenceColor, getConfidenceBgColor, formatConfidence } from '../utils/confidence';
import { getScan } from '../services/storage/ScanStorage';
import { Scan } from '../models/Scan';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ReviewRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.TABLE_REVIEW>;

const TableReviewScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ReviewRouteProp>();
    const { colors } = useTheme();

    const [scan, setScan] = useState<Scan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showOriginal, setShowOriginal] = useState(true);

    useEffect(() => {
        const loadScan = async () => {
            const data = await getScan(route.params.scanId);
            setScan(data);
            setIsLoading(false);
        };
        loadScan();
    }, [route.params.scanId]);

    const handleEdit = useCallback(() => {
        navigation.navigate(ROUTES.TABLE_EDITOR, { scanId: route.params.scanId });
    }, [navigation, route.params.scanId]);

    const handleExport = useCallback(() => {
        navigation.navigate(ROUTES.EXPORT, { scanId: route.params.scanId });
    }, [navigation, route.params.scanId]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingCenter, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!scan) {
        return (
            <View style={[styles.container, styles.loadingCenter, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.error }}>Failed to load scan data.</Text>
            </View>
        );
    }

    const { tableData, originalImageUri, overallConfidence } = scan;
    const headers = tableData?.headers || [];
    const rows = tableData?.rows || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Table Review"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
                rightIcons={
                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={handleEdit}>
                            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Original Image Toggle */}
                {showOriginal && (
                    <View style={[styles.imageArea, { backgroundColor: colors.primarySubtle }]}>
                        {originalImageUri ? (
                            <Image source={{ uri: originalImageUri }} style={styles.realImage} resizeMode="contain" />
                        ) : (
                            <>
                                <Text style={styles.imageEmoji}>📄</Text>
                                <Text style={[styles.imageLabel, { color: colors.text2 }]}>No Image Available</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.collapseBtn}
                            onPress={() => setShowOriginal(false)}
                        >
                            <View style={styles.collapseBg}>
                                <Text style={[styles.collapseText, { color: '#000' }]}>▼ Hide</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                {!showOriginal && (
                    <TouchableOpacity
                        style={[styles.expandBar, { backgroundColor: colors.primarySubtle }]}
                        onPress={() => setShowOriginal(true)}
                    >
                        <Text style={[styles.expandText, { color: colors.primary }]}>▶ Show Original Document</Text>
                    </TouchableOpacity>
                )}

                {/* Confidence Summary */}
                <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Overall Confidence</Text>
                        <View style={[styles.confBadge, { backgroundColor: getConfidenceBgColor(overallConfidence / 100, colors) }]}>
                            <Text style={[styles.confBadgeText, { color: getConfidenceColor(overallConfidence / 100, colors) }]}>
                                {formatConfidence(overallConfidence / 100)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Detected</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>
                            {rows.length} rows × {headers.length} columns
                        </Text>
                    </View>
                </View>

                {/* Extracted Table */}
                <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View>
                            {/* Header row */}
                            <View style={styles.tableHeaderRow}>
                                {headers.map((header, index) => (
                                    <View
                                        key={header.id || index}
                                        style={[
                                            styles.tableHeaderCell,
                                            { backgroundColor: colors.primarySubtle, borderColor: colors.border },
                                            index === 1 && { width: 160 },
                                        ]}
                                    >
                                        <Text style={[styles.tableHeaderText, { color: colors.primary }]}>{header.value}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Data rows */}
                            {rows.map((row, rowIdx) => (
                                <View key={rowIdx} style={styles.tableDataRow}>
                                    {row.map((cell, cellIdx) => {
                                        // Confidence is stored 0-100 in our mock, 0-1 depending on structure.
                                        // formatConfidence expects 0-1, getConfidenceColor expects 0-1.
                                        const cVal = cell.confidence && cell.confidence > 1 ? cell.confidence / 100 : (cell.confidence || 1);
                                        const confColor = getConfidenceColor(cVal, colors);

                                        return (
                                            <View
                                                key={cell.id || cellIdx}
                                                style={[
                                                    styles.tableDataCell,
                                                    { borderColor: colors.border },
                                                    cellIdx === 1 && { width: 160 },
                                                    cVal < 0.8 && { backgroundColor: getConfidenceBgColor(cVal, colors) },
                                                ]}
                                            >
                                                <Text style={[styles.tableCellText, { color: colors.text1 }]}>{cell.value}</Text>
                                                {cVal < 0.9 && (
                                                    <Text style={[styles.confDot, { color: confColor }]}>
                                                        {formatConfidence(cVal)}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.legendText, { color: colors.text2 }]}>≥90%</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                        <Text style={[styles.legendText, { color: colors.text2 }]}>70–89%</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                        <Text style={[styles.legendText, { color: colors.text2 }]}>&lt;70%</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.editBtn, { borderColor: colors.primary }]} onPress={handleEdit}>
                    <Text style={[styles.editBtnText, { color: colors.primary }]}>✏️ Edit Table</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.primary }]} onPress={handleExport}>
                    <Text style={styles.exportBtnText}>📤 Export</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingCenter: { justifyContent: 'center', alignItems: 'center' },
    scroll: { flex: 1 },
    headerRight: { flexDirection: 'row', gap: spacing.base },

    // Image area
    imageArea: {
        height: 180,
        margin: spacing.base,
        borderRadius: radius.card,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    realImage: { width: '100%', height: '100%' },
    imageEmoji: { fontSize: 48 },
    imageLabel: { fontSize: 12, marginTop: spacing.xs, fontFamily: typography.caption.fontFamily },
    collapseBtn: { position: 'absolute', bottom: 8, right: 12 },
    collapseBg: { backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    collapseText: { fontSize: 12, fontWeight: '600', fontFamily: typography.caption.fontFamily },
    expandBar: {
        margin: spacing.base,
        padding: spacing.md,
        borderRadius: radius.button,
        alignItems: 'center',
    },
    expandText: { fontSize: 13, fontWeight: '600', fontFamily: typography.caption.fontFamily },

    // Summary card
    summaryCard: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.md,
        borderRadius: radius.card,
        borderWidth: 1,
        padding: spacing.base,
        gap: spacing.sm,
        ...shadows.sm,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13, fontFamily: typography.caption.fontFamily },
    summaryValue: { fontSize: 13, fontWeight: '600', fontFamily: typography.body.fontFamily },
    confBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
    confBadgeText: { fontSize: 12, fontWeight: '700', fontFamily: typography.caption.fontFamily },

    // Table
    tableCard: {
        marginHorizontal: spacing.base,
        borderRadius: radius.card,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 100, // min height if no rows
        ...shadows.sm,
    },
    tableHeaderRow: { flexDirection: 'row' },
    tableHeaderCell: {
        width: 100, // Adjusted width
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
    },
    tableHeaderText: { fontSize: 12, fontWeight: '700', fontFamily: typography.caption.fontFamily },
    tableDataRow: { flexDirection: 'row' },
    tableDataCell: {
        width: 100, // Adjusted width
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    tableCellText: { fontSize: 13, textAlign: 'center', fontFamily: typography.body.fontFamily },
    confDot: { fontSize: 10, marginTop: 2, fontWeight: '600', fontFamily: typography.caption.fontFamily },

    // Legend
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.base,
        marginVertical: spacing.base,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, fontFamily: typography.caption.fontFamily },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        padding: spacing.base,
        gap: spacing.md,
        borderTopWidth: 1,
    },
    editBtn: {
        flex: 2,
        height: 48,
        borderWidth: 1.5,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },
    exportBtn: {
        flex: 3,
        height: 52,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },
});

export default TableReviewScreen;
