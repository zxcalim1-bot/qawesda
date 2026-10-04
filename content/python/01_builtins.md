# id: py:builtin:sorted
kind: builtin
category: Встроенные функции
title: sorted()
summary: Возвращает новый отсортированный список из элементов итерируемого объекта.
sig: sorted(iterable, /, *, key=None, reverse=False)
check: sorted
complexity: O(n log n)
memory: O(n)
tags: сортировка, sort, упорядочить, по возрастанию, по убыванию, key
related: py:method:list.sort, algo:sorting, py:builtin:reversed, lib:functools.cmp_to_key
## Пример
```python
print(sorted([3, 1, 2]))
print(sorted("банан"))
print(sorted(["bb", "a", "ccc"], key=len, reverse=True))
print(sorted({"b": 2, "a": 1}))
```
## Параметры
- iterable — любой итерируемый объект: список, строка, множество, словарь (сортируются ключи), генератор.
- key — функция, вычисляющая ключ сравнения для каждого элемента.
- reverse=True — сортировать по убыванию.
## Особенности
Сортировка устойчивая: элементы с равными ключами сохраняют исходный порядок. Исходный объект не меняется, в отличие от list.sort().
## Ошибки
Элементы должны быть сравнимы между собой: sorted([1, "a"]) вызовет TypeError.

# id: py:builtin:print
kind: builtin
category: Встроенные функции
title: print()
summary: Выводит значения в стандартный вывод (или файл), разделяя их пробелом и завершая переводом строки.
sig: print(*objects, sep=' ', end='\n', file=None, flush=False)
check: print
tags: вывод, напечатать, sep, end, вывести на экран
related: py:builtin:input, py:topic:f-strings, py:topic:print-input
## Пример
```python
print("Привет", "мир")
print(1, 2, 3, sep=", ")
print("без перевода строки", end="")
print(" — продолжение")
print(*[1, 2, 3])
```
## Параметры
- sep — разделитель между значениями (по умолчанию пробел).
- end — что вывести в конце (по умолчанию перевод строки).
- file — куда писать (например, sys.stderr или открытый файл); flush=True сбрасывает буфер сразу.
## Особенности
print превращает каждый аргумент в строку через str(). Функция возвращает None.

# id: py:builtin:input
kind: builtin
category: Встроенные функции
title: input()
summary: Читает строку из стандартного ввода (без символа перевода строки) и возвращает её как str.
sig: input(prompt='', /)
check: input
tags: ввод, прочитать, клавиатура, stdin, строка
related: py:builtin:print, py:builtin:int, py:method:str.split, err:EOFError, py:topic:print-input
## Пример
```python
import io, sys
sys.stdin = io.StringIO("Ali\n3 4\n")
name = input()
a, b = map(int, input().split())
print(name, a + b)
```
## Особенности
input() всегда возвращает строку. Для чисел используйте int(input()) или map(int, input().split()). Если ввод закончился, возникает EOFError.
## Олимпиадное применение
Для больших объёмов данных быстрее читать всё сразу: sys.stdin.readline или sys.stdin.read().split().

# id: py:builtin:len
kind: builtin
category: Встроенные функции
title: len()
summary: Возвращает количество элементов последовательности или коллекции.
sig: len(s, /)
check: len
complexity: O(1)
tags: длина, размер, количество элементов, size, length
related: py:topic:lists, py:topic:strings
## Пример
```python
print(len("Python"), len([1, 2, 3]), len({"a": 1}), len(range(10)), len(set("aab")))
```
## Ошибки
len(5) — TypeError: у числа нет длины. Для генераторов len не работает: превратите в список или посчитайте sum(1 for _ in gen).

# id: py:builtin:range
kind: builtin
category: Встроенные функции
title: range()
summary: Неизменяемая последовательность целых чисел: от start до stop (не включая) с шагом step.
sig: range(stop) / range(start, stop[, step])
check: range
complexity: O(1) создание, O(1) доступ по индексу
memory: O(1)
tags: диапазон, цикл for, числа подряд, шаг
related: py:keyword:for, py:topic:loops
## Пример
```python
print(list(range(5)), list(range(2, 10, 3)), list(range(10, 0, -2)))
r = range(0, 100, 7)
print(len(r), r[3], 49 in r, r[-1])
```
## Особенности
range не хранит все числа — он вычисляет их по формуле, поэтому range(10**18) занимает мало памяти, а проверка x in range выполняется за O(1).
## Ошибки
Шаг 0 запрещён (ValueError). Аргументы должны быть целыми: range(2.5) — TypeError.

# id: py:builtin:int
kind: builtin
category: Встроенные функции
title: int()
summary: Создаёт целое число из числа или строки (в том числе в системе счисления base).
sig: int(x=0) / int(x, base=10)
check: int
tags: целое число, преобразование, перевод в число, система счисления
related: py:builtin:float, py:builtin:str, err:ValueError, algo:number-systems
## Пример
```python
print(int("42"), int(" -7 "), int(3.99), int(-3.99), int("ff", 16), int("101", 2), int("0x1f", 0))
```
## Особенности
int(float) отбрасывает дробную часть (округление к нулю). Целые числа Python имеют произвольную длину.
## Ошибки
int("3.5") и int("abc") — ValueError. Строки длиннее 4300 цифр по умолчанию не преобразуются (Python 3.11+).

# id: py:builtin:float
kind: builtin
category: Встроенные функции
title: float()
summary: Создаёт число с плавающей точкой из числа или строки.
sig: float(x=0.0, /)
check: float
tags: дробное число, вещественное, преобразование, точка
related: py:builtin:int, py:builtin:round, algo:arithmetic
## Пример
```python
print(float("3.14"), float(2), float("1e-3"), float("inf"), float("nan") != float("nan"))
print(0.1 + 0.2, f"{0.1 + 0.2:.2f}")
```
## Особенности
float — двоичное число двойной точности (около 15–17 значащих цифр), поэтому 0.1 + 0.2 ≠ 0.3. Для точных расчётов — decimal или fractions.
## Ошибки
float("3,14") — ValueError: десятичный разделитель — точка.

# id: py:builtin:str
kind: builtin
category: Встроенные функции
title: str()
summary: Преобразует объект в строку (через его метод __str__).
sig: str(object='') / str(bytes, encoding, errors)
check: str
tags: строка, преобразование в строку, текст
related: py:builtin:repr, py:topic:strings, py:topic:f-strings
## Пример
```python
print(str(42) + "!", str(3.5), str([1, 2]), str(None), str(b"hi", "utf-8"))
```
## Особенности
str(x) — «человеческое» представление, repr(x) — однозначное, для отладки.

# id: py:builtin:bool
kind: builtin
category: Встроенные функции
title: bool()
summary: Возвращает True или False — истинность объекта.
sig: bool(x=False, /)
check: bool
tags: логическое значение, истина, ложь, truthy, falsy
related: py:keyword:True, py:keyword:if, py:topic:types
## Пример
```python
print(bool(0), bool(0.0), bool(""), bool([]), bool({}), bool(None))
print(bool(5), bool("0"), bool([0]), bool(-1))
```
## Особенности
Ложными считаются: False, None, 0, 0.0, пустые строки и коллекции. Всё остальное истинно. bool — подкласс int: True == 1, False == 0.

# id: py:builtin:abs
kind: builtin
category: Встроенные функции
title: abs()
summary: Модуль (абсолютное значение) числа.
sig: abs(x, /)
check: abs
tags: модуль числа, абсолютное значение, без знака
related: lib:math.fabs
## Пример
```python
print(abs(-5), abs(3.2), abs(-0.0), abs(3 + 4j))
```
## Особенности
Для комплексного числа возвращает его длину: abs(3+4j) = 5.0.

# id: py:builtin:min
kind: builtin
category: Встроенные функции
title: min()
summary: Наименьший элемент итерируемого объекта или наименьший из аргументов.
sig: min(iterable, *, key=None, default=...) / min(a, b, *args, key=None)
check: min
complexity: O(n)
tags: минимум, наименьший, самый маленький
related: py:builtin:max, py:builtin:sorted, lib:heapq.nsmallest
## Пример
```python
print(min(3, 1, 2), min([5, 4]), min("hello"), min(["bb", "a", "ccc"], key=len), min([], default=0))
```
## Ошибки
min([]) — ValueError (пустая последовательность); используйте default=.

# id: py:builtin:max
kind: builtin
category: Встроенные функции
title: max()
summary: Наибольший элемент итерируемого объекта или наибольший из аргументов.
sig: max(iterable, *, key=None, default=...) / max(a, b, *args, key=None)
check: max
complexity: O(n)
tags: максимум, наибольший, самый большой
related: py:builtin:min, lib:heapq.nlargest
## Пример
```python
words = ["kiwi", "banana", "fig"]
print(max(words), max(words, key=len), max(range(10), key=lambda x: x % 7))
d = {"a": 3, "b": 7}
print(max(d, key=d.get))
```
## Особенности
При равных ключах возвращается первый встреченный элемент.

# id: py:builtin:sum
kind: builtin
category: Встроенные функции
title: sum()
summary: Сумма элементов итерируемого объекта плюс начальное значение start.
sig: sum(iterable, /, start=0)
check: sum
complexity: O(n)
tags: сумма, сложить все, итог
related: lib:math.fsum, lib:math.prod, lib:itertools.accumulate
## Пример
```python
print(sum([1, 2, 3]), sum(range(101)), sum(x * x for x in range(4)), sum([[1], [2]], []))
print(sum([0.1] * 10), __import__("math").fsum([0.1] * 10))
```
## Ошибки
sum(["a", "b"]) — TypeError: для строк используйте "".join(...).

# id: py:builtin:map
kind: builtin
category: Встроенные функции
title: map()
summary: Применяет функцию к каждому элементу и возвращает ленивый итератор результатов.
sig: map(function, iterable, *iterables)
check: map
tags: применить функцию, преобразовать все элементы, ленивый
related: py:builtin:filter, py:topic:comprehensions, py:topic:functional
## Пример
```python
print(list(map(int, "1 2 3".split())))
print(list(map(lambda x, y: x * y, [1, 2, 3], [4, 5, 6])))
m = map(str.upper, ["a", "b"])
print(next(m), list(m), list(m))
```
## Особенности
map ленивый: значения вычисляются по требованию и только один раз. Для простых случаев генератор списка часто нагляднее.

# id: py:builtin:filter
kind: builtin
category: Встроенные функции
title: filter()
summary: Оставляет элементы, для которых функция возвращает истину (ленивый итератор).
sig: filter(function, iterable)
check: filter
tags: отфильтровать, отбор, условие
related: py:builtin:map, py:topic:comprehensions
## Пример
```python
print(list(filter(lambda x: x % 2 == 0, range(10))))
print(list(filter(None, [0, 1, "", "a", None, [0]])))
```
## Особенности
filter(None, it) оставляет только истинные значения.

# id: py:builtin:zip
kind: builtin
category: Встроенные функции
title: zip()
summary: Объединяет несколько итерируемых объектов в кортежи по позициям.
sig: zip(*iterables, strict=False)
check: zip
tags: пары, параллельный обход, транспонирование, склеить списки
related: py:builtin:enumerate, lib:itertools.zip_longest, algo:matrices
## Пример
```python
names = ["Ann", "Bob", "Cid"]
ages = [20, 31]
print(list(zip(names, ages)))
print(dict(zip("abc", range(3))))
m = [[1, 2, 3], [4, 5, 6]]
print(list(zip(*m)))
a = [1, 2, 3, 4]
print([y - x for x, y in zip(a, a[1:])])
```
## Особенности
zip останавливается на самом коротком объекте; strict=True (3.10+) требует равных длин; itertools.zip_longest дополняет недостающие значения.

# id: py:builtin:enumerate
kind: builtin
category: Встроенные функции
title: enumerate()
summary: Возвращает пары (номер, элемент) при обходе последовательности.
sig: enumerate(iterable, start=0)
check: enumerate
tags: номер элемента, индекс в цикле, нумерация
related: py:builtin:zip, py:keyword:for
## Пример
```python
for i, ch in enumerate("abc", 1):
    print(i, ch)
print([i for i, x in enumerate([5, 0, 7, 0]) if x == 0])
```
## Особенности
Вместо for i in range(len(a)): a[i] лучше писать for i, x in enumerate(a).

# id: py:builtin:reversed
kind: builtin
category: Встроенные функции
title: reversed()
summary: Возвращает итератор по элементам последовательности в обратном порядке.
sig: reversed(seq, /)
check: reversed
complexity: O(1) создание
tags: развернуть, обратный порядок
related: py:method:list.reverse, py:topic:slicing
## Пример
```python
print(list(reversed([1, 2, 3])), "".join(reversed("abc")), list(reversed(range(4))))
```
## Ошибки
reversed для множества или генератора — TypeError (нужна последовательность или метод __reversed__).

# id: py:builtin:round
kind: builtin
category: Встроенные функции
title: round()
summary: Округляет число до ndigits знаков после точки (по умолчанию до целого).
sig: round(number, ndigits=None)
check: round
tags: округление, знаки после запятой
related: lib:math.floor, lib:math.ceil, py:builtin:format
## Пример
```python
print(round(2.5), round(3.5), round(-2.5), round(2.675, 2), round(1234, -2))
```
## Особенности
Используется банковское округление: .5 округляется к ближайшему чётному. Число 2.675 хранится как 2.67499…, поэтому round(2.675, 2) = 2.67. Для вывода с фиксированными знаками используйте f"{x:.2f}".

# id: py:builtin:divmod
kind: builtin
category: Встроенные функции
title: divmod()
summary: Возвращает пару (a // b, a % b).
sig: divmod(a, b, /)
check: divmod
tags: частное и остаток, деление с остатком
related: py:op:floordiv, py:op:mod, task:seconds-to-time
## Пример
```python
print(divmod(17, 5), divmod(-17, 5), divmod(7.5, 2))
h, rest = divmod(3725, 3600)
m, s = divmod(rest, 60)
print(h, m, s)
```

# id: py:builtin:pow
kind: builtin
category: Встроенные функции
title: pow()
summary: Возведение в степень; с третьим аргументом — по модулю (быстро).
sig: pow(base, exp, mod=None)
check: pow
complexity: O(log exp) с модулем
tags: степень, по модулю, обратный элемент
related: algo:fast-power, algo:modular, py:op:pow
## Пример
```python
print(pow(2, 10), pow(2, 10, 1000), pow(3, -1, 7), pow(2, 0.5))
```
## Особенности
pow(a, -1, m) (Python 3.8+) возвращает обратный элемент по модулю m, если он существует.

# id: py:builtin:bin
kind: builtin
category: Встроенные функции
title: bin(), oct(), hex()
summary: Запись целого числа в двоичной, восьмеричной и шестнадцатеричной системе со префиксом.
sig: bin(x, /) · oct(x, /) · hex(x, /)
check: bin, oct, hex
tags: двоичная запись, шестнадцатеричная, восьмеричная, системы счисления
related: algo:number-systems, py:builtin:int, py:builtin:format
## Пример
```python
print(bin(10), oct(8), hex(255), bin(-5))
print(format(10, "b"), format(255, "X"), format(5, "08b"), bin(10)[2:])
```

# id: py:builtin:ord
kind: builtin
category: Встроенные функции
title: ord() и chr()
summary: ord — код символа Unicode, chr — символ по коду.
sig: ord(c, /) · chr(i, /)
check: ord, chr
tags: код символа, ASCII, Unicode, буква по номеру
related: task:caesar, py:topic:strings
## Пример
```python
print(ord("A"), ord("a"), ord("Я"), chr(65), chr(1071))
print("".join(chr(ord("a") + i) for i in range(5)))
```

# id: py:builtin:isinstance
kind: builtin
category: Встроенные функции
title: isinstance()
summary: Проверяет, является ли объект экземпляром класса (или одного из классов кортежа).
sig: isinstance(object, classinfo, /)
check: isinstance
tags: проверка типа, тип объекта, наследование
related: py:builtin:type, py:builtin:issubclass, py:topic:oop
## Пример
```python
print(isinstance(5, int), isinstance(True, int), isinstance(3.0, (int, float)), isinstance("a", list))
```
## Особенности
isinstance учитывает наследование, поэтому предпочтительнее сравнения type(x) == int.

# id: py:builtin:type
kind: builtin
category: Встроенные функции
title: type()
summary: С одним аргументом возвращает тип объекта; с тремя — создаёт новый класс.
sig: type(object) / type(name, bases, dict)
check: type
tags: тип объекта, класс, метакласс
related: py:builtin:isinstance, py:topic:metaclasses
## Пример
```python
print(type(5), type("a").__name__, type([]) is list)
Point = type("Point", (), {"x": 0, "y": 0})
print(Point.__name__, Point().x)
```

# id: py:builtin:id
kind: builtin
category: Встроенные функции
title: id()
summary: Уникальный идентификатор объекта на время его жизни (в CPython — адрес в памяти).
sig: id(object, /)
check: id
tags: идентичность, адрес объекта, is
related: py:op:is, py:cpython:objects
## Пример
```python
a = [1, 2]
b = a
c = [1, 2]
print(id(a) == id(b), id(a) == id(c), a is b, a == c)
```

# id: py:builtin:hash
kind: builtin
category: Встроенные функции
title: hash()
summary: Хеш-значение объекта — используется словарями и множествами.
sig: hash(object, /)
check: hash
tags: хеш, хешируемый, ключ словаря
related: algo:hashing, err:TypeError-unhashable
## Пример
```python
print(hash(42), hash((1, 2)) == hash((1, 2)), hash(1) == hash(1.0))
try:
    hash([1, 2])
except TypeError as e:
    print(e)
```
## Особенности
Хеш строк меняется между запусками интерпретатора (рандомизация), хеши чисел стабильны.

# id: py:builtin:open
kind: builtin
category: Встроенные функции
title: open()
summary: Открывает файл и возвращает файловый объект для чтения или записи.
sig: open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)
check: open
tags: файл, чтение, запись, кодировка, with
related: py:topic:files, err:FileNotFoundError, lib:pathlib.Path
## Пример
```python
import os, tempfile
path = os.path.join(tempfile.mkdtemp(), "data.txt")
with open(path, "w", encoding="utf-8") as f:
    f.write("строка 1\nстрока 2\n")
with open(path, encoding="utf-8") as f:
    for line in f:
        print(line.rstrip())
```
## Режимы
- "r" — чтение (по умолчанию), "w" — запись с очисткой, "a" — дозапись, "x" — создать новый.
- "b" — двоичный режим (bytes), "t" — текстовый (по умолчанию), "+" — чтение и запись.
## Особенности
Всегда указывайте encoding для текстовых файлов и используйте with — файл закроется автоматически.

# id: py:builtin:iter
kind: builtin
category: Встроенные функции
title: iter() и next()
summary: iter получает итератор объекта, next — следующий элемент итератора.
sig: iter(object[, sentinel]) · next(iterator[, default])
check: iter, next
tags: итератор, следующий элемент, перебор
related: py:topic:iterators, err:StopIteration
## Пример
```python
it = iter([10, 20])
print(next(it), next(it), next(it, "конец"))
import io, sys
sys.stdin = io.StringIO("1\n2\n0\n")
print(list(iter(input, "0")))
```
## Особенности
Форма iter(функция, маркер) вызывает функцию, пока она не вернёт маркер.

# id: py:builtin:any
kind: builtin
category: Встроенные функции
title: any() и all()
summary: any — истинен ли хотя бы один элемент; all — истинны ли все элементы.
sig: any(iterable, /) · all(iterable, /)
check: any, all
complexity: O(n), с ранним выходом
tags: хотя бы один, все, проверка условия
related: py:topic:comprehensions
## Пример
```python
a = [3, 8, 11]
print(any(x > 10 for x in a), all(x > 0 for x in a), any([]), all([]))
```
## Особенности
Обе функции прекращают перебор, как только ответ известен.

# id: py:builtin:dir
kind: builtin
category: Встроенные функции
title: dir() и help()
summary: dir — список атрибутов объекта; help — встроенная справка.
sig: dir([object]) · help([object])
check: dir, help
tags: атрибуты, методы объекта, справка, документация
related: py:builtin:vars, err:AttributeError
## Пример
```python
print([m for m in dir(str) if not m.startswith("_")][:8])
print(len.__doc__.splitlines()[0])
```

# id: py:builtin:getattr
kind: builtin
category: Встроенные функции
title: getattr(), setattr(), hasattr(), delattr()
summary: Чтение, установка, проверка и удаление атрибутов по имени-строке.
sig: getattr(object, name[, default]) · setattr(object, name, value) · hasattr(object, name) · delattr(object, name)
check: getattr, setattr, hasattr, delattr
tags: атрибут по имени, рефлексия, динамический доступ
related: py:topic:oop
## Пример
```python
class P:
    pass
p = P()
setattr(p, "x", 5)
print(getattr(p, "x"), getattr(p, "y", "нет"), hasattr(p, "x"))
delattr(p, "x")
print(hasattr(p, "x"))
```

# id: py:builtin:vars
kind: builtin
category: Встроенные функции
title: vars(), globals(), locals()
summary: Словари имён: атрибуты объекта, глобальная и локальная области видимости.
sig: vars([object]) · globals() · locals()
check: vars, globals, locals
tags: пространство имён, переменные, область видимости
related: py:topic:scope
## Пример
```python
class P:
    def __init__(self):
        self.x, self.y = 1, 2
print(vars(P()))
def f():
    a = 10
    return sorted(locals())
print(f(), "f" in globals())
```

# id: py:builtin:callable
kind: builtin
category: Встроенные функции
title: callable()
summary: Проверяет, можно ли вызвать объект (функция, класс, объект с __call__).
sig: callable(object, /)
check: callable
tags: вызываемый, функция, __call__
related: py:topic:functions
## Пример
```python
class C:
    def __call__(self):
        return "вызов"
print(callable(len), callable(5), callable(C), callable(C()), C()())
```

# id: py:builtin:repr
kind: builtin
category: Встроенные функции
title: repr() и ascii()
summary: repr — однозначное строковое представление для отладки; ascii — то же, но только ASCII-символами.
sig: repr(object, /) · ascii(object, /)
check: repr, ascii
tags: представление, отладка, кавычки
related: py:builtin:str, py:topic:magic-methods
## Пример
```python
s = "Привет\n"
print(str(s), repr(s), ascii(s))
print(repr(1.0), repr([1, "a"]))
```

# id: py:builtin:format
kind: builtin
category: Встроенные функции
title: format()
summary: Форматирует значение по спецификации (как в f-строках после двоеточия).
sig: format(value, format_spec='', /)
check: format
tags: форматирование, ширина, точность, выравнивание
related: py:topic:f-strings, py:method:str.format
## Пример
```python
print(format(3.14159, ".2f"), format(42, "08d"), format(255, "x"), format(1234567, ","), format(0.25, ".0%"), format("ab", "^6") + "|")
```

# id: py:builtin:list
kind: builtin
category: Встроенные функции
title: list(), tuple(), set(), dict(), frozenset()
summary: Конструкторы встроенных коллекций из итерируемых объектов.
sig: list(iterable=()) · tuple(iterable=()) · set(iterable=()) · dict(**kwargs) / dict(mapping) / dict(iterable) · frozenset(iterable=())
check: list, tuple, set, dict, frozenset
tags: создать список, преобразовать в множество, словарь из пар
related: py:topic:lists, py:topic:tuples, py:topic:sets, py:topic:dicts
## Пример
```python
print(list("abc"), tuple([1, 2]), set("hello"), dict([("a", 1), ("b", 2)]), dict(x=1, y=2))
print(frozenset([1, 2, 2]), list(range(3)), dict.fromkeys("ab", 0))
```

# id: py:builtin:slice
kind: builtin
category: Встроенные функции
title: slice()
summary: Объект среза: то, что создаётся записью a[start:stop:step].
sig: slice(stop) / slice(start, stop[, step])
check: slice
tags: срез, именованный срез
related: py:topic:slicing
## Пример
```python
s = "2026-10-04"
YEAR, MONTH = slice(0, 4), slice(5, 7)
print(s[YEAR], s[MONTH], slice(1, 5, 2).indices(4))
```

# id: py:builtin:eval
kind: builtin
category: Встроенные функции
title: eval(), exec(), compile()
summary: Выполнение кода Python из строки: eval — выражение, exec — инструкции, compile — в объект кода.
sig: eval(expression, globals=None, locals=None) · exec(object, globals=None, locals=None) · compile(source, filename, mode)
check: eval, exec, compile
tags: выполнить строку, динамический код, безопасность
related: py:cpython:bytecode, lib:ast.literal_eval
## Пример
```python
print(eval("2 + 3 * 4"))
ns = {}
exec("x = 5\ny = x * 2", ns)
print(ns["y"])
code = compile("a + b", "<expr>", "eval")
print(eval(code, {"a": 1, "b": 2}))
import ast
print(ast.literal_eval("[1, 2, {'a': 3}]"))
```
## Безопасность
Никогда не применяйте eval/exec к недоверенному вводу — это выполнение произвольного кода. Для данных используйте ast.literal_eval или json.

# id: py:builtin:super
kind: builtin
category: Встроенные функции
title: super()
summary: Доступ к методам родительского класса (по порядку MRO).
sig: super() / super(type, object_or_type)
check: super
tags: родительский класс, наследование, вызов метода предка
related: py:topic:inheritance, py:topic:oop
## Пример
```python
class Animal:
    def __init__(self, name):
        self.name = name
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
d = Dog("Бобик", "такса")
print(d.name, d.breed, [c.__name__ for c in Dog.__mro__])
```

# id: py:builtin:property
kind: builtin
category: Встроенные функции
title: property()
summary: Делает метод доступным как атрибут с контролем чтения и записи.
sig: property(fget=None, fset=None, fdel=None, doc=None)
check: property
tags: свойство, геттер, сеттер, инкапсуляция
related: py:topic:properties, py:topic:oop, py:topic:descriptors
## Пример
```python
class Temp:
    def __init__(self, c):
        self._c = c
    @property
    def f(self):
        return self._c * 9 / 5 + 32
    @f.setter
    def f(self, value):
        self._c = (value - 32) * 5 / 9
t = Temp(100)
print(t.f)
t.f = 32
print(t._c)
```

# id: py:builtin:staticmethod
kind: builtin
category: Встроенные функции
title: staticmethod() и classmethod()
summary: Методы класса без self: статический (без доступа к классу) и метод класса (получает cls).
sig: @staticmethod · @classmethod
check: staticmethod, classmethod
tags: статический метод, метод класса, альтернативный конструктор
related: py:topic:oop, py:topic:staticmethod-classmethod
## Пример
```python
class Date:
    def __init__(self, y, m, d):
        self.y, self.m, self.d = y, m, d
    @classmethod
    def parse(cls, s):
        return cls(*map(int, s.split("-")))
    @staticmethod
    def is_leap(y):
        return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)
d = Date.parse("2024-02-29")
print(d.y, Date.is_leap(d.y))
```

# id: py:builtin:object
kind: builtin
category: Встроенные функции
title: object()
summary: Базовый класс всех классов Python; object() создаёт «пустой» уникальный объект.
sig: object()
check: object
tags: базовый класс, маркер, sentinel
related: py:topic:oop
## Пример
```python
MISSING = object()
d = {"a": None}
print(d.get("a", MISSING) is MISSING, d.get("b", MISSING) is MISSING, issubclass(int, object))
```

# id: py:builtin:issubclass
kind: builtin
category: Встроенные функции
title: issubclass()
summary: Проверяет, является ли класс подклассом другого класса.
sig: issubclass(class, classinfo, /)
check: issubclass
tags: наследование, подкласс
related: py:builtin:isinstance
## Пример
```python
print(issubclass(bool, int), issubclass(int, (str, object)), issubclass(ZeroDivisionError, ArithmeticError))
```

# id: py:builtin:bytes
kind: builtin
category: Встроенные функции
title: bytes() и bytearray()
summary: Неизменяемая и изменяемая последовательности байтов.
sig: bytes(source, encoding) · bytearray(source)
check: bytes, bytearray
tags: байты, кодировка, двоичные данные
related: py:method:str.encode, err:UnicodeDecodeError
## Пример
```python
b = "Ёж".encode("utf-8")
print(b, len(b), b.decode("utf-8"), list(b"AB"), bytes([72, 105]))
ba = bytearray(b"cat")
ba[0] = ord("b")
print(ba)
```

# id: py:builtin:complex
kind: builtin
category: Встроенные функции
title: complex()
summary: Комплексное число real + imag·j.
sig: complex(real=0, imag=0)
check: complex
tags: комплексные числа, мнимая единица, геометрия
related: lib:cmath, algo:geometry
## Пример
```python
z = complex(3, 4)
print(z, z.real, z.imag, abs(z), z.conjugate(), (1j) ** 2)
```

# id: py:builtin:memoryview
kind: builtin
category: Встроенные функции
title: memoryview()
summary: «Окно» в память байтового объекта без копирования.
sig: memoryview(object)
check: memoryview
tags: буфер, без копирования, байты
related: py:builtin:bytes
## Пример
```python
data = bytearray(b"hello world")
view = memoryview(data)[6:]
view[0] = ord("W")
print(data, bytes(view))
```

# id: py:builtin:breakpoint
kind: builtin
category: Встроенные функции
title: breakpoint()
summary: Останавливает программу и запускает отладчик (по умолчанию pdb).
sig: breakpoint(*args, **kws)
check: breakpoint
tags: отладка, pdb, точка останова
related: lib:pdb
## Пример
```python norun
x = 10
breakpoint()
print(x)
```
## Особенности
Переменная окружения PYTHONBREAKPOINT=0 отключает все вызовы breakpoint().

# id: py:builtin:aiter
kind: builtin
category: Встроенные функции
title: aiter() и anext()
summary: Асинхронные аналоги iter и next (Python 3.10+).
sig: aiter(async_iterable) · anext(async_iterator[, default])
check: aiter, anext
tags: асинхронный итератор, async for
related: py:topic:async-await
## Пример
```python
import asyncio
async def numbers():
    for i in range(3):
        yield i
async def main():
    it = aiter(numbers())
    print(await anext(it), await anext(it), await anext(it), await anext(it, "конец"))
asyncio.run(main())
```

# id: py:builtin:__import__
kind: builtin
category: Встроенные функции
title: __import__()
summary: Низкоуровневая функция, которую вызывает инструкция import.
sig: __import__(name, globals=None, locals=None, fromlist=(), level=0)
check: __import__
tags: импорт по имени, динамический импорт
related: lib:importlib.import_module, py:topic:import-system
## Пример
```python
math = __import__("math")
import importlib
print(math.sqrt(16), importlib.import_module("json").dumps([1]))
```
## Особенности
В своём коде используйте importlib.import_module — это рекомендуемый способ.
