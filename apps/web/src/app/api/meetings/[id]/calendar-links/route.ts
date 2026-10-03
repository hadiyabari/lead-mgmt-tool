import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { googleCalendarUrl, outlookWebUrl } from '@leadpilot/calendar';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const meeting = await prisma.meeting.findFirst({
    where: { id, lead: { workspaceId: session.user.workspaceId } },
    include: { lead: { select: { companyName: true } } },
  });
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const endsAt =
    meeting.endsAt || new Date(meeting.startsAt.getTime() + 30 * 60 * 1000);
  const title = meeting.title || `Meeting · ${meeting.lead.companyName}`;
  const details = meeting.notes || undefined;
  const location = meeting.meetingUrl || undefined;

  return NextResponse.json({
    google: googleCalendarUrl({
      title,
      startsAt: meeting.startsAt,
      endsAt,
      details,
      location,
    }),
    outlook: outlookWebUrl({
      title,
      startsAt: meeting.startsAt,
      endsAt,
      details,
      location,
    }),
    icsPath: `/api/meetings/${meeting.id}/ics`,
  });
}
