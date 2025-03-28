import { FC, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PhotoIcon, XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface SplitProps {
  onRemoveMedia: () => void;
  media?: string;
  onMediaChange: (media: string) => void;
}

const Split: FC<SplitProps> = ({ media, onMediaChange }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  // Cleanup Blob URL
  useEffect(() => {
    return () => {
      if (media?.startsWith("blob:")) {
        URL.revokeObjectURL(media);
      }
    };
  }, [media]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".gif"] },
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit");
        return;
      }

      setIsLoading(true);
      try {
        const blobUrl = URL.createObjectURL(file);
        onMediaChange(blobUrl);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } catch (error) {
        console.error("Error handling file:", error);
      } finally {
        setIsLoading(false);
      }
    },
    noClick: !!media,
    noDragEventsBubbling: true,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !draggableRef.current) return;
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      draggableRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
      currentTranslate.current = { x: deltaX, y: deltaY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !draggableRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;
      draggableRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
      currentTranslate.current = { x: deltaX, y: deltaY };
    };

    const handleEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setPosition(currentTranslate.current);
        document.body.style.cursor = "auto";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [scale]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          if (blob.size > MAX_FILE_SIZE) {
            alert("File size exceeds 10MB limit");
            return;
          }
          setIsLoading(true);
          try {
            const blobUrl = URL.createObjectURL(blob);
            onMediaChange(blobUrl);
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } catch (error) {
            console.error("Error pasting image:", error);
          } finally {
            setIsLoading(false);
          }
          return;
        }
      }
    }

    const pastedText = e.clipboardData.getData("text/plain");
    if (pastedText) {
      setUrl(pastedText);
      processMediaUrl(pastedText);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const processMediaUrl = (url: string) => {
    if (!url) return;

    const videoId = extractYouTubeId(url);
    if (videoId) {
      onMediaChange(`https://www.youtube.com/embed/${videoId}`);
    } else {
      onMediaChange(url);
    }
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (media && !isLoading) {
      isDragging.current = true;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      startPos.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };

      document.body.style.cursor = "grabbing";
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processMediaUrl(url);
  };

  const handleRemoveMedia = () => {
    if (media?.startsWith("blob:")) {
      URL.revokeObjectURL(media);
    }
    onMediaChange("");
    setUrl("");
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square sm:aspect-auto min-h-[120px] sm:min-h-[200px] h-full w-full group bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive && !media && (
        <div className="absolute inset-0 bg-blue-500/10 border-4 border-dashed border-blue-400 flex items-center justify-center z-30">
          <PhotoIcon className="h-12 w-12 text-blue-500 animate-pulse" />
        </div>
      )}

      {media && (
        <div
          ref={draggableRef}
          className="h-full w-full transform will-change-transform touch-none flex-1"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: isLoading ? "wait" : isDragging.current ? "grabbing" : "grab",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {media.includes("youtube.com") ? (
            <div className="aspect-video w-full h-full">
              <iframe
                src={media}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          ) : (
            <img
              src={media}
              alt="Media content"
              className="w-full h-full object-contain rounded-lg select-none"
              draggable={false}
            />
          )}
        </div>
      )}

      {!media && (
        <div className="h-full flex flex-col items-center justify-center p-1.5 sm:p-4 bg-white dark:bg-gray-900">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files?.[0]) {
                  if (files[0].size > MAX_FILE_SIZE) {
                    alert("File size exceeds 10MB limit");
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const blobUrl = URL.createObjectURL(files[0]);
                    onMediaChange(blobUrl);
                  } catch (error) {
                    console.error("Error loading file:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }
              };
              input.click();
            }}
            className="p-2 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <PhotoIcon className="h-6 w-6 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
          </button>
          
          <p className="text-[11px] sm:text-base text-gray-500 dark:text-gray-400 text-center mt-1 sm:mt-2 px-2 leading-tight">
            {isDragActive ? "Drop image here" : "Click to upload\nor drag & drop"}
          </p>

          <form
            onSubmit={handleUrlSubmit}
            className="mt-3 sm:mt-7 w-full max-w-[240px] sm:max-w-md px-1 sm:px-4 flex flex-col sm:flex-row gap-1 sm:gap-2 opacity-90 text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="Enter image/YouTube URL"
              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-400/20 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-20 sm:w-24 self-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-400/20 dark:bg-gray-800/80 text-gray-400 rounded-full shadow-sm hover:bg-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load"}
            </button>
          </form>
        </div>
      )}

      {media && (
        <>
          <div className="absolute top-0.5 right-0.5 sm:top-2 sm:right-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMedia();
              }}
              className="p-1 sm:p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
              title="Remove media"
            >
              <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="absolute bottom-0.5 right-0.5 sm:bottom-2 sm:right-2 z-20 flex items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-0.5 sm:p-1 shadow-sm space-x-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.max(0.5, prev - 0.1));
              }}
              className="p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={isLoading}
            >
              <MinusIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
            </button>
            <span className="text-[9px] sm:text-xs px-1 sm:px-2">{(scale * 100).toFixed(0)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.min(2, prev + 0.1));
              }}
              className="p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={isLoading}
            >
              <PlusIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default Split;