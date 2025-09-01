import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id, language = "en" } = await request.json()

    // In a real implementation, you would integrate with Dify API here
    // const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     inputs: {},
    //     query: message,
    //     response_mode: 'blocking',
    //     conversation_id: conversation_id,
    //     user: conversation_id,
    //   }),
    // })

    // For demo purposes, we'll simulate a mental health assistant response
    const responses = {
      en: [
        "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what's been on your mind lately?",
        "It sounds like you're going through a challenging time. Remember that seeking help is a sign of strength, not weakness.",
        "Thank you for sharing that with me. How has this been affecting your daily life and relationships?",
        "I appreciate your openness. Have you tried any coping strategies that have helped you in the past?",
        "Your mental health matters, and I'm here to support you. What would feel most helpful for you right now?",
        "It's completely normal to feel this way. Many people experience similar challenges. You're not alone in this.",
        "I can sense that this is important to you. Would you like to explore some techniques that might help you manage these feelings?",
      ],
      id: [
        "Saya mendengar Anda, dan saya ingin Anda tahu bahwa perasaan Anda valid. Bisakah Anda ceritakan lebih lanjut tentang apa yang ada di pikiran Anda akhir-akhir ini?",
        "Sepertinya Anda sedang melalui masa yang menantang. Ingatlah bahwa mencari bantuan adalah tanda kekuatan, bukan kelemahan.",
        "Terima kasih telah berbagi dengan saya. Bagaimana hal ini mempengaruhi kehidupan sehari-hari dan hubungan Anda?",
        "Saya menghargai keterbukaan Anda. Apakah Anda pernah mencoba strategi koping yang membantu Anda di masa lalu?",
        "Kesehatan mental Anda penting, dan saya di sini untuk mendukung Anda. Apa yang akan terasa paling membantu bagi Anda saat ini?",
        "Sangat normal untuk merasakan hal ini. Banyak orang mengalami tantangan serupa. Anda tidak sendirian dalam hal ini.",
        "Saya dapat merasakan bahwa ini penting bagi Anda. Apakah Anda ingin mengeksplorasi beberapa teknik yang mungkin membantu Anda mengelola perasaan ini?",
      ],
    }

    const languageResponses = responses[language as keyof typeof responses] || responses.en
    const randomResponse = languageResponses[Math.floor(Math.random() * languageResponses.length)]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      message: randomResponse,
      conversation_id: conversation_id,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
