from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained("monologg/bert-base-cased-goemotions-original")
model = AutoModelForSequenceClassification.from_pretrained("monologg/bert-base-cased-goemotions-original")
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True)

@app.route('/sentiment_analysis', methods=['POST'])
def analyze_emotion():
    data = request.get_json()
    synopsis = data['synopsis']
    results = classifier(synopsis)
    emotion_scores = {result['label']: result['score'] for result in results[0]}
    primary_emotion = max(emotion_scores, key=emotion_scores.get)
    return jsonify({'emotion': primary_emotion, 'scores': emotion_scores})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)