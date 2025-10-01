import React, { useState } from "react";
import "./Table.scss";
import { useTable } from "./TableContext";

const Table: React.FC = () => {
    const {
        rows, cols, xCount, matrix, highlightedIds,
        setRows, setCols, setXCount, setMatrix,
        handleHover, handleMouseLeave, handleClick,
        sums, percentileRow, random3digits
    } = useTable();

    const [inputErrors, setInputErrors] = useState<{ rows?: string; cols?: string; xCount?: string }>({});

    const validateInputs = (rowsAmount: number, columnsAmount: number, x: number) => {
        const errors: typeof inputErrors = {};

        if (rowsAmount < 0 || rowsAmount > 100) {
            errors.rows = "M must be between 1 and 100";
        }
        if (columnsAmount < 0 || columnsAmount > 100) {
            errors.cols = "N must be between 1 and 100";
        }
        const maxX = rowsAmount * columnsAmount - 1;
        if (x < 0 || x > maxX) {
            errors.xCount = `X must be between 1 and ${maxX}`;
        }
        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const [hoveredSumRowIndex, setHoveredSumRowIndex] = useState<number | null>(null);

    return (
        <div>
            <div className="table-controls">
                <div>
                    <button onClick={() => {
                        const newRow = Array.from({length: cols}, () => ({
                            id: Date.now() + Math.random(),
                            amount: random3digits()
                        }));
                        setMatrix(prev => {
                            const newMatrix = [...prev, newRow];
                            setRows(newMatrix.length);
                            return newMatrix;
                        });
                    }}>
                        Add Row
                    </button>
                </div>
                <div className="table-actions">
                    <label>
                        Rows (M):
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={rows}
                            onChange={(e) => {
                                let val = Number(e.target.value);
                                validateInputs(val, cols, xCount);

                                if (val < 0) val = 0;
                                if (val > 100) val = 100;
                                setRows(val);
                            }}
                        />
                        {inputErrors.rows && <div className="input-error">{inputErrors.rows}</div>}
                    </label>
                    <label>
                        Columns (N):
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={cols}
                            onChange={(e) => {
                                let val = Number(e.target.value);
                                validateInputs(rows, val, xCount);

                                if (val < 0) val = 0;
                                if (val > 100) val = 100;

                                setCols(val);
                            }}
                        />
                        {inputErrors.cols && <div className="input-error">{inputErrors.cols}</div>}
                    </label>
                    <label>
                        X (closest cells to highlight):
                        <input
                            type="number"
                            min={0}
                            max={rows * cols - 1}
                            value={xCount}
                            onChange={(e) => {
                                let val = Number(e.target.value);
                                validateInputs(rows, cols, val);

                                const maxX = rows * cols - 1;
                                if (val < 0) val = 0;
                                if (val > maxX) val = maxX;

                                setXCount(val);
                            }}
                        />
                        {inputErrors.xCount && <div className="input-error">{inputErrors.xCount}</div>}
                    </label>
                </div>

            </div>

            <table>
                <thead>
                <tr>
                    <th></th>
                    {Array.from({length: cols}, (_, i) => (
                        <th key={i}>Cell values N = {i + 1}</th>
                    ))}
                    <th>Sum values</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {matrix.map((row, rowIndex) => {
                    const rowSumValue = sums[rowIndex];
                    const maxAmount = Math.max(...row.map(cell => cell.amount));

                    return (
                        <tr key={rowIndex}>
                            <td>Cell Value M = {rowIndex + 1}</td>
                            {row.map(cell => {
                                const percentOfSum = Math.round((cell.amount / rowSumValue) * 100);
                                const percentOfMax = Math.round((cell.amount / maxAmount) * 100);
                                const isHighlightedByRowHover = hoveredSumRowIndex === rowIndex;

                                return (
                                    <td
                                        key={cell.id}
                                        onMouseEnter={() => handleHover(cell.amount)}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => handleClick(cell.id)}
                                        className={`${highlightedIds.has(cell.id) ? "highlight" : ""} ${isHighlightedByRowHover ? `heatmap-${percentOfMax}` : ""}`}
                                    >
                                        {isHighlightedByRowHover ? `${percentOfSum}%` : cell.amount}
                                    </td>
                                );
                            })}
                            <td
                                onMouseEnter={() => setHoveredSumRowIndex(rowIndex)}
                                onMouseLeave={() => setHoveredSumRowIndex(null)}
                            >
                                {rowSumValue}
                            </td>
                            <td className="remove-btn">
                                <button onClick={() => {
                                    setMatrix(previousMatrix => {
                                        const updatedMatrix = previousMatrix.filter((_, index) => index !== rowIndex);
                                        setRows(updatedMatrix.length); // ✅ оновлення rows
                                        return updatedMatrix;
                                    });
                                }}>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    );
                })}
                <tr className="percentile">
                    <td>60th percentile</td>
                    {percentileRow.map((value, index) => (
                        <td key={index}>{value}</td>
                    ))}
                    <td></td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Table;
