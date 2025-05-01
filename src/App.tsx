import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Control from "./components/Control";
import Split from "./components/Split";
import ColorPicker from "./components/ColorPicker";
import LastActivityModal from "./components/LastActivityModal";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SplitData {
  id: string;
  media?: string;
}

interface TabData {
  id: string;
  name: string;
  splits: SplitData[];
}

interface ActivityData {
  tabs: TabData[];
  activeTab: number;
  isDark: boolean;
  timestamp: number;
}

const App = () => {
  const [tabs, setTabs] = useState<TabData[]>([{
    id: uuidv4(),
    name: "Tab 1",
    splits: [{ id: uuidv4() }]
  }]);
  const [activeTab, setActiveTab] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [layout, setLayout] = useState<"grid" | "rows" | "columns">("grid");
  const [showLastActivityModal, setShowLastActivityModal] = useState(false);
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const saveActivity = useCallback(() => {
    const activity: ActivityData = {
      tabs,
      activeTab,
      isDark,
      timestamp: Date.now(),
    };
    localStorage.setItem("lastActivity", JSON.stringify(activity));
  }, [tabs, activeTab, isDark]);

  useEffect(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const { tabs: savedTabs, activeTab: savedActiveTab, isDark: savedIsDark, timestamp } = JSON.parse(lastActivity) as ActivityData;

      const isDataValid = Array.isArray(savedTabs) && 
                         typeof savedActiveTab === "number" && 
                         typeof savedIsDark === "boolean";
      const isWithin24Hours = Date.now() - timestamp < 24 * 60 * 60 * 1000;

      if (isDataValid && isWithin24Hours) {
        setShowLastActivityModal(true);
      } else {
        localStorage.removeItem("lastActivity");
      }
    }
  }, []);

  const restoreActivity = () => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const { tabs: savedTabs, activeTab: savedActiveTab, isDark: savedIsDark } = JSON.parse(lastActivity) as ActivityData;

      if (Array.isArray(savedTabs)) {
        setTabs(savedTabs);
        setActiveTab(savedActiveTab);
      }

      if (typeof savedIsDark === "boolean") {
        setIsDark(savedIsDark);
        document.documentElement.classList.toggle("dark", savedIsDark);
      }
    }
    setShowLastActivityModal(false);
  };

  const deleteLastActivity = () => {
    localStorage.removeItem("lastActivity");
    setShowLastActivityModal(false); 
  };

  const addTab = () => {
    if (tabs.length >= 5) return;
    const newTabs = [...tabs, {
      id: uuidv4(),
      name: `Tab ${tabs.length + 1}`,
      splits: [{ id: uuidv4() }]
    }];
    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
    saveActivity();
  };

  const removeTab = (index: number) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    setActiveTab(Math.min(activeTab, newTabs.length - 1));
    saveActivity();
  };

  const renameTab = (index: number, newName: string) => {
    if (!newName.trim()) return;
    const newTabs = [...tabs];
    newTabs[index].name = newName.trim();
    setTabs(newTabs);
    saveActivity();
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
    saveActivity();
  };

  const removeSplit = () => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = newTabs[activeTab].splits.slice(0, -1);
    setTabs(newTabs);
    saveActivity();
  };

  const resetSplits = () => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = [{ id: uuidv4() }];
    setTabs(newTabs);
    saveActivity();
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
    saveActivity();
    setLayout("grid");
  };

  const updateSplitMedia = (id: string, media: string) => {
    const newTabs = [...tabs];
    newTabs[activeTab].splits = newTabs[activeTab].splits.map((split) =>
      split.id === id ? { ...split, media } : split
    );
    setTabs(newTabs);
    saveActivity();
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      document.documentElement.classList.toggle("dark", newIsDark);
      return newIsDark;
    });
  };

  useEffect(() => {
    if (tabs.length > 0 || isDark) {
      saveActivity();
    }
  }, [tabs, isDark, saveActivity]);

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
            <span className="text-sm whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis">
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
      <Control
        addSplit={addSplit}
        removeSplit={removeSplit}
        toggleDarkMode={toggleDarkMode}
        isDark={isDark}
        openColorPicker={() => setShowColorPicker(true)}
        setLayout={setLayout}
        toggleFullscreen={() => {}}
        resetSplits={resetSplits}
        createGridLayout={createGridLayout}
        canAddSplit={tabs[activeTab]?.splits?.length < 6}
      />

      <TabBar />

      <div className={`content-area flex-1 p-4 overflow-auto ${getLayoutClass()}`}>
        {tabs[activeTab]?.splits?.map((split) => (
          <Split
            key={split.id}
            onRemoveMedia={removeSplit}
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

      <LastActivityModal
        isOpen={showLastActivityModal}
        onClose={() => setShowLastActivityModal(false)}
        onRestore={restoreActivity}
        onDelete={deleteLastActivity}
      />
    </div>
  );
};

export default App;