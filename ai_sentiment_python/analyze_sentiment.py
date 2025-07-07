# smart-news-portfolio/ai_sentiment_python/analyze_sentiment.py

import sys
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize the VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

def get_sentiment_label(compound_score):
    """
    Converts VADER's compound score to a simple sentiment label.
    You can adjust these thresholds as needed for your specific domain (financial news).
    """
    if compound_score >= 0.05:
        return "Positive"
    elif compound_score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

def analyze_text_sentiment(text):
    """
    Analyzes the sentiment of a given text using VADER and returns
    a structured dictionary including sentiment label, scores, and a simple reasoning.
    """
    if not text:
        return {
            "sentiment": "Neutral",
            "reasoning": "No text provided for analysis.",
            "scores": {"neg": 0.0, "neu": 1.0, "pos": 0.0, "compound": 0.0}
        }

    vs = analyzer.polarity_scores(text)
    sentiment_label = get_sentiment_label(vs['compound'])

    reasoning = f"Based on VADER analysis: Negative ({vs['neg']:.2f}), Neutral ({vs['neu']:.2f}), Positive ({vs['pos']:.2f}). Overall Compound Score: {vs['compound']:.2f}."
    if sentiment_label == "Positive":
        reasoning += " The text generally conveys a positive tone."
    elif sentiment_label == "Negative":
        reasoning += " The text generally conveys a negative tone."
    else:
        reasoning += " The text appears to be neutral or mixed in sentiment."

    return {
        "sentiment": sentiment_label,
        "reasoning": reasoning,
        "scores": vs # Include all scores for detailed info
    }

if __name__ == "__main__":
    # Expect the text to analyze as the first command-line argument
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = analyze_text_sentiment(input_text)
        # Print the result as a JSON string to stdout
        print(json.dumps(result))
    else:
        # If no argument is provided, return a neutral sentiment for empty text
        print(json.dumps(analyze_text_sentiment("")))