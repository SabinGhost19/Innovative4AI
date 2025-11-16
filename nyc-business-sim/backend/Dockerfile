FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# CSV file is already copied with the rest of the application code

# Make startup script executable
RUN chmod +x /app/startup.sh

# Expose port
EXPOSE 8000

# Run the startup script with bash
CMD ["/bin/bash", "/app/startup.sh"]
