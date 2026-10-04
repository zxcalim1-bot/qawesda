# id: task:pair-sum-sorted
kind: task
title: Пара с суммой в отсортированном массиве
category: Два указателя
level: easy
tags: два указателя, отсортированный массив, сумма
related: algo:two-pointers
## Условие
Дан отсортированный по возрастанию массив из N различных чисел и число S. Выведите количество пар i < j, для которых a_i + a_j = S.
## Входные данные
N и S (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Количество пар.
## Примеры
```in
6 10
1 2 4 6 8 9
```
```out
3
```
## Подсказки
- Поставьте указатели в начало и конец массива.
- Если сумма меньше S — двигайте левый вправо, больше — правый влево.
- При совпадении считайте пару и двигайте оба указателя (числа различны).
## Решение: два указателя
@time: O(N) @memory: O(N)
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))
i, j = 0, n - 1
count = 0
while i < j:
    cur = a[i] + a[j]
    if cur == s:
        count += 1
        i += 1
        j -= 1
    elif cur < s:
        i += 1
    else:
        j -= 1
print(count)
```
## Решение: множество
@time: O(N) @memory: O(N)
Для каждого элемента проверяем, встречалось ли раньше S − x.
```python
n, s = map(int, input().split())
seen = set()
count = 0
for x in map(int, input().split()):
    if s - x in seen:
        count += 1
    seen.add(x)
print(count)
```
## Решение: бинарный поиск пары
@time: O(N log N) @memory: O(N)
```python
from bisect import bisect_left
n, s = map(int, input().split())
a = list(map(int, input().split()))
count = 0
for i, x in enumerate(a):
    j = bisect_left(a, s - x, i + 1)
    if j < n and a[j] == s - x:
        count += 1
print(count)
```
## Объяснение
Два указателя используют отсортированность и не требуют дополнительной памяти.
## Генератор
```python
import json, random
random.seed(91)
t = ["1 2\n1", "2 3\n1 2", "2 4\n1 2"]
for _ in range(4):
    n = random.randint(1, 80)
    a = sorted(random.sample(range(-100, 100), n))
    t.append("%d %d\n%s" % (n, random.randint(-50, 50), " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:remove-duplicates-sorted
kind: task
title: Удаление дубликатов из отсортированного массива
category: Два указателя
level: easy
tags: два указателя, на месте, groupby
related: algo:two-pointers, lib:itertools.groupby
## Условие
Дан отсортированный по неубыванию массив. Оставьте каждое значение по одному разу и выведите количество различных значений и сами значения.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N чисел.
## Выходные данные
Количество, затем значения через пробел.
## Примеры
```in
7
1 1 2 3 3 3 5
```
```out
4
1 2 3 5
```
## Подсказки
- В отсортированном массиве повторы стоят рядом.
- Указатель «запись» двигается, только когда встречается новое значение.
- Сравнивайте текущий элемент с последним записанным.
## Решение: два указателя на месте
@time: O(N) @memory: O(1) дополнительно
```python
n = int(input())
a = list(map(int, input().split()))
w = 1
for r in range(1, n):
    if a[r] != a[w - 1]:
        a[w] = a[r]
        w += 1
print(w)
print(*a[:w])
```
## Решение: groupby
@time: O(N) @memory: O(N)
```python
from itertools import groupby
input()
u = [k for k, _ in groupby(map(int, input().split()))]
print(len(u))
print(*u)
```
## Объяснение
Для неотсортированного массива такой приём не работает — там нужен set.
## Генератор
```python
import json, random
random.seed(92)
t = ["1\n5", "3\n2 2 2"]
for _ in range(4):
    n = random.randint(1, 100)
    t.append("%d\n%s" % (n, " ".join(map(str, sorted(random.randint(0, 20) for _ in range(n))))))
print(json.dumps(t))
```

# id: task:container-water
kind: task
title: Сосуд с наибольшим объёмом
category: Два указателя
level: medium
tags: два указателя, жадный выбор, площадь
related: algo:two-pointers, algo:greedy
## Условие
Даны N вертикальных отрезков высоты h_i, стоящих в точках x = 1..N. Выберите два отрезка, которые вместе с осью образуют сосуд наибольшей вместимости: min(h_i, h_j) · (j − i). Выведите эту вместимость.
## Входные данные
N (2 ≤ N ≤ 2·10^5), затем N высот (0 ≤ h ≤ 10^4).
## Выходные данные
Наибольшая вместимость.
## Примеры
```in
9
1 8 6 2 5 4 8 3 7
```
```out
49
```
## Подсказки
- Перебор всех пар — O(N²).
- Начните с самых крайних отрезков: ширина максимальна.
- Двигайте указатель с меньшей высотой: только так площадь может вырасти.
## Решение: два указателя
@time: O(N) @memory: O(N)
```python
n = int(input())
h = list(map(int, input().split()))
i, j = 0, n - 1
best = 0
while i < j:
    best = max(best, min(h[i], h[j]) * (j - i))
    if h[i] < h[j]:
        i += 1
    else:
        j -= 1
print(best)
```
## Решение: перебор пар (малые N)
@time: O(N²) @memory: O(N)
```python
n = int(input())
h = list(map(int, input().split()))
print(max(min(h[i], h[j]) * (j - i) for i in range(n) for j in range(i + 1, n)))
```
## Объяснение
Если h[i] < h[j], любая пара (i, k) с k < j даст не больше, чем (i, j): ширина меньше, высота не больше h[i]. Поэтому i можно отбросить.
## Генератор
```python
import json, random
random.seed(93)
t = ["2\n1 1", "2\n0 5", "3\n1 2 1"]
for _ in range(4):
    n = random.randint(2, 120)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:longest-unique-substring
kind: task
title: Самая длинная подстрока без повторов
category: Скользящее окно
level: medium
tags: скользящее окно, словарь последних позиций
related: algo:sliding-window, algo:two-pointers
## Условие
Дана строка S. Найдите длину самой длинной подстроки без повторяющихся символов.
## Входные данные
Строка длиной до 10^5.
## Выходные данные
Длина подстроки.
## Примеры
```in
abcabcbb
```
```out
3
```
## Подсказки
- Поддерживайте окно [left, right] без повторов.
- При добавлении символа, который уже есть в окне, сдвиньте left за его прошлое вхождение.
- Храните последнюю позицию каждого символа в словаре.
## Решение: окно со словарём позиций
@time: O(n) @memory: O(k)
```python
s = input()
last = {}
left = 0
best = 0
for right, ch in enumerate(s):
    if ch in last and last[ch] >= left:
        left = last[ch] + 1
    last[ch] = right
    best = max(best, right - left + 1)
print(best)
```
## Решение: окно со множеством
@time: O(n) @memory: O(k)
Левый край сдвигается по одному символу, пока повтор не исчезнет.
```python
s = input()
window = set()
left = 0
best = 0
for ch in s:
    while ch in window:
        window.remove(s[left])
        left += 1
    window.add(ch)
    best = max(best, len(window))
print(best)
```
## Объяснение
Каждый символ добавляется и удаляется из окна не более одного раза — поэтому O(n).
## Генератор
```python
import json, random
random.seed(94)
t = ["", "a", "bbbbb", "pwwkew", "abcdef", "dvdf"]
for _ in range(3):
    t.append("".join(random.choice("abcdefgh") for _ in range(300)))
print(json.dumps(t))
```

# id: task:max-window-sum
kind: task
title: Максимальная сумма окна длины K
category: Скользящее окно
level: easy
tags: скользящее окно, префиксные суммы
related: algo:sliding-window, algo:prefix-sums
## Условие
Дан массив из N чисел и число K. Найдите максимальную сумму K подряд идущих элементов.
## Входные данные
N и K (1 ≤ K ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Максимальная сумма.
## Примеры
```in
6 3
1 -2 3 4 -1 2
```
```out
6
```
## Подсказки
- Сумма каждого окна заново — O(N·K).
- При сдвиге окна прибавьте новый элемент и вычтите ушедший.
- Или используйте префиксные суммы: sum(l..r) = p[r+1] − p[l].
## Решение: скользящее окно
@time: O(N) @memory: O(N)
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
cur = sum(a[:k])
best = cur
for i in range(k, n):
    cur += a[i] - a[i - k]
    best = max(best, cur)
print(best)
```
## Решение: префиксные суммы
@time: O(N) @memory: O(N)
```python
from itertools import accumulate
n, k = map(int, input().split())
p = [0] + list(accumulate(map(int, input().split())))
print(max(p[i + k] - p[i] for i in range(n - k + 1)))
```
## Объяснение
Оба способа линейны; окно не требует дополнительного массива.
## Генератор
```python
import json, random
random.seed(95)
t = ["1 1\n-5", "3 3\n1 2 3"]
for _ in range(4):
    n = random.randint(1, 200)
    t.append("%d %d\n%s" % (n, random.randint(1, n), " ".join(str(random.randint(-100, 100)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:min-subarray-len
kind: task
title: Кратчайший отрезок с суммой не меньше S
category: Скользящее окно
level: medium
tags: скользящее окно, положительные числа
related: algo:sliding-window, algo:binary-search
## Условие
Дан массив из N положительных чисел и число S. Найдите длину кратчайшего подотрезка с суммой не меньше S, или 0, если такого нет.
## Входные данные
N и S (1 ≤ N ≤ 2·10^5, 1 ≤ S ≤ 10^15), затем N чисел (1 ≤ a_i ≤ 10^9).
## Выходные данные
Длина или 0.
## Примеры
```in
6 7
2 3 1 2 4 3
```
```out
2
```
## Подсказки
- Числа положительные: расширение окна увеличивает сумму, сужение — уменьшает.
- Расширяйте правый край; пока сумма ≥ S — сужайте левый, обновляя ответ.
- Альтернатива: префиксные суммы + бинарный поиск для каждого левого края.
## Решение: скользящее окно
@time: O(N) @memory: O(N)
```python
n, s = map(int, input().split())
a = list(map(int, input().split()))
best = n + 1
left = 0
cur = 0
for right in range(n):
    cur += a[right]
    while cur >= s:
        best = min(best, right - left + 1)
        cur -= a[left]
        left += 1
print(best if best <= n else 0)
```
## Решение: префиксные суммы и bisect
@time: O(N log N) @memory: O(N)
Префиксные суммы возрастают, поэтому для каждого l ищем первый r с p[r] ≥ p[l] + S.
```python
from bisect import bisect_left
from itertools import accumulate
n, s = map(int, input().split())
p = [0] + list(accumulate(map(int, input().split())))
best = n + 1
for l in range(n):
    r = bisect_left(p, p[l] + s)
    if r <= n:
        best = min(best, r - l)
print(best if best <= n else 0)
```
## Объяснение
Метод окна работает только для неотрицательных чисел — с отрицательными сумма окна не монотонна.
## Генератор
```python
import json, random
random.seed(96)
t = ["1 5\n5", "1 6\n5", "3 100\n1 2 3"]
for _ in range(4):
    n = random.randint(1, 150)
    t.append("%d %d\n%s" % (n, random.randint(1, 500), " ".join(str(random.randint(1, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:range-sum-queries
kind: task
title: Сумма на отрезке
category: Префиксные суммы
level: easy
tags: префиксные суммы, запросы
related: algo:prefix-sums, lib:itertools.accumulate
## Условие
Дан массив из N чисел и Q запросов «L R» (1 ≤ L ≤ R ≤ N). На каждый запрос выведите сумму a_L + … + a_R.
## Входные данные
N и Q (до 2·10^5), затем N чисел, затем Q строк «L R».
## Выходные данные
Q чисел по одному в строке.
## Примеры
```in
5 3
1 2 3 4 5
1 5
2 3
4 4
```
```out
15
5
4
```
## Подсказки
- Считать каждую сумму циклом — O(N·Q).
- p[i] — сумма первых i элементов, p[0] = 0.
- Сумма отрезка [L, R] = p[R] − p[L−1].
## Решение: префиксные суммы
@time: O(N + Q) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
p = [0] * (n + 1)
for i in range(n):
    p[i + 1] = p[i] + int(data[2 + i])
out = []
pos = 2 + n
for _ in range(q):
    l, r = int(data[pos]), int(data[pos + 1])
    pos += 2
    out.append(p[r] - p[l - 1])
sys.stdout.write("\n".join(map(str, out)) + "\n")
```
## Решение: accumulate и input()
@time: O(N + Q) @memory: O(N)
```python
from itertools import accumulate
n, q = map(int, input().split())
p = [0, *accumulate(map(int, input().split()))]
for _ in range(q):
    l, r = map(int, input().split())
    print(p[r] - p[l - 1])
```
## Объяснение
Чтение всего ввода через sys.stdin.buffer заметно быстрее input() при сотнях тысяч строк.
## Генератор
```python
import json, random
random.seed(97)
t = []
for _ in range(4):
    n = random.randint(1, 50); q = random.randint(1, 20)
    a = " ".join(str(random.randint(-100, 100)) for _ in range(n))
    qs = []
    for _ in range(q):
        l = random.randint(1, n); qs.append("%d %d" % (l, random.randint(l, n)))
    t.append("%d %d\n%s\n%s" % (n, q, a, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:subarray-sum-k
kind: task
title: Количество отрезков с суммой K
category: Префиксные суммы
level: medium
tags: префиксные суммы, словарь, подсчёт
related: algo:prefix-sums, algo:hashing
## Условие
Дан массив из N целых чисел (возможно отрицательных) и число K. Сколько подотрезков имеют сумму ровно K?
## Входные данные
N и K (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
Количество подотрезков.
## Примеры
```in
5 3
1 2 1 2 1
```
```out
4
```
## Подсказки
- Сумма отрезка (l, r] = p[r] − p[l].
- Для каждого r нужно число предыдущих префиксов, равных p[r] − K.
- Храните количество встреченных значений префиксных сумм в словаре.
## Решение: префиксы и словарь
@time: O(N) @memory: O(N)
```python
from collections import defaultdict
n, k = map(int, input().split())
seen = defaultdict(int)
seen[0] = 1
p = 0
count = 0
for x in map(int, input().split()):
    p += x
    count += seen[p - k]
    seen[p] += 1
print(count)
```
## Решение: перебор отрезков (малые N)
@time: O(N²) @memory: O(1)
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
count = 0
for l in range(n):
    s = 0
    for r in range(l, n):
        s += a[r]
        if s == k:
            count += 1
print(count)
```
## Объяснение
Скользящее окно здесь не работает из-за отрицательных чисел — нужна связка «префиксы + словарь».
## Генератор
```python
import json, random
random.seed(98)
t = ["1 0\n0", "3 0\n0 0 0"]
for _ in range(4):
    n = random.randint(1, 150)
    t.append("%d %d\n%s" % (n, random.randint(-5, 5), " ".join(str(random.randint(-3, 3)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:difference-array
kind: task
title: Прибавление на отрезках
category: Префиксные суммы
level: medium
tags: разностный массив, difference array, отрезки
related: algo:difference-array, algo:prefix-sums
## Условие
Массив из N нулей. Выполняются Q операций «L R X»: прибавить X ко всем элементам с L по R. Выведите массив после всех операций.
## Входные данные
N и Q (до 2·10^5), затем Q строк «L R X».
## Выходные данные
N чисел.
## Примеры
```in
5 3
1 3 2
2 5 1
5 5 10
```
```out
2 3 3 1 11
```
## Подсказки
- Прибавление в цикле для каждой операции — O(N·Q).
- Отметьте начало изменения d[L] += X и конец d[R+1] −= X.
- Итоговый массив — префиксные суммы d.
## Решение: разностный массив
@time: O(N + Q) @memory: O(N)
```python
import sys
data = sys.stdin.buffer.read().split()
n, q = int(data[0]), int(data[1])
d = [0] * (n + 2)
pos = 2
for _ in range(q):
    l, r, x = int(data[pos]), int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    d[l] += x
    d[r + 1] -= x
res = []
cur = 0
for i in range(1, n + 1):
    cur += d[i]
    res.append(cur)
print(*res)
```
## Решение: прямое прибавление (малые N·Q)
@time: O(N·Q) @memory: O(N)
```python
n, q = map(int, input().split())
a = [0] * (n + 1)
for _ in range(q):
    l, r, x = map(int, input().split())
    for i in range(l, r + 1):
        a[i] += x
print(*a[1:])
```
## Объяснение
Разностный массив — «обратная» операция к префиксным суммам.
## Генератор
```python
import json, random
random.seed(99)
t = []
for _ in range(4):
    n = random.randint(1, 40); q = random.randint(1, 20)
    ops = []
    for _ in range(q):
        l = random.randint(1, n); ops.append("%d %d %d" % (l, random.randint(l, n), random.randint(-10, 10)))
    t.append("%d %d\n%s" % (n, q, "\n".join(ops)))
print(json.dumps(t))
```

# id: task:matrix-prefix
kind: task
title: Сумма в прямоугольнике
category: Префиксные суммы
level: medium
tags: двумерные префиксные суммы, запросы
related: algo:prefix-sums, algo:matrices
## Условие
Дана матрица N×M и Q запросов «r1 c1 r2 c2». На каждый запрос выведите сумму элементов прямоугольника с углами (r1, c1) и (r2, c2) включительно.
## Входные данные
N, M, Q (N, M ≤ 500, Q ≤ 10^5), затем матрица, затем запросы.
## Выходные данные
Q чисел.
## Примеры
```in
3 3 2
1 2 3
4 5 6
7 8 9
1 1 2 2
2 2 3 3
```
```out
12
28
```
## Подсказки
- P[i][j] — сумма прямоугольника от (1, 1) до (i, j).
- P[i][j] = a[i][j] + P[i−1][j] + P[i][j−1] − P[i−1][j−1].
- Ответ: P[r2][c2] − P[r1−1][c2] − P[r2][c1−1] + P[r1−1][c1−1].
## Решение: двумерные префиксы
@time: O(N·M + Q) @memory: O(N·M)
```python
import sys
data = sys.stdin.read().split()
n, m, q = int(data[0]), int(data[1]), int(data[2])
P = [[0] * (m + 1) for _ in range(n + 1)]
pos = 3
for i in range(1, n + 1):
    row, prev = P[i], P[i - 1]
    for j in range(1, m + 1):
        row[j] = int(data[pos]) + prev[j] + row[j - 1] - prev[j - 1]
        pos += 1
out = []
for _ in range(q):
    r1, c1, r2, c2 = map(int, data[pos:pos + 4])
    pos += 4
    out.append(P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1])
print("\n".join(map(str, out)))
```
## Решение: префиксы по строкам
@time: O(N·M + Q·N) @memory: O(N·M)
Для каждой строки — одномерные префиксные суммы; запрос складывает строки r1..r2.
```python
from itertools import accumulate
n, m, q = map(int, input().split())
rows = [[0, *accumulate(map(int, input().split()))] for _ in range(n)]
for _ in range(q):
    r1, c1, r2, c2 = map(int, input().split())
    print(sum(rows[r][c2] - rows[r][c1 - 1] for r in range(r1 - 1, r2)))
```
## Объяснение
Формула включений-исключений: вычитаем две полосы и добавляем угол, вычтенный дважды.
## Генератор
```python
import json, random
random.seed(100)
t = []
for _ in range(4):
    n, m, q = random.randint(1, 8), random.randint(1, 8), random.randint(1, 10)
    mat = "\n".join(" ".join(str(random.randint(-9, 9)) for _ in range(m)) for _ in range(n))
    qs = []
    for _ in range(q):
        r1 = random.randint(1, n); c1 = random.randint(1, m)
        qs.append("%d %d %d %d" % (r1, c1, random.randint(r1, n), random.randint(c1, m)))
    t.append("%d %d %d\n%s\n%s" % (n, m, q, mat, "\n".join(qs)))
print(json.dumps(t))
```

# id: task:balanced-brackets
kind: task
title: Правильная скобочная последовательность
category: Стек и очередь
level: easy
tags: стек, скобки, баланс
related: algo:stack
## Условие
Дана строка из скобок трёх видов: (), [], {}. Выведите YES, если скобки расставлены правильно, иначе NO.
## Входные данные
Строка длиной до 10^5 (может быть пустой).
## Выходные данные
YES или NO.
## Примеры
```in
([]{()})
```
```out
YES
```
```in
([)]
```
```out
NO
```
## Подсказки
- Открывающую скобку кладите в стек.
- Закрывающая должна соответствовать верхней скобке стека.
- В конце стек должен быть пуст.
## Решение: стек
@time: O(n) @memory: O(n)
```python
s = input().strip()
pair = {")": "(", "]": "[", "}": "{"}
stack = []
ok = True
for ch in s:
    if ch in "([{":
        stack.append(ch)
    elif not stack or stack.pop() != pair[ch]:
        ok = False
        break
print("YES" if ok and not stack else "NO")
```
## Решение: удаление пар
@time: O(n²) @memory: O(n)
Пока в строке есть «()», «[]» или «{}», удаляем их; правильная строка исчезнет полностью.
```python
s = input().strip()
while True:
    t = s.replace("()", "").replace("[]", "").replace("{}", "")
    if t == s:
        break
    s = t
print("YES" if s == "" else "NO")
```
## Объяснение
Стек — линейный способ; удаление пар проще, но для длинных строк квадратичное.
## Генератор
```python
import json, random
random.seed(101)
t = ["", "(", ")", "()", "(]", "{[()()]}", "((((", "([]))"]
def gen(d):
    if d == 0 or random.random() < 0.3:
        return ""
    o, c = random.choice(["()", "[]", "{}"])
    return o + gen(d - 1) + c + gen(d - 1)
for _ in range(3):
    s = gen(6)
    if random.random() < 0.5 and s:
        i = random.randrange(len(s)); s = s[:i] + random.choice("([{)]}") + s[i + 1:]
    t.append(s)
print(json.dumps(t))
```

# id: task:postfix-eval
kind: task
title: Вычисление постфиксной записи
category: Стек и очередь
level: medium
tags: стек, обратная польская запись, калькулятор
related: algo:stack
## Условие
Дано выражение в обратной польской (постфиксной) записи: числа и операции +, -, * через пробел. Вычислите его.
## Входные данные
Строка с выражением (до 10^5 токенов). Гарантируется корректность.
## Выходные данные
Значение выражения.
## Примеры
```in
8 9 + 1 7 - *
```
```out
-102
```
## Подсказки
- Числа кладите в стек.
- Операция снимает два верхних числа и кладёт результат.
- Первым снимается правый операнд!
## Решение: стек
@time: O(n) @memory: O(n)
```python
stack = []
for tok in input().split():
    if tok in "+-*" and len(tok) == 1:
        b = stack.pop()
        a = stack.pop()
        if tok == "+":
            stack.append(a + b)
        elif tok == "-":
            stack.append(a - b)
        else:
            stack.append(a * b)
    else:
        stack.append(int(tok))
print(stack[0])
```
## Решение: таблица операций из operator
@time: O(n) @memory: O(n)
```python
import operator
ops = {"+": operator.add, "-": operator.sub, "*": operator.mul}
stack = []
for tok in input().split():
    if tok in ops:
        b, a = stack.pop(), stack.pop()
        stack.append(ops[tok](a, b))
    else:
        stack.append(int(tok))
print(stack.pop())
```
## Объяснение
Проверка len(tok) == 1 отличает операцию «-» от отрицательного числа «-5».
## Генератор
```python
import json
print(json.dumps(["5", "1 2 +", "2 3 4 * +", "10 2 - 3 -", "-5 2 *", "1 2 3 4 5 * * * *"]))
```

# id: task:next-greater
kind: task
title: Ближайший больший справа
category: Стек и очередь
level: medium
tags: монотонный стек, следующий больший элемент
related: algo:stack
## Условие
Дан массив из N чисел. Для каждого элемента выведите ближайший справа элемент, строго больший его, или −1, если такого нет.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
N чисел.
## Примеры
```in
5
2 1 2 4 3
```
```out
4 2 4 -1 -1
```
## Подсказки
- Двойной цикл — O(N²).
- Держите стек индексов элементов, для которых ответ ещё не найден.
- Новый элемент «закрывает» все меньшие элементы на вершине стека.
## Решение: монотонный стек
@time: O(N) @memory: O(N)
```python
n = int(input())
a = list(map(int, input().split()))
res = [-1] * n
stack = []
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        res[stack.pop()] = x
    stack.append(i)
print(*res)
```
## Решение: стек справа налево
@time: O(N) @memory: O(N)
Идём с конца и удаляем из стека все значения, не превосходящие текущего.
```python
n = int(input())
a = list(map(int, input().split()))
res = []
stack = []
for x in reversed(a):
    while stack and stack[-1] <= x:
        stack.pop()
    res.append(stack[-1] if stack else -1)
    stack.append(x)
print(*reversed(res))
```
## Объяснение
Каждый индекс попадает в стек и удаляется из него не более одного раза — суммарно O(N).
## Генератор
```python
import json, random
random.seed(102)
t = ["1\n5", "3\n3 2 1", "3\n1 2 3", "4\n2 2 2 2"]
for _ in range(3):
    n = random.randint(1, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 20)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:largest-rectangle
kind: task
title: Наибольший прямоугольник в гистограмме
category: Стек и очередь
level: hard
tags: монотонный стек, гистограмма
related: algo:stack
## Условие
Дана гистограмма из N столбиков ширины 1 и высоты h_i. Найдите площадь наибольшего прямоугольника, целиком лежащего внутри гистограммы.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N высот (0 ≤ h ≤ 10^9).
## Выходные данные
Наибольшая площадь.
## Примеры
```in
6
2 1 5 6 2 3
```
```out
10
```
## Подсказки
- Для каждого столбика найдите, насколько можно расшириться влево и вправо при его высоте.
- Границы — ближайшие слева и справа столбики ниже текущего.
- Монотонный стек находит эти границы за O(N).
## Решение: стек за один проход
@time: O(N) @memory: O(N)
```python
n = int(input())
h = list(map(int, input().split())) + [0]
stack = []
best = 0
for i, x in enumerate(h):
    start = i
    while stack and stack[-1][1] >= x:
        j, height = stack.pop()
        best = max(best, height * (i - j))
        start = j
    stack.append((start, x))
print(best)
```
## Решение: левые и правые границы
@time: O(N) @memory: O(N)
Два прохода монотонного стека находят ближайший меньший слева и справа.
```python
n = int(input())
h = list(map(int, input().split()))
left = [0] * n
stack = []
for i in range(n):
    while stack and h[stack[-1]] >= h[i]:
        stack.pop()
    left[i] = stack[-1] + 1 if stack else 0
    stack.append(i)
right = [0] * n
stack = []
for i in range(n - 1, -1, -1):
    while stack and h[stack[-1]] >= h[i]:
        stack.pop()
    right[i] = stack[-1] - 1 if stack else n - 1
    stack.append(i)
print(max(h[i] * (right[i] - left[i] + 1) for i in range(n)))
```
## Решение: перебор с минимумом (малые N)
@time: O(N²) @memory: O(1)
```python
n = int(input())
h = list(map(int, input().split()))
best = 0
for l in range(n):
    mn = h[l]
    for r in range(l, n):
        mn = min(mn, h[r])
        best = max(best, mn * (r - l + 1))
print(best)
```
## Объяснение
Столбик высоты 0 в конце первого способа «выталкивает» из стека все оставшиеся столбики.
## Генератор
```python
import json, random
random.seed(103)
t = ["1\n0", "1\n7", "3\n3 3 3", "4\n1 2 3 4"]
for _ in range(3):
    n = random.randint(1, 120)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(0, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:queue-simulation
kind: task
title: Очередь в кассу
category: Стек и очередь
level: easy
tags: очередь, deque, моделирование
related: lib:collections.deque, algo:queue
## Условие
Обрабатываются команды: «push X» — человек X встаёт в конец очереди; «pop» — первый человек уходит (выведите его имя или «empty», если очередь пуста); «size» — выведите длину очереди.
## Входные данные
Q (1 ≤ Q ≤ 10^5), затем Q команд.
## Выходные данные
Ответы на команды pop и size.
## Примеры
```in
5
push anna
push bob
pop
size
pop
```
```out
anna
1
bob
```
## Подсказки
- Очередь — «первым пришёл, первым ушёл» (FIFO).
- list.pop(0) работает за O(N) — для 10^5 операций медленно.
- collections.deque: append и popleft за O(1).
## Решение: deque
@time: O(Q) @memory: O(Q)
```python
import sys
from collections import deque
q = deque()
out = []
lines = sys.stdin.read().split("\n")
for line in lines[1:int(lines[0]) + 1]:
    cmd = line.split()
    if cmd[0] == "push":
        q.append(cmd[1])
    elif cmd[0] == "pop":
        out.append(q.popleft() if q else "empty")
    else:
        out.append(str(len(q)))
print("\n".join(out))
```
## Решение: список и указатель головы
@time: O(Q) @memory: O(Q)
Не удаляем элементы, а двигаем индекс начала очереди.
```python
n = int(input())
items = []
head = 0
for _ in range(n):
    cmd = input().split()
    if cmd[0] == "push":
        items.append(cmd[1])
    elif cmd[0] == "pop":
        if head < len(items):
            print(items[head])
            head += 1
        else:
            print("empty")
    else:
        print(len(items) - head)
```
## Объяснение
Указатель головы — приём из языков без deque; память не освобождается, но время O(1).
## Генератор
```python
import json, random
random.seed(104)
t = ["1\npop", "2\npush x\nsize"]
for _ in range(3):
    n = random.randint(1, 40)
    cmds = []
    for i in range(n):
        r = random.random()
        cmds.append("push p%d" % i if r < 0.5 else ("pop" if r < 0.8 else "size"))
    t.append("%d\n%s" % (n, "\n".join(cmds)))
print(json.dumps(t))
```

# id: task:window-max
kind: task
title: Максимум в скользящем окне
category: Стек и очередь
level: hard
tags: монотонная очередь, deque, окно
related: lib:collections.deque, algo:deque, algo:sliding-window
## Условие
Дан массив из N чисел и число K. Для каждого окна из K подряд идущих элементов выведите его максимум.
## Входные данные
N и K (1 ≤ K ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
N − K + 1 чисел.
## Примеры
```in
8 3
1 3 -1 -3 5 3 6 7
```
```out
3 3 5 5 6 7
```
## Подсказки
- max по каждому окну — O(N·K).
- Храните в деке индексы элементов в порядке убывания значений.
- Удаляйте с головы индексы, вышедшие из окна, с хвоста — элементы меньше нового.
## Решение: монотонный дек
@time: O(N) @memory: O(K)
```python
from collections import deque
n, k = map(int, input().split())
a = list(map(int, input().split()))
dq = deque()
res = []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        res.append(a[dq[0]])
print(*res)
```
## Решение: куча с ленивым удалением
@time: O(N log N) @memory: O(N)
В куче (−значение, индекс); верхние элементы, вышедшие из окна, удаляем при необходимости.
```python
import heapq
n, k = map(int, input().split())
a = list(map(int, input().split()))
heap = []
res = []
for i, x in enumerate(a):
    heapq.heappush(heap, (-x, i))
    if i >= k - 1:
        while heap[0][1] <= i - k:
            heapq.heappop(heap)
        res.append(-heap[0][0])
print(*res)
```
## Объяснение
В деке значения убывают от головы к хвосту, поэтому максимум окна всегда в голове.
## Генератор
```python
import json, random
random.seed(105)
t = ["1 1\n5", "3 3\n1 2 3", "5 1\n5 4 3 2 1"]
for _ in range(4):
    n = random.randint(1, 150)
    t.append("%d %d\n%s" % (n, random.randint(1, n), " ".join(str(random.randint(-50, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:k-largest-stream
kind: task
title: K наибольших в потоке
category: Куча
level: medium
tags: куча, heapq, top-k
related: lib:heapq.heappushpop, algo:heap
## Условие
Числа поступают по одному. После каждого числа выведите K-е по величине среди всех полученных чисел, или −1, если чисел пока меньше K.
## Входные данные
N и K (1 ≤ K ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
N чисел.
## Примеры
```in
6 3
4 5 8 2 3 10
```
```out
-1 -1 4 4 4 5
```
## Подсказки
- Храните K наибольших чисел в min-куче.
- Её минимум (heap[0]) — K-е по величине.
- Новое число больше минимума — заменяет его (heapreplace / heappushpop).
## Решение: min-куча размера K
@time: O(N log K) @memory: O(K)
```python
import heapq
n, k = map(int, input().split())
heap = []
out = []
for x in map(int, input().split()):
    if len(heap) < k:
        heapq.heappush(heap, x)
    elif x > heap[0]:
        heapq.heapreplace(heap, x)
    out.append(heap[0] if len(heap) == k else -1)
print(*out)
```
## Решение: отсортированный список (малые N)
@time: O(N²) в худшем @memory: O(N)
insort поддерживает отсортированный список всех чисел.
```python
import bisect
n, k = map(int, input().split())
s = []
out = []
for x in map(int, input().split()):
    bisect.insort(s, x)
    out.append(s[-k] if len(s) >= k else -1)
print(*out)
```
## Объяснение
heapq в Python — min-куча; для max-кучи храните −x.
## Генератор
```python
import json, random
random.seed(106)
t = ["1 1\n5"]
for _ in range(4):
    n = random.randint(1, 100)
    t.append("%d %d\n%s" % (n, random.randint(1, n), " ".join(str(random.randint(-50, 50)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:merge-ropes
kind: task
title: Соединение верёвок
category: Куча
level: medium
tags: куча, жадный алгоритм, Хаффман
related: lib:heapq.heapify, algo:heap, algo:greedy
## Условие
Есть N верёвок длиной a_i. Соединение двух верёвок длиной x и y стоит x + y и даёт верёвку длины x + y. Соедините все верёвки в одну с минимальной общей стоимостью.
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N длин.
## Выходные данные
Минимальная стоимость.
## Примеры
```in
4
4 3 2 6
```
```out
29
```
## Подсказки
- Короткие верёвки выгоднее соединять раньше: их длина войдёт в стоимость много раз.
- Каждый раз соединяйте две самые короткие.
- Куча достаёт минимум за O(log N).
## Решение: min-куча
@time: O(N log N) @memory: O(N)
```python
import heapq
input()
h = list(map(int, input().split()))
heapq.heapify(h)
cost = 0
while len(h) > 1:
    s = heapq.heappop(h) + heapq.heappop(h)
    cost += s
    heapq.heappush(h, s)
print(cost)
```
## Решение: две очереди
@time: O(N log N) на сортировку + O(N) @memory: O(N)
Отсортированные исходные длины и суммы (которые получаются по неубыванию) — две очереди, минимум берётся из их голов.
```python
from collections import deque
input()
a = deque(sorted(map(int, input().split())))
b = deque()

def take():
    if not b or (a and a[0] <= b[0]):
        return a.popleft()
    return b.popleft()

cost = 0
while len(a) + len(b) > 1:
    s = take() + take()
    cost += s
    b.append(s)
print(cost)
```
## Объяснение
Это та же жадная идея, что в коде Хаффмана.
## Генератор
```python
import json, random
random.seed(107)
t = ["1\n10", "2\n1 1"]
for _ in range(4):
    n = random.randint(1, 200)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(1, 1000)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:running-median
kind: task
title: Медиана потока
category: Куча
level: hard
tags: две кучи, медиана, heapq
related: algo:heap
## Условие
Числа поступают по одному. После каждого числа выведите нижнюю медиану полученных чисел (для чётного количества — меньшее из двух средних).
## Входные данные
N (1 ≤ N ≤ 2·10^5), затем N чисел.
## Выходные данные
N чисел.
## Примеры
```in
5
5 15 1 3 8
```
```out
5 5 5 3 5
```
## Подсказки
- Разделите числа на «нижнюю» и «верхнюю» половины.
- Нижняя — max-куча (храним −x), верхняя — min-куча.
- Поддерживайте размер нижней равным или на 1 больше верхней; медиана — вершина нижней.
## Решение: две кучи
@time: O(N log N) @memory: O(N)
```python
import heapq
input()
low, high = [], []
out = []
for x in map(int, input().split()):
    if not low or x <= -low[0]:
        heapq.heappush(low, -x)
    else:
        heapq.heappush(high, x)
    if len(low) > len(high) + 1:
        heapq.heappush(high, -heapq.heappop(low))
    elif len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))
    out.append(-low[0])
print(*out)
```
## Решение: отсортированный список и insort
@time: O(N²) в худшем @memory: O(N)
```python
import bisect
input()
s = []
out = []
for x in map(int, input().split()):
    bisect.insort(s, x)
    out.append(s[(len(s) - 1) // 2])
print(*out)
```
## Объяснение
Индекс нижней медианы в отсортированном списке длины L — (L − 1) // 2.
## Генератор
```python
import json, random
random.seed(108)
t = ["1\n7", "2\n2 1"]
for _ in range(4):
    n = random.randint(1, 150)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-100, 100)) for _ in range(n))))
print(json.dumps(t))
```
