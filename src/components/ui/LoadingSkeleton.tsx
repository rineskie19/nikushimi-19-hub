type Layout = "catalog" | "detail" | "studio";

const labels = {
  catalog: "Loading downloads",
  detail: "Loading app details",
  studio: "Loading Studio",
};

export function LoadingSkeleton({ layout }: { layout: Layout }) {
  return <div className="page-skeleton" data-layout={layout} role="status">
    <span className="sr-only">{labels[layout]}</span>
    <div className="page-loading-track" aria-hidden="true"><span /></div>
    <div className="skeleton-heading" aria-hidden="true">
      {layout === "detail" && <span className="skeleton-icon" />}
      <div className="skeleton-lines"><span /><span /></div>
    </div>
    <div className="skeleton-grid" aria-hidden="true">
      {[1, 2].map((card) => <div key={card} className="panel skeleton-card">
        <div className="skeleton-lines"><span /><span /></div>
        <span className="skeleton-button" />
      </div>)}
    </div>
  </div>;
}
