# Archivo: app.py (Versión FINAL con Petición REST usando requests)
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests # Librería estándar usada para la comunicación API

# --- CONFIGURACIÓN ---
# Cargar variables de entorno del archivo .env
load_dotenv()

# Obtener la clave API de forma segura
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 

app = Flask(__name__)

# Instrucción del sistema para el rol de la IA
SYSTEM_CONTEXT = (
    """Eres el asistente virtual para la sección de Preguntas Frecuentes de 'AUTO EMPEÑO LUNA', 
    un negocio de empeño. Responde las preguntas de los usuarios de manera concisa, amable y profesional, 
    centrado en empeños automotrices, joyas, electrónicos, y otros artículos de valor. 
    Tu objetivo es resolver dudas de forma experta y tranquilizadora. NO MENCIONES VENTAS ni ubicación específica."""
)

# *** CONFIGURACIÓN CORS CRÍTICA ***
# Esto permite que tu dominio de GitHub Pages acceda a esta API.
CORS(app, resources={r"/api/*": {"origins": "https://r0berthdz.github.io"}}) 
# Para pruebas locales, también puedes añadir "http://127.0.0.1:5000" si lo necesitas, 
# pero la configuración de 'origins' debe ser tu dominio de producción.

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    # 1. Verificación de la Clave
    if not GEMINI_API_KEY:
        print("ERROR: Clave API no encontrada en el entorno.")
        return jsonify({"error": "La clave API del servidor no está configurada."}), 500
        
    try:
        data = request.get_json()
        pregunta_cliente = data.get('pregunta_cliente', '')

        if not pregunta_cliente:
            return jsonify({"error": "No se proporcionó la pregunta."}), 400
        
        # --- LLAMADA DIRECTA A LA API REST DE GEMINI ---
        
        # 2. Construir la URL de la API con la clave
        API_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        # 3. Construir el payload JSON (incluyendo el SYSTEM_CONTEXT)
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": SYSTEM_CONTEXT + "\n\nPregunta del cliente: " + pregunta_cliente}]
                }
            ],
            "config": {
                "temperature": 0.5 
            }
        }

        # 4. Enviar la petición REST usando 'requests'
        response = requests.post(API_ENDPOINT, json=payload)
        response.raise_for_status() # Lanza una excepción para errores 4xx/5xx (ej. clave API inválida)
        
        response_data = response.json()
        
        # 5. Extracción y validación de la respuesta de Gemini
        respuesta_ia = "Lo siento, la IA no devolvió una respuesta clara."
        if (response_data.get('candidates') and 
            response_data['candidates'][0].get('content') and 
            response_data['candidates'][0]['content'].get('parts')):
            
            respuesta_ia = response_data['candidates'][0]['content']['parts'][0]['text']

        # 6. Devolver la respuesta al frontend
        return jsonify({"respuesta_ia": respuesta_ia})

    except requests.exceptions.HTTPError as e:
        # Maneja errores de la API (ej. 400 por clave inválida o 429 por límites)
        error_msg = f"Error de la API de Gemini ({e.response.status_code}): {e.response.text}"
        print(error_msg)
        return jsonify({"error": "Error de la API. Verifica tu clave o límites de uso."}), 500
    
    except requests.exceptions.RequestException as e:
        # Maneja errores de red (timeout, DNS, etc.)
        print(f"Error de red o conexión: {e}")
        return jsonify({"error": "Error de red al intentar conectar con Gemini."}), 503
        
    except Exception as e:
        # Maneja cualquier otro error inesperado
        print(f"Error interno del servidor: {e}")
        return jsonify({"error": "Error interno del servidor al procesar la solicitud."}), 500

if __name__ == '__main__':
    # Ejecución local: El puerto 5000 debe estar disponible.
    app.run(debug=True, host='0.0.0.0', port=5000)