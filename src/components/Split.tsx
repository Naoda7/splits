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
  
  // Refs untuk tracking drag state
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

      // Hitung pergerakan mouse
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      // Update posisi secara langsung ke DOM
      draggableRef.current.style.transform = 
        `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;

      // Simpan posisi sementara
      currentTranslate.current = { x: deltaX, y: deltaY };
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        // Update state dengan posisi terakhir
        setPosition(currentTranslate.current);
        document.body.style.cursor = 'auto';
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (media) {
      isDragging.current = true;
      
      // Simpan posisi awal
      startPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      
      // Update cursor
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
      className="relative h-full w-full group bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive && !media && (
        <div className="absolute inset-0 bg-blue-500/10 border-4 border-dashed border-blue-400 flex items-center justify-center z-30">
          <PhotoIcon className="h-16 w-16 text-blue-500 animate-pulse" />
        </div>
      )}

      {media && (
        <div
          ref={draggableRef}
          className="h-full w-full transform will-change-transform"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: isDragging.current ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        >
          {media.includes("youtube.com") ? (
            <iframe
              src={media}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
              title="YouTube video"
            />
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
        <div className="h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900">
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
            className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </button>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
            {isDragActive ? "Drop image here" : "Click to upload or drag & drop"}
          </p>
        </div>
      )

      {media && (
        <>
          <div className="absolute top-2 right-2 z-20 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMedia();
              }}
              className="p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700"
              title="Remove media"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-2 right-2 z-20 flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.max(0.5, prev - 0.1));
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="text-xs px-2 self-center">{(scale * 100).toFixed(0)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setScale((prev) => Math.min(2, prev + 0.1));
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {!media && (
        <form
          onSubmit={handleUrlSubmit}
          className="absolute bottom-2 left-2 right-2 z-20 flex gap-2 opacity-90"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter image/YouTube URL"
            className="flex-1 px-3 py-1.5 text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600"
          >
            Load
          </button>
        </form>
      )}
    </div>
  );
};

export default Split;