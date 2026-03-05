// SCANKar — Text Editor Screen
// Full-screen paragraph text editor with block-level editing and save

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
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
import { generateId } from '../utils/formatters';
import { getScan, saveScan } from '../services/storage/ScanStorage';
import { Scan } from '../models/Scan';
import { TextBlock } from '../models/ParagraphData';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type EditorRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.TEXT_EDITOR>;

const TextEditorScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<EditorRouteProp>();
    const { colors } = useTheme();
    const { pushEdit } = useScan();

    const [scan, setScan] = useState<Scan | null>(null);
    const [blocks, setBlocks] = useState<TextBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getScan(route.params.scanId);
            if (data) {
                setScan(data);
                setBlocks(data.paragraphData?.blocks || []);
            }
            setIsLoading(false);
        };
        load();
    }, [route.params.scanId]);

    const handleBlockChange = useCallback((blockId: string, newText: string) => {
        setBlocks(prev =>
            prev.map(b => (b.id === blockId ? { ...b, text: newText } : b)),
        );
        setHasChanges(true);
    }, []);

    const handleAddBlock = useCallback(() => {
        const newBlock: TextBlock = {
            id: generateId(),
            text: '',
            confidence: 1,
            isManualEntry: true,
            language: 'english',
        };
        setBlocks(prev => [...prev, newBlock]);
        setHasChanges(true);
    }, []);

    const handleDeleteBlock = useCallback((blockId: string) => {
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        setHasChanges(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!scan) { return; }

        // Track edit history
        pushEdit({
            id: generateId(),
            type: 'cell_edit',
            timestamp: Date.now(),
            previousState: { blocks: scan.paragraphData?.blocks },
            newState: { blocks },
        });

        const updatedScan: Scan = {
            ...scan,
            isEdited: true,
            paragraphData: { blocks },
        };
        await saveScan(updatedScan);
        setHasChanges(false);
        navigation.goBack();
    }, [scan, blocks, pushEdit, navigation]);

    const handleBack = useCallback(() => {
        if (hasChanges) {
            Alert.alert('Unsaved Changes', 'Save before leaving?', [
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                { text: 'Save', onPress: handleSave },
            ]);
        } else {
            navigation.goBack();
        }
    }, [hasChanges, navigation, handleSave]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!scan) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.error }}>Failed to load scan data.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Edit Text"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={handleBack}
                rightIcons={
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
                            {hasChanges ? 'Save ●' : 'Done'}
                        </Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {blocks.map((block, index) => (
                    <View
                        key={block.id}
                        style={[styles.blockCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                        <View style={styles.blockHeader}>
                            <Text style={[styles.blockIndex, { color: colors.text2 }]}>
                                Block {index + 1}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleDeleteBlock(block.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={{ color: colors.error, fontSize: 13, fontWeight: '600' }}>
                                    🗑️ Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[
                                styles.blockInput,
                                {
                                    borderColor: colors.border,
                                    color: colors.text1,
                                    backgroundColor: colors.bg,
                                },
                            ]}
                            value={block.text}
                            onChangeText={(text) => handleBlockChange(block.id, text)}
                            multiline
                            placeholder="Enter text..."
                            placeholderTextColor={colors.text2}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.addBlockBtn, { borderColor: colors.primary }]}
                    onPress={handleAddBlock}
                >
                    <Text style={[styles.addBlockText, { color: colors.primary }]}>+ Add Block</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingBottom: spacing.xxl },
    blockCard: {
        borderRadius: radius.card,
        borderWidth: 1,
        padding: spacing.base,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    blockIndex: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: typography.caption.fontFamily,
    },
    blockInput: {
        borderWidth: 1,
        borderRadius: radius.input,
        padding: spacing.md,
        fontSize: 15,
        lineHeight: 22,
        minHeight: 80,
        textAlignVertical: 'top',
        fontFamily: typography.body.fontFamily,
    },
    addBlockBtn: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: radius.card,
        padding: spacing.base,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    addBlockText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: typography.button.fontFamily,
    },
});

export default TextEditorScreen;
