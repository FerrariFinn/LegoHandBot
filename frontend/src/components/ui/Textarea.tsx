import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Nur ein Anwendungsfall im Projekt (Chat-Eingabe), daher kein
// Variant-Prop nötig (YAGNI). "resize" kompensiert, dass Preflight das
// Resize-Verhalten von "both" (Browser-Default) auf "vertical" einschränkt.
const textareaVariants = cva(
  "w-full resize rounded-full border border-input-border p-2.5 font-serif text-base"
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants(), className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
