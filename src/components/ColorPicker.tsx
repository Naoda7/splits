import { FC, useState } from 'react'
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface ColorPickerProps {
  onClose: () => void
  onColorPick: (color: string) => void
}

const ColorPicker: FC<ColorPickerProps> = ({ onClose, onColorPick }) => {
  const [color, setColor] = useState('#ffffff')
  const [imageUrl, setImageUrl] = useState('')
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [showContent, setShowContent] = useState(true)

  const addColorToHistory = (newColor: string) => {
    if (!colorHistory.includes(newColor)) {
      setColorHistory(prev => [newColor, ...prev].slice(0, 10))
    }
  }

  const removeFromHistory = (colorToRemove: string) => {
    setColorHistory(prev => prev.filter(color => color !== colorToRemove))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
  }

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-80 border border-gray-200 dark:border-gray-700 mb-14">
      {/* Header dengan Tombol Kontrol */}
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

      {/* Konten Utama */}
      {showContent && (
        <>
          {/* Input Color Picker */}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 mb-4 cursor-pointer bg-transparent"
          />

          {/* Input Gambar */}
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL for color sampling"
            className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          />

          {/* Tombol Pick Color */}
          <button
            onClick={() => {
              onColorPick(color)
              addColorToHistory(color)
            }}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
          >
            Pick Color
          </button>

          {/* Riwayat Warna */}
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
                            onClick={() => copyToClipboard(color)}
                            className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:opacity-80 transition-opacity"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[0.7rem] text-gray-600 dark:text-gray-400">RGB</span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate dark:text-gray-200">{hexToRgb(color)}</span>
                          <button 
                            onClick={() => copyToClipboard(hexToRgb(color))}
                            className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:opacity-80 transition-opacity"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[0.7rem] text-gray-600 dark:text-gray-400">RGBA</span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate dark:text-gray-200">{hexToRgba(color, 1)}</span>
                          <button 
                            onClick={() => copyToClipboard(hexToRgba(color, 1))}
                            className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:opacity-80 transition-opacity"
                          >
                            Copy
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
  )
}

export default ColorPicker