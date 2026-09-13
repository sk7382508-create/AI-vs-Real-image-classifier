/**
 * Utility functions for image preprocessing matching MobileNetV2 and OpenCV input pipelines.
 */

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}

export interface PreprocessResult {
  resized224DataUrl: string;
  originalWidth: number;
  originalHeight: number;
  meanR: number;
  meanG: number;
  meanB: number;
  variance: number;
}

/**
 * Simulates OpenCV `cv2.resize(img, (224, 224))` and NumPy array extraction
 */
export async function preprocessImage224(dataUrl: string): Promise<PreprocessResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      // Draw resized image
      ctx.drawImage(img, 0, 0, 224, 224);
      const imgData = ctx.getImageData(0, 0, 224, 224);
      const data = imgData.data;

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      const pixelCount = 224 * 224;

      for (let i = 0; i < data.length; i += 4) {
        sumR += data[i];
        sumG += data[i + 1];
        sumB += data[i + 2];
      }

      const meanR = sumR / pixelCount;
      const meanG = sumG / pixelCount;
      const meanB = sumB / pixelCount;

      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const overallMean = (meanR + meanG + meanB) / 3;
        varianceSum += (gray - overallMean) ** 2;
      }
      const variance = Math.sqrt(varianceSum / pixelCount);

      const resized224DataUrl = canvas.toDataURL("image/jpeg", 0.9);

      resolve({
        resized224DataUrl,
        originalWidth: img.naturalWidth || 224,
        originalHeight: img.naturalHeight || 224,
        meanR: Math.round(meanR),
        meanG: Math.round(meanG),
        meanB: Math.round(meanB),
        variance: Math.round(variance),
      });
    };
    img.onerror = () => reject(new Error("Failed to load image for processing"));
    img.src = dataUrl;
  });
}
