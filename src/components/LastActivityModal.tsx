import { FC } from "react";
import { ClockIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

interface LastActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

const LastActivityModal: FC<LastActivityModalProps> = ({
  isOpen,
  onClose,
  onRestore,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Activity History
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You have saved your last activity. Would you like to restore it?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={onRestore}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default LastActivityModal;