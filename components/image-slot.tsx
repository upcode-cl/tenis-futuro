type ImageSlotProps = {
  label: string;
  hint?: string;
  className?: string;
  /** Cuando exista la imagen en /public, pásala aquí */
  src?: string;
  alt?: string;
  /** dark = overlays sobre foto/hero; light = cards sobre fondo claro */
  tone?: "dark" | "light";
};

export function ImageSlot({
  label,
  hint = "Agregar imagen",
  className = "",
  src,
  alt = "",
  tone = "dark",
}: ImageSlotProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || label}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const isLight = tone === "light";

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed px-4 text-center ${
        isLight
          ? "border-brand-navy/20 bg-brand-slate text-brand-navy"
          : "border-white/40 bg-brand-navy/40 text-white"
      } ${className}`}
      role="img"
      aria-label={label}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isLight ? "text-brand-lime-dark" : "text-brand-lime"
        }`}
      >
        {hint}
      </span>
      <span
        className={`max-w-[14rem] text-sm ${
          isLight ? "text-brand-muted" : "text-white/80"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
