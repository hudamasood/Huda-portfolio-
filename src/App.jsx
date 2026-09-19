import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import emailjs from "@emailjs/browser";
// ── Global styles ─────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  html, body, #root { background: #0C0C0C; font-family: 'Kanit', sans-serif; }
  .hero-heading {
    background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0C0C0C; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  .tech-pill {
    display: inline-block;
    padding: 4px 13px;
    border-radius: 999px;
    border: 1px solid rgba(215,226,234,0.2);
    color: rgba(215,226,234,0.65);
    font-size: clamp(0.58rem, 0.8vw, 0.72rem);
    font-weight: 400;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .contact-field {
    width: 100%;
    padding: 14px 18px;
    background: rgba(215,226,234,0.04);
    border: 1px solid rgba(215,226,234,0.12);
    border-radius: 14px;
    color: #D7E2EA;
    font-family: 'Kanit', sans-serif;
    font-size: 0.95rem;
    font-weight: 300;
    outline: none;
    transition: border-color 0.25s;
    resize: vertical;
  }
  .contact-field:focus { border-color: rgba(182,0,168,0.5); }
  .contact-field::placeholder { color: rgba(215,226,234,0.28); }
  .footer-link {
    color: rgba(215,226,234,0.5);
    text-decoration: none;
    font-weight: 400;
    font-size: clamp(0.75rem, 1vw, 0.9rem);
    transition: color 0.2s;
  }
  .footer-link:hover { color: #D7E2EA; }
`;


// ── FadeIn ────────────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = "", as = "div" }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}

// ── Magnet ────────────────────────────────────────────────────────────────────
function Magnet({ children, padding = 150, strength = 3, maxX = Infinity, maxY = Infinity }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only for precise pointers, and never when the user prefers reduced motion
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = rect.width / 2 + padding;
      if (dist < threshold) {
        setActive(true);
        setPos({ x: clamp(dx / strength, maxX), y: clamp(dy / strength, maxY) });
      } else {
        setActive(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [padding, strength, maxX, maxY]);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: active ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ── AboutText ─────────────────────────────────────────────────────────────────
// Plain, static paragraph. The previous version split the text into per-character
// spans whose opacity was driven by scroll progress; that scroll-based
// highlighting is removed. Typography and layout are unchanged.
function AnimatedText({ text, className = "" }) {
  return (
    <p className={className} style={{
      color: "#D7E2EA",
      fontWeight: 500,
      textAlign: "center",
      lineHeight: 1.6,
      maxWidth: 560,
      fontSize: "clamp(1rem, 2vw, 1.35rem)",
    }}>
      {text}
    </p>
  );
}
// ── scrollToSection — smooth in-page navigation ───────────────────────────────
// Plain `href="#id"` anchors only scroll when the hash actually changes, so
// clicking a link for the section you are already on does nothing. Handling the
// click directly makes every click scroll, and keeps the URL hash in sync.
function scrollToSection(e, id) {
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

// ── ContactButton — styled to match the GitHub button in AboutSection ─────────
function ContactButton() {
  return (
    <a
      href="#contact"
      onClick={(e) => scrollToSection(e, "contact")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: "9999px",
        border: "2px solid #D7E2EA",
        background: "transparent",
        color: "#D7E2EA",
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        padding: "clamp(10px,1.2vw,16px) clamp(28px,3vw,48px)",
        fontSize: "clamp(0.7rem, 1.1vw, 1rem)",
        textDecoration: "none",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(215,226,234,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      Contact Me
    </a>
  );
}

// ── LiveProjectButton — now accepts an href ───────────────────────────────────
function LiveProjectButton({ href = "#" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        borderRadius: "9999px",
        border: "2px solid #D7E2EA",
        background: "transparent",
        color: "#D7E2EA",
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        padding: "clamp(8px,1vw,14px) clamp(22px,2.5vw,40px)",
        fontSize: "clamp(0.75rem, 1vw, 0.95rem)",
        cursor: "pointer",
        transition: "background 0.2s",
        textDecoration: "none",
        display: "inline-block",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(215,226,234,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      View Project
    </a>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);


// ── HeroSection ───────────────────────────────────────────────────────────────
// Cover-style hero: giant name behind a cutout photo. This is the only place on
// the site that animates (a one-off load sequence, plus the cursor magnet).
const heroStyles = `
  .hero {
    --gutter: clamp(16px, 3vw, 48px);
    --fig-h: 76%;
    --fig-drop: 18px;
    --name-size: clamp(3rem, calc((100cqw - 2 * var(--gutter)) / 5.4), 30rem);
    position: relative;
    height: 100svh;
    min-height: 520px;
    overflow: hidden;
    background: #0C0C0C;
    container-type: inline-size;
    text-align: left;
  }
  .hero-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 42% 58% at calc(50% + var(--nudge, 0px)) 64%, rgba(215,226,234,0.11) 0%, rgba(215,226,234,0) 70%);
  }

  /* nav */
  .hero-nav {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(16px, 2.4vw, 28px) var(--gutter);
  }
  .hero-logo {
    color: #D7E2EA;
    font-weight: 600;
    font-size: clamp(0.85rem, 1.1vw, 1rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .hero-links { display: flex; gap: clamp(16px, 2.5vw, 36px); list-style: none; }
  .hero-links a, .hero-menu-btn {
    color: #D7E2EA;
    font-family: 'Kanit', sans-serif;
    font-size: clamp(0.72rem, 0.9vw, 0.85rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    transition: opacity 180ms;
  }
  .hero-links a:hover, .hero-menu-btn:hover { opacity: 0.7; }
  .hero-menu-btn { display: none; background: none; border: 0; cursor: pointer; padding: 6px 0; }
  .hero-menu-panel { display: none; }

  /* name */
  .hero-name-wrap {
    position: absolute;
    left: 0; right: 0;
    top: calc(100% - 0.76 * var(--fig-h) + var(--fig-drop));
    transform: translateY(-50%);
    z-index: 1;
    padding: 0 var(--gutter);
    text-align: center;
  }
  .hero-name {
    margin: 0;
    font-family: 'Kanit', sans-serif;
    font-weight: 900;
    font-size: var(--name-size);
    line-height: 0.86;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .hero-name-line {
    display: inline-block;
    background: linear-gradient(180deg, #FFFFFF 8%, #BBCCD7 92%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  /* photo */
  .hero-figure {
    position: absolute;
    left: 50%;
    bottom: calc(-1 * var(--fig-drop));
    height: var(--fig-h);
    aspect-ratio: 480 / 546;
    z-index: 2;
    transform: translateX(calc(-50% + var(--nudge, 0px)));
  }
  .hero-figure picture, .hero-figure img { display: block; width: 100%; height: 100%; }
  .hero-scrim {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 26%;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(to top, rgba(12,12,12,0.92) 0%, rgba(12,12,12,0.5) 45%, rgba(12,12,12,0) 100%);
  }

  /* bottom row */
  .hero-role {
    position: absolute;
    left: var(--gutter);
    bottom: var(--gutter);
    z-index: 4;
    color: #D7E2EA;
    font-size: clamp(1rem, 1.7vw, 1.6rem);
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .hero-role span { display: block; }
  .hero-role-strong { font-weight: 600; }
  .hero-role-light { font-weight: 300; font-style: italic; }
  .hero-actions {
    position: absolute;
    right: var(--gutter);
    bottom: var(--gutter);
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hero-arrow {
    width: clamp(44px, 3.6vw, 56px);
    height: clamp(44px, 3.6vw, 56px);
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid #D7E2EA;
    color: #D7E2EA;
    transition: background 180ms;
  }
  .hero-arrow:hover { background: rgba(215,226,234,0.08); }

  .hero a:focus-visible, .hero button:focus-visible {
    outline: 2px solid #D7E2EA;
    outline-offset: 3px;
  }

  /* load sequence: the only animation on the site */
  @keyframes heroRise   { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
  @keyframes heroSettle { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  @keyframes heroFade   { from { opacity: 0; } to { opacity: 1; } }
  .hero-anim-nav   { animation: heroFade 500ms ease-out 0ms both; }
  .hero-anim-name  { animation: heroRise 500ms cubic-bezier(.2,.7,.2,1) 0ms both; }
  .hero-anim-photo { height: 100%; animation: heroSettle 600ms cubic-bezier(.2,.7,.2,1) 300ms both; }
  .hero-anim-ui    { animation: heroFade 400ms ease-out 700ms both; }
  @media (prefers-reduced-motion: reduce) {
    .hero-anim-nav, .hero-anim-name, .hero-anim-photo, .hero-anim-ui { animation: none; }
  }

  /* squarer screens: smaller figure so her head stays about one letter wide */
  @media (max-aspect-ratio: 7/5) {
    .hero { --fig-h: 70%; }
  }

  /* phones and portrait screens: name on two lines, her head just overlaps "HUDA" */
  @media (max-width: 639px), (max-aspect-ratio: 5/6) {
    .hero {
      --fig-h: 64%;
      --name-size: min(calc((100cqw - 2 * var(--gutter)) / 2.8), 17svh);
    }
    .hero-name-line { display: block; }
    /* Her sunglasses just touch the bottom ~18% of "HUDA". The em term accounts
       for the glyphs overhanging this tight (0.86) line box. */
    .hero-name-wrap {
      top: auto;
      bottom: calc(0.98 * var(--fig-h) - var(--fig-drop) - 0.2 * var(--name-size));
      transform: none;
    }
    .hero-scrim { height: 30%; }
  }

  @media (max-width: 767px) {
    .hero-links { display: none; }
    .hero-menu-btn { display: inline-flex; }
    .hero-menu-panel {
      display: block;
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: #0C0C0C;
      border-top: 1px solid rgba(215,226,234,0.12);
      border-bottom: 1px solid rgba(215,226,234,0.12);
      padding: 4px var(--gutter) 12px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 180ms, visibility 0s linear 180ms;
    }
    .hero-menu-panel[data-open="true"] { opacity: 1; visibility: visible; transition: opacity 180ms; }
    .hero-menu-panel a {
      display: block;
      padding: 14px 0;
      color: #D7E2EA;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      border-bottom: 1px solid rgba(215,226,234,0.08);
    }
    .hero-menu-panel a:last-child { border-bottom: 0; }
    .hero-role { font-size: 0.95rem; }
  }
`;

// Head geometry inside huda-cutout.{webp,png}, as fractions of the image width
const HEAD_CENTER = 0.483;
const HEAD_WIDTH = 0.34;

const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

function HeroSection() {
  const navLinks = ["About", "Skills", "Projects", "Contact"];
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const figureRef = useRef(null);
  const lineRef = useRef(null);
  const nameRef = useRef(null);

  // Slide the photo (and the glow behind it) sideways so her head sits over the
  // gap before "HUDA", covering at most the "M" and never the name.
  // Two-line layout stays centred.
  useEffect(() => {
    const hero = heroRef.current;
    const fig = figureRef.current;
    const huda = lineRef.current;
    const name = nameRef.current;
    if (!hero || !fig || !huda || !name) return;

    const place = () => {
      if (getComputedStyle(huda).display === "block") {
        hero.style.setProperty("--nudge", "0px");
        return;
      }
      const heroBox = hero.getBoundingClientRect();
      const figW = fig.getBoundingClientRect().width;
      const fontSize = parseFloat(getComputedStyle(name).fontSize);
      const headW = HEAD_WIDTH * figW;
      const target = huda.getBoundingClientRect().left - 0.03 * fontSize - headW / 2;
      const heroCenter = heroBox.left + heroBox.width / 2;
      let nudge = target - heroCenter - (HEAD_CENTER - 0.5) * figW;
      const limit = 0.2 * heroBox.width;
      nudge = Math.max(-limit, Math.min(limit, nudge));
      hero.style.setProperty("--nudge", `${Math.round(nudge)}px`);
    };

    place();
    // Re-place when the hero resizes, and when Kanit arrives: a font swap changes
    // the heading's width without changing the hero's size.
    const ro = new ResizeObserver(place);
    ro.observe(hero);
    ro.observe(huda);
    document.fonts?.ready.then(place);
    document.fonts?.addEventListener("loadingdone", place);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener("loadingdone", place);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (e, id) => {
    setMenuOpen(false);
    scrollToSection(e, id);
  };

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-glow" aria-hidden="true" />

      <nav className="hero-nav hero-anim-nav" aria-label="Primary">
        <a href="#hero" className="hero-logo" onClick={(e) => go(e, "hero")}>
          Huda Masood
        </a>
        <ul className="hero-links">
          {navLinks.map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} onClick={(e) => go(e, link.toLowerCase())}>
                {link}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="hero-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="hero-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <div id="hero-menu" className="hero-menu-panel" data-open={menuOpen}>
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              tabIndex={menuOpen ? 0 : -1}
              onClick={(e) => go(e, link.toLowerCase())}
            >
              {link}
            </a>
          ))}
        </div>
      </nav>

      <div className="hero-name-wrap">
        <h1 className="hero-name hero-anim-name" ref={nameRef}>
          <span className="hero-name-line">Hi I&apos;m</span>{" "}
          <span className="hero-name-line" ref={lineRef}>Huda</span>
        </h1>
      </div>

      <div className="hero-figure" ref={figureRef}>
        <div className="hero-anim-photo">
          <Magnet padding={150} strength={3} maxX={24} maxY={12}>
            <picture>
              <source srcSet="/huda-cutout.webp" type="image/webp" />
              <img
                src="/huda-cutout.png"
                alt="Huda Masood"
                width={480}
                height={546}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </Magnet>
        </div>
      </div>

      <div className="hero-scrim" aria-hidden="true" />

      <p className="hero-role hero-anim-ui">
        <span className="hero-role-strong">Software</span>
        <span className="hero-role-light">Engineer</span>
      </p>

      <div className="hero-actions hero-anim-ui">
        <a
          href="#projects"
          className="hero-arrow"
          aria-label="See my projects"
          onClick={(e) => scrollToSection(e, "projects")}
        >
          <ArrowDownIcon />
        </a>
        <ContactButton />
      </div>
    </section>
  );
}

// ── MarqueeSection ────────────────────────────────────────────────────────────
const gifImages = [
  // ResolveIQ
  "/project-images/RE.PNG",
  "/project-images/RE2.PNG",
  "/project-images/RE3.PNG",
  // ME. AI Skin & Scalp
  "/project-images/ME1.PNG",
  "/project-images/ME-col1a.jpeg",
  "/project-images/ME-col1b.jpeg",
  "/project-images/ME-col2.jpeg",
  // Job Portal System
  "/project-images/Job-Portal-col1a.jpeg",
  "/project-images/Job-Portal-col1b.jpeg",
  "/project-images/Job-Portal-col2.jpeg",
  // Marrow & Hearth Restaurant
  "/project-images/Restaurant-col1a.jpeg",
  "/project-images/Restaurant-col1b.jpeg",
  "/project-images/Restaurant-col2.jpeg",
];

function MarqueeSection() {
  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(200);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const val = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(val);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep both marquee rows populated and rotate ResolveIQ, ME, Job Portal and
  // Restaurant evenly through each row (three tiles per project) so every
  // project gets equal presence. The original two-line scroll movement is
  // unchanged; row 2 starts on Restaurant so it reads early from either side.
  const row1Base = [
    gifImages[0], gifImages[3], gifImages[7], gifImages[10],
    gifImages[1], gifImages[4], gifImages[8], gifImages[11],
    gifImages[2], gifImages[5], gifImages[9], gifImages[12],
  ];
  const row2Base = [
    gifImages[12], gifImages[2], gifImages[6], gifImages[9],
    gifImages[10], gifImages[0], gifImages[4], gifImages[8],
    gifImages[11], gifImages[1], gifImages[5], gifImages[7],
  ];

  const row1 = [...row1Base, ...row1Base, ...row1Base];
  const row2 = [...row2Base, ...row2Base, ...row2Base];

  const tileStyle = {
    width: 336,
    height: 216,
    borderRadius: 16,
    objectFit: "cover",
    flexShrink: 0,
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#0C0C0C",
        paddingTop: "clamp(80px,10vw,160px)",
        paddingBottom: 40,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          transform: `translateX(${offset - 200}px)`,
          willChange: "transform",
        }}
      >
        {row1.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" style={tileStyle} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          transform: `translateX(${-(offset - 200)}px)`,
          willChange: "transform",
        }}
      >
        {row2.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" style={tileStyle} />
        ))}
      </div>
    </section>
  );
}

// ── AboutSection ──────────────────────────────────────────────────────────────
function AboutSection() {
  const decorImages = [
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png",
      style: { top: "4%", left: "2%" },
      width: "clamp(90px,14vw,210px)",
      delay: 0.1, x: -80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png",
      style: { bottom: "8%", left: "4%" },
      width: "clamp(75px,12vw,180px)",
      delay: 0.25, x: -80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png",
      style: { top: "4%", right: "2%" },
      width: "clamp(90px,14vw,210px)",
      delay: 0.15, x: 80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png",
      style: { bottom: "8%", right: "4%" },
      width: "clamp(100px,15vw,220px)",
      delay: 0.3, x: 80,
    },
  ];

  return (
    <section
      id="about"
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px clamp(20px,5vw,40px)",
        background: "#0C0C0C",
      }}
    >
      {decorImages.map((d, i) => (
        <FadeIn key={i} delay={d.delay} x={d.x} y={0} duration={0.9}>
          <img
            src={d.src}
            alt=""
            style={{
              position: "absolute",
              width: d.width,
              pointerEvents: "none",
              ...d.style,
            }}
          />
        </FadeIn>
      ))}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(32px,5vw,64px)", zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading"
            style={{
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textAlign: "center",
              fontSize: "clamp(3rem, 12vw, 160px)",
            }}
          >
            About me
          </h2>
        </FadeIn>

        <AnimatedText
          text="A Software Engineering graduate from UMT, i build products end to end — React interfaces wired to Django REST APIs and MySQL, shipped and deployed. My work sits where full-stack development meets machine learning and NLP, and i care most about the part where a hard problem turns into something people can actually use. With 2+ years of content writing behind me, i explain what i build as clearly as i build it. Let's make something worth using."
        />

        <FadeIn delay={0.2} y={20}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <ContactButton />
            <a
              href="https://github.com/hudamasood"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: "9999px",
                border: "2px solid #D7E2EA",
                background: "transparent",
                color: "#D7E2EA",
                fontFamily: "'Kanit', sans-serif",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "clamp(10px,1.2vw,16px) clamp(28px,3vw,48px)",
                fontSize: "clamp(0.7rem, 1.1vw, 1rem)",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(215,226,234,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <GithubIcon /> GitHub
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── ServicesSection ───────────────────────────────────────────────────────────
const services = [
  {
    num: "01",
    name: "Full-Stack Web Development",
    desc: "Building complete web products end to end — React, JavaScript, HTML5, CSS3 and Bootstrap on the front, Django REST and MySQL behind it, deployed and running.",
  },
  {
    num: "02",
    name: "Machine Learning & NLP",
    desc: "Applying ML concepts and natural language processing to build intelligent systems, chatbots, and AI-powered pipelines with practical real-world impact.",
  },
  {
    num: "03",
    name: "UI/UX Design",
    desc: "Designing clean, modern, and conversion-focused interfaces with careful attention to layout, typography, accessibility, and user experience.",
  },
  {
    num: "04",
    name: "Content Writing & SEO",
    desc: "Crafting compelling technical and marketing content backed by 2+ years of experience, combining SEO strategy with clear, engaging communication.",
  },
  {
    num: "05",
    name: "Backend & API Engineering",
    desc: "Designing REST APIs, relational schemas, authentication and role-based access with Django and MySQL, plus Java OOP and design patterns for structured, maintainable systems.",
  },
];

function ServicesSection() {
  return (
    <section
      id="skills"
      style={{
        background: "#FFFFFF",
        borderRadius: "60px 60px 0 0",
        padding: "clamp(60px,8vw,128px) clamp(20px,5vw,40px)",
      }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          style={{
            fontWeight: 900,
            textTransform: "uppercase",
            textAlign: "center",
            fontSize: "clamp(3rem, 12vw, 160px)",
            color: "#0C0C0C",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: "clamp(48px,8vw,112px)",
          }}
        >
          Skills
        </h2>
      </FadeIn>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {services.map((s, i) => (
          <FadeIn key={s.num} delay={i * 0.1} y={30}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "clamp(12px,3vw,40px)",
                padding: "clamp(28px,4vw,48px) 0",
                borderBottom: "1px solid rgba(12,12,12,0.15)",
                borderTop: i === 0 ? "1px solid rgba(12,12,12,0.15)" : "none",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(3rem, 10vw, 140px)",
                  color: "#0C0C0C",
                  lineHeight: 1,
                  flexShrink: 0,
                  minWidth: "clamp(60px,10vw,160px)",
                }}
              >
                {s.num}
              </span>
              <div style={{ paddingTop: "clamp(6px,1vw,16px)" }}>
                <p
                  style={{
                    fontWeight: 500,
                    textTransform: "uppercase",
                    fontSize: "clamp(1rem, 2.2vw, 2.1rem)",
                    color: "#0C0C0C",
                    marginBottom: 8,
                  }}
                >
                  {s.name}
                </p>
                <p
                  style={{
                    fontWeight: 300,
                    lineHeight: 1.6,
                    maxWidth: 672,
                    fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)",
                    color: "#0C0C0C",
                    opacity: 0.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ── ProjectsSection — NOW WITH DESCRIPTIONS, TECH STACKS & LINKS ─────────────
const projects = [
  {
    num: "01",
    category: "Final Year Project · 2025",
    name: "ME. AI Skin & Scalp System",
    desc: "An end-to-end personalised dermatology platform analysing user images and medical history to generate adaptive treatment plans. Achieves 90%+ classification accuracy across skin and scalp conditions using a 5-stage vision pipeline with an LLM output layer.",
    tech: ["React", "Django", "MySQL", "EfficientNet-B4", "U-Net", "YOLOv8", "XGBoost", "LLM"],
    link: "https://ai-skin-scalp-personalized-treatmen.vercel.app/",
    images: {
      col1a: "data:image/jpeg;base64,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OsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlNOsQ6+waxDr7DMBZTTrEOvsGsQ6+wzAWU06xDr7BrEOvsMwFlAAIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//Z",
      col1b: "data:image/jpeg;base64,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FjVuZWKNoUzqq6XWOui3Omcqq6XTrotzlM5VV0unXRbnKZyqrpdOui3aFNoVVdLp10W7QptCqrpdOui3aFNoVVdLp10W7QptCqrpdOqqt2hTaFVXS6ddRbtCm0Kqul06qq3aFNoVVdLp10W7QptCqrpdOuot2hTaFVXS6ddVbtCm0Kqul06qLc6xL79KwuinVRJKxRFkEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEXvKz6OXz4ByeqcDZPVV+KU7ppopJGBrQ1oJy3t19ZXMH0Z8sTLTR+BJc1S0uZd7bADfmN/J39NlPwYeWRehpeQfKesxepwmDCZTV0lts0ua1rL6i7iba9Guqj9heU3h0YH4Jm58WbQMuMuT0s17W6L3Qw8+i9FiXIHlPhFO2etwqSNj5xTts9rnOedwABub9BUYxyE5TYBh4r8TwqSGmNryB7X5L7s1ibfamTDzyL0/IDkpFyt5QOpKuSWKjghdNPJGQHADQWJBG8/kVtcruQkmEcrqXB8GMlXFiEbH0bpHNBffeL6DePzCZJy8ci9JX/AEe8qsMw2fEazCJI6anJEj87SWgbzYG5b79yyP0dcrBhHhXwNNzbJtPObny9eS+b8kzB5lF9ArfozkqOT+BVeAtmq67EaczzRSSsaAAAfJvbpPWV5ak5K41XYXPidNQufSwTCB7swBMhIAaG3u43IGnWkuRyEXqKv6O+U+FwxVeI4RKyldI1r3RyMc5tyBrYnLvtquhjn0f4hU8ranDOTmC1jIoYo3ujqpoyWXHS/NYXINhe6Zg8Oi6ON4DinJ2u5li1G+lnLcwDrEOHWCNCFzlQREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBAiIPuHJvlTgFNSckGz4zRxupKGVk4dKBsnFrLB3UdD9y4jeVVJ+wMdOcbZz0Y5tS3bnPstre/XltqvldyoWbpzcj7hW4pyUxbH+UM5xbD5ppYYGwMqqt7KWQBmubIfKsb6a/mul+1+AT43HBBikLmTYQ6A1VK1zm07rjfbVg6RfqX59XRwTH8U5O13PcKq3002XKSLEObvsQdCEunJl9mp63D+TPIXk/UVGKDE6SkxVofVMaS0jyxdt9SG3/I2XM5V49h9LgmPPo8Y5PzMxY+TDTRyyTzg6XcTJZrh12tpu3BfNuUHK/HOU+ybitaZY4dY4mMDGNPXlHSuImM+5OH0vkDjfJ/kvyIxasxCeOorK52xNFFKGzOi837POcb+5d6TlPyWxmDktikVZBh8uFVjWOpqmcGSOGxbqekaNPwuviyXV+ckfY6blVhUmKcuBVY3EaarZlpc01xIMpHkDcfsXbw3GuSOFV4qKfGcKEEtAI2TzVcklU4jWzi42a33b7r4DdSs3Tk+cvrsnK6io6fkNJh9XHVT0V2VUEDsz2sc0NcCB7vktrl/iVJyXrcFwOhquZMdXuxKombHn2d3ktJb0i5OnUAvk+C43X8n8SZiOGzCKpY0ta4sDrAix0KrxTFq7G8Qkr8SqX1NTJbM9/UNwHUFccnw+zY/i3JWahq6ytxXDJKqeSIwy4bO9r5yCNZY72sOm99FnNypweq5XY0ynx/CX01ZSwtENWM0FQQHAjaA+SRe1rHevhSJ08j230nT4BNilCzA6ls5jp8tQIZ3ywsdfQMLju37tNy8SiKyYLciIioIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgtpo2TVUMT3FrXyNa4joBNivRM5HmWJ520sD2VEkeV8JcXND2saQAL73andovMLabiVaxj2tq5rSNDXeWSSBuF94CDtu5HSvIENRdzg2zchdc2Zm1Gg1foOkKZuR5pYqiWeqLgyB8sQjiJzWYHeUdQ3zh8ehedbUTtaWtmkDSQSA82uNxUuqqhweHVErg/wA+8h8r49alV2KbkxJPSxVRq2iGWPaMyRue8gWDrNGpIcQD9p6Fm/kjUQmZ1RUsjigbmdK2NzmnyXOOXrtlIXIdX1ThANu5gp2FkWTycoJud1t5Op3qozzGMMM0hYL2bnNh9iqR2qLk2ytw6GqNVsBIHb2F+Ygv6Bu0jPWrxyLqCwv523KJMoJiPlNIJDgN5Om7r0XnRJIAGiR4A6A4/wDzpVsNdVQPY6Od/wC7dnaHHM0O67HRB18Q5Ky4fh0la6rY5rQHNaWFrnA5d4Ood5Q0+KvfyTZOyF1HVEZ4mH94wkFxaxzrkaN88WB32XCqsQq62R76ioe8yEFwvZpsLDyRpuA6FU2eZrSxs0ga61wHmxtuQrr0fJzn1VVww1lxTythDti7y3Ozam3mtu03JWxNyPfT/wCNiELbZQbMLvKc4NA06Nd/u3Lhx1lRDBLDHO9jJiDIGm2a17XP9R+9YGondlzTSHKAG3edAN1lB6JvImofNshVtBc7yC6I2LfJuSRcDzhYdKxpuR76hpmZV56cBj2uERbnabX37iL/ACXANVUuzZqiU5yHOvIdSNxPvUNqJ2sLGzyNabXaHkA/Yg9I7kXJLMW01QABI2Mh4JyggHMTp16AX6rqmo5KikoauplqzJsoTJGI4zY2LR5R3A+VuXC5zOG5dvLlzB1s5tcdPxR1TUPa9r55XB5u4F5Ices9aDvwcj5JqbaipuXU23YQw2vdt2gb3Os7QCxJVGJ8nBQ00lQ2pF2MEmxc03y5msJzWA85w0XGNRM4NBmkOQWbd50HuUOkkdfNI4301cSqR6J3IyaPZbWtZFtsrWh0Tr5ybBul+npT9jpGUUcstTlkmLGsaW2Aeeg799xY+9eedUTvtnnldlsBd5NrKyKvqoZopWzvLoSDHnOcNtu0Nwg7beSUjInySVAk2ZeyVjGkZHNaSbnX+IEaA7t4XNxnBpsHqGxucZY3NDmyhha03vu+4+/3LTdVVDwQ6eUguLiC82ud5+KiSeab/Fmkfu855O74qCtERUEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEU2WbYZXi7I3uHWGkq4FaK3m0/YycBTm0/YycBTpqKkVvNp+xk4CnNp+xk4CmKKkVvNp+xk4Cp5tP2MnAUxRSiu5tP2MnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAU6aKUV3Np+wk4CnNp+wk4CnTRSiu5tP2EnAU5tP2EnAUxRSiu5tP2EnAU5tP2EnAU6aKUV3Np+wk4CnNp+wk4CmKqlFdzafsJOApzafsJOApiilFdzafsJOApzafsJOApiilFdzafsJOAqObT9hJwFOmipFbzafsJOApzafsJOAp00VIrebT9hJwFTzafsJOApiilFdzafsJOApzafsJOApiopRXc2n7CTgKrc0tNnAg9RSzAxREUUREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARFIQdHCqJs7jLILtabAdZXbaANALLSwf6gP5yugxhke1jRcuNgv3fpNvTp2pqxzWUXKLqtoaZgyuYZCN7i4i59wCnmlL6uON3evp69I5V01W5W0bIoxNDcNvZzSb2PRqtvAOT8mPPqGx1McIgaHG7HPc65to1uth0noVuvTp09V9kchTqvQfsbXbWAbWN0M8JkbK3cTlLsoBILt2pG660K7AMUwx8LKumyOneWRhsjX3cLeT5JNjqNPepp3tvVcSrhzkXoazkVitPiZoafZVThE2TaMeGN1dltdxGodoqqfkliswa+WJsELi9u0c4Os5rXGxANxfIQk3tqzOTFcRTquxHyTxyWQxtohmBIN5WAaNDib31FnDXdqsp+SeKRU3OGQiSNkIlldma0MvfQa+Vu6FrvbXtmDi6qbqEXfERN0RSriB9qXKIriCdUuiJiBqp1RFZIJuU1UKVcBqmqKVcBqp1RExEFOqhSrgFKhSmIGqXRFcCdVNyoUpgPtUoiuBKaoiYBalfh0FdCWuYA+3kvA1BW2pAWNe3p3NN06oPAyxuikdG4WLTYrBbuLADFKn/AKhWkvHa5jVY2IiLCiIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgKQoUhWDv4P8AUB/O5dWj+uwf9RvzXLwb6gP53LowybKZklr5HB1vgV6D6b/ZjD0+D0zKqtIfEZ9lG6UQA2MxH8A+PyXQrKenkdJhUcAilpmOnhcNXatzvjf7wNAei3vXCZaQZ4XB7TqCDu7l0H4lVOgfGyCnidK3JLLHGGve3qJ9/Ta11y16NV1ZiuRW/UX/AMzf+6pwvGKvCHvfSiEl5af3sQfYtN2kX3EFZ4hK1sGxzAvc4EgG+UDr+9V4fLQxMnFWxzjIzIzK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",
      col2: "data:image/jpeg;base64,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",
    },
  },
  {
    num: "02",
    category: "Web Development Project",
    name: "Marrow & Hearth Restaurant",
    desc: "A restaurant web experience built around three kitchens and a single hearth. Scroll-driven storytelling, a filterable signature-dish menu, room and event enquiry cards, a full gallery, and a reservation flow with date and party-size selection — fully responsive and deployed on Vercel.",
    tech: ["React", "Vite", "Framer Motion", "Responsive Design", "UI/UX", "Vercel"],
    link: "https://restaurants-sandy-seven.vercel.app/",
    images: {
      col1a: "/project-images/Restaurant-col1a.jpeg",
      col1b: "/project-images/Restaurant-col1b.jpeg",
      col2: "/project-images/Restaurant-col2.jpeg",
    },
  },
  {
    num: "03",
    category: "Academic Project",
    name: "Job Portal System",
    desc: "A responsive job portal featuring role-based access for Job Seekers, Employers, and Admins. Includes job posting, application tracking, messaging, interactive dashboards, and backend integration built with Java using OOP and design patterns.",
    tech: ["HTML", "CSS", "JavaScript", "Java", "OOP", "Design Patterns"],
    link: "https://github.com/hudamasood",
    images: {
      col1a: "data:image/jpeg;base64,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",
      col1b: "data:image/jpeg;base64,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fVL8gghDuiHdBI2KhSNioQS77xUKbjxH1S45fVEQim45fVLjl9UVCKbjl9UuOX1QQu1huK01NTUzJZ5ozCXhzGRZswc4ElpzDK6123tpfRca45fVLjl9UGUsjpZnyvJc57i4lxuSvU0XbGiiw2loqzCu8NpYmtYXEPaXBpGYtdp46Wtub62K8pccvqlxy+qD18Pa7BKZkBp8BMM0MZaZWiMudcEWuRoNb3HtaAXVPD+0eHQYVTUVbh00/Aj4YY2UCI+0SX5fF9jbUEaA6WXnLjl9UuOX1UwetpO1mD0Ts0OCua5jS1jxw8xBaWkE20ve5LbHTzXDxzEaTEq1k1FQso4mxhnDYxrdvTflffRc645fVLjl9VRCKbjl9UuOX1QQim45fVLjl9UEIpuOX1S45fVBHh80U35BQgk7lQpO5UIkCIiKIiICIiAiIgIiIMovxW+qvqhF+K31V9Z39rVzzuVCHc+qLRBERAREQEREBERAREQBuFNioRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBNj+ylj+yoRBJ8Ag3UIgmxSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmx/ZSx/ZUIgmxUHdEQSPFLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLH9lQiCbH9lLc1CIB3REQEREBERAREQEREBERBlF+K31V9UIvxW+qvrO/tauedyoUndRZdoIlksqCJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLICJZLIMovxW+qvqjH+I31V5ZX9rVzzuil4LXuaRYg2IULRBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREGUf4jfVXlRj/Eb6rvSUuGtwttSyukdUONu78MXB8bm+3ms7+1q8+dyiItEEREBERAREQEREBERAREQbWtBpnOsL33stSIup+gREXIIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIMo/xG+qvIizv7Wr/2Q==",
      col2: "data:image/jpeg;base64,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ans+aaGokNfA/gNDnBgJve9rH6brKHAOLTQTOnEZcwPkY7durj/+ILQLE+ZXX0+hze3/ACZLyH9n6f1pf2T+z9P60v7L12JYB3OGoqGVDXMifpG5pDspcQL9Pre64614+m6Tlja1HnMTwplFC2WORzgXZSHBc1eix/8A4Bv/AKg/kV51fD/iHFTi5+2kZBAiIvAoiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIMovzW+6vqhF+a33V9Z39rVzzuVCk7lQtEEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQehwOaPuBYXtDmvJIJtuulxI/UZ+oLxiWX2OH+KTx8cU7dxMez4kfqM/UE4rCbmRpJ/zBeMsllp+MT+z7mPZiZjXBwkaCDcHMNFlJUCaV8skzXve4uc4uFyTuV4qyWU/F/O9n3Mez4kfqM/UE4kfxs/UF4yyWV/GJ/Z9zHs+JH6jP1BOJH6jP1BeMslk/GJ/Z9zHfx6WM0bGB7S4vBsDfSxXARF8zqeeefk75jAREXmUREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREGUX5rfdX1Qi/Nb7q+s7+1q553KhSdyoWiCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIMovzW+6vqhF+a33V9Z39rVzzuVCk7lQtEEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQZRfmt91fVCL81vur6zv7WrnncqFJ3KhaIIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAuhgWDz4/jEGF00sMU1QSGOmJDbgE2uAeS56t4RXvwvGKOvYSHU07JNPkRf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sdTa/nyuhrnIunHHhJe0vksBbOAXam7dtNrZlEQwp7W8S7HBoOhcQXeK4PyHhQ1zUV2tjo2QRvp2uDpSSGudezQSL/X+ipICIiKIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIMovzW+6vqhF+a33V9Z39rVzzuVCk7lQtEEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQZRfmt91fVCL81vur6zv7WrnHcopO5ULRBERAREQEREBERAREQEseSDcIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiix5Ig3QEQ7oNwgWPJTY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiBY8kQbod0BLHkg3CIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HoljyPRQiCbHkeiWPI9FCIJseR6JY8j0UIgmx5HooseSIN0BFJ3UICIiAiIgIiICIiAiIgyi/Nb7q+qEX5rfdX1nf2tXPO5UKTuVC0QREQEREBERAREQEREAbj3RBuPdESGUUb5pGxxtLnO2AVnuF3ZG1VO6X4A/z5X2SguWVTWfmmE5bb762+iqAXsB9LLeIrWsTMbolzXMeWvBa5psQfJQreJf8AFAE3eI2iT/mtqqiz5K9l5qCIi4UREQEREBERAREQEREBERAREQEREEncqBuPdSdyoG490cizhhknkEcTC5x1sFgrWH6yTAbmB9ui04qxa8RKsvu8D+G6pibOdo76exdsCq89PLTPDZWFpIuNb3C1q1V6UtGPPhE//IrSey9ZmIzBVREXnUREQERE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EU2KWKCEU2KWKCEU2KWKCEU2KWN0A7lQh1KIgiIiiIiAiIgIiICIiDKL81vur6oRfmt91fWd/a1USw33CjIeYV6leyE1LJmMu6F7RnbctdbS3I381dfVQQP8EkMvCgcA4MbaV5OmltALm19dF3Hpw4nDPMJwzzC7THUIpIYnyQnKWZrDUkOcXm9tQW2A56KTPStxGmmc6mkaLtm8F2m5dY2t5NsL81RxOGeYThnmF2sNkoomEVbocjshA/GQ4EXJFrjrbca3VqGqwsOh7y6B4DQKm0f432bZw02BBva3nzQebyHmE4Z5hejY2jlNyY3vfARNJE0WbkYS5w08yWi/nY81rY3B2skiL48r3Nv/ABHaNDjqDb8Vje2yDgcM8wnDPMLq0UeGSMd3l74/G3xOdra+tgP5lXKf7jhljlLnhwk8XjzBg02H+IHxfPbVB57hnmE4ZtuF3RFgTWi73P8AEdpCLAfh+eo300OioVraUNhdTWBcz+IwOLsrvdBz0RTlPJHSEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TyTKeSCEU5TySxHkghERARTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTlPJMp5IIRTYjyUICIpynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8kynkghFOU8ksR5IIREQEREBERAREQEREBERBlF+a33V9UI/zG+678lLhrcLbUsrpHVDjbu/DFwfO5vt81nf2tXEREXbgREQERED+qlEQQiIgIdkRBp80KIq6EREBERAREQEREBERAREQEREBERAREQEREBS3dEQQnmiIBREQEREBERAREQEREBERAREQEREBERAREQEREEt3UIiB5oURAREQEREBERAREQEREBERAREQEREBERAREQFLd0RBCIiAiIgIiICIiAiIgIiIMovzW+6voizv7Wr/9k=",
    },
  },
];

function ProjectCard({ project, index, totalCards, progress }) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / totalCards, (index + 1) / totalCards], [1, targetScale]);
  const br = "clamp(24px,4vw,60px)";

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <motion.div
        style={{
          position: "sticky",
          top: `calc(96px + ${index * 28}px)`,
          width: "100%",
          maxWidth: 1100,
          scale,
          transformOrigin: "top center",
          borderRadius: br,
          border: "2px solid #D7E2EA",
          background: "#0C0C0C",
          padding: "clamp(16px,3vw,32px)",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "clamp(8px,1.2vw,16px)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(8px,2vw,24px)" }}>
            <span
              style={{
                fontWeight: 900,
                fontSize: "clamp(3rem, 8vw, 120px)",
                color: "#D7E2EA",
                lineHeight: 1,
                fontFamily: "'Kanit', sans-serif",
              }}
            >
              {project.num}
            </span>
            <div>
              <p
                style={{
                  color: "#D7E2EA",
                  opacity: 0.5,
                  fontSize: "clamp(0.7rem, 1.2vw, 1rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 400,
                }}
              >
                {project.category}
              </p>
              <p
                style={{
                  color: "#D7E2EA",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 2.5vw, 2.2rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {project.name}
              </p>
            </div>
          </div>
          <LiveProjectButton href={project.link} />
        </div>

        {/* Description */}
        <p style={{
          color: "rgba(215,226,234,0.6)",
          fontWeight: 300,
          fontSize: "clamp(0.8rem, 1.2vw, 1rem)",
          lineHeight: 1.6,
          maxWidth: 800,
          marginBottom: "clamp(8px,1vw,14px)",
        }}>
          {project.desc}
        </p>

        {/* Tech pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "clamp(12px,1.5vw,20px)" }}>
          {project.tech.map((t) => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>

        {/* Image grid */}
        <div style={{ display: "flex", gap: "clamp(8px,1.5vw,16px)" }}>
          <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,16px)" }}>
            <img src={project.images.col1a} alt="" style={{ width: "100%", height: "clamp(110px,14vw,200px)", objectFit: "cover", borderRadius: br }} />
            <img src={project.images.col1b} alt="" style={{ width: "100%", height: "clamp(130px,18vw,280px)", objectFit: "cover", borderRadius: br }} />
          </div>
          <div style={{ flex: "0 0 calc(60% - clamp(8px,1.5vw,16px))" }}>
            <img src={project.images.col2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: br }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  return (
    <section
      id="projects"
      ref={containerRef}
      style={{
        background: "#0C0C0C",
        borderRadius: "60px 60px 0 0",
        marginTop: "clamp(-40px,-4vw,-56px)",
        zIndex: 10,
        position: "relative",
        padding: "clamp(60px,8vw,128px) clamp(20px,5vw,40px) 80px",
      }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading"
          style={{
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textAlign: "center",
            fontSize: "clamp(3rem, 12vw, 160px)",
            marginBottom: "clamp(48px,8vw,112px)",
          }}
        >
          Projects
        </h2>
      </FadeIn>

      {projects.map((p, i) => (
        <ProjectCard key={p.num} project={p} index={i} totalCards={projects.length} progress={scrollYProgress} />
      ))}
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);

    try {
      await emailjs.sendForm(
        "service_m1gbfa5",
        "template_9tplor9",
        form.current,
        {
          publicKey: "DkJJZhtgtVWFQEwAH",
        }
      );

      setSent(true);
      form.current.reset();

      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Email sending failed:", error);
      alert("Sorry, your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        background: "#FFFFFF",
        borderRadius: "60px 60px 0 0",
        padding: "clamp(60px,8vw,128px) clamp(20px,5vw,40px)",
        position: "relative",
        zIndex: 11,
      }}
    >
      {/* CONTACT ME */}
      <FadeIn delay={0} y={40}>
        <h2
          style={{
            fontWeight: 900,
            textTransform: "uppercase",
            textAlign: "center",
            fontSize: "clamp(3rem, 12vw, 160px)",
            color: "#0C0C0C",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: "clamp(18px,2vw,28px)",
          }}
        >
          Contact Me
        </h2>
      </FadeIn>

      {/* DESCRIPTION UNDER CONTACT ME */}
      <FadeIn delay={0.05} y={20}>
        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            marginBottom: "clamp(50px,7vw,80px)",
            textAlign: "center",
            fontSize: "clamp(1rem,1.8vw,1.4rem)",
            color: "#0C0C0C",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Have a project in mind or just want to say hello? I'd love to hear
          from you. Let's create something amazing together.
        </p>
      </FadeIn>

      {/* CONTACT INFORMATION + FORM */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* MY CONTACT INFORMATION */}
        <FadeIn delay={0.1} y={30}>
          <div
            style={{
              width: "100%",
              marginBottom: 50,
            }}
          >
            <h3
              style={{
                fontSize: "clamp(1.8rem,4vw,3rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#0C0C0C",
                marginBottom: 30,
                letterSpacing: "-0.02em",
                textAlign: "left",
              }}
            >
              My Contact Information
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 18,
              }}
            >
              {[
                {
                  icon: <MailIcon />,
                  text: "hudamasood686@gmail.com",
                  href: "mailto:hudamasood686@gmail.com",
                },
                {
                  icon: <PhoneIcon />,
                  text: "+92 301 3636199",
                  href: "tel:+923013636199",
                },
                {
                  icon: <LocationIcon />,
                  text: "Lahore, Pakistan",
                  href: null,
                },
                {
                  icon: <LinkedInIcon />,
                  text: "LinkedIn Profile",
                  href: "https://linkedin.com/in/huda-masood-developer/",
                },
                {
                  icon: <GithubIcon />,
                  text: "github.com/hudamasood",
                  href: "https://github.com/hudamasood",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "#0C0C0C",
                  }}
                >
                  <span style={{ opacity: 0.5 }}>
                    {item.icon}
                  </span>

                  {item.href ? (
                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      style={{
                        color: "#0C0C0C",
                        textDecoration: "none",
                        fontWeight: 300,
                        fontSize:
                          "clamp(0.85rem,1.2vw,1.05rem)",
                        borderBottom:
                          "1px solid rgba(12,12,12,0.15)",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(12,12,12,0.6)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(12,12,12,0.15)")
                      }
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span
                      style={{
                        fontWeight: 300,
                        fontSize:
                          "clamp(0.85rem,1.2vw,1.05rem)",
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* CONTACT FORM UNDER CONTACT INFORMATION */}
        <FadeIn delay={0.2} y={30}>
          <div
            style={{
              width: "100%",
              background: "#0C0C0C",
              borderRadius: 28,
              padding: "clamp(24px,3vw,40px)",
            }}
          >
            {sent ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 48 }}>✓</span>

                <p
                  style={{
                    color: "#D7E2EA",
                    fontWeight: 500,
                    fontSize: "1.1rem",
                    textAlign: "center",
                  }}
                >
                  Message sent! I'll get back to you soon.
                </p>
              </div>
            ) : (
              <form
                ref={form}
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <input
                  className="contact-field"
                  name="name"
                  placeholder="Your Name"
                  required
                />

                <input
                  className="contact-field"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                />

                <input
                  className="contact-field"
                  name="subject"
                  placeholder="Subject"
                  required
                />

                <textarea
                  className="contact-field"
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  style={{ resize: "vertical" }}
                  required
                />

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background:
                      "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                    border: "none",
                    borderRadius: 14,
                    color: "white",
                    fontFamily: "'Kanit', sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: sending
                      ? "not-allowed"
                      : "pointer",
                    transition: "opacity 0.2s",
                    opacity: sending ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) {
                      e.currentTarget.style.opacity = "0.85";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
// ── Footer — NEW ──────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: "#0C0C0C",
      borderTop: "1px solid rgba(215,226,234,0.08)",
      padding: "clamp(32px,4vw,56px) clamp(20px,5vw,48px)",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
      }}>
        <p style={{
          color: "rgba(215,226,234,0.4)",
          fontSize: "clamp(0.8rem,1vw,0.95rem)",
          fontWeight: 300,
        }}>
          © 2025 Huda Masood — Built with passion.
        </p>

        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[
            { icon: <GithubIcon />, href: "https://github.com/hudamasood" },
            { icon: <LinkedInIcon />, href: "https://linkedin.com/in/huda-masood-developer/" },
            { icon: <MailIcon />, href: "mailto:hudamasood686@gmail.com" },
          ].map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              style={{ color: "rgba(215,226,234,0.5)", transition: "opacity 0.2s" }}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <a
          href="#hero"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(215,226,234,0.4)",
            textDecoration: "none",
            fontSize: "clamp(0.75rem,0.9vw,0.85rem)",
            fontWeight: 400,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#D7E2EA"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(215,226,234,0.4)"}
        >
          <ArrowUpIcon /> Back to top
        </a>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{globalStyles + heroStyles}</style>
      <div style={{ overflowX: "clip", background: "#0C0C0C" }}>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
