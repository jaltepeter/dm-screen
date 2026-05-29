import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

const NPC_ADJECTIVES = [
  'Ancient',
  'Ashen',
  'Bitter',
  'Bloated',
  'Brazen',
  'Crooked',
  'Dusty',
  'Feral',
  'Gaunt',
  'Grim',
  'Grizzled',
  'Haggard',
  'Hollow',
  'Iron',
  'Leering',
  'Pale',
  'Ragged',
  'Ruined',
  'Scarred',
  'Stone',
  'Sunken',
  'Twisted',
  'Wild',
  'Wretched'
];
const NPC_NOUNS = [
  'Acolyte',
  'Assassin',
  'Bandit',
  'Brute',
  'Champion',
  'Cultist',
  'Deserter',
  'Enforcer',
  'Exile',
  'Guard',
  'Hunter',
  'Marauder',
  'Mercenary',
  'Priest',
  'Rogue',
  'Scout',
  'Shepherd',
  'Soldier',
  'Thug',
  'Vagabond',
  'Warden'
];

export function rollInitiative(dexMod = 0): number {
  return Math.floor(Math.random() * 20) + 1 + dexMod;
}

export function dexModifier(dex: number): number {
  return Math.floor((dex - 10) / 2);
}

export function randomNpcName(): string {
  const adj = NPC_ADJECTIVES[Math.floor(Math.random() * NPC_ADJECTIVES.length)];
  const noun = NPC_NOUNS[Math.floor(Math.random() * NPC_NOUNS.length)];
  return `${adj} ${noun}`;
}
