# Development, Safety, and QA Guide

MindGuard AI is a wellbeing-oriented application starter. Verify the current source and integrations before describing a feature as implemented. The application must not present generated text as a diagnosis or a replacement for professional care.

## Setup and secrets

```bash
git clone https://github.com/kandisaikishore/MindGuard-AI.git
cd MindGuard-AI
```

Use the package scripts and runtime requirements declared by the repository. If an AI provider is integrated, configure its key locally using an untracked environment file or secret manager. Never commit keys, real user conversations, or sensitive wellbeing records.

## Functional and safety tests

For implemented wellbeing workflows, test:
- Empty and malformed user input
- AI provider timeout, rate limit, invalid response, and unavailable credentials
- Output validation and recoverable error states
- Clear language that distinguishes general information from diagnosis or treatment
- Repeated submissions and stale responses
- User-controlled save/delete behavior, if personal records are stored

Use mocked AI responses in tests. Avoid live provider calls and real personal health data in automated test suites.

## Safety boundaries

- Do not claim the app diagnoses, treats, or replaces a clinician.
- Do not fabricate clinical sources, crisis resources, or provider actions.
- If crisis guidance is implemented, verify the resource details for the deployment region and make emergency escalation language clear.
- Avoid storing or logging sensitive user text unless required and transparently disclosed.
- Where accounts exist, test authorization and prevent cross-user access.

## Privacy and deployment

Document what data is collected, where it is stored, retention/deletion behavior, and any external AI processing based on the actual implementation. Do not claim compliance with a privacy or medical standard without a documented review.

## Pull-request checklist

- [ ] Add tests for both normal and high-risk/error paths relevant to the change.
- [ ] Run the declared test/build commands and record results.
- [ ] State which AI/provider behavior was mocked.
- [ ] Review logs and error responses for sensitive content.
- [ ] Keep safety limitations and unimplemented features explicit.
