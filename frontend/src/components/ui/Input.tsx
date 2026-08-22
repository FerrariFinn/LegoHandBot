import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputVariants = cva("", {
  variants: {
    variant: {
      // Login-Felder (E-Mail/Passwort): padding 10, radius 12, grauer
      // Rahmen, geerbte Font, 16px. w-full ergänzt, damit die Felder
      // unabhängig von Preflights box-sizing:border-box weiterhin die
      // volle Formularbreite einnehmen (bisher via Flex-Stretch erreicht).
      bordered:
        "w-full rounded-bubble border border-input-border p-2.5 font-serif text-base",
    },
  },
  defaultVariants: {
    variant: "bordered",
  },
});

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
