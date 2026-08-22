import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const headingVariants = cva("", {
  variants: {
    variant: {
      // BIERSES-Titel: war früher komplett ungestylt (reiner Browser-
      // Default-h1: bold, ~2em, Standard-Margins). Preflight entfernt
      // diese Defaults, daher hier explizit nachgebildet.
      brand: "text-[2em] font-bold my-[0.67em]",
      // Markdown-Überschriften: margin "8px 0 4px", Font erbt jetzt Inter
      // von der umgebenden Card statt eigenem font-mono (Konsistenz mit
      // dem Rest der App). fontWeight bleibt bewusst UA-Default (bold).
      markdown: "mx-0 mt-2 mb-1",
    },
    size: {
      // Nur relevant bei variant="markdown". em-Einheiten (nicht rem!)
      // bewusst beibehalten, da relativ zur umgebenden Schriftgröße.
      h1: "text-[1.3em]",
      h2: "text-[1.15em]",
      h3: "text-[1.05em]",
      h4: "text-[1em]",
    },
  },
  defaultVariants: {
    variant: "brand",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as, variant, size, className, ...props }, ref) => {
    const Tag = as ?? "h1";
    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
