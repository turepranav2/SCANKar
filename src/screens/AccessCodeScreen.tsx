// SCANKar — Access Code Screen (Screen 00)
// Matches Stitch screens: 00a (error state) + 00b (default state)

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, shadows, spacing } from '../theme/spacing';
import { APP_CONFIG } from '../constants/config';

const AccessCodeScreen: React.FC = () => {
    const { unlock } = useAuth();
    const { colors } = useTheme();

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeErrorAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);

    const triggerShake = useCallback(() => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    }, [shakeAnim]);

    const showError = useCallback((message: string) => {
        setError(message);
        Animated.timing(fadeErrorAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeErrorAnim]);

    const clearError = useCallback(() => {
        Animated.timing(fadeErrorAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setError(null));
    }, [fadeErrorAnim]);

    const handleCodeChange = useCallback((text: string) => {
        // Auto-format: insert hyphen after 4 chars
        const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (cleaned.length <= 8) {
            if (cleaned.length > 4) {
                setCode(`${cleaned.slice(0, 4)}-${cleaned.slice(4)}`);
            } else {
                setCode(cleaned);
            }
        }
        if (error) clearError();
    }, [error, clearError]);

    const handleActivate = useCallback(async () => {
        Keyboard.dismiss();

        if (!code.trim()) {
            showError('Please enter an activation code.');
            triggerShake();
            return;
        }

        setIsActivating(true);

        // Small delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 400));

        const result = unlock(code);
        setIsActivating(false);

        if (!result.valid) {
            showError(result.error || 'Invalid code.');
            triggerShake();
        }
        // If valid, AuthContext sets isUnlocked=true → AppNavigator re-renders
    }, [code, unlock, showError, triggerShake]);

    return (
        <LinearGradient
            colors={gradients.lockScreen}
            style={styles.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* Logo + Branding */}
                    <View style={styles.brandingArea}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>E</Text>
                        </View>
                        <Text style={styles.appName}>{APP_CONFIG.displayName}</Text>
                    </View>

                    {/* White Card */}
                    <Animated.View
                        style={[
                            styles.card,
                            shadows.lg,
                            { transform: [{ translateX: shakeAnim }] },
                        ]}
                    >
                        <Text style={styles.cardTitle}>Employee Activation</Text>
                        <Text style={styles.cardSubtitle}>
                            Enter your access code to unlock
                        </Text>

                        {/* Code Input */}
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.codeInput,
                                error && styles.codeInputError,
                            ]}
                            value={code}
                            onChangeText={handleCodeChange}
                            placeholder="XXXX-XXXX"
                            placeholderTextColor="rgba(71, 85, 105, 0.5)"
                            maxLength={9} // XXXX-XXXX
                            autoCapitalize="characters"
                            autoCorrect={false}
                            keyboardType="default"
                            returnKeyType="done"
                            onSubmitEditing={handleActivate}
                        />

                        {/* Activate Button */}
                        <TouchableOpacity
                            style={[
                                styles.activateButton,
                                isActivating && styles.activateButtonDisabled,
                            ]}
                            onPress={handleActivate}
                            disabled={isActivating}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.activateButtonText}>
                                {isActivating ? 'Activating...' : 'Activate App'}
                            </Text>
                        </TouchableOpacity>

                        {/* Error Message */}
                        {error && (
                            <Animated.Text
                                style={[styles.errorText, { opacity: fadeErrorAnim }]}
                            >
                                {error}
                            </Animated.Text>
                        )}
                    </Animated.View>

                    {/* Bottom Help */}
                    <View style={styles.helpArea}>
                        <Text style={styles.helpText}>
                            Need help? Contact: {APP_CONFIG.supportEmail}
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    // Branding
    brandingArea: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: typography.h1.fontFamily,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: spacing.md,
        fontFamily: typography.h1.fontFamily,
    },

    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lockCard,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        textAlign: 'center',
        fontFamily: typography.h3.fontFamily,
    },
    cardSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: '#475569',
        textAlign: 'center',
        marginTop: spacing.sm,
        fontFamily: typography.body.fontFamily,
    },

    // Input
    codeInput: {
        width: '100%',
        height: 56,
        borderWidth: 2,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        borderRadius: radius.input,
        fontSize: 14,
        fontFamily: 'monospace',
        letterSpacing: 6,
        textAlign: 'center',
        color: '#0F172A',
        marginTop: spacing.lg,
    },
    codeInputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEE2E2',
    },

    // Button
    activateButton: {
        width: '100%',
        height: 52,
        backgroundColor: '#2563EB',
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    activateButtonDisabled: {
        opacity: 0.7,
    },
    activateButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: typography.button.fontFamily,
    },

    // Error
    errorText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#EF4444',
        textAlign: 'center',
        marginTop: spacing.md,
        fontFamily: typography.caption.fontFamily,
    },

    // Help
    helpArea: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    helpText: {
        fontSize: 12,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
        fontFamily: typography.caption.fontFamily,
    },
});

export default AccessCodeScreen;
