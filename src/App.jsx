import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";

// ── Content (all of it carried over from the previous site) ──────────────────
const EMAIL = "hudamasood686@gmail.com";
const PHONE = { text: "+92 301 3636199", href: "tel:+923013636199" };
const LINKEDIN = "https://linkedin.com/in/huda-masood-developer/";
const GITHUB = "https://github.com/hudamasood";

const ABOUT = [
  "A Software Engineering graduate from UMT, I build products end to end — React interfaces wired to Django REST APIs and MySQL, shipped and deployed. My work sits where full-stack development meets machine learning and NLP.",
  "I care most about the part where a hard problem turns into something people can actually use. With 2+ years of content writing behind me, I explain what I build as clearly as I build it. Let's make something worth using.",
];
const PULL_QUOTE = "I care most about the part where a hard problem turns into something people can actually use.";

const skills = [
  {
    name: "Full-Stack Web Development",
    desc: "Building complete web products end to end — React, JavaScript, HTML5, CSS3 and Bootstrap on the front, Django REST and MySQL behind it, deployed and running.",
  },
  {
    name: "Machine Learning & NLP",
    desc: "Applying ML concepts and natural language processing to build intelligent systems, chatbots, and AI-powered pipelines with practical real-world impact.",
  },
  {
    name: "UI/UX Design",
    desc: "Designing clean, modern, and conversion-focused interfaces with careful attention to layout, typography, accessibility, and user experience.",
  },
  {
    name: "Content Writing & SEO",
    desc: "Crafting compelling technical and marketing content backed by 2+ years of experience, combining SEO strategy with clear, engaging communication.",
  },
  {
    name: "Backend & API Engineering",
    desc: "Designing REST APIs, relational schemas, authentication and role-based access with Django and MySQL, plus Java OOP and design patterns for structured, maintainable systems.",
  },
];

// First project is the lead story, the next two run in the side column,
// anything after that goes in "In Brief".
const projects = [
  {
    category: "Final Year Project · 2025",
    name: "ME. AI Skin & Scalp System",
    image: "/project-images/ME-card.jpg",
    desc: "Personalised dermatology platform: a five-stage vision pipeline with an LLM layer, reaching 90%+ accuracy across skin and scalp conditions.",
    tech: ["React", "Django", "MySQL", "EfficientNet-B4", "U-Net", "YOLOv8", "XGBoost", "LLM"],
    link: "https://ai-skin-scalp-personalized-treatmen.vercel.app/",
  },
  {
    category: "Web Development Project",
    name: "Marrow & Hearth Restaurant",
    image: "/project-images/Restaurant-cover.webp",
    desc: "Restaurant site built around three kitchens and one hearth — scroll-driven storytelling, a filterable menu and a live reservation flow.",
    tech: ["React", "Vite", "Framer Motion", "Responsive Design", "UI/UX", "Vercel"],
    link: "https://restaurants-sandy-seven.vercel.app/",
  },
  {
    category: "Full-Stack Project",
    name: "Forge Gym",
    image: "/project-images/Forge-card.jpg",
    desc: "Premium gym platform: a marketing site, membership and class booking, a full store, and three role-based portals for members, trainers and admins.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Stripe", "Three.js"],
    link: "https://forge-gym-two-psi.vercel.app",
    github: "https://github.com/hudamasood/Forge-GYM",
  },
  {
    category: "Academic Project",
    name: "Job Portal System",
    image: "/project-images/Job-Portal-card.jpg",
    desc: "Role-based portal for job seekers, employers and admins, with posting, application tracking, messaging and dashboards.",
    tech: ["HTML", "CSS", "JavaScript", "Java", "OOP", "Design Patterns"],
    link: null,
  },
];

// ── Static page furniture ─────────────────────────────────────────────────────
function UtilityBar() {
  const links = [
    ["Top Stories", "#stories"],
    ["Skills", "#skills"],
    ["Profile", "#about"],
    ["Letters", "#contact"],
  ];
  return (
    <div className="utility label">
      <span>Lahore Edition</span>
      <nav aria-label="Sections">
        {links.map(([text, href]) => (
          <a key={href} href={href}>{text}</a>
        ))}
      </nav>
      <a href="#contact">Contact</a>
    </div>
  );
}

function Masthead() {
  return (
    <header className="masthead">
      <h2>The Huda Herald</h2>
      <p>All the code that&apos;s fit to ship.</p>
    </header>
  );
}

function Dateline() {
  return (
    <div className="dateline label">
      <span>Vol. I · No. 1</span>
      <span>Software Engineer</span>
      <span>Portfolio Edition</span>
    </div>
  );
}

// ── Hero (the only animated section — see index.css) ─────────────────────────
function Hero() {
  return (
    <>
      <section id="hero" className="hero" aria-label="Front page">
        <div className="hero-left">
          <h1>
            <span>Hi,</span>
            <span>I&apos;m</span>
            <span>Huda</span>
          </h1>
          <div className="hero-intro">
            <p>Software Engineer — full-stack web, machine learning and NLP.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#stories">See her work ↓</a>
              <a className="btn btn-secondary" href="#contact">Write to her</a>
            </div>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src="/huda-photo.webp"
            alt="Huda Masood"
            width="1254"
            height="1254"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>
      <p className="hero-caption">Pictured: Huda Masood, developer, Lahore.</p>
    </>
  );
}

function Ticker() {
  const text = [
    ...projects.filter((p) => p.link).map((p) => `${p.name} — live now`),
    "Now taking new work",
  ].join(" · ");
  return (
    <div className="ticker" role="note">
      <span className="ticker-tag">Breaking</span>
      <span className="ticker-text">{text}</span>
    </div>
  );
}

// ── Top Stories ──────────────────────────────────────────────────────────────
function ProjectCard({ p }) {
  return (
    <article className="card">
      <figure className="card-cover">
        <img src={p.image} alt={`${p.name} website`} width="1000" height="625" loading="lazy" decoding="async" />
      </figure>
      <p className="card-kicker label">{p.category}</p>
      <h3 className="card-head">{p.name}</h3>
      <p className="card-desc">{p.desc}</p>
      <ul className="card-tags label">
        {p.tech.map((t) => <li key={t}>{t}</li>)}
      </ul>
      {(p.link || p.github) && (
        <div className="card-links">
          {p.link && (
            <a className="btn btn-secondary" href={p.link} target="_blank" rel="noopener noreferrer">Live site →</a>
          )}
          {p.github && (
            <a className="btn btn-secondary" href={p.github} target="_blank" rel="noopener noreferrer">GitHub →</a>
          )}
        </div>
      )}
    </article>
  );
}

function TopStories() {
  const track = useRef(null);
  const scrollBy = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector(".card");
    const step = card ? card.getBoundingClientRect().width + 32 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <section id="stories" className="section" aria-labelledby="stories-title">
      <div className="section-head">
        <h2 id="stories-title">Top Stories</h2>
        <span className="label">Section A · Projects</span>
      </div>
      <div className="cards" ref={track} tabIndex={0} role="region" aria-label="Projects, scroll sideways">
        {projects.map((p) => <ProjectCard key={p.name} p={p} />)}
      </div>
      <div className="cards-nav">
        <button type="button" className="btn btn-secondary" onClick={() => scrollBy(-1)} aria-label="Previous projects">←</button>
        <button type="button" className="btn btn-secondary" onClick={() => scrollBy(1)} aria-label="Next projects">→</button>
      </div>
    </section>
  );
}

// ── Skills Index — the only dark band ────────────────────────────────────────
function SkillsIndex() {
  return (
    <section id="skills" className="skills" aria-labelledby="skills-title">
      <div className="section-head">
        <h2 id="skills-title">The Skills Index</h2>
        <span className="label">Section B · Skills</span>
      </div>
      <ol className="skills-list">
        {skills.map((sk, i) => (
          <li className="skill-row" key={sk.name}>
            <span className="skill-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3>{sk.name}</h3>
            <p>{sk.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── The Profile: About + Education ───────────────────────────────────────────
function Profile() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="section-head">
        <h2 id="about-title">The Profile</h2>
        <span className="label">Section C · About &amp; Education</span>
      </div>
      <div className="profile-layout">
        <div className="profile-main">
          <blockquote className="pull-quote">&ldquo;{PULL_QUOTE}&rdquo;</blockquote>
          <div className="profile-text">
            {ABOUT.map((t) => <p key={t}>{t}</p>)}
          </div>
          <div className="profile-cta">
            <a className="btn btn-secondary" href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <aside className="factbox" aria-label="Fact box: Education">
          <p className="label">Fact Box · Education</p>
          <h3>Software Engineering</h3>
          <p>UMT</p>
        </aside>
      </div>
    </section>
  );
}

// ── Letters to the Editor: contact (form logic unchanged) ────────────────────
function Letters() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const form = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFailed(false);
    try {
      await emailjs.sendForm("service_m1gbfa5", "template_9tplor9", form.current, {
        publicKey: "DkJJZhtgtVWFQEwAH",
      });
      setSent(true);
      form.current.reset();
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("Email sending failed:", error);
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="coupon">
        <div>
          <p className="coupon-clip label">✂ Clip &amp; send</p>
          <h2 id="contact-title">Letters to the Editor</h2>
          <p className="coupon-lede">
            Have a project, a role, or a question? Write in — every letter gets a reply.
          </p>
          <ul className="contact-list">
            <li><span className="label">Email</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li><span className="label">Phone</span><a href={PHONE.href}>{PHONE.text}</a></li>
            <li><span className="label">Based in</span>Lahore, Pakistan</li>
            <li><span className="label">LinkedIn</span><a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn Profile</a></li>
            <li><span className="label">GitHub</span><a href={GITHUB} target="_blank" rel="noopener noreferrer">github.com/hudamasood</a></li>
          </ul>
        </div>

        <form ref={form} onSubmit={handleSubmit} className="letter-form">
          <div className="field">
            <label htmlFor="f-name">Your name</label>
            <input id="f-name" name="name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="f-email">Your email</label>
            <input id="f-email" type="email" name="email" autoComplete="email" required />
          </div>
          <div className="field full">
            <label htmlFor="f-subject">Subject</label>
            <input id="f-subject" name="subject" required />
          </div>
          <div className="field full">
            <label htmlFor="f-message">Your message</label>
            <textarea id="f-message" name="message" rows={5} required />
          </div>
          <div className="form-foot">
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? "Sending…" : "Send to press →"}
            </button>
            <p className={`form-note${failed ? " error" : ""}`} role="status" aria-live="polite">
              {sent && "Letter received — thank you."}
              {failed && "Sorry, your letter could not be sent. Please try again."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer label">
      <span>Printed in Lahore</span>
      <span className="footer-name">The Huda Herald</span>
      <span>© {new Date().getFullYear()} · Vol. I</span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page">
      <UtilityBar />
      <Masthead />
      <Dateline />
      <main>
        <Hero />
        <Ticker />
        <TopStories />
        <SkillsIndex />
        <Profile />
        <Letters />
      </main>
      <Footer />
    </div>
  );
}
