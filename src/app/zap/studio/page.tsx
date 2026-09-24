'use client';

import React, { useState } from 'react';
import { Sparkles, Film, Music, Sliders, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioPage() {
  const [scriptIdeaInput, setScriptIdeaInput] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleGenerateScriptIdea = () => {
    if (!scriptIdeaInput.trim()) return;
    setGeneratedScript("Chargement de l'inspiration...");
    
    setTimeout(() => {
      setGeneratedScript(`🎬 IDÉE DE SCRIPT ZAP :\n\nTitre suggéré: "Les Gardiens du Tableau"\n\n[Scène 1 - Intérieur Classe] Un élève découvre que les craies de couleur dessinent des objets réels dans la cour. \n\nConseil technique : Utilisez des effets d'incrustation vidéo simples (Cut & Mask) pour faire apparaître les objets au rythme de la musique !`);
    }, 1200);
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] pt-6 bg-[#F9F9FC] min-h-screen">
      <div className="p-6 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-orange-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-32 h-32 fill-white stroke-none" />
        </div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary fill-primary" /> ZAP Studio
        </h2>
        <p className="text-xs text-neutral-300 mt-1 font-medium">L'incubateur d'idées propulsé par l'IA pour vos projets scolaires.</p>
      </div>

      <Card className="border-neutral-200 bg-white rounded-[2rem] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-1.5">
            <Film className="w-4 h-4 fill-primary stroke-none" /> Générateur de Script IA
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-neutral-400 normal-case tracking-normal">
            Saisissez un sujet de cours ou un thème pour obtenir instantanément une structure de vidéo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Ex: Loi de la gravité, guerre de Troie..."
            value={scriptIdeaInput}
            onChange={(e) => setScriptIdeaInput(e.target.value)}
            className="h-11 text-base border-neutral-200 rounded-xl font-medium"
          />
          <Button 
            onClick={handleGenerateScriptIdea}
            disabled={!scriptIdeaInput.trim()}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold h-12 text-xs"
          >
            Générer une structure
          </Button>
          <AnimatePresence>
            {generatedScript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl text-xs text-neutral-800 leading-relaxed font-medium whitespace-pre-line"
              >
                {generatedScript}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2 hover:border-neutral-300 transition-colors">
          <Music className="w-5 h-5 text-primary" />
          <h4 className="font-black text-xs text-neutral-900">Audio Trends</h4>
          <p className="text-[10px] text-neutral-400 font-medium leading-tight">Musiques tendances.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2 hover:border-neutral-300 transition-colors">
          <Sliders className="w-5 h-5 text-neutral-900" />
          <h4 className="font-black text-xs text-neutral-900">Tutos Vidéo</h4>
          <p className="text-[10px] text-neutral-400 font-medium leading-tight">Astuces de cadrage.</p>
        </div>
      </div>
    </div>
  );
}
