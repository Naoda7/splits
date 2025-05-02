import { useEffect } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/storage";
import { TabData } from "../App";

interface Props {
  tabs: TabData[];
  onLoad: (data: TabData[]) => void;
}

const LocalStorageManager = ({ tabs, onLoad }: Props) => {
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) onLoad(savedData);
  }, []);

  useEffect(() => {
    saveToLocalStorage(tabs);
  }, [tabs]);

  return null;
};

export default LocalStorageManager;