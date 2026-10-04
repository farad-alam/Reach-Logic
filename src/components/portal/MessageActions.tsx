"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";

interface Props {
  isOwn: boolean;
  canCopy: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// WhatsApp-style chevron + dropdown shown on each message bubble.
export default function MessageActions({ isOwn, canCopy, canEdit, canDelete, onCopy, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!canCopy && !canEdit && !canDelete) return null;

  const toggle = () => {
    if (!open && wrapRef.current) {
      // Open upwards when there isn't enough room below (e.g. last messages).
      const rect = wrapRef.current.getBoundingClientRect();
      const container = wrapRef.current.closest(".thread-messages")?.getBoundingClientRect();
      const bottomLimit = container ? container.bottom : window.innerHeight;
      setOpenUp(bottomLimit - rect.bottom < 150);
    }
    setOpen((o) => !o);
  };

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={wrapRef} className={`message-actions ${open ? "open" : ""}`}>
      <button
        type="button"
        className="message-menu-btn"
        onClick={toggle}
        aria-label="Message options"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className={`message-menu ${isOwn ? "align-right" : "align-left"} ${openUp ? "up" : ""}`}
        >
          {canCopy && (
            <button type="button" role="menuitem" className="message-menu-item" onClick={run(onCopy)}>
              <Copy size={15} /> Copy
            </button>
          )}
          {canEdit && (
            <button type="button" role="menuitem" className="message-menu-item" onClick={run(onEdit)}>
              <Pencil size={15} /> Edit
            </button>
          )}
          {canDelete && (
            <button type="button" role="menuitem" className="message-menu-item danger" onClick={run(onDelete)}>
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
