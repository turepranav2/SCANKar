// SCANKar — Document Overlay with animated edge detection

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const BRACKET_SIZE = 40;
const BRACKET_THICKNESS = 3;

const DocumentOverlay: React.FC = () => {
    const detected = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Simulate edge detection after 2 seconds
        const timer = setTimeout(() => {
            Animated.timing(detected, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();

            // Pulse animation loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: false }),
                    Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: false }),
                ]),
            ).start();
        }, 2000);

        return () => clearTimeout(timer);
    }, [detected, pulse]);

    const color = detected.interpolate({
        inputRange: [0, 1],
        outputRange: ['#2563EB', '#22C55E'],
    });

    const topInset = detected.interpolate({ inputRange: [0, 1], outputRange: ['20%', '10%'] as any });
    const sideInset = detected.interpolate({ inputRange: [0, 1], outputRange: ['10%', '5%'] as any });
    const bottomInset = detected.interpolate({ inputRange: [0, 1], outputRange: ['20%', '10%'] as any });

    const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

    return (
        <View style={styles.container}>
            {/* Top-left */}
            <Animated.View style={[styles.bracket, { top: topInset, left: sideInset, opacity }]}>
                <Animated.View style={[styles.horizontal, styles.hTop, { backgroundColor: color }]} />
                <Animated.View style={[styles.vertical, styles.vLeft, { backgroundColor: color }]} />
            </Animated.View>
            {/* Top-right */}
            <Animated.View style={[styles.bracket, { top: topInset, right: sideInset, opacity }]}>
                <Animated.View style={[styles.horizontal, styles.hTop, { right: 0, backgroundColor: color }]} />
                <Animated.View style={[styles.vertical, styles.vRight, { backgroundColor: color }]} />
            </Animated.View>
            {/* Bottom-left */}
            <Animated.View style={[styles.bracket, { bottom: bottomInset, left: sideInset, opacity }]}>
                <Animated.View style={[styles.horizontal, styles.hBottom, { backgroundColor: color }]} />
                <Animated.View style={[styles.vertical, styles.vLeft, { bottom: 0, backgroundColor: color }]} />
            </Animated.View>
            {/* Bottom-right */}
            <Animated.View style={[styles.bracket, { bottom: bottomInset, right: sideInset, opacity }]}>
                <Animated.View style={[styles.horizontal, styles.hBottom, { right: 0, backgroundColor: color }]} />
                <Animated.View style={[styles.vertical, styles.vRight, { bottom: 0, backgroundColor: color }]} />
            </Animated.View>

            {/* Guide text */}
            <View style={styles.guidePill}>
                <AnimatedGuideText detected={detected} />
            </View>
        </View>
    );
};

const AnimatedGuideText: React.FC<{ detected: Animated.Value }> = ({ detected }) => {
    const textOpacity = useRef(new Animated.Value(1)).current;
    const [text, setText] = React.useState('Align document edges');

    useEffect(() => {
        const listener = detected.addListener(({ value }: { value: number }) => {
            if (value > 0.9) {
                setText('Document detected ✓');
            }
        });
        return () => detected.removeListener(listener);
    }, [detected, textOpacity]);

    return <Text style={styles.guideText}>{text}</Text>;
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
    horizontal: {
        position: 'absolute',
        width: BRACKET_SIZE,
        height: BRACKET_THICKNESS,
    },
    vertical: {
        position: 'absolute',
        width: BRACKET_THICKNESS,
        height: BRACKET_SIZE,
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
