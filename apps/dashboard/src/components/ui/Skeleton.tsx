'use client';

export type SkeletonVariant = 'line' | 'tile' | 'circle' | 'block';

export function Skeleton({
  variant = 'line',
  className = '',
}: {
  variant?: SkeletonVariant;
  className?: string;
}) {
  return (
    <span
      className={`ui-skel ui-skel--${variant} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="ui-skel-card" aria-hidden="true">
      <Skeleton variant="circle" />
      <div className="ui-skel-card__lines">
        <Skeleton variant="line" className="ui-skel--w60" />
        <Skeleton variant="line" className="ui-skel--w40" />
      </div>
    </div>
  );
}