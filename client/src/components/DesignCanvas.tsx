import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Grid3X3, Eye, ZoomIn, ZoomOut } from "lucide-react";

interface DesignCanvasProps {
  onSelectionChange?: (object: fabric.Object | null) => void;
  onCanvasChange?: (canvas: fabric.Canvas) => void;
}

export function DesignCanvas({ onSelectionChange, onCanvasChange }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Make canvas responsive to container with better sizing
    const container = canvasRef.current.parentElement!;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Ensure canvas is large enough for vectorized images
    const minWidth = 1000;
    const minHeight = 700;
    const canvasWidth = Math.max(minWidth, containerWidth - 40);
    const canvasHeight = Math.max(minHeight, containerHeight - 40);
    
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
    });

    // Add grid pattern if enabled
    if (showGrid) {
      const gridSize = 20;
      const grid = [];
      
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;
      
      for (let i = 0; i < (canvasWidth / gridSize); i++) {
        grid.push(new fabric.Line([i * gridSize, 0, i * gridSize, canvasHeight], {
          stroke: '#e2e8f0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }));
      }
      
      for (let i = 0; i < (canvasHeight / gridSize); i++) {
        grid.push(new fabric.Line([0, i * gridSize, canvasWidth, i * gridSize], {
          stroke: '#e2e8f0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }));
      }
      
      grid.forEach(line => {
        fabricCanvas.add(line);
      });
      // Grid lines are automatically in the back since they're added first
    }

    // Enhanced color region interaction for vectorized images
    fabricCanvas.on('mouse:down', (e: any) => {
      const target = e.target;
      
      // Check if clicking on a vectorized region (SVG path with color data)
      if (target && target.type === 'group') {
        // Look for SVG objects within the group
        const svgObjects = target.getObjects().filter((obj: any) => obj.type === 'path');
        if (svgObjects.length > 0) {
          const clickedPath = svgObjects[0];
          if (clickedPath.fill) {
            // Emit color selection event for color picker
            (fabricCanvas as any).fire('color:selected', { 
              color: clickedPath.fill, 
              target: clickedPath,
              allPaths: svgObjects.filter((obj: any) => obj.fill === clickedPath.fill)
            });
          }
        }
      } else if (target && target.fill) {
        // Direct path click
        (fabricCanvas as any).fire('color:selected', { 
          color: target.fill, 
          target: target,
          allPaths: [target]
        });
      }
    });

    fabricCanvas.on('selection:created', (e: any) => {
      onSelectionChange?.(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:updated', (e: any) => {
      onSelectionChange?.(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:cleared', () => {
      onSelectionChange?.(null);
    });

    setCanvas(fabricCanvas);
    onCanvasChange?.(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [showGrid, onSelectionChange, onCanvasChange]);

  const handleZoom = (zoomIn: boolean) => {
    if (!canvas) return;
    
    const newZoom = zoomIn ? Math.min(zoom + 25, 200) : Math.max(zoom - 25, 25);
    setZoom(newZoom);
    canvas.setZoom(newZoom / 100);
    canvas.renderAll();
  };

  // Removed undo/redo handlers - these are now handled in DesignStudio component

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const togglePreview = () => {
    if (!canvas) return;
    
    // Hide/show selection controls and grid
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-h-0">
      {/* Canvas Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between" data-testid="canvas-toolbar">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Zoom:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom(false)}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-700 dark:text-slate-300 min-w-[3rem]" data-testid="text-zoom">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom(true)}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={toggleGrid}
            data-testid="button-toggle-grid"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            data-testid="button-preview"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative min-h-0" data-testid="canvas-container">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-slate-200 dark:border-slate-300 rounded-lg shadow-xl"
            data-testid="design-canvas"
          />
          
          {/* Canvas resize handles */}
          <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-se-resize" data-testid="resize-handle-se"></div>
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-e-resize" data-testid="resize-handle-e"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-s-resize" data-testid="resize-handle-s"></div>
        </div>

        {/* Canvas Dimensions Display */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded" data-testid="canvas-dimensions">
          {canvas ? `${canvas.width} × ${canvas.height}` : '600 × 400'} px
        </div>
      </div>
    </div>
  );
}
