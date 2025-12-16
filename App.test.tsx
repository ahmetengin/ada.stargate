import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock dependencies that might cause side effects during render
vi.mock('./services/telemetryStream', () => ({
  telemetryStream: {
    subscribe: vi.fn(() => () => {}),
    connect: vi.fn(),
  }
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});