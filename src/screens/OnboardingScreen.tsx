// SCANKar — Onboarding Screen (Screen 01)
// 3-card horizontal swipe carousel matching Stitch screens 01a/01b/01c

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingCard {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
}

const CARDS: OnboardingCard[] = [
    {
        id: 'capture',
        icon: '📷',
        title: 'Capture Any Document',
        subtitle: 'Tables, handwriting, printed sheets — all supported',
    },
    {
        id: 'ai',
        icon: '🤖',
        title: 'AI Extracts Instantly',
        subtitle: '7 offline ML models process everything on your device',
    },
    {
        id: 'export',
        icon: '📤',
        title: 'Export in Any Format',
        subtitle: 'Excel, PDF, Word, CSV — structure always preserved',
    },
];

const OnboardingScreen: React.FC = () => {
    const { completeOnboarding } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(index);
        },
        []
    );

    const handleSkip = useCallback(async () => {
        await completeOnboarding();
    }, [completeOnboarding]);

    const handleGetStarted = useCallback(async () => {
        if (activeIndex < CARDS.length - 1) {
            // Advance to next card
            const nextIndex = activeIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveIndex(nextIndex);
        } else {
            // Last card — complete onboarding
            await completeOnboarding();
        }
    }, [activeIndex, completeOnboarding]);

    const renderCard = useCallback(
        ({ item }: { item: OnboardingCard }) => (
            <View style={styles.slide}>
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardIcon}>{item.icon}</Text>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                </View>
            </View>
        ),
        []
    );

    const isLastSlide = activeIndex === CARDS.length - 1;

    return (
        <View style={styles.container}>
            {/* Skip Button */}
            {!isLastSlide && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Carousel */}
            <FlatList
                ref={flatListRef}
                data={CARDS}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                bounces={false}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
                {CARDS.map((_, index) => {
                    const inputRange = [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 12, 8],
                        extrapolate: 'clamp',
                    });

                    const dotOpacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    height: dotWidth,
                                    opacity: dotOpacity,
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Get Started / Next Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                >
                    <Text style={styles.getStartedText}>
                        {isLastSlide ? 'Get Started →' : 'Next →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2563EB',
    },

    // Skip
    skipButton: {
        position: 'absolute',
        top: 56,
        right: spacing.base,
        zIndex: 10,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
    },
    skipText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
        fontFamily: typography.caption.fontFamily,
    },

    // Carousel
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: typography.h3.fontFamily,
    },
    cardSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 22,
        fontFamily: typography.body.fontFamily,
    },

    // Dots
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    dot: {
        borderRadius: 9999,
        backgroundColor: '#FFFFFF',
    },

    // Button
    buttonContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 48,
    },
    getStartedButton: {
        backgroundColor: '#FFFFFF',
        height: 52,
        borderRadius: radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2563EB',
        fontFamily: typography.button.fontFamily,
    },
});

export default OnboardingScreen;
