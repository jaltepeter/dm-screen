import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { StatBlock } from '../../store/encounterStore';
import { formatBonus } from '@/lib/utils';

interface Open5eCreature {
  key: string;
  name: string;
  document: { name: string; permalink: string };
  type: { name: string };
  size: { name: string };
  armor_class: number;
  armor_detail: string;
  hit_points: number;
  hit_dice: string;
  speed_all: {
    unit: string;
    walk: number;
    fly: number;
    burrow: number;
    climb: number;
    swim: number;
    hover: boolean;
  };
  ability_scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  saving_throws: Record<string, number>;
  skill_bonuses: Record<string, number>;
  passive_perception: number;
  darkvision_range: number | null;
  blindsight_range: number | null;
  tremorsense_range: number | null;
  truesight_range: number | null;
  resistances_and_immunities: {
    damage_immunities_display: string;
    damage_resistances_display: string;
    damage_vulnerabilities_display: string;
    condition_immunities_display: string;
  };
  languages: { as_string: string };
  proficiency_bonus: number | null;
  actions: {
    name: string;
    desc: string;
    action_type: 'ACTION' | 'BONUS_ACTION' | 'REACTION' | 'LEGENDARY_ACTION';
    order_in_statblock: number;
    legendary_action_cost: number | null;
  }[];
  traits: { name: string; desc: string }[];
}

const SAVE_ABBREVS: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA'
};

function buildSpeed(s: Open5eCreature['speed_all']): string | undefined {
  const u = s.unit === 'feet' ? 'ft.' : s.unit;
  const parts: string[] = [];
  if (s.walk) parts.push(`Walk ${s.walk} ${u}`);
  if (s.fly) parts.push(`Fly ${s.fly} ${u}`);
  if (s.climb) parts.push(`Climb ${s.climb} ${u}`);
  if (s.swim) parts.push(`Swim ${s.swim} ${u}`);
  if (s.burrow) parts.push(`Burrow ${s.burrow} ${u}`);
  return parts.length ? parts.join(', ') : undefined;
}

function buildSaves(saves: Record<string, number>): string | undefined {
  const parts = Object.entries(saves).map(
    ([k, v]) => `${SAVE_ABBREVS[k] ?? k.toUpperCase()} ${formatBonus(v)}`
  );
  return parts.length ? parts.join(', ') : undefined;
}

function buildSkills(skills: Record<string, number>): string | undefined {
  const capitalize = (s: string) =>
    s
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  const parts = Object.entries(skills).map(([k, v]) => `${capitalize(k)} ${formatBonus(v)}`);
  return parts.length ? parts.join(', ') : undefined;
}

function buildSenses(m: Open5eCreature): string | undefined {
  const parts: string[] = [];
  if (m.blindsight_range) parts.push(`Blindsight ${m.blindsight_range} ft.`);
  if (m.darkvision_range) parts.push(`Darkvision ${m.darkvision_range} ft.`);
  if (m.tremorsense_range) parts.push(`Tremorsense ${m.tremorsense_range} ft.`);
  if (m.truesight_range) parts.push(`Truesight ${m.truesight_range} ft.`);
  parts.push(`Passive Perception ${m.passive_perception}`);
  return parts.join(', ');
}

function buildBody(m: Open5eCreature): string | undefined {
  const sections: string[] = [];

  const pushSection = (heading: string, entries: { name: string; desc: string }[]) => {
    if (!entries.length) return;
    sections.push(`## ${heading}`);
    entries.forEach((e) => sections.push(`**${e.name}.** ${e.desc}`));
  };

  const byType = (type: Open5eCreature['actions'][number]['action_type']) =>
    m.actions
      .filter((a) => a.action_type === type)
      .sort((a, b) => a.order_in_statblock - b.order_in_statblock);

  pushSection('Traits', m.traits);
  pushSection('Actions', byType('ACTION'));
  pushSection('Bonus Actions', byType('BONUS_ACTION'));
  pushSection('Reactions', byType('REACTION'));
  pushSection('Legendary Actions', byType('LEGENDARY_ACTION'));

  return sections.length ? sections.join('\n\n') : undefined;
}

function toStatBlock(m: Open5eCreature): Omit<StatBlock, 'id'> {
  const ri = m.resistances_and_immunities;

  return {
    name: m.name,
    size: m.size.name || undefined,
    creatureType: m.type.name || undefined,
    proficiencyBonus: m.proficiency_bonus ?? undefined,
    ac: m.armor_class,
    acDesc: m.armor_detail || undefined,
    hp: m.hit_points,
    hitDice: m.hit_dice || undefined,
    speed: buildSpeed(m.speed_all),
    str: m.ability_scores.strength,
    dex: m.ability_scores.dexterity,
    con: m.ability_scores.constitution,
    int: m.ability_scores.intelligence,
    wis: m.ability_scores.wisdom,
    cha: m.ability_scores.charisma,
    savingThrows: buildSaves(m.saving_throws),
    skills: buildSkills(m.skill_bonuses),
    damageVulnerabilities: ri.damage_vulnerabilities_display || undefined,
    damageResistances: ri.damage_resistances_display || undefined,
    damageImmunities: ri.damage_immunities_display || undefined,
    conditionImmunities: ri.condition_immunities_display || undefined,
    senses: buildSenses(m),
    languages: m.languages.as_string || undefined,
    sourceUrl: m.document.permalink || undefined,
    body: buildBody(m)
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (partial: Omit<StatBlock, 'id'>) => void;
}

export default function Open5eSearchDialog({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Open5eCreature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.open5e.com/v2/creatures/?document__key__iexact=srd-2014&name__icontains=${encodeURIComponent(
            query.trim()
          )}&limit=20`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Could not reach Open5e. Check your connection.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (m: Open5eCreature) => {
    onSelect(toStatBlock(m));
    handleClose();
  };

  const showResults = query.trim().length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-w-3xl sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Search Open5e</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <Input
            autoFocus
            placeholder='Monster name…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className='min-h-48 max-h-96 overflow-y-auto'>
            {showResults && loading && (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            )}
            {showResults && error && (
              <p className='text-sm text-destructive py-4 text-center'>{error}</p>
            )}
            {showResults && !loading && !error && results.length === 0 && (
              <p className='text-sm text-muted-foreground py-4 text-center'>No results.</p>
            )}
            {showResults &&
              !loading &&
              results.map((m) => (
                <Button
                  key={m.key}
                  variant='ghost'
                  className='w-full justify-start h-auto py-2 px-3'
                  onClick={() => handleSelect(m)}>
                  <span className='flex flex-col items-start gap-0.5'>
                    <span className='font-medium'>{m.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      HP {m.hit_points} · AC {m.armor_class} · {m.size.name} {m.type.name} ·{' '}
                      {m.document.name}
                    </span>
                  </span>
                </Button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
