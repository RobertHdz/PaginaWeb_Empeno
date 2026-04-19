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
    // IA EXPERTA LUNA - LÓGICA POTENCIADA
    // =====================================================
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    /**
     * BASE DE CONOCIMIENTOS (ENTRENAMIENTO LOCAL)
     */
    const knowledgeBase = {
        "artículos_a_empeñar": {
            keywords: ['cosas puedo', 'que puedo', 'reciben', 'lista', 'articulos', 'aceptan', 'empeñar', 'empenar', 'oro', 'plata', 'joyas', 'celular', 'laptop'],
            response: "¡Claro! En **Auto Empeño Luna** aceptamos: **Joyería** (oro de cualquier kilataje, plata, diamantes), **Electrónicos** (celulares, laptops, consolas, pantallas de menos de 3 años), **Herramientas eléctricas** y **Vehículos** (autos, motos, camionetas). Si tienes algo de valor que no esté en la lista, ¡tráelo para una valuación gratuita!"
        },
        "sucursal_reforma": {
            keywords: ['reforma', 'centro', 'donde estan', 'ubicacion', 'telixtlahuaca', 'direccion'],
            response: "Nuestra sucursal principal está en **Reforma #19, Col. Centro, San Francisco Telixtlahuaca, Oaxaca**. ¡Visítanos para la mejor atención!"
        },
        "sucursal_hidalgo": {
            keywords: ['hidalgo', 'nueva sucursal', 'segunda sucursal', 'calle hidalgo'],
            response: "¡Sí! Contamos con nuestra nueva sucursal en **Calle Hidalgo #44, San Francisco Telixtlahuaca, Oaxaca**. Estamos más cerca de ti para servirte mejor."
        },
        "horarios": {
            keywords: ['horario', 'abren', 'cierran', 'domingo', 'sabado', 'hora'],
            response: "Te atendemos con gusto de **Lunes a Domingo, de 9:00 a.m. a 8:30 p.m.** ¡Estamos disponibles todos los días para apoyarte con tus necesidades financieras!"
        },
        "requisitos": {
            keywords: ['requisitos', 'necesito', 'papeles', 'documentos', 'identificacion', 'ine'],
            response: "Para realizar un empeño, solo necesitas dos cosas: **Tu artículo de valor** y una **identificación oficial vigente** (INE, pasaporte o licencia). ¡El trámite es rápido, seguro y discreto!"
        },
        "refrendo": {
            keywords: ['refrendo', 'renovar', 'plazo', 'extender', 'tiempo', 'pagar solo intereses'],
            response: "Si no puedes desempeñar hoy, no te preocupes. Puedes solicitar un **refrendo** pagando solo los intereses y cargos acumulados. Esto extenderá el plazo por otros 30 días automáticamente."
        },
        "autoempeño": {
            keywords: ['auto', 'coche', 'vehiculo', 'camioneta', 'moto', 'factura', 'sin dejarlo'],
            response: "Empeñamos autos, motos y camionetas. Necesitaremos la factura original, tarjeta de circulación e identificación. Tenemos opciones donde **puedes seguir usando tu vehículo** mediante la instalación de un GPS."
        },
        "seguridad": {
            keywords: ['seguridad', 'robo', 'seguro', 'boveda', 'confianza', 'cuidado'],
            response: "Tu confianza es nuestro motor. Todas las prendas se guardan en **bóvedas de alta seguridad** con monitoreo 24/7 y cuentan con una **póliza de seguro** contra cualquier eventualidad."
        },
        "contacto": {
            keywords: ['telefono', 'whatsapp', 'facebook', 'llamar', 'mensaje'],
            response: "Puedes llamarnos al **951 253 4054** o al **664 589 7356**. También estamos disponibles en WhatsApp y en Facebook como **/AutoEmpeñosLuna**."
        }
    };

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

    function getIaResponse(question) {
        const lowerQuestion = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        let bestMatchTopic = null;
        let maxScore = 0;

        for (const topicKey in knowledgeBase) {
            const topic = knowledgeBase[topicKey];
            let currentScore = 0;
            topic.keywords.forEach(keyword => {
                if (lowerQuestion.includes(keyword)) currentScore++;
            });

            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestMatchTopic = topicKey;
            }
        }
        
        if (maxScore > 0) {
            return knowledgeBase[bestMatchTopic].response;
        }

        return "Esa es una buena pregunta. Para darte la información más precisa sobre ese tema específico, te sugiero contactarnos directamente al **664 589 7356**. Mi entrenamiento está enfocado en sucursales, empeños y requisitos generales de Auto Empeño Luna.";
    }

    function handleIaSearch(text = null) {
        const question = text || input.value.trim();
        
        if (question.length === 0) {
            responseText.textContent = "¡Hola! Por favor, escribe tu pregunta para que pueda ayudarte.";
            responseBox.style.display = 'block';
            return;
        }

        if (text) input.value = text;

        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Luna está procesando tu pregunta...";
        button.disabled = true;

        setTimeout(() => {
            const answer = getIaResponse(question);
            typeEffect(responseText, answer, 20);
            button.disabled = false;
        }, 800);
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