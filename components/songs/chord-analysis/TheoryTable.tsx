'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { SongRomanAnalysis } from '@/types/ChordAnalysis';

interface TheoryTableProps {
  songAnalyses: SongRomanAnalysis[];
}

export function TheoryTable({ songAnalyses }: TheoryTableProps) {
  const [keyFilter, setKeyFilter] = useState<string>('all');

  const availableKeys = useMemo(() => {
    const keys = new Set(songAnalyses.map((s) => s.key));
    return Array.from(keys).sort();
  }, [songAnalyses]);

  const filtered = useMemo(() => {
    if (keyFilter === 'all') return songAnalyses;
    return songAnalyses.filter((s) => s.key === keyFilter);
  }, [songAnalyses, keyFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Roman Numeral Analysis</CardTitle>
            <CardDescription>
              Per-song chord analysis with music theory notation
            </CardDescription>
          </div>
          <Select value={keyFilter} onValueChange={setKeyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All keys</SelectItem>
              {availableKeys.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Chords</TableHead>
              <TableHead>Roman Numerals</TableHead>
              <TableHead>Archetypes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((song) => (
              <TableRow key={song.songId}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {song.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{song.key}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs max-w-[200px] truncate">
                  {song.chords.join(', ')}
                </TableCell>
                <TableCell className="max-w-[250px]">
                  <div className="flex flex-wrap gap-1">
                    {song.romanNumerals.map((rn, i) => (
                      <Badge
                        key={i}
                        variant={song.isDiatonic[i] ? 'secondary' : 'default'}
                        className={
                          song.isDiatonic[i]
                            ? ''
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }
                      >
                        {rn}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {song.archetypes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {song.archetypes.map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No songs found for this key.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
