import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ExternalLink, Shield, Eye, Brain, Gauge, ScrollText } from 'lucide-react';
import { Character } from '../../store/characterStore';

interface PlayerDetailsProps {
  characters: Character[];
}

export default function PlayerDetails({ characters }: PlayerDetailsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Background</TableHead>
          <TableHead className='text-center' title='Armor Class'>
            <Shield className='h-4 w-4 mx-auto' />
          </TableHead>
          <TableHead className='text-center' title='Passive Perception'>
            <Eye className='h-4 w-4 mx-auto' />
          </TableHead>
          <TableHead className='text-center' title='Passive Insight'>
            <Brain className='h-4 w-4 mx-auto' />
          </TableHead>
          <TableHead className='text-center' title='Initiative Bonus'>
            <Gauge className='h-4 w-4 mx-auto' />
          </TableHead>
          <TableHead className='text-center' title='Character Sheet'>
            <ScrollText className='h-4 w-4 mx-auto' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {characters.map((char) => (
          <TableRow key={char.id}>
            <TableCell className='font-medium'>{char.name}</TableCell>
            <TableCell>{char.charClass}</TableCell>
            <TableCell>{char.background}</TableCell>
            <TableCell className='text-center tabular-nums'>{char.ac}</TableCell>
            <TableCell className='text-center tabular-nums'>{char.pp}</TableCell>
            <TableCell className='text-center tabular-nums'>{char.pi}</TableCell>
            <TableCell className='text-center tabular-nums'>{char.init}</TableCell>
            <TableCell className='text-center'>
              {char.sheetUrl && (
                <a
                  href={char.sheetUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-muted-foreground hover:text-foreground'>
                  <ExternalLink className='h-4 w-4 mx-auto' />
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
