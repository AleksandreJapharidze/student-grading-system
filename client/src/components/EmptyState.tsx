import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
  tone?: "accent" | "teal" | "amber" | "coral";
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
  tone = "accent",
}: EmptyStateProps) {
  return (
    <div className={`empty-state${compact ? " empty-state--compact" : ""}`}>
      <div className={`empty-state__icon empty-state__icon--${tone}`} aria-hidden>
        <Icon size={compact ? 20 : 24} strokeWidth={1.75} />
      </div>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
      {children}
    </div>
  );
}
