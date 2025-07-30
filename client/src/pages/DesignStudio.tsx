import { useState, useCallback, useEffect } from "react";
import * as fabric from "fabric";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DesignCanvas } from "@/components/DesignCanvas";
import { PatternLibrary } from "@/components/PatternLibrary";
import { ColorPalette } from "@/components/ColorPalette";
import { 
  Save, 
  Download, 
  Moon, 
  Sun, 
  Bell, 
  Plus, 
  FolderOpen,
  Palette,
  Home,
  Undo,
  Redo,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { SignInButton } from "@/components/SignInButton";
import { Link } from "wouter";
import type { InsertDesign } from "@shared/schema";
// @ts-ignore - imagetracerjs types
import * as ImageTracer from "imagetracerjs";

interface HistoryState {
  canvasState: string;
  timestamp: number;
  action: string;
}

export default function DesignStudio() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [designTitle, setDesignTitle] = useState("Untitled Design");
  const [mockUserId] = useState("demo-user-id"); // In real app, get from auth
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [colorCount, setColorCount] = useState(7);
  const [showRefineToggle, setShowRefineToggle] = useState(false);
  const [lastVectorizedObject, setLastVectorizedObject] = useState<fabric.Object | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isLeftNavCollapsed, setIsLeftNavCollapsed] = useState(false);

  // Function to extract colors from canvas
  const extractUniqueColors = useCallback((canvas: fabric.Canvas) => {
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
    return Array.from(colorSet);
  }, []);

  // Update extracted colors when canvas changes
  useEffect(() => {
    if (canvas) {
      const updateColors = () => {
        const colors = extractUniqueColors(canvas);
        setExtractedColors(colors);
      };
      
      canvas.on('object:added', updateColors);
      canvas.on('object:removed', updateColors);
      canvas.on('object:modified', updateColors);
      
      // Initial color extraction
      updateColors();
      
      return () => {
        canvas.off('object:added', updateColors);
        canvas.off('object:removed', updateColors);
        canvas.off('object:modified', updateColors);
      };
    }
  }, [canvas, extractUniqueColors]);
  
  // Undo/Redo functionality
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Save current state to history
  const saveToHistory = useCallback((action: string) => {
    if (!canvas) return;
    
    try {
      const canvasState = canvas.toJSON();
      const newState: HistoryState = {
        canvasState: JSON.stringify(canvasState),
        timestamp: Date.now(),
        action
      };
      
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push(newState);
      
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setCurrentHistoryIndex(prev => prev + 1);
      }
      
      setHistory(newHistory);
      console.log('Saved to history:', action, 'Total states:', newHistory.length);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }, [canvas, history, currentHistoryIndex]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (!canvas || currentHistoryIndex <= 0) return;
    
    const previousState = history[currentHistoryIndex - 1];
    if (previousState) {
      try {
        canvas.loadFromJSON(previousState.canvasState, () => {
          canvas.renderAll();
          setCurrentHistoryIndex(prev => prev - 1);
          console.log('Undo action:', previousState.action);
          
          // Update extracted colors after undo
          const colors = extractUniqueColors(canvas);
          setExtractedColors(colors);
        });
      } catch (error) {
        console.error('Undo error:', error);
        toast({
          variant: "destructive",
          title: "Undo Failed",
          description: "Could not undo the last action. Please try again.",
        });
      }
    }
  }, [canvas, history, currentHistoryIndex, extractUniqueColors, toast]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (!canvas || currentHistoryIndex >= history.length - 1) return;
    
    const nextState = history[currentHistoryIndex + 1];
    if (nextState) {
      try {
        canvas.loadFromJSON(nextState.canvasState, () => {
          canvas.renderAll();
          setCurrentHistoryIndex(prev => prev + 1);
          console.log('Redo action:', nextState.action);
          
          // Update extracted colors after redo
          const colors = extractUniqueColors(canvas);
          setExtractedColors(colors);
        });
      } catch (error) {
        console.error('Redo error:', error);
        toast({
          variant: "destructive",
          title: "Redo Failed",
          description: "Could not redo the action. Please try again.",
        });
      }
    }
  }, [canvas, history, currentHistoryIndex, extractUniqueColors, toast]);

  const saveMutation = useMutation({
    mutationFn: async (designData: InsertDesign) => {
      const response = await apiRequest("POST", "/api/designs", designData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Design Saved",
        description: "Your design has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your design. Please try again.",
      });
    },
  });

  // Pattern selection handler removed since Saved Patterns feature was removed

  const handleAutoVectorize = useCallback(async (imageData: string, fileName: string) => {
    if (!canvas) return;

    setIsVectorizing(true);
    
    try {
      // Show loading toast
      toast({
        title: "Processing Image",
        description: "Starting auto-vectorization...",
      });

      // Create image element for processing
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Create canvas for image processing with reasonable size limits
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d')!;
      
      // Limit image size for performance while maintaining aspect ratio
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      tempCanvas.width = width;
      tempCanvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Configure ImageTracer options for textile-like output
      const options = {
        numberofcolors: colorCount,
        mincolorratio: 0.02,
        colorsampling: 1,
        scale: 1,
        simplifytolerance: 0,
        roundcoords: 1,
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        blurradius: 0,
        blurdelta: 20,
        linefilter: false,
        specklefilter: true,
        colorquantcycles: 3,
        layering: 0,
        strokewidth: 1,
        linefilter_strength: 0.01,
        desc: false,
        viewbox: false
      };

      // Use ImageTracer with performance optimizations
      let svgString: string;
      try {
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Add timeout to prevent long processing times
        const tracerPromise = new Promise<string>((resolve, reject) => {
          try {
            const result = ImageTracer.imagedataToSVG(imageData, options);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Vectorization timeout')), 10000);
        });
        
        svgString = await Promise.race([tracerPromise, timeoutPromise]);
      } catch (tracerError) {
        console.warn('ImageTracer failed:', tracerError);
        throw new Error('Vectorization failed');
      }

      // Add the vectorized SVG to canvas
      fabric.loadSVGFromString(svgString).then((result: any) => {
        const objects = result.objects;
        if (!canvas || !objects || objects.length === 0) return;

        let svgGroup;
        if (objects.length === 1) {
          svgGroup = objects[0];
        } else {
          svgGroup = new fabric.Group(objects, {
            interactive: true,
            subTargetCheck: true,
          });
        }
        
        // Calculate scale to fit SVG within canvas bounds while maintaining aspect ratio
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const svgWidth = svgGroup.width || 1;
        const svgHeight = svgGroup.height || 1;
        const scaleX = (canvasWidth * 0.9) / svgWidth;
        const scaleY = (canvasHeight * 0.9) / svgHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        svgGroup.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });

        canvas.add(svgGroup);
        saveToHistory('Auto-Vectorize Complete');
        canvas.renderAll();
        
        // Store reference for potential refinement
        setLastVectorizedObject(svgGroup);
        setShowRefineToggle(true);

        toast({
          title: "Vectorization Complete",
          description: "Image successfully converted to editable vector format",
        });
      });

    } catch (error) {
      console.error('Auto-vectorization error:', error);
      toast({
        variant: "destructive",
        title: "Vectorization Failed",
        description: "Could not process the image. Please try again.",
      });
    } finally {
      setIsVectorizing(false);
    }
  }, [canvas, colorCount, toast]);

  const handleRefineVector = useCallback(async () => {
    if (!canvas || !lastVectorizedObject) return;

    // Store original position and scaling for preservation
    const originalLeft = lastVectorizedObject.left;
    const originalTop = lastVectorizedObject.top;
    const originalScaleX = lastVectorizedObject.scaleX;
    const originalScaleY = lastVectorizedObject.scaleY;

    try {
      toast({
        title: "Refining Vector",
        description: "Removing small artifacts and noise...",
      });

      // Get all objects from the vectorized group
      let objects: fabric.Object[] = [];
      
      if (lastVectorizedObject.type === 'group') {
        const group = lastVectorizedObject as fabric.Group;
        objects = group.getObjects();
      } else {
        objects = [lastVectorizedObject];
      }

      if (objects.length === 0) return;

      // Calculate size threshold for removing small artifacts
      const canvasArea = canvas.getWidth() * canvas.getHeight();
      const sizeThreshold = Math.sqrt(canvasArea * 0.0001); // Very small threshold for dust removal

      // Filter out small artifacts
      const filteredObjects = objects.filter(obj => {
        const bounds = obj.getBoundingRect();
        const maxDimension = Math.max(bounds.width, bounds.height);
        return maxDimension >= sizeThreshold;
      });

      const removedCount = objects.length - filteredObjects.length;

      if (removedCount > 0) {
        // Remove the original object from canvas
        canvas.remove(lastVectorizedObject);

        // Create new refined group with filtered objects
        let refinedObject;
        if (filteredObjects.length === 1) {
          refinedObject = filteredObjects[0];
        } else if (filteredObjects.length > 1) {
          refinedObject = new fabric.Group(filteredObjects, {
            interactive: true,
            subTargetCheck: true,
          });
        } else {
          // If all objects were removed, keep the original
          refinedObject = lastVectorizedObject;
          canvas.add(refinedObject);
          toast({
            title: "Vector Already Clean",
            description: "No artifacts found to remove",
          });
          setShowRefineToggle(false);
          setLastVectorizedObject(null);
          return;
        }

        // Restore original positioning and scaling
        refinedObject.set({
          left: originalLeft,
          top: originalTop,
          scaleX: originalScaleX,
          scaleY: originalScaleY,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add refined object back to canvas
        canvas.add(refinedObject);
        saveToHistory('Vector Refined');
        canvas.renderAll();

        toast({
          title: "Vector Refined",
          description: `Removed ${removedCount} small artifacts and dust particles`,
        });
      } else {
        toast({
          title: "Vector Already Clean",
          description: "No small artifacts found to remove",
        });
      }

      // Hide the refine toggle after use
      setShowRefineToggle(false);
      setLastVectorizedObject(null);

    } catch (error) {
      console.error('Vector refinement error:', error);
      toast({
        variant: "destructive",
        title: "Refinement Failed",
        description: "Could not refine the vector. Please try again.",
      });
    }
  }, [canvas, lastVectorizedObject, toast]);

  const handleColorSelect = useCallback((color: string) => {
    if (!canvas || !selectedObject) return;

    if (selectedObject.type === 'path' || selectedObject.type === 'circle' || selectedObject.type === 'rect') {
      saveToHistory(`Color Select: ${color}`);
      selectedObject.set('fill', color);
      canvas.renderAll();
    }
  }, [canvas, selectedObject, saveToHistory]);

  const handleColorReplace = useCallback((fromColor: string, toColor: string) => {
    if (!canvas) return;

    saveToHistory(`Color Replace: ${fromColor} → ${toColor}`);
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.fill === fromColor) {
        obj.set('fill', toColor);
      }
    });
    canvas.renderAll();
  }, [canvas, saveToHistory]);

  const handleSave = () => {
    if (!canvas) return;

    const canvasData = canvas.toJSON();
    const designData: InsertDesign = {
      title: designTitle,
      userId: mockUserId,
      canvasData,
      thumbnail: canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 }),
    };

    saveMutation.mutate(designData);
  };

  // Removed object update handler since ElementProperties component was removed

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden" data-testid="design-studio">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between flex-shrink-0" data-testid="top-navigation">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Palette className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Rug Canva</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 ml-8">
            <Link href="/">
              <Button 
                variant="ghost"
                size="sm" 
                data-testid="button-home"
              >
                <Home className="h-3 w-3 mr-1" />
                Home
              </Button>
            </Link>
            
            {/* Color Count Control - Show before/during vectorization */}
            {(isVectorizing || extractedColors.length === 0) && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  Colors: {colorCount}
                </span>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  className="w-20 h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  data-testid="slider-color-count"
                  title={`Extract ${colorCount} dominant colors`}
                />
                <span className="text-xs text-blue-500 dark:text-blue-400">
                  {colorCount === 4 ? 'Min' : colorCount === 10 ? 'Max' : ''}
                </span>
              </div>
            )}
            
            {/* Refine Vector Toggle */}
            {showRefineToggle && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefineVector}
                  className="text-xs h-6 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/30"
                  data-testid="button-refine-vector"
                >
                  🧹 Remove Dust/Noise
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {setShowRefineToggle(false); setLastVectorizedObject(null);}}
                  className="h-6 w-6 p-0 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                  data-testid="button-dismiss-refine"
                >
                  ×
                </Button>
              </div>
            )}
            
            {/* Undo/Redo Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={currentHistoryIndex <= 0}
                className="h-8 w-8 p-0"
                title="Undo"
                data-testid="button-undo"
              >
                <Undo className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                disabled={currentHistoryIndex >= history.length - 1}
                className="h-8 w-8 p-0"
                title="Redo"
                data-testid="button-redo"
              >
                <Redo className="h-3 w-3" />
              </Button>
            </div>
            
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-new-project"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="w-48 text-sm"
            placeholder="Design title..."
            data-testid="input-design-title"
          />
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-3 w-3 mr-1" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button size="sm" variant="outline" data-testid="button-download">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          
          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant="ghost"
                size="sm"
                data-testid="button-home-mobile"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <SignInButton />
        </div>
      </nav>
      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden h-full relative">
        {/* Left Sidebar with Collapse - Only Pattern Library */}
        <div className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${
          isLeftNavCollapsed ? 'w-0' : 'w-80'
        } overflow-hidden`}>
          <PatternLibrary 
            onAutoVectorize={handleAutoVectorize}
            canvas={canvas}
            onAIPatternGenerated={(svgData: string, prompt: string) => {
              if (!canvas) return;
              
              fabric.loadSVGFromString(svgData).then((result: any) => {
                const objects = result.objects;
                if (objects && objects.length > 0) {
                  let obj;
                  if (objects.length === 1) {
                    obj = objects[0];
                  } else {
                    obj = new fabric.Group(objects);
                  }
                  
                  obj.set({
                    left: Math.random() * (canvas.width! - 200),
                    top: Math.random() * (canvas.height! - 200),
                    scaleX: 0.2,
                    scaleY: 0.2,
                  });
                  canvas.add(obj);
                  canvas.renderAll();
                }
                
                toast({
                  title: "AI Pattern Added",
                  description: `Generated pattern "${prompt}" added to canvas`,
                });
              }).catch((error: any) => {
                console.error('Error loading AI pattern:', error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to add AI pattern to canvas",
                });
              });
            }}
          />
        </div>

        {/* Collapse Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLeftNavCollapsed(!isLeftNavCollapsed)}
          className={`absolute ${isLeftNavCollapsed ? 'left-2' : 'left-[310px]'} bottom-4 z-10 h-8 w-8 p-0 transition-all duration-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700`}
          data-testid="button-toggle-left-nav"
        >
          {isLeftNavCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-auto relative">
          <DesignCanvas 
            onSelectionChange={setSelectedObject}
            onCanvasChange={(fabricCanvas) => {
              setCanvas(fabricCanvas);
              // Save initial state to history after canvas is set up
              setTimeout(() => {
                if (fabricCanvas && history.length === 0) {
                  const canvasState = fabricCanvas.toJSON();
                  const initialState: HistoryState = {
                    canvasState: JSON.stringify(canvasState),
                    timestamp: Date.now(),
                    action: 'Initial Canvas'
                  };
                  setHistory([initialState]);
                  setCurrentHistoryIndex(0);
                }
              }, 100);
            }}
          />
        </div>

        {/* Right Sidebar - Color Palette */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          <ColorPalette 
            onColorSelect={handleColorSelect}
            onColorReplace={handleColorReplace}
            canvas={canvas}
            onHistoryAction={saveToHistory}
          />
        </div>
      </div>
    </div>
  );
}