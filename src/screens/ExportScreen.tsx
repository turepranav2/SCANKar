// SCANKar — Export Screen (Screen 09)
// Format selection, swipeable rich preview, file naming, and save location

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
    Switch,
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
import { exportScan, shareFile, getMimeType, saveToDownloads } from '../services/ExportService';
import { FidelityLayer } from '../ml/ImageFidelityEngine';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ExportRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.EXPORT>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = SCREEN_WIDTH - spacing.base * 2;

type SaveOption = 'downloads' | 'share';

const ExportScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ExportRouteProp>();
    const { colors } = useTheme();
    const { settings, updateStats, stats } = useApp();

    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(settings.defaultExportFormat);
    const [includeOriginalImage, setIncludeOriginalImage] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);
    const [scan, setScan] = useState<Scan | null>(null);

    // FIX 4 — File naming modal
    const [showNameModal, setShowNameModal] = useState(false);
    const [fileName, setFileName] = useState('');

    // FIX 3 — Save location bottom sheet
    const [showSaveSheet, setShowSaveSheet] = useState(false);
    const [pendingFilePath, setPendingFilePath] = useState<string | null>(null);

    const previewListRef = useRef<FlatList>(null);

    const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);
    const formatIndex = EXPORT_FORMATS.findIndex(f => f.id === selectedFormat);

    // Load scan data for live preview
    useEffect(() => {
        const load = async () => {
            const data = await getScan(route.params.scanId);
            if (data) {
                setScan(data);
                setFileName(data.name);
            }
        };
        load();
    }, [route.params.scanId]);

    // Sync preview page with format selection
    useEffect(() => {
        if (formatIndex >= 0 && previewListRef.current) {
            previewListRef.current.scrollToIndex({ index: formatIndex, animated: true });
        }
    }, [formatIndex]);

    // FIX 4 — Show naming modal before export
    const handleExportPress = useCallback(() => {
        if (!scan) {
            Alert.alert('Error', 'Scan data not loaded');
            return;
        }
        setShowNameModal(true);
    }, [scan]);

    // After user confirms file name → actually export
    const handleConfirmName = useCallback(async () => {
        if (!scan) return;
        setShowNameModal(false);
        setIsExporting(true);

        try {
            const filePath = await exportScan(scan, selectedFormat, {
                includeConfidence: false,
                includeOriginalImage,
                customFileName: fileName.trim() || scan.name,
            });

            setIsExporting(false);
            setPendingFilePath(filePath);
            setShowSaveSheet(true);

            updateStats({ totalExports: stats.totalExports + 1 });
            const currentCount = parseInt((await AsyncStorage.getItem('scankar_exports_count')) || '0', 10);
            await AsyncStorage.setItem('scankar_exports_count', String(currentCount + 1));
        } catch (error) {
            setIsExporting(false);
            Alert.alert('Export Failed', String(error));
        }
    }, [scan, selectedFormat, includeOriginalImage, fileName, updateStats, stats.totalExports]);

    // FIX 3 — Handle save location choice
    const handleSaveChoice = useCallback(async (choice: SaveOption) => {
        setShowSaveSheet(false);
        if (!pendingFilePath) return;

        const ext = selectedFormatInfo?.extension || '.xlsx';
        const safeName = (fileName.trim() || scan?.name || 'export').replace(/[^a-zA-Z0-9_\- ]/g, '_');

        try {
            if (choice === 'downloads') {
                await saveToDownloads(pendingFilePath, `${safeName}${ext}`);
                setExportComplete(true);
                Alert.alert('Saved to Downloads', `File saved to:\nDownloads/SCANKar/${safeName}${ext}`, [
                    { text: 'Done', onPress: () => navigation.goBack() },
                ]);
            } else if (choice === 'share') {
                try {
                    await shareFile(pendingFilePath, getMimeType(selectedFormat));
                } catch (_e) { /* user cancelled share */ }
                setExportComplete(true);
            }
        } catch (error) {
            Alert.alert('Save Failed', String(error));
        }
    }, [pendingFilePath, selectedFormat, selectedFormatInfo, fileName, scan, navigation]);

    // ── FIX 6 — Swipeable Preview Renderers ────────────────────

    const fidelityLayer = scan ? (scan as any).fidelityLayer as FidelityLayer | undefined : undefined;

    const renderExcelPreview = () => {
        if (!scan) return <ActivityIndicator size="small" color={colors.primary} />;
        const headers = scan.tableData?.headers || [];
        const rows = scan.tableData?.rows || [];
        return (
            <View style={[styles.richPreviewPage, { backgroundColor: colors.surface }]}>
                <View style={[styles.previewHeader, { backgroundColor: '#2563EB' }]}>
                    <Text style={styles.previewHeaderText}>📊 Excel Preview</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewBody}>
                    <View>
                        {headers.length > 0 && (
                            <View style={styles.previewTableRow}>
                                {headers.map((h, i) => (
                                    <View key={i} style={[styles.excelTh, { backgroundColor: '#DBEAFE' }]}>
                                        <Text style={styles.excelThText} numberOfLines={1}>{h.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {rows.slice(0, 5).map((row, ri) => (
                            <View key={ri} style={styles.previewTableRow}>
                                {row.map((cell, ci) => (
                                    <View key={ci} style={[styles.excelTd, { backgroundColor: ri % 2 === 0 ? '#F8FAFC' : '#FFFFFF' }]}>
                                        <Text style={styles.excelTdText} numberOfLines={1}>{cell.value}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        {!scan.tableData && scan.paragraphData && (
                            <View style={{ padding: 8 }}>
                                {scan.paragraphData.blocks.slice(0, 3).map((b, i) => (
                                    <Text key={i} style={[styles.previewBlockText, { color: colors.text1 }]} numberOfLines={2}>{b.text}</Text>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderPdfPreview = () => {
        if (!scan) return <ActivityIndicator size="small" color={colors.primary} />;
        return (
            <View style={[styles.richPreviewPage, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.previewHeader, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.previewHeaderText}>📄 PDF Preview</Text>
                </View>
                <View style={[styles.pdfPage, { borderColor: '#E2E8F0' }]}>
                    {fidelityLayer ? (
                        // Show exact positions scaled down
                        <View style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                            {fidelityLayer.textBlocks.slice(0, 15).map((block, i) => {
                                const scaleX = (PREVIEW_WIDTH - 32) / fidelityLayer!.width;
                                const scaleY = 180 / fidelityLayer!.height;
                                const scale = Math.min(scaleX, scaleY);
                                return (
                                    <Text
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            left: block.x * scale,
                                            top: block.y * scale,
                                            fontSize: Math.max(6, block.fontSize * scale),
                                            fontWeight: block.isBold ? 'bold' : 'normal',
                                            color: '#1E293B',
                                        }}
                                        numberOfLines={1}
                                    >
                                        {block.text}
                                    </Text>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={{ padding: 8 }}>
                            <Text style={styles.pdfTitle}>{scan.name}</Text>
                            {scan.paragraphData?.blocks.slice(0, 4).map((b, i) => (
                                <Text key={i} style={styles.pdfBody} numberOfLines={2}>{b.text}</Text>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderWordPreview = () => {
        if (!scan) return <ActivityIndicator size="small" color={colors.primary} />;
        return (
            <View style={[styles.richPreviewPage, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.previewHeader, { backgroundColor: '#2563EB' }]}>
                    <Text style={styles.previewHeaderText}>📝 Word Preview</Text>
                </View>
                <View style={styles.wordPage}>
                    <Text style={[styles.wordTitle, { color: '#2563EB' }]}>{scan.name}</Text>
                    <View style={styles.wordDivider} />
                    {scan.tableData ? (
                        scan.tableData.rows?.slice(0, 3).map((row, ri) => (
                            <View key={ri} style={styles.previewTableRow}>
                                {row.map((cell, ci) => (
                                    <View key={ci} style={styles.wordCell}>
                                        <Text style={styles.wordCellText} numberOfLines={1}>{cell.value}</Text>
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        scan.paragraphData?.blocks.slice(0, 4).map((b, i) => (
                            <Text key={i} style={styles.wordBody} numberOfLines={2}>{b.text}</Text>
                        ))
                    )}
                </View>
            </View>
        );
    };

    const renderCsvPreview = () => {
        if (!scan) return <ActivityIndicator size="small" color={colors.primary} />;
        let lines: string[] = [];
        if (scan.tableData) {
            if (scan.tableData.headers) {
                lines.push(scan.tableData.headers.map(h => h.value).join(', '));
            }
            if (scan.tableData.rows) {
                lines = lines.concat(scan.tableData.rows.slice(0, 5).map(row => row.map(c => c.value).join(', ')));
            }
        } else if (scan.paragraphData) {
            lines = scan.paragraphData.blocks.slice(0, 5).map(b => b.text.substring(0, 60) + (b.text.length > 60 ? '...' : ''));
        }
        return (
            <View style={[styles.richPreviewPage, { backgroundColor: '#0F172A' }]}>
                <View style={[styles.previewHeader, { backgroundColor: '#334155' }]}>
                    <Text style={styles.previewHeaderText}>📋 CSV Preview</Text>
                </View>
                <View style={styles.csvBody}>
                    <Text style={styles.csvText}>{lines.join('\n')}</Text>
                </View>
            </View>
        );
    };

    const renderJsonPreview = () => {
        if (!scan) return <ActivityIndicator size="small" color={colors.primary} />;
        const preview = {
            documentType: scan.documentType,
            blocks: scan.paragraphData ? scan.paragraphData.blocks.length : undefined,
            rows: scan.tableData?.rows?.length,
        };
        return (
            <View style={[styles.richPreviewPage, { backgroundColor: '#0F172A' }]}>
                <View style={[styles.previewHeader, { backgroundColor: '#334155' }]}>
                    <Text style={styles.previewHeaderText}>{'{}'} JSON Preview</Text>
                </View>
                <View style={styles.jsonBody}>
                    <Text style={styles.jsonKey}>{'{'}</Text>
                    <Text style={styles.jsonText}>  <Text style={styles.jsonKey}>"documentType"</Text>: <Text style={styles.jsonString}>"{preview.documentType}"</Text>,</Text>
                    {preview.blocks !== undefined && (
                        <Text style={styles.jsonText}>  <Text style={styles.jsonKey}>"blocks"</Text>: <Text style={styles.jsonNumber}>{preview.blocks}</Text>,</Text>
                    )}
                    {preview.rows !== undefined && (
                        <Text style={styles.jsonText}>  <Text style={styles.jsonKey}>"rows"</Text>: <Text style={styles.jsonNumber}>{preview.rows}</Text>,</Text>
                    )}
                    <Text style={styles.jsonText}>  <Text style={styles.jsonKey}>"format"</Text>: <Text style={styles.jsonString}>"json"</Text></Text>
                    <Text style={styles.jsonKey}>{'}'}</Text>
                </View>
            </View>
        );
    };

    const previewPages = [
        { key: 'xlsx', render: renderExcelPreview },
        { key: 'pdf', render: renderPdfPreview },
        { key: 'docx', render: renderWordPreview },
        { key: 'csv', render: renderCsvPreview },
        { key: 'json', render: renderJsonPreview },
    ];

    const onPreviewScroll = useCallback((e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offsetX / PREVIEW_WIDTH);
        if (pageIndex >= 0 && pageIndex < EXPORT_FORMATS.length) {
            setSelectedFormat(EXPORT_FORMATS[pageIndex].id as ExportFormat);
        }
    }, []);

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

                {/* Options — FIX 5: Confidence toggle removed */}
                <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Options</Text>
                <View style={[styles.optionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                </View>

                {/* FIX 6 — Swipeable Rich Preview */}
                <View style={styles.previewSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Preview</Text>
                    <Text style={[styles.previewHint, { color: colors.text2 }]}>Swipe to see each format</Text>
                </View>
                <FlatList
                    ref={previewListRef}
                    data={previewPages}
                    keyExtractor={item => item.key}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onPreviewScroll}
                    getItemLayout={(_, index) => ({ length: PREVIEW_WIDTH, offset: PREVIEW_WIDTH * index, index })}
                    renderItem={({ item }) => (
                        <View style={{ width: PREVIEW_WIDTH }}>
                            {item.render()}
                        </View>
                    )}
                />
                {/* Page dots */}
                <View style={styles.dotRow}>
                    {EXPORT_FORMATS.map((f) => (
                        <View
                            key={f.id}
                            style={[
                                styles.dot,
                                { backgroundColor: selectedFormat === f.id ? colors.primary : colors.border },
                            ]}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Export Button */}
            <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.exportBtn,
                        { backgroundColor: isExporting ? colors.text2 : colors.primary },
                    ]}
                    onPress={handleExportPress}
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

            {/* FIX 4 — File Naming Modal */}
            <Modal visible={showNameModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.nameModal, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.nameModalTitle, { color: colors.text1 }]}>Name Your File</Text>
                        <TextInput
                            style={[styles.nameInput, { color: colors.text1, borderColor: colors.border, backgroundColor: colors.bg }]}
                            value={fileName}
                            onChangeText={setFileName}
                            placeholder="Enter file name"
                            placeholderTextColor={colors.text2}
                            autoFocus
                            selectTextOnFocus
                        />
                        <Text style={[styles.nameExt, { color: colors.text2 }]}>
                            Will be saved as: {fileName.trim() || 'export'}{selectedFormatInfo?.extension}
                        </Text>
                        <View style={styles.nameModalButtons}>
                            <TouchableOpacity
                                style={[styles.nameModalBtn, { backgroundColor: colors.bg }]}
                                onPress={() => setShowNameModal(false)}
                            >
                                <Text style={[styles.nameModalBtnText, { color: colors.text1 }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.nameModalBtn, { backgroundColor: colors.primary }]}
                                onPress={handleConfirmName}
                            >
                                <Text style={[styles.nameModalBtnText, { color: '#FFFFFF' }]}>Export</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* FIX 3 — Save Location Bottom Sheet */}
            <Modal visible={showSaveSheet} transparent animationType="slide">
                <View style={styles.sheetOverlay}>
                    <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setShowSaveSheet(false)} />
                    <View style={[styles.sheetContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
                        <Text style={[styles.sheetTitle, { color: colors.text1 }]}>Save Location</Text>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderColor: colors.border }]}
                            onPress={() => handleSaveChoice('downloads')}
                        >
                            <Text style={styles.sheetOptIcon}>📥</Text>
                            <View style={styles.sheetOptInfo}>
                                <Text style={[styles.sheetOptLabel, { color: colors.text1 }]}>Save to Downloads</Text>
                                <Text style={[styles.sheetOptDesc, { color: colors.text2 }]}>Downloads/SCANKar/</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderColor: colors.border }]}
                            onPress={() => handleSaveChoice('share')}
                        >
                            <Text style={styles.sheetOptIcon}>📤</Text>
                            <View style={styles.sheetOptInfo}>
                                <Text style={[styles.sheetOptLabel, { color: colors.text1 }]}>Share Only</Text>
                                <Text style={[styles.sheetOptDesc, { color: colors.text2 }]}>Share via other apps</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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

    // Preview section
    previewSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    previewHint: { fontSize: 12, fontStyle: 'italic' },

    // Rich preview pages
    richPreviewPage: {
        borderRadius: radius.card,
        overflow: 'hidden',
        minHeight: 220,
        marginRight: 0,
        ...shadows.sm,
    },
    previewHeader: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    previewHeaderText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    previewBody: {
        padding: 4,
        maxHeight: 190,
    },
    previewTableRow: { flexDirection: 'row' },
    excelTh: { paddingHorizontal: 8, paddingVertical: 6, minWidth: 80, borderWidth: 0.5, borderColor: '#93C5FD' },
    excelThText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
    excelTd: { paddingHorizontal: 8, paddingVertical: 5, minWidth: 80, borderWidth: 0.5, borderColor: '#E2E8F0' },
    excelTdText: { fontSize: 11, color: '#1E293B' },
    previewBlockText: { fontSize: 12, lineHeight: 18, marginBottom: spacing.xs },

    // PDF preview
    pdfPage: { margin: 8, borderWidth: 1, borderRadius: 4, padding: 8, minHeight: 180 },
    pdfTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
    pdfBody: { fontSize: 11, color: '#334155', lineHeight: 16, marginBottom: 4 },

    // Word preview
    wordPage: { padding: 12 },
    wordTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    wordDivider: { height: 2, backgroundColor: '#2563EB', marginBottom: 8 },
    wordCell: { paddingHorizontal: 6, paddingVertical: 4, minWidth: 70, borderWidth: 0.5, borderColor: '#CBD5E1' },
    wordCellText: { fontSize: 11, color: '#334155' },
    wordBody: { fontSize: 12, color: '#334155', lineHeight: 18, marginBottom: 6 },

    // CSV preview
    csvBody: { padding: 12 },
    csvText: { fontSize: 11, fontFamily: 'monospace', color: '#22C55E', lineHeight: 18 },

    // JSON preview
    jsonBody: { padding: 12 },
    jsonKey: { fontSize: 11, fontFamily: 'monospace', color: '#93C5FD' },
    jsonText: { fontSize: 11, fontFamily: 'monospace', color: '#E2E8F0', lineHeight: 18 },
    jsonString: { color: '#22C55E' },
    jsonNumber: { color: '#F59E0B' },

    // Page dots
    dotRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

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

    // FIX 4 — File naming modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    nameModal: {
        width: '100%',
        borderRadius: radius.card,
        padding: spacing.lg,
        ...shadows.lg,
    },
    nameModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
        fontFamily: typography.h3.fontFamily,
    },
    nameInput: {
        height: 48,
        borderWidth: 1,
        borderRadius: radius.input,
        paddingHorizontal: spacing.base,
        fontSize: 16,
        fontFamily: typography.body.fontFamily,
    },
    nameExt: {
        fontSize: 12,
        marginTop: spacing.sm,
        fontFamily: typography.caption.fontFamily,
    },
    nameModalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    nameModalBtn: {
        flex: 1,
        height: 44,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameModalBtnText: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: typography.button.fontFamily,
    },

    // FIX 3 — Save location bottom sheet
    sheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.lg,
        paddingBottom: 40,
        ...shadows.lg,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.lg,
        fontFamily: typography.h3.fontFamily,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        borderBottomWidth: 1,
    },
    sheetOptIcon: {
        fontSize: 28,
        marginRight: spacing.base,
    },
    sheetOptInfo: { flex: 1 },
    sheetOptLabel: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.body.fontFamily,
    },
    sheetOptDesc: {
        fontSize: 13,
        marginTop: 2,
        fontFamily: typography.caption.fontFamily,
    },
});

export default ExportScreen;
