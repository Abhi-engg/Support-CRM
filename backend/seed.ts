import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.note.deleteMany({});
  await prisma.ticket.deleteMany({});

  console.log('Seeding mock tickets...');

  // 1. SLA Breach Ticket (48 hours old)
  await prisma.ticket.create({
    data: {
      ticketId: 'TKT-001',
      customerName: 'Alice Greenfield',
      customerEmail: 'alice@example.com',
      subject: 'Cannot access my dashboard (500 Error)',
      description: 'I keep getting a 500 error when I try to log in to the main dashboard. This has been happening since yesterday and I am completely blocked.',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
      notes: {
        create: [
          { text: 'Investigating the server logs. Looks like a memory leak.', createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000) },
          { text: 'Escalated to backend engineering.', createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  // 2. Urgent Ticket (New)
  await prisma.ticket.create({
    data: {
      ticketId: 'TKT-002',
      customerName: 'Bob Tables',
      customerEmail: 'bob@tables.com',
      subject: 'URGENT: Database corrupted during migration',
      description: 'We ran the latest update and now all our user records are showing null values. We are losing transactions by the minute. Need immediate assistance!',
      status: 'OPEN',
      priority: 'URGENT',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    }
  });

  // 3. In Progress Ticket
  await prisma.ticket.create({
    data: {
      ticketId: 'TKT-003',
      customerName: 'Charlie Davis',
      customerEmail: 'charlie.d@startup.io',
      subject: 'How do I upgrade my billing plan?',
      description: 'I want to move from the Pro tier to Enterprise, but the upgrade button in my settings is greyed out. Can you help me process this?',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      notes: {
        create: [
          { text: 'Emailed Charlie a manual payment link via Stripe.', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  // 4. Closed Ticket
  await prisma.ticket.create({
    data: {
      ticketId: 'TKT-004',
      customerName: 'Diana Prince',
      customerEmail: 'diana@themyscira.gov',
      subject: 'Feature Request: Dark Mode Integration',
      description: 'The current white background is extremely bright for night shifts. Is there any plan to add a system dark mode toggle in the near future?',
      status: 'CLOSED',
      priority: 'LOW',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      notes: {
        create: [
          { text: 'Added to the Q4 roadmap. Closing the ticket for now, will notify the user when shipped.', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  console.log('Mock data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
