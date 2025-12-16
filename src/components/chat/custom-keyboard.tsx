
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUp, Delete, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const azertyLayout = {
    letters: [
        ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
        ['w', 'x', 'c', 'v', 'b', 'n']
    ],
    numbers: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['@', '#', '€', '_', '&', '-', '+', '(', ')', '/'],
        ['*', '"', "'", ':', ';', '!', '?', '.']
    ]
};

export const CustomKeyboard = ({ onKeyPress, onBackspace, onEnter, onSpace }: { onKeyPress: (key: string) => void, onBackspace: () => void, onEnter: () => void, onSpace: () => void }) => {
    const [layout, setLayout] = useState<'letters' | 'numbers'>('letters');
    const [isShift, setIsShift] = useState(false);

    const handleKeyPress = (key: string) => {
        onKeyPress(isShift ? key.toUpperCase() : key);
        if (isShift) setIsShift(false);
    };

    const currentLayout = azertyLayout[layout];

    return (
        <motion.div 
            className="w-full bg-black/50 backdrop-blur-sm p-2 space-y-1"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        >
            {currentLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                    {rowIndex === 2 && layout === 'letters' && (
                        <Button onClick={() => setIsShift(!isShift)} className={cn("h-10 w-12", isShift && 'bg-white text-black')}>
                            <ArrowUp />
                        </Button>
                    )}
                    {row.map(key => (
                        <Button key={key} onClick={() => handleKeyPress(key)} className="h-10 flex-1">
                            {isShift ? key.toUpperCase() : key}
                        </Button>
                    ))}
                    {rowIndex === 2 && layout === 'letters' && (
                         <Button onClick={onBackspace} className="h-10 w-12">
                            <Delete />
                        </Button>
                    )}
                </div>
            ))}
            <div className="flex justify-center gap-1">
                <Button onClick={() => setLayout(layout === 'letters' ? 'numbers' : 'letters')} className="h-10 w-24">
                    {layout === 'letters' ? '?123' : 'ABC'}
                </Button>
                <Button onClick={onSpace} className="h-10 flex-1">
                    Espace
                </Button>
                <Button onClick={onEnter} className="h-10 w-24">
                    <CornerDownLeft />
                </Button>
            </div>
        </motion.div>
    );
};
