 "use client";

import Link from "next/link";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

const testimonials = [
  "“Saved hours of manual scouting. First useful reply in one session.”",
  "“Help-first drafts made Reddit outreach feel natural again.”",
  "“We stopped guessing subreddits—now we answer questions people already asked.”",
];

const comparisonRows = [
  {
    approach: "Agencies",
    outcome: "Outsourced marketing",
    why: "$1,000–$5,000+/month, slow feedback, little control",
  },
  {
    approach: "Ads",
    outcome: "Cold traffic",
    why: "You pay for clicks, not buyers, and burn cash before PMF",
  },
  {
    approach: "Cold DMs",
    outcome: "Manual outreach",
    why: "Time-consuming, awkward, and usually ignored",
  },
  {
    approach: "Manual Reddit/Forums",
    outcome: "DIY research",
    why: "Hours of scrolling, guessing, and rewriting messages",
  },
  {
    approach: "VibeCodeCustomers",
    outcome: "People already asking for your solution",
    why: "High intent, fast conversations, and help-first replies that actually convert",
  },
];

const workflow = [
  { title: "Describe", body: "Capture what you built, keywords, and community targets." },
  { title: "Discover", body: "Find live Reddit threads with high relevance." },
  { title: "Draft", body: "Let AI summarize, extract pains, and sketch value-first replies." },
  { title: "Engage", body: "Edit, copy, and post replies that join the conversation." },
];

const pricingPlans = [
  { name: "Free", monthly: "$0", annual: "$0", perks: ["1 project", "10 leads/mo", "5 drafts/mo"] },
  {
    name: "Starter",
    monthly: "$29",
    annual: "$261",
    perks: ["1 project", "300 leads/mo", "50 drafts/mo"],
  },
  {
    name: "Pro",
    monthly: "$99",
    annual: "$891",
    perks: ["Unlimited projects", "Unlimited leads & drafts", "Advanced analysis", "Priority support"],
  },
  {
    name: "Founding Member",
    monthly: "$49",
    annual: "$441",
    perks: ["Lifetime pricing (first 100)", "Pro features", "Priority feedback"],
  },
];

const faqs = [
  {
    question: "Is this anti-spam?",
    answer: "Yes—value-first prompts, tone options, and an always-visible reminder to stay helpful.",
  },
  {
    question: "What niches work best?",
    answer: "Solo founders shipping SaaS, newsletters, and adjacent AI tools thrive because we surface real demand.",
  },
  {
    question: "What are the limits?",
    answer: "Free plan caps are listed on the pricing panel; Pro removes them and adds priority analysis.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes—email support@vibecodecustomers.com within 14 days for a refund (pro-rated as needed).",
  },
];

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <section className="hero hero-locked">
          <div>
            <div className="tag">For Vibe Coders / Indie Hackers</div>
            <h1>You built it with AI. Now get customers with AI.</h1>
            <p className="hero-sub">
              Stop shouting into the void. We find people actively looking for your solution and help you engage them,
              without being spammy.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/login">
                Start Finding Customers (Free)
              </Link>
              <Link className="btn btn-secondary" href="#demo">
                See example
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <h3>Help-first discovery</h3>
            <p className="muted">Find high-intent Reddit threads faster than manual research ever could.</p>
            <div className="hero-stats">
              <div>
                <strong>92</strong>
                <p>Relevance score</p>
              </div>
              <div>
                <strong>5 min</strong>
                <p>First useful draft</p>
              </div>
              <div>
                <strong>100%</strong>
                <p>Friendly-tone replies</p>
              </div>
            </div>
          </div>
        </section>

        <section className="problem">
          <p className="muted accent">Vibe coder problem</p>
          <p className="problem-copy">
            “Vibe coding is fast. Marketing is slow. You shipped your app in a weekend, but you’ve been looking for your
            first 10 users for a month.”
          </p>
          <ul>
            <li>Stop manually scanning subreddits for hours.</li>
            <li>Stop writing cold DMs that get ignored.</li>
            <li>Stop running ads before you know people want this.</li>
            <li>Stop guessing where your customers are.</li>
          </ul>
          <p className="muted italic">There is demand for what you built. You just haven’t been plugged into it yet.</p>
        </section>

        <section className="social-proof">
          {testimonials.map((quote) => (
            <div key={quote} className="card testimonial">
              {quote}
            </div>
          ))}
        </section>

        <section className="comparison">
          <h2>How most people try to get customers (and why it’s so hard)</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>What you get</th>
                  <th>Why it’s frustrating</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.approach}>
                    <td>{row.approach}</td>
                    <td>{row.outcome}</td>
                    <td>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="supporting">
          <p>Most tools help you broadcast. Agencies help you promote. Ads help you interrupt.</p>
          <p>
            VibeCodeCustomers helps you show up where people are already asking for help.
            You’re not chasing customers. You’re joining conversations they already started.
          </p>
        </section>

        <section className="workflow">
          <h2>How it works</h2>
          <div className="grid-4">
            {workflow.map((step) => (
              <div key={step.title} className="card">
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="differentiator">
          <div className="panel">
            <h2>Help-first replies, not spam</h2>
            <p className="muted">
              Constraint system: value-first tone, no hard selling, explainable AI summaries. Every draft prompts for
              permission, asks a question, and stays human. Feedback buttons keep enforcement visible.
            </p>
          </div>
        </section>

        <section id="demo" className="demo">
          <div className="demo-thread">
            <p className="muted uppercase">Reddit thread preview</p>
            <h3>“Built a scheduling AI—need beta testers”</h3>
            <p>
              We just shipped an AI co-pilot for planning, but no one’s answering our posts. Looking for people who
              care about saving time.
            </p>
            <p className="muted small-text">r/indiebuilder • 42 upvotes • 12 comments</p>
          </div>
          <div className="demo-draft">
            <p className="muted uppercase">VibeCodeCustomers draft (help-first)</p>
            <p>
              Hey! I built something similar and tracking down your first users is still my favorite part. If you want, I
              can share how we framed prompts so the AI follows the “help-first, no pitch” rule. What’s one outcome you’re
              chasing this week?
            </p>
            <p className="muted small-text">Tone: Casual • Length: Medium</p>
          </div>
        </section>

        <section className="pricing">
          <div className="flex-between">
            <div>
              <h2>Pricing</h2>
              <p className="muted">Monthly | Annual (Save 25%)</p>
            </div>
            <div className="toggle">
              <button
                className={`pill ${billingCycle === "monthly" ? "active" : ""}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`pill ${billingCycle === "annual" ? "active" : ""}`}
                onClick={() => setBillingCycle("annual")}
              >
                Annual <span className="badge">Save 25%</span>
              </button>
            </div>
          </div>
          <div className="grid-4 pricing-grid">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="card pricing-card">
                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <p className="muted">{billingCycle === "monthly" ? plan.monthly : plan.annual}</p>
                </div>
                <ul>
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <button className="btn btn-primary">Start {plan.name}</button>
              </div>
            ))}
          </div>
        </section>

        <section className="faq">
          <h2>FAQ</h2>
          <div className="grid-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="card">
                <h3>{faq.question}</h3>
                <p className="muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <h2>You’re ready to stop guessing.</h2>
          <p className="muted">Start discovering threaded conversations, summarize with AI, and reply with empathy.</p>
          <Link className="btn btn-primary" href="/login">
            Start Finding Customers (Free)
          </Link>
        </section>
      </div>
    </div>
  );
}
