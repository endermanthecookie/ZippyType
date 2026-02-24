
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe with the provided test key
const stripe = new Stripe('sk_test_51T2vpI0AlKSl27CKhQHW9reGxQz9s9Yt4elIt7jOGGGjAELY0BaGMZ8GPpzcG7sRuSVGjM4ALMhd0lBMiOnXTGL1002bRLLS1Z', {
  apiVersion: '2025-01-27.acacia' as any,
});

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

  // Middleware to parse JSON bodies
  app.use(express.json());

  // In-memory member count for demo purposes
  let memberCount = 1242;

  app.get('/api/member-count', (req, res) => {
    res.json({ count: memberCount });
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
  app.post('/api/create-subscription-intent', async (req, res) => {
    try {
      // Create a Customer
      const customer = await stripe.customers.create();

      // Create a Subscription
      // Since we don't have a Price ID, we'll create a Price on the fly for a "Pro Plan"
      // In a real app, you'd create this once in the dashboard and use the ID
      const price = await stripe.prices.create({
        unit_amount: 500, // $5.00
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: {
          name: 'ZippyType Pro Subscription',
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent as unknown as Stripe.PaymentIntent;

      res.send({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(400).send({ error: { message: error.message } });
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
