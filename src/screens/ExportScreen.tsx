// SCANKar — Export Screen (Screen 09)
// Format selection, options, live preview, and real export

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { EXPORT_FORMATS } from '../constants/config';
import { ExportFormat } from '../models/ExportPayload';
import { Scan } from '../models/Scan';
import { getScan } from '../services/storage/ScanStorage';
import { exportScan, shareFile, getMimeType } from '../services/ExportService';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ExportRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.EXPORT>;

const ExportScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ExportRouteProp>();
    const { colors } = useTheme();
    const { settings, updateStats, stats } = useApp();

    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(settings.defaultExportFormat);
    const [includeConfidence, setIncludeConfidence] = useState(settings.includeConfidenceByDefault);
    const [includeOriginalImage, setIncludeOriginalImage] = useState(true);
    const [autoOpenFile, setAutoOpenFile] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);
    const [scan, setScan] = useState<Scan | null>(null);

    const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);

    // Load scan data for live preview
    useEffect(() => {
        const load = async () => {
            const data = await getScan(route.params.scanId);
            if (data) { setScan(data); }
        };
        load();
    }, [route.params.scanId]);

    const handleExport = useCallback(async () => {
        if (!scan) {
            Alert.alert('Error', 'Scan data not loaded');
            return;
        }
        setIsExporting(true);

        try {
            const filePath = await exportScan(scan, selectedFormat, {
                includeConfidence,
                includeOriginalImage,
            });

            setIsExporting(false);
            setExportComplete(true);
            updateStats({ totalExports: stats.totalExports + 1 });

            const currentCount = parseInt((await AsyncStorage.getItem('scankar_exports_count')) || '0', 10);
            await AsyncStorage.setItem('scankar_exports_count', String(currentCount + 1));

            Alert.alert(
                'Export Complete ✓',
                `File saved to:\n${filePath}`,
                [
                    {
                        text: 'Share',
                        onPress: async () => {
                            try {
                                await shareFile(filePath, getMimeType(selectedFormat));
                            } catch (_e) { /* user cancelled share */ }
                        },
                    },
                    { text: 'Done', onPress: () => navigation.goBack() },
                ],
            );
        } catch (error) {
            setIsExporting(false);
            Alert.alert('Export Failed', String(error));
        }
    }, [scan, selectedFormat, includeConfidence, includeOriginalImage, navigation, updateStats, stats.totalExports]);

    // ── Live Preview Renderers ─────────────────────────────

    const renderTablePreview = () => {
        if (!scan?.tableData) { return <Text style={[styles.previewEmpty, { color: colors.text2 }]}>No table data</Text>; }
        const headers = scan.tableData.headers || [];
        const rows = scan.tableData.rows || [];
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {headers.length > 0 && (
                        <View style={styles.previewTableRow}>
                            {headers.map((h, i) => (
                                <View key={i} style={[styles.previewTh, { backgroundColor: colors.primarySubtle, borderColor: colors.border }]}>
                                    <Text style={[styles.previewThText, { color: colors.text1 }]} numberOfLines={1}>{h.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {rows.slice(0, 3).map((row, ri) => (
                        <View key={ri} style={styles.previewTableRow}>
                            {row.map((cell, ci) => (
                                <View key={ci} style={[styles.previewTd, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.previewTdText, { color: colors.text1 }]} numberOfLines={1}>{cell.value}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                    {rows.length > 3 && <Text style={[styles.previewMore, { color: colors.text2 }]}>+{rows.length - 3} more rows...</Text>}
                </View>
            </ScrollView>
        );
    };

    const renderParagraphPreview = () => {
        if (!scan?.paragraphData) { return <Text style={[styles.previewEmpty, { color: colors.text2 }]}>No text data</Text>; }
        const blocks = scan.paragraphData.blocks.slice(0, 4);
        return (
            <View>
                {blocks.map((b, i) => (
                    <Text key={i} style={[styles.previewBlockText, { color: colors.text1 }]} numberOfLines={2}>
                        {b.text}
                    </Text>
                ))}
                {scan.paragraphData.blocks.length > 4 && (
                    <Text style={[styles.previewMore, { color: colors.text2 }]}>+{scan.paragraphData.blocks.length - 4} more blocks...</Text>
                )}
            </View>
        );
    };

    const renderJsonPreview = () => {
        if (!scan) { return null; }
        const preview = {
            documentType: scan.documentType,
            confidence: scan.overallConfidence,
            blocks: scan.paragraphData ? scan.paragraphData.blocks.length : undefined,
            rows: scan.tableData?.rows?.length,
        };
        return (
            <Text style={[styles.previewJson, { color: '#22C55E', backgroundColor: '#0F172A' }]}>
                {JSON.stringify(preview, null, 2)}
            </Text>
        );
    };

    const renderCsvPreview = () => {
        if (!scan) { return null; }
        let lines: string[] = [];
        if (scan.tableData) {
            if (scan.tableData.headers) {
                lines.push(scan.tableData.headers.map(h => h.value).join(', '));
            }
            if (scan.tableData.rows) {
                lines = lines.concat(scan.tableData.rows.slice(0, 3).map(row => row.map(c => c.value).join(', ')));
            }
        } else if (scan.paragraphData) {
            lines = scan.paragraphData.blocks.slice(0, 3).map(b => b.text.substring(0, 60) + (b.text.length > 60 ? '...' : ''));
        }
        return (
            <Text style={[styles.previewCsv, { color: colors.text1, backgroundColor: colors.bg }]}>
                {lines.join('\n')}
            </Text>
        );
    };

    const renderLivePreview = () => {
        if (!scan) {
            return <ActivityIndicator size="small" color={colors.primary} />;
        }
        switch (selectedFormat) {
            case 'xlsx':
            case 'docx':
                return scan.tableData ? renderTablePreview() : renderParagraphPreview();
            case 'pdf':
                return scan.tableData ? renderTablePreview() : renderParagraphPreview();
            case 'csv':
                return renderCsvPreview();
            case 'json':
                return renderJsonPreview();
            default:
                return renderParagraphPreview();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Export"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Format Selection */}
                <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Export Format</Text>
                <View style={styles.formatGrid}>
                    {EXPORT_FORMATS.map((format) => {
                        const isSelected = selectedFormat === format.id;
                        return (
                            <TouchableOpacity
                                key={format.id}
                                style={[
                                    styles.formatCard,
                                    {
                                        backgroundColor: isSelected ? colors.primarySubtle : colors.surface,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        borderWidth: isSelected ? 2 : 1,
                                    },
                                ]}
                                onPress={() => setSelectedFormat(format.id as ExportFormat)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.formatIcon}>{format.icon}</Text>
                                <Text style={[styles.formatName, { color: isSelected ? colors.primary : colors.text1 }]}>
                                    {format.name}
                                </Text>
                                <Text style={[styles.formatExt, { color: colors.text2 }]}>{format.extension}</Text>
                                {isSelected && (
                                    <View style={[styles.selectedDot, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.selectedCheck}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Options */}
                <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Options</Text>
                <View style={[styles.optionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.optionRow}>
                        <View style={styles.optionLeft}>
                            <Text style={[styles.optionLabel, { color: colors.text1 }]}>Include Confidence Scores</Text>
                            <Text style={[styles.optionDesc, { color: colors.text2 }]}>
                                Add confidence % to each cell/block
                            </Text>
                        </View>
                        <Switch
                            value={includeConfidence}
                            onValueChange={setIncludeConfidence}
                            trackColor={{ false: colors.border, true: colors.primarySubtle }}
                            thumbColor={includeConfidence ? colors.primary : colors.text2}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.optionRow}>
                        <View style={styles.optionLeft}>
                            <Text style={[styles.optionLabel, { color: colors.text1 }]}>Include Original Image</Text>
                            <Text style={[styles.optionDesc, { color: colors.text2 }]}>
                                Attach scanned image to export
                            </Text>
                        </View>
                        <Switch
                            value={includeOriginalImage}
                            onValueChange={setIncludeOriginalImage}
                            trackColor={{ false: colors.border, true: colors.primarySubtle }}
                            thumbColor={includeOriginalImage ? colors.primary : colors.text2}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.optionRow}>
                        <View style={styles.optionLeft}>
                            <Text style={[styles.optionLabel, { color: colors.text1 }]}>Open After Export</Text>
                            <Text style={[styles.optionDesc, { color: colors.text2 }]}>
                                Auto-open file with default app
                            </Text>
                        </View>
                        <Switch
                            value={autoOpenFile}
                            onValueChange={setAutoOpenFile}
                            trackColor={{ false: colors.border, true: colors.primarySubtle }}
                            thumbColor={autoOpenFile ? colors.primary : colors.text2}
                        />
                    </View>
                </View>

                {/* Live Preview */}
                <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Preview</Text>
                <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.text2 }]}>Format</Text>
                        <Text style={[styles.previewValue, { color: colors.text1 }]}>
                            {selectedFormatInfo?.icon} {selectedFormatInfo?.name} ({selectedFormatInfo?.extension})
                        </Text>
                    </View>
                    <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.livePreviewArea}>
                        {renderLivePreview()}
                    </View>
                </View>
            </ScrollView>

            {/* Export Button */}
            <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.exportBtn,
                        { backgroundColor: isExporting ? colors.text2 : colors.primary },
                    ]}
                    onPress={handleExport}
                    disabled={isExporting}
                    activeOpacity={0.8}
                >
                    {isExporting ? (
                        <View style={styles.exportingRow}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={styles.exportBtnText}>  Exporting...</Text>
                        </View>
                    ) : exportComplete ? (
                        <Text style={styles.exportBtnText}>✓ Export Again</Text>
                    ) : (
                        <Text style={styles.exportBtnText}>
                            📤 Export as {selectedFormatInfo?.name}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingBottom: spacing.xxl },

    // Section
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        fontFamily: typography.h4.fontFamily,
    },

    // Format grid
    formatGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    formatCard: {
        width: '30%',
        aspectRatio: 0.85,
        borderRadius: radius.card,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        ...shadows.sm,
    },
    formatIcon: { fontSize: 28, marginBottom: spacing.xs },
    formatName: { fontSize: 13, fontWeight: '600', fontFamily: typography.body.fontFamily },
    formatExt: { fontSize: 11, marginTop: 2, fontFamily: typography.caption.fontFamily },
    selectedDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCheck: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

    // Options
    optionsCard: {
        borderRadius: radius.card,
        borderWidth: 1,
        ...shadows.sm,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.base,
    },
    optionLeft: { flex: 1, marginRight: spacing.md },
    optionLabel: { fontSize: 14, fontWeight: '600', fontFamily: typography.body.fontFamily },
    optionDesc: { fontSize: 12, marginTop: 2, fontFamily: typography.caption.fontFamily },
    divider: { height: 1, marginHorizontal: spacing.base },

    // Preview
    previewCard: {
        borderRadius: radius.card,
        borderWidth: 1,
        padding: spacing.base,
        gap: spacing.sm,
        ...shadows.sm,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewLabel: { fontSize: 13, fontFamily: typography.caption.fontFamily },
    previewValue: { fontSize: 13, fontWeight: '600', fontFamily: typography.body.fontFamily },
    previewDivider: { height: 1, marginVertical: spacing.sm },
    livePreviewArea: { minHeight: 60, paddingTop: spacing.xs },
    previewEmpty: { fontSize: 12, fontStyle: 'italic' },
    previewTableRow: { flexDirection: 'row' },
    previewTh: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 0.5, minWidth: 70 },
    previewThText: { fontSize: 11, fontWeight: '700', fontFamily: typography.caption.fontFamily },
    previewTd: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 0.5, minWidth: 70 },
    previewTdText: { fontSize: 11, fontFamily: typography.caption.fontFamily },
    previewMore: { fontSize: 11, fontStyle: 'italic', marginTop: spacing.xs },
    previewBlockText: { fontSize: 12, lineHeight: 18, marginBottom: spacing.xs, fontFamily: typography.body.fontFamily },
    previewJson: { fontSize: 11, fontFamily: 'monospace', padding: spacing.sm, borderRadius: radius.input, overflow: 'hidden' },
    previewCsv: { fontSize: 11, fontFamily: 'monospace', padding: spacing.sm, borderRadius: radius.input },

    // Action bar
    actionBar: {
        padding: spacing.base,
        borderTopWidth: 1,
    },
    exportBtn: {
        height: 56,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: typography.button.fontFamily,
    },
    exportingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ExportScreen;
