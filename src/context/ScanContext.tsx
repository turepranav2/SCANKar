// SCANKar — Scan Context Provider

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Scan, ProcessingPhase, EditAction } from '../models/Scan';

const MAX_UNDO_HISTORY = 50;

interface ScanContextValue {
    currentScan: Scan | null;
    capturedImageUri: string | null;
    processingPhase: ProcessingPhase;
    isProcessing: boolean;
    editHistory: EditAction[];
    editHistoryIndex: number;
    canUndo: boolean;
    canRedo: boolean;

    setCapturedImage: (uri: string | null) => void;
    setCurrentScan: (scan: Scan | null) => void;
    setProcessingPhase: (phase: ProcessingPhase) => void;
    pushEdit: (action: EditAction) => void;
    undo: () => EditAction | undefined;
    redo: () => EditAction | undefined;
    clearEditHistory: () => void;
    resetScanState: () => void;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentScan, setCurrentScan] = useState<Scan | null>(null);
    const [capturedImageUri, setCapturedImage] = useState<string | null>(null);
    const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('idle');
    const [editHistory, setEditHistory] = useState<EditAction[]>([]);
    const [editHistoryIndex, setEditHistoryIndex] = useState(-1);

    const isProcessing = processingPhase !== 'idle';

    const canUndo = editHistoryIndex >= 0;
    const canRedo = editHistoryIndex < editHistory.length - 1;

    const pushEdit = useCallback((action: EditAction) => {
        setEditHistory(prev => {
            const truncated = prev.slice(0, editHistoryIndex + 1);
            const updated = [...truncated, action];
            if (updated.length > MAX_UNDO_HISTORY) {
                return updated.slice(updated.length - MAX_UNDO_HISTORY);
            }
            return updated;
        });
        setEditHistoryIndex(prev => Math.min(prev + 1, MAX_UNDO_HISTORY - 1));
    }, [editHistoryIndex]);

    const undo = useCallback((): EditAction | undefined => {
        if (!canUndo) return undefined;
        const action = editHistory[editHistoryIndex];
        setEditHistoryIndex(prev => prev - 1);
        return action;
    }, [canUndo, editHistory, editHistoryIndex]);

    const redo = useCallback((): EditAction | undefined => {
        if (!canRedo) return undefined;
        const nextIndex = editHistoryIndex + 1;
        const action = editHistory[nextIndex];
        setEditHistoryIndex(nextIndex);
        return action;
    }, [canRedo, editHistory, editHistoryIndex]);

    const clearEditHistory = useCallback(() => {
        setEditHistory([]);
        setEditHistoryIndex(-1);
    }, []);

    const resetScanState = useCallback(() => {
        setCurrentScan(null);
        setCapturedImage(null);
        setProcessingPhase('idle');
        clearEditHistory();
    }, [clearEditHistory]);

    const value = useMemo<ScanContextValue>(() => ({
        currentScan,
        capturedImageUri,
        processingPhase,
        isProcessing,
        editHistory,
        editHistoryIndex,
        canUndo,
        canRedo,
        setCapturedImage,
        setCurrentScan,
        setProcessingPhase,
        pushEdit,
        undo,
        redo,
        clearEditHistory,
        resetScanState,
    }), [
        currentScan, capturedImageUri, processingPhase, isProcessing,
        editHistory, editHistoryIndex, canUndo, canRedo,
        pushEdit, undo, redo, clearEditHistory, resetScanState,
    ]);

    return (
        <ScanContext.Provider value={value}>
            {children}
        </ScanContext.Provider>
    );
};

export const useScan = (): ScanContextValue => {
    const context = useContext(ScanContext);
    if (!context) {
        throw new Error('useScan must be used within a ScanProvider');
    }
    return context;
};

export default ScanContext;
