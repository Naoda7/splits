import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Control from "./components/Control";
import Split from "./components/Split";
import ColorPicker from "./components/ColorPicker";
import LastActivityModal from "./components/LastActivityModal";

interface SplitData {
  id: string;
  media?: string; // Menyimpan URL media (data URL atau YouTube URL)
}

interface ActivityData {
  splits: SplitData[];
  isDark: boolean; // Menyimpan state dark mode
  timestamp: number;
}

const App = () => {
  const [splits, setSplits] = useState<SplitData[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [layout, setLayout] = useState<"grid" | "rows" | "columns">("grid");
  const [showLastActivityModal, setShowLastActivityModal] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Cek aktivitas terakhir saat komponen dimount
  useEffect(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const { splits: savedSplits, isDark: savedIsDark, timestamp } = JSON.parse(lastActivity) as ActivityData;

      // Cek apakah data valid
      const isDataValid = Array.isArray(savedSplits) && typeof savedIsDark === "boolean";
      const isWithin24Hours = Date.now() - timestamp < 24 * 60 * 60 * 1000;

      if (isDataValid && isWithin24Hours) {
        setShowLastActivityModal(true);
      } else {
        localStorage.removeItem("lastActivity"); // Hapus data invalid
      }
    }
  }, []);

  // Simpan aktivitas ke localStorage
  const saveActivity = () => {
    const activity: ActivityData = {
      splits,
      isDark, // Simpan state dark mode
      timestamp: Date.now(),
    };
    localStorage.setItem("lastActivity", JSON.stringify(activity));
  };

  // Pulihkan aktivitas terakhir
  const restoreActivity = () => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const { splits: savedSplits, isDark: savedIsDark } = JSON.parse(lastActivity) as ActivityData;

      // Pastikan data splits valid sebelum memulihkan
      if (Array.isArray(savedSplits)) {
        setSplits(savedSplits);
      }

      // Pulihkan dark mode
      if (typeof savedIsDark === "boolean") {
        setIsDark(savedIsDark);
        document.documentElement.classList.toggle("dark", savedIsDark);
      }
    }
    setShowLastActivityModal(false);
  };

  // Hapus aktivitas terakhir
  const deleteLastActivity = () => {
    localStorage.removeItem("lastActivity"); // Hapus data dari localStorage
    setShowLastActivityModal(false); // Tutup modal
  };

  // Fungsi untuk menambah split
  const addSplit = () => {
    const newSplits = [...splits, { id: uuidv4() }];
    setSplits(newSplits);
    saveActivity(); // Simpan aktivitas
  };

  // Fungsi untuk menghapus split
  const removeSplit = () => {
    const newSplits = splits.slice(0, -1);
    setSplits(newSplits);
    saveActivity(); // Simpan aktivitas
  };

  // Fungsi untuk mereset split
  const resetSplits = () => {
    const newSplits = [{ id: uuidv4() }];
    setSplits(newSplits);
    saveActivity(); // Simpan aktivitas
  };

  // Fungsi untuk membuat grid layout
  const createGridLayout = () => {
    const newSplits = [
      { id: uuidv4() },
      { id: uuidv4() },
      { id: uuidv4() },
      { id: uuidv4() },
    ];
    setSplits(newSplits);
    saveActivity(); // Simpan aktivitas
    setLayout("grid");
  };

  // Update media di split
  const updateSplitMedia = (id: string, media: string) => {
    const newSplits = splits.map((split) =>
      split.id === id ? { ...split, media } : split
    );
    setSplits(newSplits);
    saveActivity(); // Simpan aktivitas
  };

  // Fungsi untuk toggle dark mode
  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      document.documentElement.classList.toggle("dark", newIsDark);
      return newIsDark;
    });
    // Tidak perlu panggil saveActivity() karena sudah di-handle oleh useEffect
  };

  // Simpan aktivitas otomatis saat splits atau isDark berubah
  useEffect(() => {
    if (splits.length > 0 || isDark) {
      saveActivity(); // Hanya simpan jika ada aktivitas
    }
  }, [splits, isDark]);

  // Fungsi untuk menentukan class layout
  const getLayoutClass = () => {
    if (splits.length === 1) return "flex h-full";
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
      />

      <div className={`content-area flex-1 p-4 overflow-auto ${getLayoutClass()}`}>
        {splits.map((split) => (
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