import { generateSlideStructure } from './llmService';
import { TemplateData } from './templateParser';

interface GenerationRequest {
  inputText: string;
  guidance: string;
  llmProvider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  templateData: TemplateData | null;
  onProgress: (step: string) => void;
}

export async function generatePresentation(request: GenerationRequest) {
  const { inputText, guidance, llmProvider, apiKey, templateData, onProgress } = request;

  try {
    onProgress('Analyzing your content with AI...');
    
    // Add longer delay to make loading UI clearly visible
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate slide structure using LLM
    const slides = await generateSlideStructure({
      inputText,
      guidance,
      provider: llmProvider,
      apiKey
    });

    onProgress('Applying template styling...');
    
    // Add longer delay for styling step
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply template styling to slides
    const styledSlides = slides.map((slide, index) => {
      let imageForSlide = null;
      let templateImage = null;
      
      // Only apply template styling if template is provided
      if (templateData && templateData.images) {
        const availableImages = Object.keys(templateData.images);
        if (availableImages.length > 0) {
          imageForSlide = availableImages[index % availableImages.length];
          templateImage = templateData.images[imageForSlide];
        }
      }
      
      return {
        ...slide,
        style: {
          colors: templateData?.theme?.colors || ['#1F2937', '#FFFFFF', '#374151', '#6B7280'],
          fonts: templateData?.theme?.fonts || ['Arial', 'Calibri']
        },
        images: imageForSlide ? [imageForSlide] : [],
        templateImage
      };
    });

    onProgress('Finalizing presentation...');

    // Longer final delay before completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      slides: styledSlides,
      templateData
    };

  } catch (error) {
    console.error('Error generating presentation:', error);
    throw error;
  }
}