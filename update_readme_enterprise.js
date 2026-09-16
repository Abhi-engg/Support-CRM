const fs = require('fs');
let readme = fs.readFileSync('README.md', 'utf8');

// Remove the old Omnichannel point from Phase 1 to avoid duplication
readme = readme.replace(/\* \*\*Omnichannel Ingestion.*?database\.\n/g, '');

const enterpriseSection = `
### Phase 4: Enterprise CRM Core (Table Stakes for B2B)
* **Customer 360 Sidebar:**
  * *The Feature:* When an agent views a ticket, a sidebar shows the customer's entire history: their lifetime value (LTV), subscription tier (Free vs. Pro), and a list of their past tickets.
  * *PM Value:* Agents treat a "Pro" customer differently than a "Free" customer. Without this context, agents are flying blind.
* **Omnichannel "Email-to-Ticket":**
  * *The Feature:* Connect SendGrid or Postmark so that when a customer simply emails support@yourcompany.com, it automatically parses the email and drops it into our CRM as a ticket. No web forms required.
* **CSAT (Customer Satisfaction) Automation:**
  * *The Feature:* When an agent clicks "Close Ticket", the system automatically emails the customer a 1-to-5 star rating survey.

---
`;

readme = readme.replace(/\n---\n\*Designed and built/, enterpriseSection + '*Designed and built');
fs.writeFileSync('README.md', readme, 'utf8');
