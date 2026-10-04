# id: py:topic:async-await
kind: topic
category: Конкурентность
title: async и await
summary: Сопрограммы: объявление async def, ожидание await, одновременное выполнение задач в одном потоке.
level: advanced
tags: async, await, сопрограмма, корутина, асинхронность
related: py:keyword:async, py:topic:asyncio, py:builtin:aiter
## Идея
Сопрограмма (async def) может приостанавливаться на await, отдавая управление циклу событий, пока ждёт ввода-вывода. Пока одна задача ждёт, выполняются другие — без потоков.
```python
import asyncio
async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} готово"
async def main():
    results = await asyncio.gather(fetch("A", 0.03), fetch("B", 0.01), fetch("C", 0.02))
    print(results)
asyncio.run(main())
```
## Когда полезно
Много одновременных сетевых операций, таймеры, веб-серверы. Для тяжёлых вычислений асинхронность не ускоряет — нужен параллелизм процессов.

# id: py:topic:asyncio
kind: topic
category: Конкурентность
title: Модуль asyncio
summary: Цикл событий, задачи, gather, таймауты, очереди и TaskGroup (3.11).
level: advanced
tags: asyncio, event loop, Task, gather, TaskGroup, Queue, timeout
related: py:topic:async-await, lib:asyncio
## Задачи и группы
```python
import asyncio
async def worker(q, name, out):
    while True:
        item = await q.get()
        out.append((name, item * item))
        q.task_done()
async def main():
    q = asyncio.Queue()
    out = []
    for i in range(5):
        q.put_nowait(i)
    tasks = [asyncio.create_task(worker(q, f"w{k}", out)) for k in range(2)]
    await q.join()
    for t in tasks:
        t.cancel()
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(asyncio.sleep(0.01, result="x"))
    try:
        await asyncio.wait_for(asyncio.sleep(1), timeout=0.01)
    except TimeoutError:
        print("таймаут")
    print(sorted(v for _, v in out), t1.result())
asyncio.run(main())
```

# id: py:topic:threading
kind: topic
category: Конкурентность
title: Потоки (threading)
summary: Потоки для одновременного ожидания ввода-вывода; Lock для общих данных; GIL ограничивает параллельные вычисления.
level: advanced
tags: потоки, threading, Lock, ThreadPoolExecutor, GIL, гонка данных
related: lib:threading, lib:concurrent.futures, py:cpython:gil
## Пример
```python
import threading
from concurrent.futures import ThreadPoolExecutor
counter = 0
lock = threading.Lock()
def add(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1
threads = [threading.Thread(target=add, args=(1000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
with ThreadPoolExecutor(max_workers=3) as ex:
    squares = list(ex.map(lambda x: x * x, range(5)))
print(counter, squares)
```
## GIL
В стандартной сборке CPython одновременно выполняет байт-код только один поток, поэтому потоки ускоряют ожидание (сеть, диск), но не вычисления на чистом Python.

# id: py:topic:multiprocessing
kind: topic
category: Конкурентность
title: Процессы (multiprocessing)
summary: Параллельные вычисления в нескольких процессах; Pool и ProcessPoolExecutor. На Android/часах недоступно.
level: advanced
tags: процессы, multiprocessing, Pool, ProcessPoolExecutor, параллелизм
related: py:topic:threading, lib:concurrent.futures, py:cpython:gil
## Идея
Каждый процесс — отдельный интерпретатор со своим GIL и памятью, поэтому вычисления действительно идут параллельно. Данные передаются сериализацией (pickle).
```python
import os
print(os.cpu_count() is not None)
```
## Пример (на компьютере)
```python norun
from concurrent.futures import ProcessPoolExecutor

def heavy(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    with ProcessPoolExecutor() as ex:
        print(list(ex.map(heavy, [10**6] * 4)))
```
## Ограничения
На Android (и в приложении на часах) модуль multiprocessing не поддерживается: нет нужных системных примитивов. Используйте потоки или asyncio.

# id: py:topic:subprocess
kind: topic
category: Конкурентность
title: Запуск внешних программ (subprocess)
summary: subprocess.run: запуск команд, захват вывода, коды возврата, таймауты, безопасность аргументов.
level: advanced
tags: subprocess, команда, внешняя программа, run, shell
related: lib:subprocess
## Пример
```python
import subprocess, sys
r = subprocess.run([sys.executable, "-c", "print(6 * 7)"], capture_output=True, text=True, timeout=10)
print(r.returncode, r.stdout.strip())
```
## Безопасность
Передавайте аргументы списком и не используйте shell=True с пользовательским вводом — иначе возможна подстановка команд.
## На часах
Приложение на Wear OS не может запускать произвольные программы — используйте встроенные возможности Python.

# id: py:topic:sockets
kind: topic
category: Конкурентность
title: Сокеты и сеть
summary: socket — низкоуровневый сетевой интерфейс: TCP/UDP, клиент и сервер; высокоуровневые модули urllib и http.
level: advanced
tags: socket, TCP, UDP, сеть, клиент, сервер, порт
related: lib:socket, lib:urllib.request, gh:requests
## Локальный пример без интернета
socketpair создаёт два связанных сокета внутри одного процесса.
```python
import socket
a, b = socket.socketpair()
a.sendall("привет".encode())
print(b.recv(1024).decode())
a.close(); b.close()
```
## TCP-сервер (схема)
```python norun
import socket
with socket.create_server(("127.0.0.1", 8000)) as srv:
    conn, addr = srv.accept()
    with conn:
        data = conn.recv(1024)
        conn.sendall(data.upper())
```
## Приложение офлайн
Приложение не использует интернет; сетевые примеры предназначены для изучения на компьютере.

# id: py:topic:memory-management
kind: topic
category: Продвинутое
title: Управление памятью
summary: Объекты в куче, подсчёт ссылок, сборщик циклов, sys.getsizeof, __slots__, генераторы вместо списков.
level: advanced
tags: память, getsizeof, __slots__, подсчёт ссылок, сборка мусора, утечки
related: py:cpython:refcount, py:cpython:gc, lib:sys.getsizeof, lib:tracemalloc
## Размеры объектов
```python
import sys
print(sys.getsizeof(0), sys.getsizeof(10**100), sys.getsizeof([]), sys.getsizeof([0] * 100), sys.getsizeof(range(10**6)))
class P:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y
print(hasattr(P(1, 2), "__dict__"))
```
## Советы
- Генераторы и итераторы вместо больших списков.
- __slots__ для миллионов мелких объектов.
- array/bytearray для больших массивов чисел.
- tracemalloc помогает найти, где выделяется память.
```python
import tracemalloc
tracemalloc.start()
data = [str(i) for i in range(10000)]
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print(current > 0, peak >= current)
```

# id: py:cpython:interpreter
kind: cpython
category: CPython изнутри
title: Интерпретатор CPython
summary: Эталонная реализация Python на C: исходный код → токены → AST → байт-код → виртуальная машина.
level: advanced
tags: CPython, интерпретатор, реализация, конвейер выполнения
related: py:cpython:execution-model, py:cpython:bytecode, py:cpython:ast, gh:python-cpython
## Что такое CPython
Python — язык, CPython — его основная реализация (на C). Другие реализации: PyPy (с JIT), MicroPython (для микроконтроллеров), GraalPy. В это приложение встроен CPython 3.11.
## Конвейер выполнения
1. Токенизатор разбивает текст на токены.
2. Парсер (PEG, с 3.9) строит абстрактное синтаксическое дерево (AST).
3. Компилятор превращает AST в объект кода с байт-кодом.
4. Виртуальная машина (цикл оценки, ceval) выполняет байт-код инструкция за инструкцией.
```python
import sys, platform
print(platform.python_implementation(), sys.version_info[:2], sys.implementation.name)
```

# id: py:cpython:execution-model
kind: cpython
category: CPython изнутри
title: Модель выполнения
summary: Блоки кода, пространства имён, связывание имён, кадры стека; модуль выполняется сверху вниз при импорте.
level: advanced
tags: модель выполнения, пространство имён, связывание, блок кода
related: py:topic:scope, py:cpython:frames
## Основы
Программа строится из блоков кода: модуль, тело функции, определение класса. Каждый блок выполняется в кадре (frame), где хранятся локальные имена. def и class — это исполняемые инструкции: функция создаётся в момент выполнения def.
```python
def make():
    def inner():
        return "создана при вызове make"
    return inner
f = make()
print(f(), f.__qualname__, make.__code__.co_varnames)
```

# id: py:cpython:bytecode
kind: cpython
category: CPython изнутри
title: Байт-код и модуль dis
summary: Инструкции виртуальной машины CPython; dis показывает байт-код функции. Формат меняется между версиями.
level: advanced
tags: байт-код, dis, инструкции, виртуальная машина, code object
related: lib:dis, py:cpython:compiler, py:cpython:interpreter
## Пример (вывод для Python 3.11)
```python
import dis
def add(a, b):
    return a + b
dis.dis(add)
print(add.__code__.co_argcount, add.__code__.co_varnames)
```
## Особенности
Байт-код — деталь реализации: в 3.11 появились специализирующиеся инструкции (адаптивный интерпретатор PEP 659), а набор опкодов меняется от версии к версии. Файлы .pyc в __pycache__ хранят скомпилированный байт-код.

# id: py:cpython:ast
kind: cpython
category: CPython изнутри
title: Абстрактное синтаксическое дерево (AST)
summary: Модуль ast: разбор кода в дерево, обход и анализ, безопасный ast.literal_eval.
level: advanced
tags: AST, ast, синтаксическое дерево, парсер, анализ кода
related: lib:ast, py:cpython:compiler, py:builtin:eval
## Пример
```python
import ast
tree = ast.parse("x = 1 + 2 * y")
print(ast.dump(tree.body[0].value))
names = sorted({n.id for n in ast.walk(tree) if isinstance(n, ast.Name)})
print(names, ast.literal_eval("{'a': [1, 2]}"))
print(ast.unparse(ast.parse("print( 1+2 )")))
```
## Применение
Линтеры, форматтеры и анализаторы кода работают с AST. ast.literal_eval безопасно вычисляет только литералы.

# id: py:cpython:compiler
kind: cpython
category: CPython изнутри
title: Компилятор и объекты кода
summary: compile() превращает исходный текст в code object; константы, имена, оптимизации (сворачивание констант).
level: advanced
tags: компилятор, compile, code object, co_consts, оптимизация
related: py:builtin:eval, py:cpython:bytecode
## Пример
```python
code = compile("x = 2 * 3 * 7", "<demo>", "exec")
print(type(code).__name__, code.co_consts, code.co_names)
ns = {}
exec(code, ns)
print(ns["x"])
```
## Сворачивание констант
Выражение 2 * 3 * 7 вычислено компилятором заранее — в co_consts уже лежит 42.

# id: py:cpython:objects
kind: cpython
category: CPython изнутри
title: Объекты в CPython
summary: Всё — PyObject: тип, счётчик ссылок, значение. id(), type(), изменяемость, кеш маленьких целых и интернирование строк.
level: advanced
tags: PyObject, объект, id, тип, кеш целых, интернирование
related: py:builtin:id, py:cpython:refcount, py:topic:variables
## Устройство
Каждый объект в CPython — структура на C с полем счётчика ссылок и указателем на тип. id(obj) в CPython — адрес объекта в памяти.
```python
a = 256
b = 256
c = int("1000")
d = int("1000")
print(a is b, c is d, c == d)
import sys
s1 = sys.intern("".join(["he", "llo"]))
s2 = sys.intern("hello")
print(s1 is s2)
```
## Важно
Кеш целых чисел от −5 до 256 и интернирование строк — оптимизации CPython, а не гарантия языка. Сравнивайте значения через ==.

# id: py:cpython:refcount
kind: cpython
category: CPython изнутри
title: Подсчёт ссылок
summary: Объект удаляется, когда число ссылок на него становится нулём; sys.getrefcount, weakref.
level: advanced
tags: подсчёт ссылок, reference counting, getrefcount, weakref, del
related: py:cpython:gc, py:topic:memory-management, lib:weakref
## Пример
```python
import sys, weakref
class Node:
    pass
n = Node()
before = sys.getrefcount(n)
alias = n
print(sys.getrefcount(n) - before)
r = weakref.ref(n)
del n, alias
print(r() is None)
```
## Особенности
sys.getrefcount показывает на 1 больше (временная ссылка-аргумент). Слабые ссылки (weakref) не увеличивают счётчик.

# id: py:cpython:gc
kind: cpython
category: CPython изнутри
title: Сборщик мусора для циклов
summary: Модуль gc находит и удаляет циклические ссылки, которые подсчёт ссылок освободить не может; поколения объектов.
level: advanced
tags: сборка мусора, gc, циклические ссылки, поколения
related: py:cpython:refcount, py:topic:memory-management, lib:gc
## Пример
```python
import gc
class Node:
    def __init__(self):
        self.other = None
a, b = Node(), Node()
a.other, b.other = b, a
del a, b
print(gc.collect() >= 2, gc.get_threshold(), gc.isenabled())
```
## Поколения
Объекты делятся на три поколения; молодые проверяются чаще. Сборщик срабатывает, когда число новых объектов превышает порог.

# id: py:cpython:frames
kind: cpython
category: CPython изнутри
title: Кадры стека и traceback
summary: Каждый вызов функции создаёт кадр; inspect и traceback позволяют исследовать стек.
level: advanced
tags: кадр, frame, стек вызовов, traceback, inspect
related: lib:inspect, lib:traceback, err:RecursionError
## Пример
```python
import inspect, traceback
def outer():
    return inner()
def inner():
    return [f.function for f in inspect.stack()[:3]]
print(outer())
try:
    1 / 0
except ZeroDivisionError:
    print(traceback.format_exc().strip().splitlines()[-1])
```

# id: py:cpython:exceptions
kind: cpython
category: CPython изнутри
title: Как работают исключения внутри
summary: «Бесплатный» try (3.11): таблица исключений вместо инструкций входа в блок; распространение по кадрам.
level: advanced
tags: исключения, zero-cost, таблица исключений, распространение
related: py:topic:exceptions, py:cpython:bytecode
## Модель
При возникновении исключения интерпретатор ищет обработчик в текущем кадре; если его нет, кадр завершается и поиск продолжается в вызывающем. С Python 3.11 вход в try ничего не стоит: обработчики описаны таблицей исключений в объекте кода.
```python
def f():
    try:
        return 1 / 0
    except ZeroDivisionError:
        return "обработано"
print(f(), bool(f.__code__.co_exceptiontable))
```

# id: py:cpython:import
kind: cpython
category: CPython изнутри
title: Импорт и кеш байт-кода
summary: Поисковики и загрузчики модулей, sys.meta_path, файлы .pyc в __pycache__.
level: advanced
tags: импорт, meta_path, loader, finder, pyc, __pycache__
related: py:topic:import-system, lib:importlib
## Механизм
import ищет модуль через объекты из sys.meta_path (finders), которые возвращают спецификацию со загрузчиком (loader). Загрузчик выполняет код модуля; скомпилированный байт-код сохраняется в __pycache__/имя.cpython-311.pyc.
```python
import sys, importlib.util
print([type(f).__name__ for f in sys.meta_path][:3])
print(importlib.util.cache_from_source("demo.py"))
```

# id: py:cpython:gil
kind: cpython
category: CPython изнутри
title: GIL — глобальная блокировка интерпретатора
summary: Мьютекс, позволяющий выполнять байт-код только одному потоку; влияние на потоки и альтернативы.
level: advanced
tags: GIL, потоки, параллелизм, free-threading
related: py:topic:threading, py:topic:multiprocessing
## Что это
GIL защищает внутренние структуры CPython (в частности, счётчики ссылок). Потоки переключаются, но байт-код одновременно выполняет только один из них; при ожидании ввода-вывода и в части C-расширений GIL освобождается.
## Следствия
- Потоки ускоряют задачи, где много ожидания (сеть, диск).
- Вычисления на чистом Python в потоках не ускоряются — нужны процессы, NumPy или C-расширения.
## Развитие
С Python 3.13 доступна экспериментальная сборка без GIL (free-threaded, PEP 703); в Python 3.14 она получила статус официально поддерживаемой, но не используется по умолчанию. Встроенный в приложение Python 3.11 работает с GIL.
```python
import sys
print(hasattr(sys, "_is_gil_enabled"))
```

# id: py:cpython:versions
kind: cpython
category: CPython изнутри
title: Важные изменения последних версий Python
summary: Что появилось в 3.8–3.14: моржовый оператор, match, ускорение 3.11, ExceptionGroup, новые f-строки, free-threading и другое.
level: intermediate
tags: версии Python, новые возможности, 3.11, 3.12, 3.13, 3.14, what's new
related: py:keyword:match, py:op:walrus, py:topic:exceptions, py:cpython:gil
## Хронология
- 3.8 — оператор := , позиционные-только параметры (/), f"{x=}".
- 3.9 — операторы | для словарей, str.removeprefix, generic-типы list[int], math.lcm.
- 3.10 — match/case, X | Y в аннотациях, zip(strict=True), itertools.pairwise, более понятные сообщения об ошибках.
- 3.11 — ускорение интерпретатора (адаптивная специализация), ExceptionGroup и except*, tomllib, точные указатели на место ошибки в traceback, лимит в 4300 цифр для int↔str.
- 3.12 — новые возможности f-строк (PEP 701), синтаксис параметров типов def f[T](x: T) (PEP 695), itertools.batched.
- 3.13 — новый интерактивный REPL, экспериментальная сборка без GIL и экспериментальный JIT.
- 3.14 — отложенное вычисление аннотаций (PEP 649), шаблонные строки t"..." (PEP 750), официальная поддержка сборки без GIL.
## Версия на часах
```python
import sys
print(sys.version.split()[0], sys.version_info >= (3, 11))
```
Подробности — в разделах «What's New» официальной документации docs.python.org.
