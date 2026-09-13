import React, { useState } from "react";
import { ForensicMarker } from "../types";
import { PreprocessResult } from "../utils/imageProcessing";

interface ForensicDetailsProps {
  markers: ForensicMarker[];
  preprocessData: PreprocessResult | null;
  explanation: string;
}

export const ForensicDetails: React.FC<ForensicDetailsProps> = ({
  markers,
  preprocessData,
  explanation,
}) => {
  const [showTensor, setShowTensor] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-[#eaeaea] dark:border-zinc-800 text-xs">
      <div className="mb-3">
        <p className="text-[#1a1a1a] dark:text-zinc-200 font-medium mb-1">
          Forensic & Feature Analysis
        </p>
        <p className="text-[#595959] dark:text-zinc-400 leading-relaxed text-[13px]">
          {explanation}
        </p>
      </div>

      {/* Markers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
        {markers.map((marker, i) => (
          <div
            key={i}
            className="p-2.5 rounded-md border border-[#eaeaea] dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[#1a1a1a] dark:text-zinc-200 text-[12px]">
                {marker.name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                  marker.status === "Natural"
                    ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    : marker.status === "Synthetic"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {marker.status}
              </span>
            </div>
            <p className="text-[#6b6b6b] dark:text-zinc-400 text-[11px] leading-snug">
              {marker.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Preprocessing inspection */}
      {preprocessData && (
        <div className="mt-4 p-3 rounded-md bg-[#F9F9F9] dark:bg-zinc-900/40 border border-[#eaeaea] dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#1a1a1a] dark:text-zinc-200">
              OpenCV & NumPy Preprocessing Pipeline (224×224)
            </span>
            <button
              type="button"
              onClick={() => setShowTensor(!showTensor)}
              className="text-[11px] text-[#4a4a4a] dark:text-zinc-400 underline hover:text-black dark:hover:text-white"
            >
              {showTensor ? "Hide tensor preview" : "View 224×224 tensor"}
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#555] dark:text-zinc-400">
            <div>
              <span className="block text-[#8c8c8c]">Resolution:</span>
              <span className="font-mono text-[#1a1a1a] dark:text-zinc-200">
                {preprocessData.originalWidth} × {preprocessData.originalHeight} → 224 × 224
              </span>
            </div>
            <div>
              <span className="block text-[#8c8c8c]">Color Space:</span>
              <span className="font-mono text-[#1a1a1a] dark:text-zinc-200">
                RGB Normalized [-1, 1]
              </span>
            </div>
            <div>
              <span className="block text-[#8c8c8c]">Mean RGB:</span>
              <span className="font-mono text-[#1a1a1a] dark:text-zinc-200">
                ({preprocessData.meanR}, {preprocessData.meanG}, {preprocessData.meanB})
              </span>
            </div>
            <div>
              <span className="block text-[#8c8c8c]">Spatial Variance:</span>
              <span className="font-mono text-[#1a1a1a] dark:text-zinc-200">
                {preprocessData.variance}
              </span>
            </div>
          </div>

          {showTensor && (
            <div className="mt-3 pt-3 border-t border-[#eaeaea] dark:border-zinc-800 flex items-center gap-4">
              <img
                src={preprocessData.resized224DataUrl}
                alt="224x224 tensor"
                className="w-20 h-20 rounded border border-[#ddd] object-cover"
              />
              <p className="text-[11px] text-[#6b6b6b] leading-relaxed">
                Tensor input formatted via bilinear interpolation to exact dimensions expected by MobileNetV2 architecture.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
