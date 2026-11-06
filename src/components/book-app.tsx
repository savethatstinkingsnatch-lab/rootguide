import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chapters, chapterById, recipeCount, type Chapter } from "@/data/book";
import { EDITION } from "@/data/edition";
import { loadLast, saveLast } from "@/lib/press";

type View = { kind: "cover" } | { kind: "contents" } | { kind: "read"; id: string };

const primaryBtn =
  "inline-flex min-h-11 w-full items-center justify-center bg-beet px-5 text-sm tracking-wide text-paper transition-colors duration-200 hover:bg-beet-deep sm:w-auto";
const secondaryBtn =
  "inline-flex min-h-11 w-full items-center justify-center border border-ink px-5 text-sm tracking-wide text-ink transition-colors duration-200 hover:bg-ink hover:text-paper sm:w-auto";
const textBtn = "min-h-11 text-sm text-ink underline decoration-line underline-offset-4";

export function BookApp() {
  const [view, setView] = useState<View>({ kind: "cover" });
  const [last, setLast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLast(loadLast());
    setReady(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (view.kind !== "read") return;
      const index = chapters.findIndex((chapter) => chapter.id === view.id);
      if (event.key === "ArrowRight" && chapters[index + 1]) {
        openChapter(chapters[index + 1].id);
      }
      if (event.key === "ArrowLeft" && chapters[index - 1]) {
        openChapter(chapters[index - 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  function openChapter(id: string) {
    saveLast(id);
    setLast(id);
    setView({ kind: "read", id });
  }

  const chapter = view.kind === "read" ? chapterById(view.id) : undefined;

  return (
    <div className="min-h-screen">
      {view.kind === "cover" ? (
        <Cover
          ready={ready}
          last={last}
          onRead={() => openChapter("start")}
          onContents={() => setView({ kind: "contents" })}
          onContinue={() => last && openChapter(last)}
        />
      ) : null}

      {view.kind === "contents" ? (
        <Contents onCover={() => setView({ kind: "cover" })} onOpen={openChapter} />
      ) : null}

      {view.kind === "read" && chapter ? (
        <Reader chapter={chapter} onContents={() => setView({ kind: "contents" })} onOpen={openChapter} />
      ) : null}
    </div>
  );
}

function Cover({
  ready,
  last,
  onRead,
  onContents,
  onContinue,
}: {
  ready: boolean;
  last: string | null;
  onRead: () => void;
  onContents: () => void;
  onContinue: () => void;
}) {
  return (
    <main className="mx-auto grid max-w-spread items-center gap-10 px-5 py-8 md:grid-cols-2 md:gap-16 md:py-16">
      <div>
        <p className="text-xs tracking-kicker text-beet uppercase">
          {EDITION.press} · Digital edition · {EDITION.year}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight italic md:mt-4 md:text-6xl">{EDITION.title}</h1>
        <p className="mt-4 max-w-md font-display text-2xl leading-snug">{EDITION.subtitle}</p>
        <p className="mt-4 max-w-md text-muted">
          How to grow them, keep them through winter, and cook them when you bring a handful up the stairs.
        </p>
        <dl className="mt-8 grid grid-cols-2 border-y border-line">
          <div className="py-4 pr-3">
            <dt className="text-xs tracking-kicker text-beet uppercase">Chapters</dt>
            <dd className="mt-1 font-display text-2xl tabular-nums">{chapters.length}</dd>
          </div>
          <div className="border-l border-line px-3 py-4">
            <dt className="text-xs tracking-kicker text-beet uppercase">Recipes</dt>
            <dd className="mt-1 font-display text-2xl tabular-nums">{recipeCount}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={primaryBtn} onClick={onRead}>
            Read the book
          </button>
          <button type="button" className={secondaryBtn} onClick={onContents}>
            Contents
          </button>
        </div>
        {ready && last ? (
          <div className="no-print mt-8">
            <button type="button" className={textBtn} onClick={onContinue}>
              Continue
            </button>
          </div>
        ) : null}
        <footer className="mt-8 text-sm text-muted">
          Privacy: This guide does not collect your name, email, or any personal information.
        </footer>
      </div>
      <figure>
        <Plate
          src="/book/cover.jpg"
          alt="Carrots, a cut beet, a potato, a parsnip, garlic, and a radish on a wooden table."
          eager
        />
        <figcaption className="mt-3 text-sm text-muted">
          Carrot, beet, potato, parsnip, garlic, radish.
        </figcaption>
      </figure>
    </main>
  );
}

function Contents({ onCover, onOpen }: { onCover: () => void; onOpen: (id: string) => void }) {
  return (
    <main className="mx-auto max-w-measure px-5 py-10 md:py-16">
      <button type="button" className={`${textBtn} no-print`} onClick={onCover}>
        Cover
      </button>
      <p className="mt-8 text-xs tracking-kicker text-beet uppercase">{EDITION.title}</p>
      <h1 className="mt-2 font-display text-4xl italic md:text-5xl">Contents</h1>
      <ol className="mt-8">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              type="button"
              onClick={() => onOpen(chapter.id)}
              className="flex w-full items-baseline gap-3 border-b border-line py-4 text-left"
            >
              <span className="w-10 shrink-0 font-display text-lg italic text-beet">{chapter.numeral}</span>
              <span className="font-display text-xl">{chapter.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <footer className="mt-10 text-sm text-muted">
        Privacy: This guide does not collect your name, email, or any personal information.
      </footer>
    </main>
  );
}

function Reader({
  chapter,
  onContents,
  onOpen,
}: {
  chapter: Chapter;
  onContents: () => void;
  onOpen: (id: string) => void;
}) {
  const index = chapters.findIndex((item) => item.id === chapter.id);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <>
      <header className="no-print sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-spread items-center justify-between gap-3 px-3 py-2 md:px-5">
          <button type="button" className={`${textBtn} shrink-0`} onClick={onContents}>
            Contents
          </button>
          <p className="truncate text-center text-sm text-muted">{chapter.title}</p>
          <div className="flex shrink-0">
            <IconButton label="Previous chapter" disabled={!prev} onClick={() => prev && onOpen(prev.id)}>
              <ChevronLeft aria-hidden="true" />
            </IconButton>
            <IconButton label="Next chapter" disabled={!next} onClick={() => next && onOpen(next.id)}>
              <ChevronRight aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </header>
      <article className="mx-auto max-w-measure px-5 pt-8 pb-28 md:pb-20">
        <p className="text-xs tracking-kicker text-beet uppercase">{chapter.kicker}</p>
        <p className="mt-4 font-display text-5xl text-beet italic">{chapter.numeral}</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{chapter.title}</h1>
        {chapter.image ? (
          <figure className="my-8">
            <Plate src={chapter.image} alt={chapter.imageAlt ?? ""} />
            {chapter.caption ? <figcaption className="mt-3 text-sm text-muted">{chapter.caption}</figcaption> : null}
          </figure>
        ) : null}
        <p className="drop mt-6 text-lg leading-relaxed">{chapter.lede}</p>
        {chapter.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="mt-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
        {chapter.climates ? (
          <div className="my-8 border-y border-line">
            {chapter.climates.map((climate) => (
              <div key={climate.name} className="border-b border-line py-5 last:border-b-0">
                <h2 className="font-display text-2xl">{climate.name}</h2>
                <p className="mt-1 text-sm text-beet">{climate.range}</p>
                <p className="mt-2 text-muted">{climate.crops}</p>
              </div>
            ))}
          </div>
        ) : null}
        {chapter.storage ? (
          <>
            <StoragePlate storage={chapter.storage} />
            {chapter.storage.method.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="mt-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
            {chapter.storage.apart ? (
              <p className="mt-4 leading-relaxed">
                <span className="font-display text-beet">Keep apart. </span>
                {chapter.storage.apart}
              </p>
            ) : null}
            <p className="mt-6 border-l-2 border-beet pl-4 text-muted">{chapter.storage.watch}</p>
          </>
        ) : null}
        {chapter.recipes
          ? chapter.recipes.map((recipe) => (
              <section key={recipe.title} className="mt-12 border-t border-line pt-8">
                <p className="text-xs tracking-kicker text-beet uppercase">Recipe</p>
                <h2 className="mt-2 font-display text-3xl">{recipe.title}</h2>
                <p className="mt-2 text-sm text-muted">
                  {recipe.serves} · {recipe.time}
                </p>
                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  <ul className="space-y-2">
                    {recipe.ingredients.map((item) => (
                      <li key={item} className="border-b border-line pb-2 leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ol className="space-y-4">
                    {recipe.method.map((step, stepIndex) => (
                      <li key={step.slice(0, 40)} className="flex gap-3 leading-relaxed">
                        <span className="font-display text-lg text-beet tabular-nums">{stepIndex + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                {recipe.note ? <p className="mt-6 text-sm text-muted italic">{recipe.note}</p> : null}
              </section>
            ))
          : null}
        {chapter.menus
          ? chapter.menus.map((menu) => (
              <section key={menu.title} className="mt-12 border-t border-line pt-8">
                <p className="text-xs tracking-kicker text-beet uppercase">Menu</p>
                <h2 className="mt-2 font-display text-3xl">{menu.title}</h2>
                <p className="mt-2 text-sm text-muted">{menu.serves}</p>
                <ul className="mt-4 space-y-2">
                  {menu.dishes.map((dish) => (
                    <li key={dish} className="leading-snug">
                      {dish}
                    </li>
                  ))}
                </ul>
                <ol className="mt-6 space-y-4">
                  {menu.plan.map((step, stepIndex) => (
                    <li key={step.slice(0, 40)} className="flex gap-3 leading-relaxed">
                      <span className="font-display text-lg text-beet tabular-nums">{stepIndex + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))
          : null}
        <nav className="no-print mt-12 hidden items-center justify-between gap-4 border-t border-line pt-6 md:flex">
          {prev ? (
            <button type="button" className={textBtn} onClick={() => onOpen(prev.id)}>
              {prev.numeral}. {prev.title}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button type="button" className={`${textBtn} text-right`} onClick={() => onOpen(next.id)}>
              {next.numeral}. {next.title}
            </button>
          ) : (
            <span />
          )}
        </nav>
        {chapter.id === "about" ? (
          <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
            <p>
              {EDITION.title}. {EDITION.press}, {EDITION.year}.
            </p>
            <p className="mt-3">
              Privacy: This guide does not collect your name, email, or any personal information.
            </p>
          </footer>
        ) : null}
      </article>
      <nav className="dock no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper md:hidden">
        <div className="grid grid-cols-3">
          <button type="button" className="min-h-14 text-sm" onClick={onContents}>
            Contents
          </button>
          <button
            type="button"
            className="min-h-14 border-l border-line text-sm disabled:text-muted"
            disabled={!prev}
            onClick={() => prev && onOpen(prev.id)}
          >
            Previous
          </button>
          <button
            type="button"
            className="min-h-14 border-l border-line text-sm disabled:text-muted"
            disabled={!next}
            onClick={() => next && onOpen(next.id)}
          >
            Next
          </button>
        </div>
      </nav>
    </>
  );
}

function StoragePlate({ storage }: { storage: Chapter["storage"] }) {
  if (!storage) return null;
  const cells = [
    ["Temperature", storage.temp],
    ["Humidity", storage.humidity],
    ["Keeps", storage.keeps],
  ];
  return (
    <div className="my-8 grid border border-line sm:grid-cols-3">
      {cells.map(([label, value], index) => (
        <div
          key={label}
          className={`px-4 py-4 ${index > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""}`}
        >
          <p className="text-xs tracking-kicker text-beet uppercase">{label}</p>
          <p className="mt-2 font-display text-lg leading-snug">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Plate({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full"
      loading={eager ? "eager" : "lazy"}
      onError={() => setOk(false)}
    />
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center text-ink disabled:text-muted"
    >
      {children}
    </button>
  );
}

