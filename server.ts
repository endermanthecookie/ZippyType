
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
// supabaseAdmin is required for administrative tasks that the anon key cannot perform,
// such as deleting users from auth.users or bypassing RLS for server-side database operations.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe with the provided test key
const stripe = new Stripe('sk_test_51T2vpI0AlKSl27CKhQHW9reGxQz9s9Yt4elIt7jOGGGjAELY0BaGMZ8GPpzcG7sRuSVGjM4ALMhd0lBMiOnXTGL1002bRLLS1Z', {
  apiVersion: '2025-01-27.acacia' as any,
});

let proPriceId: string | null = null;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Stripe Webhook (Must be before express.json)
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const discordUserId = session.metadata?.discord_id;
      const internalUserId = session.metadata?.user_id;

      if (internalUserId) {
        await supabaseAdmin.from('profiles').update({ is_pro: true }).eq('id', internalUserId);
      }

      if (discordUserId) {
        const GUILD_ID = process.env.DISCORD_GUILD_ID;
        const ROLE_ID = process.env.DISCORD_PRO_ROLE_ID;
        if (GUILD_ID && ROLE_ID) {
          await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}/roles/${ROLE_ID}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });
        }
      }
    }
    res.json({received: true});
  });

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Serve legacy.html
  app.get(['/legacy', '/legacy.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'legacy.html'));
  });

  // Discord OAuth Routes
  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = `${req.headers.origin || process.env.APP_URL || 'http://localhost:3000'}/api/auth/discord/callback`;
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify',
      state: req.query.userId as string
    });
    res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
  });

  app.get('/api/auth/discord/callback', async (req, res) => {
    const { code, state: userId } = req.query;
    const redirectUri = `${req.headers.origin || process.env.APP_URL || 'http://localhost:3000'}/api/auth/discord/callback`;
    
    try {
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID || '',
          client_secret: process.env.DISCORD_CLIENT_SECRET || '',
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        })
      });
      const tokenData = await tokenResponse.json();
      
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userResponse.json();
      
      if (userId && userData.id) {
        await supabaseAdmin.from('profiles').update({ discord_id: userData.id }).eq('id', userId);
      }

      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'DISCORD_LINK_SUCCESS', discordId: '${userData.id}' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script></body></html>
      `);
    } catch (e) {
      res.send('Error linking Discord');
    }
  });

  app.get('/api/member-count', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('zippyprocount')
        .select('count')
        .eq('id', 1)
        .single();
      
      if (error) throw error;
      res.json({ count: data.count });
    } catch (error) {
      console.error('Error fetching member count:', error);
      res.json({ count: 1242 }); // Fallback
    }
  });

  app.post('/api/delete-account', async (req, res) => {
    const { userId, email, password } = req.body;
    
    try {
      // 1. Verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(401).json({ error: "Invalid password. Authentication failed." });
      }

      // 2. Delete user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Logo Generation Endpoint
  app.get('/api/generate-logo', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = "A high-resolution (500x500) square logo for a typing app called 'ZippyType'. The logo features a sharp, fast-looking 'Z' shape in a vibrant indigo and pink gradient. Below the 'Z' icon, the text 'ZippyType' is written in a modern, bold, clean sans-serif font. The background is completely transparent (no white or black background). The style is minimalist, professional, and high-tech, matching a high-performance typing trainer. The 'Z' icon has a subtle glow effect.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'attachment; filename="Logo.png"');
          return res.send(buffer);
        }
      }
      res.status(500).json({ error: "No image data found" });
    } catch (error: any) {
      console.error('Logo generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Icon Generation Endpoint (Favicon)
  app.get('/api/icon.png', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not found" });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = "A minimalist, high-resolution square icon for a typing app. The icon is a sharp, fast-looking 'Z' shape in a vibrant indigo and pink gradient. The background is completely transparent. No text. High-tech, modern style.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          res.setHeader('Content-Type', 'image/png');
          return res.send(buffer);
        }
      }
      res.status(500).json({ error: "No image data found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Subscription Endpoint
  app.post('/api/create-checkout-session', async (req, res) => {
    const { userId, discordId } = req.body;
    try {
      if (!proPriceId) {
        const price = await stripe.prices.create({
          unit_amount: 500, // $5.00
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: 'ZippyType Pro Subscription',
          },
        });
        proPriceId = price.id;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: proPriceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.headers.origin || process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${req.headers.origin || process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
        metadata: {
          user_id: userId || '',
          discord_id: discordId || ''
        }
      });

      res.send({ url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(400).send({ error: { message: error.message } });
    }
  });

  // Stripe Gift Card Endpoint
  app.post('/api/create-gift-card-intent', async (req, res) => {
    const { userId, months } = req.body;
    const numMonths = parseInt(months || '1');
    
    // Pricing: $5.00 base, 10% discount per extra month, capped at 50%
    const discount = Math.min(0.5, (numMonths - 1) * 0.1);
    const amount = Math.round(numMonths * 500 * (1 - discount));

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { type: 'gift_card', months: numMonths.toString(), userId: userId || '' },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(400).send({ error: { message: error.message } });
    }
  });

  app.post('/api/confirm-gift-card', async (req, res) => {
    const { paymentIntentId } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.type === 'gift_card') {
        const months = parseInt(paymentIntent.metadata.months || '1');
        const code = Math.random().toString(36).substring(2, 14).toUpperCase().match(/.{1,4}/g)?.join('-') || 'ZIPPY-GIFT';
        
        // Insert into Supabase
        const { data, error } = await supabaseAdmin
          .from('gift_cards')
          .insert({
            code,
            months,
            created_by: paymentIntent.metadata.userId || null
          })
          .select()
          .single();

        if (error) throw error;
        res.json({ code, months });
      } else {
        res.status(400).json({ error: 'Payment not successful or invalid' });
      }
    } catch (error: any) {
      console.error('Confirm gift card error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pro Text Generation Endpoint
  app.post('/api/generate-pro-text', async (req, res) => {
    const { difficulty, topic, problemKeys, textLength, language, isGuest, mode } = req.body;

    try {
      let tokensToTry = [];

      // If it's a guest, prioritize GUEST_TOKEN if available
      if (isGuest && process.env.GUEST_TOKEN) {
        tokensToTry.push({ token_name: 'GUEST_TOKEN', value: process.env.GUEST_TOKEN });
      }

      // Get active tokens from Supabase
      const { data: dbTokens, error } = await supabase
        .from('github_tokens')
        .select('*')
        .eq('status', 'active')
        .order('id', { ascending: true });

      if (dbTokens) {
        for (const t of dbTokens) {
          const val = process.env[t.token_name] || process.env[t.token_name.toUpperCase()];
          if (val) {
            tokensToTry.push({ ...t, value: val });
          } else {
            // Mark as out if env var missing
            await supabase.from('github_tokens').update({ status: 'out' }).eq('id', t.id);
          }
        }
      }

      if (tokensToTry.length === 0) {
        return res.status(500).json({ error: 'No active GitHub tokens available' });
      }

      for (const token of tokensToTry) {
        try {
          const client = new OpenAI({ baseURL: "https://models.inference.ai.azure.com", apiKey: token.value });
          
          let prompt = "";
          
          if (mode === 'code') {
             const lang = ['javascript', 'python', 'typescript', 'java', 'c++'][Math.floor(Math.random() * 5)];
             prompt = `Generate a valid, clean, and idiomatic ${lang} code snippet. 
             It should be approximately ${textLength === 'short' ? '2-3' : textLength === 'medium' ? '4-6' : '8-12'} lines of code.
             Do not include comments. Do not include markdown code blocks. Just the raw code.
             Ensure indentation is consistent (2 or 4 spaces).`;
          } else {
            let lengthConstraint = "exactly 10 to 13 words total";
            if (textLength === 'short') lengthConstraint = "exactly 6 to 8 words total";
            else if (textLength === 'long') lengthConstraint = "exactly 20 to 25 words total";

            prompt = `Generate a single ${difficulty} level typing practice sentence. `;
            if (topic && topic !== "General") prompt += `The topic should be about: ${topic}. `;
            if (language) prompt += `The language MUST be: ${language}. `;
            if (problemKeys && problemKeys.length > 0) {
              prompt += `The text MUST frequently use these specific characters: ${problemKeys.join(', ')}. `;
            }
            prompt += `CRITICAL: The text MUST be ${lengthConstraint}. Count the words carefully. Return ONLY the text itself.`;
          }

          const response = await client.chat.completions.create({
            messages: [
              { role: "system", content: "You are a helpful assistant that generates typing practice texts. You follow length constraints perfectly." },
              { role: "user", content: prompt }
            ],
            model: "gpt-4o",
            temperature: 0.8,
            max_tokens: 150,
          });

          const text = response.choices[0].message.content;
          if (!text) throw new Error("No text generated");

          return res.json({ text });
        } catch (e) {
          console.error(`Token ${token.token_name} failed:`, e);
          // Mark as out and try next if it's a DB token
          if (token.id) {
            await supabase.from('github_tokens').update({ status: 'out' }).eq('id', token.id);
          }
        }
      }

      res.status(500).json({ error: 'All GitHub tokens failed or are exhausted' });
    } catch (error: any) {
      // Final fallback to Gemini on server if GitHub fails
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          let prompt = "";
          if (mode === 'code') {
             const lang = ['javascript', 'python', 'typescript', 'java', 'c++'][Math.floor(Math.random() * 5)];
             prompt = `Generate a valid, clean, and idiomatic ${lang} code snippet. Length: ${textLength === 'short' ? '2-3 lines' : '4-6 lines'}. No markdown.`;
          } else {
             prompt = `Generate a single ${difficulty} level typing practice sentence about "${topic || 'General'}". Language: ${language || 'en'}. Length: ${textLength === 'short' ? '6-8 words' : textLength === 'long' ? '20-25 words' : '10-13 words'}. Return ONLY the text.`;
          }
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          });
          if (response.text) {
            return res.json({ text: response.text.trim() });
          }
        } catch (geminiError) {
          console.error('Server Gemini fallback failed:', geminiError);
        }
      }
      console.error('Pro text generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Socket.io logic
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room", (roomData) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      socket.join(roomId);
      rooms.set(roomId, { 
        id: roomId, 
        players: [roomData.player], 
        text: '',
        hostId: roomData.player.id 
      });
      socket.emit("room-created", roomId);
      io.to(roomId).emit("room-update", rooms.get(roomId));
      console.log(`Room created: ${roomId} by ${roomData.player.id}`);
    });

    socket.on("join-room", (data) => {
      const { roomId, player } = data;
      if (rooms.has(roomId)) {
        socket.join(roomId);
        const room = rooms.get(roomId);
        // Prevent duplicate players
        const exists = room.players.find((p: any) => p.id === player.id);
        if (!exists) {
          room.players.push(player);
        } else {
          // Update player info if they re-joined
          const index = room.players.findIndex((p: any) => p.id === player.id);
          room.players[index] = player;
        }
        // Send room-joined event to the joiner so they can switch UI
        socket.emit("room-joined", roomId);
        io.to(roomId).emit("room-update", room);
        console.log(`User ${socket.id} joined room ${roomId}`);
      } else {
        socket.emit("error", "Room not found");
      }
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.players = room.players.filter((p: any) => !p.id.includes(socket.id));
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          // If host leaves, assign new host
          if (room.hostId.includes(socket.id)) {
             room.hostId = room.players[0].id;
          }
          io.to(roomId).emit("room-update", room);
        }
      }
    });

    socket.on("start-game", (data) => {
      const { roomId, text } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.text = text;
        io.to(roomId).emit("game-starting", { text });
      }
    });

    socket.on("update-progress", (data) => {
      // data: { roomId, playerId, index, errors }
      socket.to(data.roomId).emit("player-progress", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Clean up rooms if needed (optional for now)
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
