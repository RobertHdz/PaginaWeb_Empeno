document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ INSERTA TU CLAVE API REAL AQUÍ.
    const GEMINI_API_KEY = "AIzaSyC97VMVUBhYvz6Bgbb4mExMOGU_9vMfIS4"; 
    
    // --- Referencias a elementos del DOM ---
    const questions = document.querySelectorAll('.faq-question');
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');

    //  Lógica para el Acordeón (no relacionada con la API)
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const arrow = question.querySelector('.arrow-icon');
            
            questions.forEach(otherQuestion => {
                const otherItem = otherQuestion.closest('.faq-item');
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherArrow = otherQuestion.querySelector('.arrow-icon');
                    otherItem.classList.remove('active');
                    otherAnswer.style.maxHeight = null;
                    otherArrow.style.transform = 'rotate(0deg)';
                }
            });

            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
                arrow.style.transform = 'rotate(180deg)'; 
            } else {
                answer.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)'; 
            }
        });
    });

    // Instrucción del sistema
    const systemContext = "Eres el asistente virtual para la sección de Preguntas Frecuentes de 'AUTO EMPEÑO LUNA', un negocio de empeño. Responde las preguntas de los usuarios de manera concisa, amable y profesional, basándote en que el negocio acepta joyas, electrónicos, herramientas, electrodomésticos y ofrece empeño automotriz. No tienes información sobre ventas de artículos. Mantente dentro del rol del negocio de empeño.";

    async function handleIaSearch() {
        const rawQuestion = input.value.trim(); 
        
        if (rawQuestion.length === 0) {
            responseText.textContent = "Por favor, escribe tu pregunta antes de buscar.";
            responseBox.style.display = 'block';
            return;
        }

        if (GEMINI_API_KEY.includes("AIzaSyC97VMVUBhYvz6Bgbb4mExMOGU_9vMfIS4") || GEMINI_API_KEY === "") {
            responseText.textContent = "🚨 ERROR: ¡Falta configurar tu clave API de Gemini! Por favor, pégala en el archivo preguntas.js.";
            responseBox.style.display = 'block';
            return;
        }
        
        // MÉTODO MÁS COMPATIBLE: Inyectar contexto en la pregunta del usuario.
        const fullQuestionWithContext = `${systemContext}\n\nPregunta del usuario: ${rawQuestion}`;

        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Buscando la respuesta...";
        button.disabled = true;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "contents": [
                        // Único mensaje con rol 'user'
                        {
                            "role": "user",
                            "parts": [{"text": fullQuestionWithContext}]
                        }
                    ],
                })
            });

            const data = await response.json();
            let answer = "Lo siento, no pude obtener una respuesta clara. Inténtalo de nuevo.";

            if (data.candidates && data.candidates.length > 0) {
                answer = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                answer = `Error de la API: ${data.error.message}.`;
                console.error("API Error:", data.error.message);
            }
            
            responseText.textContent = answer;

        } catch (error) {
            console.error('Error de red o conexión:', error);
            responseText.textContent = "Hubo un error de conexión. Verifica tu clave API y conexión.";
        } finally {
            button.disabled = false;
        }
    }

    button.addEventListener('click', handleIaSearch);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleIaSearch();
        }
    });
});