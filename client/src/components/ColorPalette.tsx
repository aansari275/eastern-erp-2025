import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RotateCcw, Eraser, Palette, Shuffle, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { TextureOverlay } from "./TextureOverlay";

type LayerType = 'normal' | 'high' | 'low';

interface ColorWithLayer {
  hex: string;
  layer: LayerType;
}

interface ColorPaletteProps {
  onColorSelect?: (color: string) => void;
  onColorReplace?: (fromColor: string, toColor: string) => void;
  canvas?: any; // Fabric.js canvas instance
  onHistoryAction?: (action: string) => void; // Track history for undo/redo
}

export function ColorPalette({ onColorSelect, onColorReplace, canvas, onHistoryAction }: ColorPaletteProps) {
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [replaceFromColor, setReplaceFromColor] = useState("#ef4444");
  const [replaceToColor, setReplaceToColor] = useState("#3b82f6");
  const [extractedColors, setExtractedColors] = useState<ColorWithLayer[]>([]);
  const [originalColors, setOriginalColors] = useState<ColorWithLayer[]>([]); // Store original colors for reset
  const [selectedOriginalColor, setSelectedOriginalColor] = useState<string | null>(null);
  const [isUpdatingColors, setIsUpdatingColors] = useState(false);
  const [colorChangeTimeout, setColorChangeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [removingColor, setRemovingColor] = useState<string | null>(null);

  // Curated color palettes for rug themes
  const rugPalettes = {
    "Earthy Mughal": ["#8B4513", "#D2691E", "#CD853F", "#F4A460", "#DEB887", "#BC8F8F"],
    "Pastel Nordic": ["#E6E6FA", "#F0F8FF", "#F5F5DC", "#FFF8DC", "#E0FFFF", "#F0FFFF"],
    "Desert Rose": ["#BC8F8F", "#F4A460", "#DEB887", "#D2B48C", "#F5DEB3", "#FFE4B5"],
    "Ocean Blues": ["#4682B4", "#5F9EA0", "#87CEEB", "#B0C4DE", "#ADD8E6", "#E0F6FF"],
    "Forest Earth": ["#228B22", "#32CD32", "#90EE90", "#8FBC8F", "#98FB98", "#F0FFF0"]
  };

  // ARS Color Palette
  const arsColors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#22c55e", "#06b6d4", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
    "#64748b", "#475569", "#374151", "#1f2937"
  ];

  const recentColors = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b"];

  const [selectedPalette, setSelectedPalette] = useState<string>("Earthy Mughal");
  const [showPaletteSuggestions, setShowPaletteSuggestions] = useState(false);

  // Extract unique colors from canvas objects - following your suggested approach
  const extractUniqueColors = (canvas: any): ColorWithLayer[] => {
    const colorSet = new Set<string>();
    if (canvas) {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.fill) {
          colorSet.add(obj.fill.toLowerCase());
        }
        // Also check for grouped objects
        if (obj.type === 'group' && obj.getObjects) {
          obj.getObjects().forEach((subObj: any) => {
            if (subObj.fill) {
              colorSet.add(subObj.fill.toLowerCase());
            }
          });
        }
      });
    }
    return Array.from(colorSet).map(hex => ({ hex, layer: 'normal' as LayerType }));
  };

  // Replace all matching fill colors with new color - optimized version
  const replaceColor = useCallback((canvas: any, oldColor: string, newColor: string) => {
    if (!canvas) return;
    
    let objectsChanged = false;
    canvas.getObjects().forEach((obj: any) => {
      if (obj.fill && obj.fill.toLowerCase() === oldColor.toLowerCase()) {
        obj.set({ fill: newColor });
        objectsChanged = true;
      }
      // Also check grouped objects
      if (obj.type === 'group' && obj.getObjects) {
        obj.getObjects().forEach((subObj: any) => {
          if (subObj.fill && subObj.fill.toLowerCase() === oldColor.toLowerCase()) {
            subObj.set({ fill: newColor });
            objectsChanged = true;
          }
        });
      }
    });
    
    if (objectsChanged) {
      canvas.requestRenderAll(); // More efficient than renderAll()
    }
  }, []);

  // Remove background color (largest area color)
  const removeBackgroundColor = useCallback(() => {
    if (!canvas || extractedColors.length === 0) return;
    
    // Count objects for each color to identify background (most common)
    const colorCounts: { [key: string]: number } = {};
    canvas.getObjects().forEach((obj: any) => {
      if (obj.fill) {
        const color = obj.fill.toLowerCase();
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
    });
    
    // Find the most common color (likely background)
    const backgroundColorCandidate = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (backgroundColorCandidate) {
      onHistoryAction?.('Remove Background');
      
      // Remove all objects with this color
      const objectsToRemove = canvas.getObjects().filter((obj: any) => 
        obj.fill && obj.fill.toLowerCase() === backgroundColorCandidate
      );
      
      objectsToRemove.forEach((obj: any) => {
        canvas.remove(obj);
      });
      
      canvas.requestRenderAll();
      
      // Update extracted colors
      const updatedColors = extractUniqueColors(canvas);
      setExtractedColors(updatedColors);
    }
  }, [canvas, extractedColors, onHistoryAction]);

  // Shuffle colors randomly across the design
  const shuffleColors = useCallback(() => {
    if (!canvas || extractedColors.length < 2) return;
    
    setIsUpdatingColors(true);
    onHistoryAction?.('Shuffle Colors');
    
    // Create a shuffled version of the extracted colors
    const shuffledColors = [...extractedColors].sort(() => Math.random() - 0.5);
    
    // Map each original color to a new shuffled color
    const colorMapping: { [key: string]: string } = {};
    extractedColors.forEach((colorObj, index) => {
      colorMapping[colorObj.hex] = shuffledColors[index].hex;
    });
    
    // Apply the color mapping to all canvas objects
    canvas.getObjects().forEach((obj: any) => {
      if (obj.fill && colorMapping[obj.fill.toLowerCase()]) {
        obj.set({ fill: colorMapping[obj.fill.toLowerCase()] });
      }
      // Also check grouped objects
      if (obj.type === 'group' && obj.getObjects) {
        obj.getObjects().forEach((subObj: any) => {
          if (subObj.fill && colorMapping[subObj.fill.toLowerCase()]) {
            subObj.set({ fill: colorMapping[subObj.fill.toLowerCase()] });
          }
        });
      }
    });
    
    canvas.requestRenderAll();
    
    // Update extracted colors
    setTimeout(() => {
      const updatedColors = extractUniqueColors(canvas);
      setExtractedColors(updatedColors);
      setIsUpdatingColors(false);
    }, 200);
  }, [canvas, extractedColors, onHistoryAction]);

  // Reset all colors to original state
  const resetColors = useCallback(() => {
    if (!canvas || originalColors.length === 0) return;
    
    setIsUpdatingColors(true);
    onHistoryAction?.('Reset Colors');
    
    // This is a simplified reset - in a full implementation, you'd store
    // the original color mapping for each object
    setTimeout(() => {
      setExtractedColors([...originalColors]);
      setSelectedOriginalColor(null);
      setIsUpdatingColors(false);
    }, 500);
  }, [canvas, originalColors, onHistoryAction]);

  // Calculate Euclidean distance between two RGB colors
  const calculateColorDistance = (color1: string, color2: string): number => {
    const hex2rgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    
    const rgb1 = hex2rgb(color1);
    const rgb2 = hex2rgb(color2);
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) + 
      Math.pow(rgb1.g - rgb2.g, 2) + 
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // Find the nearest color using Euclidean RGB distance
  const findNearestColor = (targetColor: string, availableColors: string[]): string => {
    let nearestColor = availableColors[0];
    let minDistance = Infinity;
    
    availableColors.forEach(color => {
      const distance = calculateColorDistance(targetColor, color);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = color;
      }
    });
    
    return nearestColor;
  };

  // Remove a color and merge affected regions to nearest color
  const removeColor = useCallback(async (colorToRemove: string) => {
    if (!canvas || extractedColors.length <= 2) {
      // Don't allow removing colors if only 2 or fewer remain
      return;
    }
    
    setRemovingColor(colorToRemove);
    setIsUpdatingColors(true);
    onHistoryAction?.(`Remove Color: ${colorToRemove}`);
    
    // Get remaining colors after removal
    const remainingColors = extractedColors.filter(colorObj => 
      colorObj.hex.toLowerCase() !== colorToRemove.toLowerCase()
    );
    
    // Find nearest color for replacement
    const remainingHexColors = remainingColors.map(c => c.hex);
    const nearestColor = findNearestColor(colorToRemove, remainingHexColors);
    
    // Replace all objects with the removed color to the nearest color
    canvas.getObjects().forEach((obj: any) => {
      if (obj.fill && obj.fill.toLowerCase() === colorToRemove.toLowerCase()) {
        obj.set({ fill: nearestColor });
      }
      // Also check grouped objects
      if (obj.type === 'group' && obj.getObjects) {
        obj.getObjects().forEach((subObj: any) => {
          if (subObj.fill && subObj.fill.toLowerCase() === colorToRemove.toLowerCase()) {
            subObj.set({ fill: nearestColor });
          }
        });
      }
    });
    
    canvas.requestRenderAll();
    
    // Update extracted colors after removal
    setTimeout(() => {
      setExtractedColors(remainingColors);
      setRemovingColor(null);
      setIsUpdatingColors(false);
    }, 150);
  }, [canvas, extractedColors, onHistoryAction]);

  // Update extracted colors when canvas changes
  useEffect(() => {
    if (canvas) {
      const colors = extractUniqueColors(canvas);
      setExtractedColors(colors);
      
      // Store original colors for reset functionality
      if (originalColors.length === 0) {
        setOriginalColors([...colors]);
      }
      
      // Listen for canvas changes to update color palette
      const handleCanvasChange = () => {
        const updatedColors = extractUniqueColors(canvas);
        setExtractedColors(updatedColors);
      };
      
      canvas.on('object:added', handleCanvasChange);
      canvas.on('object:removed', handleCanvasChange);
      canvas.on('object:modified', handleCanvasChange);
      
      return () => {
        canvas.off('object:added', handleCanvasChange);
        canvas.off('object:removed', handleCanvasChange);
        canvas.off('object:modified', handleCanvasChange);
      };
    }
  }, [canvas, originalColors.length]);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onColorSelect?.(color);
  };

  const handleExtractedColorClick = (colorObj: ColorWithLayer) => {
    setSelectedOriginalColor(colorObj.hex);
    setReplaceFromColor(colorObj.hex);
    setSelectedColor(colorObj.hex); // Set the current picker color to the selected color
  };

  // Handle layer change for a specific color
  const handleLayerChange = useCallback((colorHex: string, newLayer: LayerType) => {
    onHistoryAction?.(`Change Layer: ${colorHex} to ${newLayer}`);
    
    setExtractedColors(prev => 
      prev.map(colorObj => 
        colorObj.hex === colorHex 
          ? { ...colorObj, layer: newLayer }
          : colorObj
      )
    );
    
    // Apply visual effects to canvas objects based on layer
    if (canvas) {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.fill && obj.fill.toLowerCase() === colorHex.toLowerCase()) {
          // Reset effects first
          obj.set({
            shadow: null,
            opacity: 1
          });

          // Apply layer-specific effects
          try {
            switch (newLayer) {
              case 'high':
                obj.set({
                  shadow: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    blur: 8,
                    offsetX: 0,
                    offsetY: 0
                  }
                });
                break;
              case 'low':
                obj.set({
                  shadow: {
                    color: 'rgba(0, 0, 0, 0.4)',
                    blur: 4,
                    offsetX: 2,
                    offsetY: 2
                  },
                  opacity: 0.85
                });
                break;
              case 'normal':
              default:
                // No additional effects
                break;
            }
          } catch (error) {
            console.warn('Failed to apply layer effect:', error);
          }
        }
        
        // Also check grouped objects
        if (obj.type === 'group' && obj.getObjects) {
          obj.getObjects().forEach((subObj: any) => {
            if (subObj.fill && subObj.fill.toLowerCase() === colorHex.toLowerCase()) {
              // Reset effects first
              subObj.set({
                shadow: null,
                opacity: 1
              });

              // Apply layer-specific effects
              try {
                switch (newLayer) {
                  case 'high':
                    subObj.set({
                      shadow: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        blur: 8,
                        offsetX: 0,
                        offsetY: 0
                      }
                    });
                    break;
                  case 'low':
                    subObj.set({
                      shadow: {
                        color: 'rgba(0, 0, 0, 0.4)',
                        blur: 4,
                        offsetX: 2,
                        offsetY: 2
                      },
                      opacity: 0.85
                    });
                    break;
                  case 'normal':
                  default:
                    // No additional effects
                    break;
                }
              } catch (error) {
                console.warn('Failed to apply layer effect to grouped object:', error);
              }
            }
          });
        }
      });
      
      canvas.requestRenderAll();
    }
  }, [canvas, onHistoryAction]);

  // Debounced color change for better performance
  const handleColorChange = useCallback((newColor: string) => {
    setSelectedColor(newColor);
    
    if (selectedOriginalColor && canvas) {
      setIsUpdatingColors(true);
      
      // Clear previous timeout
      if (colorChangeTimeout) {
        clearTimeout(colorChangeTimeout);
      }
      
      // Set new timeout for debounced update
      const timeout = setTimeout(() => {
        replaceColor(canvas, selectedOriginalColor, newColor);
        onColorReplace?.(selectedOriginalColor, newColor);
        
        // Update extracted colors after replacement
        const updatedColors = extractUniqueColors(canvas);
        setExtractedColors(updatedColors);
        
        // Update the selected original color to the new color for further changes
        setSelectedOriginalColor(newColor);
        setIsUpdatingColors(false);
      }, 150); // 150ms debounce
      
      setColorChangeTimeout(timeout);
    }
  }, [selectedOriginalColor, canvas, colorChangeTimeout, replaceColor, onColorReplace]);

  const handleColorReplace = () => {
    if (selectedOriginalColor && canvas) {
      replaceColor(canvas, selectedOriginalColor, selectedColor);
      onColorReplace?.(selectedOriginalColor, selectedColor);
      // Update extracted colors after replacement
      const updatedColors = extractUniqueColors(canvas);
      setExtractedColors(updatedColors);
      // Update the selected original color to the new color for further changes
      setSelectedOriginalColor(selectedColor);
    } else {
      onColorReplace?.(replaceFromColor, replaceToColor);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col" data-testid="color-palette">
      {/* Element Properties */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Properties</h3>
        
        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
          <i className="fas fa-mouse-pointer text-2xl mb-2 opacity-50"></i>
          <p className="text-sm">Select an element to edit properties</p>
        </div>
      </div>

      {/* Color Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Colors</h3>
          
          {/* Extracted Colors from Canvas */}
          {extractedColors.length > 0 && (
            <div className="mb-4">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Design Colors ({extractedColors.length})
              </Label>
              {/* Vertical column layout for colors */}
              <div className="space-y-2" data-testid="extracted-colors">
                {extractedColors.map((colorObj, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    {/* Color swatch */}
                    <div className="relative group">
                      <div
                        className={`w-8 h-8 rounded cursor-pointer border-2 transition-all hover:scale-110 ${
                          selectedOriginalColor === colorObj.hex 
                            ? 'border-blue-500 shadow-lg' 
                            : 'border-slate-300 dark:border-slate-600'
                        } ${removingColor === colorObj.hex ? 'opacity-50 pointer-events-none' : ''}`}
                        style={{ backgroundColor: colorObj.hex }}
                        title={colorObj.hex}
                        onClick={() => handleExtractedColorClick(colorObj)}
                        data-testid={`color-swatch-${index}`}
                      />
                      {/* Remove Color Button */}
                      {extractedColors.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeColor(colorObj.hex);
                          }}
                          disabled={removingColor === colorObj.hex || isUpdatingColors}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove this color"
                          data-testid={`remove-color-${index}`}
                        >
                          {removingColor === colorObj.hex ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                          ) : (
                            <X className="h-2 w-2" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Color hex code */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono flex-1">
                      {colorObj.hex}
                    </div>
                    
                    {/* Layer dropdown */}
                    <div className="flex items-center gap-2">
                      <Select 
                        value={colorObj.layer} 
                        onValueChange={(value) => handleLayerChange(colorObj.hex, value as LayerType)}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high" className="text-xs">
                            ↑ High
                          </SelectItem>
                          <SelectItem value="normal" className="text-xs">
                            — Normal
                          </SelectItem>
                          <SelectItem value="low" className="text-xs">
                            ↓ Low
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Layer indicator icon */}
                      <div className="text-slate-500 dark:text-slate-400">
                        {colorObj.layer === 'high' && <ArrowUp className="h-3 w-3" />}
                        {colorObj.layer === 'normal' && <Minus className="h-3 w-3" />}
                        {colorObj.layer === 'low' && <ArrowDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedOriginalColor && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    {isUpdatingColors && <Loader2 className="w-3 h-3 animate-spin" />}
                    <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Selected: {selectedOriginalColor}
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Click on this color to recolor it
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-3 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shuffleColors}
                  disabled={extractedColors.length < 2 || isUpdatingColors}
                  className="w-full text-xs"
                  data-testid="button-shuffle-colors"
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  Shuffle Colors
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeBackgroundColor}
                    disabled={extractedColors.length === 0}
                    className="flex-1 text-xs"
                    data-testid="button-remove-background"
                  >
                    <Eraser className="w-3 h-3 mr-1" />
                    Remove BG
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetColors}
                    disabled={originalColors.length === 0}
                    className="flex-1 text-xs"
                    data-testid="button-reset-colors"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
              
              {/* Texture Overlay Section */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <TextureOverlay canvas={canvas} onHistoryAction={onHistoryAction} />
              </div>
            </div>
          )}
          


          {/* ARS Color Palette */}
          <div className="mb-4">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">ARS Palette</Label>
            <div className="grid grid-cols-6 gap-2">
              {arsColors.map((color, index) => (
                <button
                  key={index}
                  className="aspect-square rounded-md border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                  data-testid={`ars-color-${index}`}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* AI Palette Suggestions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Rug Themes</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPaletteSuggestions(!showPaletteSuggestions)}
                className="h-6 px-2 text-xs"
                data-testid="button-toggle-palettes"
              >
                <Palette className="w-3 h-3 mr-1" />
                {showPaletteSuggestions ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showPaletteSuggestions && (
              <div className="space-y-2">
                {Object.entries(rugPalettes).map(([name, colors]) => (
                  <div key={name} className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{name}</div>
                    <div className="flex gap-1">
                      {colors.map((color, index) => (
                        <button
                          key={index}
                          className="w-6 h-6 rounded border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                          title={`${name}: ${color}`}
                          data-testid={`palette-${name}-${index}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Colors */}
          <div className="mb-6">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">Recent</Label>
            <div className="flex space-x-2">
              {recentColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded-md border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                  data-testid={`recent-color-${index}`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Color Replacement Tools */}
          <div>
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block uppercase tracking-wide">Color Replace</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">From Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600"
                    style={{ backgroundColor: selectedOriginalColor || replaceFromColor }}
                    data-testid="replace-from-color"
                  />
                  <Input
                    type="text"
                    value={selectedOriginalColor || replaceFromColor}
                    onChange={(e) => setReplaceFromColor(e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="Click design color above"
                    data-testid="input-replace-from"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">To Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                    data-testid="input-color-picker"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 text-sm font-mono"
                    placeholder="#0000ff"
                    data-testid="input-replace-to"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleColorReplace}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
                disabled={(!selectedOriginalColor && !replaceFromColor) || isUpdatingColors}
                data-testid="button-replace-color"
              >
                {isUpdatingColors ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Replace Color'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
