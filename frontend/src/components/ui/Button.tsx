import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva("", {
  variants: {
    variant: {
      // Login-Submit-Button: gold, radius 12, padding 10, Inter-Font, 16px.
      primary:
        "rounded-bubble border-0 bg-gold p-2.5 font-serif text-base cursor-pointer",
      // Send-Button in ChatWindow, Abmelden-Button im Header: dezente
      // Zweit-Variante, folgt aber denselben Tokens wie primary/Input
      // (Radius, Border-Farbe, Font), damit sie nicht wie ein nativer
      // Browser-Button aus der Zeit vor der Tailwind-Migration wirkt.
      secondary:
        "rounded-bubble border border-input-border bg-gray-100 px-3 py-1.5 font-serif text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
