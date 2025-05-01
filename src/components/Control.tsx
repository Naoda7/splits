import { FC } from 'react'
import {
  PlusIcon,
  MinusIcon,
  Squares2X2Icon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  ViewColumnsIcon,
  QueueListIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface ControlProps {
  addSplit: () => void
  removeSplit: () => void
  toggleDarkMode: () => void
  isDark: boolean
  openColorPicker: () => void
  setLayout: (layout: 'grid' | 'rows' | 'columns') => void
  toggleFullscreen: () => void
  resetSplits: () => void
  createGridLayout: () => void
  canAddSplit: boolean
}

const Control: FC<ControlProps> = ({ 
  addSplit,
  removeSplit,
  toggleDarkMode,
  isDark,
  openColorPicker,
  setLayout,
  toggleFullscreen,
  resetSplits,
  createGridLayout,
  canAddSplit
}) => {
  return (
    <nav className="relative flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 pr-4">
          <button 
            onClick={addSplit}
            disabled={!canAddSplit}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              canAddSplit 
                ? "hover:bg-gray-100 dark:hover:bg-gray-800" 
                : "opacity-50 cursor-not-allowed"
            }`}
            title={canAddSplit ? "Add Split" : "Maximum 6 splits per tab"}
          >
            <PlusIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>
          
          <button
            onClick={removeSplit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            title="Remove Split"
          >
            <MinusIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>

          <button
            onClick={resetSplits}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            title="Reset All Splits"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>
        </div>

        <div className="flex gap-1 border-l pl-4 border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              setLayout('grid');
              createGridLayout();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
            title="Grid Layout"
          >
            <Squares2X2Icon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>
          <button
            onClick={() => setLayout('columns')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
            title="Column Layout"
          >
            <ViewColumnsIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>
          <button
            onClick={() => setLayout('rows')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
            title="Row Layout"
          >
            <QueueListIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
          </button>
        </div>

        <button
          onClick={openColorPicker}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0 ml-4"
          title="Color Picker"
        >
          <SwatchIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
        </button>
      </div>

      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-gray-700 dark:text-gray-100 font-bold shrink-0">
        FZLSplits
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          title="Fullscreen"
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
        </button>

        <button 
          onClick={toggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          title="Toggle Theme"
        >
          {isDark ? 
            <SunIcon className="h-5 w-5 text-yellow-400"/> :
            <MoonIcon className="h-5 w-5 text-gray-700"/>
          }
        </button>
      </div>
    </nav>
  )
}

export default Control