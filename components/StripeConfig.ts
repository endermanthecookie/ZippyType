import { Appearance } from '@stripe/stripe-js';

export const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#6366f1', // Indigo-500
    colorBackground: '#0f172a', // Slate-900
    colorText: '#f8fafc', // Slate-50
    colorDanger: '#f43f5e', // Rose-500
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '12px',
  },
  rules: {
    '.Tab': {
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      boxShadow: 'none',
    },
    '.Tab:hover': {
      borderColor: 'rgba(99, 102, 241, 0.5)',
    },
    '.Tab--selected': {
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
    },
    '.Input': {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
    },
    '.Input:focus': {
      border: '1px solid #6366f1',
      boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
    },
    '.Label': {
      color: '#94a3b8', // Slate-400
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.05em',
    },
    '.Block': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: '12px',
    },
  },
};
