import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NativeSelect from '@/components/ui/native-select';
import { Character } from '../../store/characterStore';
import { Campaign } from '../../store/campaignStore';

export interface CharacterPatch {
  name: string;
  charClass: string;
  background: string;
  ac: number;
  pp: number;
  pi: number;
  init: number;
  sheetUrl?: string;
  campaignId?: string;
}

interface CharacterEditDialogProps {
  open: boolean;
  character: Character | null;
  campaigns: Campaign[];
  defaultCampaignId?: string;
  onClose: () => void;
  onSave: (patch: CharacterPatch) => void;
}

function CharacterEditForm({
  character,
  campaigns,
  defaultCampaignId,
  onClose,
  onSave
}: Omit<CharacterEditDialogProps, 'open'>) {
  const isNew = character === null;
  const [name, setName] = useState(character?.name ?? '');
  const [charClass, setCharClass] = useState(character?.charClass ?? '');
  const [background, setBackground] = useState(character?.background ?? '');
  const [ac, setAc] = useState(String(character?.ac ?? 10));
  const [pp, setPp] = useState(String(character?.pp ?? 10));
  const [pi, setPi] = useState(String(character?.pi ?? 10));
  const [init, setInit] = useState(String(character?.init ?? 0));
  const [sheetUrl, setSheetUrl] = useState(character?.sheetUrl ?? '');
  const [campaignId, setCampaignId] = useState(character?.campaignId ?? defaultCampaignId ?? '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      charClass: charClass.trim(),
      background: background.trim(),
      ac: Number(ac) || 0,
      pp: Number(pp) || 0,
      pi: Number(pi) || 0,
      init: Number(init) || 0,
      sheetUrl: sheetUrl.trim() || undefined,
      campaignId: campaignId || undefined
    });
    onClose();
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <Label htmlFor='char-name'>Name</Label>
        <Input
          id='char-name'
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder='Bruenor'
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='char-class'>Class</Label>
          <Input
            id='char-class'
            value={charClass}
            onChange={(e) => setCharClass(e.target.value)}
            placeholder='Fighter'
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='char-background'>Background</Label>
          <Input
            id='char-background'
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder='Soldier'
          />
        </div>
      </div>

      <div className='grid grid-cols-4 gap-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='char-ac'>AC</Label>
          <Input
            id='char-ac'
            type='number'
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            className='tabular-nums'
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='char-pp'>PP</Label>
          <Input
            id='char-pp'
            type='number'
            value={pp}
            onChange={(e) => setPp(e.target.value)}
            className='tabular-nums'
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='char-pi'>PI</Label>
          <Input
            id='char-pi'
            type='number'
            value={pi}
            onChange={(e) => setPi(e.target.value)}
            className='tabular-nums'
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='char-init'>Init</Label>
          <Input
            id='char-init'
            type='number'
            value={init}
            onChange={(e) => setInit(e.target.value)}
            className='tabular-nums'
          />
        </div>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='char-sheet'>Sheet URL</Label>
        <Input
          id='char-sheet'
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder='https://dndbeyond.com/...'
          className='text-sm'
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='char-campaign'>Campaign</Label>
        <NativeSelect
          id='char-campaign'
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className='w-full'>
          <option value=''>Unassigned</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function CharacterEditDialog({
  open,
  character,
  campaigns,
  defaultCampaignId,
  onClose,
  onSave
}: CharacterEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{character === null ? 'New Character' : 'Edit Character'}</DialogTitle>
        </DialogHeader>
        {open && (
          <CharacterEditForm
            character={character}
            campaigns={campaigns}
            defaultCampaignId={defaultCampaignId}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
