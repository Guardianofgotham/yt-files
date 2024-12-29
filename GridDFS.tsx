import React, {useState, useEffect} from 'react';

const CONFIG = {
  gridColors: {
    updatingCell: '#FF4D4D',
    currentCell: '#32CD32',
    stack: '#1E90FF',
    contributingCell: '#FFD700',
    visitedCell: '#9370DB',
    unvisitedCell: '#FFFFFF',
  },
  legend: [
    {label: 'Updating Cell', key: 'updatingCell'},
    {label: 'Current Cell', key: 'currentCell'},
    {label: 'Stack', key: 'stack'},
    {label: 'Contributing Cell', key: 'contributingCell'},
    {label: 'Visited Cell', key: 'visitedCell'},
    {label: 'Unvisited Cell', key: 'unvisitedCell'},
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
      .map(() => Array(gridSize).fill('unvisited'));
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
      setCellAnswers((prev) => ({...prev, [key]: 1}));
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

    setCellAnswers((prev) => ({...prev, [key]: totalPaths}));
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
    if (contributingCells.has(key)) return CONFIG.gridColors.contributingCell;
    if (visited.has(key)) return CONFIG.gridColors.visitedCell;
    return CONFIG.gridColors.unvisitedCell;
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // padding: '20px',
        overflowY: 'auto',
      }}>
      <div style={{textAlign: 'center', marginBottom: '20px'}}>
        <h2>DFS Path Counting Visualization</h2>
      </div>

      <div style={{marginBottom: '10px', textAlign: 'center'}}>
        <label>Grid Size: </label>
        <input
          type="number"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          min={2}
          max={20}
          style={{padding: '5px', fontSize: '14px', marginRight: '10px'}}
        />
        <label>Timeout (ms): </label>
        <input
          type="number"
          value={timeout}
          onChange={(e) => setTimeoutDuration(Number(e.target.value))}
          min={100}
          max={1000}
          style={{padding: '5px', fontSize: '14px'}}
        />
      </div>

      <div style={{marginBottom: '20px', textAlign: 'center'}}>
        <button
          onClick={() => {
            resetDFS();
            calculatePaths(0, 0, {});
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
          Start DFS
        </button>
      </div>

      <div style={{marginBottom: '20px', textAlign: 'center'}}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            alignItems: 'center',
          }}>
          {CONFIG.legend.map(({label, key}) => (
            <div
              key={key}
              style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: CONFIG.gridColors[key],
                  border: '1px solid black',
                  borderRadius: '3px',
                }}></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 80px)`,
          gridGap: '5px',
          justifyContent: 'center',
        }}>
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: '80px',
                height: '80px',
                border: '1px solid black',
                backgroundColor: getCellColor(rowIndex, colIndex),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '5px',
                transition: 'background-color 0.3s ease',
              }}>
              {cellAnswers[`${rowIndex},${colIndex}`] ?? '-'}
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default GridDFS;
