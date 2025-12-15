
'use client'

import { useEffect } from "react";

// Helper to convert HEX to HSL string
const hexToHsl = (hex: string): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Helper to convert HSL string to HEX
const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
    const s_norm = s / 100;
    const l_norm = l / 100;
    const c = (1 - Math.abs(2 * l_norm - 1)) * s_norm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l_norm - c/2;
    let r=0, g=0, b=0;

    if (h < 60) { [r,g,b] = [c,x,0]; }
    else if (h < 120) { [r,g,b] = [x,c,0]; }
    else if (h < 180) { [r,g,b] = [0,c,x]; }
    else if (h < 240) { [r,g,b] = [0,x,c]; }
    else if (h < 300) { [r,g,b] = [x,0,c]; }
    else { [r,g,b] = [c,0,x]; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Adjusts lightness of a color
const adjustColor = (hex: string, amount: number) => {
    const hsl = hexToHsl(hex).split(' ').map(parseFloat);
    hsl[2] = Math.max(0, Math.min(100, hsl[2] + amount));
    return hslToHex(`${hsl[0]} ${hsl[1]}% ${hsl[2]}%`);
};

export const defaultColors = {
    primary: '#FF2700',
    background: '#FFFFFF',
};

// Determines text color based on background lightness
const getContrastingTextColor = (hslString: string) => {
    if (!hslString) return '0 0% 98%'; // Default to light text
    const lightness = parseInt(hslString.split(' ')[2]);
    return lightness > 50 ? '240 10% 3.9%' : '0 0% 98%'; // Dark text for light bg, light text for dark bg
};

export const applyTheme = (themeColors: {primary: string, background: string}) => {
    const root = document.documentElement;
    
    const primaryHsl = hexToHsl(themeColors.primary);
    const backgroundHsl = hexToHsl(themeColors.background);
    const isDarkBg = parseInt(backgroundHsl.split(' ')[2]) < 50;

    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--background', backgroundHsl);
    
    // Auto-set foreground colors for high contrast
    root.style.setProperty('--primary-foreground', getContrastingTextColor(primaryHsl));
    root.style.setProperty('--foreground', getContrastingTextColor(backgroundHsl));
    
    // Derive other colors from background to maintain consistency
    const accentHsl = hexToHsl(adjustColor(themeColors.background, isDarkBg ? 5 : -5));
    const cardHsl = hexToHsl(adjustColor(themeColors.background, isDarkBg ? 3 : -3));
    const secondaryHsl = hexToHsl(adjustColor(themeColors.background, isDarkBg ? 7 : -7));
    const mutedHsl = hexToHsl(adjustColor(themeColors.background, isDarkBg ? 7 : -7));
    const borderHsl = hexToHsl(adjustColor(themeColors.background, isDarkBg ? 10 : -10));
    
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--card', cardHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--muted', mutedHsl);
    root.style.setProperty('--border', borderHsl);
    root.style.setProperty('--input', borderHsl);

    // Auto-set foregrounds for derived colors
    root.style.setProperty('--accent-foreground', getContrastingTextColor(accentHsl));
    root.style.setProperty('--card-foreground', getContrastingTextColor(cardHsl));
    root.style.setProperty('--secondary-foreground', getContrastingTextColor(secondaryHsl));
    root.style.setProperty('--muted-foreground', getContrastingTextColor(mutedHsl));
};

export const getThemeColors = () => {
    if (typeof window === 'undefined') return defaultColors;
    const storedColors = localStorage.getItem('app-theme-colors');
    if (storedColors) {
        try {
            return JSON.parse(storedColors);
        } catch(e) {
            console.error("Failed to parse stored theme colors");
            return defaultColors;
        }
    }
    return defaultColors;
};

// A client component to update the theme on initial load
export function ThemeUpdater() {
  useEffect(() => {
    applyTheme(getThemeColors());
  }, []);

  return null;
}
