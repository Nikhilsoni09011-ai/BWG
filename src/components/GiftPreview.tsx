import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WizardData } from '../types';
import { getFileUrl } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Gift, ChevronRight, ChevronLeft, Heart, Mail, Star, Cake } from 'lucide-react';
import { get } from 'idb-keyval';
import { GalaxyBackground } from './GalaxyBackground';
import { Confetti } from './Confetti';

import { playPopSound } from '../lib/sounds';

const BalloonWishes: React.FC<{ wishes: string[]; onNext: () => void; onPrev: () => void }> = ({ wishes, onNext, onPrev }) => {
  const validWishes = wishes.filter(w => w.trim() !== '');
  const [popped, setPopped] = useState<boolean[]>(new Array(validWishes.length).fill(false));

  const handlePop = (index: number) => {
    if (!popped[index]) {
      playPopSound();
      const newPopped = [...popped];
      newPopped[index] = true;
      setPopped(newPopped);
    }
  };

  const allPopped = validWishes.length > 0 ? popped.every(Boolean) : true;

  const balloonColors = [
    'from-red-400 to-rose-600',
    'from-blue-400 to-indigo-600',
    'from-green-400 to-emerald-600',
    'from-yellow-400 to-amber-600',
    'from-purple-400 to-fuchsia-600'
  ];

  return (
    <motion.div 
      key="step4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen z-10 w-full max-w-3xl mx-auto px-4 space-y-8"
    >
      <h2 className="text-4xl font-serif text-white text-center">Wishes for You</h2>
      
      {!allPopped && validWishes.length > 0 && (
        <p className="text-white/70 animate-pulse text-center">Pop the balloons to reveal your wishes!</p>
      )}

      {validWishes.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6 w-full min-h-[160px]">
          {validWishes.map((wish, i) => {
            if (popped[i]) return null;
            return (
              <motion.div
                key={`balloon-${i}`}
                animate={{ 
                  y: [0, -15, 0], 
                  rotate: [-2, 2, -2] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 + (i % 3), 
                  ease: "easeInOut" 
                }}
                onClick={() => handlePop(i)}
                className={`relative cursor-pointer w-20 h-28 md:w-24 md:h-32 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-br ${balloonColors[i % balloonColors.length]} shadow-2xl flex items-center justify-center group`}
              >
                <div className="absolute top-2 left-2 w-4 h-8 bg-white/30 rounded-full blur-[2px] transform -rotate-45" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-white/20" />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-white/50 text-center">No wishes added.</p>
      )}

      <div className="grid gap-4 w-full">
        <AnimatePresence>
          {validWishes.map((wish, i) => {
            if (!popped[i]) return null;
            return (
              <motion.div 
                key={`wish-${i}`}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-start gap-4"
              >
                <Star className="w-6 h-6 text-pink-400 shrink-0 mt-1" />
                <p className="text-lg text-white/90">{wish}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8 w-full">
        <button onClick={onPrev} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <AnimatePresence>
          {allPopped && (
            <motion.button 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              onClick={onNext} 
              className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-2 whitespace-nowrap overflow-hidden"
            >
              Next <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const GiftPreview: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<WizardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Asset URLs
  const [memoryUrls, setMemoryUrls] = useState<string[]>([]);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [surpriseUrl, setSurpriseUrl] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState<string | null>(null);

  // Viewer State
  const [step, setStep] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        const stored = await get(`gift-${id}`);
        if (stored) {
          setData(stored);
          
          // Load memory URLs
          const mUrls = [];
          for (const m of stored.memories) {
            if (m.startsWith('idb://')) {
              const url = await getFileUrl(m);
              if (url) mUrls.push(url);
            } else {
              mUrls.push(m);
            }
          }
          setMemoryUrls(mUrls);

          // Load Game URL
          if (stored.gameImageUrl) {
            if (stored.gameImageUrl.startsWith('idb://')) {
              setGameUrl(await getFileUrl(stored.gameImageUrl));
            } else setGameUrl(stored.gameImageUrl);
          }

          // Load Surprise URL
          if (stored.surpriseImageUrl) {
            if (stored.surpriseImageUrl.startsWith('idb://')) {
              setSurpriseUrl(await getFileUrl(stored.surpriseImageUrl));
            } else setSurpriseUrl(stored.surpriseImageUrl);
          }

          // Load Song URL
          if (stored.customSongUrl) {
            if (stored.customSongUrl.startsWith('idb://')) {
              setSongUrl(await getFileUrl(stored.customSongUrl));
            } else setSongUrl(stored.customSongUrl);
          } else if (stored.song === 'soft') {
            setSongUrl('https://actions.google.com/sounds/v1/water/rain_on_roof.ogg'); // placeholder
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleOpenGift = () => {
    playPopSound();
    setIsOpening(true);
    
    // Play audio immediately
    if (audioRef.current) {
      if (data?.songStartTime && !isNaN(Number(data.songStartTime))) {
        audioRef.current.currentTime = Number(data.songStartTime);
      }
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(console.error);
    }

    // Delay step transition for animation
    setTimeout(() => {
      setStep(1);
      setIsOpening(false);
    }, 1200);
  };

  const goToStep = (s: number) => {
    playPopSound();
    setStep(s);
    if (s === 0) setIsOpening(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center overflow-hidden relative">
        <GalaxyBackground />
        <span className="relative z-10 text-pink-400 animate-pulse">Loading gift...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 text-center space-y-4 overflow-hidden relative">
        <GalaxyBackground />
        <h1 className="text-2xl font-serif text-pink-400 relative z-10">Gift not found</h1>
        <p className="text-white/50 max-w-sm relative z-10">
          Since there is no cloud database configured yet, gifts are only saved locally in your browser.
        </p>
        <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10">
          Create a new gift
        </button>
      </div>
    );
  }

  if (data.pin && !isUnlocked) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-hidden relative">
        <GalaxyBackground />
        <div className="z-10 bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 w-full max-w-sm flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center">
             <Star className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-2xl font-serif text-white">Unlock Your Gift</h2>
          <p className="text-white/70 text-sm">Enter the secret PIN to open this gift.</p>
          
          <input 
            type="password"
            maxLength={4}
            value={enteredPin}
            onChange={(e) => {
              setEnteredPin(e.target.value);
              setPinError(false);
            }}
            className={`w-full bg-black/30 border ${pinError ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white outline-none focus:border-pink-500`}
            placeholder="****"
          />
          
          {pinError && <p className="text-red-400 text-sm">Incorrect PIN, try again.</p>}
          {data.pinHint && <p className="text-pink-300 text-sm italic">Hint: {data.pinHint}</p>}

          <button 
            onClick={() => {
              if (enteredPin === data.pin) {
                setIsUnlocked(true);
              } else {
                setPinError(true);
              }
            }}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  const getGiftWrapStyles = (id: string) => {
    switch (id) {
        case 'classic-pink': return { icon: '🎁', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(236,72,153,0.8)]', emojiShadow: 'drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]' };
        case 'royal-gold': return { icon: '👑', gradient: 'from-blue-900 to-indigo-950', shadow: 'shadow-[0_0_40px_rgba(30,58,138,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(30,58,138,0.8)]', border: 'border-yellow-500/50', emojiShadow: 'drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]' };
        case 'mint-silver': return { icon: '💎', gradient: 'from-teal-300 to-emerald-400', shadow: 'shadow-[0_0_40px_rgba(45,212,191,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(45,212,191,0.8)]', emojiShadow: 'drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' };
        case 'rainbow-pop': return { icon: '🌈', gradient: 'from-purple-500 via-pink-500 to-yellow-500', shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(236,72,153,0.8)]', emojiShadow: 'drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]' };
        case 'love-letter': return { icon: '💌', gradient: 'from-red-100 to-rose-200', shadow: 'shadow-[0_0_40px_rgba(254,205,211,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(254,205,211,0.8)]', emojiShadow: 'drop-shadow-[0_0_20px_rgba(225,29,72,0.5)]' };
        default: return { icon: '🎁', gradient: 'from-pink-600 to-purple-600', shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.5)]', hoverShadow: 'hover:shadow-[0_0_60px_rgba(236,72,153,0.8)]', emojiShadow: 'drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]' };
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 0:
        const wrapStyles = getGiftWrapStyles(data.giftWrap);
        return (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center space-y-12 z-10 text-center relative"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif text-white">{data.introTitle || 'Happy Birthday!'}</h1>
              <p className="text-xl text-pink-400">{data.introSubtitle || 'Open your gift to begin'}</p>
            </div>
            
            <motion.button 
              onClick={handleOpenGift}
              disabled={isOpening}
              animate={isOpening ? { 
                scale: [1, 1.2, 0],
                rotate: [0, -10, 10, -20, 20, 180],
                opacity: [1, 1, 0]
              } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={`group relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center rounded-3xl bg-gradient-to-tr ${wrapStyles.gradient} ${wrapStyles.shadow} ${wrapStyles.hoverShadow} transition-all ${!isOpening ? 'hover:-translate-y-2' : ''}`}
            >
              {/* Calcium surfaces/flows effect for the box */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none rounded-3xl overflow-hidden" style={{
                backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.8) 0%, transparent 50%)'
              }} />
              
              <motion.div 
                animate={isOpening ? {
                  scale: [1, 1.5, 2],
                  y: [0, -50, -100],
                  opacity: [1, 0]
                } : {}}
                transition={{ duration: 0.8 }}
                className={`text-6xl md:text-[80px] ${wrapStyles.emojiShadow} group-hover:scale-110 transition-transform relative z-10`}
              >
                {wrapStyles.icon}
              </motion.div>
              <div className={`absolute inset-0 rounded-3xl border-2 ${wrapStyles.border || 'border-white/20'}`}></div>
            </motion.button>
            <p className="text-white/50 text-sm animate-pulse">{isOpening ? 'Unwrapping...' : 'Tap to open'}</p>
          </motion.div>
        );
      
      case 1:
        const getCakeEmoji = (cakeId: string) => {
          switch(cakeId) {
            case 'chocolate': return '🍩';
            case 'vanilla-cream': return '🍰';
            case 'rainbow-funfetti': return '🧁';
            case 'red-velvet': return '🍓';
            case 'classic-pink':
            default: return '🎂';
          }
        };

        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center space-y-12 z-10 text-center max-w-2xl mx-auto px-4"
          >
            <h2 className="text-4xl font-serif text-white">Make a Wish!</h2>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5, filter: 'drop-shadow(0 0 50px rgba(255,255,255,0.6))' }}
              whileTap={{ scale: 0.8, rotate: -15, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}
              className="text-[120px] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer select-none" 
              onClick={() => {
                // Could add blowout sound effect here
                goToStep(2);
              }}
            >
              {getCakeEmoji(data.cake)}
            </motion.div>
            <p className="text-white/70 animate-pulse">Tap the cake to blow out the candles</p>
            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => goToStep(0)} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-start min-h-screen py-20 z-10 w-full max-w-5xl mx-auto px-4 space-y-12"
          >
            <h2 className="text-4xl font-serif text-white text-center">Our Memories</h2>
            {memoryUrls.length > 0 ? (
              <div 
                className="w-full flex flex-wrap justify-center gap-6 px-4"
              >
                {memoryUrls.map((url, i) => {
                  let frameClasses = "p-3 pb-10 bg-white rounded-sm shadow-2xl border-b-8 border-r-8 border-gray-200 cursor-zoom-in";
                  if (data.memoryLayout === 'classic') {
                    frameClasses = "p-2 bg-black rounded-lg shadow-2xl border-4 border-gray-800 cursor-zoom-in";
                  } else if (data.memoryLayout === 'minimal') {
                    frameClasses = "rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 cursor-zoom-in";
                  }

                  return (
                    <motion.div 
                      key={i}
                      drag
                      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                      initial={{ opacity: 0, rotate: Math.random() * 20 - 10 }}
                      animate={{ opacity: 1, rotate: Math.random() * 10 - 5 }}
                      whileHover={{ scale: 1.05, zIndex: 20, rotate: 0 }}
                      whileTap={{ scale: 1.1, zIndex: 30 }}
                      onClick={() => setZoomedImage(url)}
                      className={frameClasses}
                    >
                      <img src={url} className={`w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-cover ${data.memoryLayout === 'classic' ? 'bg-black' : 'bg-gray-100'}`} alt={`Memory ${i}`} />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/50">No memories attached.</p>
            )}
            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => goToStep(1)} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => goToStep(3)} className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-2">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-screen z-10 w-full px-4 space-y-8"
          >
            <h2 className="text-4xl font-serif text-white text-center">A Little Puzzle</h2>
            {gameUrl && (
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                <img src={gameUrl} alt="Puzzle" className="max-w-xs md:max-w-md rounded-2xl opacity-50 blur-sm hover:opacity-100 hover:blur-none transition-all duration-1000 cursor-pointer" />
              </div>
            )}
            <p className="text-white/70 text-center max-w-sm">Tap the image to solve the puzzle instantly!</p>
            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => goToStep(2)} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => goToStep(4)} className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-2">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <BalloonWishes 
            key="step4"
            wishes={data.wishes} 
            onNext={() => goToStep(5)} 
            onPrev={() => goToStep(3)} 
          />
        );

      case 5:
        return (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-screen z-10 w-full px-4 space-y-8"
          >
            <h2 className="text-4xl font-serif text-white text-center">One Last Surprise</h2>
            <div className="relative group cursor-pointer w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900">
              {surpriseUrl && <img src={surpriseUrl} alt="Surprise" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{data.surpriseTitle}</h3>
                <p className="text-white/80">{data.surpriseMessage}</p>
              </div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-400 group-hover:opacity-0 transition-opacity duration-1000 flex items-center justify-center">
                <span className="bg-black/50 px-6 py-3 rounded-full text-white font-bold tracking-widest uppercase">Scratch Here</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => goToStep(4)} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => goToStep(6)} className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-2">
                Read Letter <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            onAnimationComplete={() => setShowConfetti(true)}
            className="flex flex-col items-center justify-center min-h-screen z-10 w-full max-w-2xl mx-auto px-4 py-20"
          >
            <div className="bg-[#fdfbf7] p-8 md:p-12 rounded-lg shadow-2xl w-full text-gray-800 relative">
              <Mail className="absolute top-6 right-6 w-8 h-8 text-pink-300 opacity-50" />
              <h2 className="text-3xl font-serif text-pink-600 mb-8">{data.letterGreeting}</h2>
              <div className="whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-700 mb-12 min-h-[200px]">
                {data.letterBody}
              </div>
              <div className="text-right">
                <p className="text-xl font-serif text-pink-600">{data.letterSignOff}</p>
                <p className="text-lg text-gray-500 mt-2">{data.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => goToStep(5)} className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            </div>
            {showConfetti && <Confetti />}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center relative overflow-x-hidden">
      <GalaxyBackground theme={data.theme} />
      
      {/* Audio Element */}
      {songUrl && (
        <audio ref={audioRef} src={songUrl} loop className="hidden" />
      )}

      {/* Navigation back to build mode */}
      <button 
        onClick={() => {
          if (audioRef.current) audioRef.current.pause();
          navigate('/');
        }}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" /> Build Mode
      </button>

      {/* Progress indicator */}
      {step > 0 && step < 6 && (
        <div className="absolute top-8 right-8 z-50 flex gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-pink-500' : 'bg-white/20'}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedImage}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              alt="Zoomed memory"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
