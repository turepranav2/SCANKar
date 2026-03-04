// SCANKar — Camera Screen (Screen 03)
// Features: react-native-vision-camera, flash, auto/manual capture, gallery import

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ImagePicker from 'react-native-image-crop-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { useScan } from '../context/ScanContext';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import DocTypeChips, { DocTypeFilter } from '../components/camera/DocTypeChips';
import CaptureButton from '../components/camera/CaptureButton';
import DocumentOverlay from '../components/camera/DocumentOverlay';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;

const CameraScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { setCapturedImage } = useScan();
    
    const [docTypeFilter, setDocTypeFilter] = useState<DocTypeFilter>('auto');
    const [flashOn, setFlashOn] = useState(false);
    const [autoCapture, setAutoCapture] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    
    // Camera state
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const handleClose = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    // Request permissions
    useEffect(() => {
        const checkPermission = async () => {
            const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
            let p = await check(permission);
            if (p !== RESULTS.GRANTED) {
                p = await request(permission);
            }
            setHasPermission(p === RESULTS.GRANTED);
        };
        checkPermission();
    }, []);

    const handleCapture = useCallback(async () => {
        if (!cameraRef.current) return;
        setIsCapturing(true);

        try {
            const photo = await cameraRef.current.takePhoto({
                flash: flashOn ? 'on' : 'off',
            });
            const imageUri = `file://${photo.path}`;
            setCapturedImage(imageUri);
            
            // Pass the image URI and the selected docType
            navigation.navigate(ROUTES.PREVIEW_CROP, { imageUri, docType: docTypeFilter });
        } catch (e) {
            Alert.alert('Capture Error', 'Failed to capture image');
        } finally {
            setIsCapturing(false);
        }
    }, [navigation, setCapturedImage, flashOn, docTypeFilter]);

    const handleGallery = useCallback(async () => {
        try {
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
            });
            setCapturedImage(image.path);
            navigation.navigate(ROUTES.PREVIEW_CROP, { imageUri: image.path, docType: docTypeFilter });
        } catch (e) {
            // User cancelled
        }
    }, [navigation, setCapturedImage, docTypeFilter]);

    // Permission denied UI
    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionDesc}>
                    Please grant camera access to scan documents.
                </Text>
                <TouchableOpacity style={styles.grantBtn} onPress={() => Linking.openSettings()}>
                    <Text style={styles.grantBtnText}>Grant Camera Access</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideButton} onPress={handleGallery}>
                    <Text style={styles.sideButtonIcon}>🖼️</Text>
                    <Text style={[styles.sideButtonLabel, { marginTop: 4 }]}>Open Gallery Instead</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtnOverlay} onPress={handleClose}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // No camera device (emulator fallback)
    const renderNoDevice = () => (
        <View style={styles.noDeviceContainer}>
            <Text style={styles.noDeviceText}>Camera not available — use Gallery to import</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Camera Preview */}
            <View style={styles.cameraPreview}>
                {device && hasPermission ? (
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        photo={true}
                    />
                ) : renderNoDevice()}
                {/* Document overlay brackets */}
                <DocumentOverlay />
            </View>

            {/* Top Overlay Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <DocTypeChips activeFilter={docTypeFilter} onSelect={setDocTypeFilter} />
            </View>

            {/* Auto-capture toggle */}
            <View style={styles.autoToggle}>
                <TouchableOpacity
                    style={[styles.autoTogglePill, autoCapture && styles.autoTogglePillActive]}
                    onPress={() => setAutoCapture(!autoCapture)}
                >
                    <Text style={styles.autoToggleText}>Auto</Text>
                    <View style={[styles.toggleDot, autoCapture && styles.toggleDotActive]} />
                </TouchableOpacity>
            </View>

            {/* Bottom Overlay Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={[styles.sideButton, !device && { opacity: 0.5 }]} 
                    onPress={() => setFlashOn(!flashOn)}
                    disabled={!device}
                >
                    <Text style={styles.sideButtonIcon}>{flashOn ? '⚡' : '🔦'}</Text>
                    <Text style={styles.sideButtonLabel}>Flash</Text>
                </TouchableOpacity>

                <CaptureButton onPress={handleCapture} disabled={isCapturing || !device} />

                <TouchableOpacity style={styles.sideButton} onPress={handleGallery}>
                    <Text style={styles.sideButtonIcon}>🖼️</Text>
                    <Text style={styles.sideButtonLabel}>Gallery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    cameraPreview: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1A1A2E',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    permissionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.sm,
        fontFamily: typography.h3.fontFamily,
    },
    permissionDesc: {
        color: '#AAAAAA',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing.xl,
        fontFamily: typography.body.fontFamily,
    },
    grantBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.button,
        marginBottom: spacing.xl,
    },
    grantBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.button.fontFamily,
    },
    closeBtnOverlay: {
        position: 'absolute',
        top: 52,
        left: spacing.base,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDeviceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
    },
    noDeviceText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: typography.caption.fontFamily,
    },
    // Top bar
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 52,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        gap: spacing.md,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '300',
    },

    // Auto-capture toggle
    autoToggle: {
        position: 'absolute',
        top: 108,
        right: spacing.base,
    },
    autoTogglePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    autoTogglePillActive: {
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
    },
    autoToggleText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '400',
        fontFamily: typography.caption.fontFamily,
    },
    toggleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    toggleDotActive: {
        backgroundColor: '#4ADE80',
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.xl,
        paddingBottom: 24,
    },
    sideButton: {
        alignItems: 'center',
        gap: 4,
    },
    sideButtonIcon: {
        fontSize: 24,
    },
    sideButtonLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: typography.caption.fontFamily,
    },
});

export default CameraScreen;
