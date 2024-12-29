import React, { useState, useEffect } from "react";

const CONFIG = {
    gridColors: {
        updatingCell: "bg-red-500",
        currentCell: "bg-green-500",
        stack: "bg-blue-500",
        contributingCell: "bg-yellow-400",
        visitedCell: "bg-purple-500",
        unvisitedCell: "bg-white",
    },
    legend: [
        { label: "Updating Cell", key: "updatingCell" },
        { label: "Current Cell", key: "currentCell" },
        { label: "Stack", key: "stack" },
        { label: "Contributing Cell", key: "contributingCell" },
        { label: "Visited Cell", key: "visitedCell" },
        { label: "Unvisited Cell", key: "unvisitedCell" },
    ],
};

const GridDFS = () => {
    const [gridSize, setGridSize] = useState(5);
    const [timeout, setTimeoutDuration] = useState(300);
    const [grid, setGrid] = useState([]);
    const [currentCell, setCurrentCell] = useState(null);
    const [visited, setVisited] = useState(new Set());
    const [cellAnswers, setCellAnswers] = useState({});
    const [stack, setStack] = useState([]);
    const [contributingCells, setContributingCells] = useState(new Set());
    const [updatingCell, setUpdatingCell] = useState(null);

    useEffect(() => {
        const newGrid = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill("unvisited"));
        setGrid(newGrid);
        resetDFS();
    }, [gridSize, timeout]);

    const resetDFS = () => {
        setVisited(new Set());
        setCellAnswers({});
        setStack([]);
        setCurrentCell(null);
        setContributingCells(new Set());
        setUpdatingCell(null);
    };

    const isSafe = (x, y) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

    const calculatePaths = async (x, y, cellAnswersCache) => {
        const key = `${x},${y}`;
        if (!isSafe(x, y) || visited.has(key)) return 0;

        setStack((prev) => [...prev, key]);
        setCurrentCell([x, y]);

        if (key in cellAnswersCache) {
            setStack((prev) => prev.filter((cell) => cell !== key));
            return cellAnswersCache[key];
        }

        if (x === gridSize - 1 && y === gridSize - 1) {
            setCellAnswers((prev) => ({ ...prev, [key]: 1 }));
            setVisited((prev) => new Set([...prev, key]));
            await new Promise((resolve) => setTimeout(resolve, timeout));
            setStack((prev) => prev.filter((cell) => cell !== key));
            return 1;
        }

        setVisited((prev) => new Set([...prev, key]));
        await new Promise((resolve) => setTimeout(resolve, timeout));

        const contributingSet = new Set(contributingCells);
        const rightPaths = await calculatePaths(x, y + 1, cellAnswersCache);
        const downPaths = await calculatePaths(x + 1, y, cellAnswersCache);

        const totalPaths = rightPaths + downPaths;

        if (isSafe(x, y + 1)) contributingSet.add(`${x},${y + 1}`);
        if (isSafe(x + 1, y)) contributingSet.add(`${x + 1},${y}`);

        cellAnswersCache[key] = totalPaths;
        setCurrentCell([x, y]);
        await new Promise((resolve) => setTimeout(resolve, 2 * timeout));

        setContributingCells(contributingSet);
        await new Promise((resolve) => setTimeout(resolve, 4 * timeout));

        setCellAnswers((prev) => ({ ...prev, [key]: totalPaths }));
        setUpdatingCell(key);
        await new Promise((resolve) => setTimeout(resolve, 2 * timeout));

        setStack((prev) => prev.filter((cell) => cell !== key));
        if (isSafe(x, y + 1)) contributingSet.delete(`${x},${y + 1}`);
        if (isSafe(x + 1, y)) contributingSet.delete(`${x + 1},${y}`);
        setContributingCells(contributingSet);
        setUpdatingCell(null);

        return totalPaths;
    };

    const getCellColor = (x, y) => {
        const key = `${x},${y}`;
        if (updatingCell === key) return CONFIG.gridColors.updatingCell;
        if (currentCell && currentCell[0] === x && currentCell[1] === y)
            return CONFIG.gridColors.currentCell;
        if (stack.includes(key)) return CONFIG.gridColors.stack;
        if (contributingCells.has(key))
            return CONFIG.gridColors.contributingCell;
        if (visited.has(key)) return CONFIG.gridColors.visitedCell;
        return CONFIG.gridColors.unvisitedCell;
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen overflow-y-auto">
            <div className="text-center mb-5">
                <h2 className="text-2xl font-bold">
                    Counting path with DFS using Memoization Visualization
                </h2>
            </div>

            <div className="mb-4 text-center">
                <label>Grid Size: </label>
                <input
                    type="number"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    min={2}
                    max={20}
                    className="p-1 border rounded mr-2"
                />
                <label>Timeout (ms): </label>
                <input
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeoutDuration(Number(e.target.value))}
                    min={100}
                    max={1000}
                    className="p-1 border rounded"
                />
            </div>

            <div className="mb-5 text-center">
                <button
                    onClick={() => {
                        resetDFS();
                        calculatePaths(0, 0, {});
                    }}
                    className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                    Start DFS
                </button>
            </div>

            <div className="mb-5 text-center flex justify-center gap-4">
                {CONFIG.legend.map(({ label, key }) => (
                    <div key={key} className="flex items-center gap-2">
                        <div
                            className={`w-5 h-5 ${CONFIG.gridColors[key]} border rounded`}
                        ></div>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div
                className={`grid gap-1`}
                style={{ gridTemplateColumns: `repeat(${gridSize}, 80px)` }}
            >
                {grid.map((row, rowIndex) =>
                    row.map((_, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-20 h-20 border border-black flex items-center justify-center rounded transition-colors ${getCellColor(
                                rowIndex,
                                colIndex
                            )}`}
                        >
                            {cellAnswers[`${rowIndex},${colIndex}`] ?? "-"}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GridDFS;
