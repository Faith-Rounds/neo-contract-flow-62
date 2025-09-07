import { Button } from "@/components/ui/button";
import contractsImage from "@/assets/empty-contracts.png";

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-up">
      {illustration ? (
        <div className="mb-6 opacity-60">
          {illustration}
        </div>
      ) : (
        <div className="mb-6 opacity-60">
          <img 
            src={contractsImage} 
            alt="Empty state illustration"
            className="w-64 h-40 object-cover"
          />
        </div>
      )}
      <h3 className="text-xl font-heading text-ink mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <div className="flex gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="hover-glow">
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}