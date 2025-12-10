document.addEventListener('DOMContentLoaded', () => {
    // [CÓDIGO DE ACORDEÓN OMITIDO POR BREVEDAD - Sin cambios]
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
    // CÓDIGO PARA EL BUSCADOR DE IA (SOLUCIÓN DEFINITIVA POR SCORING)
    // =====================================================
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');

    /**
     * Define los temas y sus palabras clave (keywords) CRÍTICAS. 
     * Se eliminan palabras genéricas como "que", "es", "un" para evitar conflictos.
     */
    const knowledgeBase = {
        
        // --- 1. LISTA DE ARTÍCULOS (Máxima Especificidad) ---
        // Puntuación alta por las palabras de intención ("cosas", "puedo")
        "artículos_a_empeñar": {
            keywords: ['cosas puedo', 'que puedo', 'reciben', 'lista', 'articulos', 'aceptan', 'empeñar', 'empenar'],
            response: "Puedes empeñar una amplia gama de artículos de valor. Las categorías principales son: **Joyería** (oro, plata, diamantes), **Electrónicos** (celulares, laptops, consolas de modelos recientes), **Automóviles** (autos, camionetas y motos) y **Relojes de Alta Gama** (lujo). Cada artículo requiere su propia valuación y documentación."
        },

        // --- 2. CONCEPTO FUNDAMENTAL ---
        // Puntuación media. Debería ganar solo si la pregunta no es sobre la lista.
        "empeño": {
            keywords: ['empeño', 'empeno', 'prestamo prendario', 'funciona', 'definicion', 'concepto'],
            response: "Un **Empeño** es un préstamo prendario: nos dejas un artículo de valor (la 'prenda') como garantía (joyas, electrónicos, autos) y a cambio te damos una cantidad de dinero. Puedes recuperar tu artículo al liquidar el préstamo (capital más intereses) dentro del plazo acordado. Es una solución financiera rápida sin revisión de Buró de Crédito."
        },
        
        // --- 3. REFRENDO (Soluciona Falla de Imagen 2) ---
        // Esta palabra clave específica DEBE ganar la puntuación cuando está presente.
        "refrendo": {
            keywords: ['refrendo', 'renovar', 'prorroga', 'extender', 'plazo', 'refrendar'],
            response: "El **Refrendo** es la renovación de tu contrato. Pagas solo los intereses y cargos acumulados, y el plazo se extiende por otro periodo de 30 días, permitiéndote conservar tu artículo sin liquidarlo."
        },
        
        // --- 4. Resto de Conceptos Financieros y Legales ---
        "avaluo": {
            keywords: ['avaluacion', 'avaluo', 'valora', 'valuacion', 'determinar', 'valor'],
            response: "La **Valuación o Avalúo** es la determinación del valor comercial actual de tu artículo en el mercado. Es gratuita, se realiza con base en el precio de reventa y el estado físico, y toma de 15 a 20 minutos."
        },
        "desempeño": {
            keywords: ['desempeño', 'desempeno', 'liquidar', 'recuperar', 'pago total', 'retirar articulo'],
            response: "El **Desempeño** es la liquidación total de tu contrato. Significa pagar el capital original más los intereses y cargos acumulados hasta el día de tu pago para recuperar tu prenda."
        },
        "capital": {
            keywords: ['principal', 'capital', 'abono', 'monto original'],
            response: "El **Capital (o Principal)** es el monto de dinero original que te prestamos. Los **abonos a capital** son pagos directos que reducen este monto, disminuyendo los intereses que pagarás en el siguiente periodo."
        },
        "demasia": {
            keywords: ['demasia', 'excedente', 'saldo a favor', 'dinero sobrante'],
            response: "La **Demasía** es el dinero excedente de la venta de tu prenda, después de cubrir la deuda y los gastos de venta. Si se genera, tienes derecho a reclamarla y se te notificará en un plazo de 90 días después de la venta."
        },
        "comercializacion": {
            keywords: ['comercializacion', 'remate', 'no pago', 'venta de prenda', 'pasa si no pago'],
            response: "La **Comercialización** (venta) es el proceso de disponer de tu prenda si no fue liquidada ni refrendada en el plazo y periodo de gracia. Esto se hace para recuperar el monto prestado y generar una posible demasía (excedente) para ti."
        },
        "dias_gracia": {
            keywords: ['gracia', 'vencimiento', 'se me paso la fecha', 'dias extra', 'limite'],
            response: "Los **Días de Gracia** son un periodo adicional (generalmente 5 a 10 días, según el contrato) posteriores a la fecha de vencimiento, durante el cual aún puedes refrendar o desempeñar tu artículo, pagando un pequeño recargo o interés extra."
        },
        "prenda": {
            keywords: ['prenda', 'garantia', 'articulo dejado', 'custodia'],
            response: "La **Prenda** es el bien de valor que dejas como garantía física. Una vez que realizas el desempeño (liquidación total), la prenda te es devuelta en el mismo estado en que la dejaste."
        },
        "boleta": {
            keywords: ['boleta', 'contrato', 'terminos', 'ticket', 'perdi la boleta'],
            response: "La **Boleta de Empeño** es tu contrato legal. Es indispensable para cualquier trámite (refrendo o desempeño) y contiene todos los detalles de tu préstamo y del artículo."
        },
        "cat": {
            keywords: ['cat', 'costo anual total', 'tasa real', 'interes'],
            response: "El **Costo Anual Total (CAT)** es un indicador estandarizado que incluye la tasa de interés nominal más todos los costos y comisiones inherentes al préstamo (seguro, almacenaje, apertura), para que compares opciones de financiamiento."
        },

        // --- 5. Autoempeño y Vehículos ---
        "autoempeño": {
            keywords: ['auto', 'coche', 'vehiculo', 'camioneta', 'requisitos auto', 'dejar coche'],
            response: "Para el auto empeño, necesitamos la factura original, tarjeta de circulación, identificación, y que el vehículo esté libre de gravamen. La valuación incluye una revisión física y mecánica."
        },
        "uso_coche": {
            keywords: ['uso el coche', 'manejar mi auto', 'sin resguardo', 'gps', 'me lo quedo'],
            response: "Tenemos la opción de **'Auto Empeño sin Resguardo'** (Sigue Usándolo). El vehículo debe ser de modelo reciente, pasar una revisión más estricta, y se requiere instalar un GPS de monitoreo."
        },
        "moto": {
            keywords: ['moto', 'motocicleta', 'cuatrimoto'],
            response: "Aceptamos motocicletas recientes, en excelente estado. Requisitos: factura original, tarjeta de circulación e identificación. El modelo debe ser de agencia y no armado."
        },
        "factura_auto": {
            keywords: ['carta factura', 'financiamiento', 'liberacion', 'refacturado', 'aseguradora'],
            response: "Aceptamos vehículos con **Carta Factura** siempre que esté acompañada de la copia de la factura de origen y que el crédito esté liquidado al 100%. También aceptamos Refacturación de Aseguradora o Empresa, siempre que se acredite la legalidad."
        },
        
        // --- 6. Joyería y Electrónicos ---
        "joyeria": {
            keywords: ['joya', 'oro', 'plata', 'kilataje', 'diamante', 'espectrometro'],
            response: "Aceptamos oro (10K, 14K, 18K, 24K), plata y diamantes. La valuación se realiza con un **espectrómetro** (equipo de alta precisión) para determinar pureza."
        },
        "electronicos": {
            keywords: ['electronico', 'celular', 'tablet', 'laptop', 'macbook', 'ipad', 'imei', 'falla electronico', 'pantalla rota'],
            response: "Aceptamos electrónicos recientes (menos de 3 años). Requisitos: cargador original, funcionamiento óptimo, sin cuentas bloqueadas (iCloud, Google) y sin reporte de robo. No aceptamos electrónicos con fallas graves."
        },
        
        // --- 7. General ---
        "seguridad": {
            keywords: ['seguridad', 'cuidado', 'robo', 'boveda', 'poliza', 'dano a mi articulo'],
            response: "Tu prenda está 100% segura. Todas las prendas se almacenan en **bóvedas de alta seguridad**, monitoreadas 24/7 y cuentan con una **póliza de seguro** contra robo e incendio."
        },
        "documentos": {
            keywords: ['identificacion', 'ine', 'pasaporte', 'licencia', 'comprobante de domicilio', 'carta poder', 'tercero', 'quien puede hacer el tramite'],
            response: "Requerimos identificación oficial vigente del titular (INE, Pasaporte). Para trámites por un tercero, es indispensable una Carta Poder Simple."
        },
        "regulacion": {
            keywords: ['profeco', 'regulacion', 'normas', 'queja', 'derechos del cliente', 'aviso de privacidad'],
            response: "Estamos regulados y operamos bajo las normativas de la ley mexicana y las disposiciones de la **PROFECO**. Para quejas, llama a la línea de Servicio al Cliente **664 589 7356**."
        },
        "contacto_horario": {
            keywords: ['horario', 'sucursal', 'donde estan', 'ubicacion', 'telefono', 'whatsapp', 'contacto'],
            response: "Nuestro horario es de Lunes a Domingo de 9:00 a.m. a 8:30 p.m. Para ubicaciones exactas y contacto, llama directamente al **664 589 7356**."
        }
    };

    /**
     * Función principal para buscar la respuesta usando PUNTUACIÓN (SCORING)
     * @param {string} question - La pregunta del usuario.
     * @returns {string} - La respuesta de la IA o el mensaje de fallback.
     */
    function getIaResponse(question) {
        // Normaliza el input y lo divide en tokens (palabras)
        const lowerQuestion = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        let bestMatchTopic = null;
        let maxScore = 0;

        // Itera sobre toda la base de conocimiento para asignar puntuación
        for (const topicKey in knowledgeBase) {
            const topic = knowledgeBase[topicKey];
            let currentScore = 0;

            // Comprueba cuántas palabras clave del tema están presentes en la pregunta
            topic.keywords.forEach(keyword => {
                // Si la pregunta contiene la palabra clave, suma un punto
                if (lowerQuestion.includes(keyword)) {
                    currentScore++;
                }
            });

            // Si la puntuación actual es mayor que la máxima encontrada, actualiza
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestMatchTopic = topicKey;
            }
        }
        
        // Regla de Desempate/Umbral: Si la puntuación máxima es al menos 1, devuelve la respuesta.
        if (maxScore > 0) {
            return knowledgeBase[bestMatchTopic].response;
        }

        // --- Respuesta Genérica/Fallback Final ---
        return "Lo siento, esa es una pregunta muy específica. Nuestra IA está súper-entrenada, pero si no encontraste tu respuesta, significa que es una consulta que requiere la atención inmediata de un asesor. Por favor, llama a la línea de contacto **664 589 7356**. ¡Gracias por tu comprensión!";
    }

    function handleIaSearch() {
        const question = input.value.trim();
        
        if (question.length === 0) {
            responseText.textContent = "Por favor, escribe tu pregunta antes de buscar.";
            responseBox.style.display = 'block';
            return;
        }

        // Simular un tiempo de "pensamiento" de la IA y deshabilitar botón
        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Buscando la mejor respuesta para ti...";
        button.disabled = true;

        setTimeout(() => {
            const answer = getIaResponse(question);
            responseText.innerHTML = answer;
            button.disabled = false;
        }, 1500); // Espera de 1.5 segundos
    }

    // Eventos para el botón y la tecla Enter
    button.addEventListener('click', handleIaSearch);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleIaSearch();
        }
    });
});