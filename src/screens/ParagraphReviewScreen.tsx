// SCANKar — Paragraph Review Screen (Screen 07)
// Fetches real scan from AsyncStorage and displays dynamic extractions with inline editing

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    ActivityIndicator,
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
import { generateId } from '../utils/formatters';
import { getScan, saveScan } from '../services/storage/ScanStorage';
import { Scan } from '../models/Scan';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ReviewRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.PARAGRAPH_REVIEW>;

const ParagraphReviewScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ReviewRouteProp>();
    const { colors } = useTheme();
    const { pushEdit, canUndo, undo } = useScan();

    const [scan, setScan] = useState<Scan | null>(null);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showOriginal, setShowOriginal] = useState(true);

    useEffect(() => {
        const loadScan = async () => {
            const data = await getScan(route.params.scanId);
            if (data) {
                setScan(data);
                if (data.paragraphData?.blocks) {
                    setBlocks(data.paragraphData.blocks);
                }
            }
            setIsLoading(false);
        };
        loadScan();
    }, [route.params.scanId]);

    const overallConfidence = blocks.length > 0
        ? blocks.reduce((sum, b) => sum + b.confidence, 0) / blocks.length
        : 0;

    const handleBlockPress = useCallback((block: any) => {
        setEditingBlockId(block.id);
        setEditText(block.text);
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingBlockId || !scan) return;
        const block = blocks.find(b => b.id === editingBlockId);
        if (!block || block.text === editText) {
            setEditingBlockId(null);
            return;
        }

        const newBlocks = blocks.map(b =>
            b.id === editingBlockId ? { ...b, text: editText, confidence: 100 } : b
        );

        setBlocks(newBlocks);
        setEditingBlockId(null);

        // Track history context
        pushEdit({
            id: generateId(),
            type: 'cell_edit',
            timestamp: Date.now(),
            previousState: { blockId: editingBlockId, text: block.text },
            newState: { blockId: editingBlockId, text: editText },
        });

        // Save to DB
        const updatedScan: Scan = { ...scan };
        if (updatedScan.paragraphData) {
            updatedScan.paragraphData.blocks = newBlocks;
            updatedScan.isEdited = true;
            await saveScan(updatedScan);
            setScan(updatedScan);
        }
    }, [editingBlockId, editText, blocks, pushEdit, scan]);

    const handleCancelEdit = useCallback(() => {
        setEditingBlockId(null);
    }, []);

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

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Text Review"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
                rightIcons={
                    canUndo ? (
                        <TouchableOpacity onPress={() => undo()}>
                            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Undo</Text>
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Original Image (collapsible) */}
                {showOriginal && (
                    <View style={[styles.imageArea, { backgroundColor: colors.primarySubtle }]}>
                        {scan.originalImageUri ? (
                            <Image source={{ uri: scan.originalImageUri }} style={styles.realImage} resizeMode="contain" />
                        ) : (
                            <>
                                <Text style={styles.imageEmoji}>📄</Text>
                                <Text style={[styles.imageLabel, { color: colors.text2 }]}>No Image</Text>
                            </>
                        )}
                        <TouchableOpacity style={styles.collapseBtn} onPress={() => setShowOriginal(false)}>
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
                        <Text style={[styles.expandText, { color: colors.primary }]}>▶ Show Original</Text>
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
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Blocks Detected</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>{blocks.length} text blocks</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Language</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>{scan.languageDetected || 'Unknown'}</Text>
                    </View>
                </View>

                {/* Text Blocks */}
                <View style={styles.blocksContainer}>
                    {blocks.map((block) => {
                        const cVal = block.confidence > 1 ? block.confidence / 100 : block.confidence;
                        const confColor = getConfidenceColor(cVal, colors);
                        const confBgColor = getConfidenceBgColor(cVal, colors);
                        const isEditing = editingBlockId === block.id;

                        return (
                            <View key={block.id}>
                                <TouchableOpacity
                                    style={[
                                        styles.blockCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: isEditing ? colors.primary : colors.border,
                                            borderWidth: isEditing ? 2 : 1,
                                        },
                                    ]}
                                    onPress={() => handleBlockPress(block)}
                                    activeOpacity={0.8}
                                    disabled={isEditing}
                                >
                                    {/* Block header */}
                                    <View style={styles.blockHeader}>
                                        <View style={styles.blockMeta}>
                                            <View style={[styles.tag, { backgroundColor: colors.primarySubtle }]}>
                                                <Text style={[styles.tagText, { color: colors.primary }]}>{block.language || 'English'}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.confPill, { backgroundColor: confBgColor }]}>
                                            <Text style={[styles.confPillText, { color: confColor }]}>
                                                {formatConfidence(cVal)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Block content */}
                                    {isEditing ? (
                                        <TextInput
                                            style={[styles.editInput, { borderColor: colors.primary, color: colors.text1, backgroundColor: colors.bg }]}
                                            value={editText}
                                            onChangeText={setEditText}
                                            multiline
                                            autoFocus
                                        />
                                    ) : (
                                        <Text
                                            style={[
                                                block.type === 'heading' ? styles.headingText : styles.bodyText,
                                                { color: colors.text1 },
                                                cVal < 0.8 && {
                                                    backgroundColor: confBgColor,
                                                    paddingHorizontal: 4,
                                                    borderRadius: 4,
                                                },
                                            ]}
                                        >
                                            {block.text}
                                        </Text>
                                    )}

                                    {/* Edit controls */}
                                    {isEditing && (
                                        <View style={styles.editActions}>
                                            <TouchableOpacity
                                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                                onPress={handleCancelEdit}
                                            >
                                                <Text style={[styles.cancelBtnText, { color: colors.text2 }]}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                                onPress={handleSaveEdit}
                                            >
                                                <Text style={styles.saveBtnText}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Tap hint */}
                                    {!isEditing && cVal < 0.9 && (
                                        <Text style={[styles.tapHint, { color: colors.text2 }]}>Tap to edit</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.copyBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                        const allText = blocks.map(b => b.text).join('\n\n');
                        // Clipboard placeholder
                    }}
                >
                    <Text style={[styles.copyBtnText, { color: colors.primary }]}>📋 Copy All</Text>
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
    loadingCenter: { justifyContent: 'center', alignItems: 'center' },

    // Image area
    imageArea: {
        height: 160,
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

    // Summary
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

    // Text blocks
    blocksContainer: { paddingHorizontal: spacing.base, gap: spacing.md, paddingBottom: spacing.xl },
    blockCard: { borderRadius: radius.card, padding: spacing.base, ...shadows.sm },
    blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    blockMeta: { flexDirection: 'row', gap: spacing.xs },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
    tagText: { fontSize: 10, fontWeight: '600', fontFamily: typography.caption.fontFamily },
    confPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
    confPillText: { fontSize: 11, fontWeight: '700', fontFamily: typography.caption.fontFamily },

    headingText: { fontSize: 16, fontWeight: '700', lineHeight: 24, fontFamily: typography.h4.fontFamily },
    bodyText: { fontSize: 15, lineHeight: 22, fontFamily: typography.body.fontFamily },

    tapHint: { fontSize: 11, marginTop: spacing.sm, fontStyle: 'italic', fontFamily: typography.caption.fontFamily },

    // Edit controls
    editInput: { borderWidth: 1.5, borderRadius: radius.input, padding: spacing.md, fontSize: 15, lineHeight: 22, minHeight: 80, textAlignVertical: 'top', fontFamily: typography.body.fontFamily },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
    cancelBtn: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderWidth: 1, borderRadius: radius.button },
    cancelBtnText: { fontSize: 13, fontWeight: '600', fontFamily: typography.button.fontFamily },
    saveBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.button },
    saveBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },

    // Action bar
    actionBar: { flexDirection: 'row', padding: spacing.base, gap: spacing.md, borderTopWidth: 1 },
    copyBtn: { flex: 2, height: 48, borderWidth: 1.5, borderRadius: radius.button, justifyContent: 'center', alignItems: 'center' },
    copyBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },
    exportBtn: { flex: 3, height: 52, borderRadius: radius.button, justifyContent: 'center', alignItems: 'center' },
    exportBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },
});

export default ParagraphReviewScreen;
