import { useState } from 'react';
import TurndownService from 'turndown';
import { StatBlock } from '../../store/encounterStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SectionHeader from '@/components/ui/section-header';

interface Props {
  statBlock: StatBlock;
  onChange: (updated: StatBlock) => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className='space-y-1'>
      <Label className='text-xs'>{label}</Label>
      <Input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-7 text-sm px-2'
      />
    </div>
  );
}

const td = new TurndownService({ headingStyle: 'atx' });
td.addRule('flatten-headings', {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  replacement: (content) => `\n\n## ${content}\n\n`
});
td.addRule('ddb-section-headings', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node as Element).classList?.contains('mon-stat-block__description-block-heading'),
  replacement: (content) => `\n\n## ${content.trim()}\n\n`
});
function htmlToMarkdown(html: string): string {
  let md = td.turndown(html).trim();
  // DDB often puts trait names in their own <p>: "***Name.***\n\nDesc" → "***Name.*** Desc"
  md = md.replace(/(\*{2,3}[^*\n]+\*{2,3})\n\n([^#\n])/g, '$1 $2');
  return md;
}

export default function StatBlockEditorPanel({ statBlock: sb, onChange }: Props) {
  const [ddbPaste, setDdbPaste] = useState(false);
  const set = (patch: Partial<StatBlock>) => onChange({ ...sb, ...patch });
  const setNum = (field: keyof StatBlock, raw: string) => {
    const n = raw === '' ? undefined : Number(raw);
    if (n === undefined || !Number.isNaN(n)) set({ [field]: n });
  };
  const setStr = (field: keyof StatBlock, raw: string) => {
    set({ [field]: raw || undefined });
  };

  return (
    <div className='flex flex-col gap-4 p-4 overflow-y-auto h-full'>
      {/* Identity */}
      <section className='space-y-2'>
        <SectionHeader>Identity</SectionHeader>
        <Field label='Name' value={sb.name} onChange={(v) => set({ name: v || 'New Creature' })} />
        <div className='grid grid-cols-2 gap-2'>
          <Field
            label='Size'
            value={sb.size}
            onChange={(v) => setStr('size', v)}
            placeholder='Medium'
          />
          <Field
            label='Creature Type'
            value={sb.creatureType}
            onChange={(v) => setStr('creatureType', v)}
            placeholder='Humanoid (Goblinoid)'
          />
        </div>
      </section>

      {/* Combat */}
      <section className='space-y-2'>
        <SectionHeader>Combat</SectionHeader>
        <div className='grid grid-cols-2 gap-2'>
          <Field
            label='AC'
            value={sb.ac}
            type='number'
            onChange={(v) => setNum('ac', v)}
            placeholder='15'
          />
          <Field
            label='AC Description'
            value={sb.acDesc}
            onChange={(v) => setStr('acDesc', v)}
            placeholder='natural armor'
          />
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <Field
            label='HP'
            value={sb.hp}
            type='number'
            onChange={(v) => setNum('hp', v)}
            placeholder='52'
          />
          <Field
            label='Hit Dice'
            value={sb.hitDice}
            onChange={(v) => setStr('hitDice', v)}
            placeholder='8d8+16'
          />
        </div>
        <Field
          label='Speed'
          value={sb.speed}
          onChange={(v) => setStr('speed', v)}
          placeholder='Walk 30 ft., Fly 60 ft.'
        />
      </section>

      {/* Ability Scores */}
      <section className='space-y-2'>
        <SectionHeader>Ability Scores</SectionHeader>
        <div className='grid grid-cols-6 gap-1'>
          {(
            [
              ['STR', 'str'],
              ['DEX', 'dex'],
              ['CON', 'con'],
              ['INT', 'int'],
              ['WIS', 'wis'],
              ['CHA', 'cha']
            ] as [string, keyof StatBlock][]
          ).map(([label, field]) => (
            <div key={field} className='space-y-1'>
              <Label className='text-xs'>{label}</Label>
              <Input
                type='number'
                value={sb[field] ?? ''}
                onChange={(e) => setNum(field, e.target.value)}
                className='h-7 text-sm px-1 text-center'
              />
            </div>
          ))}
        </div>
      </section>

      {/* Proficiencies */}
      <section className='space-y-2'>
        <SectionHeader>Proficiencies &amp; Properties</SectionHeader>
        <Field
          label='Proficiency Bonus'
          value={sb.proficiencyBonus?.toString()}
          onChange={(v) => setNum('proficiencyBonus', v)}
          placeholder='2'
        />
        <Field
          label='Saving Throws'
          value={sb.savingThrows}
          onChange={(v) => setStr('savingThrows', v)}
          placeholder='CON +10, INT +12'
        />
        <Field
          label='Skills'
          value={sb.skills}
          onChange={(v) => setStr('skills', v)}
          placeholder='Arcana +19, Stealth +3'
        />
        <Field
          label='Damage Vulnerabilities'
          value={sb.damageVulnerabilities}
          onChange={(v) => setStr('damageVulnerabilities', v)}
        />
        <Field
          label='Damage Resistances'
          value={sb.damageResistances}
          onChange={(v) => setStr('damageResistances', v)}
        />
        <Field
          label='Damage Immunities'
          value={sb.damageImmunities}
          onChange={(v) => setStr('damageImmunities', v)}
        />
        <Field
          label='Condition Immunities'
          value={sb.conditionImmunities}
          onChange={(v) => setStr('conditionImmunities', v)}
        />
        <Field
          label='Senses'
          value={sb.senses}
          onChange={(v) => setStr('senses', v)}
          placeholder='Darkvision 60 ft., Passive Perception 10'
        />
        <Field
          label='Languages'
          value={sb.languages}
          onChange={(v) => setStr('languages', v)}
          placeholder='Common, Goblin'
        />
      </section>

      {/* Reference */}
      <section className='space-y-2'>
        <SectionHeader>Reference</SectionHeader>
        <Field
          label='Source URL'
          value={sb.sourceUrl}
          onChange={(v) => setStr('sourceUrl', v)}
          placeholder='https://dndbeyond.com/monsters/...'
        />
      </section>

      {/* Body */}
      <section className='space-y-2 flex-1'>
        <div className='flex items-center justify-between'>
          <SectionHeader>Traits, Actions &amp; Abilities (Markdown)</SectionHeader>
          <label className='flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none'>
            <Switch checked={ddbPaste} onCheckedChange={setDdbPaste} className='scale-75' />
            DDB paste
          </label>
        </div>
        <Textarea
          value={sb.body ?? ''}
          onChange={(e) => set({ body: e.target.value || undefined })}
          onPaste={(e) => {
            if (!ddbPaste || !e.clipboardData.types.includes('text/html')) return;
            e.preventDefault();
            const markdown = htmlToMarkdown(e.clipboardData.getData('text/html'));
            const ta = e.currentTarget;
            const before = (sb.body ?? '').slice(0, ta.selectionStart);
            const after = (sb.body ?? '').slice(ta.selectionEnd);
            set({ body: before + markdown + after || undefined });
          }}
          placeholder={
            '## Traits\n**Nimble Escape.** The goblin can...\n\n## Actions\n**Shortsword.** Melee Weapon Attack: +4 to hit...'
          }
          className='text-sm font-mono min-h-64 resize-none'
        />
      </section>
    </div>
  );
}
