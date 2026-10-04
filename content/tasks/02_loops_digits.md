# id: task:print-1-to-n
kind: task
title: Числа от 1 до N
category: Циклы
level: beginner
tags: for, range, print
related: py:builtin:range, py:keyword:for
## Условие
Дано натуральное число N. Выведите все числа от 1 до N через пробел.
## Входные данные
Число N (1 ≤ N ≤ 10^5).
## Выходные данные
Числа 1, 2, …, N через пробел.
## Примеры
```in
5
```
```out
1 2 3 4 5
```
## Подсказки
- range(a, b) перебирает числа от a до b - 1.
- Чтобы включить N, пишите range(1, n + 1).
- print(i, end=" ") не переводит строку после числа.
## Решение: цикл for
@time: O(N) @memory: O(1)
```python
n = int(input())
for i in range(1, n + 1):
    print(i, end=" ")
print()
```
## Решение: распаковка range
@time: O(N) @memory: O(N)
Звёздочка передаёт все числа range в print как отдельные аргументы.
```python
print(*range(1, int(input()) + 1))
```
## Решение: join
@time: O(N) @memory: O(N)
```python
n = int(input())
print(" ".join(map(str, range(1, n + 1))))
```
## Объяснение
join склеивает только строки, поэтому числа сначала превращаем в str через map.
## Генератор
```python
import json
print(json.dumps(["1", "2", "10", "100", "1000"]))
```

# id: task:sum-1-to-n
kind: task
title: Сумма от 1 до N
category: Циклы
level: beginner
tags: сумма, формула Гаусса, sum, range
related: py:builtin:sum, py:builtin:range, algo:arithmetic
## Условие
Дано натуральное число N. Найдите сумму 1 + 2 + … + N.
## Входные данные
Число N (1 ≤ N ≤ 10^9).
## Выходные данные
Сумма.
## Примеры
```in
10
```
```out
55
```
## Подсказки
- Можно складывать числа в цикле, но при N = 10^9 это долго.
- Попробуйте сложить первое и последнее число, второе и предпоследнее…
- Формула Гаусса: N · (N + 1) / 2 (используйте //).
## Решение: формула
@time: O(1) @memory: O(1)
```python
n = int(input())
print(n * (n + 1) // 2)
```
## Объяснение
Пары (1, N), (2, N−1), … дают одинаковую сумму N+1, а пар N/2. Используем //, чтобы получить int, а не float. Цикл или sum(range(1, N + 1)) дают тот же ответ, но при N = 10^9 работают десятки секунд — поэтому здесь нужна формула.
## Генератор
```python
import json
print(json.dumps(["1", "2", "1000", "1000000", "1000000000", "999999999"]))
```

# id: task:factorial
kind: task
title: Факториал
category: Циклы
level: beginner
tags: факториал, произведение, math.factorial, рекурсия
related: lib:math.factorial, lib:math.prod, py:topic:recursion
## Условие
Дано целое число N ≥ 0. Выведите N! = 1 · 2 · … · N (0! = 1).
## Входные данные
Число N (0 ≤ N ≤ 500).
## Выходные данные
N!.
## Примеры
```in
5
```
```out
120
```
## Подсказки
- Начните с произведения, равного 1.
- Умножайте его на каждое число от 2 до N.
- В модуле math есть готовая функция factorial.
## Решение: цикл
@time: O(N) @memory: O(1)
```python
n = int(input())
f = 1
for i in range(2, n + 1):
    f *= i
print(f)
```
## Решение: math.factorial
@time: O(N) @memory: O(1)
```python
import math
print(math.factorial(int(input())))
```
## Решение: math.prod
@time: O(N) @memory: O(1)
prod перемножает все элементы; для пустого range(1, 1) результат 1.
```python
import math
n = int(input())
print(math.prod(range(1, n + 1)))
```
## Решение: рекурсия
@time: O(N) @memory: O(N)
n! = n · (n−1)!. Глубина рекурсии N ≤ 500 — меньше стандартного лимита 1000.
```python
def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)

print(fact(int(input())))
```
## Объяснение
Целые числа в Python не переполняются, поэтому 500! (более 1000 цифр) считается точно.
## Генератор
```python
import json
print(json.dumps(["0", "1", "10", "20", "100", "500"]))
```

# id: task:multiplication-table
kind: task
title: Таблица умножения
category: Циклы
level: beginner
tags: вложенный цикл, таблица, форматирование
related: py:keyword:for, py:topic:f-strings
## Условие
Дано число N. Выведите таблицу умножения N × N: в строке i — произведения i·1, i·2, …, i·N через пробел.
## Входные данные
Число N (1 ≤ N ≤ 20).
## Выходные данные
N строк по N чисел.
## Примеры
```in
3
```
```out
1 2 3
2 4 6
3 6 9
```
## Подсказки
- Нужен цикл по строкам и внутри — цикл по столбцам.
- Внешняя переменная i — номер строки, внутренняя j — номер столбца.
- Строку удобно собрать списком и вывести через print(*row).
## Решение: вложенные циклы
@time: O(N²) @memory: O(N)
```python
n = int(input())
for i in range(1, n + 1):
    row = []
    for j in range(1, n + 1):
        row.append(i * j)
    print(*row)
```
## Решение: генератор списков
@time: O(N²) @memory: O(N)
```python
n = int(input())
for i in range(1, n + 1):
    print(" ".join(str(i * j) for j in range(1, n + 1)))
```
## Объяснение
Количество операций — N², это квадратичная сложность.
## Генератор
```python
import json
print(json.dumps(["1", "2", "5", "20"]))
```

# id: task:count-digits
kind: task
title: Количество цифр
category: Цифры числа
level: beginner
tags: цифры, len, while
related: algo:digits, py:builtin:len
## Условие
Дано неотрицательное целое число N. Выведите количество цифр в его десятичной записи.
## Входные данные
Число N (0 ≤ N ≤ 10^100).
## Выходные данные
Количество цифр.
## Примеры
```in
12345
```
```out
5
```
```in
0
```
```out
1
```
## Подсказки
- Каждое деление на 10 убирает одну цифру.
- Считайте, сколько раз удалось «отрезать» цифру; не забудьте про 0.
- Проще всего — длина строки.
## Решение: длина строки
@time: O(log N) @memory: O(log N)
```python
print(len(input().strip()))
```
## Решение: цикл деления
@time: O(log N) @memory: O(1)
Цикл do-while: тело выполняется хотя бы раз, поэтому у нуля тоже одна цифра.
```python
n = int(input())
count = 0
while True:
    count += 1
    n //= 10
    if n == 0:
        break
print(count)
```
## Решение: len(str(int))
@time: O(log N) @memory: O(log N)
Превращение в int убирает возможные ведущие нули во входе.
```python
print(len(str(int(input()))))
```
## Объяснение
Логарифм (math.log10) здесь ненадёжен: для огромных чисел float теряет точность.
## Генератор
```python
import json, random
random.seed(21)
print(json.dumps([str(random.randint(0, 10**random.randint(1, 100))) for _ in range(6)] + ["9", "10", "99", "100"]))
```

# id: task:reverse-number
kind: task
title: Перевернуть число
category: Цифры числа
level: beginner
tags: разворот, цифры, срез [::-1]
related: algo:digits, py:topic:slicing
## Условие
Дано натуральное число N. Выведите число, записанное теми же цифрами в обратном порядке (ведущие нули отбросить).
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Перевёрнутое число.
## Примеры
```in
1230
```
```out
321
```
## Подсказки
- Берите цифры с конца: n % 10.
- Новое число строится как r = r * 10 + цифра.
- Через строки: срез [::-1] и int() уберёт ведущие нули.
## Решение: арифметика
@time: O(log N) @memory: O(1)
```python
n = int(input())
r = 0
while n > 0:
    r = r * 10 + n % 10
    n //= 10
print(r)
```
## Решение: срез строки
@time: O(log N) @memory: O(log N)
```python
print(int(input().strip()[::-1]))
```
## Решение: reversed и join
@time: O(log N) @memory: O(log N)
```python
s = input().strip()
print(int("".join(reversed(s))))
```
## Объяснение
int("0321") == 321 — ведущие нули исчезают при преобразовании.
## Генератор
```python
import json, random
random.seed(22)
print(json.dumps([str(random.randint(1, 10**18)) for _ in range(6)] + ["1", "100", "1000000000000000000"]))
```

# id: task:digit-product
kind: task
title: Произведение цифр
category: Цифры числа
level: beginner
tags: произведение, цифры, math.prod
related: algo:digits, lib:math.prod
## Условие
Дано натуральное число N. Найдите произведение его цифр.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Произведение цифр.
## Примеры
```in
234
```
```out
24
```
## Подсказки
- Начальное значение произведения — 1, а не 0.
- Отделяйте цифры n % 10 и n //= 10.
- math.prod(map(int, s)) перемножит цифры строки.
## Решение: цикл while
@time: O(log N) @memory: O(1)
```python
n = int(input())
p = 1
while n > 0:
    p *= n % 10
    n //= 10
print(p)
```
## Решение: math.prod
@time: O(log N) @memory: O(log N)
```python
import math
print(math.prod(map(int, input().strip())))
```
## Решение: functools.reduce
@time: O(log N) @memory: O(log N)
```python
from functools import reduce
print(reduce(lambda a, b: a * b, map(int, input().strip()), 1))
```
## Объяснение
Если в числе есть цифра 0, произведение равно 0.
## Генератор
```python
import json, random
random.seed(23)
print(json.dumps([str(random.randint(1, 10**18)) for _ in range(6)] + ["9", "111", "999999999999999999"]))
```

# id: task:palindrome-number
kind: task
title: Число-палиндром
category: Цифры числа
level: easy
tags: палиндром, разворот числа
related: algo:palindromes, algo:digits
## Условие
Дано натуральное число N. Выведите YES, если оно читается одинаково слева направо и справа налево, иначе NO.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
YES или NO.
## Примеры
```in
12321
```
```out
YES
```
```in
123
```
```out
NO
```
## Подсказки
- Палиндром совпадает со своей перевёрнутой версией.
- Переверните число арифметически или строкой.
- Сравните: s == s[::-1].
## Решение: срез строки
@time: O(log N) @memory: O(log N)
```python
s = input().strip()
print("YES" if s == s[::-1] else "NO")
```
## Решение: разворот числа
@time: O(log N) @memory: O(1)
```python
n = int(input())
m, r = n, 0
while m > 0:
    r = r * 10 + m % 10
    m //= 10
print("YES" if r == n else "NO")
```
## Решение: два указателя
@time: O(log N) @memory: O(log N)
Сравниваем символы с краёв, двигаясь к середине.
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
## Объяснение
Все три способа линейны по количеству цифр.
## Генератор
```python
import json
print(json.dumps(["1", "11", "10", "1221", "12345678987654321", "123456789987654320", "100000000000000001"]))
```

# id: task:max-digit
kind: task
title: Наибольшая цифра
category: Цифры числа
level: beginner
tags: max, цифры
related: algo:digits, py:builtin:max
## Условие
Дано натуральное число N. Выведите его наибольшую цифру.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Наибольшая цифра.
## Примеры
```in
3917
```
```out
9
```
## Подсказки
- Перебирайте цифры числа по одной.
- Храните текущий максимум и обновляйте его.
- max() от строки вернёт наибольший символ — для цифр это работает.
## Решение: цикл
@time: O(log N) @memory: O(1)
```python
n = int(input())
best = 0
while n > 0:
    best = max(best, n % 10)
    n //= 10
print(best)
```
## Решение: max по строке
@time: O(log N) @memory: O(log N)
Символы '0'..'9' сравниваются в том же порядке, что и цифры.
```python
print(max(input().strip()))
```
## Объяснение
max('3917') == '9': строки сравниваются по кодам символов, а у цифр коды идут подряд.
## Генератор
```python
import json, random
random.seed(24)
print(json.dumps([str(random.randint(1, 10**18)) for _ in range(6)] + ["1", "10", "100000"]))
```

# id: task:even-digits-sum
kind: task
title: Сумма чётных цифр
category: Цифры числа
level: easy
tags: цифры, фильтр, чётность
related: algo:digits, py:topic:comprehensions
## Условие
Дано натуральное число N. Найдите сумму его чётных цифр.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Сумма чётных цифр (0, если их нет).
## Примеры
```in
123456
```
```out
12
```
## Подсказки
- Перебирайте цифры и проверяйте каждую на чётность.
- Цифра чётная, если d % 2 == 0.
- sum(d for d in digits if d % 2 == 0).
## Решение: цикл while
@time: O(log N) @memory: O(1)
```python
n = int(input())
s = 0
while n > 0:
    d = n % 10
    if d % 2 == 0:
        s += d
    n //= 10
print(s)
```
## Решение: генератор с условием
@time: O(log N) @memory: O(log N)
```python
print(sum(d for d in map(int, input().strip()) if d % 2 == 0))
```
## Объяснение
Ноль тоже чётная цифра, но на сумму он не влияет.
## Генератор
```python
import json, random
random.seed(25)
print(json.dumps([str(random.randint(1, 10**18)) for _ in range(6)] + ["1", "13579", "2468"]))
```

# id: task:powers-of-two
kind: task
title: Степени двойки до N
category: Циклы
level: beginner
tags: while, степень двойки, умножение
related: py:keyword:while
## Условие
Дано натуральное число N. Выведите все степени двойки (1, 2, 4, 8, …), не превосходящие N, через пробел.
## Входные данные
Число N (1 ≤ N ≤ 10^18).
## Выходные данные
Степени двойки через пробел.
## Примеры
```in
50
```
```out
1 2 4 8 16 32
```
## Подсказки
- Начните с p = 1.
- Пока p ≤ N, выводите p и удваивайте его.
- Количество степеней ≈ log2(N), то есть не больше 60.
## Решение: while с удвоением
@time: O(log N) @memory: O(log N)
```python
n = int(input())
p = 1
res = []
while p <= n:
    res.append(p)
    p *= 2
print(*res)
```
## Решение: сдвиг и bit_length
@time: O(log N) @memory: O(log N)
Число степеней двойки, не больших N, равно количеству бит N.
```python
n = int(input())
print(*(1 << k for k in range(n.bit_length())))
```
## Объяснение
1 << k — это 2^k. n.bit_length() — число бит в двоичной записи n.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "1024", "1023", "1000000000000000000"]))
```

# id: task:collatz
kind: task
title: Гипотеза Коллатца
category: Циклы
level: easy
tags: while, моделирование, Коллатц
related: py:keyword:while, algo:simulation
## Условие
Дано натуральное число N. Пока N ≠ 1, если N чётное — делим его на 2, иначе заменяем на 3N + 1. Выведите количество шагов до получения 1.
## Входные данные
Число N (1 ≤ N ≤ 10^9).
## Выходные данные
Количество шагов.
## Примеры
```in
6
```
```out
8
```
## Подсказки
- Нужен цикл while n != 1.
- В теле цикла — if/else по чётности и счётчик шагов.
- Для N = 1 ответ 0.
## Решение: прямое моделирование
@time: O(шагов) @memory: O(1)
```python
n = int(input())
steps = 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print(steps)
```
## Решение: рекурсивная функция с кэшем
@time: O(шагов) @memory: O(шагов)
lru_cache полезен, если нужно считать шаги для многих чисел подряд.
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(10000)

@lru_cache(maxsize=None)
def steps(n):
    if n == 1:
        return 0
    return 1 + steps(n // 2 if n % 2 == 0 else 3 * n + 1)

print(steps(int(input())))
```
## Объяснение
6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1: восемь шагов. Для всех проверенных чисел последовательность доходит до 1.
## Генератор
```python
import json
print(json.dumps(["1", "2", "27", "97", "871", "1000000000", "837799"]))
```

# id: task:fibonacci
kind: task
title: Число Фибоначчи
category: Циклы
level: easy
tags: Фибоначчи, цикл, динамика, матрица
related: algo:dp, algo:fast-power
## Условие
Последовательность Фибоначчи: F(0) = 0, F(1) = 1, F(n) = F(n−1) + F(n−2). Дано N, выведите F(N).
## Входные данные
Число N (0 ≤ N ≤ 10^4).
## Выходные данные
F(N).
## Примеры
```in
10
```
```out
55
```
## Подсказки
- Каждое следующее число — сумма двух предыдущих.
- Храните только два последних числа: a, b = b, a + b.
- Наивная рекурсия без кэша работает экспоненциально долго.
## Решение: два числа в цикле
@time: O(N) @memory: O(1)
```python
n = int(input())
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b
print(a)
```
## Решение: список значений (динамика)
@time: O(N) @memory: O(N)
```python
n = int(input())
f = [0, 1] + [0] * n
for i in range(2, n + 1):
    f[i] = f[i - 1] + f[i - 2]
print(f[n])
```
## Решение: быстрое удвоение
@time: O(log N) @memory: O(log N)
F(2k) = F(k)·(2F(k+1) − F(k)), F(2k+1) = F(k)² + F(k+1)².
```python
def fib(n):
    if n == 0:
        return 0, 1
    a, b = fib(n >> 1)
    c = a * (2 * b - a)
    d = a * a + b * b
    return (d, c + d) if n & 1 else (c, d)

print(fib(int(input()))[0])
```
## Объяснение
Метод удвоения нужен, когда N огромно или ответ требуется по модулю.
## Генератор
```python
import json
print(json.dumps(["0", "1", "2", "50", "90", "1000", "10000"]))
```

# id: task:count-multiples
kind: task
title: Кратные на отрезке
category: Арифметика
level: easy
tags: кратность, формула, отрезок
related: algo:arithmetic
## Условие
Даны числа A, B и K. Сколько чисел на отрезке [A, B] делятся на K?
## Входные данные
Три целых числа A, B, K (0 ≤ A ≤ B ≤ 10^18, 1 ≤ K ≤ 10^18).
## Выходные данные
Количество чисел.
## Примеры
```in
1 10 3
```
```out
3
```
## Подсказки
- Перебор не подходит для 10^18 чисел.
- Чисел от 0 до X, кратных K: X // K + 1 (включая 0).
- Ответ: B // K − (A − 1) // K; аккуратно при A = 0.
## Решение: формула
@time: O(1) @memory: O(1)
```python
a, b, k = map(int, input().split())
print(b // k - (a - 1) // k)
```
## Решение: первое и последнее кратное
@time: O(1) @memory: O(1)
Находим первое кратное ≥ A и последнее ≤ B.
```python
a, b, k = map(int, input().split())
first = (a + k - 1) // k * k
last = b // k * k
print((last - first) // k + 1 if first <= last else 0)
```
## Объяснение
В Python (−1) // K == −1, поэтому формула верна и при A = 0: число 0 кратно любому K.
## Генератор
```python
import json, random
random.seed(26)
t = ["0 0 5", "0 10 1", "5 5 5", "6 9 5", "1 1000000000000000000 7"]
for _ in range(5):
    a = random.randint(0, 10**12); b = a + random.randint(0, 10**12); k = random.randint(1, 10**6)
    t.append("%d %d %d" % (a, b, k))
print(json.dumps(t))
```

# id: task:sum-until-zero
kind: task
title: Сумма до нуля
category: Циклы
level: beginner
tags: while, ввод до нуля, sentinel
related: py:keyword:while, py:builtin:iter
## Условие
Вводятся целые числа, по одному в строке. Последовательность заканчивается числом 0 (оно в последовательность не входит). Найдите сумму чисел.
## Входные данные
Целые числа по одному в строке, последнее — 0. Чисел не больше 10^5.
## Выходные данные
Сумма.
## Примеры
```in
3
5
-2
0
```
```out
6
```
## Подсказки
- Количество чисел заранее неизвестно — нужен while.
- Читайте число, проверяйте, не 0 ли оно, и только потом прибавляйте.
- iter(func, sentinel) вызывает func, пока не встретит sentinel.
## Решение: while True и break
@time: O(N) @memory: O(1)
```python
s = 0
while True:
    x = int(input())
    if x == 0:
        break
    s += x
print(s)
```
## Решение: iter с маркером конца
@time: O(N) @memory: O(1)
iter(input, "0") читает строки, пока не встретит строку "0".
```python
print(sum(map(int, iter(input, "0"))))
```
## Решение: моржовый оператор
@time: O(N) @memory: O(1)
:= присваивает и сразу возвращает значение (Python 3.8+).
```python
s = 0
while (x := int(input())) != 0:
    s += x
print(s)
```
## Объяснение
Во втором способе маркер — строка "0"; если строка содержит пробелы, лучше первый или третий способ.
## Генератор
```python
import json, random
random.seed(27)
t = ["0"]
for _ in range(5):
    k = random.randint(1, 30)
    t.append("\n".join(str(random.choice([1, -1]) * random.randint(1, 1000)) for _ in range(k)) + "\n0")
print(json.dumps(t))
```

# id: task:second-max
kind: task
title: Второй максимум
category: Циклы
level: easy
tags: максимум, второй по величине, один проход
related: lib:heapq.nlargest, py:builtin:sorted
## Условие
Дана последовательность из N целых чисел. Найдите второе по величине число (если максимум встречается дважды, он же и второй).
## Входные данные
В первой строке N (2 ≤ N ≤ 10^5), во второй — N чисел.
## Выходные данные
Второй по величине элемент.
## Примеры
```in
5
1 7 3 7 2
```
```out
7
```
```in
4
10 4 8 1
```
```out
8
```
## Подсказки
- Отсортировать и взять предпоследний — просто, но O(N log N).
- За один проход храните два значения: first и second.
- Новый элемент больше first → second = first, first = x; иначе если больше second → second = x.
## Решение: один проход
@time: O(N) @memory: O(1)
```python
n = int(input())
a = list(map(int, input().split()))
first = second = float("-inf")
for x in a:
    if x > first:
        first, second = x, first
    elif x > second:
        second = x
print(second)
```
## Решение: сортировка
@time: O(N log N) @memory: O(N)
```python
input()
a = sorted(map(int, input().split()))
print(a[-2])
```
## Решение: heapq.nlargest
@time: O(N) @memory: O(1)
nlargest(2, a) возвращает два наибольших элемента по убыванию.
```python
import heapq
input()
print(heapq.nlargest(2, map(int, input().split()))[1])
```
## Объяснение
Условие x > first (строго) и затем x > second правильно обрабатывает повторяющийся максимум: второй 7 попадает в second.
## Генератор
```python
import json, random
random.seed(28)
t = ["2\n5 5", "2\n-1 -2", "3\n1 2 3"]
for _ in range(5):
    n = random.randint(2, 200)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:star-triangle
kind: task
title: Треугольник из звёздочек
category: Циклы
level: beginner
tags: цикл, умножение строки, рисунок
related: py:topic:strings
## Условие
Дано число N. Выведите прямоугольный треугольник из звёздочек высотой N: в i-й строке i звёздочек.
## Входные данные
Число N (1 ≤ N ≤ 50).
## Выходные данные
N строк.
## Примеры
```in
3
```
```out
*
**
***
```
## Подсказки
- Строку можно умножить на число: "*" * 3 == "***".
- Номер строки i меняется от 1 до N.
- print("*" * i) в цикле.
## Решение: умножение строки
@time: O(N²) @memory: O(N)
```python
n = int(input())
for i in range(1, n + 1):
    print("*" * i)
```
## Решение: накопление строки
@time: O(N²) @memory: O(N)
```python
n = int(input())
row = ""
for _ in range(n):
    row += "*"
    print(row)
```
## Объяснение
Общее число звёздочек N(N+1)/2 — квадратичный вывод.
## Генератор
```python
import json
print(json.dumps(["1", "2", "7", "50"]))
```

# id: task:armstrong
kind: task
title: Числа Армстронга
category: Цифры числа
level: medium
tags: нарциссические числа, перебор, степени цифр
related: algo:digits, algo:brute-force
## Условие
Число называется числом Армстронга, если оно равно сумме своих цифр, возведённых в степень, равную количеству цифр (например, 153 = 1³ + 5³ + 3³). Выведите все такие числа на отрезке [A, B] через пробел, или −1, если их нет.
## Входные данные
Два числа A и B (1 ≤ A ≤ B ≤ 10^6).
## Выходные данные
Числа через пробел или −1.
## Примеры
```in
100 999
```
```out
153 370 371 407
```
## Подсказки
- Перебор до 10^6 чисел — допустим.
- Для каждого числа найдите количество цифр k и сумму d^k.
- Предварительно посчитайте степени цифр для каждого k, чтобы не возводить в степень каждый раз.
## Решение: прямой перебор
@time: O((B−A)·log B) @memory: O(1)
```python
a, b = map(int, input().split())
res = []
for x in range(a, b + 1):
    s = str(x)
    k = len(s)
    if sum(int(d) ** k for d in s) == x:
        res.append(x)
print(*res if res else [-1])
```
## Решение: таблица степеней
@time: O((B−A)·log B) @memory: O(1)
Степени цифр считаются один раз для каждой длины числа; цифры отделяем арифметикой.
```python
a, b = map(int, input().split())
pw = {k: [d ** k for d in range(10)] for k in range(1, 8)}
res = []
for x in range(a, b + 1):
    p = pw[len(str(x))]
    s, m = 0, x
    while m:
        s += p[m % 10]
        m //= 10
    if s == x:
        res.append(x)
print(" ".join(map(str, res)) if res else -1)
```
## Объяснение
До 10^6 существует всего 16 таких чисел: 1–9, 153, 370, 371, 407, 1634, 8208, 9474, 54748, 92727, 93084, 548834.
## Генератор
```python
import json
print(json.dumps(["1 9", "10 99", "1 1000000", "1000 10000", "500000 600000", "200 300"]))
```

# id: task:digital-root
kind: task
title: Цифровой корень
category: Цифры числа
level: easy
tags: цифровой корень, сумма цифр, остаток на 9
related: algo:digits, algo:modular
## Условие
Цифровой корень числа: складываем цифры, затем цифры результата и так далее, пока не останется одна цифра. Дано N, выведите его цифровой корень.
## Входные данные
Число N (0 ≤ N ≤ 10^1000).
## Выходные данные
Цифровой корень.
## Примеры
```in
9875
```
```out
2
```
## Подсказки
- Повторяйте «сумма цифр», пока число ≥ 10.
- Число и сумма его цифр дают одинаковый остаток при делении на 9.
- Для N > 0 ответ: 1 + (N − 1) % 9.
## Решение: повторная сумма цифр
@time: O(len·итераций) @memory: O(len)
```python
s = input().strip()
while len(s) > 1:
    s = str(sum(map(int, s)))
print(s)
```
## Решение: формула через остаток на 9
@time: O(len) @memory: O(len)
```python
n = int(input())
print(0 if n == 0 else 1 + (n - 1) % 9)
```
## Объяснение
10 ≡ 1 (mod 9), поэтому число сравнимо по модулю 9 с суммой своих цифр. 9875 → 29 → 11 → 2.
## Генератор
```python
import json, random
random.seed(29)
print(json.dumps(["0", "9", "10", "18"] + [str(random.randint(1, 10**random.randint(1, 1000))) for _ in range(4)]))
```

# id: task:lucky-ticket
kind: task
title: Счастливый билет
category: Цифры числа
level: easy
tags: билет, сумма цифр, срезы
related: algo:digits, py:topic:slicing
## Условие
Номер билета — 6 цифр (возможно, с ведущими нулями). Билет счастливый, если сумма первых трёх цифр равна сумме последних трёх. Выведите YES или NO.
## Входные данные
Строка из 6 цифр.
## Выходные данные
YES или NO.
## Примеры
```in
385916
```
```out
YES
```
```in
000001
```
```out
NO
```
## Подсказки
- Удобнее работать со строкой — ведущие нули сохранятся.
- s[:3] — первые три символа, s[3:] — последние три.
- Сравните суммы цифр двух половин.
## Решение: срезы строки
@time: O(1) @memory: O(1)
```python
s = input().strip()
print("YES" if sum(map(int, s[:3])) == sum(map(int, s[3:])) else "NO")
```
## Решение: арифметика
@time: O(1) @memory: O(1)
Число N = 385916: правая половина — N % 1000, левая — N // 1000.
```python
n = int(input())
def ds(x):
    return x % 10 + x // 10 % 10 + x // 100
print("YES" if ds(n // 1000) == ds(n % 1000) else "NO")
```
## Объяснение
Строка «000001» превращается в число 1, но арифметический способ всё равно верен: левая половина 0.
## Генератор
```python
import json, random
random.seed(30)
print(json.dumps(["%06d" % random.randint(0, 999999) for _ in range(6)] + ["000000", "999999", "123321", "100001"]))
```
