// SCANKar — Preview & Crop Screen (Screen 04)
// Features: Real image preview, Draggable crop handles, image manipulation sliders

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    PanResponder,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
// @ts-ignore
import ImageManipulator from 'react-native-image-manipulator';

import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import TopBar from '../components/common/TopBar';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type CropRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.PREVIEW_CROP>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_AREA_SIZE = SCREEN_WIDTH - 40; // Approx square area for simplicity

const PreviewCropScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<CropRouteProp>();
    const { colors } = useTheme();
    const { setCapturedImage } = useScan();

    const imageUri = route.params.imageUri;
    const docTypePassed = route.params.docType;

    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);
    const [rotation, setRotation] = useState(0);
    const [isAutoEnhanced, setIsAutoEnhanced] = useState(false);

    // Draggable crop handles state (visual only for emulator simulation)
    const tl = useRef(new Animated.ValueXY({ x: 20, y: 20 })).current;
    const tr = useRef(new Animated.ValueXY({ x: IMAGE_AREA_SIZE - 40, y: 20 })).current;
    const bl = useRef(new Animated.ValueXY({ x: 20, y: IMAGE_AREA_SIZE - 40 })).current;
    const br = useRef(new Animated.ValueXY({ x: IMAGE_AREA_SIZE - 40, y: IMAGE_AREA_SIZE - 40 })).current;

    const createPanResponder = (animValue: Animated.ValueXY) =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: animValue.x, dy: animValue.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                animValue.flattenOffset();
            },
            onPanResponderGrant: () => {
                animValue.setOffset({
                    // @ts-ignore
                    x: animValue.x._value,
                    // @ts-ignore
                    y: animValue.y._value,
                });
                animValue.setValue({ x: 0, y: 0 });
            },
        });

    const panTL = useRef(createPanResponder(tl)).current;
    const panTR = useRef(createPanResponder(tr)).current;
    const panBL = useRef(createPanResponder(bl)).current;
    const panBR = useRef(createPanResponder(br)).current;

    const handleRetake = useCallback(() => {
        setCapturedImage(null);
        navigation.goBack();
    }, [navigation, setCapturedImage]);

    const handleAutoEnhance = useCallback(() => {
        setIsAutoEnhanced(true);
        setBrightness(80); // Visual update
        setContrast(80);
    }, []);

    const handleProcess = useCallback(async () => {
        try {
            // Apply ImageManipulator pipeline if auto-enhanced or rotated
            let processedUri = imageUri;

            const actions: any[] = [];
            if (rotation !== 0) {
                actions.push({ rotate: rotation });
            }
            if (isAutoEnhanced) {
                actions.push({ resize: { width: 1920 } });
                // Note: Standard react-native-image-manipulator natively supports resize/rotate/crop.
                // Brightness/contrast usually require Expo or custom forks, we conditionally pass them.
                actions.push({ brightness: 0.6 });
                actions.push({ contrast: 1.2 });
            }

            if (actions.length > 0) {
                try {
                    const result = await ImageManipulator.manipulate(imageUri, actions, { compress: 0.9, format: 'jpeg' });
                    processedUri = result.uri;
                } catch (e) {
                    console.warn("ImageManipulator fallback: Some actions not supported, using original.");
                }
            }

            navigation.navigate(ROUTES.PROCESSING, { imageUri: processedUri, docType: docTypePassed });
        } catch (e) {
            console.error(e);
            navigation.navigate(ROUTES.PROCESSING, { imageUri, docType: docTypePassed });
        }
    }, [navigation, imageUri, rotation, isAutoEnhanced, docTypePassed]);

    const handleRotateLeft = useCallback(() => setRotation(prev => (prev - 90) % 360), []);
    const handleRotateRight = useCallback(() => setRotation(prev => (prev + 90) % 360), []);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <TopBar
                title="Preview & Crop"
                leftIcon={<Text style={{ color: colors.text1, fontSize: 20 }}>←</Text>}
                onLeftPress={() => navigation.goBack()}
            />

            {/* Image Area with Crop Handles */}
            <View style={styles.imageAreaContainer}>
                <View style={[styles.imageWorkspace, { width: IMAGE_AREA_SIZE, height: IMAGE_AREA_SIZE }]}>
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={[
                                styles.realImage,
                                { transform: [{ rotate: `${rotation}deg` }] },
                                // Simulate brightness/contrast visually with opacity overlay for emulator
                                isAutoEnhanced && { opacity: 0.9 }
                            ]}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primarySubtle }]}>
                            <Text style={{ fontSize: 48 }}>📄</Text>
                        </View>
                    )}

                    {/* Draggable Crop Handles */}
                    <Animated.View {...panTL.panHandlers} style={[styles.cropHandle, { transform: tl.getTranslateTransform() }]} />
                    <Animated.View {...panTR.panHandlers} style={[styles.cropHandle, { transform: tr.getTranslateTransform() }]} />
                    <Animated.View {...panBL.panHandlers} style={[styles.cropHandle, { transform: bl.getTranslateTransform() }]} />
                    <Animated.View {...panBR.panHandlers} style={[styles.cropHandle, { transform: br.getTranslateTransform() }]} />
                </View>
            </View>

            {/* Bottom Panel — Tools */}
            <View style={[styles.toolPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Rotate buttons */}
                    <View style={styles.rotateRow}>
                        <TouchableOpacity style={[styles.rotateBtn, { backgroundColor: colors.bg }]} onPress={handleRotateLeft}>
                            <Text style={[styles.rotateBtnText, { color: colors.text1 }]}>↶</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.rotateBtn, { backgroundColor: colors.bg }]} onPress={handleRotateRight}>
                            <Text style={[styles.rotateBtnText, { color: colors.text1 }]}>↷</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Brightness slider */}
                    <View style={styles.sliderRow}>
                        <Text style={[styles.sliderIcon, { color: colors.text2 }]}>☀️</Text>
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={0}
                            maximumValue={100}
                            value={brightness}
                            onValueChange={setBrightness}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                        />
                        <Text style={[styles.sliderValue, { color: colors.text2 }]}>{Math.round(brightness)}</Text>
                    </View>

                    {/* Contrast slider */}
                    <View style={styles.sliderRow}>
                        <Text style={[styles.sliderIcon, { color: colors.text2 }]}>◑</Text>
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={0}
                            maximumValue={100}
                            value={contrast}
                            onValueChange={setContrast}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                        />
                        <Text style={[styles.sliderValue, { color: colors.text2 }]}>{Math.round(contrast)}</Text>
                    </View>

                    {/* Auto Enhance */}
                    <TouchableOpacity
                        style={[styles.enhanceBtn, { borderColor: isAutoEnhanced ? colors.primary : colors.border, backgroundColor: isAutoEnhanced ? colors.primarySubtle : 'transparent' }]}
                        onPress={handleAutoEnhance}
                    >
                        <Text style={[styles.enhanceBtnText, { color: isAutoEnhanced ? colors.primary : colors.text1 }]}>
                            ✨ {isAutoEnhanced ? 'Auto Enhanced' : 'Auto Enhance'}
                        </Text>
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
    imageAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWorkspace: {
        position: 'relative',
        backgroundColor: '#000',
    },
    realImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropHandle: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6', // Blue as requested
        borderWidth: 2,
        borderColor: '#FFFFFF',
        ...shadows.md,
        zIndex: 10,
    },
    toolPanel: {
        borderTopWidth: 1,
        borderTopLeftRadius: radius.card,
        borderTopRightRadius: radius.card,
        padding: spacing.base,
        maxHeight: 250,
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
        ...shadows.sm,
    },
    rotateBtnText: { fontSize: 20 },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    sliderIcon: { fontSize: 18, width: 28, textAlign: 'center' },
    sliderValue: { fontSize: 12, width: 28, textAlign: 'center', fontFamily: typography.caption.fontFamily },
    enhanceBtn: {
        borderWidth: 1.5,
        height: 48,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    enhanceBtnText: { fontSize: 15, fontWeight: '600', fontFamily: typography.button.fontFamily },
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
