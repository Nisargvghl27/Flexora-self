import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] bg-gradient-to-b from-transparent to-muted/20 rounded-xl border border-dashed border-border/60">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      
      {actionLabel && actionLink && (
        <Button asChild size="lg" className="px-8 rounded-full">
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
      
      {actionLabel && onAction && !actionLink && (
        <Button onClick={onAction} size="lg" className="px-8 rounded-full">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
