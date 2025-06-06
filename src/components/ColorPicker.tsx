import { FC, useState, useEffect } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, EyeDropperIcon } from '@heroicons/react/24/outline';

interface ColorPickerProps {
  onClose: () => void;
  onColorPick: (color: string) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ onClose, onColorPick }) => {
  const [color, setColor] = useState('#ffffff');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [showContent, setShowContent] = useState(true);
  const [isEyedropperSupported, setIsEyedropperSupported] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<'hex' | 'rgb' | 'rgba' | null>(null);

  // Check if browser supports EyeDropper API
  useEffect(() => {
    setIsEyedropperSupported('EyeDropper' in window);
  }, []);

  const addColorToHistory = (newColor: string) => {
    if (!colorHistory.includes(newColor)) {
      setColorHistory((prev) => [newColor, ...prev].slice(0, 10));
    }
  };

  const removeFromHistory = (colorToRemove: string) => {
    setColorHistory((prev) => prev.filter((color) => color !== colorToRemove));
  };

  const copyToClipboard = (text: string, index: number, type: 'hex' | 'rgb' | 'rgba') => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedType(type);
    
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedType(null);
    }, 2000);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const pickColorWithEyedropper = async () => {
    if (isEyedropperSupported) {
      try {
        // @ts-expect-error - EyeDropper API is not yet standardized in TypeScript
        const eyeDropper = new EyeDropper();
        const { sRGBHex } = await eyeDropper.open();
        setColor(sRGBHex);
        addColorToHistory(sRGBHex);
        onColorPick(sRGBHex);
      } catch (error) {
        console.error('Failed to use EyeDropper:', error);
      }
    } else {
      alert('Your browser does not support the EyeDropper API. Please use Chrome or Edge.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-80 border border-gray-200 dark:border-gray-800 mb-14">
      {/* Header with Control Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold dark:text-gray-100">Color Picker</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowContent(!showContent)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300 transition-colors"
          >
            {showContent ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showContent && (
        <>
          {/* Color Picker Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 cursor-pointer bg-transparent"
            />
            {/* Eye Dropper Button */}
            <button
              onClick={pickColorWithEyedropper}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <EyeDropperIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Pick Color Button */}
          <button
            onClick={() => {
              onColorPick(color);
              addColorToHistory(color);
            }}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            Pick Color
          </button>

          {/* Color History */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Color History</h4>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-2">
              {colorHistory.map((color, i) => (
                <div key={i} className="p-2.5 rounded bg-gray-100 dark:bg-gray-800 relative">
                  <button
                    onClick={() => removeFromHistory(color)}
                    className="absolute top-2.5 right-2.5 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                  </button>

                  <div className="flex items-start gap-3 pr-6">
                    <div
                      className="h-8 w-8 rounded border dark:border-gray-700 shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[0.7rem] text-gray-600 dark:text-gray-400">HEX</span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate dark:text-gray-200">{color}</span>
                          <button
                            onClick={() => copyToClipboard(color, i, 'hex')}
                            className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 transition-opacity ${
                              copiedIndex === i && copiedType === 'hex'
                                ? 'bg-blue-500/50 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {copiedIndex === i && copiedType === 'hex' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[0.7rem] text-gray-600 dark:text-gray-400">RGB</span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate dark:text-gray-200">{hexToRgb(color)}</span>
                          <button
                            onClick={() => copyToClipboard(hexToRgb(color), i, 'rgb')}
                            className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 transition-opacity ${
                              copiedIndex === i && copiedType === 'rgb'
                                ? 'bg-blue-500/50 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {copiedIndex === i && copiedType === 'rgb' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[0.7rem] text-gray-600 dark:text-gray-400">RGBA</span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate dark:text-gray-200">{hexToRgba(color, 1)}</span>
                          <button
                            onClick={() => copyToClipboard(hexToRgba(color, 1), i, 'rgba')}
                            className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 transition-opacity ${
                              copiedIndex === i && copiedType === 'rgba'
                                ? 'bg-blue-500/50 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {copiedIndex === i && copiedType === 'rgba' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;