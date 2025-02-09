import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Control from "./components/Control";
import Split from "./components/Split";
import ColorPicker from "./components/ColorPicker";

interface SplitData {
  id: string;
}

const App = () => {
  const [splits, setSplits] = useState<SplitData[]>([{ id: uuidv4() }]);
  const [isDark, setIsDark] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [layout, setLayout] = useState<"grid" | "rows" | "columns">("grid");
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const addSplit = () => {
    setSplits((prev) => [...prev, { id: uuidv4() }]);
  };

  const removeSplit = () => {
    setSplits((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const toggleFullscreen = () => {
    if (mainContainerRef.current) {
      const content = mainContainerRef.current.querySelector(".content-area");
      if (content instanceof HTMLElement) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          content.requestFullscreen();
        }
      }
    }
  };

  const getLayoutClass = () => {
    if (splits.length === 1) return "flex h-full";
    switch (layout) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "rows":
        return "flex flex-col";
      case "columns":
        return "flex";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

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
        toggleFullscreen={toggleFullscreen}
      />

      <div className={`content-area flex-1 gap-4 p-4 overflow-auto ${getLayoutClass()}`}>
        {splits.map((split) => (
          <Split key={split.id} onRemoveMedia={() => {}} />
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