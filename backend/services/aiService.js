const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const generateAIResponse = async (message, language) => {

const prompt = `
You are a helpful multilingual AI assistant.

Rules:
- Reply naturally and conversationally
- Do NOT mention knowledge cutoff
- If user asks current date/time, answer confidently
- Reply in ${language}

User message:
${message}
`

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],

    model: "llama-3.3-70b-versatile",
  })

  return response.choices[0].message.content
}

module.exports = generateAIResponse