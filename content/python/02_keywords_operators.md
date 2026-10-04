# id: py:keyword:if
kind: keyword
category: Ключевые слова
title: if / elif / else
summary: Условный оператор: выполняет блок, если условие истинно; elif — дополнительные проверки, else — иначе.
check: keyword:if, keyword:elif, keyword:else
tags: условие, ветвление, если, иначе
related: py:topic:conditions, py:op:ternary, py:builtin:bool
## Пример
```python
t = 25
if t > 30:
    print("жарко")
elif t > 15:
    print("тепло")
else:
    print("холодно")
```
## Особенности
Условие может быть любым объектом — проверяется его истинность. Проверяется только первая подходящая ветка.

# id: py:keyword:for
kind: keyword
category: Ключевые слова
title: for … in
summary: Цикл по элементам итерируемого объекта; поддерживает else, break и continue.
check: keyword:for, keyword:in
tags: цикл, перебор, итерация, повтор
related: py:builtin:range, py:builtin:enumerate, py:topic:loops, py:keyword:break
## Пример
```python
for ch in "abc":
    print(ch, end=" ")
print()
for i, x in enumerate([10, 20]):
    print(i, x)
for k, v in {"a": 1}.items():
    print(k, v)
```
## Особенности
Блок else после цикла выполняется, если цикл завершился без break.

# id: py:keyword:while
kind: keyword
category: Ключевые слова
title: while
summary: Цикл, повторяющийся, пока условие истинно.
check: keyword:while
tags: цикл с условием, пока, бесконечный цикл
related: py:keyword:break, py:topic:loops
## Пример
```python
n, steps = 27, 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print(steps)
```
## Ошибки
Если условие никогда не станет ложным, цикл бесконечный: проверяйте, что переменная условия меняется.

# id: py:keyword:break
kind: keyword
category: Ключевые слова
title: break и continue
summary: break — выйти из цикла, continue — перейти к следующей итерации.
check: keyword:break, keyword:continue
tags: прервать цикл, пропустить итерацию
related: py:keyword:for, py:keyword:while
## Пример
```python
for x in range(10):
    if x % 2:
        continue
    if x > 6:
        break
    print(x, end=" ")
print()
```
## Особенности
break выходит только из ближайшего цикла. Для выхода из вложенных циклов используйте флаг, функцию с return или for…else.

# id: py:keyword:pass
kind: keyword
category: Ключевые слова
title: pass
summary: Пустая инструкция — заглушка там, где синтаксис требует блок.
check: keyword:pass
tags: заглушка, пустой блок
related: py:keyword:def
## Пример
```python
class Empty:
    pass
def todo_later():
    pass
print(Empty(), todo_later())
```

# id: py:keyword:def
kind: keyword
category: Ключевые слова
title: def и return
summary: def объявляет функцию, return возвращает из неё значение.
check: keyword:def, keyword:return
tags: функция, объявление функции, вернуть значение
related: py:topic:functions, py:topic:args-kwargs, py:keyword:lambda
## Пример
```python
def area(w, h=1):
    """Площадь прямоугольника."""
    return w * h
def min_max(a):
    return min(a), max(a)
print(area(3, 4), area(5), min_max([3, 1, 2]), area.__doc__)
```
## Особенности
Функция без return возвращает None. Несколько значений возвращаются кортежем.

# id: py:keyword:lambda
kind: keyword
category: Ключевые слова
title: lambda
summary: Анонимная функция из одного выражения.
check: keyword:lambda
tags: анонимная функция, key, короткая функция
related: py:keyword:def, py:builtin:sorted, py:builtin:map
## Пример
```python
square = lambda x: x * x
pairs = [(1, "b"), (2, "a")]
print(square(5), sorted(pairs, key=lambda p: p[1]))
```
## Особенности
В lambda нельзя писать инструкции (присваивание, циклы). Для сложной логики используйте def.

# id: py:keyword:class
kind: keyword
category: Ключевые слова
title: class
summary: Объявление класса — шаблона для создания объектов.
check: keyword:class
tags: класс, ООП, объект, экземпляр
related: py:topic:oop, py:topic:inheritance, py:topic:magic-methods
## Пример
```python
class Counter:
    def __init__(self):
        self.value = 0
    def inc(self):
        self.value += 1
        return self
c = Counter()
print(c.inc().inc().value)
```

# id: py:keyword:import
kind: keyword
category: Ключевые слова
title: import, from, as
summary: Подключение модулей и имён из модулей.
check: keyword:import, keyword:from, keyword:as
tags: импорт, модуль, библиотека, подключить
related: py:topic:import-system, py:topic:modules, err:ModuleNotFoundError
## Пример
```python
import math
import collections as col
from itertools import permutations as perms
print(math.pi, col.Counter("aab"), len(list(perms(range(3)))))
```
## Особенности
from module import * загромождает пространство имён — избегайте его.

# id: py:keyword:try
kind: keyword
category: Ключевые слова
title: try / except / else / finally
summary: Обработка исключений: перехват ошибок и гарантированное завершающее действие.
check: keyword:try, keyword:except, keyword:finally
tags: исключение, ошибка, перехват, обработка ошибок
related: py:topic:exceptions, py:keyword:raise
## Пример
```python
for s in ["10", "x", "0"]:
    try:
        r = 100 // int(s)
    except ValueError:
        print(s, "— не число")
    except ZeroDivisionError as e:
        print(s, "—", e)
    else:
        print(s, "→", r)
    finally:
        pass
```

# id: py:keyword:raise
kind: keyword
category: Ключевые слова
title: raise
summary: Возбуждает исключение (своё или повторно текущее).
check: keyword:raise
tags: бросить исключение, ошибка, сгенерировать ошибку
related: py:keyword:try, py:topic:exceptions
## Пример
```python
def sqrt_int(n):
    if n < 0:
        raise ValueError("n должно быть ≥ 0")
    return int(n ** 0.5)
try:
    sqrt_int(-1)
except ValueError as e:
    print("ошибка:", e)
```
## Особенности
raise … from e сохраняет причину исключения в цепочке traceback.

# id: py:keyword:with
kind: keyword
category: Ключевые слова
title: with
summary: Менеджер контекста: автоматически выполняет действия при входе и выходе из блока.
check: keyword:with
tags: контекстный менеджер, закрыть файл, ресурсы
related: py:topic:context-managers, py:builtin:open
## Пример
```python
from contextlib import contextmanager
@contextmanager
def tag(name):
    print(f"<{name}>")
    yield
    print(f"</{name}>")
with tag("b"):
    print("текст")
```

# id: py:keyword:yield
kind: keyword
category: Ключевые слова
title: yield
summary: Превращает функцию в генератор, выдающий значения по одному.
check: keyword:yield
tags: генератор, ленивые вычисления
related: py:topic:generators, py:topic:iterators
## Пример
```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1
print(list(countdown(3)))
def chain(*its):
    for it in its:
        yield from it
print(list(chain("ab", [1, 2])))
```

# id: py:keyword:global
kind: keyword
category: Ключевые слова
title: global и nonlocal
summary: Позволяют изменять переменную внешней (глобальной или объемлющей функции) области видимости.
check: keyword:global, keyword:nonlocal
tags: область видимости, глобальная переменная, замыкание
related: err:UnboundLocalError, py:topic:scope
## Пример
```python
total = 0
def add(x):
    global total
    total += x
def make_counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc
add(5)
c = make_counter()
print(total, c(), c())
```

# id: py:keyword:and
kind: keyword
category: Ключевые слова
title: and, or, not
summary: Логические операторы с сокращённым вычислением; and/or возвращают один из операндов.
check: keyword:and, keyword:or, keyword:not
tags: логическое и, или, не, условие
related: py:op:logical, py:builtin:bool
## Пример
```python
x = 7
print(x > 0 and x < 10, x < 0 or x > 5, not x)
print(0 or "по умолчанию", "a" and "b", None or [])
```

# id: py:keyword:in
kind: keyword
category: Ключевые слова
title: in и not in
summary: Проверка принадлежности элемента коллекции (и часть синтаксиса for).
check: keyword:in
tags: содержится ли, принадлежность, поиск
related: py:op:membership, py:topic:sets
## Пример
```python
print(3 in [1, 2, 3], "py" in "python", "a" in {"a": 1}, 5 not in range(5))
```

# id: py:keyword:is
kind: keyword
category: Ключевые слова
title: is и is not
summary: Проверка идентичности: один и тот же ли это объект.
check: keyword:is
tags: идентичность, is None, сравнение объектов
related: py:op:is, py:builtin:id
## Пример
```python
a = [1]
b = a
c = [1]
print(a is b, a is c, a == c, None is None)
```

# id: py:keyword:None
kind: keyword
category: Ключевые слова
title: None, True, False
summary: Встроенные константы: «ничего» и логические значения.
check: keyword:None, keyword:True, keyword:False
tags: пустое значение, истина, ложь, null
related: py:builtin:bool, py:keyword:is
## Пример
```python
def find(a, x):
    return a.index(x) if x in a else None
r = find([1, 2], 5)
print(r is None, True + True, type(None).__name__)
```

# id: py:keyword:del
kind: keyword
category: Ключевые слова
title: del
summary: Удаляет имя, элемент коллекции или срез.
check: keyword:del
tags: удалить, удаление элемента
related: py:method:list.pop, py:topic:dicts
## Пример
```python
a = [0, 1, 2, 3, 4]
del a[0]
del a[1:3]
d = {"x": 1, "y": 2}
del d["x"]
print(a, d)
```

# id: py:keyword:assert
kind: keyword
category: Ключевые слова
title: assert
summary: Проверка условия для отладки; при ложном условии — AssertionError.
check: keyword:assert
tags: проверка, отладка, тест
related: err:AssertionError, py:topic:testing
## Пример
```python
def mean(a):
    assert a, "список пуст"
    return sum(a) / len(a)
print(mean([2, 4]))
```

# id: py:keyword:async
kind: keyword
category: Ключевые слова
title: async и await
summary: Объявление сопрограмм и ожидание асинхронных операций.
check: keyword:async, keyword:await
tags: асинхронность, сопрограмма, корутина
related: py:topic:async-await, lib:asyncio
## Пример
```python
import asyncio
async def work(name, delay):
    await asyncio.sleep(delay)
    return name
async def main():
    print(await asyncio.gather(work("A", 0.02), work("B", 0.01)))
asyncio.run(main())
```

# id: py:keyword:match
kind: keyword
category: Ключевые слова
title: match / case
summary: Структурное сопоставление с образцом (Python 3.10+).
check: keyword:match, keyword:case
tags: сопоставление с образцом, switch, pattern matching
related: py:topic:conditions
## Пример
```python
def describe(cmd):
    match cmd.split():
        case ["go", direction]:
            return f"идти {direction}"
        case ["take", *items] if items:
            return "взять " + ", ".join(items)
        case ["quit" | "exit"]:
            return "выход"
        case _:
            return "непонятно"
for c in ["go north", "take key map", "exit", "jump"]:
    print(describe(c))
```
## Особенности
match и case — «мягкие» ключевые слова: их можно использовать как обычные имена вне конструкции.

# id: py:op:arithmetic
kind: operator
category: Операторы
title: Арифметические операторы + - * / // % **
summary: Сложение, вычитание, умножение, деление, целочисленное деление, остаток, степень.
tags: сложение, вычитание, умножение, деление, остаток, степень, арифметика
related: py:op:floordiv, py:op:mod, py:op:truediv, py:op:pow, algo:arithmetic
## Пример
```python
a, b = 17, 5
print(a + b, a - b, a * b, a / b, a // b, a % b, a ** 2, -a // b, -a % b)
print("ab" + "cd", "ab" * 3, [1] * 3 + [2])
```
## Приоритет
** выше унарного минуса: -2 ** 2 == -4. Затем * / // %, затем + -.

# id: py:op:truediv
kind: operator
category: Операторы
title: Деление /
summary: «Истинное» деление: результат всегда float.
tags: деление, дробный результат
related: py:op:floordiv, err:ZeroDivisionError
## Пример
```python
print(7 / 2, 6 / 3, type(6 / 3).__name__, 1 / 3)
```

# id: py:op:floordiv
kind: operator
category: Операторы
title: Целочисленное деление //
summary: Деление с округлением вниз (к −∞).
tags: целая часть, деление нацело, округление вниз
related: py:op:mod, py:builtin:divmod, algo:digits
## Пример
```python
print(7 // 2, -7 // 2, 7.5 // 2, 1234 // 10)
```
## Особенности
Для отрицательных результатов // отличается от int(a / b): -7 // 2 == -4, а int(-7 / 2) == -3.

# id: py:op:mod
kind: operator
category: Операторы
title: Остаток от деления %
summary: Остаток со знаком делителя; основа проверок чётности и разбора цифр.
tags: остаток, чётность, кратность, последняя цифра, модуль
related: py:op:floordiv, algo:digits, algo:modular
## Пример
```python
print(17 % 5, -17 % 5, 17 % -5, 1234 % 10, 10 % 2 == 0)
```
## Особенности
Тождество a == (a // b) * b + a % b выполняется всегда. Для строк % — старый способ форматирования: "%d%%" % 5.

# id: py:op:pow
kind: operator
category: Операторы
title: Возведение в степень **
summary: a ** b; правоассоциативен: 2 ** 3 ** 2 == 2 ** 9.
tags: степень, квадрат, корень
related: py:builtin:pow, algo:fast-power
## Пример
```python
print(2 ** 10, 2 ** 3 ** 2, (-2) ** 2, -2 ** 2, 16 ** 0.5, 2 ** -1)
```

# id: py:op:comparison
kind: operator
category: Операторы
title: Сравнения == != < > <= >=
summary: Сравнивают значения; поддерживают цепочки a < b < c.
tags: сравнение, равно, больше, меньше, не равно
related: py:topic:comparisons, py:op:is
## Пример
```python
x = 5
print(x == 5, x != 5, 1 < x <= 10, "apple" < "banana", [1, 2] < [1, 3], (1, "b") > (1, "a"))
```
## Особенности
Строки, списки и кортежи сравниваются лексикографически. Числа разных типов сравниваются по значению: 1 == 1.0.

# id: py:op:logical
kind: operator
category: Операторы
title: Логические операторы and, or, not
summary: Ленивые логические операции; and/or возвращают последний вычисленный операнд.
tags: логика, и, или, не, short-circuit
related: py:keyword:and
## Пример
```python
def side():
    print("вычислено")
    return True
print(False and side())
print(True or side())
print([] or "пусто", 0 and 1 / 0)
```

# id: py:op:bitwise
kind: operator
category: Операторы
title: Побитовые операторы & | ^ ~ << >>
summary: Операции над двоичными разрядами целых чисел.
tags: биты, маска, xor, сдвиг
related: algo:bits
## Пример
```python
a, b = 0b1100, 0b1010
print(a & b, a | b, a ^ b, ~a, a << 2, a >> 2, bin(a & b))
```
## Особенности
Для множеств те же операторы означают пересечение, объединение и симметрическую разность.

# id: py:op:assignment
kind: operator
category: Операторы
title: Присваивание = += -= *= и другие
summary: Связывает имя с объектом; составные операторы изменяют значение на месте или создают новое.
tags: присваивание, увеличить, множественное присваивание, распаковка
related: py:op:walrus, py:topic:variables
## Пример
```python
x = 5
x += 2
x *= 3
a, b = 1, 2
a, b = b, a
first, *rest = [1, 2, 3, 4]
p = q = []
p.append(1)
print(x, a, b, first, rest, q)
```
## Особенности
Для списков += изменяет список на месте (extend), для неизменяемых типов создаёт новый объект.

# id: py:op:walrus
kind: operator
category: Операторы
title: Моржовый оператор :=
summary: Присваивание внутри выражения (Python 3.8+).
tags: walrus, присваивание в условии, морж
related: py:op:assignment, py:keyword:while
## Пример
```python
import io, sys
sys.stdin = io.StringIO("3\n4\n0\n")
total = 0
while (x := int(input())) != 0:
    total += x
data = [1, 5, 9]
if (n := len(data)) > 2:
    print("длина", n)
print(total)
```

# id: py:op:membership
kind: operator
category: Операторы
title: Операторы принадлежности in, not in
summary: x in s — содержится ли x в s; сложность зависит от типа коллекции.
tags: in, проверить наличие, содержит
related: py:keyword:in, algo:complexity
## Пример
```python
print(2 in [1, 2], 2 in {1, 2}, "b" in {"a": 1, "b": 2}, "ell" in "hello", 10**9 in range(10**10))
```
## Сложность
list/tuple/str — O(n), set/dict — O(1) в среднем, range — O(1).

# id: py:op:is
kind: operator
category: Операторы
title: Операторы идентичности is, is not
summary: Проверяют, указывают ли имена на один объект.
tags: is None, идентичность, тот же объект
related: py:keyword:is, py:builtin:id
## Пример
```python
x = None
print(x is None, [] is [], (a := [1]) is a)
```
## Особенности
Используйте is только для None, True/False и маркеров-синглтонов. Числа и строки сравнивайте через ==.

# id: py:op:ternary
kind: operator
category: Операторы
title: Условное выражение A if условие else B
summary: Выбор значения по условию в одном выражении.
tags: тернарный оператор, условное выражение
related: py:keyword:if
## Пример
```python
n = 7
print("чётное" if n % 2 == 0 else "нечётное", [x if x > 0 else 0 for x in [-1, 2, -3]])
```

# id: py:op:unpacking
kind: operator
category: Операторы
title: Распаковка * и **
summary: * раскрывает итерируемый объект в позиционные аргументы или элементы, ** — словарь в именованные аргументы.
tags: распаковка, звёздочка, args, kwargs
related: py:topic:args-kwargs
## Пример
```python
nums = [1, 2, 3]
print(*nums)
def f(a, b, c):
    return a + b + c
print(f(*nums), f(**{"a": 1, "b": 2, "c": 3}))
print([*nums, 4], {**{"x": 1}, "y": 2}, {*"ab", "c"} == {"a", "b", "c"})
```

# id: py:op:indexing
kind: operator
category: Операторы
title: Индексация и срезы []
summary: a[i] — элемент, a[i:j:k] — срез; для словарей d[key].
tags: индекс, срез, обращение по ключу
related: py:topic:slicing, err:IndexError, err:KeyError
## Пример
```python
s = "Python"
print(s[0], s[-1], s[1:4], s[::-1], s[::2])
m = [[1, 2], [3, 4]]
print(m[1][0], {"k": "v"}["k"])
```

# id: py:op:matmul
kind: operator
category: Операторы
title: Матричное умножение @
summary: Оператор для матричного умножения (используется в NumPy и своих классах через __matmul__).
tags: матрица, @, умножение матриц
related: py:topic:magic-methods, ext:numpy
## Пример
```python
class M:
    def __init__(self, rows):
        self.rows = rows
    def __matmul__(self, other):
        cols = list(zip(*other.rows))
        return M([[sum(a * b for a, b in zip(r, c)) for c in cols] for r in self.rows])
print((M([[1, 2], [3, 4]]) @ M([[5, 6], [7, 8]])).rows)
```
## Особенности
У встроенных типов Python оператор @ не реализован — он предназначен для библиотек и собственных классов.
