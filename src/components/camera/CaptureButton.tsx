// SCANKar — Capture Button Component

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface CaptureButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onPress, disabled = false }) => {
    return (
        <TouchableOpacity
            style={[styles.outer, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={styles.inner} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    outer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
    },
    disabled: {
        opacity: 0.5,
    },
});

export default CaptureButton;
