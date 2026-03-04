// SCANKar — Table Editor Screen (Screen 08)
// Full-screen editable table grid with toolbar

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
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

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type EditorRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.TABLE_EDITOR>;

interface CellData {
    text: string;
    confidence: number;
    isEdited: boolean;
}

// Initial demo grid
const createInitialGrid = (): CellData[][] => [
    [
        { text: 'Sr', confidence: 1, isEdited: false },
        { text: 'Item', confidence: 1, isEdited: false },
        { text: 'Qty', confidence: 1, isEdited: false },
        { text: 'Rate', confidence: 1, isEdited: false },
        { text: 'Amount', confidence: 1, isEdited: false },
    ],
    [
        { text: '1', confidence: 0.98, isEdited: false },
        { text: 'Cement OPC 53 Grade', confidence: 0.95, isEdited: false },
        { text: '100', confidence: 0.97, isEdited: false },
        { text: '380', confidence: 0.96, isEdited: false },
        { text: '38,000', confidence: 0.94, isEdited: false },
    ],
    [
        { text: '2', confidence: 0.99, isEdited: false },
        { text: 'TMT Steel Bars 12mm', confidence: 0.88, isEdited: false },
        { text: '50', confidence: 0.96, isEdited: false },
        { text: '65,000', confidence: 0.72, isEdited: false },
        { text: '32,50,000', confidence: 0.68, isEdited: false },
    ],
    [
        { text: '3', confidence: 0.97, isEdited: false },
        { text: 'River Sand (Fine)', confidence: 0.92, isEdited: false },
        { text: '200', confidence: 0.95, isEdited: false },
        { text: '1,200', confidence: 0.91, isEdited: false },
        { text: '2,40,000', confidence: 0.93, isEdited: false },
    ],
];

const TableEditorScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<EditorRouteProp>();
    const { colors } = useTheme();
    const { pushEdit, canUndo, canRedo, undo, redo } = useScan();

    const [grid, setGrid] = useState<CellData[][]>(createInitialGrid);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [editText, setEditText] = useState('');

    const numRows = grid.length;
    const numCols = grid[0]?.length ?? 0;

    const handleCellPress = useCallback((row: number, col: number) => {
        setSelectedCell({ row, col });
        setEditText(grid[row][col].text);
    }, [grid]);

    const handleCellUpdate = useCallback(() => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        const oldText = grid[row][col].text;
        if (oldText === editText) return;

        pushEdit({
            id: generateId(),
            type: 'cell_edit',
            timestamp: Date.now(),
            previousState: { row, col, text: oldText },
            newState: { row, col, text: editText },
        });

        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = { text: editText, confidence: 1, isEdited: true };
            return newGrid;
        });
    }, [selectedCell, editText, grid, pushEdit]);

    const handleAddRow = useCallback(() => {
        setGrid(prev => [
            ...prev,
            Array.from({ length: numCols }, () => ({ text: '', confidence: 1, isEdited: true })),
        ]);
    }, [numCols]);

    const handleAddCol = useCallback(() => {
        setGrid(prev =>
            prev.map(row => [...row, { text: '', confidence: 1, isEdited: true }])
        );
    }, []);

    const handleDeleteRow = useCallback(() => {
        if (numRows <= 1) return;
        if (selectedCell) {
            setGrid(prev => prev.filter((_, idx) => idx !== selectedCell.row));
            setSelectedCell(null);
        } else {
            setGrid(prev => prev.slice(0, -1));
        }
    }, [numRows, selectedCell]);

    const handleUndo = useCallback(() => {
        const action = undo();
        if (!action) return;
        if (action.type === 'cell_edit' && action.previousState) {
            const { row, col, text } = action.previousState as { row: number; col: number; text: string };
            setGrid(prev => {
                const g = prev.map(r => [...r]);
                if (g[row] && g[row][col]) {
                    g[row][col] = { text, confidence: 1, isEdited: false };
                }
                return g;
            });
        }
    }, [undo]);

    const handleRedo = useCallback(() => {
        const action = redo();
        if (!action) return;
        if (action.type === 'cell_edit' && action.newState) {
            const { row, col, text } = action.newState as { row: number; col: number; text: string };
            setGrid(prev => {
                const g = prev.map(r => [...r]);
                if (g[row] && g[row][col]) {
                    g[row][col] = { text, confidence: 1, isEdited: true };
                }
                return g;
            });
        }
    }, [redo]);

    const handleDone = useCallback(() => {
        handleCellUpdate();
        navigation.goBack();
    }, [navigation, handleCellUpdate]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Top Bar */}
            <TopBar
                title="Edit Table"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
                rightIcons={
                    <TouchableOpacity onPress={handleDone}>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Done</Text>
                    </TouchableOpacity>
                }
            />

            {/* Toolbar */}
            <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.toolBtn, !canUndo && styles.toolBtnDisabled]}
                    onPress={handleUndo}
                    disabled={!canUndo}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.toolIcon}>↩️</Text>
                    <Text style={[styles.toolLabel, { color: canUndo ? colors.text1 : colors.text2 }]}>Undo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toolBtn, !canRedo && styles.toolBtnDisabled]}
                    onPress={handleRedo}
                    disabled={!canRedo}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.toolIcon}>↪️</Text>
                    <Text style={[styles.toolLabel, { color: canRedo ? colors.text1 : colors.text2 }]}>Redo</Text>
                </TouchableOpacity>

                <View style={[styles.toolDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity style={styles.toolBtn} onPress={handleAddRow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.toolIcon}>➕</Text>
                    <Text style={[styles.toolLabel, { color: colors.text1 }]}>Row</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={handleAddCol} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.toolIcon}>➕</Text>
                    <Text style={[styles.toolLabel, { color: colors.text1 }]}>Col</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={handleDeleteRow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.toolIcon}>🗑️</Text>
                    <Text style={[styles.toolLabel, { color: colors.error }]}>Del</Text>
                </TouchableOpacity>
            </View>

            {/* Editable Grid */}
            <ScrollView style={styles.gridScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                    <View>
                        {grid.map((row, rowIdx) => (
                            <View key={rowIdx} style={styles.gridRow}>
                                {row.map((cell, colIdx) => {
                                    const isSelected =
                                        selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                                    const isHeader = rowIdx === 0;

                                    return (
                                        <TouchableOpacity
                                            key={colIdx}
                                            style={[
                                                styles.gridCell,
                                                {
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                    backgroundColor: isHeader
                                                        ? colors.primarySubtle
                                                        : cell.isEdited
                                                            ? '#FFFDE7'
                                                            : colors.surface,
                                                },
                                                isSelected && { borderWidth: 2 },
                                                colIdx === 1 && { width: 160 },
                                            ]}
                                            onPress={() => handleCellPress(rowIdx, colIdx)}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.gridCellText,
                                                    {
                                                        color: colors.text1,
                                                        fontWeight: isHeader ? '700' : '400',
                                                    },
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {cell.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>

            {/* Inline Editor (when cell selected) */}
            {selectedCell && (
                <View style={[styles.editBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <Text style={[styles.editLabel, { color: colors.text2 }]}>
                        R{selectedCell.row + 1}C{selectedCell.col + 1}
                    </Text>
                    <TextInput
                        style={[styles.editInput, { borderColor: colors.primary, color: colors.text1, backgroundColor: colors.bg }]}
                        value={editText}
                        onChangeText={setEditText}
                        onBlur={handleCellUpdate}
                        onSubmitEditing={handleCellUpdate}
                        autoFocus
                        returnKeyType="done"
                    />
                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                        onPress={() => { handleCellUpdate(); setSelectedCell(null); }}
                    >
                        <Text style={styles.confirmBtnText}>✓</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Toolbar
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        gap: spacing.sm,
    },
    toolBtn: { alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 4 },
    toolBtnDisabled: { opacity: 0.3 },
    toolIcon: { fontSize: 18 },
    toolLabel: { fontSize: 10, marginTop: 2, fontFamily: typography.caption.fontFamily },
    toolDivider: { width: 1, height: 30, marginHorizontal: 4 },

    // Grid
    gridScroll: { flex: 1, padding: spacing.md },
    gridRow: { flexDirection: 'row' },
    gridCell: {
        width: 90,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    gridCellText: { fontSize: 13, textAlign: 'center', fontFamily: typography.body.fontFamily },

    // Inline editor
    editBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
        borderTopWidth: 1,
    },
    editLabel: { fontSize: 12, fontWeight: '600', width: 44, fontFamily: typography.caption.fontFamily },
    editInput: {
        flex: 1,
        height: 44,
        borderWidth: 1.5,
        borderRadius: radius.input,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        fontFamily: typography.body.fontFamily,
    },
    confirmBtn: {
        width: 44,
        height: 44,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});

export default TableEditorScreen;
