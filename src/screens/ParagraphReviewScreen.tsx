// SCANKar — Paragraph Review Screen (Screen 07)
// Shows extracted text with confidence highlighting and inline editing

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Animated,
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
import { getConfidenceColor, getConfidenceBgColor, formatConfidence, getConfidenceLevel } from '../utils/confidence';
import { generateId } from '../utils/formatters';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ReviewRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.PARAGRAPH_REVIEW>;

// Demo text blocks to visualize
interface DemoBlock {
    id: string;
    type: 'heading' | 'body';
    text: string;
    confidence: number;
    language: string;
    isHandwritten: boolean;
}

const DEMO_BLOCKS: DemoBlock[] = [
    {
        id: '1',
        type: 'heading',
        text: 'MATERIAL REQUISITION FORM',
        confidence: 0.97,
        language: 'English',
        isHandwritten: false,
    },
    {
        id: '2',
        type: 'body',
        text: 'Project: Endurance Building Phase-II\nDate: 15/01/2026\nReq. No: MRF-2026-0142',
        confidence: 0.93,
        language: 'English',
        isHandwritten: false,
    },
    {
        id: '3',
        type: 'body',
        text: 'Please procure the following materials for foundation work at Block-C. All items must conform to IS standards as specified in the approved drawings.',
        confidence: 0.89,
        language: 'English',
        isHandwritten: false,
    },
    {
        id: '4',
        type: 'body',
        text: 'अनुमोदित: श्री राजेश कुमार\nपद: साइट इंजीनियर\nदिनांक: 15/01/2026',
        confidence: 0.72,
        language: 'Hindi',
        isHandwritten: true,
    },
    {
        id: '5',
        type: 'body',
        text: 'Note: Delivery required before 20th January. Contact stores manager for receiving schedule.',
        confidence: 0.95,
        language: 'English',
        isHandwritten: false,
    },
];

const ParagraphReviewScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ReviewRouteProp>();
    const { colors } = useTheme();
    const { pushEdit, canUndo, undo } = useScan();

    const [blocks, setBlocks] = useState(DEMO_BLOCKS);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showOriginal, setShowOriginal] = useState(true);

    const overallConfidence = blocks.reduce((sum, b) => sum + b.confidence, 0) / blocks.length;

    const handleBlockPress = useCallback((block: DemoBlock) => {
        setEditingBlockId(block.id);
        setEditText(block.text);
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editingBlockId) return;
        const block = blocks.find(b => b.id === editingBlockId);
        if (!block || block.text === editText) {
            setEditingBlockId(null);
            return;
        }

        pushEdit({
            id: generateId(),
            type: 'cell_edit',
            timestamp: Date.now(),
            previousState: { blockId: editingBlockId, text: block.text },
            newState: { blockId: editingBlockId, text: editText },
        });

        setBlocks(prev =>
            prev.map(b =>
                b.id === editingBlockId ? { ...b, text: editText, confidence: 1 } : b
            )
        );
        setEditingBlockId(null);
    }, [editingBlockId, editText, blocks, pushEdit]);

    const handleCancelEdit = useCallback(() => {
        setEditingBlockId(null);
    }, []);

    const handleExport = useCallback(() => {
        navigation.navigate(ROUTES.EXPORT, { scanId: route.params.scanId });
    }, [navigation, route.params.scanId]);

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
                        <Text style={styles.imageEmoji}>📄</Text>
                        <Text style={[styles.imageLabel, { color: colors.text2 }]}>Original Document</Text>
                        <TouchableOpacity style={styles.collapseBtn} onPress={() => setShowOriginal(false)}>
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
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Blocks Detected</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>{blocks.length} text blocks</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Languages</Text>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>English, Hindi</Text>
                    </View>
                </View>

                {/* Text Blocks */}
                <View style={styles.blocksContainer}>
                    {blocks.map((block) => {
                        const confColor = getConfidenceColor(block.confidence, colors);
                        const confBgColor = getConfidenceBgColor(block.confidence, colors);
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
                                            {block.isHandwritten && (
                                                <View style={[styles.tag, { backgroundColor: colors.warningBg }]}>
                                                    <Text style={[styles.tagText, { color: colors.warning }]}>✍️ Handwritten</Text>
                                                </View>
                                            )}
                                            <View style={[styles.tag, { backgroundColor: colors.primarySubtle }]}>
                                                <Text style={[styles.tagText, { color: colors.primary }]}>{block.language}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.confPill, { backgroundColor: confBgColor }]}>
                                            <Text style={[styles.confPillText, { color: confColor }]}>
                                                {formatConfidence(block.confidence)}
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
                                                block.confidence < 0.8 && {
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
                                    {!isEditing && block.confidence < 0.9 && (
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
                        // Clipboard.setString(allText); — placeholder
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

    // Image area
    imageArea: {
        height: 160,
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
    blocksContainer: {
        paddingHorizontal: spacing.base,
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    blockCard: {
        borderRadius: radius.card,
        padding: spacing.base,
        ...shadows.sm,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    blockMeta: { flexDirection: 'row', gap: spacing.xs },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
    tagText: { fontSize: 10, fontWeight: '600', fontFamily: typography.caption.fontFamily },
    confPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
    confPillText: { fontSize: 11, fontWeight: '700', fontFamily: typography.caption.fontFamily },

    headingText: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 24,
        fontFamily: typography.h4.fontFamily,
    },
    bodyText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: typography.body.fontFamily,
    },

    tapHint: {
        fontSize: 11,
        marginTop: spacing.sm,
        fontStyle: 'italic',
        fontFamily: typography.caption.fontFamily,
    },

    // Edit controls
    editInput: {
        borderWidth: 1.5,
        borderRadius: radius.input,
        padding: spacing.md,
        fontSize: 15,
        lineHeight: 22,
        minHeight: 80,
        textAlignVertical: 'top',
        fontFamily: typography.body.fontFamily,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    cancelBtn: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.button,
    },
    cancelBtnText: { fontSize: 13, fontWeight: '600', fontFamily: typography.button.fontFamily },
    saveBtn: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.button,
    },
    saveBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        padding: spacing.base,
        gap: spacing.md,
        borderTopWidth: 1,
    },
    copyBtn: {
        flex: 2,
        height: 48,
        borderWidth: 1.5,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    copyBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },
    exportBtn: {
        flex: 3,
        height: 52,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },
});

export default ParagraphReviewScreen;
