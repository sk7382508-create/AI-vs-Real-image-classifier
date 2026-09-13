import React, { useState } from "react";
import { Sparkles, Scan, HelpCircle, Layers, Image as ImageIcon } from "lucide-react";
import { Uploader } from "./components/Uploader";
import { InlineAction } from "./components/ui/inline-action";
import { CarouselSlider, DEFAULT_SAMPLE_SLIDES, Slide } from "./components/ui/carousel-slider";
import { PieChart } from "./components/PieChart";
import { ForensicDetails } from "./components/ForensicDetails";
import { AboutSection } from "./components/AboutSection";
import { ClassificationResult } from "./types";
import { preprocessImage224, PreprocessResult, urlToBase64 } from "./utils/imageProcessing";

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"classifier" | "samples" | "about">("classifier");
  const [resultsTab, setResultsTab] = useState<"aivsreal" | "mobilenet">("aivsreal");
  const [preprocessData, setPreprocessData] = useState<PreprocessResult | null>(null);
  const [results, setResults] = useState<ClassificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelected = async (
    dataUrl: string,
    fileInfo: { name: string; size: number }
  ) => {
    setSelectedImage(dataUrl);
    setFileName(fileInfo.name);
    setResults(null);
    setErrorMsg(null);

    // Preprocess tensor
    try {
      const processed = await preprocessImage224(dataUrl);
      setPreprocessData(processed);
    } catch (e) {
      console.warn("Tensor preview processing warning:", e);
    }
  };

  const handleSelectSample = async (slide: Slide) => {
    try {
      const base64 = await urlToBase64(slide.img);
      setSelectedImage(base64);
      setFileName(slide.title ? `${slide.title.toLowerCase().replace(/\s+/g, "_")}.jpg` : "sample.jpg");
      setResults(null);
      setErrorMsg(null);
      setActiveTab("classifier");

      const processed = await preprocessImage224(base64);
      setPreprocessData(processed);
    } catch (err) {
      console.error("Error loading sample image:", err);
      // Fallback with direct image URL
      setSelectedImage(slide.img);
      setFileName(slide.title || "sample.jpg");
      setResults(null);
      setActiveTab("classifier");
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setFileName(null);
    setResults(null);
    setPreprocessData(null);
    setErrorMsg(null);
  };

  const runClassification = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Ensure 224x224 preprocessing has completed
      let tensor = preprocessData;
      if (!tensor) {
        tensor = await preprocessImage224(selectedImage);
        setPreprocessData(tensor);
      }

      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedImage.startsWith("data:image/png") ? "image/png" : "image/jpeg",
          filename: fileName || "image.jpg",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: ClassificationResult = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("Classification error:", err);
      setErrorMsg(err.message || "Failed to classify image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-black selection:text-white">
      <div className="max-w-[680px] mx-auto pt-10 pb-16 px-4">
        {/* Navigation / Header */}
        <div className="border-b border-[#eaeaea] pb-3 mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-medium text-2xl sm:text-[1.65rem] text-[#1a1a1a] tracking-tight">
              AI vs Real Image Classifier
            </h1>
            <p className="text-sm text-[#4a4a4a] mt-0.5">
              Upload an image and find out if it&apos;s real or AI-generated.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("classifier")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "classifier"
                  ? "bg-[#1a1a1a] text-white font-medium"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]"
              }`}
            >
              Classifier
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("samples")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "samples"
                  ? "bg-[#1a1a1a] text-white font-medium"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]"
              }`}
            >
              Sample Gallery
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "about"
                  ? "bg-[#1a1a1a] text-white font-medium"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]"
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab 1: Classifier */}
        {activeTab === "classifier" && (
          <div>
            <p className="text-sm text-[#4a4a4a] mb-2">
              Upload an image and the model will identify its synthetic probability and object classes.
            </p>

            {/* Uploader */}
            <Uploader
              onImageSelected={handleImageSelected}
              selectedImage={selectedImage}
              fileName={fileName}
              onClear={handleClear}
            />

            {/* Image Preview & Find Out Action */}
            {selectedImage ? (
              <div className="my-6">
                <div className="rounded-lg overflow-hidden border border-[#eaeaea] bg-[#f9f9f9]">
                  <img
                    src={selectedImage}
                    alt="Uploaded candidate"
                    className="w-full max-h-[440px] object-contain mx-auto block"
                  />
                </div>

                {/* Inline Action requested when user hits find */}
                <div className="mt-5">
                  <InlineAction
                    label="MobileNetV2 Deep Analysis"
                    icon={<Scan className="w-5 h-5 text-[#1a1a1a]" />}
                    actionText="Find out"
                    onAction={runClassification}
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Spinner note */}
                {isAnalyzing && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-[#6b6b6b] animate-pulse">
                      Analyzing image (resizing to 224x224 &amp; calculating synthetic frequency markers)...
                    </p>
                  </div>
                )}

                {/* Error notice if any */}
                {errorMsg && (
                  <div className="mt-3 p-3 text-xs rounded border border-red-200 bg-red-50 text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Results Section */}
                {results && (
                  <div className="mt-8 pt-6 border-t border-[#eaeaea]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-lg font-medium text-[#1a1a1a]">
                          Results
                        </h2>
                        <p className="text-xs text-[#6b6b6b]">
                          Classification verdict based on multi-scale feature inspection.
                        </p>
                      </div>

                      {/* View toggle */}
                      <div className="inline-flex rounded-md border border-[#e0e0e0] p-0.5 bg-[#f5f5f5] text-xs">
                        <button
                          type="button"
                          onClick={() => setResultsTab("aivsreal")}
                          className={`px-3 py-1 rounded transition-colors ${
                            resultsTab === "aivsreal"
                              ? "bg-white font-medium text-[#1a1a1a] shadow-xs"
                              : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                          }`}
                        >
                          AI vs Real
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultsTab("mobilenet")}
                          className={`px-3 py-1 rounded transition-colors ${
                            resultsTab === "mobilenet"
                              ? "bg-white font-medium text-[#1a1a1a] shadow-xs"
                              : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                          }`}
                        >
                          Top 5 Classes
                        </button>
                      </div>
                    </div>

                    {/* Verdict Banner */}
                    <div className="p-3.5 rounded-md border border-[#e0e0e0] bg-[#fafafa] flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#6b6b6b] block">
                          Primary Determination
                        </span>
                        <span className="text-base font-medium text-[#1a1a1a]">
                          {results.classification === "AI-Generated"
                            ? "AI-Generated / Synthetic"
                            : "Authentic Photograph / Real"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#6b6b6b] block">Confidence</span>
                        <span className="text-lg font-mono font-medium text-[#1a1a1a]">
                          {results.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    {/* Result Rows */}
                    {resultsTab === "aivsreal" ? (
                      <div className="my-3">
                        <div className="result-row">
                          <span className="result-label">Authentic Real Photograph</span>
                          <span className="result-score">{results.realScore}%</span>
                        </div>
                        <div className="result-row">
                          <span className="result-label">AI-Generated / Synthetic</span>
                          <span className="result-score">{results.aiScore}%</span>
                        </div>

                        {/* Neutral Grayscale Pie Chart */}
                        <div className="pt-4">
                          <p className="text-xs text-[#6b6b6b] text-center mb-1 font-mono">
                            AI vs Real Distribution
                          </p>
                          <PieChart
                            data={[
                              { label: "Real Photo", score: parseFloat(results.realScore) || 50 },
                              { label: "AI Generated", score: parseFloat(results.aiScore) || 50 },
                            ]}
                            palette={["#2b2b2b", "#828282"]}
                            size={210}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="my-3">
                        {results.topPredictions.map((pred, i) => (
                          <div key={i} className="result-row">
                            <span className="result-label">{pred.label}</span>
                            <span className="result-score">
                              {Number(pred.score).toFixed(2)}%
                            </span>
                          </div>
                        ))}

                        {/* Neutral Grayscale Pie Chart for Classes */}
                        <div className="pt-4">
                          <p className="text-xs text-[#6b6b6b] text-center mb-1 font-mono">
                            Top Predictions Breakdown
                          </p>
                          <PieChart
                            data={results.topPredictions}
                            palette={["#2b2b2b", "#5a5a5a", "#828282", "#a8a8a8", "#c9c9c9"]}
                            size={210}
                          />
                        </div>
                      </div>
                    )}

                    {/* Forensic Details & Preprocessing */}
                    <ForensicDetails
                      markers={results.forensicMarkers}
                      preprocessData={preprocessData}
                      explanation={results.explanation}
                    />

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-[#6b6b6b] hover:text-[#1a1a1a] underline underline-offset-4"
                      >
                        Reset and classify another image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-[#8c8c8c] italic mb-6">
                  No image uploaded yet.
                </p>

                {/* Quick Sample Selector */}
                <div className="p-4 rounded-md border border-[#eaeaea] bg-[#fafafa]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#1a1a1a]">
                      Or test with pre-selected images:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("samples")}
                      className="text-xs text-[#4a4a4a] hover:text-black underline"
                    >
                      Browse full gallery →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DEFAULT_SAMPLE_SLIDES.map((slide) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => handleSelectSample(slide)}
                        className="group flex flex-col items-center text-left"
                      >
                        <div className="w-full aspect-square rounded-md overflow-hidden border border-[#ddd] bg-zinc-100 group-hover:border-[#1a1a1a] transition-all">
                          <img
                            src={slide.img}
                            alt={slide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] text-[#555] truncate max-w-full mt-1">
                          {slide.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Carousel Slider Sample Gallery */}
        {activeTab === "samples" && (
          <div className="my-4">
            <div className="mb-4">
              <h2 className="text-base font-medium text-[#1a1a1a]">
                Sample Image Gallery
              </h2>
              <p className="text-xs text-[#4a4a4a]">
                Swipe through test images, tap a card to load it directly into the classifier.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#eaeaea] bg-[#fbfbfb] flex flex-col items-center">
              <CarouselSlider
                slides={DEFAULT_SAMPLE_SLIDES}
                onSelectSlide={handleSelectSample}
              />
            </div>
          </div>
        )}

        {/* Tab 3: About & Architecture */}
        {activeTab === "about" && <AboutSection />}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#f0f0f0] text-center">
          <p className="text-xs text-[#999]">
            AI vs Real Image Classifier • MobileNetV2 Architecture • Streamlit Minimal Style
          </p>
        </div>
      </div>
    </div>
  );
}
