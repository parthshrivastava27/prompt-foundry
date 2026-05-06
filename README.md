# 🧠 AI Prompt Engineering Vault

> A curated collection of system prompts, JSX artifacts, skill files, and code templates for AI engineers — built from real production experience.

by **Frost** · AI Engineer · [LinkedIn](#) · [Twitter/X](#)

---

## What's in here?

This repo is my personal knowledge base made public. Everything here has been battle-tested in real AI engineering workflows — LLM pipelines, fraud detection systems, document processing, and agent architectures.

| Folder | What's inside |
|---|---|
| [`system-prompts/`](#system-prompts) | Drop-in instructions for coding agents, data pipelines, and AI assistants |
| [`artifacts/`](#artifacts) | Interactive JSX components and UI tools for AI workflows |
| [`skill-files/`](#skill-files) | Structured skill definitions for agent task routing |
| [`code-templates/`](#code-templates) | Production-ready Python starters for common AI engineering patterns |

---

## System Prompts

Ready-to-use system prompts. Drop them into Cursor, Claude Projects, GPT Custom Instructions, or any agent that accepts a system message.

### 📁 `system-prompts/coding/`

| File | Description |
|---|---|
| [`nasa-power-of-ten.md`](system-prompts/coding/nasa-power-of-ten.md) | Python code generation under adapted NASA safety-critical rules. Balanced enforcement — hard rules + warning flags. |

### 📁 `system-prompts/data-pipelines/`
*Coming soon*

### 📁 `system-prompts/agents/`
*Coming soon*

---

## Artifacts

Interactive JSX components built for AI engineering workflows. Open in Claude.ai or any React sandbox.

### 📁 `artifacts/jsx/`

| File | Description | Preview |
|---|---|---|
| [`nasa-prompt-kit.jsx`](artifacts/jsx/nasa-prompt-kit.jsx) | Interactive viewer for the NASA Power of Ten Python prompt kit — system prompt, engineer template, and compliant code example | — |

---

## Skill Files

Structured skill definitions that tell agents *how* to approach specific task categories. Format compatible with Claude Projects and similar agent frameworks.

*Coming soon — first skills dropping soon for: document parsing, fraud signal extraction, time series anomaly detection.*

---

## Code Templates

Production-ready Python starters. NASA-P10 compliant where applicable.

### 📁 `code-templates/fastapi/`

| File | Description |
|---|---|
| [`fraud-detection-api.py`](code-templates/fastapi/fraud-detection-api.py) | FastAPI + XGBoost fraud scoring endpoint with input validation, typed schemas, and structured logging |

### 📁 `code-templates/langchain/`
*Coming soon*

---

## How to use this

**For system prompts:**
```bash
# Just copy the contents of any .md file into your agent's system prompt field
cat system-prompts/coding/nasa-power-of-ten.md | pbcopy   # macOS
```

**For JSX artifacts:**
- Open [Claude.ai](https://claude.ai)
- Start a new conversation
- Paste the contents of any `.jsx` file and ask Claude to render it

**For code templates:**
```bash
git clone https://github.com/YOUR_USERNAME/ai-prompt-engineering
cp code-templates/fastapi/fraud-detection-api.py your-project/
```

---

## Philosophy

> *"If AI wrote it and you can't verify it — you don't own it. You're just hosting it."*

Most AI-generated code is technically correct and completely unreviable. This repo is built around the idea that **the bottleneck has shifted from writing code to reviewing it** — and that we need real frameworks for that review, not vibes.

A lot of what's here is inspired by NASA's Power of Ten, Holzmann's work on safety-critical systems, and hard lessons from production ML pipelines.

---

## Contributing

This is primarily a personal portfolio repo, but if you've built something that fits — a system prompt, a compliant template, a useful artifact — PRs are welcome.

Please read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) first.

---

## Roadmap

- [ ] LangGraph agent system prompt
- [ ] Document processing pipeline template
- [ ] Skill files for fraud signal extraction
- [ ] Pre-commit hook for NASA-P10 compliance checks
- [ ] Prompt evaluation framework (score generated code against rules)

---

<sub>MIT License · Built by an AI Engineer who got tired of debugging unverifiable slop</sub>
