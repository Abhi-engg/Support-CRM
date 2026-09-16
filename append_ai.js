const fs = require('fs');
let code = fs.readFileSync('backend/src/services/ai.service.ts', 'utf8');
code += `
export const summarizeTicketThreadStream = async (description: string, notes: string[]) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('AI services are not configured.');
  const thread = \`Description:\\n\${description}\\n\\nNotes:\\n\${notes.join('\\n')}\`.substring(0, 30000);
  const prompt = \`Provide a concise TL;DR summary of the following support ticket thread. 
Focus on the main issue, the troubleshooting steps taken, and the current status or next steps.

Ticket Thread:
\${thread}

TL;DR Summary:\`;
  return await ai.models.generateContentStream({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });
};
`;
fs.writeFileSync('backend/src/services/ai.service.ts', code, 'utf8');
