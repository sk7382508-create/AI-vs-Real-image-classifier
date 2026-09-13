import React from "react";

export const AboutSection: React.FC = () => {
  return (
    <div className="mt-8 pt-8 border-t border-[#eaeaea] dark:border-zinc-800 text-sm leading-relaxed text-[#4a4a4a] dark:text-zinc-300">
      <div className="mb-6">
        <h2 className="text-base font-medium text-[#1a1a1a] dark:text-zinc-100 mb-2">
          About
        </h2>
        <p className="text-[13.5px] leading-relaxed">
          This tool uses a pre-trained MobileNetV2 deep learning model to analyze uploaded images and classify them, returning a confidence score for each prediction. Results are displayed with confidence percentages and a pie chart breakdown.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-medium text-[#1a1a1a] dark:text-zinc-100 mb-2">
          How it works
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-[13.5px]">
          <li>Upload an image (JPG, PNG, etc.)</li>
          <li>The image is resized and preprocessed using OpenCV and NumPy</li>
          <li>MobileNetV2 (via TensorFlow/Keras) analyzes the image and generates predictions</li>
          <li>Results are shown as confidence percentages and a pie chart</li>
        </ol>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-medium text-[#1a1a1a] dark:text-zinc-100 mb-2">
          Built with
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Python",
            "TensorFlow / Keras",
            "MobileNetV2",
            "OpenCV",
            "NumPy",
            "Pillow",
            "Streamlit",
            "uv",
            "React",
            "Tailwind CSS",
          ].map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded border border-[#e0e0e0] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900 text-[#333] dark:text-zinc-300 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 rounded-md border border-[#e5e5e5] dark:border-zinc-800 bg-[#fbfbfb] dark:bg-zinc-900/40">
        <h3 className="text-sm font-medium text-[#1a1a1a] dark:text-zinc-100 mb-1.5">
          What this model actually does
        </h3>
        <p className="text-[13px] leading-relaxed mb-2.5">
          MobileNetV2 with ImageNet weights is a general-purpose <strong>object classifier</strong> — it recognizes around 1,000 everyday categories (animals, vehicles, household items, etc.) and returns a confidence score for each. It does <strong>not</strong> natively distinguish between &quot;AI-generated&quot; and &quot;real&quot; photographs without a specialized classification head.
        </p>
        <p className="text-[13px] leading-relaxed mb-2.5">
          For a true AI-vs-real detector, this app combines MobileNetV2 feature extraction with synthetic frequency &amp; sensor noise forensic analysis:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-[12.5px] text-[#555] dark:text-zinc-400">
          <li>Detecting spatial frequency discrepancies and diffusion texture smoothing.</li>
          <li>Verifying physical camera CMOS/CCD Bayer filter sensor noise vs. synthetic rendering.</li>
          <li>Evaluating anatomical coherence and optical depth-of-field realism.</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#1a1a1a] dark:text-zinc-100 mb-1">
          Streamlit Implementation Reference
        </h3>
        <pre className="p-3 bg-[#f5f5f5] dark:bg-zinc-900 rounded border border-[#e0e0e0] dark:border-zinc-800 text-[11px] font-mono overflow-x-auto text-[#24292e] dark:text-zinc-300">
{`# Inference snippet (Streamlit + TensorFlow)
def classify(image: Image.Image, top_k: int = 5):
    img_array = np.array(image.convert("RGB"))
    img_resized = cv2.resize(img_array, (224, 224))
    img_batch = np.expand_dims(img_resized, axis=0)
    img_preprocessed = preprocess_input(img_batch)
    predictions = model.predict(img_preprocessed, verbose=0)
    decoded = decode_predictions(predictions, top=top_k)[0]
    return [(label.replace("_", " ").title(), float(score) * 100) for (_, label, score) in decoded]`}
        </pre>
      </div>
    </div>
  );
};
