import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface UploaderProps {
  onImageSelected: (dataUrl: string, fileInfo: { name: string; size: number }) => void;
  selectedImage: string | null;
  fileName: string | null;
  onClear: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({
  onImageSelected,
  selectedImage,
  fileName,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected(reader.result as string, {
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full my-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-[#e0e0e0] dark:border-zinc-800 rounded-md p-6 sm:p-8 text-center cursor-pointer transition-colors bg-[#FAFAFA] dark:bg-zinc-900/40 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800/50 ${
            isDragging ? "border-[#1a1a1a] bg-[#F0F0F0]" : ""
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#eaeaea] dark:border-zinc-700 flex items-center justify-center text-[#4a4a4a] dark:text-zinc-300 shadow-2xs">
              <Upload className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium text-[#1a1a1a] dark:text-zinc-100">
                Drag and drop image here
              </span>
              <span className="text-sm text-[#6b6b6b] dark:text-zinc-400">
                {" "}or browse
              </span>
            </div>
            <p className="text-xs text-[#8c8c8c] dark:text-zinc-500">
              JPG, JPEG, PNG, WEBP (Limit 20MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-[#e0e0e0] dark:border-zinc-800 rounded-md p-3 bg-[#FAFAFA] dark:bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-black/5">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#1a1a1a] dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">
                {fileName || "uploaded-image.jpg"}
              </p>
              <p className="text-[11px] text-[#8c8c8c] dark:text-zinc-400">
                Ready for MobileNetV2 analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2.5 py-1 rounded-md border border-[#d1d5db] dark:border-zinc-700 text-[#374151] dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-[#6b6b6b] hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
