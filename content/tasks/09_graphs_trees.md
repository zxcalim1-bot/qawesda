# id: task:vertex-degrees
kind: task
title: Степени вершин
category: Графы
level: easy
tags: граф, степень вершины, список рёбер
related: algo:graphs
## Условие
Дан неориентированный граф из N вершин и M рёбер (возможны кратные рёбра, петель нет). Выведите степень каждой вершины.
## Входные данные
N и M (1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5), затем M строк «u v».
## Выходные данные
N чисел — степени вершин 1..N.
## Примеры
```in
4 3
1 2
2 3
2 4
```
```out
1 3 1 1
```
## Подсказки
- Степень — количество рёбер, выходящих из вершины.
- Каждое ребро u–v увеличивает степень и u, и v.
- Массив deg длины N+1.
## Решение: массив степеней
@time: O(N + M) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
deg = [0] * (n + 1)
for i in range(m):
    deg[int(data[2 + 2 * i])] += 1
    deg[int(data[3 + 2 * i])] += 1
print(*deg[1:])
```
## Решение: Counter по концам рёбер
@time: O(N + M) @memory: O(N)
```python
from collections import Counter
n, m = map(int, input().split())
cnt = Counter()
for _ in range(m):
    cnt.update(input().split())
print(*(cnt[str(v)] for v in range(1, n + 1)))
```
## Объяснение
Сумма степеней равна 2M — лемма о рукопожатиях.
## Генератор
```python
import json, random
random.seed(131)
t = ["1 0", "2 1\n1 2"]
for _ in range(4):
    n = random.randint(2, 15); m = random.randint(0, 20)
    edges = []
    for _ in range(m):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```

# id: task:bfs-distances
kind: task
title: Расстояния от вершины (BFS)
category: Графы
level: medium
tags: BFS, кратчайшие пути, невзвешенный граф
related: algo:bfs, lib:collections.deque
## Условие
Дан неориентированный граф из N вершин и M рёбер. Для каждой вершины выведите длину кратчайшего пути (в рёбрах) от вершины 1, или −1, если вершина недостижима.
## Входные данные
N и M (до 2·10^5), затем M строк «u v».
## Выходные данные
N чисел.
## Примеры
```in
5 4
1 2
2 3
1 4
4 3
```
```out
0 1 2 1 -1
```
## Подсказки
- В невзвешенном графе кратчайшие пути находит обход в ширину.
- Очередь (deque) обрабатывает вершины в порядке удаления от старта.
- dist[v] = dist[u] + 1 при первом посещении v.
## Решение: BFS с deque
@time: O(N + M) @memory: O(N + M)
```python
import sys
from collections import deque
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append(v)
    g[v].append(u)
dist = [-1] * (n + 1)
dist[1] = 0
q = deque([1])
while q:
    u = q.popleft()
    for v in g[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            q.append(v)
print(*dist[1:])
```
## Решение: BFS по уровням
@time: O(N + M) @memory: O(N + M)
Обрабатываем весь «фронт» сразу: список вершин на расстоянии d порождает следующий фронт.
```python
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
dist = [-1] * (n + 1)
dist[1] = 0
frontier = [1]
d = 0
while frontier:
    d += 1
    nxt = []
    for u in frontier:
        for v in g[u]:
            if dist[v] == -1:
                dist[v] = d
                nxt.append(v)
    frontier = nxt
print(*dist[1:])
```
## Объяснение
Каждая вершина попадает в очередь один раз, каждое ребро просматривается дважды — O(N + M).
## Генератор
```python
import json, random
random.seed(132)
t = ["1 0", "3 1\n2 3"]
for _ in range(4):
    n = random.randint(2, 30); m = random.randint(0, 40)
    edges = []
    for _ in range(m):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```

# id: task:connected-components
kind: task
title: Компоненты связности
category: Графы
level: medium
tags: DFS, BFS, DSU, компоненты
related: algo:dfs, algo:dsu
## Условие
Дан неориентированный граф из N вершин и M рёбер. Найдите количество компонент связности.
## Входные данные
N и M (до 2·10^5), затем M строк «u v».
## Выходные данные
Количество компонент.
## Примеры
```in
6 3
1 2
2 3
5 6
```
```out
3
```
## Подсказки
- Запускайте обход из каждой ещё не посещённой вершины.
- Каждый такой запуск — новая компонента.
- Рекурсивный DFS на 2·10^5 вершин переполнит стек — используйте явный стек или DSU.
## Решение: итеративный DFS
@time: O(N + M) @memory: O(N + M)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append(v)
    g[v].append(u)
seen = [False] * (n + 1)
comps = 0
for s in range(1, n + 1):
    if seen[s]:
        continue
    comps += 1
    seen[s] = True
    stack = [s]
    while stack:
        u = stack.pop()
        for v in g[u]:
            if not seen[v]:
                seen[v] = True
                stack.append(v)
print(comps)
```
## Решение: система непересекающихся множеств
@time: O((N + M) α(N)) @memory: O(N)
Каждое успешное объединение уменьшает число компонент на 1.
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
parent = list(range(n + 1))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

comps = n
for i in range(m):
    a, b = find(int(data[2 + 2 * i])), find(int(data[3 + 2 * i]))
    if a != b:
        parent[a] = b
        comps -= 1
print(comps)
```
## Объяснение
parent[x] = parent[parent[x]] — сжатие пути «через одного», оно делает деревья DSU почти плоскими.
## Генератор
```python
import json, random
random.seed(133)
t = ["1 0", "5 0", "3 3\n1 2\n2 3\n3 1"]
for _ in range(4):
    n = random.randint(2, 40); m = random.randint(0, 30)
    edges = []
    for _ in range(m):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```

# id: task:islands
kind: task
title: Количество островов
category: Графы
level: medium
tags: сетка, flood fill, BFS, DFS
related: algo:bfs, algo:dfs, algo:matrices
## Условие
Дана карта N×M: «#» — суша, «.» — вода. Остров — множество клеток суши, соединённых по сторонам. Сколько островов на карте?
## Входные данные
N и M (до 1000), затем N строк карты.
## Выходные данные
Количество островов.
## Примеры
```in
4 5
##..#
#...#
..#..
.....
```
```out
3
```
## Подсказки
- Каждая непосещённая клетка суши — начало нового острова.
- Обойдите весь остров (BFS/DFS) и отметьте клетки посещёнными.
- Соседи клетки: (r±1, c) и (r, c±1).
## Решение: BFS по клеткам
@time: O(N·M) @memory: O(N·M)
```python
from collections import deque
n, m = map(int, input().split())
g = [list(input().strip()) for _ in range(n)]
count = 0
for i in range(n):
    for j in range(m):
        if g[i][j] != "#":
            continue
        count += 1
        g[i][j] = "."
        q = deque([(i, j)])
        while q:
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == "#":
                    g[nr][nc] = "."
                    q.append((nr, nc))
print(count)
```
## Решение: DSU по клеткам
@time: O(N·M·α) @memory: O(N·M)
Клетка (i, j) — элемент i·M + j; объединяем с правым и нижним соседом-сушей.
```python
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
parent = list(range(n * m))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

land = 0
for i in range(n):
    for j in range(m):
        if g[i][j] != "#":
            continue
        land += 1
        for ni, nj in ((i + 1, j), (i, j + 1)):
            if ni < n and nj < m and g[ni][nj] == "#":
                a, b = find(i * m + j), find(ni * m + nj)
                if a != b:
                    parent[a] = b
                    land -= 1
print(land)
```
## Объяснение
Во втором способе land начинается с числа клеток суши и уменьшается при каждом объединении.
## Генератор
```python
import json, random
random.seed(134)
t = ["1 1\n.", "1 1\n#", "2 2\n##\n##"]
for _ in range(4):
    n, m = random.randint(1, 15), random.randint(1, 15)
    t.append("%d %d\n%s" % (n, m, "\n".join("".join("#" if random.random() < 0.45 else "." for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:maze-path
kind: task
title: Кратчайший путь в лабиринте
category: Графы
level: medium
tags: BFS, сетка, лабиринт
related: algo:bfs
## Условие
Дан лабиринт N×M: «.» — проход, «#» — стена, «S» — старт, «E» — выход. За ход можно сдвинуться на соседнюю по стороне клетку. Найдите минимальное число ходов от S до E или −1.
## Входные данные
N и M (до 1000), затем N строк.
## Выходные данные
Минимальное число ходов или −1.
## Примеры
```in
3 4
S.#.
..#E
....
```
```out
6
```
## Подсказки
- Каждая клетка — вершина, соседние проходимые клетки соединены рёбрами.
- BFS из S находит кратчайшие расстояния до всех клеток.
- Ответ — расстояние до E.
## Решение: BFS
@time: O(N·M) @memory: O(N·M)
```python
from collections import deque
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S":
            start = (i, j)
dist = [[-1] * m for _ in range(n)]
dist[start[0]][start[1]] = 0
q = deque([start])
ans = -1
while q:
    r, c = q.popleft()
    if g[r][c] == "E":
        ans = dist[r][c]
        break
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] != "#" and dist[nr][nc] == -1:
            dist[nr][nc] = dist[r][c] + 1
            q.append((nr, nc))
print(ans)
```
## Решение: двунаправленный BFS
@time: O(N·M) @memory: O(N·M)
Фронты растут от S и от E одновременно; встретившись, дают длину пути.
```python
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S":
            s = (i, j)
        elif g[i][j] == "E":
            e = (i, j)

def neighbors(cell):
    r, c = cell
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] != "#":
            yield (nr, nc)

da, db = {s: 0}, {e: 0}
fa, fb = [s], [e]
ans = 0 if s == e else -1
while fa and fb and ans == -1:
    if len(fa) > len(fb):
        da, db, fa, fb = db, da, fb, fa
    nxt = []
    for cell in fa:
        for nb in neighbors(cell):
            if nb in da:
                continue
            da[nb] = da[cell] + 1
            if nb in db:
                ans = da[nb] + db[nb]
                break
            nxt.append(nb)
        if ans != -1:
            break
    fa = nxt
print(ans)
```
## Объяснение
Двунаправленный поиск расширяет меньший фронт и на больших открытых полях просматривает заметно меньше клеток.
## Генератор
```python
import json, random
random.seed(135)
t = ["1 2\nSE", "1 3\nS#E", "2 2\nS.\n.E"]
for _ in range(4):
    n, m = random.randint(2, 12), random.randint(2, 12)
    g = [["#" if random.random() < 0.25 else "." for _ in range(m)] for _ in range(n)]
    cells = random.sample([(i, j) for i in range(n) for j in range(m)], 2)
    g[cells[0][0]][cells[0][1]] = "S"; g[cells[1][0]][cells[1][1]] = "E"
    t.append("%d %d\n%s" % (n, m, "\n".join("".join(r) for r in g)))
print(json.dumps(t))
```

# id: task:knight-moves
kind: task
title: Ход конём
category: Графы
level: medium
tags: BFS, шахматный конь, доска
related: algo:bfs
## Условие
На доске N×N конь стоит в клетке (x1, y1). За какое наименьшее число ходов он попадёт в клетку (x2, y2)? Если невозможно — −1.
## Входные данные
N (1 ≤ N ≤ 500), затем x1 y1 x2 y2 (от 1 до N).
## Выходные данные
Число ходов или −1.
## Примеры
```in
8
1 1 8 8
```
```out
6
```
## Подсказки
- Клетки — вершины, ходы коня — рёбра.
- У коня 8 вариантов хода: (±1, ±2) и (±2, ±1).
- BFS из стартовой клетки.
## Решение: BFS
@time: O(N²) @memory: O(N²)
```python
from collections import deque
n = int(input())
x1, y1, x2, y2 = map(int, input().split())
moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
dist = [[-1] * (n + 1) for _ in range(n + 1)]
dist[x1][y1] = 0
q = deque([(x1, y1)])
while q:
    x, y = q.popleft()
    for dx, dy in moves:
        nx, ny = x + dx, y + dy
        if 1 <= nx <= n and 1 <= ny <= n and dist[nx][ny] == -1:
            dist[nx][ny] = dist[x][y] + 1
            q.append((nx, ny))
print(dist[x2][y2])
```
## Решение: BFS со словарём расстояний
@time: O(N²) @memory: O(N²)
Останавливаемся, как только достигли цели.
```python
from collections import deque
n = int(input())
x1, y1, x2, y2 = map(int, input().split())
dist = {(x1, y1): 0}
q = deque([(x1, y1)])
ans = -1
while q:
    cell = q.popleft()
    if cell == (x2, y2):
        ans = dist[cell]
        break
    x, y = cell
    for dx, dy in ((1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)):
        nb = (x + dx, y + dy)
        if 1 <= nb[0] <= n and 1 <= nb[1] <= n and nb not in dist:
            dist[nb] = dist[cell] + 1
            q.append(nb)
print(ans)
```
## Объяснение
На досках 2×2 и 3×3 часть клеток недостижима (центр 3×3 — изолирована).
## Генератор
```python
import json
print(json.dumps(["1\n1 1 1 1", "2\n1 1 2 2", "3\n1 1 2 2", "3\n1 1 3 3", "8\n1 1 2 3", "100\n1 1 100 100", "500\n1 1 500 499"]))
```

# id: task:dijkstra
kind: task
title: Кратчайший путь во взвешенном графе
category: Графы
level: hard
tags: Дейкстра, heapq, кратчайший путь
related: algo:shortest-paths, lib:heapq.heappush
## Условие
Дан ориентированный граф из N вершин и M рёбер с неотрицательными весами. Найдите кратчайшие расстояния от вершины 1 до всех вершин (−1 для недостижимых).
## Входные данные
N и M (до 10^5), затем M строк «u v w» (0 ≤ w ≤ 10^9).
## Выходные данные
N чисел.
## Примеры
```in
4 5
1 2 4
1 3 1
3 2 2
2 4 1
3 4 5
```
```out
0 3 1 4
```
## Подсказки
- BFS не годится: веса разные.
- Дейкстра: каждый раз берите непосещённую вершину с минимальным расстоянием.
- Куча (heapq) хранит пары (расстояние, вершина); устаревшие записи пропускайте.
## Решение: Дейкстра с кучей
@time: O((N + M) log N) @memory: O(N + M)
```python
import sys
import heapq
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
for i in range(m):
    u, v, w = int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])
    g[u].append((v, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[1] = 0
heap = [(0, 1)]
while heap:
    d, u = heapq.heappop(heap)
    if d > dist[u]:
        continue
    for v, w in g[u]:
        nd = d + w
        if nd < dist[v]:
            dist[v] = nd
            heapq.heappush(heap, (nd, v))
print(*(x if x != INF else -1 for x in dist[1:]))
```
## Решение: Беллман–Форд (малые графы)
@time: O(N·M) @memory: O(N + M)
N−1 раз ослабляем все рёбра; работает и с отрицательными весами.
```python
n, m = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]
INF = float("inf")
dist = [INF] * (n + 1)
dist[1] = 0
for _ in range(n - 1):
    changed = False
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            changed = True
    if not changed:
        break
print(*(x if x != INF else -1 for x in dist[1:]))
```
## Решение: Дейкстра без кучи (плотные графы)
@time: O(N² + M) @memory: O(N + M)
Минимум ищется линейным просмотром — выгодно, когда M ≈ N².
```python
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    g[u].append((v, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[1] = 0
done = [False] * (n + 1)
for _ in range(n):
    u = -1
    for v in range(1, n + 1):
        if not done[v] and (u == -1 or dist[v] < dist[u]):
            u = v
    if dist[u] == INF:
        break
    done[u] = True
    for v, w in g[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
print(*(x if x != INF else -1 for x in dist[1:]))
```
## Объяснение
Проверка d > dist[u] отбрасывает устаревшие записи кучи — это проще, чем уменьшать ключ.
## Генератор
```python
import json, random
random.seed(136)
t = ["1 0", "2 0", "2 1\n2 1 5"]
for _ in range(4):
    n = random.randint(2, 30); m = random.randint(0, 60)
    t.append("%d %d\n%s" % (n, m, "\n".join("%d %d %d" % (random.randint(1, n), random.randint(1, n), random.randint(0, 20)) for _ in range(m))))
print(json.dumps(t))
```

# id: task:floyd
kind: task
title: Расстояния между всеми парами
category: Графы
level: hard
tags: Флойд–Уоршелл, матрица расстояний
related: algo:shortest-paths
## Условие
Дана матрица смежности взвешенного ориентированного графа из N вершин: число — вес ребра, −1 — ребра нет (на диагонали 0). Выведите матрицу кратчайших расстояний (−1, если пути нет). Отрицательных весов нет.
## Входные данные
N (1 ≤ N ≤ 100), затем N строк по N чисел.
## Выходные данные
N строк по N чисел.
## Примеры
```in
3
0 4 -1
-1 0 1
2 -1 0
```
```out
0 4 5
3 0 1
2 6 0
```
## Подсказки
- d[i][j] через промежуточную вершину k: d[i][k] + d[k][j].
- Перебирайте k во внешнем цикле!
- Отсутствующие рёбра — бесконечность.
## Решение: Флойд–Уоршелл
@time: O(N³) @memory: O(N²)
```python
n = int(input())
INF = float("inf")
d = [[INF if x == -1 else x for x in map(int, input().split())] for _ in range(n)]
for k in range(n):
    dk = d[k]
    for i in range(n):
        dik = d[i][k]
        if dik == INF:
            continue
        di = d[i]
        for j in range(n):
            if dik + dk[j] < di[j]:
                di[j] = dik + dk[j]
for row in d:
    print(*(x if x != INF else -1 for x in row))
```
## Решение: Дейкстра из каждой вершины
@time: O(N · N² log N) @memory: O(N²)
```python
import heapq
n = int(input())
w = [list(map(int, input().split())) for _ in range(n)]
for s in range(n):
    dist = [-1] * n
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if dist[u] != -1:
            continue
        dist[u] = d
        for v in range(n):
            if w[u][v] != -1 and dist[v] == -1:
                heapq.heappush(heap, (d + w[u][v], v))
    print(*dist)
```
## Объяснение
Порядок циклов k-i-j обязателен: после итерации k известны кратчайшие пути через вершины 0..k.
## Генератор
```python
import json, random
random.seed(137)
t = ["1\n0", "2\n0 -1\n-1 0"]
for _ in range(4):
    n = random.randint(2, 8)
    rows = []
    for i in range(n):
        rows.append(" ".join("0" if i == j else str(random.choice([-1, random.randint(0, 20)])) for j in range(n)))
    t.append("%d\n%s" % (n, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:has-cycle
kind: task
title: Есть ли цикл в графе
category: Графы
level: medium
tags: цикл, DSU, DFS, неориентированный граф
related: algo:dsu, algo:dfs
## Условие
Дан неориентированный граф из N вершин и M рёбер (без петель и кратных рёбер). Выведите YES, если в нём есть цикл, иначе NO.
## Входные данные
N и M (до 2·10^5), затем M строк «u v».
## Выходные данные
YES или NO.
## Примеры
```in
4 4
1 2
2 3
3 1
3 4
```
```out
YES
```
## Подсказки
- Ребро, соединяющее уже связанные вершины, замыкает цикл.
- DSU проверяет «уже связаны?» почти за O(1).
- Или: в лесу из K компонент ровно N − K рёбер.
## Решение: DSU
@time: O(M α(N)) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
parent = list(range(n + 1))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

cycle = False
for i in range(m):
    a, b = find(int(data[2 + 2 * i])), find(int(data[3 + 2 * i]))
    if a == b:
        cycle = True
        break
    parent[a] = b
print("YES" if cycle else "NO")
```
## Решение: подсчёт компонент
@time: O(N + M) @memory: O(N + M)
Граф без циклов (лес) с K компонентами имеет ровно N − K рёбер.
```python
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
seen = [False] * (n + 1)
k = 0
for s in range(1, n + 1):
    if not seen[s]:
        k += 1
        seen[s] = True
        stack = [s]
        while stack:
            u = stack.pop()
            for v in g[u]:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
print("YES" if m > n - k else "NO")
```
## Объяснение
Второй способ даёт ответ без поиска самого цикла.
## Генератор
```python
import json, random
random.seed(138)
t = ["1 0", "2 1\n1 2", "3 2\n1 2\n2 3", "3 3\n1 2\n2 3\n1 3"]
for _ in range(4):
    n = random.randint(2, 15)
    pairs = [(u, v) for u in range(1, n + 1) for v in range(u + 1, n + 1)]
    m = random.randint(0, min(len(pairs), n))
    edges = random.sample(pairs, m)
    t.append("%d %d\n%s" % (n, m, "\n".join("%d %d" % e for e in edges)))
print(json.dumps(t))
```

# id: task:bipartite
kind: task
title: Двудольный граф
category: Графы
level: medium
tags: двудольность, раскраска, BFS
related: algo:bfs, algo:graphs
## Условие
Дан неориентированный граф. Можно ли раскрасить вершины в два цвета так, чтобы концы каждого ребра были разного цвета? Выведите YES или NO.
## Входные данные
N и M (до 2·10^5), затем M строк «u v».
## Выходные данные
YES или NO.
## Примеры
```in
4 4
1 2
2 3
3 4
4 1
```
```out
YES
```
## Подсказки
- Покрасьте стартовую вершину в цвет 0, соседей — в 1, их соседей — в 0…
- Конфликт — ребро между вершинами одного цвета.
- Граф двудолен ⇔ в нём нет циклов нечётной длины.
## Решение: BFS-раскраска
@time: O(N + M) @memory: O(N + M)
```python
import sys
from collections import deque
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
g = [[] for _ in range(n + 1)]
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append(v)
    g[v].append(u)
color = [-1] * (n + 1)
ok = True
for s in range(1, n + 1):
    if color[s] != -1 or not ok:
        continue
    color[s] = 0
    q = deque([s])
    while q and ok:
        u = q.popleft()
        for v in g[u]:
            if color[v] == -1:
                color[v] = color[u] ^ 1
                q.append(v)
            elif color[v] == color[u]:
                ok = False
                break
print("YES" if ok else "NO")
```
## Решение: DSU с чётностью
@time: O(M α(N)) @memory: O(N)
Храним чётность пути до корня; ребро между вершинами одной чётности в одной компоненте — нечётный цикл.
```python
n, m = map(int, input().split())
parent = list(range(n + 1))
parity = [0] * (n + 1)

def find(x):
    path = []
    while parent[x] != x:
        path.append(x)
        x = parent[x]
    root = x
    for v in reversed(path):
        p = parent[v]
        if p != root:
            parity[v] ^= parity[p]
        parent[v] = root
    return root

ok = True
for _ in range(m):
    u, v = map(int, input().split())
    ru, rv = find(u), find(v)
    if ru == rv:
        if parity[u] == parity[v]:
            ok = False
    else:
        parent[ru] = rv
        parity[ru] = parity[u] ^ parity[v] ^ 1
print("YES" if ok else "NO")
```
## Объяснение
В DSU с чётностью parity[v] — цвет v относительно корня его компоненты.
## Генератор
```python
import json, random
random.seed(139)
t = ["1 0", "3 3\n1 2\n2 3\n3 1", "2 1\n1 2"]
for _ in range(5):
    n = random.randint(2, 12); m = random.randint(0, 15)
    edges = []
    for _ in range(m):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```

# id: task:topo-sort
kind: task
title: Порядок выполнения задач
category: Графы
level: hard
tags: топологическая сортировка, Кан, heapq
related: algo:topological-sort, lib:graphlib.TopologicalSorter
## Условие
Есть N задач и M зависимостей «u v»: задачу u нужно выполнить раньше v. Выведите порядок выполнения всех задач; если вариантов несколько — лексикографически наименьший. Если порядка нет (есть цикл), выведите −1.
## Входные данные
N и M (до 10^5), затем M строк «u v».
## Выходные данные
N номеров задач или −1.
## Примеры
```in
4 3
3 1
2 1
3 4
```
```out
2 3 1 4
```
## Подсказки
- Задачу можно выполнять, когда все её предшественники выполнены (входящая степень 0).
- Алгоритм Кана: берите задачу с нулевой степенью, удаляйте её рёбра.
- Для лексикографического минимума выбирайте наименьший номер — с помощью кучи.
## Решение: Кан с кучей
@time: O((N + M) log N) @memory: O(N + M)
```python
import heapq
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    indeg[v] += 1
heap = [v for v in range(1, n + 1) if indeg[v] == 0]
heapq.heapify(heap)
order = []
while heap:
    u = heapq.heappop(heap)
    order.append(u)
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            heapq.heappush(heap, v)
print(*order if len(order) == n else [-1])
```
## Решение: graphlib.TopologicalSorter
@time: O((N + M) log N) @memory: O(N + M)
Стандартный модуль graphlib (Python 3.9+) выдаёт «готовые» вершины партиями; наименьшую берём из кучи.
```python
import heapq
from graphlib import TopologicalSorter, CycleError
n, m = map(int, input().split())
ts = TopologicalSorter()
for v in range(1, n + 1):
    ts.add(v)
for _ in range(m):
    u, v = map(int, input().split())
    ts.add(v, u)
try:
    ts.prepare()
    heap = list(ts.get_ready())
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        ts.done(u)
        for v in ts.get_ready():
            heapq.heappush(heap, v)
    print(*order)
except CycleError:
    print(-1)
```
## Объяснение
ts.add(v, u) означает «v зависит от u». prepare() бросает CycleError, если зависимости циклические.
## Генератор
```python
import json, random
random.seed(140)
t = ["1 0", "2 2\n1 2\n2 1", "3 0"]
for _ in range(5):
    n = random.randint(2, 12)
    perm = list(range(1, n + 1)); random.shuffle(perm)
    m = random.randint(0, 15)
    edges = []
    for _ in range(m):
        i, j = sorted(random.sample(range(n), 2)); edges.append("%d %d" % (perm[i], perm[j]))
    if random.random() < 0.3 and edges:
        u, v = map(int, edges[0].split()); edges.append("%d %d" % (v, u)); m += 1
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```

# id: task:dsu-queries
kind: task
title: Объединение и проверка множеств
category: DSU
level: medium
tags: DSU, union-find, запросы
related: algo:dsu
## Условие
Есть N элементов, каждый — в своём множестве. Обрабатываются запросы: «union a b» — объединить множества a и b; «get a b» — вывести YES, если a и b в одном множестве, иначе NO.
## Входные данные
N и Q (до 2·10^5), затем Q запросов.
## Выходные данные
Ответы на запросы get.
## Примеры
```in
4 4
get 1 2
union 1 2
union 2 3
get 1 3
```
```out
NO
YES
```
## Подсказки
- Каждое множество — дерево, представитель — корень.
- find поднимается к корню; сжатие путей делает деревья плоскими.
- union подвешивает корень меньшего дерева к корню большего.
## Решение: DSU с рангами и сжатием путей
@time: O(Q α(N)) @memory: O(N)
```python
import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
parent = list(range(n + 1))
size = [1] * (n + 1)

def find(x):
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != root:
        parent[x], x = root, parent[x]
    return root

out = []
pos = 2
for _ in range(q):
    cmd, a, b = data[pos], int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    ra, rb = find(a), find(b)
    if cmd == "union":
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
    else:
        out.append("YES" if ra == rb else "NO")
print("\n".join(out))
```
## Решение: метки компонент со слиянием меньшего в большее
@time: O(N log N + Q) @memory: O(N)
Каждый элемент хранит номер компоненты; при объединении перекрашиваем меньшую компоненту.
```python
n, q = map(int, input().split())
label = list(range(n + 1))
members = {i: [i] for i in range(n + 1)}
for _ in range(q):
    cmd, a, b = input().split()
    a, b = int(a), int(b)
    la, lb = label[a], label[b]
    if cmd == "get":
        print("YES" if la == lb else "NO")
    elif la != lb:
        if len(members[la]) < len(members[lb]):
            la, lb = lb, la
        for x in members[lb]:
            label[x] = la
        members[la].extend(members.pop(lb))
```
## Объяснение
Каждый элемент перекрашивается не более log N раз: при перекраске размер его компоненты как минимум удваивается.
## Генератор
```python
import json, random
random.seed(141)
t = []
for _ in range(5):
    n = random.randint(1, 12); q = random.randint(1, 25)
    qs = ["%s %d %d" % (random.choice(["union", "get", "get"]), random.randint(1, n), random.randint(1, n)) for _ in range(q)]
    t.append("%d %d\n%s" % (n, q, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:mst
kind: task
title: Минимальное остовное дерево
category: Графы
level: hard
tags: Краскал, Прим, DSU, остов
related: algo:mst, algo:dsu
## Условие
Дан связный неориентированный взвешенный граф из N вершин и M рёбер. Найдите суммарный вес минимального остовного дерева.
## Входные данные
N и M (до 10^5), затем M строк «u v w».
## Выходные данные
Вес минимального остова.
## Примеры
```in
4 5
1 2 1
2 3 2
3 4 3
1 4 4
1 3 5
```
```out
6
```
## Подсказки
- Остов — N−1 рёбер, связывающих все вершины без циклов.
- Краскал: рёбра по возрастанию веса, берём ребро, если оно не создаёт цикл (DSU).
- Прим: растим дерево от одной вершины, добавляя самое лёгкое ребро наружу (куча).
## Решение: Краскал
@time: O(M log M) @memory: O(N + M)
```python
import sys
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
edges = sorted((int(data[4 + 3 * i]), int(data[2 + 3 * i]), int(data[3 + 3 * i])) for i in range(m))
parent = list(range(n + 1))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

total = 0
for w, u, v in edges:
    ru, rv = find(u), find(v)
    if ru != rv:
        parent[ru] = rv
        total += w
print(total)
```
## Решение: Прим с кучей
@time: O(M log N) @memory: O(N + M)
```python
import heapq
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    g[u].append((w, v))
    g[v].append((w, u))
used = [False] * (n + 1)
heap = [(0, 1)]
total = 0
while heap:
    w, u = heapq.heappop(heap)
    if used[u]:
        continue
    used[u] = True
    total += w
    for e in g[u]:
        if not used[e[1]]:
            heapq.heappush(heap, e)
print(total)
```
## Объяснение
Оба алгоритма опираются на свойство разреза: самое лёгкое ребро через любой разрез входит в некоторый минимальный остов.
## Генератор
```python
import json, random
random.seed(142)
t = ["1 0", "2 1\n1 2 7"]
for _ in range(4):
    n = random.randint(2, 15)
    edges = ["%d %d %d" % (i, random.randint(1, i - 1), random.randint(1, 30)) for i in range(2, n + 1)]
    for _ in range(random.randint(0, 20)):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d %d" % (u, v, random.randint(1, 30)))
    t.append("%d %d\n%s" % (n, len(edges), "\n".join(edges)))
print(json.dumps(t))
```

# id: task:tree-diameter
kind: task
title: Диаметр дерева
category: Деревья
level: medium
tags: дерево, диаметр, два BFS
related: algo:trees, algo:bfs
## Условие
Дано дерево из N вершин. Найдите его диаметр — наибольшее число рёбер на пути между двумя вершинами.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N−1 строк «u v».
## Выходные данные
Диаметр.
## Примеры
```in
5
1 2
1 3
3 4
3 5
```
```out
3
```
## Подсказки
- Найдите самую удалённую вершину A от любой вершины.
- Самая удалённая от A вершина B — второй конец диаметра.
- Расстояние A–B и есть ответ (два обхода в ширину).
## Решение: два BFS
@time: O(N) @memory: O(N)
```python
import sys
from collections import deque
data = sys.stdin.buffer.read().split()
n = int(data[0])
g = [[] for _ in range(n + 1)]
for i in range(n - 1):
    u, v = int(data[1 + 2 * i]), int(data[2 + 2 * i])
    g[u].append(v)
    g[v].append(u)

def bfs(s):
    dist = [-1] * (n + 1)
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v in g[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    far = max(range(1, n + 1), key=lambda v: dist[v])
    return far, dist[far]

a, _ = bfs(1)
_, d = bfs(a)
print(d)
```
## Решение: динамика по поддеревьям
@time: O(N) @memory: O(N)
Для каждой вершины берём две самые длинные «ветки» вниз; итеративный обход в порядке, обратном BFS.
```python
n = int(input())
g = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
order = [1]
parent = [0] * (n + 1)
parent[1] = -1
for u in order:
    for v in g[u]:
        if v != parent[u]:
            parent[v] = u
            order.append(v)
down = [0] * (n + 1)
best = 0
for u in reversed(order):
    top1 = top2 = 0
    for v in g[u]:
        if v != parent[u]:
            h = down[v] + 1
            if h > top1:
                top1, top2 = h, top1
            elif h > top2:
                top2 = h
    down[u] = top1
    best = max(best, top1 + top2)
print(best)
```
## Объяснение
Цикл for u in order, дописывающий в order во время прохода, — компактный BFS без deque.
## Генератор
```python
import json, random
random.seed(143)
t = ["1", "2\n1 2"]
for _ in range(5):
    n = random.randint(2, 60)
    t.append("%d\n%s" % (n, "\n".join("%d %d" % (i, random.randint(1, i - 1)) for i in range(2, n + 1))))
print(json.dumps(t))
```

# id: task:subtree-sizes
kind: task
title: Размеры поддеревьев
category: Деревья
level: medium
tags: дерево, поддерево, обход
related: algo:trees, algo:dfs
## Условие
Дано дерево из N вершин с корнем 1. Для каждой вершины выведите количество вершин в её поддереве (включая её саму).
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N−1 строк «u v».
## Выходные данные
N чисел.
## Примеры
```in
5
1 2
1 3
3 4
3 5
```
```out
5 1 3 1 1
```
## Подсказки
- Размер поддерева = 1 + сумма размеров поддеревьев детей.
- Детей нужно обработать раньше родителя.
- Порядок BFS, пройденный в обратную сторону, обрабатывает детей раньше.
## Решение: обратный порядок BFS
@time: O(N) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n = int(data[0])
g = [[] for _ in range(n + 1)]
for i in range(n - 1):
    u, v = int(data[1 + 2 * i]), int(data[2 + 2 * i])
    g[u].append(v)
    g[v].append(u)
parent = [0] * (n + 1)
parent[1] = -1
order = [1]
for u in order:
    for v in g[u]:
        if v != parent[u]:
            parent[v] = u
            order.append(v)
size = [1] * (n + 1)
for u in reversed(order):
    if parent[u] > 0:
        size[parent[u]] += size[u]
print(*size[1:])
```
## Решение: рекурсивный DFS с увеличенным стеком
@time: O(N) @memory: O(N)
Рекурсия нагляднее, но для глубоких деревьев нужен отдельный поток с большим стеком.
```python
import sys
import threading

def main():
    n = int(input())
    g = [[] for _ in range(n + 1)]
    for _ in range(n - 1):
        u, v = map(int, input().split())
        g[u].append(v)
        g[v].append(u)
    size = [0] * (n + 1)

    def dfs(u, p):
        size[u] = 1
        for v in g[u]:
            if v != p:
                dfs(v, u)
                size[u] += size[v]

    dfs(1, 0)
    print(*size[1:])

sys.setrecursionlimit(1 << 20)
threading.stack_size(1 << 26)
t = threading.Thread(target=main)
t.start()
t.join()
```
## Объяснение
threading.stack_size увеличивает стек нового потока — стандартный приём для глубокой рекурсии в Python.
## Генератор
```python
import json, random
random.seed(144)
t = ["1", "3\n1 2\n2 3"]
for _ in range(4):
    n = random.randint(2, 50)
    t.append("%d\n%s" % (n, "\n".join("%d %d" % (random.randint(1, i - 1), i) for i in range(2, n + 1))))
t.append("2000\n" + "\n".join("%d %d" % (i - 1, i) for i in range(2, 2001)))
print(json.dumps(t))
```

# id: task:lca
kind: task
title: Расстояние между вершинами дерева
category: Деревья
level: very_hard
tags: LCA, двоичные подъёмы, дерево, запросы
related: algo:trees, algo:bits
## Условие
Дано дерево из N вершин и Q запросов «u v». На каждый запрос выведите расстояние (число рёбер) между u и v.
## Входные данные
N (до 10^5), затем N−1 строк «u v», затем Q (до 10^5) и Q строк запросов.
## Выходные данные
Q чисел.
## Примеры
```in
5
1 2
1 3
3 4
3 5
3
4 5
2 4
1 1
```
```out
2
3
0
```
## Подсказки
- dist(u, v) = depth[u] + depth[v] − 2·depth[lca(u, v)].
- Двоичные подъёмы: up[k][v] — предок v на 2^k уровней выше.
- Выровняйте глубины, затем поднимайте обе вершины, пока предки различны.
## Решение: двоичные подъёмы
@time: O((N + Q) log N) @memory: O(N log N)
```python
import sys
data = sys.stdin.buffer.read().split()
n = int(data[0])
g = [[] for _ in range(n + 1)]
pos = 1
for _ in range(n - 1):
    u, v = int(data[pos]), int(data[pos + 1])
    pos += 2
    g[u].append(v)
    g[v].append(u)
LOG = max(1, n.bit_length())
up = [[0] * (n + 1) for _ in range(LOG)]
depth = [0] * (n + 1)
order = [1]
seen = [False] * (n + 1)
seen[1] = True
up[0][1] = 1
for u in order:
    for v in g[u]:
        if not seen[v]:
            seen[v] = True
            depth[v] = depth[u] + 1
            up[0][v] = u
            order.append(v)
for k in range(1, LOG):
    prev, cur = up[k - 1], up[k]
    for v in range(1, n + 1):
        cur[v] = prev[prev[v]]

def lca(a, b):
    if depth[a] < depth[b]:
        a, b = b, a
    diff = depth[a] - depth[b]
    k = 0
    while diff:
        if diff & 1:
            a = up[k][a]
        diff >>= 1
        k += 1
    if a == b:
        return a
    for k in range(LOG - 1, -1, -1):
        if up[k][a] != up[k][b]:
            a, b = up[k][a], up[k][b]
    return up[0][a]

q = int(data[pos])
pos += 1
out = []
for _ in range(q):
    u, v = int(data[pos]), int(data[pos + 1])
    pos += 2
    out.append(depth[u] + depth[v] - 2 * depth[lca(u, v)])
print("\n".join(map(str, out)))
```
## Решение: подъём по родителям (малые деревья)
@time: O(Q·N) @memory: O(N)
Поднимаем более глубокую вершину по одному шагу, пока вершины не совпадут.
```python
n = int(input())
g = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
parent = [0] * (n + 1)
depth = [0] * (n + 1)
order = [1]
parent[1] = 0
for u in order:
    for v in g[u]:
        if v != parent[u]:
            parent[v] = u
            depth[v] = depth[u] + 1
            order.append(v)
for _ in range(int(input())):
    u, v = map(int, input().split())
    d = 0
    while u != v:
        if depth[u] < depth[v]:
            u, v = v, u
        u = parent[u]
        d += 1
    print(d)
```
## Объяснение
Для корня up[0][1] = 1 — подъём «выше корня» остаётся в корне, что упрощает код.
## Генератор
```python
import json, random
random.seed(145)
t = []
for _ in range(5):
    n = random.randint(1, 40)
    edges = "\n".join("%d %d" % (random.randint(1, i - 1), i) for i in range(2, n + 1))
    q = random.randint(1, 15)
    qs = "\n".join("%d %d" % (random.randint(1, n), random.randint(1, n)) for _ in range(q))
    t.append("%d\n%s%s%d\n%s" % (n, edges, "\n" if edges else "", q, qs))
print(json.dumps(t))
```

# id: task:dag-paths
kind: task
title: Число путей в ациклическом графе
category: Графы
level: hard
tags: DAG, DP, топологический порядок
related: algo:topological-sort, algo:dp
## Условие
Дан ориентированный ациклический граф из N вершин и M рёбер. Сколько существует различных путей из вершины 1 в вершину N? Ответ по модулю 10^9 + 7.
## Входные данные
N и M (до 10^5), затем M строк «u v».
## Выходные данные
Количество путей.
## Примеры
```in
4 5
1 2
1 3
2 4
3 4
2 3
```
```out
3
```
## Подсказки
- ways[v] = сумма ways[u] по всем рёбрам u → v.
- Считайте вершины в топологическом порядке.
- ways[1] = 1.
## Решение: DP в топологическом порядке
@time: O(N + M) @memory: O(N + M)
```python
import sys
from collections import deque
data = sys.stdin.buffer.read().split()
n, m = int(data[0]), int(data[1])
MOD = 10**9 + 7
g = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for i in range(m):
    u, v = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    g[u].append(v)
    indeg[v] += 1
ways = [0] * (n + 1)
ways[1] = 1
q = deque(v for v in range(1, n + 1) if indeg[v] == 0)
while q:
    u = q.popleft()
    for v in g[u]:
        ways[v] = (ways[v] + ways[u]) % MOD
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
print(ways[n])
```
## Решение: рекурсия с памятью
@time: O(N + M) @memory: O(N + M)
paths(v) — число путей из v в N; для глубоких графов увеличиваем лимит рекурсии.
```python
import sys
from functools import lru_cache
sys.setrecursionlimit(10000)
n, m = map(int, input().split())
MOD = 10**9 + 7
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)

@lru_cache(maxsize=None)
def paths(v):
    if v == n:
        return 1
    return sum(paths(u) for u in g[v]) % MOD

print(paths(1))
```
## Объяснение
Первый способ не использует рекурсию и подходит для очень длинных цепочек.
## Генератор
```python
import json, random
random.seed(146)
t = ["1 0", "2 0", "2 1\n1 2"]
for _ in range(4):
    n = random.randint(2, 15)
    m = random.randint(0, 30)
    edges = []
    for _ in range(m):
        u, v = sorted(random.sample(range(1, n + 1), 2)); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s" % (n, m, "\n".join(edges)))
print(json.dumps(t))
```
