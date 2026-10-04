# id: algo:strings
kind: algorithm
category: Строки
title: Работа со строками
summary: Индексы и срезы, методы split/join/replace/find, неизменяемость строк, сборка через join.
level: beginner
complexity: O(n) для большинства операций
tags: строки, срезы, split, join, find, replace, count
related: py:topic:strings, py:topic:slicing, py:method:str.split, py:method:str.join, task:word-count, task:caesar, task:rle-encode
## Теория
Строка — неизменяемая последовательность символов Unicode. s[i] — символ, s[a:b:c] — срез, len(s) — длина. Любое «изменение» создаёт новую строку.
Основные методы: split, join, strip, replace, find/index, count, startswith/endswith, lower/upper, isdigit/isalpha, zfill, center.
## Пример
```python
s = "  Hello, World  "
t = s.strip()
print(t.lower(), t.split(", "), t.replace("World", "Python"), t.find("o"), t.count("l"))
print(t[::-1], t[:5], "-".join(["a", "b", "c"]))
print(ord("A"), chr(1071), "abc" < "abd")
```
## Сборка строки
Многократное s += ch создаёт новые строки; список частей и "".join(parts) — линейно.
```python
parts = []
for i in range(5):
    parts.append(str(i * i))
print(",".join(parts))
```
## Типичные ошибки
- s[i] = "x" — TypeError: строки неизменяемы. Используйте list(s) или срезы.
- s.split(" ") и s.split() ведут себя по-разному при нескольких пробелах.
- str.count считает непересекающиеся вхождения.
## Олимпиадное применение
Разбор ввода, подсчёт символов, палиндромы, шифры, сравнение подстрок.

# id: algo:palindromes
kind: algorithm
category: Строки
title: Палиндромы
summary: Проверка разворотом или двумя указателями; расширение от центра; алгоритм Манакера.
level: easy
complexity: O(n) проверка, O(n²)/O(n) поиск подстрок
tags: палиндром, разворот, два указателя, Манакер
related: task:palindrome-number, task:phrase-palindrome, task:longest-palindrome-substring, task:palindromic-subsequence
## Теория
Строка — палиндром, если s == s[::-1]. Без копии — два указателя с краёв.
Самая длинная палиндромная подстрока: каждый палиндром имеет центр (символ или промежуток); расширение от 2n−1 центров — O(n²). Алгоритм Манакера переиспользует уже найденные палиндромы — O(n).
## Шаблон
```python
def is_pal(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True

def longest_pal(s):
    best = ""
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        if r - l - 1 > len(best):
            best = s[l + 1:r]
    return best

print(is_pal("level"), is_pal("python"), longest_pal("forgeeksskeegfor"))
```
## Олимпиадное применение
Подпоследовательности-палиндромы (DP по отрезкам), разбиение на палиндромы, числа-палиндромы.

# id: algo:string-algorithms
kind: algorithm
category: Строки
title: Префикс-функция и Z-функция
summary: Поиск подстроки за O(n + m), период строки, количество вхождений с перекрытием.
level: hard
complexity: O(n + m)
memory: O(n + m)
tags: KMP, префикс-функция, Z-функция, поиск подстроки, период
related: task:substring-occurrences, task:string-period, task:z-search, task:distinct-substrings
## Префикс-функция
π[i] — длина наибольшего собственного префикса строки s[0..i], совпадающего с её суффиксом. Для поиска P в T считают π строки P + "#" + T: позиции с π = |P| — концы вхождений (алгоритм Кнута–Морриса–Пратта).
## Шаблон
```python
def prefix_function(s):
    pi = [0] * len(s)
    for i in range(1, len(s)):
        k = pi[i - 1]
        while k and s[i] != s[k]:
            k = pi[k - 1]
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return pi

def z_function(s):
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
    return z

print(prefix_function("abacaba"), z_function("abacaba"))
p, t = "aba", "abababa"
pi = prefix_function(p + "#" + t)
print([i - 2 * len(p) + 1 for i in range(len(pi)) if pi[i] == len(p)])
```
## Свойства
- Минимальный период строки: n − π[n−1]; строка — повторение блока, если n делится на период.
- Z-функция: z[i] — длина общего префикса s и s[i:].
## Олимпиадное применение
Поиск образца, период, количество различных подстрок, сжатие строк.

# id: algo:hashing
kind: algorithm
category: Строки
title: Хеширование: словари, множества и полиномиальный хеш
summary: dict/set за O(1); полиномиальный хеш подстрок для сравнения за O(1).
level: medium
complexity: O(1) в среднем для dict/set; O(n) предподсчёт хеша
tags: хеш, словарь, множество, полиномиальный хеш, Counter
related: py:topic:dicts, py:topic:sets, lib:collections.Counter, task:two-sum, task:anagram, task:subarray-sum-k, task:distinct-substrings
## Хеш-таблицы Python
dict и set хранят элементы по хешу — проверка x in s, добавление и удаление в среднем O(1). Ключами могут быть только неизменяемые (хешируемые) объекты: числа, строки, кортежи, frozenset.
```python
from collections import Counter, defaultdict
words = "the cat and the hat and the bat".split()
cnt = Counter(words)
print(cnt.most_common(2))
groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
print(dict(groups))
```
## Полиномиальный хеш строки
h(s) = s0·B^(n−1) + … + s_{n−1} mod M. Префиксные хеши позволяют получить хеш любой подстроки за O(1): h[l..r) = h[r] − h[l]·B^(r−l).
```python
s = "abracadabra"
M, B = 10**9 + 7, 131
h = [0]
p = [1]
for ch in s:
    h.append((h[-1] * B + ord(ch)) % M)
    p.append(p[-1] * B % M)
sub = lambda l, r: (h[r] - h[l] * p[r - l]) % M
print(sub(0, 4) == sub(7, 11), s[0:4], s[7:11])
```
## Типичные ошибки
- Списки как ключи словаря — TypeError: unhashable type: 'list'.
- Один модуль хеша может дать коллизию; используйте два модуля или большой простой модуль.
## Олимпиадное применение
Поиск пар с суммой, подсчёт частот, сравнение подстрок, поиск одинаковых фрагментов.

# id: algo:arrays
kind: algorithm
category: Массивы
title: Массивы (списки) и базовые приёмы
summary: Индексы, срезы, генераторы списков, поиск максимума, подсчёт, разворот, сдвиг.
level: beginner
complexity: O(n) проход
tags: список, массив, срезы, генератор списков, enumerate, zip
related: py:topic:lists, py:topic:comprehensions, task:list-sum-max-min, task:reverse-list, task:rotate-list, task:max-subarray
## Теория
list — динамический массив: доступ по индексу O(1), append O(1) амортизированно, вставка в начало O(n).
Частые приёмы: накопление (сумма, максимум), фильтрация, подсчёт, работа с соседями через zip(a, a[1:]), индексы через enumerate.
## Пример
```python
a = [5, 3, 8, 1, 9, 2]
print(sum(a), max(a), a.index(max(a)), sorted(a), a[::-1])
print([x * x for x in a if x % 2], [y - x for x, y in zip(a, a[1:])])
print(list(enumerate(a, 1))[:3])
k = 2
print(a[k:] + a[:k])
```
## Двумерный список
Создавайте через генератор: [[0] * m for _ in range(n)]. Запись [[0] * m] * n создаёт n ссылок на ОДНУ строку.
```python
bad = [[0] * 3] * 2
bad[0][0] = 1
good = [[0] * 3 for _ in range(2)]
good[0][0] = 1
print(bad, good)
```
## Олимпиадное применение
Почти любая задача начинается с чтения массива: list(map(int, input().split())).

# id: algo:matrices
kind: algorithm
category: Массивы
title: Матрицы и двумерные массивы
summary: Обход, транспонирование zip(*m), поворот, соседи клетки, спираль, умножение матриц.
level: easy
complexity: O(N·M)
tags: матрица, двумерный массив, zip, поворот, соседи
related: task:matrix-transpose, task:rotate-matrix, task:spiral-matrix, task:matrix-multiply, task:islands, task:matrix-prefix
## Теория
Матрица — список строк. Чтение: [list(map(int, input().split())) for _ in range(n)].
- Транспонирование: list(zip(*m)).
- Поворот на 90° по часовой: list(zip(*m[::-1])).
- Главная диагональ: m[i][i]; побочная: m[i][n−1−i].
- Соседи клетки по сторонам: (r±1, c), (r, c±1) — удобно списком смещений.
## Пример
```python
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(list(zip(*m)))
print([list(r) for r in zip(*m[::-1])])
print(sum(m[i][i] for i in range(3)), sum(m[i][2 - i] for i in range(3)))
r, c = 0, 1
print([(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= r + dr < 3 and 0 <= c + dc < 3])
```
## Олимпиадное применение
Поля в задачах на графы (BFS по клеткам), DP по таблице, префиксные суммы на плоскости, быстрое возведение матрицы в степень.

# id: algo:sorting
kind: algorithm
category: Массивы
title: Сортировка
summary: sorted/list.sort (Timsort), ключи и стабильность, сортировка подсчётом, слиянием, быстрая.
level: easy
complexity: O(n log n)
memory: O(n)
tags: сортировка, sorted, key, стабильность, merge sort, quicksort, counting sort
related: py:builtin:sorted, py:method:list.sort, lib:functools.cmp_to_key, task:sort-numbers, task:sort-students, task:merge-intervals, task:inversions, task:largest-number
## Встроенная сортировка
sorted(iterable, key=..., reverse=...) возвращает новый список, list.sort() сортирует на месте. Алгоритм Timsort: O(n log n) в худшем случае, O(n) на почти отсортированных данных, стабилен.
```python
people = [("Ann", 25), ("Bob", 20), ("Cid", 25)]
print(sorted(people, key=lambda p: (-p[1], p[0])))
print(sorted(["b", "A", "c"], key=str.lower), sorted([3, 1, 2], reverse=True))
```
## Классические алгоритмы
```python
def merge_sort(a):
    if len(a) <= 1:
        return a
    m = len(a) // 2
    l, r = merge_sort(a[:m]), merge_sort(a[m:])
    res, i, j = [], 0, 0
    while i < len(l) and j < len(r):
        if l[i] <= r[j]:
            res.append(l[i]); i += 1
        else:
            res.append(r[j]); j += 1
    return res + l[i:] + r[j:]

def quick_sort(a):
    if len(a) <= 1:
        return a
    p = a[len(a) // 2]
    return quick_sort([x for x in a if x < p]) + [x for x in a if x == p] + quick_sort([x for x in a if x > p])

def counting_sort(a, maxv):
    cnt = [0] * (maxv + 1)
    for x in a:
        cnt[x] += 1
    return [v for v in range(maxv + 1) for _ in range(cnt[v])]

data = [5, 2, 9, 1, 5, 6]
print(merge_sort(data), quick_sort(data), counting_sort(data, 9))
```
## Сравнение
- Пузырьком, вставками, выбором — O(n²), только для обучения и малых n.
- Слиянием — O(n log n) всегда, стабильная, нужна память.
- Быстрая — O(n log n) в среднем, O(n²) в худшем.
- Подсчётом — O(n + k) для небольших целых значений.
## Олимпиадное применение
Сортировка часто превращает задачу в жадную или открывает двоичный поиск и два указателя.

# id: algo:binary-search
kind: algorithm
category: Массивы
title: Бинарный поиск
summary: Поиск в отсортированном массиве и бинарный поиск по ответу; модуль bisect.
level: medium
complexity: O(log n)
memory: O(1)
tags: бинарный поиск, bisect, поиск по ответу, монотонность
related: lib:bisect.bisect_left, lib:bisect.bisect_right, task:binary-search-queries, task:range-count, task:integer-sqrt, task:cut-ropes, task:aggressive-cows
## Теория
Если предикат монотонен (сначала ложь, потом истина), границу можно найти, каждый раз деля отрезок пополам: O(log n) проверок.
Два применения: поиск элемента в отсортированном массиве и «бинарный поиск по ответу» — когда легко проверить, подходит ли ответ X, и проверка монотонна по X.
## Модуль bisect
```python
from bisect import bisect_left, bisect_right, insort
a = [1, 3, 3, 3, 7, 9]
print(bisect_left(a, 3), bisect_right(a, 3), bisect_right(a, 3) - bisect_left(a, 3))
insort(a, 4)
print(a)
```
## Шаблон «последний хороший»
Инвариант: ok(lo) истинно, ok(hi) ложно.
```python
def last_true(lo, hi, ok):
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if ok(mid):
            lo = mid
        else:
            hi = mid
    return lo

n = 10**18
print(last_true(0, n + 1, lambda x: x * x <= n))
```
## Типичные ошибки
- Бесконечный цикл из-за mid = (lo + hi) // 2 и lo = mid при hi = lo + 1 — используйте условие hi − lo > 1.
- Немонотонный предикат — бинарный поиск даёт неверный ответ.
- Вещественный поиск: делайте фиксированное число итераций (например, 100).
## Олимпиадное применение
Максимальное минимальное расстояние, минимальное время, корень, k-я статистика по ответу.

# id: algo:two-pointers
kind: algorithm
category: Массивы
title: Два указателя
summary: Два индекса, двигающиеся в одну сторону или навстречу; линейные решения вместо O(n²).
level: medium
complexity: O(n)
memory: O(1)
tags: два указателя, отсортированный массив, слияние, пары
related: task:pair-sum-sorted, task:remove-duplicates-sorted, task:container-water, task:merge-sorted, task:boats, task:move-zeros
## Теория
Каждый указатель двигается только вперёд (или навстречу другому), поэтому суммарно делается O(n) шагов.
Типовые схемы:
- Навстречу: пара с суммой в отсортированном массиве, разворот, «сосуд».
- В одну сторону: слияние двух массивов, удаление элементов на месте, окно.
## Шаблон: пара с суммой
```python
a = [1, 2, 4, 6, 8, 9]
s = 10
i, j = 0, len(a) - 1
pairs = []
while i < j:
    if a[i] + a[j] == s:
        pairs.append((a[i], a[j]))
        i += 1
        j -= 1
    elif a[i] + a[j] < s:
        i += 1
    else:
        j -= 1
print(pairs)
```
## Олимпиадное применение
Работает, когда при сдвиге указателя можно отбросить целый класс вариантов (монотонность после сортировки).

# id: algo:sliding-window
kind: algorithm
category: Массивы
title: Скользящее окно
summary: Окно [l, r] сдвигается вправо, поддерживая сумму, счётчики или монотонный дек.
level: medium
complexity: O(n)
memory: O(k)
tags: скользящее окно, подотрезок, окно фиксированной длины, монотонная очередь
related: task:max-window-sum, task:longest-unique-substring, task:min-subarray-len, task:window-max
## Теория
Окно фиксированной длины k: при сдвиге прибавляем вошедший элемент и вычитаем ушедший.
Окно переменной длины: расширяем правый край; пока окно «плохое» (или «хорошее» для минимизации) — сдвигаем левый. Каждый край двигается не более n раз.
## Шаблон: самый длинный отрезок с суммой ≤ S (неотрицательные числа)
```python
a = [2, 1, 3, 1, 1, 4, 2]
S = 6
l = cur = best = 0
for r, x in enumerate(a):
    cur += x
    while cur > S:
        cur -= a[l]
        l += 1
    best = max(best, r - l + 1)
print(best)
```
## Типичные ошибки
- С отрицательными числами сумма окна не монотонна — нужен другой метод (префиксные суммы + словарь).
## Олимпиадное применение
Подстроки без повторов, минимальные покрывающие отрезки, максимум в окне через дек.

# id: algo:prefix-sums
kind: algorithm
category: Массивы
title: Префиксные суммы
summary: p[i] = a[0] + … + a[i−1]; сумма отрезка за O(1); двумерный вариант.
level: easy
complexity: O(n) предподсчёт, O(1) запрос
memory: O(n)
tags: префиксные суммы, накопленная сумма, accumulate, сумма на отрезке
related: lib:itertools.accumulate, task:running-sum, task:range-sum-queries, task:subarray-sum-k, task:matrix-prefix
## Теория
p[0] = 0, p[i+1] = p[i] + a[i]. Тогда сумма a[l..r] (включительно) = p[r+1] − p[l].
Двумерный: P[i][j] = a[i][j] + P[i−1][j] + P[i][j−1] − P[i−1][j−1]; прямоугольник — включения-исключения.
## Шаблон
```python
from itertools import accumulate
a = [3, -1, 4, 1, -5, 9]
p = [0, *accumulate(a)]
l, r = 1, 4
print(p, p[r + 1] - p[l], sum(a[l:r + 1]))
```
## Подсчёт отрезков с суммой K
Отрезок (l, r] имеет сумму K, если p[r] − p[l] = K. Храним, сколько раз встречался каждый префикс.
```python
from collections import Counter
a, K = [1, 2, 1, 2, 1], 3
seen = Counter({0: 1})
p = count = 0
for x in a:
    p += x
    count += seen[p - K]
    seen[p] += 1
print(count)
```
## Олимпиадное применение
Суммы на отрезках, баланс скобок, «префиксные XOR», разностные массивы (обратная операция).

# id: algo:difference-array
kind: algorithm
category: Массивы
title: Разностный массив
summary: Прибавление на отрезке за O(1): d[l] += x, d[r+1] −= x; затем префиксные суммы.
level: medium
complexity: O(n + q)
memory: O(n)
tags: разностный массив, прибавление на отрезке, сканирование событий
related: algo:prefix-sums, task:difference-array, task:max-overlap
## Теория
Разностный массив d[i] = a[i] − a[i−1]. Прибавление x к a[l..r] меняет только d[l] (+x) и d[r+1] (−x). После всех операций массив восстанавливается префиксными суммами d.
## Шаблон
```python
n = 6
ops = [(0, 2, 5), (1, 4, 2), (3, 5, -1)]
d = [0] * (n + 1)
for l, r, x in ops:
    d[l] += x
    d[r + 1] -= x
a, cur = [], 0
for i in range(n):
    cur += d[i]
    a.append(cur)
print(a)
```
## Олимпиадное применение
Сколько отрезков покрывают каждую точку, «события» начала и конца, расписания.

# id: algo:simulation
kind: algorithm
category: Основы
title: Моделирование
summary: Аккуратно выполнить процесс из условия шаг за шагом: состояние, правила, крайние случаи.
level: easy
complexity: зависит от числа шагов
tags: моделирование, симуляция, процесс, автомат
related: task:collatz, task:robot-commands, task:life-step, task:elevator, task:josephus, task:queue-simulation
## Теория
В задачах на моделирование алгоритм уже описан в условии; сложность в точной реализации. План:
- Выделите состояние (координаты, направление, очередь, поле).
- Опишите один шаг как функцию «старое состояние → новое».
- Проверьте, не слишком ли много шагов: иногда нужна формула или поиск цикла.
## Пример: направления
```python
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
x = y = d = 0
for cmd in "FFRFFRFLF":
    if cmd == "F":
        x, y = x + dirs[d][0], y + dirs[d][1]
    else:
        d = (d + (1 if cmd == "R" else -1)) % 4
print(x, y)
```
## Поиск цикла
Если процесс детерминирован и состояний конечное число, он зацикливается. Запоминайте шаг первого появления состояния в словаре — и «перепрыгивайте» повторяющиеся периоды.
```python
def step(x):
    return (x * x + 1) % 1000

seen = {}
x, i, N = 7, 0, 10**18
while x not in seen:
    seen[x] = i
    x, i = step(x), i + 1
start, period = seen[x], i - seen[x]
rest = (N - start) % period
for _ in range(rest):
    x = step(x)
print(start, period, x)
```
## Олимпиадное применение
Игры на поле, очереди, автоматы; совмещается с поиском цикла и формулами.

# id: algo:brute-force
kind: algorithm
category: Перебор и рекурсия
title: Полный перебор
summary: Перебрать все варианты: циклы, itertools.product/permutations/combinations, маски.
level: easy
complexity: O(число вариантов)
tags: перебор, brute force, itertools, проверка решений
related: lib:itertools.product, lib:itertools.permutations, task:armstrong, task:meet-in-middle
## Теория
Перебор надёжен и прост. Он подходит, если вариантов мало (см. «Сложность алгоритмов»), и незаменим для проверки быстрых решений на маленьких тестах (стресс-тестирование).
## Инструменты
```python
from itertools import product, permutations, combinations
print(list(product([0, 1], repeat=3))[:4])
print(len(list(permutations(range(5)))), len(list(combinations(range(10), 3))))
best = max((a * b - a - b, a, b) for a in range(1, 20) for b in range(1, 20) if a + b == 19)
print(best)
```
## Стресс-тест
Сравните быстрое решение с перебором на случайных маленьких входах — первый же несовпавший тест покажет ошибку.
```python
import random

def slow(a):
    return max(sum(a[i:j]) for i in range(len(a)) for j in range(i + 1, len(a) + 1))

def fast(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

random.seed(1)
for _ in range(500):
    a = [random.randint(-5, 5) for _ in range(random.randint(1, 8))]
    assert slow(a) == fast(a), a
print("ok")
```
## Олимпиадное применение
Частичные баллы, проверка гипотез, поиск закономерностей на малых N.

# id: algo:recursion
kind: algorithm
category: Перебор и рекурсия
title: Рекурсия
summary: Функция вызывает себя для меньшей задачи; база рекурсии, стек вызовов, лимит глубины.
level: easy
complexity: зависит от числа вызовов
tags: рекурсия, база, глубина, sys.setrecursionlimit, lru_cache
related: py:topic:recursion, lib:functools.lru_cache, task:factorial, task:hanoi, task:permutations
## Теория
Рекурсивная функция состоит из базы (тривиальный случай без вызова) и шага (сведение к меньшей задаче). Каждый вызов кладёт кадр на стек; в CPython глубина ограничена (по умолчанию 1000).
## Пример
```python
import sys
from functools import lru_cache

def fact(n):
    return 1 if n == 0 else n * fact(n - 1)

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fact(10), fib(90), sys.getrecursionlimit())
```
## Типичные ошибки
- Нет базы или она недостижима — RecursionError.
- Экспоненциальный повтор одних и тех же вызовов — добавьте @lru_cache (мемоизацию).
- Глубокая рекурсия (10^5): sys.setrecursionlimit и поток с большим стеком, или переписать итеративно со своим стеком.
## Олимпиадное применение
Перебор с возвратом, «разделяй и властвуй», обходы деревьев, DP с мемоизацией.

# id: algo:backtracking
kind: algorithm
category: Перебор и рекурсия
title: Перебор с возвратом (backtracking)
summary: Строим решение по шагам, откатываемся при тупике; отсечения ускоряют перебор.
level: medium
complexity: экспоненциальная
tags: backtracking, перебор с возвратом, перестановки, подмножества, ферзи
related: task:permutations, task:subsets, task:n-queens, task:parentheses-gen, task:no-adjacent-ones
## Теория
Решение строится по одной позиции; для каждой пробуем допустимые варианты, рекурсивно продолжаем и после возврата отменяем выбор. Отсечения (проверка допустимости до продолжения) делают перебор в разы быстрее.
## Шаблон: сочетания из n по k
```python
def combos(n, k):
    res, cur = [], []
    def go(start):
        if len(cur) == k:
            res.append(cur[:])
            return
        for x in range(start, n + 1):
            if n - x + 1 < k - len(cur):
                break
            cur.append(x)
            go(x + 1)
            cur.pop()
    go(1)
    return res

print(combos(5, 3))
```
## Типичные ошибки
- Добавить в ответ сам список cur (а не копию cur[:]) — потом он изменится.
- Не откатить изменения (used[x] = False, cur.pop()).
## Олимпиадное применение
Расстановки (ферзи), судоку, генерация объектов в лексикографическом порядке, задачи с N ≤ 20.
