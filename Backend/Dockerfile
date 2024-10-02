FROM python:3.12.6-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock .

RUN poetry config virtualenvs.create false 

RUN poetry install

COPY . .

EXPOSE 5000

CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:5000", "--workers", "1"]