// SCANKar — Settings Screen (Screen 11)
// Grouped settings with sections

import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet,
    Alert,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useApp, AppSettings } from '../context/AppContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { SettingsStackParamList } from '../navigation/MainNavigator';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { APP_CONFIG, EXPORT_FORMATS } from '../constants/config';
import { ExportFormat } from '../models/ExportPayload';
import { clearCache, clearAllHistory } from '../services/storage/SettingsStorage';

type NavProp = NativeStackNavigationProp<SettingsStackParamList>;

// ─── Reusable Components ───

interface SettingRowProps {
    label: string;
    desc?: string;
    rightElement: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, desc, rightElement }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <Text style={[styles.settingLabel, { color: colors.text1 }]}>{label}</Text>
                {desc && <Text style={[styles.settingDesc, { color: colors.text2 }]}>{desc}</Text>}
            </View>
            {rightElement}
        </View>
    );
};

interface SettingButtonProps {
    label: string;
    icon: string;
    onPress: () => void;
    destructive?: boolean;
}

const SettingButton: React.FC<SettingButtonProps> = ({ label, icon, onPress, destructive }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
                <Text style={[styles.settingLabel, { color: destructive ? colors.error : colors.text1 }]}>
                    {icon}  {label}
                </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.text2 }]}>›</Text>
        </TouchableOpacity>
    );
};

// ─── Picker Row (cycles through options) ───

interface PickerRowProps {
    label: string;
    value: string;
    onPress: () => void;
}

const PickerRow: React.FC<PickerRowProps> = ({ label, value, onPress }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.6}>
            <Text style={[styles.settingLabel, { color: colors.text1 }]}>{label}</Text>
            <View style={styles.pickerRight}>
                <Text style={[styles.pickerValue, { color: colors.primary }]}>{value}</Text>
                <Text style={[styles.chevron, { color: colors.text2 }]}>›</Text>
            </View>
        </TouchableOpacity>
    );
};

// ─── Main ───

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { mode, setMode, colors } = useTheme();
    const { settings, updateSettings } = useApp();

    // Theme cycling
    const cycleTheme = useCallback(() => {
        const modes: ThemeMode[] = ['light', 'dark', 'system'];
        const idx = modes.indexOf(mode);
        const next = modes[(idx + 1) % modes.length];
        setMode(next);
        updateSettings({ themeMode: next });
    }, [mode, setMode, updateSettings]);

    // Scan mode cycling
    const cycleScanMode = useCallback(() => {
        const modes: AppSettings['defaultScanMode'][] = ['auto', 'table', 'text', 'form'];
        const idx = modes.indexOf(settings.defaultScanMode);
        const next = modes[(idx + 1) % modes.length];
        updateSettings({ defaultScanMode: next });
    }, [settings.defaultScanMode, updateSettings]);

    // OCR language cycling
    const cycleLanguage = useCallback(() => {
        const langs: AppSettings['ocrLanguage'][] = ['auto', 'en', 'hi'];
        const idx = langs.indexOf(settings.ocrLanguage);
        const next = langs[(idx + 1) % langs.length];
        updateSettings({ ocrLanguage: next });
    }, [settings.ocrLanguage, updateSettings]);

    // Export format cycling
    const cycleExportFormat = useCallback(() => {
        const formats: ExportFormat[] = ['xlsx', 'pdf', 'docx', 'csv', 'json'];
        const idx = formats.indexOf(settings.defaultExportFormat);
        const next = formats[(idx + 1) % formats.length];
        updateSettings({ defaultExportFormat: next });
    }, [settings.defaultExportFormat, updateSettings]);

    const handleClearCache = useCallback(() => {
        Alert.alert('Clear Cache', 'This will remove temporary files. Saved scans are not affected.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => clearCache() },
        ]);
    }, []);

    const handleClearHistory = useCallback(() => {
        Alert.alert('Clear All History', 'This will permanently delete all saved scans. This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete All', style: 'destructive', onPress: () => clearAllHistory() },
        ]);
    }, []);

    const themeLabel = mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light';
    const scanModeLabel = settings.defaultScanMode.charAt(0).toUpperCase() + settings.defaultScanMode.slice(1);
    const langLabel = settings.ocrLanguage === 'auto' ? 'Auto' : settings.ocrLanguage === 'en' ? 'English' : 'Hindi';
    const exportLabel = EXPORT_FORMATS.find(f => f.id === settings.defaultExportFormat)?.name || 'Excel';

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar title="Settings" />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Appearance */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>APPEARANCE</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <PickerRow label="Theme" value={themeLabel} onPress={cycleTheme} />
                </View>

                {/* Scanning */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>SCANNING</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingRow
                        label="Auto Enhance"
                        desc="Improve image quality automatically"
                        rightElement={
                            <Switch
                                value={settings.autoEnhance}
                                onValueChange={(v) => updateSettings({ autoEnhance: v })}
                                trackColor={{ false: colors.border, true: colors.primarySubtle }}
                                thumbColor={settings.autoEnhance ? colors.primary : colors.text2}
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <SettingRow
                        label="Auto Capture"
                        desc="Snap when document is detected"
                        rightElement={
                            <Switch
                                value={settings.autoCapture}
                                onValueChange={(v) => updateSettings({ autoCapture: v })}
                                trackColor={{ false: colors.border, true: colors.primarySubtle }}
                                thumbColor={settings.autoCapture ? colors.primary : colors.text2}
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <PickerRow label="Default Scan Mode" value={scanModeLabel} onPress={cycleScanMode} />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <PickerRow label="OCR Language" value={langLabel} onPress={cycleLanguage} />
                </View>

                {/* Export */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>EXPORT</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <PickerRow label="Default Format" value={exportLabel} onPress={cycleExportFormat} />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <SettingRow
                        label="Include Confidence"
                        desc="Add confidence scores by default"
                        rightElement={
                            <Switch
                                value={settings.includeConfidenceByDefault}
                                onValueChange={(v) => updateSettings({ includeConfidenceByDefault: v })}
                                trackColor={{ false: colors.border, true: colors.primarySubtle }}
                                thumbColor={settings.includeConfidenceByDefault ? colors.primary : colors.text2}
                            />
                        }
                    />
                </View>

                {/* ML Models */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>ML MODELS</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingButton
                        label="Model Status & Health"
                        icon="🤖"
                        onPress={() => navigation.navigate(ROUTES.MODEL_STATUS)}
                    />
                </View>

                {/* Data */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>DATA</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingButton label="Clear Cache" icon="🗑️" onPress={handleClearCache} />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <SettingButton label="Clear All History" icon="⚠️" onPress={handleClearHistory} destructive />
                </View>

                {/* About */}
                <Text style={[styles.sectionTitle, { color: colors.text2 }]}>ABOUT</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingRow
                        label="Version"
                        rightElement={
                            <Text style={[styles.versionText, { color: colors.text2 }]}>{APP_CONFIG.version}</Text>
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <SettingButton
                        label="Contact Support"
                        icon="📧"
                        onPress={() => Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`)}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.text2 }]}>
                        {APP_CONFIG.displayName} · v{APP_CONFIG.version}
                    </Text>
                    <Text style={[styles.footerText, { color: colors.text2 }]}>
                        Endurance Group Pvt Ltd
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginHorizontal: spacing.base,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        fontFamily: typography.caption.fontFamily,
    },

    card: {
        marginHorizontal: spacing.base,
        borderRadius: radius.card,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadows.sm,
    },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        minHeight: 52,
    },
    settingLeft: { flex: 1, marginRight: spacing.md },
    settingLabel: { fontSize: 15, fontWeight: '500', fontFamily: typography.body.fontFamily },
    settingDesc: { fontSize: 12, marginTop: 2, fontFamily: typography.caption.fontFamily },
    chevron: { fontSize: 20 },

    pickerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    pickerValue: { fontSize: 14, fontWeight: '600', fontFamily: typography.body.fontFamily },

    divider: { height: 1, marginLeft: spacing.base },

    versionText: { fontSize: 14, fontFamily: typography.body.fontFamily },

    footer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        fontFamily: typography.caption.fontFamily,
    },
});

export default SettingsScreen;
