"use client";

import { X } from "lucide-react";
import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* ---------------------------------- Stats --------------------------------- */
export function StatTile({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-soil-500 uppercase">
            {label}
          </p>
          <p className="text-xl leading-tight font-extrabold text-soil-900">
            {value}
            {suffix ? (
              <span className="ml-1 text-xs font-semibold text-soil-400">{suffix}</span>
            ) : null}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------- Layout --------------------------------- */
export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`}>{children}</div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  id,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="mb-4 flex scroll-mt-24 flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 max-w-2xl text-sm text-soil-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold tracking-[0.18em] text-leaf-600 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-soil-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-soil-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------- Buttons -------------------------------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";
  return (
    <button
      className={`${base} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

/* ---------------------------------- Chips --------------------------------- */
const TONES = {
  green: "bg-leaf-100 text-leaf-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  soil: "bg-soil-100 text-soil-700",
  blue: "bg-sky-100 text-sky-800",
} as const;

export function Chip({
  children,
  tone = "soil",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return <span className={`chip ${TONES[tone]} ${className}`}>{children}</span>;
}

export function demandTone(demand: string): keyof typeof TONES {
  if (demand === "tinggi") return "red";
  if (demand === "sedang") return "amber";
  return "green";
}

export const DEMAND_LABEL: Record<string, string> = {
  tinggi: "Kebutuhan hara tinggi",
  sedang: "Kebutuhan hara sedang",
  rendah: "Kebutuhan hara rendah",
};

export const DEMAND_SHORT: Record<string, string> = {
  tinggi: "Hara Tinggi",
  sedang: "Hara Sedang",
  rendah: "Hara Rendah",
};

export const SOIL_IMPACT_LABEL: Record<string, string> = {
  berat: "Menguras tanah",
  netral: "Netral",
  pembenah: "Pembenah tanah",
};

/* --------------------------------- Fields --------------------------------- */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-soil-400">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input ${props.className ?? ""}`} />;
}

/* ---------------------------------- Modal --------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-soil-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className={`animate-fade-up max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 ${
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-soil-900">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-sm text-soil-500">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-soil-400 transition hover:bg-soil-100 hover:text-soil-700"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Feedback -------------------------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-soil-200 bg-soil-50/60 px-6 py-12 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
        {icon}
      </span>
      <h3 className="text-base font-bold text-soil-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-soil-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-soil-100 ${className}`} />;
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-900",
    success: "border-leaf-200 bg-leaf-50 text-leaf-900",
  } as const;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {title ? <p className="font-bold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

/* ---------------------------------- Score --------------------------------- */
export function ScoreRing({
  value,
  size = 68,
  color = "#217f49",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eee8dc"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-extrabold text-soil-900">{value}</span>
        {label ? <span className="text-[9px] text-soil-400">{label}</span> : null}
      </div>
    </div>
  );
}

export function MeterBar({
  value,
  min,
  max,
  ideal,
  color = "#319e5c",
}: {
  value: number;
  min: number;
  max: number;
  ideal?: [number, number];
  color?: string;
}) {
  const span = max - min;
  const clamp = (v: number) => Math.min(100, Math.max(0, ((v - min) / span) * 100));
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-soil-100">
      {ideal ? (
        <div
          className="absolute inset-y-0 bg-leaf-200/70"
          style={{ left: `${clamp(ideal[0])}%`, width: `${clamp(ideal[1]) - clamp(ideal[0])}%` }}
        />
      ) : null}
      <div
        className="absolute inset-y-0 w-1.5 rounded-full"
        style={{ left: `calc(${clamp(value)}% - 3px)`, background: color }}
      />
    </div>
  );
}

/* ---------------------------------- Toast --------------------------------- */
export function Toast({
  message,
  tone = "success",
  onClose,
}: {
  message: string;
  tone?: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-4 bottom-20 z-[60] flex justify-center sm:bottom-6">
      <div
        className={`animate-fade-up flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-xl ${
          tone === "success"
            ? "bg-leaf-700 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
