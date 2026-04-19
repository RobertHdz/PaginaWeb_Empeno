const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Eres Luna, la asistente virtual experta de "Auto Empeño Luna". 
Tu objetivo es ayudar a los clientes con información precisa y amable sobre nuestros servicios.

REGLAS CRÍTICAS:
1. Solo respondes preguntas relacionadas con el negocio de empeño y Auto Empeño Luna. 
2. Si te preguntan algo fuera de este tema, responde amablemente que solo atiendes dudas sobre el empeño.
3. Utiliza un tono profesional, confiable y cercano.
4. Idioma obligatorio: Español.

DATOS DEL NEGOCIO:
- Sucursal Reforma: Reforma #19 Col. Centro, San Francisco Telixtlahuaca, Oaxaca.
- Sucursal Hidalgo: Calle Hidalgo #44, San Francisco Telixtlahuaca, Oaxaca.
- Horario: Lunes a Domingo, de 9:00 AM a 8:30 PM.
- Aceptamos: Joyería (oro, plata, diamantes), Electrónicos (celulares, laptops, consolas, pantallas recientes), Vehículos (autos, motos, camionetas - con o sin resguardo/GPS), Herramientas eléctricas y relojes de lujo.
- Requisitos: Identificación oficial vigente (INE) y el artículo a empeñar.
- Servicios: Empeño, Refrendo (renovación), Desempeño (liquidación), Valuación gratuita en 15-20 min.
- Seguridad: Prendas en bóvedas de alta seguridad con póliza de seguro.

Responde siempre de forma concisa y útil.
`;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Entendido. Soy Luna, la asistente oficial de Auto Empeño Luna. ¿En qué puedo ayudarte hoy?" }] },
            ]
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Error al procesar la pregunta con la IA" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`IA Server running on port ${PORT}`);
});
