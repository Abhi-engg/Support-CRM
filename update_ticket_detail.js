const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/TicketDetail.tsx', 'utf8');

// Replace imports
code = code.replace(
  "import { fetchTickets, generateSmartReply, summarizeTicket } from '../api';",
  "import { fetchTickets, generateSmartReply, summarizeTicketStream } from '../api';\nimport ReactMarkdown from 'react-markdown';"
);

// Replace handleSummarize
const oldHandleSummarize = `  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const { summary: s } = await summarizeTicket(ticket.ticket_id);
      setSummary(s);
    } catch (error) {
      console.error('Failed to summarize thread', error);
      alert('Failed to summarize thread.');
    } finally {
      setIsSummarizing(false);
    }
  };`;

const newHandleSummarize = `  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    try {
      await summarizeTicketStream(ticket.ticket_id, (chunk) => {
        setSummary((prev) => (prev || '') + chunk);
      });
    } catch (error) {
      console.error('Failed to summarize thread', error);
      alert('Failed to summarize thread.');
    } finally {
      setIsSummarizing(false);
    }
  };`;

code = code.replace(oldHandleSummarize, newHandleSummarize);

// Replace rendering
const oldRender = `{summary && (
            <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} /> AI Summary
              </h4>
              <p className="text-sm text-indigo-900 whitespace-pre-wrap">{summary}</p>
            </div>
          )}`;

const newRender = `{summary !== null && (
            <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} /> AI Summary
              </h4>
              <div className="text-sm text-indigo-950">
                <ReactMarkdown
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1 leading-relaxed" {...props} />,
                    p: ({node, ...props}) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-indigo-900" {...props} />,
                  }}
                >
                  {summary || 'Generating summary...'}
                </ReactMarkdown>
              </div>
            </div>
          )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('frontend/src/components/TicketDetail.tsx', code, 'utf8');
