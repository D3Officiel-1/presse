
'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

const LudoGameComponent = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !gameRef.current) {
            return;
        }

        const CELL_SIZE = 40;
        const GRID_SIZE = 15;
        const BOARD_SIZE = CELL_SIZE * GRID_SIZE;

        const COLORS = {
            background: 0xFFFFFF,
            border: 0x333333,
            red: 0xff4136,
            green: 0x2ecc40,
            blue: 0x0074d9,
            yellow: 0xffdc00,
            white: 0xffffff,
            star: 0xfbf2d5,
        };

        const YARDS = {
            green: { x: 0, y: 0, color: COLORS.green },
            yellow: { x: 9, y: 0, color: COLORS.yellow },
            blue: { x: 9, y: 9, color: COLORS.blue },
            red: { x: 0, y: 9, color: COLORS.red },
        };

        const PATH = [
            // Green path
            {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
            {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
            {x: 0, y: 7},
            {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
            // Yellow path
            {x: 6, y: 0}, {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5},
            {x: 7, y: 0},
            {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
            // Blue path
            {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
            {x: 14, y: 7},
            {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
            // Red path
            {x: 8, y: 14}, {x: 8, y: 13}, {x: 8, y: 12}, {x: 8, y: 11}, {x: 8, y: 10}, {x: 8, y: 9},
            {x: 7, y: 14},
            {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
        ];

        const HOME_PATHS = {
            green: [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}],
            yellow: [{x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}],
            blue: [{x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}, {x: 8, y: 7}],
            red: [{x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}, {x: 7, y: 8}]
        };

        const START_CELLS = {
            green: {x: 1, y: 6},
            yellow: {x: 8, y: 1},
            blue: {x: 13, y: 8},
            red: {x: 6, y: 13},
        };
        
        const SAFE_SPOTS = [
            { x: 6, y: 1 }, { x: 2, y: 6 },
            { x: 8, y: 2 }, { x: 1, y: 8 },
            { x: 12, y: 8 }, { x: 13, y: 6 },
            { x: 8, y: 12 }, { x: 6, y: 13 }
        ];

        const config = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            backgroundColor: COLORS.background,
             scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            scene: {
                create: function (this: Phaser.Scene) {
                    const graphics = this.add.graphics();

                    // --- Draw Yards ---
                    Object.values(YARDS).forEach(yard => {
                        graphics.fillStyle(yard.color, 0.8);
                        graphics.fillRect(yard.x * CELL_SIZE, yard.y * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);

                        const innerYardX = yard.x * CELL_SIZE + CELL_SIZE / 2;
                        const innerYardY = yard.y * CELL_SIZE + CELL_SIZE / 2;
                        const innerYardSize = 5 * CELL_SIZE;

                        graphics.fillStyle(COLORS.white, 1);
                        graphics.fillRoundedRect(innerYardX, innerYardY, innerYardSize, innerYardSize, 20);
                        graphics.lineStyle(2, COLORS.border);
                        graphics.strokeRoundedRect(innerYardX, innerYardY, innerYardSize, innerYardSize, 20);

                        const pawnCirclePositions = [
                            {x: innerYardX + innerYardSize * 0.25, y: innerYardY + innerYardSize * 0.25},
                            {x: innerYardX + innerYardSize * 0.75, y: innerYardY + innerYardSize * 0.25},
                            {x: innerYardX + innerYardSize * 0.25, y: innerYardY + innerYardSize * 0.75},
                            {x: innerYardX + innerYardSize * 0.75, y: innerYardY + innerYardSize * 0.75},
                        ];

                        pawnCirclePositions.forEach(pos => {
                            graphics.fillStyle(yard.color, 1);
                            graphics.fillCircle(pos.x, pos.y, CELL_SIZE * 0.5);
                             graphics.lineStyle(2, yard.color === COLORS.yellow ? COLORS.border : COLORS.white);
                            graphics.strokeCircle(pos.x, pos.y, CELL_SIZE * 0.5);
                        });
                    });

                    // --- Draw Paths ---
                    const pathCells = [
                        ...Array.from({length: 6}, (_, i) => ({x: 6, y: i})),
                        ...Array.from({length: 6}, (_, i) => ({x: 8, y: i})),
                        ...Array.from({length: 6}, (_, i) => ({x: i, y: 6})),
                        ...Array.from({length: 6}, (_, i) => ({x: i, y: 8})),
                        ...Array.from({length: 6}, (_, i) => ({x: 6, y: i + 9})),
                        ...Array.from({length: 6}, (_, i) => ({x: 8, y: i + 9})),
                        ...Array.from({length: 6}, (_, i) => ({x: i + 9, y: 6})),
                        ...Array.from({length: 6}, (_, i) => ({x: i + 9, y: 8})),
                    ];
                    
                    pathCells.forEach(cell => {
                        graphics.lineStyle(1, COLORS.border);
                        graphics.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    });

                    // --- Draw Home Paths ---
                    Object.entries(HOME_PATHS).forEach(([key, path]) => {
                        path.forEach(cell => {
                            graphics.fillStyle(YARDS[key as keyof typeof YARDS].color, 1);
                            graphics.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                            graphics.lineStyle(1, COLORS.border);
                            graphics.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                        });
                    });

                    // --- Draw Home Triangle ---
                    const center = 7.5 * CELL_SIZE;
                    graphics.fillStyle(COLORS.green, 1);
                    graphics.fillTriangle(0, center, 3.5 * CELL_SIZE, center, center, 0);
                    graphics.fillStyle(COLORS.yellow, 1);
                    graphics.fillTriangle(center, 0, center, 3.5 * CELL_SIZE, BOARD_SIZE, center);
                    graphics.fillStyle(COLORS.blue, 1);
                    graphics.fillTriangle(BOARD_SIZE, center, center, BOARD_SIZE, center, 11.5 * CELL_SIZE);
                    graphics.fillStyle(COLORS.red, 1);
                    graphics.fillTriangle(center, BOARD_SIZE, 0, center, center, 11.5 * CELL_SIZE);
                    graphics.lineStyle(2, COLORS.border);
                    graphics.strokeTriangle(0, center, center, 0, BOARD_SIZE, center);
                    graphics.strokeTriangle(center, BOARD_SIZE, 0, center, BOARD_SIZE, center);

                    // --- Draw Start and Safe Cells ---
                    Object.entries(START_CELLS).forEach(([key, cell]) => {
                        graphics.fillStyle(YARDS[key as keyof typeof YARDS].color, 1);
                        graphics.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                        graphics.lineStyle(1, COLORS.border);
                        graphics.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    });
                    
                    SAFE_SPOTS.forEach(s => {
                        graphics.fillStyle(COLORS.star, 1);
                        graphics.fillRect(s.x * CELL_SIZE, s.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                        graphics.lineStyle(2, COLORS.border);
                        graphics.strokeRect(s.x * CELL_SIZE, s.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                        const star = this.add.text(s.x * CELL_SIZE + CELL_SIZE/2, s.y * CELL_SIZE + CELL_SIZE/2, '★', { fontSize: `${CELL_SIZE * 0.6}px`, color: '#a38f65' }).setOrigin(0.5);
                    });
                }
            }
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };

    }, []);

    return <div ref={gameRef} className="w-full h-full" />;
};

export { LudoGameComponent };
