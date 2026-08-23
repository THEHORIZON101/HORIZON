# Archemidy — Five-Minute Hackathon Demo Script

**Target length:** 4 minutes 35 seconds  
**Audience:** Judges with no specialist background  
**Goal:** Make the problem obvious first, then reveal the mathematics.

## Before recording

- Use the deployed application, not a local URL.
- Record at 1080p with the browser at 100% zoom.
- Close unrelated tabs, notifications, bookmarks, and personal information.
- Keep the cursor still while speaking.
- Speak slightly slower than normal.
- Do not begin with “symbolic model checking.” Show the human problem first.

## 0:00–0:18 — The hook

**Screen:** Archemidy landing page with the main tagline visible.

**Say:**

> A rule can sound perfectly reasonable by itself and still hurt someone when it meets another rule. Archemidy calculates what rules will actually do before they affect people.

Pause for one second on the tagline.

## 0:18–0:43 — Explain the product without jargon

**Screen:** Slowly reveal the three-step explanation.

**Say:**

> You give Archemidy the rules. It searches every meaningfully different case inside the model, finds a case where the rules disagree, tells you exactly how many cases are affected, and checks whether the smallest repair really fixes the problem.

> It does not ask an AI to guess whether the rules are correct. The final answers come from deterministic code, so the same rules always produce the same proof.

## 0:43–1:42 — Audit ReverieHacks itself

**Screen:** Open the ReverieHacks audit.

**Say:**

> Here is the clearest demonstration: Archemidy checked the instructions for this hackathon.

**Screen:** Show the two deadline clauses.

> One official page says the deadline is August 24 at 11:59 p.m. local time. The Devpost wording says August 24 at 12:00 a.m. Central time. Those may look almost identical, but they are nearly twenty-four hours apart.

**Screen:** Reveal the witness.

> Archemidy gives us one exact participant who proves the problem. Imagine a participant in Houston submitting at 10:00 a.m. on August 24. The website says that submission is on time. Devpost says it is late. Same participant, same submission, two opposite answers.

**Screen:** Show the correction.

> The repair is simple: publish one absolute timestamp with one named timezone everywhere.

**Screen:** Briefly show the required-file findings.

> It also found that two tracks declare four required files but name only three. A team could submit every listed item and still be unsure whether its entry is complete.

## 1:42–2:44 — The billion-profile breakthrough

**Screen:** Open the population analysis.

**Say:**

> The hardest problem was scale. Even a few variables—income, age, household size, region, and status—create more than ten billion possible profiles. Creating ten billion fake people would be slow and unnecessary.

**Screen:** Show the compression numbers.

> Archemidy notices that rules usually change only at boundaries. If a rule has limits at thirty thousand and seventy-five thousand dollars, it does not need to test every income between them separately. Everyone in a range that the rules treat identically becomes one exact symbolic region, with a weight recording how many profiles it represents.

> In this verified model, ten-point-seven-nine billion raw profiles become four-point-five-six-five billion feasible profiles. Archemidy represents the feasible model using only four hundred eighty symbolic regions.

**Screen:** Show the affected count and witness.

> It proves that the two rules disagree on exactly one hundred twelve million fifty thousand profiles. It also returns the first concrete example: a one-person household earning thirty thousand and one dollars.

> This is not an estimate or a sample. It is an exact count inside the bounds shown on screen.

## 2:44–3:20 — Prove the repair

**Screen:** Select the $75,000 repair and press **Prove the fix**.

**Say:**

> Finding a problem is only half the job. Archemidy compares candidate changes and selects the one that leaves the fewest conflicts while changing as little as possible.

Wait for the result before continuing.

> Here it changes one limit from thirty thousand to seventy-five thousand dollars. Then it rechecks all four-point-five-six-five billion feasible profiles. Zero conflicts remain.

> Archemidy does not merely suggest a fix. It proves the fix within the declared model.

## 3:20–3:57 — Show the software side

**Screen:** Open the software behavior demonstration.

**Say:**

> The same idea also works for software requirements. Suppose an order may never ship after it is cancelled. Archemidy explores the possible action sequences and returns the shortest sequence that breaks the rule.

**Point to each step while reading it.**

> Create order. Pay. Cancel. Ship.

> It found that four-step failure after exploring eight states. Because the search runs from shorter paths to longer paths, the returned failure is guaranteed to be the shortest one. That sequence can become a permanent regression test.

## 3:57–4:21 — Establish credibility

**Screen:** Show the verification section or repository tests.

**Say:**

> To verify the mathematics, we generated five thousand small random models. For every model, we compared Archemidy's symbolic answer with an independent brute-force count of every individual case. All five thousand matched.

> We also test the exact population numbers, the repair proof, the hackathon audit, the shortest software failure, the production build, and the rendered application.

## 4:21–4:35 — Final line

**Screen:** Return to the main statement and logo.

**Say:**

> Archemidy turns written rules into consequences people can see before anyone is affected: one contradiction, one exact witness, the full impact, and a repair that has been proven. Thank you.

Hold the final screen for two seconds.

## Recording notes

### Words to emphasize

- **same participant, same submission, two opposite answers**
- **exactly 112,050,000**
- **not an estimate**
- **zero conflicts remain**
- **all 5,000 matched**

### Claims to avoid

Do not say that Archemidy proves every policy is fair, that AI checks billions of people, that the engine supports unlimited variables, or that SMT/BDD backends are already implemented.

Instead say:

- “Exact within the declared bounded model.”
- “AI transcribes; deterministic code proves.”
- “Equivalent cases are compressed into exact symbolic regions.”

