export interface PredictionItem {
  label: string;
  score: number;
}

export interface ForensicMarker {
  name: string;
  status: "Natural" | "Synthetic" | "Inconclusive" | string;
  detail: string;
}

export interface ClassificationResult {
  source: string;
  classification: "Real" | "AI-Generated" | string;
  confidenceScore: string;
  realScore: string;
  aiScore: string;
  explanation: string;
  topPredictions: PredictionItem[];
  forensicMarkers: ForensicMarker[];
  preprocessedImageUri?: string;
  dimensions?: { width: number; height: number };
}
