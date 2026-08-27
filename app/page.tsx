"use client";

import { useEffect, useRef, useState } from "react";
import {
  Archive,
  CakeSlice,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileLock2,
  FolderOpen,
  PartyPopper,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Screen = "gate" | "scanning" | "records";

const records = [
  {
    number: "01",
    era: "Recent Record",
    title: "The Workplace Crossover Episode",
    src: "./photos/work-group.jpg",
    width: 1536,
    height: 1024,
    alt: "A group of coworkers posing together",
    caption:
      "Thank you for recommending this wonderful place to me. I learned a lot while working there, and I am genuinely grateful for the experience. I am also grateful that I got to work under your leadership. It was great and honestly a lot of fun working with you.",
    stamp: "PERSONAL NOTE: THANK YOU",
  },
  {
    number: "02",
    era: "Recent Record",
    title: "Oʻahu’s Hottest Lighthouse Search",
    src: "./photos/beach-day.jpg",
    width: 1536,
    height: 1152,
    alt: "Two childhood friends taking a cheerful selfie at the beach",
    caption:
      "Karen recommended that we go look for the lighthouse. We found the ocean, one of the locations used for the live-action Lilo & Stitch, and possibly the hottest spot in Oʻahu. The heat felt exactly like the Philippines.",
    stamp: "TEMPERATURE: UNREASONABLE",
  },
  {
    number: "03",
    era: "Recent Record",
    title: "On the Way to the Ranch",
    src: "./photos/walking-selfie.jpg",
    width: 773,
    height: 1536,
    alt: "Two childhood friends taking a playful selfie while walking outdoors",
    caption:
      "This was on the way to the ranch, where I got to touch and feed horses for the first time. Worth the walk, honestly. Also, look at me laughing in the background like I had any idea what was going on.",
    stamp: "FIRST TIME FEEDING HORSES",
  },
  {
    number: "04",
    era: "Recent Record",
    title: "Lunch at the Japanese Restaurant",
    src: "./photos/japanese-dinner.jpg",
    width: 1536,
    height: 1286,
    alt: "Three friends posing together at a Japanese restaurant",
    caption:
      "A full table, chopsticks, and one quick photo before we went back to eating. That is the whole report.",
    stamp: "MEAL STATUS: DOCUMENTED",
  },
  {
    number: "05",
    era: "Older Record: Seminary Days",
    title: "The Chapel Was Closed, Class Was Not",
    src: "./photos/seminary-plaza.jpg",
    width: 1536,
    height: 1152,
    alt: "A seminary class gathered around a table in the town plaza",
    caption:
      "Nobody opened the chapel for us, so seminary class was simply relocated to the town plaza. Improvisation: successful.",
    stamp: "TEMPORARY CLASSROOM: TOWN PLAZA",
  },
];

const confetti = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${(index * 41) % 100}%`,
  delay: `${(index % 8) * 0.07}s`,
  color: ["#ff5d73", "#ffcc33", "#00d3a7", "#5c7cfa", "#ff8f3d"][index % 5],
}));

export default function Home() {
  const [screen, setScreen] = useState<Screen>("gate");
  const [currentRecord, setCurrentRecord] = useState(0);
  const [recordOpen, setRecordOpen] = useState(false);
  const [furthestRecord, setFurthestRecord] = useState(0);
  const [openedRecords, setOpenedRecords] = useState<number[]>([]);
  const [ancientUnlocked, setAncientUnlocked] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [noMoves, setNoMoves] = useState(0);
  const [escapePosition, setEscapePosition] = useState<{ x: number; y: number } | null>(null);
  const escapeButtonRef = useRef<HTMLButtonElement>(null);
  const dodgeLockUntilRef = useRef(0);

  useEffect(() => {
    if (screen !== "scanning") return;
    const timer = window.setTimeout(() => setScreen("records"), 2100);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const openRecord = () => {
    setRecordOpen(true);
    setOpenedRecords((opened) => opened.includes(currentRecord) ? opened : [...opened, currentRecord]);
  };

  const nextRecord = () => {
    const target = currentRecord + 1;
    setRecordOpen(false);
    setCurrentRecord(target);
    setFurthestRecord((furthest) => Math.max(furthest, target));
  };

  const visitRecord = (target: number) => {
    setCurrentRecord(target);
    setRecordOpen(target < records.length && openedRecords.includes(target));
  };

  const restoreAncientRecord = () => {
    setRestoring(true);
    window.setTimeout(() => {
      setRestoring(false);
      setAncientUnlocked(true);
    }, 2400);
  };

  const dodgeButton = (pointerX: number, pointerY: number, force = false) => {
    const button = escapeButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const gapX = Math.max(rect.left - pointerX, 0, pointerX - rect.right);
    const gapY = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom);
    const pointerGap = Math.hypot(gapX, gapY);

    if (!force && pointerGap > 125) return;

    const now = window.performance.now();
    if (now < dodgeLockUntilRef.current) return;
    dodgeLockUntilRef.current = now + 820;

    const margin = 24;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    const requiredPointerGap = Math.min(190, Math.max(95, Math.min(window.innerWidth, window.innerHeight) * .22));
    const requiredTravel = Math.min(165, Math.max(90, Math.min(window.innerWidth, window.innerHeight) * .18));
    const protectedRects = Array.from(document.querySelectorAll<HTMLElement>(
      ".agency-bar, .gate-footer, .gate-card h1, .gate-card .gate-copy, .gate-card .kicker, .gate-card .gate-icon, .gate-card .classified-ribbon, .gate-card .primary-action",
    )).map((element) => element.getBoundingClientRect());
    const clearance = 18;
    let next: { x: number; y: number } | null = null;
    let bestFallback: { position: { x: number; y: number }; score: number } | null = null;

    for (let attempt = 0; attempt < 90; attempt += 1) {
      const candidate = {
        x: margin + Math.random() * Math.max(0, maxX - margin),
        y: margin + Math.random() * Math.max(0, maxY - margin),
      };
      const overlapsProtectedContent = protectedRects.some((protectedRect) => (
        candidate.x < protectedRect.right + clearance
        && candidate.x + rect.width > protectedRect.left - clearance
        && candidate.y < protectedRect.bottom + clearance
        && candidate.y + rect.height > protectedRect.top - clearance
      ));

      if (overlapsProtectedContent) continue;

      const nearestX = Math.max(candidate.x - pointerX, 0, pointerX - (candidate.x + rect.width));
      const nearestY = Math.max(candidate.y - pointerY, 0, pointerY - (candidate.y + rect.height));
      const distanceFromPointer = Math.hypot(nearestX, nearestY);
      const travelDistance = Math.hypot(candidate.x - rect.left, candidate.y - rect.top);
      const score = distanceFromPointer + travelDistance * .35;

      if (!bestFallback || score > bestFallback.score) {
        bestFallback = { position: candidate, score };
      }

      if (distanceFromPointer > requiredPointerGap && travelDistance > requiredTravel) {
        next = candidate;
        break;
      }
    }

    if (!next) {
      next = bestFallback?.position ?? {
        x: pointerX < window.innerWidth / 2 ? maxX * .72 : margin + (maxX - margin) * .12,
        y: pointerY < window.innerHeight / 2 ? maxY * .72 : margin + (maxY - margin) * .12,
      };
    }

    if (escapePosition) {
      setEscapePosition(next);
    } else {
      const target = next;
      setEscapePosition({ x: rect.left, y: rect.top });
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEscapePosition(target));
      });
    }
    setNoMoves((moves) => moves + 1);
  };

  const record = records[currentRecord];
  const regularRecordsDone = currentRecord >= records.length;

  return (
    <main className="site-shell">
      {ancientUnlocked && (
        <div className="confetti-field" aria-hidden="true">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>
      )}

      {screen === "gate" && (
        <section
          className="gate-screen"
          aria-labelledby="gate-title"
          onPointerMove={(event) => {
            if (event.pointerType === "mouse") dodgeButton(event.clientX, event.clientY);
          }}
        >
          <div className="grid-noise" aria-hidden="true" />
          <header className="agency-bar">
            <span><Archive size={17} /> Department of Questionable Records</span>
            <span>Case No. 082700</span>
          </header>

          <div className="gate-card">
            <div className="classified-ribbon">Restricted birthday file</div>
            <ShieldAlert className="gate-icon" size={54} strokeWidth={1.5} />
            <p className="kicker">Identity verification required</p>
            <h1 id="gate-title">Are you the person who unfortunately became older today?</h1>
            <p className="gate-copy">
              A few recovered memories and one old clip that somehow survived.
            </p>

            <div className="gate-actions">
              <Button size="lg" className="primary-action" onClick={() => setScreen("scanning")}>
                Yes, let me in <ChevronRight size={18} />
              </Button>
              <Button
                ref={escapeButtonRef}
                size="lg"
                variant="outline"
                className={`escape-action ${escapePosition ? "is-running" : ""}`}
                style={escapePosition ? {
                  transform: `translate3d(${escapePosition.x}px, ${escapePosition.y}px, 0)`,
                } : undefined}
                onPointerEnter={(event) => dodgeButton(event.clientX, event.clientY, true)}
                onPointerDown={(event) => {
                  event.preventDefault();
                  dodgeButton(event.clientX, event.clientY, true);
                }}
                onClick={(event) => {
                  event.preventDefault();
                  dodgeButton(event.clientX, event.clientY, true);
                }}
              >
                {noMoves === 0 ? "No, I’m still young" : noMoves < 3 ? "Nice try" : "Evidence says otherwise"}
              </Button>
            </div>
          </div>

          <footer className="gate-footer">
            <span>Unauthorized seriousness is prohibited.</span>
            <span>© Ancient Archives</span>
          </footer>
        </section>
      )}

      {screen === "scanning" && (
        <section className="scan-screen" aria-live="polite">
          <div className="scanner-box">
            <ScanLine size={52} />
            <div className="scan-lines" aria-hidden="true"><span /></div>
            <h1>Searching for embarrassing evidence…</h1>
            <ul>
              <li><CheckCircle2 size={16} /> Birthday identity detected</li>
              <li><CheckCircle2 size={16} /> Age successfully ignored</li>
              <li><span className="loading-dot" /> Recovering birthday files</li>
            </ul>
          </div>
        </section>
      )}

      {screen === "records" && (
        <section className="records-screen" aria-labelledby="records-title">
          <header className="records-header">
            <div>
              <p className="kicker"><FolderOpen size={16} /> Recovered birthday files</p>
              <h1 id="records-title">Evidence Locker</h1>
            </div>
            <div className="record-counter">
              {Math.min(currentRecord + 1, records.length + 1)} / {records.length + 1}
            </div>
          </header>

          <nav className="file-side-nav" aria-label="File navigation">
            <div>
              {currentRecord > 0 && (
                <Button
                  variant="outline"
                  className="file-nav-button"
                  onClick={() => visitRecord(currentRecord - 1)}
                  aria-label="Go to previous file"
                >
                  <ChevronLeft size={20} /> <span>Previous</span>
                </Button>
              )}
            </div>
            <div>
              {currentRecord < furthestRecord && (
                <Button
                  variant="outline"
                  className="file-nav-button"
                  onClick={() => visitRecord(currentRecord + 1)}
                  aria-label="Go to next unlocked file"
                >
                  <span>Next</span> <ChevronRight size={20} />
                </Button>
              )}
            </div>
          </nav>

          {!regularRecordsDone && record && (
            <div className={`record-stage ${recordOpen ? "is-open" : "is-sealed"}`}>
              {!recordOpen ? (
                <div className="sealed-file">
                  <div className="folder-tab">FILE {record.number}</div>
                  <FileLock2 size={66} strokeWidth={1.4} />
                  <p>{record.era}</p>
                  <h2>{record.title}</h2>
                  <div className="redacted-lines" aria-hidden="true"><span /><span /><span /></div>
                  <Button className="primary-action" size="lg" onClick={openRecord}>
                    Declassify file {record.number}
                  </Button>
                </div>
              ) : (
                <article className="open-record">
                  <div className="record-photo-wrap">
                    <div className="evidence-tag">Exhibit {record.number}</div>
                    <img
                      src={record.src}
                      alt={record.alt}
                      width={record.width}
                      height={record.height}
                      loading={currentRecord === 0 ? "eager" : "lazy"}
                      className="record-photo"
                    />
                    <div className="stamp">{record.stamp}</div>
                  </div>
                  <div className="record-details">
                    <p className="kicker">{record.era}</p>
                    <h2>{record.title}</h2>
                    <p>{record.caption}</p>
                    <Button className="primary-action" size="lg" onClick={nextRecord}>
                      {currentRecord === records.length - 1 ? "Proceed to final record" : "Open next file"}
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </article>
              )}
            </div>
          )}

          {regularRecordsDone && !ancientUnlocked && (
            <div className="ancient-vault">
              <div className="warning-stripes" aria-hidden="true" />
              <Archive size={62} strokeWidth={1.35} />
              <p className="kicker">One final record remains</p>
              <h2>Retrieved from Mark’s Ancient Archives</h2>
              <dl>
                <div><dt>Condition</dt><dd>Questionable</dd></div>
                <div><dt>Image quality</dt><dd>Archaeological</dd></div>
                <div><dt>Possible origin</dt><dd>Her house, probably</dd></div>
                <div><dt>Recorded activity</dt><dd>Music video preparation, maybe</dd></div>
              </dl>
              {!restoring ? (
                <Button className="danger-action" size="lg" onClick={restoreAncientRecord}>
                  Declassify ancient record
                </Button>
              ) : (
                <div className="restore-panel" role="status">
                  <div className="restore-bar"><span /></div>
                  <p>Restoring artifact…</p>
                  <small>Enhancing 17 remaining pixels • Recovering ancient movement</small>
                </div>
              )}
            </div>
          )}

          {regularRecordsDone && ancientUnlocked && (
            <div className="final-record">
              <div className="final-heading">
                <p className="kicker"><Archive size={16} /> Archival record no. 001</p>
                <h2>Rare moving evidence from the prehistoric era.</h2>
              </div>
              <div className="gif-frame">
                <div className="recording-dot">RECOVERED FOOTAGE</div>
                <img src="./photos/ancient-record.webp" alt="A recovered animated memory from years ago" />
                <div className="gif-metadata">
                  FORMAT: ANIMATED ARTIFACT • QUALITY: 144P-ISH<br />
                  Pastilan, parang walang nagbago sa itsura mo. HAHAHA
                </div>
              </div>
              <p className="gif-caption">
                Archivist’s note: believed to have been recorded at her house while preparing some kind of music video. Further context has been lost to history and my memory.
              </p>
              <div className="birthday-verdict">
                <PartyPopper size={36} />
                <p className="kicker">Investigation complete</p>
                <h2>Somehow, we survived long enough for you to become this old.</h2>
                <p>
                  Happy Hatchday! Another year has been successfully documented and archived. I hope you enjoyed your day in Philippine time, and that you enjoy it even more when the 27th reaches us here in Hawaiʻi.
                </p>
                <div className="case-closed"><CakeSlice size={18} /> CASE CLOSED</div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
