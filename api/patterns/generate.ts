import { VercelRequest, VercelResponse } from '@vercel/node';
import FormData from 'form-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const stabilityApiKey = process.env.STABILITY_API_KEY;
    if (!stabilityApiKey) {
      return res.status(500).json({ message: "Stability AI API key not configured" });
    }

    // Generate pattern using Stability AI
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stabilityApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{
          text: `${prompt}, seamless pattern, tileable, high quality, geometric design, suitable for textiles and rugs`,
          weight: 1
        }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: "tile-texture"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Stability AI API error:', response.status, errorData);
      return res.status(500).json({ message: 'Failed to generate pattern with AI' });
    }

    const result = await response.json();
    const imageBase64 = result.artifacts[0].base64;
    
    // Convert to SVG pattern for seamless tiling
    const patternId = `aiPattern${Date.now()}`;
    const svgData = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${patternId}" x="0" y="0" width="1024" height="1024" patternUnits="userSpaceOnUse">
          <image href="data:image/png;base64,${imageBase64}" x="0" y="0" width="1024" height="1024"/>
        </pattern>
      </defs>
      <rect width="1024" height="1024" fill="url(#${patternId})"/>
    </svg>`;

    res.json({ svgData, prompt });
  } catch (error) {
    console.error('AI pattern generation error:', error);
    res.status(500).json({ message: "Failed to generate pattern" });
  }
}