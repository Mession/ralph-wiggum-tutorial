import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Cell from './Cell';
import { cellKey } from './gameLogic';
import type { Player, CellKey } from './gameLogic';

const CELL_SIZE = 40;
const MAX_VIEWPORT = 560;
const OVERSCAN = 3;

interface VirtualBoardProps {
  gridSize: number;
  board: Map<CellKey, Player>;
  winningCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
}

export default function VirtualBoard({ gridSize, board, winningCells, onCellClick }: VirtualBoardProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const viewportWidth = Math.min(gridSize * CELL_SIZE, MAX_VIEWPORT);
  const viewportHeight = Math.min(gridSize * CELL_SIZE, MAX_VIEWPORT);

  const rowVirtualizer = useVirtualizer({
    count: gridSize,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: OVERSCAN,
  });

  const colVirtualizer = useVirtualizer({
    count: gridSize,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: OVERSCAN,
    horizontal: true,
  });

  return (
    <div
      ref={parentRef}
      style={{ width: viewportWidth, height: viewportHeight }}
      className="overflow-auto border-2 border-gray-400 rounded"
    >
      <div
        style={{
          width: colVirtualizer.getTotalSize(),
          height: rowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) =>
          colVirtualizer.getVirtualItems().map((virtualCol) => {
            const row = virtualRow.index;
            const col = virtualCol.index;
            const key = cellKey(row, col);
            return (
              <Cell
                key={key}
                row={row}
                col={col}
                value={board.get(key) ?? null}
                isWinner={winningCells.has(key)}
                onClick={() => onCellClick(row, col)}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: virtualCol.start,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
