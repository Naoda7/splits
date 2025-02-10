import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Control from "./components/Control";
import Split from "./components/Split";
import ColorPicker from "./components/ColorPicker";

interface SplitData {
  id: string;
}

const App = () => {
  // State untuk menyimpan data split
  const [splits, setSplits] = useState<SplitData[]>([{ id: uuidv4() }]);
  
  // State untuk dark mode
  const [isDark, setIsDark] = useState(false);
  
  // State untuk menampilkan color picker
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // State untuk layout (grid, rows, columns)
  const [layout, setLayout] = useState<"grid" | "rows" | "columns">("grid");
  
  // Ref untuk container utama
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menambah split
  const addSplit = () => {
    setSplits((prev) => [...prev, { id: uuidv4() }]);
  };

  // Fungsi untuk menghapus split
  const removeSplit = () => {
    setSplits((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  // Fungsi untuk mereset split ke kondisi awal
  const resetSplits = () => {
    setSplits([{ id: uuidv4() }]); // Kembalikan ke 1 split dengan ID baru
  };

  // Fungsi untuk toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Fungsi untuk toggle fullscreen
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

  // Fungsi untuk menentukan class layout berdasarkan state
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
      {/* Control Bar */}
      <Control
        addSplit={addSplit}
        removeSplit={removeSplit}
        toggleDarkMode={toggleDarkMode}
        isDark={isDark}
        openColorPicker={() => setShowColorPicker(true)}
        setLayout={setLayout}
        toggleFullscreen={toggleFullscreen}
        resetSplits={resetSplits} // Tambahkan prop resetSplits
      />

      {/* Area Konten */}
      <div className={`content-area flex-1 gap-4 p-4 overflow-auto ${getLayoutClass()}`}>
        {splits.map((split) => (
          <Split key={split.id} onRemoveMedia={() => {}} />
        ))}
      </div>

      {/* Color Picker Modal */}
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