import React, { useRef, useState, useEffect } from 'react';
import { WizardData } from '../types';
import { Input, TextArea, Label, SelectableCard, StepHeading } from './ui';
import { Plus, X, Upload, Play, Pause, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveFile, getFileUrl } from '../lib/db';

interface StepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors?: Record<string, string>;
}

export const Step1: React.FC<StepProps> = ({ data, updateData, errors }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <StepHeading
      title={<span>Who is this <span className="italic text-pink-100">for</span></span>}
      subtitle="Tell us who the journey is for. Your details are kept private."
    />
    <div className="space-y-6">
      <div>
        <Label>Birthday Person's Name *</Label>
        <Input
          placeholder="Who is celebrating their birthday?"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          error={!!errors?.name}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Date of Birthday *</Label>
          <Input
            type="date"
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            className="text-white/80"
            error={!!errors?.date}
          />
        </div>
        <div>
          <Label>Secret PIN (4 Digits) *</Label>
          <Input
            type="password"
            maxLength={4}
            placeholder="1234"
            value={data.pin}
            onChange={(e) => updateData({ pin: e.target.value })}
            error={!!errors?.pin}
          />
        </div>
      </div>
      <div>
        <Label>PIN Hint (Optional)</Label>
        <Input
          placeholder="e.g. Our anniversary (DDMM) 💖"
          value={data.pinHint}
          onChange={(e) => updateData({ pinHint: e.target.value })}
        />
        <p className="text-[11px] text-white/40 mt-3 leading-relaxed ml-1">
          Shown on the lock screen so the recipient knows what to enter. Leave it blank to show no hint. Avoid writing the PIN itself here.
        </p>
      </div>
    </div>
  </motion.div>
);

export const Step2: React.FC<StepProps> = ({ data, updateData }) => {
  const themes = [
    { id: 'classic', title: 'Classic', desc: 'The original warm gold & pink glow, with rising fireflies.', icon: '🎇' },
    { id: 'galaxy', title: 'Galaxy', desc: 'Deep indigo night with soft drifting violet bokeh.', icon: '🌌' },
    { id: 'emerald', title: 'Emerald', desc: 'Cool teal night with calm twinkling stars.', icon: '✨' },
    { id: 'frost', title: 'Frost', desc: 'Icy blue & silver, with calm twinkling stars.', icon: '❄️' },
    { id: 'midnight', title: 'Midnight', desc: 'Deep violet-black night with rising fireflies.', icon: '🌙' },
    { id: 'party', title: 'Party', desc: 'Vibrant celebration with falling confetti streamers.', icon: '🎉' },
    { id: 'floating-hearts', title: 'Floating Hearts', desc: 'Romantic pink & red, with hearts drifting upward.', icon: '💖' },
    { id: 'neon-hearts', title: 'Neon Hearts', desc: 'Electric magenta & cyan glow, with neon hearts drifting up.', icon: '🪩' },
    { id: 'sparkle-hearts', title: 'Sparkle Hearts', desc: 'Warm gold & rose, with hearts twinkling as they drift up.', icon: '✨' },
    { id: 'two-hearts', title: 'Two Hearts', desc: 'Soft crimson, with paired hearts drifting up together.', icon: '💕' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Pick a <span className="italic text-pink-100">theme</span></span>}
        subtitle="The background, glow and accent colors for the whole journey."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {themes.map(t => (
          <SelectableCard
            key={t.id}
            title={t.title}
            description={t.desc}
            icon={t.icon}
            selected={data.theme === t.id}
            onClick={() => updateData({ theme: t.id })}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const Step3: React.FC<StepProps> = ({ data, updateData }) => {
  const wraps = [
    { id: 'classic-pink', title: 'Classic Pink', desc: 'Pink box, gold bow', icon: '🎁', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/50' },
    { id: 'royal-gold', title: 'Royal Gold', desc: 'Navy box, gold ribbon', icon: '🎁', gradient: 'from-blue-900 to-indigo-950', shadow: 'shadow-blue-900/50', border: 'border-yellow-500/50' },
    { id: 'mint-silver', title: 'Mint & Silver', desc: 'Soft mint green box', icon: '🎁', gradient: 'from-teal-300 to-emerald-400', shadow: 'shadow-teal-400/50', text: 'text-teal-950' },
    { id: 'rainbow-pop', title: 'Rainbow Pop', desc: 'Bright colors', icon: '🎁', gradient: 'from-purple-500 via-pink-500 to-yellow-500', shadow: 'shadow-pink-500/50' },
    { id: 'love-letter', title: 'Love Letter', desc: 'Classic envelope', icon: '💌', gradient: 'from-red-100 to-rose-200', shadow: 'shadow-red-200/50', text: 'text-red-900' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Pick a <span className="italic text-pink-100">gift wrap</span></span>}
        subtitle="The gift they unwrap first — a 3D box or an envelope — and its colors."
      />
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {wraps.map(w => (
          <motion.div
            key={w.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.85, rotate: [-5, 5, 0] }}
            onClick={() => updateData({ giftWrap: w.id })}
            className={`cursor-pointer rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all border-2 relative overflow-hidden ${
              data.giftWrap === w.id 
                ? `${w.border || 'border-white'} shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-gradient-to-br ${w.gradient}` 
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            {/* Background design vector graph / calcium surfaces effect when selected */}
            {data.giftWrap === w.id && (
              <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.8) 0%, transparent 50%)'
              }} />
            )}
            <motion.div 
              className={`text-4xl drop-shadow-xl relative z-10 ${data.giftWrap === w.id ? 'animate-bounce' : ''}`}
            >
              {w.icon}
            </motion.div>
            <div className="relative z-10">
              <h3 className={`font-bold text-sm ${data.giftWrap === w.id ? (w.text || 'text-white') : 'text-white'}`}>{w.title}</h3>
              <p className={`text-xs mt-1 ${data.giftWrap === w.id ? (w.text ? 'text-black/60' : 'text-white/80') : 'text-white/50'}`}>{w.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export const Step4: React.FC<StepProps> = ({ data, updateData }) => {
  const cakes = [
    { id: 'classic-pink', title: 'Classic Pink', desc: 'Strawberry frosting', icon: '🎂', gradient: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/50' },
    { id: 'chocolate', title: 'Chocolate', desc: 'Rich cocoa ganache', icon: '🍩', gradient: 'from-amber-700 to-amber-900', shadow: 'shadow-amber-800/50' },
    { id: 'vanilla-cream', title: 'Vanilla Cream', desc: 'Soft cream frosting', icon: '🍰', gradient: 'from-orange-100 to-amber-200', shadow: 'shadow-orange-200/50', text: 'text-amber-900' },
    { id: 'rainbow-funfetti', title: 'Funfetti', desc: 'Colorful sprinkles', icon: '🧁', gradient: 'from-fuchsia-400 via-cyan-400 to-yellow-400', shadow: 'shadow-cyan-400/50' },
    { id: 'red-velvet', title: 'Red Velvet', desc: 'Deep red tiers', icon: '🍓', gradient: 'from-red-600 to-rose-900', shadow: 'shadow-red-600/50' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Choose a <span className="italic text-pink-100">cake</span></span>}
        subtitle="The frosting flavor for their birthday cake."
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cakes.map(c => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.85, rotate: [-5, 5, 0] }}
            onClick={() => updateData({ cake: c.id })}
            className={`cursor-pointer rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all border-2 ${
              data.cake === c.id 
                ? `border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-gradient-to-br ${c.gradient}` 
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`text-4xl drop-shadow-xl ${data.cake === c.id ? 'animate-bounce' : ''}`}>
              {c.icon}
            </div>
            <div>
              <h3 className={`font-bold text-sm ${data.cake === c.id ? (c.text || 'text-white') : 'text-white'}`}>{c.title}</h3>
              <p className={`text-xs mt-1 ${data.cake === c.id ? (c.text ? 'text-amber-900/80' : 'text-white/80') : 'text-white/50'}`}>{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export const Step5: React.FC<StepProps> = ({ data, updateData, errors }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <StepHeading
      title={<span>Their first <span className="italic text-pink-100">welcome</span></span>}
      subtitle="The opening line they will see when the curtains part."
    />
    <div className="space-y-6">
      <div>
        <Label>Intro Title *</Label>
        <Input
          placeholder="Welcome back, sunshine ☀️"
          value={data.introTitle}
          onChange={(e) => updateData({ introTitle: e.target.value })}
          error={!!errors?.introTitle}
        />
      </div>
      <div>
        <Label>Intro Subtitle *</Label>
        <Input
          placeholder="A little something made just for you"
          value={data.introSubtitle}
          onChange={(e) => updateData({ introSubtitle: e.target.value })}
          error={!!errors?.introSubtitle}
        />
      </div>
    </div>
  </motion.div>
);

export const Step6: React.FC<StepProps> = ({ data, updateData, errors }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (data.customSongUrl && data.customSongUrl.startsWith('idb://')) {
      getFileUrl(data.customSongUrl).then(url => {
        if (url) setPreviewUrl(url);
      });
    } else {
      setPreviewUrl(data.customSongUrl);
    }
  }, [data.customSongUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const id = `song-${Date.now()}-${file.name}`;
      const idbUrl = await saveFile(id, file);
      updateData({ customSongUrl: idbUrl });
    } catch (err) {
      console.error("Failed to upload song:", err);
      alert("Failed to upload song. It might be too large.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Set the <span className="italic text-pink-100">mood</span></span>}
        subtitle="Add a song that plays softly through the whole journey."
      />
      
      <div className="space-y-6">
        <div>
          <Label>Audio URL (Link) *</Label>
          <Input
            placeholder="https://... (direct link to mp3/wav/ogg)"
            value={data.customSongUrl}
            onChange={(e) => updateData({ customSongUrl: e.target.value })}
            error={!!errors?.customSongUrl}
          />
        </div>
        
        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-white/30 text-sm">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <div>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button" 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 w-full md:w-auto ${isUploading ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white'} border border-white/10 px-6 py-4 rounded-2xl text-sm font-medium transition-colors`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> Uploading audio...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-pink-400" /> Upload audio file
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Label>Start Time (seconds) - Optional</Label>
          <Input 
            type="number"
            min="0"
            placeholder="e.g. 30"
            value={data.songStartTime}
            onChange={(e) => updateData({ songStartTime: e.target.value })}
          />
          <p className="text-white/50 text-xs mt-2">The song will start playing from this timestamp when the gift is opened.</p>
        </div>

        {previewUrl && (
          <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
            <span className="text-sm text-white/80 truncate flex-1">Custom Audio Preview</span>
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                  } else {
                    if (data.songStartTime && !isNaN(Number(data.songStartTime))) {
                      audioRef.current.currentTime = Number(data.songStartTime);
                    }
                    audioRef.current.play();
                  }
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors ml-4 shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
            </button>
            <audio 
              ref={audioRef} 
              src={previewUrl} 
              className="hidden" 
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const Step7: React.FC<StepProps> = ({ data, updateData, errors }) => {
  const frames = [
    { id: 'polaroid', title: 'Polaroid', icon: '🖼️' },
    { id: 'classic', title: 'Classic Black', icon: '⬛' },
    { id: 'minimal', title: 'Minimalist', icon: '📱' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadPreviews = async () => {
      const urls: Record<string, string> = {};
      for (const m of data.memories) {
        if (m.startsWith('idb://')) {
          const url = await getFileUrl(m);
          if (url) urls[m] = url;
        } else {
          urls[m] = m;
        }
      }
      setPreviewUrls(urls);
    };
    loadPreviews();
  }, [data.memories]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newMemories = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const id = `memory-${Date.now()}-${randomSuffix}-${file.name}`;
      
      try {
        const idbUrl = await saveFile(id, file);
        newMemories.push(idbUrl);
      } catch (err) {
        console.error("Failed to save memory:", err);
        alert("Failed to save image. It might be too large.");
      }
    }
    updateData({ memories: [...data.memories, ...newMemories] });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
  };

  const removeMemory = (index: number) => {
    const newMemories = [...data.memories];
    newMemories.splice(index, 1);
    updateData({ memories: newMemories });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Your favorite <span className="italic text-pink-100">memories</span></span>}
        subtitle="Photos with little captions — drag your finger to swipe through them."
      />
      <div className="mb-8">
        <Label>Memories Frame Style</Label>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mt-2">
          {frames.map(f => (
            <button
              type="button"
              key={f.id}
              onClick={() => updateData({ memoryLayout: f.id })}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                data.memoryLayout === f.id ? 'bg-pink-500/20 text-pink-400' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>{f.icon}</span> {f.title}
            </button>
          ))}
        </div>
      </div>
      
      {data.memories.length > 0 && (
        <div className="w-full flex flex-wrap justify-center gap-6 mb-8 px-4">
          <AnimatePresence>
          {data.memories.map((m, idx) => {
            let frameClasses = "relative p-2 pb-8 bg-white rounded-sm shadow-xl group border-b-4 border-r-4 border-gray-200";
            if (data.memoryLayout === 'classic') {
              frameClasses = "relative p-2 bg-black rounded-lg shadow-xl group border-2 border-gray-800";
            } else if (data.memoryLayout === 'minimal') {
              frameClasses = "relative rounded-xl overflow-hidden shadow-xl group border border-white/20";
            }

            return (
              <motion.div 
                key={m}
                initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: Math.random() * 10 - 5 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
                transition={{ type: 'spring' }}
                className={frameClasses}
              >
                <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 overflow-hidden relative ${data.memoryLayout === 'classic' ? 'bg-black' : 'bg-gray-100'}`}>
                  {previewUrls[m] && (
                    <img src={previewUrls[m]} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => removeMemory(idx)}
                  className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button 
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 w-full md:w-auto ${isUploading ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white'} border ${errors?.memories ? 'border-red-500' : 'border-white/10'} px-6 py-4 rounded-2xl text-sm font-medium transition-colors`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> Uploading memory...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 text-pink-400" /> Add memory
          </>
        )}
      </button>
    </motion.div>
  );
};

export const Step8: React.FC<StepProps> = ({ data, updateData }) => {
  const games = [
    { id: 'sliding', title: 'Sliding Puzzle (Easy)', icon: '🧩' },
    { id: 'memory', title: 'Memory Match (Animals)', icon: '🎴' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Pick a little <span className="italic text-pink-100">game</span></span>}
        subtitle="A quick, very light interactive puzzle they solve to continue."
      />
      <div className="mb-8">
        <Label>Game Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {games.map(g => (
            <SelectableCard
              key={g.id}
              title={g.title}
              description="Simple and fun! Easy enough for a 3-year-old to solve."
              icon={g.icon}
              selected={data.game === g.id}
              onClick={() => updateData({ game: g.id })}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const Step9: React.FC<StepProps> = ({ data, updateData }) => {
  const addWish = () => updateData({ wishes: [...data.wishes, ''] });
  const updateWish = (index: number, value: string) => {
    const newWishes = [...data.wishes];
    newWishes[index] = value;
    updateData({ wishes: newWishes });
  };
  const removeWish = (index: number) => {
    const newWishes = data.wishes.filter((_, i) => i !== index);
    updateData({ wishes: newWishes });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>Pop a little <span className="italic text-pink-100">wish</span></span>}
        subtitle="Tap balloons to reveal little wishes — add as many as you like."
      />
      <div className="space-y-5 mb-6">
        <AnimatePresence>
          {data.wishes.map((wish, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1">
                <Label>Wish {index + 1}</Label>
                <Input
                  placeholder="A new wish ✨"
                  value={wish}
                  onChange={(e) => updateWish(index, e.target.value)}
                />
              </div>
              {data.wishes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWish(index)}
                  className="mt-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-white/50 hover:bg-pink-500/20 hover:text-pink-400 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={addWish}
        className="flex items-center justify-center gap-2 w-fit bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 px-6 py-4 rounded-2xl text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> Add wish
      </button>
    </motion.div>
  );
};

export const Step10: React.FC<StepProps> = ({ data, updateData, errors }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (data.surpriseImageUrl && data.surpriseImageUrl.startsWith('idb://')) {
      getFileUrl(data.surpriseImageUrl).then(url => {
        if (url) setPreviewUrl(url);
      });
    } else {
      setPreviewUrl(data.surpriseImageUrl || null);
    }
  }, [data.surpriseImageUrl]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const id = `surprise-${Date.now()}-${file.name}`;
      const idbUrl = await saveFile(id, file);
      updateData({ surpriseImageUrl: idbUrl });
    } catch (err) {
      console.error("Failed to upload surprise image:", err);
      alert("Failed to upload image. It might be too large.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <StepHeading
        title={<span>One last <span className="italic text-pink-100">surprise</span></span>}
        subtitle="A foil scratch card that reveals an image and a short message."
      />
      <div className="space-y-6">
        <div>
          <Label>Title *</Label>
          <Input
            placeholder=""
            value={data.surpriseTitle}
            onChange={(e) => updateData({ surpriseTitle: e.target.value })}
            error={!!errors?.surpriseTitle}
          />
        </div>
        <div>
          <Label>Message</Label>
          <Input
            placeholder=""
            value={data.surpriseMessage}
            onChange={(e) => updateData({ surpriseMessage: e.target.value })}
          />
        </div>
        <div>
          <Label>Image URL *</Label>
          <Input
            placeholder=""
            value={data.surpriseImageUrl}
            onChange={(e) => updateData({ surpriseImageUrl: e.target.value })}
            error={!!errors?.surpriseImageUrl}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button 
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 w-full md:w-auto ${isUploading ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white'} border ${errors?.surpriseImageUrl ? 'border-red-500' : 'border-white/10'} px-6 py-4 rounded-2xl text-sm font-medium transition-colors`}
        >
           {isUploading ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> Uploading image...
             </>
           ) : (
             <>
               <Upload className="w-4 h-4 text-pink-400" /> Upload reveal image
             </>
           )}
        </button>
        {previewUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-white/5 w-fit">
            <img src={previewUrl} alt="Reveal preview" className="max-h-48 object-cover" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const Step11: React.FC<StepProps> = ({ data, updateData, errors }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <StepHeading
      title={<span>A handwritten <span className="italic text-pink-100">letter</span></span>}
      subtitle="The final letter — typed out one character at a time, in handwriting."
    />
    <div className="space-y-6">
      <div>
        <Label>Greeting *</Label>
        <Input
          placeholder="My dearest,"
          value={data.letterGreeting}
          onChange={(e) => updateData({ letterGreeting: e.target.value })}
          error={!!errors?.letterGreeting}
        />
      </div>
      <div>
        <Label>Body (One paragraph per line) *</Label>
        <TextArea
          rows={6}
          placeholder="Today, I just wanted to say..."
          value={data.letterBody}
          onChange={(e) => updateData({ letterBody: e.target.value })}
          error={!!errors?.letterBody}
        />
      </div>
      <div>
        <Label>Sign-off *</Label>
        <Input
          placeholder="Forever yours, with all my heart ❤️"
          value={data.letterSignOff}
          onChange={(e) => updateData({ letterSignOff: e.target.value })}
          error={!!errors?.letterSignOff}
        />
      </div>
    </div>
  </motion.div>
);
