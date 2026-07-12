# Benchmark results

## 1. Recognized benchmark sample: OpenAI HumanEval

HumanEval is OpenAI's hand-written Python code-generation benchmark. This kit uses five public canonical tasks from the beginning of the dataset:

| Task | Capability | Result |
|---|---|---:|
| HumanEval/0 | detect close floating-point pairs | pass |
| HumanEval/1 | separate balanced parenthesis groups | pass |
| HumanEval/2 | return the fractional component | pass |
| HumanEval/3 | detect a negative running balance | pass |
| HumanEval/4 | mean absolute deviation | pass |

**Observed sample result: 5/5 tasks passed, 20/20 assertions passed.**

Run it with:

```bash
python benchmarks/humaneval_sample/test_humaneval_sample.py
```

### Limitations

- This is a five-task sample, not the full 164-task HumanEval benchmark.
- It was completed in one conversation rather than repeated fresh runs.
- HumanEval is public, so training-data contamination is possible.
- The model had tool access and could execute tests.
- No pass@k estimate, latency measurement, or token count was available.

The correct claim is **5/5 on this executable sample**, not “100% HumanEval.”

## 2. Custom capability audit

The earlier audit scored **95/100** on its own rubric:

- 17/17 structured instruction, reasoning, and extraction checks passed.
- 6/6 dependency-scheduler coding tests passed.
- Current official sources were retrieved and cited.
- One initial working-directory mistake was recovered from and recorded.
- Writing and research were conservatively discounted because they were not blindly graded.

See [`CUSTOM-AUDIT.md`](CUSTOM-AUDIT.md) for the detailed scorecard.

## Recommended full evaluation

For a defensible model comparison, run a hidden suite containing:

1. Full or large-sample HumanEval/MBPP coding tasks.
2. IFEval-style instruction-following tests.
3. Domain questions from MMLU-Pro or an equivalent licensed dataset.
4. Private real tasks from your own coding, writing, learning, and presentation history.
5. At least five fresh runs per configuration.
6. Deterministic graders plus blinded qualitative grading.
7. Recorded success, latency, tokens, retries, and cost.

