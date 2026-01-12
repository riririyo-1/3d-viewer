
FROM python:3.12-slim

# Install Node.js for obj2gltf
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g obj2gltf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create temp directory
RUN mkdir -p temp

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
