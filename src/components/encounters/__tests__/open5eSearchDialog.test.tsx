import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Open5eSearchDialog from '../open5eSearchDialog';

describe('Open5eSearchDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('aborts in-flight request when query changes', async () => {
    const abortedSignals: AbortSignal[] = [];

    vi.spyOn(global, 'fetch').mockImplementation((_url, options) => {
      return new Promise((_, reject) => {
        const signal = options?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            abortedSignals.push(signal);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }
      });
    });

    render(<Open5eSearchDialog isOpen onClose={vi.fn()} onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText('Monster name…');

    // Type "gob" and let debounce fire — fetch starts
    fireEvent.change(input, { target: { value: 'gob' } });
    await vi.advanceTimersByTimeAsync(350);

    // Change query before fetch resolves — cleanup aborts the "gob" controller
    fireEvent.change(input, { target: { value: 'goblin' } });
    await vi.advanceTimersByTimeAsync(350);

    expect(abortedSignals).toHaveLength(1);
    expect(abortedSignals[0].aborted).toBe(true);
  });

  it('does not throw when unmounted while fetch is in-flight', async () => {
    let capturedSignal: AbortSignal | null = null;

    vi.spyOn(global, 'fetch').mockImplementation((_url, options) => {
      capturedSignal = (options?.signal as AbortSignal) ?? null;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = render(<Open5eSearchDialog isOpen onClose={vi.fn()} onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText('Monster name…');

    fireEvent.change(input, { target: { value: 'goblin' } });
    await vi.advanceTimersByTimeAsync(350);

    expect(capturedSignal).not.toBeNull(); // fetch was called
    expect(() => unmount()).not.toThrow();
    expect(capturedSignal!.aborted).toBe(true); // cleanup aborted the signal on unmount
  });
});
