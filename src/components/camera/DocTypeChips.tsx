// SCANKar — Document Type Filter Chips

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type DocTypeFilter = 'auto' | 'table' | 'text' | 'form';

interface DocTypeChipsProps {
    activeFilter: DocTypeFilter;
    onSelect: (filter: DocTypeFilter) => void;
}

const FILTERS: { key: DocTypeFilter; label: string }[] = [
    { key: 'auto', label: 'Auto' },
    { key: 'table', label: 'Table' },
    { key: 'text', label: 'Text' },
    { key: 'form', label: 'Form' },
];

const DocTypeChips: React.FC<DocTypeChipsProps> = ({ activeFilter, onSelect }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {FILTERS.map((f) => {
                const isActive = f.key === activeFilter;
                return (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                        onPress={() => onSelect(f.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    chip: {
        height: 32,
        paddingHorizontal: spacing.base,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: '#FFFFFF',
    },
    chipInactive: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: typography.caption.fontFamily,
    },
    chipTextActive: {
        color: '#2563EB',
    },
    chipTextInactive: {
        color: '#FFFFFF',
    },
});

export default DocTypeChips;
