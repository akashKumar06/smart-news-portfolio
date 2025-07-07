# smart-news-portfolio/ai_sentiment_python/api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# IMPORTANT: Add the current directory to the Python path
# This allows api.py to import analyze_sentiment.py as a module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now import your sentiment analysis function
# The function is named 'analyze_text_sentiment' in your provided file
from analyze_sentiment import analyze_text_sentiment

app = Flask(__name__)
CORS(app) # Enable CORS for all origins for now. Consider restricting in production.

@app.route('/analyze', methods=['POST'])
def analyze_text_endpoint():
    """
    API endpoint to analyze sentiment of a given text.
    Expects a JSON payload: {"text": "Your text here"}
    """
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"error": "No text provided for analysis"}), 400

    try:
        # Call your existing sentiment analysis function
        result = analyze_text_sentiment(text)
        return jsonify(result)
    except Exception as e:
        print(f"Error during sentiment analysis: {e}", file=sys.stderr) # Log to stderr
        return jsonify({"error": "Sentiment analysis failed", "details": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint for Render.
    """
    return jsonify({"status": "ok", "service": "vader-sentiment-api"})

if __name__ == '__main__':
    # Render provides the PORT environment variable
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)