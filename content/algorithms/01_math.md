# id: algo:complexity
kind: algorithm
category: Основы
title: Сложность алгоритмов (O-нотация)
summary: Как оценивать время и память алгоритма и укладываться в ограничения задачи.
level: beginner
complexity: —
tags: O-большое, асимптотика, время работы, память, ограничения
related: algo:brute-force, algo:sorting, algo:binary-search
## Теория
O-нотация показывает, как растёт число операций при росте входа N, без учёта констант. O(N) — линейный рост, O(N²) — квадратичный, O(log N) — логарифмический.
Основные классы по возрастанию: O(1) < O(log N) < O(√N) < O(N) < O(N log N) < O(N²) < O(N³) < O(2^N) < O(N!).
Память оценивается так же: сколько дополнительных ячеек нужно алгоритму.
## Сколько можно успеть
CPython выполняет порядка 10^7 простых операций в секунду (на часах — заметно меньше). Отсюда ориентиры для лимита ~1 секунда:
- N ≤ 10: O(N!) — перебор перестановок.
- N ≤ 20–25: O(2^N) — перебор подмножеств, DP по маскам.
- N ≤ 500: O(N³) — Флойд, DP по отрезкам.
- N ≤ 5000: O(N²) — двойной цикл.
- N ≤ 2·10^5: O(N log N) — сортировка, бинарный поиск, куча.
- N ≤ 10^7: O(N) — один проход, решето.
- N ≤ 10^18: O(log N) или O(1) — формула, бинарный поиск, быстрое возведение в степень.
## Пример: одна задача, разные сложности
Сумма чисел от 1 до N: цикл — O(N), формула — O(1).
```python
n = 10**6
s = 0
for i in range(1, n + 1):
    s += i
print(s, n * (n + 1) // 2)
```
## Сложность операций Python
- list: append, pop() с конца, индекс — O(1); insert(0, x), pop(0), x in list — O(N).
- dict и set: добавление, удаление, проверка in — в среднем O(1).
- collections.deque: append/appendleft/pop/popleft — O(1).
- sorted, list.sort — O(N log N); heapq push/pop — O(log N); bisect — O(log N) на поиск, insort — O(N).
- Срез a[i:j] и конкатенация строк — O(длины результата).
## Типичные ошибки
- Проверка x in list внутри цикла — скрытый O(N²).
- s += ch в цикле для длинных строк: лучше собирать список и делать "".join.
- Рекурсия без запоминания (например, Фибоначчи) — экспоненциальное время.
## Олимпиадное применение
Прежде чем писать код, оцените, какая сложность нужна по ограничениям — это подсказывает алгоритм.

# id: algo:arithmetic
kind: algorithm
category: Математика
title: Арифметика и целые числа в Python
summary: Деление //, остаток %, divmod, большие числа, округление и точность float.
level: beginner
complexity: O(1) для небольших чисел
tags: //, %, divmod, round, float, целые числа
related: py:op:floordiv, py:op:mod, py:builtin:divmod, py:builtin:round, task:sum-1-to-n, task:apples-split
## Теория
- a // b — целочисленное деление с округлением вниз (к −∞): -7 // 2 == -4.
- a % b — остаток со знаком делителя: -7 % 2 == 1. Всегда a == b * (a // b) + a % b.
- divmod(a, b) возвращает (a // b, a % b).
- int в Python не переполняется: 2**1000 считается точно.
- float — 64-битное число с плавающей точкой (≈15–17 значащих цифр): 0.1 + 0.2 != 0.3.
- round(x) использует банковское округление: round(2.5) == 2, round(3.5) == 4.
## Пример
```python
print(-7 // 2, -7 % 2, divmod(17, 5))
print(2 ** 100)
print(0.1 + 0.2, round(2.5), round(3.5))
print(int(-3.7), int(3.7))
```
## Формулы, которые часто нужны
- Сумма 1..N: N(N+1)/2; сумма квадратов: N(N+1)(2N+1)/6.
- Сумма арифметической прогрессии: (первый + последний) · количество / 2.
- Деление с округлением вверх для положительных: (a + b − 1) // b или -(-a // b).
## Точность
Для денег и точных дробей используйте int (в копейках), fractions.Fraction или decimal.Decimal. Сравнение float — через допуск: abs(a − b) < 1e-9.
```python
from fractions import Fraction
from decimal import Decimal
print(Fraction(1, 10) + Fraction(2, 10) == Fraction(3, 10))
print(Decimal("0.1") + Decimal("0.2"))
```
## Типичные ошибки
- n / 2 вместо n // 2: результат float, и для больших чисел теряется точность.
- int(x) отбрасывает дробную часть к нулю, а // — вниз: для отрицательных они различаются.
## Олимпиадное применение
Формулы вместо циклов, точная длинная арифметика без дополнительных библиотек, ответы «по модулю 10^9 + 7».

# id: algo:digits
kind: algorithm
category: Математика
title: Цифры числа
summary: Разбор числа на цифры: n % 10 и n // 10, работа через строку.
level: beginner
complexity: O(log n)
memory: O(1)
tags: цифры, сумма цифр, разворот числа, палиндром
related: task:digits-sum, task:reverse-number, task:count-digits, task:digital-root, task:lucky-ticket
## Теория
Последняя цифра числа n — это n % 10, а n // 10 «отрезает» её. Повторяя, получаем все цифры справа налево. Количество цифр — около log10(n), поэтому сложность O(log n).
Второй способ — строка: str(n) даёт цифры слева направо, int(ch) превращает символ в цифру.
## Шаблон
```python
n = 9876
digits = []
while n > 0:
    digits.append(n % 10)
    n //= 10
print(digits[::-1], sum(digits))
```
## Через строку
```python
n = 9876
print([int(ch) for ch in str(n)], sum(map(int, str(n))), int(str(n)[::-1]))
```
## Сложность
O(log n) по времени — по одной итерации на цифру. Через строку — та же асимптотика, но O(log n) памяти.
## Типичные ошибки
- Цикл while n > 0 для n = 0 не выполнится ни разу: у нуля одна цифра.
- Отрицательные числа: сначала n = abs(n).
- math.log10 для подсчёта цифр неточен на больших числах.
## Олимпиадное применение
Сумма и произведение цифр, числа-палиндромы, счастливые билеты, цифровой корень (1 + (n − 1) % 9), DP по цифрам.

# id: algo:gcd-lcm
kind: algorithm
category: Теория чисел
title: НОД и НОК, алгоритм Евклида
summary: gcd(a, b) = gcd(b, a % b); lcm = a·b / gcd; расширенный Евклид.
level: easy
complexity: O(log min(a, b))
memory: O(1)
tags: НОД, НОК, Евклид, math.gcd, math.lcm, расширенный алгоритм
related: lib:math.gcd, lib:math.lcm, task:gcd-lcm, task:mod-inverse, task:crt
## Теория
Наибольший общий делитель не меняется, если из большего числа вычесть меньшее; остаток от деления — это много вычитаний сразу: gcd(a, b) = gcd(b, a mod b), gcd(a, 0) = a.
Число шагов алгоритма Евклида — O(log min(a, b)) (худший случай — соседние числа Фибоначчи).
НОК: lcm(a, b) = a / gcd(a, b) · b.
## Шаблон
```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return a // gcd(a, b) * b

print(gcd(48, 180), lcm(4, 6))
```
## Встроенные функции
```python
import math
from functools import reduce
print(math.gcd(48, 180), math.lcm(4, 6), math.gcd(12, 18, 30))
print(reduce(math.gcd, [24, 36, 60]))
```
## Расширенный алгоритм Евклида
Находит x, y такие, что a·x + b·y = gcd(a, b). Нужен для обратного по модулю и китайской теоремы об остатках.
```python
def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = ext_gcd(b, a % b)
    return g, y, x - (a // b) * y

g, x, y = ext_gcd(240, 46)
print(g, x, y, 240 * x + 46 * y)
```
## Типичные ошибки
- a * b // gcd — сначала огромное произведение; лучше a // gcd * b.
- math.lcm появилась в Python 3.9, math.gcd с несколькими аргументами — тоже в 3.9.
## Олимпиадное применение
Сокращение дробей, периодичность событий (НОК), диофантовы уравнения, обратный элемент.

# id: algo:primes
kind: algorithm
category: Теория чисел
title: Простые числа и проверка простоты
summary: Перебор делителей до √n, вариант 6k±1, тест Миллера–Рабина.
level: easy
complexity: O(√n)
memory: O(1)
tags: простое число, проверка простоты, Миллер–Рабин
related: algo:sieve, algo:factorization, task:is-prime, task:count-primes
## Теория
Число n > 1 простое, если делится только на 1 и на себя. Если n = a·b и a ≤ b, то a ≤ √n — поэтому достаточно проверить делители до √n.
Все простые больше 3 имеют вид 6k ± 1 — это сокращает перебор в 3 раза.
Для очень больших n (до 10^18) используют вероятностный тест Миллера–Рабина; с фиксированным набором оснований он детерминирован.
## Шаблон
```python
import math

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, math.isqrt(n) + 1):
        if n % d == 0:
            return False
    return True

print([x for x in range(30) if is_prime(x)])
```
## Сложность
O(√n): для n = 10^12 — 10^6 проверок. Миллер–Рабин — O(k log³ n).
## Типичные ошибки
- 1 не простое, 2 — простое (и единственное чётное).
- range(2, int(n ** 0.5)) — пропускает сам корень; используйте math.isqrt(n) + 1.
## Олимпиадное применение
Проверка отдельных чисел; для многих чисел подряд — решето Эратосфена.

# id: algo:sieve
kind: algorithm
category: Теория чисел
title: Решето Эратосфена
summary: Все простые до N за O(N log log N): вычёркиваем кратные каждого простого.
level: medium
complexity: O(N log log N)
memory: O(N)
tags: решето, простые числа, bytearray, наименьший простой делитель
related: algo:primes, task:count-primes
## Теория
Выписываем числа 2..N. Берём первое невычеркнутое p — оно простое — и вычёркиваем p², p²+p, … (меньшие кратные уже вычеркнуты меньшими простыми). Достаточно p ≤ √N.
## Шаблон
```python
def sieve(n):
    is_p = bytearray([1]) * (n + 1)
    is_p[0] = is_p[1] = 0
    for p in range(2, int(n ** 0.5) + 1):
        if is_p[p]:
            is_p[p * p::p] = bytes(len(range(p * p, n + 1, p)))
    return [i for i in range(n + 1) if is_p[i]]

print(sieve(50))
```
## Наименьший простой делитель
Решето, запоминающее для каждого числа наименьший простой делитель (spf), раскладывает любое число ≤ N на множители за O(log N).
```python
n = 100
spf = list(range(n + 1))
for p in range(2, int(n ** 0.5) + 1):
    if spf[p] == p:
        for k in range(p * p, n + 1, p):
            if spf[k] == k:
                spf[k] = p
x, f = 84, []
while x > 1:
    f.append(spf[x])
    x //= spf[x]
print(f)
```
## Сложность
O(N log log N) — практически линейно. Память O(N): bytearray на 10^7 — 10 МБ.
## Типичные ошибки
- Начинать вычёркивание с 2p вместо p² — лишняя работа.
- Список bool вместо bytearray — в 8 раз больше памяти и медленнее.
## Олимпиадное применение
Количество простых, простые на отрезке, быстрая факторизация многих чисел, функция Эйлера для всех n ≤ N.

# id: algo:factorization
kind: algorithm
category: Теория чисел
title: Разложение на простые множители
summary: Пробное деление до √n; ρ-алгоритм Полларда для больших чисел.
level: medium
complexity: O(√n)
memory: O(log n)
tags: факторизация, простые множители, Поллард
related: algo:primes, algo:divisors, task:factorize, task:euler-phi
## Теория
Делим n на 2, 3, 4, … пока делится; каждый найденный делитель — простой (составные уже «съедены» его множителями). Если после d² > n осталось n > 1 — это простой множитель.
## Шаблон
```python
def factorize(n):
    f = {}
    d = 2
    while d * d <= n:
        while n % d == 0:
            f[d] = f.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        f[n] = f.get(n, 0) + 1
    return f

print(factorize(360), factorize(97), factorize(2**10 * 3**5))
```
## Что даёт разложение n = p1^a1 · … · pk^ak
- Число делителей: (a1+1)·…·(ak+1).
- Сумма делителей: Π (p^(a+1) − 1)/(p − 1).
- Функция Эйлера: n · Π (1 − 1/p).
## Сложность
O(√n) — до 10^6 делений для n = 10^12. Для 10^18 нужен ρ-алгоритм Полларда (~n^(1/4)).
## Олимпиадное применение
Делители, НОД/НОК множества чисел, функция Эйлера, задачи о степенях.

# id: algo:divisors
kind: algorithm
category: Теория чисел
title: Делители числа
summary: Делители парами d и n/d до √n; количество и сумма делителей по разложению.
level: easy
complexity: O(√n)
memory: O(d(n))
tags: делители, количество делителей, сумма делителей
related: algo:factorization, task:divisors
## Теория
Делители идут парами (d, n/d), причём меньший из пары ≤ √n. Поэтому перебор до √n находит все делители.
У чисел до 10^9 не больше 1344 делителей, до 10^18 — не больше 103680.
## Шаблон
```python
import math

def divisors(n):
    small, big = [], []
    for d in range(1, math.isqrt(n) + 1):
        if n % d == 0:
            small.append(d)
            if d != n // d:
                big.append(n // d)
    return small + big[::-1]

print(divisors(36), len(divisors(720720)))
```
## Делители всех чисел до N
Перебор «от делителя»: для каждого d добавляем его ко всем кратным — O(N log N).
```python
n = 12
divs = [[] for _ in range(n + 1)]
for d in range(1, n + 1):
    for k in range(d, n + 1, d):
        divs[k].append(d)
print(divs[12])
```
## Олимпиадное применение
Совершенные числа, задачи про НОД пар, разбиения на равные группы.

# id: algo:fast-power
kind: algorithm
category: Теория чисел
title: Быстрое возведение в степень
summary: a^n за O(log n): возводим в квадрат и умножаем по битам показателя; pow(a, n, m).
level: medium
complexity: O(log n)
memory: O(1)
tags: бинарное возведение, pow, матрица в степени, по модулю
related: py:builtin:pow, task:fast-power, task:linear-recurrence, task:stairs-ways
## Теория
a^n = (a^(n/2))² при чётном n, a^n = a · a^(n−1) при нечётном. Каждый шаг уменьшает показатель вдвое — O(log n) умножений.
Метод работает для любой ассоциативной операции: числа по модулю, матрицы (числа Фибоначчи, линейные рекурренты), перестановки.
## Шаблон
```python
def power(a, n, mod):
    result = 1 % mod
    a %= mod
    while n:
        if n & 1:
            result = result * a % mod
        a = a * a % mod
        n >>= 1
    return result

print(power(2, 10, 1000), pow(2, 10, 1000), pow(3, 10**18, 10**9 + 7))
```
## Матрица в степени: Фибоначчи
```python
def mat_mul(A, B, m):
    return [[sum(A[i][k] * B[k][j] for k in range(2)) % m for j in range(2)] for i in range(2)]

def fib(n, m=10**9 + 7):
    R, M = [[1, 0], [0, 1]], [[1, 1], [1, 0]]
    while n:
        if n & 1:
            R = mat_mul(R, M, m)
        M = mat_mul(M, M, m)
        n >>= 1
    return R[0][1]

print([fib(i) for i in range(10)], fib(10**18))
```
## Типичные ошибки
- Без взятия модуля на каждом шаге числа становятся огромными и всё замедляется.
- pow(a, n, m) с float не работает — только целые.
## Олимпиадное применение
Ответы «по модулю», обратный элемент a^(p−2), линейные рекурренты для N до 10^18.

# id: algo:modular
kind: algorithm
category: Теория чисел
title: Модульная арифметика
summary: Сложение и умножение по модулю, обратный элемент, деление по модулю, 10^9 + 7.
level: medium
complexity: O(1) на операцию, O(log m) для обратного
tags: по модулю, обратный элемент, теорема Ферма, сравнения
related: algo:fast-power, algo:gcd-lcm, task:mod-inverse, task:binom-mod, task:crt
## Теория
(a + b) mod m = ((a mod m) + (b mod m)) mod m; то же для вычитания и умножения. Деления «по модулю» нет — вместо него умножают на обратный элемент: a / b ≡ a · b^(−1) (mod m).
Обратный существует, если gcd(b, m) = 1. Для простого p по малой теореме Ферма b^(−1) ≡ b^(p−2) (mod p).
В Python % всегда даёт неотрицательный результат для положительного модуля.
## Шаблон
```python
MOD = 10**9 + 7
a, b = 10**18, 3
print((a + b) % MOD, (a * b) % MOD, (a - b) % MOD)
inv_b = pow(b, MOD - 2, MOD)
print(inv_b, b * inv_b % MOD, pow(b, -1, MOD))
```
## Факториалы и сочетания по модулю
```python
MOD = 10**9 + 7
N = 10
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [pow(f, MOD - 2, MOD) for f in fact]
C = lambda n, k: fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD
print(C(10, 3))
```
## Типичные ошибки
- Деление / по модулю: (a // b) % m неверно, если a уже взято по модулю.
- Модуль 10^9 + 7 записан как 1e9+7 — это float.
## Олимпиадное применение
Количество способов (огромные числа), хеширование строк, комбинаторика.

# id: algo:number-systems
kind: algorithm
category: Математика
title: Системы счисления
summary: Перевод между основаниями: деление с остатком, схема Горнера, bin/oct/hex/int(s, base).
level: easy
complexity: O(log n)
tags: двоичная, шестнадцатеричная, перевод, основание, int(s, base)
related: py:builtin:bin, py:builtin:hex, py:builtin:int, task:to-base, task:from-base, task:roman-to-int
## Теория
Запись числа в системе с основанием k: n = d_m·k^m + … + d_1·k + d_0. Цифры d_0, d_1, … получаются как остатки от последовательного деления на k.
Обратно — схема Горнера: value = value·k + digit для цифр слева направо.
## Встроенные средства
```python
n = 2024
print(bin(n), oct(n), hex(n))
print(format(n, "b"), format(n, "o"), format(n, "X"), format(5, "08b"))
print(int("11111101000", 2), int("7e8", 16), int("zz", 36), int("0b101", 0))
```
## Шаблон для любого основания
```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def to_base(n, k):
    if n == 0:
        return "0"
    out = []
    while n:
        n, r = divmod(n, k)
        out.append(DIGITS[r])
    return "".join(reversed(out))

print(to_base(255, 2), to_base(255, 16), to_base(100, 7))
```
## Типичные ошибки
- Забыть развернуть остатки — они получаются с конца.
- int("08") работает, а int("08", 0) — ошибка (ведущий ноль без префикса).
## Олимпиадное применение
Двоичные маски, сбалансированная троичная система, необычные системы (факториальная, Фибоначчи).

# id: algo:combinatorics
kind: algorithm
category: Математика
title: Комбинаторика
summary: Перестановки, размещения, сочетания, числа Каталана, включения-исключения.
level: medium
complexity: O(n) для формул
tags: сочетания, перестановки, биномиальные коэффициенты, Каталан, math.comb
related: lib:math.comb, lib:math.perm, lib:itertools.combinations, task:binom-mod, task:catalan, task:inclusion-exclusion, task:pairs-equal
## Формулы
- Перестановки n элементов: n!.
- Размещения (упорядоченный выбор k из n): n! / (n−k)! = math.perm(n, k).
- Сочетания (неупорядоченный выбор): C(n, k) = n! / (k!(n−k)!) = math.comb(n, k).
- Сочетания с повторениями: C(n+k−1, k).
- Перестановки с повторениями: n! / (n1!·n2!·…).
- Числа Каталана: C(2n, n)/(n+1) — скобочные последовательности, бинарные деревья.
## Пример
```python
import math
from itertools import combinations, permutations
print(math.factorial(5), math.perm(5, 2), math.comb(5, 2))
print(list(combinations("abc", 2)), len(list(permutations(range(4)))))
```
## Треугольник Паскаля
C(n, k) = C(n−1, k−1) + C(n−1, k) — удобно для таблицы сочетаний по модулю.
```python
n = 6
C = [[0] * (n + 1) for _ in range(n + 1)]
for i in range(n + 1):
    C[i][0] = 1
    for j in range(1, i + 1):
        C[i][j] = C[i - 1][j - 1] + C[i - 1][j]
print(C[6])
```
## Включения-исключения
|A ∪ B ∪ C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|. Перебор подмножеств условий со знаком (−1)^(k+1).
## Олимпиадное применение
Подсчёт способов, вероятности, пары равных элементов (c·(c−1)/2), разбиения.

# id: algo:bits
kind: algorithm
category: Математика
title: Битовые операции и маски
summary: &, |, ^, ~, <<, >>; проверка и установка бита, перебор подмножеств масками.
level: medium
complexity: O(1) на операцию
tags: биты, маски, XOR, сдвиг, popcount, подмножества
related: task:count-bits, task:power-of-two-check, task:single-number, task:subsets, task:tsp-bitmask, task:gray-code
## Операции
- x & y — И, x | y — ИЛИ, x ^ y — исключающее ИЛИ, ~x — инверсия (= −x − 1).
- x << k = x · 2^k, x >> k = x // 2^k.
- Проверить бит i: x >> i & 1; установить: x | 1 << i; сбросить: x & ~(1 << i); переключить: x ^ 1 << i.
- Младший единичный бит: x & −x; убрать его: x & (x − 1).
- Количество единиц: bin(x).count("1") или x.bit_count() (Python 3.10+); длина: x.bit_length().
## Пример
```python
x = 0b10110
print(x >> 1 & 1, x | 1, x & ~(1 << 2), x & -x, x & (x - 1), x.bit_count(), x.bit_length())
print(5 ^ 3, 5 ^ 3 ^ 3, ~5)
```
## Перебор подмножеств
Маска от 0 до 2^n − 1 — каждое подмножество. Подмаски маски m: s = m, затем s = (s − 1) & m.
```python
items = ["a", "b", "c"]
for mask in range(1 << len(items)):
    print([items[i] for i in range(len(items)) if mask >> i & 1], end=" ")
print()
m = 0b101
s = m
subs = []
while s:
    subs.append(bin(s))
    s = (s - 1) & m
print(subs)
```
## Свойства XOR
x ^ x = 0, x ^ 0 = x, коммутативность и ассоциативность. Отсюда: поиск непарного элемента, обмен без временной переменной, игра Ним.
## Олимпиадное применение
DP по маскам (коммивояжёр), meet in the middle, битсеты (reach |= reach << x), коды Грея.

# id: algo:games
kind: algorithm
category: Математика
title: Теория игр: выигрышные позиции, Ним, Шпраг–Гранди
summary: Позиция выигрышная, если есть ход в проигрышную; Ним — XOR кучек; функция Гранди — mex.
level: hard
complexity: O(состояний · ходов)
tags: игры, Ним, Гранди, mex, выигрышная стратегия
related: task:nim, task:subtraction-game, algo:bits, algo:dp
## Теория
Для игр двух игроков с полной информацией без ничьих: позиция проигрышная (P), если все ходы ведут в выигрышные (N); выигрышная — если есть ход в проигрышную. Конечные позиции без ходов — проигрышные.
Ним: позиция проигрышная ⇔ XOR размеров кучек равен 0 (теорема Бутона).
Функция Гранди: g(позиция) = mex{g(следующая)}, mex — минимальное неотрицательное число, которого нет в множестве. Сумма независимых игр проигрышная ⇔ XOR значений Гранди равен 0.
## Шаблон: Гранди для игры с вычитанием
```python
S = [1, 3, 4]
N = 20
g = [0] * (N + 1)
for x in range(1, N + 1):
    seen = {g[x - s] for s in S if s <= x}
    m = 0
    while m in seen:
        m += 1
    g[x] = m
print(g)
```
## Олимпиадное применение
Ищите закономерность в g для маленьких значений: часто она периодична, и ответ для огромных N получается формулой.

# id: algo:geometry
kind: algorithm
category: Геометрия
title: Вычислительная геометрия
summary: Векторы, скалярное и векторное произведение, площадь многоугольника, пересечение отрезков, выпуклая оболочка.
level: hard
complexity: O(1)–O(N log N)
tags: векторное произведение, площадь, отрезки, выпуклая оболочка, расстояние
related: lib:math.dist, task:distance-points, task:polygon-area, task:segments-intersect, task:convex-hull, task:clock-angle
## Основы
- Расстояние: math.dist(p, q) или math.hypot(dx, dy).
- Скалярное произведение a·b = ax·bx + ay·by: знак показывает острый/тупой угол.
- Векторное (псевдоскалярное) a×b = ax·by − ay·bx: знак — поворот (левый > 0, правый < 0), модуль — удвоенная площадь треугольника.
- Площадь многоугольника (шнурование): |Σ (x_i·y_{i+1} − x_{i+1}·y_i)| / 2.
## Шаблон
```python
def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def area2(poly):
    return abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly))))

print(cross((0, 0), (1, 0), (0, 1)), cross((0, 0), (0, 1), (1, 0)))
print(area2([(0, 0), (4, 0), (4, 3), (0, 3)]) / 2)
```
## Выпуклая оболочка (Эндрю)
```python
def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

print(hull([(0, 0), (2, 0), (1, 1), (2, 2), (0, 2), (1, 0)]))
```
## Типичные ошибки
- Сравнение float на равенство; по возможности считайте в целых числах (удвоенная площадь).
- Забыть коллинеарный случай при пересечении отрезков.
## Олимпиадное применение
Ориентация точек, принадлежность точки многоугольнику, площади, оболочки, комплексные числа как векторы.
