// SCANKar — Auth Navigator (Lock Screen + Onboarding)

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';

// Real screens
import AccessCodeScreen from '../screens/AccessCodeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

export type AuthStackParamList = {
    [ROUTES.ACCESS_CODE]: undefined;
    [ROUTES.ONBOARDING]: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name={ROUTES.ACCESS_CODE} component={AccessCodeScreen} />
            <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
        </Stack.Navigator>
    );
};
