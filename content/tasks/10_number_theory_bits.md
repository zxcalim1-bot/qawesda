# id: task:gcd-lcm
kind: task
title: НОД и НОК
category: Теория чисел
level: easy
tags: НОД, НОК, алгоритм Евклида, math.gcd
related: algo:gcd-lcm, lib:math.gcd, lib:math.lcm
## Условие
Даны два натуральных числа A и B. Выведите их наибольший общий делитель и наименьшее общее кратное.
## Входные данные
A и B (1 ≤ A, B ≤ 10^18).
## Выходные данные
НОД и НОК через пробел.
## Примеры
```in
12 18
```
```out
6 36
```
## Подсказки
- Алгоритм Евклида: gcd(a, b) = gcd(b, a % b), gcd(a, 0) = a.
- НОК связан с НОД: lcm = a · b / gcd.
- В модуле math есть gcd и (с Python 3.9) lcm.
## Решение: math.gcd и math.lcm
@time: O(log min(A, B)) @memory: O(1)
```python
import math
a, b = map(int, input().split())
print(math.gcd(a, b), math.lcm(a, b))
```
## Решение: алгоритм Евклида
@time: O(log min(A, B)) @memory: O(1)
```python
a, b = map(int, input().split())
x, y = a, b
while y:
    x, y = y, x % y
print(x, a // x * b)
```
## Решение: рекурсивный Евклид
@time: O(log min(A, B)) @memory: O(log)
```python
def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)

a, b = map(int, input().split())
g = gcd(a, b)
print(g, a * b // g)
```
## Объяснение
Делим a // g до умножения на b — так промежуточное число меньше (в Python это не обязательно, но полезная привычка).
## Генератор
```python
import json, random
random.seed(151)
t = ["1 1", "7 13", "1000000000000000000 999999999999999999", "48 180"]
t += ["%d %d" % (random.randint(1, 10**18), random.randint(1, 10**18)) for _ in range(3)]
print(json.dumps(t))
```

# id: task:is-prime
kind: task
title: Простое ли число
category: Теория чисел
level: easy
tags: простое число, перебор до корня, Миллер–Рабин
related: algo:primes, lib:math.isqrt
## Условие
Дано натуральное число N. Выведите YES, если оно простое, иначе NO.
## Входные данные
N (1 ≤ N ≤ 10^12).
## Выходные данные
YES или NO.
## Примеры
```in
97
```
```out
YES
```
```in
1
```
```out
NO
```
## Подсказки
- 1 не является простым числом.
- Если у N есть делитель, то есть и делитель не больше √N.
- Проверяйте делители d от 2 до isqrt(N).
## Решение: перебор до корня
@time: O(√N) @memory: O(1)
```python
import math
n = int(input())
ok = n >= 2
for d in range(2, math.isqrt(n) + 1):
    if n % d == 0:
        ok = False
        break
print("YES" if ok else "NO")
```
## Решение: перебор 6k ± 1
@time: O(√N / 3) @memory: O(1)
После проверки 2 и 3 все простые имеют вид 6k ± 1.
```python
n = int(input())
def prime(n):
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
print("YES" if prime(n) else "NO")
```
## Решение: тест Миллера–Рабина
@time: O(k log³ N) @memory: O(1)
Набор оснований 2, 3, 5, 7, 11, 13, 17 детерминированно проверяет все N < 3.4·10^14.
```python
def is_prime(n):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17):
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
## Объяснение
pow(a, d, n) — встроенное быстрое возведение в степень по модулю.
## Генератор
```python
import json
print(json.dumps(["2", "3", "4", "25", "49", "999983", "1000000000039", "999999999989", "1000000000000"]))
```

# id: task:count-primes
kind: task
title: Простые числа до N
category: Теория чисел
level: medium
tags: решето Эратосфена, bytearray
related: algo:sieve
## Условие
Дано N. Выведите количество простых чисел, не превосходящих N, и сумму этих простых.
## Входные данные
N (1 ≤ N ≤ 10^7).
## Выходные данные
Количество и сумма.
## Примеры
```in
10
```
```out
4 17
```
## Подсказки
- Проверять каждое число отдельно — слишком долго.
- Решето: вычёркивайте кратные каждого найденного простого.
- Начинайте вычёркивание с p², а срезы bytearray делают это очень быстро.
## Решение: решето на bytearray
@time: O(N log log N) @memory: O(N)
```python
n = int(input())
sieve = bytearray([1]) * (n + 1)
sieve[0:2] = b"\x00\x00"[:min(2, n + 1)]
p = 2
while p * p <= n:
    if sieve[p]:
        sieve[p * p::p] = bytes(len(range(p * p, n + 1, p)))
    p += 1
primes = [i for i in range(n + 1) if sieve[i]]
print(len(primes), sum(primes))
```
## Решение: решето на списке
@time: O(N log log N) @memory: O(N)
Классический вариант с циклом вычёркивания.
```python
n = int(input())
is_p = [True] * (n + 1)
is_p[0] = False
if n >= 1:
    is_p[1] = False
for p in range(2, int(n ** 0.5) + 1):
    if is_p[p]:
        for k in range(p * p, n + 1, p):
            is_p[k] = False
cnt = s = 0
for i, f in enumerate(is_p):
    if f:
        cnt += 1
        s += i
print(cnt, s)
```
## Объяснение
Присваивание срезу bytearray выполняется на C — в десятки раз быстрее цикла в Python.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "100", "1000000", "2000000"]))
```

# id: task:factorize
kind: task
title: Разложение на простые множители
category: Теория чисел
level: medium
tags: факторизация, простые множители
related: algo:factorization
## Условие
Разложите натуральное число N > 1 на простые множители. Выведите их в порядке неубывания в формате p1*p2*…
## Входные данные
N (2 ≤ N ≤ 10^12).
## Выходные данные
Разложение.
## Примеры
```in
360
```
```out
2*2*2*3*3*5
```
## Подсказки
- Делите N на 2, пока делится, затем на 3, 5, 7, …
- Достаточно проверять делители до √N (текущего N).
- Если после цикла N > 1 — это последний простой множитель.
## Решение: пробное деление
@time: O(√N) @memory: O(log N)
```python
n = int(input())
f = []
d = 2
while d * d <= n:
    while n % d == 0:
        f.append(d)
        n //= d
    d += 1 if d == 2 else 2
if n > 1:
    f.append(n)
print("*".join(map(str, f)))
```
## Решение: ρ-алгоритм Полларда
@time: ~O(N^(1/4)) @memory: O(log N)
Для больших чисел; вместе с тестом простоты Миллера–Рабина.
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

def rho(n):
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
    d = rho(n)
    factor(d, out)
    factor(n // d, out)

res = []
factor(int(input()), res)
print("*".join(map(str, sorted(res))))
```
## Объяснение
Шаг d += 2 после двойки пропускает чётные кандидаты.
## Генератор
```python
import json
print(json.dumps(["2", "4", "97", "1024", "999999000001", "1000000000000", "600851475143", "999966000289"]))
```

# id: task:divisors
kind: task
title: Делители числа
category: Теория чисел
level: easy
tags: делители, перебор до корня, пары делителей
related: algo:divisors
## Условие
Дано натуральное N. Выведите все его делители в порядке возрастания.
## Входные данные
N (1 ≤ N ≤ 10^12).
## Выходные данные
Делители через пробел.
## Примеры
```in
36
```
```out
1 2 3 4 6 9 12 18 36
```
## Подсказки
- Делители образуют пары d и N / d.
- Меньший делитель пары не больше √N.
- Соберите «маленькие» и «большие» делители в два списка.
## Решение: пары до корня
@time: O(√N) @memory: O(d(N))
```python
import math
n = int(input())
small, big = [], []
for d in range(1, math.isqrt(n) + 1):
    if n % d == 0:
        small.append(d)
        if d != n // d:
            big.append(n // d)
print(*(small + big[::-1]))
```
## Решение: из разложения на простые
@time: O(√N + d(N) log d(N)) @memory: O(d(N))
Каждый делитель — произведение степеней простых множителей.
```python
n = int(input())
m = n
divs = [1]
p = 2
while p * p <= m:
    if m % p == 0:
        k = 0
        while m % p == 0:
            m //= p
            k += 1
        divs = [d * p ** e for d in divs for e in range(k + 1)]
    p += 1
if m > 1:
    divs = [d * e for d in divs for e in (1, m)]
print(*sorted(divs))
```
## Объяснение
Проверка d != n // d не даёт дважды вывести корень у полных квадратов.
## Генератор
```python
import json
print(json.dumps(["1", "2", "16", "97", "720720", "1000000000000", "999999999989"]))
```

# id: task:fast-power
kind: task
title: Быстрое возведение в степень по модулю
category: Теория чисел
level: medium
tags: бинарное возведение в степень, pow, модуль
related: algo:fast-power, py:builtin:pow
## Условие
Даны A, B и M. Вычислите A^B mod M.
## Входные данные
A, B, M (0 ≤ A ≤ 10^18, 0 ≤ B ≤ 10^18, 1 ≤ M ≤ 10^18).
## Выходные данные
A^B mod M.
## Примеры
```in
2 10 1000
```
```out
24
```
## Подсказки
- Перемножать B раз невозможно при B = 10^18.
- A^B = (A^(B/2))² при чётном B; при нечётном — ещё один множитель A.
- Встроенная pow(a, b, m) делает это сама.
## Решение: встроенная pow
@time: O(log B) @memory: O(1)
```python
a, b, m = map(int, input().split())
print(pow(a, b, m))
```
## Решение: бинарное возведение
@time: O(log B) @memory: O(1)
Перебираем биты показателя от младшего к старшему.
```python
a, b, m = map(int, input().split())
res = 1 % m
a %= m
while b:
    if b & 1:
        res = res * a % m
    a = a * a % m
    b >>= 1
print(res)
```
## Решение: рекурсия
@time: O(log B) @memory: O(log B)
```python
def power(a, b, m):
    if b == 0:
        return 1 % m
    half = power(a, b // 2, m)
    r = half * half % m
    return r * a % m if b % 2 else r

a, b, m = map(int, input().split())
print(power(a % m, b, m))
```
## Объяснение
1 % m вместо 1 правильно обрабатывает M = 1 (ответ 0).
## Генератор
```python
import json, random
random.seed(152)
t = ["0 0 1", "0 0 7", "5 0 3", "0 5 3", "123456789 987654321 1000000007"]
t += ["%d %d %d" % (random.randint(0, 10**18), random.randint(0, 10**18), random.randint(1, 10**18)) for _ in range(3)]
print(json.dumps(t))
```

# id: task:mod-inverse
kind: task
title: Обратный элемент по модулю
category: Теория чисел
level: hard
tags: обратный по модулю, расширенный Евклид, pow(a, -1, m)
related: algo:modular, algo:gcd-lcm
## Условие
Даны A и M. Найдите X (0 ≤ X < M), такое что A·X ≡ 1 (mod M), или выведите −1, если его нет.
## Входные данные
A и M (1 ≤ A, M ≤ 10^18).
## Выходные данные
X или −1.
## Примеры
```in
3 11
```
```out
4
```
## Подсказки
- Обратный существует тогда и только тогда, когда gcd(A, M) = 1.
- Расширенный алгоритм Евклида находит x, y: A·x + M·y = gcd(A, M).
- В Python 3.8+ pow(a, -1, m) считает обратный сам.
## Решение: pow с показателем −1
@time: O(log M) @memory: O(1)
```python
import math
a, m = map(int, input().split())
print(pow(a, -1, m) if math.gcd(a, m) == 1 else -1)
```
## Решение: расширенный Евклид
@time: O(log M) @memory: O(1)
```python
a, m = map(int, input().split())
old_r, r = a % m, m
old_s, s = 1, 0
while r:
    q = old_r // r
    old_r, r = r, old_r - q * r
    old_s, s = s, old_s - q * s
print(old_s % m if old_r == 1 else -1)
```
## Объяснение
Для M = 1 любое число сравнимо с 0, и ответ 0: 0 ≡ 1 (mod 1).
## Генератор
```python
import json
print(json.dumps(["1 1", "2 4", "10 17", "1000000006 1000000007", "123456789 1000000000000000000", "6 9"]))
```

# id: task:binom-mod
kind: task
title: Биномиальный коэффициент по модулю
category: Комбинаторика
level: hard
tags: сочетания, факториалы, малая теорема Ферма
related: algo:combinatorics, algo:modular, lib:math.comb
## Условие
Даны Q запросов «n k». Для каждого выведите C(n, k) по модулю 10^9 + 7 (0, если k > n).
## Входные данные
Q (до 10^5), затем Q строк «n k» (0 ≤ n, k ≤ 10^6).
## Выходные данные
Q чисел.
## Примеры
```in
3
5 2
10 0
3 5
```
```out
10
1
0
```
## Подсказки
- C(n, k) = n! / (k! (n−k)!).
- Предподсчитайте факториалы по модулю до 10^6.
- Делить по модулю — умножать на обратный: inv(x) = x^(p−2) mod p (p — простое).
## Решение: факториалы и обратные
@time: O(MAX + Q) @memory: O(MAX)
```python
import sys
MOD = 10**9 + 7
data = sys.stdin.buffer.read().split()
q = int(data[0])
queries = [(int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(q)]
N = max(max(n for n, _ in queries), 1)
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv = [1] * (N + 1)
inv[N] = pow(fact[N], MOD - 2, MOD)
for i in range(N, 0, -1):
    inv[i - 1] = inv[i] * i % MOD
out = []
for n, k in queries:
    out.append(0 if k > n else fact[n] * inv[k] % MOD * inv[n - k] % MOD)
print("\n".join(map(str, out)))
```
## Решение: math.comb (небольшие n)
@time: O(k) длинной арифметики на запрос @memory: O(результата)
math.comb считает точное значение; для n до нескольких тысяч это быстро.
```python
import math
MOD = 10**9 + 7
for _ in range(int(input())):
    n, k = map(int, input().split())
    print(math.comb(n, k) % MOD)
```
## Объяснение
Обратные факториалы считаются за O(N) «сверху вниз»: inv[i−1] = inv[i] · i.
## Генератор
```python
import json, random
random.seed(153)
t = ["1\n0 0", "2\n1 1\n1 2"]
for _ in range(3):
    q = random.randint(1, 15)
    qs = []
    for _ in range(q):
        n = random.randint(0, 2000); qs.append("%d %d" % (n, random.randint(0, n + 2)))
    t.append("%d\n%s" % (q, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:to-base
kind: task
title: Перевод в другую систему счисления
category: Системы счисления
level: easy
tags: системы счисления, divmod, bin, hex
related: algo:number-systems, py:builtin:bin, py:builtin:format
## Условие
Дано неотрицательное целое N и основание K (2 ≤ K ≤ 36). Выведите запись N в системе с основанием K (цифры больше 9 — заглавные латинские буквы).
## Входные данные
N и K (0 ≤ N ≤ 10^18).
## Выходные данные
Запись числа.
## Примеры
```in
255 16
```
```out
FF
```
## Подсказки
- Последняя цифра в системе K — N % K.
- Делите N на K, собирая остатки, затем разверните.
- Для K = 2, 8, 16 есть format(n, "b"), "o", "X".
## Решение: деление с остатком
@time: O(log_K N) @memory: O(log_K N)
```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
n, k = map(int, input().split())
if n == 0:
    print(0)
else:
    out = []
    while n:
        n, r = divmod(n, k)
        out.append(DIGITS[r])
    print("".join(reversed(out)))
```
## Решение: рекурсия
@time: O(log_K N) @memory: O(log_K N)
```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def to_base(n, k):
    return DIGITS[n] if n < k else to_base(n // k, k) + DIGITS[n % k]

n, k = map(int, input().split())
print(to_base(n, k))
```
## Объяснение
Обратный перевод делает int(s, k) — встроенная функция понимает основания от 2 до 36.
## Генератор
```python
import json, random
random.seed(154)
t = ["0 2", "1 2", "10 10", "35 36", "36 36", "1000000000000000000 2", "1000000000000000000 36"]
t += ["%d %d" % (random.randint(0, 10**18), random.randint(2, 36)) for _ in range(3)]
print(json.dumps(t))
```

# id: task:from-base
kind: task
title: Из системы счисления K в десятичную
category: Системы счисления
level: easy
tags: int(s, base), схема Горнера
related: py:builtin:int, algo:number-systems
## Условие
Дана запись числа в системе с основанием K (2 ≤ K ≤ 36, цифры больше 9 — заглавные латинские буквы). Выведите число в десятичной системе.
## Входные данные
Строка-число и K через пробел.
## Выходные данные
Десятичное число.
## Примеры
```in
FF 16
```
```out
255
```
## Подсказки
- Каждая следующая цифра: value = value · K + digit.
- Значение буквы: ord(ch) − ord('A') + 10.
- int(s, k) делает это сам.
## Решение: int с основанием
@time: O(L) @memory: O(1)
```python
s, k = input().split()
print(int(s, int(k)))
```
## Решение: схема Горнера
@time: O(L) @memory: O(1)
```python
s, k = input().split()
k = int(k)
value = 0
for ch in s:
    d = int(ch) if ch.isdigit() else ord(ch) - ord("A") + 10
    value = value * k + d
print(value)
```
## Объяснение
Схема Горнера избегает возведения в степень: каждая цифра «сдвигает» предыдущий результат на разряд.
## Генератор
```python
import json
print(json.dumps(["0 2", "1 2", "101 2", "777 8", "ZZ 36", "10 36", "1111111111111111111111111111111111111111 2"]))
```

# id: task:count-bits
kind: task
title: Количество единичных битов
category: Битовые операции
level: easy
tags: биты, popcount, bin().count
related: algo:bits, py:builtin:bin
## Условие
Дано неотрицательное целое N. Сколько единиц в его двоичной записи?
## Входные данные
N (0 ≤ N ≤ 10^18).
## Выходные данные
Количество единиц.
## Примеры
```in
13
```
```out
3
```
## Подсказки
- bin(n) возвращает строку вида '0b1101'.
- n & (n − 1) убирает младшую единицу.
- В Python 3.10+ есть int.bit_count().
## Решение: bin и count
@time: O(log N) @memory: O(log N)
```python
print(bin(int(input())).count("1"))
```
## Решение: n & (n − 1)
@time: O(число единиц) @memory: O(1)
```python
n = int(input())
c = 0
while n:
    n &= n - 1
    c += 1
print(c)
```
## Решение: bit_count
@time: O(log N) @memory: O(1)
```python
print(int(input()).bit_count())
```
## Объяснение
Метод Кернигана (n & (n − 1)) делает столько итераций, сколько единиц в числе.
## Генератор
```python
import json, random
random.seed(155)
print(json.dumps(["0", "1", "1023", "1000000000000000000", str(2**59), str(2**60 - 1)] + [str(random.randint(0, 10**18)) for _ in range(3)]))
```

# id: task:power-of-two-check
kind: task
title: Степень двойки
category: Битовые операции
level: easy
tags: биты, степень двойки, n & (n-1)
related: algo:bits
## Условие
Дано натуральное N. Выведите YES, если N — степень двойки (1, 2, 4, 8, …), иначе NO.
## Входные данные
N (1 ≤ N ≤ 10^18).
## Выходные данные
YES или NO.
## Примеры
```in
64
```
```out
YES
```
## Подсказки
- У степени двойки в двоичной записи ровно одна единица.
- n & (n − 1) убирает младшую единицу.
- Для степени двойки n & (n − 1) == 0.
## Решение: n & (n − 1)
@time: O(1) @memory: O(1)
```python
n = int(input())
print("YES" if n & (n - 1) == 0 else "NO")
```
## Решение: деление на 2
@time: O(log N) @memory: O(1)
```python
n = int(input())
while n % 2 == 0:
    n //= 2
print("YES" if n == 1 else "NO")
```
## Объяснение
Условие задачи гарантирует N ≥ 1, поэтому случай 0 (у которого тоже n & (n−1) == 0) не возникает.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "6", "1024", "1023", str(2**59), str(2**59 + 1), "1000000000000000000"]))
```

# id: task:single-number
kind: task
title: Единственный без пары
category: Битовые операции
level: easy
tags: XOR, пары, Counter
related: algo:bits, lib:functools.reduce
## Условие
В массиве все числа встречаются ровно дважды, кроме одного, которое встречается один раз. Найдите его.
## Входные данные
N (нечётное, до 2·10^5), затем N чисел.
## Выходные данные
Число без пары.
## Примеры
```in
5
4 1 2 1 2
```
```out
4
```
## Подсказки
- x ^ x = 0, x ^ 0 = x, операция коммутативна.
- XOR всех элементов уничтожит пары.
- Альтернатива — подсчёт частот.
## Решение: XOR всех элементов
@time: O(N) @memory: O(1)
```python
input()
r = 0
for x in map(int, input().split()):
    r ^= x
print(r)
```
## Решение: reduce и operator.xor
@time: O(N) @memory: O(N)
```python
from functools import reduce
from operator import xor
input()
print(reduce(xor, map(int, input().split())))
```
## Решение: Counter
@time: O(N) @memory: O(N)
```python
from collections import Counter
input()
print(next(x for x, c in Counter(input().split()).items() if c == 1))
```
## Объяснение
XOR работает и для отрицательных чисел Python.
## Генератор
```python
import json, random
random.seed(156)
t = ["1\n7"]
for _ in range(4):
    k = random.randint(1, 50)
    vals = random.sample(range(-1000, 1000), k + 1)
    a = vals[:k] * 2 + [vals[k]]
    random.shuffle(a)
    t.append("%d\n%s" % (len(a), " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:gray-code
kind: task
title: Код Грея
category: Битовые операции
level: medium
tags: код Грея, XOR, рекурсия
related: algo:bits
## Условие
Выведите последовательность кода Грея из N бит: все 2^N двоичных строк длины N, где соседние отличаются ровно одним битом, начиная с 00…0 (стандартный отражённый код).
## Входные данные
N (1 ≤ N ≤ 12).
## Выходные данные
2^N строк.
## Примеры
```in
2
```
```out
00
01
11
10
```
## Подсказки
- i-й код Грея: i ^ (i >> 1).
- Рекурсивно: код для N = код для N−1 с префиксом 0 + отражённый код с префиксом 1.
- format(x, "0Nb") печатает x в двоичном виде с ведущими нулями.
## Решение: формула i ^ (i >> 1)
@time: O(2^N · N) @memory: O(1)
```python
n = int(input())
for i in range(1 << n):
    print(format(i ^ (i >> 1), "0%db" % n))
```
## Решение: отражение
@time: O(2^N · N) @memory: O(2^N · N)
```python
n = int(input())
codes = [""]
for _ in range(n):
    codes = ["0" + c for c in codes] + ["1" + c for c in reversed(codes)]
print("\n".join(codes))
```
## Объяснение
Отражённый код Грея используется в энкодерах и алгоритмах перебора подмножеств с минимальными изменениями.
## Генератор
```python
import json
print(json.dumps(["1", "3", "5", "8"]))
```

# id: task:xor-range
kind: task
title: XOR от 1 до N
category: Битовые операции
level: medium
tags: XOR, закономерность, период 4
related: algo:bits
## Условие
Дано N. Вычислите 1 ^ 2 ^ 3 ^ … ^ N.
## Входные данные
N (1 ≤ N ≤ 10^18).
## Выходные данные
Результат.
## Примеры
```in
5
```
```out
1
```
## Подсказки
- Посчитайте ответы для N = 1..8 и найдите закономерность.
- Результат зависит только от N % 4.
- N%4: 0 → N, 1 → 1, 2 → N+1, 3 → 0.
## Решение: формула по N % 4
@time: O(1) @memory: O(1)
```python
n = int(input())
print([n, 1, n + 1, 0][n % 4])
```
## Решение: подсчёт по битам
@time: O(log N) @memory: O(1)
Бит b результата равен чётности количества чисел 1..N с единицей в бите b; эти числа идут блоками по 2^b с периодом 2^(b+1).
```python
n = int(input())
res = 0
for b in range(n.bit_length()):
    cycle = 1 << (b + 1)
    ones = (n + 1) // cycle * (1 << b) + max(0, (n + 1) % cycle - (1 << b))
    if ones % 2:
        res |= 1 << b
print(res)
```
## Объяснение
Пары (2k, 2k+1) дают XOR = 1, поэтому четвёрки чисел (4k..4k+3) обнуляются.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "4", "100", "999999", "1000000000000000000", "999999999999999999"]))
```

# id: task:catalan
kind: task
title: Числа Каталана
category: Комбинаторика
level: medium
tags: Каталан, math.comb, DP
related: algo:combinatorics, lib:math.comb
## Условие
Число Каталана C_N — количество правильных скобочных последовательностей из N пар скобок (а также бинарных деревьев из N вершин и т. д.). Дано N, выведите C_N.
## Входные данные
N (0 ≤ N ≤ 1000).
## Выходные данные
C_N (точно).
## Примеры
```in
3
```
```out
5
```
## Подсказки
- Формула: C_N = C(2N, N) / (N + 1).
- Рекуррентно: C_{N+1} = Σ C_i · C_{N−i}.
- math.comb считает биномиальные коэффициенты точно.
## Решение: формула через comb
@time: O(N) длинной арифметики @memory: O(1)
```python
import math
n = int(input())
print(math.comb(2 * n, n) // (n + 1))
```
## Решение: рекуррентная динамика
@time: O(N²) @memory: O(N)
```python
n = int(input())
c = [1] + [0] * n
for m in range(1, n + 1):
    c[m] = sum(c[i] * c[m - 1 - i] for i in range(m))
print(c[n])
```
## Решение: произведение
@time: O(N) @memory: O(1)
C_{k+1} = C_k · 2(2k+1) / (k+2) — деление всегда нацело.
```python
n = int(input())
c = 1
for k in range(n):
    c = c * 2 * (2 * k + 1) // (k + 2)
print(c)
```
## Объяснение
Деление в третьем способе точное: промежуточный результат всегда делится на k + 2.
## Генератор
```python
import json
print(json.dumps(["0", "1", "2", "10", "100", "500", "1000"]))
```

# id: task:euler-phi
kind: task
title: Функция Эйлера
category: Теория чисел
level: hard
tags: функция Эйлера, взаимно простые, факторизация
related: algo:factorization, lib:math.gcd
## Условие
Дано N. Выведите φ(N) — количество чисел от 1 до N, взаимно простых с N.
## Входные данные
N (1 ≤ N ≤ 10^12).
## Выходные данные
φ(N).
## Примеры
```in
36
```
```out
12
```
## Подсказки
- φ(N) = N · Π (1 − 1/p) по всем простым делителям p.
- Найдите простые делители пробным делением до √N.
- Умножайте как result −= result // p, чтобы оставаться в целых числах.
## Решение: через простые делители
@time: O(√N) @memory: O(1)
```python
n = int(input())
result = n
m = n
p = 2
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
## Решение: мультипликативность по степеням простых
@time: O(√N) @memory: O(log N)
φ(p^k) = p^k − p^(k−1), а для взаимно простых множителей значения перемножаются.
```python
n = int(input())
phi = 1
m = n
p = 2
while p * p <= m:
    if m % p == 0:
        pk = 1
        while m % p == 0:
            m //= p
            pk *= p
        phi *= pk - pk // p
    p += 1
if m > 1:
    phi *= m - 1
print(phi)
```
## Объяснение
Оба способа используют разложение на простые множители; второй явно показывает мультипликативность φ.
## Генератор
```python
import json
print(json.dumps(["1", "2", "10", "97", "1000", "720720", "999983", "1000000000000", "999999999989"]))
```
