/** Google Calendar template URL for a timed event (UTC times). */
export function googleCalendarUrl(opts: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  details?: string;
  location?: string;
}): string {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    dates: `${fmt(opts.startsAt)}/${fmt(opts.endsAt)}`,
  });
  if (opts.details) params.set('details', opts.details);
  if (opts.location) params.set('location', opts.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Outlook web compose deep link (approximate). */
export function outlookWebUrl(opts: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  details?: string;
  location?: string;
}): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: opts.title,
    startdt: opts.startsAt.toISOString(),
    enddt: opts.endsAt.toISOString(),
  });
  if (opts.details) params.set('body', opts.details);
  if (opts.location) params.set('location', opts.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
