// SCANKar — Main Navigator (Bottom Tabs + Nested Stacks, TDD §6.2)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { ROUTES } from './routes';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme';

// ─── Real screens ───
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import PreviewCropScreen from '../screens/PreviewCropScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import TableReviewScreen from '../screens/TableReviewScreen';
import TableEditorScreen from '../screens/TableEditorScreen';
import ParagraphReviewScreen from '../screens/ParagraphReviewScreen';
import ExportScreen from '../screens/ExportScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ModelStatusScreen from '../screens/ModelStatusScreen';

// All screens are now real implementations (Modules 0–9 complete)

// ─── Param Lists ───

export type HomeStackParamList = {
    [ROUTES.HOME]: undefined;
    [ROUTES.CAMERA]: undefined;
    [ROUTES.PREVIEW_CROP]: { imageUri: string };
    [ROUTES.PROCESSING]: { imageUri: string; docType?: string };
    [ROUTES.TABLE_REVIEW]: { scanId: string };
    [ROUTES.PARAGRAPH_REVIEW]: { scanId: string };
    [ROUTES.TABLE_EDITOR]: { scanId: string };
    [ROUTES.EXPORT]: { scanId: string };
};

export type HistoryStackParamList = {
    [ROUTES.HISTORY]: undefined;
    [ROUTES.TABLE_REVIEW]: { scanId: string };
    [ROUTES.PARAGRAPH_REVIEW]: { scanId: string };
    [ROUTES.EXPORT]: { scanId: string };
};

export type SettingsStackParamList = {
    [ROUTES.SETTINGS]: undefined;
    [ROUTES.MODEL_STATUS]: undefined;
};

export type MainTabParamList = {
    [ROUTES.HOME_TAB]: undefined;
    [ROUTES.HISTORY_TAB]: undefined;
    [ROUTES.SETTINGS_TAB]: undefined;
};

// ─── Home Stack ───

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name={ROUTES.HOME} component={HomeScreen} />
        <HomeStack.Screen name={ROUTES.CAMERA} component={CameraScreen} />
        <HomeStack.Screen name={ROUTES.PREVIEW_CROP} component={PreviewCropScreen} />
        <HomeStack.Screen name={ROUTES.PROCESSING} component={ProcessingScreen} />
        <HomeStack.Screen name={ROUTES.TABLE_REVIEW} component={TableReviewScreen} />
        <HomeStack.Screen name={ROUTES.PARAGRAPH_REVIEW} component={ParagraphReviewScreen} />
        <HomeStack.Screen name={ROUTES.TABLE_EDITOR} component={TableEditorScreen} />
        <HomeStack.Screen name={ROUTES.EXPORT} component={ExportScreen} />
    </HomeStack.Navigator>
);

// ─── History Stack ───

const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

const HistoryStackNavigator: React.FC = () => (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
        <HistoryStack.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
        <HistoryStack.Screen name={ROUTES.TABLE_REVIEW} component={TableReviewScreen} />
        <HistoryStack.Screen name={ROUTES.PARAGRAPH_REVIEW} component={ParagraphReviewScreen} />
        <HistoryStack.Screen name={ROUTES.EXPORT} component={ExportScreen} />
    </HistoryStack.Navigator>
);

// ─── Settings Stack ───

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator: React.FC = () => (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
        <SettingsStack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
        <SettingsStack.Screen name={ROUTES.MODEL_STATUS} component={ModelStatusScreen} />
    </SettingsStack.Navigator>
);

// ─── Bottom Tab Navigator ───

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text2,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: typography.caption.fontSize,
                    fontWeight: '400',
                },
            }}
        >
            <Tab.Screen
                name={ROUTES.HOME_TAB}
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name={ROUTES.HISTORY_TAB}
                component={HistoryStackNavigator}
                options={{ tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name={ROUTES.SETTINGS_TAB}
                component={SettingsStackNavigator}
                options={{ tabBarLabel: 'Settings' }}
            />
        </Tab.Navigator>
    );
};
