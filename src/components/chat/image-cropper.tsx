
'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Crop } from 'lucide-react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropped: (imageBlob: Blob | null) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({ imageSrc, open, onOpenChange, onCropped }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleCrop = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      throw new Error('Crop details are not available');
    }

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      cropX,
      cropY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    ctx.restore();

    canvas.toBlob((blob) => {
        onCropped(blob);
        setIsProcessing(false);
    }, 'image/webp', 0.9); // Use webp for good quality/size ratio
  };
  
  const handleRotate = () => {
      setRotation(prev => (prev + 90) % 360);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recadrer l'image</DialogTitle>
          <DialogDescription>
            Ajustez votre photo de profil pour qu'elle soit parfaite.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex justify-center bg-transparent overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageSrc}
              style={{ transform: `rotate(${rotation}deg)` }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleRotate} disabled={isProcessing}>
            <RotateCw className="w-4 h-4 mr-2" />
            Pivoter
          </Button>
          <Button onClick={handleCrop} disabled={!completedCrop || isProcessing}>
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crop className="w-4 h-4 mr-2" />}
            Recadrer et Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
