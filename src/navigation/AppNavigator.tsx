// SCANKar — Root Navigator (TDD §6.2)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ROUTES } from './routes';

const RootStack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
    const { isUnlocked, isLoading, onboardingComplete } = useAuth();
    const { colors } = useTheme();

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
            }}
        >
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {!isUnlocked ? (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                ) : !onboardingComplete ? (
                    <RootStack.Screen
                        name="Onboarding"
                        component={AuthNavigator}
                        initialParams={{ skipToOnboarding: true }}
                    />
                ) : (
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
