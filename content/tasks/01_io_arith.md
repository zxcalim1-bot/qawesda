# id: task:sum-two
kind: task
title: Сумма двух чисел
category: Ввод-вывод
level: beginner
tags: input, print, int, split, map, сумма
related: py:builtin:input, py:builtin:print, py:builtin:int, py:method:str.split, py:builtin:map
## Условие
Даны два целых числа A и B. Выведите их сумму.
## Входные данные
Одна строка: два целых числа через пробел.
## Выходные данные
Одно число — A + B.
## Ограничения
|A|, |B| ≤ 10^18. В Python целые числа не переполняются.
## Примеры
```in
2 3
```
```out
5
```
```in
-7 7
```
```out
0
```
## Подсказки
- input() возвращает строку, её нужно разделить на части.
- Метод split() делит строку по пробелам, int() превращает часть в число.
- a, b = map(int, input().split()) читает оба числа за одну строку.
## Решение: split и map
@time: O(1) @memory: O(1)
Читаем строку, делим её на два числа и печатаем сумму.
```python
a, b = map(int, input().split())
print(a + b)
```
## Решение: sum по генератору
@time: O(1) @memory: O(1)
sum() сам сложит все числа строки — удобно, если чисел может быть больше двух.
```python
print(sum(int(x) for x in input().split()))
```
## Объяснение
input() читает текст. split() возвращает список строк ['2', '3'], map(int, ...) превращает их в числа.
## Генератор
```python
import json, random
random.seed(1)
t = ["0 0", "1000000000000000000 1000000000000000000", "-1000000000000000000 1"]
for _ in range(6):
    t.append("%d %d" % (random.randint(-10**9, 10**9), random.randint(-10**9, 10**9)))
print(json.dumps(t))
```

# id: task:two-lines-sum
kind: task
title: Числа на разных строках
category: Ввод-вывод
level: beginner
tags: input, несколько строк, int
related: py:builtin:input, py:builtin:int
## Условие
Даны два целых числа, каждое на отдельной строке. Выведите их сумму, разность и произведение — каждое на своей строке.
## Входные данные
Две строки, в каждой одно целое число.
## Выходные данные
Три строки: a + b, a - b, a * b.
## Примеры
```in
5
3
```
```out
8
2
15
```
## Подсказки
- Каждый вызов input() читает одну строку.
- Сначала a = int(input()), потом b = int(input()).
- Три print() дадут три строки вывода.
## Решение: два input()
@time: O(1) @memory: O(1)
```python
a = int(input())
b = int(input())
print(a + b)
print(a - b)
print(a * b)
```
## Решение: sys.stdin и print с sep
@time: O(1) @memory: O(1)
Читаем весь ввод сразу и печатаем три значения через перевод строки.
```python
import sys
a, b = map(int, sys.stdin.read().split())
print(a + b, a - b, a * b, sep="\n")
```
## Объяснение
Если числа стоят на разных строках, input().split() на первой строке вернёт только одно число. Поэтому читаем построчно или весь ввод целиком через sys.stdin.read().
## Генератор
```python
import json, random
random.seed(2)
print(json.dumps(["%d\n%d" % (random.randint(-1000, 1000), random.randint(-1000, 1000)) for _ in range(7)] + ["0\n0"]))
```

# id: task:greeting
kind: task
title: Приветствие
category: Ввод-вывод
level: beginner
tags: строка, f-строка, print, конкатенация
related: py:builtin:print, py:topic:f-strings
## Условие
Дано имя. Выведите фразу «Привет, ИМЯ!» (без кавычек).
## Входные данные
Одна строка — имя (без пробелов в начале и конце).
## Выходные данные
Строка приветствия.
## Примеры
```in
Аня
```
```out
Привет, Аня!
```
## Подсказки
- Имя уже строка, преобразовывать его не нужно.
- Строки можно склеивать оператором +.
- f-строка f"Привет, {name}!" подставит имя в шаблон.
## Решение: f-строка
@time: O(n) @memory: O(n)
```python
name = input()
print(f"Привет, {name}!")
```
## Решение: склейка строк
@time: O(n) @memory: O(n)
```python
name = input()
print("Привет, " + name + "!")
```
## Решение: print с sep
@time: O(n) @memory: O(n)
print("Привет,", name) поставит пробел, а восклицательный знак приклеиваем через sep="".
```python
name = input()
print("Привет, ", name, "!", sep="")
```
## Объяснение
print() по умолчанию разделяет аргументы пробелом; параметр sep меняет разделитель.
## Генератор
```python
import json
print(json.dumps(["Bob", "Ali", "Мария", "Dilnoza", "X"]))
```

# id: task:last-digit
kind: task
title: Последняя цифра
category: Арифметика
level: beginner
tags: остаток, %, последняя цифра
related: py:op:mod, algo:digits
## Условие
Дано натуральное число N. Выведите его последнюю цифру.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Последняя цифра N.
## Примеры
```in
1234
```
```out
4
```
## Подсказки
- Последняя цифра связана с делением на 10.
- Остаток от деления на 10 — это и есть последняя цифра.
- print(n % 10)
## Решение: остаток от деления
@time: O(1) @memory: O(1)
```python
n = int(input())
print(n % 10)
```
## Решение: последний символ строки
@time: O(1) @memory: O(log N)
Число можно не превращать в int: последний символ строки — последняя цифра.
```python
print(input().strip()[-1])
```
## Объяснение
Для неотрицательного n значение n % 10 лежит в диапазоне 0..9 и равно последней цифре.
## Генератор
```python
import json, random
random.seed(3)
print(json.dumps([str(random.randint(1, 10**18)) for _ in range(6)] + ["10", "7"]))
```

# id: task:tens-digit
kind: task
title: Цифра десятков
category: Арифметика
level: beginner
tags: //, %, цифра десятков
related: py:op:floordiv, py:op:mod, algo:digits
## Условие
Дано целое число N ≥ 10. Выведите цифру его десятков.
## Входные данные
Число N (10 ≤ N ≤ 10^9).
## Выходные данные
Цифра десятков.
## Примеры
```in
1234
```
```out
3
```
## Подсказки
- Сначала уберите последнюю цифру.
- n // 10 отбрасывает последнюю цифру.
- Ответ: n // 10 % 10.
## Решение: деление и остаток
@time: O(1) @memory: O(1)
```python
n = int(input())
print(n // 10 % 10)
```
## Решение: индекс строки
@time: O(1) @memory: O(log N)
Предпоследний символ строки — цифра десятков.
```python
print(input().strip()[-2])
```
## Объяснение
// — целочисленное деление, оно «сдвигает» число вправо на одну цифру.
## Генератор
```python
import json, random
random.seed(4)
print(json.dumps([str(random.randint(10, 10**9)) for _ in range(7)] + ["10", "99"]))
```

# id: task:seconds-to-time
kind: task
title: Секунды в часы, минуты, секунды
category: Арифметика
level: easy
tags: divmod, время, формат, :02d
related: py:builtin:divmod, py:topic:f-strings
## Условие
С начала суток прошло N секунд (N может быть больше суток). Выведите текущее время на часах в формате H:MM:SS. Часы — от 0 до 23, минуты и секунды — двумя цифрами.
## Входные данные
Целое число N (0 ≤ N ≤ 10^9).
## Выходные данные
Время в формате H:MM:SS.
## Примеры
```in
3661
```
```out
1:01:01
```
```in
86400
```
```out
0:00:00
```
## Подсказки
- Сначала уберите полные сутки: N % 86400.
- Часы = секунды // 3600, минуты = секунды // 60 % 60.
- Формат {m:02d} добавит ведущий ноль.
## Решение: divmod
@time: O(1) @memory: O(1)
```python
n = int(input()) % 86400
h, rest = divmod(n, 3600)
m, s = divmod(rest, 60)
print(f"{h}:{m:02d}:{s:02d}")
```
## Решение: деление и остаток по отдельности
@time: O(1) @memory: O(1)
```python
n = int(input())
h = n // 3600 % 24
m = n // 60 % 60
s = n % 60
print(str(h) + ":" + str(m).zfill(2) + ":" + str(s).zfill(2))
```
## Решение: модуль time
@time: O(1) @memory: O(1)
time.gmtime() раскладывает секунды на поля даты и времени (UTC, без часового пояса).
```python
import time
t = time.gmtime(int(input()))
print(f"{t.tm_hour}:{t.tm_min:02d}:{t.tm_sec:02d}")
```
## Объяснение
divmod(a, b) возвращает пару (a // b, a % b) — частное и остаток за один вызов.
## Генератор
```python
import json, random
random.seed(5)
print(json.dumps([str(random.randint(0, 10**9)) for _ in range(6)] + ["0", "59", "86399"]))
```

# id: task:circle-area
kind: task
title: Площадь круга
category: Арифметика
level: beginner
tags: float, math.pi, округление, формат
related: lib:math.pi, py:builtin:round, py:topic:f-strings
## Условие
Дан радиус круга R. Выведите площадь круга с ровно тремя знаками после запятой.
## Входные данные
Число R (0 ≤ R ≤ 1000), возможно дробное.
## Выходные данные
Площадь π·R² с тремя знаками после точки.
## Примеры
```in
1
```
```out
3.142
```
```in
2.5
```
```out
19.635
```
## Подсказки
- Радиус может быть дробным — используйте float().
- Число π есть в модуле math: math.pi.
- f"{x:.3f}" выводит ровно три знака после точки.
## Решение: math.pi и форматирование
@time: O(1) @memory: O(1)
```python
import math
r = float(input())
print(f"{math.pi * r * r:.3f}")
```
## Решение: format() и возведение в степень
@time: O(1) @memory: O(1)
```python
from math import pi
r = float(input())
print(format(pi * r ** 2, ".3f"))
```
## Объяснение
round(x, 3) убирает лишние знаки, но не дописывает нули (2.5 → 2.5), поэтому для вывода «ровно три знака» нужен формат .3f.
## Генератор
```python
import json
print(json.dumps(["0", "10", "0.5", "1000", "3.3", "7"]))
```

# id: task:average-three
kind: task
title: Среднее арифметическое
category: Арифметика
level: beginner
tags: среднее, float, деление
related: py:builtin:sum, py:op:truediv
## Условие
Даны три целых числа. Выведите их среднее арифметическое с двумя знаками после точки.
## Входные данные
Три целых числа через пробел, каждое по модулю не больше 10^6.
## Выходные данные
Среднее с двумя знаками после точки.
## Примеры
```in
1 2 4
```
```out
2.33
```
## Подсказки
- Среднее = сумма / количество.
- Оператор / всегда даёт float.
- Формат :.2f оставит два знака.
## Решение: сумма и деление
@time: O(1) @memory: O(1)
```python
a, b, c = map(int, input().split())
print(f"{(a + b + c) / 3:.2f}")
```
## Решение: statistics.mean
@time: O(n) @memory: O(n)
Модуль statistics умеет считать среднее любого набора чисел.
```python
import statistics
print(f"{statistics.mean(map(int, input().split())):.2f}")
```
## Объяснение
Деление / в Python 3 даёт float даже для целых: 7 / 3 == 2.333...
## Генератор
```python
import json, random
random.seed(6)
print(json.dumps(["%d %d %d" % tuple(random.randint(-10**6, 10**6) for _ in range(3)) for _ in range(7)] + ["0 0 0"]))
```

# id: task:apples-split
kind: task
title: Яблоки поровну
category: Арифметика
level: beginner
tags: //, %, деление нацело, остаток
related: py:op:floordiv, py:op:mod, py:builtin:divmod
## Условие
N школьников делят K яблок поровну, оставшиеся яблоки остаются в корзине. Выведите, сколько яблок получит каждый школьник и сколько останется в корзине.
## Входные данные
Два числа N и K на отдельных строках (1 ≤ N ≤ 10^9, 0 ≤ K ≤ 10^18).
## Выходные данные
Два числа на отдельных строках: сколько получит каждый и сколько останется.
## Примеры
```in
3
14
```
```out
4
2
```
## Подсказки
- Каждому достанется целая часть от деления.
- K // N — сколько у каждого, K % N — остаток.
- divmod(K, N) возвращает оба значения сразу.
## Решение: // и %
@time: O(1) @memory: O(1)
```python
n = int(input())
k = int(input())
print(k // n)
print(k % n)
```
## Решение: divmod
@time: O(1) @memory: O(1)
```python
n = int(input())
k = int(input())
q, r = divmod(k, n)
print(q, r, sep="\n")
```
## Объяснение
Для неотрицательных чисел k == n * (k // n) + k % n.
## Генератор
```python
import json, random
random.seed(7)
print(json.dumps(["%d\n%d" % (random.randint(1, 10**9), random.randint(0, 10**18)) for _ in range(6)] + ["5\n0", "1\n7"]))
```

# id: task:next-prev
kind: task
title: Следующее и предыдущее
category: Ввод-вывод
level: beginner
tags: print, f-строки, вывод текста
related: py:builtin:print, py:topic:f-strings
## Условие
Дано целое число N. Выведите две строки: «Следующее за числом N число: N+1» и «Для числа N предыдущее число: N-1» (подставьте значения).
## Входные данные
Целое число N (|N| ≤ 10^9).
## Выходные данные
Две строки в указанном формате.
## Примеры
```in
254
```
```out
Следующее за числом 254 число: 255
Для числа 254 предыдущее число: 253
```
## Подсказки
- Числа внутри текста удобно подставлять f-строкой.
- В фигурных скобках f-строки можно писать выражения: {n + 1}.
- Две строки — два вызова print().
## Решение: f-строки
@time: O(1) @memory: O(1)
```python
n = int(input())
print(f"Следующее за числом {n} число: {n + 1}")
print(f"Для числа {n} предыдущее число: {n - 1}")
```
## Решение: print с несколькими аргументами
@time: O(1) @memory: O(1)
print ставит пробелы между аргументами, а двоеточие приклеено к слову «число:».
```python
n = int(input())
print("Следующее за числом", n, "число:", n + 1)
print("Для числа", n, "предыдущее число:", n - 1)
```
## Объяснение
Оба способа дают одинаковый текст; f-строка нагляднее, когда в строку подставляется много значений.
## Генератор
```python
import json
print(json.dumps(["0", "-5", "1000000000", "-1000000000", "1"]))
```

# id: task:hypotenuse
kind: task
title: Гипотенуза
category: Арифметика
level: easy
tags: math.sqrt, math.hypot, теорема Пифагора
related: lib:math.hypot, lib:math.sqrt
## Условие
Даны катеты прямоугольного треугольника a и b. Найдите гипотенузу с точностью 6 знаков после точки.
## Входные данные
Два числа a и b (0 < a, b ≤ 10^6), возможно дробные.
## Выходные данные
Длина гипотенузы с 6 знаками после точки.
## Примеры
```in
3 4
```
```out
5.000000
```
## Подсказки
- Теорема Пифагора: c² = a² + b².
- Корень — math.sqrt или возведение в степень 0.5.
- В модуле math есть готовая функция hypot.
## Решение: теорема Пифагора
@time: O(1) @memory: O(1)
```python
import math
a, b = map(float, input().split())
print(f"{math.sqrt(a * a + b * b):.6f}")
```
## Решение: math.hypot
@time: O(1) @memory: O(1)
math.hypot считает √(a²+b²) без переполнения промежуточных значений.
```python
import math
a, b = map(float, input().split())
print(f"{math.hypot(a, b):.6f}")
```
## Решение: степень 0.5
@time: O(1) @memory: O(1)
```python
a, b = map(float, input().split())
print("%.6f" % ((a ** 2 + b ** 2) ** 0.5))
```
## Объяснение
Все три способа дают одинаковый результат с учётом точности float.
## Генератор
```python
import json, random
random.seed(8)
print(json.dumps(["%d %d" % (random.randint(1, 10**6), random.randint(1, 10**6)) for _ in range(5)] + ["1.5 2", "0.001 0.002"]))
```

# id: task:celsius
kind: task
title: Перевод температуры
category: Арифметика
level: beginner
tags: float, формула, округление
related: py:builtin:float, py:builtin:round
## Условие
Дана температура в градусах Цельсия. Переведите её в градусы Фаренгейта по формуле F = C · 9 / 5 + 32 и выведите с одним знаком после точки.
## Входные данные
Число C (−273.15 ≤ C ≤ 10^4).
## Выходные данные
Температура в Фаренгейтах с одним знаком после точки.
## Примеры
```in
100
```
```out
212.0
```
```in
-40
```
```out
-40.0
```
## Подсказки
- Температура может быть дробной: float(input()).
- Подставьте C в формулу.
- :.1f — один знак после точки.
## Решение: формула
@time: O(1) @memory: O(1)
```python
c = float(input())
print(f"{c * 9 / 5 + 32:.1f}")
```
## Решение: функция-конвертер
@time: O(1) @memory: O(1)
Формула оформлена функцией — её удобно переиспользовать и тестировать.
```python
def to_fahrenheit(c):
    return c * 1.8 + 32

print("%.1f" % to_fahrenheit(float(input())))
```
## Объяснение
9 / 5 = 1.8, поэтому обе формулы одинаковы.
## Генератор
```python
import json
print(json.dumps(["0", "36.6", "-273.15", "10000", "25"]))
```

# id: task:swap-values
kind: task
title: Обмен значений
category: Ввод-вывод
level: beginner
tags: обмен, кортеж, присваивание
related: py:topic:variables
## Условие
Даны два слова. Выведите их в обратном порядке через пробел.
## Входные данные
Два слова через пробел.
## Выходные данные
Те же слова в обратном порядке.
## Примеры
```in
мир привет
```
```out
привет мир
```
## Подсказки
- Разделите строку на два слова.
- В Python обмен делается одной строкой: a, b = b, a.
- Можно просто вывести b, a.
## Решение: множественное присваивание
@time: O(n) @memory: O(n)
```python
a, b = input().split()
a, b = b, a
print(a, b)
```
## Решение: разворот списка
@time: O(n) @memory: O(n)
```python
print(*input().split()[::-1])
```
## Решение: временная переменная
@time: O(n) @memory: O(n)
Классический способ из других языков: третья переменная хранит значение во время обмена.
```python
a, b = input().split()
t = a
a = b
b = t
print(a, b)
```
## Объяснение
a, b = b, a сначала строит кортеж (b, a), затем распаковывает его.
## Генератор
```python
import json
print(json.dumps(["a b", "hello world", "1 2", "Salom dunyo"]))
```

# id: task:parity
kind: task
title: Чётное или нечётное
category: Условия
level: beginner
tags: if, else, %, чётность
related: py:keyword:if, py:op:mod
## Условие
Дано целое число N. Выведите EVEN, если оно чётное, и ODD, если нечётное.
## Входные данные
Целое число N (|N| ≤ 10^18).
## Выходные данные
EVEN или ODD.
## Примеры
```in
4
```
```out
EVEN
```
```in
-3
```
```out
ODD
```
## Подсказки
- Чётное число делится на 2 без остатка.
- Проверка: n % 2 == 0.
- if ...: print("EVEN") else: print("ODD").
## Решение: if/else
@time: O(1) @memory: O(1)
```python
n = int(input())
if n % 2 == 0:
    print("EVEN")
else:
    print("ODD")
```
## Решение: условное выражение
@time: O(1) @memory: O(1)
```python
n = int(input())
print("EVEN" if n % 2 == 0 else "ODD")
```
## Решение: побитовое И
@time: O(1) @memory: O(1)
Младший бит нечётного числа равен 1 (в Python это верно и для отрицательных чисел).
```python
n = int(input())
print(("EVEN", "ODD")[n & 1])
```
## Объяснение
В Python -3 % 2 == 1 (остаток имеет знак делителя), поэтому проверка работает и для отрицательных.
## Генератор
```python
import json, random
random.seed(9)
print(json.dumps([str(random.randint(-10**18, 10**18)) for _ in range(6)] + ["0", "-1"]))
```

# id: task:max-of-two
kind: task
title: Большее из двух
category: Условия
level: beginner
tags: if, max, сравнение
related: py:builtin:max, py:keyword:if
## Условие
Даны два целых числа. Выведите большее из них.
## Входные данные
Два целых числа через пробел.
## Выходные данные
Большее число.
## Примеры
```in
3 8
```
```out
8
```
## Подсказки
- Сравните числа оператором >.
- Если a > b, ответ a, иначе b.
- Встроенная функция max делает это сама.
## Решение: if/else
@time: O(1) @memory: O(1)
```python
a, b = map(int, input().split())
if a > b:
    print(a)
else:
    print(b)
```
## Решение: max()
@time: O(1) @memory: O(1)
```python
print(max(map(int, input().split())))
```
## Объяснение
max() работает с любым количеством аргументов или с итерируемым объектом.
## Генератор
```python
import json, random
random.seed(10)
print(json.dumps(["%d %d" % (random.randint(-100, 100), random.randint(-100, 100)) for _ in range(6)] + ["5 5"]))
```

# id: task:leap-year
kind: task
title: Високосный год
category: Условия
level: easy
tags: and, or, високосный, calendar
related: lib:calendar.isleap, py:keyword:and, py:keyword:or
## Условие
Дан год. Выведите YES, если он високосный, и NO в противном случае. Год високосный, если он делится на 4, но не делится на 100, либо делится на 400.
## Входные данные
Целое число Y (1 ≤ Y ≤ 10^9).
## Выходные данные
YES или NO.
## Примеры
```in
2024
```
```out
YES
```
```in
1900
```
```out
NO
```
## Подсказки
- Запишите правило логическим выражением.
- Условие: (y % 4 == 0 and y % 100 != 0) or y % 400 == 0.
- В модуле calendar есть функция isleap.
## Решение: логическое выражение
@time: O(1) @memory: O(1)
```python
y = int(input())
if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0:
    print("YES")
else:
    print("NO")
```
## Решение: calendar.isleap
@time: O(1) @memory: O(1)
```python
import calendar
print("YES" if calendar.isleap(int(input())) else "NO")
```
## Решение: вложенные if
@time: O(1) @memory: O(1)
Правило по шагам: сначала 400, потом 100, потом 4.
```python
y = int(input())
if y % 400 == 0:
    ans = "YES"
elif y % 100 == 0:
    ans = "NO"
elif y % 4 == 0:
    ans = "YES"
else:
    ans = "NO"
print(ans)
```
## Объяснение
Порядок проверок важен: 1900 делится на 4, но и на 100, а на 400 — нет.
## Генератор
```python
import json
print(json.dumps(["2000", "2100", "1996", "1999", "4", "400", "1000000000", "999999996"]))
```

# id: task:triangle-exists
kind: task
title: Существует ли треугольник
category: Условия
level: easy
tags: неравенство треугольника, sorted, and
related: py:builtin:sorted
## Условие
Даны три положительных целых числа — длины отрезков. Выведите YES, если из них можно составить невырожденный треугольник, иначе NO.
## Входные данные
Три числа через пробел (1 ≤ a, b, c ≤ 10^18).
## Выходные данные
YES или NO.
## Примеры
```in
3 4 5
```
```out
YES
```
```in
1 2 3
```
```out
NO
```
## Подсказки
- Каждая сторона должна быть меньше суммы двух других.
- Достаточно проверить самую длинную сторону.
- Отсортируйте стороны: a ≤ b ≤ c, тогда условие — a + b > c.
## Решение: три неравенства
@time: O(1) @memory: O(1)
```python
a, b, c = map(int, input().split())
print("YES" if a + b > c and a + c > b and b + c > a else "NO")
```
## Решение: сортировка
@time: O(1) @memory: O(1)
```python
a, b, c = sorted(map(int, input().split()))
print("YES" if a + b > c else "NO")
```
## Решение: через сумму и максимум
@time: O(1) @memory: O(1)
Самая длинная сторона должна быть меньше суммы остальных: max < total - max.
```python
s = list(map(int, input().split()))
print("YES" if 2 * max(s) < sum(s) else "NO")
```
## Объяснение
При равенстве a + b == c треугольник вырождается в отрезок.
## Генератор
```python
import json, random
random.seed(11)
t = ["1 1 1", "1 1 2", "10 1 1", "1000000000000000000 1000000000000000000 1"]
for _ in range(6):
    t.append("%d %d %d" % tuple(random.randint(1, 20) for _ in range(3)))
print(json.dumps(t))
```

# id: task:quadrant
kind: task
title: Координатная четверть
category: Условия
level: beginner
tags: if, elif, координаты
related: py:keyword:elif
## Условие
Даны координаты точки x и y, обе не равны нулю. Выведите номер координатной четверти, в которой лежит точка (1, 2, 3 или 4).
## Входные данные
Два ненулевых целых числа x и y.
## Выходные данные
Номер четверти.
## Примеры
```in
3 -2
```
```out
4
```
## Подсказки
- Четверть определяется знаками x и y.
- I: x>0, y>0; II: x<0, y>0; III: x<0, y<0; IV: x>0, y<0.
- Используйте if / elif / else.
## Решение: цепочка if/elif
@time: O(1) @memory: O(1)
```python
x, y = map(int, input().split())
if x > 0 and y > 0:
    print(1)
elif x < 0 and y > 0:
    print(2)
elif x < 0 and y < 0:
    print(3)
else:
    print(4)
```
## Решение: таблица по знакам
@time: O(1) @memory: O(1)
Пара знаков — ключ словаря.
```python
x, y = map(int, input().split())
print({(True, True): 1, (False, True): 2, (False, False): 3, (True, False): 4}[(x > 0, y > 0)])
```
## Объяснение
Словарь с ключами-кортежами заменяет длинную цепочку условий.
## Генератор
```python
import json
print(json.dumps(["1 1", "-1 1", "-1 -1", "1 -1", "1000 -5", "-7 3"]))
```

# id: task:min-of-three
kind: task
title: Наименьшее из трёх
category: Условия
level: beginner
tags: min, сравнение, if
related: py:builtin:min
## Условие
Даны три целых числа. Выведите наименьшее.
## Входные данные
Три целых числа через пробел.
## Выходные данные
Наименьшее число.
## Примеры
```in
5 -2 7
```
```out
-2
```
## Подсказки
- Предположите, что минимум — первое число.
- Сравните его с остальными и при необходимости замените.
- Функция min() принимает сразу несколько значений.
## Решение: последовательное сравнение
@time: O(1) @memory: O(1)
```python
a, b, c = map(int, input().split())
m = a
if b < m:
    m = b
if c < m:
    m = c
print(m)
```
## Решение: min()
@time: O(1) @memory: O(1)
```python
print(min(map(int, input().split())))
```
## Объяснение
Первый способ показывает, как min() устроена внутри.
## Генератор
```python
import json, random
random.seed(12)
print(json.dumps(["%d %d %d" % tuple(random.randint(-50, 50) for _ in range(3)) for _ in range(7)] + ["1 1 1"]))
```

# id: task:ticket-price
kind: task
title: Цена билета
category: Условия
level: beginner
tags: if, elif, диапазоны
related: py:keyword:elif, py:topic:comparisons
## Условие
Билет в музей стоит: детям до 7 лет (не включая 7) — 0, от 7 до 17 лет включительно — 100, от 18 до 64 включительно — 300, от 65 лет — 150. Дан возраст, выведите цену.
## Входные данные
Целое число — возраст (0 ≤ age ≤ 150).
## Выходные данные
Цена билета.
## Примеры
```in
10
```
```out
100
```
```in
65
```
```out
150
```
## Подсказки
- Проверяйте диапазоны по возрастанию.
- В Python можно писать цепочки сравнений: 7 <= age <= 17.
- После первого подходящего elif остальные не проверяются.
## Решение: if/elif
@time: O(1) @memory: O(1)
```python
age = int(input())
if age < 7:
    print(0)
elif age <= 17:
    print(100)
elif age <= 64:
    print(300)
else:
    print(150)
```
## Решение: bisect по границам
@time: O(log k) @memory: O(k)
Границы диапазонов в отсортированном списке; bisect находит номер диапазона.
```python
import bisect
age = int(input())
bounds = [7, 18, 65]
prices = [0, 100, 300, 150]
print(prices[bisect.bisect_right(bounds, age)])
```
## Объяснение
bisect_right возвращает количество границ, не превосходящих возраст, — это и есть номер диапазона.
## Генератор
```python
import json
print(json.dumps([str(a) for a in [0, 6, 7, 17, 18, 64, 65, 150, 30]]))
```
