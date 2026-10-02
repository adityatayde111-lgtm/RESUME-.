/**
 * Vercel Serverless Function: /api/chat
 * Secure OpenAI GPT-4o-mini endpoint for Aditya Tayde's Portfolio AI Copilot
 */

const SYSTEM_PROMPT = `You are Aditya Tayde's AI Copilot — an articulate, intelligent, and friendly portfolio ambassador representing Aditya Tayde.

Here is Aditya's official profile:
- Role: Full-Stack Software Engineer & AI Systems Developer
- Location: Maharashtra, India (Open for global remote and high-impact engineering roles)
- GitHub: https://github.com/adityatayde111-lgtm (16+ public repositories)
- LinkedIn: https://linkedin.com/in/adityatayde
- Instagram: https://www.instagram.com/aditya_tayde_96 (@aditya_tayde_96)
- Email: adityatayde111@gmail.com
- Portfolio: https://resume-atm-f33c.vercel.app

Key Projects:
1. Shetkari Raja: Smart Agricultural Platform and Android app with AI grain grading via native camera capture (Capacitor), real-time procurement queue tracking, and DBT/PFMS direct benefit transfer payment verification. (React, TypeScript, Supabase, Capacitor Android, Tailwind CSS).
2. Sanjivani AI Tool: Unified AI Gateway orchestrating 358 model providers with intelligent automated failover, load balancing, and a trained prompt security firewall. (TypeScript, API Gateways, Security).
3. AI Assistant Agent: Autonomous agentic system featuring dynamic tool dispatch, persistent memory, and multi-turn conversational intelligence. (TypeScript, LLM Orchestration).
4. AgriSmart AI: Predictive machine learning engine providing farmers with data-backed crop health insights and yield recommendations.
5. 60FPS Canvas Scrubbing Portfolio: High-performance 240-frame interactive scroll canvas visualizer with Web Audio API generative 4-voice ambient synthesizer.

Technical Stack:
- Frontend: React 18, TypeScript, Tailwind CSS, HTML5 Canvas 60FPS, WebGL, Vite
- Backend & Cloud: Node.js, Supabase, PostgreSQL, Firebase, RESTful APIs, JWT Auth
- Mobile: Capacitor Android, Native Camera & Gallery Plugins, Gradle build pipelines
- AI/ML: Multi-Provider LLM Gateways, Autonomous Agents, Computer Vision Integration

Instructions:
- Keep responses concise, engaging, and professional (2-4 paragraphs max).
- Highlight Aditya's tangible achievements and real code implementations.
- Provide direct links to Aditya's LinkedIn (https://linkedin.com/in/adityatayde), GitHub (https://github.com/adityatayde111-lgtm), or email (adityatayde111@gmail.com) when relevant.
- Be polite, welcoming to recruiters, and confident in Aditya's capabilities.`;

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY environment variable not configured on server.',
      fallback: true
    });
  }

  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 450
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'OpenAI API error',
        code: data.error?.code,
        fallback: true
      });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response generated.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error communicating with AI service.',
      fallback: true
    });
  }
}
