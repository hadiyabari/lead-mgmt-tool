import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { buildIcs } from '@leadpilot/calendar';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = await ctx.params;
  const meeting = await prisma.meeting.findFirst({
    where: { id, lead: { workspaceId: session.user.workspaceId } },
    include: { lead: { select: { companyName: true, primaryEmail: true } } },
  });

  if (!meeting) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const endsAt =
    meeting.endsAt || new Date(meeting.startsAt.getTime() + 30 * 60 * 1000);

  const ics = buildIcs({
    uid: `${meeting.id}@leadpilot`,
    title: meeting.title || `Meeting · ${meeting.lead.companyName}`,
    description: meeting.notes || `LeadPilot meeting with ${meeting.lead.companyName}`,
    location: meeting.meetingUrl || undefined,
    startsAt: meeting.startsAt,
    endsAt,
    url: meeting.meetingUrl,
    organizerEmail: session.user.email,
  });

  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="meeting-${meeting.id}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
