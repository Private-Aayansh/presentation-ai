import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AppState {
  inputText: string;
  guidance: string;
  llmProvider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  templateFile: File | null;
  templateData: any;
  isProcessing: boolean;
  error: string | null;
  generatedSlides: any[];
  showPreview: boolean;
  processingStep: string;
}

export type AppAction =
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_GUIDANCE'; payload: string }
  | { type: 'SET_LLM_PROVIDER'; payload: 'openai' | 'anthropic' | 'gemini' }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_TEMPLATE_FILE'; payload: File | null }
  | { type: 'SET_TEMPLATE_DATA'; payload: any }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROCESSING_STEP'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GENERATED_SLIDES'; payload: any[] }
  | { type: 'SET_SHOW_PREVIEW'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  inputText: '',
  guidance: '',
  llmProvider: 'openai',
  apiKey: '',
  templateFile: null,
  templateData: null,
  isProcessing: false,
  error: null,
  generatedSlides: [],
  showPreview: false,
  processingStep: ''
};

function appReducer(state: AppState, action: AppAction): AppState {
  console.log(`[${new Date().toISOString()}] appReducer: Action`, action);
  const newState = (() => {
    switch (action.type) {
      case 'SET_INPUT_TEXT':
        return { ...state, inputText: action.payload };
      case 'SET_GUIDANCE':
        return { ...state, guidance: action.payload };
      case 'SET_LLM_PROVIDER':
        return { ...state, llmProvider: action.payload };
      case 'SET_API_KEY':
        return { ...state, apiKey: action.payload };
      case 'SET_TEMPLATE_FILE':
        return { ...state, templateFile: action.payload };
      case 'SET_TEMPLATE_DATA':
        return { ...state, templateData: action.payload };
      case 'SET_PROCESSING':
        return { ...state, isProcessing: action.payload };
      case 'SET_PROCESSING_STEP':
        return { ...state, processingStep: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload, isProcessing: action.payload ? false : state.isProcessing };
      case 'SET_GENERATED_SLIDES':
        return { ...state, generatedSlides: action.payload };
      case 'SET_SHOW_PREVIEW':
        return { ...state, showPreview: action.payload };
      case 'RESET_STATE':
        return { ...initialState, llmProvider: state.llmProvider, apiKey: state.apiKey };
      default:
        return state;
    }
  })();
  console.log(`[${new Date().toISOString()}] appReducer: New state`, newState);
  return newState;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}