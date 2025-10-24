import { TabData } from "../App";

const STORAGE_KEY = "fzl-splits-data";
const THEME_KEY = "fzl-theme-preference";
const CONTROL_VISIBILITY_KEY = "fzl-control-hidden"; // 🔥 baru ditambahkan

interface StorageSplit {
  id: string;
  media?: string;
}

interface StorageTab {
  id: string;
  name: string;
  splits: StorageSplit[];
}

/* ===============================
   SPLIT DATA STORAGE
   =============================== */
export const saveToLocalStorage = (tabs: TabData[]): void => {
  const tabsToStore = JSON.parse(JSON.stringify(tabs)) as TabData[];
  
  const filteredTabs = tabsToStore
    .map(tab => ({
      ...tab,
      splits: tab.splits.filter((split: StorageSplit) => {
        if (!split.media) return false;
        return (
          split.media.startsWith("data:image") ||
          split.media.startsWith("http") ||
          split.media.startsWith("https")
        );
      })
    }))
    .filter(tab => tab.splits.length > 0);

  if (filteredTabs.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTabs));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const loadFromLocalStorage = (): TabData[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  try {
    const parsedData = JSON.parse(data);
    if (isValidTabData(parsedData)) {
      return parsedData as TabData[];
    }
    return null;
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    return null;
  }
};

function isValidTabData(data: unknown): data is StorageTab[] {
  if (!Array.isArray(data)) return false;
  return data.every((tab: StorageTab) => 
    typeof tab?.id === "string" &&
    typeof tab?.name === "string" &&
    Array.isArray(tab?.splits) &&
    tab.splits.every((split: StorageSplit) => 
      typeof split?.id === "string" &&
      (split.media === undefined || typeof split.media === "string")
    )
  );
}

export const hasMediaInStorage = (): boolean => {
  const data = loadFromLocalStorage();
  return (
    data?.some((tab: StorageTab) =>
      tab.splits.some((split: StorageSplit) =>
        split.media?.startsWith("data:image") ||
        split.media?.startsWith("http")
      )
    ) ?? false
  );
};

/* ===============================
   THEME PREFERENCE STORAGE
   =============================== */
export const saveThemePreference = (isDark: boolean): void => {
  localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
};

export const loadThemePreference = (): boolean | null => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved ? JSON.parse(saved) : null;
};

/* ===============================
   CONTROL VISIBILITY STORAGE
   =============================== */
export const saveControlVisibility = (isHidden: boolean): void => {
  localStorage.setItem(CONTROL_VISIBILITY_KEY, JSON.stringify(isHidden));
};

export const loadControlVisibility = (): boolean => {
  const saved = localStorage.getItem(CONTROL_VISIBILITY_KEY);
  return saved ? JSON.parse(saved) : false;
};
