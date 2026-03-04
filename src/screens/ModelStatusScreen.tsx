// SCANKar — Model Status Screen (Screen 12)
// Shows status of all 7 TFLite ML models via ModelManager

import React, { useMemo, useEffect, useState } from 'react';
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
import { ModelManager } from '../ml';
import type { ModelStatus } from '../ml';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

type NavProp = NativeStackNavigationProp<SettingsStackParamList>;

type StatusKey = ModelStatus['status']; // 'loaded' | 'missing' | 'error' | 'loading'

const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string; label: string; icon: string }> = {
    loaded: { color: '#22C55E', bg: '#F0FDF4', label: 'Ready', icon: '●' },
    missing: { color: '#F59E0B', bg: '#FFFBEB', label: 'Awaiting model', icon: '○' },
    loading: { color: '#3B82F6', bg: '#EFF6FF', label: 'Loading', icon: '⏳' },
    error: { color: '#EF4444', bg: '#FEF2F2', label: 'Error', icon: '✕' },
};

const formatSizeKB = (sizeMB: number): string => {
    const kb = sizeMB * 1024;
    if (kb < 1) return `${Math.round(sizeMB * 1024 * 1024)} B`;
    return `${kb.toFixed(1)} KB`;
};

const ModelStatusScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { colors } = useTheme();
    const [verified, setVerified] = useState(false);

    const models = useMemo(() => ModelManager.getModelStatus(), []);
    const totalKB = Math.round(models.reduce((sum, m) => sum + m.sizeMB * 1024, 0));
    const loadedCount = models.filter(m => m.status === 'loaded').length;
    const missingCount = models.filter(m => m.status === 'missing').length;
    const allLoaded = loadedCount === models.length;

    // Run async asset verification on mount
    useEffect(() => {
        ModelManager.checkModelsLoaded().then((ok) => {
            setVerified(ok);
        });
    }, []);

    const renderModel = ({ item }: { item: ModelStatus }) => {
        const config = STATUS_CONFIG[item.status];
        // Use display name from registry
        const displayName = ModelManager.getDisplayName(item.name);

        return (
            <View style={[styles.modelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modelHeader}>
                    <View style={styles.modelNameRow}>
                        <Text style={[styles.modelName, { color: colors.text1 }]}>{displayName}</Text>
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
                        <Text style={[styles.detailValue, { color: colors.text1 }]}>{formatSizeKB(item.sizeMB)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.text2 }]}>File</Text>
                        <Text style={[styles.detailValue, { color: colors.text1 }]} numberOfLines={1}>{item.filename}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.text2 }]}>Verified</Text>
                        <Text style={[styles.detailValue, { color: item.status === 'loaded' ? '#22C55E' : colors.text1 }]}>
                            {item.status === 'loaded' ? '✓' : '—'}
                        </Text>
                    </View>
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

            {/* Info banner — conditional on model state */}
            {allLoaded ? (
                <View style={[styles.infoBanner, { backgroundColor: '#F0FDF4', borderColor: '#22C55E' }]}>
                    <Text style={styles.infoBannerIcon}>✅</Text>
                    <Text style={[styles.infoBannerText, { color: '#166534' }]}>
                        {totalKB} KB — All {models.length} models loaded and ready
                    </Text>
                </View>
            ) : missingCount > 0 ? (
                <View style={[styles.infoBanner, { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }]}>
                    <Text style={styles.infoBannerIcon}>ℹ️</Text>
                    <Text style={styles.infoBannerText}>
                        {missingCount} model{missingCount > 1 ? 's' : ''} pending — using smart mock data. Drop .tflite files into assets/models/ to activate.
                    </Text>
                </View>
            ) : null}

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>{models.length}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Total</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>{loadedCount}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Ready</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: colors.text1 }]}>{totalKB} KB</Text>
                        <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Total Size</Text>
                    </View>
                </View>
            </View>

            {/* Model List */}
            <FlatList
                data={models}
                renderItem={renderModel}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Info Banner
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.base,
        marginTop: spacing.md,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderRadius: radius.card,
        borderWidth: 1,
        gap: 8,
    },
    infoBannerIcon: { fontSize: 16 },
    infoBannerText: {
        flex: 1,
        fontSize: 12,
        color: '#92400E',
        fontFamily: typography.caption.fontFamily,
        lineHeight: 16,
    },

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
