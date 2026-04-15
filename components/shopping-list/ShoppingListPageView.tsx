"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import type { ShoppingItemDto } from "@/lib/shopping-list/types";

/* ────────────────────────────────────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────────────────────────────────── */

type ShoppingListPageViewProps = {
  initialItems: ShoppingItemDto[];
};

/* ────────────────────────────────────────────────────────────────────────────
 *  Design Tokens (hardcoded for reliability)
 * ────────────────────────────────────────────────────────────────────────── */

const C = {
  bgBase: "#0c0f14",
  bgSurface: "#151921",
  bgElevated: "#1c2130",
  bgCard: "rgba(21, 25, 33, 0.85)",
  bgCardHover: "rgba(34, 40, 58, 0.9)",
  bgInput: "rgba(20, 25, 38, 0.95)",

  accent: "#34d399",
  accentDark: "#059669",
  accentMuted: "rgba(52, 211, 153, 0.12)",
  accentGlow: "rgba(52, 211, 153, 0.35)",
  accentBorder: "rgba(52, 211, 153, 0.2)",

  danger: "#f87171",
  dangerMuted: "rgba(248, 113, 113, 0.1)",
  dangerBorder: "rgba(248, 113, 113, 0.2)",

  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textTertiary: "#64748b",
  textInverse: "#0c0f14",

  borderSubtle: "rgba(148, 163, 184, 0.06)",
  borderDefault: "rgba(148, 163, 184, 0.1)",
  borderStrong: "rgba(148, 163, 184, 0.2)",
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 *  SVG Icons
 * ────────────────────────────────────────────────────────────────────────── */

function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="4" y1="10" x2="16" y2="10" />
    </svg>
  );
}

function IconTrash({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4h12" />
      <path d="M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4" />
      <path d="M12.667 4v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4" />
      <line x1="6.667" y1="7.333" x2="6.667" y2="11.333" />
      <line x1="9.333" y1="7.333" x2="9.333" y2="11.333" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke={C.textTertiary}
        strokeWidth="1"
        opacity="0.25"
      />
      <circle
        cx="40"
        cy="40"
        r="24"
        stroke={C.textTertiary}
        strokeWidth="0.8"
        opacity="0.12"
      />
      <path
        d="M30 32l-4 6v16a3 3 0 003 3h22a3 3 0 003-3V38l-4-6H30z"
        stroke={C.textTertiary}
        strokeWidth="1.5"
        opacity="0.35"
      />
      <line
        x1="26"
        y1="38"
        x2="54"
        y2="38"
        stroke={C.textTertiary}
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path
        d="M45 44a5 5 0 01-10 0"
        stroke={C.accent}
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────────────────────────────────── */

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffD === 1) return "ontem";
  if (diffD < 7) return `${diffD} dias atrás`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function ShoppingListPageView({
  initialItems,
}: ShoppingListPageViewProps) {
  const [itemName, setItemName] = useState("");
  const [items, setItems] = useState<ShoppingItemDto[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  const handleAddItem = useCallback(async () => {
    const normalized = itemName.trim();
    if (!normalized) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/shopping-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });

      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ??
          "Não foi possível criar o item.";
        throw new Error(message);
      }

      const createdItem = (await response.json()) as ShoppingItemDto;
      setItems((current) => [createdItem, ...current]);
      setItemName("");
      inputRef.current?.focus();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar item."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [itemName]);

  const handleRemoveItem = useCallback(async (id: number) => {
    setRemovingId(id);
    setErrorMessage(null);

    await new Promise((r) => setTimeout(r, 280));

    try {
      const response = await fetch(`/api/shopping-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ??
          "Não foi possível remover o item.";
        throw new Error(message);
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao remover item."
      );
    } finally {
      setRemovingId(null);
    }
  }, []);

  const hasText = itemName.trim().length > 0;
  const count = items.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: C.bgBase,
      }}
    >
      {/* ── Ambient Lights ── */}
      <div
        style={{
          position: "absolute",
          top: -140,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          right: -80,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Grid Pattern ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      {/* ── Main Card ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 540,
          animation: "fadeInUp 600ms cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            background: C.bgCard,
            borderRadius: 28,
            border: `1px solid ${C.borderSubtle}`,
            backdropFilter: "blur(40px) saturate(1.4)",
            WebkitBackdropFilter: "blur(40px) saturate(1.4)",
            boxShadow:
              "0 24px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset",
          }}
        >
          {/* ═══ HEADER ═══ */}
          <header
            style={{
              padding: "28px 28px 22px",
              borderBottom: `1px solid ${C.borderSubtle}`,
              background:
                "linear-gradient(145deg, rgba(52,211,153,0.05) 0%, transparent 50%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Logo */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`,
                    color: C.textInverse,
                    boxShadow: `0 8px 28px -6px rgba(52,211,153,0.45), inset 0 1px 0 rgba(255,255,255,0.25)`,
                    flexShrink: 0,
                  }}
                >
                  <IconBag />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: C.accent,
                      marginBottom: 2,
                    }}
                  >
                    Pantry Flow
                  </p>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.textPrimary,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    Lista de Compras
                  </h1>
                </div>
              </div>

              {/* Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 9999,
                  background: C.accentMuted,
                  border: `1px solid ${C.accentBorder}`,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: C.accent,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: C.accent,
                    opacity: 0.7,
                  }}
                >
                  {count === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>
          </header>

          {/* ═══ INPUT SECTION ═══ */}
          <section style={{ padding: "20px 28px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                ref={inputRef}
                id="item-name-input"
                type="text"
                placeholder="O que você precisa comprar?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting) {
                    void handleAddItem();
                  }
                }}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  height: 50,
                  padding: "0 18px",
                  fontSize: 15,
                  fontWeight: 500,
                  color: C.textPrimary,
                  backgroundColor: C.bgInput,
                  border: `1.5px solid ${C.borderDefault}`,
                  borderRadius: 14,
                  outline: "none",
                  transition: "border-color 200ms, box-shadow 200ms",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${C.accentMuted}, 0 0 32px -8px ${C.accentGlow}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.borderDefault;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              <button
                id="add-item-button"
                onClick={() => void handleAddItem()}
                disabled={isSubmitting || !hasText}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: hasText
                    ? "1px solid rgba(255,255,255,0.15)"
                    : `1px solid ${C.borderDefault}`,
                  background: hasText
                    ? `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`
                    : C.bgElevated,
                  color: hasText ? C.textInverse : C.textTertiary,
                  cursor: isSubmitting || !hasText ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.5 : 1,
                  boxShadow: hasText
                    ? `0 8px 24px -6px rgba(52,211,153,0.45)`
                    : "none",
                  transition: "all 250ms cubic-bezier(0.4,0,0.2,1)",
                  flexShrink: 0,
                }}
              >
                <IconPlus />
              </button>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: C.dangerMuted,
                  border: `1px solid ${C.dangerBorder}`,
                  animation: "fadeInDown 250ms cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                <span style={{ fontSize: 14, color: C.danger }}>⚠</span>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.danger,
                    margin: 0,
                  }}
                >
                  {errorMessage}
                </p>
              </div>
            )}
          </section>

          {/* ═══ ITEM LIST ═══ */}
          <section style={{ padding: "0 28px 24px" }}>
            {items.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  padding: "40px 0",
                  animation: "fadeInUp 500ms cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                <div
                  style={{ animation: "float 4s ease-in-out infinite" }}
                >
                  <IconEmpty />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.textSecondary,
                      margin: 0,
                    }}
                  >
                    Sua lista está vazia
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: C.textTertiary,
                      marginTop: 4,
                    }}
                  >
                    Adicione itens para começar a organizar suas compras
                  </p>
                </div>
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {items.map((item, index) => {
                  const isRemoving = removingId === item.id;

                  return (
                    <ListItem
                      key={item.id}
                      item={item}
                      index={index}
                      isRemoving={isRemoving}
                      disabled={isSubmitting || removingId !== null}
                      onRemove={handleRemoveItem}
                    />
                  );
                })}
              </ul>
            )}
          </section>

          {/* ═══ FOOTER ═══ */}
          {items.length > 0 && (
            <footer
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 28px",
                borderTop: `1px solid ${C.borderSubtle}`,
                background: "rgba(12, 15, 20, 0.5)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: C.textTertiary,
                  margin: 0,
                }}
              >
                {count} {count === 1 ? "item" : "itens"} na lista
              </p>

              <div
                style={{
                  flex: 1,
                  maxWidth: 100,
                  height: 3,
                  margin: "0 16px",
                  borderRadius: 9999,
                  background: C.borderSubtle,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 9999,
                    backgroundImage: `linear-gradient(90deg, ${C.accent}, rgba(52,211,153,0.2), ${C.accent})`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.5s ease-in-out infinite",
                    opacity: 0.65,
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: C.textTertiary,
                  opacity: 0.5,
                  margin: 0,
                }}
              >
                Pantry Flow
              </p>
            </footer>
          )}
        </div>

        {/* Keyboard hint */}
        <p
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: C.textTertiary,
            opacity: 0.45,
            animation: "fadeInUp 800ms cubic-bezier(0.34,1.56,0.64,1) 300ms both",
          }}
        >
          Pressione{" "}
          <kbd
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 7px",
              borderRadius: 5,
              border: `1px solid ${C.borderStrong}`,
              background: C.bgElevated,
              color: C.textSecondary,
              fontSize: 10,
              fontFamily: "var(--font-geist-mono), monospace",
              fontWeight: 500,
            }}
          >
            Enter
          </kbd>{" "}
          para adicionar rapidamente
        </p>
      </main>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 *  List Item (separated for hover state management)
 * ────────────────────────────────────────────────────────────────────────── */

function ListItem({
  item,
  index,
  isRemoving,
  disabled,
  onRemove,
}: {
  item: ShoppingItemDto;
  index: number;
  isRemoving: boolean;
  disabled: boolean;
  onRemove: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      style={{
        animation: isRemoving
          ? "slideOut 280ms cubic-bezier(0.4,0,0.2,1) forwards"
          : `fadeInUp 400ms cubic-bezier(0.34,1.56,0.64,1) ${index * 50}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          borderRadius: 14,
          border: `1px solid ${hovered ? C.accentBorder : C.borderSubtle}`,
          background: hovered ? C.bgCardHover : C.bgSurface,
          boxShadow: hovered
            ? "0 8px 32px -8px rgba(0,0,0,0.4)"
            : "none",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          transition: "all 200ms cubic-bezier(0.4,0,0.2,1)",
          cursor: "default",
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: C.accent,
            boxShadow: `0 0 8px ${C.accentGlow}`,
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: C.textPrimary,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: C.textTertiary,
              margin: "2px 0 0",
            }}
          >
            {formatRelativeDate(item.createdAt)}
          </p>
        </div>

        {/* Delete */}
        <DeleteButton
          id={item.id}
          name={item.name}
          visible={hovered}
          disabled={disabled}
          onRemove={onRemove}
        />
      </div>
    </li>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Delete Button (with own hover state)
 * ────────────────────────────────────────────────────────────────────────── */

function DeleteButton({
  id,
  name,
  visible,
  disabled,
  onRemove,
}: {
  id: number;
  name: string;
  visible: boolean;
  disabled: boolean;
  onRemove: (id: number) => void;
}) {
  const [btnHover, setBtnHover] = useState(false);

  return (
    <button
      id={`remove-item-${id}`}
      onClick={() => onRemove(id)}
      disabled={disabled}
      aria-label={`Remover ${name}`}
      onMouseEnter={() => setBtnHover(true)}
      onMouseLeave={() => setBtnHover(false)}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${btnHover ? C.dangerBorder : "transparent"}`,
        background: btnHover ? C.dangerMuted : "transparent",
        color: btnHover ? C.danger : C.textTertiary,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: visible ? 1 : 0,
        transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <IconTrash />
    </button>
  );
}
