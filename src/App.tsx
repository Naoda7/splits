import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Control from "./components/Control";
import Split from "./components/Split";
import ColorPicker from "./components/ColorPicker";
import LocalStorageManager from "./components/LocalStorageManager";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toggleFullscreen } from "./utils/fullscreen";
import { saveToLocalStorage, loadFromLocalStorage, saveThemePreference, loadThemePreference } from "./utils/storage";

interface SplitData {
  id: string;
  media?: string;
}

export interface TabData {
  id: string;
  name: string;
  splits: SplitData[];
}

const App = () => {
  const [tabs, setTabs] = useState<TabData[]>(() => {
    const savedData = loadFromLocalStorage();
    return savedData ? savedData.map(tab => ({
      ...tab,
      splits: tab.splits.map(split => ({
        ...split,
        media: split.media?.startsWith('blob:') ? undefined : split.media
      }))
    })) : [{
      id: uuidv4(),
      name: "Tab 1",
      splits: [{ id: uuidv4() }]
    }];
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = loadThemePreference();
    return savedTheme ?? false;
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [layout, setLayout] = useState<"grid" | "rows" | "columns">("grid");
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadData = useCallback((data: TabData[]) => {
    setTabs(data.map(tab => ({
      ...tab,
      splits: tab.splits.map(split => ({
        ...split,
        media: split.media?.startsWith('blob:') ? undefined : split.media
      }))
    })));
  }, []);

  useEffect(() => {
    const savedTheme = loadThemePreference();
    if (savedTheme !== null) {
      document.documentElement.classList.toggle("dark", savedTheme);
    }
  }, []);

  useEffect(() => {
    const hasMedia = tabs.some(tab => 
      tab.splits.some(split => split.media?.trim())
    );

    if (hasMedia) {
      saveToLocalStorage(tabs);
    } else {
      localStorage.removeItem("fzl-splits-data");
    }
  }, [tabs]);

  const addTab = () => {
    if (tabs.length >= 5) return;
    const newTabs = [...tabs, {
      id: uuidv4(),
      name: `Tab ${tabs.length + 1}`,
      splits: [{ id: uuidv4() }]
    }];
    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
  };

  const removeTab = (index: number) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    setActiveTab(Math.min(activeTab, newTabs.length - 1));
  };

  const renameTab = (index: number, newName: string) => {
    if (!newName.trim()) return;
    const newTabs = [...tabs];
    newTabs[index].name = newName.trim();
    setTabs(newTabs);
  };

  const handleDoubleClick = (index: number, name: string) => {
    setEditingTab(index);
    setEditName(name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameSubmit = (index: number) => {
    renameTab(index, editName);
    setEditingTab(null);
  };

  const addSplit = () => {
    if (tabs[activeTab].splits.length >= 6) return;
    const newTabs = [...tabs];
    newTabs[activeTab].splits = [...newTabs[activeTab].splits, { id: uuidv4() }];
    setTabs(newTabs);
  };

  const removeSplit = () => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = newTabs[activeTab].splits.slice(0, -1);
    setTabs(newTabs);
  };

  const resetSplits = () => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = [{ id: uuidv4() }];
    setTabs(newTabs);
  };

  const createGridLayout = () => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = [
      { id: uuidv4() },
      { id: uuidv4() },
      { id: uuidv4() },
      { id: uuidv4() },
    ];
    setTabs(newTabs);
    setLayout("grid");
  };

  const updateSplitMedia = (id: string, media: string) => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = newTabs[activeTab].splits.map((split) =>
      split.id === id ? { ...split, media } : split
    );
    setTabs(newTabs);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      document.documentElement.classList.toggle("dark", newIsDark);
      saveThemePreference(newIsDark);
      return newIsDark;
    });
  };

  const handleFullscreen = () => {
    toggleFullscreen(mainContainerRef.current);
  };

  const getLayoutClass = () => {
    const currentSplits = tabs[activeTab]?.splits || [];
    if (currentSplits.length === 1) return "flex h-full";
    switch (layout) {
      case "grid":
        return "grid grid-cols-2 grid-rows-2 gap-4";
      case "rows":
        return "flex flex-col";
      case "columns":
        return "flex";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const TabBar = () => (
    <div className="flex items-center px-4 py-1 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`flex items-center px-3 py-1 rounded-t-lg cursor-pointer transition-colors ${
            activeTab === index 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab(index)}
          onDoubleClick={() => handleDoubleClick(index, tab.name)}
        >
          {editingTab === index ? (
            <input
              type="text"
              value={editName}
              onChange={handleNameChange}
              onBlur={() => handleNameSubmit(index)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit(index)}
              className="bg-transparent border-none focus:ring-0 text-sm w-[80px]"
              autoFocus
            />
          ) : (
            <span className="text-sm whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis dark:text-gray-400">
              {tab.name}
            </span>
          )}
          {tabs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); removeTab(index); }}
              className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      {tabs.length < 5 && (
        <button
          onClick={addTab}
          className="ml-1 p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={mainContainerRef}
      className={`h-screen flex flex-col ${isDark ? "dark" : ""} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <LocalStorageManager tabs={tabs} onLoad={handleLoadData} />
      
      <Control
        tabs={tabs}
        addSplit={addSplit}
        removeSplit={removeSplit}
        toggleDarkMode={toggleDarkMode}
        isDark={isDark}
        openColorPicker={() => setShowColorPicker(true)}
        setLayout={setLayout}
        toggleFullscreen={handleFullscreen}
        resetSplits={resetSplits}
        createGridLayout={createGridLayout}
        canAddSplit={tabs[activeTab]?.splits?.length < 6}
        canRemoveSplit={tabs[activeTab]?.splits?.length > 1}
      />

      <TabBar />

      <div className={`content-area flex-1 p-4 overflow-auto ${getLayoutClass()}`}>
        {tabs[activeTab]?.splits?.map((split) => (
          <Split
            key={split.id}
            media={split.media}
            onMediaChange={(media) => updateSplitMedia(split.id, media)}
          />
        ))}
      </div>

      {showColorPicker && (
        <ColorPicker
          onClose={() => setShowColorPicker(false)}
          onColorPick={(color) => console.log("Selected color:", color)}
        />
      )}
    </div>
  );
};

export default App;