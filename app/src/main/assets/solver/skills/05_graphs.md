# Solver skills: graphs and grids.

# skill: bfs_shortest
title: Кратчайший путь в невзвешенном графе
topics: Графы; Обход в ширину (BFS)
match: (SHORTEST | DISTANCE | BFS) & (GRAPH | VERTEX | EDGE) & !WEIGHT & !DIJKSTRA & !MAZE
priority: 2.5
input_desc: Первая строка: n m s t — вершины, рёбра, начало и конец. Далее m строк «u v» — неориентированные рёбра (вершины с 1).
output_desc: Длина кратчайшего пути (число рёбер) из s в t или -1.
understood: Дан неориентированный граф без весов. Найти длину кратчайшего пути из вершины s в вершину t.
algorithm: Обход в ширину (BFS)
why: BFS посещает вершины слоями по расстоянию от s, поэтому первое посещение вершины — по кратчайшему пути. Время O(n + m).
ideas: Очередь deque; Список смежности; dist[v] = -1 — не посещена
structures: list[list] (список смежности), deque
links: algo:bfs, algo:graphs, lib:collections.deque
edge: s == t: ответ 0.
edge: t недостижима: -1.
edge: Петли и кратные рёбра не мешают.
step: Строим список смежности.
step: dist[s] = 0, кладём s в очередь.
step: Достаём вершину v, для каждого непосещённого соседа u: dist[u] = dist[v] + 1, кладём u в очередь.
sample: 5 5 1 5\n1 2\n2 3\n3 5\n1 4\n4 5 => 2
sample: 3 1 1 3\n1 2 => -1
sample: 1 0 1 1 => 0
sample: 6 6 1 6\n1 2\n2 3\n3 4\n4 5\n5 6\n1 6 => 1

## BFS с deque
approach: bfs
role: beginner
time: O(n + m)
memory: O(n + m)
idea: Очередь обрабатывает вершины в порядке удаления от s.
principle: popleft() у deque — O(1). Каждая вершина и ребро обрабатываются один раз.
pros: Оптимально для невзвешенных графов
cons: —
when: Всегда для кратчайших путей без весов.
readability: 5
```python
from collections import deque

n, m, s, t = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
dist = [-1] * (n + 1)
dist[s] = 0
queue = deque([s])
while queue:
    v = queue.popleft()
    for u in graph[v]:
        if dist[u] == -1:
            dist[u] = dist[v] + 1
            queue.append(u)
print(dist[t])
```

## BFS по слоям
approach: layers
role: alternative
time: O(n + m)
memory: O(n + m)
idea: Храним текущий «фронт» вершин и строим следующий слой.
principle: Номер слоя — расстояние. Останавливаемся, когда t попала во фронт.
pros: Наглядно видно «волну»
cons: Чуть больше кода
when: Для объяснения волнового алгоритма.
readability: 4
```python
n, m, s, t = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
seen = {s}
frontier = [s]
step = 0
answer = -1
while frontier:
    if t in frontier:
        answer = step
        break
    nxt = []
    for v in frontier:
        for u in graph[v]:
            if u not in seen:
                seen.add(u)
                nxt.append(u)
    frontier = nxt
    step += 1
print(answer)
```

## Дейкстра (работает и здесь)
approach: dijkstra
role: alternative
time: O((n + m) log n)
memory: O(n + m)
idea: Все рёбра имеют вес 1 — Дейкстра тоже находит кратчайший путь.
principle: Куча всегда отдаёт вершину с наименьшим известным расстоянием.
pros: Тот же код подойдёт для весов
cons: Медленнее BFS
when: Если позже появятся веса рёбер.
readability: 4
```python
import heapq

n, m, s, t = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
INF = float("inf")
dist = [INF] * (n + 1)
dist[s] = 0
heap = [(0, s)]
while heap:
    d, v = heapq.heappop(heap)
    if d > dist[v]:
        continue
    for u in graph[v]:
        if d + 1 < dist[u]:
            dist[u] = d + 1
            heapq.heappush(heap, (d + 1, u))
print(dist[t] if dist[t] != INF else -1)
```

# skill: components
title: Количество компонент связности
topics: Графы; DFS; DSU
match: COMPONENTS & !ISLAND
priority: 2.5
input_desc: Первая строка: n m. Далее m строк «u v» — неориентированные рёбра (вершины с 1).
output_desc: Количество компонент связности графа.
understood: Дан неориентированный граф. Найти количество компонент связности.
algorithm: Обход графа (DFS/BFS) из каждой непосещённой вершины
why: Каждый запуск обхода из новой вершины помечает целую компоненту.
ideas: DFS итеративный со стеком; DSU (система непересекающихся множеств)
structures: list[list], list (стек)
links: algo:dfs, algo:bfs, algo:dsu, algo:graphs
edge: Изолированные вершины — отдельные компоненты.
edge: m = 0: ответ n.
sample: 5 3\n1 2\n2 3\n4 5 => 2
sample: 4 0 => 4
sample: 3 3\n1 2\n2 3\n3 1 => 1

## DFS со стеком
approach: dfs
role: beginner
time: O(n + m)
memory: O(n + m)
idea: Из каждой непосещённой вершины обходим её компоненту.
principle: Стек вместо рекурсии — нет ограничения глубины.
pros: Надёжно для больших графов
cons: —
when: Обычно.
readability: 5
```python
n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
seen = [False] * (n + 1)
count = 0
for start in range(1, n + 1):
    if seen[start]:
        continue
    count += 1
    seen[start] = True
    stack = [start]
    while stack:
        v = stack.pop()
        for u in graph[v]:
            if not seen[u]:
                seen[u] = True
                stack.append(u)
print(count)
```

## DSU
approach: dsu
role: efficient
time: O((n + m) · α(n))
memory: O(n)
idea: Объединяем концы каждого ребра; число компонент = n − число успешных объединений.
principle: find со сжатием путей и union по размеру работают почти за O(1).
pros: Не нужен список смежности; рёбра можно обрабатывать по одному
cons: —
when: Когда рёбра приходят потоком.
readability: 4
```python
n, m = map(int, input().split())
parent = list(range(n + 1))


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


components = n
for _ in range(m):
    a, b = map(lambda x: find(int(x)), input().split())
    if a != b:
        parent[a] = b
        components -= 1
print(components)
```

## Рекурсивный DFS
approach: dfs-rec
role: alternative
time: O(n + m)
memory: O(n + m)
idea: Классический рекурсивный обход.
principle: dfs(v) помечает v и вызывает себя для непосещённых соседей. Нужно увеличить лимит рекурсии.
pros: Короткий и естественный код
cons: Глубина рекурсии до n
when: Для небольших графов.
readability: 4
```python
import sys

sys.setrecursionlimit(100000)
n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
seen = [False] * (n + 1)


def dfs(v):
    seen[v] = True
    for u in graph[v]:
        if not seen[u]:
            dfs(u)


count = 0
for v in range(1, n + 1):
    if not seen[v]:
        dfs(v)
        count += 1
print(count)
```

## BFS
approach: bfs
role: alternative
time: O(n + m)
memory: O(n + m)
idea: То же самое обходом в ширину.
principle: Очередь вместо стека — порядок посещения другой, результат тот же.
pros: —
cons: —
when: Если BFS уже написан.
readability: 5
```python
from collections import deque

n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
seen = [False] * (n + 1)
count = 0
for s in range(1, n + 1):
    if seen[s]:
        continue
    count += 1
    seen[s] = True
    queue = deque([s])
    while queue:
        v = queue.popleft()
        for u in graph[v]:
            if not seen[u]:
                seen[u] = True
                queue.append(u)
print(count)
```

# skill: dijkstra
title: Кратчайший путь во взвешенном графе (Дейкстра)
topics: Графы; Кратчайшие пути
match: (SHORTEST | DISTANCE | DIJKSTRA | MIN) & (GRAPH | VERTEX | EDGE) & (WEIGHT | DIJKSTRA | VALUE)
priority: 2.7
input_desc: Первая строка: n m s t. Далее m строк «u v w» — неориентированное ребро веса w ≥ 0.
output_desc: Длина кратчайшего пути из s в t или -1.
understood: Дан взвешенный неориентированный граф с неотрицательными весами. Найти длину кратчайшего пути из s в t.
algorithm: Алгоритм Дейкстры с кучей
why: Вершина, извлечённая из кучи с минимальным расстоянием, уже имеет окончательное расстояние (веса неотрицательны). O((n + m) log n).
ideas: heapq; Ленивое удаление устаревших записей; Релаксация рёбер
structures: list[list], heapq
links: algo:dijkstra, lib:heapq, algo:bellman-ford
edge: Отрицательные веса — Дейкстра неприменима (нужен Беллман–Форд).
edge: t недостижима — -1.
sample: 4 5 1 4\n1 2 1\n2 4 5\n1 3 2\n3 4 1\n2 3 1 => 3
sample: 2 0 1 2 => -1
sample: 3 3 1 3\n1 2 10\n2 3 10\n1 3 25 => 20

## Дейкстра с heapq
approach: heap
role: efficient
time: O((n + m) log n)
memory: O(n + m)
idea: Куча хранит пары (расстояние, вершина); извлекаем ближайшую и релаксируем её рёбра.
principle: Устаревшие записи (d > dist[v]) пропускаем.
pros: Стандарт для неотрицательных весов
cons: Не работает с отрицательными весами
when: Обычно.
readability: 4
```python
import heapq

n, m, s, t = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    graph[u].append((v, w))
    graph[v].append((u, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[s] = 0
heap = [(0, s)]
while heap:
    d, v = heapq.heappop(heap)
    if d > dist[v]:
        continue
    for u, w in graph[v]:
        if d + w < dist[u]:
            dist[u] = d + w
            heapq.heappush(heap, (dist[u], u))
print(dist[t] if dist[t] != INF else -1)
```

## Дейкстра за O(n²)
approach: array
role: beginner
time: O(n² + m)
memory: O(n + m)
idea: На каждом шаге линейно ищем непосещённую вершину с минимальным расстоянием.
principle: Без кучи; хорошо для плотных графов.
pros: Проще понять
cons: Медленно для больших разреженных графов
when: Для плотных графов или обучения.
readability: 4
```python
n, m, s, t = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    graph[u].append((v, w))
    graph[v].append((u, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[s] = 0
used = [False] * (n + 1)
for _ in range(n):
    v = -1
    for i in range(1, n + 1):
        if not used[i] and (v == -1 or dist[i] < dist[v]):
            v = i
    if v == -1 or dist[v] == INF:
        break
    used[v] = True
    for u, w in graph[v]:
        dist[u] = min(dist[u], dist[v] + w)
print(dist[t] if dist[t] != INF else -1)
```

## Беллман–Форд
approach: bellman-ford
role: alternative
time: O(n · m)
memory: O(n + m)
idea: n − 1 раз релаксируем все рёбра.
principle: Кратчайший путь содержит не больше n − 1 рёбер; после k проходов найдены все пути из ≤ k рёбер.
pros: Работает с отрицательными весами
cons: Медленно
when: Если есть отрицательные веса (без отрицательных циклов).
readability: 4
```python
n, m, s, t = map(int, input().split())
edges = []
for _ in range(m):
    u, v, w = map(int, input().split())
    edges.append((u, v, w))
    edges.append((v, u, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[s] = 0
for _ in range(n - 1):
    changed = False
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            changed = True
    if not changed:
        break
print(dist[t] if dist[t] != INF else -1)
```

# skill: topo_sort
title: Топологическая сортировка
topics: Графы; Ориентированные ациклические графы
match: TOPOLOGICAL | (SORT & GRAPH & EDGE)
priority: 2.7
input_desc: Первая строка: n m. Далее m строк «u v» — ребро u → v (u должно идти раньше v).
output_desc: Лексикографически наименьший топологический порядок вершин или NO, если есть цикл.
understood: Дан ориентированный граф (зависимости «u раньше v»). Упорядочить вершины так, чтобы все рёбра шли слева направо (выбирая наименьший номер при выборе), или сообщить о цикле.
algorithm: Алгоритм Кана с приоритетной очередью
why: Вершину с нулевой входящей степенью можно ставить первой; куча выбирает наименьшую из доступных.
ideas: Входящие степени; Куча для лексикографического порядка; Цикл ⇔ не все вершины выведены
structures: list[list], heapq
links: algo:topological-sort, lib:heapq, algo:graphs
edge: Цикл — NO.
edge: Несколько правильных порядков — выводим лексикографически наименьший.
sample: 4 3\n1 2\n1 3\n3 4 => 1 2 3 4
sample: 3 3\n1 2\n2 3\n3 1 => NO
sample: 3 1\n3 1 => 2 3 1

## Кан + heapq
approach: kahn-heap
role: efficient
time: O((n + m) log n)
memory: O(n + m)
idea: Куча доступных вершин (входящая степень 0); берём наименьшую.
principle: После удаления вершины уменьшаем степени её потомков.
pros: Быстро, сразу обнаруживает цикл
cons: —
when: Обычно.
readability: 4
```python
import heapq

n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    indeg[v] += 1
heap = [v for v in range(1, n + 1) if indeg[v] == 0]
heapq.heapify(heap)
order = []
while heap:
    v = heapq.heappop(heap)
    order.append(v)
    for u in graph[v]:
        indeg[u] -= 1
        if indeg[u] == 0:
            heapq.heappush(heap, u)
print(*order if len(order) == n else ["NO"])
```

## Поиск минимальной доступной вершины
approach: scan
role: beginner
time: O(n² + m)
memory: O(n + m)
idea: n раз ищем наименьшую непосещённую вершину с входящей степенью 0.
principle: Тот же алгоритм Кана без кучи.
pros: Понятно
cons: O(n²)
when: Для небольших графов.
readability: 5
```python
n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    indeg[v] += 1
done = [False] * (n + 1)
order = []
for _ in range(n):
    v = next((x for x in range(1, n + 1) if not done[x] and indeg[x] == 0), None)
    if v is None:
        break
    done[v] = True
    order.append(v)
    for u in graph[v]:
        indeg[u] -= 1
print(*order if len(order) == n else ["NO"])
```

# skill: dsu_queries
title: Система непересекающихся множеств (DSU)
topics: DSU; Графы
match: DSU
priority: 2.6
input_desc: Первая строка: n q. Далее q строк: «1 a b» — объединить a и b; «2 a b» — проверить, в одном ли множестве a и b.
output_desc: Для каждого запроса типа 2 — YES или NO.
understood: Есть n элементов. Обработать запросы: объединить два множества и проверить, лежат ли два элемента в одном множестве.
algorithm: DSU со сжатием путей и объединением по размеру
why: Каждое множество — дерево; find поднимается к корню, сжатие путей делает деревья почти плоскими. Операции почти O(1).
ideas: parent[x]; Сжатие путей; Объединение по размеру
structures: list
links: algo:dsu
edge: Объединение уже связанных элементов ничего не меняет.
sample: 5 5\n1 1 2\n2 1 2\n2 1 3\n1 2 3\n2 1 3 => YES\nNO\nYES
sample: 2 1\n2 1 1 => YES

## DSU
approach: dsu
role: efficient
time: O(q · α(n))
memory: O(n)
idea: find со сжатием путей, union по размеру.
principle: Меньшее дерево подвешивается к большему — высота остаётся маленькой.
pros: Почти константное время на запрос
cons: —
when: Всегда.
readability: 4
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
    kind, a, b = data[pos], int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    ra, rb = find(a), find(b)
    if kind == "1":
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
    else:
        out.append("YES" if ra == rb else "NO")
print("\n".join(out))
```

## Метки компонент
approach: labels
role: beginner
time: O(q · n)
memory: O(n)
idea: label[x] — номер множества; при объединении перекрашиваем одно множество.
principle: Проверка — сравнение меток за O(1), объединение — O(n).
pros: Очень просто
cons: Медленные объединения
when: Для маленьких n.
readability: 5
```python
n, q = map(int, input().split())
label = list(range(n + 1))
for _ in range(q):
    kind, a, b = input().split()
    a, b = int(a), int(b)
    if kind == "1":
        old, new = label[b], label[a]
        if old != new:
            for i in range(1, n + 1):
                if label[i] == old:
                    label[i] = new
    else:
        print("YES" if label[a] == label[b] else "NO")
```

# skill: mst
title: Минимальное остовное дерево
topics: Графы; Жадные алгоритмы; DSU
match: MST | (TREE & MIN & WEIGHT)
priority: 2.7
input_desc: Первая строка: n m. Далее m строк «u v w» — неориентированное ребро веса w. Граф связный.
output_desc: Суммарный вес минимального остовного дерева.
understood: Дан связный взвешенный граф. Найти вес минимального остовного дерева (набор рёбер, соединяющий все вершины, с наименьшей суммой весов).
algorithm: Алгоритм Краскала
why: Берём рёбра по возрастанию веса, если они соединяют разные компоненты (проверка через DSU).
ideas: Сортировка рёбер; DSU; Алгоритм Прима с кучей
structures: list, DSU
links: algo:mst, algo:dsu, lib:heapq
edge: Кратные рёбра — берётся самое лёгкое.
sample: 4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 4\n1 3 5 => 6
sample: 2 1\n1 2 7 => 7
sample: 3 3\n1 2 1\n2 3 1\n1 3 1 => 2

## Краскал + DSU
approach: kruskal
role: efficient
time: O(m log m)
memory: O(n + m)
idea: Лёгкие рёбра первыми; ребро внутри одной компоненты создало бы цикл.
principle: DSU быстро проверяет, лежат ли концы в разных компонентах.
pros: Просто и быстро
cons: Нужен DSU
when: Обычно.
readability: 4
```python
n, m = map(int, input().split())
edges = sorted((tuple(map(int, input().split())) for _ in range(m)), key=lambda e: e[2])
parent = list(range(n + 1))


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


total = 0
for u, v, w in edges:
    a, b = find(u), find(v)
    if a != b:
        parent[a] = b
        total += w
print(total)
```

## Прим с кучей
approach: prim
role: alternative
time: O(m log n)
memory: O(n + m)
idea: Растим дерево от вершины 1, каждый раз добавляя самое лёгкое ребро наружу.
principle: Куча хранит рёбра из дерева к невошедшим вершинам.
pros: Хорош для плотных графов
cons: —
when: Когда граф задан списком смежности.
readability: 4
```python
import heapq

n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    graph[u].append((w, v))
    graph[v].append((w, u))
used = [False] * (n + 1)
heap = [(0, 1)]
total = 0
while heap:
    w, v = heapq.heappop(heap)
    if used[v]:
        continue
    used[v] = True
    total += w
    for edge in graph[v]:
        if not used[edge[1]]:
            heapq.heappush(heap, edge)
print(total)
```

# skill: graph_cycle
title: Есть ли цикл в неориентированном графе
topics: Графы; DSU; DFS
match: CYCLE & (GRAPH | VERTEX | EDGE)
priority: 2.6
input_desc: Первая строка: n m. Далее m строк «u v» (без петель и кратных рёбер).
output_desc: YES, если в графе есть цикл, иначе NO.
understood: Дан неориентированный граф. Определить, есть ли в нём цикл.
algorithm: DSU или подсчёт рёбер
why: Ребро между вершинами одной компоненты замыкает цикл. Эквивалентно: граф без циклов (лес) имеет ровно n − c рёбер.
ideas: Лес: m = n − c; DSU; DFS с родителем
structures: DSU, list[list]
links: algo:dsu, algo:dfs, algo:graphs
edge: m = 0 — циклов нет.
sample: 3 3\n1 2\n2 3\n3 1 => YES
sample: 4 3\n1 2\n2 3\n3 4 => NO
sample: 5 2\n1 2\n4 5 => NO

## DSU
approach: dsu
role: efficient
time: O(m · α(n))
memory: O(n)
idea: Если концы ребра уже в одной компоненте — цикл.
principle: find сравнивает корни.
pros: Просто и быстро
cons: —
when: Обычно.
readability: 5
```python
n, m = map(int, input().split())
parent = list(range(n + 1))


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


cycle = False
for _ in range(m):
    u, v = map(int, input().split())
    a, b = find(u), find(v)
    if a == b:
        cycle = True
    else:
        parent[a] = b
print("YES" if cycle else "NO")
```

## DFS с родителем
approach: dfs
role: beginner
time: O(n + m)
memory: O(n + m)
idea: При обходе встретили уже посещённую вершину, не являющуюся родителем, — цикл.
principle: В стеке храним пары (вершина, родитель).
pros: Классический обход
cons: —
when: Для изучения DFS.
readability: 4
```python
n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
seen = [False] * (n + 1)
cycle = False
for s in range(1, n + 1):
    if seen[s]:
        continue
    seen[s] = True
    stack = [(s, 0)]
    while stack and not cycle:
        v, par = stack.pop()
        for u in graph[v]:
            if not seen[u]:
                seen[u] = True
                stack.append((u, v))
            elif u != par:
                cycle = True
print("YES" if cycle else "NO")
```

## Формула m > n − c
approach: count
role: alternative
time: O(n + m)
memory: O(n + m)
idea: Лес из c деревьев на n вершинах имеет ровно n − c рёбер; больше рёбер — есть цикл.
principle: Считаем компоненты DSU, сравниваем m с n − c.
pros: Красивая теорема
cons: —
when: Как пример применения свойств деревьев.
readability: 4
```python
n, m = map(int, input().split())
parent = list(range(n + 1))


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


components = n
for _ in range(m):
    a, b = map(lambda x: find(int(x)), input().split())
    if a != b:
        parent[a] = b
        components -= 1
print("YES" if m > n - components else "NO")
```

# skill: maze_bfs
title: Кратчайший путь в лабиринте
topics: BFS; Сетки
match: MAZE & (SHORTEST | PATH | DISTANCE | MIN)
priority: 2.6
input_desc: Первая строка: n m. Далее n строк по m символов: '.' — проход, '#' — стена, 'S' — старт, 'E' — выход. Ходить можно в 4 стороны.
output_desc: Минимальное число шагов от S до E или -1.
understood: Дан лабиринт n × m. Найти минимальное число шагов от S до E (ходы вверх, вниз, влево, вправо).
algorithm: BFS по клеткам
why: Клетки — вершины графа, соседние проходимые клетки соединены рёбрами веса 1; BFS даёт кратчайший путь.
ideas: Сетка как граф; Сдвиги (di, dj); Проверка границ
structures: list[str], deque
links: algo:bfs, algo:grids, lib:collections.deque
edge: Выход недостижим — -1.
sample: 3 4\nS.#.\n..#E\n.... => 6
sample: 2 2\nS#\n#E => -1
sample: 1 2\nSE => 1

## BFS с deque
approach: bfs
role: beginner
time: O(n · m)
memory: O(n · m)
idea: Расстояния до клеток считаются волной от S.
principle: Для каждой клетки проверяем 4 соседей: внутри поля, не стена, не посещена.
pros: Оптимально
cons: —
when: Всегда.
readability: 5
```python
from collections import deque

n, m = map(int, input().split())
grid = [input() for _ in range(n)]
start = end = None
for i in range(n):
    for j in range(m):
        if grid[i][j] == "S":
            start = (i, j)
        elif grid[i][j] == "E":
            end = (i, j)
dist = [[-1] * m for _ in range(n)]
dist[start[0]][start[1]] = 0
queue = deque([start])
while queue:
    i, j = queue.popleft()
    for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        a, b = i + di, j + dj
        if 0 <= a < n and 0 <= b < m and grid[a][b] != "#" and dist[a][b] == -1:
            dist[a][b] = dist[i][j] + 1
            queue.append((a, b))
print(dist[end[0]][end[1]])
```

## Волновой алгоритм по слоям
approach: wave
role: alternative
time: O(n · m)
memory: O(n · m)
idea: Храним фронт волны и шаг; на каждом шаге фронт расширяется на одну клетку.
principle: Множество seen предотвращает повторные посещения.
pros: Наглядно (алгоритм Ли)
cons: —
when: Для объяснения.
readability: 4
```python
n, m = map(int, input().split())
grid = [input() for _ in range(n)]
cells = {(i, j): grid[i][j] for i in range(n) for j in range(m)}
start = next(p for p, c in cells.items() if c == "S")
end = next(p for p, c in cells.items() if c == "E")
seen = {start}
frontier = [start]
steps = 0
answer = -1
while frontier:
    if end in seen:
        answer = steps
        break
    nxt = []
    for i, j in frontier:
        for p in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if cells.get(p, "#") != "#" and p not in seen:
                seen.add(p)
                nxt.append(p)
    frontier = nxt
    steps += 1
print(answer)
```

# skill: islands
title: Количество островов
topics: Сетки; DFS; BFS
match: ISLAND
priority: 2.7
input_desc: Первая строка: n m. Далее n строк по m символов: '#' — суша, '.' — вода.
output_desc: Количество островов (групп суши, соединённых по сторонам).
understood: Дана карта n × m из суши и воды. Посчитать количество островов (соседство по сторонам).
algorithm: Обход сетки из каждой непосещённой клетки суши
why: Каждый запуск обхода «затапливает» один остров целиком.
ideas: Сетка как граф; DFS со стеком; DSU
structures: list[list]
links: algo:dfs, algo:bfs, algo:grids
edge: Нет суши — 0.
sample: 4 5\n##..#\n#...#\n..#..\n..... => 3
sample: 1 1\n. => 0
sample: 2 2\n##\n## => 1

## DFS со стеком
approach: dfs
role: beginner
time: O(n · m)
memory: O(n · m)
idea: Находим непосещённую сушу, обходим остров, считаем.
principle: Стек вместо рекурсии.
pros: Надёжно
cons: —
when: Обычно.
readability: 5
```python
n, m = map(int, input().split())
grid = [list(input()) for _ in range(n)]
count = 0
for i in range(n):
    for j in range(m):
        if grid[i][j] != "#":
            continue
        count += 1
        grid[i][j] = "."
        stack = [(i, j)]
        while stack:
            a, b = stack.pop()
            for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                if 0 <= x < n and 0 <= y < m and grid[x][y] == "#":
                    grid[x][y] = "."
                    stack.append((x, y))
print(count)
```

## BFS
approach: bfs
role: alternative
time: O(n · m)
memory: O(n · m)
idea: То же с очередью.
principle: Посещённые клетки отмечаем в отдельной таблице.
pros: Не меняет исходную карту
cons: —
when: Если карта нужна дальше.
readability: 5
```python
from collections import deque

n, m = map(int, input().split())
grid = [input() for _ in range(n)]
seen = [[False] * m for _ in range(n)]
count = 0
for i in range(n):
    for j in range(m):
        if grid[i][j] == "#" and not seen[i][j]:
            count += 1
            seen[i][j] = True
            queue = deque([(i, j)])
            while queue:
                a, b = queue.popleft()
                for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= x < n and 0 <= y < m and grid[x][y] == "#" and not seen[x][y]:
                        seen[x][y] = True
                        queue.append((x, y))
print(count)
```

## DSU
approach: dsu
role: alternative
time: O(n · m · α)
memory: O(n · m)
idea: Объединяем соседние клетки суши; островов = клеток суши − объединений.
principle: Клетка (i, j) имеет номер i · m + j.
pros: Подходит, если суша добавляется постепенно
cons: Больше кода
when: Для задач с добавлением клеток.
readability: 3
```python
n, m = map(int, input().split())
grid = [input() for _ in range(n)]
parent = list(range(n * m))


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


count = 0
for i in range(n):
    for j in range(m):
        if grid[i][j] != "#":
            continue
        count += 1
        for x, y in ((i - 1, j), (i, j - 1)):
            if x >= 0 and y >= 0 and grid[x][y] == "#":
                a, b = find(i * m + j), find(x * m + y)
                if a != b:
                    parent[a] = b
                    count -= 1
print(count)
```

# skill: bipartite
title: Является ли граф двудольным
topics: Графы; Раскраска
match: BIPARTITE
priority: 2.7
input_desc: Первая строка: n m. Далее m строк «u v».
output_desc: YES, если вершины можно раскрасить в два цвета так, чтобы рёбра соединяли разные цвета, иначе NO.
understood: Дан неориентированный граф. Проверить, является ли он двудольным.
algorithm: Раскраска обходом в ширину
why: Красим вершину в 0, её соседей в 1 и т.д.; конфликт цвета на ребре означает нечётный цикл.
ideas: Двудольный ⇔ нет нечётных циклов; color[u] = 1 − color[v]
structures: list[list], deque
links: algo:bipartite, algo:bfs
edge: Несвязный граф — проверяем каждую компоненту.
sample: 4 4\n1 2\n2 3\n3 4\n4 1 => YES
sample: 3 3\n1 2\n2 3\n3 1 => NO
sample: 3 0 => YES

## BFS-раскраска
approach: bfs
role: beginner
time: O(n + m)
memory: O(n + m)
idea: Соседи получают противоположный цвет.
principle: Если сосед уже окрашен в тот же цвет — граф не двудольный.
pros: Просто
cons: —
when: Обычно.
readability: 5
```python
from collections import deque

n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
color = [-1] * (n + 1)
ok = True
for s in range(1, n + 1):
    if color[s] != -1:
        continue
    color[s] = 0
    queue = deque([s])
    while queue and ok:
        v = queue.popleft()
        for u in graph[v]:
            if color[u] == -1:
                color[u] = 1 - color[v]
                queue.append(u)
            elif color[u] == color[v]:
                ok = False
print("YES" if ok else "NO")
```

## DFS-раскраска
approach: dfs
role: alternative
time: O(n + m)
memory: O(n + m)
idea: То же со стеком.
principle: Стек хранит вершины для обработки.
pros: —
cons: —
when: Если DFS уже реализован.
readability: 5
```python
n, m = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
color = [-1] * (n + 1)
ok = True
for s in range(1, n + 1):
    if color[s] != -1:
        continue
    color[s] = 0
    stack = [s]
    while stack:
        v = stack.pop()
        for u in graph[v]:
            if color[u] == -1:
                color[u] = 1 - color[v]
                stack.append(u)
            elif color[u] == color[v]:
                ok = False
print("YES" if ok else "NO")
```

# skill: tree_diameter
title: Диаметр дерева
topics: Деревья; BFS
match: DIAMETER & (TREE | GRAPH)
priority: 2.7
input_desc: Первая строка: n. Далее n − 1 строк «u v» — рёбра дерева.
output_desc: Диаметр — наибольшее число рёбер на пути между двумя вершинами.
understood: Дано дерево из n вершин. Найти его диаметр (длину самого длинного пути в рёбрах).
algorithm: Два обхода в ширину
why: Самая дальняя вершина от любой вершины — конец некоторого диаметра; второй BFS от неё даёт длину диаметра.
ideas: Двойной BFS; Высоты поддеревьев
structures: list[list], deque
links: algo:tree-diameter, algo:bfs, algo:trees
edge: n = 1: диаметр 0.
sample: 5\n1 2\n1 3\n3 4\n3 5 => 3
sample: 1 => 0
sample: 4\n1 2\n2 3\n3 4 => 3

## Два BFS
approach: double-bfs
role: efficient
time: O(n)
memory: O(n)
idea: BFS из вершины 1 находит самую дальнюю вершину a; BFS из a находит диаметр.
principle: Конец диаметра — самая удалённая вершина от любой вершины дерева.
pros: Просто и быстро
cons: Нужна теорема
when: Обычно.
readability: 4
```python
from collections import deque

n = int(input())
graph = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)


def bfs(s):
    dist = [-1] * (n + 1)
    dist[s] = 0
    queue = deque([s])
    while queue:
        v = queue.popleft()
        for u in graph[v]:
            if dist[u] == -1:
                dist[u] = dist[v] + 1
                queue.append(u)
    far = max(range(1, n + 1), key=lambda v: dist[v])
    return far, dist[far]


a, _ = bfs(1)
print(bfs(a)[1])
```

## Высоты поддеревьев
approach: heights
role: alternative
time: O(n)
memory: O(n)
idea: Для каждой вершины диаметр через неё = сумма двух наибольших глубин детей.
principle: Обходим вершины в обратном порядке BFS (от листьев к корню).
pros: Обобщается на взвешенные деревья
cons: Больше кода
when: Когда нужно ДП на дереве.
readability: 3
```python
n = int(input())
graph = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
order, parent = [1], [0] * (n + 1)
parent[1] = -1
for v in order:
    for u in graph[v]:
        if u != parent[v]:
            parent[u] = v
            order.append(u)
depth = [0] * (n + 1)
best = 0
for v in reversed(order):
    top = [0, 0]
    for u in graph[v]:
        if u != parent[v]:
            top.append(depth[u] + 1)
    top.sort(reverse=True)
    depth[v] = top[0]
    best = max(best, top[0] + top[1])
print(best)
```
