import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCombatantDialog from '../addCombatantDialog';
import { useEncounterStore } from '../../../../store/encounterStore';
import type { Actor } from '../../../../lib/sync';

const STAT_BLOCKS = [
  { id: 'sb1', name: 'Goblin', hp: 7, dex: 14 },
  { id: 'sb2', name: 'Troll', hp: 84, dex: 8 }
];

beforeEach(() => {
  useEncounterStore.setState({ statBlocks: STAT_BLOCKS, templates: [] });
});

describe('AddCombatantDialog', () => {
  it('Add button is disabled when name is empty', () => {
    render(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={vi.fn()} />);
    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('calls onAdd with a well-formed NPC actor', () => {
    const onAdd = vi.fn();
    render(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test NPC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledOnce();
    const actors = onAdd.mock.calls[0][0] as Actor[];
    expect(actors).toHaveLength(1);
    const actor = actors[0];
    expect(actor.name).toBe('Test NPC');
    expect(actor.kind).toBe('npc');
    expect(actor.active).toBe(true);
    expect(actor.conditions).toEqual([]);
    expect(typeof actor.id).toBe('string');
    expect(typeof actor.init).toBe('number');
  });

  it('picking a stat block sets name, max HP, and statBlockId', () => {
    const onAdd = vi.fn();
    render(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.click(screen.getByRole('button', { name: /pick stat block/i }));
    fireEvent.click(screen.getByText('Goblin'));

    expect(screen.getByRole('textbox')).toHaveValue('Goblin');
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(Number(spinbuttons[1].getAttribute('value'))).toBe(7); // Max HP

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const actors = onAdd.mock.calls[0][0] as Actor[];
    expect(actors[0].statBlockId).toBe('sb1');
    expect(actors[0].maxHp).toBe(7);
  });

  it('no statBlockId on actor when no stat block selected', () => {
    const onAdd = vi.fn();
    render(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Minion' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    const actors = onAdd.mock.calls[0][0] as Actor[];
    expect(actors[0].statBlockId).toBeUndefined();
  });

  it('draft resets after adding so the dialog is fresh next open', () => {
    const onAdd = vi.fn();
    const { rerender } = render(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'One-shot NPC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    // Reopen
    rerender(<AddCombatantDialog isOpen onClose={vi.fn()} onAdd={onAdd} />);
    expect(screen.getByRole('textbox')).not.toHaveValue('One-shot NPC');
  });
});
