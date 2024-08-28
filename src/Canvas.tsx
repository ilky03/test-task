import React, { forwardRef, useEffect } from "react";

import mapImg from "./resources/empty-map.jpg";

interface CanvasProps {
  width: number;
  height: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ width, height }, ref) => {
    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (canvas.current) {
        const ctx = canvas.current.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.src = mapImg;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
          };
        }
      }
    }, [ref, width, height]);

    return <canvas ref={ref} width={width} height={height} />;
  }
);
