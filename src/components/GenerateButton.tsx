import React from 'react';
import { Wand2, Download, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generatePresentation } from '../utils/presentationGenerator';

export function GenerateButton() {
  const { state, dispatch } = useApp();

  const canGenerate = state.inputText.trim() && state.apiKey;

  const handleGenerate = async () => {
    if (!canGenerate || state.isProcessing) return;

    console.log('Generate button clicked, starting process...');
    
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('Processing state set to true, isProcessing:', true);
      
      const result = await generatePresentation({
        inputText: state.inputText,
        guidance: state.guidance,
        llmProvider: state.llmProvider,
        apiKey: state.apiKey,
        templateData: state.templateData || null,
        onProgress: (step: string) => {
          console.log('Progress step:', step);
          dispatch({ type: 'SET_PROCESSING_STEP', payload: step });
        }
      });

      dispatch({ type: 'SET_GENERATED_SLIDES', payload: result.slides });
      dispatch({ type: 'SET_SHOW_PREVIEW', payload: true });
      
    } catch (error) {
      console.error('Generation error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate presentation'
      });
    } finally {
      console.log('Setting processing to false');
      dispatch({ type: 'SET_PROCESSING', payload: false });
      dispatch({ type: 'SET_PROCESSING_STEP', payload: '' });
    }
  };

  console.log('Current state - isProcessing:', state.isProcessing, 'canGenerate:', canGenerate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Presentation</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Ready to Generate?</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center space-x-2 ${state.inputText.trim() ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${state.inputText.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Content provided</span>
            </div>
            <div className={`flex items-center space-x-2 ${state.apiKey ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${state.apiKey ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>API key configured</span>
            </div>
            <div className={`flex items-center space-x-2 ${state.templateData ? 'text-green-600' : 'text-blue-500'}`}>
              <div className={`w-2 h-2 rounded-full ${state.templateData ? 'bg-green-500' : 'bg-blue-400'}`} />
              <span>{state.templateData ? 'Template analyzed' : 'Default styling (no template)'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || state.isProcessing}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            state.isProcessing
              ? 'bg-blue-500 text-white cursor-wait'
              : canGenerate
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {state.isProcessing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="animate-pulse">Generating Presentation...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              <span>Generate Presentation</span>
            </>
          )}
        </button>

        {state.generatedSlides.length > 0 && !state.isProcessing && (
          <button
            onClick={() => dispatch({ type: 'SET_SHOW_PREVIEW', payload: true })}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>View & Download</span>
          </button>
        )}
      </div>
    </div>
  );
}