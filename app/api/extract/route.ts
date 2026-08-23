const RULE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["accepted", "title", "mode", "variables", "clauses", "ambiguities"],
  properties: {
    accepted: { type: "boolean" },
    title: { type: "string" },
    mode: { type: "string", enum: ["policy", "software", "unknown"] },
    variables: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "domainText"],
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["integer", "number", "boolean", "category", "datetime", "text"] },
          domainText: { type: "string" },
        },
      },
    },
    clauses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceQuote", "plainMeaning", "variable", "operator", "valueText"],
        properties: {
          sourceQuote: { type: "string" }, plainMeaning: { type: "string" }, variable: { type: "string" },
          operator: { type: "string", enum: ["equals", "not_equals", "less_than", "at_most", "greater_than", "at_least", "in", "not_in", "requires", "forbids", "unknown"] },
          valueText: { type: "string" },
        },
      },
    },
    ambiguities: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["sourceQuote", "reason"],
        properties: { sourceQuote: { type: "string" }, reason: { type: "string" } },
      },
    },
  },
};

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "Rule reading is not connected." }, { status: 503 });
  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 20) return Response.json({ error: "Add at least one complete rule." }, { status: 400 });
  if (text.length > 12000) return Response.json({ error: "For this demo, keep the rules under 12,000 characters." }, { status: 400 });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_output_tokens: 1200,
      input: [
        { role: "developer", content: "You are a narrow rule transcriber. Extract only what the supplied words explicitly say. Never decide whether rules conflict, calculate outcomes, count people, propose a fix, or invent a missing value. Preserve short source quotes exactly. If the input is not a policy or software specification, set accepted to false and return empty arrays." },
        { role: "user", content: text },
      ],
      text: { format: { type: "json_schema", name: "rule_draft", strict: true, schema: RULE_SCHEMA } },
    }),
  });

  if (!response.ok) return Response.json({ error: "The rule reader could not complete this request." }, { status: 502 });
  const payload = await response.json() as any;
  const outputText = payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
  if (!outputText) return Response.json({ error: "The rule reader returned no usable draft." }, { status: 502 });
  return Response.json({ draft: JSON.parse(outputText), boundary: "AI transcription only. Deterministic checking has not run yet.", usage: payload.usage ? { inputTokens: payload.usage.input_tokens, outputTokens: payload.usage.output_tokens } : null });
}
