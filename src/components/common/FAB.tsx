// SCANKar — Floating Action Button Component

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { shadows } from '../../theme/spacing';

interface FABProps {
    onPress: () => void;
    icon?: string;
}

const FAB: React.FC<FABProps> = ({ onPress, icon = '📷' }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.fab, shadows.lg, { backgroundColor: colors.primary }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.icon}>{icon}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    icon: {
        fontSize: 28,
    },
});

export default FAB;
