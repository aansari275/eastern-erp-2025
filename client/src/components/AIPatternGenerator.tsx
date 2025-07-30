import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIPatternGeneratorProps {
  onPatternGenerated?: (svgData: string, prompt: string) => void;
}

export function AIPatternGenerator({ onPatternGenerated }: AIPatternGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/patterns/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate pattern");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onPatternGenerated?.(data.svgData, data.prompt);
      setPrompt("");
      toast({
        title: "AI Pattern Generated!",
        description: "Your custom pattern created with Stability AI is ready to use!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation Failed", 
        description: error.message || "Failed to generate pattern. Please check your API key and try again.",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt Required",
        description: "Please enter a description for your pattern.",
      });
      return;
    }
    
    generateMutation.mutate(prompt);
  };



  return (
    <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700" data-testid="ai-pattern-generator">
      <div className="flex items-center mb-2">
        <Wand2 className="h-4 w-4 text-purple-500 mr-2" />
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Generator</span>
      </div>
      
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Describe your pattern..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          className="text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-purple-500 focus:border-purple-500"
          disabled={generateMutation.isPending}
          data-testid="input-pattern-prompt"
        />
        
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !prompt.trim()}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
          data-testid="button-generate-pattern"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Creating with AI...
            </>
          ) : (
            <>
              <Wand2 className="h-3 w-3 mr-1" />
              Generate with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
