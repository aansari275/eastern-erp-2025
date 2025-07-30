import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, Sparkles, ChevronDown, Palette, ChevronRight, Zap, FolderOpen, Settings } from "lucide-react";
import { AIPatternGenerator } from "./AIPatternGenerator";
import { FinalRugUploader } from "./FinalRugUploader";

interface PatternLibraryProps {
  onAIPatternGenerated?: (svgData: string, prompt: string) => void;
  onAutoVectorize?: (imageData: string, fileName: string) => void;
  canvas?: any; // Fabric.js canvas instance
}

export function PatternLibrary({ onAIPatternGenerated, onAutoVectorize, canvas }: PatternLibraryProps) {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showRugRefiner, setShowRugRefiner] = useState(false);
  const [showRugUploader, setShowRugUploader] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['uploads']));
  const [uploadedPatterns, setUploadedPatterns] = useState<string[]>([]);

  // Remove patterns query since Saved Patterns section is removed

  const handleAutoVectorizeClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target?.result as string;
          
          // Add to uploaded patterns for display in library
          setUploadedPatterns(prev => [imageData, ...prev]);
          
          // Ask user if they want AI refinement before vectorization
          const useAIRefinement = confirm(
            "🔧 AI Refinement Available\n\nWould you like to clean up this image with AI before vectorization?\n\n✓ Removes noise and artifacts\n✓ Smooths edges and details\n✓ Enhances pattern clarity\n\nClick OK for AI refinement, or Cancel to vectorize as-is."
          );
          
          if (useAIRefinement) {
            try {
              // Call AI refinement API
              const response = await fetch('/api/refine-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  imageData,
                  prompt: "clean refined rug pattern design, remove noise and dust, smooth edges, high quality textile pattern"
                })
              });
              
              if (response.ok) {
                const { refinedImage } = await response.json();
                onAutoVectorize?.(refinedImage, `refined_${file.name}`);
              } else {
                console.warn('AI refinement failed, using original image');
                onAutoVectorize?.(imageData, file.name);
              }
            } catch (error) {
              console.warn('AI refinement error, using original image:', error);
              onAutoVectorize?.(imageData, file.name);
            }
          } else {
            // Use original image directly
            onAutoVectorize?.(imageData, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const examplePrompts = [
    "floral mughal rug with antique wash",
    "berber geometric neutral tones", 
    "ikat textile with earthy colors",
    "minimalist scandinavian pattern",
    "vintage medallion faded palette",
    "moroccan geometric tiles",
    "art deco golden patterns",
    "japanese wave motifs"
  ];

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };



  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col" data-testid="pattern-library">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Pattern Library</h2>
        
        {/* Main Upload Button */}
        <div className="mb-4">
          <FinalRugUploader
            canvas={canvas}
            onVectorizeComplete={(vectorizedObject, colors) => {
              console.log('Rug upload complete:', { colors });
            }}
          />
        </div>

        {/* Additional Action Buttons */}
        <div className="grid grid-cols-1 gap-2 mb-4">          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className="flex items-center justify-center text-xs"
            data-testid="button-generate-ai"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Generate with AI
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoVectorizeClick}
            className="flex items-center justify-center text-xs"
            data-testid="button-upload-auto-vectorize"
          >
            <Zap className="h-3 w-3 mr-1" />
            Quick Upload (Legacy)
            <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 px-1 rounded">Fast</span>
          </Button>
        </div>



        {/* AI Generator Section */}
        {showAIGenerator && (
          <div className="space-y-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <AIPatternGenerator onPatternGenerated={onAIPatternGenerated} />
            
            {/* Examples Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between text-xs"
                  data-testid="button-examples"
                >
                  <div className="flex items-center">
                    <Palette className="h-3 w-3 mr-1" />
                    🎨 Examples
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {examplePrompts.map((prompt, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => {
                      const input = document.querySelector('[data-testid="input-pattern-prompt"]') as HTMLInputElement;
                      if (input) {
                        input.value = prompt;
                        input.focus();
                        // Trigger change event for React
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }}
                    className="text-xs cursor-pointer hover:bg-primary/10"
                  >
                    {prompt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* My Uploads Section */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('uploads')}
              className="w-full justify-between p-2 h-auto text-left font-medium"
              data-testid="button-toggle-uploads"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>My Uploads</span>
                <span className="text-xs text-slate-500">({uploadedPatterns.length})</span>
              </div>
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.has('uploads') ? 'rotate-90' : ''
                }`} 
              />
            </Button>
            
            {expandedSections.has('uploads') && (
              <div className="ml-4 mt-2 grid grid-cols-2 gap-2">
                {uploadedPatterns.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No uploads yet</p>
                  </div>
                ) : (
                  uploadedPatterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      data-testid={`uploaded-pattern-${index}`}
                    >
                      <img 
                        src={pattern} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>


        </div>
      </ScrollArea>
    </div>
  );
}