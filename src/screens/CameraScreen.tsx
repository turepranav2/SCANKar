// SCANKar — Camera Screen (Screen 03)
// Matches Stitch screen: Camera Capture

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useScan } from '../context/ScanContext';
import { ROUTES } from '../navigation/routes';
import { HomeStackParamList } from '../navigation/MainNavigator';
import { spacing } from '../theme/spacing';
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

    const handleClose = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCapture = useCallback(async () => {
        setIsCapturing(true);

        // Placeholder: simulate camera capture
        // In production, uses react-native-vision-camera
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockImageUri = 'file:///captured_document.jpg';
        setCapturedImage(mockImageUri);
        setIsCapturing(false);

        navigation.navigate(ROUTES.PREVIEW_CROP, { imageUri: mockImageUri });
    }, [navigation, setCapturedImage]);

    const handleGallery = useCallback(() => {
        // Placeholder: open image picker
        Alert.alert('Gallery', 'Image picker will be integrated with react-native-image-picker');
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Camera Preview (simulated dark bg) */}
            <View style={styles.cameraPreview}>
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
                <TouchableOpacity style={styles.sideButton} onPress={() => setFlashOn(!flashOn)}>
                    <Text style={styles.sideButtonIcon}>{flashOn ? '⚡' : '🔦'}</Text>
                    <Text style={styles.sideButtonLabel}>Flash</Text>
                </TouchableOpacity>

                <CaptureButton onPress={handleCapture} disabled={isCapturing} />

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
