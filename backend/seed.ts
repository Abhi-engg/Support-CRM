import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mockData = [
  {
    ticketId: 'TKT-001',
    customerName: 'Alice Greenfield',
    customerEmail: 'alice@example.com',
    subject: 'Cannot access my dashboard (500 Error)',
    description: 'I keep getting a 500 error when I try to log in to the main dashboard. This has been happening since yesterday.',
    status: 'OPEN',
    priority: 'HIGH',
    hoursAgo: 48,
    notes: ['Investigating the server logs. Looks like a memory leak.', 'Escalated to backend engineering.']
  },
  {
    ticketId: 'TKT-002',
    customerName: 'Bob Tables',
    customerEmail: 'bob@tables.com',
    subject: 'URGENT: Database corrupted during migration',
    description: 'We ran the latest update and now all our user records are showing null values. We are losing transactions by the minute.',
    status: 'OPEN',
    priority: 'URGENT',
    hoursAgo: 1,
    notes: []
  },
  {
    ticketId: 'TKT-003',
    customerName: 'Charlie Davis',
    customerEmail: 'charlie.d@startup.io',
    subject: 'How do I upgrade my billing plan?',
    description: 'I want to move from the Pro tier to Enterprise, but the upgrade button in my settings is greyed out.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    hoursAgo: 5,
    notes: ['Emailed Charlie a manual payment link via Stripe.']
  },
  {
    ticketId: 'TKT-004',
    customerName: 'Diana Prince',
    customerEmail: 'diana@themyscira.gov',
    subject: 'Feature Request: Dark Mode Integration',
    description: 'The current white background is extremely bright for night shifts. Is there any plan to add a system dark mode toggle?',
    status: 'CLOSED',
    priority: 'LOW',
    hoursAgo: 72,
    notes: ['Added to the Q4 roadmap. Closing the ticket for now.']
  },
  {
    ticketId: 'TKT-005',
    customerName: 'Evan Wright',
    customerEmail: 'evan@wrightmedia.com',
    subject: 'Cannot reset password',
    description: 'I am not receiving the password reset emails. Checked my spam folder already.',
    status: 'OPEN',
    priority: 'MEDIUM',
    hoursAgo: 26, // SLA Breach
    notes: []
  },
  {
    ticketId: 'TKT-006',
    customerName: 'Fiona Gallagher',
    customerEmail: 'fiona@shameless.io',
    subject: 'API rate limit exceeded too quickly',
    description: 'We are hitting the 1000 req/min limit but our logs show we only made 300 requests.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    hoursAgo: 10,
    notes: ['Checking Redis rate limiter logs.']
  },
  {
    ticketId: 'TKT-007',
    customerName: 'George Miller',
    customerEmail: 'george@madmax.com',
    subject: 'SSO integration failing with Okta',
    description: 'Nobody in our organization can log in via Okta this morning. It says invalid SAML token.',
    status: 'OPEN',
    priority: 'URGENT',
    hoursAgo: 2,
    notes: []
  },
  {
    ticketId: 'TKT-008',
    customerName: 'Hannah Abbott',
    customerEmail: 'hannah@hogwarts.edu',
    subject: 'Typo on pricing page',
    description: 'Just a heads up, the word "Enterprise" is spelled "Enterpise" on your pricing page.',
    status: 'CLOSED',
    priority: 'LOW',
    hoursAgo: 120,
    notes: ['Fixed typo and pushed to production.']
  },
  {
    ticketId: 'TKT-009',
    customerName: 'Ian Malcolm',
    customerEmail: 'ian@ingen.com',
    subject: 'Need invoice for last month',
    description: 'Can you please send me a PDF invoice for the charges on October 1st?',
    status: 'CLOSED',
    priority: 'MEDIUM',
    hoursAgo: 45,
    notes: ['Sent invoice PDF via email.']
  },
  {
    ticketId: 'TKT-010',
    customerName: 'Jessica Jones',
    customerEmail: 'jessica@alias.com',
    subject: 'Webhook not firing for new events',
    description: 'Our endpoint is returning 200 OK but your webhook logs say "Delivery Failed".',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    hoursAgo: 15,
    notes: ['Looking into the payload size, might be timing out.']
  },
  {
    ticketId: 'TKT-011',
    customerName: 'Kevin McCallister',
    customerEmail: 'kevin@homealone.com',
    subject: 'Account suspended by mistake',
    description: 'My account says it is suspended for fraud, but I just updated my credit card!',
    status: 'OPEN',
    priority: 'URGENT',
    hoursAgo: 4,
    notes: []
  },
  {
    ticketId: 'TKT-012',
    customerName: 'Luna Lovegood',
    customerEmail: 'luna@quibbler.com',
    subject: 'How to invite team members?',
    description: 'I cannot find the button to invite my editor to the workspace.',
    status: 'OPEN',
    priority: 'LOW',
    hoursAgo: 12,
    notes: []
  },
  {
    ticketId: 'TKT-013',
    customerName: 'Michael Scott',
    customerEmail: 'mscott@dundermifflin.com',
    subject: 'Feature request: Slack integration',
    description: 'We would love to get a ping in Slack every time a new lead is generated.',
    status: 'CLOSED',
    priority: 'LOW',
    hoursAgo: 200,
    notes: ['Slack integration is now live!']
  },
  {
    ticketId: 'TKT-014',
    customerName: 'Nancy Wheeler',
    customerEmail: 'nancy@hawkins.post',
    subject: 'Data export is pending forever',
    description: 'I clicked export to CSV yesterday and it is still spinning.',
    status: 'OPEN',
    priority: 'HIGH',
    hoursAgo: 27, // SLA breach
    notes: []
  },
  {
    ticketId: 'TKT-015',
    customerName: 'Oliver Queen',
    customerEmail: 'oliver@queenconsolidated.com',
    subject: 'Change billing email',
    description: 'Please change our billing email to accounts@queenconsolidated.com.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    hoursAgo: 6,
    notes: ['Waiting for confirmation from the current owner email.']
  },
  {
    ticketId: 'TKT-016',
    customerName: 'Peter Parker',
    customerEmail: 'peter@dailybugle.com',
    subject: 'Mobile app crashing on launch',
    description: 'Since the iOS 17 update, your app crashes immediately on launch.',
    status: 'OPEN',
    priority: 'URGENT',
    hoursAgo: 3,
    notes: []
  },
  {
    ticketId: 'TKT-017',
    customerName: 'Quentin Tarantino',
    customerEmail: 'qt@cinema.com',
    subject: 'Custom domain setup failing',
    description: 'I added the CNAME records to Cloudflare but it still says unverified.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    hoursAgo: 8,
    notes: ['Looks like DNS propagation is just taking a while.']
  },
  {
    ticketId: 'TKT-018',
    customerName: 'Rachel Green',
    customerEmail: 'rachel@ralphlauren.com',
    subject: 'Two-factor auth locked out',
    description: 'I lost my phone and do not have my backup codes. Help!',
    status: 'OPEN',
    priority: 'URGENT',
    hoursAgo: 1,
    notes: []
  },
  {
    ticketId: 'TKT-019',
    customerName: 'Steve Harrington',
    customerEmail: 'steve@scoopsahoy.com',
    subject: 'Cancel subscription',
    description: 'We are closing down shop, need to cancel the annual plan.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    hoursAgo: 50,
    notes: ['Cancelled plan and issued prorated refund.']
  },
  {
    ticketId: 'TKT-020',
    customerName: 'Tony Stark',
    customerEmail: 'tony@starkindustries.com',
    subject: 'Dashboard loading slowly',
    description: 'When I load the main dashboard with 10k assets, it takes 15 seconds to render.',
    status: 'OPEN',
    priority: 'MEDIUM',
    hoursAgo: 20,
    notes: []
  }
];

async function main() {
  console.log('Clearing existing data...');
  await prisma.note.deleteMany({});
  await prisma.ticket.deleteMany({});

  console.log('Seeding 20 mock tickets...');

  for (const t of mockData) {
    const createdAt = new Date(Date.now() - t.hoursAgo * 60 * 60 * 1000);
    
    const notesData = t.notes.map((noteText, idx) => ({
      text: noteText,
      // Stagger note creation times
      createdAt: new Date(createdAt.getTime() + (idx + 1) * 60 * 60 * 1000)
    }));

    await prisma.ticket.create({
      data: {
        ticketId: t.ticketId,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        subject: t.subject,
        description: t.description,
        status: t.status as any,
        priority: t.priority as any,
        createdAt: createdAt,
        notes: {
          create: notesData
        }
      }
    });
  }

  console.log('20 mock tickets seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
