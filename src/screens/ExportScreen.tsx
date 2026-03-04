// SCANKar — Export Screen (Screen 09)
// Format selection, options, preview, and export execution

import React, { useState, useCallback } from 'react';
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

    const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);

    const handleExport = useCallback(async () => {
        setIsExporting(true);

        // Simulate export processing
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

        setIsExporting(false);
        setExportComplete(true);
        updateStats({ totalExports: stats.totalExports + 1 });

        // Persist export count to AsyncStorage so Home screen picks it up
        const currentCount = parseInt((await AsyncStorage.getItem('scankar_exports_count')) || '0', 10);
        await AsyncStorage.setItem('scankar_exports_count', String(currentCount + 1));

        Alert.alert(
            'Export Complete ✓',
            `File saved as ${selectedFormatInfo?.name} format.\n\nIn production, this will open the system share sheet or save to device storage.`,
            [
                { text: 'Share', onPress: () => { } },
                { text: 'Done', onPress: () => navigation.goBack() },
            ]
        );
    }, [selectedFormat, selectedFormatInfo, navigation, updateStats, stats.totalExports]);

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

                {/* Preview Summary */}
                <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Preview</Text>
                <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.text2 }]}>Format</Text>
                        <Text style={[styles.previewValue, { color: colors.text1 }]}>
                            {selectedFormatInfo?.icon} {selectedFormatInfo?.name} ({selectedFormatInfo?.extension})
                        </Text>
                    </View>
                    <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.text2 }]}>Scan ID</Text>
                        <Text style={[styles.previewValue, { color: colors.text1 }]}>{route.params.scanId}</Text>
                    </View>
                    <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.text2 }]}>Confidence</Text>
                        <Text style={[styles.previewValue, { color: colors.text1 }]}>
                            {includeConfidence ? 'Included' : 'Excluded'}
                        </Text>
                    </View>
                    <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.text2 }]}>Orig. Image</Text>
                        <Text style={[styles.previewValue, { color: colors.text1 }]}>
                            {includeOriginalImage ? 'Attached' : 'Not included'}
                        </Text>
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
