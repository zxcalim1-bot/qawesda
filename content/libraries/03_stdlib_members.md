# id: lib:collections.Counter
kind: member
category: collections
title: collections.Counter
summary: Словарь-счётчик: сколько раз встречается каждый элемент; most_common, арифметика счётчиков.
sig: Counter(iterable_or_mapping=None, /, **kwds)
check: collections.Counter, collections.Counter.most_common, collections.Counter.elements, collections.Counter.update, collections.Counter.total
complexity: O(n) построение
tags: подсчёт, частота, сколько раз, гистограмма, анаграммы
related: lib:collections, task:most-frequent-word, task:anagram, algo:hashing
## Пример
```python
from collections import Counter
c = Counter("mississippi")
print(c["s"], c["z"], c.most_common(2), c.total())
c.update("sss")
print(c["s"], Counter("aab") - Counter("ab"), Counter("ab") + Counter("b"), sorted(Counter("aab").elements()))
```
## Особенности
Обращение к отсутствующему ключу возвращает 0 и не создаёт ключ. Counter(a) == Counter(b) — проверка анаграмм.

# id: lib:collections.deque
kind: member
category: collections
title: collections.deque
summary: Двусторонняя очередь: append/appendleft/pop/popleft за O(1), rotate, maxlen.
sig: deque(iterable=(), maxlen=None)
check: collections.deque, collections.deque.appendleft, collections.deque.popleft, collections.deque.rotate
complexity: O(1) на концах, O(n) доступ к середине
tags: очередь, дек, BFS, двусторонняя очередь, скользящее окно
related: algo:queue, algo:deque, algo:bfs, task:queue-simulation, task:window-max
## Пример
```python
from collections import deque
d = deque([1, 2, 3])
d.append(4); d.appendleft(0)
print(d.popleft(), d.pop(), list(d))
d.rotate(1)
print(list(d), deque(range(10), maxlen=3))
```

# id: lib:collections.deque.rotate
kind: member
category: collections
title: deque.rotate()
summary: Циклический сдвиг дека на n шагов вправо (отрицательное n — влево).
sig: deque.rotate(n=1, /)
check: collections.deque.rotate
complexity: O(k)
tags: циклический сдвиг, вращение
related: lib:collections.deque, task:rotate-list, task:cyclic-shift
## Пример
```python
from collections import deque
d = deque("abcde")
d.rotate(2)
print("".join(d))
d.rotate(-3)
print("".join(d))
```

# id: lib:collections.defaultdict
kind: member
category: collections
title: collections.defaultdict
summary: Словарь, который сам создаёт значение для нового ключа вызовом default_factory (list, int, set…).
sig: defaultdict(default_factory=None, /, ...)
check: collections.defaultdict
tags: словарь по умолчанию, группировка, граф, списки смежности
related: py:method:dict.setdefault, lib:collections, algo:graphs
## Пример
```python
from collections import defaultdict
graph = defaultdict(list)
for u, v in [(1, 2), (1, 3), (2, 3)]:
    graph[u].append(v)
    graph[v].append(u)
count = defaultdict(int)
for ch in "hello":
    count[ch] += 1
print(dict(graph), dict(count), defaultdict(lambda: "?")["x"])
```

# id: lib:collections.namedtuple
kind: member
category: collections
title: collections.namedtuple
summary: Фабрика кортежей с именованными полями.
sig: namedtuple(typename, field_names, *, rename=False, defaults=None, module=None)
check: collections.namedtuple
tags: именованный кортеж, запись, структура
related: py:topic:tuples, lib:typing
## Пример
```python
from collections import namedtuple
Point = namedtuple("Point", "x y", defaults=[0])
p = Point(3)
print(p, p.x, p[1], p._replace(y=5), Point._fields)
```

# id: lib:itertools.accumulate
kind: member
category: itertools
title: itertools.accumulate()
summary: Накопленные значения: префиксные суммы, бегущий максимум, произведения.
sig: accumulate(iterable[, func, *, initial=None])
check: itertools.accumulate
complexity: O(n)
tags: префиксные суммы, накопление, бегущий максимум
related: algo:prefix-sums, task:running-sum
## Пример
```python
from itertools import accumulate
import operator
a = [3, 1, 4, 1, 5]
print(list(accumulate(a)), list(accumulate(a, max)), list(accumulate(a, operator.mul)), list(accumulate(a, initial=0)))
```

# id: lib:itertools.permutations
kind: member
category: itertools
title: itertools.permutations()
summary: Все упорядоченные выборки длины r (по умолчанию — все перестановки) в лексикографическом порядке позиций.
sig: permutations(iterable, r=None)
check: itertools.permutations
complexity: O(n!/(n−r)!)
tags: перестановки, перебор порядков
related: task:permutations, algo:brute-force
## Пример
```python
from itertools import permutations
print(list(permutations("abc")), len(list(permutations(range(5), 2))))
```

# id: lib:itertools.combinations
kind: member
category: itertools
title: itertools.combinations()
summary: Все сочетания из элементов по r (без учёта порядка, без повторений).
sig: combinations(iterable, r)
check: itertools.combinations, itertools.combinations_with_replacement
complexity: O(C(n, r))
tags: сочетания, выбрать k из n, подмножества размера k
related: task:subsets, algo:combinatorics
## Пример
```python
from itertools import combinations, combinations_with_replacement
print(list(combinations([1, 2, 3, 4], 2)), list(combinations_with_replacement("ab", 2)))
```

# id: lib:itertools.product
kind: member
category: itertools
title: itertools.product()
summary: Декартово произведение — замена вложенных циклов.
sig: product(*iterables, repeat=1)
check: itertools.product
tags: декартово произведение, вложенные циклы, все комбинации
related: algo:brute-force
## Пример
```python
from itertools import product
print(list(product("ab", [1, 2])), ["".join(p) for p in product("01", repeat=3)][:4])
```

# id: lib:itertools.groupby
kind: member
category: itertools
title: itertools.groupby()
summary: Группирует подряд идущие элементы с одинаковым ключом.
sig: groupby(iterable, key=None)
check: itertools.groupby
tags: группировка, серии одинаковых, RLE
related: task:rle-encode, task:remove-duplicates-sorted
## Пример
```python
from itertools import groupby
print([(k, len(list(g))) for k, g in groupby("aaabbaa")])
words = sorted(["apple", "avocado", "banana", "blueberry"], key=lambda w: w[0])
print({k: list(g) for k, g in groupby(words, key=lambda w: w[0])})
```
## Ошибки
groupby объединяет только соседние элементы — для группировки «по всем» сначала отсортируйте по тому же ключу.

# id: lib:itertools.islice
kind: member
category: itertools
title: itertools.islice()
summary: Срез любого итератора (в том числе бесконечного) без создания списка.
sig: islice(iterable, stop) / islice(iterable, start, stop[, step])
check: itertools.islice
tags: срез итератора, первые n элементов, генератор
related: py:topic:generators
## Пример
```python
from itertools import islice, count
print(list(islice(count(1), 5)), list(islice("abcdefg", 1, 6, 2)))
```

# id: lib:itertools.zip_longest
kind: member
category: itertools
title: itertools.zip_longest()
summary: Как zip, но идёт до самой длинной последовательности, заполняя пропуски fillvalue.
sig: zip_longest(*iterables, fillvalue=None)
check: itertools.zip_longest
tags: zip до конца, разной длины
related: py:builtin:zip
## Пример
```python
from itertools import zip_longest
print(list(zip_longest("abc", [1], fillvalue="-")))
```

# id: lib:functools.lru_cache
kind: member
category: functools
title: functools.lru_cache / functools.cache
summary: Декоратор-кеш результатов функции (мемоизация); cache — без ограничения размера.
sig: @lru_cache(maxsize=128, typed=False) · @cache
check: functools.lru_cache, functools.cache
tags: мемоизация, кеш, динамика сверху вниз, рекурсия
related: algo:dp, py:topic:recursion, task:coin-ways
## Пример
```python
from functools import lru_cache, cache
@lru_cache(maxsize=None)
def grid(r, c):
    return 1 if r == 0 or c == 0 else grid(r - 1, c) + grid(r, c - 1)
@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(grid(16, 16), fib(200) % 1000, grid.cache_info().currsize)
grid.cache_clear()
```
## Ошибки
Все аргументы должны быть хешируемыми: списки передавайте как кортежи.

# id: lib:functools.reduce
kind: member
category: functools
title: functools.reduce()
summary: Сворачивает последовательность в одно значение, применяя функцию попарно слева направо.
sig: reduce(function, iterable[, initial])
check: functools.reduce
tags: свёртка, накопление, произведение
related: lib:math.prod, py:topic:functional
## Пример
```python
from functools import reduce
from math import gcd
print(reduce(lambda a, b: a * 10 + b, [1, 2, 3]), reduce(gcd, [24, 36, 60]), reduce(lambda a, b: a + b, [], 0))
```

# id: lib:functools.cmp_to_key
kind: member
category: functools
title: functools.cmp_to_key()
summary: Превращает функцию сравнения cmp(a, b) → −1/0/1 в ключ для sorted.
sig: cmp_to_key(func)
check: functools.cmp_to_key
tags: компаратор, сортировка со своим сравнением
related: task:largest-number, algo:sorting
## Пример
```python
from functools import cmp_to_key
def cmp(a, b):
    return -1 if a + b > b + a else (1 if a + b < b + a else 0)
print("".join(sorted(["9", "34", "3", "30", "5"], key=cmp_to_key(cmp))))
```

# id: lib:functools.partial
kind: member
category: functools
title: functools.partial()
summary: Создаёт новую функцию с частично заданными аргументами.
sig: partial(func, /, *args, **keywords)
check: functools.partial
tags: частичное применение, фиксировать аргумент
related: py:topic:functional
## Пример
```python
from functools import partial
from_bin = partial(int, base=2)
pow2 = partial(pow, 2)
print(from_bin("1101"), pow2(10))
```

# id: lib:math.isqrt
kind: member
category: math
title: math.isqrt()
summary: Целый квадратный корень ⌊√n⌋ для неотрицательных целых — точно для любых размеров.
sig: isqrt(n, /)
check: math.isqrt
complexity: O(log n) операций над длинными числами
tags: целый корень, квадрат, полный квадрат
related: task:integer-sqrt, algo:primes
## Пример
```python
import math
n = 10**30 + 1
r = math.isqrt(n)
print(r, r * r <= n < (r + 1) ** 2, math.isqrt(49) ** 2 == 49, int(math.sqrt(10**30 - 1)))
```
## Совет
int(math.sqrt(n)) для n > 2^52 может ошибиться из-за точности float — используйте isqrt.

# id: lib:math.gcd
kind: member
category: math
title: math.gcd() и math.lcm()
summary: НОД и НОК целых чисел (несколько аргументов — с Python 3.9).
sig: gcd(*integers) · lcm(*integers)
check: math.gcd, math.lcm
tags: НОД, НОК, наибольший общий делитель
related: algo:gcd-lcm, task:gcd-lcm
## Пример
```python
import math
print(math.gcd(84, 36), math.gcd(0, 5), math.gcd(12, 18, 30), math.lcm(4, 6, 10))
```

# id: lib:math.comb
kind: member
category: math
title: math.comb() и math.perm()
summary: Число сочетаний C(n, k) и размещений A(n, k) — точные целые.
sig: comb(n, k) · perm(n, k=None)
check: math.comb, math.perm
tags: сочетания, размещения, биномиальный коэффициент
related: algo:combinatorics, task:binom-mod, task:catalan
## Пример
```python
import math
print(math.comb(10, 3), math.comb(5, 7), math.perm(5, 2), math.perm(4), math.comb(100, 50) % (10**9 + 7))
```

# id: lib:math.prod
kind: member
category: math
title: math.prod()
summary: Произведение элементов итерируемого объекта (start=1).
sig: prod(iterable, /, *, start=1)
check: math.prod
tags: произведение, умножить все
related: task:digit-product, task:factorial
## Пример
```python
import math
print(math.prod([1, 2, 3, 4]), math.prod([]), math.prod(range(1, 11)))
```

# id: lib:math.factorial
kind: member
category: math
title: math.factorial()
summary: Факториал n! для неотрицательного целого n.
sig: factorial(n, /)
check: math.factorial
tags: факториал, перестановки
related: task:factorial, lib:math.comb
## Пример
```python
import math
print(math.factorial(0), math.factorial(10), len(str(math.factorial(100))))
```

# id: lib:heapq.heappush
kind: member
category: heapq
title: heapq.heappush() и heapq.heappop()
summary: Добавление в кучу и извлечение минимума за O(log n).
sig: heappush(heap, item) · heappop(heap)
check: heapq.heappush, heapq.heappop
complexity: O(log n)
tags: куча, приоритетная очередь, минимум
related: algo:heap, algo:shortest-paths
## Пример
```python
import heapq
h = []
for p, name in [(3, "c"), (1, "a"), (2, "b")]:
    heapq.heappush(h, (p, name))
print([heapq.heappop(h)[1] for _ in range(len(h))])
```

# id: lib:heapq.nlargest
kind: member
category: heapq
title: heapq.nlargest() и heapq.nsmallest()
summary: k наибольших (наименьших) элементов, в том числе по ключу.
sig: nlargest(n, iterable, key=None) · nsmallest(n, iterable, key=None)
check: heapq.nlargest, heapq.nsmallest
complexity: O(n log k)
tags: топ-k, лучшие k, k наибольших
related: task:kth-smallest, task:second-max
## Пример
```python
import heapq
scores = {"ali": 90, "ola": 75, "vali": 88, "sami": 95}
print(heapq.nlargest(2, scores, key=scores.get), heapq.nsmallest(3, [5, 1, 8, 3, 2]))
```

# id: lib:bisect.bisect_left
kind: member
category: bisect
title: bisect.bisect_left() и bisect.bisect_right()
summary: Позиция вставки x в отсортированный список: перед равными (left) или после них (right).
sig: bisect_left(a, x, lo=0, hi=len(a), *, key=None)
check: bisect.bisect_left, bisect.bisect_right
complexity: O(log n)
tags: бинарный поиск, позиция вставки, нижняя граница
related: algo:binary-search, task:binary-search-queries, task:range-count, task:lis
## Пример
```python
from bisect import bisect_left, bisect_right
a = [10, 20, 20, 30]
print(bisect_left(a, 20), bisect_right(a, 20), bisect_right(a, 20) - bisect_left(a, 20), bisect_left(a, 25))
```

# id: lib:bisect.bisect_right
kind: member
category: bisect
title: bisect.bisect_right()
summary: Первая позиция, где элемент больше x (вставка после равных); bisect.bisect — то же самое.
sig: bisect_right(a, x, lo=0, hi=len(a), *, key=None)
check: bisect.bisect_right, bisect.bisect
complexity: O(log n)
tags: верхняя граница, количество ≤ x
related: lib:bisect.bisect_left, task:range-count
## Пример
```python
from bisect import bisect_right
a = sorted([5, 1, 4, 4, 9])
print(a, bisect_right(a, 4), bisect_right(a, 0), bisect_right(a, 100))
```

# id: lib:pathlib.Path
kind: member
category: pathlib
title: pathlib.Path
summary: Путь к файлу или папке как объект: соединение через /, проверки, чтение и запись, поиск по шаблону.
sig: Path(*pathsegments)
check: pathlib.Path, pathlib.Path.exists, pathlib.Path.read_text, pathlib.Path.iterdir, pathlib.Path.with_suffix
tags: путь, файл, папка, расширение
related: lib:pathlib, py:topic:files
## Пример
```python
from pathlib import Path
p = Path("projects") / "olymp" / "solution.py"
print(p.name, p.suffix, p.with_suffix(".txt").name, p.parent, p.parts[:2], Path("a/b/../c").as_posix())
```

# id: lib:sys.setrecursionlimit
kind: member
category: sys
title: sys.setrecursionlimit()
summary: Изменяет максимальную глубину рекурсии интерпретатора (по умолчанию 1000).
sig: setrecursionlimit(limit, /)
check: sys.setrecursionlimit, sys.getrecursionlimit
tags: рекурсия, глубина, RecursionError
related: err:RecursionError, py:topic:recursion
## Пример
```python
import sys
sys.setrecursionlimit(10000)
def depth(n):
    return 0 if n == 0 else 1 + depth(n - 1)
print(sys.getrecursionlimit(), depth(5000))
```
## Ограничение
Слишком большой лимит не увеличивает стек C — процесс может аварийно завершиться. Для очень глубокой рекурсии запускайте код в потоке с большим стеком или пишите итеративно.

# id: lib:sys.set_int_max_str_digits
kind: member
category: sys
title: sys.set_int_max_str_digits()
summary: Лимит длины целых чисел при переводе int ↔ str (по умолчанию 4300 цифр, 0 — без ограничения).
sig: set_int_max_str_digits(maxdigits, /)
check: sys.set_int_max_str_digits, sys.get_int_max_str_digits
tags: длинные числа, 4300 цифр, вывод большого числа
related: err:ValueError-int-digits
## Пример
```python
import sys
print(sys.get_int_max_str_digits())
sys.set_int_max_str_digits(0)
print(len(str(7 ** 10000)))
```

# id: lib:sys.getsizeof
kind: member
category: sys
title: sys.getsizeof()
summary: Размер объекта в байтах (без учёта объектов, на которые он ссылается).
sig: getsizeof(object[, default])
check: sys.getsizeof
tags: размер объекта, память
related: py:topic:memory-management
## Пример
```python
import sys
print(sys.getsizeof(1), sys.getsizeof(2**100), sys.getsizeof("a" * 10), sys.getsizeof([1, 2, 3]))
```

# id: lib:string.ascii_lowercase
kind: member
category: string
title: string.ascii_lowercase и другие наборы символов
summary: Готовые строки: ascii_lowercase, ascii_uppercase, ascii_letters, digits, hexdigits, punctuation, whitespace.
check: string.ascii_lowercase, string.ascii_uppercase, string.ascii_letters, string.digits, string.hexdigits, string.punctuation
tags: алфавит, латинские буквы, цифры
related: lib:string, task:pangram, task:caesar
## Пример
```python
import string
print(string.ascii_lowercase, string.ascii_uppercase[:5], string.digits, string.hexdigits)
print({ch: i for i, ch in enumerate(string.ascii_lowercase)}["z"])
```

# id: lib:datetime.date
kind: member
category: datetime
title: datetime.date
summary: Календарная дата: создание, арифметика с timedelta, день недели, форматирование.
sig: date(year, month, day)
check: datetime.date, datetime.date.today, datetime.date.weekday, datetime.date.isoformat, datetime.date.toordinal
tags: дата, день недели, разница дней
related: lib:datetime, task:days-between, task:weekday
## Пример
```python
from datetime import date, timedelta
d = date(2024, 2, 28)
print(d + timedelta(days=1), d + timedelta(days=2), d.weekday(), d.strftime("%d.%m.%Y"), date(2025, 1, 1).toordinal() - d.toordinal())
```

# id: lib:operator.itemgetter
kind: member
category: operator
title: operator.itemgetter()
summary: Функция, достающая элемент(ы) по индексу или ключу — удобный key для сортировки.
sig: itemgetter(item, /, *items)
check: operator.itemgetter
tags: ключ сортировки, достать поле
related: py:builtin:sorted, task:sort-students
## Пример
```python
from operator import itemgetter
rows = [("ali", 15, 90), ("ola", 17, 75), ("vali", 15, 88)]
print(sorted(rows, key=itemgetter(1, 2)), list(map(itemgetter(0), rows)), itemgetter("a")({"a": 1}))
```

# id: lib:copy.deepcopy
kind: member
category: copy
title: copy.deepcopy()
summary: Глубокая копия объекта со всеми вложенными объектами.
sig: deepcopy(x, memo=None)
check: copy.deepcopy
tags: глубокая копия, независимая копия
related: lib:copy, py:method:list.copy
## Пример
```python
import copy
grid = [[0, 0], [0, 0]]
g2 = copy.deepcopy(grid)
g2[0][0] = 1
print(grid, g2)
```

# id: lib:json.loads
kind: member
category: json
title: json.loads() и json.dumps()
summary: Строка JSON → объект Python и обратно.
sig: loads(s, *, ...) · dumps(obj, *, ensure_ascii=True, indent=None, sort_keys=False, ...)
check: json.loads, json.dumps
tags: json, разбор, сериализация
related: lib:json, task:json-sum
## Пример
```python
import json
obj = json.loads('{"a": [1, 2, {"b": null}], "ok": true}')
print(obj, json.dumps(obj, separators=(",", ":")), json.dumps("Ёж"), json.dumps("Ёж", ensure_ascii=False))
```

# id: lib:re.findall
kind: member
category: re
title: re.findall() и re.finditer()
summary: Все непересекающиеся совпадения шаблона: списком строк (групп) или итератором объектов Match.
sig: findall(pattern, string, flags=0) · finditer(pattern, string, flags=0)
check: re.findall, re.finditer
tags: найти все, регулярное выражение, извлечь числа
related: lib:re, task:sum-digits-in-string
## Пример
```python
import re
s = "x=10, y=-3, z=7"
print(re.findall(r"-?\d+", s), re.findall(r"(\w)=(-?\d+)", s), [m.start() for m in re.finditer(r"\d+", s)])
```

# id: lib:re.sub
kind: member
category: re
title: re.sub()
summary: Замена совпадений шаблона строкой или результатом функции.
sig: sub(pattern, repl, string, count=0, flags=0)
check: re.sub, re.subn
tags: замена по шаблону, regex replace
related: lib:re, task:camel-to-snake
## Пример
```python
import re
print(re.sub(r"\s+", " ", "a   b \n c"), re.sub(r"(\d+)", lambda m: str(int(m.group()) * 2), "3 apples, 10 pears"))
print(re.sub(r"(\w+)@(\w+)", r"\2 at \1", "user@host"))
```

# id: lib:re.match
kind: member
category: re
title: re.match(), re.search(), re.fullmatch()
summary: Проверка совпадения в начале строки, где угодно и всей строки целиком.
sig: match(pattern, string, flags=0)
check: re.match, re.search, re.fullmatch
tags: проверка формата, валидация, поиск по шаблону
related: lib:re, task:log-analysis
## Пример
```python
import re
print(bool(re.match(r"\d+", "123abc")), bool(re.search(r"\d+", "abc123")), bool(re.fullmatch(r"\d+", "123abc")))
m = re.fullmatch(r"(\d{2})\.(\d{2})\.(\d{4})", "04.10.2026")
print(m.groups() if m else None)
```

# id: lib:fractions.Fraction
kind: member
category: fractions
title: fractions.Fraction
summary: Точная рациональная дробь p/q с автоматическим сокращением.
sig: Fraction(numerator=0, denominator=1) / Fraction(string) / Fraction(float)
check: fractions.Fraction
tags: дробь, точная арифметика, рациональное число
related: lib:fractions, task:fraction-class, task:fractional-knapsack
## Пример
```python
from fractions import Fraction
x = Fraction(6, 8)
print(x, x + Fraction(1, 4), x * 2, Fraction("1/3") + Fraction("1/6"), Fraction(0.5), float(Fraction(1, 3)))
```

# id: lib:graphlib.TopologicalSorter
kind: member
category: graphlib
title: graphlib.TopologicalSorter
summary: Топологическая сортировка графа зависимостей; поддерживает поэтапную выдачу готовых вершин.
sig: TopologicalSorter(graph=None)
check: graphlib.TopologicalSorter, graphlib.TopologicalSorter.static_order, graphlib.TopologicalSorter.get_ready
tags: топологическая сортировка, зависимости
related: algo:topological-sort, task:topo-sort
## Пример
```python
from graphlib import TopologicalSorter
ts = TopologicalSorter({"b": {"a"}, "c": {"a"}, "d": {"b", "c"}})
ts.prepare()
stages = []
while ts.is_active():
    ready = sorted(ts.get_ready())
    stages.append(ready)
    ts.done(*ready)
print(stages)
```
