# id: gh:requests
kind: project
category: Веб и сеть
title: Requests
summary: HTTP-клиент «для людей»: запросы к сайтам и API в одну строку.
url: https://github.com/psf/requests
lang: Python
license: Apache-2.0
install: pip install requests
version: 2.34.2 (PyPI)
level: 1
tags: HTTP, GET, POST, API, веб-запросы
related: ext:requests
## Описание
Requests скрывает детали протокола HTTP: сессии, cookies, кодировки, перенаправления, загрузку файлов. Это одна из самых скачиваемых библиотек Python.
## Для чего
Получение данных из веб-API, скачивание страниц, автоматизация форм.
## Установка
На компьютере: pip install requests. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:flask
kind: project
category: Веб и сеть
title: Flask
summary: Лёгкий веб-фреймворк: сайт или API из нескольких функций.
url: https://github.com/pallets/flask
lang: Python
license: BSD-3-Clause
install: pip install flask
version: 3.1.3 (PyPI)
level: 2
tags: веб-фреймворк, микрофреймворк, маршруты, WSGI
related: ext:flask
## Описание
Flask даёт маршрутизацию URL, шаблоны Jinja2 и встроенный сервер для разработки; остальное подключается расширениями. Хорош для первых веб-проектов и небольших сервисов.
## Для чего
Учебные сайты, REST API, прототипы, небольшие внутренние сервисы.
## Установка
На компьютере: pip install flask. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:django
kind: project
category: Веб и сеть
title: Django
summary: Полнофункциональный веб-фреймворк «с батарейками»: ORM, админка, формы, авторизация.
url: https://github.com/django/django
lang: Python
license: BSD-3-Clause
install: pip install django
version: 6.1.1 (PyPI)
level: 3
tags: веб-фреймворк, ORM, админка, MVC
related: ext:django
## Описание
Django следует принципу «всё включено»: модели и миграции базы данных, панель администратора, система шаблонов, защита от типичных атак. На нём построены крупные сайты.
## Для чего
Сайты и порталы, интернет-магазины, системы с базой данных и админкой.
## Установка
На компьютере: pip install django. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:fastapi
kind: project
category: Веб и сеть
title: FastAPI
summary: Современный фреймворк для API на основе аннотаций типов и асинхронности.
url: https://github.com/fastapi/fastapi
lang: Python
license: MIT
install: pip install fastapi
version: 0.142.2 (PyPI)
level: 3
tags: API, асинхронность, типы, OpenAPI, Pydantic
related: ext:fastapi
## Описание
FastAPI проверяет входные данные по аннотациям типов (через Pydantic) и автоматически строит интерактивную документацию OpenAPI. Работает на ASGI-сервере (например, Uvicorn).
## Для чего
Быстрые REST API, микросервисы, бэкенды для мобильных приложений.
## Установка
На компьютере: pip install fastapi. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:uvicorn
kind: project
category: Веб и сеть
title: Uvicorn
summary: Быстрый ASGI-сервер для асинхронных веб-приложений.
url: https://github.com/Kludex/uvicorn
lang: Python
license: BSD-3-Clause
install: pip install uvicorn
version: 0.54.0 (PyPI)
level: 3
tags: ASGI, сервер, асинхронный
related: gh:fastapi
## Описание
Uvicorn запускает приложения FastAPI, Starlette и других ASGI-фреймворков.
## Для чего
Запуск FastAPI-приложений в разработке и продакшене.
## Установка
На компьютере: pip install uvicorn. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:httpx
kind: project
category: Веб и сеть
title: HTTPX
summary: HTTP-клиент с синхронным и асинхронным API и поддержкой HTTP/2.
url: https://github.com/encode/httpx
lang: Python
license: BSD-3-Clause
install: pip install httpx
version: 0.28.1 (PyPI)
level: 3
tags: HTTP, async, HTTP/2, клиент
related: gh:requests
## Описание
API HTTPX похож на Requests, но дополнительно умеет async/await.
## Для чего
Асинхронные запросы, тестирование веб-приложений.
## Установка
На компьютере: pip install httpx. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:aiohttp
kind: project
category: Веб и сеть
title: aiohttp
summary: Асинхронный HTTP-клиент и сервер на asyncio.
url: https://github.com/aio-libs/aiohttp
lang: Python
license: Apache-2.0 AND MIT
install: pip install aiohttp
version: 3.14.3 (PyPI)
level: 4
tags: asyncio, HTTP-клиент, сервер, websockets
related: py:topic:asyncio
## Описание
Позволяет одновременно выполнять тысячи сетевых запросов в одном потоке.
## Для чего
Парсеры с большим числом запросов, чат-боты, веб-сокеты.
## Установка
На компьютере: pip install aiohttp. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:scrapy
kind: project
category: Веб и сеть
title: Scrapy
summary: Фреймворк для обхода сайтов и извлечения данных.
url: https://github.com/scrapy/scrapy
lang: Python
license: BSD-3-Clause
install: pip install scrapy
version: 2.19.0 (PyPI)
level: 4
tags: парсинг, краулер, сбор данных
related: gh:beautifulsoup4
## Описание
Scrapy управляет очередью запросов, повторными попытками, конвейерами обработки и экспортом в JSON/CSV.
## Для чего
Массовый сбор данных с сайтов (с соблюдением правил сайта и robots.txt).
## Установка
На компьютере: pip install scrapy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:beautifulsoup4
kind: project
category: Веб и сеть
title: Beautiful Soup
summary: Разбор HTML и XML: поиск тегов, атрибутов и текста.
url: https://www.crummy.com/software/BeautifulSoup/
lang: Python
license: MIT License
install: pip install beautifulsoup4
version: 4.15.0 (PyPI)
level: 2
tags: HTML, парсинг, XML, теги
related: ext:bs4
## Описание
Beautiful Soup строит дерево документа даже из «грязного» HTML и даёт удобный поиск: find, find_all, CSS-селекторы select.
## Для чего
Извлечение данных из веб-страниц, очистка HTML.
## Установка
На компьютере: pip install beautifulsoup4. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:selenium
kind: project
category: Автоматизация
title: Selenium
summary: Управление настоящим браузером из кода через WebDriver.
url: https://www.selenium.dev
lang: Python, Java, C#, JavaScript, Ruby
license: Apache-2.0
install: pip install selenium
version: 4.50.0 (PyPI)
level: 3
tags: браузер, автотесты, WebDriver
related: ext:selenium
## Описание
Selenium открывает страницы, нажимает кнопки, заполняет формы и проверяет результат — основа автотестов веб-интерфейсов.
## Для чего
Автоматическое тестирование сайтов, автоматизация рутинных действий в браузере.
## Установка
На компьютере: pip install selenium. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:numpy
kind: project
category: Данные и наука
title: NumPy
summary: Многомерные массивы и быстрые векторные вычисления — фундамент научного Python.
url: https://github.com/numpy/numpy
lang: Python, C
license: BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0
install: pip install numpy
version: 2.5.3 (PyPI)
level: 2
tags: массивы, линейная алгебра, векторизация
related: ext:numpy
## Описание
NumPy хранит числа в компактных массивах и выполняет операции над ними на C, без циклов Python. На NumPy построены Pandas, SciPy, scikit-learn и многие другие.
## Для чего
Научные расчёты, обработка сигналов и изображений, машинное обучение.
## Установка
На компьютере: pip install numpy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pandas
kind: project
category: Данные и наука
title: Pandas
summary: Таблицы DataFrame: чтение, очистка, группировка и анализ данных.
url: https://github.com/pandas-dev/pandas
lang: Python, Cython
license: BSD 3-Clause License
install: pip install pandas
version: 3.0.6 (PyPI)
level: 2
tags: таблицы, DataFrame, анализ данных, CSV
related: ext:pandas
## Описание
Pandas читает CSV, Excel, SQL и JSON, умеет фильтровать, группировать, объединять таблицы и работать с временными рядами.
## Для чего
Анализ данных, отчёты, подготовка данных для машинного обучения.
## Установка
На компьютере: pip install pandas. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:polars
kind: project
category: Данные и наука
title: Polars
summary: Быстрые таблицы-DataFrame на Rust с ленивыми вычислениями.
url: https://github.com/pola-rs/polars
lang: Rust, Python
license: MIT License
install: pip install polars
version: 1.44.2 (PyPI)
level: 3
tags: DataFrame, быстрый анализ, ленивые вычисления
related: gh:pandas
## Описание
Polars распараллеливает запросы и оптимизирует их перед выполнением.
## Для чего
Обработка больших таблиц, альтернатива Pandas.
## Установка
На компьютере: pip install polars. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:matplotlib
kind: project
category: Данные и наука
title: Matplotlib
summary: Построение графиков и диаграмм любого вида.
url: https://github.com/matplotlib/matplotlib
lang: Python
license: Python Software Foundation License
install: pip install matplotlib
version: 3.11.2 (PyPI)
level: 2
tags: графики, визуализация, диаграммы
related: ext:matplotlib
## Описание
Matplotlib рисует линейные графики, гистограммы, точечные и круговые диаграммы и сохраняет их в PNG, SVG и PDF.
## Для чего
Визуализация данных, иллюстрации для отчётов и научных статей.
## Установка
На компьютере: pip install matplotlib. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:seaborn
kind: project
category: Данные и наука
title: Seaborn
summary: Статистическая визуализация поверх Matplotlib.
url: https://github.com/mwaskom/seaborn
lang: Python
license: BSD License
install: pip install seaborn
version: 0.13.2 (PyPI)
level: 2
tags: статистическая визуализация, графики
related: gh:matplotlib
## Описание
Seaborn строит красивые графики распределений и зависимостей по таблицам Pandas в одну строку.
## Для чего
Исследовательский анализ данных.
## Установка
На компьютере: pip install seaborn. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:plotly
kind: project
category: Данные и наука
title: Plotly
summary: Интерактивные графики для браузера и ноутбуков.
url: https://github.com/plotly/plotly.py
lang: Python, JavaScript
license: MIT
install: pip install plotly
version: 7.1.0 (PyPI)
level: 2
tags: интерактивные графики, веб
related: gh:dash
## Описание
Графики Plotly можно приближать, вращать и сохранять как HTML.
## Для чего
Интерактивные отчёты и дашборды.
## Установка
На компьютере: pip install plotly. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:bokeh
kind: project
category: Данные и наука
title: Bokeh
summary: Интерактивная визуализация в браузере.
url: https://github.com/bokeh/bokeh
lang: Python, TypeScript
license: BSD-3-Clause
install: pip install bokeh
version: 3.10.0 (PyPI)
level: 3
tags: интерактивная визуализация, браузер
related: gh:plotly
## Описание
Bokeh создаёт графики и приложения, которые работают в веб-браузере.
## Для чего
Интерактивные дашборды на Python.
## Установка
На компьютере: pip install bokeh. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:dash
kind: project
category: Данные и наука
title: Dash
summary: Фреймворк для аналитических веб-приложений на Python.
url: https://github.com/plotly/dash
lang: Python
license: MIT
install: pip install dash
version: 4.4.1 (PyPI)
level: 3
tags: дашборды, веб-приложения, Plotly
related: gh:plotly
## Описание
Dash собирает интерфейс из компонентов и связывает их колбэками на Python.
## Для чего
Дашборды и аналитические панели без JavaScript.
## Установка
На компьютере: pip install dash. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:streamlit
kind: project
category: Данные и наука
title: Streamlit
summary: Превращает Python-скрипт в веб-приложение для данных.
url: https://github.com/streamlit/streamlit
lang: Python, TypeScript
license: Apache-2.0
install: pip install streamlit
version: 1.65.0 (PyPI)
level: 2
tags: приложения для данных, прототипы
related: gh:pandas
## Описание
Виджеты (кнопки, ползунки, таблицы) объявляются прямо в коде скрипта.
## Для чего
Быстрые демонстрации моделей и анализа данных.
## Установка
На компьютере: pip install streamlit. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:scipy
kind: project
category: Данные и наука
title: SciPy
summary: Научные алгоритмы: оптимизация, интегралы, статистика, сигналы, разреженные матрицы.
url: https://github.com/scipy/scipy
lang: Python, C, Fortran
license: BSD License
install: pip install scipy
version: 1.18.1 (PyPI)
level: 3
tags: оптимизация, интегрирование, статистика
related: gh:numpy
## Описание
SciPy дополняет NumPy численными методами, проверенными десятилетиями.
## Для чего
Инженерные и научные вычисления.
## Установка
На компьютере: pip install scipy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:sympy
kind: project
category: Данные и наука
title: SymPy
summary: Символьная математика: упрощение выражений, производные, интегралы, уравнения.
url: https://github.com/sympy/sympy
lang: Python
license: BSD
install: pip install sympy
version: 1.14.0 (PyPI)
level: 3
tags: символьные вычисления, алгебра, производные
related: gh:numpy
## Описание
SymPy работает с формулами как математик — точно, а не приближённо.
## Для чего
Проверка выкладок, решение уравнений, обучение математике.
## Установка
На компьютере: pip install sympy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:networkx
kind: project
category: Данные и наука
title: NetworkX
summary: Графы и сети: создание, анализ и алгоритмы.
url: https://github.com/networkx/networkx
lang: Python
license: BSD-3-Clause
install: pip install networkx
version: 3.7 (PyPI)
level: 3
tags: графы, сети, алгоритмы на графах
related: algo:graphs
## Описание
В NetworkX есть кратчайшие пути, компоненты, центральность, потоки и многие другие алгоритмы на графах.
## Для чего
Анализ социальных и транспортных сетей, проверка своих реализаций алгоритмов.
## Установка
На компьютере: pip install networkx. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:statsmodels
kind: project
category: Данные и наука
title: statsmodels
summary: Статистические модели: регрессии, тесты, временные ряды.
url: https://github.com/statsmodels/statsmodels
lang: Python
license: BSD-3-Clause
install: pip install statsmodels
version: 0.15.0 (PyPI)
level: 4
tags: статистика, регрессия, временные ряды
related: gh:scipy
## Описание
statsmodels выдаёт подробные статистические отчёты по моделям.
## Для чего
Эконометрика, статистический анализ.
## Установка
На компьютере: pip install statsmodels. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:scikit-learn
kind: project
category: Машинное обучение
title: scikit-learn
summary: Классическое машинное обучение с единым интерфейсом fit/predict.
url: https://github.com/scikit-learn/scikit-learn
lang: Python, Cython
license: BSD-3-Clause
install: pip install scikit-learn
version: 1.9.1 (PyPI)
level: 3
tags: машинное обучение, классификация, регрессия, кластеризация
related: ext:sklearn
## Описание
Содержит модели классификации, регрессии и кластеризации, предобработку данных, подбор параметров и метрики качества.
## Для чего
Обучение моделей на табличных данных, учебные проекты по ML.
## Установка
На компьютере: pip install scikit-learn. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:torch
kind: project
category: Машинное обучение
title: PyTorch
summary: Глубокое обучение: тензоры, автоматическое дифференцирование, нейросети.
url: https://github.com/pytorch/pytorch
lang: Python, C++, CUDA
license: составная (BSD, Apache-2.0 и др. для встроенных компонентов) — см. LICENSE
install: pip install torch
version: 2.14.1 (PyPI)
level: 4
tags: нейросети, тензоры, глубокое обучение
related: ext:torch
## Описание
PyTorch строит вычисления динамически, что делает отладку похожей на обычный Python.
## Для чего
Исследования и продакшен в области нейросетей.
## Установка
На компьютере: pip install torch. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:tensorflow
kind: project
category: Машинное обучение
title: TensorFlow
summary: Платформа машинного обучения от Google со встроенным Keras.
url: https://github.com/tensorflow/tensorflow
lang: C++, Python
license: Apache 2.0
install: pip install tensorflow
version: 2.21.0 (PyPI)
level: 4
tags: нейросети, Keras, глубокое обучение
related: ext:tensorflow
## Описание
TensorFlow обучает и развёртывает модели на серверах, в браузере и на мобильных устройствах (TensorFlow Lite).
## Для чего
Нейросети, развёртывание моделей на устройствах.
## Установка
На компьютере: pip install tensorflow. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:keras
kind: project
category: Машинное обучение
title: Keras
summary: Высокоуровневый API для нейросетей с несколькими бэкендами.
url: https://github.com/keras-team/keras
lang: Python
license: Apache License 2.0
install: pip install keras
version: 3.15.1 (PyPI)
level: 3
tags: нейросети, высокоуровневый API
related: gh:tensorflow
## Описание
Keras 3 работает поверх JAX, TensorFlow или PyTorch.
## Для чего
Быстрое построение и обучение нейросетей.
## Установка
На компьютере: pip install keras. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:jax
kind: project
category: Машинное обучение
title: JAX
summary: NumPy-подобные вычисления с автоматическим дифференцированием и компиляцией.
url: https://github.com/jax-ml/jax
lang: Python, C++
license: Apache-2.0
install: pip install jax
version: 0.11.2 (PyPI)
level: 5
tags: автодифференцирование, XLA, ускорители
related: gh:numpy
## Описание
JAX преобразует функции: grad, jit, vmap.
## Для чего
Исследования в машинном обучении и научных вычислениях.
## Установка
На компьютере: pip install jax. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:transformers
kind: project
category: Машинное обучение
title: Transformers
summary: Готовые архитектуры и предобученные модели-трансформеры.
url: https://github.com/huggingface/transformers
lang: Python
license: Apache 2.0 License
install: pip install transformers
version: 5.18.0 (PyPI)
level: 4
tags: нейросети, NLP, языковые модели
related: gh:torch
## Описание
Библиотека Hugging Face для работы с языковыми и мультимодальными моделями.
## Для чего
Обработка текста, классификация, генерация.
## Установка
На компьютере: pip install transformers. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:nltk
kind: project
category: Машинное обучение
title: NLTK
summary: Учебный набор инструментов для обработки естественного языка.
url: https://github.com/nltk/nltk
lang: Python
license: Apache License, Version 2.0
install: pip install nltk
version: 3.10.3 (PyPI)
level: 3
tags: обработка текста, NLP, токенизация
related: gh:spacy
## Описание
Токенизация, стемминг, разметка частей речи, корпуса текстов.
## Для чего
Обучение NLP, анализ текстов.
## Установка
На компьютере: pip install nltk. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:spacy
kind: project
category: Машинное обучение
title: spaCy
summary: Промышленная обработка текста: токены, части речи, сущности.
url: https://github.com/explosion/spaCy
lang: Python, Cython
license: MIT
install: pip install spacy
version: 3.8.16 (PyPI)
level: 4
tags: NLP, промышленная обработка текста
related: gh:nltk
## Описание
spaCy рассчитан на скорость и использование в продакшене.
## Для чего
Извлечение сущностей, анализ текстов.
## Установка
На компьютере: pip install spacy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:opencv-python
kind: project
category: Игры и графика
title: OpenCV (opencv-python)
summary: Python-пакеты библиотеки компьютерного зрения OpenCV.
url: https://github.com/opencv/opencv-python
lang: C++, Python
license: Apache 2.0
install: pip install opencv-python
version: 5.0.0.93 (PyPI)
level: 3
tags: компьютерное зрение, изображения, видео
related: ext:cv2
## Описание
OpenCV обрабатывает изображения и видео: фильтры, контуры, распознавание объектов, работа с камерой.
## Для чего
Компьютерное зрение, обработка фото и видео.
## Установка
На компьютере: pip install opencv-python. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pillow
kind: project
category: Игры и графика
title: Pillow
summary: Открытие, изменение и сохранение изображений.
url: https://github.com/python-pillow/Pillow
lang: Python, C
license: MIT-CMU
install: pip install pillow
version: 12.3.0 (PyPI)
level: 2
tags: изображения, обработка фото
related: ext:PIL
## Описание
Pillow (продолжение PIL) умеет менять размер, обрезать, рисовать, применять фильтры и конвертировать форматы.
## Для чего
Миниатюры, водяные знаки, генерация картинок.
## Установка
На компьютере: pip install pillow. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pygame
kind: project
category: Игры и графика
title: Pygame
summary: Создание 2D-игр: окно, рисование, звук, клавиатура и мышь.
url: https://github.com/pygame/pygame
lang: Python, C
license: LGPL
install: pip install pygame
version: 2.6.1 (PyPI)
level: 2
tags: игры, 2D-графика, звук
related: ext:pygame
## Описание
Pygame основан на SDL; игровой цикл обрабатывает события, обновляет состояние и перерисовывает экран.
## Для чего
Первые игры, визуализации, учебные проекты.
## Установка
На компьютере: pip install pygame. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:arcade
kind: project
category: Игры и графика
title: Arcade
summary: Современная библиотека для 2D-игр на OpenGL.
url: https://github.com/pythonarcade/arcade
lang: Python
license: MIT License
install: pip install arcade
version: 3.3.3 (PyPI)
level: 2
tags: 2D-игры, OpenGL, обучение
related: gh:pygame
## Описание
Arcade предлагает спрайты, физику и камеры с понятным объектно-ориентированным API.
## Для чего
Учебные и инди-игры.
## Установка
На компьютере: pip install arcade. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pyglet
kind: project
category: Игры и графика
title: pyglet
summary: Окна, графика OpenGL и мультимедиа без внешних зависимостей.
url: https://pyglet.org
lang: Python
license: см. файл LICENSE в репозитории
install: pip install pyglet
version: 2.1.16 (PyPI)
level: 3
tags: мультимедиа, OpenGL, окна
related: gh:arcade
## Описание
pyglet написан на чистом Python и использует системные библиотеки.
## Для чего
Игры и мультимедийные приложения.
## Установка
На компьютере: pip install pyglet. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:kivy
kind: project
category: Интерфейсы
title: Kivy
summary: Кроссплатформенные интерфейсы с поддержкой сенсорного ввода.
url: https://github.com/kivy/kivy
lang: Python, Cython
license: MIT
install: pip install kivy
version: 2.3.1 (PyPI)
level: 3
tags: GUI, мобильные приложения, сенсорный ввод
related: gh:briefcase
## Описание
Приложения на Kivy работают на Windows, macOS, Linux, Android и iOS.
## Для чего
Мобильные и настольные приложения на Python.
## Установка
На компьютере: pip install kivy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:briefcase
kind: project
category: Интерфейсы
title: Briefcase (BeeWare)
summary: Упаковка Python-проектов в нативные приложения для разных платформ.
url: https://github.com/beeware/briefcase
lang: Python
license: BSD-3-Clause
install: pip install briefcase
version: 0.4.5 (PyPI)
level: 3
tags: упаковка приложений, Android, iOS
related: gh:toga
## Описание
Часть проекта BeeWare: собирает установщики для настольных систем и мобильных платформ.
## Для чего
Распространение Python-приложений.
## Установка
На компьютере: pip install briefcase. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:toga
kind: project
category: Интерфейсы
title: Toga (BeeWare)
summary: Нативный интерфейс на Python для разных операционных систем.
url: https://github.com/beeware/toga
lang: Python
license: BSD-3-Clause
install: pip install toga
version: 0.5.7 (PyPI)
level: 3
tags: нативный GUI, кроссплатформенность
related: gh:briefcase
## Описание
Toga использует системные элементы управления каждой платформы.
## Для чего
Настольные и мобильные приложения с нативным видом.
## Установка
На компьютере: pip install toga. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:textual
kind: project
category: Интерфейсы
title: Textual
summary: Полноценные интерфейсы в терминале.
url: https://github.com/Textualize/textual
lang: Python
license: MIT
install: pip install textual
version: 8.2.8 (PyPI)
level: 3
tags: TUI, терминальные интерфейсы
related: gh:rich
## Описание
Textual — виджеты, стили и раскладки для приложений, работающих в консоли.
## Для чего
Консольные утилиты с интерфейсом.
## Установка
На компьютере: pip install textual. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:rich
kind: project
category: Интерфейсы
title: Rich
summary: Красивый вывод в терминал: цвета, таблицы, подсветка кода, прогресс.
url: https://github.com/Textualize/rich
lang: Python
license: MIT
install: pip install rich
version: 15.0.0 (PyPI)
level: 1
tags: цветной вывод, таблицы, прогресс-бар
related: gh:textual
## Описание
Rich делает вывод консольных программ наглядным без лишнего кода.
## Для чего
Утилиты командной строки, логирование.
## Установка
На компьютере: pip install rich. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:click
kind: project
category: Интерфейсы
title: Click
summary: Создание интерфейсов командной строки с помощью декораторов.
url: https://github.com/pallets/click
lang: Python
license: BSD-3-Clause
install: pip install click
version: 8.5.0 (PyPI)
level: 2
tags: CLI, командная строка, аргументы
related: lib:argparse
## Описание
Click разбирает аргументы и опции, генерирует справку и поддерживает подкоманды.
## Для чего
Консольные утилиты.
## Установка
На компьютере: pip install click. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:typer
kind: project
category: Интерфейсы
title: Typer
summary: CLI на основе аннотаций типов функций.
url: https://github.com/fastapi/typer
lang: Python
license: MIT
install: pip install typer
version: 0.27.2 (PyPI)
level: 2
tags: CLI, аннотации типов
related: gh:click
## Описание
Typer построен на Click и автоматически превращает параметры функции в аргументы командной строки.
## Для чего
Быстрое создание консольных утилит.
## Установка
На компьютере: pip install typer. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:tqdm
kind: project
category: Интерфейсы
title: tqdm
summary: Индикатор прогресса для циклов в одну обёртку.
url: https://github.com/tqdm/tqdm
lang: Python
license: MPL-2.0 AND MIT
install: pip install tqdm
version: 4.70.1 (PyPI)
level: 1
tags: прогресс-бар, циклы
related: gh:rich
## Описание
for x in tqdm(items): — и в терминале появляется полоса прогресса с оценкой времени.
## Для чего
Длительные вычисления и загрузки.
## Установка
На компьютере: pip install tqdm. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pytest
kind: project
category: Тестирование
title: pytest
summary: Фреймворк тестирования: простые assert, фикстуры, параметризация.
url: https://github.com/pytest-dev/pytest
lang: Python
license: MIT
install: pip install pytest
version: 9.1.1 (PyPI)
level: 2
tags: тесты, assert, фикстуры
related: ext:pytest
## Описание
pytest находит тесты по соглашениям об именах и подробно показывает, какое сравнение не прошло.
## Для чего
Модульные и интеграционные тесты.
## Установка
На компьютере: pip install pytest. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:hypothesis
kind: project
category: Тестирование
title: Hypothesis
summary: Тестирование свойств: библиотека сама генерирует входные данные.
url: https://github.com/HypothesisWorks/hypothesis
lang: Python
license: MPL-2.0
install: pip install hypothesis
version: 6.168.3 (PyPI)
level: 4
tags: тестирование свойств, генерация тестов
related: gh:pytest
## Описание
Hypothesis ищет контрпример и упрощает его до минимального — похоже на стресс-тестирование в олимпиадах.
## Для чего
Поиск крайних случаев в коде.
## Установка
На компьютере: pip install hypothesis. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:faker
kind: project
category: Тестирование
title: Faker
summary: Генерация правдоподобных тестовых данных: имена, адреса, тексты.
url: https://github.com/joke2k/faker
lang: Python
license: MIT License
install: pip install faker
version: 40.40.0 (PyPI)
level: 1
tags: тестовые данные, генерация
related: gh:pytest
## Описание
Поддерживает множество языков и локалей.
## Для чего
Наполнение тестовых баз данных.
## Установка
На компьютере: pip install faker. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:black
kind: project
category: Инструменты разработчика
title: Black
summary: Бескомпромиссный автоформаттер кода Python.
url: https://github.com/psf/black
lang: Python
license: MIT
install: pip install black
version: 26.10.0 (PyPI)
level: 1
tags: форматирование кода, стиль
related: gh:ruff
## Описание
Black приводит код к единому стилю автоматически.
## Для чего
Единый стиль кода в команде.
## Установка
На компьютере: pip install black. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:ruff
kind: project
category: Инструменты разработчика
title: Ruff
summary: Очень быстрый линтер и форматтер для Python на Rust.
url: https://github.com/astral-sh/ruff
lang: Rust
license: MIT
install: pip install ruff
version: 0.16.10 (PyPI)
level: 2
tags: линтер, форматтер, стиль
related: gh:flake8
## Описание
Ruff реализует правила многих линтеров и работает в десятки раз быстрее.
## Для чего
Проверка качества кода.
## Установка
На компьютере: pip install ruff. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:flake8
kind: project
category: Инструменты разработчика
title: Flake8
summary: Проверка стиля и типичных ошибок кода.
url: https://github.com/pycqa/flake8
lang: Python
license: MIT
install: pip install flake8
version: 7.4.1 (PyPI)
level: 2
tags: линтер, PEP 8
related: gh:pylint
## Описание
Объединяет pycodestyle, pyflakes и проверку сложности.
## Для чего
Контроль качества кода.
## Установка
На компьютере: pip install flake8. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pylint
kind: project
category: Инструменты разработчика
title: Pylint
summary: Подробный статический анализатор кода.
url: https://github.com/pylint-dev/pylint
lang: Python
license: GPL-2.0-or-later
install: pip install pylint
version: 4.1.2 (PyPI)
level: 2
tags: статический анализ, ошибки
related: gh:flake8
## Описание
Находит ошибки, неиспользуемые переменные, нарушения стиля и выставляет оценку.
## Для чего
Анализ качества кода.
## Установка
На компьютере: pip install pylint. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:mypy
kind: project
category: Инструменты разработчика
title: mypy
summary: Статическая проверка аннотаций типов.
url: https://github.com/python/mypy
lang: Python
license: MIT
install: pip install mypy
version: 2.4.0 (PyPI)
level: 3
tags: типизация, проверка типов
related: py:topic:typing
## Описание
mypy находит ошибки типов до запуска программы.
## Для чего
Крупные проекты с аннотациями типов.
## Установка
На компьютере: pip install mypy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:isort
kind: project
category: Инструменты разработчика
title: isort
summary: Автоматическая сортировка импортов.
url: https://github.com/PyCQA/isort
lang: Python
license: MIT
install: pip install isort
version: 9.0.2 (PyPI)
level: 1
tags: импорты, сортировка
related: gh:black
## Описание
Группирует импорты стандартной библиотеки, сторонних и локальных модулей.
## Для чего
Чистые и единообразные импорты.
## Установка
На компьютере: pip install isort. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:ipython
kind: project
category: Инструменты разработчика
title: IPython
summary: Улучшенная интерактивная оболочка Python.
url: https://github.com/ipython/ipython
lang: Python
license: BSD-3-Clause
install: pip install ipython
version: 9.17.1 (PyPI)
level: 1
tags: интерактивная оболочка, REPL
related: gh:notebook
## Описание
Автодополнение, история, магические команды %timeit и другие.
## Для чего
Эксперименты и отладка.
## Установка
На компьютере: pip install ipython. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:notebook
kind: project
category: Инструменты разработчика
title: Jupyter Notebook
summary: Интерактивные ноутбуки: код, текст, графики в одном документе.
url: https://github.com/jupyter/notebook
lang: Python, TypeScript
license: BSD 3-Clause License
install: pip install notebook
version: 7.6.3 (PyPI)
level: 1
tags: ноутбуки, интерактивные вычисления
related: gh:ipython
## Описание
Классический интерфейс Jupyter для обучения и анализа данных.
## Для чего
Учебные материалы, анализ данных.
## Установка
На компьютере: pip install notebook. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pip
kind: project
category: Инструменты разработчика
title: pip
summary: Стандартный установщик пакетов Python.
url: https://github.com/pypa/pip
lang: Python
license: MIT
install: pip install pip
version: 26.2.1 (PyPI)
level: 1
tags: установка пакетов, PyPI
related: py:topic:venv
## Описание
pip скачивает пакеты из PyPI и устанавливает их в окружение.
## Для чего
Установка библиотек: pip install имя.
## Установка
На компьютере: pip install pip. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:setuptools
kind: project
category: Инструменты разработчика
title: setuptools
summary: Инструмент сборки и упаковки пакетов Python.
url: https://github.com/pypa/setuptools
lang: Python
license: MIT
install: pip install setuptools
version: 84.0.0 (PyPI)
level: 3
tags: сборка пакетов, packaging
related: gh:pip
## Описание
Используется для сборки дистрибутивов и расширений на C/C++.
## Для чего
Публикация своих пакетов.
## Установка
На компьютере: pip install setuptools. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:poetry
kind: project
category: Инструменты разработчика
title: Poetry
summary: Управление зависимостями и упаковкой проекта.
url: https://github.com/python-poetry/poetry
lang: Python
license: MIT
install: pip install poetry
version: 2.5.1 (PyPI)
level: 2
tags: зависимости, виртуальные окружения, packaging
related: gh:pip
## Описание
Poetry фиксирует версии зависимостей в lock-файле и создаёт виртуальное окружение.
## Для чего
Воспроизводимые окружения проектов.
## Установка
На компьютере: pip install poetry. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pyinstaller
kind: project
category: Инструменты разработчика
title: PyInstaller
summary: Сборка Python-программы в один исполняемый файл.
url: https://github.com/pyinstaller/pyinstaller
lang: Python
license: GPL-2.0-or-later с исключением для распространения собранных программ
install: pip install pyinstaller
version: 6.22.3 (PyPI)
level: 2
tags: исполняемый файл, упаковка
related: gh:briefcase
## Описание
PyInstaller упаковывает интерпретатор и зависимости вместе с программой.
## Для чего
Распространение программ без установленного Python.
## Установка
На компьютере: pip install pyinstaller. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:sqlalchemy
kind: project
category: Базы данных
title: SQLAlchemy
summary: Инструментарий SQL и ORM для Python.
url: https://github.com/sqlalchemy/sqlalchemy
lang: Python
license: MIT
install: pip install sqlalchemy
version: 2.1.3 (PyPI)
level: 3
tags: ORM, SQL, базы данных
related: ext:sqlalchemy
## Описание
SQLAlchemy позволяет писать запросы на Python и работать с таблицами как с классами.
## Для чего
Приложения с реляционными базами данных.
## Установка
На компьютере: pip install sqlalchemy. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:alembic
kind: project
category: Базы данных
title: Alembic
summary: Миграции схемы базы данных для SQLAlchemy.
url: https://github.com/sqlalchemy/alembic
lang: Python
license: MIT
install: pip install alembic
version: 1.20.0 (PyPI)
level: 3
tags: миграции базы данных
related: gh:sqlalchemy
## Описание
Alembic хранит изменения схемы как версии и применяет их по порядку.
## Для чего
Развитие структуры БД в проектах.
## Установка
На компьютере: pip install alembic. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:peewee
kind: project
category: Базы данных
title: peewee
summary: Небольшая и простая ORM.
url: https://github.com/coleifer/peewee
lang: Python
license: см. файл LICENSE в репозитории
install: pip install peewee
version: 4.5.2 (PyPI)
level: 2
tags: ORM, SQLite, лёгкий
related: gh:sqlalchemy
## Описание
peewee поддерживает SQLite, MySQL и PostgreSQL.
## Для чего
Небольшие приложения с БД.
## Установка
На компьютере: pip install peewee. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:redis
kind: project
category: Базы данных
title: redis-py
summary: Клиент Python для хранилища Redis.
url: https://github.com/redis/redis-py
lang: Python
license: MIT
install: pip install redis
version: 8.1.0 (PyPI)
level: 3
tags: Redis, кэш, ключ-значение
related: gh:celery
## Описание
Работа с ключами, списками, множествами и очередями Redis.
## Для чего
Кэширование, очереди, счётчики.
## Установка
На компьютере: pip install redis. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pymongo
kind: project
category: Базы данных
title: PyMongo
summary: Официальный драйвер MongoDB для Python.
url: https://github.com/mongodb/mongo-python-driver
lang: Python
license: Apache-2.0
install: pip install pymongo
version: 4.18.2 (PyPI)
level: 3
tags: MongoDB, документы, NoSQL
related: gh:sqlalchemy
## Описание
Документы хранятся и запрашиваются как словари Python.
## Для чего
Приложения с документно-ориентированной БД.
## Установка
На компьютере: pip install pymongo. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:celery
kind: project
category: Автоматизация
title: Celery
summary: Распределённая очередь фоновых задач.
url: https://github.com/celery/celery
lang: Python
license: BSD-3-Clause
install: pip install celery
version: 5.6.3 (PyPI)
level: 4
tags: очередь задач, фоновые задачи
related: gh:redis
## Описание
Celery выполняет задачи асинхронно на рабочих процессах через брокер сообщений.
## Для чего
Фоновая обработка в веб-приложениях.
## Установка
На компьютере: pip install celery. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pyautogui
kind: project
category: Автоматизация
title: PyAutoGUI
summary: Управление мышью и клавиатурой из программы.
url: https://github.com/asweigart/pyautogui
lang: Python
license: BSD
install: pip install pyautogui
version: 0.9.54 (PyPI)
level: 2
tags: мышь, клавиатура, автоматизация GUI
related: gh:selenium
## Описание
Скриншоты, поиск изображения на экране, нажатия клавиш.
## Для чего
Автоматизация рутинных действий на компьютере.
## Установка
На компьютере: pip install pyautogui. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:openpyxl
kind: project
category: Автоматизация
title: openpyxl
summary: Чтение и запись файлов Excel (xlsx).
url: https://foss.heptapod.net/openpyxl/openpyxl
lang: Python
license: MIT
install: pip install openpyxl
version: 3.1.5 (PyPI)
level: 2
tags: Excel, xlsx, таблицы
related: gh:pandas
## Описание
openpyxl работает с ячейками, формулами, стилями и диаграммами.
## Для чего
Отчёты в Excel, обработка таблиц.
## Установка
На компьютере: pip install openpyxl. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:python-docx
kind: project
category: Автоматизация
title: python-docx
summary: Создание и изменение документов Word (.docx).
url: https://github.com/python-openxml/python-docx
lang: Python
license: MIT
install: pip install python-docx
version: 1.2.0 (PyPI)
level: 2
tags: Word, docx, документы
related: gh:openpyxl
## Описание
Абзацы, таблицы, стили и изображения в документах.
## Для чего
Генерация документов и отчётов.
## Установка
На компьютере: pip install python-docx. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:qrcode
kind: project
category: Автоматизация
title: qrcode
summary: Генерация QR-кодов.
url: https://github.com/lincolnloop/python-qrcode
lang: Python
license: BSD
install: pip install qrcode
version: 8.2 (PyPI)
level: 1
tags: QR-код, изображение
related: gh:pillow
## Описание
Создаёт QR-коды как изображения или текст в терминале.
## Для чего
Ссылки и билеты с QR-кодами.
## Установка
На компьютере: pip install qrcode. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:cryptography
kind: project
category: Безопасность
title: cryptography
summary: Криптографические примитивы и готовые рецепты.
url: https://github.com/pyca/cryptography
lang: Python, Rust
license: Apache-2.0 OR BSD-3-Clause
install: pip install cryptography
version: 50.0.2 (PyPI)
level: 4
tags: шифрование, криптография
related: lib:hashlib
## Описание
Симметричное и асимметричное шифрование, подписи, сертификаты X.509.
## Для чего
Безопасное хранение и передача данных.
## Установка
На компьютере: pip install cryptography. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:paramiko
kind: project
category: Безопасность
title: Paramiko
summary: Реализация протокола SSH2 на Python.
url: https://github.com/paramiko/paramiko
lang: Python
license: LGPL-2.1
install: pip install paramiko
version: 5.0.0 (PyPI)
level: 4
tags: SSH, SFTP
related: gh:fabric
## Описание
Подключение к серверам по SSH, выполнение команд, SFTP.
## Для чего
Администрирование серверов.
## Установка
На компьютере: pip install paramiko. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:fabric
kind: project
category: Автоматизация
title: Fabric
summary: Высокоуровневое выполнение команд на серверах по SSH.
url: https://github.com/fabric/fabric
lang: Python
license: BSD
install: pip install fabric
version: 3.2.3 (PyPI)
level: 3
tags: SSH, развёртывание, удалённые команды
related: gh:paramiko
## Описание
Fabric построен на Paramiko и Invoke.
## Для чего
Развёртывание приложений.
## Установка
На компьютере: pip install fabric. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pydantic
kind: project
category: Инструменты разработчика
title: Pydantic
summary: Проверка и преобразование данных по аннотациям типов.
url: https://github.com/pydantic/pydantic
lang: Python, Rust
license: MIT
install: pip install pydantic
version: 2.13.5 (PyPI)
level: 3
tags: валидация данных, типы
related: gh:fastapi
## Описание
Модели Pydantic валидируют входные данные и сериализуют их в JSON.
## Для чего
API, конфигурации, разбор данных.
## Установка
На компьютере: pip install pydantic. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:attrs
kind: project
category: Инструменты разработчика
title: attrs
summary: Классы без шаблонного кода — предшественник dataclasses.
url: https://github.com/python-attrs/attrs
lang: Python
license: MIT
install: pip install attrs
version: 26.1.0 (PyPI)
level: 3
tags: классы, dataclasses
related: py:topic:dataclasses
## Описание
attrs генерирует __init__, __repr__, сравнение и валидацию атрибутов.
## Для чего
Модели данных.
## Установка
На компьютере: pip install attrs. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:jinja2
kind: project
category: Веб и сеть
title: Jinja2
summary: Шаблонизатор для HTML и текста.
url: https://github.com/pallets/jinja
lang: Python
license: BSD License
install: pip install jinja2
version: 3.1.6 (PyPI)
level: 2
tags: шаблоны, HTML
related: gh:flask
## Описание
Используется во Flask и многих генераторах сайтов.
## Для чего
Генерация HTML-страниц и текстов по шаблонам.
## Установка
На компьютере: pip install jinja2. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:pyyaml
kind: project
category: Инструменты разработчика
title: PyYAML
summary: Чтение и запись YAML.
url: https://github.com/yaml/pyyaml
lang: Python, C
license: MIT
install: pip install pyyaml
version: 6.0.3 (PyPI)
level: 1
tags: YAML, конфигурация
related: lib:json
## Описание
Используйте yaml.safe_load для данных из ненадёжных источников.
## Для чего
Файлы конфигурации.
## Установка
На компьютере: pip install pyyaml. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:loguru
kind: project
category: Инструменты разработчика
title: Loguru
summary: Простое и удобное логирование.
url: https://github.com/Delgan/loguru
lang: Python
license: MIT License
install: pip install loguru
version: 0.7.3 (PyPI)
level: 1
tags: логирование
related: lib:logging
## Описание
Одна готовая к работе функция logger вместо настройки logging.
## Для чего
Логи приложений.
## Установка
На компьютере: pip install loguru. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:djangorestframework
kind: project
category: Веб и сеть
title: Django REST framework
summary: Создание REST API на Django.
url: https://github.com/encode/django-rest-framework
lang: Python
license: BSD-3-Clause
install: pip install djangorestframework
version: 3.18.1 (PyPI)
level: 3
tags: REST API, Django, сериализация
related: gh:django
## Описание
Сериализаторы, представления, аутентификация и браузерная документация API.
## Для чего
API для веб и мобильных приложений.
## Установка
На компьютере: pip install djangorestframework. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:tornado
kind: project
category: Веб и сеть
title: Tornado
summary: Асинхронный веб-фреймворк и сетевой сервер.
url: https://github.com/tornadoweb/tornado
lang: Python
license: Apache-2.0
install: pip install tornado
version: 6.5.10 (PyPI)
level: 4
tags: асинхронный веб-фреймворк, websockets
related: gh:aiohttp
## Описание
Подходит для долгоживущих соединений и веб-сокетов.
## Для чего
Веб-сервисы с большим числом соединений.
## Установка
На компьютере: pip install tornado. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:bottle
kind: project
category: Веб и сеть
title: Bottle
summary: Микрофреймворк в одном файле без зависимостей.
url: https://github.com/bottlepy/bottle
lang: Python
license: MIT
install: pip install bottle
version: 0.13.4 (PyPI)
level: 1
tags: микрофреймворк, один файл
related: gh:flask
## Описание
Маршруты, шаблоны и встроенный сервер.
## Для чего
Маленькие веб-приложения и обучение.
## Установка
На компьютере: pip install bottle. На часах внешние пакеты не устанавливаются — здесь доступен справочник.

# id: gh:python-cpython
kind: project
category: Языки и интерпретаторы
title: CPython
summary: Эталонная реализация языка Python на C.
url: https://github.com/python/cpython
lang: C, Python
license: PSF-2.0
level: 5
tags: интерпретатор, исходный код Python
related: py:cpython:interpreter
## Описание
Исходный код интерпретатора, стандартной библиотеки и документации Python. Именно CPython 3.11 встроен в это приложение (через Chaquopy).
## Для чего
Изучение устройства языка, участие в разработке Python.

# id: gh:thealgorithms-python
kind: project
category: Обучение и алгоритмы
title: TheAlgorithms/Python
summary: Большая коллекция учебных реализаций алгоритмов на Python.
url: https://github.com/TheAlgorithms/Python
lang: Python
license: MIT
level: 2
tags: алгоритмы, структуры данных, учебные реализации
related: algo:sorting
## Описание
Сортировки, поиск, графы, динамическое программирование, математика — с комментариями и тестами.
## Для чего
Изучение алгоритмов, сравнение со своими решениями.

# id: gh:chaquopy
kind: project
category: Языки и интерпретаторы
title: Chaquopy
summary: Python SDK для Android: встраивание интерпретатора в приложение.
url: https://github.com/chaquo/chaquopy
lang: Java, Kotlin, Python
license: MIT
level: 4
tags: Python на Android, Gradle-плагин
related: gh:python-cpython
## Описание
Gradle-плагин собирает CPython и пакеты внутрь APK и даёт API для вызова Python из Kotlin/Java. Это приложение использует Chaquopy для кнопки «Запустить».
## Для чего
Python-код внутри Android-приложений.

