# id: task:list-sum-max-min
kind: task
title: Сумма, минимум и максимум списка
category: Списки
level: beginner
tags: sum, min, max, список
related: py:builtin:sum, py:builtin:min, py:builtin:max
## Условие
Дан список из N целых чисел. Выведите через пробел его сумму, минимум и максимум.
## Входные данные
В первой строке N (1 ≤ N ≤ 10^5), во второй — N чисел.
## Выходные данные
Три числа: сумма, минимум, максимум.
## Примеры
```in
5
3 -1 4 1 5
```
```out
12 -1 5
```
## Подсказки
- Прочитайте числа в список через map(int, input().split()).
- Встроенные sum, min, max работают с любым списком.
- За один проход можно посчитать всё сразу.
## Решение: встроенные функции
@time: O(N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
print(sum(a), min(a), max(a))
```
## Решение: один проход
@time: O(N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
s, lo, hi = 0, a[0], a[0]
for x in a:
    s += x
    if x < lo:
        lo = x
    if x > hi:
        hi = x
print(s, lo, hi)
```
## Объяснение
Три встроенные функции делают три прохода, но каждый написан на C и очень быстр.
## Генератор
```python
import json, random
random.seed(41)
t = ["1\n7", "3\n-1 -2 -3"]
for _ in range(5):
    n = random.randint(1, 300)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:count-positive
kind: task
title: Количество положительных
category: Списки
level: beginner
tags: фильтр, условие, sum
related: py:topic:comprehensions
## Условие
Дан список из N целых чисел. Сколько в нём положительных чисел?
## Входные данные
N, затем N чисел в одной строке.
## Выходные данные
Количество положительных.
## Примеры
```in
6
1 -2 0 5 -7 3
```
```out
3
```
## Подсказки
- Пройдите по списку и проверьте x > 0.
- Ноль не является положительным.
- sum(x > 0 for x in a) — сумма логических значений.
## Решение: цикл
@time: O(N) @memory: O(N)
```python
input()
a = map(int, input().split())
k = 0
for x in a:
    if x > 0:
        k += 1
print(k)
```
## Решение: генератор
@time: O(N) @memory: O(1)
```python
input()
print(sum(1 for x in map(int, input().split()) if x > 0))
```
## Решение: filter
@time: O(N) @memory: O(N)
```python
input()
print(len(list(filter(lambda x: x > 0, map(int, input().split())))))
```
## Объяснение
filter возвращает итератор, поэтому для len его нужно превратить в список.
## Генератор
```python
import json, random
random.seed(42)
t = ["1\n0", "3\n1 2 3"]
for _ in range(5):
    n = random.randint(1, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10, 10)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:reverse-list
kind: task
title: Развернуть список
category: Списки
level: beginner
tags: reverse, срез, два указателя
related: py:method:list.reverse, py:topic:slicing
## Условие
Дан список из N чисел. Выведите его элементы в обратном порядке.
## Входные данные
N, затем N чисел.
## Выходные данные
Элементы в обратном порядке через пробел.
## Примеры
```in
4
1 2 3 4
```
```out
4 3 2 1
```
## Подсказки
- Срез a[::-1] создаёт развёрнутую копию.
- Метод a.reverse() разворачивает список на месте.
- Вручную: меняйте местами a[i] и a[n-1-i] до середины.
## Решение: срез
@time: O(N) @memory: O(N)
```python
input()
print(*input().split()[::-1])
```
## Решение: обмен на месте
@time: O(N) @memory: O(1) дополнительно
```python
n = int(input())
a = input().split()
for i in range(n // 2):
    a[i], a[n - 1 - i] = a[n - 1 - i], a[i]
print(*a)
```
## Решение: метод reverse
@time: O(N) @memory: O(1) дополнительно
```python
input()
a = input().split()
a.reverse()
print(" ".join(a))
```
## Объяснение
reverse() ничего не возвращает (None) — частая ошибка: print(a.reverse()).
## Генератор
```python
import json
print(json.dumps(["1\n5", "2\n1 2", "5\n5 4 3 2 1", "6\n-1 0 1 2 3 4"]))
```

# id: task:greater-than-prev
kind: task
title: Больше предыдущего
category: Списки
level: easy
tags: соседние элементы, zip, индексы
related: py:builtin:zip
## Условие
Дан список из N чисел. Выведите все элементы, которые больше предыдущего элемента, в порядке следования (или -, если таких нет).
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Подходящие элементы через пробел или -.
## Примеры
```in
6
1 5 2 4 3 6
```
```out
5 4 6
```
## Подсказки
- Первый элемент не имеет предыдущего.
- Сравнивайте a[i] и a[i-1] для i от 1.
- zip(a, a[1:]) даёт пары соседей.
## Решение: индексы
@time: O(N) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
res = [a[i] for i in range(1, n) if a[i] > a[i - 1]]
print(*res if res else "-")
```
## Решение: пары соседей через zip
@time: O(N) @memory: O(N)
```python
input()
a = list(map(int, input().split()))
res = [y for x, y in zip(a, a[1:]) if y > x]
print(" ".join(map(str, res)) or "-")
```
## Решение: itertools.pairwise
@time: O(N) @memory: O(N)
pairwise появилась в Python 3.10 и не копирует список.
```python
from itertools import pairwise
input()
res = [y for x, y in pairwise(map(int, input().split())) if y > x]
print(" ".join(map(str, res)) or "-")
```
## Объяснение
print(*"-") печатает символ "-" — строка распаковывается посимвольно.
## Генератор
```python
import json, random
random.seed(43)
t = ["1\n5", "3\n3 2 1", "3\n1 2 3"]
for _ in range(4):
    n = random.randint(1, 50)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-20, 20)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:remove-duplicates-list
kind: task
title: Уникальные элементы в порядке появления
category: Списки
level: easy
tags: уникальные, множество, порядок
related: py:topic:sets, py:method:dict.fromkeys
## Условие
Дан список из N чисел. Выведите каждое число один раз — в порядке первого появления.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Уникальные числа через пробел.
## Примеры
```in
7
3 1 3 2 1 5 2
```
```out
3 1 2 5
```
## Подсказки
- Запоминайте уже выведенные числа.
- Проверка x in set — O(1), x in list — O(N).
- dict.fromkeys сохраняет порядок вставки.
## Решение: множество seen
@time: O(N) @memory: O(N)
```python
input()
seen = set()
res = []
for x in input().split():
    if x not in seen:
        seen.add(x)
        res.append(x)
print(*res)
```
## Решение: dict.fromkeys
@time: O(N) @memory: O(N)
```python
input()
print(*dict.fromkeys(map(int, input().split())))
```
## Объяснение
Проверка «x not in res» по списку сделала бы решение O(N²).
## Генератор
```python
import json, random
random.seed(44)
t = ["1\n1", "4\n2 2 2 2"]
for _ in range(5):
    n = random.randint(1, 200)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-5, 30)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:rotate-list
kind: task
title: Циклический сдвиг массива
category: Списки
level: easy
tags: сдвиг, срезы, deque
related: lib:collections.deque.rotate, py:topic:slicing
## Условие
Дан массив из N чисел и число K. Сдвиньте массив циклически влево на K позиций.
## Входные данные
N и K (1 ≤ N ≤ 10^5, 0 ≤ K ≤ 10^18), затем N чисел.
## Выходные данные
Сдвинутый массив.
## Примеры
```in
5 2
1 2 3 4 5
```
```out
3 4 5 1 2
```
## Подсказки
- Сдвиг на N возвращает массив в исходное положение: K %= N.
- Левый сдвиг на k: a[k:] + a[:k].
- deque.rotate(-k) делает левый сдвиг.
## Решение: срезы
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
a = input().split()
k %= n
print(*(a[k:] + a[:k]))
```
## Решение: deque
@time: O(N) @memory: O(N)
```python
from collections import deque
n, k = map(int, input().split())
d = deque(input().split())
d.rotate(-(k % n))
print(*d)
```
## Решение: три разворота
@time: O(N) @memory: O(1) дополнительно
Классический приём без доп. памяти: развернуть части [0, k) и [k, n), затем весь массив.
```python
n, k = map(int, input().split())
a = input().split()
k %= n

def rev(l, r):
    while l < r:
        a[l], a[r] = a[r], a[l]
        l += 1
        r -= 1

rev(0, k - 1)
rev(k, n - 1)
rev(0, n - 1)
print(*a)
```
## Объяснение
Три разворота нужны, когда памяти мало (например, в C); в Python срезы проще.
## Генератор
```python
import json
print(json.dumps(["1 5\n7", "3 0\n1 2 3", "3 3\n1 2 3", "4 1000000000000000001\n1 2 3 4", "6 4\n1 2 3 4 5 6"]))
```

# id: task:merge-sorted
kind: task
title: Слияние отсортированных списков
category: Списки
level: medium
tags: слияние, два указателя, merge, heapq.merge
related: algo:two-pointers, lib:heapq.merge, algo:sorting
## Условие
Даны два отсортированных по неубыванию списка. Выведите их слияние — один отсортированный список.
## Входные данные
N, затем N чисел; M, затем M чисел (1 ≤ N, M ≤ 10^5).
## Выходные данные
N + M чисел в порядке неубывания.
## Примеры
```in
3
1 4 9
4
2 3 4 10
```
```out
1 2 3 4 4 9 10
```
## Подсказки
- Сравнивайте текущие первые элементы двух списков.
- Меньший переносите в ответ и двигайте его указатель.
- Когда один список закончился — допишите остаток другого.
## Решение: два указателя
@time: O(N + M) @memory: O(N + M)
```python
input()
a = list(map(int, input().split()))
input()
b = list(map(int, input().split()))
i = j = 0
res = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
res += a[i:]
res += b[j:]
print(*res)
```
## Решение: heapq.merge
@time: O(N + M) @memory: O(N + M)
```python
import heapq
input()
a = map(int, input().split())
input()
b = map(int, input().split())
print(*heapq.merge(a, b))
```
## Решение: sorted
@time: O((N + M) log(N + M)) @memory: O(N + M)
Сортировка Timsort находит две отсортированные серии и сливает их почти за линейное время.
```python
input()
a = list(map(int, input().split()))
input()
b = list(map(int, input().split()))
print(*sorted(a + b))
```
## Объяснение
Слияние — основа сортировки слиянием (merge sort).
## Генератор
```python
import json, random
random.seed(45)
t = ["1\n1\n1\n1"]
for _ in range(5):
    n, m = random.randint(1, 100), random.randint(1, 100)
    a = sorted(random.randint(-50, 50) for _ in range(n)); b = sorted(random.randint(-50, 50) for _ in range(m))
    t.append("%d\n%s\n%d\n%s" % (n, " ".join(map(str, a)), m, " ".join(map(str, b))))
print(json.dumps(t))
```

# id: task:max-subarray
kind: task
title: Максимальная сумма подотрезка
category: Списки
level: medium
tags: Кадане, префиксные суммы, DP, подмассив
related: algo:dp, algo:prefix-sums
## Условие
Дан массив из N целых чисел. Найдите максимальную сумму непустого подотрезка (подряд идущих элементов).
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел (|a_i| ≤ 10^9).
## Выходные данные
Максимальная сумма.
## Примеры
```in
8
-2 1 -3 4 -1 2 1 -5
```
```out
6
```
## Подсказки
- Перебор всех подотрезков — O(N²) или O(N³), слишком медленно.
- Если сумма отрезка, заканчивающегося в i-1, отрицательна, её выгоднее отбросить.
- cur = max(a[i], cur + a[i]); ответ — максимум cur.
## Решение: алгоритм Кадане
@time: O(N) @memory: O(1)
```python
input()
a = list(map(int, input().split()))
best = cur = a[0]
for x in a[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
print(best)
```
## Решение: префиксные суммы
@time: O(N) @memory: O(1)
Сумма отрезка = pref[r] − pref[l]; для каждого r вычитаем минимальный предыдущий префикс.
```python
input()
a = map(int, input().split())
pref = 0
min_pref = 0
best = None
for x in a:
    pref += x
    cand = pref - min_pref
    if best is None or cand > best:
        best = cand
    min_pref = min(min_pref, pref)
print(best)
```
## Решение: разделяй и властвуй
@time: O(N log N) @memory: O(log N)
Ответ лежит в левой половине, в правой или пересекает середину.
```python
import sys
sys.setrecursionlimit(10000)
input()
a = list(map(int, input().split()))

def solve(l, r):
    if l == r:
        return a[l]
    m = (l + r) // 2
    s = 0
    left = float("-inf")
    for i in range(m, l - 1, -1):
        s += a[i]
        left = max(left, s)
    s = 0
    right = float("-inf")
    for i in range(m + 1, r + 1):
        s += a[i]
        right = max(right, s)
    return max(solve(l, m), solve(m + 1, r), left + right)

print(solve(0, len(a) - 1))
```
## Объяснение
Кадане — это динамика: cur хранит лучшую сумму отрезка, заканчивающегося в текущей позиции.
## Генератор
```python
import json, random
random.seed(46)
t = ["1\n-5", "3\n-3 -1 -2", "4\n1 2 3 4"]
for n in (10, 100, 1000):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:element-index
kind: task
title: Позиции элемента
category: Списки
level: beginner
tags: index, enumerate, поиск
related: py:builtin:enumerate, py:method:list.index
## Условие
Дан список из N чисел и число X. Выведите все позиции (нумерация с 1), на которых стоит X, или -1, если X нет в списке.
## Входные данные
N, затем N чисел, затем X.
## Выходные данные
Позиции через пробел или -1.
## Примеры
```in
6
4 2 4 1 4 3
4
```
```out
1 3 5
```
## Подсказки
- Нужны и значения, и их индексы.
- enumerate(a, 1) даёт пары (номер, значение) с нумерацией с 1.
- list.index находит только первое вхождение.
## Решение: enumerate
@time: O(N) @memory: O(N)
```python
input()
a = input().split()
x = input().strip()
pos = [i for i, v in enumerate(a, 1) if v == x]
print(*pos if pos else [-1])
```
## Решение: index в цикле
@time: O(N) @memory: O(N)
index(x, start) ищет следующее вхождение начиная с позиции start.
```python
input()
a = list(map(int, input().split()))
x = int(input())
pos = []
i = -1
while True:
    try:
        i = a.index(x, i + 1)
    except ValueError:
        break
    pos.append(i + 1)
print(" ".join(map(str, pos)) if pos else -1)
```
## Объяснение
Если элемента нет, index бросает ValueError — его приходится ловить.
## Генератор
```python
import json
print(json.dumps(["1\n5\n5", "1\n5\n3", "5\n1 1 1 1 1\n1", "4\n-1 2 -1 3\n-1"]))
```

# id: task:pairs-equal
kind: task
title: Пары равных элементов
category: Списки
level: medium
tags: пары, Counter, комбинаторика
related: lib:collections.Counter, algo:combinatorics
## Условие
Дан список из N чисел. Сколько существует пар индексов i < j, для которых a_i = a_j?
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Количество пар.
## Примеры
```in
5
1 2 1 1 2
```
```out
4
```
## Подсказки
- Двойной цикл даёт O(N²) — слишком медленно для 2·10^5.
- Посчитайте, сколько раз встречается каждое значение.
- Значение, встретившееся c раз, даёт c·(c−1)/2 пар.
## Решение: Counter и формула
@time: O(N) @memory: O(N)
```python
from collections import Counter
input()
cnt = Counter(input().split())
print(sum(c * (c - 1) // 2 for c in cnt.values()))
```
## Решение: подсчёт на лету
@time: O(N) @memory: O(N)
Каждый новый элемент образует пары со всеми такими же, встреченными раньше.
```python
input()
seen = {}
pairs = 0
for x in input().split():
    pairs += seen.get(x, 0)
    seen[x] = seen.get(x, 0) + 1
print(pairs)
```
## Объяснение
c·(c−1)/2 — число сочетаний из c по 2, то есть math.comb(c, 2).
## Генератор
```python
import json, random
random.seed(47)
t = ["1\n1", "3\n1 1 1"]
for n in (10, 100, 5000):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(1, 20)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:running-sum
kind: task
title: Накопленные суммы
category: Списки
level: beginner
tags: префиксные суммы, accumulate
related: lib:itertools.accumulate, algo:prefix-sums
## Условие
Дан массив из N чисел. Выведите массив накопленных сумм: i-й элемент — сумма первых i элементов.
## Входные данные
N, затем N чисел.
## Выходные данные
N чисел.
## Примеры
```in
4
1 2 3 4
```
```out
1 3 6 10
```
## Подсказки
- Каждая следующая сумма — предыдущая плюс текущий элемент.
- Храните текущую сумму в переменной.
- itertools.accumulate делает это за вас.
## Решение: цикл
@time: O(N) @memory: O(N)
```python
input()
s = 0
res = []
for x in map(int, input().split()):
    s += x
    res.append(s)
print(*res)
```
## Решение: accumulate
@time: O(N) @memory: O(N)
```python
from itertools import accumulate
input()
print(*accumulate(map(int, input().split())))
```
## Объяснение
Префиксные суммы позволяют потом за O(1) находить сумму любого отрезка.
## Генератор
```python
import json, random
random.seed(48)
t = ["1\n5"]
for _ in range(4):
    n = random.randint(1, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-100, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:move-zeros
kind: task
title: Нули в конец
category: Списки
level: easy
tags: два указателя, стабильность, sorted key
related: algo:two-pointers
## Условие
Дан массив из N целых чисел. Переместите все нули в конец, сохранив порядок остальных элементов.
## Входные данные
N, затем N чисел.
## Выходные данные
Изменённый массив.
## Примеры
```in
6
0 1 0 3 12 0
```
```out
1 3 12 0 0 0
```
## Подсказки
- Порядок ненулевых элементов должен сохраниться.
- Можно собрать ненулевые элементы, а затем дописать нужное количество нулей.
- На месте: указатель «куда писать» двигается только при ненулевом элементе.
## Решение: фильтр и добавление нулей
@time: O(N) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
nz = [x for x in a if x != 0]
print(*(nz + [0] * (n - len(nz))))
```
## Решение: два указателя на месте
@time: O(N) @memory: O(1) дополнительно
```python
input()
a = list(map(int, input().split()))
w = 0
for r in range(len(a)):
    if a[r] != 0:
        a[w], a[r] = a[r], a[w]
        w += 1
print(*a)
```
## Решение: стабильная сортировка по ключу
@time: O(N log N) @memory: O(N)
sorted стабилен: элементы с одинаковым ключом сохраняют порядок. Ключ x == 0 равен False для ненулевых.
```python
input()
print(*sorted(map(int, input().split()), key=lambda x: x == 0))
```
## Объяснение
Стабильность сортировки в Python гарантирована документацией.
## Генератор
```python
import json, random
random.seed(49)
t = ["1\n0", "1\n5", "3\n0 0 0"]
for _ in range(4):
    n = random.randint(1, 60)
    t.append("%d\n%s" % (n, " ".join(str(random.choice([0, 0, random.randint(-9, 9)])) for _ in range(n))))
print(json.dumps(t))
```

# id: task:missing-number
kind: task
title: Пропущенное число
category: Списки
level: easy
tags: сумма, XOR, множество
related: algo:bits, algo:arithmetic
## Условие
В массиве N−1 различных чисел от 1 до N, одно число пропущено. Найдите его.
## Входные данные
N (2 ≤ N ≤ 2·10^5), затем N−1 чисел.
## Выходные данные
Пропущенное число.
## Примеры
```in
5
3 1 5 2
```
```out
4
```
## Подсказки
- Сумма чисел от 1 до N известна: N(N+1)/2.
- Разница между ней и суммой массива — ответ.
- Альтернатива без больших сумм: XOR всех чисел 1..N и элементов массива.
## Решение: сумма
@time: O(N) @memory: O(1)
```python
n = int(input())
print(n * (n + 1) // 2 - sum(map(int, input().split())))
```
## Решение: XOR
@time: O(N) @memory: O(1)
x ^ x = 0, поэтому все присутствующие числа взаимно уничтожатся.
```python
n = int(input())
r = 0
for i in range(1, n + 1):
    r ^= i
for x in map(int, input().split()):
    r ^= x
print(r)
```
## Решение: множество
@time: O(N) @memory: O(N)
```python
n = int(input())
present = set(map(int, input().split()))
print(next(i for i in range(1, n + 1) if i not in present))
```
## Объяснение
В языках с переполнением XOR безопаснее суммы; в Python оба способа точны.
## Генератор
```python
import json, random
random.seed(50)
t = []
for n in (2, 3, 10, 1000, 3000):
    a = list(range(1, n + 1)); random.shuffle(a); a.pop()
    t.append("%d\n%s" % (n, " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:majority-element
kind: task
title: Элемент большинства
category: Списки
level: medium
tags: Бойер–Мур, голосование, Counter
related: lib:collections.Counter
## Условие
Дан массив из N чисел. Известно, что одно значение встречается строго больше N/2 раз. Найдите его.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Элемент большинства.
## Примеры
```in
7
2 2 1 1 1 2 2
```
```out
2
```
## Подсказки
- Можно посчитать частоты всех чисел.
- После сортировки элемент большинства обязательно стоит в середине.
- Алгоритм голосования Бойера–Мура находит его за O(N) и O(1) памяти.
## Решение: голосование Бойера–Мура
@time: O(N) @memory: O(1)
```python
input()
cand, cnt = None, 0
for x in input().split():
    if cnt == 0:
        cand = x
    cnt += 1 if x == cand else -1
print(cand)
```
## Решение: Counter
@time: O(N) @memory: O(N)
```python
from collections import Counter
input()
print(Counter(input().split()).most_common(1)[0][0])
```
## Решение: медиана после сортировки
@time: O(N log N) @memory: O(N)
```python
n = int(input())
print(sorted(map(int, input().split()))[n // 2])
```
## Объяснение
Каждый «голос против» уничтожает пару разных элементов; элемент большинства переживает все уничтожения.
## Генератор
```python
import json, random
random.seed(51)
t = ["1\n9"]
for n in (5, 50, 1001):
    m = random.randint(-100, 100)
    a = [m] * (n // 2 + 1) + [random.randint(-100, 100) for _ in range(n - n // 2 - 1)]
    random.shuffle(a)
    t.append("%d\n%s" % (n, " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:chunks
kind: task
title: Разбить на группы
category: Списки
level: easy
tags: срезы, шаг range, batched
related: py:topic:slicing, py:builtin:range
## Условие
Дан список из N элементов и число K. Разбейте список на группы по K элементов подряд (последняя группа может быть короче) и выведите каждую группу на отдельной строке.
## Входные данные
N и K (1 ≤ K ≤ N ≤ 10^4), затем N элементов.
## Выходные данные
Группы, по одной в строке.
## Примеры
```in
7 3
1 2 3 4 5 6 7
```
```out
1 2 3
4 5 6
7
```
## Подсказки
- Группа начинается на позициях 0, K, 2K, …
- range(0, n, k) перебирает начала групп.
- Срез a[i:i + k] безопасен даже за границей списка.
## Решение: срезы с шагом
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
a = input().split()
for i in range(0, n, k):
    print(*a[i:i + k])
```
## Решение: zip_longest-подобный приём через итератор
@time: O(N) @memory: O(N)
islice берёт следующие K элементов одного общего итератора.
```python
from itertools import islice
n, k = map(int, input().split())
it = iter(input().split())
while chunk := list(islice(it, k)):
    print(*chunk)
```
## Объяснение
В Python 3.12 появился itertools.batched, но на часах работает Python 3.11 — там его нет, поэтому используем islice.
## Генератор
```python
import json
print(json.dumps(["1 1\nx", "5 5\n1 2 3 4 5", "5 1\n1 2 3 4 5", "10 4\n" + " ".join(map(str, range(10)))]))
```

# id: task:intersect-lists
kind: task
title: Общие элементы двух списков
category: Множества
level: easy
tags: пересечение, set, &
related: py:topic:sets, py:method:set.intersection
## Условие
Даны два списка чисел. Выведите в порядке возрастания числа, которые есть в обоих списках (каждое один раз), или -, если таких нет.
## Входные данные
Две строки с числами.
## Выходные данные
Общие числа по возрастанию или -.
## Примеры
```in
1 2 3 4 5
4 5 6 1
```
```out
1 4 5
```
## Подсказки
- Превратите списки во множества.
- Пересечение множеств: a & b.
- Отсортируйте результат.
## Решение: пересечение множеств
@time: O(N + M + K log K) @memory: O(N + M)
```python
a = set(map(int, input().split()))
b = set(map(int, input().split()))
res = sorted(a & b)
print(*res if res else "-")
```
## Решение: сортировка и два указателя
@time: O(N log N + M log M) @memory: O(N + M)
```python
a = sorted(set(map(int, input().split())))
b = sorted(set(map(int, input().split())))
i = j = 0
res = []
while i < len(a) and j < len(b):
    if a[i] == b[j]:
        res.append(a[i])
        i += 1
        j += 1
    elif a[i] < b[j]:
        i += 1
    else:
        j += 1
print(" ".join(map(str, res)) or "-")
```
## Объяснение
Два указателя полезны, когда списки уже отсортированы — тогда множества не нужны.
## Генератор
```python
import json, random
random.seed(52)
t = ["1\n2", "1 1 1\n1"]
for _ in range(4):
    t.append(" ".join(str(random.randint(0, 30)) for _ in range(20)) + "\n" + " ".join(str(random.randint(0, 30)) for _ in range(20)))
print(json.dumps(t))
```

# id: task:distinct-count
kind: task
title: Количество различных чисел
category: Множества
level: beginner
tags: set, len, уникальные
related: py:topic:sets
## Условие
Дан список чисел. Сколько среди них различных?
## Входные данные
Одна строка с числами (до 10^5 чисел).
## Выходные данные
Количество различных чисел.
## Примеры
```in
1 2 2 3 3 3
```
```out
3
```
## Подсказки
- Множество хранит только уникальные значения.
- len(set(...)) — ответ.
- Без множества: отсортируйте и посчитайте места смены значения.
## Решение: множество
@time: O(N) @memory: O(N)
```python
print(len(set(map(int, input().split()))))
```
## Решение: сортировка
@time: O(N log N) @memory: O(N)
```python
a = sorted(map(int, input().split()))
print(sum(1 for i in range(len(a)) if i == 0 or a[i] != a[i - 1]))
```
## Объяснение
Числа сравниваем как int: строки "01" и "1" были бы разными.
## Генератор
```python
import json, random
random.seed(53)
print(json.dumps(["5", "1 1 1", "01 1 001"] + [" ".join(str(random.randint(0, 50)) for _ in range(100)) for _ in range(3)]))
```

# id: task:two-sum
kind: task
title: Два числа с заданной суммой
category: Словари
level: medium
tags: two sum, словарь, хеш-таблица, два указателя
related: algo:hashing, algo:two-pointers
## Условие
Дан массив из N чисел и число S. Найдите два различных индекса i < j (нумерация с 1), для которых a_i + a_j = S. Если подходящих пар несколько, выведите пару с наименьшим j, а при равенстве j — с наименьшим i. Если пары нет, выведите -1.
## Входные данные
N и S (2 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Два индекса или -1.
## Примеры
```in
5 9
2 7 11 15 1
```
```out
1 2
```
## Подсказки
- Перебор всех пар — O(N²).
- Для каждого a_j нужно знать, встречалось ли раньше число S − a_j.
- Словарь «значение → первый индекс» отвечает на это за O(1).
## Решение: словарь
@time: O(N) @memory: O(N)
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))
first = {}
ans = None
for j, x in enumerate(a, 1):
    if s - x in first:
        ans = (first[s - x], j)
        break
    first.setdefault(x, j)
print(*ans if ans else [-1])
```
## Решение: перебор пар (для проверки)
@time: O(N²) @memory: O(1)
Перебираем j по возрастанию, для каждого — i по возрастанию. Подходит только для небольших N.
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))
ans = "-1"
done = False
for j in range(n):
    for i in range(j):
        if a[i] + a[j] == s:
            ans = "%d %d" % (i + 1, j + 1)
            done = True
            break
    if done:
        break
print(ans)
```
## Объяснение
setdefault сохраняет только первый индекс каждого значения — так выполняется условие о наименьшем i.
## Генератор
```python
import json, random
random.seed(54)
t = ["2 2\n1 1", "2 3\n1 1", "4 0\n-1 1 -1 1"]
for n in (10, 100, 1000):
    a = [random.randint(-50, 50) for _ in range(n)]
    t.append("%d %d\n%s" % (n, random.randint(-60, 60), " ".join(map(str, a))))
print(json.dumps(t))
```
