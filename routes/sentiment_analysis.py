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
    primary_emotion = emotion_scores[0]['label']
    if primary_emotion == 'neutral' and len(emotion_scores) > 1:
        primary_emotion = emotion_scores[1]['label']
    return jsonify({'emotion': primary_emotion, 'scores': emotion_scores})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)