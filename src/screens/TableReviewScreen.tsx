// SCANKar — Table Review Screen (Screen 06)
// Split-panel: original image top + extracted table bottom

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { getConfidenceColor, getConfidenceBgColor, formatConfidence } from '../utils/confidence';
import { TableCell } from '../models/TableData';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ReviewRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.TABLE_REVIEW>;

// Demo data for visual preview
const DEMO_HEADERS = ['Sr', 'Item', 'Qty', 'Rate', 'Amount'];
const DEMO_ROWS: { text: string; confidence: number }[][] = [
    [
        { text: '1', confidence: 0.98 },
        { text: 'Cement OPC 53 Grade', confidence: 0.95 },
        { text: '100', confidence: 0.97 },
        { text: '380', confidence: 0.96 },
        { text: '38,000', confidence: 0.94 },
    ],
    [
        { text: '2', confidence: 0.99 },
        { text: 'TMT Steel Bars 12mm', confidence: 0.88 },
        { text: '50', confidence: 0.96 },
        { text: '65,000', confidence: 0.72 },
        { text: '32,50,000', confidence: 0.68 },
    ],
    [
        { text: '3', confidence: 0.97 },
        { text: 'River Sand (Fine)', confidence: 0.92 },
        { text: '200', confidence: 0.95 },
        { text: '1,200', confidence: 0.91 },
        { text: '2,40,000', confidence: 0.93 },
    ],
    [
        { text: '4', confidence: 0.98 },
        { text: 'Aggregate 20mm', confidence: 0.85 },
        { text: '150', confidence: 0.94 },
        { text: '950', confidence: 0.82 },
        { text: '1,42,500', confidence: 0.80 },
    ],
];

const TableReviewScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ReviewRouteProp>();
    const { colors } = useTheme();
    const [showOriginal, setShowOriginal] = useState(true);

    const overallConfidence = useMemo(() => {
        let sum = 0;
        let count = 0;
        DEMO_ROWS.forEach(row => row.forEach(cell => { sum += cell.confidence; count++; }));
        return sum / count;
    }, []);

    const handleEdit = useCallback(() => {
        navigation.navigate(ROUTES.TABLE_EDITOR, { scanId: route.params.scanId });
    }, [navigation, route.params.scanId]);

    const handleExport = useCallback(() => {
        navigation.navigate(ROUTES.EXPORT, { scanId: route.params.scanId });
    }, [navigation, route.params.scanId]);

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
                        <Text style={styles.imageEmoji}>📄</Text>
                        <Text style={[styles.imageLabel, { color: colors.text2 }]}>Original Document</Text>
                        <TouchableOpacity
                            style={styles.collapseBtn}
                            onPress={() => setShowOriginal(false)}
                        >
                            <Text style={[styles.collapseText, { color: colors.primary }]}>▼ Hide</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!showOriginal && (
                    <TouchableOpacity
                        style={[styles.expandBar, { backgroundColor: colors.primarySubtle }]}
                        onPress={() => setShowOriginal(true)}
                    >
                        <Text style={[styles.expandText, { color: colors.primary }]}>▶ Show Original</Text>
                    </TouchableOpacity>
                )}

                {/* Confidence Summary */}
                <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Overall Confidence</Text>
                        <View style={[styles.confBadge, { backgroundColor: getConfidenceBgColor(overallConfidence, colors) }]}>
                            <Text style={[styles.confBadgeText, { color: getConfidenceColor(overallConfidence, colors) }]}>
                                {formatConfidence(overallConfidence)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Detected</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>
                            {DEMO_ROWS.length} rows × {DEMO_HEADERS.length} columns
                        </Text>
                    </View>
                </View>

                {/* Extracted Table */}
                <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View>
                            {/* Header row */}
                            <View style={styles.tableHeaderRow}>
                                {DEMO_HEADERS.map((header, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.tableHeaderCell,
                                            { backgroundColor: colors.primarySubtle, borderColor: colors.border },
                                            index === 1 && { width: 160 },
                                        ]}
                                    >
                                        <Text style={[styles.tableHeaderText, { color: colors.primary }]}>{header}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Data rows */}
                            {DEMO_ROWS.map((row, rowIdx) => (
                                <View key={rowIdx} style={styles.tableDataRow}>
                                    {row.map((cell, cellIdx) => {
                                        const confColor = getConfidenceColor(cell.confidence, colors);
                                        return (
                                            <View
                                                key={cellIdx}
                                                style={[
                                                    styles.tableDataCell,
                                                    { borderColor: colors.border },
                                                    cellIdx === 1 && { width: 160 },
                                                    cell.confidence < 0.8 && { backgroundColor: getConfidenceBgColor(cell.confidence, colors) },
                                                ]}
                                            >
                                                <Text style={[styles.tableCellText, { color: colors.text1 }]}>{cell.text}</Text>
                                                {cell.confidence < 0.9 && (
                                                    <Text style={[styles.confDot, { color: confColor }]}>
                                                        {formatConfidence(cell.confidence)}
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
    },
    imageEmoji: { fontSize: 48 },
    imageLabel: { fontSize: 12, marginTop: spacing.xs, fontFamily: typography.caption.fontFamily },
    collapseBtn: { position: 'absolute', bottom: 8, right: 12 },
    collapseText: { fontSize: 12, fontFamily: typography.caption.fontFamily },
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
        ...shadows.sm,
    },
    tableHeaderRow: { flexDirection: 'row' },
    tableHeaderCell: {
        width: 90,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
    },
    tableHeaderText: { fontSize: 12, fontWeight: '700', fontFamily: typography.caption.fontFamily },
    tableDataRow: { flexDirection: 'row' },
    tableDataCell: {
        width: 90,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    tableCellText: { fontSize: 13, textAlign: 'center', fontFamily: typography.body.fontFamily },
    confDot: { fontSize: 9, marginTop: 2, fontFamily: typography.caption.fontFamily },

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
