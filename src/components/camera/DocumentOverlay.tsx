// SCANKar — Document Overlay (corner brackets + guide text)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BRACKET_SIZE = 40;
const BRACKET_THICKNESS = 3;
const BRACKET_COLOR = '#2563EB';

const DocumentOverlay: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Top-left */}
            <View style={[styles.bracket, styles.topLeft]}>
                <View style={[styles.horizontal, styles.hTop]} />
                <View style={[styles.vertical, styles.vLeft]} />
            </View>
            {/* Top-right */}
            <View style={[styles.bracket, styles.topRight]}>
                <View style={[styles.horizontal, styles.hTop, { right: 0 }]} />
                <View style={[styles.vertical, styles.vRight]} />
            </View>
            {/* Bottom-left */}
            <View style={[styles.bracket, styles.bottomLeft]}>
                <View style={[styles.horizontal, styles.hBottom]} />
                <View style={[styles.vertical, styles.vLeft, { bottom: 0 }]} />
            </View>
            {/* Bottom-right */}
            <View style={[styles.bracket, styles.bottomRight]}>
                <View style={[styles.horizontal, styles.hBottom, { right: 0 }]} />
                <View style={[styles.vertical, styles.vRight, { bottom: 0 }]} />
            </View>

            {/* Guide text */}
            <View style={styles.guidePill}>
                <Text style={styles.guideText}>Align document edges</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bracket: {
        position: 'absolute',
        width: BRACKET_SIZE,
        height: BRACKET_SIZE,
    },
    topLeft: { top: '20%', left: '10%' },
    topRight: { top: '20%', right: '10%' },
    bottomLeft: { bottom: '20%', left: '10%' },
    bottomRight: { bottom: '20%', right: '10%' },
    horizontal: {
        position: 'absolute',
        width: BRACKET_SIZE,
        height: BRACKET_THICKNESS,
        backgroundColor: BRACKET_COLOR,
    },
    vertical: {
        position: 'absolute',
        width: BRACKET_THICKNESS,
        height: BRACKET_SIZE,
        backgroundColor: BRACKET_COLOR,
    },
    hTop: { top: 0, left: 0 },
    hBottom: { bottom: 0, left: 0 },
    vLeft: { top: 0, left: 0 },
    vRight: { top: 0, right: 0 },
    guidePill: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    guideText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '400',
    },
});

export default DocumentOverlay;
