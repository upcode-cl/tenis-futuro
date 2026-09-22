"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import type { BankDetails, SupportContent } from "@/lib/cms/types";

type DonationContextValue = {
  enabled: boolean;
  bankDetails: BankDetails;
  openDonationModal: () => void;
};

const DonationContext = createContext<DonationContextValue | null>(null);

export function useDonationAporte() {
  return useContext(DonationContext);
}

function hasBankData(bank: BankDetails) {
  return Boolean(
    bank.bankName.trim() ||
      bank.accountNumber.trim() ||
      bank.rut.trim() ||
      bank.holderName.trim(),
  );
}

export function DonationProvider({
  support,
  children,
}: {
  support: SupportContent;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const enabled = Boolean(support.donationModalEnabled);
  const bankDetails = support.bankDetails;

  const openDonationModal = useCallback(() => {
    if (!enabled) return;
    setOpen(true);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <DonationContext.Provider
      value={{ enabled, bankDetails, openDonationModal }}
    >
      {children}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-brand-navy px-6 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lime">
                  Apóyanos
                </p>
                <h2
                  id={titleId}
                  className="mt-1 text-xl font-extrabold uppercase tracking-tight"
                >
                  Haz tu aporte
                </h2>
                <p className="mt-2 text-sm text-white/75">
                  Transfiere a la cuenta de la fundación con estos datos.
                </p>
              </div>

              <div className="space-y-3 px-6 py-5">
                {hasBankData(bankDetails) ? (
                  <>
                    <BankRow label="Banco" value={bankDetails.bankName} />
                    <BankRow
                      label="Tipo de cuenta"
                      value={bankDetails.accountType}
                    />
                    <BankRow
                      label="Nº de cuenta"
                      value={bankDetails.accountNumber}
                      copyable
                    />
                    <BankRow label="RUT" value={bankDetails.rut} copyable />
                    <BankRow
                      label="Titular"
                      value={bankDetails.holderName}
                    />
                    <BankRow label="Email" value={bankDetails.email} copyable />
                    {bankDetails.notes.trim() ? (
                      <p className="rounded-lg bg-brand-slate/80 px-3 py-2 text-sm leading-relaxed text-brand-navy/80">
                        {bankDetails.notes}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-brand-muted">
                    Los datos bancarios aún no están configurados. Contáctanos
                    para aportar.
                  </p>
                )}
              </div>

              <div className="flex justify-end border-t border-brand-navy/10 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-brand-lime px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DonationContext.Provider>
  );
}

function BankRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const trimmed = value.trim();
  if (!trimmed) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-brand-navy/10 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
        </p>
        <p className="mt-0.5 break-all text-sm font-semibold text-brand-navy">
          {trimmed}
        </p>
      </div>
      {copyable ? (
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-md border border-brand-navy/15 px-2 py-1 text-[11px] font-bold uppercase text-brand-navy transition hover:bg-brand-slate"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      ) : null}
    </div>
  );
}

/** CTA que abre el modal si está habilitado; si no, navega al href de respaldo */
export function DonationAporteButton({
  className,
  children,
  fallbackHref = "#apoyanos",
  onNavigate,
}: {
  className?: string;
  children: ReactNode;
  fallbackHref?: string;
  onNavigate?: () => void;
}) {
  const donation = useDonationAporte();

  if (donation?.enabled) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onNavigate?.();
          donation.openDonationModal();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={fallbackHref}
      className={className}
      onClick={() => onNavigate?.()}
    >
      {children}
    </a>
  );
}
