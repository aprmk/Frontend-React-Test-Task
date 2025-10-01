import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {Cell, Matrix, TableContextType} from "../types/table";

const random3digits = () => Math.floor(Math.random() * 900) + 100;

function generateMatrix(rowCount: number, columnCount: number): Matrix {
    let cellId = 1;
    const matrix: Matrix = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row: Cell[] = [];

        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            row.push({
                id: cellId++,
                amount: random3digits()
            });
        }

        matrix.push(row);
    }

    return matrix;
}

const rowSum = (rowCells: Cell[]) =>
    rowCells.reduce((sum, cell) => sum + cell.amount, 0);

const getColumn = (matrix: Matrix, columnIndex: number) =>
    matrix.map(row => row[columnIndex]?.amount ?? 0);

function percentile(dataValues: number[], percentileRank: number) {
    if (dataValues.length === 0) return 0;

    const sortedValues = [...dataValues].sort((a, b) => a - b);
    if (sortedValues.length === 1) return sortedValues[0];

    const index = (sortedValues.length - 1) * percentileRank;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);

    if (lowerIndex === upperIndex) return sortedValues[lowerIndex];

    const weight = index - lowerIndex;
    return (
        sortedValues[lowerIndex] * (1 - weight) +
        sortedValues[upperIndex] * weight
    );
}

const PERCENT = 0.6;

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rows, setRows] = useState(2);
    const [cols, setCols] = useState(2);
    const [matrix, setMatrix] = useState<Matrix>(() => generateMatrix(2, 2));
    const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
    const [xCount, setXCount] = useState(1);

    useEffect(() => {
        const isValidM = rows >= 1 && rows <= 100;
        const isValidN = cols >= 1 && cols <= 100;
        const isValidX = xCount >= 1 && xCount <= rows * cols - 1;

        if (isValidM && isValidN && isValidX) {
            setMatrix(generateMatrix(rows, cols));
        } else {
            setMatrix([]);
        }
    }, [rows, cols, xCount]);

    const sums = useMemo(() => matrix.map(rowSum), [matrix]);

    const percentileRow = useMemo(
        () => Array.from({ length: cols }, (_, col) =>
            Number(percentile(getColumn(matrix, col), PERCENT).toFixed(1))
        ),
        [matrix, cols]
    );

    const allAmounts = useMemo(() => {
        return matrix.flat().map(cell => cell.amount).sort((a, b) => a - b);
    }, [matrix]);

    const cellsForAmount = useMemo(() => {
        const map: Record<number, number[]> = {};
        matrix.forEach(row => {
            row.forEach(cell => {
                if (!map[cell.amount]) map[cell.amount] = [];
                map[cell.amount].push(cell.id);
            });
        });
        return map;
    }, [matrix]);

    const binarySearchClosestIndex = (arr: number[], target: number): number => {
        let left = 0, right = arr.length - 1;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        if (left > 0 && Math.abs(arr[left - 1] - target) < Math.abs(arr[left] - target)) {
            return left - 1;
        }
        return left;
    };

    const handleHover = (amount: number) => {
        const idx = binarySearchClosestIndex(allAmounts, amount);
        let start = idx - 1;
        let end = idx + 1;
        const closesIds: Set<number> = new Set();
        while (closesIds.size < xCount) {
            let value = null;
            if (start < 0) {
                value = allAmounts[end];
                end += 1;
            } else if (end >= allAmounts.length) {
                value = allAmounts[start];
                start -= 1;
            }
            else if (allAmounts[end] - allAmounts[idx] < allAmounts[idx] - allAmounts[start]) {
                value = allAmounts[end];
                end += 1;
            } else {
                value = allAmounts[start];
                start -= 1;
            }
            cellsForAmount[value].forEach(id => closesIds.add(id));
        }
        setHighlightedIds(closesIds);
    }


    const handleMouseLeave = () => {
        setHighlightedIds(new Set());
    };

    const handleClick = (id: number) => {
        setMatrix(prev =>
            prev.map(row => row.map(cell => cell.id === id ? { ...cell, amount: cell.amount + 1 } : cell))
        );
    };

    return (
        <TableContext.Provider value={{
            rows, cols, xCount, matrix, highlightedIds,
            setRows, setCols, setXCount, setMatrix, setHighlightedIds,
            handleHover, handleMouseLeave, handleClick,
            sums, percentileRow, random3digits
        }}>
            {children}
        </TableContext.Provider>
    );
};

export const useTable = () => {
    const ctx = useContext(TableContext);
    if (!ctx) throw new Error("useTable must be used within TableProvider");
    return ctx;
};
