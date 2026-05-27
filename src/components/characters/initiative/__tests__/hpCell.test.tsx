import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HpCell from '../hpCell';

const HOLD_DELAY = 500;
const COMMIT_DELAY = 1250;

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Element.prototype, 'setPointerCapture').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function getButtons() {
  const buttons = screen.getAllByRole('button');
  return { minus: buttons[0], plus: buttons[buttons.length - 1] };
}

function tap(button: HTMLElement) {
  fireEvent.pointerDown(button, { pointerId: 1 });
  fireEvent.pointerUp(button, { pointerId: 1 });
}

describe('HpCell', () => {
  it('renders hp and maxHp', () => {
    render(<HpCell hp={8} maxHp={10} onCommit={vi.fn()} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();
  });

  it('tap minus decrements hp by 1 and commits after idle', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    tap(getButtons().minus);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(onCommit).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(COMMIT_DELAY));
    expect(onCommit).toHaveBeenCalledWith(7);
  });

  it('tap plus increments hp by 1', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    tap(getButtons().plus);
    expect(screen.getByText('9')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(COMMIT_DELAY));
    expect(onCommit).toHaveBeenCalledWith(9);
  });

  it('clamps hp at 0', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={0} maxHp={10} onCommit={onCommit} />);
    tap(getButtons().minus);
    expect(screen.getByText('0')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(COMMIT_DELAY));
    expect(onCommit).toHaveBeenCalledWith(0);
  });

  it('shows delta badge while pending commit', () => {
    render(<HpCell hp={8} maxHp={10} onCommit={vi.fn()} />);
    tap(getButtons().minus);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('clears delta badge after commit fires', () => {
    render(<HpCell hp={8} maxHp={10} onCommit={vi.fn()} />);
    tap(getButtons().minus);
    act(() => vi.advanceTimersByTime(COMMIT_DELAY));
    expect(screen.queryByText('-1')).not.toBeInTheDocument();
  });

  it('hold fires +10 after delay then commits', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={5} maxHp={20} onCommit={onCommit} />);
    fireEvent.pointerDown(getButtons().plus, { pointerId: 1 });
    act(() => vi.advanceTimersByTime(HOLD_DELAY));
    expect(screen.getByText('15')).toBeInTheDocument();
    fireEvent.pointerUp(getButtons().plus, { pointerId: 1 });
    act(() => vi.advanceTimersByTime(COMMIT_DELAY));
    expect(onCommit).toHaveBeenCalledWith(15);
  });

  it('double-click shows input; blur commits typed value', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    fireEvent.dblClick(screen.getByText('8'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(5);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('Enter key commits typed value', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    fireEvent.dblClick(screen.getByText('8'));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith(3);
  });

  it('Escape key cancels edit without committing', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    fireEvent.dblClick(screen.getByText('8'));
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'Escape' });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('typed value is clamped at 0', () => {
    const onCommit = vi.fn();
    render(<HpCell hp={8} maxHp={10} onCommit={onCommit} />);
    fireEvent.dblClick(screen.getByText('8'));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-5' } });
    fireEvent.blur(screen.getByRole('spinbutton'));
    expect(onCommit).toHaveBeenCalledWith(0);
  });
});
