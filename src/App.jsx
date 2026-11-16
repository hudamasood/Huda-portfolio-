import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
// Side-by-side cover: name and role on the left, a square portrait on the right.
// This is the only place on the site that animates (a one-off load sequence).
const heroStyles = `
  .hero {
    --gutter: clamp(16px, 3vw, 48px);
    position: relative;
    min-height: 100svh;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #0C0C0C;
    text-align: left;
  }
  .hero-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 38% 48% at 72% 52%, rgba(215,226,234,0.10) 0%, rgba(215,226,234,0) 70%);
  }
  .hero-inner {
    width: min(1200px, 100% - 2 * var(--gutter));
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(28px, 5vw, 72px);
    padding: clamp(96px, 12vh, 140px) 0 clamp(32px, 6vh, 64px);
    z-index: 1;
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
  .hero-name {
    margin: 0;
    font-family: 'Kanit', sans-serif;
    font-weight: 900;
    font-size: clamp(2.6rem, 7.5vw, 6.5rem);
    line-height: 0.92;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }
  .hero-name-line {
    display: block;
    background: linear-gradient(180deg, #FFFFFF 10%, #BBCCD7 92%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  .hero-role {
    margin-top: clamp(16px, 2.2vw, 28px);
    color: #D7E2EA;
    font-size: clamp(1rem, 1.6vw, 1.45rem);
    line-height: 1.15;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .hero-role span { display: block; }
  .hero-role-strong { font-weight: 600; }
  .hero-role-light { font-weight: 300; font-style: italic; }
  .hero-actions {
    margin-top: clamp(22px, 3vw, 36px);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .hero-arrow {
    width: clamp(44px, 3.6vw, 56px);
    height: clamp(44px, 3.6vw, 56px);
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid #D7E2EA;
    color: #D7E2EA;
    transition: background 180ms;
  }
  .hero-arrow:hover { background: rgba(215,226,234,0.08); }

  /* square portrait — capped at its true 440px so it is never enlarged */
  .hero-photo {
    width: clamp(200px, 36vw, 440px);
    aspect-ratio: 1 / 1;
    border-radius: clamp(20px, 2.4vw, 32px);
    overflow: hidden;
    border: 1px solid rgba(215,226,234,0.14);
    justify-self: end;
  }
  .hero-photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero a:focus-visible, .hero button:focus-visible {
    outline: 2px solid #D7E2EA;
    outline-offset: 3px;
  }

  /* load sequence: the only animation on the site */
  @keyframes heroRise   { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  @keyframes heroSettle { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes heroFade   { from { opacity: 0; } to { opacity: 1; } }
  .hero-anim-nav   { animation: heroFade 500ms ease-out 0ms both; }
  .hero-anim-name  { animation: heroRise 500ms cubic-bezier(.2,.7,.2,1) 0ms both; }
  .hero-anim-photo { animation: heroSettle 600ms cubic-bezier(.2,.7,.2,1) 300ms both; }
  .hero-anim-ui    { animation: heroFade 400ms ease-out 700ms both; }
  @media (prefers-reduced-motion: reduce) {
    .hero-anim-nav, .hero-anim-name, .hero-anim-photo, .hero-anim-ui { animation: none; }
  }

  /* stack: name and role, then the portrait, then the buttons */
  @media (max-width: 860px) {
    .hero-inner {
      grid-template-columns: minmax(0, 1fr);
      justify-items: start;
      gap: clamp(22px, 4vw, 32px);
    }
    .hero-photo { justify-self: stretch; width: 100%; max-width: 440px; order: 2; }
    .hero-copy { display: contents; }
    .hero-name-block { order: 1; }
    .hero-actions { order: 3; margin-top: 0; }
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
  }
`;

const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

function HeroSection() {
  const navLinks = ["About", "Skills", "Projects", "Contact"];
  const [menuOpen, setMenuOpen] = useState(false);

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
    <section id="hero" className="hero">
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

      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-name-block hero-anim-name">
            <h1 className="hero-name">
              <span className="hero-name-line">Hi I&apos;m</span>
              <span className="hero-name-line">Huda</span>
            </h1>
            <p className="hero-role">
              <span className="hero-role-strong">Software</span>
              <span className="hero-role-light">Engineer</span>
            </p>
          </div>

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
        </div>

        <div className="hero-photo hero-anim-photo">
          <Magnet padding={120} strength={6} maxX={14} maxY={10}>
            <img
              src="/huda-square.jpg"
              alt="Huda Masood"
              width={440}
              height={440}
              fetchPriority="high"
              decoding="async"
            />
          </Magnet>
        </div>
      </div>
    </section>
  );
}

// ── AboutSection ──────────────────────────────────────────────────────────────
function AboutSection() {

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
    desc: "Personalised dermatology platform: a five-stage vision pipeline with an LLM layer, reaching 90%+ accuracy across skin and scalp conditions.",
    tech: ["React", "Django", "MySQL", "EfficientNet-B4", "U-Net", "YOLOv8", "XGBoost", "LLM"],
    link: "https://ai-skin-scalp-personalized-treatmen.vercel.app/",
    image: "/project-images/ME-card.jpg",
  },
  {
    num: "02",
    category: "Web Development Project",
    name: "Marrow & Hearth Restaurant",
    desc: "Restaurant site built around three kitchens and one hearth \u2014 scroll-driven storytelling, a filterable menu and a live reservation flow.",
    tech: ["React", "Vite", "Framer Motion", "Responsive Design", "UI/UX", "Vercel"],
    link: "https://restaurants-sandy-seven.vercel.app/",
    image: "/project-images/Restaurant-card.jpg",
  },
  {
    num: "03",
    category: "Academic Project",
    name: "Job Portal System",
    desc: "Role-based portal for job seekers, employers and admins, with posting, application tracking, messaging and dashboards.",
    tech: ["HTML", "CSS", "JavaScript", "Java", "OOP", "Design Patterns"],
    link: null,
    image: "/project-images/Job-Portal-card.jpg",
  },
];

// ── ProjectsSection — one image per project, static grid ─────────────────────
const projectStyles = `
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: clamp(16px, 2vw, 28px);
    max-width: 1200px;
    margin: 0 auto;
  }
  .project-card {
    display: flex;
    flex-direction: column;
    border: 2px solid #D7E2EA;
    border-radius: clamp(20px, 2.4vw, 28px);
    background: #0C0C0C;
    overflow: hidden;
    transition: border-color 180ms, background 180ms;
  }
  .project-card:hover {
    border-color: #FFFFFF;
    background: rgba(215,226,234,0.04);
  }
  .project-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border-bottom: 2px solid #D7E2EA;
  }
  .project-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    padding: clamp(16px, 2vw, 24px);
  }
  .project-category {
    color: rgba(215,226,234,0.5);
    font-size: clamp(0.65rem, 0.8vw, 0.75rem);
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .project-title {
    color: #D7E2EA;
    font-family: 'Kanit', sans-serif;
    font-weight: 700;
    font-size: clamp(1.05rem, 1.5vw, 1.4rem);
    line-height: 1.15;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .project-blurb {
    color: rgba(215,226,234,0.6);
    font-weight: 300;
    font-size: clamp(0.82rem, 1vw, 0.95rem);
    line-height: 1.55;
  }
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
    padding-top: 4px;
  }
  .project-actions { padding-top: 6px; }
`;

const MAX_TAGS = 4;

function ProjectCard({ project }) {
  const shown = project.tech.slice(0, MAX_TAGS);
  const extra = project.tech.length - shown.length;

  return (
    <article className="project-card">
      <img src={project.image} alt={`${project.name} screenshot`} loading="lazy" decoding="async" />
      <div className="project-body">
        <p className="project-category">{project.category}</p>
        <h3 className="project-title">{project.name}</h3>
        <p className="project-blurb">{project.desc}</p>

        <div className="project-tags">
          {shown.map((t) => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
          {extra > 0 && <span className="tech-pill">+{extra}</span>}
        </div>

        {project.link && (
          <div className="project-actions">
            <LiveProjectButton href={project.link} />
          </div>
        )}
      </div>
    </article>
  );
}

function ProjectsSection() {
  return (
    <section
      id="projects"
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

      <div className="projects-grid">
        {projects.map((p) => (
          <ProjectCard key={p.num} project={p} />
        ))}
      </div>
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
      <style>{globalStyles + heroStyles + projectStyles}</style>
      <div style={{ overflowX: "clip", background: "#0C0C0C" }}>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
