import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Shared Spendly logo — used in Landing nav, MainLayout sidebar,
 * Login header, and Register header. Keeps the brand consistent.
 *
 * @param {string} size - "sm" | "md" | "lg"
 * @param {boolean} asLink - wrap in a <Link> to a given href
 * @param {string} href - where the link goes (default "/")
 */
export default function Logo({ size = "md", asLink = true, href = "/" }) {
  const sizes = {
    sm: { icon: "w-5 h-5", box: "w-7 h-7 rounded-md", text: "text-base" },
    md: { icon: "w-4 h-4", box: "w-8 h-8 rounded-lg", text: "text-lg" },
    lg: { icon: "w-6 h-6", box: "w-10 h-10 rounded-xl", text: "text-2xl" },
  };

  const s = sizes[size] || sizes.md;

  const inner = (
    <span className="flex items-center gap-2.5 select-none">
      <span className={`${s.box} bg-primary flex items-center justify-center shrink-0`}>
        <TrendingUp className={`${s.icon} text-primary-foreground`} strokeWidth={2.5} />
      </span>
      <span className={`${s.text} font-bold tracking-tight`}>Spendly</span>
    </span>
  );

  if (asLink) {
    return (
      <Link to={href} className="hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}
