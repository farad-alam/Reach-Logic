"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Plus, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  currentDesignation: string | null;
  existingDesignations: string[];
}

export default function DesignationDropdown({ userId, currentDesignation, existingDesignations }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const options = Array.from(new Set([
    "Growth Strategist",
    "Ads Specialist",
    "Web Developer",
    "SEO Specialist",
    "Video Editor",
    "Senior Manager",
    ...existingDesignations
  ])).filter(Boolean);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function updateDesignation(val: string) {
    if (loading) return;
    setLoading(true);
    setOpen(false);
    
    try {
      const res = await fetch(`/api/portal/team/${userId}/designation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designation: val }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update designation");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update designation");
    } finally {
      setLoading(false);
    }
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customVal.trim()) return;
    updateDesignation(customVal.trim());
    setCustomVal("");
  }

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 12px",
          background: "#fff",
          border: "1px solid var(--neutral-200)",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: currentDesignation ? "var(--neutral-900)" : "var(--neutral-500)",
          cursor: loading ? "not-allowed" : "pointer",
          width: 220,
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : (currentDesignation || "Select designation")}
        </span>
        <ChevronDown size={14} color="var(--neutral-500)" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 4,
          width: 260,
          background: "#fff",
          border: "1px solid var(--neutral-200)",
          borderRadius: 12,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          zIndex: 50,
          padding: "8px 0",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 700, color: "var(--neutral-500)", letterSpacing: "0.05em" }}>
            DESIGNATION
          </div>
          
          <div style={{ maxHeight: 200, overflowY: "auto", paddingBottom: 8 }}>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => updateDesignation(opt)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 16px",
                  background: opt === currentDesignation ? "#f0fdf4" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 500,
                  color: opt === currentDesignation ? "#15803d" : "var(--neutral-900)",
                }}
              >
                {opt}
                {opt === currentDesignation && <Check size={14} color="#15803d" />}
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--neutral-100)", padding: "12px 16px 4px" }}>
            <form onSubmit={handleAddCustom} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="+ Add custom designation"
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  fontSize: 12,
                  border: "1px dashed var(--neutral-300)",
                  borderRadius: 6,
                  outline: "none",
                  width: 10,
                }}
              />
              <button
                type="submit"
                disabled={!customVal.trim()}
                style={{
                  background: "var(--brand-dark)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: customVal.trim() ? "pointer" : "not-allowed",
                  opacity: customVal.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
