// SCANKar — Root App Component

import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import { AppProvider } from './context/AppContext';
import { AppNavigator } from './navigation/AppNavigator';

const AppContent: React.FC = () => {
    const { isDark, colors } = useTheme();

    return (
        <>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.bg}
            />
            <AppNavigator />
        </>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppProvider>
                    <ScanProvider>
                        <AppContent />
                    </ScanProvider>
                </AppProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
