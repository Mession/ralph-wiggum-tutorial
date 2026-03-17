import { useState } from 'react';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from './gameLogic';

interface SizeSelectorProps {
  onSizeSelect: (size: number) => void;
}

const PRESETS = [10, 15, 19];

export default function SizeSelector({ onSizeSelect }: SizeSelectorProps) {
  const [customSize, setCustomSize] = useState('');

  const parsedCustom = parseInt(customSize, 10);
  const isValidCustom = !isNaN(parsedCustom)
    && parsedCustom >= MIN_GRID_SIZE
    && parsedCustom <= MAX_GRID_SIZE;

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-gray-700">Choose Board Size</h2>

      <div className="flex gap-3">
        {PRESETS.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {size}×{size}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="custom-size" className="text-gray-600">Custom:</label>
        <input
          id="custom-size"
          type="number"
          min={MIN_GRID_SIZE}
          max={MAX_GRID_SIZE}
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          placeholder={`${MIN_GRID_SIZE}–${MAX_GRID_SIZE}`}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
        />
        <button
          onClick={() => isValidCustom && onSizeSelect(parsedCustom)}
          disabled={!isValidCustom}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
