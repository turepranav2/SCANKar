// SCANKar — Processing Screen (Screen 05)
// Features: 5-phase animation, realistic mock data generation based on image size, AsyncStorage integration

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { PROCESSING_PHASES } from '../constants/config';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { DocumentType, Scan, ProcessingPhase } from '../models/Scan';
import { saveScan } from '../services/storage/ScanStorage';

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
    const { setProcessingPhase } = useScan();

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const imageUri = route.params?.imageUri || '';
    const docTypePassed = route.params?.docType;

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

    useEffect(() => {
        let isMounted = true;

        const processPipeline = async () => {
            try {
                // Phase 1: Enhancing (800ms)
                setProcessingPhase(PHASE_KEYS[0]);
                setCurrentPhaseIndex(0);
                Animated.timing(progressAnim, { toValue: 1 / 5, duration: 800, useNativeDriver: false }).start();
                await new Promise(r => setTimeout(r, 800));
                if (!isMounted) return;

                // Phase 2: Detecting Type (1000ms)
                setProcessingPhase(PHASE_KEYS[1]);
                setCurrentPhaseIndex(1);
                Animated.timing(progressAnim, { toValue: 2 / 5, duration: 1000, useNativeDriver: false }).start();

                let width = 1000, height = 1500;
                if (imageUri) {
                    try {
                        await new Promise<void>((resolve) => {
                            Image.getSize(imageUri, (w, h) => { width = w; height = h; resolve(); }, () => resolve());
                        });
                    } catch (e) { }
                }
                const detectedType: DocumentType =
                    (docTypePassed && docTypePassed !== 'auto') ? (docTypePassed as DocumentType) : (width > height ? 'paragraph' : 'table');

                await new Promise(r => setTimeout(r, 1000));
                if (!isMounted) return;

                // Phase 3: Extracting Structure (800ms)
                setProcessingPhase(PHASE_KEYS[2]);
                setCurrentPhaseIndex(2);
                Animated.timing(progressAnim, { toValue: 3 / 5, duration: 800, useNativeDriver: false }).start();
                await new Promise(r => setTimeout(r, 800));
                if (!isMounted) return;

                // Phase 4: Reading Text (1200ms)
                setProcessingPhase(PHASE_KEYS[3]);
                setCurrentPhaseIndex(3);
                Animated.timing(progressAnim, { toValue: 4 / 5, duration: 1200, useNativeDriver: false }).start();

                const newScan: Scan = {
                    id: `scan-${Date.now()}`,
                    name: `Scan ${new Date().toLocaleDateString()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    originalImageUri: imageUri,
                    enhancedImageUri: imageUri,
                    thumbnailUri: imageUri,
                    documentType: detectedType === 'form' ? 'table' : detectedType, // Map form to table logic for UI
                    overallConfidence: Math.floor(Math.random() * (97 - 85 + 1)) + 85, // 85-97%
                    processingTimeMs: 4400,
                    modelsUsed: ['yolov8-doc', 'tesseract-v5'],
                    languageDetected: 'English',
                    isEdited: false,
                    editHistory: [],
                };

                if (newScan.documentType === 'paragraph') {
                    // Realistic mockup for paragraph
                    newScan.paragraphData = {
                        blocks: [
                            { id: 'b1', text: 'INSPECTION REPORT\nDate: 2026-03-04\nLocation: Site Alpha', confidence: 96, boundingBox: { x: 10, y: 10, width: 800, height: 150 }, language: 'English' },
                            { id: 'b2', text: 'All units verify standard pressure tolerances are met. Warning sequence bypassed on manual override. Review pending before system restart.', confidence: 89, boundingBox: { x: 10, y: 200, width: 800, height: 250 }, language: 'English' },
                        ]
                    };
                } else {
                    // Realistic mockup for table
                    newScan.tableData = {
                        headers: [{ id: 'h1', value: 'ID', confidence: 99 }, { id: 'h2', value: 'Part', confidence: 98 }, { id: 'h3', value: 'Status', confidence: 95 }],
                        rows: [
                            [{ id: 'r1c1', value: 'A1', confidence: 95 }, { id: 'r1c2', value: 'Exhaust Valve', confidence: 92 }, { id: 'r1c3', value: 'OK', confidence: 88 }],
                            [{ id: 'r2c1', value: 'B2', confidence: 90 }, { id: 'r2c2', value: 'Pressure Gauge', confidence: 86 }, { id: 'r2c3', value: 'FAIL', confidence: 94 }],
                            [{ id: 'r3c1', value: 'C3', confidence: 91 }, { id: 'r3c2', value: 'Coolant Hose', confidence: 97 }, { id: 'r3c3', value: 'WARN', confidence: 85 }],
                        ]
                    };
                }

                await new Promise(r => setTimeout(r, 1200));
                if (!isMounted) return;

                // Phase 5: Validating Data (600ms)
                setProcessingPhase(PHASE_KEYS[4]);
                setCurrentPhaseIndex(4);
                Animated.timing(progressAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();

                await saveScan(newScan);

                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;

                setProcessingPhase('idle');
                const nextRoute = newScan.documentType === 'paragraph' ? ROUTES.PARAGRAPH_REVIEW : ROUTES.TABLE_REVIEW;
                navigation.replace(nextRoute, { scanId: newScan.id });

            } catch (e) {
                console.error("Pipeline Error", e);
                setProcessingPhase('idle');
                navigation.goBack();
            }
        };

        processPipeline();

        return () => { isMounted = false; };
    }, [imageUri, docTypePassed, navigation, progressAnim, setProcessingPhase]);

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

            <Text style={[styles.estimate, { color: colors.text2 }]}>Estimated time: ~4.4 seconds</Text>
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
    iconContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 64 },
    glowRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
    title: { fontSize: 18, fontWeight: '600', marginTop: spacing.xl, fontFamily: typography.h3.fontFamily },
    phaseList: { width: 240, marginTop: spacing.lg, gap: spacing.base },
    phaseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    phaseIcon: { fontSize: 16, width: 20, textAlign: 'center' },
    phaseLabel: { fontSize: 15, fontFamily: typography.body.fontFamily },
    progressTrack: { width: 280, height: 6, borderRadius: 3, marginTop: spacing.xl, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    estimate: { fontSize: 12, marginTop: spacing.md, fontFamily: typography.caption.fontFamily },
});

export default ProcessingScreen;
