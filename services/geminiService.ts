
import { GoogleGenAI } from "@google/genai";
import { ModelType, MaterialType, Resolution } from "../types";

export class GeminiService {
  /**
   * Generates a texture using Gemini Image models.
   */
  static async generateTexture(
    model: ModelType,
    sourceImageBase64: string | null,
    prompt: string,
    resolution: Resolution = '1K',
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    if (sourceImageBase64) {
      const base64Data = sourceImageBase64.includes(',') 
        ? sourceImageBase64.split(',')[1] 
        : sourceImageBase64;
      
      if (base64Data) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        });
      }
    }
    
    parts.push({ text: prompt });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: {
          systemInstruction: "You are an expert AI texture artist for architectural visualization. Your primary function is to generate high-fidelity, SEAMLESS, and TILEABLE PBR textures. You MUST always output an image part. Do not respond with text alone unless it is absolutely impossible to generate the image. If you cannot generate the image due to safety, explain why briefly. Otherwise, transform the input into a professional top-down texture.",
          imageConfig: {
            aspectRatio,
            ...(model === ModelType.PRO ? { imageSize: resolution } : {})
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          ]
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("No response from AI engine.");

      if (candidate.finishReason === 'SAFETY') {
        throw new Error("Generation blocked by safety filters. Try a different material or simpler crop.");
      }

      if (candidate.finishReason === 'IMAGE_RECITATION') {
        throw new Error("Image recitation detected. The model found this pattern too close to existing copyrighted material. Please try a different crop or prompt.");
      }

      let textContent = "";
      for (const part of candidate.content.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textContent += part.text;
        }
      }

      // If we got here, it means no image part was found.
      if (textContent) {
        throw new Error(`AI Feedback: ${textContent}`);
      }

      throw new Error("Model failed to generate image data. This often happens with complex patterns. Please try again with a different crop.");
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Texture generation failed.");
    }
  }

  static buildAlbedoPrompt(material: MaterialType): string {
    return `Generate a professional PBR Albedo (Diffuse) texture of ${material}. 
    Instruction: Using the provided reference as a guide, reconstruct it into a 100% SEAMLESS and TILEABLE architectural texture.
    - View: Orthographic, flat, top-down perspective.
    - Lighting: Purely diffuse with ZERO shadows or highlights.
    - Quality: High-resolution detail capturing realistic grain and surface features.
    - Tiling: Ensure the left/right and top/bottom edges align perfectly for repeated use in 3D.
    - Content: Only the material surface. Remove all perspective, objects, or environmental context.`;
  }

  static buildPBRMapPrompt(mapType: string, material: MaterialType): string {
    const mapDescriptions: Record<string, string> = {
      'Roughness': 'Create a grayscale roughness map. Lighter values represent rough areas, darker values represent smooth/glossy areas.',
      'Normal': 'Generate a standard PBR Normal map (violet/blue palette) representing surface surface micro-relief and bumps.',
      'Height': 'Create a grayscale displacement/height map. White represents high areas, black represents low areas.',
      'AO': 'Generate an Ambient Occlusion map focusing on micro-shadows in crevices and pits.',
      'Metalness': 'Create a metalness mask. Pure black for non-metals, pure white for metal parts.'
    };

    return `Convert the provided Albedo texture into a professional PBR ${mapType} map for ${material}.
    Requirement: ${mapDescriptions[mapType]}.
    Maintain 100% alignment with the original albedo and ensure the result remains SEAMLESS and TILEABLE.`;
  }
}
