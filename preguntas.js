document.addEventListener('DOMContentLoaded', () => {
    
    // --- Referencias a elementos del DOM ---
    const questions = document.querySelectorAll('.faq-question');
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');

    // ⚠️ CRÍTICO: Define la URL del Backend (Python/Flask)
    // 
    // Si estás probando localmente, usa: 'http://127.0.0.1:5000/api/chatbot'
    // Cuando lo subas a un hosting (Render, Railway), usa la URL pública: 
    // const API_URL = 'https://nombredetuservidor.com/api/chatbot'; 
    const API_URL = 'http://127.0.0.1:5000/api/chatbot'; 
    

    // =====================================================
    // LÓGICA DEL ACORDEÓN DE FAQs
    // =====================================================

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const arrow = question.querySelector('.arrow-icon');
            
            // Cierra otros ítems ANTES de abrir el nuevo
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

            // Toggle la clase 'active' en el ítem actual
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

    // =====================================================
    // LÓGICA DEL BUSCADOR DE IA (Conexión al Backend Seguro)
    // =====================================================

    async function handleIaSearch() {
        const rawQuestion = input.value.trim(); 
        
        if (rawQuestion.length === 0) {
            responseText.textContent = "Por favor, escribe tu pregunta antes de buscar.";
            responseBox.style.display = 'block';
            return;
        }

        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Contactando al asistente seguro...";
        button.disabled = true;

        try {
            // Envío de la pregunta al servidor Python/Flask
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    pregunta_cliente: rawQuestion 
                })
            });

            const data = await response.json();
            let answer;

            if (!response.ok) {
                // El servidor devolvió un error (400, 500)
                answer = `Error del servidor: ${data.error || 'Algo salió mal en el backend.'}. Verifica que el servidor esté activo.`;
            } else {
                // Respuesta exitosa del backend con la respuesta de Gemini
                answer = data.respuesta_ia || "La IA no pudo generar una respuesta clara.";
            }
            
            responseText.textContent = answer;

        } catch (error) {
            console.error('Error de red o CORS:', error);
            responseText.textContent = "❌ Error de conexión. Asegúrate de que tu servidor Python esté corriendo y la API_URL sea correcta.";
        } finally {
            button.disabled = false;
        }
    }

    // Eventos para el botón y la tecla Enter
    button.addEventListener('click', handleIaSearch);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleIaSearch();
        }
    });
});