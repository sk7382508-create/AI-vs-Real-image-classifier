import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";

export interface Slide {
  id: number;
  img: string;
  title?: string;
  label?: string;
  type?: "Real" | "AI-Generated";
}

type IconRenderer = (props?: Record<string, unknown>) => React.ReactNode;

export interface CarouselSliderProps {
  slides?: Slide[];
  favouriteIcon?: IconRenderer;
  onSelectSlide?: (slide: Slide) => void;
}

export const DEFAULT_SAMPLE_SLIDES: Slide[] = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop",
    title: "Golden Retriever in Park",
    label: "Golden Retriever (ImageNet #207)",
    type: "Real",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    title: "Surreal Synth Wave Abstract",
    label: "Digital Generative Art",
    type: "AI-Generated",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    title: "Alpine Lake & Pine Forest",
    label: "Lakeside Valley (ImageNet #975)",
    type: "Real",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop",
    title: "Hyper-detailed 3D Crystal Creature",
    label: "Synthetic Diffusion Model",
    type: "AI-Generated",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    title: "Espresso Mug on Wood Table",
    label: "Coffee Cup (ImageNet #504)",
    type: "Real",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop",
    title: "Dreamlike Oil Painting Portrait",
    label: "AI Neural Style Transfer",
    type: "AI-Generated",
  },
];

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 180 : -180,
    filter: "brightness(1.5)",
    scale: 0.8,
    opacity: 0,
    rotate: direction > 0 ? 24 : -24,
  }),
  center: {
    x: 0,
    filter: "brightness(1)",
    scale: 1,
    opacity: 1,
    rotate: -2,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -180 : 180,
    filter: "brightness(1.5)",
    scale: 0.8,
    opacity: 0,
    rotate: direction > 0 ? -24 : 24,
    zIndex: 0,
  }),
};

export const CarouselSlider: React.FC<CarouselSliderProps> = ({
  slides = DEFAULT_SAMPLE_SLIDES,
  favouriteIcon = (props) => (
    <HugeiconsIcon
      icon={FavouriteIcon}
      size={22}
      strokeWidth={1.5}
      {...props}
    />
  ),
  onSelectSlide,
}) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-180, 180], [-15, 15]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) paginate(1);
    else if (info.offset.x > 80) paginate(-1);
  };

  const currentSlide = slides[index];

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Slider */}
      <div className="relative w-48 sm:w-56 aspect-square flex items-center justify-center -rotate-[3deg]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", bounce: 0.2, duration: 0.45 },
              scale: { duration: 0.3 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ rotate, x: dragX }}
            onDragEnd={handleDragEnd}
            onClick={() => onSelectSlide?.(currentSlide)}
            className="absolute w-full h-full bg-[#FFFFFF] dark:bg-zinc-900 rounded-[28px] p-2 shadow-md border border-[#E5E7EB] dark:border-zinc-800 overflow-hidden cursor-pointer group"
          >
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              <img
                src={currentSlide.img}
                alt={currentSlide.title || "Sample"}
                className="object-cover w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
                crossOrigin="anonymous"
              />

              {/* Tag overlay */}
              {currentSlide.type && (
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-black/75 text-white backdrop-blur-xs">
                  {currentSlide.type}
                </div>
              )}

              {/* Favourite Button */}
              <button
                type="button"
                title="Save as sample"
                onClick={(e) => toggleFavorite(e, currentSlide.id)}
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs border border-black/5 hover:bg-white transition-colors"
              >
                {favouriteIcon({
                  className: favorites[currentSlide.id]
                    ? "text-red-500 fill-red-500"
                    : "text-[#374151] dark:text-zinc-300",
                })}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Background Card */}
        <div className="absolute -z-10 w-[94%] h-[94%] bg-[#F3F4F6] dark:bg-zinc-800/80 rounded-[28px] border border-[#E5E7EB] dark:border-zinc-700 scale-95 opacity-70" />
      </div>

      {/* Slide Info & Use Sample CTA */}
      <div className="mt-5 text-center flex flex-col items-center">
        <p className="text-xs font-medium text-[#111827] dark:text-zinc-200">
          {currentSlide.title}
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-zinc-400 mt-0.5">
          {currentSlide.label}
        </p>

        {onSelectSlide && (
          <button
            type="button"
            onClick={() => onSelectSlide(currentSlide)}
            className="mt-2.5 text-[12px] font-medium text-[#1F2937] dark:text-zinc-200 hover:text-black dark:hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Use this sample image →
          </button>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === index ? 1.25 : 1,
              opacity: i === index ? 1 : 0.35,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
              i === index
                ? "bg-[#1F2937] dark:bg-zinc-200"
                : "bg-[#9CA3AF] dark:bg-zinc-600"
            }`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
};
