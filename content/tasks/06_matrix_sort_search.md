# id: task:matrix-transpose
kind: task
title: Транспонирование матрицы
category: Матрицы
level: easy
tags: матрица, транспонирование, zip(*m)
related: algo:matrices, py:builtin:zip
## Условие
Дана матрица N×M. Выведите транспонированную матрицу M×N (строки становятся столбцами).
## Входные данные
N и M (1 ≤ N, M ≤ 100), затем N строк по M чисел.
## Выходные данные
M строк по N чисел.
## Примеры
```in
2 3
1 2 3
4 5 6
```
```out
1 4
2 5
3 6
```
## Подсказки
- Элемент [i][j] переходит на место [j][i].
- Внешний цикл — по столбцам исходной матрицы.
- zip(*matrix) выдаёт столбцы как кортежи.
## Решение: zip(*m)
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
for col in zip(*a):
    print(*col)
```
## Решение: двойной цикл
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
t = [[a[i][j] for i in range(n)] for j in range(m)]
for row in t:
    print(" ".join(row))
```
## Объяснение
zip(*a) передаёт строки матрицы как отдельные аргументы, и zip «сшивает» их по столбцам.
## Генератор
```python
import json, random
random.seed(71)
t = ["1 1\n5", "1 4\n1 2 3 4", "4 1\n1\n2\n3\n4"]
for _ in range(3):
    n, m = random.randint(1, 8), random.randint(1, 8)
    t.append("%d %d\n%s" % (n, m, "\n".join(" ".join(str(random.randint(-9, 9)) for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:matrix-max-row
kind: task
title: Строка с наибольшей суммой
category: Матрицы
level: easy
tags: матрица, суммы строк, argmax
related: algo:matrices, py:builtin:max
## Условие
Дана матрица N×M. Найдите номер строки (с 1) с наибольшей суммой элементов; если таких несколько — наименьший номер. Выведите номер и сумму.
## Входные данные
N и M, затем N строк по M чисел.
## Выходные данные
Номер строки и её сумма.
## Примеры
```in
3 3
1 2 3
9 0 0
4 4 1
```
```out
2 9
```
## Подсказки
- Посчитайте сумму каждой строки.
- Запоминайте лучшую сумму и номер строки.
- max(range(n), key=...) выбирает первый номер с наибольшим ключом.
## Решение: max по индексам
@time: O(N·M) @memory: O(N)
```python
n, m = map(int, input().split())
sums = [sum(map(int, input().split())) for _ in range(n)]
i = max(range(n), key=lambda k: sums[k])
print(i + 1, sums[i])
```
## Решение: один проход
@time: O(N·M) @memory: O(M)
Строгое > сохраняет первую из равных строк.
```python
n, m = map(int, input().split())
best_i, best = 0, None
for i in range(1, n + 1):
    s = sum(map(int, input().split()))
    if best is None or s > best:
        best_i, best = i, s
print(best_i, best)
```
## Объяснение
В примере суммы строк 6, 9 и 9: максимальная сумма 9 встречается дважды, и первая такая строка — вторая.
## Генератор
```python
import json, random
random.seed(72)
t = ["1 1\n-5", "2 2\n1 1\n1 1"]
for _ in range(4):
    n, m = random.randint(1, 10), random.randint(1, 10)
    t.append("%d %d\n%s" % (n, m, "\n".join(" ".join(str(random.randint(-5, 5)) for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:spiral-matrix
kind: task
title: Спиральная матрица
category: Матрицы
level: medium
tags: спираль, направления, матрица
related: algo:matrices, algo:simulation
## Условие
Заполните матрицу N×M числами от 1 до N·M по спирали по часовой стрелке, начиная с левого верхнего угла, и выведите её.
## Входные данные
N и M (1 ≤ N, M ≤ 50).
## Выходные данные
N строк по M чисел.
## Примеры
```in
3 4
```
```out
1 2 3 4
10 11 12 5
9 8 7 6
```
## Подсказки
- Двигайтесь вправо, пока можно, затем вниз, влево, вверх.
- Поворачивайте, если следующая клетка за границей или уже заполнена.
- Направления удобно хранить списком смещений (dr, dc).
## Решение: моделирование с поворотами
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
a = [[0] * m for _ in range(n)]
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
r = c = d = 0
for k in range(1, n * m + 1):
    a[r][c] = k
    nr, nc = r + dirs[d][0], c + dirs[d][1]
    if not (0 <= nr < n and 0 <= nc < m and a[nr][nc] == 0):
        d = (d + 1) % 4
        nr, nc = r + dirs[d][0], c + dirs[d][1]
    r, c = nr, nc
for row in a:
    print(*row)
```
## Решение: слои по границам
@time: O(N·M) @memory: O(N·M)
Заполняем внешнюю «рамку», затем сужаем границы top/bottom/left/right.
```python
n, m = map(int, input().split())
a = [[0] * m for _ in range(n)]
top, bottom, left, right = 0, n - 1, 0, m - 1
k = 1
while top <= bottom and left <= right:
    for c in range(left, right + 1):
        a[top][c] = k; k += 1
    for r in range(top + 1, bottom + 1):
        a[r][right] = k; k += 1
    if top < bottom:
        for c in range(right - 1, left - 1, -1):
            a[bottom][c] = k; k += 1
    if left < right:
        for r in range(bottom - 1, top, -1):
            a[r][left] = k; k += 1
    top += 1; bottom -= 1; left += 1; right -= 1
for row in a:
    print(*row)
```
## Объяснение
Проверки top < bottom и left < right нужны для «вырожденных» слоёв из одной строки или одного столбца.
## Генератор
```python
import json
print(json.dumps(["1 1", "1 5", "5 1", "2 2", "4 4", "5 3", "7 9"]))
```

# id: task:rotate-matrix
kind: task
title: Поворот матрицы на 90°
category: Матрицы
level: medium
tags: поворот, транспонирование, zip
related: algo:matrices
## Условие
Дана квадратная матрица N×N. Поверните её на 90° по часовой стрелке.
## Входные данные
N (1 ≤ N ≤ 100), затем N строк по N чисел.
## Выходные данные
Повёрнутая матрица.
## Примеры
```in
3
1 2 3
4 5 6
7 8 9
```
```out
7 4 1
8 5 2
9 6 3
```
## Подсказки
- Первая строка результата — первый столбец, прочитанный снизу вверх.
- Поворот = отражение по вертикали строк + транспонирование.
- zip(*a[::-1]) делает поворот одной строкой.
## Решение: zip(*a[::-1])
@time: O(N²) @memory: O(N²)
```python
n = int(input())
a = [input().split() for _ in range(n)]
for row in zip(*a[::-1]):
    print(*row)
```
## Решение: формула индексов
@time: O(N²) @memory: O(N²)
Элемент [i][j] результата равен a[n−1−j][i].
```python
n = int(input())
a = [input().split() for _ in range(n)]
for i in range(n):
    print(" ".join(a[n - 1 - j][i] for j in range(n)))
```
## Решение: на месте по слоям
@time: O(N²) @memory: O(1) дополнительно
Четыре элемента «кольца» меняются по циклу.
```python
n = int(input())
a = [input().split() for _ in range(n)]
for layer in range(n // 2):
    first, last = layer, n - 1 - layer
    for i in range(first, last):
        off = i - first
        top = a[first][i]
        a[first][i] = a[last - off][first]
        a[last - off][first] = a[last][last - off]
        a[last][last - off] = a[i][last]
        a[i][last] = top
for row in a:
    print(*row)
```
## Объяснение
Поворот на месте экономит память — популярный вопрос на собеседованиях.
## Генератор
```python
import json, random
random.seed(73)
t = ["1\n5", "2\n1 2\n3 4"]
for n in (4, 5, 8):
    t.append("%d\n%s" % (n, "\n".join(" ".join(str(random.randint(0, 99)) for _ in range(n)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:matrix-multiply
kind: task
title: Умножение матриц
category: Матрицы
level: medium
tags: произведение матриц, тройной цикл
related: algo:matrices, algo:fast-power
## Условие
Даны матрица A размером N×K и матрица B размером K×M. Выведите их произведение C = A·B.
## Входные данные
N, K, M (1 ≤ N, K, M ≤ 50), затем N строк A, затем K строк B.
## Выходные данные
N строк по M чисел.
## Примеры
```in
2 2 2
1 2
3 4
5 6
7 8
```
```out
19 22
43 50
```
## Подсказки
- C[i][j] = сумма A[i][t]·B[t][j] по t.
- Нужны три вложенных цикла.
- Через zip(*B) удобно получать столбцы B.
## Решение: тройной цикл
@time: O(N·K·M) @memory: O(N·M)
```python
n, k, m = map(int, input().split())
A = [list(map(int, input().split())) for _ in range(n)]
B = [list(map(int, input().split())) for _ in range(k)]
C = [[0] * m for _ in range(n)]
for i in range(n):
    for t in range(k):
        a = A[i][t]
        for j in range(m):
            C[i][j] += a * B[t][j]
for row in C:
    print(*row)
```
## Решение: строки на столбцы через zip
@time: O(N·K·M) @memory: O(N·M)
```python
n, k, m = map(int, input().split())
A = [list(map(int, input().split())) for _ in range(n)]
B = [list(map(int, input().split())) for _ in range(k)]
cols = list(zip(*B))
for row in A:
    print(*(sum(x * y for x, y in zip(row, col)) for col in cols))
```
## Объяснение
Порядок циклов i-t-j в первом способе обращается к памяти последовательно и обычно быстрее.
## Генератор
```python
import json, random
random.seed(74)
t = ["1 1 1\n3\n4"]
for _ in range(4):
    n, k, m = (random.randint(1, 6) for _ in range(3))
    A = "\n".join(" ".join(str(random.randint(-5, 5)) for _ in range(k)) for _ in range(n))
    B = "\n".join(" ".join(str(random.randint(-5, 5)) for _ in range(m)) for _ in range(k))
    t.append("%d %d %d\n%s\n%s" % (n, k, m, A, B))
print(json.dumps(t))
```

# id: task:symmetric-matrix
kind: task
title: Симметричная матрица
category: Матрицы
level: easy
tags: симметрия, транспонирование, all
related: algo:matrices
## Условие
Дана квадратная матрица. Выведите YES, если она симметрична относительно главной диагонали (a[i][j] = a[j][i] для всех i, j), иначе NO.
## Входные данные
N (1 ≤ N ≤ 100), затем N строк по N чисел.
## Выходные данные
YES или NO.
## Примеры
```in
3
1 2 3
2 5 6
3 6 9
```
```out
YES
```
## Подсказки
- Достаточно проверить элементы над диагональю.
- Сравнивайте a[i][j] и a[j][i] при j > i.
- Матрица симметрична, если совпадает со своей транспонированной.
## Решение: проверка пар
@time: O(N²) @memory: O(N²)
```python
n = int(input())
a = [input().split() for _ in range(n)]
ok = all(a[i][j] == a[j][i] for i in range(n) for j in range(i + 1, n))
print("YES" if ok else "NO")
```
## Решение: сравнение с транспонированной
@time: O(N²) @memory: O(N²)
```python
n = int(input())
a = [tuple(map(int, input().split())) for _ in range(n)]
print("YES" if a == list(zip(*a)) else "NO")
```
## Объяснение
zip возвращает кортежи, поэтому строки матрицы тоже приводим к кортежам.
## Генератор
```python
import json
print(json.dumps(["1\n7", "2\n1 2\n2 1", "2\n1 2\n3 1", "3\n0 0 0\n0 0 0\n0 0 0", "3\n1 2 3\n2 1 2\n3 3 1"]))
```

# id: task:sort-numbers
kind: task
title: Сортировка чисел
category: Сортировка
level: beginner
tags: sort, sorted, reverse
related: py:builtin:sorted, py:method:list.sort, algo:sorting
## Условие
Дан список из N целых чисел. Выведите его, отсортированный по неубыванию, а на следующей строке — по невозрастанию.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Две строки.
## Примеры
```in
5
3 1 4 1 5
```
```out
1 1 3 4 5
5 4 3 1 1
```
## Подсказки
- Числа нужно сравнивать как int, а не как строки ("10" < "9").
- sorted(a) возвращает новый список, a.sort() сортирует на месте.
- reverse=True сортирует по убыванию.
## Решение: sorted
@time: O(N log N) @memory: O(N)
```python
input()
a = sorted(map(int, input().split()))
print(*a)
print(*a[::-1])
```
## Решение: list.sort и reverse=True
@time: O(N log N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
a.sort()
print(*a)
a.sort(reverse=True)
print(*a)
```
## Решение: сортировка подсчётом по словарю
@time: O(N + K log K) @memory: O(K)
Если различных значений мало, считаем каждое значение и выводим его нужное число раз.
```python
from collections import Counter
input()
cnt = Counter(map(int, input().split()))
keys = sorted(cnt)
print(*[k for k in keys for _ in range(cnt[k])])
print(*[k for k in reversed(keys) for _ in range(cnt[k])])
```
## Объяснение
Встроенная сортировка Python — Timsort: устойчивая, O(N log N) в худшем случае.
## Генератор
```python
import json, random
random.seed(75)
t = ["1\n0", "3\n10 9 100"]
for _ in range(4):
    n = random.randint(1, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-1000, 1000)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:sort-students
kind: task
title: Сортировка по нескольким ключам
category: Сортировка
level: easy
tags: key, кортеж, сортировка по убыванию
related: py:builtin:sorted, lib:operator.itemgetter
## Условие
Даны N учеников: фамилия и балл. Отсортируйте их по убыванию балла, а при равных баллах — по фамилии в алфавитном порядке.
## Входные данные
N, затем N строк «фамилия балл».
## Выходные данные
N строк «фамилия балл» в нужном порядке.
## Примеры
```in
4
petrov 90
ivanov 95
sidorov 90
abramov 70
```
```out
ivanov 95
petrov 90
sidorov 90
abramov 70
```
## Подсказки
- key может возвращать кортеж — сравнение пойдёт по элементам.
- Чтобы балл шёл по убыванию, используйте −балл.
- key=lambda s: (-score, name).
## Решение: ключ-кортеж
@time: O(N log N) @memory: O(N)
```python
n = int(input())
st = []
for _ in range(n):
    name, score = input().split()
    st.append((name, int(score)))
for name, score in sorted(st, key=lambda s: (-s[1], s[0])):
    print(name, score)
```
## Решение: две устойчивые сортировки
@time: O(N log N) @memory: O(N)
Сначала по второстепенному ключу, затем по главному: устойчивость сохранит порядок равных.
```python
from operator import itemgetter
n = int(input())
st = [(name, int(score)) for name, score in (input().split() for _ in range(n))]
st.sort(key=itemgetter(0))
st.sort(key=itemgetter(1), reverse=True)
for name, score in st:
    print(name, score)
```
## Объяснение
reverse=True тоже сохраняет устойчивость: равные элементы остаются в исходном порядке.
## Генератор
```python
import json, random
random.seed(76)
names = ["ali", "bek", "vali", "dina", "egor", "fara"]
t = []
for _ in range(4):
    n = random.randint(1, 6)
    sample = random.sample(names, n)
    t.append("%d\n%s" % (n, "\n".join("%s %d" % (x, random.choice([50, 60, 70])) for x in sample)))
print(json.dumps(t))
```

# id: task:merge-intervals
kind: task
title: Объединение отрезков
category: Сортировка
level: medium
tags: отрезки, сортировка, слияние интервалов
related: algo:sorting, algo:greedy
## Условие
Дано N отрезков [l, r]. Объедините все пересекающиеся (в том числе касающиеся концами) отрезки и выведите результат в порядке возрастания.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N строк «l r» (l ≤ r).
## Выходные данные
Количество отрезков после объединения, затем сами отрезки.
## Примеры
```in
4
1 3
8 10
2 6
15 18
```
```out
3
1 6
8 10
15 18
```
## Подсказки
- Отсортируйте отрезки по левому концу.
- Идите слева направо, расширяя текущий отрезок, пока следующий начинается не правее его конца.
- Иначе — закрывайте текущий и начинайте новый.
## Решение: сортировка и проход
@time: O(N log N) @memory: O(N)
```python
n = int(input())
segs = sorted(tuple(map(int, input().split())) for _ in range(n))
res = [list(segs[0])]
for l, r in segs[1:]:
    if l <= res[-1][1]:
        res[-1][1] = max(res[-1][1], r)
    else:
        res.append([l, r])
print(len(res))
for l, r in res:
    print(l, r)
```
## Решение: события начала и конца
@time: O(N log N) @memory: O(N)
Начало — событие +1, конец — −1; при равной координате начало обрабатываем раньше, чтобы касающиеся отрезки слились.
```python
n = int(input())
events = []
for _ in range(n):
    l, r = map(int, input().split())
    events.append((l, 0))
    events.append((r, 1))
events.sort()
res = []
depth = 0
for x, kind in events:
    if kind == 0:
        if depth == 0:
            start = x
        depth += 1
    else:
        depth -= 1
        if depth == 0:
            res.append((start, x))
print(len(res))
for l, r in res:
    print(l, r)
```
## Объяснение
Метод событий обобщается на задачи «сколько отрезков покрывает точку» и «максимальное число пересечений».
## Генератор
```python
import json, random
random.seed(77)
t = ["1\n5 5", "2\n1 2\n2 3", "2\n1 2\n3 4", "3\n1 10\n2 3\n4 5"]
for _ in range(3):
    n = random.randint(1, 30)
    segs = []
    for _ in range(n):
        l = random.randint(0, 100); segs.append("%d %d" % (l, l + random.randint(0, 10)))
    t.append("%d\n%s" % (n, "\n".join(segs)))
print(json.dumps(t))
```

# id: task:kth-smallest
kind: task
title: K-й по величине
category: Сортировка
level: medium
tags: k-я порядковая статистика, heapq, quickselect
related: lib:heapq.nsmallest, algo:heap, algo:sorting
## Условие
Дан массив из N чисел и число K. Выведите K-й по возрастанию элемент (с учётом повторов).
## Входные данные
N и K (1 ≤ K ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
K-й наименьший элемент.
## Примеры
```in
6 3
7 10 4 3 20 15
```
```out
7
```
## Подсказки
- Самое простое — отсортировать и взять элемент K−1.
- heapq.nsmallest(k, a) — O(N log K).
- Quickselect находит ответ в среднем за O(N).
## Решение: сортировка
@time: O(N log N) @memory: O(N)
```python
n, k = map(int, input().split())
print(sorted(map(int, input().split()))[k - 1])
```
## Решение: heapq.nsmallest
@time: O(N log K) @memory: O(K)
```python
import heapq
n, k = map(int, input().split())
print(heapq.nsmallest(k, map(int, input().split()))[-1])
```
## Решение: quickselect
@time: O(N) в среднем @memory: O(N)
Разбиваем на меньшие, равные и большие опорного и продолжаем только в нужной части.
```python
import random
n, k = map(int, input().split())
a = list(map(int, input().split()))
while True:
    p = random.choice(a)
    lo = [x for x in a if x < p]
    eq = sum(1 for x in a if x == p)
    if k <= len(lo):
        a = lo
    elif k <= len(lo) + eq:
        print(p)
        break
    else:
        k -= len(lo) + eq
        a = [x for x in a if x > p]
```
## Объяснение
Случайный опорный элемент защищает quickselect от худшего случая O(N²) на специальных данных.
## Генератор
```python
import json, random
random.seed(78)
t = ["1 1\n5", "5 5\n1 1 1 1 1"]
for n in (10, 300, 1500):
    t.append("%d %d\n%s" % (n, random.randint(1, n), " ".join(str(random.randint(-10**6, 10**6)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:sort-by-frequency
kind: task
title: Сортировка по частоте
category: Сортировка
level: medium
tags: Counter, частота, key
related: lib:collections.Counter, py:builtin:sorted
## Условие
Дан массив из N чисел. Отсортируйте его по убыванию частоты значений, при равной частоте — по возрастанию значения.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Отсортированный массив.
## Примеры
```in
7
4 6 2 6 4 4 2
```
```out
4 4 4 2 2 6 6
```
## Подсказки
- Сначала посчитайте частоты.
- Ключ сортировки: (−частота, значение).
- Можно сортировать уникальные значения и выводить каждое нужное число раз.
## Решение: ключ с частотой
@time: O(N log N) @memory: O(N)
```python
from collections import Counter
input()
a = list(map(int, input().split()))
cnt = Counter(a)
print(*sorted(a, key=lambda x: (-cnt[x], x)))
```
## Решение: сортировка уникальных значений
@time: O(N + K log K) @memory: O(K)
```python
from collections import Counter
input()
cnt = Counter(map(int, input().split()))
out = []
for v, c in sorted(cnt.items(), key=lambda p: (-p[1], p[0])):
    out.extend([v] * c)
print(*out)
```
## Объяснение
Второй способ сортирует только K различных значений — быстрее при многих повторах.
## Генератор
```python
import json, random
random.seed(79)
t = ["1\n3", "4\n1 2 3 4"]
for _ in range(4):
    n = random.randint(1, 80)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-5, 5)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:largest-number
kind: task
title: Наибольшее число из кусочков
category: Сортировка
level: hard
tags: компаратор, cmp_to_key, конкатенация
related: lib:functools.cmp_to_key, algo:greedy
## Условие
Даны N неотрицательных целых чисел. Расположите их так, чтобы при записи подряд получилось наибольшее возможное число, и выведите его (без ведущих нулей).
## Входные данные
N (1 ≤ N ≤ 10^4), затем N чисел (0 ≤ a_i ≤ 10^9).
## Выходные данные
Наибольшее число.
## Примеры
```in
5
3 30 34 5 9
```
```out
9534330
```
## Подсказки
- Обычная сортировка по убыванию не работает: 3 и 30 → «330» лучше, чем «303».
- Сравнивайте пару строк a, b по тому, что больше: a+b или b+a.
- functools.cmp_to_key превращает функцию сравнения в ключ.
## Решение: компаратор a+b vs b+a
@time: O(N log N · L) @memory: O(N·L)
```python
from functools import cmp_to_key
input()
a = input().split()
a.sort(key=cmp_to_key(lambda x, y: (y + x > x + y) - (y + x < x + y)))
print(int("".join(a)))
```
## Решение: ключ-повтор строки
@time: O(N log N · L) @memory: O(N·L)
Для чисел до 10 цифр сравнение s*10 эквивалентно сравнению a+b и b+a; ключ без компаратора быстрее.
```python
input()
a = input().split()
a.sort(key=lambda s: s * 10, reverse=True)
print(int("".join(a)))
```
## Объяснение
int(...) убирает ведущие нули: для входа «0 0» ответ 0, а не 00.
## Генератор
```python
import json, random
random.seed(80)
t = ["1\n0", "2\n0 0", "2\n10 2", "3\n121 12 1"]
for _ in range(4):
    n = random.randint(1, 30)
    t.append("%d\n%s" % (n, " ".join(str(random.choice([random.randint(0, 99), random.randint(0, 10**9)])) for _ in range(n))))
print(json.dumps(t))
```

# id: task:inversions
kind: task
title: Количество инверсий
category: Сортировка
level: hard
tags: инверсии, сортировка слиянием, дерево Фенвика
related: algo:sorting, algo:fenwick
## Условие
Инверсия — пара индексов i < j, для которой a_i > a_j. Посчитайте количество инверсий в массиве.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Количество инверсий.
## Примеры
```in
5
2 3 8 6 1
```
```out
5
```
## Подсказки
- Двойной цикл — O(N²): для N = 10^5 это 5·10^9 операций.
- При слиянии двух отсортированных половин инверсии между ними считаются массово.
- Если берём элемент из правой половины, он образует инверсии со всеми оставшимися элементами левой.
## Решение: сортировка слиянием
@time: O(N log N) @memory: O(N)
```python
import sys
sys.setrecursionlimit(10000)
input()
a = list(map(int, input().split()))

def sort_count(a):
    if len(a) <= 1:
        return a, 0
    m = len(a) // 2
    left, x = sort_count(a[:m])
    right, y = sort_count(a[m:])
    merged = []
    inv = x + y
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
            inv += len(left) - i
    merged += left[i:]
    merged += right[j:]
    return merged, inv

print(sort_count(a)[1])
```
## Решение: дерево Фенвика
@time: O(N log N) @memory: O(N)
Идём справа налево и спрашиваем, сколько уже встреченных элементов меньше текущего.
```python
input()
a = list(map(int, input().split()))
vals = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
n = len(vals)
tree = [0] * (n + 1)
inv = 0
for x in reversed(a):
    i = vals[x] - 1
    while i > 0:
        inv += tree[i]
        i -= i & -i
    i = vals[x]
    while i <= n:
        tree[i] += 1
        i += i & -i
print(inv)
```
## Решение: bisect.insort для небольших N
@time: O(N²) в худшем (вставка в список) @memory: O(N)
Поддерживаем отсортированный список уже просмотренных элементов справа.
```python
import bisect
input()
a = list(map(int, input().split()))
seen = []
inv = 0
for x in reversed(a):
    inv += bisect.bisect_left(seen, x)
    bisect.insort(seen, x)
print(inv)
```
## Объяснение
Значения сжимаются в номера 1..K (сжатие координат), чтобы дерево Фенвика было маленьким. insort сдвигает элементы списка — O(N) на вставку, но очень быстро на практике для N до 10^5.
## Генератор
```python
import json, random
random.seed(81)
t = ["1\n5", "3\n1 2 3", "3\n3 2 1", "4\n2 2 2 2"]
for n in (100, 1500):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:binary-search-queries
kind: task
title: Есть ли число в массиве
category: Бинарный поиск
level: easy
tags: бинарный поиск, bisect, запросы
related: algo:binary-search, lib:bisect.bisect_left
## Условие
Дан отсортированный по неубыванию массив из N чисел и Q запросов. Для каждого запроса X выведите YES, если X есть в массиве, иначе NO.
## Входные данные
N, затем N чисел; Q, затем Q чисел (N, Q ≤ 10^5).
## Выходные данные
Q строк YES/NO.
## Примеры
```in
5
1 3 5 7 9
3
3
4
9
```
```out
YES
NO
YES
```
## Подсказки
- Линейный поиск для каждого запроса — O(N·Q).
- В отсортированном массиве можно делить отрезок поиска пополам.
- bisect_left возвращает позицию, куда X встал бы; проверьте элемент на этой позиции.
## Решение: bisect
@time: O((N + Q) log N) @memory: O(N)
```python
import sys
from bisect import bisect_left
data = sys.stdin.read().split()
n = int(data[0])
a = list(map(int, data[1:n + 1]))
q = int(data[n + 1])
out = []
for x in map(int, data[n + 2:n + 2 + q]):
    i = bisect_left(a, x)
    out.append("YES" if i < n and a[i] == x else "NO")
print("\n".join(out))
```
## Решение: свой бинарный поиск
@time: O((N + Q) log N) @memory: O(N)
```python
import sys
data = sys.stdin.read().split()
n = int(data[0])
a = list(map(int, data[1:n + 1]))
q = int(data[n + 1])
out = []
for x in map(int, data[n + 2:n + 2 + q]):
    lo, hi = 0, n - 1
    found = False
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == x:
            found = True
            break
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    out.append("YES" if found else "NO")
print("\n".join(out))
```
## Решение: множество
@time: O(N + Q) @memory: O(N)
Если сортированность не нужна, множество отвечает за O(1) на запрос.
```python
import sys
data = sys.stdin.read().split()
n = int(data[0])
s = set(data[1:n + 1])
q = int(data[n + 1])
print("\n".join("YES" if x in s else "NO" for x in data[n + 2:n + 2 + q]))
```
## Объяснение
Множество из строк работает, потому что числа во входе записаны без ведущих нулей.
## Генератор
```python
import json, random
random.seed(82)
t = ["1\n5\n2\n5\n6"]
for _ in range(3):
    n = random.randint(1, 50); q = random.randint(1, 30)
    a = sorted(random.randint(0, 60) for _ in range(n))
    qs = [random.randint(-5, 65) for _ in range(q)]
    t.append("%d\n%s\n%d\n%s" % (n, " ".join(map(str, a)), q, "\n".join(map(str, qs))))
print(json.dumps(t))
```

# id: task:range-count
kind: task
title: Сколько чисел в диапазоне
category: Бинарный поиск
level: medium
tags: bisect_left, bisect_right, запросы на отрезке
related: lib:bisect.bisect_right, algo:binary-search
## Условие
Дан массив из N чисел и Q запросов «L R». На каждый запрос выведите, сколько элементов массива лежит в отрезке [L, R].
## Входные данные
N, затем N чисел; Q, затем Q строк «L R» (N, Q ≤ 10^5).
## Выходные данные
Q чисел, по одному в строке.
## Примеры
```in
5
10 1 10 3 4
4
1 10
2 9
10 10
2 2
```
```out
5
2
2
0
```
## Подсказки
- Отсортируйте массив один раз.
- Количество элементов ≤ R — bisect_right(a, R).
- Ответ: bisect_right(a, R) − bisect_left(a, L).
## Решение: сортировка и bisect
@time: O((N + Q) log N) @memory: O(N)
```python
import sys
from bisect import bisect_left, bisect_right
data = sys.stdin.read().split()
n = int(data[0])
a = sorted(map(int, data[1:n + 1]))
q = int(data[n + 1])
out = []
pos = n + 2
for _ in range(q):
    l, r = int(data[pos]), int(data[pos + 1])
    pos += 2
    out.append(max(0, bisect_right(a, r) - bisect_left(a, l)))
print("\n".join(map(str, out)))
```
## Решение: перебор (проверка)
@time: O(N·Q) @memory: O(N)
Простой подсчёт для каждого запроса — годится при небольших N и Q.
```python
import sys
data = sys.stdin.read().split()
n = int(data[0])
a = list(map(int, data[1:n + 1]))
q = int(data[n + 1])
pos = n + 2
for _ in range(q):
    l, r = int(data[pos]), int(data[pos + 1])
    pos += 2
    print(sum(1 for x in a if l <= x <= r))
```
## Объяснение
max(0, …) защищает от запросов с L > R.
## Генератор
```python
import json, random
random.seed(83)
t = []
for _ in range(4):
    n = random.randint(1, 60); q = random.randint(1, 20)
    a = [random.randint(0, 30) for _ in range(n)]
    qs = []
    for _ in range(q):
        l = random.randint(-2, 32); qs.append("%d %d" % (l, l + random.randint(-1, 10)))
    t.append("%d\n%s\n%d\n%s" % (n, " ".join(map(str, a)), q, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:integer-sqrt
kind: task
title: Целый квадратный корень
category: Бинарный поиск
level: medium
tags: бинарный поиск по ответу, isqrt, Ньютон
related: lib:math.isqrt, algo:binary-search
## Условие
Дано целое N ≥ 0. Выведите наибольшее целое X, такое что X² ≤ N.
## Входные данные
N (0 ≤ N ≤ 10^36).
## Выходные данные
⌊√N⌋.
## Примеры
```in
17
```
```out
4
```
## Подсказки
- math.sqrt работает с float и для больших N теряет точность.
- Ответ лежит в [0, N]; проверка X² ≤ N монотонна — подходит бинарный поиск.
- math.isqrt считает точный целый корень.
## Решение: math.isqrt
@time: O(log N) @memory: O(1)
```python
import math
print(math.isqrt(int(input())))
```
## Решение: бинарный поиск по ответу
@time: O(log² N) с длинной арифметикой @memory: O(1)
```python
n = int(input())
lo, hi = 0, n + 1
while hi - lo > 1:
    mid = (lo + hi) // 2
    if mid * mid <= n:
        lo = mid
    else:
        hi = mid
print(lo)
```
## Решение: метод Ньютона
@time: O(log N) итераций @memory: O(1)
x ← (x + N // x) // 2 сходится сверху к ⌊√N⌋.
```python
n = int(input())
if n < 2:
    print(n)
else:
    x = 1 << ((n.bit_length() + 1) // 2)
    while True:
        y = (x + n // x) // 2
        if y >= x:
            break
        x = y
    print(x)
```
## Объяснение
Начальное приближение 2^⌈bits/2⌉ гарантированно не меньше корня, поэтому итерации монотонно убывают.
## Генератор
```python
import json, random
random.seed(84)
t = ["0", "1", "2", "3", "4", "99", "100", str(10**36), str(10**36 - 1)]
t += [str(random.randint(0, 10**36)) for _ in range(3)]
print(json.dumps(t))
```

# id: task:cut-ropes
kind: task
title: Верёвки одинаковой длины
category: Бинарный поиск
level: hard
tags: бинарный поиск по ответу, монотонность
related: algo:binary-search
## Условие
Есть N верёвок целой длины. Из них нужно нарезать K кусков одинаковой целой длины (остатки выбрасываются, склеивать нельзя). Найдите наибольшую возможную длину куска или 0, если нельзя получить K кусков даже длины 1.
## Входные данные
N и K (1 ≤ N ≤ 10^5, 1 ≤ K ≤ 10^9), затем N длин (1 ≤ L_i ≤ 10^9).
## Выходные данные
Наибольшая длина.
## Примеры
```in
4 11
802 743 457 539
```
```out
200
```
## Подсказки
- Если можно нарезать K кусков длины X, то можно и любой меньшей длины.
- Число кусков длины X: сумма L_i // X.
- Бинарный поиск по X на отрезке [1, max(L)].
## Решение: бинарный поиск по ответу
@time: O(N log max L) @memory: O(N)
```python
n, k = map(int, input().split())
ropes = list(map(int, input().split()))
lo, hi = 0, max(ropes) + 1
while hi - lo > 1:
    mid = (lo + hi) // 2
    if sum(r // mid for r in ropes) >= k:
        lo = mid
    else:
        hi = mid
print(lo)
```
## Решение: bisect по «перевёрнутому» предикату
@time: O(N log max L) @memory: O(N)
bisect (Python 3.10+) принимает key: ищем первую длину, при которой кусков уже не хватает.
```python
from bisect import bisect_left
n, k = map(int, input().split())
ropes = list(map(int, input().split()))
lengths = range(1, max(ropes) + 1)
first_bad = bisect_left(lengths, True, key=lambda x: sum(r // x for r in ropes) < k)
print(first_bad)
```
## Объяснение
Во втором способе bisect_left возвращает индекс первой «плохой» длины; так как длины начинаются с 1, этот индекс равен последней хорошей длине.
## Генератор
```python
import json, random
random.seed(85)
t = ["1 1\n1", "1 2\n1", "2 3\n5 5", "3 1\n1000000000 1 1"]
for _ in range(3):
    n = random.randint(1, 100)
    t.append("%d %d\n%s" % (n, random.randint(1, 500), " ".join(str(random.randint(1, 1000)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:aggressive-cows
kind: task
title: Расстановка с максимальным зазором
category: Бинарный поиск
level: hard
tags: бинарный поиск по ответу, жадная проверка
related: algo:binary-search, algo:greedy
## Условие
На прямой есть N стойл с различными координатами. Нужно поставить K коров в разные стойла так, чтобы минимальное расстояние между любыми двумя коровами было как можно больше. Выведите это расстояние.
## Входные данные
N и K (2 ≤ K ≤ N ≤ 10^5), затем N координат (0 ≤ x ≤ 10^9).
## Выходные данные
Наибольшее минимальное расстояние.
## Примеры
```in
5 3
1 2 8 4 9
```
```out
3
```
## Подсказки
- Если можно расставить с зазором D, то и с любым меньшим.
- Проверка для D жадная: ставим корову в первое стойло, каждую следующую — в первое стойло на расстоянии ≥ D.
- Бинарный поиск по D на отсортированных координатах.
## Решение: бинарный поиск + жадная проверка
@time: O(N log N + N log X) @memory: O(N)
```python
n, k = map(int, input().split())
xs = sorted(map(int, input().split()))

def can(d):
    cnt, last = 1, xs[0]
    for x in xs[1:]:
        if x - last >= d:
            cnt += 1
            last = x
            if cnt == k:
                return True
    return cnt >= k

lo, hi = 0, xs[-1] - xs[0] + 1
while hi - lo > 1:
    mid = (lo + hi) // 2
    if can(mid):
        lo = mid
    else:
        hi = mid
print(lo)
```
## Решение: перебор сочетаний (только малые N)
@time: O(C(N, K)·K) @memory: O(K)
Полный перебор всех способов — годится для проверки при N до 12–15.
```python
from itertools import combinations
n, k = map(int, input().split())
xs = sorted(map(int, input().split()))
print(max(min(b - a for a, b in zip(c, c[1:])) for c in combinations(xs, k)))
```
## Объяснение
Жадная проверка оптимальна: ставить корову раньше, чем нужно, никогда не помогает следующим.
## Генератор
```python
import json, random
random.seed(86)
t = ["2 2\n0 1000000000", "3 3\n1 2 3"]
for _ in range(4):
    n = random.randint(2, 12)
    t.append("%d %d\n%s" % (n, random.randint(2, n), " ".join(map(str, random.sample(range(0, 100), n)))))
print(json.dumps(t))
```
