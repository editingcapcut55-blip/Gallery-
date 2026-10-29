import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
  DrawingPath,
  EditorState,
  MarkupTool,
  TextLayer,
} from '../../types/gallery';
import { buildCssFilterString } from '../../utils/editorLogic';

export interface EditorCanvasHandle {
  exportToBlob: (format: string, quality: number) => Promise<Blob>;
}

interface Props {
  imageUrl: string;
  editorState: EditorState;
  activeTab: 'crop' | 'adjust' | 'filters' | 'effects' | 'text' | 'draw';
  activeTextLayerId: string | null;
  markupTool: MarkupTool;
  markupColor: string;
  markupSize: number;
  markupOpacity: number;
  isComparingOriginal: boolean;
  onSelectTextLayer: (id: string | null) => void;
  onUpdateTextLayerPos: (id: string, x: number, y: number) => void;
  onAddDrawingPath: (path: DrawingPath) => void;
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, Props>(
  (
    {
      imageUrl,
      editorState,
      activeTab,
      activeTextLayerId,
      markupTool,
      markupColor,
      markupSize,
      markupOpacity,
      isComparingOriginal,
      onSelectTextLayer,
      onUpdateTextLayerPos,
      onAddDrawingPath,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

    // Mouse/Touch Interaction state
    const isDrawingRef = useRef(false);
    const currentPointsRef = useRef<Array<{ x: number; y: number }>>([]);
    const draggingTextIdRef = useRef<string | null>(null);

    // Load Image
    useEffect(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        setImageEl(img);
      };
    }, [imageUrl]);

    // Expose export function for high-res saving
    useImperativeHandle(ref, () => ({
      exportToBlob: async (format: string, quality: number): Promise<Blob> => {
        if (!imageEl) throw new Error('No image loaded');

        // Create high-resolution export canvas matching image original dimensions
        const exportCanvas = document.createElement('canvas');
        const rot = editorState.transform.rotation % 360;
        const isSwapped = rot === 90 || rot === 270;
        exportCanvas.width = isSwapped ? imageEl.naturalHeight : imageEl.naturalWidth;
        exportCanvas.height = isSwapped ? imageEl.naturalWidth : imageEl.naturalHeight;

        const ctx = exportCanvas.getContext('2d');
        if (!ctx) throw new Error('Cannot get canvas context');

        // Render full quality pipeline
        renderPipeline(ctx, exportCanvas.width, exportCanvas.height, imageEl, editorState, false);

        return new Promise((resolve, reject) => {
          exportCanvas.toBlob(
            blob => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas export failed'));
            },
            format,
            quality
          );
        });
      },
    }));

    // Main Render Pipeline
    const renderPipeline = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      img: HTMLImageElement,
      state: EditorState,
      originalOnly: boolean
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      if (originalOnly) {
        // Pristine original image draw
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        return;
      }

      // 1. Transform: Rotation, Flip, Fine Straighten
      ctx.translate(width / 2, height / 2);

      const totalAngle =
        ((state.transform.rotation + state.transform.fineAngle) * Math.PI) / 180;
      ctx.rotate(totalAngle);

      const scaleX = state.transform.flipH ? -1 : 1;
      const scaleY = state.transform.flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // 2. CSS Filter / Adjustments application
      const filterStr = buildCssFilterString(
        state.adjustments,
        state.filterId,
        state.filterIntensity
      );
      if (filterStr !== 'none') {
        ctx.filter = filterStr;
      }

      // Draw base image centered
      const rot = state.transform.rotation % 360;
      const isSwapped = rot === 90 || rot === 270;
      const drawW = isSwapped ? height : width;
      const drawH = isSwapped ? width : height;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.filter = 'none'; // reset filter
      ctx.restore();

      // 3. Vignette Pass
      if (state.adjustments.vignette > 0) {
        ctx.save();
        const radius = Math.max(width, height) * 0.7;
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          radius * 0.3,
          width / 2,
          height / 2,
          radius
        );
        const opacity = (state.adjustments.vignette / 100) * 0.9;
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${opacity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 4. Glow / Light Leak Pass
      if (state.effects.glow > 0 || state.effects.lightLeak > 0) {
        ctx.save();
        if (state.effects.lightLeak > 0) {
          const leakGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, width * 0.6);
          const leakOp = (state.effects.lightLeak / 100) * 0.5;
          leakGrad.addColorStop(0, `rgba(255, 140, 50, ${leakOp})`);
          leakGrad.addColorStop(0.6, `rgba(255, 200, 100, ${leakOp * 0.5})`);
          leakGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = leakGrad;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      // 5. Film Grain Pass
      const totalGrain = state.adjustments.grain + state.effects.filmGrain;
      if (totalGrain > 0) {
        ctx.save();
        const grainAmount = Math.min(totalGrain / 200, 0.25);
        ctx.fillStyle = `rgba(255,255,255,${grainAmount * 0.35})`;
        for (let i = 0; i < 400; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          const gs = Math.random() * 2 + 0.5;
          ctx.fillRect(gx, gy, gs, gs);
        }
        ctx.restore();
      }

      // 6. Drawing Paths Markup
      state.drawingPaths.forEach(path => {
        if (!path.points || path.points.length === 0) return;
        ctx.save();
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = path.opacity;

        if (path.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else if (path.tool === 'marker') {
          ctx.globalCompositeOperation = 'multiply';
        }

        ctx.beginPath();
        const startX = path.points[0].x * width;
        const startY = path.points[0].y * height;
        ctx.moveTo(startX, startY);

        if (path.tool === 'arrow') {
          const endPt = path.points[path.points.length - 1];
          const endX = endPt.x * width;
          const endY = endPt.y * height;
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Draw Arrow Head
          const headLen = Math.max(path.size * 2.5, 12);
          const angle = Math.atan2(endY - startY, endX - startX);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLen * Math.cos(angle - Math.PI / 6),
            endY - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLen * Math.cos(angle + Math.PI / 6),
            endY - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        } else if (path.tool === 'rect') {
          const endPt = path.points[path.points.length - 1];
          const endX = endPt.x * width;
          const endY = endPt.y * height;
          ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        } else if (path.tool === 'circle') {
          const endPt = path.points[path.points.length - 1];
          const rx = Math.abs((endPt.x * width - startX) / 2);
          const ry = Math.abs((endPt.y * height - startY) / 2);
          const cx = (startX + endPt.x * width) / 2;
          const cy = (startY + endPt.y * height) / 2;
          ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x * width, path.points[i].y * height);
          }
          ctx.stroke();
        }
        ctx.restore();
      });

      // 7. Text Layers
      state.textLayers.forEach(layer => {
        ctx.save();
        const px = layer.x * width;
        const py = layer.y * height;
        ctx.translate(px, py);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.size}px ${layer.font}`;
        ctx.font = fontStyle;
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'middle';

        // Background pill if enabled
        if (layer.hasBg) {
          const metrics = ctx.measureText(layer.text);
          const textW = metrics.width;
          const padX = layer.size * 0.4;
          const padY = layer.size * 0.25;
          let boxX = -padX;
          if (layer.align === 'center') boxX = -textW / 2 - padX;
          else if (layer.align === 'right') boxX = -textW - padX;

          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath();
          ctx.roundRect(boxX, -layer.size * 0.6 - padY, textW + padX * 2, layer.size * 1.2 + padY * 2, 8);
          ctx.fill();
        }

        // Drop shadow
        if (layer.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        // Stroke Outline
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor || '#000000';
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeText(layer.text, 0, 0);
        }

        // Fill Text
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.text, 0, 0);

        ctx.restore();
      });
    };

    // Repaint display canvas whenever state changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !imageEl) return;

      const rot = editorState.transform.rotation % 360;
      const isSwapped = rot === 90 || rot === 270;

      // Fit inside container display bounds smoothly
      const maxW = 900;
      const maxH = 600;
      const natW = isSwapped ? imageEl.naturalHeight : imageEl.naturalWidth;
      const natH = isSwapped ? imageEl.naturalWidth : imageEl.naturalHeight;

      const scale = Math.min(maxW / natW, maxH / natH, 1);
      const displayW = Math.round(natW * scale);
      const displayH = Math.round(natH * scale);

      canvas.width = displayW;
      canvas.height = displayH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderPipeline(ctx, displayW, displayH, imageEl, editorState, isComparingOriginal);
    }, [imageEl, editorState, isComparingOriginal]);

    // Canvas Pointer Events for Drawing & Text Dragging
    const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoordinates(e);

      if (activeTab === 'text') {
        // Check if clicking near any text layer to drag it
        const clickedLayer = editorState.textLayers.find(l => {
          const dx = l.x - coords.x;
          const dy = l.y - coords.y;
          return Math.sqrt(dx * dx + dy * dy) < 0.12;
        });

        if (clickedLayer) {
          draggingTextIdRef.current = clickedLayer.id;
          onSelectTextLayer(clickedLayer.id);
        } else {
          draggingTextIdRef.current = null;
        }
        return;
      }

      if (activeTab === 'draw') {
        isDrawingRef.current = true;
        currentPointsRef.current = [coords];
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoordinates(e);

      if (activeTab === 'text' && draggingTextIdRef.current) {
        onUpdateTextLayerPos(draggingTextIdRef.current, coords.x, coords.y);
        return;
      }

      if (activeTab === 'draw' && isDrawingRef.current) {
        currentPointsRef.current.push(coords);
        // Live stroke update
        const canvas = canvasRef.current;
        if (!canvas || !imageEl) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Render with preview stroke
        const tempState: EditorState = {
          ...editorState,
          drawingPaths: [
            ...editorState.drawingPaths,
            {
              id: 'temp',
              tool: markupTool,
              color: markupColor,
              size: markupSize,
              opacity: markupOpacity,
              points: currentPointsRef.current,
            },
          ],
        };
        renderPipeline(ctx, canvas.width, canvas.height, imageEl, tempState, false);
      }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activeTab === 'text') {
        draggingTextIdRef.current = null;
      }

      if (activeTab === 'draw' && isDrawingRef.current) {
        isDrawingRef.current = false;
        if (currentPointsRef.current.length > 0) {
          onAddDrawingPath({
            id: `draw_${Date.now()}`,
            tool: markupTool,
            color: markupColor,
            size: markupSize,
            opacity: markupOpacity,
            points: currentPointsRef.current,
          });
        }
        currentPointsRef.current = [];
      }
    };

    return (
      <div
        ref={containerRef}
        className="w-full flex-1 flex items-center justify-center p-3 select-none overflow-hidden relative"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`max-w-full max-h-[60vh] object-contain shadow-2xl rounded-lg touch-none ${
            activeTab === 'draw'
              ? 'cursor-crosshair'
              : activeTab === 'text'
              ? 'cursor-move'
              : 'cursor-default'
          }`}
          aria-label="Photo editor canvas"
        />

        {/* Floating Compare Badge */}
        {isComparingOriginal && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 text-amber-400 border border-amber-500/40 text-xs font-semibold backdrop-blur-md animate-pulse">
            Original Photo
          </div>
        )}
      </div>
    );
  }
);
