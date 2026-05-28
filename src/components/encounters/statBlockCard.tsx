import ReactMarkdown from 'react-markdown';
import { formatBonus } from '@/lib/utils';
import { StatBlock } from '../../store/encounterStore';

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className='text-sm font-light'>
      <span className='font-bold'>{label}</span> {value}
    </p>
  );
}

interface Props {
  statBlock: StatBlock;
}

export default function StatBlockCard({ statBlock: sb }: Props) {
  const abilities = [
    { label: 'STR', score: sb.str },
    { label: 'DEX', score: sb.dex },
    { label: 'CON', score: sb.con },
    { label: 'INT', score: sb.int },
    { label: 'WIS', score: sb.wis },
    { label: 'CHA', score: sb.cha }
  ];
  const hasAbilities = abilities.some((a) => a.score != null);

  const infoLines: { label: string; value: string }[] = [
    sb.savingThrows ? { label: 'Saving Throws', value: sb.savingThrows } : null,
    sb.skills ? { label: 'Skills', value: sb.skills } : null,
    sb.damageVulnerabilities
      ? { label: 'Damage Vulnerabilities', value: sb.damageVulnerabilities }
      : null,
    sb.damageResistances ? { label: 'Damage Resistances', value: sb.damageResistances } : null,
    sb.damageImmunities ? { label: 'Damage Immunities', value: sb.damageImmunities } : null,
    sb.conditionImmunities
      ? { label: 'Condition Immunities', value: sb.conditionImmunities }
      : null,
    sb.senses ? { label: 'Senses', value: sb.senses } : null,
    sb.languages ? { label: 'Languages', value: sb.languages } : null,
    sb.proficiencyBonus != null
      ? { label: 'Proficiency Bonus', value: formatBonus(sb.proficiencyBonus) }
      : null
  ].filter(Boolean) as { label: string; value: string }[];

  const hasBody = !!sb.body?.trim();
  const showTraitsDivider = infoLines.length > 0 || hasBody;

  return (
    <div className='border rounded-lg p-4 bg-card text-card-foreground'>
      {/* Header */}
      <div className='flex items-start justify-between gap-2 mb-0.5'>
        <h2 className='text-xl font-bold leading-tight'>{sb.name}</h2>
        {sb.sourceUrl && (
          <a
            href={sb.sourceUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 mt-1'>
            Open reference ↗
          </a>
        )}
      </div>
      {(sb.size || sb.creatureType) && (
        <p className='text-sm italic text-muted-foreground mb-2'>
          {[sb.size, sb.creatureType].filter(Boolean).join(' ')}
        </p>
      )}

      <hr className='border-orange-800/60 border-t-2 my-2' />

      {/* Combat stats */}
      <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2'>
        {sb.ac != null && (
          <span className='font-light'>
            <span className='font-bold'>AC</span> {sb.ac}
            {sb.acDesc ? ` (${sb.acDesc})` : ''}
          </span>
        )}
        <span className='font-light'>
          <span className='font-bold'>HP</span> {sb.hp}
          {sb.hitDice ? ` (${sb.hitDice})` : ''}
        </span>
        {sb.speed && (
          <span className='font-light'>
            <span className='font-bold'>Speed</span> {sb.speed}
          </span>
        )}
      </div>

      {/* Ability scores */}
      {hasAbilities && (
        <>
          <hr className='border-orange-800/60 border-t-2 my-2' />
          <div className='grid grid-cols-6 gap-1 text-center text-sm mb-2'>
            {abilities.map(({ label, score }) => (
              <div key={label}>
                <div className='font-bold text-xs'>{label}</div>
                <div>{score != null ? `${score} (${mod(score)})` : '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {showTraitsDivider && <hr className='border-orange-800/60 border-t-2 my-2' />}

      {/* Info lines */}
      {infoLines.length > 0 && (
        <div className='space-y-0.5 mb-2'>
          {infoLines.map(({ label, value }) => (
            <InfoLine key={label} label={label} value={value} />
          ))}
        </div>
      )}

      {/* Body markdown — two-column flow */}
      {hasBody && (
        <div style={{ columns: '2', columnGap: '1.5rem' }}>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className='text-xl font-bold uppercase tracking-wide mt-3 first:mt-0 mb-1 border-b border-foreground/20 pb-0.5 break-after-avoid'>
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className='text-sm font-light mb-1.5 leading-snug break-inside-avoid'>
                  {children}
                </p>
              ),
              strong: ({ children }) => <strong className='font-bold'>{children}</strong>,
              em: ({ children }) => <em>{children}</em>,
              a: ({ href, children }) => (
                <a href={href} target='_blank' rel='noopener noreferrer' className='underline'>
                  {children}
                </a>
              )
            }}>
            {sb.body}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
