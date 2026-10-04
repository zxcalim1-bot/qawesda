# id: ext:numpy
kind: extlib
category: Внешние библиотеки
title: NumPy
summary: Многомерные массивы ndarray и быстрые векторные операции; основа научного Python.
install: pip install numpy
version: 2.4 (проверено при сборке справочника)
url: https://github.com/numpy/numpy
license: BSD-3-Clause
check: numpy.array, numpy.arange, numpy.zeros, numpy.linspace, numpy.dot, numpy.linalg.solve, numpy.random.default_rng
tags: numpy, массивы, ndarray, векторизация, матрицы, линейная алгебра, np
related: gh:numpy, ext:pandas, py:op:matmul
## На часах
NumPy не входит во встроенный Python приложения (только стандартная библиотека). Справочник ниже — для работы на компьютере; примеры проверены настоящей библиотекой при сборке.
## Основные возможности
- ndarray: массивы одного типа, форма (shape), тип (dtype).
- Векторные операции без циклов: a + b, a * 2, np.sqrt(a).
- Срезы, маски, broadcasting (растяжение размерностей).
- Линейная алгебра (np.linalg), случайные числа (np.random), статистика (mean, std).
## Пример
```python ext
import numpy as np
a = np.arange(6).reshape(2, 3)
print(a, a.shape, a.dtype.kind)
print(a * 10, a.sum(axis=0), a.mean())
b = np.array([1.0, 2.0, 3.0])
print(a @ b, np.sqrt(b).round(3), b[b > 1.5])
M = np.array([[2.0, 1.0], [1.0, 3.0]])
print(np.linalg.solve(M, np.array([3.0, 5.0])))
rng = np.random.default_rng(0)
print(rng.integers(0, 10, size=5).shape)
```
## Сложность и производительность
Операции над массивом выполняются в C — в десятки раз быстрее цикла Python. Создавайте массивы сразу нужного размера: np.append в цикле копирует весь массив.

# id: ext:pandas
kind: extlib
category: Внешние библиотеки
title: Pandas
summary: Таблицы DataFrame и ряды Series: чтение данных, фильтры, группировка, объединение.
install: pip install pandas
version: 3.0 (проверено при сборке справочника)
url: https://github.com/pandas-dev/pandas
license: BSD-3-Clause
check: pandas.DataFrame, pandas.Series, pandas.read_csv, pandas.merge, pandas.concat
tags: pandas, DataFrame, таблица, анализ данных, csv, groupby, pd
related: gh:pandas, ext:numpy, ext:matplotlib, lib:csv
## Основные возможности
- DataFrame — таблица с именованными столбцами, Series — один столбец.
- Чтение и запись: read_csv, read_excel, read_json, to_csv.
- Отбор строк по условию, сортировка, groupby + агрегирование, merge/concat.
## Пример
```python ext
import io
import pandas as pd
csv = io.StringIO("name,city,score\nAli,Tashkent,90\nOla,Moscow,75\nVali,Tashkent,80\n")
df = pd.read_csv(csv)
print(df.shape, list(df.columns))
print(df[df.score > 78][["name", "score"]].to_string(index=False))
print(df.groupby("city")["score"].mean().to_dict())
df["passed"] = df["score"] >= 80
print(df.sort_values("score", ascending=False)["name"].tolist(), int(df["passed"].sum()))
```
## Советы
Избегайте построчных циклов for по DataFrame — используйте векторные операции и groupby.

# id: ext:matplotlib
kind: extlib
category: Внешние библиотеки
title: Matplotlib
summary: Графики и диаграммы: линии, столбцы, точки, гистограммы; сохранение в PNG/SVG/PDF.
install: pip install matplotlib
version: 3.11 (проверено при сборке справочника)
url: https://github.com/matplotlib/matplotlib
license: PSF-совместимая лицензия Matplotlib
check: matplotlib.pyplot.plot, matplotlib.pyplot.subplots, matplotlib.pyplot.savefig, matplotlib.pyplot.bar, matplotlib.pyplot.hist
tags: matplotlib, график, диаграмма, визуализация, pyplot, plt
related: gh:matplotlib, ext:numpy, ext:pandas
## Основные возможности
- pyplot: plot, scatter, bar, hist, pie, imshow.
- Объектный интерфейс: fig, ax = plt.subplots(); ax.plot(...).
- Подписи, легенда, сетка, несколько графиков на одном рисунке.
## Пример
```python ext
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
xs = list(range(10))
fig, ax = plt.subplots(figsize=(4, 3))
ax.plot(xs, [x * x for x in xs], label="x²")
ax.bar(xs, xs, alpha=0.3, label="x")
ax.set_title("Пример")
ax.legend()
buf = io.BytesIO()
fig.savefig(buf, format="png")
print(buf.getvalue()[:4] == b"\x89PNG", len(ax.lines))
```
## Совет
На сервере и в скриптах без экрана используйте неинтерактивный бэкенд Agg и savefig.

# id: ext:requests
kind: extlib
category: Внешние библиотеки
title: Requests
summary: Простые HTTP-запросы: GET, POST, заголовки, параметры, JSON, сессии.
install: pip install requests
version: 2.34 (проверено при сборке справочника)
url: https://github.com/psf/requests
license: Apache-2.0
check: requests.get, requests.post, requests.Session, requests.Request, requests.Response.json
tags: requests, http, get, post, api, веб-запрос, json
related: gh:requests, lib:urllib.request, lib:json
## Основные возможности
- requests.get(url, params=..., headers=..., timeout=...) и post(..., json=...).
- Ответ: status_code, text, json(), headers; raise_for_status().
- Session — повторное использование соединений и cookies.
## Пример (подготовка запроса без сети)
```python ext
import requests
req = requests.Request("GET", "https://api.example.com/search", params={"q": "python", "page": 2}, headers={"Accept": "application/json"})
prepared = req.prepare()
print(prepared.method, prepared.url)
print(prepared.headers["Accept"])
```
## Типичный код (нужен интернет)
```python norun
import requests
r = requests.get("https://api.github.com/repos/psf/requests", timeout=10)
r.raise_for_status()
print(r.json()["stargazers_count"])
```
## Важно
Всегда задавайте timeout. Приложение на часах работает офлайн и не выполняет сетевые запросы.

# id: ext:bs4
kind: extlib
category: Внешние библиотеки
title: Beautiful Soup (bs4)
summary: Разбор HTML/XML: поиск тегов, атрибутов и текста, CSS-селекторы.
install: pip install beautifulsoup4
version: 4.15 (проверено при сборке справочника)
url: https://www.crummy.com/software/BeautifulSoup/
license: MIT
check: bs4.BeautifulSoup, bs4.BeautifulSoup.find_all, bs4.BeautifulSoup.select
tags: beautifulsoup, bs4, html, парсинг, теги, scraping
related: gh:beautifulsoup4, ext:requests, lib:html.parser
## Пример
```python ext
from bs4 import BeautifulSoup
html = "<ul><li class='p'>Python <b>3.11</b></li><li>Kotlin</li></ul><a href='/docs'>Docs</a>"
soup = BeautifulSoup(html, "html.parser")
print([li.get_text(" ", strip=True) for li in soup.find_all("li")])
print(soup.select_one("li.p b").text, soup.a["href"])
```
## Советы
"html.parser" встроен в Python; парсеры lxml и html5lib устанавливаются отдельно. Соблюдайте правила сайтов (robots.txt, условия использования).

# id: ext:flask
kind: extlib
category: Внешние библиотеки
title: Flask
summary: Микрофреймворк для веб-приложений и API: маршруты, запросы, ответы, шаблоны.
install: pip install flask
version: 3.1 (проверено при сборке справочника)
url: https://github.com/pallets/flask
license: BSD-3-Clause
check: flask.Flask, flask.jsonify, flask.request, flask.render_template_string
tags: flask, веб, сайт, api, маршрут, route, сервер
related: gh:flask, gh:jinja2, ext:fastapi, ext:django
## Пример (без запуска сервера — через тестовый клиент)
```python ext
from flask import Flask, jsonify, request
app = Flask(__name__)
@app.route("/hello/<name>")
def hello(name):
    return f"Привет, {name}!"
@app.post("/sum")
def total():
    data = request.get_json()
    return jsonify(result=sum(data["nums"]))
client = app.test_client()
print(client.get("/hello/Ali").get_data(as_text=True))
print(client.post("/sum", json={"nums": [1, 2, 3]}).get_json())
```
## Запуск сервера
На компьютере: flask --app app run или app.run(debug=True) в файле app.py.

# id: ext:django
kind: extlib
category: Внешние библиотеки
title: Django
summary: Полнофункциональный веб-фреймворк: ORM, админка, шаблоны, формы, авторизация, миграции.
install: pip install django
version: 5.2 (проверено при сборке справочника)
url: https://github.com/django/django
license: BSD-3-Clause
check: django.shortcuts.render, django.http.HttpResponse, django.urls.path, django.template.Template
tags: django, веб-фреймворк, orm, админка, модели, views, urls
related: gh:django, gh:djangorestframework, ext:flask
## Структура проекта
django-admin startproject site; python manage.py startapp blog. Модели (models.py) описывают таблицы, представления (views.py) обрабатывают запросы, urls.py связывает адреса с представлениями, шаблоны формируют HTML.
## Пример: шаблонизатор Django без проекта
```python ext
import django
from django.conf import settings
settings.configure(TEMPLATES=[{"BACKEND": "django.template.backends.django.DjangoTemplates"}])
django.setup()
from django.template import Template, Context
t = Template("{% for p in people %}{{ p.name|upper }}{% if not forloop.last %}, {% endif %}{% endfor %}")
print(t.render(Context({"people": [{"name": "Ann"}, {"name": "Bob"}]})))
```
## Типичная модель
```python norun
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
```

# id: ext:fastapi
kind: extlib
category: Внешние библиотеки
title: FastAPI
summary: Быстрые API на аннотациях типов: валидация через Pydantic, автодокументация OpenAPI, async.
install: pip install fastapi uvicorn
version: 0.142 (проверено при сборке справочника)
url: https://github.com/fastapi/fastapi
license: MIT
check: fastapi.FastAPI, fastapi.HTTPException, fastapi.Query
tags: fastapi, api, rest, pydantic, async, openapi, uvicorn
related: gh:fastapi, gh:pydantic, gh:uvicorn, ext:flask
## Пример (тестовый клиент без сервера)
```python ext
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
app = FastAPI()
class Item(BaseModel):
    name: str
    price: float
items = {}
@app.post("/items/{item_id}")
def create(item_id: int, item: Item):
    items[item_id] = item
    return {"id": item_id, "name": item.name}
@app.get("/items/{item_id}")
def read(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="нет такого")
    return items[item_id]
c = TestClient(app)
print(c.post("/items/1", json={"name": "чай", "price": 2.5}).json())
print(c.get("/items/1").json(), c.get("/items/9").status_code, c.post("/items/2", json={"name": "x"}).status_code)
```
## Запуск
uvicorn main:app --reload; документация API доступна по адресу /docs.

# id: ext:pygame
kind: extlib
category: Внешние библиотеки
title: Pygame
summary: 2D-игры: окно, игровой цикл, события, рисование, спрайты, звук.
install: pip install pygame
version: 2.6 (проверено при сборке справочника)
url: https://github.com/pygame/pygame
license: LGPL
check: pygame.init, pygame.display.set_mode, pygame.Surface, pygame.Rect, pygame.draw.circle, pygame.event.get, pygame.time.Clock
tags: pygame, игры, игровой цикл, sprite, графика, события
related: gh:pygame, gh:arcade
## Игровой цикл
```python norun
import pygame
pygame.init()
screen = pygame.display.set_mode((400, 300))
clock = pygame.time.Clock()
x = 0
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    x = (x + 3) % 400
    screen.fill((20, 20, 40))
    pygame.draw.circle(screen, (255, 200, 0), (x, 150), 20)
    pygame.display.flip()
    clock.tick(60)
pygame.quit()
```
## Работа с поверхностями без окна
```python ext
import os
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"
import pygame
surf = pygame.Surface((50, 40))
surf.fill((0, 0, 0))
pygame.draw.rect(surf, (255, 0, 0), pygame.Rect(10, 10, 20, 10))
player, wall = pygame.Rect(0, 0, 10, 10), pygame.Rect(5, 5, 10, 10)
print(surf.get_at((15, 15))[:3], player.colliderect(wall), player.move(3, 4).topleft)
```

# id: ext:PIL
kind: extlib
category: Внешние библиотеки
title: Pillow (PIL)
summary: Изображения: открытие, изменение размера, обрезка, рисование, фильтры, форматы.
install: pip install pillow
version: 12.3 (проверено при сборке справочника)
url: https://github.com/python-pillow/Pillow
license: MIT-CMU
check: PIL.Image.new, PIL.Image.open, PIL.ImageDraw.Draw, PIL.ImageFilter.GaussianBlur
tags: pillow, pil, изображение, картинка, resize, фильтр, png, jpeg
related: gh:pillow, ext:cv2
## Пример
```python ext
import io
from PIL import Image, ImageDraw, ImageFilter
img = Image.new("RGB", (120, 80), "white")
d = ImageDraw.Draw(img)
d.rectangle((10, 10, 60, 50), fill="red")
d.text((70, 30), "Hi", fill="black")
small = img.resize((60, 40)).filter(ImageFilter.GaussianBlur(1))
buf = io.BytesIO()
small.save(buf, format="PNG")
print(img.size, small.size, img.getpixel((20, 20)), Image.open(io.BytesIO(buf.getvalue())).format)
```

# id: ext:cv2
kind: extlib
category: Внешние библиотеки
title: OpenCV (cv2)
summary: Компьютерное зрение: обработка изображений и видео, фильтры, контуры, преобразования, камера.
install: pip install opencv-python
version: 5.0 (проверено при сборке справочника)
url: https://github.com/opencv/opencv-python
license: Apache-2.0
check: cv2.cvtColor, cv2.GaussianBlur, cv2.Canny, cv2.findContours, cv2.resize, cv2.imread, cv2.threshold
tags: opencv, cv2, компьютерное зрение, изображение, контуры, видео
related: gh:opencv-python, ext:numpy, ext:PIL
## Пример
```python ext
import numpy as np
import cv2
img = np.zeros((100, 100, 3), dtype=np.uint8)
cv2.rectangle(img, (20, 20), (70, 60), (255, 255, 255), -1)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
x, y, w, h = cv2.boundingRect(contours[0])
print(len(contours), (x, y, w, h), cv2.resize(img, (50, 50)).shape)
```
## Особенности
Изображения в OpenCV — массивы NumPy; порядок каналов цвета — BGR, а не RGB.

# id: ext:sklearn
kind: extlib
category: Внешние библиотеки
title: scikit-learn
summary: Классическое машинное обучение: модели, предобработка, разбиение данных, метрики, подбор параметров.
install: pip install scikit-learn
version: 1.9 (проверено при сборке справочника)
url: https://github.com/scikit-learn/scikit-learn
license: BSD-3-Clause
check: sklearn.model_selection.train_test_split, sklearn.linear_model.LogisticRegression, sklearn.metrics.accuracy_score, sklearn.tree.DecisionTreeClassifier, sklearn.preprocessing.StandardScaler, sklearn.cluster.KMeans
tags: scikit-learn, sklearn, машинное обучение, классификация, регрессия, fit, predict
related: gh:scikit-learn, ext:numpy, ext:pandas
## Единый интерфейс
Модель создаётся, обучается fit(X, y), предсказывает predict(X); преобразователи — fit_transform. Pipeline объединяет шаги.
## Пример
```python ext
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=500))
model.fit(X_tr, y_tr)
print(X.shape, accuracy_score(y_te, model.predict(X_te)) > 0.85)
```

# id: ext:torch
kind: extlib
category: Внешние библиотеки
title: PyTorch
summary: Тензоры, автоматическое дифференцирование и нейросети (torch.nn), оптимизаторы.
install: pip install torch
version: 2.14 (проверено при сборке справочника)
url: https://github.com/pytorch/pytorch
license: BSD-3-Clause (и лицензии встроенных компонентов)
check: torch.tensor, torch.zeros, torch.nn.Linear, torch.nn.Module, torch.optim.SGD, torch.no_grad
tags: pytorch, torch, нейросеть, тензор, глубокое обучение, autograd
related: gh:torch, ext:tensorflow, ext:numpy
## Пример: обучение линейной модели
```python ext
import torch
torch.manual_seed(0)
x = torch.linspace(-1, 1, 50).unsqueeze(1)
y = 3 * x + 0.5
model = torch.nn.Linear(1, 1)
opt = torch.optim.SGD(model.parameters(), lr=0.5)
for _ in range(200):
    opt.zero_grad()
    loss = torch.nn.functional.mse_loss(model(x), y)
    loss.backward()
    opt.step()
print(round(model.weight.item(), 2), round(model.bias.item(), 2), loss.item() < 1e-4)
```
## Основы
- torch.tensor — многомерный массив (как ndarray) с поддержкой GPU и градиентов.
- requires_grad=True + backward() вычисляют производные.
- nn.Module — базовый класс сетей; optim — алгоритмы оптимизации.

# id: ext:tensorflow
kind: extlib
category: Внешние библиотеки
title: TensorFlow и Keras
summary: Платформа машинного обучения: тензоры, автоматическое дифференцирование, высокоуровневый Keras.
install: pip install tensorflow
version: 2.21 (проверено при сборке справочника)
url: https://github.com/tensorflow/tensorflow
license: Apache-2.0
check: tensorflow.constant, tensorflow.GradientTape, tensorflow.keras.Sequential, tensorflow.keras.layers.Dense
tags: tensorflow, tf, keras, нейросеть, глубокое обучение
related: gh:tensorflow, gh:keras, ext:torch
## Пример
```python ext
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
print(tf.reduce_sum(a).numpy(), (a @ tf.transpose(a)).numpy().tolist())
w = tf.Variable(2.0)
with tf.GradientTape() as tape:
    loss = (w * 3.0 - 9.0) ** 2
print(tape.gradient(loss, w).numpy())
model = tf.keras.Sequential([tf.keras.Input(shape=(4,)), tf.keras.layers.Dense(8, activation="relu"), tf.keras.layers.Dense(1)])
print(model.count_params())
```
## Мобильные устройства
Обученные модели можно конвертировать в формат TensorFlow Lite (LiteRT) для телефонов и часов — это отдельная библиотека времени выполнения, не Python.

# id: ext:sqlalchemy
kind: extlib
category: Внешние библиотеки
title: SQLAlchemy
summary: Работа с реляционными БД: Core (SQL-выражения) и ORM (классы как таблицы).
install: pip install sqlalchemy
version: 2.1 (проверено при сборке справочника)
url: https://github.com/sqlalchemy/sqlalchemy
license: MIT
check: sqlalchemy.create_engine, sqlalchemy.select, sqlalchemy.orm.Session, sqlalchemy.orm.DeclarativeBase, sqlalchemy.orm.mapped_column
tags: sqlalchemy, orm, sql, база данных, sqlite, postgresql
related: gh:sqlalchemy, gh:alembic, lib:sqlite3
## Пример (SQLite в памяти)
```python ext
from sqlalchemy import create_engine, select, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
class Base(DeclarativeBase):
    pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    age: Mapped[int]
engine = create_engine("sqlite://")
Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add_all([User(name="Ali", age=15), User(name="Ola", age=17)])
    s.commit()
    adults = s.scalars(select(User.name).where(User.age >= 16).order_by(User.name)).all()
print(adults)
```

# id: ext:selenium
kind: extlib
category: Внешние библиотеки
title: Selenium
summary: Управление браузером через WebDriver: открыть страницу, найти элементы, кликнуть, ввести текст, проверить результат.
install: pip install selenium
version: 4.50 (проверено при сборке справочника)
url: https://www.selenium.dev
license: Apache-2.0
check: selenium.webdriver.Chrome, selenium.webdriver.common.by.By, selenium.webdriver.support.ui.WebDriverWait
tags: selenium, браузер, автотесты, webdriver, автоматизация
related: gh:selenium, ext:pytest
## Типичный сценарий (нужен браузер)
```python norun
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
try:
    driver.get("https://www.python.org")
    box = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "q")))
    box.send_keys("asyncio\n")
    print(driver.title)
finally:
    driver.quit()
```
## Проверка доступных локаторов
```python ext
from selenium.webdriver.common.by import By
print([By.ID, By.NAME, By.CSS_SELECTOR, By.XPATH])
```
## Советы
Используйте явные ожидания (WebDriverWait) вместо time.sleep. Selenium Manager (4.6+) сам находит драйвер браузера.

# id: ext:pytest
kind: extlib
category: Внешние библиотеки
title: pytest
summary: Фреймворк тестирования: простые assert, фикстуры, параметризация, подробные отчёты.
install: pip install pytest
version: 9.1 (проверено при сборке справочника)
url: https://github.com/pytest-dev/pytest
license: MIT
check: pytest.main, pytest.fixture, pytest.mark.parametrize, pytest.raises, pytest.approx
tags: pytest, тесты, unit tests, fixture, parametrize, assert
related: gh:pytest, py:topic:testing, lib:unittest
## Пример
```python ext
import pathlib, tempfile, pytest
code = '''
import pytest

def is_prime(n):
    return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))

@pytest.mark.parametrize("n,expected", [(2, True), (9, False), (97, True), (1, False)])
def test_prime(n, expected):
    assert is_prime(n) == expected

def test_division():
    with pytest.raises(ZeroDivisionError):
        1 / 0
    assert 0.1 + 0.2 == pytest.approx(0.3)
'''
d = pathlib.Path(tempfile.mkdtemp())
(d / "test_demo.py").write_text(code, encoding="utf-8")
print(pytest.main(["-q", "-p", "no:cacheprovider", str(d)]) == 0)
```
## Запуск
pytest — из папки проекта; pytest -k имя — выбрать тесты; pytest -x — остановиться на первой ошибке.
