// SCANKar — Top Bar Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { APP_CONFIG } from '../../constants/config';

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
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.base,
        borderBottomWidth: 1,
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
