import { describe, it, expect } from 'vitest';
import { parseDdbStatBlock } from '../ddbParser';

const DRUID_HTML = `
<div class="mon-stat-block">
  <div class="mon-stat-block__header">
    <div class="mon-stat-block__name">
      <a class="mon-stat-block__name-link" href="/monsters/16848-druid">Druid</a>
    </div>
    <div class="mon-stat-block__meta">Medium Humanoid (Any Race), Any Alignment</div>
  </div>
  <div class="mon-stat-block__attributes">
    <div class="mon-stat-block__attribute">
      <span class="mon-stat-block__attribute-label">Armor Class</span>
      <span class="mon-stat-block__attribute-value">
        <span class="mon-stat-block__attribute-data-value">11</span>
        <span class="mon-stat-block__attribute-data-extra">(16 with barkskin)</span>
      </span>
    </div>
    <div class="mon-stat-block__attribute">
      <span class="mon-stat-block__attribute-label">Hit Points</span>
      <span class="mon-stat-block__attribute-data">
        <span class="mon-stat-block__attribute-data-value">27</span>
        <span class="mon-stat-block__attribute-data-extra">(5d8 + 5)</span>
      </span>
    </div>
    <div class="mon-stat-block__attribute">
      <span class="mon-stat-block__attribute-label">Speed</span>
      <span class="mon-stat-block__attribute-data">
        <span class="mon-stat-block__attribute-data-value">30 ft.</span>
      </span>
    </div>
  </div>
  <div class="ability-block">
    <div class="ability-block__stat ability-block__stat--str">
      <div class="ability-block__data"><span class="ability-block__score">10</span></div>
    </div>
    <div class="ability-block__stat ability-block__stat--dex">
      <div class="ability-block__data"><span class="ability-block__score">12</span></div>
    </div>
    <div class="ability-block__stat ability-block__stat--con">
      <div class="ability-block__data"><span class="ability-block__score">13</span></div>
    </div>
    <div class="ability-block__stat ability-block__stat--int">
      <div class="ability-block__data"><span class="ability-block__score">12</span></div>
    </div>
    <div class="ability-block__stat ability-block__stat--wis">
      <div class="ability-block__data"><span class="ability-block__score">15</span></div>
    </div>
    <div class="ability-block__stat ability-block__stat--cha">
      <div class="ability-block__data"><span class="ability-block__score">11</span></div>
    </div>
  </div>
  <div class="mon-stat-block__tidbits">
    <div class="mon-stat-block__tidbit">
      <span class="mon-stat-block__tidbit-label">Skills</span>
      <span class="mon-stat-block__tidbit-data">Medicine +4, Nature +3, Perception +4</span>
    </div>
    <div class="mon-stat-block__tidbit">
      <span class="mon-stat-block__tidbit-label">Senses</span>
      <span class="mon-stat-block__tidbit-data">Passive Perception 14</span>
    </div>
    <div class="mon-stat-block__tidbit">
      <span class="mon-stat-block__tidbit-label">Languages</span>
      <span class="mon-stat-block__tidbit-data">Druidic plus any two languages</span>
    </div>
    <div class="mon-stat-block__tidbit">
      <span class="mon-stat-block__tidbit-label">Proficiency Bonus</span>
      <span class="mon-stat-block__tidbit-data">+2</span>
    </div>
  </div>
  <div class="mon-stat-block__description-blocks">
    <div class="mon-stat-block__description-block">
      <div class="mon-stat-block__description-block-heading">Actions</div>
      <div class="mon-stat-block__description-block-content">
        <p><em><strong>Quarterstaff.</strong> Melee Weapon Attack:</em> +2 to hit, one target.</p>
      </div>
    </div>
  </div>
</div>
`;

describe('parseDdbStatBlock', () => {
  it('returns null for non-DDB HTML', () => {
    expect(parseDdbStatBlock('<div class="something-else">nope</div>')).toBeNull();
    expect(parseDdbStatBlock('<p>plain text</p>')).toBeNull();
    expect(parseDdbStatBlock('')).toBeNull();
  });

  it('parses name and builds sourceUrl from a relative href', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.name).toBe('Druid');
    expect(result?.sourceUrl).toBe('https://www.dndbeyond.com/monsters/16848-druid');
  });

  it('uses an absolute href as-is without doubling the domain', () => {
    const html = DRUID_HTML.replace(
      'href="/monsters/16848-druid"',
      'href="https://www.dndbeyond.com/monsters/16848-druid"'
    );
    expect(parseDdbStatBlock(html)?.sourceUrl).toBe(
      'https://www.dndbeyond.com/monsters/16848-druid'
    );
  });

  it('parses size and creatureType from meta, dropping alignment', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.size).toBe('Medium');
    expect(result?.creatureType).toBe('Humanoid (Any Race)');
  });

  it('parses AC, acDesc, HP, hitDice, and speed', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.ac).toBe(11);
    expect(result?.acDesc).toBe('16 with barkskin');
    expect(result?.hp).toBe(27);
    expect(result?.hitDice).toBe('5d8 + 5');
    expect(result?.speed).toBe('30 ft.');
  });

  it('parses all six ability scores', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.str).toBe(10);
    expect(result?.dex).toBe(12);
    expect(result?.con).toBe(13);
    expect(result?.int).toBe(12);
    expect(result?.wis).toBe(15);
    expect(result?.cha).toBe(11);
  });

  it('parses tidbits', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.skills).toBe('Medicine +4, Nature +3, Perception +4');
    expect(result?.senses).toBe('Passive Perception 14');
    expect(result?.languages).toBe('Druidic plus any two languages');
    expect(result?.proficiencyBonus).toBe(2);
  });

  it('parses body from description blocks', () => {
    const result = parseDdbStatBlock(DRUID_HTML);
    expect(result?.body).toContain('## Actions');
    expect(result?.body).toContain('Quarterstaff');
  });

  it('accepts HTML copied without the outer mon-stat-block wrapper', () => {
    const withoutWrapper = DRUID_HTML.replace('<div class="mon-stat-block">', '').replace(
      /^[\s\S]*?(?=<div class="mon-stat-block__header")/,
      ''
    );
    const result = parseDdbStatBlock(withoutWrapper);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Druid');
  });
});
