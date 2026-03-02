// SCANKar — Table Data Model (TDD §5.2)

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TableCell {
    row: number;
    col: number;
    text: string;
    confidence: number;
    isManualEntry: boolean;
    isMerged: boolean;
    mergeId?: string;
    boundingBox: BoundingBox;
}

export interface MergedCell {
    id: string;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
}

export interface TableData {
    rows: number;
    columns: number;
    cells: TableCell[][];
    mergedCells: MergedCell[];
    hasHeaderRow: boolean;
}
