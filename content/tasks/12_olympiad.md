# id: task:fenwick-sum
kind: task
title: Сумма на отрезке с изменениями
category: Структуры данных
level: very_hard
tags: дерево Фенвика, дерево отрезков, запросы, обновления
related: algo:fenwick, algo:segment-tree, algo:prefix-sums
## Условие
Дан массив из N чисел. Обрабатываются Q запросов: «1 i x» — присвоить a_i = x; «2 l r» — вывести сумму a_l + … + a_r.
## Входные данные
N и Q (до 2·10^5), затем N чисел, затем Q запросов (индексы с 1).
## Выходные данные
Ответы на запросы типа 2.
## Примеры
```in
5 4
1 2 3 4 5
2 1 5
1 3 10
2 2 4
2 3 3
```
```out
15
16
10
```
## Подсказки
- Префиксные суммы не годятся: каждое изменение пересчитывает O(N) префиксов.
- Дерево Фенвика хранит частичные суммы и обновляется за O(log N).
- Присваивание = прибавление разности (x − старое значение).
## Решение: дерево Фенвика
@time: O((N + Q) log N) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
a = [0] + [int(x) for x in data[2:2 + n]]
tree = [0] * (n + 1)
for i in range(1, n + 1):
    tree[i] += a[i]
    j = i + (i & -i)
    if j <= n:
        tree[j] += tree[i]

def prefix(i):
    s = 0
    while i > 0:
        s += tree[i]
        i -= i & -i
    return s

out = []
pos = 2 + n
for _ in range(q):
    t, x, y = int(data[pos]), int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    if t == 1:
        d = y - a[x]
        a[x] = y
        i = x
        while i <= n:
            tree[i] += d
            i += i & -i
    else:
        out.append(prefix(y) - prefix(x - 1))
print("\n".join(map(str, out)))
```
## Решение: дерево отрезков снизу вверх
@time: O((N + Q) log N) @memory: O(N)
Листья лежат в t[n..2n−1], родитель i — в i // 2; запрос идёт двумя указателями снизу.
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
t = [0] * n + [int(x) for x in data[2:2 + n]]
for i in range(n - 1, 0, -1):
    t[i] = t[2 * i] + t[2 * i + 1]
out = []
pos = 2 + n
for _ in range(q):
    typ, x, y = int(data[pos]), int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    if typ == 1:
        i = x - 1 + n
        t[i] = y
        i //= 2
        while i:
            t[i] = t[2 * i] + t[2 * i + 1]
            i //= 2
    else:
        l, r = x - 1 + n, y + n
        s = 0
        while l < r:
            if l & 1:
                s += t[l]
                l += 1
            if r & 1:
                r -= 1
                s += t[r]
            l //= 2
            r //= 2
        out.append(s)
print("\n".join(map(str, out)))
```
## Решение: корневая декомпозиция
@time: O((N + Q)·√N) @memory: O(N)
Массив делится на блоки по √N, для каждого хранится сумма.
```python
import math
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
a = [int(x) for x in data[2:2 + n]]
B = max(1, math.isqrt(n))
blocks = [sum(a[i:i + B]) for i in range(0, n, B)]
out = []
pos = 2 + n
for _ in range(q):
    typ, x, y = int(data[pos]), int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    if typ == 1:
        blocks[(x - 1) // B] += y - a[x - 1]
        a[x - 1] = y
    else:
        l, r = x - 1, y - 1
        s = 0
        while l <= r and l % B:
            s += a[l]
            l += 1
        while l + B - 1 <= r:
            s += blocks[l // B]
            l += B
        while l <= r:
            s += a[l]
            l += 1
        out.append(s)
print("\n".join(map(str, out)))
```
## Объяснение
Фенвик проще в коде, дерево отрезков универсальнее (минимум, максимум, присваивание на отрезке), корневая декомпозиция — самая простая идея.
## Генератор
```python
import json, random
random.seed(171)
t = []
for _ in range(5):
    n, q = random.randint(1, 30), random.randint(1, 30)
    a = " ".join(str(random.randint(-100, 100)) for _ in range(n))
    qs = []
    for _ in range(q):
        if random.random() < 0.5:
            qs.append("1 %d %d" % (random.randint(1, n), random.randint(-100, 100)))
        else:
            l = random.randint(1, n); qs.append("2 %d %d" % (l, random.randint(l, n)))
    t.append("%d %d\n%s\n%s" % (n, q, a, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:range-min
kind: task
title: Минимум на отрезке
category: Структуры данных
level: very_hard
tags: разреженная таблица, RMQ, дерево отрезков
related: algo:sparse-table, algo:segment-tree
## Условие
Дан массив из N чисел (он не меняется) и Q запросов «l r». На каждый запрос выведите минимум на отрезке [l, r].
## Входные данные
N и Q (до 2·10^5), затем N чисел, затем Q запросов (индексы с 1).
## Выходные данные
Q чисел.
## Примеры
```in
6 3
5 2 8 1 9 3
1 3
3 6
5 5
```
```out
2
1
9
```
## Подсказки
- Массив не меняется — можно один раз всё предподсчитать.
- sp[k][i] — минимум на отрезке длины 2^k, начинающемся в i.
- Любой отрезок покрывается двумя перекрывающимися отрезками длины 2^k.
## Решение: разреженная таблица
@time: O(N log N + Q) @memory: O(N log N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
sp = [[int(x) for x in data[2:2 + n]]]
k = 1
while (1 << k) <= n:
    prev = sp[-1]
    half = 1 << (k - 1)
    sp.append([min(prev[i], prev[i + half]) for i in range(n - (1 << k) + 1)])
    k += 1
out = []
pos = 2 + n
for _ in range(q):
    l, r = int(data[pos]) - 1, int(data[pos + 1])
    pos += 2
    j = (r - l).bit_length() - 1
    out.append(min(sp[j][l], sp[j][r - (1 << j)]))
print("\n".join(map(str, out)))
```
## Решение: дерево отрезков
@time: O(N + Q log N) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
t = [0] * n + [int(x) for x in data[2:2 + n]]
for i in range(n - 1, 0, -1):
    t[i] = min(t[2 * i], t[2 * i + 1])
out = []
pos = 2 + n
for _ in range(q):
    l, r = int(data[pos]) - 1 + n, int(data[pos + 1]) + n
    pos += 2
    best = float("inf")
    while l < r:
        if l & 1:
            best = min(best, t[l])
            l += 1
        if r & 1:
            r -= 1
            best = min(best, t[r])
        l //= 2
        r //= 2
    out.append(best)
print("\n".join(map(str, out)))
```
## Объяснение
Минимум идемпотентен (min(x, x) = x), поэтому перекрытие двух отрезков в разреженной таблице не портит ответ; для суммы так нельзя.
## Генератор
```python
import json, random
random.seed(172)
t = ["1 1\n7\n1 1"]
for _ in range(4):
    n, q = random.randint(1, 40), random.randint(1, 30)
    a = " ".join(str(random.randint(-100, 100)) for _ in range(n))
    qs = []
    for _ in range(q):
        l = random.randint(1, n); qs.append("%d %d" % (l, random.randint(l, n)))
    t.append("%d %d\n%s\n%s" % (n, q, a, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:string-period
kind: task
title: Минимальный период строки
category: Строки
level: hard
tags: префикс-функция, Z-функция, период
related: algo:string-algorithms
## Условие
Найдите длину наименьшей строки T, такой что S получается повторением T несколько раз целиком (S = T·T·…·T).
## Входные данные
Строка S длиной до 10^6.
## Выходные данные
Длина T.
## Примеры
```in
abcabcabc
```
```out
3
```
```in
abcab
```
```out
5
```
## Подсказки
- Кандидаты — делители длины строки.
- Префикс-функция: p = n − π[n−1] — минимальный период; он подходит, если n делится на p.
- Трюк: S — повторение, если S встречается в (S+S)[1:−1].
## Решение: префикс-функция
@time: O(n) @memory: O(n)
```python
s = input().strip()
n = len(s)
pi = [0] * n
for i in range(1, n):
    k = pi[i - 1]
    while k and s[i] != s[k]:
        k = pi[k - 1]
    if s[i] == s[k]:
        k += 1
    pi[i] = k
p = n - pi[-1]
print(p if n % p == 0 else n)
```
## Решение: поиск в удвоенной строке
@time: O(n) в среднем @memory: O(n)
Первое вхождение S в S+S, начиная с позиции 1, равно минимальному периоду-делителю.
```python
s = input().strip()
print((s + s).find(s, 1))
```
## Решение: перебор делителей длины
@time: O(n · d(n)) @memory: O(n)
```python
s = input().strip()
n = len(s)
for p in range(1, n + 1):
    if n % p == 0 and s[:p] * (n // p) == s:
        print(p)
        break
```
## Объяснение
(s + s).find(s, 1) всегда находит вхождение не позже позиции n.
## Генератор
```python
import json, random
random.seed(173)
t = ["a", "aa", "ab", "abab", "abaab", "aabaabaab"]
for _ in range(3):
    base = "".join(random.choice("ab") for _ in range(random.randint(1, 6)))
    t.append(base * random.randint(1, 50))
t.append("ab" * 5000)
print(json.dumps(t))
```

# id: task:z-search
kind: task
title: Все вхождения образца (Z-функция)
category: Строки
level: very_hard
tags: Z-функция, поиск подстроки, префикс-функция
related: algo:string-algorithms
## Условие
Даны текст T и образец P. Выведите все позиции (с 1), с которых P входит в T, или -1.
## Входные данные
T (до 10^6) и P (1 ≤ |P| ≤ |T|) на отдельных строках.
## Выходные данные
Позиции через пробел или -1.
## Примеры
```in
abababa
aba
```
```out
1 3 5
```
## Подсказки
- Z-функция строки P#T: z[i] — длина общего префикса строки и её суффикса с позиции i.
- Вхождение начинается там, где z[i] = |P|.
- Поддерживайте самый правый отрезок совпадения [l, r), чтобы получить O(n).
## Решение: Z-функция
@time: O(|P| + |T|) @memory: O(|P| + |T|)
```python
t = input()
p = input()
s = p + "\0" + t
n = len(s)
z = [0] * n
l = r = 0
for i in range(1, n):
    if i < r:
        z[i] = min(r - i, z[i - l])
    while i + z[i] < n and s[z[i]] == s[i + z[i]]:
        z[i] += 1
    if i + z[i] > r:
        l, r = i, i + z[i]
m = len(p)
res = [i - m for i in range(m + 1, n) if z[i] == m]
print(*res if res else [-1])
```
## Решение: find в цикле
@time: O(|P|·|T|) в худшем, обычно быстро @memory: O(1)
```python
t = input()
p = input()
res = []
i = t.find(p)
while i != -1:
    res.append(i + 1)
    i = t.find(p, i + 1)
print(" ".join(map(str, res)) if res else -1)
```
## Решение: регулярное выражение с опережающей проверкой
@time: зависит от реализации @memory: O(число вхождений)
(?=…) не поглощает символы, поэтому находит и перекрывающиеся вхождения.
```python
import re
t = input()
p = input()
res = [m.start() + 1 for m in re.finditer("(?=" + re.escape(p) + ")", t)]
print(*res if res else [-1])
```
## Объяснение
re.escape нужен, если в образце есть символы . * ? и т. п.
## Генератор
```python
import json, random
random.seed(174)
t = ["a\na", "a\nb", "aaaa\naa", "a.b.c\n.", "abc\nabc"]
for _ in range(3):
    text = "".join(random.choice("ab") for _ in range(300))
    t.append(text + "\n" + "".join(random.choice("ab") for _ in range(random.randint(1, 5))))
print(json.dumps(t))
```

# id: task:distinct-substrings
kind: task
title: Количество различных подстрок
category: Строки
level: olympiad
tags: хеширование, суффиксный массив, LCP
related: algo:hashing, algo:string-algorithms
## Условие
Дана строка S. Сколько у неё различных непустых подстрок?
## Входные данные
Строка из строчных латинских букв длиной до 2000.
## Выходные данные
Количество различных подстрок.
## Примеры
```in
abab
```
```out
7
```
## Подсказки
- Подстрок всего n(n+1)/2, но многие совпадают.
- Полиномиальный хеш позволяет сравнивать подстроки по числам.
- Через суффиксный массив: ответ = n(n+1)/2 − сумма LCP соседних суффиксов.
## Решение: множество хешей по длинам
@time: O(n²) @memory: O(n)
Для каждой длины считаем хеши всех подстрок и число различных; два модуля делают коллизии практически невозможными.
```python
s = input().strip()
n = len(s)
M1, M2, B = 1_000_000_007, 998_244_353, 131
h1 = [0] * (n + 1); h2 = [0] * (n + 1)
p1 = [1] * (n + 1); p2 = [1] * (n + 1)
for i, ch in enumerate(s):
    h1[i + 1] = (h1[i] * B + ord(ch)) % M1
    h2[i + 1] = (h2[i] * B + ord(ch)) % M2
    p1[i + 1] = p1[i] * B % M1
    p2[i + 1] = p2[i] * B % M2
total = 0
for L in range(1, n + 1):
    seen = set()
    for i in range(n - L + 1):
        seen.add(((h1[i + L] - h1[i] * p1[L]) % M1) * M2 + (h2[i + L] - h2[i] * p2[L]) % M2)
    total += len(seen)
print(total)
```
## Решение: суффиксный массив и LCP (Касаи)
@time: O(n log² n) @memory: O(n)
Суффиксы сортируются удвоением рангов, LCP соседних — алгоритмом Касаи.
```python
s = input().strip()
n = len(s)
sa = list(range(n))
rank = [ord(c) for c in s]
k = 1
while True:
    key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
    sa.sort(key=key)
    new = [0] * n
    for j in range(1, n):
        new[sa[j]] = new[sa[j - 1]] + (key(sa[j]) != key(sa[j - 1]))
    rank = new
    if rank[sa[-1]] == n - 1:
        break
    k *= 2
lcp_sum = 0
h = 0
for i in range(n):
    if rank[i] > 0:
        j = sa[rank[i] - 1]
        while i + h < n and j + h < n and s[i + h] == s[j + h]:
            h += 1
        lcp_sum += h
        if h:
            h -= 1
    else:
        h = 0
print(n * (n + 1) // 2 - lcp_sum)
```
## Решение: множество подстрок (короткие строки)
@time: O(n³) @memory: O(n³)
```python
s = input().strip()
print(len({s[i:j] for i in range(len(s)) for j in range(i + 1, len(s) + 1)}))
```
## Объяснение
Каждая подстрока — префикс некоторого суффикса; соседние суффиксы в отсортированном порядке делят LCP общих префиксов, которые и вычитаются.
## Генератор
```python
import json, random
random.seed(175)
t = ["a", "aa", "aaaa", "abc", "abcabc"]
for n in (20, 60, 150):
    t.append("".join(random.choice("ab") for _ in range(n)))
print(json.dumps(t))
```

# id: task:tsp-bitmask
kind: task
title: Коммивояжёр (DP по подмножествам)
category: Динамическое программирование
level: olympiad
tags: битовые маски, DP по подмножествам, TSP
related: algo:dp, algo:bits
## Условие
Даны N городов и матрица расстояний. Найдите длину кратчайшего замкнутого маршрута, начинающегося и заканчивающегося в городе 1 и проходящего через каждый город ровно один раз.
## Входные данные
N (1 ≤ N ≤ 13), затем матрица N×N (расстояния от 0 до 10^6).
## Выходные данные
Длина маршрута.
## Примеры
```in
4
0 10 15 20
10 0 35 25
15 35 0 30
20 25 30 0
```
```out
80
```
## Подсказки
- Перебор всех перестановок — (N−1)!, для 13 это ~4.8·10^8.
- dp[mask][v] — кратчайший путь из 1, посетивший множество mask и заканчивающийся в v.
- Переход: dp[mask | 1<<u][u] = min(dp[mask][v] + d[v][u]).
## Решение: DP по подмножествам
@time: O(2^N · N²) @memory: O(2^N · N)
```python
n = int(input())
d = [list(map(int, input().split())) for _ in range(n)]
if n == 1:
    print(0)
else:
    INF = float("inf")
    full = 1 << n
    dp = [[INF] * n for _ in range(full)]
    dp[1][0] = 0
    for mask in range(1, full, 2):
        row = dp[mask]
        for v in range(n):
            cur = row[v]
            if cur == INF:
                continue
            dv = d[v]
            for u in range(n):
                if not mask >> u & 1:
                    nm = mask | 1 << u
                    if cur + dv[u] < dp[nm][u]:
                        dp[nm][u] = cur + dv[u]
    print(min(dp[full - 1][v] + d[v][0] for v in range(1, n)))
```
## Решение: перебор перестановок (N ≤ 9)
@time: O((N−1)! · N) @memory: O(N)
```python
from itertools import permutations
n = int(input())
d = [list(map(int, input().split())) for _ in range(n)]
best = 0 if n == 1 else min(
    d[0][p[0]] + sum(d[p[i]][p[i + 1]] for i in range(n - 2)) + d[p[-1]][0]
    for p in permutations(range(1, n)))
print(best)
```
## Объяснение
Маски перебираются только нечётные — город 1 (бит 0) всегда посещён.
## Генератор
```python
import json, random
random.seed(176)
t = ["1\n0", "2\n0 5\n7 0"]
for n in (3, 5, 7, 8):
    rows = [" ".join("0" if i == j else str(random.randint(1, 100)) for j in range(n)) for i in range(n)]
    t.append("%d\n%s" % (n, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:linear-recurrence
kind: task
title: Трибоначчи для огромных N
category: Теория чисел
level: very_hard
tags: матричное возведение в степень, линейная рекуррента
related: algo:fast-power, algo:matrices
## Условие
T(0) = 0, T(1) = 0, T(2) = 1, T(n) = T(n−1) + T(n−2) + T(n−3). Дано N, выведите T(N) mod 10^9 + 7.
## Входные данные
N (0 ≤ N ≤ 10^18).
## Выходные данные
T(N) по модулю.
## Примеры
```in
10
```
```out
81
```
## Подсказки
- Цикл до 10^18 невозможен.
- Вектор (T(n), T(n−1), T(n−2)) получается из предыдущего умножением на матрицу 3×3.
- Возведите матрицу в степень бинарным алгоритмом — O(27 log N).
## Решение: матрица в степени
@time: O(log N) @memory: O(1)
```python
MOD = 10**9 + 7

def mul(A, B):
    return [[sum(A[i][k] * B[k][j] for k in range(3)) % MOD for j in range(3)] for i in range(3)]

n = int(input())
if n < 3:
    print([0, 0, 1][n])
else:
    R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    M = [[1, 1, 1], [1, 0, 0], [0, 1, 0]]
    e = n - 2
    while e:
        if e & 1:
            R = mul(R, M)
        M = mul(M, M)
        e >>= 1
    print(R[0][0] % MOD)
```
## Решение: цикл с периодом не нужен — удвоение через полиномы
@time: O(log N · k²) @memory: O(k)
Метод Фидуччи: x^N по модулю характеристического многочлена x³ − x² − x − 1, затем подстановка начальных значений.
```python
MOD = 10**9 + 7

def mulmod(a, b):
    res = [0] * 5
    for i in range(3):
        for j in range(3):
            res[i + j] = (res[i + j] + a[i] * b[j]) % MOD
    for d in (4, 3):
        c = res[d]
        if c:
            res[d] = 0
            res[d - 1] = (res[d - 1] + c) % MOD
            res[d - 2] = (res[d - 2] + c) % MOD
            res[d - 3] = (res[d - 3] + c) % MOD
    return res[:3]

n = int(input())
result = [1, 0, 0]
base = [0, 1, 0]
e = n
while e:
    if e & 1:
        result = mulmod(result, base)
    base = mulmod(base, base)
    e >>= 1
init = [0, 0, 1]
print(sum(result[i] * init[i] for i in range(3)) % MOD)
```
## Объяснение
x³ ≡ x² + x + 1 — так старшие степени сводятся к младшим; коэффициенты результата — веса T(0), T(1), T(2).
## Генератор
```python
import json
print(json.dumps(["0", "1", "2", "3", "4", "37", "1000", "1000000000000000000", "123456789012345"]))
```

# id: task:digit-dp
kind: task
title: Числа с заданной суммой цифр
category: Динамическое программирование
level: olympiad
tags: DP по цифрам, digit DP
related: algo:dp, algo:digits
## Условие
Сколько целых чисел X на отрезке [1, N] имеют сумму цифр, равную S?
## Входные данные
N и S (1 ≤ N ≤ 10^18, 1 ≤ S ≤ 162).
## Выходные данные
Количество.
## Примеры
```in
100 10
```
```out
9
```
## Подсказки
- Перебор до 10^18 невозможен.
- Идите по цифрам N слева направо, помня: сумму набранных цифр и «прижаты» ли мы к N.
- Если не прижаты, остальные цифры произвольны — количество считается DP по (позиция, сумма).
## Решение: DP по цифрам с флагом tight
@time: O(L · S · 10) @memory: O(L · S)
```python
from functools import lru_cache
n, s = map(int, input().split())
digits = list(map(int, str(n)))

@lru_cache(maxsize=None)
def go(pos, rest, tight):
    if rest < 0:
        return 0
    if pos == len(digits):
        return 1 if rest == 0 else 0
    limit = digits[pos] if tight else 9
    return sum(go(pos + 1, rest - d, tight and d == limit) for d in range(limit + 1))

print(go(0, s, True))
```
## Решение: таблица «свободных» хвостов
@time: O(L² · S) @memory: O(L · S)
cnt[k][t] — сколько строк из k цифр (с ведущими нулями) имеют сумму t; идём по префиксам N.
```python
n, s = map(int, input().split())
digits = list(map(int, str(n)))
L = len(digits)
cnt = [[0] * (s + 1) for _ in range(L + 1)]
cnt[0][0] = 1
for k in range(1, L + 1):
    for t in range(s + 1):
        cnt[k][t] = sum(cnt[k - 1][t - d] for d in range(10) if t - d >= 0)
ans = 0
used = 0
for i, dig in enumerate(digits):
    for d in range(dig):
        if used + d <= s:
            ans += cnt[L - i - 1][s - used - d]
    used += dig
if used == s:
    ans += 1
print(ans)
```
## Решение: перебор (малые N)
@time: O(N log N) @memory: O(1)
```python
n, s = map(int, input().split())
print(sum(1 for x in range(1, min(n, 200000) + 1) if sum(map(int, str(x))) == s))
```
## Объяснение
Ноль не входит в отрезок, но и не мешает: его сумма цифр 0, а S ≥ 1. Третий способ считает только до 200000 и годится лишь для проверки маленьких тестов.
## Генератор
```python
import json, random
random.seed(177)
t = ["1 1", "9 9", "10 1", "199999 10", "200000 2", "123456 21", "99999 45"]
print(json.dumps(t))
```

# id: task:meet-in-middle
kind: task
title: Подмножества с суммой не больше S
category: Перебор
level: olympiad
tags: meet in the middle, бинарный поиск, подмножества
related: algo:brute-force, algo:binary-search
## Условие
Дано N чисел и число S. Сколько существует подмножеств (включая пустое) с суммой не больше S?
## Входные данные
N и S (1 ≤ N ≤ 34, 0 ≤ S ≤ 10^15), затем N чисел (1 ≤ a_i ≤ 10^13).
## Выходные данные
Количество подмножеств.
## Примеры
```in
3 5
1 2 3
```
```out
7
```
## Подсказки
- 2^34 ≈ 1.7·10^10 подмножеств — полный перебор невозможен.
- Разделите числа пополам: у каждой половины ≤ 2^17 подмножеств.
- Отсортируйте суммы второй половины и для каждой суммы первой ищите bisect_right(S − x).
## Решение: meet in the middle
@time: O(2^(N/2) · N) @memory: O(2^(N/2))
```python
from bisect import bisect_right
n, s = map(int, input().split())
a = list(map(int, input().split()))

def sums(arr):
    res = [0]
    for x in arr:
        res += [v + x for v in res]
    return res

left = sums(a[:n // 2])
right = sorted(sums(a[n // 2:]))
print(sum(bisect_right(right, s - x) for x in left))
```
## Решение: два указателя по отсортированным половинам
@time: O(2^(N/2) log) @memory: O(2^(N/2))
Левая половина по возрастанию, указатель по правой движется только влево.
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))

def sums(arr):
    res = [0]
    for x in arr:
        res += [v + x for v in res]
    return res

left = sorted(sums(a[:n // 2]))
right = sorted(sums(a[n // 2:]))
j = len(right)
total = 0
for x in left:
    while j > 0 and x + right[j - 1] > s:
        j -= 1
    total += j
print(total)
```
## Решение: полный перебор (N ≤ 18)
@time: O(2^N) @memory: O(2^N)
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))
sums = [0]
for x in a:
    sums += [v + x for v in sums]
print(sum(1 for v in sums if v <= s))
```
## Объяснение
Генерация сумм удвоением списка — быстрый способ перебрать все подмножества в Python.
## Генератор
```python
import json, random
random.seed(178)
t = ["1 0\n5", "1 5\n5", "4 100\n1 2 3 4"]
for n in (8, 12, 16):
    a = [random.randint(1, 100) for _ in range(n)]
    t.append("%d %d\n%s" % (n, random.randint(0, sum(a)), " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:zero-one-bfs
kind: task
title: Путь с минимальным числом поворотов
category: Графы
level: very_hard
tags: 0-1 BFS, deque, состояние с направлением
related: algo:bfs, algo:shortest-paths, lib:collections.deque
## Условие
Дано поле N×M: «.» — свободно, «#» — стена. Нужно попасть из S в E, двигаясь по сторонам клеток. Первый шаг бесплатен в любом направлении, каждая смена направления стоит 1. Найдите минимальное число поворотов или −1.
## Входные данные
N и M (до 300), затем N строк поля с одной S и одной E.
## Выходные данные
Минимальное число поворотов или −1.
## Примеры
```in
3 3
S.#
#..
#.E
```
```out
2
```
## Подсказки
- Состояние — (клетка, направление).
- Шаг в том же направлении стоит 0, поворот — 1.
- Для весов 0 и 1 хватает дека: 0-рёбра — в начало, 1-рёбра — в конец.
## Решение: 0-1 BFS
@time: O(N·M·4) @memory: O(N·M·4)
```python
from collections import deque
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S":
            si, sj = i, j
        elif g[i][j] == "E":
            ei, ej = i, j
D = [(0, 1), (1, 0), (0, -1), (-1, 0)]
INF = float("inf")
dist = [[[INF] * 4 for _ in range(m)] for _ in range(n)]
dq = deque()
for d in range(4):
    dist[si][sj][d] = 0
    dq.append((0, si, sj, d))
while dq:
    c, i, j, d = dq.popleft()
    if c > dist[i][j][d]:
        continue
    for nd in range(4):
        ni, nj = i + D[nd][0], j + D[nd][1]
        if not (0 <= ni < n and 0 <= nj < m) or g[ni][nj] == "#":
            continue
        w = 0 if nd == d else 1
        if c + w < dist[ni][nj][nd]:
            dist[ni][nj][nd] = c + w
            if w == 0:
                dq.appendleft((c, ni, nj, nd))
            else:
                dq.append((c + 1, ni, nj, nd))
best = min(dist[ei][ej])
print(best if best != INF else -1)
```
## Решение: Дейкстра по состояниям
@time: O(N·M·4 log) @memory: O(N·M·4)
```python
import heapq
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S":
            s = (i, j)
        elif g[i][j] == "E":
            e = (i, j)
D = [(0, 1), (1, 0), (0, -1), (-1, 0)]
best = {}
heap = [(0, s[0], s[1], d) for d in range(4)]
ans = -1
while heap:
    c, i, j, d = heapq.heappop(heap)
    if (i, j, d) in best:
        continue
    best[(i, j, d)] = c
    if (i, j) == e:
        ans = c
        break
    for nd, (di, dj) in enumerate(D):
        ni, nj = i + di, j + dj
        if 0 <= ni < n and 0 <= nj < m and g[ni][nj] != "#" and (ni, nj, nd) not in best:
            heapq.heappush(heap, (c + (nd != d), ni, nj, nd))
print(ans)
```
## Объяснение
0-1 BFS — частный случай Дейкстры, где очередь с приоритетом заменяется деком.
## Генератор
```python
import json, random
random.seed(179)
t = ["1 2\nSE", "1 3\nS#E", "3 3\nS..\n.#.\n..E"]
for _ in range(4):
    n, m = random.randint(2, 10), random.randint(2, 10)
    g = [["#" if random.random() < 0.25 else "." for _ in range(m)] for _ in range(n)]
    a, b = random.sample([(i, j) for i in range(n) for j in range(m)], 2)
    g[a[0]][a[1]] = "S"; g[b[0]][b[1]] = "E"
    t.append("%d %d\n%s" % (n, m, "\n".join("".join(r) for r in g)))
print(json.dumps(t))
```

# id: task:scc
kind: task
title: Компоненты сильной связности
category: Графы
level: very_hard
tags: Косарайю, Тарьян, сильная связность
related: algo:dfs, algo:graphs
## Условие
Дан ориентированный граф из N вершин и M рёбер. Найдите количество компонент сильной связности (внутри компоненты из любой вершины достижима любая).
## Входные данные
N и M (до 10^5), затем M строк «u v».
## Выходные данные
Количество компонент.
## Примеры
```in
5 5
1 2
2 3
3 1
3 4
4 5
```
```out
3
```
## Подсказки
- Алгоритм Косарайю: DFS по графу запоминает порядок выхода вершин.
- Затем DFS по транспонированному графу в обратном порядке выхода — каждый запуск даёт компоненту.
- Используйте итеративный DFS, чтобы не переполнить стек.
## Решение: Косарайю (итеративно)
@time: O(N + M) @memory: O(N + M)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
rg = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append(v)
    rg[v].append(u)
seen = [False] * (n + 1)
order = []
for s in range(1, n + 1):
    if seen[s]:
        continue
    seen[s] = True
    stack = [(s, 0)]
    while stack:
        v, i = stack.pop()
        if i < len(g[v]):
            stack.append((v, i + 1))
            u = g[v][i]
            if not seen[u]:
                seen[u] = True
                stack.append((u, 0))
        else:
            order.append(v)
comp = [0] * (n + 1)
count = 0
for s in reversed(order):
    if comp[s]:
        continue
    count += 1
    comp[s] = count
    stack = [s]
    while stack:
        v = stack.pop()
        for u in rg[v]:
            if not comp[u]:
                comp[u] = count
                stack.append(u)
print(count)
```
## Решение: Тарьян (итеративно)
@time: O(N + M) @memory: O(N + M)
low[v] — минимальный индекс, достижимый из поддерева v; корень компоненты — вершина с low == index.
```python
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
index = [0] * (n + 1)
low = [0] * (n + 1)
on_stack = [False] * (n + 1)
st = []
counter = 1
count = 0
for s in range(1, n + 1):
    if index[s]:
        continue
    work = [(s, 0)]
    index[s] = low[s] = counter
    counter += 1
    st.append(s)
    on_stack[s] = True
    while work:
        v, i = work[-1]
        if i < len(g[v]):
            work[-1] = (v, i + 1)
            u = g[v][i]
            if not index[u]:
                index[u] = low[u] = counter
                counter += 1
                st.append(u)
                on_stack[u] = True
                work.append((u, 0))
            elif on_stack[u]:
                low[v] = min(low[v], index[u])
        else:
            work.pop()
            if work:
                p = work[-1][0]
                low[p] = min(low[p], low[v])
            if low[v] == index[v]:
                count += 1
                while True:
                    x = st.pop()
                    on_stack[x] = False
                    if x == v:
                        break
print(count)
```
## Объяснение
Оба алгоритма линейны; Тарьян обходится одним проходом, Косарайю проще для понимания.
## Генератор
```python
import json, random
random.seed(180)
t = ["1 0", "2 2\n1 2\n2 1", "3 0"]
for _ in range(4):
    n = random.randint(2, 20); m = random.randint(0, 35)
    t.append("%d %d\n%s" % (n, m, "\n".join("%d %d" % (random.randint(1, n), random.randint(1, n)) for _ in range(m))))
print(json.dumps(t))
```

# id: task:bridges
kind: task
title: Мосты в графе
category: Графы
level: olympiad
tags: мосты, время входа, low-link
related: algo:dfs, algo:graphs
## Условие
Дан связный неориентированный граф без кратных рёбер и петель. Мост — ребро, после удаления которого граф становится несвязным. Выведите количество мостов.
## Входные данные
N и M (до 10^5), затем M строк «u v».
## Выходные данные
Количество мостов.
## Примеры
```in
5 5
1 2
2 3
3 1
3 4
4 5
```
```out
2
```
## Подсказки
- В дереве DFS ребро (v → u) — мост, если из поддерева u нельзя подняться выше u.
- tin[v] — время входа, low[v] — минимальное tin, достижимое из поддерева v одним обратным ребром.
- Ребро — мост ⇔ low[u] > tin[v].
## Решение: low-link итеративно
@time: O(N + M) @memory: O(N + M)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append((v, i))
    g[v].append((u, i))
tin = [0] * (n + 1)
low = [0] * (n + 1)
timer = 1
bridges = 0
for s in range(1, n + 1):
    if tin[s]:
        continue
    tin[s] = low[s] = timer
    timer += 1
    stack = [(s, -1, 0)]
    while stack:
        v, pe, i = stack[-1]
        if i < len(g[v]):
            stack[-1] = (v, pe, i + 1)
            u, eid = g[v][i]
            if eid == pe:
                continue
            if tin[u]:
                low[v] = min(low[v], tin[u])
            else:
                tin[u] = low[u] = timer
                timer += 1
                stack.append((u, eid, 0))
        else:
            stack.pop()
            if stack:
                p = stack[-1][0]
                low[p] = min(low[p], low[v])
                if low[v] > tin[p]:
                    bridges += 1
print(bridges)
```
## Решение: удаление каждого ребра (малые графы)
@time: O(M·(N + M)) @memory: O(N + M)
```python
n, m = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]

def connected(skip):
    g = [[] for _ in range(n + 1)]
    for k, (u, v) in enumerate(edges):
        if k != skip:
            g[u].append(v)
            g[v].append(u)
    seen = {1}
    stack = [1]
    while stack:
        x = stack.pop()
        for y in g[x]:
            if y not in seen:
                seen.add(y)
                stack.append(y)
    return len(seen) == n

print(sum(1 for k in range(m) if not connected(k)))
```
## Объяснение
Номер ребра (eid) вместо номера родителя позволяет корректно работать и с кратными рёбрами.
## Генератор
```python
import json, random
random.seed(181)
t = ["1 0", "2 1\n1 2"]
for _ in range(5):
    n = random.randint(2, 15)
    edges = set()
    for i in range(2, n + 1):
        edges.add((random.randint(1, i - 1), i))
    for _ in range(random.randint(0, n)):
        u, v = sorted(random.sample(range(1, n + 1), 2)); edges.add((u, v))
    edges = list(edges)
    t.append("%d %d\n%s" % (n, len(edges), "\n".join("%d %d" % e for e in edges)))
print(json.dumps(t))
```

# id: task:weighted-intervals
kind: task
title: Заказы с максимальной прибылью
category: Динамическое программирование
level: very_hard
tags: взвешенный выбор интервалов, DP, бинарный поиск
related: algo:dp, algo:binary-search
## Условие
Есть N заказов: заказ i выполняется с момента s_i до e_i (не включая e_i) и приносит прибыль p_i. Одновременно можно выполнять только один заказ. Найдите максимальную прибыль.
## Входные данные
N (до 2·10^5), затем N строк «s e p» (s < e, p > 0).
## Выходные данные
Максимальная прибыль.
## Примеры
```in
4
1 3 50
2 5 20
3 10 100
6 19 200
```
```out
250
```
## Подсказки
- Отсортируйте заказы по концу.
- dp[i] — лучшая прибыль среди первых i заказов.
- dp[i] = max(dp[i−1], p_i + dp[j]), где j — число заказов, заканчивающихся не позже s_i (bisect).
## Решение: DP + бинарный поиск
@time: O(N log N) @memory: O(N)
```python
from bisect import bisect_right
n = int(input())
jobs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda j: j[1])
ends = [e for _, e, _ in jobs]
dp = [0] * (n + 1)
for i, (s, e, p) in enumerate(jobs, 1):
    j = bisect_right(ends, s, 0, i - 1)
    dp[i] = max(dp[i - 1], dp[j] + p)
print(dp[n])
```
## Решение: события по времени
@time: O(N log N) @memory: O(N)
Идём по моментам времени; best — лучшая прибыль к текущему моменту, при начале заказа «откладываем» результат к его концу.
```python
import heapq
n = int(input())
jobs = sorted(tuple(map(int, input().split())) for _ in range(n))
best = 0
pending = []
for s, e, p in jobs:
    while pending and pending[0][0] <= s:
        best = max(best, heapq.heappop(pending)[1])
    heapq.heappush(pending, (e, best + p))
while pending:
    best = max(best, heapq.heappop(pending)[1])
print(best)
```
## Решение: перебор подмножеств (малые N)
@time: O(2^N · N log N) @memory: O(N)
```python
n = int(input())
jobs = [tuple(map(int, input().split())) for _ in range(n)]
best = 0
for mask in range(1 << n):
    chosen = sorted(jobs[i] for i in range(n) if mask >> i & 1)
    if all(chosen[k][1] <= chosen[k + 1][0] for k in range(len(chosen) - 1)):
        best = max(best, sum(p for _, _, p in chosen))
print(best)
```
## Объяснение
Второй способ сортирует по началу и хранит в куче «результаты, доступные после момента e».
## Генератор
```python
import json, random
random.seed(182)
t = ["1\n1 2 5"]
for _ in range(5):
    n = random.randint(1, 10)
    rows = []
    for _ in range(n):
        s = random.randint(0, 20); rows.append("%d %d %d" % (s, s + random.randint(1, 8), random.randint(1, 50)))
    t.append("%d\n%s" % (n, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:inclusion-exclusion
kind: task
title: Делится хотя бы на одно
category: Комбинаторика
level: very_hard
tags: включения-исключения, НОК, подмножества
related: algo:combinatorics, algo:gcd-lcm, algo:bits
## Условие
Даны N и K различных натуральных чисел d_1..d_K. Сколько чисел от 1 до N делится хотя бы на одно из d_i?
## Входные данные
N и K (1 ≤ N ≤ 10^18, 1 ≤ K ≤ 15), затем K чисел (2 ≤ d_i ≤ 10^18).
## Выходные данные
Количество.
## Примеры
```in
30 3
2 3 5
```
```out
22
```
## Подсказки
- Количество кратных d на [1, N] — N // d.
- Сумма N // d_i считает числа, делящиеся на несколько d, многократно.
- Формула включений-исключений: по всем непустым подмножествам со знаком (−1)^(|S|+1), делитель — НОК подмножества.
## Решение: перебор подмножеств
@time: O(2^K · K log) @memory: O(1)
```python
from math import lcm
n, k = map(int, input().split())
d = list(map(int, input().split()))
total = 0
for mask in range(1, 1 << k):
    l = 1
    bits = 0
    for i in range(k):
        if mask >> i & 1:
            l = lcm(l, d[i])
            bits += 1
            if l > n:
                break
    if l <= n:
        total += n // l if bits % 2 else -(n // l)
print(total)
```
## Решение: рекурсия с отсечением
@time: до O(2^K) @memory: O(K)
Рекурсивно добавляем делители; ветви с НОК > N сразу отбрасываем.
```python
from math import lcm
n, k = map(int, input().split())
d = sorted(map(int, input().split()))

def go(i, cur, sign):
    total = 0
    for j in range(i, k):
        l = lcm(cur, d[j])
        if l <= n:
            total += sign * (n // l) + go(j + 1, l, -sign)
    return total

print(go(0, 1, 1))
```
## Решение: прямой подсчёт (малые N)
@time: O(N · K) @memory: O(1)
```python
n, k = map(int, input().split())
d = list(map(int, input().split()))
print(sum(1 for x in range(1, n + 1) if any(x % v == 0 for v in d)))
```
## Объяснение
Если НОК подмножества больше N, то и любые надмножества дают 0 — это позволяет отсекать перебор.
## Генератор
```python
import json, random
random.seed(183)
t = ["1 1\n2", "10 1\n10", "100 2\n4 6"]
for _ in range(4):
    k = random.randint(1, 6)
    t.append("%d %d\n%s" % (random.randint(1, 5000), k, " ".join(map(str, random.sample(range(2, 40), k)))))
print(json.dumps(t))
```

# id: task:crt
kind: task
title: Китайская теорема об остатках
category: Теория чисел
level: olympiad
tags: КТО, сравнения, расширенный Евклид
related: algo:modular, algo:gcd-lcm
## Условие
Даны K сравнений x ≡ a_i (mod m_i) (модули не обязательно взаимно просты). Найдите наименьшее неотрицательное x, удовлетворяющее всем, или −1, если решений нет.
## Входные данные
K (1 ≤ K ≤ 10), затем K строк «a m» (0 ≤ a < m ≤ 10^9).
## Выходные данные
x или −1.
## Примеры
```in
3
2 3
3 5
2 7
```
```out
23
```
## Подсказки
- Объединяйте сравнения по два.
- x = a1 + m1·t; нужно m1·t ≡ a2 − a1 (mod m2) — решается, если gcd(m1, m2) делит разность.
- Новый модуль — lcm(m1, m2).
## Решение: последовательное объединение
@time: O(K log M) @memory: O(1)
```python
from math import gcd
k = int(input())
x, mod = 0, 1
ok = True
for _ in range(k):
    a, m = map(int, input().split())
    g = gcd(mod, m)
    if (a - x) % g:
        ok = False
        break
    m_g = m // g
    t = (a - x) // g * pow(mod // g, -1, m_g) % m_g if m_g > 1 else 0
    x += mod * t
    mod = mod // g * m
    x %= mod
print(x if ok else -1)
```
## Решение: перебор шагом по большему модулю (малые модули)
@time: O(lcm / max m) @memory: O(1)
Проверяем кандидатов вида a_max + k·m_max до НОК всех модулей.
```python
from math import lcm
k = int(input())
eqs = [tuple(map(int, input().split())) for _ in range(k)]
a0, m0 = max(eqs, key=lambda e: e[1])
L = lcm(*(m for _, m in eqs))
ans = -1
for x in range(a0, L, m0):
    if all(x % m == a for a, m in eqs):
        ans = x
        break
print(ans)
```
## Объяснение
Решение, если существует, единственно по модулю НОК всех модулей.
## Генератор
```python
import json, random
random.seed(184)
t = ["1\n0 1", "2\n1 2\n0 4", "2\n1 4\n3 6", "2\n0 6\n3 9"]
for _ in range(4):
    k = random.randint(1, 4)
    x = random.randint(0, 10**5)
    rows = []
    for _ in range(k):
        m = random.randint(1, 40); rows.append("%d %d" % (x % m if random.random() < 0.8 else random.randint(0, m - 1), m))
    t.append("%d\n%s" % (k, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:convex-hull
kind: task
title: Выпуклая оболочка
category: Геометрия
level: olympiad
tags: выпуклая оболочка, алгоритм Эндрю, векторное произведение
related: algo:geometry
## Условие
Дано N точек на плоскости. Найдите количество вершин их выпуклой оболочки (точки, лежащие на сторонах, не считаются вершинами) и удвоенную площадь оболочки.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N строк «x y» (целые, по модулю до 10^9).
## Выходные данные
Количество вершин и удвоенная площадь.
## Примеры
```in
6
0 0
4 0
4 4
0 4
2 2
2 0
```
```out
4 32
```
## Подсказки
- Отсортируйте точки по (x, y).
- Алгоритм Эндрю строит нижнюю и верхнюю цепочки, удаляя точки, где нет поворота налево.
- Удвоенная площадь — формула шнурования по вершинам оболочки (целое число).
## Решение: монотонная цепочка Эндрю
@time: O(N log N) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n = int(data[0])
pts = sorted(set((int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(n)))

def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

if len(pts) <= 2:
    hull = pts
else:
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
area2 = abs(sum(hull[i][0] * hull[(i + 1) % len(hull)][1] - hull[(i + 1) % len(hull)][0] * hull[i][1] for i in range(len(hull)))) if len(hull) >= 3 else 0
print(len(hull), area2)
```
## Решение: обход Джарвиса
@time: O(N·H) @memory: O(N)
«Заворачиваем подарок»: из текущей вершины ищем точку, относительно которой все остальные слева; при коллинеарности — самую дальнюю.
```python
n = int(input())
pts = sorted(set(tuple(map(int, input().split())) for _ in range(n)))

def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def d2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

if len(pts) <= 2:
    hull = pts
else:
    hull = []
    start = pts[0]
    cur = start
    while True:
        hull.append(cur)
        cand = pts[0] if pts[0] != cur else pts[1]
        for p in pts:
            if p == cur:
                continue
            c = cross(cur, cand, p)
            if c < 0 or (c == 0 and d2(cur, p) > d2(cur, cand)):
                cand = p
        cur = cand
        if cur == start:
            break
    if len(hull) == 2 or all(cross(hull[0], hull[1], p) == 0 for p in pts):
        hull = [pts[0], pts[-1]]
area2 = abs(sum(hull[i][0] * hull[(i + 1) % len(hull)][1] - hull[(i + 1) % len(hull)][0] * hull[i][1] for i in range(len(hull)))) if len(hull) >= 3 else 0
print(len(hull), area2)
```
## Объяснение
Если все точки на одной прямой, оболочка — отрезок из двух точек с нулевой площадью.
## Генератор
```python
import json, random
random.seed(185)
t = ["1\n5 5", "2\n0 0\n1 1", "3\n0 0\n1 1\n2 2", "3\n0 0\n1 0\n0 1", "4\n0 0\n0 0\n1 0\n1 0"]
for _ in range(4):
    n = random.randint(3, 40)
    t.append("%d\n%s" % (n, "\n".join("%d %d" % (random.randint(-10, 10), random.randint(-10, 10)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:nim
kind: task
title: Игра Ним
category: Теория игр
level: very_hard
tags: Ним, XOR, функция Шпрага–Гранди
related: algo:bits, algo:games
## Условие
Есть N кучек камней. Двое ходят по очереди: за ход можно взять любое положительное число камней из одной кучки. Проигрывает тот, кто не может сделать ход. Кто победит при оптимальной игре — First или Second?
## Входные данные
N (до 10^5), затем N чисел (0 ≤ a_i ≤ 10^18).
## Выходные данные
First или Second.
## Примеры
```in
3
3 4 5
```
```out
First
```
## Подсказки
- Попробуйте маленькие случаи: одна кучка, две равные кучки.
- Теорема Бутона: позиция проигрышная ⇔ XOR размеров кучек равен 0.
- Из позиции с XOR ≠ 0 всегда есть ход в позицию с XOR = 0.
## Решение: XOR размеров
@time: O(N) @memory: O(1)
```python
input()
x = 0
for a in map(int, input().split()):
    x ^= a
print("First" if x else "Second")
```
## Решение: перебор позиций с памятью (малые кучки)
@time: O(Π(a_i+1) · Σa_i) @memory: O(Π(a_i+1))
Позиция выигрышная, если есть ход в проигрышную.
```python
from functools import lru_cache
input()
piles = tuple(sorted(map(int, input().split())))

@lru_cache(maxsize=None)
def win(state):
    for i, a in enumerate(state):
        for take in range(1, a + 1):
            nxt = tuple(sorted(state[:i] + (a - take,) + state[i + 1:]))
            if not win(nxt):
                return True
    return False

print("First" if win(piles) else "Second")
```
## Объяснение
Перебор на маленьких кучках подтверждает теорему Бутона; в генераторе тестов размеры небольшие.
## Генератор
```python
import json, random
random.seed(186)
t = ["1\n0", "1\n7", "2\n3 3", "2\n1 2"]
for _ in range(4):
    n = random.randint(1, 4)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 6)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:subtraction-game
kind: task
title: Игра с вычитанием
category: Теория игр
level: olympiad
tags: функция Гранди, mex, теория игр
related: algo:games, algo:dp
## Условие
Есть N кучек. За ход из одной кучки можно взять ровно s камней, где s — одно из чисел множества S. Проигрывает тот, кто не может сходить. Кто победит — First или Second?
## Входные данные
N и K, затем N размеров кучек (до 10^5 каждая), затем K различных чисел множества S (1 ≤ s ≤ 100).
## Выходные данные
First или Second.
## Примеры
```in
2 2
3 5
1 2
```
```out
First
```
## Подсказки
- Каждая кучка — отдельная игра; сумма игр анализируется через функции Гранди.
- g(x) = mex{g(x − s) : s ∈ S, s ≤ x} (mex — минимальное неотрицательное число, которого нет в множестве).
- Первый выигрывает ⇔ XOR g(a_i) ≠ 0.
## Решение: функция Гранди
@time: O(max a · K) @memory: O(max a)
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
S = list(map(int, input().split()))
top = max(a)
g = [0] * (top + 1)
for x in range(1, top + 1):
    seen = {g[x - s] for s in S if s <= x}
    m = 0
    while m in seen:
        m += 1
    g[x] = m
r = 0
for v in a:
    r ^= g[v]
print("First" if r else "Second")
```
## Решение: перебор позиций (малые кучки)
@time: экспоненциально @memory: O(состояний)
```python
from functools import lru_cache
n, k = map(int, input().split())
a = tuple(sorted(map(int, input().split())))
S = list(map(int, input().split()))

@lru_cache(maxsize=None)
def win(state):
    for i, x in enumerate(state):
        for s in S:
            if s <= x:
                nxt = tuple(sorted(state[:i] + (x - s,) + state[i + 1:]))
                if not win(nxt):
                    return True
    return False

print("First" if win(a) else "Second")
```
## Объяснение
Теорема Шпрага–Гранди: сумма игр проигрышная ⇔ XOR значений Гранди равен 0.
## Генератор
```python
import json, random
random.seed(187)
t = ["1 1\n0\n1", "1 1\n1\n1", "2 1\n2 2\n1"]
for _ in range(5):
    n = random.randint(1, 3); k = random.randint(1, 3)
    t.append("%d %d\n%s\n%s" % (n, k, " ".join(str(random.randint(0, 12)) for _ in range(n)), " ".join(map(str, random.sample(range(1, 6), k)))))
print(json.dumps(t))
```
