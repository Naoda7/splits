import { FC, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PhotoIcon, XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface SplitProps {
  onRemoveMedia: () => void;
}

const Split: FC<SplitProps> = ({ onRemoveMedia }) => {
  const [media, setMedia] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".gif"] },
    onDrop: (files) => {
      setMedia(URL.createObjectURL(files[0]));
      setScale(1);
      setPosition({ x: 0, y: 0 });
    },
    noClick: !!media,
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

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setPosition(currentTranslate.current);
        document.body.style.cursor = 'auto';
      }
    };

    const handleTouchEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setPosition(currentTranslate.current);
        document.body.style.cursor = 'auto';
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scale]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (media) {
      isDragging.current = true;
      
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      
      startPos.current = {
        x: clientX - position.x,
        y: clientY - position.y
      };
      
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      setMedia(`https://www.youtube.com/embed/${videoId}`);
    } else {
      setMedia(url);
    }
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setUrl("");
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onRemoveMedia();
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[120px] sm:min-h-[200px] h-full w-full group bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
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
          className="h-full w-full transform will-change-transform touch-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: isDragging.current ? "grabbing" : "grab",
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
        <div className="h-full flex flex-col items-center justify-center p-2 sm:p-4 bg-white dark:bg-gray-900">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files?.[0]) {
                  setMedia(URL.createObjectURL(files[0]));
                }
              };
              input.click();
            }}
            className="p-2 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <PhotoIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
          </button>
          <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 text-center mt-1 sm:mt-2 px-2">
            {isDragActive ? "Drop image here" : "Click to upload or drag & drop"}
          </p>

          <form
            onSubmit={handleUrlSubmit}
            className="mt-4 sm:mt-7 w-full max-w-[240px] sm:max-w-md px-2 sm:px-4 flex flex-col sm:flex-row gap-2 opacity-90 text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter image/YouTube URL"
              className="w-full px-3 py-1.5 text-sm bg-gray-400/20 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm focus:outline-none"
            />
            <button
              type="submit"
              className="w-24 self-center sm:w-auto px-3 py-1.5 text-sm bg-gray-400/20 dark:bg-gray-800/80 text-gray-400 rounded-full shadow-sm hover:bg-gray-400 hover:text-white"
            >
              Load
            </button>
          </form>
        </div>
      )}

      {media && (
        <>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMedia();
              }}
              className="p-1 sm:p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700"
              title="Remove media"
            >
              <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-0.5 sm:p-1 shadow-sm space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.max(0.5, prev - 0.1));
              }}
              className="p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="text-[10px] sm:text-xs px-1 sm:px-2">{(scale * 100).toFixed(0)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.min(2, prev + 0.1));
              }}
              className="p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Split;