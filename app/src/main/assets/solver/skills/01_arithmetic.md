# Solver skills: arithmetic and basic number problems.
# Format: see core/engine/.../solver/catalog/Catalog.kt. Validated by tools/validate_skills.py.

# skill: hello
title: Вывод текста (Hello, World!)
topics: Ввод и вывод
match: HELLO
priority: 1.5
input:
input_desc: Ввода нет.
output_desc: Строка Hello, World!
understood: Вывести на экран приветствие «Hello, World!».
algorithm: Вывод строки функцией print
why: print выводит переданные значения и переводит строку.
ideas: print() выводит текст; Строки записываются в кавычках
structures: str
links: py:builtin:print, py:topic:strings
edge: Кавычки внутри строки: используйте другой тип кавычек или экранирование \".
sample:  => Hello, World!

## print со строкой
approach: print
role: beginner
time: O(1)
memory: O(1)
idea: Передаём строку в функцию print.
principle: print(объект) превращает объект в строку и выводит его, добавляя перевод строки в конце.
pros: Самый простой вариант
cons: —
when: Всегда.
readability: 5
```python
print("Hello, World!")
```

## print с несколькими аргументами
approach: print-sep
role: alternative
time: O(1)
memory: O(1)
idea: print выводит аргументы через разделитель sep (по умолчанию пробел).
principle: print("Hello,", "World!") выводит два значения через пробел: результат тот же.
pros: Показывает параметр sep
cons: Чуть длиннее
when: Когда нужно вывести несколько значений.
readability: 5
```python
print("Hello,", "World!")
```

## sys.stdout.write
approach: stdout
role: pythonic
time: O(1)
memory: O(1)
idea: Запись напрямую в стандартный поток вывода.
principle: sys.stdout.write не добавляет перевод строки сам — его нужно указать явно "\n". Так быстрее выводить очень много строк.
pros: Быстрее print при огромном выводе
cons: Нужен import sys и явный \n
when: Когда нужно вывести сотни тысяч строк.
readability: 3
```python
import sys

sys.stdout.write("Hello, World!\n")
```

# skill: two_numbers_sum
title: Сумма двух чисел
topics: Ввод и вывод; Арифметика
match: SUM & (TWO | NUMBER) & !DIGIT & !LIST & !RANGE & !MATRIX & !STRING
boost: TWO
avoid: DIVISOR, ELEMENT, PRIME, EVEN, ODD, DIVISIBLE, GREATER, LESS, SQUARE, CUBE
priority: 0.6
input: a b
input_desc: Одна строка: два целых числа a и b через пробел.
output_desc: Одно число — a + b.
understood: Даны два целых числа a и b. Найти их сумму.
algorithm: Чтение двух чисел и сложение
why: input() читает строку, split() делит её на части, int() превращает части в числа.
ideas: input().split() — список строк; map(int, …) — превращение в числа
structures: int
links: py:builtin:input, py:builtin:int, py:builtin:map, py:method:str.split, py:op:add
edge: Числа могут быть отрицательными.
edge: Числа могут быть очень большими — в Python целые числа не переполняются.
edge: Если числа записаны на разных строках, используйте два вызова input().
sample: 2 3 => 5
sample: -7 7 => 0
sample: 123456789012345678901234567890 1 => 123456789012345678901234567891

## map + split
approach: map
role: beginner
time: O(1)
memory: O(1)
idea: Читаем строку, делим по пробелам и превращаем части в числа.
principle: input().split() даёт список строк ['2', '3']; map(int, ...) применяет int к каждой; распаковка a, b = ... кладёт значения в две переменные.
pros: Стандартный олимпиадный шаблон ввода
cons: Падает, если в строке не ровно два числа
when: Почти всегда.
readability: 5
```python
a, b = map(int, input().split())
print(a + b)
```

## sum по списку
approach: sum
role: short
time: O(1)
memory: O(1)
idea: sum складывает все числа строки — подходит для любого их количества.
principle: map(int, input().split()) — поток чисел строки, sum складывает их.
pros: Одна строка; работает и для трёх, и для ста чисел
cons: Не проверяет, что чисел ровно два
when: Когда чисел может быть сколько угодно.
readability: 5
```python
print(sum(map(int, input().split())))
```

## Явное разбиение
approach: explicit
role: alternative
time: O(1)
memory: O(1)
idea: Разбиваем строку и обращаемся к частям по индексу.
principle: parts[0] и parts[1] — первая и вторая подстроки; int() превращает каждую в число.
pros: Понятно, что происходит на каждом шаге
cons: Больше строк
when: Для объяснения новичкам.
readability: 5
```python
parts = input().split()
a = int(parts[0])
b = int(parts[1])
print(a + b)
```

## operator.add
approach: operator
role: pythonic
time: O(1)
memory: O(1)
idea: Модуль operator содержит функции для всех операторов: operator.add(a, b) == a + b.
principle: Распаковка *map(...) передаёт оба числа как аргументы функции add.
pros: Показывает модуль operator и распаковку аргументов
cons: Избыточно для простой задачи
when: Когда оператор нужно передать как функцию (например, в reduce).
readability: 3
```python
import operator

print(operator.add(*map(int, input().split())))
```

# skill: two_numbers_ops
title: Арифметика двух чисел
topics: Арифметика; Операторы
match: (DIFF | PRODUCT | QUOTIENT | MOD | POWER) & (TWO | NUMBER) & !DIGIT & !LIST & !RANGE & !MATRIX & !FACTORIAL & !STRING & !DIVISOR
boost: TWO
avoid: ELEMENT, PRIME, EVEN, ODD, BINARY, BASE
priority: 0.6
input: a b
input_desc: Одна строка: два целых числа a и b (b ≠ 0).
output_desc: Пять строк: a + b, a - b, a * b, a // b (целая часть), a % b (остаток).
understood: Даны два целых числа a и b. Вычислить их сумму, разность, произведение, целую часть и остаток от деления.
algorithm: Арифметические операторы Python
why: + - * — обычные операции; // — целочисленное деление с округлением вниз; % — остаток того же знака, что и делитель.
ideas: // округляет вниз (к −∞); % согласован с //: a == (a // b) * b + a % b; / всегда даёт float
structures: int
links: py:op:add, py:op:sub, py:op:mul, py:op:floordiv, py:op:mod, py:op:truediv, py:builtin:divmod
edge: b = 0: деление на ноль вызывает ZeroDivisionError.
edge: Отрицательные числа: -7 // 2 == -4 и -7 % 2 == 1 (округление вниз).
edge: Если нужно обычное деление с дробью — используйте /.
sample: 7 2 => 9\n5\n14\n3\n1
sample: -7 2 => -5\n-9\n-14\n-4\n1
sample: 10 5 => 15\n5\n50\n2\n0

## Операторы по отдельности
approach: operators
role: beginner
time: O(1)
memory: O(1)
idea: Каждая операция — отдельный оператор и отдельный print.
principle: a // b — частное с округлением вниз, a % b — остаток. Всегда выполняется a == (a // b) * b + a % b.
pros: Максимально наглядно
cons: Много одинаковых строк
when: Для изучения операторов.
readability: 5
```python
a, b = map(int, input().split())
print(a + b)
print(a - b)
print(a * b)
print(a // b)
print(a % b)
```

## divmod
approach: divmod
role: short
time: O(1)
memory: O(1)
idea: divmod(a, b) возвращает частное и остаток одной операцией.
principle: q, r = divmod(a, b) — то же, что q = a // b, r = a % b, но за один вызов.
pros: Частное и остаток вычисляются вместе
cons: Нужно помнить порядок (частное, остаток)
when: Когда нужны и частное, и остаток.
readability: 4
```python
a, b = map(int, input().split())
q, r = divmod(a, b)
print(a + b, a - b, a * b, q, r, sep="\n")
```

## Список операций в цикле
approach: operator-loop
role: pythonic
time: O(1)
memory: O(1)
idea: Операции хранятся в списке как функции модуля operator и применяются в цикле.
principle: operator.add, operator.sub и т.д. — функции, эквивалентные операторам. Перебираем их и печатаем результат каждой.
pros: Легко добавить новую операцию
cons: Сложнее для новичка
when: Когда операций много или они выбираются динамически.
readability: 3
```python
import operator

a, b = map(int, input().split())
for op in (operator.add, operator.sub, operator.mul, operator.floordiv, operator.mod):
    print(op(a, b))
```

# skill: max_of_two_three
title: Наибольшее из двух или трёх чисел
topics: Условия; Встроенные функции
match: (MAX | MIN) & (TWO | THREE) & !LIST & !DIGIT & !MATRIX & !STRING & !SUBSEQUENCE & !COMMON & !WORD & !SUBSTRING
boost: NUMBER
priority: 1.2
input: a b c
param: FN = min if MIN else max
param: CMP = < if MIN else >
param: WORD = наименьшее if MIN else наибольшее
input_desc: Одна строка: несколько целых чисел через пробел (обычно 2 или 3).
output_desc: {WORD} из чисел.
understood: Даны несколько чисел (два или три). Найти {WORD} из них.
algorithm: Сравнение чисел
why: Можно сравнить числа условиями if или воспользоваться встроенной функцией {FN}.
ideas: {FN}() принимает любое количество аргументов; Условный оператор if/elif/else
structures: int
links: py:builtin:{FN}, py:kw:if, py:topic:conditions
edge: Равные числа: ответ — это же число.
edge: Отрицательные числа.
sample: 3 7 5
sample: -1 -5 -3
sample: 4 4 4
sample: 10 2

## Условие if
approach: if
role: beginner
time: O(k)
memory: O(1)
idea: Считаем первое число лучшим и сравниваем с ним остальные.
principle: best = первое число; для каждого следующего x: если x {CMP} best, обновляем best.
pros: Понятная логика
cons: Длиннее встроенной функции
when: Для обучения условиям.
readability: 5
```python
nums = list(map(int, input().split()))
best = nums[0]
for x in nums[1:]:
    if x {CMP} best:
        best = x
print(best)
```

## Встроенная функция {FN}
approach: builtin
role: short
time: O(k)
memory: O(1)
idea: {FN} возвращает {WORD} из аргументов.
principle: {FN}(*nums) распаковывает список в аргументы функции.
pros: Одна строка
cons: —
when: Всегда, когда не запрещено.
readability: 5
```python
print({FN}(map(int, input().split())))
```

## Сортировка
approach: sort
role: alternative
time: O(k log k)
memory: O(k)
idea: После сортировки нужное число стоит с краю.
principle: sorted(nums) упорядочивает по возрастанию: минимум — первый, максимум — последний элемент.
pros: Сразу даёт и порядок остальных
cons: Медленнее для больших наборов
when: Когда нужны и другие порядковые статистики.
readability: 4
```python
nums = sorted(map(int, input().split()))
print(nums[-1] if "{FN}" == "max" else nums[0])
```

## Тернарный оператор и functools.reduce
approach: reduce
role: pythonic
time: O(k)
memory: O(1)
idea: reduce попарно сравнивает числа выражением x if x {CMP} y else y.
principle: reduce(f, [a, b, c]) вычисляет f(f(a, b), c) — победитель каждого сравнения идёт дальше.
pros: Показывает свёртку и тернарный оператор
cons: Читается тяжелее
when: Для изучения функционального стиля.
readability: 3
```python
from functools import reduce

nums = list(map(int, input().split()))
print(reduce(lambda x, y: x if x {CMP} y else y, nums))
```

# skill: even_odd_check
title: Чётное или нечётное число
topics: Условия; Арифметика
match: EVEN & ODD & !LIST & !DIGIT & !RANGE & !MATRIX | (CHECK & (EVEN | ODD) & NUMBER & !LIST & !DIGIT & !RANGE & !MATRIX & !DIVISOR)
boost: NUMBER, CHECK
priority: 1.3
input: n
input_desc: Одна строка: целое число n.
output_desc: EVEN, если число чётное, иначе ODD.
understood: Дано целое число n. Определить, чётное оно или нечётное.
algorithm: Проверка остатка от деления на 2
why: Число чётное тогда и только тогда, когда n % 2 == 0. В Python это верно и для отрицательных чисел.
ideas: n % 2 == 0 — чётность; n & 1 — последний бит
structures: int
links: py:op:mod, py:op:bitand, py:kw:if
edge: n = 0 — чётное.
edge: Отрицательные числа: -3 % 2 == 1 в Python, поэтому проверка работает.
sample: 4 => EVEN
sample: 7 => ODD
sample: 0 => EVEN
sample: -3 => ODD

## Остаток от деления
approach: mod
role: beginner
time: O(1)
memory: O(1)
idea: Остаток от деления на 2 равен 0 только у чётных чисел.
principle: if n % 2 == 0 — ветка для чётного, else — для нечётного.
pros: Классика
cons: —
when: Всегда.
readability: 5
```python
n = int(input())
if n % 2 == 0:
    print("EVEN")
else:
    print("ODD")
```

## Побитовое И
approach: bit
role: efficient
time: O(1)
memory: O(1)
idea: Последний бит двоичной записи нечётного числа равен 1.
principle: n & 1 оставляет только младший бит: 0 — чётное, 1 — нечётное. Работает и для отрицательных (дополнительный код).
pros: Самая быстрая проверка на низком уровне
cons: Менее очевидно новичку
when: В битовых задачах.
readability: 4
```python
n = int(input())
print("ODD" if n & 1 else "EVEN")
```

## Последняя цифра
approach: last-digit
role: alternative
time: O(d)
memory: O(d)
idea: Число чётное, если его последняя цифра чётная.
principle: str(n)[-1] — последний символ записи; проверяем, входит ли он в "02468".
pros: Показывает связь с признаком делимости на 2
cons: Создаёт строку
when: Для объяснения признака делимости.
readability: 4
```python
n = int(input())
print("EVEN" if str(n)[-1] in "02468" else "ODD")
```

## Индексация кортежа
approach: tuple
role: pythonic
time: O(1)
memory: O(1)
idea: Остаток 0 или 1 используется как индекс в кортеже ответов.
principle: ("EVEN", "ODD")[n % 2] — n % 2 всегда 0 или 1, поэтому выбирается нужный ответ без if.
pros: Без условий
cons: Хитрый приём, хуже читается
when: Для коротких решений.
readability: 3
```python
n = int(input())
print(("EVEN", "ODD")[n % 2])
```

# skill: sign
title: Знак числа
topics: Условия
match: SIGN & !LIST
boost: NUMBER
priority: 1.5
input: n
input_desc: Одна строка: целое число n.
output_desc: 1, если n > 0; -1, если n < 0; 0, если n = 0.
understood: Дано число n. Вывести его знак: 1, -1 или 0.
algorithm: Цепочка условий if/elif/else
why: Три взаимоисключающих случая удобно проверять каскадом условий.
ideas: if/elif/else; Сравнения возвращают True/False, а True == 1
structures: int
links: py:kw:if, py:kw:elif, py:topic:conditions
edge: n = 0.
sample: 5 => 1
sample: -12 => -1
sample: 0 => 0

## if / elif / else
approach: if
role: beginner
time: O(1)
memory: O(1)
idea: Проверяем три случая по очереди.
principle: Сначала n > 0, затем n < 0, иначе (оставшийся случай) n == 0.
pros: Понятно
cons: Несколько строк
when: Всегда.
readability: 5
```python
n = int(input())
if n > 0:
    print(1)
elif n < 0:
    print(-1)
else:
    print(0)
```

## Разность булевых значений
approach: bool
role: short
time: O(1)
memory: O(1)
idea: (n > 0) - (n < 0): True и False ведут себя как 1 и 0.
principle: Для n > 0 получаем 1 - 0 = 1, для n < 0 — 0 - 1 = -1, для 0 — 0 - 0 = 0.
pros: Одна строка без условий
cons: Неочевидный приём
when: Для короткого кода.
readability: 3
```python
n = int(input())
print((n > 0) - (n < 0))
```

## math.copysign
approach: copysign
role: alternative
time: O(1)
memory: O(1)
idea: math.copysign(1, n) возвращает 1.0 со знаком n; отдельно обрабатываем ноль.
principle: copysign копирует знак второго аргумента в первый. Для нуля знак не нужен, поэтому сначала проверяем n == 0.
pros: Знакомит с модулем math
cons: Работает с float, нужен int()
when: При работе с дробными числами.
readability: 3
```python
import math

n = int(input())
print(0 if n == 0 else int(math.copysign(1, n)))
```

# skill: swap
title: Обмен значений двух переменных
topics: Переменные; Присваивание
match: SWAP & !LIST & !MATRIX
priority: 1.5
input: a b
input_desc: Одна строка: два значения a и b.
output_desc: Те же значения в обратном порядке: b a.
understood: Даны две переменные a и b. Поменять их значения местами.
algorithm: Обмен значениями
why: В Python обмен записывается одной строкой a, b = b, a: сначала вычисляется кортеж справа, затем распаковывается.
ideas: Множественное присваивание a, b = b, a; Временная переменная
structures: int
links: py:topic:assignment, py:topic:tuples
edge: Одинаковые значения.
sample: 1 2 => 2 1
sample: 5 5 => 5 5
sample: -3 10 => 10 -3

## Кортежное присваивание
approach: tuple
role: short
time: O(1)
memory: O(1)
idea: a, b = b, a — справа создаётся кортеж (b, a), который распаковывается в a и b.
principle: Правая часть вычисляется полностью до присваивания, поэтому значения не теряются.
pros: Идиоматичный Python
cons: —
when: Всегда.
readability: 5
```python
a, b = input().split()
a, b = b, a
print(a, b)
```

## Временная переменная
approach: temp
role: beginner
time: O(1)
memory: O(1)
idea: Сохраняем a во временной переменной, чтобы не потерять.
principle: temp = a; a = b; b = temp — классический обмен из любого языка.
pros: Понятно и переносимо
cons: Лишняя переменная
when: Для объяснения сути обмена.
readability: 5
```python
a, b = input().split()
temp = a
a = b
b = temp
print(a, b)
```

## Арифметический обмен
approach: arith
role: alternative
time: O(1)
memory: O(1)
idea: Для чисел: a = a + b; b = a - b; a = a - b.
principle: После первой строки a хранит сумму; b = сумма − b = старое a; a = сумма − новое b = старое b.
pros: Без дополнительной переменной
cons: Только для чисел; в других языках возможно переполнение
when: Как олимпиадная головоломка.
readability: 3
```python
a, b = map(int, input().split())
a = a + b
b = a - b
a = a - b
print(a, b)
```

## Обмен через XOR
approach: xor
role: pythonic
time: O(1)
memory: O(1)
idea: Три операции XOR меняют местами два целых числа.
principle: x ^ x == 0 и x ^ 0 == x, поэтому a ^= b; b ^= a; a ^= b восстанавливает значения в обратном порядке.
pros: Классический битовый трюк
cons: Только для целых; неочевидно
when: В задачах на битовые операции.
readability: 2
```python
a, b = map(int, input().split())
a ^= b
b ^= a
a ^= b
print(a, b)
```

# skill: gcd
title: НОД двух чисел
topics: Теория чисел; Алгоритм Евклида
match: GCD & !LCM & !LIST
boost: TWO, NUMBER
priority: 2
input: a b
input_desc: Одна строка: два целых неотрицательных числа a и b.
output_desc: Одно число — НОД(a, b).
understood: Даны два целых числа a и b. Найти их наибольший общий делитель (НОД).
algorithm: Алгоритм Евклида
why: НОД(a, b) = НОД(b, a mod b), а НОД(a, 0) = a. Числа быстро уменьшаются, поэтому шагов O(log min(a, b)).
ideas: НОД(a, b) = НОД(b, a % b); НОД(a, 0) = a; math.gcd
structures: int
links: algo:gcd, lib:math.gcd, py:op:mod, py:kw:while
edge: Одно из чисел 0: НОД(a, 0) = a.
edge: Оба числа равны 0: принято считать НОД(0, 0) = 0.
edge: Взаимно простые числа: НОД = 1.
step: Пока b не равно 0, заменяем пару (a, b) на (b, a % b).
step: Остаток всегда меньше делителя, поэтому b строго уменьшается и цикл конечен.
step: Когда b == 0, ответ — a.
sample: 12 18 => 6
sample: 7 13 => 1
sample: 0 5 => 5
sample: 1071 462 => 21
sample: 1000000 999990 => 10

## Алгоритм Евклида (цикл)
approach: euclid-loop
role: beginner
time: O(log min(a, b))
memory: O(1)
idea: Заменяем пару (a, b) на (b, a % b), пока b не станет нулём.
principle: Общие делители a и b совпадают с общими делителями b и a % b, поэтому НОД не меняется. Когда b = 0, НОД(a, 0) = a.
pros: Быстро и без библиотек; главный алгоритм теории чисел
cons: Нужно понимать, почему он работает
when: Всегда, когда нельзя использовать math.gcd.
readability: 5
```python
a, b = map(int, input().split())
while b != 0:
    a, b = b, a % b
print(a)
```

## math.gcd
approach: math
role: short
time: O(log min(a, b))
memory: O(1)
idea: Готовая функция стандартной библиотеки.
principle: math.gcd реализует алгоритм Евклида на C и работает с отрицательными числами (возвращает неотрицательный результат).
pros: Одна строка, самый быстрый
cons: Не показывает алгоритм
when: На олимпиаде и в реальном коде.
readability: 5
```python
import math

a, b = map(int, input().split())
print(math.gcd(a, b))
```

## Рекурсивный Евклид
approach: recursion
role: alternative
time: O(log min(a, b))
memory: O(log min(a, b)) — стек
idea: gcd(a, b) = a, если b == 0, иначе gcd(b, a % b).
principle: Прямая запись математического определения в виде рекурсивной функции.
pros: Короткая и красивая формула
cons: Тратит стек вызовов
when: Для изучения рекурсии.
readability: 4
```python
def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)


a, b = map(int, input().split())
print(gcd(a, b))
```

## Евклид вычитанием
approach: subtraction
role: alternative
time: O(max(a, b)) в худшем случае
memory: O(1)
idea: Из большего числа вычитаем меньшее: НОД(a, b) = НОД(a − b, b).
principle: Исходная форма алгоритма Евклида. Деление с остатком — это много вычитаний сразу, поэтому версия с % быстрее.
pros: Понятна без операции %
cons: Очень медленно для чисел вроде (10⁹, 1)
when: Для объяснения идеи алгоритма.
readability: 4
```python
a, b = map(int, input().split())
if a == 0 or b == 0:
    print(a + b)
else:
    while a != b:
        if a > b:
            a -= b
        else:
            b -= a
    print(a)
```

## Бинарный алгоритм (Штейна)
approach: binary
role: efficient
time: O(log a + log b)
memory: O(1)
idea: Использует только сдвиги и вычитания: общие множители 2 выносятся отдельно.
principle: Если оба чётные — НОД = 2·НОД(a/2, b/2); если одно чётное — делим его на 2; если оба нечётные — заменяем большее на разность. В конце умножаем на 2^shift.
pros: Нет операции деления — быстро на «железе»
cons: Сложнее Евклида
when: При реализации на низком уровне или в задачах про биты.
readability: 2
```python
a, b = map(int, input().split())
if a == 0 or b == 0:
    print(a + b)
else:
    shift = 0
    while (a | b) & 1 == 0:
        a >>= 1
        b >>= 1
        shift += 1
    while a & 1 == 0:
        a >>= 1
    while b != 0:
        while b & 1 == 0:
            b >>= 1
        if a > b:
            a, b = b, a
        b -= a
    print(a << shift)
```

# skill: lcm
title: НОК двух чисел
topics: Теория чисел
match: LCM & !LIST
boost: TWO, NUMBER
priority: 2
input: a b
input_desc: Одна строка: два натуральных числа a и b.
output_desc: Одно число — НОК(a, b).
understood: Даны два натуральных числа a и b. Найти их наименьшее общее кратное (НОК).
algorithm: НОК через НОД
why: НОК(a, b) · НОД(a, b) = a · b, поэтому НОК = a // НОД(a, b) * b.
ideas: НОК = a * b // НОД; Сначала делим, потом умножаем — меньше промежуточные числа
structures: int
links: algo:gcd, lib:math.lcm, lib:math.gcd
edge: Одно число делит другое: НОК — большее число.
edge: Взаимно простые числа: НОК = a · b.
sample: 4 6 => 12
sample: 7 13 => 91
sample: 12 36 => 36
sample: 1 1 => 1

## Через НОД (Евклид)
approach: via-gcd
role: beginner
time: O(log min(a, b))
memory: O(1)
idea: Находим НОД алгоритмом Евклида, затем НОК = a // НОД * b.
principle: Произведение НОД и НОК равно произведению чисел: каждый простой множитель входит в НОД с минимальной степенью, в НОК — с максимальной.
pros: Быстро; показывает связь НОД и НОК
cons: Нужно реализовать НОД
when: Всегда.
readability: 5
```python
a, b = map(int, input().split())
x, y = a, b
while y:
    x, y = y, x % y
print(a // x * b)
```

## math.lcm
approach: math-lcm
role: short
time: O(log min(a, b))
memory: O(1)
idea: Готовая функция Python 3.9+.
principle: math.lcm вычисляет НОК любого количества чисел.
pros: Одна строка
cons: Нужен Python 3.9 или новее
when: Если версия Python позволяет.
readability: 5
python: 3.9
```python
import math

a, b = map(int, input().split())
print(math.lcm(a, b))
```

## math.gcd + формула
approach: math-gcd
role: alternative
time: O(log min(a, b))
memory: O(1)
idea: НОК = a * b // gcd(a, b) с библиотечным НОД.
principle: Работает в любой версии Python 3.
pros: Коротко и совместимо
cons: —
when: Если нет math.lcm.
readability: 5
```python
from math import gcd

a, b = map(int, input().split())
print(a * b // gcd(a, b))
```

## Перебор кратных
approach: brute
role: alternative
time: O(min(a, b))
memory: O(1)
idea: Перебираем кратные большего числа, пока не найдём делящееся на меньшее.
principle: НОК — первое кратное max(a, b), которое делится на min(a, b). Таких шагов не больше min(a, b).
pros: Понятно без теории
cons: Медленно для больших чисел
when: Для маленьких чисел и проверки решения.
readability: 4
```python
a, b = map(int, input().split())
big, small = max(a, b), min(a, b)
m = big
while m % small != 0:
    m += big
print(m)
```

# skill: gcd_list
title: НОД нескольких чисел
topics: Теория чисел
match: GCD & (LIST | ELEMENT | THREE)
priority: 2.2
input: list
input_desc: Одна строка: натуральные числа через пробел.
output_desc: НОД всех чисел.
understood: Дан набор натуральных чисел. Найти их общий НОД.
algorithm: Последовательный НОД
why: НОД(a, b, c) = НОД(НОД(a, b), c): можно сворачивать список попарно.
ideas: functools.reduce(math.gcd, a); НОД ассоциативен
structures: list
links: algo:gcd, lib:math.gcd, lib:functools.reduce
edge: Одно число: НОД = само число.
edge: Если встретилась 1 — НОД сразу 1.
sample: 12 18 24 => 6
sample: 7 => 7
sample: 100 75 50 25 => 25
sample: 6 10 15 => 1

## Цикл с Евклидом
approach: loop
role: beginner
time: O(n log max)
memory: O(1)
idea: Держим текущий НОД g и обновляем его каждым числом.
principle: g = НОД(g, x) для каждого x. Начинаем с 0, так как НОД(0, x) = x.
pros: Понятно
cons: Больше кода
when: Без библиотек.
readability: 5
```python
nums = list(map(int, input().split()))
g = 0
for x in nums:
    a, b = g, x
    while b:
        a, b = b, a % b
    g = a
print(g)
```

## reduce + math.gcd
approach: reduce
role: short
time: O(n log max)
memory: O(1)
idea: reduce сворачивает список функцией gcd.
principle: reduce(gcd, [a, b, c]) == gcd(gcd(a, b), c).
pros: Одна строка
cons: —
when: Всегда.
readability: 4
```python
from functools import reduce
from math import gcd

print(reduce(gcd, map(int, input().split())))
```

## math.gcd с несколькими аргументами
approach: varargs
role: pythonic
time: O(n log max)
memory: O(n)
idea: С Python 3.9 math.gcd принимает любое количество аргументов.
principle: math.gcd(*nums) распаковывает список в аргументы.
pros: Короче всего
cons: Нужен Python 3.9+
when: В новых версиях Python.
readability: 5
python: 3.9
```python
import math

print(math.gcd(*map(int, input().split())))
```

# skill: factorial
title: Факториал числа
topics: Комбинаторика; Циклы; Рекурсия
match: FACTORIAL & !DIGIT & !ZERO
avoid: SUM, COUNT
priority: 2
input: n
input_desc: Одна строка: целое число n ≥ 0.
output_desc: n! = 1 · 2 · … · n.
understood: Дано целое неотрицательное число n. Вычислить n! — произведение всех чисел от 1 до n.
algorithm: Накопление произведения
why: n! = (n − 1)! · n, а 0! = 1. Python работает с длинными целыми, поэтому переполнения нет.
ideas: 0! = 1; n! растёт очень быстро; math.factorial
structures: int
links: algo:factorial, lib:math.factorial, py:kw:for, py:topic:recursion
edge: n = 0: 0! = 1.
edge: Большие n (например, 1000): результат огромный, но Python справляется.
step: Начинаем с result = 1 (нейтральный элемент умножения).
step: Умножаем result на каждое число от 2 до n.
sample: 5 => 120
sample: 0 => 1
sample: 1 => 1
sample: 20 => 2432902008176640000

## Цикл for
approach: loop
role: beginner
time: O(n) умножений
memory: O(1) (кроме самого числа)
idea: Перемножаем числа от 1 до n.
principle: result начинается с 1, затем result *= i для i = 2..n.
pros: Понятно
cons: —
when: Для обучения.
readability: 5
```python
n = int(input())
result = 1
for i in range(2, n + 1):
    result *= i
print(result)
```

## math.factorial
approach: math
role: short
time: O(n) (быстрый алгоритм на C)
memory: O(1)
idea: Готовая функция стандартной библиотеки.
principle: math.factorial использует оптимизированный алгоритм (разделяй и властвуй), поэтому работает быстрее цикла для больших n.
pros: Самый быстрый и короткий
cons: Не показывает алгоритм
when: Всегда, когда нужен просто n!.
readability: 5
```python
import math

print(math.factorial(int(input())))
```

## Рекурсия
approach: recursion
role: alternative
time: O(n)
memory: O(n) — стек
idea: n! = n · (n − 1)!, 0! = 1.
principle: Функция вызывает себя для n − 1, пока не дойдёт до базы n == 0.
pros: Прямая запись определения
cons: Для n > ~990 превышает лимит рекурсии
when: Для изучения рекурсии.
readability: 4
```python
def fact(n):
    return 1 if n == 0 else n * fact(n - 1)


print(fact(int(input())))
```

## math.prod(range)
approach: prod
role: pythonic
time: O(n)
memory: O(1)
idea: Произведение всех чисел диапазона одной функцией.
principle: math.prod(range(1, n + 1)) перемножает элементы; для пустого диапазона (n = 0) возвращает 1.
pros: Коротко, корректно для 0
cons: Python 3.8+
when: Когда нужно произведение произвольного диапазона.
readability: 4
python: 3.8
```python
import math

n = int(input())
print(math.prod(range(1, n + 1)))
```

## functools.reduce
approach: reduce
role: alternative
time: O(n)
memory: O(1)
idea: Свёртка диапазона операцией умножения.
principle: reduce(operator.mul, range(1, n + 1), 1) — начальное значение 1 нужно для n = 0.
pros: Функциональный стиль
cons: Длиннее math.prod
when: В старых версиях Python.
readability: 3
```python
from functools import reduce
import operator

n = int(input())
print(reduce(operator.mul, range(1, n + 1), 1))
```

# skill: fibonacci
title: n-е число Фибоначчи
topics: Рекурсия; Динамическое программирование
match: FIBONACCI & !SUM & !EVEN & !ODD & !PRINT & !LIST
priority: 2
big: 100000
input: n
input_desc: Одна строка: целое число n ≥ 0.
output_desc: F(n), где F(0) = 0, F(1) = 1, F(n) = F(n−1) + F(n−2).
understood: Дано n. Найти n-е число Фибоначчи F(n) (F(0) = 0, F(1) = 1).
algorithm: Итеративное ДП с двумя переменными
why: Каждое число — сумма двух предыдущих; храним только два последних значения.
ideas: F(n) = F(n−1) + F(n−2); Наивная рекурсия экспоненциальна; Мемоизация
structures: int
links: algo:fibonacci, algo:dp, py:topic:recursion, lib:functools.lru_cache
edge: n = 0 и n = 1.
edge: Нумерация: в некоторых задачах F(1) = F(2) = 1 — это совпадает с F(n) при F(0) = 0.
edge: Большие n: числа длинные, но Python справляется; для n ~ 10⁶ используйте быстрое удвоение.
sample: 0 => 0
sample: 1 => 1
sample: 10 => 55
sample: 50 => 12586269025
sample: 90 => 2880067194370816120

## Две переменные
approach: iter
role: beginner
time: O(n)
memory: O(1)
idea: Храним пару (F(i), F(i+1)) и сдвигаем её n раз.
principle: a, b = b, a + b переходит от пары (F(i), F(i+1)) к (F(i+1), F(i+2)).
pros: Быстро и просто
cons: —
when: Почти всегда.
readability: 5
```python
n = int(input())
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b
print(a)
```

## Рекурсия с мемоизацией
approach: memo
role: alternative
time: O(n)
memory: O(n)
idea: Рекурсивное определение + кэш уже вычисленных значений.
principle: @lru_cache запоминает результат fib(k), поэтому каждое значение считается один раз (без кэша — экспоненциальное время).
pros: Прямая запись формулы
cons: Глубина рекурсии ~n (для n > ~900 нужен sys.setrecursionlimit)
when: Для объяснения мемоизации.
readability: 4
```python
from functools import lru_cache
import sys

sys.setrecursionlimit(10000)


@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(int(input())))
```

## Массив ДП
approach: dp-list
role: alternative
time: O(n)
memory: O(n)
idea: Заполняем таблицу f[0..n] слева направо.
principle: f[i] = f[i-1] + f[i-2] — классическое динамическое программирование «снизу вверх».
pros: Наглядно: видны все значения
cons: Память O(n)
when: Когда нужны все числа последовательности.
readability: 5
```python
n = int(input())
f = [0, 1] + [0] * max(0, n - 1)
for i in range(2, n + 1):
    f[i] = f[i - 1] + f[i - 2]
print(f[n])
```

## Быстрое удвоение O(log n)
approach: doubling
role: efficient
time: O(log n) операций с длинными числами
memory: O(log n)
idea: Формулы F(2k) = F(k)·(2F(k+1) − F(k)) и F(2k+1) = F(k)² + F(k+1)² позволяют перескакивать через половину индексов.
principle: Рекурсивно находим (F(k), F(k+1)) для k = n // 2 и по формулам получаем пару для n.
pros: Огромные n (10⁶ и больше) за доли секунды
cons: Нужно знать формулы
when: Когда n очень велико или нужен F(n) по модулю.
readability: 2
```python
def fib_pair(n):
    if n == 0:
        return 0, 1
    a, b = fib_pair(n // 2)
    c = a * (2 * b - a)
    d = a * a + b * b
    return (d, c + d) if n % 2 else (c, d)


print(fib_pair(int(input()))[0])
```

## Матрица [[1,1],[1,0]] в степени n
approach: matrix
role: alternative
time: O(log n)
memory: O(1)
idea: [[1,1],[1,0]]ⁿ = [[F(n+1), F(n)], [F(n), F(n−1)]]; степень матрицы считается быстрым возведением.
principle: Бинарное возведение в степень: перемножаем матрицы для единичных битов n.
pros: Универсальный приём для любых линейных рекуррент
cons: Многословно
when: Для рекуррент вида f(n) = a·f(n−1) + b·f(n−2).
readability: 2
```python
def mul(x, y):
    return [[x[0][0] * y[0][0] + x[0][1] * y[1][0], x[0][0] * y[0][1] + x[0][1] * y[1][1]],
            [x[1][0] * y[0][0] + x[1][1] * y[1][0], x[1][0] * y[0][1] + x[1][1] * y[1][1]]]


n = int(input())
result = [[1, 0], [0, 1]]
base = [[1, 1], [1, 0]]
while n:
    if n & 1:
        result = mul(result, base)
    base = mul(base, base)
    n >>= 1
print(result[0][1])
```

# skill: fibonacci_list
title: Первые n чисел Фибоначчи
topics: Циклы; Последовательности
match: FIBONACCI & (PRINT | FIRST | LIST | SUM | EVEN | ODD | COUNT)
priority: 2.1
input: n
input_desc: Одна строка: n ≥ 1.
output_desc: Первые n чисел Фибоначчи через пробел, начиная с 0 1 1 2 …
understood: Дано n. Вывести первые n чисел Фибоначчи (0, 1, 1, 2, 3, 5, …).
algorithm: Генерация последовательности
why: Каждый новый член — сумма двух предыдущих.
ideas: Список и append; Генератор с yield
structures: list
links: algo:fibonacci, py:topic:generators, py:method:list.append
edge: n = 1: выводится только 0.
edge: n = 2: 0 1.
sample: 1 => 0
sample: 2 => 0 1
sample: 10 => 0 1 1 2 3 5 8 13 21 34

## Список и append
approach: list
role: beginner
time: O(n)
memory: O(n)
idea: Начинаем со списка [0, 1] и дописываем суммы двух последних.
principle: fib[-1] + fib[-2] — сумма последних двух элементов списка. В конце берём первые n.
pros: Наглядно
cons: Хранит все числа
when: Для обучения.
readability: 5
```python
n = int(input())
fib = [0, 1]
while len(fib) < n:
    fib.append(fib[-1] + fib[-2])
print(*fib[:n])
```

## Две переменные
approach: vars
role: efficient
time: O(n)
memory: O(1) (кроме вывода)
idea: Печатаем текущее число и сдвигаем пару (a, b).
principle: a, b = b, a + b переходит к следующей паре соседних чисел.
pros: Не хранит последовательность
cons: —
when: Когда числа нужно только вывести.
readability: 5
```python
n = int(input())
a, b = 0, 1
result = []
for _ in range(n):
    result.append(a)
    a, b = b, a + b
print(*result)
```

## Генератор с yield
approach: generator
role: pythonic
time: O(n)
memory: O(1) на генератор
idea: Функция-генератор бесконечно выдаёт числа Фибоначчи, itertools.islice берёт первые n.
principle: yield приостанавливает функцию и возвращает значение; при следующем запросе выполнение продолжается.
pros: Ленивые вычисления, удобно переиспользовать
cons: Нужно понимать генераторы
when: Когда последовательность обрабатывается по частям.
readability: 3
```python
from itertools import islice


def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


n = int(input())
print(*islice(fibonacci(), n))
```

# skill: power
title: Возведение в степень
topics: Арифметика; Быстрое возведение в степень
match: POWER & !MOD & !LIST & !DIGIT & !BITS
boost: NUMBER
avoid: SUM, RANGE, TWO, CHECK
priority: 1.6
input: a b
input_desc: Одна строка: целое a и целое неотрицательное b.
output_desc: a в степени b.
understood: Даны a и b. Вычислить a в степени b.
algorithm: Возведение в степень
why: Оператор ** использует быстрое (бинарное) возведение в степень: O(log b) умножений.
ideas: a ** b; pow(a, b); Бинарное возведение в степень
structures: int
links: py:op:pow, py:builtin:pow, algo:binpow
edge: b = 0: результат 1 (даже для a = 0).
edge: Отрицательная степень даёт дробь (float).
sample: 2 10 => 1024
sample: 3 0 => 1
sample: -2 3 => -8
sample: 10 20 => 100000000000000000000

## Оператор **
approach: op
role: short
time: O(log b) умножений
memory: O(1)
idea: Встроенный оператор возведения в степень.
principle: a ** b для целых чисел реализован бинарным возведением на C.
pros: Самый короткий и быстрый
cons: —
when: Всегда.
readability: 5
```python
a, b = map(int, input().split())
print(a ** b)
```

## Цикл умножений
approach: loop
role: beginner
time: O(b)
memory: O(1)
idea: Умножаем 1 на a ровно b раз.
principle: result = a · a · … · a (b множителей).
pros: Понятно
cons: Медленно для больших b
when: Для объяснения сути степени.
readability: 5
```python
a, b = map(int, input().split())
result = 1
for _ in range(b):
    result *= a
print(result)
```

## Бинарное возведение в степень
approach: binpow
role: efficient
time: O(log b)
memory: O(1)
idea: aᵇ = (a²)^(b/2) для чётного b и a · aᵇ⁻¹ для нечётного.
principle: Перебираем биты b: если бит 1 — умножаем результат на текущую степень a; затем возводим a в квадрат.
pros: Основа быстрого модульного возведения
cons: Длиннее встроенного оператора
when: Когда нужно понимать алгоритм или считать по модулю.
readability: 3
```python
a, b = map(int, input().split())
result = 1
while b > 0:
    if b & 1:
        result *= a
    a *= a
    b >>= 1
print(result)
```

## Встроенная функция pow
approach: pow
role: alternative
time: O(log b)
memory: O(1)
idea: pow(a, b) — то же, что a ** b; с третьим аргументом считает по модулю.
principle: pow(a, b, m) вычисляет (a ** b) % m без огромных промежуточных чисел.
pros: Поддерживает модуль
cons: —
when: Когда понадобится модуль.
readability: 5
```python
a, b = map(int, input().split())
print(pow(a, b))
```

# skill: modpow
title: Возведение в степень по модулю
topics: Модульная арифметика; Быстрое возведение в степень
match: POWER & MOD
priority: 2.2
input: a b m
input_desc: Одна строка: a, b, m (b ≥ 0, m ≥ 1).
output_desc: (a в степени b) по модулю m.
understood: Даны a, b и m. Вычислить aᵇ mod m.
algorithm: Бинарное возведение в степень по модулю
why: После каждого умножения берём остаток, поэтому числа не растут; умножений O(log b).
ideas: (x · y) mod m = ((x mod m) · (y mod m)) mod m; pow(a, b, m)
structures: int
links: algo:binpow, py:builtin:pow, algo:modular
edge: m = 1: ответ всегда 0.
edge: b = 0: ответ 1 % m.
sample: 2 10 1000 => 24
sample: 3 200 13 => 9
sample: 5 0 7 => 1
sample: 7 5 1 => 0
sample: 123456789 987654321 1000000007 => 652541198

## pow(a, b, m)
approach: pow
role: short
time: O(log b)
memory: O(1)
idea: Встроенная функция с модулем.
principle: Python реализует бинарное возведение по модулю на C.
pros: Самое быстрое и короткое
cons: —
when: Всегда.
readability: 5
```python
a, b, m = map(int, input().split())
print(pow(a, b, m))
```

## Бинарное возведение вручную
approach: binpow
role: beginner
time: O(log b)
memory: O(1)
idea: Перебираем биты степени, все промежуточные результаты берём по модулю.
principle: Если младший бит b равен 1, умножаем результат на a; затем a = a² mod m, b //= 2.
pros: Показывает алгоритм — нужен на олимпиадах на любом языке
cons: Длиннее pow
when: Для понимания и переноса на C++.
readability: 4
```python
a, b, m = map(int, input().split())
result = 1 % m
a %= m
while b > 0:
    if b % 2 == 1:
        result = result * a % m
    a = a * a % m
    b //= 2
print(result)
```

## Рекурсия
approach: recursion
role: alternative
time: O(log b)
memory: O(log b)
idea: aᵇ = (a^(b/2))² для чётного b, a · aᵇ⁻¹ — для нечётного.
principle: Каждый вызов уменьшает степень вдвое.
pros: Наглядная формула
cons: Расход стека
when: Для изучения рекурсии.
readability: 4
```python
def power(a, b, m):
    if b == 0:
        return 1 % m
    half = power(a, b // 2, m)
    result = half * half % m
    return result * a % m if b % 2 else result


a, b, m = map(int, input().split())
print(power(a, b, m))
```

# skill: is_prime
title: Проверка числа на простоту
topics: Теория чисел; Простые числа
match: PRIME & !LIST & !RANGE & !DIGIT & !DIVISOR & !SUM & !PRINT & !MATRIX & !FACTORIZE & !SIEVE & !LESS_EQ & !LESS & !FIRST & !STRING
boost: CHECK, NUMBER
priority: 1.8
big: 1000000000000
input: n
input_desc: Одна строка: целое число n.
output_desc: YES, если n простое, иначе NO.
understood: Дано натуральное число n. Определить, является ли оно простым.
algorithm: Перебор делителей до √n
why: Если у n есть делитель d > √n, то есть и парный n / d < √n, поэтому достаточно проверить d ≤ √n.
ideas: Простое число имеет ровно два делителя; Проверка до √n; 1 — не простое
structures: int
links: algo:primes, algo:divisors, lib:math.isqrt
edge: n = 1 — не простое; n = 2 — единственное чётное простое.
edge: n ≤ 0 — не простые.
edge: Для n до 10¹⁸ используйте тест Миллера–Рабина.
step: Числа меньше 2 сразу не простые.
step: Проверяем делители d = 2, 3, … пока d · d ≤ n.
step: Нашли делитель — NO, иначе YES.
sample: 2 => YES
sample: 1 => NO
sample: 97 => YES
sample: 91 => NO
sample: 1000000007 => YES
sample: 999999999989 => YES

## Перебор до √n
approach: sqrt
role: beginner
time: O(√n)
memory: O(1)
idea: Ищем делитель от 2 до √n.
principle: d * d <= n — то же, что d ≤ √n, но без дробей. Если делителя нет — число простое.
pros: Просто и достаточно быстро до n ≈ 10¹²
cons: Медленно для 10¹⁸
when: Стандартный выбор.
readability: 5
```python
n = int(input())
prime = n >= 2
d = 2
while d * d <= n:
    if n % d == 0:
        prime = False
        break
    d += 1
print("YES" if prime else "NO")
```

## all() + math.isqrt
approach: builtin
role: short
time: O(√n)
memory: O(1)
idea: Число простое, если ни одно d из [2, √n] его не делит.
principle: all(n % d for d in range(2, isqrt(n) + 1)) истинно, когда все остатки ненулевые.
pros: Одна строка логики
cons: Python 3.8+ для isqrt
when: Для короткого решения.
readability: 4
python: 3.8
```python
from math import isqrt

n = int(input())
print("YES" if n >= 2 and all(n % d for d in range(2, isqrt(n) + 1)) else "NO")
```

## Оптимизация 6k ± 1
approach: 6k
role: efficient
time: O(√n / 3)
memory: O(1)
idea: Все простые > 3 имеют вид 6k ± 1, поэтому проверяем только такие делители.
principle: Отдельно проверяем 2 и 3, затем d = 5, 7, 11, 13, … (шаг 6: d и d + 2).
pros: В 3 раза меньше проверок
cons: Чуть сложнее
when: Когда нужно ускорить проверку.
readability: 3
```python
n = int(input())
if n < 2:
    prime = False
elif n < 4:
    prime = True
elif n % 2 == 0 or n % 3 == 0:
    prime = False
else:
    prime = True
    d = 5
    while d * d <= n:
        if n % d == 0 or n % (d + 2) == 0:
            prime = False
            break
        d += 6
print("YES" if prime else "NO")
```

## Тест Миллера–Рабина
approach: miller-rabin
role: efficient
time: O(k · log³ n)
memory: O(1)
idea: Вероятностный тест, который с фиксированным набором оснований детерминирован для n < 3,3·10²⁴.
principle: n − 1 = d · 2ˢ. Для каждого основания a проверяем, что aᵈ ≡ 1 или a^(d·2ʳ) ≡ −1 (mod n) для некоторого r. Если нет — n составное.
pros: Мгновенно для чисел до 10¹⁸ и больше
cons: Сложный алгоритм
when: Когда n очень большое (10¹²–10¹⁸).
readability: 2
```python
def is_prime(n):
    if n < 2:
        return False
    small = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)
    for p in small:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in small:
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


print("YES" if is_prime(int(input())) else "NO")
```

# skill: primes_upto
title: Все простые числа до n
topics: Теория чисел; Решето Эратосфена
match: PRIME & (SIEVE | LESS_EQ | LESS | PRINT | FIRST) & !DIGIT & !LIST & !SUM & !COUNT & !CHECK
boost: SIEVE, NATURAL
priority: 1.9
big: 1000000
input: n
input_desc: Одна строка: n ≥ 1.
output_desc: Все простые числа от 2 до n через пробел.
understood: Дано n. Вывести все простые числа, не превосходящие n.
algorithm: Решето Эратосфена
why: Вычёркиваем кратные каждого простого — оставшиеся числа простые. Время O(n log log n).
ideas: Вычёркивание начиная с p²; Список булевых значений; Срезы для быстрого вычёркивания
structures: list[bool]
links: algo:sieve, algo:primes, lib:math.isqrt
edge: n < 2: простых нет — пустой вывод.
edge: n = 2: только 2.
sample: 10 => 2 3 5 7
sample: 1 => 
sample: 2 => 2
sample: 30 => 2 3 5 7 11 13 17 19 23 29

## Решето Эратосфена
approach: sieve
role: efficient
time: O(n log log n)
memory: O(n)
idea: Вычёркиваем числа, кратные каждому найденному простому.
principle: is_prime[i] = True для всех i ≥ 2. Для каждого простого p (p² ≤ n) вычёркиваем p², p² + p, … Меньшие кратные уже вычеркнуты меньшими простыми.
pros: Очень быстро для n до 10⁷
cons: Память O(n)
when: Когда нужны все простые до n.
readability: 4
```python
n = int(input())
is_prime = [True] * (n + 1)
is_prime[0:2] = [False] * min(2, n + 1)
p = 2
while p * p <= n:
    if is_prime[p]:
        for j in range(p * p, n + 1, p):
            is_prime[j] = False
    p += 1
print(*[i for i in range(n + 1) if is_prime[i]])
```

## Решето со срезами
approach: sieve-slice
role: pythonic
time: O(n log log n)
memory: O(n)
idea: То же решето, но вычёркивание делается присваиванием среза — на порядок быстрее в Python.
principle: sieve[p*p::p] = bytearray(len(range(p*p, n+1, p))) обнуляет все кратные p одной операцией на C.
pros: Самая быстрая реализация на чистом Python
cons: Чуть менее очевидно
when: Для n до 10⁸.
readability: 3
python: 3.8
```python
from math import isqrt

n = int(input())
sieve = bytearray([1]) * (n + 1)
sieve[0:2] = bytes(min(2, n + 1))
for p in range(2, isqrt(n) + 1):
    if sieve[p]:
        sieve[p * p::p] = bytes(len(range(p * p, n + 1, p)))
print(*[i for i in range(n + 1) if sieve[i]])
```

## Проверка каждого числа
approach: trial
role: beginner
time: O(n √n)
memory: O(1)
idea: Для каждого числа от 2 до n проверяем простоту делением до √i.
principle: Простое i не имеет делителей в [2, √i].
pros: Понятно без решета
cons: Намного медленнее решета
when: Для небольших n или обучения.
readability: 5
```python
n = int(input())
primes = []
for i in range(2, n + 1):
    d = 2
    while d * d <= i and i % d != 0:
        d += 1
    if d * d > i:
        primes.append(i)
print(*primes)
```

## Деление только на найденные простые
approach: by-primes
role: alternative
time: O(n √n / log n)
memory: O(π(n))
idea: Составное число имеет простой делитель ≤ √i, поэтому делим только на уже найденные простые.
principle: Перебираем найденные простые p, пока p² ≤ i; если ни одно не делит i, оно простое.
pros: Быстрее простого перебора
cons: Медленнее решета
when: Когда простые нужны «на лету» по одному.
readability: 4
```python
n = int(input())
primes = []
for i in range(2, n + 1):
    for p in primes:
        if p * p > i:
            primes.append(i)
            break
        if i % p == 0:
            break
    else:
        primes.append(i)
print(*primes)
```

# skill: factorize
title: Разложение на простые множители
topics: Теория чисел
match: FACTORIZE | (PRIME & DIVISOR & (PRINT | FACTORIZE))
avoid: LIST, COUNT, SUM
priority: 2
big: 1000000000000
input: n
input_desc: Одна строка: натуральное n ≥ 2.
output_desc: Простые множители n в порядке неубывания через пробел (с повторениями).
understood: Дано натуральное число n. Разложить его на простые множители.
algorithm: Пробное деление до √n
why: Делим n на d, пока делится; переходим к следующему d. Если после d > √n осталось m > 1 — это простой множитель.
ideas: Основная теорема арифметики; Перебор до √n; Остаток m > 1 — простой
structures: list
links: algo:factorization, algo:primes, algo:divisors
edge: n — простое: множитель один — само n.
edge: n = степень двойки: 2 2 2 …
edge: Для n до 10¹⁸ с большими простыми множителями нужен алгоритм Полларда.
sample: 12 => 2 2 3
sample: 97 => 97
sample: 360 => 2 2 2 3 3 5
sample: 1000000007 => 1000000007
sample: 600851475143 => 71 839 1471 6857

## Пробное деление
approach: trial
role: beginner
time: O(√n)
memory: O(log n)
idea: Делим на 2, 3, 4, … пока делится; составные d не поделят, так как их множители уже извлечены.
principle: Когда d доходит до составного числа, все его простые множители уже вынесены из n, поэтому n % d != 0.
pros: Просто
cons: O(√n) при большом простом множителе
when: Для n до 10¹²–10¹⁴.
readability: 5
```python
n = int(input())
factors = []
d = 2
while d * d <= n:
    while n % d == 0:
        factors.append(d)
        n //= d
    d += 1
if n > 1:
    factors.append(n)
print(*factors)
```

## Отдельно 2, затем нечётные
approach: odd
role: efficient
time: O(√n / 2)
memory: O(log n)
idea: После извлечения всех двоек проверяем только нечётные делители.
principle: Вдвое меньше проверок, чем при переборе всех d.
pros: Быстрее в 2 раза
cons: Чуть больше кода
when: Для больших n.
readability: 4
```python
n = int(input())
factors = []
while n % 2 == 0:
    factors.append(2)
    n //= 2
d = 3
while d * d <= n:
    while n % d == 0:
        factors.append(d)
        n //= d
    d += 2
if n > 1:
    factors.append(n)
print(*factors)
```

## Рекурсия
approach: recursion
role: alternative
time: O(√n)
memory: O(log n)
idea: Находим наименьший делитель p, выводим его и раскладываем n / p.
principle: Наименьший делитель > 1 всегда простой.
pros: Короткая рекурсивная формулировка
cons: Повторно перебирает делители с начала (можно передавать start)
when: Для обучения рекурсии.
readability: 4
```python
def factorize(n, start=2):
    d = start
    while d * d <= n:
        if n % d == 0:
            return [d] + factorize(n // d, d)
        d += 1
    return [n] if n > 1 else []


print(*factorize(int(input())))
```

## Алгоритм Полларда (ро)
approach: pollard
role: alternative
time: ≈ O(n^(1/4)) на множитель
memory: O(log n)
idea: Случайная последовательность x → x² + c (mod n) рано или поздно «зацикливается» по модулю делителя p; НОД выдаёт p.
principle: Сначала тест Миллера–Рабина; составное число делим найденным делителем и раскладываем части рекурсивно.
pros: Раскладывает числа до 10¹⁸ мгновенно
cons: Сложный, вероятностный (но с проверкой результата)
when: Когда n до 10¹⁸ и множители могут быть большими.
readability: 1
```python
import math
import random


def is_prime(n):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def pollard(n):
    if n % 2 == 0:
        return 2
    while True:
        c = random.randrange(1, n)
        x = y = random.randrange(2, n)
        d = 1
        while d == 1:
            x = (x * x + c) % n
            y = (y * y + c) % n
            y = (y * y + c) % n
            d = math.gcd(abs(x - y), n)
        if d != n:
            return d


def factor(n, out):
    if n == 1:
        return
    if is_prime(n):
        out.append(n)
        return
    d = pollard(n)
    factor(d, out)
    factor(n // d, out)


result = []
factor(int(input()), result)
print(*sorted(result))
```

# skill: perfect_number
title: Совершенное число
topics: Делители; Теория чисел
match: PERFECT & !PERFECT_SQUARE
priority: 2
input: n
input_desc: Одна строка: натуральное n.
output_desc: YES, если n совершенное (равно сумме собственных делителей), иначе NO.
understood: Дано натуральное n. Проверить, равно ли оно сумме своих делителей, меньших n (совершенное число).
algorithm: Сумма собственных делителей
why: Совершенные числа: 6 = 1+2+3, 28 = 1+2+4+7+14. Делители удобно искать до √n парами.
ideas: Собственные делители — все делители, кроме самого числа; Пары d и n/d
structures: int
links: algo:divisors, algo:perfect-numbers
edge: n = 1: сумма собственных делителей 0 — не совершенное.
sample: 6 => YES
sample: 28 => YES
sample: 12 => NO
sample: 1 => NO
sample: 8128 => YES

## Перебор до n − 1
approach: loop
role: beginner
time: O(n)
memory: O(1)
idea: Складываем все делители, меньшие n.
principle: d — делитель, если n % d == 0.
pros: Понятно
cons: Медленно для больших n
when: Для n до 10⁶–10⁷.
readability: 5
```python
n = int(input())
total = 0
for d in range(1, n):
    if n % d == 0:
        total += d
print("YES" if total == n else "NO")
```

## Делители парами до √n
approach: sqrt
role: efficient
time: O(√n)
memory: O(1)
idea: Каждый делитель d ≤ √n даёт пару n // d.
principle: Начинаем с суммы 1 (для n > 1), для d от 2 до √n добавляем d и n // d (без повтора для квадрата).
pros: Быстро
cons: Нужно аккуратно обработать n = 1 и квадраты
when: Для больших n.
readability: 4
```python
n = int(input())
total = 1 if n > 1 else 0
d = 2
while d * d <= n:
    if n % d == 0:
        total += d
        if d != n // d:
            total += n // d
    d += 1
print("YES" if total == n else "NO")
```

## Генератор и sum
approach: builtin
role: short
time: O(n)
memory: O(1)
idea: sum по генератору делителей.
principle: sum(d for d in range(1, n) if n % d == 0) — сумма собственных делителей.
pros: Одна строка
cons: O(n)
when: Для небольших n.
readability: 4
```python
n = int(input())
print("YES" if sum(d for d in range(1, n) if n % d == 0) == n else "NO")
```

# skill: digital_root
title: Цифровой корень
topics: Цифры числа; Теория чисел
match: DIGITAL_ROOT
priority: 2.5
input: n
input_desc: Одна строка: натуральное n.
output_desc: Цифровой корень n — результат многократного сложения цифр до одной цифры.
understood: Дано натуральное n. Складывать его цифры, пока не останется одна цифра, и вывести её.
algorithm: Повторное сложение цифр или формула 1 + (n − 1) mod 9
why: Число и сумма его цифр дают одинаковый остаток при делении на 9.
ideas: n ≡ сумма цифр (mod 9); Формула 1 + (n − 1) % 9
structures: int
links: algo:digits, py:op:mod
edge: n = 0: цифровой корень 0.
edge: Числа, кратные 9: корень 9.
sample: 16 => 7
sample: 942 => 6
sample: 9 => 9
sample: 0 => 0
sample: 999999999999 => 9

## Повторное сложение цифр
approach: loop
role: beginner
time: O(d) на каждый проход
memory: O(1)
idea: Пока число ≥ 10, заменяем его суммой цифр.
principle: Внутренний цикл считает сумму цифр, внешний повторяет до однозначного числа.
pros: Прямо по определению
cons: Несколько проходов
when: Для обучения.
readability: 5
```python
n = int(input())
while n >= 10:
    s = 0
    while n > 0:
        s += n % 10
        n //= 10
    n = s
print(n)
```

## Формула через остаток 9
approach: formula
role: efficient
time: O(1)
memory: O(1)
idea: Цифровой корень n > 0 равен 1 + (n − 1) % 9.
principle: Сумма цифр сохраняет остаток от деления на 9, поэтому корень — это остаток, где 0 заменён на 9.
pros: Мгновенно
cons: Нужно знать свойство
when: Для огромных n.
readability: 4
```python
n = int(input())
print(0 if n == 0 else 1 + (n - 1) % 9)
```

## Строки и sum(map)
approach: str
role: short
time: O(d)
memory: O(d)
idea: Сумма цифр через str и map(int, ...).
principle: sum(map(int, str(n))) — сумма цифр одной операцией.
pros: Коротко
cons: Создаёт строки
when: Когда важна краткость.
readability: 4
```python
n = int(input())
while n >= 10:
    n = sum(map(int, str(n)))
print(n)
```

## Рекурсия
approach: recursion
role: alternative
time: O(d)
memory: O(log d)
idea: root(n) = n для n < 10, иначе root(сумма цифр n).
principle: Рекурсивная запись того же процесса.
pros: Короткая формулировка
cons: Стек вызовов
when: Для изучения рекурсии.
readability: 4
```python
def root(n):
    return n if n < 10 else root(sum(map(int, str(n))))


print(root(int(input())))
```

# skill: to_base
title: Перевод числа в другую систему счисления
topics: Системы счисления
match: (BINARY | OCTAL | HEX | BASE) & (!DECIMAL | DECIMAL<BINARY | DECIMAL<OCTAL | DECIMAL<HEX | DECIMAL<BASE) & !BSEARCH & !BITS & !TREE & !STRING & !COUNT
avoid: SUM, COUNT
priority: 1.6
param: K = num(BASE) default 2
input: n
input_desc: Одна строка: целое неотрицательное число n (основание системы задано в условии: {K}).
output_desc: Запись числа n в системе счисления с основанием {K}.
understood: Дано десятичное число n. Перевести его в систему счисления с основанием {K}.
algorithm: Последовательное деление на основание
why: Остатки от деления на основание — цифры числа справа налево.
ideas: Цифры = остатки n % base; bin/oct/hex для 2/8/16; format(n, "b")
structures: int, str
links: algo:number-systems, py:builtin:bin, py:builtin:oct, py:builtin:hex, py:builtin:format
edge: n = 0: запись "0".
edge: Основание > 10: цифры 10, 11, … обозначаются буквами A, B, …
sample: 10
sample: 0
sample: 255
sample: 1000000

## Деление с остатком
approach: loop
role: beginner
time: O(log n)
memory: O(log n)
idea: Делим n на основание, остатки — цифры справа налево.
principle: n % base — младшая цифра, n //= base — сдвиг. Остатки собираем в список и разворачиваем.
pros: Работает для любого основания 2..36
cons: Больше кода
when: Для произвольного основания.
readability: 5
```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
n = int(input())
base = {K}
if n == 0:
    print(0)
else:
    result = []
    while n > 0:
        result.append(DIGITS[n % base])
        n //= base
    print("".join(reversed(result)))
```

## Рекурсия
approach: recursion
role: alternative
time: O(log n)
memory: O(log n)
idea: Запись n = запись(n // base) + последняя цифра.
principle: Рекурсивно переводим n // base, затем приписываем цифру n % base.
pros: Цифры сразу в правильном порядке
cons: Стек вызовов
when: Для изучения рекурсии.
readability: 4
```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def convert(n, base):
    if n < base:
        return DIGITS[n]
    return convert(n // base, base) + DIGITS[n % base]


print(convert(int(input()), {K}))
```

## Встроенные bin / oct / hex / format
approach: builtin
role: short
time: O(log n)
memory: O(log n)
idea: Для оснований 2, 8, 16 есть встроенные функции.
principle: format(n, "b") — двоичная запись без префикса 0b; "o" — восьмеричная, "X" — шестнадцатеричная.
pros: Одна строка
cons: Только основания 2, 8, 16
when: Когда основание 2, 8 или 16.
readability: 5
```python
n = int(input())
base = {K}
spec = {2: "b", 8: "o", 16: "X"}.get(base)
if spec:
    print(format(n, spec))
else:
    digits = ""
    while True:
        digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[n % base] + digits
        n //= base
        if n == 0:
            break
    print(digits)
```

# skill: from_base
title: Перевод в десятичную систему
topics: Системы счисления
match: DECIMAL & (BINARY<DECIMAL | OCTAL<DECIMAL | HEX<DECIMAL | BASE<DECIMAL)
priority: 2.2
param: K = num(BASE) default 2
input: str
input_desc: Одна строка: запись числа в системе с основанием {K}.
output_desc: Десятичное значение числа.
understood: Дана запись числа в системе счисления с основанием {K}. Перевести её в десятичную систему.
algorithm: Схема Горнера
why: Число d₁d₂…dₖ = ((d₁·b + d₂)·b + …)·b + dₖ — каждую цифру добавляем умножением на основание.
ideas: int(s, base); Схема Горнера; Позиционная запись
structures: str, int
links: algo:number-systems, py:builtin:int
edge: Буквенные цифры A–Z для оснований больше 10.
edge: Ведущие нули не меняют значение.
sample: 1010
sample: 0
sample: 11111111

## int(s, base)
approach: builtin
role: short
time: O(len(s))
memory: O(1)
idea: Встроенная функция int умеет разбирать запись в любой системе от 2 до 36.
principle: int("1010", 2) == 10.
pros: Одна строка
cons: —
when: Всегда.
readability: 5
```python
print(int(input().strip(), {K}))
```

## Схема Горнера
approach: horner
role: beginner
time: O(len(s))
memory: O(1)
idea: Идём по цифрам слева направо: value = value · base + цифра.
principle: Каждое умножение на основание сдвигает уже прочитанную часть на разряд влево.
pros: Показывает устройство позиционной записи
cons: Больше кода
when: Для понимания алгоритма.
readability: 5
```python
s = input().strip()
base = {K}
value = 0
for ch in s:
    value = value * base + int(ch, 36)
print(value)
```

## Сумма цифр на степени основания
approach: powers
role: alternative
time: O(len(s)²) из-за степеней
memory: O(1)
idea: Значение = Σ цифра · baseⁱ, где i — номер разряда справа.
principle: enumerate(reversed(s)) перебирает цифры от младшей к старшей.
pros: Прямо по определению позиционной системы
cons: Медленнее схемы Горнера
when: Для объяснения определения.
readability: 4
```python
s = input().strip()
base = {K}
print(sum(int(ch, 36) * base ** i for i, ch in enumerate(reversed(s))))
```

# skill: palindrome_number
title: Число-палиндром
topics: Цифры числа; Палиндромы
match: PALINDROME & NUMBER & !STRING & !WORD & !LIST & !RANGE & !COUNT & !SUM
boost: CHECK
priority: 1.9
input: n
input_desc: Одна строка: неотрицательное целое n.
output_desc: YES, если n читается одинаково слева направо и справа налево, иначе NO.
understood: Дано число n. Проверить, является ли оно палиндромом (например, 12321).
algorithm: Сравнение числа с его зеркальной записью
why: Палиндром совпадает со своим разворотом; разворот можно получить строкой или арифметикой.
ideas: str(n) == str(n)[::-1]; Разворот числа через n % 10
structures: int, str
links: algo:palindromes, algo:digits, py:topic:slicing
edge: Однозначные числа — палиндромы.
edge: Числа с нулём на конце (10, 120) — не палиндромы.
sample: 12321 => YES
sample: 123 => NO
sample: 7 => YES
sample: 10 => NO
sample: 1001 => YES

## Срез строки
approach: slice
role: short
time: O(d)
memory: O(d)
idea: Сравниваем запись числа с её разворотом.
principle: s[::-1] — строка задом наперёд.
pros: Одна строка
cons: —
when: Почти всегда.
readability: 5
```python
s = input().strip()
print("YES" if s == s[::-1] else "NO")
```

## Арифметический разворот
approach: arith
role: beginner
time: O(d)
memory: O(1)
idea: Строим перевёрнутое число и сравниваем с исходным.
principle: r = r * 10 + n % 10 приписывает последнюю цифру n к r.
pros: Без строк
cons: Длиннее
when: Если строки запрещены.
readability: 4
```python
n = int(input())
original, r = n, 0
while n > 0:
    r = r * 10 + n % 10
    n //= 10
print("YES" if r == original else "NO")
```

## Два указателя
approach: two-pointers
role: alternative
time: O(d)
memory: O(d)
idea: Сравниваем символы с двух концов, двигаясь к центру.
principle: i идёт слева, j справа; при первом несовпадении — не палиндром.
pros: Останавливается при первом расхождении
cons: Больше кода
when: Для изучения двух указателей.
readability: 4
```python
s = input().strip()
i, j = 0, len(s) - 1
ok = True
while i < j:
    if s[i] != s[j]:
        ok = False
        break
    i += 1
    j -= 1
print("YES" if ok else "NO")
```

## Половина разворота
approach: half
role: efficient
time: O(d)
memory: O(1)
idea: Разворачиваем только правую половину числа и сравниваем с левой.
principle: Снимаем цифры, пока перевёрнутая часть меньше оставшейся. Для нечётной длины средняя цифра отбрасывается (r // 10).
pros: Вдвое меньше операций, без строк
cons: Аккуратно с числами на 0
when: Как олимпиадный приём.
readability: 3
```python
n = int(input())
if n < 0 or (n % 10 == 0 and n != 0):
    print("NO")
else:
    r = 0
    while n > r:
        r = r * 10 + n % 10
        n //= 10
    print("YES" if n == r or n == r // 10 else "NO")
```

# skill: armstrong
title: Число Армстронга
topics: Цифры числа
match: ARMSTRONG
priority: 2.5
input: n
input_desc: Одна строка: натуральное n.
output_desc: YES, если n равно сумме своих цифр в степени, равной количеству цифр; иначе NO.
understood: Дано n. Проверить, является ли оно числом Армстронга (153 = 1³ + 5³ + 3³).
algorithm: Сумма степеней цифр
why: Считаем количество цифр k, затем сумму каждой цифры в степени k.
ideas: len(str(n)) — количество цифр; d ** k
structures: int
links: algo:digits, py:op:pow
edge: Однозначные числа — числа Армстронга.
sample: 153 => YES
sample: 9474 => YES
sample: 10 => NO
sample: 7 => YES

## Через строку
approach: str
role: short
time: O(d)
memory: O(d)
idea: Перебираем символы записи числа.
principle: sum(int(c) ** k for c in s) — сумма степеней цифр.
pros: Коротко
cons: —
when: Почти всегда.
readability: 5
```python
s = input().strip()
k = len(s)
print("YES" if sum(int(c) ** k for c in s) == int(s) else "NO")
```

## Арифметика
approach: arith
role: beginner
time: O(d)
memory: O(1)
idea: Сначала считаем цифры, затем сумму степеней через n % 10.
principle: Два прохода по цифрам: подсчёт k и сумма dᵏ.
pros: Без строк
cons: Длиннее
when: Если строки запрещены.
readability: 4
```python
n = int(input())
k, m = 0, n
while m > 0:
    k += 1
    m //= 10
k = max(k, 1)
total, m = 0, n
while m > 0:
    total += (m % 10) ** k
    m //= 10
print("YES" if total == n else "NO")
```

# skill: perfect_square_check
title: Является ли число полным квадратом
topics: Арифметика; Корни
match: PERFECT_SQUARE & !LIST & !RANGE & !DIGIT & !COUNT & !SUM
boost: CHECK
priority: 2
input: n
input_desc: Одна строка: целое n ≥ 0.
output_desc: YES, если n = k² для целого k, иначе NO.
understood: Дано n. Проверить, является ли оно квадратом целого числа.
algorithm: Целочисленный квадратный корень
why: math.isqrt(n) — наибольшее k с k² ≤ n; n полный квадрат, если k² == n. Без ошибок округления float.
ideas: math.isqrt; Ошибки округления n ** 0.5 для больших n; Бинарный поиск корня
structures: int
links: lib:math.isqrt, algo:binary-search, py:op:pow
edge: n = 0 и n = 1 — полные квадраты.
edge: Большие n (10³⁰): int(n ** 0.5) может ошибиться из-за float — используйте isqrt.
sample: 16 => YES
sample: 15 => NO
sample: 0 => YES
sample: 1000000000000000000000000000000 => YES
sample: 999999999999999999999999999999 => NO

## math.isqrt
approach: isqrt
role: short
time: O(log n)
memory: O(1)
idea: Точный целочисленный корень.
principle: isqrt не использует float, поэтому верен для любых n.
pros: Точно и быстро
cons: Python 3.8+
when: Всегда.
readability: 5
python: 3.8
```python
import math

n = int(input())
r = math.isqrt(n)
print("YES" if r * r == n else "NO")
```

## Бинарный поиск корня
approach: binsearch
role: alternative
time: O(log n)
memory: O(1)
idea: Ищем k с k² = n на отрезке [0, n].
principle: Если mid² < n — корень правее, иначе левее или равен mid.
pros: Показывает бинарный поиск по ответу
cons: Больше кода
when: Без math.isqrt.
readability: 4
```python
n = int(input())
lo, hi = 0, n
while lo < hi:
    mid = (lo + hi) // 2
    if mid * mid < n:
        lo = mid + 1
    else:
        hi = mid
print("YES" if lo * lo == n else "NO")
```

## Метод Ньютона
approach: newton
role: efficient
time: O(log log n) итераций
memory: O(1)
idea: Итерация x = (x + n // x) // 2 быстро сходится к ⌊√n⌋.
principle: Начинаем с x = n и уменьшаем, пока x² > n.
pros: Очень быстро сходится
cons: Нужно знать метод
when: Для огромных чисел без isqrt.
readability: 3
```python
n = int(input())
x = n
if n > 1:
    y = (x + n // x) // 2
    while y < x:
        x = y
        y = (x + n // x) // 2
print("YES" if x * x == n else "NO")
```

# skill: leap_year
title: Високосный год
topics: Условия; Логические операции
match: LEAP | (YEAR & CHECK & DAYS)
priority: 2.2
input: n
input_desc: Одна строка: год n.
output_desc: YES, если год високосный, иначе NO.
understood: Дан год. Определить, является ли он високосным по григорианскому календарю.
algorithm: Правило григорианского календаря
why: Год високосный, если делится на 4 и не делится на 100, либо делится на 400.
ideas: and / or в условиях; Порядок проверок
structures: int
links: py:topic:conditions, lib:calendar.isleap, py:op:mod
edge: 1900 — не високосный, 2000 — високосный.
sample: 2024 => YES
sample: 1900 => NO
sample: 2000 => YES
sample: 2023 => NO

## Одно логическое выражение
approach: expr
role: short
time: O(1)
memory: O(1)
idea: Записываем правило одним условием.
principle: (y % 4 == 0 and y % 100 != 0) or y % 400 == 0.
pros: Коротко
cons: Нужны скобки
when: Всегда.
readability: 5
```python
y = int(input())
print("YES" if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else "NO")
```

## Вложенные условия
approach: nested
role: beginner
time: O(1)
memory: O(1)
idea: Проверяем от общего к частному: 400 → 100 → 4.
principle: Делится на 400 — да; иначе делится на 100 — нет; иначе делится на 4 — да; иначе нет.
pros: Легко понять порядок правил
cons: Много веток
when: Для обучения условиям.
readability: 5
```python
y = int(input())
if y % 400 == 0:
    print("YES")
elif y % 100 == 0:
    print("NO")
elif y % 4 == 0:
    print("YES")
else:
    print("NO")
```

## calendar.isleap
approach: calendar
role: alternative
time: O(1)
memory: O(1)
idea: Готовая функция стандартной библиотеки.
principle: calendar.isleap(year) реализует то же правило.
pros: Надёжно
cons: Не показывает правило
when: В реальном коде.
readability: 5
```python
import calendar

print("YES" if calendar.isleap(int(input())) else "NO")
```

# skill: quadratic
title: Квадратное уравнение
topics: Математика; Условия
match: QUADRATIC | (EQUATION & SQUARE & ROOT)
priority: 2.5
input: a b c
input_desc: Одна строка: коэффициенты a, b, c (a ≠ 0) уравнения ax² + bx + c = 0.
output_desc: Корни по возрастанию с 6 знаками после точки, через пробел; NO, если действительных корней нет.
understood: Решить квадратное уравнение ax² + bx + c = 0 (a ≠ 0): найти действительные корни.
algorithm: Формула через дискриминант
why: D = b² − 4ac. D < 0 — корней нет, D = 0 — один корень −b / 2a, D > 0 — два корня (−b ± √D) / 2a.
ideas: Дискриминант; math.sqrt; Форматирование f"{x:.6f}"
structures: float
links: lib:math.sqrt, py:topic:fstrings, py:topic:conditions
edge: D = 0: один корень.
edge: D < 0: действительных корней нет.
edge: Корень −0.0 выводится как 0.000000 (прибавляем 0.0).
sample: 1 -3 2 => 1.000000 2.000000
sample: 1 2 1 => -1.000000
sample: 1 0 1 => NO
sample: 2 -4 -6 => -1.000000 3.000000

## Дискриминант и math.sqrt
approach: discriminant
role: beginner
time: O(1)
memory: O(1)
idea: Считаем D и разбираем три случая.
principle: При D > 0 два корня; сортируем их, чтобы вывести по возрастанию (при a < 0 порядок формулы меняется).
pros: Классическое решение
cons: Потеря точности при b² ≫ 4ac
when: Обычно.
readability: 5
```python
import math

a, b, c = map(float, input().split())
d = b * b - 4 * a * c
if d < 0:
    print("NO")
elif d == 0:
    print(f"{-b / (2 * a) + 0.0:.6f}")
else:
    r = math.sqrt(d)
    x1, x2 = sorted(((-b - r) / (2 * a), (-b + r) / (2 * a)))
    print(f"{x1 + 0.0:.6f} {x2 + 0.0:.6f}")
```

## Устойчивая формула
approach: stable
role: efficient
time: O(1)
memory: O(1)
idea: Один корень считаем по формуле без вычитания близких чисел, второй — по теореме Виета x₁·x₂ = c / a.
principle: q = −(b + sign(b)·√D) / 2; x₁ = q / a, x₂ = c / q. Так не теряется точность при b² ≫ 4ac.
pros: Численно устойчиво
cons: Сложнее
when: Когда коэффициенты сильно различаются по величине.
readability: 3
```python
import math

a, b, c = map(float, input().split())
d = b * b - 4 * a * c
if d < 0:
    print("NO")
elif d == 0:
    print(f"{-b / (2 * a) + 0.0:.6f}")
else:
    q = -(b + math.copysign(math.sqrt(d), b)) / 2
    roots = sorted((q / a, c / q)) if q != 0 else sorted(((-b - math.sqrt(d)) / (2 * a), (-b + math.sqrt(d)) / (2 * a)))
    print(" ".join(f"{x + 0.0:.6f}" for x in roots))
```

## cmath (комплексные корни)
approach: cmath
role: alternative
time: O(1)
memory: O(1)
idea: cmath.sqrt извлекает корень и из отрицательного дискриминанта; оставляем только действительные корни.
principle: Корни комплексные, если мнимая часть не равна 0.
pros: Легко вывести и комплексные корни
cons: Нужно отфильтровать мнимые
when: Когда интересны и комплексные корни.
readability: 3
```python
import cmath

a, b, c = map(float, input().split())
d = b * b - 4 * a * c
if d < 0:
    print("NO")
else:
    r = cmath.sqrt(d)
    roots = sorted({((-b - r) / (2 * a)).real, ((-b + r) / (2 * a)).real})
    print(" ".join(f"{x + 0.0:.6f}" for x in roots))
```

# skill: triangle_exists
title: Существует ли треугольник
topics: Геометрия; Условия
match: TRIANGLE & (EXISTS | CHECK | SIDE) & !AREA & !PERIMETER & !RIGHT_ANGLE
priority: 2
input: a b c
input_desc: Одна строка: длины трёх отрезков a, b, c.
output_desc: YES, если из отрезков можно составить невырожденный треугольник, иначе NO.
understood: Даны три длины. Проверить, существует ли треугольник с такими сторонами.
algorithm: Неравенство треугольника
why: Каждая сторона меньше суммы двух других; достаточно проверить, что наибольшая меньше суммы остальных.
ideas: a < b + c, b < a + c, c < a + b; Сортировка сторон
structures: int
links: algo:geometry, py:builtin:sorted
edge: Вырожденный треугольник (a + b == c) — NO.
edge: Нулевые и отрицательные длины — NO.
sample: 3 4 5 => YES
sample: 1 2 3 => NO
sample: 2 2 3 => YES
sample: 0 1 1 => NO

## Три неравенства
approach: three
role: beginner
time: O(1)
memory: O(1)
idea: Проверяем неравенство треугольника для каждой стороны.
principle: Если все три неравенства строгие и выполнены — треугольник существует.
pros: По определению
cons: Три сравнения
when: Обычно.
readability: 5
```python
a, b, c = map(int, input().split())
print("YES" if a < b + c and b < a + c and c < a + b else "NO")
```

## Сортировка сторон
approach: sorted
role: short
time: O(1)
memory: O(1)
idea: После сортировки достаточно одного сравнения: наибольшая < суммы двух меньших.
principle: Для меньших сторон неравенство выполнено автоматически (при положительных длинах).
pros: Одно сравнение
cons: Нужна проверка на положительность
when: Когда сторон больше или нужна краткость.
readability: 5
```python
x, y, z = sorted(map(int, input().split()))
print("YES" if x > 0 and z < x + y else "NO")
```

## Через периметр
approach: perimeter
role: alternative
time: O(1)
memory: O(1)
idea: Наибольшая сторона должна быть меньше половины периметра.
principle: max < a + b + c − max ⇔ 2·max < периметр.
pros: Короткая формула
cons: Менее очевидна
when: Для разнообразия.
readability: 4
```python
sides = list(map(int, input().split()))
print("YES" if min(sides) > 0 and 2 * max(sides) < sum(sides) else "NO")
```

# skill: triangle_area
title: Площадь треугольника по трём сторонам
topics: Геометрия
match: TRIANGLE & AREA
priority: 2.2
input: a b c
input_desc: Одна строка: длины сторон a, b, c (треугольник существует).
output_desc: Площадь с 6 знаками после точки.
understood: Даны стороны треугольника a, b, c. Найти его площадь.
algorithm: Формула Герона
why: S = √(p(p−a)(p−b)(p−c)), где p — полупериметр.
ideas: Полупериметр p = (a + b + c) / 2; math.sqrt
structures: float
links: algo:geometry, lib:math.sqrt
edge: Вырожденный треугольник даёт площадь 0.
sample: 3 4 5 => 6.000000
sample: 2 2 2 => 1.732051
sample: 5 5 6 => 12.000000

## Формула Герона
approach: heron
role: beginner
time: O(1)
memory: O(1)
idea: Площадь через полупериметр.
principle: p = (a + b + c) / 2; S = √(p(p−a)(p−b)(p−c)).
pros: Классика
cons: Потеря точности для очень «плоских» треугольников
when: Обычно.
readability: 5
```python
import math

a, b, c = map(float, input().split())
p = (a + b + c) / 2
print(f"{math.sqrt(p * (p - a) * (p - b) * (p - c)):.6f}")
```

## Устойчивая форма Герона
approach: stable
role: efficient
time: O(1)
memory: O(1)
idea: Сортируем стороны a ≥ b ≥ c и используем формулу Кахана.
principle: S = ¼·√((a+(b+c))(c−(a−b))(c+(a−b))(a+(b−c))) — скобки нельзя раскрывать, так меньше погрешность.
pros: Точно для «иглообразных» треугольников
cons: Сложнее
when: Для вычислительно сложных случаев.
readability: 3
```python
import math

a, b, c = sorted(map(float, input().split()), reverse=True)
s = 0.25 * math.sqrt((a + (b + c)) * (c - (a - b)) * (c + (a - b)) * (a + (b - c)))
print(f"{s:.6f}")
```

## Через угол (теорема косинусов)
approach: cosine
role: alternative
time: O(1)
memory: O(1)
idea: Находим угол между a и b по теореме косинусов, затем S = ½·a·b·sin γ.
principle: cos γ = (a² + b² − c²) / (2ab).
pros: Показывает связь с тригонометрией
cons: Больше вычислений, погрешность
when: Когда известен угол.
readability: 3
```python
import math

a, b, c = map(float, input().split())
gamma = math.acos((a * a + b * b - c * c) / (2 * a * b))
print(f"{0.5 * a * b * math.sin(gamma):.6f}")
```

# skill: seconds_hms
title: Перевод секунд в часы, минуты и секунды
topics: Арифметика; Целочисленное деление
match: SECONDS & (HOURS | MINUTES | CONVERT)
priority: 2.3
input: n
input_desc: Одна строка: число секунд n ≥ 0.
output_desc: Время в формате H:MM:SS.
understood: Дано количество секунд. Перевести его в часы, минуты и секунды (формат H:MM:SS).
algorithm: Целочисленное деление и остаток
why: Часы = n // 3600, минуты = n % 3600 // 60, секунды = n % 60.
ideas: divmod; Форматирование с ведущими нулями f"{m:02d}"
structures: int
links: py:op:floordiv, py:op:mod, py:builtin:divmod, py:topic:fstrings
edge: Больше суток: часы не ограничены 24.
edge: n = 0: 0:00:00.
sample: 3661 => 1:01:01
sample: 0 => 0:00:00
sample: 86399 => 23:59:59
sample: 100000 => 27:46:40

## // и %
approach: ops
role: beginner
time: O(1)
memory: O(1)
idea: Делим на 3600 и 60, остатки дают минуты и секунды.
principle: n // 3600 — полные часы; n % 3600 — остаток секунд внутри часа.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
h = n // 3600
m = n % 3600 // 60
s = n % 60
print(f"{h}:{m:02d}:{s:02d}")
```

## divmod
approach: divmod
role: short
time: O(1)
memory: O(1)
idea: Два вызова divmod отделяют секунды и минуты.
principle: divmod(n, 60) → (минуты всего, секунды); divmod(минуты, 60) → (часы, минуты).
pros: Коротко и без повторных делений
cons: —
when: Всегда.
readability: 5
```python
n = int(input())
m, s = divmod(n, 60)
h, m = divmod(m, 60)
print(f"{h}:{m:02d}:{s:02d}")
```

## datetime.timedelta
approach: timedelta
role: alternative
time: O(1)
memory: O(1)
idea: timedelta сама форматирует длительность.
principle: str(timedelta(seconds=n)) даёт H:MM:SS для длительностей меньше суток; для больших — «N days, H:MM:SS», поэтому часы считаем через total_seconds.
pros: Знакомит с модулем datetime
cons: Нужно учесть сутки
when: При работе с датами и временем.
readability: 3
```python
from datetime import timedelta

n = int(input())
t = timedelta(seconds=n)
h = t.days * 24 + t.seconds // 3600
print(f"{h}:{t.seconds % 3600 // 60:02d}:{t.seconds % 60:02d}")
```

# skill: celsius_fahrenheit
title: Перевод температуры Цельсий → Фаренгейт
topics: Арифметика; Дробные числа
match: CELSIUS | FAHRENHEIT
priority: 2.3
input: n
input_desc: Одна строка: температура в градусах Цельсия.
output_desc: Температура в градусах Фаренгейта с 2 знаками после точки.
understood: Дана температура в градусах Цельсия. Перевести её в градусы Фаренгейта.
algorithm: Линейная формула F = C · 9 / 5 + 32
why: Шкалы связаны линейно: 0 °C = 32 °F, 100 °C = 212 °F.
ideas: float(input()); Форматирование :.2f
structures: float
links: py:builtin:float, py:topic:fstrings
edge: Отрицательные температуры.
edge: −40 °C = −40 °F.
sample: 100 => 212.00
sample: 0 => 32.00
sample: -40 => -40.00
sample: 36.6 => 97.88

## Формула
approach: formula
role: beginner
time: O(1)
memory: O(1)
idea: Подставляем в формулу F = C · 9/5 + 32.
principle: Сначала умножаем, потом прибавляем 32.
pros: Просто
cons: —
when: Всегда.
readability: 5
```python
c = float(input())
print(f"{c * 9 / 5 + 32:.2f}")
```

## Функция
approach: function
role: alternative
time: O(1)
memory: O(1)
idea: Оформляем формулу в функцию для повторного использования.
principle: def c_to_f(c): return c * 1.8 + 32.
pros: Переиспользуемо, легко тестировать
cons: Чуть длиннее
when: Когда перевод нужен в нескольких местах.
readability: 5
```python
def c_to_f(c):
    return c * 1.8 + 32


print(f"{c_to_f(float(input())):.2f}")
```

## round вместо форматирования
approach: round
role: pythonic
time: O(1)
memory: O(1)
idea: format() с округлением до двух знаков.
principle: format(x, ".2f") — то же, что f-строка; полезно, когда шаблон строится динамически.
pros: Функция format пригодится для произвольных шаблонов
cons: —
when: Для разнообразия.
readability: 4
```python
c = float(input())
print(format(c * 9 / 5 + 32, ".2f"))
```

# skill: mult_table
title: Таблица умножения
topics: Циклы; Вложенные циклы; Форматирование
match: MULT_TABLE
priority: 2.5
input: n
input_desc: Одна строка: n (1 ≤ n ≤ 20).
output_desc: n строк по n чисел: в строке i — числа i·1, i·2, …, i·n через пробел.
understood: Дано n. Вывести таблицу умножения n × n.
algorithm: Вложенные циклы
why: Внешний цикл — строки, внутренний — столбцы; элемент равен i · j.
ideas: Вложенные циклы for; print(*row)
structures: list
links: py:kw:for, py:topic:nested-loops, py:builtin:print
edge: n = 1: одна строка «1».
sample: 3 => 1 2 3\n2 4 6\n3 6 9
sample: 1 => 1

## Вложенные циклы
approach: nested
role: beginner
time: O(n²)
memory: O(n)
idea: Для каждой строки i собираем произведения i · j.
principle: Внутренний цикл добавляет i * j в список строки, затем строка печатается.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
for i in range(1, n + 1):
    row = []
    for j in range(1, n + 1):
        row.append(i * j)
    print(*row)
```

## Генератор списка
approach: comprehension
role: short
time: O(n²)
memory: O(n)
idea: Строка таблицы — генератор [i * j for j in ...].
principle: print(*[...]) выводит элементы через пробел.
pros: Коротко
cons: —
when: Почти всегда.
readability: 4
```python
n = int(input())
for i in range(1, n + 1):
    print(*[i * j for j in range(1, n + 1)])
```

## join + map
approach: join
role: pythonic
time: O(n²)
memory: O(n²)
idea: Вся таблица собирается одной строкой через join.
principle: Внутренний join склеивает числа строки, внешний — строки через перевод строки.
pros: Один print — быстрый вывод
cons: Сложнее читать
when: Когда вывод большой.
readability: 3
```python
n = int(input())
print("\n".join(" ".join(map(str, range(i, i * n + 1, i))) for i in range(1, n + 1)))
```

# skill: star_triangle
title: Треугольник из звёздочек
topics: Циклы; Строки
match: STARS & !MATRIX
priority: 2.3
input: n
input_desc: Одна строка: высота n.
output_desc: n строк: в строке i ровно i звёздочек.
understood: Дано n. Вывести «лесенку» из звёздочек: в i-й строке i символов *.
algorithm: Цикл и умножение строки
why: "*" * i повторяет символ i раз.
ideas: Умножение строки на число; Вложенные циклы
structures: str
links: py:topic:strings, py:kw:for
edge: n = 1: одна звёздочка.
sample: 3 => *\n**\n***
sample: 1 => *

## Умножение строки
approach: mul
role: short
time: O(n²)
memory: O(n)
idea: "*" * i — строка из i звёздочек.
principle: Строку можно умножить на целое число — она повторится.
pros: Коротко
cons: —
when: Всегда.
readability: 5
```python
n = int(input())
for i in range(1, n + 1):
    print("*" * i)
```

## Вложенные циклы
approach: nested
role: beginner
time: O(n²)
memory: O(1)
idea: Внутренний цикл печатает звёздочки по одной.
principle: print("*", end="") выводит без перевода строки; после внутреннего цикла — print().
pros: Учит параметру end
cons: Длиннее
when: Для обучения циклам.
readability: 5
```python
n = int(input())
for i in range(1, n + 1):
    for _ in range(i):
        print("*", end="")
    print()
```

## Накопление строки
approach: accumulate
role: alternative
time: O(n²)
memory: O(n)
idea: Каждая следующая строка — предыдущая плюс одна звёздочка.
principle: line += "*" удлиняет строку на символ.
pros: Без умножения строк
cons: —
when: Для разнообразия.
readability: 5
```python
n = int(input())
line = ""
for _ in range(n):
    line += "*"
    print(line)
```

# skill: lucky_ticket
title: Счастливый билет
topics: Цифры числа
match: TICKET
priority: 2.5
input: str
input_desc: Одна строка: шестизначный номер билета (возможны ведущие нули).
output_desc: YES, если сумма первых трёх цифр равна сумме последних трёх, иначе NO.
understood: Дан шестизначный номер билета. Проверить, равна ли сумма первых трёх цифр сумме последних трёх.
algorithm: Сравнение сумм половин
why: Разбиваем номер на две половины и сравниваем суммы цифр.
ideas: Срезы s[:3] и s[3:]; Сумма цифр
structures: str
links: py:topic:slicing, algo:digits
edge: Ведущие нули: номер 001100 — нужно читать как строку.
sample: 123321 => YES
sample: 123456 => NO
sample: 001100 => YES
sample: 000000 => YES

## Срезы строки
approach: slice
role: short
time: O(1)
memory: O(1)
idea: Делим строку на две половины срезами.
principle: s[:3] — первые три символа, s[3:] — остальные.
pros: Коротко и сохраняет ведущие нули
cons: —
when: Всегда.
readability: 5
```python
s = input().strip()
print("YES" if sum(map(int, s[:3])) == sum(map(int, s[3:])) else "NO")
```

## Арифметика
approach: arith
role: beginner
time: O(1)
memory: O(1)
idea: Половины числа — n // 1000 и n % 1000.
principle: Сумму цифр трёхзначной части считаем через % 10 и // 10.
pros: Без строк
cons: Длиннее
when: Если номер дан числом.
readability: 4
```python
n = int(input())


def digit_sum(x):
    return x // 100 + x // 10 % 10 + x % 10


print("YES" if digit_sum(n // 1000) == digit_sum(n % 1000) else "NO")
```

## Знакопеременная сумма
approach: weights
role: pythonic
time: O(1)
memory: O(1)
idea: Билет счастливый, если сумма цифр первой половины минус сумма второй равна 0.
principle: Каждой цифре сопоставляем вес +1 или −1 и суммируем.
pros: Обобщается на любую длину
cons: Неочевидно
when: Для билетов любой длины.
readability: 3
```python
s = input().strip()
half = len(s) // 2
print("YES" if sum(int(c) * (1 if i < half else -1) for i, c in enumerate(s)) == 0 else "NO")
```

# skill: collatz
title: Гипотеза Коллатца (3n + 1)
topics: Циклы; Последовательности
match: COLLATZ
priority: 2.5
input: n
input_desc: Одна строка: натуральное n.
output_desc: Количество шагов до получения 1.
understood: Дано n. Пока n ≠ 1: если n чётное — делим на 2, иначе n = 3n + 1. Найти число шагов.
algorithm: Моделирование процесса
why: Просто выполняем правило, пока не дойдём до 1.
ideas: while n != 1; Тернарный оператор
structures: int
links: py:kw:while, py:op:mod
edge: n = 1: 0 шагов.
sample: 6 => 8
sample: 1 => 0
sample: 27 => 111
sample: 7 => 16

## Цикл while
approach: loop
role: beginner
time: O(число шагов)
memory: O(1)
idea: Применяем правило, считая шаги.
principle: Каждая итерация — один шаг процесса.
pros: Прямое моделирование
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
steps = 0
while n != 1:
    if n % 2 == 0:
        n //= 2
    else:
        n = 3 * n + 1
    steps += 1
print(steps)
```

## Рекурсия с кэшем
approach: memo
role: alternative
time: O(число шагов)
memory: O(число шагов)
idea: steps(n) = 1 + steps(следующее n), результаты кэшируются.
principle: Кэш ускоряет многократные вычисления для разных n.
pros: Эффективно для многих запросов
cons: Глубина рекурсии
when: Когда нужно посчитать шаги для многих n.
readability: 4
```python
from functools import lru_cache
import sys

sys.setrecursionlimit(100000)


@lru_cache(maxsize=None)
def steps(n):
    if n == 1:
        return 0
    return 1 + steps(n // 2 if n % 2 == 0 else 3 * n + 1)


print(steps(int(input())))
```

## Тернарный оператор
approach: ternary
role: short
time: O(число шагов)
memory: O(1)
idea: Правило записано одним выражением.
principle: n = n // 2 if n % 2 == 0 else 3 * n + 1.
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
n = int(input())
steps = 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print(steps)
```

# skill: trailing_zeros_factorial
title: Количество нулей в конце n!
topics: Теория чисел; Факториал
match: FACTORIAL & ZERO
priority: 2.6
big: 1000000
input: n
input_desc: Одна строка: n ≥ 0.
output_desc: Количество нулей в конце записи n!.
understood: Дано n. Найти количество нулей, которыми оканчивается n!.
algorithm: Формула Лежандра для множителя 5
why: Каждый ноль — множитель 10 = 2 · 5; двоек больше, чем пятёрок, поэтому считаем пятёрки: n//5 + n//25 + …
ideas: Формула Лежандра; Пятёрок меньше, чем двоек
structures: int
links: algo:factorial, algo:legendre, py:op:floordiv
edge: n < 5: нулей нет.
sample: 5 => 1
sample: 10 => 2
sample: 25 => 6
sample: 100 => 24
sample: 4 => 0

## Формула Лежандра
approach: legendre
role: efficient
time: O(log n)
memory: O(1)
idea: Считаем, сколько чисел до n делятся на 5, 25, 125, …
principle: Число, делящееся на 5ᵏ, даёт k пятёрок; поэтому сумма ⌊n/5⌋ + ⌊n/25⌋ + … — общее число пятёрок.
pros: Мгновенно для огромных n
cons: Нужно знать идею
when: Всегда.
readability: 4
```python
n = int(input())
count = 0
p = 5
while p <= n:
    count += n // p
    p *= 5
print(count)
```

## Деление n на 5
approach: divide
role: alternative
time: O(log n)
memory: O(1)
idea: Та же формула: n //= 5 и прибавляем результат.
principle: ⌊n/25⌋ = ⌊⌊n/5⌋/5⌋, поэтому можно последовательно делить n.
pros: Коротко
cons: —
when: Альтернативная запись.
readability: 4
```python
n = int(input())
count = 0
while n:
    n //= 5
    count += n
print(count)
```

## Вычислить факториал и посчитать нули
approach: brute
role: beginner
time: O(n²) для больших n (длинные числа)
memory: O(n log n) бит
idea: Вычисляем n! и считаем нули в конце строки.
principle: len(s) - len(s.rstrip("0")) — количество нулей в конце.
pros: Очевидно
cons: Медленно для n > 10⁵
when: Для проверки на маленьких n.
readability: 5
```python
import math

s = str(math.factorial(int(input())))
print(len(s) - len(s.rstrip("0")))
```

# skill: combinations
title: Число сочетаний C(n, k)
topics: Комбинаторика
match: COMBINATION & !PRINT & !SUBSET
priority: 2
input: n k
input_desc: Одна строка: n и k (0 ≤ k ≤ n).
output_desc: C(n, k) = n! / (k!·(n−k)!).
understood: Даны n и k. Найти число способов выбрать k элементов из n (без учёта порядка).
algorithm: Биномиальный коэффициент
why: C(n, k) = n! / (k!(n−k)!); удобнее считать мультипликативно или через треугольник Паскаля.
ideas: math.comb; Треугольник Паскаля C(n,k) = C(n−1,k−1) + C(n−1,k); C(n,k) = C(n,n−k)
structures: int
links: algo:combinatorics, lib:math.comb, algo:pascal-triangle
edge: k = 0 или k = n: ответ 1.
edge: k > n: ответ 0.
sample: 5 2 => 10
sample: 10 0 => 1
sample: 52 5 => 2598960
sample: 30 15 => 155117520

## math.comb
approach: math
role: short
time: O(k)
memory: O(1)
idea: Готовая функция Python 3.8+.
principle: math.comb(n, k) считает точно на длинных целых.
pros: Одна строка
cons: Python 3.8+
when: Всегда, если можно.
readability: 5
python: 3.8
```python
import math

n, k = map(int, input().split())
print(math.comb(n, k))
```

## Мультипликативная формула
approach: multiplicative
role: beginner
time: O(k)
memory: O(1)
idea: C(n, k) = (n·(n−1)·…·(n−k+1)) / k!, считаем по шагам.
principle: После i-го шага result = C(n, i) — целое, поэтому деление // на каждом шаге точное.
pros: Без огромных факториалов
cons: —
when: Когда нет math.comb.
readability: 4
```python
n, k = map(int, input().split())
if k < 0 or k > n:
    print(0)
else:
    k = min(k, n - k)
    result = 1
    for i in range(1, k + 1):
        result = result * (n - k + i) // i
    print(result)
```

## Треугольник Паскаля
approach: pascal
role: alternative
time: O(n·k)
memory: O(k)
idea: C(n, k) = C(n−1, k−1) + C(n−1, k) — заполняем строки треугольника.
principle: Одномерный массив обновляется справа налево, чтобы не затереть нужные значения.
pros: Только сложения — удобно по модулю
cons: O(n·k)
when: Когда нужны C по модулю или много значений.
readability: 4
```python
n, k = map(int, input().split())
row = [1] + [0] * k
for i in range(1, n + 1):
    for j in range(min(i, k), 0, -1):
        row[j] += row[j - 1]
print(row[k] if k <= n else 0)
```

## Через факториалы
approach: factorials
role: alternative
time: O(n)
memory: O(n log n) бит
idea: Прямо по формуле n! / (k!(n−k)!).
principle: math.factorial даёт точные длинные числа.
pros: Прямо по определению
cons: Огромные промежуточные числа
when: Для небольших n.
readability: 5
```python
from math import factorial

n, k = map(int, input().split())
print(factorial(n) // (factorial(k) * factorial(n - k)) if 0 <= k <= n else 0)
```

# skill: bit_count
title: Количество единичных битов
topics: Битовые операции
match: BITS & (COUNT | SUM) | (BINARY & COUNT & !LIST)
priority: 2
input: n
input_desc: Одна строка: целое n ≥ 0.
output_desc: Количество единиц в двоичной записи n.
understood: Дано число n. Найти количество единиц в его двоичной записи.
algorithm: Подсчёт битов
why: Можно посчитать символы "1" в bin(n), снимать младший бит или использовать трюк n & (n − 1).
ideas: bin(n).count("1"); n & (n − 1) убирает младшую единицу; int.bit_count()
structures: int
links: algo:bits, py:builtin:bin, py:op:bitand, py:op:shift
edge: n = 0: ответ 0.
sample: 7 => 3
sample: 0 => 0
sample: 1024 => 1
sample: 255 => 8

## bin + count
approach: bin
role: short
time: O(log n)
memory: O(log n)
idea: Считаем символы "1" в двоичной строке.
principle: bin(7) == "0b111".
pros: Одна строка
cons: Создаёт строку
when: Обычно.
readability: 5
```python
print(bin(int(input())).count("1"))
```

## Снятие младшего бита
approach: shift
role: beginner
time: O(log n)
memory: O(1)
idea: n & 1 — младший бит, n >>= 1 — сдвиг вправо.
principle: Проходим по всем битам числа.
pros: Показывает побитовые операции
cons: —
when: Для обучения.
readability: 5
```python
n = int(input())
count = 0
while n:
    count += n & 1
    n >>= 1
print(count)
```

## Трюк Кернигана
approach: kernighan
role: efficient
time: O(число единиц)
memory: O(1)
idea: n & (n − 1) обнуляет младшую единицу.
principle: Цикл выполняется ровно столько раз, сколько единиц в числе.
pros: Быстрее для разреженных чисел
cons: Неочевидно
when: В олимпиадных битовых задачах.
readability: 4
```python
n = int(input())
count = 0
while n:
    n &= n - 1
    count += 1
print(count)
```

## int.bit_count
approach: bit_count
role: pythonic
time: O(log n)
memory: O(1)
idea: Метод целых чисел Python 3.10+.
principle: n.bit_count() реализован на C.
pros: Быстрее всего
cons: Python 3.10+
when: В новых версиях Python.
readability: 5
python: 3.10
```python
print(int(input()).bit_count())
```

# skill: power_of_two
title: Является ли число степенью двойки
topics: Битовые операции
match: POWER & TWO & CHECK | (POWER & TWO & !MOD)
boost: CHECK
priority: 2.3
input: n
input_desc: Одна строка: натуральное n.
output_desc: YES, если n = 2ᵏ, иначе NO.
understood: Дано n. Проверить, является ли оно степенью двойки.
algorithm: Битовый трюк n & (n − 1)
why: У степени двойки ровно одна единица в двоичной записи, а n & (n − 1) её убирает.
ideas: n & (n − 1) == 0; bin(n).count("1") == 1
structures: int
links: algo:bits, py:op:bitand
edge: n = 1 = 2⁰ — степень двойки.
edge: n = 0 — нет.
sample: 1024 => YES
sample: 1 => YES
sample: 12 => NO
sample: 0 => NO

## n & (n − 1)
approach: bit
role: efficient
time: O(1)
memory: O(1)
idea: Убираем младшую единицу: если стало 0, единица была одна.
principle: n > 0 and n & (n − 1) == 0.
pros: Одна операция
cons: Нужно знать трюк
when: Всегда.
readability: 4
```python
n = int(input())
print("YES" if n > 0 and n & (n - 1) == 0 else "NO")
```

## Деление на 2
approach: divide
role: beginner
time: O(log n)
memory: O(1)
idea: Делим на 2, пока делится; степень двойки превратится в 1.
principle: Если в конце осталось 1 — это была степень двойки.
pros: Понятно без битов
cons: Цикл
when: Для обучения.
readability: 5
```python
n = int(input())
if n <= 0:
    print("NO")
else:
    while n % 2 == 0:
        n //= 2
    print("YES" if n == 1 else "NO")
```

## Подсчёт единиц
approach: bin
role: short
time: O(log n)
memory: O(log n)
idea: В двоичной записи ровно одна единица.
principle: bin(n).count("1") == 1.
pros: Коротко
cons: Строка
when: Для краткости.
readability: 5
```python
n = int(input())
print("YES" if n > 0 and bin(n).count("1") == 1 else "NO")
```

# skill: euler_phi
title: Функция Эйлера φ(n)
topics: Теория чисел
match: TOTIENT
priority: 2.5
input: n
input_desc: Одна строка: натуральное n.
output_desc: φ(n) — количество чисел от 1 до n, взаимно простых с n.
understood: Дано n. Найти количество чисел от 1 до n, взаимно простых с n (функция Эйлера).
algorithm: Формула через простые делители
why: φ(n) = n · Π(1 − 1/p) по всем простым p | n.
ideas: φ мультипликативна; Перебор простых делителей до √n
structures: int
links: algo:euler-phi, algo:factorization, lib:math.gcd
edge: n = 1: φ(1) = 1.
edge: n простое: φ(n) = n − 1.
sample: 9 => 6
sample: 1 => 1
sample: 36 => 12
sample: 97 => 96

## Формула через делители
approach: formula
role: efficient
time: O(√n)
memory: O(1)
idea: Для каждого простого делителя p: result −= result // p.
principle: result · (1 − 1/p) = result − result / p, деление точное.
pros: Быстро
cons: Нужно знать формулу
when: Обычно.
readability: 4
```python
n = int(input())
result = n
p = 2
m = n
while p * p <= m:
    if m % p == 0:
        while m % p == 0:
            m //= p
        result -= result // p
    p += 1
if m > 1:
    result -= result // m
print(result)
```

## Перебор с НОД
approach: gcd
role: beginner
time: O(n log n)
memory: O(1)
idea: Считаем числа k ≤ n с НОД(k, n) = 1.
principle: Прямо по определению.
pros: Очевидно
cons: Медленно
when: Для проверки на маленьких n.
readability: 5
```python
from math import gcd

n = int(input())
print(sum(1 for k in range(1, n + 1) if gcd(k, n) == 1))
```
