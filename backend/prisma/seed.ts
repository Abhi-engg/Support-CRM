import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding realistic demo data...');

  // Clean existing data safely
  await prisma.note.deleteMany({});
  await prisma.ticket.deleteMany({});

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const demoTickets = [
    {
      ticketId: 'TKT-001',
      customerName: 'Saurabh Agarwal',
      customerEmail: 'saurabh.a@example.com',
      subject: 'Urgent: Production Dashboard not loading',
      description: 'Hi support team,\n\nSince this morning, the main analytics dashboard is throwing a 500 error when I try to filter by Q3 metrics. I need this resolved before the board meeting tomorrow.\n\nBest,\nSaurabh',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      createdAt: oneDayAgo,
      updatedAt: oneHourAgo,
    },
    {
      ticketId: 'TKT-002',
      customerName: 'Priya Sharma',
      customerEmail: 'psharma@habpharma.in',
      subject: 'Need access to the new HR portal',
      description: 'I recently transferred to the operations team and do not have access to the new HR portal. Can someone provision my account?',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: twoDaysAgo, // Will trigger SLA breach UI
      updatedAt: twoDaysAgo,
    },
    {
      ticketId: 'TKT-003',
      customerName: 'Marcus Johnson',
      customerEmail: 'mjohnson@techcorp.com',
      subject: 'API Rate Limit exceeded on our production key',
      description: 'We are seeing 429 Too Many Requests errors. Our traffic has not spiked. Did our quota get reset accidentally?',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: fourHoursAgo,
      updatedAt: fourHoursAgo,
    },
    {
      ticketId: 'TKT-004',
      customerName: 'Elena Rodriguez',
      customerEmail: 'elena.r@agency.co',
      subject: 'Billing discrepancy on invoice #9923',
      description: 'We were charged for 15 seats this month but we downgraded to 10 seats last month. Please advise and process a refund.',
      status: 'CLOSED',
      priority: 'HIGH',
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo,
    },
    {
      ticketId: 'TKT-005',
      customerName: 'Amit Patel',
      customerEmail: 'apatel@retail.net',
      subject: 'Feature Request: Export reports to CSV',
      description: 'It would save us hours of manual work if we could click a single button to export the weekly inventory report to CSV.',
      status: 'OPEN',
      priority: 'LOW',
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo,
    },
    {
      ticketId: 'TKT-006',
      customerName: 'David Chen',
      customerEmail: 'dchen@startup.io',
      subject: 'Mobile app crashing on iOS 17.1',
      description: 'Every time I try to upload a receipt using the mobile app on my iPhone 15 Pro, the app crashes instantly.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: fourHoursAgo,
      updatedAt: oneHourAgo,
    },
    {
      ticketId: 'TKT-007',
      customerName: 'Neha Gupta',
      customerEmail: 'ngupta@example.com',
      subject: 'How do I reset my 2FA backup codes?',
      description: 'I lost my phone and need to use my backup codes, but I cannot find where I saved them. Can you help me reset them?',
      status: 'CLOSED',
      priority: 'MEDIUM',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      ticketId: 'TKT-008',
      customerName: 'Michael Scott',
      customerEmail: 'mscott@dundermifflin.com',
      subject: 'Printer configuration issues',
      description: 'The new office printer is not connecting to the guest Wi-Fi network. Need IT support ASAP.',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    }
  ];

  for (const t of demoTickets) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketId: t.ticketId,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        subject: t.subject,
        description: t.description,
        status: t.status as any,
        priority: t.priority as any,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }
    });

    // Add some realistic notes if not open
    if (t.status === 'IN_PROGRESS') {
      await prisma.note.create({
        data: {
          ticketId: ticket.id,
          text: 'Status updated from OPEN to IN_PROGRESS.\n\nNote: I am looking into the server logs right now. Will update shortly.',
          createdAt: t.updatedAt
        }
      });
    }

    if (t.status === 'CLOSED') {
      await prisma.note.create({
        data: {
          ticketId: ticket.id,
          text: 'Status updated from IN_PROGRESS to CLOSED.\n\nNote: Issue has been resolved and verified with the customer.',
          createdAt: t.updatedAt
        }
      });
    }
  }

  console.log('Database seeded with 8 realistic tickets!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
