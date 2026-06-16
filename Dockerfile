FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY football_ai/ football_ai/

EXPOSE 7860

CMD streamlit run football_ai/streamlit_app.py --server.port=7860 --server.address=0.0.0.0
