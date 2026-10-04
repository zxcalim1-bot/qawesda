# id: algo:stack
kind: algorithm
category: Структуры данных
title: Стек
summary: LIFO: list.append/pop за O(1); скобки, вычисление выражений, монотонный стек.
level: easy
complexity: O(1) на операцию
tags: стек, LIFO, скобки, монотонный стек, обратная польская запись
related: task:balanced-brackets, task:postfix-eval, task:next-greater, task:largest-rectangle, task:min-stack
## Теория
Стек — «последним пришёл, первым ушёл». В Python — обычный list: append кладёт на вершину, pop() снимает, a[-1] — вершина.
Монотонный стек хранит элементы в возрастающем (или убывающем) порядке; при добавлении снимает «мешающие» элементы — так за O(n) находят ближайший больший/меньший элемент.
## Шаблон: ближайший меньший слева
```python
a = [4, 2, 5, 3, 1, 6]
res = []
st = []
for x in a:
    while st and st[-1] >= x:
        st.pop()
    res.append(st[-1] if st else -1)
    st.append(x)
print(res)
```
## Скобки
```python
def balanced(s):
    pair = {")": "(", "]": "[", "}": "{"}
    st = []
    for ch in s:
        if ch in "([{":
            st.append(ch)
        elif not st or st.pop() != pair[ch]:
            return False
    return not st

print(balanced("([]{})"), balanced("([)]"))
```
## Олимпиадное применение
Скобочные последовательности, гистограммы, калькуляторы, итеративный DFS.

# id: algo:queue
kind: algorithm
category: Структуры данных
title: Очередь
summary: FIFO на collections.deque: append и popleft за O(1); основа BFS.
level: easy
complexity: O(1) на операцию
tags: очередь, FIFO, deque, BFS
related: lib:collections.deque, task:queue-simulation, algo:bfs
## Теория
Очередь — «первым пришёл, первым ушёл». list.pop(0) сдвигает весь список (O(n)), поэтому используйте collections.deque: append добавляет в конец, popleft забирает из начала за O(1).
## Шаблон
```python
from collections import deque
q = deque()
for x in [1, 2, 3]:
    q.append(x)
q.append(4)
print(q.popleft(), q.popleft(), list(q), len(q))
```
## Олимпиадное применение
Обход в ширину, моделирование очередей обслуживания, «скользящие» окна.

# id: algo:deque
kind: algorithm
category: Структуры данных
title: Дек и монотонная очередь
summary: deque — вставка и удаление с обоих концов за O(1); максимум в окне, 0-1 BFS.
level: medium
complexity: O(1) на операцию
tags: дек, deque, монотонная очередь, rotate, 0-1 BFS
related: lib:collections.deque, task:window-max, task:zero-one-bfs, task:cyclic-shift
## Теория
collections.deque поддерживает append, appendleft, pop, popleft за O(1), rotate(k), ограничение длины maxlen.
Монотонная очередь хранит индексы в порядке убывания значений: максимум окна всегда в голове.
## Шаблон: максимум в окне длины k
```python
from collections import deque
a, k = [1, 3, -1, -3, 5, 3, 6, 7], 3
dq, res = deque(), []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        res.append(a[dq[0]])
print(res)
last3 = deque(maxlen=3)
for x in range(10):
    last3.append(x)
print(last3)
```
## Олимпиадное применение
Окна, 0-1 BFS (ребро веса 0 — в начало дека), циклические сдвиги.

# id: algo:heap
kind: algorithm
category: Структуры данных
title: Куча (очередь с приоритетом)
summary: heapq: минимум за O(1), push/pop за O(log n); top-k, Дейкстра, слияние, медиана.
level: medium
complexity: O(log n) на push/pop
tags: куча, heapq, приоритетная очередь, top-k, медиана
related: lib:heapq.heappush, lib:heapq.heappop, lib:heapq.nlargest, task:k-largest-stream, task:merge-ropes, task:running-median, task:dijkstra
## Теория
Двоичная куча — массив, где каждый элемент не больше своих детей; минимум в h[0]. heapq реализует min-кучу; для max-кучи кладите −x или кортежи (−приоритет, …).
## Пример
```python
import heapq
h = []
for x in [5, 1, 8, 3, 2]:
    heapq.heappush(h, x)
print(h[0], heapq.heappop(h), heapq.heappop(h), h)
a = [7, 2, 9, 4, 1]
heapq.heapify(a)
print(heapq.nsmallest(2, a), heapq.nlargest(2, a))
tasks = [(2, "write"), (1, "read"), (3, "test")]
heapq.heapify(tasks)
print([heapq.heappop(tasks)[1] for _ in range(3)])
```
## Типичные ошибки
- Кортежи с одинаковым приоритетом сравниваются по следующему полю; если оно несравнимо (например, dict) — TypeError. Добавляйте счётчик: (prio, counter, obj).
- heapq.heappop из пустой кучи — IndexError.
## Олимпиадное применение
Жадные алгоритмы (Хаффман, расписания), Дейкстра, k-я статистика в потоке, две кучи для медианы.

# id: algo:fenwick
kind: algorithm
category: Структуры данных
title: Дерево Фенвика
summary: Префиксные суммы с изменениями: update и query за O(log n), i & -i.
level: hard
complexity: O(log n) на операцию
memory: O(n)
tags: Фенвик, BIT, префиксные суммы, обновление, инверсии
related: task:fenwick-sum, task:inversions, algo:segment-tree
## Теория
tree[i] хранит сумму отрезка длины lowbit(i) = i & −i, заканчивающегося в i. Префиксная сумма — подъём i −= i & −i, обновление — i += i & −i. Индексация с 1.
## Шаблон
```python
class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta):
        while i <= self.n:
            self.t[i] += delta
            i += i & -i

    def prefix(self, i):
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - self.prefix(l - 1)

f = Fenwick(8)
for i, x in enumerate([5, 3, 7, 9, 6, 4, 1, 2], 1):
    f.add(i, x)
f.add(3, 10)
print(f.range_sum(2, 5), f.prefix(8))
```
## Олимпиадное применение
Суммы с изменениями, количество инверсий, «сколько элементов меньше x среди уже встреченных», k-й элемент.

# id: algo:segment-tree
kind: algorithm
category: Структуры данных
title: Дерево отрезков
summary: Любая ассоциативная операция на отрезке с изменениями за O(log n).
level: hard
complexity: O(log n) на операцию
memory: O(n)
tags: дерево отрезков, RMQ, сумма на отрезке, минимум на отрезке
related: task:fenwick-sum, task:range-min, algo:fenwick, algo:sparse-table
## Теория
Каждая вершина хранит результат операции (сумма, минимум, НОД…) для своего отрезка; корень — для всего массива. Изменение элемента обновляет O(log n) предков, запрос разбивает отрезок на O(log n) вершин.
Итеративный вариант «снизу вверх»: листья в t[n..2n−1], родитель i — i // 2.
## Шаблон (минимум)
```python
class SegTree:
    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * self.n + list(a)
        for i in range(self.n - 1, 0, -1):
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def update(self, i, x):
        i += self.n
        self.t[i] = x
        while i > 1:
            i //= 2
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def query(self, l, r):
        res = float("inf")
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                res = min(res, self.t[l]); l += 1
            if r & 1:
                r -= 1; res = min(res, self.t[r])
            l //= 2
            r //= 2
        return res

st = SegTree([5, 2, 8, 1, 9, 3])
print(st.query(0, 3), st.query(2, 6))
st.update(3, 10)
print(st.query(2, 6))
```
## Олимпиадное применение
RMQ с изменениями, отложенные операции на отрезках (lazy propagation), поиск k-го элемента.

# id: algo:sparse-table
kind: algorithm
category: Структуры данных
title: Разреженная таблица
summary: Минимум на отрезке неизменяемого массива за O(1) после O(n log n) предподсчёта.
level: hard
complexity: O(n log n) построение, O(1) запрос
memory: O(n log n)
tags: sparse table, RMQ, минимум на отрезке
related: task:range-min, algo:segment-tree
## Теория
sp[k][i] = min(a[i..i+2^k−1]). Отрезок [l, r) покрывается двумя отрезками длины 2^j, где j = log2(r − l); их пересечение не мешает, потому что min(x, x) = x.
## Шаблон
```python
a = [5, 2, 8, 1, 9, 3, 7]
sp = [a[:]]
k = 1
while (1 << k) <= len(a):
    prev = sp[-1]
    sp.append([min(prev[i], prev[i + (1 << (k - 1))]) for i in range(len(a) - (1 << k) + 1)])
    k += 1

def rmq(l, r):
    j = (r - l).bit_length() - 1
    return min(sp[j][l], sp[j][r - (1 << j)])

print(rmq(0, 3), rmq(2, 7), rmq(4, 5))
```
## Олимпиадное применение
LCA через эйлеров обход, статические запросы минимума/максимума/НОД.

# id: algo:greedy
kind: algorithm
category: Жадные алгоритмы
title: Жадные алгоритмы
summary: На каждом шаге локально лучший выбор; нужно доказать, что он не портит оптимум.
level: medium
complexity: обычно O(n log n) из-за сортировки
tags: жадный, сортировка, расписание, монеты, обмен аргументами
related: task:activity-selection, task:max-overlap, task:fractional-knapsack, task:jump-game, task:boats, task:merge-ropes, task:int-to-roman
## Теория
Жадный алгоритм делает выбор, который сейчас кажется лучшим, и не пересматривает его. Он верен не всегда; стандартное доказательство — «обмен аргументами»: любое оптимальное решение можно перестроить так, чтобы оно начиналось с жадного выбора.
## Классика
- Расписание: выбирайте занятие, которое раньше заканчивается.
- Непрерывный рюкзак: по убыванию цены за единицу веса.
- Соединение верёвок / код Хаффмана: всегда объединяйте два наименьших.
## Контрпример: монеты
Для номиналов 1, 3, 4 и суммы 6 жадный выбор (4 + 1 + 1) хуже оптимума (3 + 3) — нужна динамика.
```python
coins, s = [1, 3, 4], 6
greedy, rest = 0, s
for c in sorted(coins, reverse=True):
    greedy += rest // c
    rest %= c
best = [0] + [float("inf")] * s
for x in range(1, s + 1):
    best[x] = min(best[x - c] + 1 for c in coins if c <= x)
print(greedy, best[s])
```
## Олимпиадное применение
Проверяйте жадную идею перебором на маленьких тестах — это быстрый способ поймать контрпример.

# id: algo:dp
kind: algorithm
category: Динамическое программирование
title: Динамическое программирование
summary: Разбить задачу на подзадачи, запомнить ответы и собрать решение: состояние, переход, база, порядок.
level: medium
complexity: число состояний × число переходов
tags: DP, динамика, мемоизация, таблица, lru_cache
related: lib:functools.lru_cache, task:stairs-ways, task:coin-ways, task:coin-min, task:knapsack-01, task:lis, task:lcs, task:edit-distance, task:grid-paths, task:house-robber
## Теория
DP применимо, когда ответ задачи выражается через ответы меньших подзадач, и подзадачи повторяются. Нужно определить:
- Состояние: что хранит dp[...] (например, dp[i] — ответ для первых i элементов).
- Переход: как dp[i] получается из предыдущих.
- База: значения для самых маленьких подзадач.
- Порядок вычисления и где ответ.
Два стиля: «сверху вниз» (рекурсия + @lru_cache) и «снизу вверх» (заполнение массива циклом).
## Пример: число путей в сетке
```python
n, m = 4, 5
dp = [[1] * m for _ in range(n)]
for i in range(1, n):
    for j in range(1, m):
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
print(dp[-1][-1])
```
## Пример: то же сверху вниз
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def paths(i, j):
    if i == 0 or j == 0:
        return 1
    return paths(i - 1, j) + paths(i, j - 1)

print(paths(3, 4))
```
## Оптимизация памяти
Если переход использует только предыдущую строку — храните две строки (или одну, с правильным направлением обхода).
## Типичные ошибки
- Неверный порядок вычисления (используете ещё не посчитанное значение).
- В рюкзаке 0/1 обход весов по возрастанию позволяет взять предмет несколько раз.
## Олимпиадное применение
Последовательности (LIS, LCS), рюкзаки, пути в сетке, DP по отрезкам, по маскам, по цифрам, на деревьях.

# id: algo:knapsack
kind: algorithm
category: Динамическое программирование
title: Задачи о рюкзаке
summary: 0/1, неограниченный, непрерывный рюкзак; subset sum и битсеты.
level: hard
complexity: O(n·W)
memory: O(W)
tags: рюкзак, knapsack, subset sum, монеты, битсет
related: task:knapsack-01, task:coin-ways, task:coin-min, task:partition-equal, task:fractional-knapsack
## Варианты
- 0/1: каждый предмет один раз — обход вместимости по убыванию.
- Неограниченный: предметы повторяются — обход по возрастанию.
- Непрерывный (дробный): жадно по удельной ценности.
- Subset sum: какие суммы достижимы — булев массив или битсет на длинном int.
## Шаблон
```python
items = [(1, 1), (3, 4), (4, 5), (5, 7)]
W = 7
dp01 = [0] * (W + 1)
for w, c in items:
    for x in range(W, w - 1, -1):
        dp01[x] = max(dp01[x], dp01[x - w] + c)
dpinf = [0] * (W + 1)
for w, c in items:
    for x in range(w, W + 1):
        dpinf[x] = max(dpinf[x], dpinf[x - w] + c)
reach = 1
for w, _ in items:
    reach |= reach << w
print(dp01[W], dpinf[W], [s for s in range(W + 1) if reach >> s & 1])
```
## Олимпиадное применение
Разбиение на равные части, размен монет, выбор подмножества с ограничением.

# id: algo:lis
kind: algorithm
category: Динамическое программирование
title: Наибольшая возрастающая подпоследовательность
summary: O(n²) динамика или O(n log n) с массивом «хвостов» и bisect.
level: hard
complexity: O(n log n)
memory: O(n)
tags: LIS, подпоследовательность, bisect, терпеливая сортировка
related: task:lis, algo:binary-search
## Теория
tails[k] — наименьший последний элемент возрастающей подпоследовательности длины k+1. Массив tails возрастает, поэтому место для нового элемента ищется бинарным поиском. Длина tails — ответ.
## Шаблон с восстановлением ответа
```python
from bisect import bisect_left
a = [10, 9, 2, 5, 3, 7, 101, 18]
tails, tails_idx, prev = [], [], [-1] * len(a)
for i, x in enumerate(a):
    k = bisect_left(tails, x)
    if k == len(tails):
        tails.append(x); tails_idx.append(i)
    else:
        tails[k] = x; tails_idx[k] = i
    prev[i] = tails_idx[k - 1] if k else -1
seq, j = [], tails_idx[-1]
while j != -1:
    seq.append(a[j])
    j = prev[j]
print(len(tails), seq[::-1])
```
## Варианты
Неубывающая подпоследовательность — bisect_right вместо bisect_left.

# id: algo:lcs
kind: algorithm
category: Динамическое программирование
title: Наибольшая общая подпоследовательность и редакционное расстояние
summary: DP по двум строкам dp[i][j]; восстановление ответа обратным проходом.
level: hard
complexity: O(n·m)
memory: O(n·m) или O(m)
tags: LCS, Левенштейн, редакционное расстояние, diff
related: task:lcs, task:edit-distance, task:palindromic-subsequence, lib:difflib.SequenceMatcher
## Теория
dp[i][j] — ответ для префиксов a[:i] и b[:j]. Для LCS: совпадение символов → dp[i−1][j−1] + 1, иначе max(dp[i−1][j], dp[i][j−1]). Расстояние Левенштейна — минимум из удаления, вставки и замены.
## Шаблон с восстановлением
```python
a, b = "ABCBDAB", "BDCABA"
n, m = len(a), len(b)
dp = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(n):
    for j in range(m):
        dp[i + 1][j + 1] = dp[i][j] + 1 if a[i] == b[j] else max(dp[i][j + 1], dp[i + 1][j])
res, i, j = [], n, m
while i and j:
    if a[i - 1] == b[j - 1]:
        res.append(a[i - 1]); i -= 1; j -= 1
    elif dp[i - 1][j] >= dp[i][j - 1]:
        i -= 1
    else:
        j -= 1
print(dp[n][m], "".join(reversed(res)))
```
## Применение
Утилиты сравнения файлов (diff), проверка опечаток, биоинформатика.

# id: algo:graphs
kind: algorithm
category: Графы
title: Графы: представление и основные понятия
summary: Вершины и рёбра, списки смежности, матрица смежности, степени, связность.
level: easy
complexity: O(N + M) память для списков
tags: граф, список смежности, матрица смежности, ориентированный, взвешенный
related: task:vertex-degrees, algo:bfs, algo:dfs, algo:shortest-paths
## Теория
Граф — вершины и рёбра. Бывает ориентированным и неориентированным, взвешенным и нет. Дерево — связный граф без циклов (N−1 ребро).
Представления:
- Список смежности g[v] — соседи v; память O(N + M), основной вариант.
- Матрица смежности N×N — для плотных графов и Флойда.
- Список рёбер — для Краскала и Беллмана–Форда.
## Чтение графа
```python
import io
import sys
sys.stdin = io.StringIO("4 4\n1 2\n2 3\n3 1\n3 4\n")
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
print(g[1:], [len(x) for x in g[1:]])
```
## Олимпиадное применение
Многие задачи — графы в «переодетом» виде: клетки поля, состояния игры, слова, отличающиеся одной буквой.

# id: algo:bfs
kind: algorithm
category: Графы
title: Обход в ширину (BFS)
summary: Очередь, слои по расстоянию; кратчайшие пути в невзвешенном графе и на сетке.
level: medium
complexity: O(N + M)
memory: O(N)
tags: BFS, обход в ширину, кратчайший путь, очередь, сетка
related: lib:collections.deque, task:bfs-distances, task:maze-path, task:knight-moves, task:islands, task:coin-min
## Теория
BFS посещает вершины в порядке удаления от старта: сначала все на расстоянии 1, затем 2 и т. д. Поэтому первое посещение вершины даёт кратчайшее расстояние (в рёбрах).
## Шаблон с восстановлением пути
```python
from collections import deque
g = {1: [2, 3], 2: [4], 3: [4, 5], 4: [6], 5: [6], 6: []}
dist, parent = {1: 0}, {1: None}
q = deque([1])
while q:
    u = q.popleft()
    for v in g[u]:
        if v not in dist:
            dist[v] = dist[u] + 1
            parent[v] = u
            q.append(v)
path, v = [], 6
while v is not None:
    path.append(v)
    v = parent[v]
print(dist[6], path[::-1])
```
## Варианты
- Многоисточниковый BFS: в очередь сразу все стартовые вершины.
- 0-1 BFS: рёбра веса 0 — в начало дека, веса 1 — в конец.
- BFS по состояниям (клетка + направление, клетка + ключи…).
## Олимпиадное применение
Лабиринты, ход коня, минимальное число операций, компоненты связности.

# id: algo:dfs
kind: algorithm
category: Графы
title: Обход в глубину (DFS)
summary: Рекурсия или стек; компоненты, циклы, время входа/выхода, мосты, сильная связность.
level: medium
complexity: O(N + M)
memory: O(N)
tags: DFS, обход в глубину, компоненты, цикл, стек, рекурсия
related: task:connected-components, task:has-cycle, task:scc, task:bridges, task:subtree-sizes
## Теория
DFS уходит вглубь по первому непосещённому соседу и возвращается, когда идти некуда. Время входа и выхода вершины, дерево обхода и обратные рёбра дают информацию о структуре графа.
В Python рекурсивный DFS ограничен глубиной стека — для больших графов используйте явный стек.
## Шаблон: итеративный DFS
```python
g = {1: [2, 3], 2: [4], 3: [], 4: [1], 5: [6], 6: []}
seen = set()
comps = 0
for s in g:
    if s in seen:
        continue
    comps += 1
    stack = [s]
    seen.add(s)
    while stack:
        u = stack.pop()
        for v in g[u]:
            if v not in seen:
                seen.add(v)
                stack.append(v)
print(comps, sorted(seen))
```
## Цвета вершин и поиск цикла в ориентированном графе
0 — не посещена, 1 — в обработке, 2 — завершена. Ребро в вершину цвета 1 — цикл.
```python
g = {1: [2], 2: [3], 3: [1], 4: [1]}
color = {v: 0 for v in g}

def has_cycle(u):
    color[u] = 1
    for v in g[u]:
        if color[v] == 1 or (color[v] == 0 and has_cycle(v)):
            return True
    color[u] = 2
    return False

print(any(color[v] == 0 and has_cycle(v) for v in g))
```
## Олимпиадное применение
Компоненты, топологическая сортировка, мосты и точки сочленения, Тарьян/Косарайю, обходы деревьев.

# id: algo:shortest-paths
kind: algorithm
category: Графы
title: Кратчайшие пути: Дейкстра, Беллман–Форд, Флойд
summary: Дейкстра с кучей для неотрицательных весов, Беллман–Форд с отрицательными, Флойд для всех пар.
level: hard
complexity: Дейкстра O((N+M) log N), Флойд O(N³)
tags: Дейкстра, Беллман–Форд, Флойд–Уоршелл, кратчайший путь, heapq
related: lib:heapq.heappush, task:dijkstra, task:floyd, task:zero-one-bfs
## Выбор алгоритма
- Невзвешенный граф — BFS.
- Веса 0 и 1 — 0-1 BFS.
- Неотрицательные веса — Дейкстра.
- Отрицательные веса (без отрицательных циклов) — Беллман–Форд, O(N·M).
- Все пары при N ≤ 400 — Флойд–Уоршелл.
## Дейкстра
```python
import heapq
g = {1: [(2, 4), (3, 1)], 2: [(4, 1)], 3: [(2, 2), (4, 5)], 4: []}
dist = {v: float("inf") for v in g}
dist[1] = 0
heap = [(0, 1)]
while heap:
    d, u = heapq.heappop(heap)
    if d > dist[u]:
        continue
    for v, w in g[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(heap, (dist[v], v))
print(dist)
```
## Флойд–Уоршелл
```python
INF = float("inf")
d = [[0, 3, INF, 7], [8, 0, 2, INF], [5, INF, 0, 1], [2, INF, INF, 0]]
n = len(d)
for k in range(n):
    for i in range(n):
        for j in range(n):
            if d[i][k] + d[k][j] < d[i][j]:
                d[i][j] = d[i][k] + d[k][j]
print(d)
```
## Типичные ошибки
- Дейкстра с отрицательными рёбрами даёт неверные ответы.
- Без проверки d > dist[u] устаревшие записи кучи обрабатываются повторно.

# id: algo:trees
kind: algorithm
category: Графы
title: Деревья
summary: Корень, родители, глубины, поддеревья, диаметр, LCA; обходы без рекурсии.
level: medium
complexity: O(N)
tags: дерево, корень, поддерево, диаметр, LCA, обход
related: task:tree-diameter, task:subtree-sizes, task:lca
## Теория
Дерево из N вершин имеет N−1 ребро и единственный путь между любыми двумя вершинами. Подвесив дерево за корень, получаем родителей, глубины и поддеревья.
Порядок BFS от корня: родитель всегда раньше детей. Обратный порядок позволяет считать значения «снизу вверх» без рекурсии.
## Шаблон
```python
n = 7
edges = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (6, 7)]
g = [[] for _ in range(n + 1)]
for u, v in edges:
    g[u].append(v)
    g[v].append(u)
parent, depth, order = [0] * (n + 1), [0] * (n + 1), [1]
parent[1] = -1
for u in order:
    for v in g[u]:
        if v != parent[u]:
            parent[v], depth[v] = u, depth[u] + 1
            order.append(v)
size = [1] * (n + 1)
for u in reversed(order):
    if parent[u] > 0:
        size[parent[u]] += size[u]
print(depth[1:], size[1:])
```
## Олимпиадное применение
DP на деревьях, диаметр (два BFS), LCA двоичными подъёмами, эйлеров обход.

# id: algo:dsu
kind: algorithm
category: Графы
title: Система непересекающихся множеств (DSU)
summary: find с сжатием путей и union по размеру — почти O(1) на операцию.
level: medium
complexity: O(α(N)) на операцию
memory: O(N)
tags: DSU, union-find, компоненты, Краскал
related: task:dsu-queries, task:connected-components, task:has-cycle, task:mst, task:bipartite
## Теория
Каждое множество — дерево, представитель — корень. find(x) поднимается к корню и «сжимает путь», подвешивая вершины прямо к корню. union объединяет корни, подвешивая меньшее дерево к большему. Вместе это даёт почти константное время (обратная функция Аккермана).
## Шаблон
```python
class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.p[b] = a
        self.size[a] += self.size[b]
        return True

d = DSU(6)
print(d.union(0, 1), d.union(1, 2), d.union(0, 2), d.find(2) == d.find(0), d.find(3) == d.find(0))
```
## Олимпиадное применение
Динамическая связность (только добавление рёбер), Краскал, поиск циклов, DSU с чётностью для двудольности.

# id: algo:topological-sort
kind: algorithm
category: Графы
title: Топологическая сортировка
summary: Порядок вершин DAG, где каждое ребро идёт вперёд: алгоритм Кана или DFS; graphlib.
level: hard
complexity: O(N + M)
tags: топологическая сортировка, DAG, Кан, зависимости, graphlib
related: lib:graphlib.TopologicalSorter, task:topo-sort, task:dag-paths
## Теория
Топологический порядок существует только у ориентированного ациклического графа (DAG). Алгоритм Кана: берём вершины с нулевой входящей степенью, удаляем их рёбра, повторяем. Если вершины кончились раньше времени — есть цикл.
## Шаблон
```python
from collections import deque
n = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]
g = [[] for _ in range(n)]
indeg = [0] * n
for u, v in edges:
    g[u].append(v)
    indeg[v] += 1
q = deque(v for v in range(n) if indeg[v] == 0)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
print(order if len(order) == n else "цикл")
```
## Стандартная библиотека
```python
from graphlib import TopologicalSorter
deps = {"build": {"compile"}, "compile": {"fetch"}, "test": {"build"}}
print(list(TopologicalSorter(deps).static_order()))
```
## Олимпиадное применение
Порядок выполнения задач, DP на DAG (число путей, самый длинный путь), проверка ацикличности.

# id: algo:mst
kind: algorithm
category: Графы
title: Минимальное остовное дерево
summary: Краскал (рёбра по весу + DSU) и Прим (куча от вершины).
level: hard
complexity: O(M log M)
tags: остовное дерево, Краскал, Прим, DSU
related: task:mst, algo:dsu, algo:heap
## Теория
Остовное дерево связывает все вершины N−1 рёбрами без циклов. Минимальное — с наименьшей суммой весов. Свойство разреза: самое лёгкое ребро, пересекающее любой разрез, входит в некоторое минимальное остовное дерево.
## Краскал
```python
edges = [(1, 0, 1), (2, 1, 2), (3, 2, 3), (4, 0, 3), (5, 0, 2)]
parent = list(range(4))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

total, used = 0, []
for w, u, v in sorted(edges):
    ru, rv = find(u), find(v)
    if ru != rv:
        parent[ru] = rv
        total += w
        used.append((u, v))
print(total, used)
```
## Олимпиадное применение
Минимальная сеть дорог/кабелей, кластеризация, «минимакс» пути (максимальное ребро на пути в MST).
