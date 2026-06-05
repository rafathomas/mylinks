import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }) => React.createElement(React.Fragment, null, children),
    PaymentElement: () => React.createElement('div', { 'data-testid': 'payment-element' }),
    useElements: () => ({}),
    useStripe: () => ({
        confirmPayment: vi.fn(async () => ({})),
    }),
}));
