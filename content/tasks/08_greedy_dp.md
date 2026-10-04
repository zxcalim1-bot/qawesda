# id: task:activity-selection
kind: task
title: Максимум непересекающихся занятий
category: Жадные алгоритмы
level: medium
tags: жадный, отрезки, сортировка по концу
related: algo:greedy, algo:sorting
## Условие
Дано N занятий с временем начала s и конца e. Одновременно можно посещать только одно занятие; следующее может начаться в момент окончания предыдущего. Какое наибольшее число занятий можно посетить?
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N строк «s e» (s < e).
## Выходные данные
Максимальное количество занятий.
## Примеры
```in
4
1 3
2 5
3 9
6 8
```
```out
2
```
## Подсказки
- Выбирать самое короткое или самое раннее по началу — неверно.
- Выгоднее всего то занятие, которое раньше всех заканчивается.
- Отсортируйте по концу и берите каждое, начинающееся не раньше конца последнего выбранного.
## Решение: жадный по концу
@time: O(N log N) @memory: O(N)
```python
n = int(input())
segs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda p: p[1])
count = 0
end = float("-inf")
for s, e in segs:
    if s >= end:
        count += 1
        end = e
print(count)
```
## Решение: динамика по отсортированным концам
@time: O(N log N) @memory: O(N)
dp[i] — ответ для первых i занятий (по концу); для i-го ищем бинарным поиском последнее совместимое.
```python
from bisect import bisect_right
n = int(input())
segs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda p: p[1])
ends = [e for _, e in segs]
dp = [0] * (n + 1)
for i, (s, e) in enumerate(segs, 1):
    j = bisect_right(ends, s, 0, i - 1)
    dp[i] = max(dp[i - 1], dp[j] + 1)
print(dp[n])
```
## Объяснение
Жадный выбор оставляет максимум свободного времени для остальных занятий; динамика подтверждает тот же ответ и обобщается на занятия с весами.
## Генератор
```python
import json, random
random.seed(111)
t = ["1\n1 2", "3\n1 2\n2 3\n3 4", "3\n1 10\n2 3\n4 5"]
for _ in range(4):
    n = random.randint(1, 60)
    segs = []
    for _ in range(n):
        s = random.randint(0, 100); segs.append("%d %d" % (s, s + random.randint(1, 20)))
    t.append("%d\n%s" % (n, "\n".join(segs)))
print(json.dumps(t))
```

# id: task:max-overlap
kind: task
title: Сколько нужно залов
category: Жадные алгоритмы
level: medium
tags: события, максимум пересечений, куча
related: algo:greedy, algo:heap
## Условие
Дано N встреч [s, e). Какое минимальное число залов нужно, чтобы провести все встречи? Встреча, заканчивающаяся в момент t, освобождает зал для встречи, начинающейся в t.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N строк «s e» (s < e).
## Выходные данные
Минимальное число залов.
## Примеры
```in
3
0 30
5 10
15 20
```
```out
2
```
## Подсказки
- Ответ — максимальное число встреч, идущих одновременно.
- Отсортируйте события: начало +1, конец −1 (конец раньше начала при равном времени).
- Или: куча с концами занятых залов.
## Решение: сканирование событий
@time: O(N log N) @memory: O(N)
```python
n = int(input())
ev = []
for _ in range(n):
    s, e = map(int, input().split())
    ev.append((s, 1))
    ev.append((e, -1))
ev.sort()
cur = best = 0
for _, d in ev:
    cur += d
    best = max(best, cur)
print(best)
```
## Решение: куча концов
@time: O(N log N) @memory: O(N)
Освободившийся зал (самый ранний конец ≤ s) переиспользуем.
```python
import heapq
n = int(input())
meetings = sorted(tuple(map(int, input().split())) for _ in range(n))
heap = []
for s, e in meetings:
    if heap and heap[0] <= s:
        heapq.heapreplace(heap, e)
    else:
        heapq.heappush(heap, e)
print(len(heap))
```
## Объяснение
При сортировке кортежей (t, −1) идёт раньше (t, 1) — конец обрабатывается до начала.
## Генератор
```python
import json, random
random.seed(112)
t = ["1\n0 1", "2\n0 5\n5 10", "3\n0 10\n0 10\n0 10"]
for _ in range(4):
    n = random.randint(1, 60)
    segs = []
    for _ in range(n):
        s = random.randint(0, 50); segs.append("%d %d" % (s, s + random.randint(1, 15)))
    t.append("%d\n%s" % (n, "\n".join(segs)))
print(json.dumps(t))
```

# id: task:fractional-knapsack
kind: task
title: Непрерывный рюкзак
category: Жадные алгоритмы
level: medium
tags: жадный, удельная ценность, рюкзак
related: algo:greedy, algo:knapsack
## Условие
Есть N сыпучих товаров: у i-го вес w_i и стоимость c_i, товар можно брать частично. Рюкзак вмещает вес W. Найдите максимальную стоимость с точностью 3 знака после точки.
## Входные данные
N и W (1 ≤ N ≤ 10^5, 0 ≤ W ≤ 10^9), затем N строк «c w» (1 ≤ w).
## Выходные данные
Максимальная стоимость с тремя знаками после точки.
## Примеры
```in
3 50
60 20
100 50
120 30
```
```out
180.000
```
## Подсказки
- Важна цена за единицу веса: c / w.
- Берите товары в порядке убывания удельной стоимости.
- Последний товар берите частично — сколько поместится.
## Решение: сортировка по c/w
@time: O(N log N) @memory: O(N)
```python
n, W = map(int, input().split())
items = [tuple(map(int, input().split())) for _ in range(n)]
items.sort(key=lambda it: it[0] / it[1], reverse=True)
total = 0.0
for c, w in items:
    if W <= 0:
        break
    take = min(w, W)
    total += c * take / w
    W -= take
print(f"{total:.3f}")
```
## Решение: точные дроби
@time: O(N log N) @memory: O(N)
Fraction избавляет от ошибок округления при сравнении и суммировании.
```python
from fractions import Fraction
n, W = map(int, input().split())
items = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda it: Fraction(it[0], it[1]), reverse=True)
total = Fraction(0)
for c, w in items:
    take = min(w, W)
    total += Fraction(c * take, w)
    W -= take
    if W == 0:
        break
print(f"{float(total):.3f}")
```
## Объяснение
Для непрерывного рюкзака жадный алгоритм оптимален; для рюкзака «0/1» — нет, там нужна динамика.
## Генератор
```python
import json, random
random.seed(113)
t = ["1 0\n10 5", "1 100\n10 5", "2 3\n5 2\n5 2"]
for _ in range(4):
    n = random.randint(1, 30)
    t.append("%d %d\n%s" % (n, random.randint(0, 200), "\n".join("%d %d" % (random.randint(1, 100), random.randint(1, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:jump-game
kind: task
title: Прыжки по массиву
category: Жадные алгоритмы
level: medium
tags: жадный, достижимость, максимальный прыжок
related: algo:greedy, algo:dp
## Условие
Дан массив из N неотрицательных чисел. Стоя на позиции i, можно прыгнуть вперёд на любое расстояние от 1 до a_i. Начиная с позиции 1, можно ли добраться до позиции N? Если да — выведите минимальное число прыжков, иначе −1.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Минимальное число прыжков или −1.
## Примеры
```in
5
2 3 1 1 4
```
```out
2
```
```in
5
3 2 1 0 4
```
```out
-1
```
## Подсказки
- Представьте прыжки как BFS по уровням: уровень k — позиции, достижимые за k прыжков.
- Уровни — подряд идущие отрезки позиций.
- Для текущего отрезка вычислите самую дальнюю достижимую позицию — это конец следующего отрезка.
## Решение: жадный BFS по отрезкам
@time: O(N) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
jumps = 0
cur_end = 0
farthest = 0
ans = 0 if n == 1 else -1
for i in range(n - 1):
    if i > farthest:
        break
    farthest = max(farthest, i + a[i])
    if i == cur_end:
        jumps += 1
        cur_end = farthest
        if cur_end >= n - 1:
            ans = jumps
            break
print(ans)
```
## Решение: динамика (малые N)
@time: O(N·max a) @memory: O(N)
dp[i] — минимальное число прыжков до позиции i.
```python
n = int(input())
a = list(map(int, input().split()))
INF = float("inf")
dp = [INF] * n
dp[0] = 0
for i in range(n):
    if dp[i] == INF:
        continue
    for j in range(i + 1, min(n, i + a[i] + 1)):
        if dp[i] + 1 < dp[j]:
            dp[j] = dp[i] + 1
print(dp[-1] if dp[-1] != INF else -1)
```
## Объяснение
Если позиция i не достижима (i > farthest), дальше двигаться невозможно.
## Генератор
```python
import json, random
random.seed(114)
t = ["1\n0", "2\n0 5", "2\n1 0", "3\n1 1 1"]
for _ in range(4):
    n = random.randint(1, 80)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 4)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:boats
kind: task
title: Лодки для туристов
category: Жадные алгоритмы
level: medium
tags: жадный, два указателя, пары
related: algo:greedy, algo:two-pointers
## Условие
Есть N туристов с весами w_i и лодки грузоподъёмностью L. В лодку садятся не больше двух человек с суммарным весом не больше L (каждый турист весит не больше L). Найдите минимальное число лодок.
## Входные данные
N и L (1 ≤ N ≤ 2·10^5), затем N весов.
## Выходные данные
Минимальное число лодок.
## Примеры
```in
4 3
3 2 2 1
```
```out
3
```
## Подсказки
- Самого тяжёлого туриста выгоднее всего сажать с самым лёгким.
- Отсортируйте веса и ставьте указатели на концы.
- Если пара помещается — сажаем обоих, иначе только тяжёлого.
## Решение: два указателя
@time: O(N log N) @memory: O(N)
```python
n, L = map(int, input().split())
w = sorted(map(int, input().split()))
i, j = 0, n - 1
boats = 0
while i <= j:
    if w[i] + w[j] <= L:
        i += 1
    j -= 1
    boats += 1
print(boats)
```
## Решение: перебор паросочетаний (малые N)
@time: экспоненциально @memory: O(N)
Рекурсия: первый турист едет один или с кем-то, кто с ним помещается.
```python
from functools import lru_cache
n, L = map(int, input().split())
w = tuple(sorted(map(int, input().split())))

@lru_cache(maxsize=None)
def best(rest):
    if not rest:
        return 0
    first, others = rest[0], rest[1:]
    res = 1 + best(others)
    for k in range(len(others)):
        if first + others[k] <= L:
            res = min(res, 1 + best(others[:k] + others[k + 1:]))
    return res

print(best(w))
```
## Объяснение
Перебор подтверждает оптимальность жадного выбора на небольших тестах.
## Генератор
```python
import json, random
random.seed(115)
t = ["1 5\n5", "2 5\n2 3", "3 5\n3 3 3"]
for _ in range(4):
    n = random.randint(1, 9); L = random.randint(5, 20)
    t.append("%d %d\n%s" % (n, L, " ".join(str(random.randint(1, L)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:stairs-ways
kind: task
title: Лестница: число способов
category: Динамическое программирование
level: easy
tags: DP, Фибоначчи, ступеньки
related: algo:dp
## Условие
По лестнице из N ступенек можно подниматься на 1 или 2 ступеньки за шаг. Сколькими способами можно подняться на вершину? Ответ выведите по модулю 10^9 + 7.
## Входные данные
N (1 ≤ N ≤ 10^6).
## Выходные данные
Количество способов по модулю 10^9 + 7.
## Примеры
```in
4
```
```out
5
```
## Подсказки
- На ступеньку N можно прийти с N−1 или с N−2.
- ways[N] = ways[N−1] + ways[N−2], ways[0] = ways[1] = 1.
- Хранить весь массив не обязательно — хватит двух чисел.
## Решение: динамика на двух переменных
@time: O(N) @memory: O(1)
```python
n = int(input())
MOD = 10**9 + 7
a, b = 1, 1
for _ in range(n - 1):
    a, b = b, (a + b) % MOD
print(b)
```
## Решение: массив dp
@time: O(N) @memory: O(N)
```python
n = int(input())
MOD = 10**9 + 7
dp = [0] * (n + 1)
dp[0] = dp[1] = 1
for i in range(2, n + 1):
    dp[i] = (dp[i - 1] + dp[i - 2]) % MOD
print(dp[n])
```
## Решение: возведение матрицы в степень
@time: O(log N) @memory: O(1)
[[1,1],[1,0]]^N даёт числа Фибоначчи; ответ — F(N+1).
```python
MOD = 10**9 + 7

def mul(A, B):
    return [[(A[0][0] * B[0][0] + A[0][1] * B[1][0]) % MOD, (A[0][0] * B[0][1] + A[0][1] * B[1][1]) % MOD],
            [(A[1][0] * B[0][0] + A[1][1] * B[1][0]) % MOD, (A[1][0] * B[0][1] + A[1][1] * B[1][1]) % MOD]]

n = int(input())
R = [[1, 0], [0, 1]]
M = [[1, 1], [1, 0]]
k = n
while k:
    if k & 1:
        R = mul(R, M)
    M = mul(M, M)
    k >>= 1
print((R[0][0]) % MOD)
```
## Объяснение
Количество способов — число Фибоначчи F(N+1), а матрица M^N = [[F(N+1), F(N)], [F(N), F(N−1)]].
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "10", "50", "1000", "1000000"]))
```

# id: task:min-cost-stairs
kind: task
title: Лестница с минимальной стоимостью
category: Динамическое программирование
level: easy
tags: DP, минимум, ступеньки
related: algo:dp
## Условие
На ступеньке i лежит число c_i — плата за то, что вы на неё встали. Начинаете на «нулевой» ступеньке (перед лестницей, бесплатно), шаг — на 1 или 2 ступеньки. Нужно оказаться на ступеньке N (последней, её плата тоже учитывается). Найдите минимальную сумму платы.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел c_i (−10^4 ≤ c_i ≤ 10^4).
## Выходные данные
Минимальная сумма.
## Примеры
```in
5
1 -3 4 2 5
```
```out
4
```
## Подсказки
- best[i] — минимальная плата, чтобы встать на ступеньку i.
- best[i] = c_i + min(best[i−1], best[i−2]).
- best[0] = 0 — нулевая ступенька бесплатна.
## Решение: прямая динамика
@time: O(N) @memory: O(N)
```python
n = int(input())
c = [0] + list(map(int, input().split()))
best = [0] * (n + 1)
best[1] = c[1]
for i in range(2, n + 1):
    best[i] = c[i] + min(best[i - 1], best[i - 2])
print(best[n])
```
## Решение: рекурсия с запоминанием
@time: O(N) @memory: O(N)
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(300000)
n = int(input())
c = [0] + list(map(int, input().split()))

@lru_cache(maxsize=None)
def best(i):
    if i <= 1:
        return c[i] if i == 1 else 0
    return c[i] + min(best(i - 1), best(i - 2))

for i in range(0, n + 1, 500):
    best(i)
print(best(n))
```
## Объяснение
Во втором способе значения заполняются «снизу» блоками по 500, чтобы не упереться в глубину стека.
## Генератор
```python
import json, random
random.seed(116)
t = ["1\n5", "2\n-1 -1", "3\n10 1 10"]
for n in (20, 300, 5000):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-100, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:coin-ways
kind: task
title: Сколькими способами набрать сумму
category: Динамическое программирование
level: medium
tags: DP, монеты, число способов, без учёта порядка
related: algo:dp, algo:knapsack
## Условие
Есть монеты N номиналов (каждого — сколько угодно). Сколькими способами можно набрать сумму S? Способы, отличающиеся только порядком монет, считаются одинаковыми. Ответ по модулю 10^9 + 7.
## Входные данные
N и S (1 ≤ N ≤ 100, 0 ≤ S ≤ 10^5), затем N различных номиналов.
## Выходные данные
Количество способов.
## Примеры
```in
3 5
1 2 5
```
```out
4
```
## Подсказки
- ways[s] — количество способов набрать s.
- Чтобы не считать перестановки, внешний цикл — по монетам, внутренний — по суммам.
- ways[0] = 1 (пустой набор).
## Решение: DP по монетам
@time: O(N·S) @memory: O(S)
```python
n, s = map(int, input().split())
coins = list(map(int, input().split()))
MOD = 10**9 + 7
ways = [1] + [0] * s
for c in coins:
    for x in range(c, s + 1):
        ways[x] = (ways[x] + ways[x - c]) % MOD
print(ways[s])
```
## Решение: рекурсия с памятью (малые S)
@time: O(N·S) @memory: O(N·S)
f(i, x) — способы набрать x монетами с номерами ≥ i.
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(100000)
n, s = map(int, input().split())
coins = list(map(int, input().split()))
MOD = 10**9 + 7

@lru_cache(maxsize=None)
def f(i, x):
    if x == 0:
        return 1
    if i == n or x < 0:
        return 0
    return (f(i, x - coins[i]) + f(i + 1, x)) % MOD

print(f(0, s))
```
## Объяснение
Если поменять циклы местами (сначала суммы), получится число упорядоченных последовательностей монет — другая задача.
## Генератор
```python
import json, random
random.seed(117)
t = ["1 0\n5", "1 3\n2", "2 10\n2 3"]
for _ in range(4):
    n = random.randint(1, 6)
    t.append("%d %d\n%s" % (n, random.randint(0, 300), " ".join(map(str, random.sample(range(1, 40), n)))))
print(json.dumps(t))
```

# id: task:coin-min
kind: task
title: Минимальное число монет
category: Динамическое программирование
level: medium
tags: DP, монеты, BFS, жадный не работает
related: algo:dp, algo:bfs, algo:greedy
## Условие
Есть монеты N номиналов (каждого — сколько угодно). Найдите минимальное число монет, которыми можно набрать сумму S, или −1, если это невозможно.
## Входные данные
N и S (1 ≤ N ≤ 100, 0 ≤ S ≤ 10^5), затем N номиналов.
## Выходные данные
Минимальное число монет или −1.
## Примеры
```in
3 6
1 3 4
```
```out
2
```
## Подсказки
- Жадный выбор (сначала крупные) здесь ошибается: 4 + 1 + 1 хуже, чем 3 + 3.
- best[x] = 1 + min(best[x − c]) по всем монетам c ≤ x.
- best[0] = 0; недостижимые суммы — бесконечность.
## Решение: DP по суммам
@time: O(N·S) @memory: O(S)
```python
n, s = map(int, input().split())
coins = list(map(int, input().split()))
INF = float("inf")
best = [0] + [INF] * s
for x in range(1, s + 1):
    for c in coins:
        if c <= x and best[x - c] + 1 < best[x]:
            best[x] = best[x - c] + 1
print(best[s] if best[s] != INF else -1)
```
## Решение: BFS по суммам
@time: O(N·S) @memory: O(S)
Каждая монета — ребро; минимальное число монет — кратчайший путь от 0 до S.
```python
from collections import deque
n, s = map(int, input().split())
coins = list(map(int, input().split()))
dist = [-1] * (s + 1)
dist[0] = 0
q = deque([0])
while q:
    x = q.popleft()
    for c in coins:
        y = x + c
        if y <= s and dist[y] == -1:
            dist[y] = dist[x] + 1
            q.append(y)
print(dist[s])
```
## Объяснение
BFS естественно находит минимум, так как перебирает суммы по числу монет.
## Генератор
```python
import json, random
random.seed(118)
t = ["1 0\n7", "1 3\n2", "3 11\n1 2 5", "2 7\n2 4"]
for _ in range(4):
    n = random.randint(1, 5)
    t.append("%d %d\n%s" % (n, random.randint(0, 500), " ".join(map(str, random.sample(range(1, 30), n)))))
print(json.dumps(t))
```

# id: task:knapsack-01
kind: task
title: Рюкзак 0/1
category: Динамическое программирование
level: hard
tags: рюкзак, DP, вес и стоимость
related: algo:knapsack, algo:dp
## Условие
Есть N предметов с весами w_i и стоимостями c_i. Каждый предмет можно взять не более одного раза. Найдите максимальную суммарную стоимость предметов с суммарным весом не больше W.
## Входные данные
N и W (1 ≤ N ≤ 100, 1 ≤ W ≤ 10^4), затем N строк «w c».
## Выходные данные
Максимальная стоимость.
## Примеры
```in
4 7
1 1
3 4
4 5
5 7
```
```out
9
```
## Подсказки
- dp[x] — лучшая стоимость при вместимости x.
- Для каждого предмета обновляйте dp[x] = max(dp[x], dp[x − w] + c).
- Чтобы предмет не брался дважды, перебирайте x от W вниз.
## Решение: одномерный dp, x по убыванию
@time: O(N·W) @memory: O(W)
```python
n, W = map(int, input().split())
dp = [0] * (W + 1)
for _ in range(n):
    w, c = map(int, input().split())
    for x in range(W, w - 1, -1):
        if dp[x - w] + c > dp[x]:
            dp[x] = dp[x - w] + c
print(dp[W])
```
## Решение: словарь достижимых весов
@time: O(N·K), K — число различных весов @memory: O(K)
Храним для каждого достижимого веса лучшую стоимость; эффективно, если весов мало.
```python
n, W = map(int, input().split())
best = {0: 0}
for _ in range(n):
    w, c = map(int, input().split())
    for weight, value in list(best.items()):
        nw = weight + w
        if nw <= W and best.get(nw, -1) < value + c:
            best[nw] = value + c
print(max(best.values()))
```
## Решение: перебор подмножеств (малые N)
@time: O(2^N·N) @memory: O(N)
```python
n, W = map(int, input().split())
items = [tuple(map(int, input().split())) for _ in range(n)]
best = 0
for mask in range(1 << n):
    w = c = 0
    for i in range(n):
        if mask >> i & 1:
            w += items[i][0]
            c += items[i][1]
    if w <= W:
        best = max(best, c)
print(best)
```
## Объяснение
Во втором способе list(best.items()) — снимок до обработки предмета, поэтому предмет не используется дважды.
## Генератор
```python
import json, random
random.seed(119)
t = ["1 1\n2 5", "1 5\n5 5"]
for _ in range(5):
    n = random.randint(1, 12); W = random.randint(1, 60)
    t.append("%d %d\n%s" % (n, W, "\n".join("%d %d" % (random.randint(1, 25), random.randint(1, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:lis
kind: task
title: Наибольшая возрастающая подпоследовательность
category: Динамическое программирование
level: hard
tags: LIS, DP, бинарный поиск, patience sorting
related: algo:lis, algo:binary-search
## Условие
Дан массив из N чисел. Найдите длину наибольшей строго возрастающей подпоследовательности (элементы не обязательно подряд).
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Длина подпоследовательности.
## Примеры
```in
8
10 9 2 5 3 7 101 18
```
```out
4
```
## Подсказки
- dp[i] — длина наибольшей возрастающей подпоследовательности, заканчивающейся в i: O(N²).
- tails[k] — минимальный возможный последний элемент подпоследовательности длины k+1.
- Массив tails возрастает: позицию для нового элемента ищите bisect_left.
## Решение: tails и бинарный поиск
@time: O(N log N) @memory: O(N)
```python
from bisect import bisect_left
input()
tails = []
for x in map(int, input().split()):
    i = bisect_left(tails, x)
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
print(len(tails))
```
## Решение: квадратичная динамика (малые N)
@time: O(N²) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
dp = [1] * n
for i in range(n):
    for j in range(i):
        if a[j] < a[i] and dp[j] + 1 > dp[i]:
            dp[i] = dp[j] + 1
print(max(dp))
```
## Объяснение
bisect_left (а не bisect_right) обеспечивает строгое возрастание: равный элемент заменяет, а не удлиняет.
## Генератор
```python
import json, random
random.seed(120)
t = ["1\n5", "3\n2 2 2", "4\n1 2 3 4", "4\n4 3 2 1"]
for n in (20, 200, 1000):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-100, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:lcs
kind: task
title: Наибольшая общая подпоследовательность
category: Динамическое программирование
level: hard
tags: LCS, DP по двум строкам
related: algo:lcs, algo:dp
## Условие
Даны две строки. Найдите длину их наибольшей общей подпоследовательности (символы идут в том же порядке, но не обязательно подряд).
## Входные данные
Две строки длиной до 2000.
## Выходные данные
Длина LCS.
## Примеры
```in
ABCBDAB
BDCABA
```
```out
4
```
## Подсказки
- dp[i][j] — LCS префиксов a[:i] и b[:j].
- Если a[i−1] == b[j−1], то dp[i][j] = dp[i−1][j−1] + 1.
- Иначе dp[i][j] = max(dp[i−1][j], dp[i][j−1]).
## Решение: таблица с двумя строками
@time: O(N·M) @memory: O(M)
```python
a = input().strip()
b = input().strip()
prev = [0] * (len(b) + 1)
for ch in a:
    cur = [0] * (len(b) + 1)
    for j, d in enumerate(b, 1):
        cur[j] = prev[j - 1] + 1 if ch == d else max(prev[j], cur[j - 1])
    prev = cur
print(prev[-1])
```
## Решение: рекурсия с памятью (короткие строки)
@time: O(N·M) @memory: O(N·M)
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(10000)
a = input().strip()
b = input().strip()

@lru_cache(maxsize=None)
def lcs(i, j):
    if i == len(a) or j == len(b):
        return 0
    if a[i] == b[j]:
        return 1 + lcs(i + 1, j + 1)
    return max(lcs(i + 1, j), lcs(i, j + 1))

print(lcs(0, 0))
```
## Объяснение
Для восстановления самой подпоследовательности нужна полная таблица и обратный проход.
## Генератор
```python
import json, random
random.seed(121)
t = ["A\nB", "A\nA", "AAAA\nAA"]
for n in (10, 60, 120):
    t.append("".join(random.choice("ACGT") for _ in range(n)) + "\n" + "".join(random.choice("ACGT") for _ in range(n)))
print(json.dumps(t))
```

# id: task:edit-distance
kind: task
title: Расстояние Левенштейна
category: Динамическое программирование
level: hard
tags: редакционное расстояние, DP, Левенштейн
related: algo:dp
## Условие
Даны две строки. Найдите минимальное число операций (вставка, удаление, замена одного символа), превращающих первую строку во вторую.
## Входные данные
Две строки длиной до 2000 (могут быть пустыми).
## Выходные данные
Расстояние.
## Примеры
```in
kitten
sitting
```
```out
3
```
## Подсказки
- dp[i][j] — расстояние между a[:i] и b[:j].
- dp[i][0] = i, dp[0][j] = j.
- dp[i][j] = min(удаление dp[i−1][j]+1, вставка dp[i][j−1]+1, замена dp[i−1][j−1] + (a[i−1] != b[j−1])).
## Решение: DP с двумя строками
@time: O(N·M) @memory: O(M)
```python
a = input()
b = input()
prev = list(range(len(b) + 1))
for i, ca in enumerate(a, 1):
    cur = [i] + [0] * len(b)
    for j, cb in enumerate(b, 1):
        cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb))
    prev = cur
print(prev[-1])
```
## Решение: рекурсия с памятью (короткие строки)
@time: O(N·M) @memory: O(N·M)
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(10000)
a = input()
b = input()

@lru_cache(maxsize=None)
def d(i, j):
    if i == 0:
        return j
    if j == 0:
        return i
    return min(d(i - 1, j) + 1, d(i, j - 1) + 1, d(i - 1, j - 1) + (a[i - 1] != b[j - 1]))

print(d(len(a), len(b)))
```
## Объяснение
Это же расстояние используется в поиске приложения для исправления опечаток.
## Генератор
```python
import json, random
random.seed(122)
t = ["\n\n", "abc\n\n", "\nabc", "abc\nabc", "flaw\nlawn", "intention\nexecution"]
for n in (20, 80):
    t.append("".join(random.choice("abc") for _ in range(n)) + "\n" + "".join(random.choice("abc") for _ in range(n)))
print(json.dumps(t))
```

# id: task:grid-paths
kind: task
title: Пути в сетке с препятствиями
category: Динамическое программирование
level: medium
tags: DP по сетке, пути, препятствия
related: algo:dp, algo:matrices
## Условие
Дано поле N×M: «.» — свободно, «#» — препятствие. Робот идёт из левого верхнего угла в правый нижний, двигаясь только вправо или вниз. Сколько существует путей? Ответ по модулю 10^9 + 7.
## Входные данные
N и M (1 ≤ N, M ≤ 1000), затем N строк поля.
## Выходные данные
Количество путей.
## Примеры
```in
3 3
...
.#.
...
```
```out
2
```
## Подсказки
- В клетку можно прийти только сверху или слева.
- ways[i][j] = ways[i−1][j] + ways[i][j−1], если клетка свободна, иначе 0.
- Хватит одной строки массива.
## Решение: DP по строкам
@time: O(N·M) @memory: O(M)
```python
n, m = map(int, input().split())
MOD = 10**9 + 7
row = [0] * m
for i in range(n):
    line = input().strip()
    for j in range(m):
        if line[j] == "#":
            row[j] = 0
        elif i == 0 and j == 0:
            row[j] = 1
        elif j > 0:
            row[j] = (row[j] + row[j - 1]) % MOD
print(row[-1])
```
## Решение: рекурсия с памятью (малые поля)
@time: O(N·M) @memory: O(N·M)
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(10000)
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
MOD = 10**9 + 7

@lru_cache(maxsize=None)
def ways(i, j):
    if i < 0 or j < 0 or g[i][j] == "#":
        return 0
    if i == 0 and j == 0:
        return 1
    return (ways(i - 1, j) + ways(i, j - 1)) % MOD

print(ways(n - 1, m - 1))
```
## Объяснение
Если стартовая клетка занята, ответ 0 — первый способ обрабатывает это проверкой «#» до старта.
## Генератор
```python
import json, random
random.seed(123)
t = ["1 1\n.", "1 1\n#", "2 2\n.#\n#."]
for _ in range(4):
    n, m = random.randint(1, 12), random.randint(1, 12)
    g = ["".join("#" if random.random() < 0.2 else "." for _ in range(m)) for _ in range(n)]
    t.append("%d %d\n%s" % (n, m, "\n".join(g)))
print(json.dumps(t))
```

# id: task:max-path-grid
kind: task
title: Путь с максимальной суммой
category: Динамическое программирование
level: medium
tags: DP по сетке, максимум
related: algo:dp
## Условие
Дана таблица N×M с числами. Двигаясь из левого верхнего угла в правый нижний только вправо и вниз, наберите максимальную сумму чисел клеток пути (включая начальную и конечную).
## Входные данные
N и M (1 ≤ N, M ≤ 500), затем таблица.
## Выходные данные
Максимальная сумма.
## Примеры
```in
3 3
1 3 1
1 5 1
4 2 1
```
```out
12
```
## Подсказки
- best[i][j] = a[i][j] + max(best[i−1][j], best[i][j−1]).
- Первая строка и первый столбец заполняются только с одной стороны.
- Ответ — best в правом нижнем углу.
## Решение: DP по таблице
@time: O(N·M) @memory: O(M)
```python
n, m = map(int, input().split())
NEG = float("-inf")
prev = [NEG] * m
for i in range(n):
    a = list(map(int, input().split()))
    cur = [0] * m
    for j in range(m):
        if i == 0 and j == 0:
            cur[j] = a[j]
        else:
            cur[j] = a[j] + max(prev[j], cur[j - 1] if j > 0 else NEG)
    prev = cur
print(prev[-1])
```
## Решение: перебор путей (малые поля)
@time: O(C(N+M−2, N−1)·(N+M)) @memory: O(N+M)
Путь — выбор, на каких из N+M−2 шагов идти вниз.
```python
from itertools import combinations
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
steps = n + m - 2
best = None
for downs in combinations(range(steps), n - 1):
    downs = set(downs)
    i = j = 0
    s = a[0][0]
    for k in range(steps):
        if k in downs:
            i += 1
        else:
            j += 1
        s += a[i][j]
    best = s if best is None else max(best, s)
print(best)
```
## Объяснение
Число путей растёт экспоненциально, а динамика решает задачу за N·M.
## Генератор
```python
import json, random
random.seed(124)
t = ["1 1\n-5", "1 3\n1 2 3"]
for _ in range(4):
    n, m = random.randint(1, 7), random.randint(1, 7)
    t.append("%d %d\n%s" % (n, m, "\n".join(" ".join(str(random.randint(-9, 9)) for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:house-robber
kind: task
title: Грабитель на улице
category: Динамическое программирование
level: medium
tags: DP, несоседние элементы
related: algo:dp
## Условие
В ряд стоят N домов, в доме i лежит a_i монет. Нельзя грабить два соседних дома. Найдите максимальную добычу.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N неотрицательных чисел.
## Выходные данные
Максимальная сумма.
## Примеры
```in
5
2 7 9 3 1
```
```out
12
```
## Подсказки
- Для дома i есть два варианта: грабить его (тогда не i−1) или пропустить.
- best[i] = max(best[i−1], best[i−2] + a_i).
- Хватит двух переменных.
## Решение: две переменные
@time: O(N) @memory: O(1)
```python
input()
take, skip = 0, 0
for x in map(int, input().split()):
    take, skip = skip + x, max(take, skip)
print(max(take, skip))
```
## Решение: массив best
@time: O(N) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
best = [0] * (n + 1)
best[1] = a[0]
for i in range(2, n + 1):
    best[i] = max(best[i - 1], best[i - 2] + a[i - 1])
print(best[n])
```
## Объяснение
take — лучшая сумма, если текущий дом ограблен, skip — если нет.
## Генератор
```python
import json, random
random.seed(125)
t = ["1\n5", "2\n1 2", "3\n2 1 1"]
for n in (10, 100, 3000):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 1000)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:partition-equal
kind: task
title: Разбиение на две равные части
category: Динамическое программирование
level: hard
tags: subset sum, битовый DP, множество сумм
related: algo:dp, algo:bits, algo:knapsack
## Условие
Дан набор из N натуральных чисел. Можно ли разбить его на две группы с равными суммами? Выведите YES или NO.
## Входные данные
N (1 ≤ N ≤ 200), затем N чисел (1 ≤ a_i ≤ 1000).
## Выходные данные
YES или NO.
## Примеры
```in
4
1 5 11 5
```
```out
YES
```
## Подсказки
- Если общая сумма нечётна — сразу NO.
- Задача сводится к поиску подмножества с суммой total / 2.
- Множество достижимых сумм можно хранить битами одного большого числа.
## Решение: битовый DP
@time: O(N·S / 64) @memory: O(S)
Бит s числа reach равен 1, если сумму s можно набрать. Сдвиг reach << x добавляет x ко всем суммам.
```python
input()
a = list(map(int, input().split()))
total = sum(a)
reach = 1
for x in a:
    reach |= reach << x
print("YES" if total % 2 == 0 and reach >> (total // 2) & 1 else "NO")
```
## Решение: булев массив
@time: O(N·S) @memory: O(S)
```python
input()
a = list(map(int, input().split()))
total = sum(a)
if total % 2:
    print("NO")
else:
    half = total // 2
    can = [True] + [False] * half
    for x in a:
        for s in range(half, x - 1, -1):
            if can[s - x]:
                can[s] = True
    print("YES" if can[half] else "NO")
```
## Решение: множество сумм
@time: O(N·K) @memory: O(K)
```python
input()
a = list(map(int, input().split()))
total = sum(a)
sums = {0}
for x in a:
    sums |= {s + x for s in sums}
print("YES" if total % 2 == 0 and total // 2 in sums else "NO")
```
## Объяснение
Длинные целые Python делают «битсет» очень быстрым: сдвиг и OR выполняются над машинными словами.
## Генератор
```python
import json, random
random.seed(126)
t = ["1\n2", "2\n3 3", "3\n1 2 4", "3\n1 1 2"]
for n in (10, 50, 200):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(1, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:palindromic-subsequence
kind: task
title: Наибольшая подпоследовательность-палиндром
category: Динамическое программирование
level: hard
tags: DP по отрезкам, палиндром, LCS
related: algo:dp, algo:lcs, algo:palindromes
## Условие
Дана строка. Найдите длину её наибольшей подпоследовательности, являющейся палиндромом.
## Входные данные
Строка длиной до 1500.
## Выходные данные
Длина.
## Примеры
```in
bbbab
```
```out
4
```
## Подсказки
- dp[i][j] — ответ для подстроки s[i..j].
- Если s[i] == s[j]: dp[i][j] = dp[i+1][j−1] + 2, иначе max(dp[i+1][j], dp[i][j−1]).
- Другой взгляд: это LCS строки и её разворота.
## Решение: DP по отрезкам
@time: O(n²) @memory: O(n)
```python
s = input().strip()
n = len(s)
dp = [0] * n
for i in range(n - 1, -1, -1):
    new = [0] * n
    new[i] = 1
    for j in range(i + 1, n):
        if s[i] == s[j]:
            new[j] = dp[j - 1] + 2
        else:
            new[j] = max(dp[j], new[j - 1])
    dp = new
print(dp[n - 1])
```
## Решение: LCS со своим разворотом
@time: O(n²) @memory: O(n)
```python
s = input().strip()
t = s[::-1]
prev = [0] * (len(t) + 1)
for ch in s:
    cur = [0] * (len(t) + 1)
    for j, d in enumerate(t, 1):
        cur[j] = prev[j - 1] + 1 if ch == d else max(prev[j], cur[j - 1])
    prev = cur
print(prev[-1])
```
## Объяснение
В первом способе dp хранит строку i+1 таблицы, new — строку i; dp[j − 1] — это значение для (i+1, j−1).
## Генератор
```python
import json, random
random.seed(127)
t = ["a", "ab", "aa", "abcba", "character"]
for n in (40, 300):
    t.append("".join(random.choice("abc") for _ in range(n)))
print(json.dumps(t))
```

# id: task:integer-partitions
kind: task
title: Разбиения числа на слагаемые
category: Динамическое программирование
level: medium
tags: разбиения, DP, комбинаторика
related: algo:dp, algo:combinatorics
## Условие
Сколькими способами можно представить натуральное число N в виде суммы натуральных слагаемых, если порядок слагаемых не важен? (Число 4: 4, 3+1, 2+2, 2+1+1, 1+1+1+1 — 5 способов.)
## Входные данные
N (1 ≤ N ≤ 1000).
## Выходные данные
Количество разбиений (точно, без модуля).
## Примеры
```in
4
```
```out
5
```
## Подсказки
- Это задача о монетах с номиналами 1, 2, …, N.
- p[s] — число способов набрать s; обрабатывайте слагаемые по одному.
- Внешний цикл — по слагаемому k, внутренний — по сумме s от k до N.
## Решение: DP как монеты 1..N
@time: O(N²) @memory: O(N)
```python
n = int(input())
p = [1] + [0] * n
for k in range(1, n + 1):
    for s in range(k, n + 1):
        p[s] += p[s - k]
print(p[n])
```
## Решение: пентагональная теорема Эйлера
@time: O(N√N) @memory: O(N)
p(n) = Σ (−1)^(k+1) · [p(n − k(3k−1)/2) + p(n − k(3k+1)/2)].
```python
n = int(input())
p = [1] + [0] * n
for m in range(1, n + 1):
    total = 0
    k = 1
    while True:
        g1 = k * (3 * k - 1) // 2
        if g1 > m:
            break
        sign = 1 if k % 2 else -1
        total += sign * p[m - g1]
        g2 = k * (3 * k + 1) // 2
        if g2 <= m:
            total += sign * p[m - g2]
        k += 1
    p[m] = total
print(p[n])
```
## Объяснение
p(1000) — 32-значное число, Python считает его точно.
## Генератор
```python
import json
print(json.dumps(["1", "2", "5", "10", "100", "500", "1000"]))
```
