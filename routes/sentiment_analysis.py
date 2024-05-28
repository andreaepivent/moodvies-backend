from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained("monologg/bert-base-cased-goemotions-original")
model = AutoModelForSequenceClassification.from_pretrained("monologg/bert-base-cased-goemotions-original")
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=None)

@app.route('/sentiment_analysis', methods=['POST'])
def sentiment_analysis():
    data = request.get_json()
    synopsis = data['synopsis']
    results = classifier(synopsis)
    emotion_scores = sorted(results[0], key=lambda x: x['score'], reverse=True)
    
    # Filter out 'neutral' emotion
    filtered_emotions = [emotion for emotion in emotion_scores if emotion['label'] != 'neutral']
    
    # Get the top 3 emotions
    primary_emotions = [emotion['label'] for emotion in filtered_emotions[:3]]
    
    return jsonify({'emotion': primary_emotions, 'scores': emotion_scores})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)