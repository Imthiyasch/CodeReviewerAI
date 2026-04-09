import axios from 'axios'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'

const SYSTEM_PROMPT = `You are CR42, an expert senior software engineer and code reviewer. 
Analyse the provided code and return a comprehensive review in strictly valid JSON format.
Do NOT add markdown code fences — output raw JSON only.

Your JSON schema must be EXACTLY:
{
  "summary": "string — 2-4 sentences summarising overall code quality and key findings",
  "bugs": [
    {
      "line": number_or_null,
      "severity": "critical|high|warning|info|low",
      "description": "string",
      "fix": "string — corrected code snippet"
    }
  ],
  "quality": {
    "score": 0-100,
    "readability": 0-100,
    "maintainability": 0-100,
    "performance": 0-100
  },
  "security": [
    {
      "type": "string — vulnerability type e.g. SQL Injection",
      "line": number_or_null,
      "description": "string",
      "fix": "string — how to fix"
    }
  ],
  "suggestions": ["string", "string"],
  "documentation": "string — JSDoc or docstring for the main function/class, in markdown",
  "refactoredCode": "string — the full corrected and improved version of the code. CRITICAL LIMITATION: If the provided code is large (over 300 lines or highly complex), DO NOT attempt to rewrite the entire file. Simply return: '// Refactored code omitted due to large file size to prevent output limits. Refer to specific bug fixes above.'"
}

Be thorough but concise. Real bugs only — no false positives.`

export async function reviewCode({ code, language }) {
  const userMessage = `Language: ${language}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``

  const response = await axios.post(
    `${OPENROUTER_BASE}/chat/completions`,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8192,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'CR42 AI Code Review',
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    }
  )

  const content = response.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No response from AI model')

  try {
    return JSON.parse(content)
  } catch (err) {
    // Try to extract JSON from the response
    try {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    } catch {
      console.error("JSON PARSE ERROR (Partial response):", content)
    }
    throw new Error(err.message + '\\n(Issue: The AI hit output size limits while compiling the review JSON)')
  }
}
