import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
} from 'motion/react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface InlineActionProps {
  label: string;
  icon: React.ReactNode;
  actionText: string;
  onAction: () => Promise<void>;
  theme?: 'light' | 'dark' | 'system';
  className?: string;
  disabled?: boolean;
}

export const InlineAction: React.FC<InlineActionProps> = ({
  label,
  icon,
  actionText,
  onAction,
  theme = 'system',
  className,
  disabled = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleTrigger = async () => {
    if (status !== 'idle' || disabled) return;
    setStatus('loading');
    try {
      await onAction();
      setStatus('success');
    } catch {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 2200);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const springTransition: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 35,
    mass: 1,
  };

  const forcedTheme =
    theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '';

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center',
        forcedTheme,
        className,
      )}
    >
      <div className="flex w-full items-center justify-between overflow-hidden rounded-full border-[1.5px] border-[#E5E5E5] bg-white p-2.5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3 pl-1">
          <div className="flex shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] p-2 text-[#1F1F1F] transition-colors sm:p-2.5 dark:bg-zinc-800 dark:text-zinc-100">
            <div className="scale-90 sm:scale-100">{icon}</div>
          </div>
          <span className="truncate text-[14px] font-medium text-[#1A1A1A] transition-colors sm:text-[16px] dark:text-white">
            {label}
          </span>
        </div>
        <MotionConfig transition={springTransition}>
          <motion.div
            className={cn(
              'relative flex h-11 items-center overflow-hidden rounded-full bg-[#1A1A1A] text-white px-2 py-1.5 dark:bg-zinc-100 dark:text-zinc-900',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            animate={{
              width:
                status === 'success' ? 44 : status === 'loading' ? 115 : 115,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {status === 'idle' && (
                <motion.button
                  key="idle"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  onClick={handleTrigger}
                  disabled={disabled}
                  className="w-full rounded-full text-[13px] font-medium whitespace-nowrap px-2.5 transition-colors sm:text-[14px]"
                >
                  {actionText}
                </motion.button>
              )}

              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  className="w-full px-2"
                >
                  <div className="relative h-1.5 flex-1 rounded-full bg-zinc-700 dark:bg-zinc-300">
                    <motion.div
                      className="absolute top-0 bottom-0 w-[35%] rounded-full bg-white dark:bg-zinc-900"
                      initial={{ left: '0%' }}
                      animate={{ left: '65%' }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ filter: 'blur(4px)', opacity: 0 }}
                  animate={{ filter: 'blur(0px)', opacity: 1 }}
                  exit={{ filter: 'blur(4px)', opacity: 0 }}
                  className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1A1A1A] transition-colors dark:bg-zinc-100"
                >
                  <motion.div
                    initial={{ x: '0%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    className="absolute inset-0 z-10 h-full w-full skew-x-[-40deg] bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-black/20"
                  />
                  <Check className="size-5 stroke-2 text-white dark:text-zinc-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </MotionConfig>
      </div>
    </div>
  );
};
