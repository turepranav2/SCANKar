// SCANKar — Home Dashboard Screen (Screen 02)
// Matches Stitch screen: Home Dashboard

import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';
import { gradients } from '../theme/colors';
import TopBar from '../components/common/TopBar';
import FAB from '../components/common/FAB';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { ScanIndexEntry } from '../models/Scan';
import { getRecentScans } from '../services/storage/ScanStorage';
import { formatDate } from '../utils/formatters';
import { getConfidenceColor, getConfidenceBgColor, formatConfidence } from '../utils/confidence';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;

// ─── Stat Card ───
const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.text2 }]}>{label}</Text>
            <Text style={[styles.statValue, { color: colors.text1 }]}>{value}</Text>
        </View>
    );
};

// ─── Scan Thumbnail Card ───
const ScanThumbCard: React.FC<{ scan: ScanIndexEntry; onPress: () => void }> = ({ scan, onPress }) => {
    const { colors } = useTheme();
    const confColor = getConfidenceColor(scan.overallConfidence, colors);
    const confBgColor = getConfidenceBgColor(scan.overallConfidence, colors);

    return (
        <TouchableOpacity
            style={[styles.thumbCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.thumbImage, { backgroundColor: colors.primarySubtle }]}>
                <Text style={styles.thumbEmoji}>📄</Text>
            </View>
            <View style={styles.thumbInfo}>
                <Text style={[styles.thumbName, { color: colors.text1 }]} numberOfLines={1}>
                    {scan.name}
                </Text>
                <View style={styles.thumbRow}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.primarySubtle }]}>
                        <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                            {scan.documentType.toUpperCase()}
                        </Text>
                    </View>
                    <View style={[styles.confPill, { backgroundColor: confBgColor }]}>
                        <Text style={[styles.confPillText, { color: confColor }]}>
                            {formatConfidence(scan.overallConfidence)}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.thumbDate, { color: colors.text2 }]}>
                    {formatDate(scan.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// ─── Home Screen ───
const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { colors, isDark } = useTheme();
    const { setMode } = useTheme();
    const { stats } = useApp();
    const [recentScans, setRecentScans] = useState<ScanIndexEntry[]>([]);

    useEffect(() => {
        getRecentScans(5).then(setRecentScans);
    }, []);

    const navigateToCamera = useCallback(() => {
        navigation.navigate(ROUTES.CAMERA);
    }, [navigation]);

    const navigateToScan = useCallback(
        (scanId: string, docType: string) => {
            if (docType === 'table') {
                navigation.navigate(ROUTES.TABLE_REVIEW, { scanId });
            } else {
                navigation.navigate(ROUTES.PARAGRAPH_REVIEW, { scanId });
            }
        },
        [navigation]
    );

    const toggleTheme = useCallback(() => {
        setMode(isDark ? 'light' : 'dark');
    }, [isDark, setMode]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Top Bar */}
            <TopBar
                showLogo
                rightIcons={
                    <View style={styles.topBarRight}>
                        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
                            <Text style={styles.iconEmoji}>{isDark ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                <TouchableOpacity onPress={navigateToCamera} activeOpacity={0.85}>
                    <LinearGradient
                        colors={isDark ? gradients.heroDark : gradients.heroLight}
                        style={styles.heroCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.heroLeft}>
                            <Text style={styles.heroTitle}>Scan a Document</Text>
                            <Text style={styles.heroSubtitle}>Point camera at any hard copy</Text>
                        </View>
                        <Text style={styles.heroIcon}>📸</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard label="Total Scans" value={stats.totalScans} />
                    <StatCard label="This Week" value={stats.weeklyScans} />
                    <StatCard label="Exports" value={stats.totalExports} />
                </View>

                {/* Recent Scans Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Recent Scans</Text>
                    <TouchableOpacity>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
                    </TouchableOpacity>
                </View>

                {recentScans.length > 0 ? (
                    <FlatList
                        data={recentScans}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbList}
                        renderItem={({ item }) => (
                            <ScanThumbCard
                                scan={item}
                                onPress={() => navigateToScan(item.id, item.documentType)}
                            />
                        )}
                    />
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={[styles.emptyTitle, { color: colors.text1 }]}>No scans yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.text2 }]}>
                            Tap the camera button to scan your first document
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <FAB onPress={navigateToCamera} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.base,
        paddingBottom: 100,
    },

    // Top Bar
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconEmoji: {
        fontSize: 22,
    },

    // Hero Card
    heroCard: {
        height: 160,
        borderRadius: radius.card,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        ...shadows.md,
    },
    heroLeft: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: typography.h2.fontFamily,
    },
    heroSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.sm,
        fontFamily: typography.body.fontFamily,
    },
    heroIcon: {
        fontSize: 64,
        marginLeft: spacing.base,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.base,
    },
    statCard: {
        flex: 1,
        borderRadius: radius.card,
        borderWidth: 1,
        padding: spacing.base,
        ...shadows.sm,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: typography.caption.fontFamily,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: spacing.xs,
        fontFamily: typography.h2.fontFamily,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.h4.fontFamily,
    },
    seeAll: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: typography.caption.fontFamily,
    },

    // Thumbnail Cards
    thumbList: {
        gap: spacing.md,
        paddingRight: spacing.base,
    },
    thumbCard: {
        width: 160,
        borderRadius: radius.card,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadows.sm,
    },
    thumbImage: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbEmoji: {
        fontSize: 36,
    },
    thumbInfo: {
        padding: spacing.md,
    },
    thumbName: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: typography.h4.fontFamily,
    },
    thumbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    typeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: typography.caption.fontFamily,
    },
    confPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    confPillText: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: typography.caption.fontFamily,
    },
    thumbDate: {
        fontSize: 11,
        fontWeight: '400',
        marginTop: spacing.xs,
        fontFamily: typography.caption.fontFamily,
    },

    // Empty State
    emptyState: {
        borderRadius: radius.card,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.h4.fontFamily,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: spacing.sm,
        fontFamily: typography.body.fontFamily,
    },
});

export default HomeScreen;
