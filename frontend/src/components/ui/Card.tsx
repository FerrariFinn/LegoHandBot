import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva("max-w-[75%] rounded-bubble px-3 py-2 font-serif", {
  variants: {
    // "sender" statt "role", da "role" bereits ein natives ARIA-HTML-
    // Attribut ist und sonst mit HTMLAttributes<HTMLDivElement> kollidiert.
    sender: {
      bot: "bg-gold",
      user: "bg-bubble-user",
    },
  },
  defaultVariants: {
    sender: "bot",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, sender, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ sender }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card, cardVariants };
