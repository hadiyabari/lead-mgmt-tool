import { describe, it, expect } from 'vitest';
import { buildIcs, toIcsUtc } from './ics';
import { googleCalendarUrl } from './links';

describe('calendar', () => {
  it('builds ICS with VEVENT', () => {
    const start = new Date('2026-10-10T15:00:00.000Z');
    const end = new Date('2026-10-10T15:30:00.000Z');
    const ics = buildIcs({
      uid: 'test-1@leadpilot',
      title: 'Discovery call',
      description: 'LeadPilot meeting',
      startsAt: start,
      endsAt: end,
      url: 'https://meet.example/x',
    });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Discovery call');
    expect(ics).toContain(toIcsUtc(start));
  });

  it('builds Google Calendar link', () => {
    const url = googleCalendarUrl({
      title: 'Call',
      startsAt: new Date('2026-10-10T15:00:00.000Z'),
      endsAt: new Date('2026-10-10T15:30:00.000Z'),
    });
    expect(url).toContain('calendar.google.com');
    expect(url).toContain('action=TEMPLATE');
  });
});
