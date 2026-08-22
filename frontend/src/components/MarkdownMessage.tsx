import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { markdownHeadingComponents } from "./markdownHeadings";

// =====================================================================
// Rendert gestreamten Markdown-Text (Gemini gibt oft ##/**bold**/Listen
// aus, siehe QUESTION_QUERY_SYSTEM_PROMPT in backend/src/prompts.ts) als echte React-
// Elemente statt als rohen String. Kein dangerouslySetInnerHTML, kein
// rehype-raw — es wird nie rohes HTML aus dem Modell-Output gerendert.
//
// react-markdown parst bei jedem Aufruf den kompletten (noch wachsenden)
// String neu. Unvollständige Syntax am Stream-Ende (z. B. ein noch nicht
// geschlossenes "**") wird schlicht als literaler Text angezeigt, bis
// der schließende Marker eintrifft — kein Sonderfall nötig.
//
// Styling erfolgt über Tailwind-Utilities + die Heading-ui-Komponente
// statt eigener Inline-Style-Objekte (siehe Tailwind-Migrationsplan).
// list-disc/list-decimal und die Link-Farbe kompensieren Tailwinds
// Preflight-Reset (der sonst Listensymbole und Link-Styling entfernt).
// =====================================================================

export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        ...markdownHeadingComponents,
        p: ({ children }) => <p className="my-1">{children}</p>,
        ul: ({ children }) => (
          <ul className="my-1 list-disc pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-1 list-decimal pl-5">{children}</ol>
        ),
        li: ({ children }) => <li className="my-0.5">{children}</li>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        code: ({ children }) => (
          <code className="rounded-code bg-code-bg px-1 py-px font-mono">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="font-serif text-link underline">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-1 border-l-[3px] border-blockquote-border pl-2.5">
            {children}
          </blockquote>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
