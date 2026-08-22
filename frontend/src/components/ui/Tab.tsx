import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Browserstyle-Tab: sitzt auf der goldenen Trennlinie des Tablist-
// Containers (siehe ModeSwitcher). Der aktive Tab bekommt eine weiße,
// zur Seite passende Füllung und einen weißen Unterrand, der die
// goldene Linie "durchstößt" — dadurch wirkt er wie mit dem Inhalt
// darunter verbunden. Inaktive Tabs bleiben ohne Rand hinter der Linie.
const tabVariants = cva(
  "rounded-t-bubble border px-3 py-1.5 font-serif text-base cursor-pointer",
  {
    variants: {
      active: {
        true: "bg-white border-gold border-b-white -mb-0.5 font-bold text-black",
        false:
          "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabVariants> {}

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={!!active}
      className={cn(tabVariants({ active }), className)}
      {...props}
    />
  )
);
Tab.displayName = "Tab";

export { Tab, tabVariants };
