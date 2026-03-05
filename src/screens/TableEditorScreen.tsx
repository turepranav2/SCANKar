// SCANKar — Table Editor Screen (Screen 08)
// Full-screen editable table grid with toolbar

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
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
import { generateId } from '../utils/formatters';
import { getScan, saveScan } from '../services/storage/ScanStorage';
import { Scan } from '../models/Scan';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type EditorRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.TABLE_EDITOR>;

interface CellData {
    text: string;
    confidence: number;
    isEdited: boolean;
}

// Build grid from real scan data
function buildGridFromScan(scan: Scan): CellData[][] {
    const grid: CellData[][] = [];
    if (scan.tableData) {
        // Header row
        if (scan.tableData.headers && scan.tableData.headers.length > 0) {
            grid.push(
                scan.tableData.headers.map(h => ({
                    text: h.value,
                    confidence: h.confidence,
                    isEdited: false,
                })),
            );
        }
        // Data rows
        if (scan.tableData.rows) {
            for (const row of scan.tableData.rows) {
                grid.push(
                    row.map(cell => ({
                        text: cell.value,
                        confidence: cell.confidence,
                        isEdited: false,
                    })),
                );
            }
        } else if (scan.tableData.cells) {
            for (const row of scan.tableData.cells) {
                grid.push(
                    row.map(cell => ({
                        text: cell.text,
                        confidence: cell.confidence,
                        isEdited: false,
                    })),
                );
            }
        }
    }
    // Fallback if empty
    if (grid.length === 0) {
        grid.push([{ text: '', confidence: 1, isEdited: false }]);
    }
    return grid;
}

const TableEditorScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<EditorRouteProp>();
    const { colors } = useTheme();
    const { pushEdit, canUndo, canRedo, undo, redo } = useScan();

    const [grid, setGrid] = useState<CellData[][]>([[{ text: '', confidence: 1, isEdited: false }]]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [scanRef, setScanRef] = useState<Scan | null>(null);

    // Load real scan data from AsyncStorage
    useEffect(() => {
        const loadScan = async () => {
            const data = await getScan(route.params.scanId);
            if (data) {
                setScanRef(data);
                setGrid(buildGridFromScan(data));
            }
            setIsLoading(false);
        };
        loadScan();
    }, [route.params.scanId]);

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

    const handleDone = useCallback(async () => {
        handleCellUpdate();
        // Save edited grid back to AsyncStorage
        if (scanRef) {
            const updatedScan: Scan = { ...scanRef, isEdited: true };
            if (updatedScan.tableData) {
                // Update headers from row 0
                if (grid[0]) {
                    updatedScan.tableData.headers = grid[0].map((cell, i) => ({
                        id: `h_${i}`,
                        value: cell.text,
                        confidence: cell.confidence,
                    }));
                }
                // Update rows from row 1+
                updatedScan.tableData.rows = grid.slice(1).map(row =>
                    row.map((cell, i) => ({
                        id: `c_${i}`,
                        value: cell.text,
                        confidence: cell.confidence,
                    })),
                );
            }
            await saveScan(updatedScan);
        }
        navigation.goBack();
    }, [navigation, handleCellUpdate, scanRef, grid]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
            <>
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
            </>
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
