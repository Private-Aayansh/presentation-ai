# PresentationAI

Transform your text into beautiful PowerPoint presentations with AI-powered intelligence.

## Features

- **Smart Content Analysis**: Automatically breaks down text into well-structured slides
- **Template Style Extraction**: Preserves colors, fonts, and layouts from uploaded PowerPoint templates
- **Multi-LLM Support**: Works with OpenAI, Anthropic Claude, and Google Gemini
- **Secure Processing**: API keys are never stored or logged
- **Professional Output**: Generates production-ready .pptx files

## How It Works

### Text Analysis
The application uses advanced LLM models to analyze your input text and intelligently structure it into presentation slides. The AI considers:

- Content flow and logical groupings
- Appropriate slide count based on text length
- Bullet points vs. paragraph formatting
- Title and conclusion slide placement
- Speaker notes generation

### Style Application
When you upload a PowerPoint template, the app:

1. **Extracts Theme Data**: Parses the .pptx file to extract color schemes, font families, and layout structures
2. **Analyzes Visual Assets**: Identifies and catalogs all images and media files
3. **Maps Styling**: Applies the template's visual identity to generated slides
4. **Reuses Images**: Strategically places template images across slides for visual consistency

## Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/stay-private/presentation-ai
   cd presentation-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the provided localhost URL

## Usage

1. **Enter Your Content**: Paste your text, markdown, or prose into the input area
2. **Provide Guidance** (Optional): Add context like "investor pitch deck" or "technical presentation"
3. **Configure AI**: Choose your LLM provider and enter your API key
4. **Upload Template**: Drag and drop a .pptx or .potx file to extract styling
5. **Generate**: Click generate and wait for AI processing
6. **Download**: Preview and download your formatted presentation

## API Key Requirements

You'll need an API key from one of these providers:

- **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic**: Get your key at [console.anthropic.com](https://console.anthropic.com/)
- **Google**: Get your key at [ai.google.dev](https://ai.google.dev/)

## Technical Limitations

- Maximum file size: 50MB for template uploads
- Supported formats: .pptx and .potx files only
- Processing time: 30-60 seconds depending on content complexity
- No image generation: Only reuses existing template images

## License

MIT License - see LICENSE file for details.

## Security

- API keys are processed client-side only
- No data is stored on servers
- All processing happens in your browser
- Template files are processed locally

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- PptxGenJS for PowerPoint generation
- JSZip for file parsing
- Multiple LLM API integrations