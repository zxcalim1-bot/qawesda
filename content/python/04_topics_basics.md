# id: py:topic:print-input
kind: topic
category: Основы
title: Ввод и вывод: print() и input()
summary: Как читать данные и выводить результат — в том числе в олимпиадном формате.
level: beginner
tags: ввод, вывод, print, input, stdin, sys.stdin, быстрый ввод
related: py:builtin:print, py:builtin:input, err:EOFError, err:ValueError-unpack
## Вывод
print выводит значения через пробел и переводит строку. sep меняет разделитель, end — окончание. Для форматирования используйте f-строки.
```python
x, y = 3, 4.5
print("x =", x, "y =", y)
print(x, y, sep=";", end=".\n")
print(f"{x} + {y} = {x + y:.1f}")
print(*[1, 2, 3])
```
## Ввод
input() читает одну строку как текст. Числа нужно преобразовать.
```python
import io, sys
sys.stdin = io.StringIO("5\n1 2 3 4 5\nAli 15\n")
n = int(input())
a = list(map(int, input().split()))
name, age = input().split()
print(n, sum(a), name, int(age) + 1)
```
## Быстрый ввод для больших данных
```python
import io, sys
sys.stdin = io.StringIO("3\n10 20\n30\n")
data = sys.stdin.read().split()
n, nums = int(data[0]), list(map(int, data[1:]))
print(n, nums)
```
## Типичные ошибки
- Числа на одной строке читаются одним input().split(), а на разных строках — несколькими input().
- int(input()) для строки «3 4» — ValueError.
- Лишний input() в конце — EOFError.

# id: py:topic:variables
kind: topic
category: Основы
title: Переменные и объекты
summary: Переменная — имя, ссылающееся на объект; присваивание связывает имя, а не копирует данные.
level: beginner
tags: переменная, имя, присваивание, ссылка, объект, изменяемые, неизменяемые
related: py:op:assignment, py:builtin:id, py:topic:types
## Имена и объекты
В Python всё — объекты. Переменная — это ярлык на объект. a = b не копирует объект: оба имени указывают на один и тот же.
```python
a = [1, 2]
b = a
b.append(3)
print(a, a is b)
x = 10
y = x
y += 1
print(x, y)
```
## Изменяемые и неизменяемые типы
- Неизменяемые: int, float, bool, str, tuple, frozenset, bytes — «изменение» создаёт новый объект.
- Изменяемые: list, dict, set, bytearray, большинство пользовательских объектов.
## Правила имён
Буквы, цифры и _, не с цифры, регистр важен, нельзя использовать ключевые слова. По соглашению PEP 8: snake_case для переменных и функций, CamelCase для классов, UPPER_CASE для констант.
```python
import keyword
print(keyword.iskeyword("class"), "my_var".isidentifier(), "2x".isidentifier(), len(keyword.kwlist))
```

# id: py:topic:types
kind: topic
category: Основы
title: Основные типы: int, float, str, bool, None
summary: Встроенные скалярные типы, их особенности и проверка типа.
level: beginner
tags: типы данных, int, float, str, bool, None, type, isinstance
related: py:builtin:type, py:builtin:isinstance, py:topic:conversions
## Обзор
- int — целые числа произвольной длины: 2 ** 100.
- float — числа с плавающей точкой двойной точности: 0.1, 1e-9, inf, nan.
- complex — комплексные: 3 + 4j.
- str — неизменяемые строки Unicode.
- bool — True/False, подкласс int.
- NoneType — единственное значение None («нет значения»).
```python
for v in [42, 3.14, "текст", True, None, 2 + 3j]:
    print(repr(v), type(v).__name__)
print(isinstance(True, int), 10 ** 30, 1e308 * 10)
```
## Литералы чисел
```python
print(1_000_000, 0b1010, 0o17, 0xff, 1.5e3, .5)
```

# id: py:topic:conversions
kind: topic
category: Основы
title: Преобразование типов
summary: int(), float(), str(), bool(), list(), tuple(), set() — явное приведение и типичные ловушки.
level: beginner
tags: преобразование типов, приведение, конвертация, int, str
related: py:builtin:int, py:builtin:float, py:builtin:str, err:ValueError, err:TypeError
## Примеры
```python
print(int("42") + 1, float("2.5") * 2, str(7) + "!", bool("False"), list("abc"), tuple([1, 2]), set([1, 1, 2]))
print(int(3.99), round(3.99), int("1010", 2), str(0.1 + 0.2))
```
## Неявных преобразований почти нет
Python не превращает строку в число сам: "5" + 1 — ошибка. Исключение — числа: int + float даёт float, bool участвует в арифметике как 0/1.
```python
print(1 + 2.0, True + 1, 3 * "ab")
```

# id: py:topic:comparisons
kind: topic
category: Основы
title: Сравнения и логические выражения
summary: ==, !=, <, >, цепочки сравнений, and/or/not, истинность объектов, is против ==.
level: beginner
tags: сравнение, логические выражения, цепочка сравнений, истинность
related: py:op:comparison, py:op:logical, py:op:is, py:builtin:bool
## Цепочки сравнений
a < b < c означает a < b and b < c, причём b вычисляется один раз.
```python
x = 5
print(1 <= x <= 10, x == 5 != 6, "a" < "b" < "c")
```
## Сравнение последовательностей
Строки, списки и кортежи сравниваются лексикографически — поэлементно слева направо.
```python
print("apple" < "apricot", [1, 2] < [1, 2, 0], (2, "a") < (10, "a"), "Z" < "a")
```
## Истинность
В условиях объекты проверяются через bool(): пустые коллекции, 0 и None ложны.
```python
items = []
if not items:
    print("список пуст")
```

# id: py:topic:conditions
kind: topic
category: Основы
title: Условия: if, elif, else, match
summary: Ветвление программы, вложенные условия, условное выражение, сопоставление с образцом.
level: beginner
tags: условие, ветвление, if, elif, else, match, case
related: py:keyword:if, py:keyword:match, py:op:ternary, task:parity, task:leap-year
## if / elif / else
```python
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    elif score >= 60:
        return "C"
    return "F"
print([grade(s) for s in (95, 80, 61, 10)])
```
## Условное выражение
```python
n = -3
print("отрицательное" if n < 0 else "неотрицательное")
```
## Словарь вместо длинной цепочки
```python
ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b}
print(ops["*"](6, 7))
```
## Типичные ошибки
- = вместо == в условии — SyntaxError.
- Неверный порядок проверок: более общее условие раньше частного «перехватывает» его.

# id: py:topic:loops
kind: topic
category: Основы
title: Циклы for и while
summary: Перебор коллекций, range, while с условием, break/continue, else у цикла, вложенные циклы.
level: beginner
tags: цикл, for, while, range, break, continue, повторение
related: py:keyword:for, py:keyword:while, py:keyword:break, py:builtin:range, py:builtin:enumerate
## for
```python
for i in range(1, 6, 2):
    print(i, end=" ")
print()
for word in "мир труд май".split():
    print(word.upper(), end=" ")
print()
```
## while
```python
n, digits = 9045, 0
while n > 0:
    n //= 10
    digits += 1
print(digits)
```
## else у цикла
Блок else выполняется, если цикл закончился без break — удобно для поиска.
```python
for d in range(2, 10):
    if 91 % d == 0:
        print("делитель", d)
        break
else:
    print("простое")
```
## Типичные ошибки
- Изменение списка во время цикла по нему.
- range(n) не включает n.
- Бесконечный while из-за того, что переменная условия не меняется.

# id: py:topic:scope
kind: topic
category: Основы
title: Области видимости (LEGB)
summary: Local → Enclosing → Global → Built-in: где Python ищет имена; global, nonlocal, замыкания.
level: intermediate
tags: область видимости, LEGB, глобальная, локальная, замыкание
related: py:keyword:global, err:UnboundLocalError, err:NameError
## Правило LEGB
Имя ищется сначала в локальной области функции, затем в объемлющих функциях, затем в глобальной области модуля и, наконец, среди встроенных имён.
```python
x = "global"
def outer():
    x = "enclosing"
    def inner():
        return x
    return inner()
print(outer(), x, len("abc"))
```
## Замыкание
Вложенная функция запоминает переменные внешней функции.
```python
def multiplier(k):
    def f(x):
        return x * k
    return f
double = multiplier(2)
print(double(21), double.__closure__[0].cell_contents)
```

# id: py:topic:lists
kind: topic
category: Структуры данных
title: Списки (list)
summary: Изменяемая упорядоченная последовательность: создание, индексы, методы, копирование, сложность операций.
level: beginner
tags: список, массив, list, append, срез, сортировка
related: py:method:list.append, py:method:list.sort, algo:arrays, py:topic:comprehensions
## Создание и доступ
```python
a = [5, 3, 8]
a.append(1)
a[0] = 7
print(a, a[-1], a[1:3], len(a), 8 in a)
b = list(range(5))
c = [0] * 4
grid = [[0] * 3 for _ in range(2)]
print(b, c, grid)
```
## Основные методы
append, extend, insert, pop, remove, index, count, sort, reverse, copy, clear.
## Сложность
- a[i], a[i] = x, append, pop() — O(1).
- insert(0, x), pop(0), x in a, remove, index — O(n).
- sort — O(n log n).
## Копирование
```python
import copy
a = [[1], [2]]
shallow = a[:]
deep = copy.deepcopy(a)
a[0].append(99)
print(shallow, deep)
```

# id: py:topic:tuples
kind: topic
category: Структуры данных
title: Кортежи (tuple)
summary: Неизменяемые последовательности: возврат нескольких значений, ключи словарей, распаковка, namedtuple.
level: beginner
tags: кортеж, tuple, неизменяемый, распаковка, namedtuple
related: py:method:tuple.count, lib:collections.namedtuple, py:op:unpacking
## Особенности
Кортеж создаётся запятыми, скобки нужны для ясности. Кортеж из одного элемента — (x,).
```python
point = (3, 4)
x, y = point
single = (5,)
print(point[0], x + y, type(single).__name__, len(()), (1, 2) + (3,))
```
## Где применяются
- Возврат нескольких значений из функции.
- Ключи словарей и элементы множеств (если элементы хешируемы).
- Записи фиксированной структуры: namedtuple даёт имена полям.
```python
from collections import namedtuple
Pt = namedtuple("Pt", "x y")
p = Pt(1, 2)
print(p.x, p, {(0, 0): "start"}[(0, 0)])
```

# id: py:topic:sets
kind: topic
category: Структуры данных
title: Множества (set, frozenset)
summary: Неупорядоченные коллекции уникальных элементов с быстрой проверкой принадлежности и операциями над множествами.
level: beginner
tags: множество, set, уникальные, пересечение, объединение, frozenset
related: py:method:set.add, py:method:set.intersection, algo:hashing, task:distinct-count
## Основы
```python
s = {3, 1, 2, 3}
s.add(5)
print(s, len(s), 2 in s, set("hello"), set())
```
## Операции
```python
a, b = {1, 2, 3, 4}, {3, 4, 5}
print(a | b, a & b, a - b, a ^ b, {1, 2} <= a)
```
## Применение
Удаление дубликатов (с потерей порядка), быстрые проверки x in s за O(1), пересечения наборов. frozenset — неизменяемое множество, может быть ключом словаря.
## Типичные ошибки
- {} — это словарь, пустое множество — set().
- Элементы должны быть хешируемыми: множество списков создать нельзя.

# id: py:topic:dicts
kind: topic
category: Структуры данных
title: Словари (dict)
summary: Отображение «ключ → значение»: создание, доступ, обход, подсчёт, вложенные словари, порядок вставки.
level: beginner
tags: словарь, dict, ключ, значение, хеш-таблица, подсчёт
related: py:method:dict.get, py:method:dict.items, lib:collections.defaultdict, lib:collections.Counter, algo:hashing
## Основы
```python
phone = {"ali": "123", "vali": "456"}
phone["sami"] = "789"
print(phone["ali"], phone.get("x", "нет"), len(phone), "vali" in phone)
for name, num in phone.items():
    print(name, num)
```
## Подсчёт и группировка
```python
from collections import Counter, defaultdict
words = "a b a c b a".split()
print(Counter(words))
by_len = defaultdict(list)
for w in ["hi", "hey", "yo", "hello"]:
    by_len[len(w)].append(w)
print(dict(by_len))
```
## Особенности
С Python 3.7 словари сохраняют порядок вставки. Ключи — только хешируемые объекты. Поиск, вставка и удаление — в среднем O(1).

# id: py:topic:collections
kind: topic
category: Структуры данных
title: Модуль collections и heapq
summary: deque, defaultdict, Counter, namedtuple, OrderedDict, ChainMap; куча heapq — что и когда использовать.
level: intermediate
tags: deque, defaultdict, Counter, namedtuple, heapq, очередь, куча
related: lib:collections.deque, lib:collections.Counter, lib:collections.defaultdict, lib:heapq, algo:queue, algo:heap
## Обзор
- deque — двусторонняя очередь: O(1) с обоих концов.
- defaultdict(factory) — словарь, создающий значение для нового ключа.
- Counter — подсчёт элементов, most_common.
- namedtuple — кортеж с именованными полями.
- OrderedDict — словарь с move_to_end и popitem(last=False).
- heapq — функции для min-кучи на обычном списке.
```python
from collections import deque, defaultdict, Counter, namedtuple
import heapq
q = deque([1, 2, 3]); q.appendleft(0); q.pop()
g = defaultdict(set); g["a"].add(1)
c = Counter("mississippi")
h = [5, 1, 4]; heapq.heapify(h)
print(list(q), dict(g), c.most_common(2), heapq.heappop(h), h)
```

# id: py:topic:comprehensions
kind: topic
category: Структуры данных
title: Генераторы списков, словарей и множеств
summary: Компактное создание коллекций: [выражение for x in ... if условие], вложенные циклы, генераторные выражения.
level: beginner
tags: генератор списков, list comprehension, dict comprehension, set comprehension
related: py:builtin:map, py:builtin:filter, py:topic:generators
## Синтаксис
```python
squares = [x * x for x in range(6)]
evens = [x for x in range(10) if x % 2 == 0]
labels = ["even" if x % 2 == 0 else "odd" for x in range(4)]
pairs = [(i, j) for i in range(3) for j in range(i)]
lengths = {w: len(w) for w in ["hi", "hello"]}
letters = {ch for ch in "banana"}
print(squares, evens, labels, pairs, lengths, letters)
```
## Генераторное выражение
В круглых скобках — ленивый генератор: не создаёт список в памяти.
```python
print(sum(x * x for x in range(1, 1001)), max(len(w) for w in "a bb ccc".split()))
```
## Совет
Если генератор не помещается в одну понятную строку — используйте обычный цикл.

# id: py:topic:strings
kind: topic
category: Строки
title: Строки (str)
summary: Создание, экранирование, индексы и срезы, методы, неизменяемость, Unicode, многострочные и «сырые» строки.
level: beginner
tags: строка, str, текст, кавычки, экранирование, Unicode
related: algo:strings, py:topic:slicing, py:topic:f-strings, py:method:str.split, py:method:str.join
## Создание
```python
a = 'одинарные'
b = "двойные"
c = """многострочная
строка"""
d = r"C:\new\table"
e = "табуляция:\tперевод строки:\nконец"
print(a, b, c, d, e, sep=" | ")
```
## Операции
```python
s = "Python"
print(s + "!", s * 2, len(s), s[0], s[-1], "th" in s, s.lower(), s.replace("P", "J"))
```
## Неизменяемость
Изменить символ нельзя — создайте новую строку: s = s[:1] + "Y" + s[2:]. Для многократной сборки используйте список частей и "".join.

# id: py:topic:slicing
kind: topic
category: Строки
title: Срезы [start:stop:step]
summary: Получение подпоследовательностей строк, списков и кортежей; отрицательные индексы и шаг.
level: beginner
tags: срез, slice, отрицательный индекс, разворот, шаг
related: py:op:indexing, py:builtin:slice, task:reverse-number
## Правила
a[start:stop:step]: start включается, stop — нет; пропущенные границы — начало и конец; отрицательные индексы отсчитываются с конца; отрицательный шаг идёт справа налево.
```python
a = list(range(10))
print(a[2:5], a[:3], a[7:], a[-3:], a[::3], a[::-1], a[8:2:-2])
s = "abcdef"
print(s[1:-1], s[::-2], s[100:], s[-100:2])
```
## Присваивание срезам (списки)
```python
a = [0, 1, 2, 3, 4, 5]
a[1:3] = ["x", "y", "z"]
a[::2] = [9] * len(a[::2])
del a[-2:]
print(a)
```
## Особенности
Срезы не выходят за границы и не вызывают IndexError. Срез создаёт новую (поверхностную) копию.

# id: py:topic:f-strings
kind: topic
category: Строки
title: f-строки и форматирование
summary: Подстановка выражений в строку, ширина, точность, выравнивание, разделители разрядов, отладочный формат {x=}.
level: beginner
tags: f-строка, форматирование, format, точность, ширина, выравнивание
related: py:builtin:format, py:method:str.format
## Основы
```python
name, score, pi = "Ali", 93.456, 3.14159265
print(f"{name} набрал {score:.1f} баллов")
print(f"{pi:.3f} | {42:5d} | {7:03d} | {1234567:,} | {0.256:.1%}")
print(f"{'лево':<8}|{'центр':^8}|{'право':>8}|")
print(f"{255:b} {255:o} {255:x} {255:#X}")
x = 10
print(f"{x = }, {x * 2 = }")
```
## Спецификация формата
[заполнитель][выравнивание <>^][знак][ширина][,][.точность][тип]. Типы: d — целое, f — фиксированная точка, e — экспонента, % — процент, b/o/x — системы счисления, s — строка.
## Особенности
В Python 3.11 внутри f-строки нельзя использовать те же кавычки, что и снаружи, и обратную косую черту в выражении (это разрешено с 3.12).

# id: py:topic:functions
kind: topic
category: Функции
title: Функции
summary: Объявление, параметры и аргументы, значения по умолчанию, return, документирование, функции как объекты.
level: beginner
tags: функция, def, параметры, аргументы, return, docstring
related: py:keyword:def, py:topic:args-kwargs, py:topic:functional, py:topic:recursion, py:topic:decorators
## Объявление и вызов
```python
def bmi(weight, height=1.75):
    """Индекс массы тела."""
    return round(weight / height ** 2, 1)
print(bmi(70), bmi(70, 1.8), bmi(height=1.6, weight=50), bmi.__doc__)
```
## Функции — объекты
Их можно передавать как аргументы, хранить в списках и словарях, возвращать из других функций.
```python
def apply(f, values):
    return [f(v) for v in values]
print(apply(abs, [-1, 2, -3]), apply(str.upper, ["a", "b"]))
```
## Ловушка изменяемого значения по умолчанию
```python
def add_item(x, items=None):
    if items is None:
        items = []
    items.append(x)
    return items
print(add_item(1), add_item(2))
```

# id: py:topic:args-kwargs
kind: topic
category: Функции
title: *args и **kwargs
summary: Произвольное число позиционных и именованных аргументов; позиционные-только и только-именованные параметры.
level: intermediate
tags: args, kwargs, произвольные аргументы, звёздочка, распаковка
related: py:op:unpacking, py:topic:functions
## Сбор аргументов
```python
def report(title, *values, sep=", ", **options):
    return f"{title}: {sep.join(map(str, values))} {options}"
print(report("числа", 1, 2, 3))
print(report("опции", sep=";", color="red", size=2))
```
## Виды параметров
def f(a, b, /, c, *, d): a и b — только позиционные, c — любой, d — только именованный.
```python
def f(a, /, b, *, c):
    return a + b + c
print(f(1, 2, c=3), f(1, b=2, c=3))
```
## Передача
Звёздочка при вызове распаковывает: f(*список), f(**словарь).

# id: py:topic:functional
kind: topic
category: Функции
title: lambda, map, filter, zip, enumerate, sorted с key
summary: Инструменты функционального стиля и когда их стоит заменить генераторами.
level: intermediate
tags: lambda, map, filter, zip, enumerate, functools, reduce
related: py:keyword:lambda, py:builtin:map, py:builtin:filter, py:builtin:zip, py:builtin:enumerate, lib:functools.reduce
## Примеры
```python
from functools import reduce
from operator import mul
nums = [3, 1, 4, 1, 5]
print(list(map(lambda x: x * 2, nums)))
print(list(filter(lambda x: x > 2, nums)))
print(reduce(mul, nums), sorted(enumerate(nums), key=lambda p: -p[1])[:2])
print(dict(zip("abc", nums)))
```
## Совет
[f(x) for x in a if cond(x)] обычно читается легче, чем list(map(f, filter(cond, a))).

# id: py:topic:recursion
kind: topic
category: Функции
title: Рекурсия в Python
summary: Рекурсивные функции, база и шаг, глубина стека, мемоизация через lru_cache, переход к итерации.
level: intermediate
tags: рекурсия, recursion, lru_cache, глубина, setrecursionlimit
related: algo:recursion, algo:backtracking, err:RecursionError, lib:functools.lru_cache
## Пример: сумма вложенного списка
```python
def deep_sum(x):
    if isinstance(x, list):
        return sum(deep_sum(v) for v in x)
    return x
print(deep_sum([1, [2, [3, 4]], 5]))
```
## Мемоизация
```python
from functools import lru_cache
@lru_cache(maxsize=None)
def paths(n):
    return 1 if n <= 1 else paths(n - 1) + paths(n - 2)
print(paths(100))
```
## Ограничения
По умолчанию глубина ~1000 вызовов (sys.getrecursionlimit()). CPython не оптимизирует хвостовую рекурсию. Глубокие обходы лучше писать итеративно со своим стеком.

# id: py:topic:decorators
kind: topic
category: Функции
title: Декораторы
summary: Функции, оборачивающие другие функции: логирование, кэш, замер времени; functools.wraps; декораторы с параметрами.
level: intermediate
tags: декоратор, @, обёртка, wraps, кэширование
related: lib:functools.wraps, lib:functools.lru_cache, py:topic:functions
## Простой декоратор
```python
import functools
def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"{func.__name__}{args} -> {result}")
        return result
    return wrapper
@logged
def add(a, b):
    return a + b
add(2, 3)
print(add.__name__)
```
## Декоратор с параметром
```python
def repeat(n):
    def deco(func):
        def wrapper(*a):
            return [func(*a) for _ in range(n)]
        return wrapper
    return deco
@repeat(3)
def hi(name):
    return "hi " + name
print(hi("Ann"))
```
## Встроенные декораторы
@property, @staticmethod, @classmethod, @functools.lru_cache, @functools.cache, @dataclasses.dataclass, @contextlib.contextmanager.

# id: py:topic:iterators
kind: topic
category: Итераторы и генераторы
title: Итераторы и протокол итерации
summary: iter() и next(), методы __iter__ и __next__, StopIteration; как работает цикл for.
level: intermediate
tags: итератор, iter, next, __iter__, __next__, StopIteration
related: py:builtin:iter, py:topic:generators, err:StopIteration, lib:itertools
## Как работает for
for x in obj вызывает iter(obj), затем повторяет next() до исключения StopIteration.
```python
it = iter([1, 2])
print(next(it), next(it), next(it, None))
class Countdown:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1
print(list(Countdown(3)))
```
## Итерируемое и итератор
Список итерируемый (его можно обойти много раз), итератор одноразовый.

# id: py:topic:generators
kind: topic
category: Итераторы и генераторы
title: Генераторы и yield
summary: Ленивые последовательности: функции-генераторы, генераторные выражения, yield from, бесконечные потоки.
level: intermediate
tags: генератор, yield, ленивые вычисления, yield from, бесконечная последовательность
related: py:keyword:yield, py:topic:iterators, lib:itertools.islice
## Функция-генератор
```python
def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
from itertools import islice
print(list(islice(fib(), 10)))
def read_numbers(lines):
    for line in lines:
        yield from map(int, line.split())
print(sum(read_numbers(["1 2", "3"])))
```
## Преимущества
Значения создаются по одному — память O(1) вместо O(n). Генератор одноразовый.

# id: py:topic:context-managers
kind: topic
category: Продвинутое
title: Менеджеры контекста и with
summary: Гарантированное освобождение ресурсов: __enter__/__exit__, contextlib.contextmanager, suppress, ExitStack.
level: intermediate
tags: with, контекстный менеджер, __enter__, __exit__, contextlib
related: py:keyword:with, lib:contextlib.contextmanager, py:builtin:open
## Класс-менеджер
```python
import time
class Timer:
    def __enter__(self):
        self.t = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t
        return False
with Timer() as t:
    sum(range(10**5))
print(t.elapsed > 0)
```
## contextlib
```python
from contextlib import suppress, contextmanager
with suppress(ZeroDivisionError):
    1 / 0
@contextmanager
def changed(d, key, value):
    old = d.get(key)
    d[key] = value
    try:
        yield d
    finally:
        d[key] = old
cfg = {"debug": False}
with changed(cfg, "debug", True):
    print(cfg)
print(cfg)
```
