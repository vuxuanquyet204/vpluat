import { http, HttpResponse, delay } from 'msw';

const handlers = [
  // Create session
  http.post('*/api/chatbot/sessions', async () => {
    await delay(100);
    return HttpResponse.json({
      sessionId: `sess_test_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }),

  // Get session history
  http.get('*/api/chatbot/sessions/:sessionId', async ({ params }) => {
    const { sessionId } = params as { sessionId: string };
    await delay(80);
    return HttpResponse.json({
      sessionId,
      messages: [],
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // Send message — streaming via SSE
  http.post('*/api/chatbot/message', async ({ request }) => {
    const body = (await request.json()) as { message: { content: string } };
    const userText = body.message?.content ?? '';

    // Simulate streaming: split response into chunks
    let responseText = '';
    if (userText.includes('doanh nghiệp') || userText.includes('Luật Doanh nghiệp')) {
      responseText = 'Về Luật Doanh nghiệp, tôi có thể hỗ trợ bạn về thành lập công ty, soạn thảo hợp đồng và giải quyết tranh chấp thương mại.';
    } else if (userText.includes('đặt lịch') || userText.includes('tư vấn')) {
      responseText = 'Tuyệt vời! Để tôi kết nối bạn với luật sư phù hợp nhé. Cho tôi xin thông tin của bạn:';
    } else {
      responseText = 'Cảm ơn bạn! Tôi đã nhận được tin nhắn. Bạn cần hỗ trợ thêm gì không?';
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = i < words.length - 1 ? words[i] + ' ' : words[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`));
          await delay(30);
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true, quickReplies: [
          { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
          { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
        ]})}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }),
];

export { handlers };
