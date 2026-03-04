// SCANKar — Top Bar Component
// Safe-area aware header bar used by all screens

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { APP_CONFIG } from '../../constants/config';

// Get a reliable status bar height
const STATUSBAR_HEIGHT = Platform.OS === 'android'
    ? (StatusBar.currentHeight ?? 24)
    : 44; // iOS fallback (safe area handled elsewhere on iOS)

interface TopBarProps {
    title?: string;
    showLogo?: boolean;
    leftIcon?: React.ReactNode;
    rightIcons?: React.ReactNode;
    onLeftPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
    title,
    showLogo = false,
    leftIcon,
    rightIcons,
    onLeftPress,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.wrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            {/* Status bar spacer */}
            <View style={styles.statusBarSpacer} />
            {/* Actual toolbar content */}
            <View style={styles.toolbar}>
                <View style={styles.left}>
                    {leftIcon && (
                        <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                            {leftIcon}
                        </TouchableOpacity>
                    )}
                    {showLogo && (
                        <Text style={[styles.logoText, { color: colors.primary }]}>
                            {APP_CONFIG.displayName}
                        </Text>
                    )}
                    {title && !showLogo && (
                        <Text style={[styles.title, { color: colors.text1 }]}>{title}</Text>
                    )}
                </View>
                <View style={styles.right}>{rightIcons}</View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderBottomWidth: 1,
    },
    statusBarSpacer: {
        height: STATUSBAR_HEIGHT,
    },
    toolbar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.base,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: typography.h3.fontFamily,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: typography.h3.fontFamily,
    },
});

export default TopBar;
