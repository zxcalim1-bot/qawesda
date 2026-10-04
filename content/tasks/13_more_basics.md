# id: task:rectangle-area-perimeter
kind: task
title: Площадь и периметр прямоугольника
category: Арифметика
level: beginner
tags: площадь, периметр, формула
related: algo:arithmetic
## Условие
Даны стороны прямоугольника A и B. Выведите его площадь и периметр через пробел.
## Входные данные
Два натуральных числа A и B (до 10^9).
## Выходные данные
Площадь и периметр.
## Примеры
```in
3 5
```
```out
15 16
```
## Подсказки
- Площадь — произведение сторон.
- Периметр — сумма всех четырёх сторон.
- P = 2 · (A + B).
## Решение: формулы
@time: O(1) @memory: O(1)
```python
a, b = map(int, input().split())
print(a * b, 2 * (a + b))
```
## Решение: функция
@time: O(1) @memory: O(1)
```python
def rect(a, b):
    return a * b, 2 * (a + b)

print(*rect(*map(int, input().split())))
```
## Объяснение
Функция возвращает кортеж из двух значений, звёздочка распаковывает его в print.
## Генератор
```python
import json, random
random.seed(201)
print(json.dumps(["1 1", "1000000000 1000000000"] + ["%d %d" % (random.randint(1, 1000), random.randint(1, 1000)) for _ in range(4)]))
```

# id: task:minutes-to-hours
kind: task
title: Минуты в часы и минуты
category: Арифметика
level: beginner
tags: деление с остатком, время
related: py:builtin:divmod
## Условие
Дано количество минут N. Выведите, сколько это полных часов и оставшихся минут, в формате «H ч M мин».
## Входные данные
Целое число N (0 ≤ N ≤ 10^9).
## Выходные данные
Строка «H ч M мин».
## Примеры
```in
135
```
```out
2 ч 15 мин
```
## Подсказки
- В часе 60 минут.
- Часы — N // 60, минуты — N % 60.
- divmod(N, 60) возвращает обе величины.
## Решение: divmod
@time: O(1) @memory: O(1)
```python
h, m = divmod(int(input()), 60)
print(f"{h} ч {m} мин")
```
## Решение: // и %
@time: O(1) @memory: O(1)
```python
n = int(input())
print(n // 60, "ч", n % 60, "мин")
```
## Объяснение
print с несколькими аргументами вставляет пробелы между ними — результат совпадает с f-строкой.
## Генератор
```python
import json
print(json.dumps(["0", "59", "60", "61", "1000000000"]))
```

# id: task:cube-sum
kind: task
title: Сумма кубов
category: Циклы
level: easy
tags: сумма, формула, кубы
related: algo:arithmetic, py:builtin:sum
## Условие
Дано N. Найдите 1³ + 2³ + … + N³.
## Входные данные
N (1 ≤ N ≤ 10^9).
## Выходные данные
Сумма кубов.
## Примеры
```in
3
```
```out
36
```
## Подсказки
- Для небольших N подойдёт цикл, но N до 10^9.
- Посчитайте ответы для N = 1, 2, 3, 4 и сравните с (1+2+…+N)².
- Сумма кубов равна квадрату суммы первых N чисел.
## Решение: формула
@time: O(1) @memory: O(1)
```python
n = int(input())
print((n * (n + 1) // 2) ** 2)
```
## Решение: формула через многочлен
@time: O(1) @memory: O(1)
Раскрытие квадрата: n²(n+1)²/4.
```python
n = int(input())
print(n * n * (n + 1) * (n + 1) // 4)
```
## Объяснение
Тождество Никомаха: 1³ + … + n³ = (1 + … + n)².
## Генератор
```python
import json
print(json.dumps(["1", "2", "10", "1000", "1000000000"]))
```

# id: task:three-digit-number
kind: task
title: Цифры трёхзначного числа
category: Цифры числа
level: beginner
tags: цифры, //, %
related: algo:digits
## Условие
Дано трёхзначное число. Выведите его сотни, десятки и единицы через пробел, а на следующей строке — сумму цифр.
## Входные данные
Целое число от 100 до 999.
## Выходные данные
Две строки.
## Примеры
```in
572
```
```out
5 7 2
14
```
## Подсказки
- Сотни — n // 100.
- Десятки — n // 10 % 10.
- Единицы — n % 10.
## Решение: арифметика
@time: O(1) @memory: O(1)
```python
n = int(input())
a, b, c = n // 100, n // 10 % 10, n % 10
print(a, b, c)
print(a + b + c)
```
## Решение: строка
@time: O(1) @memory: O(1)
```python
s = input().strip()
print(*s)
print(sum(map(int, s)))
```
## Объяснение
print(*s) печатает символы строки через пробел.
## Генератор
```python
import json
print(json.dumps(["100", "999", "505", "123"]))
```

# id: task:age-word
kind: task
title: Склонение слова «год»
category: Условия
level: easy
tags: склонение, остаток, условия, исключения
related: py:keyword:if, py:op:mod
## Условие
Дан возраст N. Выведите «N год», «N года» или «N лет» по правилам русского языка.
## Входные данные
N (1 ≤ N ≤ 200).
## Выходные данные
Строка с правильной формой слова.
## Примеры
```in
21
```
```out
21 год
```
```in
12
```
```out
12 лет
```
## Подсказки
- Форма зависит от последней цифры и от двух последних цифр.
- 11–14 — всегда «лет».
- Иначе: 1 — «год», 2–4 — «года», остальное — «лет».
## Решение: условия
@time: O(1) @memory: O(1)
```python
n = int(input())
if 11 <= n % 100 <= 14:
    word = "лет"
elif n % 10 == 1:
    word = "год"
elif 2 <= n % 10 <= 4:
    word = "года"
else:
    word = "лет"
print(n, word)
```
## Решение: функция плюрализации
@time: O(1) @memory: O(1)
Универсальная функция для любых слов: передаём три формы.
```python
def plural(n, forms):
    if n % 10 == 1 and n % 100 != 11:
        return forms[0]
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return forms[1]
    return forms[2]

n = int(input())
print(n, plural(n, ("год", "года", "лет")))
```
## Объяснение
Исключения 11–14 проверяются по двум последним цифрам: 111 лет, но 121 год.
## Генератор
```python
import json
print(json.dumps([str(x) for x in (1, 2, 5, 11, 14, 22, 100, 101, 111, 112, 121, 200)]))
```

# id: task:sort-three
kind: task
title: Упорядочить три числа
category: Условия
level: beginner
tags: сортировка, сравнение, обмен
related: py:builtin:sorted
## Условие
Даны три целых числа. Выведите их в порядке неубывания.
## Входные данные
Три целых числа.
## Выходные данные
Числа по возрастанию.
## Примеры
```in
5 1 3
```
```out
1 3 5
```
## Подсказки
- Можно сравнивать и менять местами пары.
- После трёх «обменов при необходимости» числа будут упорядочены.
- Проще всего — sorted.
## Решение: sorted
@time: O(1) @memory: O(1)
```python
print(*sorted(map(int, input().split())))
```
## Решение: сравнения и обмены
@time: O(1) @memory: O(1)
Мини-сортировка тремя сравнениями (сеть сортировки).
```python
a, b, c = map(int, input().split())
if a > b:
    a, b = b, a
if b > c:
    b, c = c, b
if a > b:
    a, b = b, a
print(a, b, c)
```
## Объяснение
После первых двух шагов максимум оказывается в c, третий шаг упорядочивает a и b.
## Генератор
```python
import json, itertools
print(json.dumps([" ".join(map(str, p)) for p in itertools.permutations([1, 2, 3])] + ["5 5 1", "-1 -1 -1"]))
```

# id: task:century
kind: task
title: Номер века
category: Арифметика
level: beginner
tags: деление с округлением вверх, век
related: algo:arithmetic
## Условие
Дан год (натуральное число). Выведите номер века: 1–100 — 1-й век, 101–200 — 2-й и т. д.
## Входные данные
Год Y (1 ≤ Y ≤ 10^9).
## Выходные данные
Номер века.
## Примеры
```in
2000
```
```out
20
```
```in
2001
```
```out
21
```
## Подсказки
- Это деление на 100 с округлением вверх.
- Для положительных: (Y + 99) // 100.
- Или: (Y − 1) // 100 + 1.
## Решение: округление вверх
@time: O(1) @memory: O(1)
```python
y = int(input())
print((y + 99) // 100)
```
## Решение: через вычитание единицы
@time: O(1) @memory: O(1)
```python
y = int(input())
print((y - 1) // 100 + 1)
```
## Решение: отрицательное деление
@time: O(1) @memory: O(1)
-(-y // 100) — округление вверх через округление вниз отрицательного числа.
```python
y = int(input())
print(-(-y // 100))
```
## Объяснение
Все три формулы — способы получить ⌈Y / 100⌉ без float.
## Генератор
```python
import json
print(json.dumps(["1", "100", "101", "1999", "2000", "2001", "1000000000"]))
```

# id: task:discount
kind: task
title: Скидка в магазине
category: Условия
level: beginner
tags: проценты, условия, округление
related: py:builtin:round
## Условие
Покупка стоит S рублей. При сумме от 1000 скидка 5%, от 5000 — 10%, от 10000 — 15%. Выведите сумму к оплате с двумя знаками после точки.
## Входные данные
S (0 ≤ S ≤ 10^6), целое.
## Выходные данные
Сумма к оплате.
## Примеры
```in
5000
```
```out
4500.00
```
## Подсказки
- Определите процент скидки по диапазону.
- Проверяйте пороги от большего к меньшему.
- К оплате: S · (100 − скидка) / 100.
## Решение: if/elif
@time: O(1) @memory: O(1)
```python
s = int(input())
if s >= 10000:
    d = 15
elif s >= 5000:
    d = 10
elif s >= 1000:
    d = 5
else:
    d = 0
print(f"{s * (100 - d) / 100:.2f}")
```
## Решение: таблица порогов
@time: O(1) @memory: O(1)
next находит первую подходящую строку таблицы.
```python
s = int(input())
rules = [(10000, 15), (5000, 10), (1000, 5), (0, 0)]
d = next(p for limit, p in rules if s >= limit)
print("%.2f" % (s * (100 - d) / 100))
```
## Объяснение
Таблица правил легко расширяется новыми порогами без изменения кода.
## Генератор
```python
import json
print(json.dumps(["0", "999", "1000", "4999", "5000", "9999", "10000", "1000000"]))
```

# id: task:chess-same-color
kind: task
title: Клетки одного цвета
category: Условия
level: easy
tags: шахматная доска, чётность
related: py:op:mod
## Условие
Даны координаты двух клеток шахматной доски (столбец и строка от 1 до 8). Выведите YES, если клетки одного цвета, иначе NO.
## Входные данные
Четыре числа x1 y1 x2 y2.
## Выходные данные
YES или NO.
## Примеры
```in
1 1 2 2
```
```out
YES
```
## Подсказки
- Цвет клетки зависит от чётности суммы координат.
- Клетки одного цвета ⇔ чётности (x1 + y1) и (x2 + y2) совпадают.
- Проверьте (x1 + y1 + x2 + y2) % 2 == 0.
## Решение: чётность суммы
@time: O(1) @memory: O(1)
```python
x1, y1, x2, y2 = map(int, input().split())
print("YES" if (x1 + y1) % 2 == (x2 + y2) % 2 else "NO")
```
## Решение: одна проверка
@time: O(1) @memory: O(1)
```python
print("YES" if sum(map(int, input().split())) % 2 == 0 else "NO")
```
## Объяснение
Сумма двух чисел одной чётности чётна, разной — нечётна.
## Генератор
```python
import json, random
random.seed(202)
print(json.dumps([" ".join(str(random.randint(1, 8)) for _ in range(4)) for _ in range(8)]))
```

# id: task:king-move
kind: task
title: Ход короля
category: Условия
level: easy
tags: шахматы, модуль разности, условия
related: py:builtin:abs
## Условие
Король стоит на клетке (x1, y1). Может ли он за один ход попасть на клетку (x2, y2)? Клетки различны. Выведите YES или NO.
## Входные данные
x1 y1 x2 y2 (от 1 до 8).
## Выходные данные
YES или NO.
## Примеры
```in
4 4 5 5
```
```out
YES
```
## Подсказки
- Король ходит на одну клетку в любом направлении.
- Разности координат по модулю не больше 1.
- abs(x1 − x2) <= 1 and abs(y1 − y2) <= 1.
## Решение: модули разностей
@time: O(1) @memory: O(1)
```python
x1, y1, x2, y2 = map(int, input().split())
print("YES" if abs(x1 - x2) <= 1 and abs(y1 - y2) <= 1 else "NO")
```
## Решение: расстояние Чебышёва
@time: O(1) @memory: O(1)
max(|dx|, |dy|) — число ходов короля между клетками.
```python
x1, y1, x2, y2 = map(int, input().split())
print("YES" if max(abs(x1 - x2), abs(y1 - y2)) == 1 else "NO")
```
## Объяснение
Для различных клеток оба условия эквивалентны.
## Генератор
```python
import json, random
random.seed(203)
t = []
while len(t) < 8:
    a = [random.randint(1, 8) for _ in range(4)]
    if (a[0], a[1]) != (a[2], a[3]):
        t.append(" ".join(map(str, a)))
print(json.dumps(t))
```

# id: task:multiples-of-k
kind: task
title: Кратные K до N
category: Циклы
level: beginner
tags: range с шагом, кратные
related: py:builtin:range
## Условие
Даны N и K. Выведите все положительные числа, не превосходящие N и кратные K, через пробел (или -1, если таких нет).
## Входные данные
N и K (1 ≤ N ≤ 10^5, 1 ≤ K ≤ 10^9).
## Выходные данные
Числа через пробел или -1.
## Примеры
```in
20 6
```
```out
6 12 18
```
## Подсказки
- Кратные K: K, 2K, 3K, …
- range(K, N + 1, K) перебирает их напрямую.
- Если K > N — чисел нет.
## Решение: range с шагом
@time: O(N/K) @memory: O(N/K)
```python
n, k = map(int, input().split())
res = list(range(k, n + 1, k))
print(*res if res else [-1])
```
## Решение: проверка каждого числа
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
res = [x for x in range(1, n + 1) if x % k == 0]
print(" ".join(map(str, res)) or -1)
```
## Объяснение
Первый способ быстрее в K раз: он не проверяет числа, которые заведомо не подходят.
## Генератор
```python
import json
print(json.dumps(["1 1", "5 6", "100 7", "100000 1000", "10 10"]))
```

# id: task:geometric-progression
kind: task
title: Геометрическая прогрессия
category: Циклы
level: easy
tags: прогрессия, степень, цикл
related: py:op:pow
## Условие
Даны первый член A, знаменатель Q и число членов N. Выведите N членов геометрической прогрессии через пробел.
## Входные данные
A, Q, N (|A|, |Q| ≤ 10, 1 ≤ N ≤ 30).
## Выходные данные
N чисел.
## Примеры
```in
3 2 5
```
```out
3 6 12 24 48
```
## Подсказки
- Каждый следующий член — предыдущий, умноженный на Q.
- Формула: A · Q^(i).
- Целые числа в Python не переполняются.
## Решение: умножение в цикле
@time: O(N) @memory: O(N)
```python
a, q, n = map(int, input().split())
res = []
for _ in range(n):
    res.append(a)
    a *= q
print(*res)
```
## Решение: формула
@time: O(N log N) @memory: O(N)
```python
a, q, n = map(int, input().split())
print(*(a * q ** i for i in range(n)))
```
## Объяснение
0 ** 0 в Python равно 1, поэтому формула верна и при Q = 0.
## Генератор
```python
import json
print(json.dumps(["1 1 1", "2 0 4", "-1 -2 6", "10 10 30", "0 5 3"]))
```

# id: task:alternating-sum
kind: task
title: Знакочередующаяся сумма
category: Циклы
level: easy
tags: чередование знаков, формула
related: algo:arithmetic
## Условие
Дано N. Вычислите 1 − 2 + 3 − 4 + … ± N.
## Входные данные
N (1 ≤ N ≤ 10^18).
## Выходные данные
Значение суммы.
## Примеры
```in
5
```
```out
3
```
## Подсказки
- Группируйте пары (1 − 2), (3 − 4), …: каждая равна −1.
- Для чётного N ответ −N/2.
- Для нечётного: (N + 1)/2.
## Решение: формула
@time: O(1) @memory: O(1)
```python
n = int(input())
print((n + 1) // 2 if n % 2 else -(n // 2))
```
## Решение: через суммы нечётных и чётных
@time: O(1) @memory: O(1)
Сумма нечётных до N минус сумма чётных до N.
```python
n = int(input())
odd = (n + 1) // 2
even = n // 2
print(odd * odd - even * (even + 1))
```
## Объяснение
Сумма первых k нечётных чисел — k², первых k чётных — k(k+1).
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "4", "100", "1000000000000000000", "999999999999999999"]))
```

# id: task:perfect-numbers
kind: task
title: Совершенные числа
category: Теория чисел
level: medium
tags: делители, сумма делителей, совершенное число
related: algo:divisors
## Условие
Число совершенное, если равно сумме своих делителей, меньших его (6 = 1 + 2 + 3). Выведите все совершенные числа на отрезке [A, B] или -1.
## Входные данные
A и B (1 ≤ A ≤ B ≤ 10^5).
## Выходные данные
Числа через пробел или -1.
## Примеры
```in
1 30
```
```out
6 28
```
## Подсказки
- Для каждого числа можно найти сумму делителей до √x.
- Быстрее — посчитать суммы делителей для всех чисел решётом.
- Добавляйте d ко всем кратным 2d, 3d, … — сложность O(B log B).
## Решение: решето сумм делителей
@time: O(B log B) @memory: O(B)
```python
a, b = map(int, input().split())
s = [0] * (b + 1)
for d in range(1, b // 2 + 1):
    for k in range(2 * d, b + 1, d):
        s[k] += d
res = [x for x in range(a, b + 1) if x > 1 and s[x] == x]
print(*res if res else [-1])
```
## Решение: делители до корня для каждого числа
@time: O((B − A)·√B) @memory: O(1)
```python
import math
a, b = map(int, input().split())
res = []
for x in range(max(a, 2), b + 1):
    s = 1
    for d in range(2, math.isqrt(x) + 1):
        if x % d == 0:
            s += d
            if d != x // d:
                s += x // d
    if s == x:
        res.append(x)
print(" ".join(map(str, res)) if res else -1)
```
## Объяснение
До 10^5 совершенных чисел четыре: 6, 28, 496, 8128.
## Генератор
```python
import json
print(json.dumps(["1 5", "6 6", "1 100000", "500 8000", "8128 8128"]))
```

# id: task:twin-primes
kind: task
title: Простые числа-близнецы
category: Теория чисел
level: medium
tags: простые, решето, пары
related: algo:sieve
## Условие
Простые-близнецы — пары простых p и p + 2. Сколько таких пар, где p + 2 ≤ N?
## Входные данные
N (1 ≤ N ≤ 10^6).
## Выходные данные
Количество пар.
## Примеры
```in
20
```
```out
4
```
## Подсказки
- Нужна простота всех чисел до N — используйте решето.
- Затем проверьте каждое p: простые ли p и p + 2.
- Пары до 20: (3,5), (5,7), (11,13), (17,19).
## Решение: решето
@time: O(N log log N) @memory: O(N)
```python
n = int(input())
is_p = bytearray([1]) * (n + 1)
is_p[0:2] = b"\x00\x00"[:min(2, n + 1)]
for p in range(2, int(n ** 0.5) + 1):
    if is_p[p]:
        is_p[p * p::p] = bytes(len(range(p * p, n + 1, p)))
print(sum(1 for p in range(2, n - 1) if is_p[p] and is_p[p + 2]))
```
## Решение: список простых и соседние разности
@time: O(N log log N) @memory: O(N)
```python
n = int(input())
flags = [True] * (n + 1)
primes = []
for i in range(2, n + 1):
    if flags[i]:
        primes.append(i)
        for k in range(i * i, n + 1, i):
            flags[k] = False
print(sum(1 for a, b in zip(primes, primes[1:]) if b - a == 2))
```
## Объяснение
Во втором способе пары-близнецы — соседние простые с разностью 2 (между ними не может быть другого простого).
## Генератор
```python
import json
print(json.dumps(["1", "4", "5", "7", "100", "1000000"]))
```

# id: task:goldbach
kind: task
title: Гипотеза Гольдбаха
category: Теория чисел
level: medium
tags: простые числа, решето, разложение на сумму
related: algo:sieve, algo:primes
## Условие
Представьте чётное число N > 2 в виде суммы двух простых p + q, где p ≤ q и p минимально. Выведите p и q.
## Входные данные
Чётное N (4 ≤ N ≤ 10^6).
## Выходные данные
p и q.
## Примеры
```in
28
```
```out
5 23
```
## Подсказки
- Перебирайте p от 2 вверх.
- Нужно, чтобы и p, и N − p были простыми.
- Решето даёт проверку простоты за O(1).
## Решение: решето и перебор p
@time: O(N log log N) @memory: O(N)
```python
n = int(input())
is_p = [True] * (n + 1)
is_p[0] = is_p[1] = False
for i in range(2, int(n ** 0.5) + 1):
    if is_p[i]:
        for k in range(i * i, n + 1, i):
            is_p[k] = False
for p in range(2, n // 2 + 1):
    if is_p[p] and is_p[n - p]:
        print(p, n - p)
        break
```
## Решение: проверка простоты делением
@time: O(p·√N) @memory: O(1)
Минимальное p обычно маленькое, поэтому проверка каждого кандидата делением быстра.
```python
import math
def prime(x):
    return x >= 2 and all(x % d for d in range(2, math.isqrt(x) + 1))

n = int(input())
p = 2
while not (prime(p) and prime(n - p)):
    p += 1
print(p, n - p)
```
## Объяснение
Гипотеза не доказана, но проверена для всех чисел далеко за пределами ограничений задачи.
## Генератор
```python
import json
print(json.dumps(["4", "6", "8", "100", "998", "1000000", "999998"]))
```

# id: task:set-ops
kind: task
title: Операции над множествами
category: Множества
level: easy
tags: множества, пересечение, объединение, разность
related: py:method:set.intersection, py:topic:sets
## Условие
Даны два набора чисел. Выведите четыре строки: пересечение, объединение, числа только из первого набора, числа ровно из одного набора. В каждой строке числа по возрастанию (или -, если множество пусто).
## Входные данные
Две строки с числами.
## Выходные данные
Четыре строки.
## Примеры
```in
1 2 3 4
3 4 5
```
```out
3 4
1 2 3 4 5
1 2
1 2 5
```
## Подсказки
- Превратите строки во множества чисел.
- Операторы: & | - ^.
- Отсортируйте результат перед выводом.
## Решение: операторы множеств
@time: O((N + M) log) @memory: O(N + M)
```python
a = set(map(int, input().split()))
b = set(map(int, input().split()))
for s in (a & b, a | b, a - b, a ^ b):
    print(" ".join(map(str, sorted(s))) or "-")
```
## Решение: методы множеств
@time: O((N + M) log) @memory: O(N + M)
```python
a = set(map(int, input().split()))
b = set(map(int, input().split()))
results = [a.intersection(b), a.union(b), a.difference(b), a.symmetric_difference(b)]
for s in results:
    print(*sorted(s) if s else "-")
```
## Объяснение
Методы принимают любые итерируемые объекты, операторы — только множества.
## Генератор
```python
import json, random
random.seed(204)
t = ["1\n1", "1 2\n3 4"]
for _ in range(4):
    t.append(" ".join(str(random.randint(0, 15)) for _ in range(10)) + "\n" + " ".join(str(random.randint(0, 15)) for _ in range(10)))
print(json.dumps(t))
```

# id: task:unique-words-count
kind: task
title: Различные слова в тексте
category: Множества
level: easy
tags: множество, слова, регистр, знаки препинания
related: py:topic:sets, lib:re
## Условие
Дан текст. Сколько в нём различных слов, если не учитывать регистр и знаки препинания (слово — последовательность букв)?
## Входные данные
Несколько строк текста.
## Выходные данные
Количество различных слов.
## Примеры
```in
Мама мыла раму. Рама — мыла?
Мама!
```
```out
4
```
## Подсказки
- Выделите слова из букв: re.findall с классом букв.
- Приведите к нижнему регистру.
- Множество оставит только различные слова.
## Решение: регулярное выражение
@time: O(n) @memory: O(n)
```python
import re
import sys
words = re.findall(r"[^\W\d_]+", sys.stdin.read().lower())
print(len(set(words)))
```
## Решение: замена небуквенных символов
@time: O(n) @memory: O(n)
```python
import sys
text = sys.stdin.read().lower()
clean = "".join(ch if ch.isalpha() else " " for ch in text)
print(len(set(clean.split())))
```
## Объяснение
[^\W\d_] — «словесный символ, но не цифра и не подчёркивание», то есть буква любого алфавита.
## Генератор
```python
import json
print(json.dumps(["a", "A a A", "one two, three; one!", "Привет, мир! ПРИВЕТ, Мир?", "x1y2 z"]))
```

# id: task:function-is-prime-count
kind: task
title: Функция проверки простоты
category: Функции
level: easy
tags: функция, return, простое число, переиспользование
related: py:topic:functions, algo:primes
## Условие
Напишите функцию is_prime(n) и с её помощью выведите количество простых среди N данных чисел.
## Входные данные
N (1 ≤ N ≤ 1000), затем N чисел (1 ≤ a_i ≤ 10^9).
## Выходные данные
Количество простых.
## Примеры
```in
5
2 9 11 1 97
```
```out
3
```
## Подсказки
- Функция возвращает True или False.
- Делители достаточно проверять до √n.
- sum(is_prime(x) for x in a) посчитает количество True.
## Решение: функция с перебором до корня
@time: O(N·√A) @memory: O(N)
```python
import math

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, math.isqrt(n) + 1):
        if n % d == 0:
            return False
    return True

input()
print(sum(is_prime(x) for x in map(int, input().split())))
```
## Решение: функция с перебором 6k±1 и кешем
@time: O(N·√A / 3) @memory: O(N)
lru_cache ускоряет повторяющиеся числа.
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def is_prime(n):
    if n < 4:
        return n >= 2
    if n % 2 == 0 or n % 3 == 0:
        return False
    d = 5
    while d * d <= n:
        if n % d == 0 or n % (d + 2) == 0:
            return False
        d += 6
    return True

input()
print(sum(map(is_prime, map(int, input().split()))))
```
## Объяснение
Ранний return прекращает проверку на первом найденном делителе.
## Генератор
```python
import json, random
random.seed(205)
t = ["1\n1", "1\n2"]
for _ in range(3):
    n = random.randint(1, 30)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(1, 10**9)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:function-gcd-many
kind: task
title: НОД многих чисел
category: Функции
level: easy
tags: функция, НОД, reduce
related: lib:functools.reduce, lib:math.gcd
## Условие
Даны N натуральных чисел. Найдите их наибольший общий делитель.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел до 10^18.
## Выходные данные
НОД.
## Примеры
```in
3
12 18 30
```
```out
6
```
## Подсказки
- НОД нескольких чисел: gcd(gcd(a, b), c) и так далее.
- Напишите функцию gcd двух чисел и примените её по очереди.
- functools.reduce делает такой проход автоматически.
## Решение: reduce
@time: O(N log A) @memory: O(N)
```python
from functools import reduce
from math import gcd
input()
print(reduce(gcd, map(int, input().split())))
```
## Решение: своя функция и цикл
@time: O(N log A) @memory: O(1)
```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

input()
g = 0
for x in map(int, input().split()):
    g = gcd(g, x)
print(g)
```
## Решение: math.gcd с несколькими аргументами
@time: O(N log A) @memory: O(N)
```python
import math
input()
print(math.gcd(*map(int, input().split())))
```
## Объяснение
gcd(0, x) = x, поэтому начальное значение 0 не влияет на ответ.
## Генератор
```python
import json, random
random.seed(206)
t = ["1\n7", "2\n1 1"]
for _ in range(4):
    g = random.randint(1, 1000)
    n = random.randint(1, 50)
    t.append("%d\n%s" % (n, " ".join(str(g * random.randint(1, 10**6)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:recursive-sum-digits
kind: task
title: Рекурсивная сумма цифр
category: Рекурсия
level: easy
tags: рекурсия, цифры, база рекурсии
related: algo:recursion, algo:digits
## Условие
Напишите рекурсивную функцию, которая находит сумму цифр неотрицательного числа N.
## Входные данные
N (0 ≤ N ≤ 10^100).
## Выходные данные
Сумма цифр.
## Примеры
```in
9045
```
```out
18
```
## Подсказки
- База: число из одной цифры — его сумма цифр равна ему самому.
- Шаг: последняя цифра + сумма цифр числа без неё.
- f(n) = n % 10 + f(n // 10).
## Решение: рекурсия
@time: O(log N) @memory: O(log N)
```python
def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)

print(digit_sum(int(input())))
```
## Решение: рекурсия по строке
@time: O(L²) из-за срезов @memory: O(L²)
```python
def ds(s):
    return 0 if not s else int(s[0]) + ds(s[1:])

print(ds(input().strip()))
```
## Объяснение
Глубина рекурсии — число цифр (до 101), что меньше стандартного лимита 1000.
## Генератор
```python
import json, random
random.seed(207)
print(json.dumps(["0", "9", "10", str(10**100)] + [str(random.randint(0, 10**100)) for _ in range(3)]))
```

# id: task:power-recursive
kind: task
title: Степень числа рекурсией
category: Рекурсия
level: medium
tags: рекурсия, быстрое возведение, степень
related: algo:fast-power
## Условие
Напишите рекурсивную функцию power(a, n), вычисляющую a^n за O(log n) умножений, и выведите a^n mod 10^9 + 7.
## Входные данные
A и N (0 ≤ A ≤ 10^9, 0 ≤ N ≤ 10^18).
## Выходные данные
A^N mod 10^9 + 7.
## Примеры
```in
2 10
```
```out
1024
```
## Подсказки
- a^n = (a^(n/2))² для чётного n.
- Для нечётного: a · a^(n−1).
- База: a^0 = 1. Берите модуль на каждом шаге.
## Решение: рекурсия делением пополам
@time: O(log N) @memory: O(log N)
```python
MOD = 10**9 + 7

def power(a, n):
    if n == 0:
        return 1
    half = power(a, n // 2)
    res = half * half % MOD
    return res * a % MOD if n % 2 else res

a, n = map(int, input().split())
print(power(a % MOD, n))
```
## Решение: встроенная pow
@time: O(log N) @memory: O(1)
```python
a, n = map(int, input().split())
print(pow(a, n, 10**9 + 7))
```
## Объяснение
Глубина рекурсии — около log₂(10^18) ≈ 60.
## Генератор
```python
import json
print(json.dumps(["0 0", "0 5", "5 0", "1000000000 1000000000000000000", "3 1000", "7 123456789012345"]))
```

# id: task:spiral-print
kind: task
title: Обход матрицы по спирали
category: Матрицы
level: medium
tags: матрица, спираль, обход
related: task:spiral-matrix, algo:matrices
## Условие
Дана матрица N×M. Выведите её элементы в порядке обхода по спирали по часовой стрелке, начиная с левого верхнего угла.
## Входные данные
N и M (1 ≤ N, M ≤ 100), затем матрица.
## Выходные данные
N·M чисел в одну строку.
## Примеры
```in
3 3
1 2 3
4 5 6
7 8 9
```
```out
1 2 3 6 9 8 7 4 5
```
## Подсказки
- Обходите «рамку» матрицы, затем сужайте границы.
- Или: снимайте первую строку и поворачивайте остаток против часовой стрелки.
- Остаток после снятия строки поворачивается как list(zip(*m))[::-1].
## Решение: снятие строк и поворот
@time: O(N·M·min(N, M)) @memory: O(N·M)
```python
n, m = map(int, input().split())
mat = [input().split() for _ in range(n)]
res = []
while mat:
    res.extend(mat.pop(0))
    mat = [list(r) for r in zip(*mat)][::-1]
print(*res)
```
## Решение: границы
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
top, bottom, left, right = 0, n - 1, 0, m - 1
res = []
while top <= bottom and left <= right:
    res += a[top][left:right + 1]
    res += [a[r][right] for r in range(top + 1, bottom + 1)]
    if top < bottom:
        res += a[bottom][left:right][::-1]
    if left < right:
        res += [a[r][left] for r in range(bottom - 1, top, -1)]
    top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
print(*res)
```
## Объяснение
Первый способ короче, второй — быстрее и не копирует матрицу.
## Генератор
```python
import json, random
random.seed(208)
t = ["1 1\n5", "1 4\n1 2 3 4", "4 1\n1\n2\n3\n4", "2 3\n1 2 3\n4 5 6"]
for _ in range(3):
    n, m = random.randint(1, 7), random.randint(1, 7)
    t.append("%d %d\n%s" % (n, m, "\n".join(" ".join(str(random.randint(0, 99)) for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:magic-square
kind: task
title: Магический квадрат
category: Матрицы
level: medium
tags: матрица, суммы строк, столбцов, диагоналей
related: algo:matrices
## Условие
Дана квадратная матрица N×N. Выведите YES, если это магический квадрат: суммы всех строк, всех столбцов и обеих диагоналей равны, а числа — от 1 до N² без повторов. Иначе NO.
## Входные данные
N (1 ≤ N ≤ 100), затем матрица.
## Выходные данные
YES или NO.
## Примеры
```in
3
2 7 6
9 5 1
4 3 8
```
```out
YES
```
## Подсказки
- Все суммы должны быть равны N(N²+1)/2.
- Столбцы удобно получить через zip(*a).
- Проверьте, что множество элементов — это {1, …, N²}.
## Решение: множество сумм
@time: O(N²) @memory: O(N²)
```python
n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
sums = {sum(r) for r in a} | {sum(c) for c in zip(*a)}
sums |= {sum(a[i][i] for i in range(n)), sum(a[i][n - 1 - i] for i in range(n))}
ok = len(sums) == 1 and sorted(x for r in a for x in r) == list(range(1, n * n + 1))
print("YES" if ok else "NO")
```
## Решение: сравнение с магической константой
@time: O(N²) @memory: O(N²)
```python
n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
target = n * (n * n + 1) // 2
lines = a + [list(c) for c in zip(*a)] + [[a[i][i] for i in range(n)], [a[i][n - 1 - i] for i in range(n)]]
ok = all(sum(l) == target for l in lines) and set(x for r in a for x in r) == set(range(1, n * n + 1))
print("YES" if ok else "NO")
```
## Объяснение
Сумма чисел 1..N² равна N²(N²+1)/2, а строк N — поэтому каждая строка даёт N(N²+1)/2.
## Генератор
```python
import json
print(json.dumps(["1\n1", "1\n2", "2\n1 2\n3 4", "3\n8 1 6\n3 5 7\n4 9 2", "3\n1 1 1\n1 1 1\n1 1 1", "4\n16 2 3 13\n5 11 10 8\n9 7 6 12\n4 14 15 1"]))
```

# id: task:count-sort-letters
kind: task
title: Сортировка букв подсчётом
category: Сортировка
level: easy
tags: сортировка подсчётом, буквы, частоты
related: algo:sorting
## Условие
Дана строка из строчных латинских букв длиной до 10^6. Выведите её буквы в алфавитном порядке.
## Входные данные
Строка.
## Выходные данные
Отсортированная строка.
## Примеры
```in
banana
```
```out
aaabnn
```
## Подсказки
- Букв всего 26 — посчитайте каждую.
- Затем выведите каждую букву столько раз, сколько она встретилась.
- Это сортировка подсчётом за O(n + 26).
## Решение: подсчёт
@time: O(n) @memory: O(n)
```python
from collections import Counter
cnt = Counter(input().strip())
print("".join(ch * cnt[ch] for ch in "abcdefghijklmnopqrstuvwxyz"))
```
## Решение: sorted
@time: O(n log n) @memory: O(n)
```python
print("".join(sorted(input().strip())))
```
## Объяснение
Для маленького алфавита подсчёт асимптотически быстрее, чем сравнительная сортировка.
## Генератор
```python
import json, random
random.seed(209)
print(json.dumps(["a", "zyx"] + ["".join(random.choice("abcxyz") for _ in range(random.randint(1, 200))) for _ in range(4)]))
```

# id: task:first-occurrence-sorted
kind: task
title: Первое и последнее вхождение
category: Бинарный поиск
level: easy
tags: bisect, первое вхождение, последнее вхождение
related: lib:bisect.bisect_left, algo:binary-search
## Условие
Дан отсортированный массив и число X. Выведите позиции (с 1) первого и последнего вхождения X или -1 -1, если X нет.
## Входные данные
N, затем N чисел по неубыванию, затем X.
## Выходные данные
Две позиции.
## Примеры
```in
6
1 2 2 2 5 7
2
```
```out
2 4
```
## Подсказки
- bisect_left даёт первую позицию, где мог бы стоять X.
- bisect_right — позицию сразу после последнего X.
- Проверьте, что элемент по bisect_left действительно равен X.
## Решение: bisect
@time: O(log N) @memory: O(N)
```python
from bisect import bisect_left, bisect_right
input()
a = list(map(int, input().split()))
x = int(input())
l = bisect_left(a, x)
if l < len(a) and a[l] == x:
    print(l + 1, bisect_right(a, x))
else:
    print(-1, -1)
```
## Решение: index и подсчёт
@time: O(N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
x = int(input())
if x in a:
    i = a.index(x)
    print(i + 1, i + a.count(x))
else:
    print(-1, -1)
```
## Объяснение
В отсортированном массиве все равные элементы стоят подряд.
## Генератор
```python
import json, random
random.seed(210)
t = ["1\n5\n5", "1\n5\n3"]
for _ in range(4):
    n = random.randint(1, 30)
    a = sorted(random.randint(0, 10) for _ in range(n))
    t.append("%d\n%s\n%d" % (n, " ".join(map(str, a)), random.randint(-1, 11)))
print(json.dumps(t))
```

# id: task:min-diff-pair
kind: task
title: Пара с минимальной разностью
category: Сортировка
level: medium
tags: сортировка, соседние элементы, минимальная разность
related: algo:sorting
## Условие
Дан массив из N чисел. Найдите минимальную разность |a_i − a_j| среди всех пар i ≠ j.
## Входные данные
N (2 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Минимальная разность.
## Примеры
```in
5
8 1 13 4 10
```
```out
2
```
## Подсказки
- Перебор пар — O(N²).
- После сортировки ближайшие значения стоят рядом.
- Ответ — минимум разностей соседних элементов.
## Решение: сортировка и соседи
@time: O(N log N) @memory: O(N)
```python
input()
a = sorted(map(int, input().split()))
print(min(b - x for x, b in zip(a, a[1:])))
```
## Решение: перебор пар (малые N)
@time: O(N²) @memory: O(N)
```python
from itertools import combinations
input()
a = list(map(int, input().split()))
print(min(abs(x - y) for x, y in combinations(a, 2)))
```
## Объяснение
Если x < y < z, то |x − z| ≥ |x − y|, поэтому несоседние пары не дают минимума.
## Генератор
```python
import json, random
random.seed(211)
t = ["2\n5 5", "2\n-10 10"]
for _ in range(4):
    n = random.randint(2, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**6, 10**6)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:balance-point
kind: task
title: Точка равновесия массива
category: Префиксные суммы
level: medium
tags: префиксные суммы, сумма слева, сумма справа
related: algo:prefix-sums
## Условие
Найдите наименьший индекс i (с 1), для которого сумма элементов левее i равна сумме элементов правее i. Если такого нет, выведите -1.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N целых чисел.
## Выходные данные
Индекс или -1.
## Примеры
```in
7
-7 1 5 2 -4 3 0
```
```out
4
```
## Подсказки
- Сумма правее = общая сумма − сумма левее − a_i.
- Идите слева направо, накапливая сумму левее.
- Достаточно одного прохода.
## Решение: один проход
@time: O(N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
total = sum(a)
left = 0
ans = -1
for i, x in enumerate(a, 1):
    if left == total - left - x:
        ans = i
        break
    left += x
print(ans)
```
## Решение: префиксные суммы
@time: O(N) @memory: O(N)
```python
from itertools import accumulate
n = int(input())
a = list(map(int, input().split()))
p = [0, *accumulate(a)]
print(next((i for i in range(1, n + 1) if p[i - 1] == p[n] - p[i]), -1))
```
## Объяснение
Для первого элемента сумма левее — 0, для последнего сумма правее — 0.
## Генератор
```python
import json, random
random.seed(212)
t = ["1\n5", "3\n1 2 1", "2\n1 1"]
for _ in range(4):
    n = random.randint(1, 30)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-3, 3)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:anagram-substrings
kind: task
title: Анаграммы образца в тексте
category: Скользящее окно
level: hard
tags: скользящее окно, счётчики, анаграммы
related: algo:sliding-window, lib:collections.Counter
## Условие
Даны строки T и P из строчных латинских букв. Сколько подстрок T длины |P| являются анаграммами P?
## Входные данные
T (до 10^5) и P (1 ≤ |P| ≤ |T|) на отдельных строках.
## Выходные данные
Количество.
## Примеры
```in
cbaebabacd
abc
```
```out
2
```
## Подсказки
- Сравнивать отсортированные подстроки — O(n·m log m).
- Поддерживайте счётчики букв окна длины |P| при сдвиге.
- Окно — анаграмма, если его счётчики совпадают со счётчиками P.
## Решение: окно со счётчиками на 26 букв
@time: O(26·n) @memory: O(1)
```python
t = input().strip()
p = input().strip()
m = len(p)
need = [0] * 26
win = [0] * 26
for ch in p:
    need[ord(ch) - 97] += 1
count = 0
for i, ch in enumerate(t):
    win[ord(ch) - 97] += 1
    if i >= m:
        win[ord(t[i - m]) - 97] -= 1
    if i >= m - 1 and win == need:
        count += 1
print(count)
```
## Решение: окно с числом совпадающих букв
@time: O(n) @memory: O(1)
Храним, у скольких букв счётчик окна равен нужному; окно подходит, если совпадают все 26.
```python
t = input().strip()
p = input().strip()
m = len(p)
need = [0] * 26
for ch in p:
    need[ord(ch) - 97] += 1
win = [0] * 26
match = sum(1 for c in range(26) if need[c] == 0)
count = 0

def change(c, d):
    global match
    if win[c] == need[c]:
        match -= 1
    win[c] += d
    if win[c] == need[c]:
        match += 1

for i, ch in enumerate(t):
    change(ord(ch) - 97, 1)
    if i >= m:
        change(ord(t[i - m]) - 97, -1)
    if i >= m - 1 and match == 26:
        count += 1
print(count)
```
## Объяснение
Во втором способе каждая операция сдвига меняет только два счётчика — O(1) на шаг.
## Генератор
```python
import json, random
random.seed(213)
t = ["a\na", "ab\nab", "abab\nab", "aaaa\naa"]
for _ in range(3):
    t.append("".join(random.choice("abc") for _ in range(300)) + "\n" + "".join(random.choice("abc") for _ in range(random.randint(1, 5))))
print(json.dumps(t))
```

# id: task:simplify-path
kind: task
title: Упрощение пути к файлу
category: Стек и очередь
level: medium
tags: стек, путь, разбор строки
related: algo:stack, lib:pathlib
## Условие
Дан абсолютный путь в стиле Unix (начинается с /). Упростите его: «.» — текущая папка, «..» — на уровень выше (выше корня подняться нельзя), несколько слешей подряд считаются одним. Результат начинается с / и не заканчивается / (кроме корня).
## Входные данные
Строка-путь (до 10^5 символов).
## Выходные данные
Упрощённый путь.
## Примеры
```in
/home//user/./docs/../music/
```
```out
/home/user/music
```
## Подсказки
- Разбейте путь по «/».
- Обычные имена кладите в стек, «..» снимает верхнее имя.
- Пустые части и «.» пропускайте.
## Решение: стек
@time: O(n) @memory: O(n)
```python
stack = []
for part in input().strip().split("/"):
    if part == "..":
        if stack:
            stack.pop()
    elif part and part != ".":
        stack.append(part)
print("/" + "/".join(stack))
```
## Решение: posixpath.normpath с поправкой
@time: O(n) @memory: O(n)
normpath не трогает «..» над корнем при пути вида «//», поэтому сначала заменяем ведущие слеши.
```python
import posixpath
s = "/" + input().strip().lstrip("/")
print(posixpath.normpath(s).replace("//", "/"))
```
## Объяснение
Стек — универсальное решение для вложенных структур с «возвратом».
## Генератор
```python
import json
print(json.dumps(["/", "/a/b/c", "/../", "/a/./b/../../c/", "/a//b////c/d//././/..", "/x/../../y"]))
```

# id: task:daily-temperatures
kind: task
title: Сколько ждать потепления
category: Стек и очередь
level: medium
tags: монотонный стек, следующий больший, дни
related: algo:stack, task:next-greater
## Условие
Даны температуры за N дней. Для каждого дня выведите, через сколько дней будет строго теплее, или 0, если теплее уже не будет.
## Входные данные
N (до 2·10^5), затем N температур.
## Выходные данные
N чисел.
## Примеры
```in
8
73 74 75 71 69 72 76 73
```
```out
1 1 4 2 1 1 0 0
```
## Подсказки
- Это «следующий больший элемент», но нужен не он, а расстояние до него.
- Храните в стеке индексы дней, для которых ещё не нашлось тёплого дня.
- Новый день снимает со стека все более холодные дни.
## Решение: монотонный стек
@time: O(N) @memory: O(N)
```python
n = int(input())
t = list(map(int, input().split()))
ans = [0] * n
st = []
for i, x in enumerate(t):
    while st and t[st[-1]] < x:
        j = st.pop()
        ans[j] = i - j
    st.append(i)
print(*ans)
```
## Решение: проход справа с прыжками
@time: O(N) амортизированно @memory: O(N)
Для дня i прыгаем по уже вычисленным ответам: если день j не теплее, следующий кандидат — j + ans[j].
```python
n = int(input())
t = list(map(int, input().split()))
ans = [0] * n
for i in range(n - 2, -1, -1):
    j = i + 1
    while j < n and t[j] <= t[i]:
        j = j + ans[j] if ans[j] else n
    ans[i] = j - i if j < n else 0
print(*ans)
```
## Объяснение
Прыжки по ответам пропускают дни, которые заведомо не теплее.
## Генератор
```python
import json, random
random.seed(214)
t = ["1\n50", "3\n30 30 30", "3\n10 20 30"]
for _ in range(4):
    n = random.randint(1, 60)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(30, 40)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:gas-station
kind: task
title: Кольцевой маршрут заправок
category: Жадные алгоритмы
level: hard
tags: жадный, кольцо, префиксные суммы
related: algo:greedy
## Условие
На кольцевой дороге N заправок. На станции i можно заправить g_i литров, путь до следующей станции требует c_i литров. Бак изначально пуст. С какой станции (номер с 1, наименьший) можно начать и объехать круг? Если нельзя — -1.
## Входные данные
N (до 2·10^5), затем строка g, затем строка c.
## Выходные данные
Номер станции или -1.
## Примеры
```in
5
1 2 3 4 5
3 4 5 1 2
```
```out
4
```
## Подсказки
- Если сумма g меньше суммы c — ответа нет.
- Иначе ответ существует; идите вперёд, пока бак не становится отрицательным.
- Если бак ушёл в минус на станции i, старт не может быть ни в одной станции от текущего старта до i — начинайте с i + 1.
## Решение: жадный за один проход
@time: O(N) @memory: O(N)
```python
n = int(input())
g = list(map(int, input().split()))
c = list(map(int, input().split()))
if sum(g) < sum(c):
    print(-1)
else:
    start, tank = 0, 0
    for i in range(n):
        tank += g[i] - c[i]
        if tank < 0:
            start, tank = i + 1, 0
    print(start + 1)
```
## Решение: минимум префиксной суммы
@time: O(N) @memory: O(N)
Старт — станция после позиции, где префиксная сумма (g − c) минимальна (первое такое место).
```python
n = int(input())
g = list(map(int, input().split()))
c = list(map(int, input().split()))
pref, best, idx = 0, 0, 0
for i in range(n):
    pref += g[i] - c[i]
    if pref < best:
        best, idx = pref, i + 1
print(idx % n + 1 if pref >= 0 else -1)
```
## Объяснение
Начав сразу после самой «глубокой» точки, мы никогда не опустимся ниже нуля, если общий баланс неотрицателен.
## Генератор
```python
import json, random
random.seed(215)
t = ["1\n5\n5", "1\n1\n2", "2\n1 2\n2 1"]
for _ in range(4):
    n = random.randint(1, 15)
    t.append("%d\n%s\n%s" % (n, " ".join(str(random.randint(0, 6)) for _ in range(n)), " ".join(str(random.randint(0, 6)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:min-platform-arrows
kind: task
title: Минимум точек, покрывающих отрезки
category: Жадные алгоритмы
level: medium
tags: жадный, отрезки, покрытие точками
related: algo:greedy, task:activity-selection
## Условие
Дано N отрезков [l, r]. Выберите минимальное количество точек так, чтобы каждый отрезок содержал хотя бы одну точку (концы включаются).
## Входные данные
N (до 2·10^5), затем N строк «l r».
## Выходные данные
Минимальное количество точек.
## Примеры
```in
3
1 3
2 5
3 6
```
```out
1
```
## Подсказки
- Отсортируйте отрезки по правому концу.
- Ставьте точку в правый конец первого непокрытого отрезка.
- Все отрезки, начинающиеся не правее этой точки, уже покрыты.
## Решение: жадный по правому концу
@time: O(N log N) @memory: O(N)
```python
n = int(input())
segs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda s: s[1])
points = 0
last = None
for l, r in segs:
    if last is None or l > last:
        last = r
        points += 1
print(points)
```
## Решение: сортировка по началу с уменьшением конца
@time: O(N log N) @memory: O(N)
Идём по началу, держим минимальный правый конец текущей группы перекрывающихся отрезков.
```python
n = int(input())
segs = sorted(tuple(map(int, input().split())) for _ in range(n))
points = 0
end = None
for l, r in segs:
    if end is None or l > end:
        points += 1
        end = r
    else:
        end = min(end, r)
print(points)
```
## Объяснение
Это двойственная задача к выбору максимума непересекающихся отрезков — ответы совпадают.
## Генератор
```python
import json, random
random.seed(216)
t = ["1\n1 1", "2\n1 2\n3 4"]
for _ in range(4):
    n = random.randint(1, 40)
    rows = []
    for _ in range(n):
        l = random.randint(0, 50); rows.append("%d %d" % (l, l + random.randint(0, 10)))
    t.append("%d\n%s" % (n, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:climb-k-steps
kind: task
title: Лестница с шагами до K
category: Динамическое программирование
level: medium
tags: DP, скользящая сумма, ступеньки
related: algo:dp, task:stairs-ways
## Условие
За один шаг можно подняться на 1, 2, …, K ступенек. Сколькими способами можно подняться на N-ю ступеньку? Ответ по модулю 10^9 + 7.
## Входные данные
N и K (1 ≤ N ≤ 10^6, 1 ≤ K ≤ N).
## Выходные данные
Количество способов.
## Примеры
```in
4 2
```
```out
5
```
## Подсказки
- ways[i] = ways[i−1] + … + ways[i−K].
- Суммировать K слагаемых каждый раз — O(N·K).
- Поддерживайте сумму последних K значений «окном».
## Решение: скользящая сумма
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
MOD = 10**9 + 7
ways = [0] * (n + 1)
ways[0] = 1
window = 1
for i in range(1, n + 1):
    ways[i] = window
    window = (window + ways[i]) % MOD
    if i - k >= 0:
        window = (window - ways[i - k]) % MOD
print(ways[n])
```
## Решение: префиксные суммы
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
MOD = 10**9 + 7
ways = [1] + [0] * n
pref = [1] + [0] * n
for i in range(1, n + 1):
    lo = i - k - 1
    ways[i] = (pref[i - 1] - (pref[lo] if lo >= 0 else 0)) % MOD
    pref[i] = (pref[i - 1] + ways[i]) % MOD
print(ways[n])
```
## Объяснение
Оба способа избегают повторного суммирования K слагаемых.
## Генератор
```python
import json
print(json.dumps(["1 1", "4 2", "10 3", "10 10", "1000000 1", "100000 50"]))
```

# id: task:unique-paths-grid-formula
kind: task
title: Пути в сетке без препятствий
category: Комбинаторика
level: medium
tags: сочетания, пути, решётка
related: lib:math.comb, task:grid-paths
## Условие
Сколько существует путей из левого верхнего угла сетки N×M в правый нижний, если ходить только вправо и вниз?
## Входные данные
N и M (1 ≤ N, M ≤ 1000).
## Выходные данные
Количество путей (точное число).
## Примеры
```in
3 7
```
```out
28
```
## Подсказки
- Любой путь состоит из N−1 шагов вниз и M−1 шагов вправо.
- Путь определяется выбором, какие из N+M−2 шагов — вниз.
- Ответ: C(N+M−2, N−1).
## Решение: биномиальный коэффициент
@time: O(N + M) @memory: O(1)
```python
import math
n, m = map(int, input().split())
print(math.comb(n + m - 2, n - 1))
```
## Решение: динамика
@time: O(N·M) @memory: O(M)
```python
n, m = map(int, input().split())
row = [1] * m
for _ in range(n - 1):
    for j in range(1, m):
        row[j] += row[j - 1]
print(row[-1])
```
## Объяснение
Динамика строит треугольник Паскаля, комбинаторная формула получает то же число сразу.
## Генератор
```python
import json
print(json.dumps(["1 1", "1 5", "5 1", "10 10", "100 100", "500 300"]))
```

# id: task:derangements
kind: task
title: Беспорядки (перестановки без неподвижных точек)
category: Комбинаторика
level: hard
tags: беспорядки, рекуррента, включения-исключения
related: algo:combinatorics, algo:dp
## Условие
Сколько перестановок N элементов, в которых ни один элемент не стоит на своём месте? Ответ по модулю 10^9 + 7.
## Входные данные
N (1 ≤ N ≤ 10^6).
## Выходные данные
Количество.
## Примеры
```in
3
```
```out
2
```
## Подсказки
- Для N = 1: 0, для N = 2: 1.
- Рекуррента: D(n) = (n − 1)·(D(n−1) + D(n−2)).
- По включениям-исключениям: D(n) = n·D(n−1) + (−1)^n.
## Решение: рекуррента второго порядка
@time: O(N) @memory: O(1)
```python
n = int(input())
MOD = 10**9 + 7
a, b = 1, 0
for i in range(2, n + 1):
    a, b = b, (i - 1) * (a + b) % MOD
print(b if n >= 1 else 1)
```
## Решение: рекуррента первого порядка
@time: O(N) @memory: O(1)
```python
n = int(input())
MOD = 10**9 + 7
d = 1
for i in range(1, n + 1):
    d = (i * d + (-1) ** i) % MOD
print(d)
```
## Объяснение
В первом способе a и b — значения D(i−2) и D(i−1); начальные D(0) = 1, D(1) = 0.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "4", "8", "20", "1000000"]))
```

# id: task:word-frequency-file
kind: task
title: Частотный словарь текста
category: Файлы
level: easy
tags: чтение текста, слова, частоты, сортировка
related: lib:collections.Counter, py:topic:files
## Условие
На вход подаётся текст (как содержимое файла). Выведите 5 самых частых слов (без учёта регистра; слово — последовательность букв) в формате «слово количество»; при равенстве — по алфавиту. Если различных слов меньше 5, выведите все.
## Входные данные
Текст произвольной длины (до 10^5 символов).
## Выходные данные
До пяти строк.
## Примеры
```in
Кот и кот.
И пёс, и кот!
```
```out
и 3
кот 3
пёс 1
```
## Подсказки
- Прочитайте весь текст: sys.stdin.read() — как файл целиком.
- Выделите слова и приведите к нижнему регистру.
- Сортируйте по ключу (−частота, слово).
## Решение: Counter и сортировка
@time: O(n log n) @memory: O(n)
```python
import re
import sys
from collections import Counter
cnt = Counter(re.findall(r"[^\W\d_]+", sys.stdin.read().lower()))
for w, c in sorted(cnt.items(), key=lambda p: (-p[1], p[0]))[:5]:
    print(w, c)
```
## Решение: построчное чтение файла
@time: O(n log n) @memory: O(n)
Перебор строк файлового объекта sys.stdin — так же читают и обычный файл.
```python
import sys
freq = {}
for line in sys.stdin:
    word = ""
    for ch in line.lower() + " ":
        if ch.isalpha():
            word += ch
        elif word:
            freq[word] = freq.get(word, 0) + 1
            word = ""
top = sorted(freq, key=lambda w: (-freq[w], w))[:5]
print("\n".join(f"{w} {freq[w]}" for w in top))
```
## Объяснение
В примере «и» и «кот» встречаются по 3 раза, поэтому порядок между ними определяет алфавит: «и» раньше «кот». Строки сравниваются по кодам символов; для русских букв без «ё» это совпадает с алфавитом.
## Генератор
```python
import json, random
random.seed(217)
words = ["alpha", "beta", "gamma", "delta", "pi", "rho", "tau"]
t = ["one", "a b c d e f g", "Ёж ёж ЁЖ еж"]
for _ in range(3):
    t.append("\n".join(" ".join(random.choice(words) for _ in range(10)) + random.choice([".", ",", "!"]) for _ in range(3)))
print(json.dumps(t))
```
