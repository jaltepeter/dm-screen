import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InitiativeSetupDialog from '../initiativeSetupDialog';
import { useCharacterStore } from '../../../../store/characterStore';
import { useEncounterStore } from '../../../../store/encounterStore';
import type { Actor } from '../../../../lib/sync';

beforeEach(() => {
  useCharacterStore.setState({
    characters: [
      {
        id: '1',
        name: 'Gandalf',
        charClass: 'Wizard',
        background: '',
        ac: 12,
        pp: 14,
        pi: 14,
        init: 0
      },
      {
        id: '2',
        name: 'Bilbo',
        charClass: 'Rogue',
        background: '',
        ac: 13,
        pp: 13,
        pi: 11,
        init: 0
      }
    ]
  });
  useEncounterStore.setState({
    statBlocks: [{ id: 'sb1', name: 'Goblin', hp: 7 }],
    templates: [
      {
        id: 't1',
        name: 'Goblin Ambush',
        entries: [
          { id: 'e1', statBlockId: 'sb1', instanceName: 'Goblin 1' },
          { id: 'e2', statBlockId: 'sb1', instanceName: 'Goblin 2' }
        ]
      }
    ]
  });
});

describe('InitiativeSetupDialog', () => {
  it('sorts actors by initiative descending when starting', () => {
    const onStart = vi.fn();
    render(<InitiativeSetupDialog isOpen onStartInitiative={onStart} handleClose={vi.fn()} />);

    // Players render in store order: Gandalf first, Bilbo second
    const initInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(initInputs[0], { target: { value: '10' } }); // Gandalf
    fireEvent.change(initInputs[1], { target: { value: '15' } }); // Bilbo

    fireEvent.click(screen.getByText('Load'));

    expect(onStart).toHaveBeenCalledOnce();
    const sorted = onStart.mock.calls[0][0] as Actor[];
    expect(sorted[0].name).toBe('Bilbo'); // init 15 — first
    expect(sorted[1].name).toBe('Gandalf'); // init 10 — second
  });

  it('loading an encounter populates NPCs from the template', () => {
    render(<InitiativeSetupDialog isOpen onStartInitiative={vi.fn()} handleClose={vi.fn()} />);

    // Select the encounter template
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't1' } });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Template NPCs should now appear as editable name inputs
    expect(screen.getByDisplayValue('Goblin 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Goblin 2')).toBeInTheDocument();
  });

  it('loading an encounter replaces previous NPCs but keeps players', () => {
    render(<InitiativeSetupDialog isOpen onStartInitiative={vi.fn()} handleClose={vi.fn()} />);

    // Load once
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't1' } });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Load again — should not double-up NPCs
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(screen.getAllByDisplayValue('Goblin 1')).toHaveLength(1);

    // Players still present (rendered as text spans, not inputs)
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
    expect(screen.getByText('Bilbo')).toBeInTheDocument();
  });

  it('refreshes player list when dialog is closed and reopened', () => {
    const { rerender } = render(
      <InitiativeSetupDialog isOpen onStartInitiative={vi.fn()} handleClose={vi.fn()} />
    );

    expect(screen.getByText('Gandalf')).toBeInTheDocument();
    expect(screen.getByText('Bilbo')).toBeInTheDocument();

    rerender(
      <InitiativeSetupDialog isOpen={false} onStartInitiative={vi.fn()} handleClose={vi.fn()} />
    );

    // Add Meepo while the dialog is closed
    useCharacterStore.setState({
      characters: [
        {
          id: '1',
          name: 'Gandalf',
          charClass: 'Wizard',
          background: '',
          ac: 12,
          pp: 14,
          pi: 14,
          init: 0
        },
        {
          id: '2',
          name: 'Bilbo',
          charClass: 'Rogue',
          background: '',
          ac: 13,
          pp: 13,
          pi: 11,
          init: 0
        },
        {
          id: '3',
          name: 'Meepo',
          charClass: 'Sorcerer',
          background: '',
          ac: 10,
          pp: 10,
          pi: 8,
          init: 0
        }
      ]
    });

    rerender(<InitiativeSetupDialog isOpen onStartInitiative={vi.fn()} handleClose={vi.fn()} />);

    expect(screen.getByText('Gandalf')).toBeInTheDocument();
    expect(screen.getByText('Bilbo')).toBeInTheDocument();
    expect(screen.getByText('Meepo')).toBeInTheDocument();
  });
});
