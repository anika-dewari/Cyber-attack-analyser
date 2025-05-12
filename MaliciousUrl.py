import pandas as pd
from sklearn.naive_bayes import GaussianNB

# Sample training data
data = {
    'url': [
        'https://www.google.com',
        'https://github.com',
        'https://stackoverflow.com',
        'https://docs.python.org',
        'https://example.com',
        'http://update-account.fakebank.com/login',
        'http://malicious-site.tk/phish',
        'http://secure-login.fakebank.com',
        'http://192.168.0.1/login',
        'http://login.yourbank.com.verify-password.tk',
    ],
    'label': [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
}

df = pd.DataFrame(data)

# Feature extractor
def extract_features(url):
    return {
        'length': len(url),
        'num_dots': url.count('.'),
        'has_ip': url.startswith('http://') and url[7].isdigit(),
        'has_at': '@' in url,
        'has_suspicious_word': any(w in url.lower() for w in ['login', 'secure', 'update', 'verify'])
    }

features = df['url'].apply(extract_features).apply(pd.Series)
X = features
y = df['label']

# Train model
model = GaussianNB()
model.fit(X, y)

# Take user input
user_url = input("🔎 Enter URL to classify: ")
user_features = pd.DataFrame([extract_features(user_url)])

prediction = model.predict(user_features)[0]

print(f"\nURL: {user_url}")
print("⚠️ Detected as MALICIOUS" if prediction == 1 else "✅ Detected as SAFE")
