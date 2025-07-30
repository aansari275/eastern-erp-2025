import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
  disabled?: boolean
}

export function ColorPicker({ color, onChange, className, disabled }: ColorPickerProps) {
  const [internalColor, setInternalColor] = React.useState(color)

  React.useEffect(() => {
    setInternalColor(color)
  }, [color])

  const handleColorChange = (newColor: string) => {
    setInternalColor(newColor)
    onChange(newColor)
  }

  const presetColors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#6b7280",
    "#374151", "#111827", "#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-8 h-8 p-0 border-2 rounded-md",
            className
          )}
          style={{ backgroundColor: internalColor }}
          disabled={disabled}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
            <div className="flex space-x-2">
              <div
                className="w-12 h-8 rounded border border-slate-300 dark:border-slate-600"
                style={{ backgroundColor: internalColor }}
              />
              <Input
                type="color"
                value={internalColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Hex Value</Label>
            <Input
              value={internalColor}
              onChange={(e) => {
                const value = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setInternalColor(value)
                }
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                  onChange(value)
                }
              }}
              placeholder="#000000"
              className="text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleColorChange(preset)}
                  className={cn(
                    "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                    internalColor.toLowerCase() === preset.toLowerCase()
                      ? "border-slate-900 dark:border-slate-100"
                      : "border-slate-300 dark:border-slate-600"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}