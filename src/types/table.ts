// src/types/table.ts

import React from "react";

export type CellId = number;
export type CellValue = number;

export type Cell = {
    id: CellId;
    amount: CellValue;
};

export type TableContextType = {
    rows: number;
    cols: number;
    xCount: number;
    matrix: Matrix;
    highlightedIds: Set<number>;

    setRows: (r: number) => void;
    setCols: (c: number) => void;
    setXCount: (x: number) => void;
    setMatrix: React.Dispatch<React.SetStateAction<Matrix>>;
    setHighlightedIds: React.Dispatch<React.SetStateAction<Set<number>>>;

    handleHover: (amount: number) => void;
    handleMouseLeave: () => void;
    handleClick: (id: number) => void;

    sums: number[];
    percentileRow: number[];
    random3digits: () => number;
};

export type Matrix = Cell[][];