"use client";

import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const testimonials = [
  "“Saved hours of manual scouting. First useful reply in one session.”",
  "“Help-first drafts made Reddit outreach feel natural again.”",
  "“We stopped guessing subreddits - now we answer questions people already asked.”",
];

const workflow = [
  { title: "Describe", body: "Capture what you built, keywords, and community targets." },
  { title: "Discover", body: "Find live Reddit threads with high relevance." },
  { title: "Draft", body: "Let AI summarize, extract pains, and sketch value-first replies." },
  { title: "Engage", body: "Edit, copy, and post replies that join the conversation." },
];

const pricingPlans = [
  { name: "Free", price: "$0", perks: ["1 project", "10 leads/mo", "5 drafts/mo"] },
  { name: "Starter", price: "$29", perks: ["1 project", "300 leads/mo", "50 drafts/mo"] },
  { name: "Pro", price: "$99", perks: ["Unlimited projects", "Unlimited leads & drafts", "Advanced analysis", "Priority support"] },
];

export default function Home() {
  return (
    <div className="page">
      <AppNav />
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="tagline">For Vibe Coders / Indie Hackers</p>
            <h1>
              You built it with AI.
              <br />
              <span>Now get customers with AI.</span>
            </h1>
            <p className="hero-subtitle">
              Stop shouting into the void. We find people actively looking for your solution and help you engage them, without being spammy.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary hero-btn" href="/login">
                Start Finding Customers (Free)
              </Link>
              <Link className="btn btn-outline hero-btn" href="#demo">
                See example
              </Link>
            </div>
            <div className="hero-footnote">
              <span>No spam</span>
              <span>No cold outreach</span>
              <span>Just helpful conversations</span>
            </div>
          </div>
          <div className="hero-card">
            <h3>Help-first discovery</h3>
            <p>Find high intent Reddit threads faster than manual research ever could.</p>
            <div className="hero-stats">
              <div>
                <div className="hero-value">92</div>
                <p>Relevance score</p>
              </div>
              <div>
                <div className="hero-value">5 min</div>
                <p>First useful draft</p>
              </div>
              <div>
                <div className="hero-value">100%</div>
                <p>Friendly tone replies</p>
              </div>
            </div>
          </div>
        </section>

        <section className="problem-section">
          <div className="problem-copy">
            <p className="tagline">Vibe coder problem</p>
            <h2>
              “Vibe coding is fast. Marketing is slow. You shipped your app in a weekend, but you've been looking for your first 10 users for a month.”
            </h2>
            <p>
              Stop manually scanning subreddits for hours. Stop writing cold DMs that get ignored. Stop running ads before you know people want this. Stop guessing where your customers are.
            </p>
          </div>
          <div className="problem-grid">
            {[
              {
                emoji: "🤖",
                title: "I built it, but nobody knows it exists",
                desc: "You've poured your heart into building something valuable, but getting those first customers feels impossible.",
              },
              {
                emoji: "🚫",
                title: "Cold outreach feels spammy",
                desc: "You want to help people, not annoy them. But how do you reach potential customers without being pushy?",
              },
              {
                emoji: "💸",
                title: "Marketing is expensive and doesn't work",
                desc: "Ads cost a fortune with no guarantee. Social media feels like shouting into the void.",
              },
            ].map((item) => (
              <div key={item.title} className="problem-card">
                <div className="emoji">{item.emoji}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="solution-section" id="demo">
          <div className="solution-text">
            <h2>
              What if you could find customers who are <span>already asking for help?</span>
            </h2>
            <p>Every day, thousands of people post about problems your app solves. We find those conversations so you can help them.</p>
            <div className="solution-steps">
              {workflow.map((step, index) => (
                <div key={step.title} className="step-card">
                  <div className="step-index">{index + 1}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="solution-card">
            <div className="solution-header">
              <span>Real conversation found</span>
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
            <h3>“Built a scheduling AI - need beta testers?”</h3>
            <p className="meta">r/indiebuilder • 42 upvotes • 12 comments</p>
            <div className="pain-card">
              <span>Pain point detected:</span> Scheduling burnout, no replies yet.
            </div>
            <div className="reply-card">
              <p>AI suggested reply:</p>
              <p>“Hey! I built something similar and tracking down your first users is still my favorite part...”</p>
            </div>
          </div>
        </section>

        <section className="social-section">
          <p className="tagline">Join 500+ builders finding their first customers</p>
          <div className="social-grid">
            {testimonials.map((quote) => (
              <div key={quote} className="testimonial-card">
                <p>{quote}</p>
                <span>- early Vibe Coder</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pricing-section">
          <div className="pricing-header">
            <div>
              <h2>Pricing</h2>
              <p>
                Monthly | <span>Annual (Save 25%)</span>
              </p>
            </div>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`pricing-card ${plan.name === "Starter" ? "featured" : ""}`}>
                <h4>{plan.name}</h4>
                <p className="price">{plan.price}</p>
                <ul>
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <button className={`btn ${plan.name === "Starter" ? "btn-primary" : "btn-outline"}`}>Start {plan.name}</button>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-banner">
          <h2>Stop building in isolation. Start building relationships.</h2>
          <p>Your first customers are out there, talking. Let us help you find them.</p>
          <Link className="btn btn-primary cta-btn" href="/login">
            Start Finding Customers (Free Trial)
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="brand-row">
              <span className="logo-badge">VC</span>
              <h4>VibeCodeCustomers</h4>
            </div>
            <p>Find your first customers through genuine conversations.</p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><a href="#">How it works</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Examples</a></li>
            </ul>
          </div>
          <div>
            <h5>Support</h5>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <p className="footer-note">© 2024 VibeCodeCustomers. All rights reserved.</p>
      </footer>
    </div>
  );
}
