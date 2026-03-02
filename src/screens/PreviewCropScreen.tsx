// SCANKar — Preview & Crop Screen (Screen 04)
// Matches Stitch screen: Image Preview and Crop

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
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

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type CropRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.PREVIEW_CROP>;

const PreviewCropScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<CropRouteProp>();
    const { colors } = useTheme();
    const { setCapturedImage } = useScan();

    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);
    const [rotation, setRotation] = useState(0);

    const handleRetake = useCallback(() => {
        setCapturedImage(null);
        navigation.goBack();
    }, [navigation, setCapturedImage]);

    const handleProcess = useCallback(() => {
        navigation.navigate(ROUTES.PROCESSING, { imageUri: route.params.imageUri });
    }, [navigation, route.params.imageUri]);

    const handleRotateLeft = useCallback(() => {
        setRotation(prev => (prev - 90) % 360);
    }, []);

    const handleRotateRight = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Preview"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
                rightIcons={<Text style={[styles.aspectLabel, { color: colors.text2 }]}>4:3</Text>}
            />

            {/* Image Area with Crop Handles */}
            <View style={[styles.imageArea, { backgroundColor: colors.bg }]}>
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.primarySubtle, transform: [{ rotate: `${rotation}deg` }] }]}>
                    <Text style={styles.docEmoji}>📄</Text>
                    <Text style={[styles.docLabel, { color: colors.text2 }]}>Document Image</Text>
                </View>

                {/* Crop handles */}
                {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => (
                    <View
                        key={corner}
                        style={[
                            styles.cropHandle,
                            corner.includes('top') ? { top: 40 } : { bottom: 40 },
                            corner.includes('Left') ? { left: 30 } : { right: 30 },
                            { backgroundColor: colors.primary, borderColor: '#FFFFFF' },
                        ]}
                    />
                ))}
            </View>

            {/* Bottom Panel — Tools */}
            <View style={[styles.toolPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Rotate buttons */}
                    <View style={styles.rotateRow}>
                        <TouchableOpacity style={[styles.rotateBtn, { backgroundColor: colors.bg }]} onPress={handleRotateLeft}>
                            <Text style={styles.rotateBtnText}>↶</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.rotateBtn, { backgroundColor: colors.bg }]} onPress={handleRotateRight}>
                            <Text style={styles.rotateBtnText}>↷</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Brightness slider */}
                    <View style={styles.sliderRow}>
                        <Text style={[styles.sliderIcon, { color: colors.text2 }]}>☀️</Text>
                        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                            <View style={[styles.sliderFill, { width: `${brightness}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.sliderValue, { color: colors.text2 }]}>{brightness}</Text>
                    </View>

                    {/* Contrast slider */}
                    <View style={styles.sliderRow}>
                        <Text style={[styles.sliderIcon, { color: colors.text2 }]}>◑</Text>
                        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                            <View style={[styles.sliderFill, { width: `${contrast}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.sliderValue, { color: colors.text2 }]}>{contrast}</Text>
                    </View>

                    {/* Auto Enhance */}
                    <TouchableOpacity style={[styles.enhanceBtn, { borderColor: colors.primary }]}>
                        <Text style={[styles.enhanceBtnText, { color: colors.primary }]}>✨ Auto Enhance</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Bottom Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.surface }]}>
                <TouchableOpacity style={[styles.retakeBtn, { borderColor: colors.primary }]} onPress={handleRetake}>
                    <Text style={[styles.retakeBtnText, { color: colors.primary }]}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.processBtn, { backgroundColor: colors.primary }]} onPress={handleProcess}>
                    <Text style={styles.processBtnText}>Process →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    aspectLabel: { fontSize: 12 },

    // Image area
    imageArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    imagePlaceholder: {
        width: '75%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docEmoji: { fontSize: 48 },
    docLabel: { fontSize: 14, marginTop: spacing.sm, fontFamily: typography.body.fontFamily },

    // Crop handles
    cropHandle: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        ...shadows.md,
    },

    // Tool panel
    toolPanel: {
        borderTopWidth: 1,
        borderTopLeftRadius: radius.card,
        borderTopRightRadius: radius.card,
        padding: spacing.base,
        maxHeight: 220,
    },
    rotateRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.base,
        marginBottom: spacing.base,
    },
    rotateBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotateBtnText: { fontSize: 20 },

    // Slider
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    sliderIcon: { fontSize: 18, width: 28, textAlign: 'center' },
    sliderTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    sliderFill: { height: '100%', borderRadius: 3 },
    sliderValue: { fontSize: 12, width: 28, textAlign: 'center', fontFamily: typography.caption.fontFamily },

    // Auto enhance
    enhanceBtn: {
        borderWidth: 1.5,
        height: 48,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enhanceBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        padding: spacing.base,
        gap: spacing.md,
    },
    retakeBtn: {
        flex: 2,
        height: 48,
        borderWidth: 1.5,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    retakeBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },
    processBtn: {
        flex: 3,
        height: 52,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: typography.button.fontFamily },
});

export default PreviewCropScreen;
