import { FC, useEffect, useState } from 'react';
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
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  EyeSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { TabData } from '../App';
import { loadControlVisibility, saveControlVisibility } from '../utils/storage'; // ⬅️ tambahan

interface ControlProps {
  tabs: TabData[];
  addSplit: () => void;
  removeSplit: () => void;
  toggleDarkMode: () => void;
  isDark: boolean;
  openColorPicker: () => void;
  setLayout: (layout: 'grid' | 'rows' | 'columns') => void;
  toggleFullscreen: () => void;
  resetSplits: () => void;
  createGridLayout: () => void;
  canAddSplit: boolean;
  canRemoveSplit: boolean;
}

const Control: FC<ControlProps> = ({ 
  tabs,
  addSplit,
  removeSplit,
  toggleDarkMode,
  isDark,
  openColorPicker,
  setLayout,
  toggleFullscreen,
  resetSplits,
  createGridLayout,
  canAddSplit,
  canRemoveSplit
}) => {
  const [hasData, setHasData] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isHidden, setIsHidden] = useState(() => loadControlVisibility()); // ⬅️ load dari localStorage

  useEffect(() => {
    const mediaExists = tabs.some(tab => 
      tab.splits.some(split => split.media?.trim())
    );
    setHasData(mediaExists);
  }, [tabs]);

  const handleResetAll = () => {
    if (!hasData) return;
    setShowResetConfirmation(true);
  };

  return (
    <>
      {/* ===== Control Navbar ===== */}
      {!isHidden && (
        <nav className="relative flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 pr-4">
              <button 
                onClick={addSplit}
                disabled={!canAddSplit}
                className={`p-2 rounded-lg transition-colors ${
                  canAddSplit 
                    ? "hover:bg-gray-100 dark:hover:bg-gray-800" 
                    : "opacity-50 cursor-not-allowed"
                }`}
                title={canAddSplit ? "Add Split" : "Maximum 6 splits per tab"}
              >
                <PlusIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>
              
              <button
                onClick={removeSplit}
                disabled={!canRemoveSplit}
                className={`p-2 rounded-lg transition-colors ${
                  canRemoveSplit
                    ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "opacity-50 cursor-not-allowed"
                }`}
                title={canRemoveSplit ? "Remove Split" : "Minimum 1 split required"}
              >
                <MinusIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>

              <button
                onClick={resetSplits}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                title="Reset Current Tab"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>

              <button
                onClick={handleResetAll}
                className={`p-2 rounded-lg transition-colors shrink-0 ${
                  hasData
                    ? 'hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
                title={hasData ? "Reset All Data" : "No data to reset"}
                disabled={!hasData}
              >
                <TrashIcon className="h-5 w-5"/>
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
                <Squares2X2Icon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>
              <button
                onClick={() => setLayout('columns')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
                title="Column Layout"
              >
                <ViewColumnsIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>
              <button
                onClick={() => setLayout('rows')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
                title="Row Layout"
              >
                <QueueListIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
              </button>
            </div>

            <button
              onClick={openColorPicker}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0 ml-4"
              title="Color Picker"
            >
              <SwatchIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
            </button>
          </div>

          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-gray-700 dark:text-gray-500 font-bold shrink-0">
            FZLSplits
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Fullscreen"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700 dark:text-gray-500"/>
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

            {/* 🔽 Tombol Hide Control */}
            <button
              onClick={() => {
                setIsHidden(true);
                saveControlVisibility(true); // ⬅️ simpan ke localStorage
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              title="Hide Controls"
            >
              <EyeSlashIcon className="h-5 w-5 text-gray-700 dark:text-gray-500" />
            </button>
          </div>
        </nav>
      )}

      {/* ===== Tombol Show Control Floating (lebih besar + persist) ===== */}
      {isHidden && (
        <button
          onClick={() => {
            setIsHidden(false);
            saveControlVisibility(false); // ⬅️ simpan ke localStorage
          }}
          className="fixed bottom-32 right-7 z-[1000] p-4 rounded-xl bg-white/30 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg sm:p-3"
          title="Show Controls"
        >
          <EyeIcon className="h-7 w-7 text-gray-700 dark:text-gray-200 p-1"/>
        </button>
      )}

      {/* ===== Reset Confirmation Popup ===== */}
      {showResetConfirmation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResetConfirmation(false)}
          />
          
          <div className={`relative w-full max-w-md rounded-xl shadow-xl transform transition-all ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Confirm Reset</h3>
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="p-1 rounded-full hover:bg-gray-700/50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <p className="mb-6 text-gray-500 dark:text-gray-400">
                This will permanently delete ALL tabs and splits. Are you sure you want to continue?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Control;
