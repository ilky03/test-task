import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { FileInput } from "./FileInput";
import { Canvas } from "./Canvas";

import "./app.css";

const BINARY_DIMENSION_X = 36000;
const BINARY_DIMENSION_Y = 17999;
const CANVAS_WIDTH = 3600;
const CANVAS_HEIGHT = 1800;

export const App: React.FC = () => {
  const [sstData, setSstData] = useState<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const buffer = await zip.file("sst.grid")?.async("arraybuffer");
      if (buffer) {
        setSstData(new Uint8Array(buffer));
      }
    } catch (error) {
      console.error("Error reading the .grid file from ZIP:", error);
    }
  };

  useEffect(() => {
    if (canvasRef.current && sstData) {
      drawSST(canvasRef.current, sstData);
    }
  }, [sstData]);

  return (
    <div>
      <FileInput onFileChange={handleFileChange} />
      <Canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
};

const drawSST = (canvas: HTMLCanvasElement, data: Uint8Array) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const pixels = imageData.data;

  for (let y = 0; y < CANVAS_HEIGHT; y++) {
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      const gridX = Math.floor((x / CANVAS_WIDTH) * BINARY_DIMENSION_X);
      const gridY = Math.floor(
        ((CANVAS_HEIGHT - y - 1) / CANVAS_HEIGHT) * BINARY_DIMENSION_Y
      );
      const index = gridY * BINARY_DIMENSION_X + gridX;

      const value = data[index];
      if (value !== 0xff) {
        const color = getColorForTemperature(value);
        const pixelIndex = (y * CANVAS_WIDTH + x) * 4;
        pixels[pixelIndex] = color.r;
        pixels[pixelIndex + 1] = color.g;
        pixels[pixelIndex + 2] = color.b;
        pixels[pixelIndex + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const getColorForTemperature = (
  value: number
): { r: number; g: number; b: number } => {
  const minTemp = 30;
  const maxTemp = 93;
  const normalized = (value - minTemp) / (maxTemp - minTemp);

  const colors = [
    { r: 0, g: 0, b: 255 },
    { r: 0, g: 191, b: 255 },
    { r: 0, g: 255, b: 0 },
    { r: 255, g: 255, b: 0 },
    { r: 255, g: 69, b: 0 },
  ];

  const colorIndex = normalized * (colors.length - 1);
  const lowerIndex = Math.floor(colorIndex);
  const upperIndex = Math.ceil(colorIndex);
  const factor = colorIndex - lowerIndex;

  const r = Math.floor(
    colors[lowerIndex].r +
      factor * (colors[upperIndex].r - colors[lowerIndex].r)
  );
  const g = Math.floor(
    colors[lowerIndex].g +
      factor * (colors[upperIndex].g - colors[lowerIndex].g)
  );
  const b = Math.floor(
    colors[lowerIndex].b +
      factor * (colors[upperIndex].b - colors[lowerIndex].b)
  );

  return { r, g, b };
};
