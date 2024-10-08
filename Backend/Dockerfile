FROM python:3.12.7-alpine

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock .

RUN poetry config virtualenvs.create false 

RUN poetry install

COPY . .

EXPOSE 5000

CMD ["hypercorn", "main:asgi_app", "--bind", "0.0.0.0:5000", "--workers", "1"]