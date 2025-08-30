interface LLMRequest {
  inputText: string;
  guidance: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
}

interface SlideStructure {
  title: string;
  content: string[] | string;
  layout: string;
  notes?: string;
}

export async function generateSlideStructure(request: LLMRequest): Promise<SlideStructure[]> {
  const prompt = `
Please analyze the following text and break it down into a well-structured PowerPoint presentation.

Text to analyze:
${request.inputText}

${request.guidance ? `Additional guidance: ${request.guidance}` : ''}

Instructions:
1. Create an appropriate number of slides (typically 5-15) based on the content length and complexity
2. Each slide should have a clear title and organized content
3. Use bullet points for lists, short paragraphs for explanations
4. Include a title slide and conclusion slide where appropriate
5. Consider the guidance provided for tone and structure
6. Generate speaker notes for each slide

Please respond with a JSON array of slide objects. Each slide should have:
- title: string (slide title)
- content: string[] (array of bullet points) or string (paragraph text)
- layout: string ("title", "content", "two-column", "image-content", "conclusion")
- notes: string (speaker notes)

Return only the JSON array, no additional text.
`;

  const response = await callLLM(request.provider, request.apiKey, prompt);
  
  try {
    // Clean and parse the JSON response
    const cleanedResponse = cleanJsonResponse(response);
    console.log('Cleaned response:', cleanedResponse);
    
    const slides = JSON.parse(cleanedResponse);
    console.log('Parsed slides:', slides);
    
    if (Array.isArray(slides) && slides.length > 0) {
      return slides;
    } else {
      console.warn('No valid slides found in response');
      return parseSlideStructureFromText(response);
    }
  } catch (error) {
    console.error('JSON parsing failed:', error);
    console.log('Raw response:', response);
    // Fallback parsing if JSON is malformed
    return parseSlideStructureFromText(response);
  }
}

function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks and any surrounding text
  let cleaned = response;
  
  // Look for JSON content between ```json and ``` markers
  const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  } else {
    // If no markdown blocks, try to find JSON array
    const arrayMatch = cleaned.match(/(\[[\s\S]*\])/);
    if (arrayMatch) {
      cleaned = arrayMatch[1];
    }
  }
  
  // Clean up any remaining markdown or extra text
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');
  
  // Trim whitespace and remove any leading/trailing non-JSON content
  cleaned = cleaned.trim();
  
  // If it doesn't start with [, try to find the first [ and last ]
  if (!cleaned.startsWith('[')) {
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }
  
  return cleaned;
}

async function callLLM(provider: string, apiKey: string, prompt: string): Promise<string> {
  let endpoint = '';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  let body: any = {};

  switch (provider) {
    case 'openai':
      endpoint = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: 'gpt-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      };
      break;

    case 'anthropic':
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: prompt }]
      };
      break;

    case 'gemini':
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7
        }
      };
      break;

    default:
      throw new Error('Unsupported LLM provider');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`LLM API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  // Extract content based on provider
  switch (provider) {
    case 'openai':
      return data.choices[0]?.message?.content || '';
    case 'anthropic':
      return data.content[0]?.text || '';
    case 'gemini':
      return data.candidates[0]?.content?.parts[0]?.text || '';
    default:
      throw new Error('Failed to parse LLM response');
  }
}

function parseSlideStructureFromText(text: string): SlideStructure[] {
  // Fallback parser for when JSON parsing fails
  const slides: SlideStructure[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentSlide: Partial<SlideStructure> = {};
  let inContent = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('Title:') || trimmed.startsWith('Slide')) {
      if (currentSlide.title && currentSlide.content) {
        slides.push(currentSlide as SlideStructure);
      }
      currentSlide = {
        title: trimmed.replace(/^(Title:|Slide \d+:)/, '').trim(),
        content: [],
        layout: 'content'
      };
      inContent = false;
    } else if (trimmed.startsWith('Content:') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
      inContent = true;
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        if (Array.isArray(currentSlide.content)) {
          currentSlide.content.push(trimmed.replace(/^[-•]\s*/, ''));
        } else {
          currentSlide.content = [trimmed.replace(/^[-•]\s*/, '')];
        }
      }
    } else if (inContent && trimmed) {
      if (Array.isArray(currentSlide.content)) {
        currentSlide.content.push(trimmed);
      } else if (typeof currentSlide.content === 'string') {
        currentSlide.content += ' ' + trimmed;
      } else {
        currentSlide.content = trimmed;
      }
    }
  }
  
  if (currentSlide.title && currentSlide.content) {
    slides.push(currentSlide as SlideStructure);
  }
  
  return slides.length > 0 ? slides : [
    {
      title: 'Generated Presentation',
      content: ['Content extracted from your text'],
      layout: 'title'
    }
  ];
}