FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY football_ai/ football_ai/
COPY app.py .

EXPOSE 7860

ENV APP_FILE=football_ai/streamlit_app.py

CMD streamlit run football_ai/streamlit_app.py --server.port=7860 --server.address=0.0.0.0
