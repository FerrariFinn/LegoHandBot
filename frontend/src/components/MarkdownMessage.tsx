import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// =====================================================================
// Rendert gestreamten Markdown-Text (Gemini gibt oft ##/**bold**/Listen
// aus, siehe SYSTEM_PROMPT in backend/src/prompts.ts) als echte React-
// Elemente statt als rohen String. Kein dangerouslySetInnerHTML, kein
// rehype-raw — es wird nie rohes HTML aus dem Modell-Output gerendert.
//
// react-markdown parst bei jedem Aufruf den kompletten (noch wachsenden)
// String neu. Unvollständige Syntax am Stream-Ende (z. B. ein noch nicht
// geschlossenes "**") wird schlicht als literaler Text angezeigt, bis
// der schließende Marker eintrifft — kein Sonderfall nötig.
//
// Styling folgt der Projekt-Konvention "keine CSS-Datei, alles inline"
// (siehe App.tsx) statt einer eigenen Stylesheet-Datei.
// =====================================================================

const headingStyle = (size: string) => ({
  margin: "8px 0 4px",
  fontSize: size,
  fontFamily: "monospace",
});

export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ children }) => <h1 style={headingStyle("1.3em")}>{children}</h1>,
        h2: ({ children }) => <h2 style={headingStyle("1.15em")}>{children}</h2>,
        h3: ({ children }) => <h3 style={headingStyle("1.05em")}>{children}</h3>,
        h4: ({ children }) => <h4 style={headingStyle("1em")}>{children}</h4>,
        p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
        ul: ({ children }) => (
          <ul style={{ margin: "4px 0", paddingLeft: 20 }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: "4px 0", paddingLeft: 20 }}>{children}</ol>
        ),
        li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
        strong: ({ children }) => (
          <strong style={{ fontWeight: "bold" }}>{children}</strong>
        ),
        em: ({ children }) => <em>{children}</em>,
        code: ({ children }) => (
          <code
            style={{
              background: "rgba(0, 0, 0, 0.08)",
              padding: "1px 4px",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} style={{ fontFamily: "monospace" }}>
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote
            style={{
              margin: "4px 0",
              paddingLeft: 10,
              borderLeft: "3px solid rgba(0, 0, 0, 0.2)",
            }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
