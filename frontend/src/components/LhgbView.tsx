import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { fetchLhgbText } from "../lhgbClient";
import { markdownHeadingComponents } from "./markdownHeadings";

// =====================================================================
// Rendert das komplette Legohandgesetzbuch als Fließtext-Dokument (nicht
// als Chat-Bubble) im LHGB-Tab. Lädt den Text einmalig beim Mount über
// /api/lhgb (server-seitig gecacht, siehe backend/src/lib/gesetzbuchLoader.ts).
// Eigene components-Map statt MarkdownMessage: die Chat-Bubble-Abstände
// dort (my-1 etc.) sind zu eng für ein ganzes Dokument, und hr/pre kommen
// im Chat gar nicht vor.
// =====================================================================

export default function LhgbView() {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLhgbText()
      .then(setText)
      .catch(() => setError("Fehler beim Laden des Gesetzbuchs."));
  }, []);

  if (error) return <p className="text-error">{error}</p>;
  if (text === null) return <p className="text-muted">Lade Gesetzbuch…</p>;

  return (
    <div className="flex flex-col gap-1 pb-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          ...markdownHeadingComponents,
          p: ({ children }) => <p className="my-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2 list-disc pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          hr: () => <hr className="my-4 border-t-2 border-gold" />,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto whitespace-pre rounded-code bg-code-bg p-2 font-mono text-sm">
              {children}
            </pre>
          ),
          code: ({ children }) => <code className="font-mono">{children}</code>,
          a: ({ href, children }) => (
            <a href={href} className="font-serif text-link underline">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
