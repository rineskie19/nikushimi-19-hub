"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "./ui/Button";

type EditionTab = { id: string; label: string; content: ReactNode };

export function EditionTabs({ tabs }: { tabs: EditionTab[] }) {
  const first = tabs[0]?.id ?? "";
  const [selected, setSelected] = useState(first);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = tabs.some((tab) => tab.id === selected) ? selected : first;

  useEffect(() => {
    function syncHash() {
      const hash = window.location.hash.slice(1);
      setSelected(tabs.some((tab) => tab.id === hash) ? hash : first);
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [first, tabs]);

  function activate(id: string) {
    setSelected(id);
    if (window.location.hash !== "#" + id) {
      window.history.pushState(window.history.state, "", "#" + id);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const positions: Record<string, number | undefined> = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = positions[event.key];
    if (typeof next !== "number") return;
    event.preventDefault();
    activate(tabs[next].id);
    buttons.current[tabs[next].id]?.focus();
  }

  if (tabs.length < 2) return <div className="edition-panel">{tabs[0]?.content}</div>;

  return <div className="edition-switch">
    <div className="edition-tab-list" role="tablist" aria-label="Choose an edition">
      {tabs.map((tab, index) => <Button key={tab.id} variant="quiet" ref={(node) => { buttons.current[tab.id] = node; }}
        id={tab.id + "-tab"} role="tab" aria-controls={tab.id + "-panel"} aria-selected={tab.id === active}
        tabIndex={tab.id === active ? 0 : -1} onClick={() => activate(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}>
        {tab.label}
      </Button>)}
    </div>
    {tabs.map((tab) => <section className="edition-panel" key={tab.id} id={tab.id + "-panel"}
      role="tabpanel" aria-labelledby={tab.id + "-tab"} hidden={tab.id !== active}>
      {tab.id === active ? tab.content : null}
    </section>)}
  </div>;
}
