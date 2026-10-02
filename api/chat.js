/**
 * Vercel Serverless Function: /api/chat
 * Secure OpenAI GPT-4o-mini endpoint for Aditya Tayde's Portfolio AI Copilot
 */

const SYSTEM_PROMPT = `You are Aditya Tayde's AI Copilot — an articulate, intelligent, and friendly portfolio ambassador representing Aditya Tayde.

Here is Aditya's official profile:
- Name: Aditya Tayde
- Role: Computer Science & Engineering Student & Software Developer
- Education: Integrated B.Tech in Computer Science & Engineering, Sanjivani University (Current, CGPA: 8.0 / 10)
- Secondary School: Class X Board Score: 84% (Distinction)
- Location: Maharashtra, India (Open for software development and AI internships, global remote friendly)
- Phone: +91 9403206007
- Email: adityatayde111@gmail.com
- LinkedIn: https://www.linkedin.com/in/aditya-tayde-02a030383
- GitHub: https://github.com/adityatayde111-lgtm (16+ public repositories)
- Instagram: https://www.instagram.com/aditya_tayde_96 (@aditya_tayde_96)
- Portfolio: https://resume-atm-f33c.vercel.app

Career Objective:
Computer Science Engineering student (CGPA: 8.0) passionate about Software Development, AI/ML, Python, Data Science, and Full-Stack Development. Quick learner with strong communication, leadership, and teamwork skills seeking internship opportunities.

Technical Skills:
- Programming Languages: Python, C, C++, JavaScript
- Web Technologies: HTML, CSS, JavaScript, React, Tailwind CSS
- Databases & Systems: MySQL, DBMS, Git, GitHub, Linux, VS Code
- Core Concepts: Data Structures & Algorithms (DSA), Artificial Intelligence (AI), Machine Learning
- Soft Skills: Leadership, Communication, Problem Solving, Teamwork, Creativity, Event Management

Key Projects:
1. Shetkari Raja: Digital agricultural management platform with AI-driven grain grading via native camera capture (Capacitor), real-time procurement queue tracking, and DBT/PFMS direct benefit payment status verification.
2. AI Chat Assistant: Conversational chat assistant with automated query handling, multi-turn dialogue, and real-time responses.
3. Student Management System: Database-driven management software engineered to track student academic profiles, grades, course registrations, and reports.
4. Portfolio Website & 60FPS Canvas Engine: Interactive 240-frame fluid canvas visualizer with multi-track Cinematic Soundtrack Player (Inspiring Theme, Impact Moderato Beat, Ambient Synthesizer, and custom song loader) and AI copilot integration.
5. Sanjivani AI Gateway: High-availability AI gateway uniting multiple model providers with intelligent failover.

Leadership & Experience:
Department Social Media Handler & Event Coordinator — Department of Computer Science & Engineering, Sanjivani University. Managed promotional campaigns, posters, reels, technical events, and cultural festivals while developing strong communication, branding, teamwork, and event coordination skills.

Instructions:
- Keep responses concise, engaging, and professional (2-4 paragraphs max).
- Highlight Aditya's tangible academic achievements (Sanjivani University CGPA 8.0, Class X 84%), projects, and leadership.
- If asked for contact details or links, provide:
  • Phone: +91 9403206007
  • Email: adityatayde111@gmail.com
  • LinkedIn: https://www.linkedin.com/in/aditya-tayde-02a030383
  • GitHub: https://github.com/adityatayde111-lgtm
  • Portfolio: https://resume-atm-f33c.vercel.app
- Be polite, welcoming to recruiters and engineering managers, and confident in Aditya's capabilities.`;

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
