import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { resolveSiteLogoUrl } from "@/lib/cms/logo";
import { getSiteSettings } from "@/lib/db/cms";
import { getNewsById, listNews } from "@/lib/db/news";
import type { News } from "@/lib/types/news";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsById(id);
  if (!news) return { title: "Noticia | Tenis Futuro" };

  return {
    title: `${news.title} | Tenis Futuro`,
    description: news.summary || news.content.slice(0, 160),
    openGraph: {
      title: news.title,
      description: news.summary,
      images: news.mediaSrc ? [{ url: news.mediaSrc }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const news = await getNewsById(id);
  if (!news || !news.published) notFound();

  const [settings, allNews] = await Promise.all([
    getSiteSettings(),
    listNews({ publishedOnly: true }),
  ]);

  const others = allNews.filter((item) => item.id !== news.id);

  // Divide el contenido en párrafos limpios
  const paragraphs = news.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Header logoSrc={resolveSiteLogoUrl(settings)} />
      <main className="flex-1 bg-brand-slate">
        <article className="mx-auto max-w-4xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
          {/* Botón de regreso */}
          <Link
            href="/#noticias"
            className="mb-8 inline-flex items-center gap-2 rounded-md border border-brand-navy/15 bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-xs transition hover:border-brand-lime hover:bg-brand-lime/20"
          >
            ← Volver a noticias
          </Link>

          {/* Encabezado de la noticia */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted">
              {news.tag && (
                <span className="rounded-md bg-brand-navy px-2.5 py-1 text-brand-lime">
                  {news.tag}
                </span>
              )}
              <span>•</span>
              <time dateTime={news.date}>{formatDate(news.date)}</time>
              {news.author && (
                <>
                  <span>•</span>
                  <span>Por {news.author}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-brand-navy sm:text-4xl md:text-5xl">
              {news.title}
            </h1>

            {news.summary && (
              <p className="text-lg font-medium leading-relaxed text-brand-navy/80 sm:text-xl text-justify text-justify-site border-l-4 border-brand-lime pl-4">
                {news.summary}
              </p>
            )}
          </div>

          {/* Archivo multimedia (Imagen o Video) */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-black shadow-xl aspect-video w-full">
            {news.mediaType === "video" ? (
              <video
                controls
                playsInline
                preload="metadata"
                src={news.mediaSrc}
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={news.mediaSrc || "/LogoTenisFuturo.png"}
                alt={news.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Cuerpo completo de la noticia (con texto justificado) */}
          <div className="mt-10 space-y-6 text-base leading-relaxed text-brand-navy/90 sm:text-lg sm:leading-relaxed">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-justify text-justify-site">
                {para}
              </p>
            ))}
          </div>

          {/* Separador */}
          <div className="my-16 border-t border-brand-navy/15" />

          {/* Sección al final: Otras noticias */}
          {others.length > 0 && (
            <section aria-label="Otras noticias">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                    Sigue leyendo
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
                    Otras Noticias
                  </h2>
                </div>
                <Link
                  href="/#noticias"
                  className="text-xs font-bold uppercase tracking-wider text-brand-navy hover:text-brand-lime-dark"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.slice(0, 3).map((item) => (
                  <OtherNewsCard key={item.id} news={item} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}

function OtherNewsCard({ news }: { news: News }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-brand-navy/10 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/noticias/${news.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/5">
          {news.mediaType === "video" ? (
            <video
              src={news.mediaSrc}
              preload="metadata"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src={news.mediaSrc || "/LogoTenisFuturo.png"}
              alt={news.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}
          {news.tag && (
            <span className="absolute top-2.5 left-2.5 rounded-md bg-brand-navy/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-lime backdrop-blur-xs">
              {news.tag}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <time dateTime={news.date} className="text-[11px] font-semibold text-brand-muted">
            {formatDate(news.date)}
          </time>
          <h3 className="mt-1.5 text-sm font-extrabold uppercase text-brand-navy transition group-hover:text-brand-lime-dark line-clamp-2">
            {news.title}
          </h3>
          <p className="mt-2 flex-1 text-xs leading-relaxed text-brand-navy/70 line-clamp-2 text-justify text-justify-site">
            {news.summary}
          </p>
          <div className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-navy group-hover:text-brand-lime-dark">
            Leer noticia →
          </div>
        </div>
      </Link>
    </article>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
