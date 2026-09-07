const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const generateAIResponse = async (
  previousMessages,
  message,
  language
) => {
  const now = new Date()

const currentDate = now.toLocaleDateString("en-IN")
const currentTime = now.toLocaleTimeString("en-IN")

const history = previousMessages
  .map(msg => `${msg.role}: ${msg.content}`)
  .join("\n")

const prompt = `
You are a helpful multilingual AI assistant.

Rules:
- Reply naturally and conversationally
- Do NOT mention knowledge cutoff
- If user asks current date/time, answer confidently
- IMPORTANT: Respond ONLY in ${language}
- If language is Kannada, respond fully in Kannada
- If language is Hindi, respond fully in Hindi
- If language is English, respond fully in English

Conversation History:
${history}

Current User Message:
${message}
`

 const response = await groq.chat.completions.create({
  messages: [
    {
  role: "system",
  content: `
You are a multilingual AI assistant.

Current Date: ${currentDate}
Current Time: ${currentTime}

Rules:
- Reply naturally and conversationally
- Do NOT mention knowledge cutoff
- Always respond only in ${language}
- If the user asks for the current date or time, use the values provided above
`,
},
    {
      role: "user",
      content: `
Conversation History:
${history}

Current User Message:
${message}
`,
    },
  ],
  model: "llama-3.3-70b-versatile",
})

  return response.choices[0].message.content
}

module.exports = generateAIResponse