import { useState } from "react";

const SYSTEM_PROMPT = `You are a Python code generation assistant operating under an adapted version of NASA's "Power of Ten" coding rules for safety-critical systems — reinterpreted for modern Python and AI engineering contexts.

## CORE RULES (Enforced — do not violate these)

### Rule 1 — Simple Control Flow
- No deeply nested logic (max 2 levels of nesting inside any block)
- Avoid recursion unless the call depth is explicitly bounded and documented
- No lambda chains or deeply composed function calls that obscure flow
- One logical path per function — if a function branches heavily, split it

### Rule 2 — Bounded Loops
- Every loop must have a clear, statically obvious termination condition
- For loops over external iterators (generators, streams, DB cursors), always set an explicit max iteration guard
- Never use while True without a documented and tested exit condition

### Rule 3 — Explicit Resource Management
- Always use context managers (with statements) for files, DB connections, HTTP sessions, and any I/O
- Never leave resources open implicitly
- For ML/data workloads: explicitly release large objects (del + gc.collect()) when memory is a concern

### Rule 4 — Function Length ≤ 50 lines
- Each function must fit on one screen (~50 lines max, excluding docstring)
- If a function exceeds this, decompose it — no exceptions without a comment explaining why
- One function = one responsibility. If you can't describe it in one sentence, split it.

### Rule 5 — Assertions + Defensive Checks
- Every non-trivial function must include at minimum:
  - Input validation (type checks, range checks, None guards) at the top
  - At least one assert or explicit raise for invalid state
- Use assert for internal invariants (logic that should never be false)
- Use raise ValueError / TypeError for user-facing input errors
- Document assumptions explicitly in docstrings

### Rule 6 — Minimal Scope
- Declare variables as close to their use as possible
- Avoid module-level mutable state unless absolutely necessary
- Never reuse variable names for different purposes within the same function
- Avoid global keyword entirely — pass state explicitly

### Rule 7 — Handle All Return Values and Exceptions
- Never silently swallow exceptions with bare except:
- Always handle or explicitly re-raise specific exception types
- If a function can return None or an error state, the caller must explicitly handle both branches
- Log errors with enough context to debug (include function name, input summary)

### Rule 8 — No Magic, No Clever Tricks
- No one-liners that sacrifice readability for brevity
- No eval(), exec(), or dynamic attribute access via getattr() without explicit justification
- No unpacking tricks that are unclear to a reader unfamiliar with the codebase
- Complex comprehensions (3+ conditions) must be refactored into explicit loops

### Rule 9 — Type Hints + Static Analysis Ready
- All function signatures must include type hints (input and return types)
- Use Optional[X] explicitly instead of X | None shorthand for clarity
- Code must pass mypy --strict and ruff with zero warnings
- No use of Any type unless explicitly justified with a comment

### Rule 10 — Zero Warnings Policy
- Code must run cleanly under:
  - ruff (linting)
  - mypy --strict (type checking)
  - Python -W error (warnings as errors)
- Deprecation warnings must be resolved, not suppressed
- If a third-party library raises unavoidable warnings, isolate and document the suppression

---

## WARNING FLAGS (Highlight these to the engineer — do not silently ignore)

Flag the following with a # ⚠️ WARNING comment inline and explain the tradeoff:

- Recursion used (even if bounded)
- Any use of threading or multiprocessing without explicit synchronization notes
- Dynamic imports (importlib, __import__)
- Mutable default arguments
- Functions returning multiple types (e.g., str | None | dict)
- Any suppressed warning or ignored exception

---

## OUTPUT FORMAT

For every code generation request:
1. Write the compliant code
2. Add a short "Compliance Summary" comment block at the top listing:
   - Which core rules were applied
   - Any ⚠️ WARNING flags raised and why
   - Any rules relaxed and the justification

Example header:
# ─────────────────────────────────────────────
# NASA-P10 Compliance Summary
# ✅ Rules applied: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
# ⚠️  Warnings: None
# 📝 Relaxations: None
# ─────────────────────────────────────────────
`;

const ENGINEER_TEMPLATE = `## NASA Power of Ten — Python Code Request

**Task description:**
[Describe what you want the code to do]

**Context:**
- Language/framework: Python [version] + [libraries if any]
- Where this runs: [API endpoint / data pipeline / CLI script / ML training / etc.]
- Input: [What data comes in — type, size, source]
- Output: [What should be returned or produced]
- Error handling expectations: [What should happen on failure]

**Constraints:**
- [ ] This is production code (enforce all core rules strictly)
- [ ] This is a prototype (enforce core rules, flag warnings but don't block)
- [ ] This is safety/fraud/financial critical (maximum strictness)

**Additional context:**
[Any domain knowledge, existing interfaces, or patterns the agent should follow]

---
Generate code that:
1. Complies with the NASA-P10 Python rules in your system prompt
2. Includes a Compliance Summary header
3. Adds inline ⚠️ WARNING comments where tradeoffs exist
4. Includes a brief docstring per function explaining inputs, outputs, and assumptions
`;

const EXAMPLE_CODE = `# ─────────────────────────────────────────────
# NASA-P10 Compliance Summary
# ✅ Rules applied: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
# ⚠️  Warnings: None
# 📝 Relaxations: None
# ─────────────────────────────────────────────

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

MAX_TRANSACTION_AMOUNT = 1_000_000.0
MAX_BATCH_SIZE = 10_000


def validate_transaction(
    user_id: str,
    amount: float,
    currency: str,
) -> Optional[str]:
    """
    Validate a single transaction before processing.

    Args:
        user_id: Non-empty string identifier for the user.
        amount: Transaction value. Must be > 0 and <= MAX_TRANSACTION_AMOUNT.
        currency: ISO 4217 currency code (e.g. 'USD', 'EUR').

    Returns:
        None if valid. Error message string if invalid.

    Assumptions:
        - Currency validation is format-only (3 uppercase letters).
        - Caller is responsible for downstream business rule checks.
    """
    # Rule 5 — input validation at entry point
    if not isinstance(user_id, str) or not user_id.strip():
        return "user_id must be a non-empty string"

    if not isinstance(amount, (int, float)):
        return "amount must be numeric"

    if amount <= 0:
        return f"amount must be positive, got {amount}"

    if amount > MAX_TRANSACTION_AMOUNT:
        return (
            f"amount {amount} exceeds maximum "
            f"allowed {MAX_TRANSACTION_AMOUNT}"
        )

    if not isinstance(currency, str) or not currency.isupper() or len(currency) != 3:
        return f"currency must be a 3-letter ISO code, got '{currency}'"

    # Rule 5 — internal invariant assertion
    assert amount > 0 and amount <= MAX_TRANSACTION_AMOUNT, (
        "Validation logic error: amount out of bounds post-check"
    )

    return None


def process_transaction_batch(
    transactions: list[dict[str, object]],
) -> dict[str, list[dict[str, object]]]:
    """
    Process a batch of transactions and split into valid/invalid buckets.

    Args:
        transactions: List of dicts each containing 'user_id', 'amount',
                      'currency' keys.

    Returns:
        Dict with 'valid' and 'invalid' keys.
        Invalid entries include an 'error' key with reason.

    Raises:
        ValueError: If transactions is not a list or exceeds MAX_BATCH_SIZE.
    """
    # Rule 5 — guard inputs before any processing
    if not isinstance(transactions, list):
        raise ValueError(
            f"Expected list, got {type(transactions).__name__}"
        )

    if len(transactions) > MAX_BATCH_SIZE:
        raise ValueError(
            f"Batch size {len(transactions)} exceeds limit {MAX_BATCH_SIZE}"
        )

    valid: list[dict[str, object]] = []
    invalid: list[dict[str, object]] = []

    # Rule 2 — loop bound is len(transactions), statically obvious
    for txn in transactions:
        user_id = txn.get("user_id", "")
        amount = txn.get("amount", 0)
        currency = txn.get("currency", "")

        # Rule 7 — handle return value of validate_transaction explicitly
        error = validate_transaction(
            user_id=str(user_id),
            amount=float(amount),  # type: ignore[arg-type]
            currency=str(currency),
        )

        if error is not None:
            logger.warning(
                "Invalid transaction rejected",
                extra={"user_id": user_id, "reason": error},
            )
            invalid.append({**txn, "error": error})
        else:
            valid.append(txn)

    # Rule 5 — post-condition invariant
    assert len(valid) + len(invalid) == len(transactions), (
        "Batch processing dropped transactions — logic error"
    )

    logger.info(
        "Batch processed",
        extra={"valid": len(valid), "invalid": len(invalid)},
    )

    return {"valid": valid, "invalid": invalid}
`;

const tabs = [
  { id: "system", label: "System Prompt", icon: "⚙️" },
  { id: "template", label: "Engineer Template", icon: "📋" },
  { id: "example", label: "Compliant Example", icon: "✅" },
];

const ruleCards = [
  { num: "01", title: "Simple Control Flow", status: "enforce", desc: "Max 2 nesting levels. No opaque recursion." },
  { num: "02", title: "Bounded Loops", status: "enforce", desc: "Every loop has a provable exit. Max iteration guards on streams." },
  { num: "03", title: "Explicit Resources", status: "enforce", desc: "context managers for all I/O. No implicit open handles." },
  { num: "04", title: "≤ 50 Line Functions", status: "enforce", desc: "One screen, one responsibility, one sentence description." },
  { num: "05", title: "Assertions + Guards", status: "enforce", desc: "Input validation + at least one assert per non-trivial function." },
  { num: "06", title: "Minimal Scope", status: "enforce", desc: "Variables declared close to use. No global mutable state." },
  { num: "07", title: "Handle All Returns", status: "enforce", desc: "No bare except. Caller handles None and error states." },
  { num: "08", title: "No Magic Tricks", status: "enforce", desc: "No eval/exec. No unreadable one-liners. Clarity over brevity." },
  { num: "09", title: "Type Hints + mypy", status: "enforce", desc: "All signatures typed. Passes mypy --strict and ruff clean." },
  { num: "10", title: "Zero Warnings", status: "enforce", desc: "ruff + mypy + Python -W error. No suppressions without comments." },
];

export default function NASAPromptKit() {
  const [activeTab, setActiveTab] = useState("system");
  const [copied, setCopied] = useState(false);

  const contentMap = {
    system: SYSTEM_PROMPT,
    template: ENGINEER_TEMPLATE,
    example: EXAMPLE_CODE,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contentMap[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "32px 40px 24px",
        background: "linear-gradient(180deg, #0f1117 0%, #0a0a0f 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{
            background: "#f97316",
            color: "#000",
            fontSize: "10px",
            fontWeight: "700",
            padding: "3px 8px",
            letterSpacing: "2px",
          }}>NASA</div>
          <div style={{ color: "#475569", fontSize: "11px", letterSpacing: "3px" }}>POWER OF TEN</div>
        </div>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#f8fafc",
          margin: "0 0 6px",
          letterSpacing: "-0.5px",
        }}>Python Coding Agent Prompt Kit</h1>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Adapted from Gerard Holzmann's safety-critical rules · Balanced enforcement mode
        </p>
      </div>

      {/* Rule Cards */}
      <div style={{
        padding: "24px 40px",
        borderBottom: "1px solid #1e293b",
        background: "#0c0c14",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#475569", marginBottom: "14px" }}>
          ADAPTED RULES
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
        }}>
          {ruleCards.map((r) => (
            <div key={r.num} style={{
              background: "#111118",
              border: "1px solid #1e293b",
              padding: "12px",
              position: "relative",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#f97316",
                opacity: 0.4,
                lineHeight: 1,
                marginBottom: "6px",
              }}>{r.num}</div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#e2e8f0", marginBottom: "4px" }}>
                {r.title}
              </div>
              <div style={{ fontSize: "10px", color: "#475569", lineHeight: "1.5" }}>
                {r.desc}
              </div>
              <div style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#22c55e",
              }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "16px", fontSize: "10px", color: "#475569" }}>
          <span><span style={{ color: "#22c55e" }}>●</span> ENFORCE — hard rule</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> WARN — flag + explain tradeoff</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 40px", borderBottom: "1px solid #1e293b", display: "flex", gap: "0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #f97316" : "2px solid transparent",
              color: activeTab === tab.id ? "#f97316" : "#64748b",
              padding: "16px 20px",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "1px",
              fontFamily: "inherit",
              transition: "color 0.2s",
            }}
          >
            {tab.icon} {tab.label.toUpperCase()}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#22c55e" : "#f97316",
              color: "#000",
              border: "none",
              padding: "8px 16px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "1px",
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            {copied ? "✓ COPIED" : "COPY"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 40px 40px" }}>
        <div style={{
          background: "#0c0c14",
          border: "1px solid #1e293b",
          padding: "24px",
          overflowX: "auto",
        }}>
          {activeTab === "example" ? (
            <pre style={{
              margin: 0,
              fontSize: "12px",
              lineHeight: "1.8",
              color: "#94a3b8",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {EXAMPLE_CODE.split("\n").map((line, i) => {
                let color = "#94a3b8";
                if (line.startsWith("#")) color = "#4a5568";
                if (line.includes("✅") || line.includes("⚠️") || line.includes("📝")) color = "#64748b";
                if (line.match(/^(def |class |from |import )/)) color = "#7dd3fc";
                if (line.includes('"""')) color = "#6b7280";
                if (line.includes("raise ") || line.includes("assert ")) color = "#fca5a5";
                if (line.includes("logger.")) color = "#a78bfa";
                if (line.includes("# Rule")) color = "#f59e0b";
                if (line.includes(": Optional") || line.includes("-> ")) color = "#86efac";
                return (
                  <span key={i} style={{ display: "block", color }}>
                    {line || " "}
                  </span>
                );
              })}
            </pre>
          ) : (
            <pre style={{
              margin: 0,
              fontSize: "12px",
              lineHeight: "1.8",
              color: "#94a3b8",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {contentMap[activeTab].split("\n").map((line, i) => {
                let color = "#94a3b8";
                if (line.startsWith("##")) color = "#f97316";
                if (line.startsWith("###")) color = "#fb923c";
                if (line.startsWith("- ✅") || line.includes("✅")) color = "#86efac";
                if (line.includes("⚠️")) color = "#fbbf24";
                if (line.startsWith("- ") && !line.includes("⚠️") && !line.includes("✅")) color = "#cbd5e1";
                if (line.startsWith("**")) color = "#e2e8f0";
                if (line.startsWith("#") && !line.startsWith("##")) color = "#475569";
                if (line.includes("Rule")) color = "#7dd3fc";
                if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) color = "#c4b5fd";
                return (
                  <span key={i} style={{ display: "block", color }}>
                    {line || " "}
                  </span>
                );
              })}
            </pre>
          )}
        </div>

        {/* Usage hint */}
        <div style={{
          marginTop: "16px",
          padding: "14px 18px",
          background: "#0f1117",
          border: "1px solid #1e293b",
          borderLeft: "3px solid #f97316",
          fontSize: "12px",
          color: "#64748b",
          lineHeight: "1.6",
        }}>
          {activeTab === "system" && (
            <span>Paste this into your agent's <span style={{ color: "#f97316" }}>system prompt</span> in Cursor, Claude Projects, or any coding assistant that accepts a system instruction. It will apply to every code generation in that session.</span>
          )}
          {activeTab === "template" && (
            <span>Use this as your <span style={{ color: "#f97316" }}>per-request template</span>. Fill in the fields and send alongside the system prompt for best results. Good for one-off tasks or when context changes between requests.</span>
          )}
          {activeTab === "example" && (
            <span>A <span style={{ color: "#f97316" }}>compliant transaction validator</span> showing all 10 rules in action — inline Rule comments, assertion density, type hints, bounded loop, explicit error handling, and a compliance header. Use as a few-shot example in your prompt.</span>
          )}
        </div>
      </div>
    </div>
  );
}
