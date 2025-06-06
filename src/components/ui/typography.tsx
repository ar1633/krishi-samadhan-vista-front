
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export function Heading({
  as: Component = "h2",
  size = "xl",
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(
        "font-bold leading-tight tracking-tight",
        size === "xs" && "text-lg",
        size === "sm" && "text-xl",
        size === "md" && "text-2xl",
        size === "lg" && "text-3xl",
        size === "xl" && "text-4xl",
        size === "2xl" && "text-5xl",
        size === "3xl" && "text-6xl",
        size === "4xl" && "text-7xl",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  variant?: "default" | "muted" | "highlight" | "success" | "warning" | "danger";
}

export function Text({
  as: Component = "p",
  size = "md",
  variant = "default",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        "leading-relaxed",
        size === "xs" && "text-xs",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "2xl" && "text-2xl",
        size === "3xl" && "text-3xl",
        size === "4xl" && "text-4xl",
        variant === "default" && "text-foreground",
        variant === "muted" && "text-muted-foreground",
        variant === "highlight" && "text-primary font-medium",
        variant === "success" && "text-krishi-600 font-medium",
        variant === "warning" && "text-earth-600 font-medium",
        variant === "danger" && "text-destructive font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
