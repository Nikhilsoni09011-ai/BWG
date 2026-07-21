import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors ${className || ''}`}
    {...props}
  />
));

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors resize-none ${className || ''}`}
    {...props}
  />
));

export const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-[10px] font-bold tracking-widest text-pink-500/80 uppercase mb-3 ml-1 ${className || ''}`}>
    {children}
  </label>
);

export const SelectableCard: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}> = ({
  title,
  description,
  icon,
  selected,
  onClick,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative cursor-pointer rounded-3xl overflow-hidden border-2 transition-all p-5 flex flex-col items-center text-center gap-3 ${
      selected ? 'border-pink-500/50 bg-pink-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'
    }`}
  >
    {icon && <div className="text-3xl mb-1">{icon}</div>}
    <h3 className={`font-semibold text-sm ${selected ? 'text-pink-400' : 'text-white'}`}>{title}</h3>
    {description && <p className="text-[11px] text-white/50 leading-relaxed">{description}</p>}
    {selected && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
  </motion.div>
);

export const StepHeading = ({ title, subtitle }: { title: React.ReactNode, subtitle: string }) => (
  <div className="mb-10">
    <h1 className="text-3xl md:text-4xl font-serif mb-4 relative inline-block text-white">
      {title}
      <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute -bottom-2 left-0 text-pink-500/80">
        <path d="M0 4 Q 5 0 10 4 T 20 4 T 30 4 T 40 4 T 50 4 T 60 4 T 70 4 T 80 4 T 90 4 T 100 4" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </h1>
    <p className="text-white/50 text-sm">{subtitle}</p>
  </div>
);
