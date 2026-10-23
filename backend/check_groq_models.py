from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
models = client.models.list()
print("All available Groq models:")
for m in models.data:
    print("-", m.id)
