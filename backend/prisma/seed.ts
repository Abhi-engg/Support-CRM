import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding deeply realistic Enterprise CRM data...');

  // Clean existing data safely
  await prisma.note.deleteMany({});
  await prisma.ticket.deleteMany({});

  const now = new Date();
  
  // Timestamps for SLA demonstration
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000); // Triggers 24h SLA breach
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000); // Triggers URGENT breach if untouched
  const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // We set userId: null and organizationId: null so they are globally visible 
  // to the user testing the app, acting as a shared "Demo" queue.

  const ticketsToCreate = [
    {
      ticketId: 'TKT-101',
      customerName: 'Saurabh Agarwal',
      customerEmail: 'saurabh.a@datastraw.com',
      subject: 'Critical: Enterprise Dashboard 500 Errors',
      description: 'The executive analytics dashboard is completely down. We are getting a 500 Internal Server Error when filtering by Q3 metrics. I need this escalated to engineering immediately before our board meeting.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      category: 'BUG',
      sentiment: 'NEGATIVE',
      createdAt: fourHoursAgo,
      updatedAt: tenMinsAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: URGENT, Sentiment: NEGATIVE, Category: BUG', createdAt: fourHoursAgo },
        { text: 'Status updated from OPEN to IN_PROGRESS.\n\nNote: Acknowledged. I am looping in the backend engineering team right now. - Agent Smith', createdAt: new Date(fourHoursAgo.getTime() + 15 * 60 * 1000) },
        { text: 'Internal Engineering Note: The issue seems to be a missing index on the Q3_metrics Postgres view. Running a migration on staging now.', createdAt: oneHourAgo(fourHoursAgo) },
        { text: 'Hi Saurabh, we have identified the issue and are deploying a hotfix. Expected resolution in 30 minutes.', createdAt: tenMinsAgo }
      ]
    },
    {
      ticketId: 'TKT-102',
      customerName: 'Priya Sharma',
      customerEmail: 'psharma@habpharma.in',
      subject: 'SSO Login Failure for Operations Team',
      description: 'Several members of the operations team are getting a "SAML Token Invalid" error when trying to log into the new portal via Okta.',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'BUG',
      sentiment: 'NEGATIVE',
      createdAt: twentyFiveHoursAgo, // INTENTIONAL SLA BREACH (Open > 24h)
      updatedAt: twentyFiveHoursAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: HIGH, Sentiment: NEGATIVE, Category: LOGIN', createdAt: twentyFiveHoursAgo },
        { text: 'SYSTEM ALERT: SLA BREACH. Ticket has been open for >24 hours with no agent response. Priority auto-escalated.', createdAt: now }
      ]
    },
    {
      ticketId: 'TKT-103',
      customerName: 'Marcus Johnson',
      customerEmail: 'mjohnson@techcorp.com',
      subject: 'API Rate Limit exceeded on our production key',
      description: 'We are seeing 429 Too Many Requests errors. Our traffic has not spiked. Did our quota get reset accidentally?',
      status: 'OPEN',
      priority: 'URGENT',
      category: 'BILLING',
      sentiment: 'NEUTRAL',
      createdAt: thirtyMinsAgo, // INTENTIONAL URGENT BREACH (Urgent untouched > 30m)
      updatedAt: thirtyMinsAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: URGENT, Sentiment: NEUTRAL, Category: BILLING', createdAt: thirtyMinsAgo },
        { text: 'SYSTEM ALERT: CRITICAL SLA BREACH. Urgent ticket untouched for 30 minutes. Manager notified.', createdAt: now }
      ]
    },
    {
      ticketId: 'TKT-104',
      customerName: 'Elena Rodriguez',
      customerEmail: 'elena.r@agency.co',
      subject: 'Billing discrepancy on invoice #9923',
      description: 'We were charged for 15 seats this month but we downgraded to 10 seats last month. Please advise and process a refund.',
      status: 'CLOSED',
      priority: 'MEDIUM',
      category: 'BILLING',
      sentiment: 'NEGATIVE',
      createdAt: threeDaysAgo,
      updatedAt: oneDayAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: MEDIUM, Sentiment: NEGATIVE, Category: BILLING', createdAt: threeDaysAgo },
        { text: 'Status updated from OPEN to IN_PROGRESS.\n\nNote: Checking the Stripe logs for last month\'s proration.', createdAt: twoDaysAgo },
        { text: 'Status updated from IN_PROGRESS to CLOSED.\n\nNote: I have processed a $150 credit to your account for the 5 unused seats. The updated invoice is attached.', createdAt: oneDayAgo },
        { text: 'System: Automated CSAT Survey dispatched to elena.r@agency.co', createdAt: oneDayAgo }
      ]
    },
    {
      ticketId: 'TKT-105',
      customerName: 'Amit Patel',
      customerEmail: 'apatel@retail.net',
      subject: 'Feature Request: Export reports to CSV',
      description: 'It would save us hours of manual work if we could click a single button to export the weekly inventory report to CSV.',
      status: 'OPEN',
      priority: 'LOW',
      category: 'FEATURE_REQUEST',
      sentiment: 'POSITIVE',
      createdAt: twelveHoursAgo,
      updatedAt: twelveHoursAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: LOW, Sentiment: POSITIVE, Category: FEATURE_REQUEST', createdAt: twelveHoursAgo }
      ]
    },
    {
      ticketId: 'TKT-106',
      customerName: 'Elena Rodriguez', // Same customer to test Customer 360 sidebar
      customerEmail: 'elena.r@agency.co',
      subject: 'How to invite guest users?',
      description: 'Is it possible to invite a contractor to our workspace with read-only permissions?',
      status: 'OPEN',
      priority: 'LOW',
      category: 'GENERAL',
      sentiment: 'NEUTRAL',
      createdAt: tenMinsAgo,
      updatedAt: tenMinsAgo,
      notes: [
        { text: 'System: Ticket was auto-triaged by AI. Priority: LOW, Sentiment: NEUTRAL, Category: GENERAL', createdAt: tenMinsAgo }
      ]
    }
  ];

  for (const t of ticketsToCreate) {
    const { notes, ...ticketData } = t;
    const ticket = await prisma.ticket.create({
      data: {
        ...ticketData,
        status: ticketData.status as any,
        priority: ticketData.priority as any,
        category: ticketData.category as any,
        sentiment: ticketData.sentiment as any,
        userId: null,
        organizationId: null
      }
    });

    for (const note of notes) {
      await prisma.note.create({
        data: {
          ticketId: ticket.id,
          text: note.text,
          createdAt: note.createdAt
        }
      });
    }
  }

  console.log('Database seeded with highly realistic Enterprise CRM tickets!');
}

function oneHourAgo(date: Date) {
  return new Date(date.getTime() + 60 * 60 * 1000);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
