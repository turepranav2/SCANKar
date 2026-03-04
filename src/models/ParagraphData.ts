// SCANKar — Paragraph Data Model (TDD §5.3)

import { BoundingBox } from './TableData';

export type TextBlockType = 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption';

export interface WordResult {
    text: string;
    confidence: number;
    boundingBox: BoundingBox;
    language: string;
    isHandwritten: boolean;
}

export interface TextBlock {
    id: string;
    type?: TextBlockType;
    text: string;
    words?: WordResult[];
    confidence: number;
    boundingBox?: BoundingBox;
    isManualEntry?: boolean;
    language?: string;
}

export interface ParagraphData {
    blocks: TextBlock[];
}
