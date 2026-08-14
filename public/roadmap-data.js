window.MASTERY_DATA = {
  projects: [
    {
      id: "P01", slug: "p01", title: "Webhook Command Center",
      why: "Reliable intake is the foundation of every serious automation.",
      what: "Build a signed webhook receiver that validates a lead payload, normalizes it, returns a clear response, and routes bad data to an exception queue.",
      subprojects: [
        {
          title: "Intake & Validation",
          description: "Set up the webhook to receive data and strictly validate the incoming schema.",
          skills: ["Webhook", "HTTP headers", "JSON parsing", "schema validation"],
          buildTasks: [
            "Receive a form payload and return a 200 response"
          ],
          failureTests: [
            "Reject a missing or malformed email with a 400",
            "Malformed JSON produces a visible exception",
            "Bad authentication produces a clear 401/403 response"
          ]
        },
        {
          title: "Normalization & Routing",
          description: "Clean up the valid payloads and separate the raw input from the normalized output.",
          skills: ["Data mapping", "Error boundaries", "Conditional logic"],
          buildTasks: [
            "Normalize a nested lead payload in a Code node",
            "Record raw input and normalized output separately",
            "Happy path payload reaches the normalized output"
          ],
          failureTests: [
            "A timeout or 500 triggers the error workflow"
          ]
        }
      ],
      gate: "You can diagnose a malformed payload, auth error, rate-limit response, and server failure without help.",
      content: "First working webhook demo: publish what the payload looks like, how it breaks, and how you caught it."
    },
    {
      id: "P02", slug: "p02", title: "Lead-to-CRM Routing Engine",
      why: "This is a direct lead-to-cash system: fast response, clean CRM data, and visible ownership.",
      what: "Build form/webhook → enrichment → lead scoring → CRM upsert → owner routing → Slack notification, with an approval queue for uncertain or high-value leads.",
      subprojects: [
        {
          title: "Enrichment & CRM Integration",
          description: "Call external APIs to enrich lead data and upsert into the CRM without duplicating records.",
          skills: ["REST APIs", "API keys vs OAuth", "Idempotency"],
          buildTasks: [
            "Call an enrichment API and map its response",
            "Upsert a CRM contact by email/domain"
          ],
          failureTests: [
            "Duplicate event ID produces no second CRM record",
            "Same lead on a new event updates rather than duplicates"
          ]
        },
        {
          title: "Scoring & Routing",
          description: "Apply business rules to score leads and route them for approval.",
          skills: ["Business logic", "Queue management", "Retries"],
          buildTasks: [
            "Score a lead with transparent rules",
            "Route high-value leads to a human approval queue"
          ],
          failureTests: [
            "Expired credential alerts without losing the event",
            "429 response backs off and retries within a limit",
            "A failed CRM write can be replayed safely"
          ]
        }
      ],
      gate: "Duplicate delivery produces exactly one CRM record and every routing decision is auditable.",
      content: "Portfolio demo: show the duplicate event, the idempotency record, and the single correct CRM outcome."
    },
    {
      id: "P03", slug: "p03", title: "CRM Data Quality + SLA Engine",
      why: "Dirty CRM data destroys routing, forecasting, and AI initiatives. Cleaning it is valuable and measurable.",
      what: "Build a scheduled CRM audit that paginates records, normalizes names/domains/phones/stages, detects stale ownership and duplicates, creates exceptions, and sends a daily health report.",
      subprojects: [
        {
          title: "Batch Processing & Pagination",
          description: "Fetch large datasets reliably using cursor pagination and process them in batches.",
          skills: ["Cursor pagination", "Batching", "Promises"],
          buildTasks: [
            "Fetch a paginated API until the cursor ends"
          ],
          failureTests: [
            "10,000-record import completes in bounded batches",
            "429 responses use exponential backoff with a retry cap"
          ]
        },
        {
          title: "Data Cleansing & Checkpointing",
          description: "Normalize data fields and track process state so partial failures can resume safely.",
          skills: ["Regex", "SQL", "State management"],
          buildTasks: [
            "Normalize a batch of names and phone numbers",
            "Store a batch checkpoint in Postgres",
            "Send a daily health summary from stored results"
          ],
          failureTests: [
            "Duplicate/stale records enter an exception queue",
            "A partial batch failure resumes from its checkpoint",
            "Dead-letter items can be replayed without corruption"
          ]
        }
      ],
      gate: "A large batch can fail halfway, resume safely, and never corrupt or duplicate data.",
      content: "Case-study demo: before/after data health metrics and the failure-recovery path."
    },
    {
      id: "P04", slug: "p04", title: "Multi-System Data Sync",
      why: "Cross-system handoffs are where revenue and operations data quietly breaks.",
      what: "Build a two-way sync between a CRM, database, spreadsheet, or ERP sandbox with a defined source of truth, conflict rules, timestamps, external IDs, and replay logic.",
      subprojects: [
        {
          title: "Sync Architecture",
          description: "Define ownership across systems and synchronize records using external IDs.",
          skills: ["Source of truth mapping", "Event ordering", "Timestamps"],
          buildTasks: [
            "Define ownership for each field across two systems",
            "Sync one changed record with an external ID"
          ],
          failureTests: [
            "Out-of-order events do not overwrite newer data",
            "Missing external IDs create an exception"
          ]
        },
        {
          title: "Conflict Resolution & Replay",
          description: "Handle conflicting edits and safely replay failed synchronization events.",
          skills: ["Conflict handling", "Queues", "Idempotency"],
          buildTasks: [
            "Detect and flag a conflicting edit"
          ],
          failureTests: [
            "Source-of-truth rules resolve conflicting edits consistently",
            "Replay one failed record from a runbook",
            "A failed record can be replayed by ID",
            "Retry never duplicates a downstream record"
          ]
        }
      ],
      gate: "You can point to every field’s source of truth and explain why retries cannot corrupt it.",
      content: "Explain one real data-conflict scenario and the rule that resolves it."
    },
    {
      id: "P05", slug: "p05", title: "Invoice / Quote Reconciliation Desk",
      why: "Finance teams pay for reliable exception handling because errors hit cash, trust, and auditability.",
      what: "Ingest test invoices or payments, extract strict structured fields, match them to CRM/accounting records, flag mismatches, and require human approval before any accounting update.",
      subprojects: [
        {
          title: "Secure Ingestion & Extraction",
          description: "Receive signed invoice payloads and extract structured fields safely.",
          skills: ["Webhook signatures", "Structured LLM outputs", "JSON Schema"],
          buildTasks: [
            "Verify a signed invoice webhook",
            "Parse a document into a fixed JSON schema"
          ],
          failureTests: [
            "Signature verification rejects altered payloads",
            "Malformed invoice data never updates accounting"
          ]
        },
        {
          title: "Matching & Approvals",
          description: "Match extracted data to existing records and enforce human review on exceptions.",
          skills: ["SQL joins", "Transactions", "Audit logs"],
          buildTasks: [
            "Match invoice fields to CRM records with SQL",
            "Create an approval state and immutable audit entry"
          ],
          failureTests: [
            "Duplicate invoice events create one reconciliation record",
            "Ambiguous matches require human review",
            "Approved retry creates one final outcome"
          ]
        }
      ],
      gate: "Ambiguous, duplicate, malformed, and retried invoices all reach one correct and auditable outcome.",
      content: "High-value demo: show how exceptions—not blind automation—protect finance operations."
    },
    {
      id: "P06", slug: "p06", title: "Customer Onboarding Orchestrator",
      why: "Fast, error-free onboarding turns closed revenue into activated customers.",
      what: "Build signed payment/contract event → customer workspace → role assignment → third-party provisioning → onboarding tasks → welcome flow.",
      subprojects: [
        {
          title: "State Management & Provisioning",
          description: "Model onboarding states and execute third-party provisioning securely.",
          skills: ["State machines", "OAuth refresh", "Secrets"],
          buildTasks: [
            "Model onboarding as explicit states",
            "Provision a sandbox account using OAuth"
          ],
          failureTests: [
            "Duplicate payment event cannot create duplicate accounts",
            "Expired OAuth token refreshes or creates a visible exception"
          ]
        },
        {
          title: "Roles & Recovery",
          description: "Assign least-privilege roles and handle partial failures.",
          skills: ["RBAC", "Compensating actions", "Eventual consistency"],
          buildTasks: [
            "Assign a role using least privilege"
          ],
          failureTests: [
            "Privileged action needs explicit approval",
            "Create a recovery path for one failed provisioning step",
            "Partial provisioning exposes current state and recovery action",
            "Stale onboarding state times out and alerts"
          ]
        }
      ],
      gate: "Every partial failure has a documented recovery path without duplicate accounts or lost state.",
      content: "Show the state machine—not just the happy path—to demonstrate serious engineering."
    },
    {
      id: "P07", slug: "p07", title: "AI Support + SLA System",
      why: "AI is valuable only when it improves speed without creating unsafe external actions.",
      what: "Build ticket/email intake → constrained classification → priority → reply draft → human approval → SLA escalation, with explicit safety and cost boundaries.",
      subprojects: [
        {
          title: "Constrained AI Processing",
          description: "Use LLMs securely for classification and strictly validate outputs.",
          skills: ["JSON Schema", "Prompt injection", "Token cost"],
          buildTasks: [
            "Force an LLM response into a strict schema"
          ],
          failureTests: [
            "Schema-invalid AI output is rejected",
            "Token/cost threshold stops excess volume",
            "Add a prompt-injection test ticket",
            "Injected instructions cannot alter external actions"
          ]
        },
        {
          title: "Human-in-the-Loop & Evaluation",
          description: "Implement confidence thresholds and evaluate prompt changes systematically.",
          skills: ["Evaluations", "Confidence thresholds", "PII handling"],
          buildTasks: [
            "Create a low-confidence human-review route",
            "Run a fixed evaluation set after changing a prompt"
          ],
          failureTests: [
            "Low-confidence classification routes to humans",
            "No reply is sent without explicit approval"
          ]
        }
      ],
      gate: "A malicious ticket cannot change system behavior, and prompt changes pass a regression evaluation.",
      content: "Teach the difference between safe AI assistance and an unsafe autonomous agent."
    },
    {
      id: "P08", slug: "p08", title: "Self-Hosted n8n Operations",
      why: "Reliable delivery and retainers require you to understand where automations run, fail, and recover.",
      what: "Build your own non-client n8n environment with Docker Compose, Postgres, HTTPS, encrypted credentials, retention rules, backups, monitoring, staging, and production.",
      subprojects: [
        {
          title: "Infrastructure & Security",
          description: "Deploy n8n with best practices for secrets and execution retention.",
          skills: ["Docker", "Linux", "Secrets management"],
          buildTasks: [
            "Run n8n and Postgres with Docker Compose",
            "Configure execution retention"
          ],
          failureTests: [
            "Execution data is pruned on schedule",
            "Secrets never enter Git"
          ]
        },
        {
          title: "Reliability & Recovery",
          description: "Ensure the system can be monitored, backed up, and fully restored.",
          skills: ["Backups", "Monitoring", "Incident response"],
          buildTasks: [
            "Back up and restore a workflow/state database",
            "Write a rollback and incident runbook"
          ],
          failureTests: [
            "Restore works in a clean environment",
            "A failed workflow creates an alert",
            "Staging changes do not alter production"
          ]
        }
      ],
      gate: "You can restore the system from backup and explain the recovery process to a client.",
      content: "Document the restore rehearsal. Reliability content is more credible than another node tutorial."
    },
    {
      id: "P09", slug: "p09", title: "RevOps Control Tower",
      why: "This turns recurring automation exceptions into a product-quality operator experience.",
      what: "Build a Next.js + Supabase app for approvals, exceptions, execution history, and workflow metrics after the automation projects themselves work.",
      subprojects: [
        {
          title: "Multi-Tenant Architecture",
          description: "Design a secure schema to strictly separate data across multiple organizations.",
          skills: ["TypeScript", "Row-Level Security", "AuthZ"],
          buildTasks: [
            "Design an organization/member/role schema",
            "Write an RLS policy for a tenant-owned record",
            "Test two organizations with separate data"
          ],
          failureTests: [
            "Tenant A cannot view Tenant B records",
            "Tenant A cannot approve Tenant B exceptions"
          ]
        },
        {
          title: "Operator Actions & Auditing",
          description: "Build interfaces for handling automation exceptions and retries safely.",
          skills: ["React", "Server actions", "Auditing"],
          buildTasks: [
            "Render a failed execution and retry action",
            "Audit log records each approval"
          ],
          failureTests: [
            "A retry action is permission-checked",
            "Secrets remain server-side"
          ]
        }
      ],
      gate: "Two organizations cannot access, infer, or approve each other’s data.",
      content: "Only build this after client work reveals the same exception workflow repeatedly."
    }
  ]
};
