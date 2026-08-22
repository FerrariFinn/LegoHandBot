import type { Components } from "react-markdown";
import { Heading } from "./ui/Heading";

// =====================================================================
// h1-h4-Wiring, geteilt zwischen MarkdownMessage.tsx (Chat-Bubbles) und
// LhgbView.tsx (Volldokument) — beide delegieren an dieselbe Heading-ui-
// Komponente mit variant="markdown", nur der umgebende Kontext (Bubble
// vs. Fließtext) unterscheidet sich, daher hier nur dieser Teil geteilt.
// =====================================================================

export const markdownHeadingComponents: Partial<Components> = {
  h1: ({ children }) => (
    <Heading as="h1" variant="markdown" size="h1">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as="h2" variant="markdown" size="h2">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" variant="markdown" size="h3">
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading as="h4" variant="markdown" size="h4">
      {children}
    </Heading>
  ),
};
