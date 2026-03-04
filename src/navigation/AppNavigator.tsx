// SCANKar — Root Navigator (TDD §6.2)
// Controls the top-level navigation flow:
//   Locked       → AuthNavigator (AccessCode → Onboarding)
//   Unlocked     → if onboarding incomplete → OnboardingScreen directly
//   Ready        → MainNavigator (bottom tabs)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MainNavigator } from './MainNavigator';

// Direct screen imports for the root-level flow
import AccessCodeScreen from '../screens/AccessCodeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

type RootStackParamList = {
    AccessCode: undefined;
    Onboarding: undefined;
    Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const { isUnlocked, isLoading, onboardingComplete } = useAuth();
    const { colors } = useTheme();

    console.log('[AppNavigator] Render — isUnlocked:', isUnlocked,
        'onboardingComplete:', onboardingComplete, 'isLoading:', isLoading);

    if (isLoading) {
        return (
            <View style={[styles.loading, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: colors.bg === '#0F172A',
                colors: {
                    primary: colors.primary,
                    background: colors.bg,
                    card: colors.surface,
                    text: colors.text1,
                    border: colors.border,
                    notification: colors.primary,
                },
                fonts: {
                    regular: { fontFamily: 'Inter-Regular', fontWeight: '400' as const },
                    medium: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
                    bold: { fontFamily: 'Inter-Bold', fontWeight: '700' as const },
                    heavy: { fontFamily: 'Inter-Bold', fontWeight: '900' as const },
                },
            }}
        >
            <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                {!isUnlocked ? (
                    // STATE 1: User has NOT entered a valid access code
                    <RootStack.Screen name="AccessCode" component={AccessCodeScreen} />
                ) : !onboardingComplete ? (
                    // STATE 2: User unlocked but hasn't completed onboarding
                    <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    // STATE 3: Fully authenticated — show the main app
                    <RootStack.Screen name="Main" component={MainNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});