// SCANKar — Model Status Screen (Screen 12)
// Shows status of all 7 TFLite ML models

import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/common/TopBar';
import { SettingsStackParamList } from '../navigation/MainNavigator';
import { ML_MODELS } from '../constants/mlModels';
import { MLModelInfo, ModelStatus } from '../models/MLModel';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

type NavProp = NativeStackNavigationProp<SettingsStackParamList>;

// Simulate model statuses
const MODEL_STATUSES: Record<string, { status: ModelStatus; loadTimeMs?: number }> = {
    image_enhancement: { status: 'loaded', loadTimeMs: 120 },
    document_detector: { status: 'loaded', loadTimeMs: 85 },
    table_recognizer: { status: 'loaded', loadTimeMs: 210 },
    cell_extractor: { status: 'loaded', loadTimeMs: 95 },
    text_recognizer_en: { status: 'loaded', loadTimeMs: 180 },
    text_recognizer_hi: { status: 'idle' },
    layout_analyzer: { status: 'loaded', loadTimeMs: 150 },
};

const STATUS_CONFIG: Record<ModelStatus, { color: string; bg: string; label: string; icon: string }> = {
    idle: { color: '#94A3B8', bg: '#F1F5F9', label: 'Idle', icon: '○' },
    loading: { color: '#F59E0B', bg: '#FFFBEB', label: 'Loading', icon: '⏳' },
    loaded: { color: '#22C55E', bg: '#F0FDF4', label: 'Ready', icon: '✓' },
    error: { color: '#EF4444', bg: '#FEF2F2', label: 'Error', icon: '✕' },
};

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
};

const ModelStatusScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { colors } = useTheme();

    const totalSize = ML_MODELS.reduce((sum, m) => sum + m.sizeBytes, 0);
    const loadedCount = Object.values(MODEL_STATUSES).filter(s => s.status === 'loaded').length;

    const renderModel = ({ item }: { item: MLModelInfo }) => {
        const statusInfo = MODEL_STATUSES[item.id] || { status: 'idle' as ModelStatus };
        const config = STATUS_CONFIG[statusInfo.status];

        return (
            <View style={[styles.modelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modelHeader}>
                    <View style={styles.modelNameRow}>
                        <Text style={[styles.modelName, { color: colors.text1 }]}>{item.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                            <Text style={[styles.statusIcon, { color: config.color }]}>{config.icon}</Text>
                            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                        </View>
                    </View>
                    <Text style={[styles.modelPurpose, { color: colors.text2 }]}>{item.purpose}</Text>
                </View>

                <View style={[styles.modelDetails, { borderTopColor: colors.border }]}>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.text2 }]}>Size</Text>
                        <Text style={[styles.detailValue, { color: colors.text1 }]}>{formatSize(item.sizeBytes)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.text2 }]}>Input</Text>
                        <Text style={[styles.detailValue, { color: colors.text1 }]}>{item.inputShape.join('×')}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.text2 }]}>Quantized</Text>
                        <Text style={[styles.detailValue, { color: colors.text1 }]}>{item.quantized ? 'Yes' : 'No'}</Text>
                    </View>
                    {statusInfo.loadTimeMs && (
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: colors.text2 }]}>Load</Text>
                            <Text style={[styles.detailValue, { color: colors.text1 }]}>{statusInfo.loadTimeMs}ms</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Model Status"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
            />

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>{ML_MODELS.length}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Total</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>{loadedCount}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Ready</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>{formatSize(totalSize)}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Total Size</Text>
                    </View>
                </View>
            </View>

            {/* Model List */}
            <FlatList
                data={ML_MODELS}
                renderItem={renderModel}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Summary
    summaryCard: {
        marginHorizontal: spacing.base,
        marginTop: spacing.md,
        borderRadius: radius.card,
        borderWidth: 1,
        ...shadows.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: typography.h2.fontFamily,
    },
    summaryLabel: {
        fontSize: 11,
        marginTop: 2,
        fontFamily: typography.caption.fontFamily,
    },
    summaryDivider: { width: 1, height: 36 },

    // Model list
    list: {
        padding: spacing.base,
        gap: spacing.md,
        paddingBottom: spacing.xxl,
    },
    modelCard: {
        borderRadius: radius.card,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadows.sm,
    },
    modelHeader: {
        padding: spacing.base,
    },
    modelNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modelName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        fontFamily: typography.body.fontFamily,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.pill,
        gap: 4,
    },
    statusIcon: { fontSize: 12, fontWeight: '700' },
    statusLabel: { fontSize: 11, fontWeight: '600', fontFamily: typography.caption.fontFamily },
    modelPurpose: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: typography.caption.fontFamily,
    },

    // Details
    modelDetails: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        gap: spacing.base,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 10,
        fontFamily: typography.caption.fontFamily,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
        fontFamily: typography.body.fontFamily,
    },
});

export default ModelStatusScreen;
