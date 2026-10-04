# id: lib:math
kind: module
category: Модули стандартной библиотеки
title: math
summary: Математические функции для чисел: корни, степени, логарифмы, тригонометрия, НОД/НОК, факториалы и сочетания.
check: math.sqrt, math.isqrt, math.gcd, math.lcm, math.comb, math.perm, math.factorial, math.prod, math.log, math.floor, math.ceil, math.inf, math.isclose, math.dist
tags: математика, корень, степень, логарифм, синус, НОД, факториал, pi
related: lib:cmath, lib:statistics, algo:arithmetic, algo:gcd-lcm, algo:combinatorics
## Главное
- Константы: pi, e, tau, inf, nan.
- Округление: floor (вниз), ceil (вверх), trunc (к нулю).
- Корни и степени: sqrt (float), isqrt (точный целый корень), pow, exp, log, log2, log10.
- Целочисленные: gcd, lcm, factorial, comb, perm, prod.
- Геометрия: hypot, dist, degrees, radians, sin, cos, tan, atan2.
- Сравнение float: isclose; суммирование без потерь: fsum.
## Пример
```python
import math
print(math.isqrt(10**18 + 5), math.sqrt(2), math.gcd(12, 18, 30), math.lcm(4, 6))
print(math.comb(10, 3), math.perm(5, 2), math.factorial(10), math.prod([1, 2, 3, 4]))
print(math.floor(-2.5), math.ceil(2.1), math.log(8, 2), math.dist((0, 0), (3, 4)))
print(math.isclose(0.1 + 0.2, 0.3), math.fsum([0.1] * 10), math.inf > 10**100)
```
## Олимпиадное применение
isqrt вместо int(sqrt(n)) для больших n, comb для сочетаний, gcd/lcm, точная проверка полного квадрата: math.isqrt(n) ** 2 == n.

# id: lib:collections
kind: module
category: Модули стандартной библиотеки
title: collections
summary: Специализированные контейнеры: deque, Counter, defaultdict, namedtuple, OrderedDict, ChainMap.
check: collections.deque, collections.Counter, collections.defaultdict, collections.namedtuple, collections.OrderedDict, collections.ChainMap
tags: контейнеры, очередь, счётчик, словарь по умолчанию, именованный кортеж
related: py:topic:collections, algo:queue, algo:hashing
## Главное
- deque — очередь/дек с O(1) операциями на концах, rotate, maxlen.
- Counter — подсчёт: most_common, арифметика счётчиков, elements.
- defaultdict(фабрика) — автоматическое значение для новых ключей.
- namedtuple — кортеж с именами полей.
- OrderedDict — move_to_end, popitem(last=False) (LRU-кеш).
- ChainMap — поиск по нескольким словарям сразу.
## Пример
```python
from collections import deque, Counter, defaultdict, namedtuple
q = deque([1, 2, 3], maxlen=5)
q.appendleft(0); q.rotate(-1)
c = Counter("abracadabra")
g = defaultdict(list)
for w in ["ant", "bee", "ape"]:
    g[w[0]].append(w)
P = namedtuple("P", "x y")
print(list(q), c.most_common(2), dict(g), P(1, 2)._asdict())
```
## Олимпиадное применение
deque для BFS, Counter для частот и анаграмм, defaultdict(list) для списков смежности.

# id: lib:itertools
kind: module
category: Модули стандартной библиотеки
title: itertools
summary: Строительные блоки для итераторов: перестановки, сочетания, декартово произведение, накопление, группировка, срезы.
check: itertools.permutations, itertools.combinations, itertools.combinations_with_replacement, itertools.product, itertools.accumulate, itertools.groupby, itertools.chain, itertools.islice, itertools.count, itertools.cycle, itertools.pairwise, itertools.zip_longest, itertools.starmap, itertools.takewhile
tags: перестановки, сочетания, перебор, итераторы, комбинаторика
related: algo:brute-force, algo:combinatorics, py:topic:iterators
## Главное
- Комбинаторика: permutations, combinations, combinations_with_replacement, product.
- Накопление: accumulate (префиксные суммы, максимумы), groupby (группы подряд идущих).
- Объединение и срезы: chain, chain.from_iterable, islice, zip_longest, pairwise (3.10+).
- Бесконечные: count, cycle, repeat.
- Фильтры: takewhile, dropwhile, filterfalse, compress.
## Пример
```python
from itertools import permutations, combinations, product, accumulate, groupby, chain, islice, count, pairwise
print(list(permutations("abc", 2))[:3], list(combinations(range(4), 2))[:3])
print(list(product([0, 1], repeat=2)), list(accumulate([3, 1, 4], max)))
print([(k, len(list(g))) for k, g in groupby("aaabcc")], list(chain([1], (2, 3))))
print(list(islice(count(10, 5), 3)), list(pairwise([1, 4, 9])))
```
## Олимпиадное применение
Перебор вариантов для небольших N, генерация тестов, префиксные суммы.

# id: lib:functools
kind: module
category: Модули стандартной библиотеки
title: functools
summary: Инструменты для функций: кеширование lru_cache/cache, reduce, partial, cmp_to_key, wraps, total_ordering.
check: functools.lru_cache, functools.cache, functools.reduce, functools.partial, functools.cmp_to_key, functools.wraps, functools.total_ordering
tags: кеш, мемоизация, reduce, partial, декоратор
related: py:topic:decorators, algo:dp
## Пример
```python
from functools import lru_cache, reduce, partial, cmp_to_key
@lru_cache(maxsize=None)
def ways(n):
    return 1 if n < 2 else ways(n - 1) + ways(n - 2)
print(ways(80), ways.cache_info().hits > 0)
print(reduce(lambda a, b: a * b, range(1, 6)))
to_int2 = partial(int, base=2)
print(to_int2("1010"))
nums = ["3", "30", "34"]
print(sorted(nums, key=cmp_to_key(lambda a, b: (b + a > a + b) - (b + a < a + b))))
```
## Олимпиадное применение
@lru_cache превращает рекурсию в динамику «сверху вниз». Аргументы функции должны быть хешируемыми.

# id: lib:heapq
kind: module
category: Модули стандартной библиотеки
title: heapq
summary: Двоичная min-куча на обычном списке: heappush, heappop, heapify, nlargest, nsmallest, merge.
check: heapq.heappush, heapq.heappop, heapq.heapify, heapq.heapreplace, heapq.heappushpop, heapq.nlargest, heapq.nsmallest, heapq.merge
tags: куча, приоритетная очередь, минимум, top-k
related: algo:heap, algo:shortest-paths, algo:greedy
## Пример
```python
import heapq
h = [7, 2, 9]
heapq.heapify(h)
heapq.heappush(h, 1)
print(heapq.heappop(h), h[0], heapq.nlargest(2, [5, 1, 8, 3]), list(heapq.merge([1, 4], [2, 3])))
mx = []
for x in [5, 1, 8]:
    heapq.heappush(mx, -x)
print(-mx[0])
```
## Сложность
push/pop — O(log n), heapify — O(n), минимум h[0] — O(1).

# id: lib:bisect
kind: module
category: Модули стандартной библиотеки
title: bisect
summary: Бинарный поиск по отсортированному списку и вставка с сохранением порядка.
check: bisect.bisect_left, bisect.bisect_right, bisect.bisect, bisect.insort, bisect.insort_left
tags: бинарный поиск, отсортированный список, вставка
related: algo:binary-search, task:range-count
## Пример
```python
from bisect import bisect_left, bisect_right, insort
a = [1, 3, 3, 7]
print(bisect_left(a, 3), bisect_right(a, 3), bisect_left(a, 5))
insort(a, 5)
grades = "FDCBA"
print(a, [grades[bisect_right([60, 70, 80, 90], s)] for s in (55, 70, 95)])
print(bisect_left(range(10**18), 10**15, key=lambda x: x))
```
## Особенности
Параметр key появился в Python 3.10. Поиск O(log n), но insort — O(n) из-за вставки.

# id: lib:random
kind: module
category: Модули стандартной библиотеки
title: random
summary: Псевдослучайные числа: randint, random, choice, shuffle, sample, seed; не для криптографии.
check: random.randint, random.random, random.choice, random.choices, random.shuffle, random.sample, random.seed, random.uniform, random.randrange
tags: случайные числа, перемешать, выбрать случайно, генерация тестов
related: lib:secrets, algo:brute-force
## Пример
```python
import random
random.seed(42)
a = list(range(10))
random.shuffle(a)
print(random.randint(1, 6), round(random.random(), 3), random.choice("abc"), a[:3])
print(random.sample(range(100), 3), random.choices("ab", weights=[9, 1], k=5))
```
## Важно
seed делает последовательность воспроизводимой — удобно для генерации тестов. Для паролей и токенов используйте secrets.

# id: lib:statistics
kind: module
category: Модули стандартной библиотеки
title: statistics
summary: Описательная статистика: mean, median, mode, stdev, variance, quantiles.
check: statistics.mean, statistics.median, statistics.mode, statistics.stdev, statistics.pvariance, statistics.quantiles, statistics.fmean
tags: среднее, медиана, мода, дисперсия, отклонение
related: lib:math, ext:numpy
## Пример
```python
import statistics as st
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(st.mean(data), st.median(data), st.mode(data), st.pstdev(data), st.quantiles(data, n=4))
```

# id: lib:decimal
kind: module
category: Модули стандартной библиотеки
title: decimal
summary: Десятичная арифметика с заданной точностью — для денег и точных десятичных расчётов.
check: decimal.Decimal, decimal.getcontext, decimal.ROUND_HALF_UP
tags: десятичные числа, точность, деньги, округление
related: lib:fractions, algo:arithmetic
## Пример
```python
from decimal import Decimal, getcontext, ROUND_HALF_UP
print(Decimal("0.1") + Decimal("0.2"), Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
getcontext().prec = 50
print(Decimal(1) / Decimal(7))
print(Decimal(2).sqrt())
```
## Совет
Создавайте Decimal из строк: Decimal(0.1) переносит погрешность float.

# id: lib:fractions
kind: module
category: Модули стандартной библиотеки
title: fractions
summary: Рациональные числа Fraction: точная арифметика дробей.
check: fractions.Fraction, fractions.Fraction.limit_denominator
tags: дроби, рациональные числа, точные вычисления
related: lib:decimal, task:fraction-class
## Пример
```python
from fractions import Fraction
x = Fraction(1, 3) + Fraction(1, 6)
print(x, x.numerator, x.denominator, float(x), Fraction("0.75"), Fraction(3.14159).limit_denominator(100))
```

# id: lib:operator
kind: module
category: Модули стандартной библиотеки
title: operator
summary: Операторы Python как функции: add, mul, itemgetter, attrgetter, methodcaller.
check: operator.add, operator.mul, operator.itemgetter, operator.attrgetter, operator.methodcaller, operator.xor
tags: операторы как функции, itemgetter, ключ сортировки
related: py:builtin:sorted, lib:functools
## Пример
```python
from operator import itemgetter, attrgetter, mul, xor
from functools import reduce
rows = [("b", 2), ("a", 3), ("c", 1)]
print(sorted(rows, key=itemgetter(1)), reduce(mul, [2, 3, 4]), reduce(xor, [5, 3, 5]))
```

# id: lib:string
kind: module
category: Модули стандартной библиотеки
title: string
summary: Наборы символов (ascii_letters, digits, punctuation) и класс шаблонов Template.
check: string.ascii_lowercase, string.ascii_uppercase, string.digits, string.punctuation, string.Template
tags: алфавит, буквы, цифры, знаки препинания, шаблон
related: py:topic:strings, task:pangram
## Пример
```python
import string
print(string.ascii_lowercase, string.digits, len(string.punctuation))
print(string.Template("Привет, $name!").substitute(name="Ali"))
```

# id: lib:re
kind: module
category: Модули стандартной библиотеки
title: re — регулярные выражения
summary: Поиск и замена по шаблонам: search, match, fullmatch, findall, finditer, sub, split, группы.
check: re.search, re.match, re.fullmatch, re.findall, re.finditer, re.sub, re.split, re.compile, re.IGNORECASE
tags: регулярные выражения, regex, шаблон, поиск, замена
related: task:sum-digits-in-string, task:rle-decode, task:camel-to-snake
## Основы шаблонов
- \d — цифра, \w — буква/цифра/_, \s — пробел; . — любой символ.
- * — 0 и более, + — 1 и более, ? — 0 или 1, {m,n} — от m до n.
- [abc] — набор, [^abc] — кроме, ^ и $ — начало и конец, ( ) — группа, | — или.
## Пример
```python
import re
text = "Оценки: Ali=5, Vali=4; телефон +998 90 123-45-67"
print(re.findall(r"(\w+)=(\d)", text))
print(re.sub(r"\D", "", "+998 90 123-45-67"), re.split(r"[;,]\s*", "a, b;c"))
m = re.search(r"(\d{3})-(\d{2})", text)
print(m.group(0), m.group(1), m.start(), bool(re.fullmatch(r"[A-Z]\w*", "Python")))
```
## Совет
Пишите шаблоны в «сырых» строках r"..." — иначе обратные косые черты придётся удваивать.

# id: lib:datetime
kind: module
category: Модули стандартной библиотеки
title: datetime
summary: Даты и время: date, time, datetime, timedelta, timezone; форматирование и разбор.
check: datetime.date, datetime.datetime, datetime.timedelta, datetime.timezone, datetime.datetime.strptime, datetime.date.fromisoformat
tags: дата, время, разница дат, день недели, формат даты
related: task:days-between, task:weekday, lib:time, lib:calendar, lib:zoneinfo
## Пример
```python
from datetime import date, datetime, timedelta
d = date(2026, 10, 4)
print(d.weekday(), d.isoformat(), d + timedelta(days=100), (date(2027, 1, 1) - d).days)
dt = datetime.strptime("04.10.2026 18:30", "%d.%m.%Y %H:%M")
print(dt.strftime("%Y-%m-%d %H:%M"), dt.hour, date.fromisoformat("2024-02-29").isoformat())
```
## Форматы
%Y год, %m месяц, %d день, %H часы, %M минуты, %S секунды, %A день недели, %j день года.

# id: lib:time
kind: module
category: Модули стандартной библиотеки
title: time
summary: Время системы, паузы и замеры: time, sleep, perf_counter, monotonic, strftime.
check: time.time, time.sleep, time.perf_counter, time.monotonic, time.strftime, time.gmtime
tags: время, задержка, замер времени, таймер
related: lib:datetime, lib:timeit
## Пример
```python
import time
t0 = time.perf_counter()
sum(range(10**5))
print(time.perf_counter() - t0 > 0, time.strftime("%Y", time.gmtime(0)))
```
## Совет
Для измерения длительности используйте perf_counter, а не time.time.

# id: lib:calendar
kind: module
category: Модули стандартной библиотеки
title: calendar
summary: Календари: високосные годы, дни недели, число дней в месяце, текстовый календарь.
check: calendar.isleap, calendar.monthrange, calendar.weekday, calendar.month
tags: календарь, високосный год, дни в месяце
related: lib:datetime, task:leap-year
## Пример
```python
import calendar
print(calendar.isleap(2024), calendar.monthrange(2026, 2), calendar.weekday(2026, 10, 4), calendar.leapdays(2000, 2100))
```

# id: lib:pathlib
kind: module
category: Модули стандартной библиотеки
title: pathlib
summary: Объектно-ориентированные пути к файлам: Path, /, exists, glob, read_text, write_text, mkdir.
check: pathlib.Path, pathlib.Path.read_text, pathlib.Path.write_text, pathlib.Path.glob, pathlib.Path.mkdir, pathlib.Path.exists
tags: пути, файлы, папки, Path, расширение файла
related: py:topic:files, lib:os, lib:shutil
## Пример
```python
from pathlib import Path
import tempfile
root = Path(tempfile.mkdtemp())
(root / "src").mkdir()
(root / "src" / "main.py").write_text("print('hi')\n", encoding="utf-8")
p = root / "src" / "main.py"
print(p.name, p.stem, p.suffix, p.parent.name, p.exists(), [x.name for x in root.rglob("*.py")])
```

# id: lib:os
kind: module
category: Модули стандартной библиотеки
title: os и os.path
summary: Взаимодействие с операционной системой: файлы и папки, переменные окружения, пути, процессы.
check: os.listdir, os.getcwd, os.makedirs, os.remove, os.environ, os.path.join, os.path.exists, os.path.splitext, os.walk, os.cpu_count
tags: операционная система, файлы, папки, окружение, пути
related: lib:pathlib, lib:shutil, lib:sys
## Пример
```python
import os, tempfile
d = tempfile.mkdtemp()
os.makedirs(os.path.join(d, "a", "b"))
open(os.path.join(d, "a", "x.txt"), "w").close()
print(sorted(os.listdir(os.path.join(d, "a"))), os.path.splitext("photo.jpg"), os.sep)
print([len(files) for _, _, files in os.walk(d)], "PATH" in os.environ or True)
```

# id: lib:sys
kind: module
category: Модули стандартной библиотеки
title: sys
summary: Параметры интерпретатора: argv, stdin/stdout, path, версия, лимит рекурсии, выход из программы.
check: sys.argv, sys.stdin, sys.stdout, sys.path, sys.version_info, sys.setrecursionlimit, sys.getsizeof, sys.exit, sys.maxsize, sys.set_int_max_str_digits
tags: интерпретатор, ввод, вывод, рекурсия, версия Python
related: lib:sys.stdin, py:topic:recursion, err:ValueError-int-digits
## Пример
```python
import sys
print(sys.version_info[:2] >= (3, 11), sys.maxsize == 2**63 - 1, sys.getrecursionlimit())
sys.setrecursionlimit(5000)
sys.stdout.write("через sys.stdout\n")
print(sys.getsizeof([]) > 0, type(sys.argv).__name__)
```
## Олимпиадное применение
sys.stdin.readline / sys.stdin.read для быстрого ввода, sys.setrecursionlimit для глубокой рекурсии, sys.set_int_max_str_digits для печати огромных чисел.

# id: lib:sys.stdin
kind: member
category: sys
title: sys.stdin
summary: Стандартный ввод как файловый объект: read(), readline(), построчный перебор.
tags: стандартный ввод, быстрый ввод, readline, read
related: py:builtin:input, py:topic:print-input, err:EOFError
## Пример
```python
import io, sys
sys.stdin = io.StringIO("3\n1 2 3\nlast\n")
n = int(sys.stdin.readline())
nums = list(map(int, sys.stdin.readline().split()))
rest = [line.strip() for line in sys.stdin]
print(n, nums, rest)
```
## Совет
sys.stdin.readline() оставляет символ \n в конце строки — используйте strip() или split().

# id: lib:shutil
kind: module
category: Модули стандартной библиотеки
title: shutil
summary: Операции высокого уровня с файлами: копирование, перемещение, удаление деревьев, архивы.
check: shutil.copy, shutil.copytree, shutil.move, shutil.rmtree, shutil.make_archive, shutil.disk_usage, shutil.which
tags: копирование файлов, удалить папку, архив, перемещение
related: lib:os, lib:pathlib
## Пример
```python
import shutil, tempfile, os
src = tempfile.mkdtemp()
open(os.path.join(src, "a.txt"), "w").write("hi")
dst = os.path.join(tempfile.mkdtemp(), "copy")
shutil.copytree(src, dst)
print(os.listdir(dst), shutil.disk_usage(dst).total > 0)
shutil.rmtree(dst)
print(os.path.exists(dst))
```

# id: lib:glob
kind: module
category: Модули стандартной библиотеки
title: glob
summary: Поиск файлов по шаблону с * ? и **.
check: glob.glob, glob.iglob
tags: шаблон имени файла, поиск файлов, маска
related: lib:pathlib, lib:fnmatch
## Пример
```python
import glob, os, tempfile
d = tempfile.mkdtemp()
for n in ["a.py", "b.py", "c.txt"]:
    open(os.path.join(d, n), "w").close()
print(sorted(os.path.basename(p) for p in glob.glob(os.path.join(d, "*.py"))))
```

# id: lib:tempfile
kind: module
category: Модули стандартной библиотеки
title: tempfile
summary: Временные файлы и папки, которые удобно создавать и удалять безопасно.
check: tempfile.TemporaryDirectory, tempfile.NamedTemporaryFile, tempfile.mkdtemp, tempfile.gettempdir
tags: временный файл, временная папка
related: lib:pathlib, err:PermissionError
## Пример
```python
import tempfile, os
with tempfile.TemporaryDirectory() as d:
    path = os.path.join(d, "x.txt")
    with open(path, "w") as f:
        f.write("data")
    print(os.path.getsize(path))
print(os.path.exists(path))
```

# id: lib:json
kind: module
category: Модули стандартной библиотеки
title: json
summary: Чтение и запись JSON: loads/dumps для строк, load/dump для файлов.
check: json.loads, json.dumps, json.load, json.dump, json.JSONDecodeError
tags: json, сериализация, api, конфигурация
related: task:json-sum, py:topic:files
## Пример
```python
import json
data = {"name": "Ali", "langs": ["Python", "Kotlin"], "age": 15, "admin": False, "note": None}
s = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True)
print(s.splitlines()[1], json.loads(s) == data)
try:
    json.loads("{'bad': 1}")
except json.JSONDecodeError as e:
    print("ошибка JSON:", e.msg)
```
## Соответствие типов
dict ↔ объект, list ↔ массив, str, int/float, True/False ↔ true/false, None ↔ null. Кортежи становятся массивами.

# id: lib:csv
kind: module
category: Модули стандартной библиотеки
title: csv
summary: Чтение и запись CSV с правильной обработкой кавычек и разделителей; DictReader/DictWriter.
check: csv.reader, csv.writer, csv.DictReader, csv.DictWriter
tags: csv, таблица, excel, разделитель
related: task:csv-report, ext:pandas
## Пример
```python
import csv, io
text = 'name,city\n"Ali, Jr.",Tashkent\nOla,Moscow\n'
for row in csv.DictReader(io.StringIO(text)):
    print(row["name"], "|", row["city"])
out = io.StringIO()
w = csv.writer(out, delimiter=";")
w.writerow(["a", "b;c"])
print(out.getvalue().strip())
```
## Совет
Открывайте CSV-файлы с параметром newline="" — так рекомендует документация модуля.

# id: lib:sqlite3
kind: module
category: Модули стандартной библиотеки
title: sqlite3
summary: Встроенная база данных SQLite: подключение, SQL-запросы, параметры, транзакции.
check: sqlite3.connect, sqlite3.Row
tags: база данных, sql, sqlite, таблица
related: ext:sqlalchemy
## Пример
```python
import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE users(name TEXT, age INT)")
con.executemany("INSERT INTO users VALUES (?, ?)", [("Ali", 15), ("Ola", 17), ("Vali", 16)])
print(con.execute("SELECT name FROM users WHERE age >= ? ORDER BY age DESC", (16,)).fetchall())
print(con.execute("SELECT COUNT(*), AVG(age) FROM users").fetchone())
con.close()
```
## Безопасность
Всегда передавайте значения через параметры (?), а не через форматирование строки — иначе возможна SQL-инъекция. Это приложение тоже хранит свои базы знаний в SQLite.

# id: lib:pickle
kind: module
category: Модули стандартной библиотеки
title: pickle
summary: Сериализация объектов Python в байты и обратно. Не загружайте pickle из недоверенных источников.
check: pickle.dumps, pickle.loads, pickle.dump, pickle.load
tags: сериализация, сохранить объект, байты
related: lib:json, lib:copy
## Пример
```python
import pickle
data = {"set": {1, 2}, "tuple": (1, "a"), "nested": [[1], [2]]}
b = pickle.dumps(data)
print(type(b).__name__, pickle.loads(b) == data)
```
## Безопасность
pickle.loads может выполнить произвольный код — используйте его только для своих данных. Для обмена данными предпочтителен JSON.

# id: lib:hashlib
kind: module
category: Модули стандартной библиотеки
title: hashlib
summary: Криптографические хеш-функции: sha256, sha1, md5, blake2 и другие.
check: hashlib.sha256, hashlib.md5, hashlib.blake2b, hashlib.new, hashlib.pbkdf2_hmac
tags: хеш, sha256, md5, контрольная сумма
related: lib:hmac, lib:secrets
## Пример
```python
import hashlib
h = hashlib.sha256("привет".encode("utf-8")).hexdigest()
print(h[:16], len(h), hashlib.md5(b"abc").hexdigest()[:8])
```
## Важно
Пароли нельзя хранить простым хешем — используйте медленные функции с солью (hashlib.pbkdf2_hmac, scrypt).

# id: lib:secrets
kind: module
category: Модули стандартной библиотеки
title: secrets
summary: Криптографически стойкие случайные значения: токены, пароли, выбор.
check: secrets.token_hex, secrets.token_urlsafe, secrets.choice, secrets.randbelow
tags: безопасный случайный, токен, пароль
related: lib:random, lib:hashlib
## Пример
```python
import secrets, string
alphabet = string.ascii_letters + string.digits
password = "".join(secrets.choice(alphabet) for _ in range(12))
print(len(password), len(secrets.token_hex(16)), 0 <= secrets.randbelow(10) < 10)
```

# id: lib:hmac
kind: module
category: Модули стандартной библиотеки
title: hmac
summary: Коды аутентификации сообщений с ключом (HMAC) и безопасное сравнение строк.
check: hmac.new, hmac.compare_digest
tags: подпись, ключ, аутентификация сообщения
related: lib:hashlib
## Пример
```python
import hmac, hashlib
sig = hmac.new(b"secret-key", b"message", hashlib.sha256).hexdigest()
print(len(sig), hmac.compare_digest(sig, sig))
```

# id: lib:logging
kind: module
category: Модули стандартной библиотеки
title: logging
summary: Журналирование: уровни DEBUG/INFO/WARNING/ERROR, форматирование, обработчики, логгеры по модулям.
check: logging.getLogger, logging.basicConfig, logging.StreamHandler, logging.Formatter, logging.INFO
tags: логи, журнал, отладка, уровни логирования
related: gh:loguru, lib:warnings
## Пример
```python
import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s", force=True)
log = logging.getLogger("app")
log.debug("не видно")
log.info("запуск, версия %s", "1.0")
log.warning("мало памяти")
```

# id: lib:argparse
kind: module
category: Модули стандартной библиотеки
title: argparse
summary: Разбор аргументов командной строки: позиционные, опции, типы, справка.
check: argparse.ArgumentParser, argparse.ArgumentParser.add_argument, argparse.ArgumentParser.parse_args
tags: командная строка, аргументы, cli, опции
related: gh:click, gh:typer
## Пример
```python
import argparse
p = argparse.ArgumentParser(description="Демо")
p.add_argument("n", type=int)
p.add_argument("--mode", choices=["fast", "slow"], default="fast")
p.add_argument("-v", "--verbose", action="store_true")
args = p.parse_args(["10", "--mode", "slow", "-v"])
print(args.n * 2, args.mode, args.verbose)
```

# id: lib:urllib
kind: module
category: Модули стандартной библиотеки
title: urllib
summary: Работа с URL: разбор и сборка адресов (urllib.parse), HTTP-запросы (urllib.request).
check: urllib.parse.urlparse, urllib.parse.urlencode, urllib.parse.quote, urllib.request.urlopen, urllib.request.Request
tags: url, адрес, http, запрос, кодирование параметров
related: ext:requests, lib:http
## Пример (без сети)
```python
from urllib.parse import urlparse, urlencode, quote, parse_qs
u = urlparse("https://example.com/search?q=python&page=2#top")
print(u.scheme, u.netloc, u.path, parse_qs(u.query), u.fragment)
print(urlencode({"q": "питон 3", "n": 5}), quote("a b/c"))
```
## Запрос (нужен интернет)
```python norun
from urllib.request import urlopen
with urlopen("https://www.python.org", timeout=10) as r:
    print(r.status, len(r.read()))
```

# id: lib:http
kind: module
category: Модули стандартной библиотеки
title: http
summary: HTTP-протокол: коды статусов (HTTPStatus), клиент http.client, простой сервер http.server.
check: http.HTTPStatus, http.client.HTTPConnection, http.server.HTTPServer, http.server.SimpleHTTPRequestHandler
tags: http, коды ответа, веб-сервер, 404
related: lib:urllib, ext:requests
## Пример
```python
from http import HTTPStatus
print(HTTPStatus.NOT_FOUND.value, HTTPStatus.NOT_FOUND.phrase, HTTPStatus(200).name)
```
## Простой сервер (на компьютере)
python -m http.server 8000 — раздаёт файлы текущей папки по адресу http://localhost:8000.

# id: lib:email
kind: module
category: Модули стандартной библиотеки
title: email
summary: Создание и разбор электронных писем: EmailMessage, заголовки, вложения; отправка — через smtplib.
check: email.message.EmailMessage, email.message_from_string, smtplib.SMTP
tags: email, письмо, вложение, smtp
related: lib:smtplib
## Пример
```python
from email.message import EmailMessage
msg = EmailMessage()
msg["Subject"] = "Привет"
msg["From"] = "me@example.com"
msg["To"] = "you@example.com"
msg.set_content("Текст письма")
msg.add_attachment(b"data", maintype="application", subtype="octet-stream", filename="a.bin")
print(msg["Subject"], msg.is_multipart(), [p.get_filename() for p in msg.iter_attachments()])
```

# id: lib:unittest
kind: module
category: Модули стандартной библиотеки
title: unittest
summary: Встроенный фреймворк тестирования: TestCase, assert-методы, setUp, mock.
check: unittest.TestCase, unittest.main, unittest.mock.Mock, unittest.mock.patch
tags: тесты, unit test, assertEqual, mock
related: py:topic:testing, ext:pytest
## Пример
```python
import unittest
from unittest.mock import Mock
class T(unittest.TestCase):
    def setUp(self):
        self.data = [3, 1, 2]
    def test_sorted(self):
        self.assertEqual(sorted(self.data), [1, 2, 3])
    def test_raises(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0
r = unittest.TextTestRunner(verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
m = Mock(return_value=42)
print(r.wasSuccessful(), m(1), m.call_count)
```

# id: lib:dataclasses
kind: module
category: Модули стандартной библиотеки
title: dataclasses
summary: Декоратор @dataclass и функции field, asdict, replace для классов-«записей».
check: dataclasses.dataclass, dataclasses.field, dataclasses.asdict, dataclasses.replace
tags: dataclass, классы данных, запись
related: py:topic:dataclasses
## Пример
```python
from dataclasses import dataclass, field, replace, asdict
@dataclass
class Config:
    name: str
    retries: int = 3
    tags: list = field(default_factory=list)
c = Config("app")
print(c, replace(c, retries=5).retries, asdict(c))
```

# id: lib:typing
kind: module
category: Модули стандартной библиотеки
title: typing
summary: Средства аннотаций типов: Optional, Union, Callable, TypeVar, Protocol, Literal, TypedDict.
check: typing.Optional, typing.Callable, typing.TypeVar, typing.Protocol, typing.Literal, typing.TypedDict, typing.NamedTuple
tags: аннотации, типы, type hints
related: py:topic:typing
## Пример
```python
from typing import Literal, TypedDict, NamedTuple
class User(TypedDict):
    name: str
    age: int
class Pt(NamedTuple):
    x: int
    y: int = 0
def move(direction: Literal["up", "down"]) -> int:
    return 1 if direction == "up" else -1
u: User = {"name": "Ali", "age": 15}
print(move("up"), Pt(3), u["name"])
```

# id: lib:enum
kind: module
category: Модули стандартной библиотеки
title: enum
summary: Перечисления: Enum, IntEnum, Flag, auto — именованные константы.
check: enum.Enum, enum.IntEnum, enum.Flag, enum.auto
tags: перечисление, константы, enum
related: lib:typing
## Пример
```python
from enum import Enum, Flag, auto
class Color(Enum):
    RED = auto()
    GREEN = auto()
class Perm(Flag):
    R = auto()
    W = auto()
    X = auto()
print(Color.RED, Color["GREEN"].value, [c.name for c in Color], Perm.R | Perm.W, Perm.W in (Perm.R | Perm.W))
```

# id: lib:abc
kind: module
category: Модули стандартной библиотеки
title: abc
summary: Абстрактные базовые классы: ABC и @abstractmethod.
check: abc.ABC, abc.abstractmethod, abc.ABCMeta
tags: абстрактный класс, интерфейс
related: py:topic:abstraction
## Пример
```python
from abc import ABC, abstractmethod
class Shape(ABC):
    @abstractmethod
    def area(self): ...
class Sq(Shape):
    def __init__(self, a):
        self.a = a
    def area(self):
        return self.a ** 2
print(Sq(3).area(), Shape.__abstractmethods__)
```

# id: lib:copy
kind: module
category: Модули стандартной библиотеки
title: copy
summary: Поверхностное (copy) и глубокое (deepcopy) копирование объектов.
check: copy.copy, copy.deepcopy
tags: копия, глубокая копия, клонировать
related: py:method:list.copy, py:topic:variables
## Пример
```python
import copy
a = {"list": [1, 2], "n": 1}
b = copy.copy(a)
c = copy.deepcopy(a)
a["list"].append(3)
print(b["list"], c["list"])
```

# id: lib:pprint
kind: module
category: Модули стандартной библиотеки
title: pprint
summary: «Красивый» вывод вложенных структур данных.
check: pprint.pprint, pprint.pformat
tags: красивый вывод, форматирование структур
related: lib:json
## Пример
```python
from pprint import pprint
data = {"users": [{"name": "Ali", "langs": ["python", "kotlin"]}, {"name": "Ola", "langs": []}], "total": 2}
pprint(data, width=50, sort_dicts=False)
```

# id: lib:inspect
kind: module
category: Модули стандартной библиотеки
title: inspect
summary: Исследование живых объектов: сигнатуры функций, исходный код, члены классов, стек.
check: inspect.signature, inspect.getmembers, inspect.isfunction, inspect.getsource, inspect.stack
tags: интроспекция, сигнатура, исходный код, рефлексия
related: py:cpython:frames, py:builtin:dir
## Пример
```python
import inspect
def f(a, b=2, *args, c, **kw):
    pass
sig = inspect.signature(f)
print(sig, [p.kind.name for p in sig.parameters.values()][:3], inspect.isfunction(f))
```

# id: lib:contextlib
kind: module
category: Модули стандартной библиотеки
title: contextlib
summary: Утилиты для менеджеров контекста: contextmanager, suppress, closing, redirect_stdout, ExitStack.
check: contextlib.contextmanager, contextlib.suppress, contextlib.redirect_stdout, contextlib.ExitStack, contextlib.closing
tags: with, менеджер контекста, подавить исключение, перенаправить вывод
related: py:topic:context-managers
## Пример
```python
import io
from contextlib import redirect_stdout, suppress
buf = io.StringIO()
with redirect_stdout(buf):
    print("перехвачено")
with suppress(KeyError):
    {}["нет"]
print(repr(buf.getvalue()))
```

# id: lib:threading
kind: module
category: Модули стандартной библиотеки
title: threading
summary: Потоки: Thread, Lock, Event, Semaphore, Timer; потокобезопасность общих данных.
check: threading.Thread, threading.Lock, threading.Event, threading.Semaphore, threading.current_thread
tags: потоки, блокировка, синхронизация
related: py:topic:threading, lib:concurrent.futures, lib:queue
## Пример
```python
import threading
done = threading.Event()
result = []
def worker():
    result.append(threading.current_thread().name)
    done.set()
t = threading.Thread(target=worker, name="рабочий")
t.start()
done.wait(1)
t.join()
print(result)
```

# id: lib:concurrent.futures
kind: module
category: Модули стандартной библиотеки
title: concurrent.futures
summary: Пулы потоков и процессов с единым интерфейсом: submit, map, as_completed.
check: concurrent.futures.ThreadPoolExecutor, concurrent.futures.ProcessPoolExecutor, concurrent.futures.as_completed
tags: пул потоков, параллельно, future
related: py:topic:threading, py:topic:multiprocessing
## Пример
```python
from concurrent.futures import ThreadPoolExecutor, as_completed
def square(x):
    return x * x
with ThreadPoolExecutor(max_workers=4) as ex:
    futures = [ex.submit(square, i) for i in range(5)]
    print(sorted(f.result() for f in as_completed(futures)), list(ex.map(square, [7, 8])))
```

# id: lib:queue
kind: module
category: Модули стандартной библиотеки
title: queue
summary: Потокобезопасные очереди: Queue (FIFO), LifoQueue, PriorityQueue.
check: queue.Queue, queue.LifoQueue, queue.PriorityQueue
tags: очередь между потоками, производитель потребитель
related: lib:threading, lib:collections
## Пример
```python
import queue
pq = queue.PriorityQueue()
for p, task in [(2, "b"), (1, "a"), (3, "c")]:
    pq.put((p, task))
print([pq.get()[1] for _ in range(3)])
```
## Совет
В однопоточных алгоритмах используйте collections.deque и heapq — они быстрее.

# id: lib:graphlib
kind: module
category: Модули стандартной библиотеки
title: graphlib
summary: Топологическая сортировка графа зависимостей (TopologicalSorter), Python 3.9+.
check: graphlib.TopologicalSorter, graphlib.CycleError
tags: топологическая сортировка, зависимости, DAG
related: algo:topological-sort, task:topo-sort
## Пример
```python
from graphlib import TopologicalSorter, CycleError
deps = {"test": {"build"}, "build": {"fetch"}, "deploy": {"test", "build"}}
print(list(TopologicalSorter(deps).static_order()))
try:
    list(TopologicalSorter({"a": {"b"}, "b": {"a"}}).static_order())
except CycleError:
    print("цикл")
```

# id: lib:timeit
kind: module
category: Модули стандартной библиотеки
title: timeit
summary: Точный замер времени выполнения небольших фрагментов кода.
check: timeit.timeit, timeit.repeat, timeit.default_timer
tags: замер времени, бенчмарк, скорость
related: lib:time, algo:complexity
## Пример
```python
import timeit
t_list = timeit.timeit("x in data", setup="data = list(range(1000)); x = 999", number=2000)
t_set = timeit.timeit("x in data", setup="data = set(range(1000)); x = 999", number=2000)
print(t_set < t_list)
```

# id: lib:textwrap
kind: module
category: Модули стандартной библиотеки
title: textwrap
summary: Перенос и выравнивание текста: wrap, fill, dedent, indent, shorten.
check: textwrap.wrap, textwrap.fill, textwrap.dedent, textwrap.shorten, textwrap.indent
tags: перенос строк, ширина текста, отступы
related: py:topic:strings
## Пример
```python
import textwrap
text = "Python — язык программирования с простым и понятным синтаксисом."
print(textwrap.wrap(text, width=25))
print(textwrap.shorten(text, width=30, placeholder="…"))
```

# id: lib:difflib
kind: module
category: Модули стандартной библиотеки
title: difflib
summary: Сравнение последовательностей: похожие строки, коэффициент сходства, diff двух текстов.
check: difflib.SequenceMatcher, difflib.get_close_matches, difflib.unified_diff
tags: похожие слова, сравнение текстов, diff, опечатки
related: algo:lcs
## Пример
```python
import difflib
print(difflib.get_close_matches("pritn", ["print", "input", "sprint"]))
print(round(difflib.SequenceMatcher(None, "kitten", "sitting").ratio(), 2))
print("".join(difflib.unified_diff(["a\n", "b\n"], ["a\n", "c\n"])).splitlines()[-2:])
```

# id: lib:unicodedata
kind: module
category: Модули стандартной библиотеки
title: unicodedata
summary: Свойства символов Unicode: имена, категории, нормализация.
check: unicodedata.name, unicodedata.category, unicodedata.normalize
tags: unicode, символы, нормализация, ё
related: py:topic:strings
## Пример
```python
import unicodedata
print(unicodedata.name("Ё"), unicodedata.category("5"), len(unicodedata.normalize("NFD", "й")))
```

# id: lib:zoneinfo
kind: module
category: Модули стандартной библиотеки
title: zoneinfo
summary: Часовые пояса IANA (Python 3.9+): ZoneInfo("Europe/Moscow").
check: zoneinfo.ZoneInfo, zoneinfo.available_timezones
tags: часовой пояс, timezone, время в городе
related: lib:datetime
## Пример
```python
from datetime import datetime, timezone
try:
    from zoneinfo import ZoneInfo
    t = datetime(2026, 10, 4, 12, 0, tzinfo=timezone.utc).astimezone(ZoneInfo("Asia/Tashkent"))
    print(t.hour)
except Exception as e:
    print("нет базы часовых поясов:", type(e).__name__)
```
## Особенности
Нужна системная база часовых поясов (или пакет tzdata). На некоторых устройствах её может не быть — тогда используйте фиксированные смещения timezone(timedelta(hours=5)).

# id: lib:tomllib
kind: module
category: Модули стандартной библиотеки
title: tomllib
summary: Чтение файлов TOML (Python 3.11+), например pyproject.toml.
check: tomllib.loads, tomllib.load
tags: toml, конфигурация, pyproject
related: py:topic:packaging
## Пример
```python
import tomllib
cfg = tomllib.loads('title = "demo"\n[server]\nport = 8080\nhosts = ["a", "b"]\n')
print(cfg["title"], cfg["server"]["port"], cfg["server"]["hosts"])
```

# id: lib:uuid
kind: module
category: Модули стандартной библиотеки
title: uuid
summary: Уникальные идентификаторы UUID: uuid4 (случайный), uuid5 (по имени).
check: uuid.uuid4, uuid.uuid5, uuid.UUID
tags: уникальный идентификатор, uuid
related: lib:secrets
## Пример
```python
import uuid
u = uuid.uuid4()
print(len(str(u)), u.version, uuid.uuid5(uuid.NAMESPACE_DNS, "python.org") == uuid.uuid5(uuid.NAMESPACE_DNS, "python.org"))
```

# id: lib:base64
kind: module
category: Модули стандартной библиотеки
title: base64
summary: Кодирование двоичных данных текстом: Base64, Base32, Base16, URL-safe варианты.
check: base64.b64encode, base64.b64decode, base64.urlsafe_b64encode
tags: base64, кодирование, двоичные данные
related: py:builtin:bytes
## Пример
```python
import base64
enc = base64.b64encode("Привет".encode())
print(enc, base64.b64decode(enc).decode())
```

# id: lib:struct
kind: module
category: Модули стандартной библиотеки
title: struct
summary: Упаковка чисел в байты и распаковка по формату (двоичные протоколы и файлы).
check: struct.pack, struct.unpack, struct.calcsize
tags: байты, двоичный формат, упаковка
related: py:builtin:bytes, py:method:int.bit_length
## Пример
```python
import struct
data = struct.pack("<hIf", -2, 70000, 1.5)
print(len(data), struct.unpack("<hIf", data), struct.calcsize("<hIf"))
```

# id: lib:io
kind: module
category: Модули стандартной библиотеки
title: io
summary: Потоки ввода-вывода: StringIO и BytesIO — «файлы» в памяти; классы файловых объектов.
check: io.StringIO, io.BytesIO, io.TextIOWrapper
tags: файл в памяти, StringIO, BytesIO, поток
related: py:topic:files, lib:sys.stdin
## Пример
```python
import io
f = io.StringIO()
f.write("строка 1\n")
print("строка 2", file=f)
print(f.getvalue().splitlines(), io.BytesIO(b"abc").read(2))
```
## Применение
StringIO подменяет sys.stdin при тестировании программ, которые читают ввод.

# id: lib:traceback
kind: module
category: Модули стандартной библиотеки
title: traceback
summary: Получение и форматирование трассировки стека исключений.
check: traceback.format_exc, traceback.print_exc, traceback.extract_tb
tags: трассировка, стек ошибок, отладка
related: py:topic:exceptions, py:cpython:frames
## Пример
```python
import traceback
try:
    {}["x"]
except KeyError:
    lines = traceback.format_exc().strip().splitlines()
    print(lines[0], "...", lines[-1])
```

# id: lib:warnings
kind: module
category: Модули стандартной библиотеки
title: warnings
summary: Предупреждения: warn, фильтры, превращение предупреждений в ошибки.
check: warnings.warn, warnings.filterwarnings, warnings.catch_warnings
tags: предупреждение, deprecation, устаревшее
related: lib:logging
## Пример
```python
import warnings
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    warnings.warn("функция устарела", DeprecationWarning)
print(caught[0].category.__name__, str(caught[0].message))
```

# id: lib:gc
kind: module
category: Модули стандартной библиотеки
title: gc
summary: Управление сборщиком мусора: collect, enable/disable, пороги, отладка утечек.
check: gc.collect, gc.disable, gc.enable, gc.get_threshold, gc.get_count
tags: сборщик мусора, память, циклические ссылки
related: py:cpython:gc
## Пример
```python
import gc
print(gc.isenabled(), len(gc.get_threshold()), gc.collect() >= 0)
```

# id: lib:weakref
kind: module
category: Модули стандартной библиотеки
title: weakref
summary: Слабые ссылки, не продлевающие жизнь объекта: ref, WeakValueDictionary, finalize.
check: weakref.ref, weakref.WeakValueDictionary, weakref.finalize
tags: слабая ссылка, кеш, память
related: py:cpython:refcount
## Пример
```python
import weakref
class Big:
    pass
b = Big()
cache = weakref.WeakValueDictionary()
cache["k"] = b
print("k" in cache)
del b
print("k" in cache)
```

# id: lib:dis
kind: module
category: Модули стандартной библиотеки
title: dis
summary: Дизассемблер байт-кода CPython.
check: dis.dis, dis.get_instructions, dis.Bytecode
tags: байт-код, дизассемблер
related: py:cpython:bytecode
## Пример
```python
import dis
print([ins.opname for ins in dis.get_instructions(lambda x: x * 2)])
```

# id: lib:ast
kind: module
category: Модули стандартной библиотеки
title: ast
summary: Абстрактное синтаксическое дерево Python: parse, dump, walk, literal_eval, unparse.
check: ast.parse, ast.dump, ast.walk, ast.literal_eval, ast.unparse, ast.NodeVisitor
tags: синтаксическое дерево, разбор кода, литералы
related: py:cpython:ast
## Пример
```python
import ast
tree = ast.parse("def f(a, b):\n    return a + b\n")
print([type(n).__name__ for n in ast.walk(tree)][:4], ast.literal_eval("(1, [2, 3])"))
```

# id: lib:tracemalloc
kind: module
category: Модули стандартной библиотеки
title: tracemalloc
summary: Трассировка выделения памяти Python: текущий и пиковый объём, где выделяется память.
check: tracemalloc.start, tracemalloc.stop, tracemalloc.get_traced_memory, tracemalloc.take_snapshot
tags: память, профилирование памяти, утечки
related: py:topic:memory-management, lib:gc
## Пример
```python
import tracemalloc
tracemalloc.start()
data = [bytes(1000) for _ in range(100)]
cur, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print(cur >= 100_000, peak >= cur)
```

# id: lib:subprocess
kind: module
category: Модули стандартной библиотеки
title: subprocess
summary: Запуск внешних процессов: run, Popen, захват вывода, коды возврата.
check: subprocess.run, subprocess.Popen, subprocess.PIPE, subprocess.CalledProcessError
tags: внешняя программа, процесс, команда
related: py:topic:subprocess
## Пример
```python
import subprocess, sys
r = subprocess.run([sys.executable, "-c", "import sys; print(sys.argv[1:])", "a", "b"], capture_output=True, text=True)
print(r.returncode, r.stdout.strip())
```

# id: lib:socket
kind: module
category: Модули стандартной библиотеки
title: socket
summary: Низкоуровневый сетевой интерфейс: TCP и UDP сокеты, адреса, серверы.
check: socket.socket, socket.socketpair, socket.create_connection, socket.create_server, socket.gethostname
tags: сокет, сеть, tcp, udp
related: py:topic:sockets
## Пример
```python
import socket
a, b = socket.socketpair()
a.sendall(b"ping")
print(b.recv(4), socket.AF_INET.name)
a.close(); b.close()
```

# id: lib:asyncio
kind: module
category: Модули стандартной библиотеки
title: asyncio
summary: Асинхронный ввод-вывод: цикл событий, сопрограммы, задачи, очереди, таймауты.
check: asyncio.run, asyncio.gather, asyncio.create_task, asyncio.sleep, asyncio.Queue, asyncio.wait_for, asyncio.TaskGroup
tags: асинхронность, async, await, сопрограммы
related: py:topic:asyncio, py:topic:async-await
## Пример
```python
import asyncio
async def tick(n):
    await asyncio.sleep(0.01 * n)
    return n
async def main():
    return await asyncio.gather(*(tick(i) for i in (3, 1, 2)))
print(asyncio.run(main()))
```

# id: lib:multiprocessing
kind: module
category: Модули стандартной библиотеки
title: multiprocessing
summary: Параллельные процессы, пулы, общая память, очереди между процессами (недоступно на Android).
check: multiprocessing.Process, multiprocessing.Pool, multiprocessing.Queue, multiprocessing.cpu_count
tags: процессы, параллельные вычисления, pool
related: py:topic:multiprocessing
## Пример
```python
import multiprocessing as mp
print(mp.cpu_count() >= 1)
```
## Ограничения
В приложении на часах (Android) модуль не работает. На компьютере используйте конструкцию if __name__ == "__main__": при создании процессов.
