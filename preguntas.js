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
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typing');
            }
        }, speed);
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
        responseText.innerHTML = "🤖 Luna está pensando...";
        button.disabled = true;

        try {
            // Llamada al nuevo backend de IA real (temporalmente directo al puerto 3001)
            const response = await fetch('http://148.244.118.25:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });

            if (!response.ok) throw new Error('Error en el servidor de IA');

            const data = await response.json();
            typeEffect(responseText, data.response, 15);

        } catch (error) {
            console.error("IA Error:", error);
            responseText.innerHTML = "Lo siento, tuve un problema de conexión. Por favor, intenta de nuevo o llama al **664 589 7356**.";
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