"use client";

import { useState } from "react";
import styles from "./page.module.css";

const SHOWCASE = [
  { name: "Rowan", handle: "rowan", tag: "3 projects", grad: "linear-gradient(155deg,#a48cff,#6a5acd)" },
  { name: "Junie", handle: "junie", tag: "Now playing", grad: "linear-gradient(155deg,#6ee7c4,#2f9e7a)" },
  { name: "Dex", handle: "dex", tag: "42 repos", grad: "linear-gradient(155deg,#ff9d7a,#c25a3a)" },
  { name: "Mars", handle: "mars", tag: "Online", grad: "linear-gradient(155deg,#7ab8ff,#3a63c2)" },
  { name: "Wren", handle: "wren", tag: "Ascendant II", grad: "linear-gradient(155deg,#ffd27a,#c28f3a)" },
];

const FEATURES = [
  {
    title: "Live widgets",
    text: "Drop in your GitHub stats, Discord presence, or game rank. They stay current on their own, so your page never feels stale.",
  },
  {
    title: "Built-in music player",
    text: "Queue a few tracks and let visitors press play right on your page, styled to match your accent color.",
  },
  {
    title: "One name, everywhere",
    text: "vail.gg/you replaces the pile of links in your bio. Point people to one place that's actually yours.",
  },
  {
    title: "Fast to set up",
    text: "Sign in, pick a display name and accent color, add your links. Your page is live in under a minute.",
  },
  {
    title: "You control the look",
    text: "Accent color, font, and layout are all yours to set — no forced templates.",
  },
  {
    title: "Free to start",
    text: "The core of vail is free, permanently. Upgrade later if you want more room to grow.",
  },
];

const FAQ = [
  {
    q: "What is vail?",
    a: "vail is a single page for everything you do — your projects, your music, your links — all under one name you claim once.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The free plan covers a profile, custom buttons, and the widgets you need to get a page live. No card required.",
  },
  {
    q: "How do I sign in?",
    a: "vail uses Discord to sign you in — no separate password to create or lose. Your page updates the moment you save changes.",
  },
  {
    q: "Can I use my own domain later?",
    a: "It's on the roadmap for Premium accounts. For now every page lives at vail.gg/yourname.",
  },
];

export default function Home() {
  const [handle, setHandle] = useState("");

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <a href="/" className={styles.brand}>
          <span className={styles.brandMark} />
          vail
        </a>
        <div className={styles.navLinks}>
          <a href="#widgets">Widgets</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="/dashboard/login" className={styles.navCta}>
            Log in
          </a>
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <span className={styles.dot} />
          Now live — free while in beta
        </span>
        <h1 className={styles.headline}>Make the internet remember you.</h1>
        <p className={styles.sub}>
          One link for everything you do — your profile, your projects, your music, your socials.
          Claim your name in seconds.
        </p>

        <div className={styles.claim}>
          <span className={styles.claimPrefix}>vail.gg/</span>
          <input
            className={styles.claimInput}
            placeholder="yourname"
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
            maxLength={20}
          />
          <a className={styles.claimBtn} href="/api/auth/login">
            Claim
          </a>
        </div>
        <p className={styles.claimHint}>Sign in with Discord to claim your name — free, no card needed.</p>
      </section>

      <div className={styles.showcase}>
        {SHOWCASE.map((p) => (
          <div className={styles.card} key={p.handle}>
            <div className={styles.avatar} style={{ background: p.grad }}>
              {p.name[0]}
            </div>
            <div className={styles.cardName}>{p.name}</div>
            <div className={styles.cardHandle}>vail.gg/{p.handle}</div>
            <span className={styles.cardTag}>{p.tag}</span>
          </div>
        ))}
      </div>

      <section className={styles.section} id="widgets">
        <div className={styles.sectionHead}>
          <div className={styles.sectionKicker}>Profile widgets</div>
          <h2 className={styles.sectionTitle}>Bring your page to life.</h2>
          <p className={styles.sectionSub}>
            Beyond a static list of links — widgets that show what you're actually doing right now.
          </p>
        </div>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div className={styles.feature} key={f.title}>
              <div className={styles.featureIcon} />
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureText}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} id="pricing">
        <div className={styles.sectionHead}>
          <div className={styles.sectionKicker}>Pricing</div>
          <h2 className={styles.sectionTitle}>Start free, upgrade when you want.</h2>
          <p className={styles.sectionSub}>Build your whole page for free. Premium is coming soon.</p>
        </div>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>
              $0<span>/forever</span>
            </div>
            <ul className={styles.planList}>
              <li>1 profile</li>
              <li>Up to 8 links</li>
              <li>Core widgets</li>
              <li>Custom accent color &amp; font</li>
            </ul>
            <a className={styles.planBtn} href="/api/auth/login">
              Get started
            </a>
          </div>
          <div className={`${styles.plan} ${styles.planFeatured}`}>
            <span className={styles.planBadge}>Coming soon</span>
            <div className={styles.planName}>Premium</div>
            <div className={styles.planPrice}>
              TBA<span>&nbsp;</span>
            </div>
            <ul className={styles.planList}>
              <li>Everything in Free</li>
              <li>Custom domains</li>
              <li>Extra widget slots</li>
              <li>Priority support</li>
            </ul>
            <a className={`${styles.planBtn} ${styles.planBtnFeatured}`} href="#faq">
              Join the waitlist
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section} id="faq">
        <div className={styles.sectionHead}>
          <div className={styles.sectionKicker}>FAQ</div>
          <h2 className={styles.sectionTitle}>Questions? We've got answers.</h2>
        </div>
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <details className={styles.faqItem} key={item.q}>
              <summary>{item.q}</summary>
              <p className={styles.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <a href="/" className={styles.brand}>
              <span className={styles.brandMark} />
              vail
            </a>
            <p style={{ marginTop: "0.85rem" }}>
              One link for everything you do. Claim your name, build your page, get remembered.
            </p>
          </div>
          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <h4>General</h4>
              <a href="/dashboard/login">Log in</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <a href="https://discord.com">Discord server</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>© {new Date().getFullYear()} vail. All rights reserved.</div>
      </footer>
    </main>
  );
}
