import axios from 'axios'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'

const SYSTEM_PROMPT = `You are CR42, an expert senior software engineer and code reviewer. 
Analyse the provided code and return a comprehensive review in strictly valid JSON format.
Output ONLY raw JSON. Do NOT include markdown code blocks (e.g., no \`\`\`json).

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
  "refactoredCode": "string — the full corrected and improved version of the code."
}

CRITICAL RULES:
1. If the provided code is complex or large, focus on 'bugs' and 'summary' first. 
2. In 'refactoredCode', if the file is too long to rewrite safely (over 200 lines), provide only the most important sections or a comment: '// Refactored code omitted to ensure response fits in JSON.'
3. Ensure every string is properly escaped for JSON.
4. Output raw JSON only.`

function extractJson(content) {
  try {
    return JSON.parse(content)
  } catch (err) {
    // Attempt to extract the first { ... } block
    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      const candidate = content.slice(firstBrace, lastBrace + 1)
      try {
        return JSON.parse(candidate)
      } catch (e) {
        throw new Error('The AI generated malformed JSON due to output length limits.')
      }
    }
    throw new Error('No valid JSON found in AI response.')
  }
}

export async function reviewCode({ code, language }) {
  const userMessage = `Language: ${language}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE}/chat/completions`,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Lower temperature for more consistent JSON
        max_tokens: 6000,   // Safety buffer to prevent cut-off halfway through a string
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'CR42 AI Code Review',
          'Content-Type': 'application/json',
        },
        timeout: 90000,
      }
    )

    const content = response.data?.choices?.[0]?.message?.content
    if (!content) throw new Error('AI model returned an empty response.')

    return extractJson(content)
  } catch (err) {
    if (err.response?.status === 402) throw new Error('OpenRouter: Out of credits')
    if (err.response?.status === 429) throw new Error('OpenRouter: Rate limit reached')
    if (err.code === 'ECONNABORTED') throw new Error('AI review timed out. Try a smaller code snippet.')
    
    console.error('[AI SERVICE ERROR]', err.message)
    throw err
  }
}

