"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, LayoutGrid, List, Search } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { detailPath, type Project } from "@/lib/catalog";
import { makeCatalogStore, setCategory, setLayout, setPage, setQuery, setSort, type CatalogLayout, type CatalogSort, type CatalogState } from "@/state/catalog";
import { Button, ButtonLink } from "./ui/Button";
import styles from "./Catalog.module.scss";

export type CatalogApp = Pick<Project, "slug" | "title" | "category" | "icon" | "summary" | "featured"> & {
  platform?: string;
  version?: string;
  updated?: string;
};

const appsPerPage = 6;
const sortKey = "niku-catalog-sort";
const layoutKey = "niku-catalog-layout";

function preference(key: string, value?: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else return localStorage.getItem(key);
  } catch {
    // Browsing still works with storage disabled.
  }
}

export function Catalog({ apps }: { apps: CatalogApp[] }) {
  const [store] = useState(makeCatalogStore);
  return <Provider store={store}><MotionConfig reducedMotion="user"><Library apps={apps} /></MotionConfig></Provider>;
}

function Library({ apps }: { apps: CatalogApp[] }) {
  const { query, category, sort, layout, page } = useSelector((state: CatalogState) => state.catalog);
  const dispatch = useDispatch();
  const results = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSort = preference(sortKey);
    if (savedSort === "recent" || savedSort === "name" || savedSort === "featured") dispatch(setSort(savedSort));
    if (preference(layoutKey) === "list") dispatch(setLayout("list"));
  }, [dispatch]);

  const categories = [...new Set(apps.map((app) => app.category))];
  const search = query.trim().toLowerCase();
  const matches = apps.filter((app) =>
    (!category || app.category === category) &&
    [app.title, app.summary, app.category, app.platform].join(" ").toLowerCase().includes(search),
  ).sort((first, second) => {
    if (sort === "featured") return Number(second.featured) - Number(first.featured);
    if (sort === "recent") return (second.updated ?? "").localeCompare(first.updated ?? "") || first.title.localeCompare(second.title);
    return first.title.localeCompare(second.title);
  });
  const lastPage = Math.max(1, Math.ceil(matches.length / appsPerPage));
  const currentPage = Math.min(page, lastPage);
  const start = (currentPage - 1) * appsPerPage;
  const shown = matches.slice(start, start + appsPerPage);

  function changePage(next: number) {
    dispatch(setPage(next));
    results.current?.scrollIntoView({ block: "start" });
  }

  function changeSort(next: CatalogSort) {
    dispatch(setSort(next));
    preference(sortKey, next);
  }

  function changeLayout(next: CatalogLayout) {
    dispatch(setLayout(next));
    preference(layoutKey, next);
  }

  return <div className={`shell ${styles.catalog}`}>
    <div className={styles.intro}>
      <div><h1>Downloads</h1><p>Android and Windows downloads, release notes, and setup guides.</p></div>
      <label className={styles.search}><Search size={19} aria-hidden="true" /><input value={query} onChange={(event) => dispatch(setQuery(event.target.value))} placeholder="Search apps" aria-label="Search apps" /></label>
    </div>
    <section aria-label="App library" className={styles.library}>
      <div className={styles.toolbar} ref={results}>
        <div className={styles.filters} role="group" aria-label="Filter by category">
          {[["", "All apps"], ...categories.map((value) => [value, value])].map(([value, label]) =>
            <Button key={value} variant="quiet" className={styles.filter} aria-pressed={category === value} onClick={() => dispatch(setCategory(value))}>{label}</Button>,
          )}
        </div>
        <div className={styles.tools}>
          <select className={styles.sort} value={sort} aria-label="Sort apps" onChange={(event) => changeSort(event.target.value as CatalogSort)}>
            <option value="featured">Featured first</option>
            <option value="recent">Last updated</option>
            <option value="name">Name A–Z</option>
          </select>
          <div className={styles.views} role="group" aria-label="Catalog view">
            <Button variant="quiet" aria-label="Grid view" title="Grid view" aria-pressed={layout === "grid"} onClick={() => changeLayout("grid")}><LayoutGrid size={17} aria-hidden="true" /></Button>
            <Button variant="quiet" aria-label="List view" title="List view" aria-pressed={layout === "list"} onClick={() => changeLayout("list")}><List size={17} aria-hidden="true" /></Button>
          </div>
        </div>
      </div>
      <p className={styles.resultCount} role="status">{matches.length > appsPerPage ? `${start + 1}–${start + shown.length} of ${matches.length} apps` : `${matches.length} ${matches.length === 1 ? "app" : "apps"}`}</p>
      {shown.length ? <div key={layout} className={layout === "list" ? styles.list : styles.grid} data-layout={layout}>{shown.map((app) =>
        <motion.article layout="position" key={app.slug} className={styles.card}>
          <div className={styles.tile}>
            {app.icon ? <img src={app.icon} alt="" width={68} height={68} /> : <Gamepad2 size={27} aria-hidden="true" />}
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardMeta}><span>{app.category}</span>{app.featured && <span className={styles.featured}>Featured</span>}</div>
            <h2>{app.title}</h2>
            <p>{app.summary}</p>
          </div>
          <div className={styles.cardFooter}>
            <span>{[app.platform, app.version].filter(Boolean).join(" · ")}</span>
            <ButtonLink variant="secondary" className={styles.cardCta} href={detailPath(app)} aria-label={"View app: " + app.title}>View app</ButtonLink>
          </div>
        </motion.article>,
      )}</div> : <p className="panel empty-results">{search || category ? "No apps match your search." : "No apps are published yet."}</p>}
      {lastPage > 1 && <nav className={styles.pager} aria-label="Catalog pages">
        <Button variant="secondary" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Previous</Button>
        <span>Page {currentPage} of {lastPage}</span>
        <Button variant="secondary" disabled={currentPage === lastPage} onClick={() => changePage(currentPage + 1)}>Next</Button>
      </nav>}
    </section>
  </div>;
}
