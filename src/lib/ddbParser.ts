import TurndownService from 'turndown';
import { StatBlock } from '../store/encounterStore';

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
td.addRule('italic-links', {
  filter: (node) => node.nodeName === 'A' && (node as HTMLElement).style?.fontStyle === 'italic',
  replacement: (content, node) => {
    const href = (node as HTMLElement).getAttribute('href') ?? '';
    return href ? `*[${content}](${href})*` : `*${content}*`;
  }
});

export function htmlToMarkdown(html: string): string {
  let md = td.turndown(html).trim();
  md = md.replace(/(\*{2,3}[^*\n]+\*{2,3})\n\n([^#\n])/g, '$1 $2');
  return md;
}

export function parseDdbStatBlock(html: string): Omit<StatBlock, 'id'> | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc.querySelector('.mon-stat-block') && !doc.querySelector('.mon-stat-block__header')) {
    return null;
  }

  const text = (sel: string) => doc.querySelector(sel)?.textContent?.trim() ?? '';

  const nameLink = doc.querySelector('a.mon-stat-block__name-link');
  const name = nameLink?.textContent?.trim() || 'New Creature';
  const href = nameLink?.getAttribute('href') ?? '';
  const sourceUrl = href
    ? href.startsWith('http')
      ? href
      : `https://www.dndbeyond.com${href}`
    : undefined;

  const meta = text('.mon-stat-block__meta').split(',')[0].trim();
  const spaceIdx = meta.indexOf(' ');
  const size = spaceIdx > -1 ? meta.slice(0, spaceIdx) : undefined;
  const creatureType = spaceIdx > -1 ? meta.slice(spaceIdx + 1).trim() : undefined;

  let ac: number | undefined, acDesc: string | undefined;
  let hp = 0,
    hitDice: string | undefined;
  let speed: string | undefined;

  doc.querySelectorAll('.mon-stat-block__attribute').forEach((el) => {
    const label = el.querySelector('.mon-stat-block__attribute-label')?.textContent?.trim();
    const val = el.querySelector('.mon-stat-block__attribute-data-value')?.textContent?.trim();
    const extra = el
      .querySelector('.mon-stat-block__attribute-data-extra')
      ?.textContent?.trim()
      .replace(/[()]/g, '')
      .trim();
    if (label === 'Armor Class') {
      ac = val ? parseInt(val) : undefined;
      acDesc = extra || undefined;
    } else if (label === 'Hit Points') {
      hp = val ? parseInt(val) : 0;
      hitDice = extra || undefined;
    } else if (label === 'Speed') {
      speed = val || undefined;
    }
  });

  const score = (s: string) => {
    const v = doc
      .querySelector(`.ability-block__stat--${s} .ability-block__score`)
      ?.textContent?.trim();
    return v ? parseInt(v) : undefined;
  };

  const tidbits: Record<string, string> = {};
  doc.querySelectorAll('.mon-stat-block__tidbit').forEach((el) => {
    const label = el.querySelector('.mon-stat-block__tidbit-label')?.textContent?.trim();
    const data = el
      .querySelector('.mon-stat-block__tidbit-data')
      ?.textContent?.trim()
      .replace(/\s+/g, ' ');
    if (label && data) tidbits[label] = data;
  });
  const td2 = (key: string) => tidbits[key] || undefined;
  const profBonus = td2('Proficiency Bonus');

  const descEl = doc.querySelector('.mon-stat-block__description-blocks');
  const body = descEl ? htmlToMarkdown(descEl.outerHTML) || undefined : undefined;

  return {
    name,
    size,
    creatureType,
    sourceUrl,
    ac,
    acDesc,
    hp,
    hitDice,
    speed,
    str: score('str'),
    dex: score('dex'),
    con: score('con'),
    int: score('int'),
    wis: score('wis'),
    cha: score('cha'),
    savingThrows: td2('Saving Throws'),
    skills: td2('Skills'),
    damageVulnerabilities: td2('Damage Vulnerabilities'),
    damageResistances: td2('Damage Resistances'),
    damageImmunities: td2('Damage Immunities'),
    conditionImmunities: td2('Condition Immunities'),
    senses: td2('Senses'),
    languages: td2('Languages'),
    proficiencyBonus: profBonus ? parseInt(profBonus.replace('+', '')) : undefined,
    body
  };
}
