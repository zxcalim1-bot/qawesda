# id: err:ZeroDivisionError
kind: error
title: ZeroDivisionError
exception: ZeroDivisionError
category: Арифметика
level: 1
summary: Деление или взятие остатка по нулю.
tags: деление на ноль, division by zero, остаток, %, //
related: py:exception:ZeroDivisionError, py:op:truediv, py:op:mod
## Причина
Делитель в операциях /, //, % или divmod равен нулю. Часто ноль приходит из входных данных или получается как длина пустого списка.
## Неправильный код
```python
marks = []
print(sum(marks) / len(marks))
```
## Исправленный код
```python
marks = []
if marks:
    print(sum(marks) / len(marks))
else:
    print("Оценок нет")
```
## Объяснение
Деление на ноль не определено, поэтому Python бросает исключение. Проверяйте делитель заранее или обрабатывайте исключение через try/except ZeroDivisionError.
## Как найти
В сообщении указан номер строки; посмотрите, какая переменная в знаменателе и откуда она может стать нулём (пустой список, ввод «0», счётчик, который не увеличился).
## Учебная задача
Напишите программу, которая читает два числа и выводит частное, а при делителе 0 — сообщение «нельзя делить на ноль».
```python
a, b = 7, 0
try:
    print(a / b)
except ZeroDivisionError:
    print("нельзя делить на ноль")
```

# id: err:SyntaxError
kind: error
title: SyntaxError: пропущено двоеточие
exception: SyntaxError
category: Синтаксис
level: 1
summary: Код нарушает грамматику Python: нет двоеточия, лишняя скобка, = вместо ==.
tags: синтаксис, invalid syntax, двоеточие, expected ':'
related: py:exception:SyntaxError, err:SyntaxError-brackets, err:IndentationError
## Причина
После if, elif, else, for, while, def, class, try, except, with обязательно двоеточие. Без него интерпретатор не может разобрать программу и не выполняет ни одной строки.
## Неправильный код
```python
x = 5
if x > 3
    print("больше")
```
## Исправленный код
```python
x = 5
if x > 3:
    print("больше")
```
## Объяснение
SyntaxError возникает до запуска программы — при компиляции в байт-код. Поэтому даже первые строки (x = 5) не выполняются.
## Как найти
Python 3.10+ пишет конкретно: «expected ':'» и показывает строку с указателем ^. Если ошибка указывает на начало строки, проблема часто в конце предыдущей.
## Учебная задача
Найдите и исправьте ошибку: for i in range(3) print(i).
```python
for i in range(3):
    print(i)
```

# id: err:SyntaxError-brackets
kind: error
title: SyntaxError: незакрытая скобка
exception: SyntaxError
category: Синтаксис
level: 1
summary: Открыта скобка или кавычка, но не закрыта; Python сообщает «was never closed».
tags: скобки, кавычки, was never closed, unterminated string
related: err:SyntaxError, algo:stack
## Причина
Количество открывающих и закрывающих скобок не совпадает, или строка не закрыта кавычкой.
## Неправильный код
```python
numbers = [1, 2, 3
print(sum(numbers))
```
## Исправленный код
```python
numbers = [1, 2, 3]
print(sum(numbers))
```
## Объяснение
Внутри скобок Python разрешает переносить выражение на следующие строки, поэтому ошибка часто обнаруживается строкой ниже, чем реальная проблема.
## Как найти
Сообщение «'[' was never closed» указывает на открывающую скобку. Анализатор кода в приложении подсвечивает непарные скобки.
## Учебная задача
Исправьте строку print("Привет) — найдите, какой символ пропущен.
```python
print("Привет")
```

# id: err:SyntaxError-assign
kind: error
title: SyntaxError: = вместо ==
exception: SyntaxError
category: Синтаксис
level: 1
summary: В условии использовано присваивание = вместо сравнения ==.
tags: =, ==, сравнение, присваивание, invalid syntax
related: err:SyntaxError, py:topic:comparisons
## Причина
= — присваивание (оператор), == — сравнение (выражение). В условии if нужно выражение.
## Неправильный код
```python
x = 10
if x = 10:
    print("десять")
```
## Исправленный код
```python
x = 10
if x == 10:
    print("десять")
```
## Объяснение
Python 3.10+ подсказывает: «Maybe you meant '==' or ':=' instead of '='?». Оператор := (морж) присваивает внутри выражения, но здесь нужно именно сравнение.
## Как найти
Ищите одиночные = внутри if, while и в аргументах функций.
## Учебная задача
Напишите условие «если n равно нулю — вывести ZERO».
```python
n = 0
if n == 0:
    print("ZERO")
```

# id: err:IndentationError
kind: error
title: IndentationError
exception: IndentationError
category: Синтаксис
level: 1
summary: Неверные отступы: нет отступа после двоеточия или лишний отступ.
tags: отступы, indentation, expected an indented block, unexpected indent
related: py:exception:IndentationError, err:TabError, err:SyntaxError
## Причина
В Python отступы определяют блоки кода. После строки с двоеточием тело блока должно быть сдвинуто; строки одного блока — с одинаковым отступом.
## Неправильный код
```python
def greet(name):
print("Привет,", name)

greet("Ali")
```
## Исправленный код
```python
def greet(name):
    print("Привет,", name)

greet("Ali")
```
## Объяснение
«expected an indented block» — после двоеточия нет тела блока. «unexpected indent» — отступ там, где его не должно быть. «unindent does not match any outer indentation level» — отступ не совпадает ни с одним внешним уровнем.
## Как найти
Используйте ровно 4 пробела на уровень. В редакторе приложения кнопки «отступ +/−» меняют отступ строки на 4 пробела.
## Учебная задача
Исправьте отступы так, чтобы программа вывела числа 0, 1, 2 и затем «готово».
```python
for i in range(3):
    print(i)
print("готово")
```

# id: err:TabError
kind: error
title: TabError
exception: TabError
category: Синтаксис
level: 2
summary: В одном блоке смешаны табуляции и пробелы.
tags: табуляция, пробелы, inconsistent use of tabs and spaces
related: err:IndentationError
## Причина
Строка блока отступлена пробелами, а соседняя — символом табуляции. Визуально они выглядят одинаково, но для Python это разные отступы.
## Неправильный код
```python
if True:
    x = 1
	print(x)
```
## Исправленный код
```python
if True:
    x = 1
    print(x)
```
## Объяснение
TabError — подкласс IndentationError. Python 3 запрещает неоднозначное смешивание табуляций и пробелов.
## Как найти
Настройте редактор на замену табуляции пробелами. Анализатор в приложении предупреждает о символах табуляции.
## Учебная задача
Перепишите любой свой блок кода, используя только пробелы (4 на уровень).
```python
for i in range(2):
    if i:
        print("один")
```

# id: err:NameError
kind: error
title: NameError
exception: NameError
category: Переменные
level: 1
summary: Обращение к имени, которое не определено: опечатка или переменная ещё не создана.
tags: name is not defined, опечатка, переменная не определена
related: py:exception:NameError, err:UnboundLocalError
## Причина
Имя (переменная, функция, модуль) не существует в момент обращения: опечатка, неправильный регистр, переменная создаётся позже или внутри другой функции, забыт import.
## Неправильный код
```python
count = 5
print(cuont + 1)
```
## Исправленный код
```python
count = 5
print(count + 1)
```
## Объяснение
Python 3.10+ подсказывает похожее имя: «Did you mean: 'count'?». Имена чувствительны к регистру: Print и print — разные.
## Как найти
Сравните имя в сообщении с именами, которые вы создали выше. Проверьте, что переменная создаётся до использования на всех путях выполнения (в том числе если if не сработал).
## Учебная задача
Почему здесь NameError, если x = 5 иногда не выполняется? Исправьте, задав значение по умолчанию.
```python
n = 1
x = 0
if n > 3:
    x = 5
print(x)
```

# id: err:UnboundLocalError
kind: error
title: UnboundLocalError
exception: UnboundLocalError
category: Переменные
level: 2
summary: Локальная переменная используется до присваивания — обычно попытка изменить глобальную в функции.
tags: local variable referenced before assignment, global, nonlocal
related: py:keyword:global, py:keyword:nonlocal, err:NameError
## Причина
Если внутри функции есть присваивание переменной, Python считает её локальной во всей функции. Чтение до присваивания вызывает ошибку, даже если есть глобальная переменная с тем же именем.
## Неправильный код
```python
counter = 0

def inc():
    counter += 1

inc()
print(counter)
```
## Исправленный код
```python
counter = 0

def inc():
    global counter
    counter += 1

inc()
print(counter)
```
## Объяснение
Лучший стиль — не менять глобальные переменные, а возвращать новое значение: counter = inc(counter). Для вложенных функций используется nonlocal.
## Как найти
Ищите в функции присваивание (=, +=) той же переменной, что используется выше в этой функции.
## Учебная задача
Перепишите функцию так, чтобы она принимала число и возвращала увеличенное на 1, без global.
```python
def inc(c):
    return c + 1

counter = inc(0)
print(counter)
```

# id: err:TypeError
kind: error
title: TypeError: сложение строки и числа
exception: TypeError
category: Типы
level: 1
summary: Операция применена к объектам неподходящих типов: str + int, len(5), вызов не-функции.
tags: can only concatenate str, unsupported operand type, типы, преобразование
related: py:exception:TypeError, py:builtin:int, py:builtin:str, err:TypeError-unhashable, err:TypeError-none
## Причина
input() всегда возвращает строку. Сложение строки с числом не определено: Python не угадывает, хотите вы склеить текст или сложить числа.
## Неправильный код
```python
age = "15"
print(age + 1)
```
## Исправленный код
```python
age = "15"
print(int(age) + 1)
print(age + str(1))
```
## Объяснение
Явное преобразование: int(s) — в число, str(x) — в строку. Для вывода смеси текста и чисел удобнее f-строки: f"Мне {age} лет".
## Как найти
Сообщение называет типы операндов: «can only concatenate str (not "int") to str». Проверьте, где переменная получила строковое значение (обычно input()).
## Учебная задача
Прочитайте два числа через input() и выведите их сумму, а не склейку.
```python
import io, sys
sys.stdin = io.StringIO("2\n3\n")
a = int(input())
b = int(input())
print(a + b)
```

# id: err:TypeError-unhashable
kind: error
title: TypeError: unhashable type 'list'
exception: TypeError
category: Типы
level: 2
summary: Изменяемый объект (список, словарь, множество) использован как ключ словаря или элемент множества.
tags: unhashable, ключ словаря, set, tuple, frozenset
related: algo:hashing, py:topic:dicts, py:topic:sets
## Причина
Ключи словаря и элементы множества должны быть хешируемыми (неизменяемыми). Список может измениться, поэтому его хеш не определён.
## Неправильный код
```python
visited = set()
visited.add([1, 2])
print(visited)
```
## Исправленный код
```python
visited = set()
visited.add((1, 2))
print(visited)
```
## Объяснение
Кортеж (tuple) — неизменяемый аналог списка; frozenset — неизменяемое множество. Для координат клеток в BFS используйте кортежи.
## Как найти
В сообщении указан тип: 'list', 'dict' или 'set'. Найдите, где объект кладётся в set, используется как ключ dict или в @lru_cache.
## Учебная задача
Посчитайте, сколько раз встречается каждая пара (x, y) в списке точек.
```python
from collections import Counter
points = [[1, 2], [3, 4], [1, 2]]
print(Counter(tuple(p) for p in points))
```

# id: err:TypeError-none
kind: error
title: TypeError: 'NoneType' object is not subscriptable
exception: TypeError
category: Типы
level: 2
summary: Работа с None как со списком: результат метода, который изменяет объект на месте и возвращает None.
tags: NoneType, sort, append, reverse, возвращает None
related: py:method:list.sort, py:builtin:sorted, err:AttributeError
## Причина
list.sort(), list.append(), list.reverse(), random.shuffle() изменяют объект и возвращают None. Присваивание результата затирает список.
## Неправильный код
```python
a = [3, 1, 2]
a = a.sort()
print(a[0])
```
## Исправленный код
```python
a = [3, 1, 2]
a.sort()
print(a[0])
b = sorted([3, 1, 2])
print(b[0])
```
## Объяснение
Функция без return тоже возвращает None. sorted(a) возвращает новый список, a.sort() — нет.
## Как найти
Найдите, где переменная получила значение None: присваивание результата метода «на месте» или функции без return.
## Учебная задача
Исправьте функцию, чтобы она возвращала удвоенный список.
```python
def double(a):
    return [x * 2 for x in a]

print(double([1, 2, 3])[0])
```

# id: err:TypeError-args
kind: error
title: TypeError: неверное число аргументов
exception: TypeError
category: Функции
level: 2
summary: Функция вызвана с лишними или недостающими аргументами.
tags: missing required positional argument, takes positional arguments but were given, self
related: py:keyword:def, py:topic:functions
## Причина
Количество аргументов при вызове не совпадает с параметрами в def. В методах класса первый параметр self передаётся автоматически — забытый self даёт «takes 0 positional arguments but 1 was given».
## Неправильный код
```python
def area(w, h):
    return w * h

print(area(5))
```
## Исправленный код
```python
def area(w, h=1):
    return w * h

print(area(5), area(5, 3))
```
## Объяснение
Значения по умолчанию делают параметры необязательными. *args и **kwargs принимают произвольное число аргументов.
## Как найти
Сообщение называет функцию и нужное число аргументов. Сравните сигнатуру def с вызовом.
## Учебная задача
Напишите функцию total(*nums), которая суммирует любое количество чисел.
```python
def total(*nums):
    return sum(nums)

print(total(), total(1, 2, 3))
```

# id: err:ValueError
kind: error
title: ValueError: int() от нечислового текста
exception: ValueError
category: Ввод данных
level: 1
summary: Тип подходит, но значение нет: int("abc"), int("3.5"), math.sqrt(-1).
tags: invalid literal for int, преобразование, ввод, isdigit
related: py:exception:ValueError, py:builtin:int, py:builtin:float
## Причина
int() принимает строку только с записью целого числа. Пробелы по краям допустимы, но точка, буквы или несколько чисел в строке — нет.
## Неправильный код
```python
s = "3.5"
print(int(s))
```
## Исправленный код
```python
s = "3.5"
print(int(float(s)))
print(float(s))
```
## Объяснение
Для проверки ввода используйте try/except ValueError или str.isdigit() (только для неотрицательных целых без знака).
## Как найти
В сообщении приведена строка: invalid literal for int() with base 10: '3.5'. Проверьте формат входных данных.
## Учебная задача
Читайте строки, пока не встретится число; нечисловые строки пропускайте.
```python
for s in ["abc", "", "42"]:
    try:
        print(int(s))
        break
    except ValueError:
        print("не число:", repr(s))
```

# id: err:ValueError-unpack
kind: error
title: ValueError: неверное количество значений при распаковке
exception: ValueError
category: Ввод данных
level: 1
summary: a, b = input().split(), а в строке не два значения.
tags: too many values to unpack, not enough values to unpack, распаковка
related: py:method:str.split
## Причина
При распаковке количество переменных слева должно совпадать с количеством элементов справа.
## Неправильный код
```python
a, b = "1 2 3".split()
print(a, b)
```
## Исправленный код
```python
a, b, *rest = "1 2 3".split()
print(a, b, rest)
nums = list(map(int, "1 2 3".split()))
print(nums)
```
## Объяснение
Звёздочка *rest собирает «лишние» значения в список. Если количество неизвестно — читайте в список.
## Как найти
«too many values to unpack (expected 2)» — значений больше; «not enough values» — меньше (часто числа на разных строках, а читаете одну).
## Учебная задача
Числа заданы по одному на строку. Прочитайте два числа правильно.
```python
import io, sys
sys.stdin = io.StringIO("4\n5\n")
a = int(input())
b = int(input())
print(a * b)
```

# id: err:IndexError
kind: error
title: IndexError
exception: IndexError
category: Списки
level: 1
summary: Индекс за пределами последовательности: a[len(a)], pop() из пустого списка.
tags: list index out of range, индекс, граница, pop from empty list
related: py:exception:IndexError, py:topic:lists, err:KeyError
## Причина
Допустимые индексы списка длины n — от 0 до n−1 (и отрицательные от −n до −1). Частая ошибка — цикл до len(a) включительно или обращение к a[i+1] на последнем элементе.
## Неправильный код
```python
a = [10, 20, 30]
for i in range(len(a)):
    print(a[i] + a[i + 1])
```
## Исправленный код
```python
a = [10, 20, 30]
for i in range(len(a) - 1):
    print(a[i] + a[i + 1])
for x, y in zip(a, a[1:]):
    print(x + y)
```
## Объяснение
zip(a, a[1:]) перебирает соседние пары без индексов. Срезы не выходят за границы: a[5:10] просто вернёт [].
## Как найти
Выведите длину списка и индекс перед ошибкой. Проверьте граничные значения цикла и пустой ввод.
## Учебная задача
Безопасно выведите последний элемент списка или «пусто».
```python
a = []
print(a[-1] if a else "пусто")
```

# id: err:KeyError
kind: error
title: KeyError
exception: KeyError
category: Словари
level: 1
summary: Обращение к отсутствующему ключу словаря d[key].
tags: ключ, словарь, get, defaultdict, setdefault
related: py:exception:KeyError, py:method:dict.get, lib:collections.defaultdict, err:IndexError
## Причина
d[key] требует, чтобы ключ уже был в словаре. При подсчёте частот первое появление элемента вызывает KeyError.
## Неправильный код
```python
counts = {}
for w in ["a", "b", "a"]:
    counts[w] += 1
print(counts)
```
## Исправленный код
```python
from collections import defaultdict, Counter
counts = {}
for w in ["a", "b", "a"]:
    counts[w] = counts.get(w, 0) + 1
print(counts)
d = defaultdict(int)
for w in ["a", "b", "a"]:
    d[w] += 1
print(dict(d), Counter(["a", "b", "a"]))
```
## Объяснение
get возвращает значение по умолчанию, defaultdict создаёт значение автоматически, Counter специально предназначен для подсчёта.
## Как найти
В сообщении указан отсутствующий ключ. Проверьте регистр строк, лишние пробелы (strip) и тип ключа ("1" и 1 — разные ключи).
## Учебная задача
Выведите оценку ученика или «нет данных», не вызывая KeyError.
```python
grades = {"ali": 5}
print(grades.get("vali", "нет данных"))
```

# id: err:AttributeError
kind: error
title: AttributeError
exception: AttributeError
category: Типы
level: 1
summary: У объекта нет такого атрибута или метода: list.push, str.append, None.split.
tags: has no attribute, метод, опечатка, NoneType
related: py:exception:AttributeError, py:builtin:dir, err:TypeError-none
## Причина
Метод вызван не у того типа (append есть у list, но не у str) или с опечаткой; объект оказался None.
## Неправильный код
```python
stack = []
stack.push(5)
print(stack)
```
## Исправленный код
```python
stack = []
stack.append(5)
print(stack)
```
## Объяснение
dir(obj) показывает все атрибуты объекта. Python 3.10+ подсказывает похожее имя: «Did you mean: 'pop'?».
## Как найти
Проверьте тип объекта: print(type(x)). Если тип NoneType — ищите, где переменной присвоен None.
## Учебная задача
Добавьте символ к строке (у строк нет append).
```python
s = "abc"
s += "d"
print(s, [m for m in dir(s) if m.startswith("st")])
```

# id: err:ImportError
kind: error
title: ImportError
exception: ImportError
category: Модули
level: 2
summary: Модуль найден, но в нём нет импортируемого имени (опечатка или имя из другой версии).
tags: cannot import name, from import, модуль
related: py:exception:ImportError, err:ModuleNotFoundError, py:keyword:import
## Причина
from module import name — имени name нет в модуле: опечатка, имя появилось в более новой версии Python, или циклический импорт своих модулей.
## Неправильный код
```python
from math import squareroot
print(squareroot(16))
```
## Исправленный код
```python
from math import sqrt, isqrt
print(sqrt(16), isqrt(17))
```
## Объяснение
Посмотрите список имён модуля: import math; print(dir(math)). В справочнике приложения есть все функции стандартной библиотеки Python 3.11.
## Как найти
Сообщение «cannot import name 'X' from 'module'» — проверьте написание и версию Python (на часах — 3.11).
## Учебная задача
Импортируйте из itertools функцию для перебора перестановок.
```python
from itertools import permutations
print(list(permutations("ab")))
```

# id: err:ModuleNotFoundError
kind: error
title: ModuleNotFoundError
exception: ModuleNotFoundError
category: Модули
level: 1
summary: Модуль не найден: опечатка в имени или внешняя библиотека не установлена.
tags: No module named, pip, установка, внешние библиотеки
related: py:exception:ModuleNotFoundError, err:ImportError
## Причина
Python не нашёл модуль ни в стандартной библиотеке, ни среди установленных пакетов. Частые случаи — опечатка (mathh) или сторонняя библиотека (numpy, requests), которую нужно ставить через pip.
## Неправильный код
```python
import mathh
print(mathh.pi)
```
## Исправленный код
```python
import math
print(math.pi)
```
## Объяснение
На часах встроен Python 3.11 со стандартной библиотекой; внешние пакеты (NumPy, Pandas и т. д.) в нём не установлены — для них в приложении есть только справочник. На компьютере пакет ставится командой pip install имя.
## Как найти
Проверьте написание. Если имя верное, это внешняя библиотека: её нужно установить в окружение, где запускается код.
## Учебная задача
Импортируйте модуль статистики стандартной библиотеки и посчитайте медиану.
```python
import statistics
print(statistics.median([3, 1, 4, 1, 5]))
```

# id: err:RecursionError
kind: error
title: RecursionError
exception: RecursionError
category: Функции
level: 2
summary: Превышена максимальная глубина рекурсии: нет базы или слишком глубокие вызовы.
tags: maximum recursion depth exceeded, рекурсия, база, setrecursionlimit
related: py:exception:RecursionError, algo:recursion, lib:sys.setrecursionlimit
## Причина
Функция вызывает себя без условия остановки, база никогда не достигается, или глубина законно больше лимита (1000 по умолчанию).
## Неправильный код
```python
def fact(n):
    return n * fact(n - 1)

print(fact(5))
```
## Исправленный код
```python
def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(5))
```
## Объяснение
При законной большой глубине помогает sys.setrecursionlimit или переписывание цикла/стека. Очень большой лимит может обрушить процесс из-за переполнения стека C.
## Как найти
Traceback показывает одну и ту же строку много раз. Проверьте базу рекурсии и что аргумент к ней приближается.
## Учебная задача
Перепишите факториал циклом, чтобы он работал для n = 1000 (рекурсия упёрлась бы в лимит глубины).
```python
n = 1000
f = 1
for i in range(2, n + 1):
    f *= i
print(len(str(f)))
```

# id: err:FileNotFoundError
kind: error
title: FileNotFoundError
exception: FileNotFoundError
category: Файлы
level: 1
summary: Файл для чтения не существует или путь указан относительно другой папки.
tags: No such file or directory, open, путь, рабочая папка, pathlib
related: py:exception:FileNotFoundError, py:builtin:open, lib:pathlib.Path
## Причина
open("data.txt") ищет файл в текущей рабочей папке, а не рядом со скриптом. Опечатка в имени или расширении тоже даёт эту ошибку.
## Неправильный код
```python
with open("no_such_file_123.txt") as f:
    print(f.read())
```
## Исправленный код
```python
from pathlib import Path
p = Path("no_such_file_123.txt")
if p.exists():
    print(p.read_text(encoding="utf-8"))
else:
    print("Файл не найден:", p.name)
```
## Объяснение
os.getcwd() показывает рабочую папку. Path(__file__).parent — папка скрипта. Для записи режим "w" создаёт файл, но не папки.
## Как найти
Выведите абсолютный путь: Path("data.txt").resolve() и проверьте, существует ли файл там.
## Учебная задача
Обработайте отсутствие файла через try/except и выведите понятное сообщение.
```python
try:
    open("missing.txt")
except FileNotFoundError as e:
    print("нет файла:", e.filename)
```

# id: err:PermissionError
kind: error
title: PermissionError
exception: PermissionError
category: Файлы
level: 2
summary: Нет прав на чтение или запись файла/папки (системные файлы, чужие папки).
tags: Permission denied, права доступа, запись файла, tempfile
related: py:exception:PermissionError, lib:tempfile.TemporaryDirectory
## Причина
Операционная система запретила операцию: запись в системную папку, чтение защищённого файла. На Android/Wear OS приложению доступна только своя папка.
## Неправильный код
```python
with open("/proc/1/environ", "w") as f:
    f.write("test")
```
## Исправленный код
```python
import os
import tempfile
with tempfile.TemporaryDirectory() as d:
    path = os.path.join(d, "note.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write("test")
    print(open(path, encoding="utf-8").read())
```
## Объяснение
tempfile создаёт временные файлы в разрешённой папке. Для постоянных данных используйте папку пользователя или приложения.
## Как найти
Проверьте путь: не системный ли он, существует ли папка, не открыт ли файл другой программой (в Windows).
## Учебная задача
Перехватите PermissionError и выведите путь, к которому нет доступа.
```python
try:
    open("/proc/1/environ", "w")
except PermissionError as e:
    print("нет доступа:", e.filename)
```

# id: err:OverflowError
kind: error
title: OverflowError
exception: OverflowError
category: Арифметика
level: 2
summary: Результат операции с float слишком велик: math.exp(1000), 10.0 ** 400.
tags: Numerical result out of range, float, переполнение, int too large to convert
related: py:exception:OverflowError, lib:math.exp, lib:decimal.Decimal
## Причина
float хранит числа примерно до 1.8·10^308. Целые числа Python не переполняются, а float — да; также ошибка возникает при переводе огромного int во float.
## Неправильный код
```python
import math
print(math.exp(1000))
```
## Исправленный код
```python
import math
from decimal import Decimal
print(Decimal(1000).exp())
print(1000 / math.log(10))
```
## Объяснение
Для огромных значений используйте целую арифметику, Decimal или логарифмы (сравнивайте log(a), а не a).
## Как найти
Ищите float-операции: exp, **, деление огромного int на float, float(огромное_int).
## Учебная задача
Сравните 2^1000 и 3^600, не вычисляя float-значения.
```python
print(2 ** 1000 > 3 ** 600, 1000 * 0.6931 > 600 * 1.0986)
```

# id: err:RuntimeError
kind: error
title: RuntimeError: словарь изменился во время обхода
exception: RuntimeError
category: Словари
level: 2
summary: Изменение размера словаря или множества внутри цикла for по нему.
tags: dictionary changed size during iteration, изменение во время итерации
related: py:exception:RuntimeError, py:topic:dicts
## Причина
Цикл for по словарю использует его внутреннюю структуру; добавление или удаление ключей ломает обход.
## Неправильный код
```python
stock = {"apple": 0, "pear": 3, "plum": 0}
for name in stock:
    if stock[name] == 0:
        del stock[name]
print(stock)
```
## Исправленный код
```python
stock = {"apple": 0, "pear": 3, "plum": 0}
for name in list(stock):
    if stock[name] == 0:
        del stock[name]
print(stock)
stock2 = {k: v for k, v in {"a": 0, "b": 2}.items() if v != 0}
print(stock2)
```
## Объяснение
list(stock) делает копию ключей. Генератор словаря строит новый словарь без лишних элементов. Для списков удаление во время обхода не вызывает ошибку, но пропускает элементы — это ещё опаснее.
## Как найти
Ищите del, pop, add, присваивание новых ключей внутри цикла по тому же словарю или множеству.
## Учебная задача
Удалите из списка все отрицательные числа правильно.
```python
a = [1, -2, -3, 4]
a = [x for x in a if x >= 0]
print(a)
```

# id: err:StopIteration
kind: error
title: StopIteration
exception: StopIteration
category: Итераторы
level: 3
summary: next() вызван у исчерпанного итератора или генератора.
tags: next, итератор, генератор, значение по умолчанию
related: py:builtin:next, py:builtin:iter, py:topic:generators
## Причина
Итератор выдаёт элементы по одному; когда они кончились, next() бросает StopIteration. Цикл for обрабатывает это автоматически, а явный next — нет.
## Неправильный код
```python
it = iter([1, 2])
print(next(it), next(it), next(it))
```
## Исправленный код
```python
it = iter([1, 2])
print(next(it), next(it), next(it, "конец"))
first_even = next((x for x in [1, 3, 5] if x % 2 == 0), None)
print(first_even)
```
## Объяснение
Второй аргумент next — значение по умолчанию вместо исключения. Удобный приём: next(генератор_с_условием, None) — «первый подходящий элемент или None».
## Как найти
Найдите вызовы next() и подумайте, может ли итератор оказаться пустым.
## Учебная задача
Найдите первое отрицательное число в списке или выведите «нет».
```python
a = [3, 5, 7]
print(next((x for x in a if x < 0), "нет"))
```

# id: err:EOFError
kind: error
title: EOFError
exception: EOFError
category: Ввод данных
level: 1
summary: input() вызван, когда входные данные закончились.
tags: EOF when reading a line, input, конец ввода, sys.stdin
related: py:exception:EOFError, py:builtin:input, lib:sys.stdin
## Причина
Программа читает больше строк, чем подано на вход: лишний input(), неверное число повторов цикла, или числа стоят в одной строке, а читаются по строкам.
## Неправильный код
```python
a = int(input())
b = int(input())
print(a + b)
```
## Исправленный код
```python
import sys
data = sys.stdin.read().split()
print(sum(map(int, data)) if data else 0)
```
## Объяснение
sys.stdin.read() читает весь ввод сразу и не падает, если строк меньше или числа стоят иначе. В олимпиадах это самый надёжный способ чтения.
## Как найти
Сравните формат входных данных с тем, как программа их читает: сколько строк, сколько чисел в строке. В приложении стандартный ввод задаётся кнопкой «Ввод (stdin)».
## Учебная задача
Прочитайте все числа из ввода, сколько бы строк их ни занимало, и выведите их количество.
```python
import io, sys
sys.stdin = io.StringIO("1 2\n3\n")
print(len(sys.stdin.read().split()))
```

# id: err:AssertionError
kind: error
title: AssertionError
exception: AssertionError
category: Отладка
level: 2
summary: Не выполнилось условие assert — проверка, которую программист поставил специально.
tags: assert, проверка, тестирование, отладка
related: py:keyword:assert, py:exception:AssertionError
## Причина
assert условие, "сообщение" бросает AssertionError, если условие ложно. Это инструмент отладки и тестов: он сообщает, что программа пришла в «невозможное» состояние.
## Неправильный код
```python
def average(a):
    assert len(a) > 0, "список пуст"
    return sum(a) / len(a)

print(average([]))
```
## Исправленный код
```python
def average(a):
    if not a:
        return 0.0
    return sum(a) / len(a)

print(average([]), average([2, 4]))
```
## Объяснение
assert можно отключить запуском python -O, поэтому для проверки пользовательского ввода используйте if и исключения (ValueError), а assert — для самопроверок.
## Как найти
Сообщение после запятой в assert объясняет, какая проверка не прошла.
## Учебная задача
Напишите тест функции сложения с помощью assert.
```python
def add(a, b):
    return a + b

assert add(2, 3) == 5
assert add(-1, 1) == 0
print("тесты пройдены")
```

# id: err:UnicodeDecodeError
kind: error
title: UnicodeDecodeError
exception: UnicodeDecodeError
category: Файлы
level: 3
summary: Байты не соответствуют кодировке: файл в cp1251 читается как UTF-8.
tags: кодировка, utf-8, cp1251, encoding, bytes
related: py:exception:UnicodeDecodeError, py:builtin:open, py:method:bytes.decode
## Причина
Текст хранится как байты в некоторой кодировке. Если декодировать их другой кодировкой, встречаются недопустимые последовательности.
## Неправильный код
```python
data = "Привет".encode("cp1251")
print(data.decode("utf-8"))
```
## Исправленный код
```python
data = "Привет".encode("cp1251")
print(data.decode("cp1251"))
print(data.decode("utf-8", errors="replace"))
```
## Объяснение
Всегда указывайте кодировку при работе с файлами: open(path, encoding="utf-8"). errors="replace" заменяет плохие байты символом �, а не падает.
## Как найти
Сообщение указывает байт и позицию: can't decode byte 0xcf in position 0. Узнайте, в какой кодировке сохранён файл.
## Учебная задача
Закодируйте строку в UTF-8 и посчитайте количество байтов (кириллица занимает по 2 байта).
```python
s = "Ёж"
print(len(s), len(s.encode("utf-8")))
```

# id: err:NotImplementedError
kind: error
title: NotImplementedError
exception: NotImplementedError
category: ООП
level: 3
summary: Вызван метод-заглушка базового класса, который должен быть переопределён в наследнике.
tags: абстрактный метод, наследование, переопределение, abc
related: py:exception:NotImplementedError, lib:abc.abstractmethod, py:topic:oop
## Причина
Базовый класс объявляет метод, но не реализует его (raise NotImplementedError). Наследник забыл переопределить метод.
## Неправильный код
```python
class Shape:
    def area(self):
        raise NotImplementedError

class Square(Shape):
    def __init__(self, a):
        self.a = a

print(Square(3).area())
```
## Исправленный код
```python
class Shape:
    def area(self):
        raise NotImplementedError

class Square(Shape):
    def __init__(self, a):
        self.a = a

    def area(self):
        return self.a * self.a

print(Square(3).area())
```
## Объяснение
Модуль abc и декоратор @abstractmethod не позволяют даже создать объект класса, в котором не переопределены абстрактные методы — ошибка видна раньше.
## Как найти
Traceback показывает метод базового класса. Проверьте имя метода в наследнике (опечатка = не переопределён).
## Учебная задача
Создайте класс Circle(Shape) с методом area.
```python
import math

class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return math.pi * self.r ** 2

print(round(Circle(1).area(), 4))
```

# id: err:IsADirectoryError
kind: error
title: IsADirectoryError
exception: IsADirectoryError
category: Файлы
level: 2
summary: open() вызван для папки, а не для файла.
tags: Is a directory, папка, open, os.listdir
related: py:exception:IsADirectoryError, lib:pathlib.Path, err:FileNotFoundError
## Причина
Путь указывает на каталог. Каталог нельзя открыть как файл; его содержимое получают через os.listdir или Path.iterdir.
## Неправильный код
```python
import tempfile
d = tempfile.mkdtemp()
open(d).read()
```
## Исправленный код
```python
import tempfile
from pathlib import Path
d = Path(tempfile.mkdtemp())
(d / "a.txt").write_text("hi", encoding="utf-8")
print([p.name for p in d.iterdir()], (d / "a.txt").read_text(encoding="utf-8"))
```
## Объяснение
Path.is_dir() и Path.is_file() позволяют проверить тип пути заранее.
## Как найти
Выведите путь и проверьте Path(path).is_dir().
## Учебная задача
Выведите имена всех файлов во временной папке с расширением .txt.
```python
import tempfile
from pathlib import Path
d = Path(tempfile.mkdtemp())
for name in ["x.txt", "y.py", "z.txt"]:
    (d / name).write_text("", encoding="utf-8")
print(sorted(p.name for p in d.glob("*.txt")))
```

# id: err:ValueError-int-digits
kind: error
title: ValueError: слишком длинное число для str()
exception: ValueError
category: Арифметика
level: 3
summary: Python 3.11+ не переводит в строку целые числа длиннее 4300 цифр без явного разрешения.
tags: Exceeds the limit (4300 digits), set_int_max_str_digits, длинная арифметика, print большого числа
related: lib:sys.set_int_max_str_digits, algo:arithmetic
## Причина
Начиная с Python 3.11 (и в исправлениях 3.10.7, 3.9.14 и др.) преобразование int → str и str → int для чисел длиннее 4300 десятичных цифр запрещено по умолчанию: такая операция квадратична по времени и использовалась для атак на серверы. Вычислять с большими числами можно, а печатать — нет.
## Неправильный код
```python
f = 1
for i in range(2, 3001):
    f *= i
print(f)
```
## Исправленный код
```python
import sys
sys.set_int_max_str_digits(0)
f = 1
for i in range(2, 3001):
    f *= i
s = str(f)
print(len(s), s[:20])
```
## Объяснение
sys.set_int_max_str_digits(0) снимает ограничение (или задайте нужный предел). Если нужна только длина или последние цифры, можно обойтись без строки: f.bit_length(), f % 10**k.
## Как найти
Сообщение прямо называет лимит в 4300 цифр. Ошибка возникает в print, str, f-строке или int(строка) с очень длинным числом.
## Учебная задача
Выведите последние 10 цифр числа 3^100000, не превращая всё число в строку.
```python
print(pow(3, 100000, 10**10))
```
