import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WizardData } from './types';
import { ArrowLeft, Sparkles, Share, Eye } from 'lucide-react';
import {
  Step1, Step2, Step3, Step4, Step5, Step6,
  Step7, Step8, Step9, Step10, Step11
} from './components/Steps';
import { Confetti } from './components/Confetti';
import { GalaxyBackground } from './components/GalaxyBackground';
import { set, get, del } from 'idb-keyval';
import { playPopSound, playClickSound } from './lib/sounds';

const TOTAL_STEPS = 11;
const DRAFT_KEY = 'draft-gift';

const initialData: WizardData = {
  name: '', date: '', pin: '', pinHint: '',
  theme: 'midnight', giftWrap: 'royal-gold', cake: 'rainbow-funfetti',
  introTitle: '', introSubtitle: '',
  song: 'custom', customSongUrl: '', songStartTime: '0',
  memoryLayout: 'polaroid', memories: [],
  game: 'sliding', gameImageUrl: '',
  wishes: ['', '', '', '', ''],
  surpriseTitle: '', surpriseMessage: '', surpriseImageUrl: '',
  letterGreeting: '', letterBody: '', letterSignOff: ''
};

export default function App() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shareId, setShareId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadDraft = async () => {
      const draft = await get(DRAFT_KEY);
      if (draft) setData(draft);
    };
    loadDraft();
  }, []);

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      set(DRAFT_KEY, newData).catch(console.error);
      return newData;
    });
    setErrors({}); // Clear errors when user types
  };

  const validateStep = (step: number): boolean => {
    // Made optional as per user request
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    playPopSound();
    if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1);
  };

  const handleSkip = () => {
    setErrors({});
    playPopSound();
    if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    playClickSound();
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleCreate = async () => {
    if (!validateStep(currentStep)) return;
    playPopSound();
    const newId = Date.now().toString(36);
    
    try {
      const { getFileBlob } = await import('./lib/db');
      const { supabase } = await import('./lib/supabase');
      const processedData = { ...data };
      
      const processUrl = async (url: string, pathPrefix: string) => {
        if (url && url.startsWith('idb://')) {
          const blob = await getFileBlob(url);
          if (blob) {
            // Give it a file extension based on type
            const ext = blob.type.split('/')[1] || 'bin';
            const fileName = `${newId}/${pathPrefix}_${Date.now()}.${ext}`;
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('gift-assets')
              .upload(fileName, blob);
              
            if (uploadError) {
              console.error('Failed to upload file:', uploadError);
              throw uploadError;
            }
            
            // Get Public URL
            const { data: publicUrlData } = supabase.storage
              .from('gift-assets')
              .getPublicUrl(fileName);
              
            return publicUrlData.publicUrl;
          }
        }
        return url;
      };

      processedData.customSongUrl = await processUrl(processedData.customSongUrl, 'song');
      processedData.gameImageUrl = await processUrl(processedData.gameImageUrl, 'game');
      processedData.surpriseImageUrl = await processUrl(processedData.surpriseImageUrl, 'surprise');
      
      const newMemories = [];
      let memoryIndex = 0;
      for (const m of processedData.memories) {
        newMemories.push(await processUrl(m, `memory_${memoryIndex++}`));
      }
      processedData.memories = newMemories;

      // Upload to Supabase database
      const { error } = await supabase.from('gifts').insert([{ id: newId, data: processedData }]);
      
      if (error) {
        console.error('Supabase Error:', error);
        throw new Error('Failed to save gift to Supabase');
      }

      // Still save locally just in case
      await set(`gift-${newId}`, processedData);
      await del(DRAFT_KEY);
      setShareId(newId);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to create gift. Please check your Supabase connection and ensure the gift-assets bucket exists and is public.');
    }
  };

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  const renderStep = () => {
    const props = { data, updateData, errors };
    switch (currentStep) {
      case 1: return <Step1 {...props} />;
      case 2: return <Step2 {...props} />;
      case 3: return <Step3 {...props} />;
      case 4: return <Step4 {...props} />;
      case 5: return <Step5 {...props} />;
      case 6: return <Step6 {...props} />;
      case 7: return <Step7 {...props} />;
      case 8: return <Step8 {...props} />;
      case 9: return <Step9 {...props} />;
      case 10: return <Step10 {...props} />;
      case 11: return <Step11 {...props} />;
      default: return null;
    }
  };

  if (isCompleted) {
    const shareLink = `${window.location.origin}/gift/${shareId}`;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent text-gray-100 font-sans p-6 overflow-hidden relative">
        <Confetti />
        <GalaxyBackground theme={data.theme} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md"
        >
          <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <h2 className="text-3xl font-serif text-white">Your gift is ready!</h2>
          <p className="text-white/50 text-sm">
            You've successfully created a beautiful birthday experience for {data.name || 'them'}. Share this unique link with them!
          </p>
          
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 text-pink-400 text-sm font-mono break-all selection:bg-pink-500/30 flex items-center justify-center">
            {shareLink}
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigator.clipboard.writeText(shareLink).then(() => alert('Link copied!'))}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
            >
              <Share className="w-4 h-4" /> Copy Link
            </button>
            <button 
              type="button"
              onClick={() => navigate(`/gift/${shareId}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-medium shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans selection:bg-pink-500/30 overflow-hidden relative">
      
      {/* Background Sparkles Effect */}
      <GalaxyBackground theme={data.theme} />

      {/* Top Navigation */}
      <header className="relative z-10 flex items-center justify-between p-4 md:px-8 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <button type="button" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex-1 max-w-md mx-auto hidden md:block">
           <div className="text-center text-xs font-mono tracking-widest text-white/40 bg-white/5 py-2 rounded-full border border-white/5">
             GIFT CREATOR
           </div>
        </div>
        <div className="w-20 hidden md:block" /> {/* Spacer */}
      </header>

      {/* Progress Bar */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 md:px-8 pt-8 flex items-center gap-4">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase whitespace-nowrap">
          Step {currentStep} / {TOTAL_STEPS} - {progress}%
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-6 md:px-8 py-10 md:py-16 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <footer className="relative z-20 sticky bottom-0 left-0 w-full bg-[#08030e]/90 backdrop-blur-xl border-t border-white/5 p-4 md:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-8 py-3 rounded-full text-sm font-medium transition-colors ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          Back
        </button>

        <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase hidden md:block">
          Step {currentStep} of {TOTAL_STEPS}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {Object.keys(errors).length > 0 && (
            <div className="text-red-400 text-xs font-medium mr-2 hidden sm:block animate-pulse">
              Please fill required fields
            </div>
          )}
          {currentStep < TOTAL_STEPS && ![1, 5, 6, 7, 10, 11].includes(currentStep) && (
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-3 text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={currentStep === TOTAL_STEPS ? handleCreate : handleNext}
            className="group flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            {currentStep === TOTAL_STEPS ? (
              <>
                <Sparkles className="w-4 h-4" /> Create
              </>
            ) : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
}
