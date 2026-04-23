document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.faq-question');
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

    // =====================================================
    // IA EXPERTA LUNA - MOTOR REAL (GEMINI API)
    // =====================================================
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    /**
     * EFECTO TYPEWRITER (ESCRITURA)
     */
    function typeEffect(element, text, speed) {
        element.innerHTML = "";
        element.classList.add('typing');
        let i = 0;
        
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    // Si encontramos una etiqueta HTML, la agregamos completa de golpe
                    let tagEnd = text.indexOf('>', i);
                    if (tagEnd !== -1) {
                        element.innerHTML += text.substring(i, tagEnd + 1);
                        i = tagEnd + 1;
                    }
                } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                }
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
            }
        }
        type();
    }

    async function handleIaSearch(text = null) {
        const question = text || input.value.trim();
        
        if (question.length === 0) {
            responseText.textContent = "¡Hola! Por favor, escribe tu pregunta para que pueda ayudarte.";
            responseBox.style.display = 'block';
            return;
        }

        if (text) input.value = text;

        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Luna está pensando<span class='loading-dots'>...</span>";
        button.disabled = true;

        try {
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3001/api/chat' 
                : '/api/chat';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el servidor de IA');
            }

            console.log("Respuesta de Luna:", data.response); // Para ver qué envía exactamente

            // Lógica de formateo mejorada:
            let formattedResponse = data.response
                // 1. Convertir **texto** a negritas
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // 2. Convertir * texto (viñetas) a puntos con negrita en la primera palabra
                .replace(/^\*\s*(.*?):/gm, '• <strong>$1:</strong>')
                .replace(/\n\*\s*(.*?):/g, '<br>• <strong>$1:</strong>')
                // 3. Si sobran asteriscos sueltos, convertirlos en puntos
                .replace(/\*/g, '•');
            
            // Usar efecto de escritura con soporte para HTML
            typeEffect(responseText, formattedResponse, 10);

        } catch (error) {
            console.error("IA Error:", error);
            responseText.innerHTML = `⚠️ <strong>Error:</strong> ${error.message}<br><br>Por favor, intenta de nuevo o llama al **664 589 7356**.`;
        } finally {
            button.disabled = false;
        }
    }

    // Eventos
    button.addEventListener('click', () => handleIaSearch());
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleIaSearch(); });

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            handleIaSearch(tag.textContent);
        });
    });
});