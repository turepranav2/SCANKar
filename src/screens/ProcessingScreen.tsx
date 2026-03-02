// SCANKar — Processing Screen (Screen 05)
// Matches Stitch screen: Document Processing

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { PROCESSING_PHASES } from '../constants/config';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { ProcessingPhase } from '../models/Scan';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ProcessRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.PROCESSING>;

const PHASE_KEYS: ProcessingPhase[] = [
    'enhancing',
    'detecting_type',
    'extracting_structure',
    'reading_text',
    'validating',
];

const ProcessingScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<ProcessRouteProp>();
    const { colors } = useTheme();
    const { setProcessingPhase, setCurrentScan } = useScan();

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Pulsing icon animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    // Spinner animation
    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.linear })
        );
        spin.start();
        return () => spin.stop();
    }, [spinAnim]);

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Simulate processing phases
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPhaseIndex(prev => {
                const next = prev + 1;
                if (next < PHASE_KEYS.length) {
                    setProcessingPhase(PHASE_KEYS[next]);
                    Animated.timing(progressAnim, {
                        toValue: (next + 1) / PHASE_KEYS.length,
                        duration: 400,
                        useNativeDriver: false,
                    }).start();
                    return next;
                }
                clearInterval(timer);
                return prev;
            });
        }, 1200);

        // Start first phase
        setProcessingPhase(PHASE_KEYS[0]);
        Animated.timing(progressAnim, {
            toValue: 1 / PHASE_KEYS.length,
            duration: 400,
            useNativeDriver: false,
        }).start();

        return () => clearInterval(timer);
    }, [setProcessingPhase, progressAnim]);

    // Navigate after all phases complete
    useEffect(() => {
        if (currentPhaseIndex >= PHASE_KEYS.length - 1) {
            const timeout = setTimeout(() => {
                setProcessingPhase('idle');
                // Placeholder: navigate to table review
                // In production, routing depends on detected document type
                navigation.replace(ROUTES.TABLE_REVIEW, { scanId: 'demo-scan-001' });
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [currentPhaseIndex, navigation, setProcessingPhase]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Pulsing icon */}
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.icon}>📄</Text>
                <Animated.View style={[styles.glowRing, { borderColor: colors.primary, opacity: 0.3 }]} />
            </Animated.View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text1 }]}>Processing Document...</Text>

            {/* Phase list */}
            <View style={styles.phaseList}>
                {PROCESSING_PHASES.map((label, index) => {
                    const isComplete = index < currentPhaseIndex;
                    const isActive = index === currentPhaseIndex;
                    const isPending = index > currentPhaseIndex;

                    return (
                        <View key={label} style={styles.phaseRow}>
                            {isComplete && <Text style={[styles.phaseIcon, { color: colors.success }]}>✓</Text>}
                            {isActive && (
                                <Animated.Text
                                    style={[styles.phaseIcon, { color: colors.primary, transform: [{ rotate: spinInterpolate }] }]}
                                >
                                    ●
                                </Animated.Text>
                            )}
                            {isPending && <Text style={[styles.phaseIcon, { color: colors.text2, opacity: 0.3 }]}>○</Text>}
                            <Text
                                style={[
                                    styles.phaseLabel,
                                    isComplete && { color: colors.text1 },
                                    isActive && { color: colors.primary, fontWeight: '600' },
                                    isPending && { color: colors.text2, opacity: 0.5 },
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth }]} />
            </View>

            {/* Estimate */}
            <Text style={[styles.estimate, { color: colors.text2 }]}>Estimated time: ~3 seconds</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },

    // Icon
    iconContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: { fontSize: 64 },
    glowRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
    },

    // Title
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: spacing.xl,
        fontFamily: typography.h3.fontFamily,
    },

    // Phases
    phaseList: {
        width: 240,
        marginTop: spacing.lg,
        gap: spacing.base,
    },
    phaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    phaseIcon: { fontSize: 16, width: 20, textAlign: 'center' },
    phaseLabel: {
        fontSize: 15,
        fontFamily: typography.body.fontFamily,
    },

    // Progress
    progressTrack: {
        width: 280,
        height: 6,
        borderRadius: 3,
        marginTop: spacing.xl,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Estimate
    estimate: {
        fontSize: 12,
        marginTop: spacing.md,
        fontFamily: typography.caption.fontFamily,
    },
});

export default ProcessingScreen;
