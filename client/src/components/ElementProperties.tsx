import { useState, useEffect } from "react";
import * as fabric from "fabric";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ElementPropertiesProps {
  selectedObject: fabric.Object | null;
  onObjectUpdate?: (object: fabric.Object) => void;
  canvas?: fabric.Canvas | null;
}

export function ElementProperties({ selectedObject, onObjectUpdate, canvas }: ElementPropertiesProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [colorTargets, setColorTargets] = useState<any[]>([]);

  useEffect(() => {
    if (selectedObject) {
      setPosition({ 
        x: Math.round(selectedObject.left || 0), 
        y: Math.round(selectedObject.top || 0) 
      });
      setSize({ 
        width: Math.round(selectedObject.width || 0), 
        height: Math.round(selectedObject.height || 0) 
      });
      setRotation(Math.round(selectedObject.angle || 0));
      setOpacity(Math.round((selectedObject.opacity || 1) * 100));
      
      // Set color if object has fill
      if ((selectedObject as any).fill) {
        setCurrentColor((selectedObject as any).fill);
      }
    }
    
    // Listen for color selection events from canvas
    if (canvas) {
      (canvas as any).on('color:selected', (e: any) => {
        setCurrentColor(e.color);
        setColorTargets(e.allPaths || [e.target]);
      });
    }
    
    return () => {
      if (canvas) {
        (canvas as any).off('color:selected');
      }
    };
  }, [selectedObject, canvas]);

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject) return;
    
    (selectedObject as any)[property] = value;
    selectedObject.setCoords();
    onObjectUpdate?.(selectedObject);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    const newPosition = { ...position, [axis]: numValue };
    setPosition(newPosition);
    
    if (selectedObject) {
      if (axis === 'x') {
        updateObjectProperty('left', numValue);
      } else {
        updateObjectProperty('top', numValue);
      }
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    const newSize = { ...size, [dimension]: numValue };
    setSize(newSize);
    
    if (selectedObject) {
      selectedObject.set(dimension, numValue);
      selectedObject.setCoords();
      onObjectUpdate?.(selectedObject);
    }
  };

  const handleRotationChange = (value: number[]) => {
    const rotationValue = value[0];
    setRotation(rotationValue);
    updateObjectProperty('angle', rotationValue);
  };

  const handleOpacityChange = (value: number[]) => {
    const opacityValue = value[0];
    setOpacity(opacityValue);
    updateObjectProperty('opacity', opacityValue / 100);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    
    // Update all target paths with the same color
    if (colorTargets.length > 0) {
      colorTargets.forEach(target => {
        target.set('fill', newColor);
      });
      canvas?.renderAll();
    } else if (selectedObject) {
      // Fallback to selected object
      updateObjectProperty('fill', newColor);
    }
  };

  if (!selectedObject) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400" data-testid="no-selection">
        <i className="fas fa-mouse-pointer text-2xl mb-2 opacity-50"></i>
        <p className="text-sm">Select an element to edit properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="element-properties">
      {/* Position */}
      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">X</Label>
            <Input
              type="number"
              value={position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="text-sm"
              data-testid="input-position-x"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Y</Label>
            <Input
              type="number"
              value={position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="text-sm"
              data-testid="input-position-y"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Width</Label>
            <Input
              type="number"
              value={size.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
              className="text-sm"
              data-testid="input-size-width"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Height</Label>
            <Input
              type="number"
              value={size.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
              className="text-sm"
              data-testid="input-size-height"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
          Rotation: {rotation}°
        </Label>
        <Slider
          value={[rotation]}
          onValueChange={handleRotationChange}
          max={360}
          min={0}
          step={1}
          className="w-full"
          data-testid="slider-rotation"
        />
      </div>

      {/* Color */}
      {((selectedObject as any)?.fill || colorTargets.length > 0) && (
        <div>
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
            Fill Color {colorTargets.length > 1 && `(${colorTargets.length} regions)`}
          </Label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={currentColor}
              onChange={handleColorChange}
              className="w-12 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
              data-testid="color-picker"
            />
            <Input
              type="text"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              onBlur={(e) => handleColorChange(e)}
              placeholder="#000000"
              className="text-sm font-mono"
              data-testid="input-color-hex"
            />
          </div>
        </div>
      )}

      {/* Opacity */}
      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
          Opacity: {opacity}%
        </Label>
        <Slider
          value={[opacity]}
          onValueChange={handleOpacityChange}
          max={100}
          min={0}
          step={1}
          className="w-full"
          data-testid="slider-opacity"
        />
      </div>
    </div>
  );
}
