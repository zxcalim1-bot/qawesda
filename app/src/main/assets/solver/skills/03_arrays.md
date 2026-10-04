# Solver skills: arrays / lists.

# skill: sort_list
title: Сортировка массива
topics: Сортировка; Алгоритмы
match: (SORT | ASC | DESC) & (LIST | ELEMENT | NUMBER) & !EVEN & !ODD & !POSITIVE & !NEGATIVE & !PRIME & !DIVISIBLE & !GREATER & !LESS & !DIGIT & !WORD & !CHAR & !LETTER & !MERGE & !INTERVALS & !STRING
priority: 2
param: REV = True if DESC else False
param: GT = < if DESC else >
param: LT = > if DESC else <
param: LE = >= if DESC else <=
param: ORD = убыванию if DESC else возрастанию
input: count | list
input_desc: Первая строка: n. Вторая строка: n целых чисел.
output_desc: Числа, отсортированные по {ORD}, через пробел.
understood: Дан массив из n целых чисел. Отсортировать его по {ORD}.
algorithm: Сортировка
why: Встроенная сортировка Timsort работает за O(n log n). Классические алгоритмы (пузырёк, вставки, слияние, быстрая) полезно знать для олимпиад и собеседований.
ideas: sorted() и list.sort(); Устойчивость сортировки; O(n²) против O(n log n)
structures: list
links: algo:sorting, py:builtin:sorted, py:method:list.sort, algo:merge-sort, algo:quick-sort, algo:counting-sort, lib:heapq
edge: Повторяющиеся элементы.
edge: Уже отсортированный массив и массив в обратном порядке.
edge: n = 1.
sample: 5\n3 1 4 1 5
sample: 1\n42
sample: 6\n-5 10 0 -5 7 3
sample: 8\n8 7 6 5 4 3 2 1

## sorted()
approach: sorted
role: short
time: O(n log n)
memory: O(n)
idea: Встроенная функция сортировки.
principle: sorted возвращает новый отсортированный список (Timsort — гибрид слияния и вставок, устойчивый).
pros: Быстро, надёжно, одна строка
cons: Не показывает алгоритм
when: Всегда в реальном коде и на олимпиадах.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
print(*sorted(a, reverse={REV}))
```

## Пузырьковая сортировка
approach: bubble
role: beginner
time: O(n²)
memory: O(1)
idea: Соседние элементы в неправильном порядке меняются местами; самые «тяжёлые» всплывают в конец.
principle: После i-го прохода последние i элементов уже на своих местах. Флаг swapped позволяет закончить раньше, если обменов не было.
pros: Самый простой алгоритм сортировки
cons: Медленно: O(n²)
when: Для обучения.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
for i in range(n - 1):
    swapped = False
    for j in range(n - 1 - i):
        if a[j] {GT} a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]
            swapped = True
    if not swapped:
        break
print(*a)
```

## Сортировка вставками
approach: insertion
role: alternative
time: O(n²), O(n) для почти отсортированных
memory: O(1)
idea: Берём очередной элемент и вставляем его на место в уже отсортированную левую часть.
principle: Сдвигаем вправо все элементы больше ключа, затем ставим ключ на освободившееся место.
pros: Быстра на почти отсортированных данных; устойчивая
cons: O(n²) в худшем случае
when: Для маленьких или почти отсортированных массивов.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
for i in range(1, n):
    key = a[i]
    j = i - 1
    while j >= 0 and a[j] {GT} key:
        a[j + 1] = a[j]
        j -= 1
    a[j + 1] = key
print(*a)
```

## Сортировка выбором
approach: selection
role: alternative
time: O(n²)
memory: O(1)
idea: На каждом шаге выбираем лучший из оставшихся элементов и ставим его на позицию i.
principle: Ровно n − 1 обменов — минимум записей в память.
pros: Минимальное число обменов
cons: Всегда O(n²) сравнений
when: Когда запись в память дорога.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
for i in range(n):
    best = i
    for j in range(i + 1, n):
        if a[j] {LT} a[best]:
            best = j
    a[i], a[best] = a[best], a[i]
print(*a)
```

## Сортировка слиянием
approach: merge
role: efficient
time: O(n log n)
memory: O(n)
idea: Делим массив пополам, сортируем половины рекурсивно и сливаем две отсортированные части.
principle: Слияние двумя указателями берёт меньший из текущих элементов половин. Глубина рекурсии log n, на каждом уровне O(n) работы.
pros: Гарантированное O(n log n), устойчивая
cons: Дополнительная память O(n)
when: Когда нужна гарантия O(n log n) или подсчёт инверсий.
readability: 3
```python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] {LE} right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]


n = int(input())
print(*merge_sort(list(map(int, input().split()))))
```

## Быстрая сортировка
approach: quick
role: alternative
time: O(n log n) в среднем, O(n²) в худшем
memory: O(n)
idea: Выбираем опорный элемент и делим массив на меньшие, равные и большие него.
principle: Случайный опорный элемент делает худший случай крайне маловероятным. Части сортируются рекурсивно и склеиваются.
pros: Очень быстро на практике
cons: Неустойчивая в классическом варианте, худший случай O(n²)
when: Для изучения «разделяй и властвуй».
readability: 4
```python
import random


def quick_sort(a):
    if len(a) <= 1:
        return a
    pivot = random.choice(a)
    less = [x for x in a if x {LT} pivot]
    equal = [x for x in a if x == pivot]
    greater = [x for x in a if x {GT} pivot]
    return quick_sort(less) + equal + quick_sort(greater)


n = int(input())
print(*quick_sort(list(map(int, input().split()))))
```

## Сортировка подсчётом
approach: counting
role: efficient
time: O(n + k), k — диапазон значений
memory: O(k)
idea: Считаем, сколько раз встречается каждое значение, и выписываем значения по порядку.
principle: count[x − lo] — количество значения x. Работает без сравнений.
pros: Линейное время при небольшом диапазоне
cons: Не подходит для огромного диапазона значений
when: Когда значения — небольшие целые числа (оценки, возраст, цифры).
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
lo, hi = min(a), max(a)
count = [0] * (hi - lo + 1)
for x in a:
    count[x - lo] += 1
order = range(hi - lo, -1, -1) if {REV} else range(hi - lo + 1)
result = []
for i in order:
    result.extend([i + lo] * count[i])
print(*result)
```

## Пирамидальная (heapq)
approach: heap
role: pythonic
time: O(n log n)
memory: O(n)
idea: Куча всегда отдаёт наименьший элемент; извлекаем все по очереди.
principle: heapify строит кучу за O(n), каждое heappop — O(log n). Для убывания кладём числа с минусом.
pros: Знакомит с кучей — структурой для приоритетных очередей
cons: Медленнее sorted на практике
when: Когда нужны только k наименьших элементов.
readability: 3
```python
import heapq

n = int(input())
sign = -1 if {REV} else 1
heap = [sign * x for x in map(int, input().split())]
heapq.heapify(heap)
print(*[sign * heapq.heappop(heap) for _ in range(len(heap))])
```

# skill: binary_search
title: Бинарный поиск в отсортированном массиве
topics: Бинарный поиск; Поиск
match: BSEARCH | (SEARCH & SORT & (LIST | ELEMENT)) | (POSITION & SORT & (LIST | ELEMENT))
priority: 2.3
param: OFF = 1 if POSITION:номер else 0
param: BASE = с 1 if POSITION:номер else с 0
input: count | list | x
input_desc: Первая строка: n. Вторая: n чисел по неубыванию. Третья: искомое число x.
output_desc: Позиция первого вхождения x (нумерация {BASE}) или -1, если x нет.
understood: Дан отсортированный массив и число x. Найти позицию первого вхождения x (или -1).
algorithm: Бинарный поиск (левая граница)
why: На каждом шаге отрезок поиска уменьшается вдвое, поэтому нужно O(log n) сравнений.
ideas: Инвариант: ответ в [lo, hi); bisect_left; Поиск левой границы среди равных
structures: list
links: algo:binary-search, lib:bisect.bisect_left, py:method:list.index
edge: x меньше всех или больше всех элементов.
edge: Несколько равных x — нужна первая позиция.
edge: Массив из одного элемента.
step: lo = 0, hi = n — ответ лежит в полуинтервале [lo, hi).
step: mid = (lo + hi) // 2; если a[mid] < x — ответ правее: lo = mid + 1, иначе hi = mid.
step: Когда lo == hi, это первая позиция с a[i] ≥ x; проверяем, что a[lo] == x.
sample: 5\n1 3 5 7 9\n7
sample: 5\n1 3 5 7 9\n4
sample: 6\n2 2 2 3 3 4\n3
sample: 1\n10\n10
sample: 4\n1 2 3 4\n0

## Ручной бинарный поиск
approach: manual
role: beginner
time: O(log n)
memory: O(1)
idea: Поддерживаем полуинтервал [lo, hi), в котором находится первая позиция с a[i] ≥ x.
principle: Если a[mid] < x, все позиции ≤ mid не подходят; иначе ответ ≤ mid. Отрезок каждый раз уменьшается вдвое.
pros: Показывает алгоритм; переносится на «бинарный поиск по ответу»
cons: Легко ошибиться в границах
when: Всегда полезно уметь написать самому.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
lo, hi = 0, n
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] < x:
        lo = mid + 1
    else:
        hi = mid
print(lo + {OFF} if lo < n and a[lo] == x else -1)
```

## bisect_left
approach: bisect
role: short
time: O(log n)
memory: O(1)
idea: Модуль bisect реализует бинарный поиск.
principle: bisect_left(a, x) — первая позиция, куда можно вставить x, не нарушив порядок, т.е. первая позиция с a[i] ≥ x.
pros: Коротко и без ошибок в границах
cons: Нужно проверить, что a[i] == x
when: На олимпиадах — по умолчанию.
readability: 5
```python
from bisect import bisect_left

n = int(input())
a = list(map(int, input().split()))
x = int(input())
i = bisect_left(a, x)
print(i + {OFF} if i < n and a[i] == x else -1)
```

## Рекурсивный бинарный поиск
approach: recursion
role: alternative
time: O(log n)
memory: O(log n)
idea: Функция ищет на отрезке [lo, hi) и вызывает себя для половины.
principle: Та же логика, записанная рекурсивно.
pros: Наглядно показывает «разделяй и властвуй»
cons: Расход стека (небольшой — log n)
when: Для изучения рекурсии.
readability: 4
```python
def search(a, x, lo, hi):
    if lo >= hi:
        return lo
    mid = (lo + hi) // 2
    if a[mid] < x:
        return search(a, x, mid + 1, hi)
    return search(a, x, lo, mid)


n = int(input())
a = list(map(int, input().split()))
x = int(input())
i = search(a, x, 0, n)
print(i + {OFF} if i < n and a[i] == x else -1)
```

## Линейный поиск (для сравнения)
approach: linear
role: alternative
time: O(n)
memory: O(1)
idea: Просматриваем элементы по порядку до первого совпадения.
principle: Не использует отсортированность — работает для любого массива, но медленнее.
pros: Работает и без сортировки
cons: O(n) вместо O(log n)
when: Если массив не отсортирован или маленький.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
answer = -1
for i in range(n):
    if a[i] == x:
        answer = i + {OFF}
        break
print(answer)
```

## list.index с обработкой исключения
approach: index
role: pythonic
time: O(n)
memory: O(1)
idea: Метод index возвращает первую позицию, а при отсутствии бросает ValueError.
principle: try/except превращает исключение в ответ -1.
pros: Коротко, показывает обработку исключений
cons: Линейное время
when: Для небольших списков.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
try:
    print(a.index(x) + {OFF})
except ValueError:
    print(-1)
```

# skill: two_sum
title: Есть ли пара с заданной суммой
topics: Два указателя; Хеширование
match: PAIR & SUM & !COUNT & !MAX & !MIN
boost: LIST, ELEMENT, EXISTS
priority: 2.2
input: count | list | x
input_desc: Первая строка: n. Вторая: n чисел. Третья: число X.
output_desc: YES, если есть два элемента с разными индексами и суммой X, иначе NO.
understood: Дан массив и число X. Проверить, есть ли два разных элемента массива с суммой X.
algorithm: Множество просмотренных элементов
why: Для каждого элемента a ищем X − a среди уже просмотренных за O(1) — итого O(n).
ideas: Дополнение X − a; set для O(1) проверки; Два указателя после сортировки
structures: list, set
links: algo:two-pointers, algo:hashing, py:builtin:set
edge: Один элемент нельзя использовать дважды (X = 2a, а a встречается один раз — NO).
edge: n = 1 — пар нет.
sample: 5\n1 4 6 8 3\n10 => YES
sample: 3\n1 2 3\n7 => NO
sample: 2\n5 5\n10 => YES
sample: 3\n5 1 2\n10 => NO
sample: 4\n-3 7 0 2\n4 => YES

## Множество
approach: set
role: efficient
time: O(n)
memory: O(n)
idea: Идём по массиву и проверяем, видели ли мы X − a.
principle: seen содержит только элементы левее текущего, поэтому пара всегда из разных индексов.
pros: Линейное время
cons: Память O(n)
when: Обычно.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
seen = set()
found = False
for v in a:
    if x - v in seen:
        found = True
        break
    seen.add(v)
print("YES" if found else "NO")
```

## Перебор пар
approach: brute
role: beginner
time: O(n²)
memory: O(1)
idea: Проверяем все пары i < j.
principle: Вложенный цикл перебирает n(n−1)/2 пар.
pros: Очевидно правильно
cons: Медленно для n > 10⁴
when: Для маленьких n и проверки.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
found = False
for i in range(n):
    for j in range(i + 1, n):
        if a[i] + a[j] == x:
            found = True
print("YES" if found else "NO")
```

## Сортировка + два указателя
approach: two-pointers
role: alternative
time: O(n log n)
memory: O(n)
idea: В отсортированном массиве двигаем указатели с концов навстречу.
principle: Если сумма меньше X — увеличиваем левый, больше — уменьшаем правый. Ни одна подходящая пара не пропускается.
pros: O(1) доп. памяти после сортировки; классический приём
cons: Нужна сортировка
when: Когда массив уже отсортирован.
readability: 4
```python
n = int(input())
a = sorted(map(int, input().split()))
x = int(input())
i, j = 0, n - 1
found = False
while i < j:
    s = a[i] + a[j]
    if s == x:
        found = True
        break
    if s < x:
        i += 1
    else:
        j -= 1
print("YES" if found else "NO")
```

## itertools.combinations
approach: combinations
role: pythonic
time: O(n²)
memory: O(1)
idea: any по всем парам из combinations.
principle: combinations(a, 2) перебирает пары разных индексов.
pros: Одна строка логики
cons: O(n²)
when: Для коротких решений при малых n.
readability: 4
```python
from itertools import combinations

n = int(input())
a = list(map(int, input().split()))
x = int(input())
print("YES" if any(p + q == x for p, q in combinations(a, 2)) else "NO")
```

# skill: count_pairs_sum
title: Количество пар с заданной суммой
topics: Хеширование; Подсчёт
match: PAIR & SUM & COUNT
priority: 2.5
input: count | list | x
input_desc: Первая строка: n. Вторая: n чисел. Третья: число X.
output_desc: Количество пар индексов i < j с a[i] + a[j] = X.
understood: Дан массив и число X. Найти количество пар (i < j), сумма элементов которых равна X.
algorithm: Подсчёт дополнений
why: Для каждого элемента прибавляем, сколько раз X − a уже встречалось левее.
ideas: Counter/словарь частот; Каждая пара считается один раз
structures: dict
links: algo:hashing, lib:collections.Counter
edge: Одинаковые элементы образуют несколько пар.
sample: 5\n1 5 7 -1 5\n6 => 3
sample: 4\n2 2 2 2\n4 => 6
sample: 3\n1 2 3\n10 => 0

## Словарь частот
approach: dict
role: efficient
time: O(n)
memory: O(n)
idea: count[v] — сколько раз v встретилось левее текущего элемента.
principle: Пара (i, j) учитывается ровно один раз — в момент обработки j.
pros: Линейное время
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
count = {}
pairs = 0
for v in a:
    pairs += count.get(x - v, 0)
    count[v] = count.get(v, 0) + 1
print(pairs)
```

## Перебор пар
approach: brute
role: beginner
time: O(n²)
memory: O(1)
idea: Проверяем все пары i < j.
principle: Двойной цикл.
pros: Очевидно
cons: Медленно
when: Для проверки.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
x = int(input())
print(sum(1 for i in range(n) for j in range(i + 1, n) if a[i] + a[j] == x))
```

## Counter по всему массиву
approach: counter
role: alternative
time: O(n)
memory: O(n)
idea: Для каждого значения v считаем пары с x − v; пары с собой — C(c, 2).
principle: Если v < x − v: c[v]·c[x−v]; если v == x − v: c[v]·(c[v]−1)/2.
pros: Работает с уникальными значениями
cons: Нужно аккуратно не посчитать пары дважды
when: Когда значений мало, а повторов много.
readability: 3
```python
from collections import Counter

n = int(input())
c = Counter(map(int, input().split()))
x = int(input())
pairs = 0
for v in c:
    w = x - v
    if v < w:
        pairs += c[v] * c.get(w, 0)
    elif v == w:
        pairs += c[v] * (c[v] - 1) // 2
print(pairs)
```

# skill: max_subarray
title: Максимальная сумма подотрезка (Кадане)
topics: Динамическое программирование; Префиксные суммы
match: (MAX & SUM & (SUBARRAY | CONSECUTIVE)) & !WINDOW & !KTH & !ADJACENT_NOT
priority: 2.4
input: count | list
input_desc: Первая строка: n. Вторая: n целых чисел.
output_desc: Наибольшая сумма непустого подотрезка (подряд идущих элементов).
understood: Дан массив. Найти наибольшую сумму среди всех непустых отрезков подряд идущих элементов.
algorithm: Алгоритм Кадане
why: Лучшая сумма отрезка, заканчивающегося в i, — это max(a[i], лучшая для i − 1 + a[i]). Один проход.
ideas: ДП: cur = max(x, cur + x); Префиксные суммы; Все числа отрицательные — ответ максимальный элемент
structures: list
links: algo:kadane, algo:prefix-sums, algo:dp
edge: Все числа отрицательные — ответ равен наибольшему элементу.
edge: n = 1.
sample: 9\n-2 1 -3 4 -1 2 1 -5 4 => 6
sample: 3\n-3 -1 -2 => -1
sample: 1\n5 => 5
sample: 5\n2 -1 2 -1 2 => 4

## Алгоритм Кадане
approach: kadane
role: efficient
time: O(n)
memory: O(1)
idea: cur — лучшая сумма отрезка, заканчивающегося на текущем элементе.
principle: Если cur + x < x, выгоднее начать новый отрезок с x. Ответ — максимум cur по всем позициям.
pros: Один проход, O(1) памяти
cons: Нужно понять идею
when: Всегда.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
best = cur = a[0]
for x in a[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
print(best)
```

## Префиксные суммы и минимум
approach: prefix
role: alternative
time: O(n)
memory: O(1)
idea: Сумма отрезка (l, r] = pref[r] − pref[l]; для каждого r вычитаем минимальный префикс левее.
principle: Храним минимальную префиксную сумму среди уже пройденных позиций.
pros: Показывает технику префиксных сумм
cons: —
when: Когда префиксные суммы нужны и для других запросов.
readability: 4
```python
n = int(input())
a = list(map(int, input().split()))
pref = 0
min_pref = 0
best = a[0]
for x in a:
    pref += x
    best = max(best, pref - min_pref)
    min_pref = min(min_pref, pref)
print(best)
```

## Перебор всех отрезков
approach: brute
role: beginner
time: O(n²)
memory: O(1)
idea: Для каждого начала накапливаем сумму, двигая конец.
principle: Сумма отрезка [i, j] получается из [i, j−1] прибавлением a[j].
pros: Очевидно правильно
cons: O(n²)
when: Для n ≤ 5000 и проверки.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
best = a[0]
for i in range(n):
    s = 0
    for j in range(i, n):
        s += a[j]
        best = max(best, s)
print(best)
```

## Разделяй и властвуй
approach: divide
role: alternative
time: O(n log n)
memory: O(log n)
idea: Лучший отрезок либо в левой половине, либо в правой, либо пересекает середину.
principle: Для пересекающего середину берём лучший суффикс левой половины и лучший префикс правой.
pros: Учит «разделяй и властвуй»
cons: Медленнее Кадане
when: Для изучения техники.
readability: 3
```python
def best_sum(a, lo, hi):
    if hi - lo == 1:
        return a[lo]
    mid = (lo + hi) // 2
    s, left = 0, float("-inf")
    for i in range(mid - 1, lo - 1, -1):
        s += a[i]
        left = max(left, s)
    s, right = 0, float("-inf")
    for i in range(mid, hi):
        s += a[i]
        right = max(right, s)
    return max(best_sum(a, lo, mid), best_sum(a, mid, hi), left + right)


n = int(input())
a = list(map(int, input().split()))
print(best_sum(a, 0, n))
```

# skill: prefix_sum_queries
title: Сумма на отрезке (много запросов)
topics: Префиксные суммы
match: QUERY & SUM | (CUMULATIVE & QUERY)
priority: 2.4
input_desc: n; затем n чисел; затем q; затем q строк «l r» (1 ≤ l ≤ r ≤ n).
output_desc: Для каждого запроса — сумма a[l] + … + a[r] на отдельной строке.
understood: Дан массив и q запросов «сумма на отрезке [l, r]». Ответить на все запросы.
algorithm: Префиксные суммы
why: pref[i] — сумма первых i элементов; сумма на [l, r] = pref[r] − pref[l − 1]. Предподсчёт O(n), ответ O(1).
ideas: pref[0] = 0; itertools.accumulate; Нумерация с 1
structures: list
links: algo:prefix-sums, lib:itertools.accumulate
edge: l = r — отрезок из одного элемента.
edge: Отрицательные числа.
sample: 5\n1 2 3 4 5\n3\n1 5\n2 3\n4 4 => 15\n5\n4
sample: 1\n-7\n1\n1 1 => -7

## Префиксные суммы
approach: prefix
role: efficient
time: O(n + q)
memory: O(n)
idea: Предподсчитываем суммы префиксов, каждый запрос — одна разность.
principle: pref[r] − pref[l − 1] = (a[1] + … + a[r]) − (a[1] + … + a[l−1]).
pros: Каждый запрос за O(1)
cons: Нужна память O(n)
when: Когда запросов много.
readability: 5
```python
import sys

data = sys.stdin.read().split()
n = int(data[0])
a = list(map(int, data[1:1 + n]))
q = int(data[1 + n])
pref = [0] * (n + 1)
for i in range(n):
    pref[i + 1] = pref[i] + a[i]
out = []
pos = 2 + n
for _ in range(q):
    l, r = int(data[pos]), int(data[pos + 1])
    pos += 2
    out.append(pref[r] - pref[l - 1])
print("\n".join(map(str, out)))
```

## itertools.accumulate
approach: accumulate
role: short
time: O(n + q)
memory: O(n)
idea: accumulate строит префиксные суммы одной функцией.
principle: accumulate(a, initial=0) даёт [0, a1, a1+a2, …] (Python 3.8+).
pros: Коротко
cons: Python 3.8+ для initial
when: Обычно.
readability: 4
python: 3.8
```python
from itertools import accumulate

n = int(input())
pref = list(accumulate(map(int, input().split()), initial=0))
q = int(input())
for _ in range(q):
    l, r = map(int, input().split())
    print(pref[r] - pref[l - 1])
```

## Прямой подсчёт для каждого запроса
approach: naive
role: beginner
time: O(n · q)
memory: O(1)
idea: Для каждого запроса суммируем срез.
principle: sum(a[l-1:r]) — сумма элементов с l по r.
pros: Очевидно
cons: Медленно при большом q
when: Для маленьких входов и проверки.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
q = int(input())
for _ in range(q):
    l, r = map(int, input().split())
    print(sum(a[l - 1:r]))
```

# skill: window_max_sum
title: Максимальная сумма k подряд идущих элементов
topics: Скользящее окно; Префиксные суммы
match: (WINDOW | CONSECUTIVE) & SUM & MAX & !SUBARRAY
priority: 2.3
input: n k | list
input_desc: Первая строка: n и k (1 ≤ k ≤ n). Вторая: n чисел.
output_desc: Наибольшая сумма k подряд идущих элементов.
understood: Дан массив и число k. Найти наибольшую сумму k подряд идущих элементов.
algorithm: Скользящее окно
why: При сдвиге окна на 1 сумма меняется на (новый − ушедший) — O(1) на шаг.
ideas: Окно фиксированной длины; Префиксные суммы
structures: list
links: algo:sliding-window, algo:prefix-sums
edge: k = n — одно окно.
edge: Отрицательные числа.
sample: 6 3\n1 3 -1 -3 5 3 => 5
sample: 4 1\n-5 -2 -9 -1 => -1
sample: 3 3\n1 2 3 => 6

## Скользящее окно
approach: window
role: efficient
time: O(n)
memory: O(1)
idea: Сумма первого окна, затем сдвиг: +a[i] − a[i − k].
principle: Каждое окно отличается от предыдущего одним элементом с каждой стороны.
pros: Линейно
cons: —
when: Обычно.
readability: 5
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
s = sum(a[:k])
best = s
for i in range(k, n):
    s += a[i] - a[i - k]
    best = max(best, s)
print(best)
```

## Префиксные суммы
approach: prefix
role: alternative
time: O(n)
memory: O(n)
idea: Сумма окна [i, i + k) = pref[i + k] − pref[i].
principle: После предподсчёта каждое окно считается за O(1).
pros: Удобно, если нужны разные k
cons: Память O(n)
when: Для нескольких запросов с разными k.
readability: 4
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
pref = [0]
for x in a:
    pref.append(pref[-1] + x)
print(max(pref[i + k] - pref[i] for i in range(n - k + 1)))
```

## Перебор окон
approach: brute
role: beginner
time: O(n · k)
memory: O(1)
idea: Считаем сумму каждого окна заново.
principle: sum(a[i:i + k]) для каждого начала i.
pros: Просто
cons: O(n·k)
when: Для маленьких входов.
readability: 5
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
print(max(sum(a[i:i + k]) for i in range(n - k + 1)))
```

# skill: second_max
title: Второй по величине элемент
topics: Списки; Поиск максимума
match: SECOND & (MAX | MIN | BY_VALUE) & !WORD
boost: LIST, ELEMENT, NUMBER
priority: 2.3
param: FN = min if MIN else max
param: WHAT = наименьшее if MIN else наибольшее
input: list
input_desc: Одна строка: целые числа через пробел.
output_desc: Второе {WHAT} различное значение или NO, если различных значений меньше двух.
understood: Дан список чисел. Найти второе {WHAT} значение среди различных элементов.
algorithm: Один проход с двумя переменными
why: Храним лучшее и второе лучшее значения и обновляем их при проходе.
ideas: set для различных значений; sorted(set(a)); Две переменные
structures: list, set
links: py:builtin:sorted, py:builtin:set, lib:heapq.nlargest
edge: Все элементы равны — NO.
edge: Повторы максимума не считаются вторым значением.
sample: 3 1 4 1 5 9 2 6
sample: 7 7 7
sample: 10 20
sample: -1 -2 -3

## sorted(set(...))
approach: sorted-set
role: short
time: O(n log n)
memory: O(n)
idea: Убираем повторы множеством и сортируем.
principle: Второй с нужного края — ответ.
pros: Коротко
cons: O(n log n)
when: Обычно.
readability: 5
```python
values = sorted(set(map(int, input().split())))
if len(values) < 2:
    print("NO")
else:
    print(values[-2] if "{FN}" == "max" else values[1])
```

## Две переменные
approach: two-vars
role: efficient
time: O(n)
memory: O(1)
idea: first — лучшее значение, second — второе лучшее строго хуже first.
principle: Новое лучшее сдвигает first во second; значение между ними обновляет second; равное first игнорируется.
pros: Один проход, O(1) памяти
cons: Легко ошибиться в условиях
when: Для больших массивов.
readability: 4
```python
a = list(map(int, input().split()))
sign = -1 if "{FN}" == "min" else 1
first = second = None
for x in a:
    v = sign * x
    if first is None or v > first:
        if first is not None:
            second = first
        first = v
    elif v != first and (second is None or v > second):
        second = v
print(sign * second if second is not None else "NO")
```

## Удалить экстремум и взять снова
approach: remove
role: beginner
time: O(n)
memory: O(n)
idea: Удаляем все копии лучшего значения и снова ищем лучшее.
principle: Список без экстремумов; его экстремум — второе значение.
pros: Понятно
cons: Два прохода
when: Для обучения.
readability: 5
```python
a = list(map(int, input().split()))
best = {FN}(a)
rest = [x for x in a if x != best]
print({FN}(rest) if rest else "NO")
```

## heapq
approach: heap
role: pythonic
time: O(n)
memory: O(n)
idea: heapq.nlargest / nsmallest(2, set(a)) — два лучших различных значения.
principle: Функции кучи возвращают k лучших за O(n log k).
pros: Обобщается на k-й элемент
cons: Нужен heapq
when: Когда нужно k лучших.
readability: 4
```python
import heapq

values = set(map(int, input().split()))
top = heapq.nlargest(2, values) if "{FN}" == "max" else heapq.nsmallest(2, values)
print(top[1] if len(top) == 2 else "NO")
```

# skill: merge_sorted
title: Слияние двух отсортированных массивов
topics: Два указателя; Сортировка
match: MERGE & (LIST | SORT | ELEMENT | TWO) & !INTERVALS & !OVERLAP & !STRING
priority: 2.3
input: list | list
input_desc: Две строки: два массива, каждый отсортирован по неубыванию.
output_desc: Объединённый отсортированный массив через пробел.
understood: Даны два отсортированных массива. Слить их в один отсортированный.
algorithm: Слияние двумя указателями
why: На каждом шаге берём меньший из текущих элементов двух массивов — O(n + m).
ideas: Два указателя; heapq.merge; Хвост оставшегося массива
structures: list
links: algo:two-pointers, algo:merge-sort, lib:heapq.merge
edge: Один из массивов может быть пустым (пустая строка).
sample: 1 3 5\n2 4 6 => 1 2 3 4 5 6
sample: 1 1 2\n1 3 => 1 1 1 2 3
sample: 5 10\n1 => 1 5 10

## Два указателя
approach: pointers
role: beginner
time: O(n + m)
memory: O(n + m)
idea: Сравниваем текущие элементы и забираем меньший.
principle: Когда один массив закончился, дописываем хвост другого.
pros: Линейное время; основа сортировки слиянием
cons: Больше кода
when: Всегда полезно знать.
readability: 5
```python
a = list(map(int, input().split()))
b = list(map(int, input().split()))
i = j = 0
result = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        result.append(a[i])
        i += 1
    else:
        result.append(b[j])
        j += 1
result.extend(a[i:])
result.extend(b[j:])
print(*result)
```

## sorted(a + b)
approach: sorted
role: short
time: O((n + m) log(n + m)), на практике почти линейно
memory: O(n + m)
idea: Склеиваем и сортируем.
principle: Timsort распознаёт две отсортированные серии и сливает их почти за линейное время.
pros: Одна строка
cons: Не показывает алгоритм
when: Для краткости.
readability: 5
```python
a = list(map(int, input().split()))
b = list(map(int, input().split()))
print(*sorted(a + b))
```

## heapq.merge
approach: heapq
role: pythonic
time: O(n + m)
memory: O(1) — ленивый итератор
idea: Стандартная функция слияния отсортированных последовательностей.
principle: heapq.merge работает лениво и годится для любого числа входов.
pros: Сливает много массивов сразу
cons: —
when: Для слияния k отсортированных потоков.
readability: 5
```python
import heapq

a = list(map(int, input().split()))
b = list(map(int, input().split()))
print(*heapq.merge(a, b))
```

# skill: rotate_list
title: Циклический сдвиг массива
topics: Списки; Срезы
match: ROTATE & (LIST | ELEMENT) & !MATRIX & !STRING & !WORD
priority: 2.3
param: K = num(ROTATE) default 1
input: list
input_desc: Одна строка: элементы массива.
output_desc: Массив, циклически сдвинутый вправо на {K}.
understood: Дан массив. Сдвинуть его циклически вправо на {K} позиций (последние элементы переходят в начало).
algorithm: Срезы
why: Сдвиг вправо на k — это a[-k:] + a[:-k] (k берём по модулю n).
ideas: k % n; Срезы; deque.rotate; Три разворота
structures: list
links: py:topic:slicing, lib:collections.deque, algo:array-rotation
edge: k > n — используем k % n.
edge: k = 0 или k = n — массив не меняется.
sample: 1 2 3 4 5
sample: 7
sample: 1 2

## Срезы
approach: slice
role: short
time: O(n)
memory: O(n)
idea: Последние k элементов ставим перед остальными.
principle: k %= n защищает от k ≥ n.
pros: Одна строка
cons: Создаёт новый список
when: Обычно.
readability: 5
```python
a = input().split()
k = {K} % len(a)
print(*(a[-k:] + a[:-k] if k else a))
```

## deque.rotate
approach: deque
role: pythonic
time: O(k)
memory: O(n)
idea: Двусторонняя очередь умеет вращаться.
principle: deque.rotate(k) сдвигает вправо на k.
pros: Удобно для многократных сдвигов
cons: Нужна deque
when: Когда сдвигов много.
readability: 5
```python
from collections import deque

d = deque(input().split())
d.rotate({K})
print(*d)
```

## Сдвиг по одному элементу
approach: loop
role: beginner
time: O(n · k)
memory: O(1)
idea: k раз переносим последний элемент в начало.
principle: a.insert(0, a.pop()) — один сдвиг вправо.
pros: Понятно
cons: Медленно для больших k и n
when: Для обучения.
readability: 5
```python
a = input().split()
for _ in range({K} % len(a)):
    a.insert(0, a.pop())
print(*a)
```

## Три разворота
approach: reverse
role: efficient
time: O(n)
memory: O(1)
idea: Развернуть весь массив, затем первые k и оставшиеся n − k.
principle: Классический приём сдвига на месте без дополнительной памяти.
pros: O(1) памяти
cons: Неочевиден
when: Когда нельзя создавать копию.
readability: 3
```python
def rev(a, i, j):
    while i < j:
        a[i], a[j] = a[j], a[i]
        i += 1
        j -= 1


a = input().split()
n = len(a)
k = {K} % n
rev(a, 0, n - 1)
rev(a, 0, k - 1)
rev(a, k, n - 1)
print(*a)
```

# skill: lis
title: Наибольшая возрастающая подпоследовательность
topics: Динамическое программирование; Бинарный поиск
match: (LONGEST | MAX) & INCREASING & SUBSEQUENCE
priority: 2.6
input: count | list
input_desc: Первая строка: n. Вторая: n чисел.
output_desc: Длина наибольшей строго возрастающей подпоследовательности.
understood: Дан массив. Найти длину самой длинной строго возрастающей подпоследовательности (элементы не обязаны идти подряд).
algorithm: Терпеливая сортировка (O(n log n))
why: tails[k] — наименьший последний элемент возрастающей подпоследовательности длины k + 1; для каждого x бинарным поиском обновляем tails.
ideas: dp[i] = 1 + max(dp[j]) для j < i, a[j] < a[i]; bisect_left на массиве tails
structures: list
links: algo:lis, algo:dp, lib:bisect.bisect_left
edge: Все элементы равны — ответ 1 (строгое возрастание).
edge: Убывающий массив — ответ 1.
sample: 8\n10 9 2 5 3 7 101 18 => 4
sample: 6\n0 1 0 3 2 3 => 4
sample: 4\n7 7 7 7 => 1
sample: 1\n5 => 1

## Бинарный поиск по хвостам
approach: tails
role: efficient
time: O(n log n)
memory: O(n)
idea: Поддерживаем массив наименьших возможных «хвостов» подпоследовательностей каждой длины.
principle: tails возрастает. Для x находим первую позицию с tails[i] ≥ x и заменяем; если такой нет — удлиняем. Длина tails — ответ.
pros: Быстро для n до 10⁶
cons: Восстановить саму подпоследовательность сложнее
when: Когда n велико.
readability: 3
```python
from bisect import bisect_left

n = int(input())
tails = []
for x in map(int, input().split()):
    i = bisect_left(tails, x)
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
print(len(tails))
```

## ДП O(n²)
approach: dp
role: beginner
time: O(n²)
memory: O(n)
idea: dp[i] — длина лучшей подпоследовательности, оканчивающейся на a[i].
principle: dp[i] = 1 + max(dp[j]) по всем j < i с a[j] < a[i].
pros: Классическое ДП, легко восстановить ответ
cons: O(n²)
when: Для n до ~5000.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
dp = [1] * n
for i in range(n):
    for j in range(i):
        if a[j] < a[i]:
            dp[i] = max(dp[i], dp[j] + 1)
print(max(dp))
```

## Рекурсия с мемоизацией
approach: memo
role: alternative
time: O(n²)
memory: O(n)
idea: best(i) — длина лучшей подпоследовательности, начинающейся с a[i].
principle: best(i) = 1 + max(best(j)) для j > i с a[j] > a[i]; lru_cache запоминает результаты.
pros: Естественная рекурсивная формулировка
cons: Глубина рекурсии
when: Для изучения мемоизации.
readability: 4
```python
from functools import lru_cache
import sys

sys.setrecursionlimit(10000)
n = int(input())
a = list(map(int, input().split()))


@lru_cache(maxsize=None)
def best(i):
    return 1 + max((best(j) for j in range(i + 1, n) if a[j] > a[i]), default=0)


print(max(best(i) for i in range(n)))
```

# skill: inversions
title: Количество инверсий
topics: Сортировка слиянием; Подсчёт
match: INVERSION
priority: 2.6
input: count | list
input_desc: Первая строка: n. Вторая: n чисел.
output_desc: Количество пар i < j с a[i] > a[j].
understood: Дан массив. Посчитать количество инверсий — пар i < j, где a[i] > a[j].
algorithm: Подсчёт при сортировке слиянием
why: При слиянии, когда берём элемент из правой половины, он образует инверсии со всеми оставшимися элементами левой.
ideas: Сортировка слиянием; Дерево Фенвика
structures: list
links: algo:merge-sort, algo:fenwick, algo:inversions
edge: Отсортированный массив — 0 инверсий.
edge: Обратный порядок — n(n−1)/2.
sample: 5\n2 4 1 3 5 => 3
sample: 4\n4 3 2 1 => 6
sample: 3\n1 1 1 => 0
sample: 1\n7 => 0

## Сортировка слиянием
approach: merge
role: efficient
time: O(n log n)
memory: O(n)
idea: Инверсии = инверсии слева + справа + «перекрёстные» при слиянии.
principle: Когда right[j] < left[i], все элементы left[i:] больше right[j] — прибавляем len(left) − i.
pros: O(n log n)
cons: Нужно аккуратно реализовать слияние
when: Обычно.
readability: 3
```python
def count(a):
    if len(a) <= 1:
        return a, 0
    mid = len(a) // 2
    left, x = count(a[:mid])
    right, y = count(a[mid:])
    merged, inv = [], x + y
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            inv += len(left) - i
            j += 1
    return merged + left[i:] + right[j:], inv


n = int(input())
print(count(list(map(int, input().split())))[1])
```

## Перебор пар
approach: brute
role: beginner
time: O(n²)
memory: O(1)
idea: Проверяем все пары i < j.
principle: Прямо по определению.
pros: Очевидно
cons: O(n²)
when: Для проверки.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
print(sum(1 for i in range(n) for j in range(i + 1, n) if a[i] > a[j]))
```

## Дерево Фенвика
approach: fenwick
role: alternative
time: O(n log n)
memory: O(n)
idea: Идём справа налево и считаем, сколько уже добавленных элементов меньше текущего.
principle: Значения сжимаются в ранги 1..k; Фенвик хранит количества и считает префиксные суммы за O(log n).
pros: Универсальная структура для подсчётов
cons: Нужно сжатие координат
when: Когда нужны и другие запросы на префиксах.
readability: 2
```python
n = int(input())
a = list(map(int, input().split()))
rank = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
tree = [0] * (len(rank) + 1)
inv = 0
for x in reversed(a):
    r = rank[x] - 1
    while r > 0:
        inv += tree[r]
        r -= r & -r
    r = rank[x]
    while r < len(tree):
        tree[r] += 1
        r += r & -r
print(inv)
```

# skill: missing_number
title: Пропущенное число
topics: Арифметика; XOR
match: MISSING & !STRING & !CHAR
priority: 2.5
input: n | list
input_desc: Первая строка: n. Вторая: n − 1 различных чисел от 1 до n.
output_desc: Число от 1 до n, которого нет в списке.
understood: Даны n − 1 различных чисел из диапазона 1..n. Найти пропущенное число.
algorithm: Сумма арифметической прогрессии
why: Сумма 1..n равна n(n+1)/2; разность с суммой данных чисел — пропущенное.
ideas: n(n+1)/2; x ^ x = 0; Множества
structures: list
links: algo:arithmetic-progression, algo:bits, py:builtin:set
edge: Пропущено 1 или n.
edge: n = 1: пропущено 1 (вторая строка пустая).
sample: 5\n1 2 4 5 => 3
sample: 3\n2 3 => 1
sample: 4\n1 2 3 => 4

## Формула суммы
approach: sum
role: short
time: O(n)
memory: O(1)
idea: Пропущенное = сумма 1..n − сумма данных.
principle: n(n+1)/2 — сумма арифметической прогрессии.
pros: Просто и быстро
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
a = list(map(int, input().split()))
print(n * (n + 1) // 2 - sum(a))
```

## XOR
approach: xor
role: efficient
time: O(n)
memory: O(1)
idea: XOR всех чисел 1..n и всех данных чисел оставляет только пропущенное.
principle: x ^ x = 0 и x ^ 0 = x, а XOR коммутативен.
pros: Без больших сумм — работает и в языках с переполнением
cons: Неочевидно
when: Как олимпиадный приём.
readability: 3
```python
n = int(input())
x = 0
for v in range(1, n + 1):
    x ^= v
for v in map(int, input().split()):
    x ^= v
print(x)
```

## Разность множеств
approach: set
role: pythonic
time: O(n)
memory: O(n)
idea: Множество 1..n минус множество данных.
principle: Остаётся ровно один элемент.
pros: Читается как условие
cons: Память O(n)
when: Для наглядности.
readability: 5
```python
n = int(input())
a = set(map(int, input().split()))
print((set(range(1, n + 1)) - a).pop())
```

## Сортировка и проверка
approach: sort
role: beginner
time: O(n log n)
memory: O(n)
idea: После сортировки a[i] должно быть i + 1; первое несовпадение — ответ.
principle: Если все на месте — пропущено n.
pros: Понятно
cons: O(n log n)
when: Для обучения.
readability: 5
```python
n = int(input())
a = sorted(map(int, input().split()))
answer = n
for i, v in enumerate(a):
    if v != i + 1:
        answer = i + 1
        break
print(answer)
```

# skill: has_duplicates
title: Есть ли повторяющиеся элементы
topics: Множества; Списки
match: DUPLICATE & (LIST | ELEMENT | NUMBER) & !REMOVE & !COUNT & !STRING & !CHAR
boost: CHECK, EXISTS
priority: 2.2
input: list
input_desc: Одна строка: числа через пробел.
output_desc: YES, если хотя бы одно значение встречается больше одного раза, иначе NO.
understood: Дан список. Проверить, есть ли в нём повторяющиеся элементы.
algorithm: Множество
why: Если в множестве меньше элементов, чем в списке, — были повторы.
ideas: len(set(a)) != len(a); Ранний выход при первом повторе
structures: list, set
links: py:builtin:set, lib:collections.Counter
edge: Один элемент — NO.
sample: 1 2 3 1 => YES
sample: 1 2 3 => NO
sample: 5 => NO
sample: -1 -1 => YES

## Сравнение длин
approach: len-set
role: short
time: O(n)
memory: O(n)
idea: Множество удаляет повторы.
principle: len(set(a)) < len(a) ⇔ есть повторы.
pros: Одна строка
cons: Всегда строит всё множество
when: Обычно.
readability: 5
```python
a = input().split()
print("YES" if len(set(a)) != len(a) else "NO")
```

## Ранний выход
approach: early
role: efficient
time: O(n)
memory: O(n)
idea: Останавливаемся на первом повторе.
principle: seen содержит уже просмотренные элементы.
pros: Быстрее, если повтор в начале
cons: Длиннее
when: Для больших входов.
readability: 5
```python
a = input().split()
seen = set()
answer = "NO"
for x in a:
    if x in seen:
        answer = "YES"
        break
    seen.add(x)
print(answer)
```

## Сортировка и соседи
approach: sort
role: alternative
time: O(n log n)
memory: O(n)
idea: После сортировки равные элементы стоят рядом.
principle: Проверяем соседние пары.
pros: O(1) доп. памяти при сортировке на месте
cons: O(n log n)
when: Когда память ограничена.
readability: 4
```python
a = sorted(map(int, input().split()))
print("YES" if any(a[i] == a[i + 1] for i in range(len(a) - 1)) else "NO")
```

# skill: count_above_average
title: Количество элементов больше среднего
topics: Списки; Среднее
match: AVERAGE & (GREATER | LESS) & (COUNT | PRINT)
priority: 2.5
param: CMP = < if LESS else >
param: WHAT = меньше if LESS else больше
input: list
input_desc: Одна строка: целые числа.
output_desc: Количество элементов, которые {WHAT} среднего арифметического.
understood: Дан список чисел. Посчитать, сколько элементов {WHAT} среднего арифметического.
algorithm: Два прохода: среднее, затем подсчёт
why: Сначала нужна сумма всех чисел, потом сравнение каждого со средним.
ideas: Сравнение x·n с суммой без дробей; sum / len
structures: list
links: py:builtin:sum, py:builtin:len, lib:statistics.mean
edge: Все элементы равны — ответ 0.
edge: Сравнение x · n {CMP} sum избегает погрешностей float.
sample: 1 2 3 4 5
sample: 5 5 5
sample: -1 10

## Два прохода
approach: two-pass
role: beginner
time: O(n)
memory: O(n)
idea: Вычисляем среднее и считаем элементы {WHAT} его.
principle: avg = sum(a) / len(a).
pros: Понятно
cons: float может давать погрешность для огромных чисел
when: Обычно.
readability: 5
```python
a = list(map(int, input().split()))
avg = sum(a) / len(a)
count = 0
for x in a:
    if x {CMP} avg:
        count += 1
print(count)
```

## Целочисленное сравнение
approach: exact
role: efficient
time: O(n)
memory: O(n)
idea: x {CMP} sum / n ⇔ x · n {CMP} sum (n > 0) — без деления.
principle: Работаем только с целыми числами — нет погрешностей.
pros: Точно для любых чисел
cons: —
when: Когда числа большие.
readability: 4
```python
a = list(map(int, input().split()))
total, n = sum(a), len(a)
print(sum(1 for x in a if x * n {CMP} total))
```

## statistics.mean
approach: mean
role: alternative
time: O(n)
memory: O(n)
idea: Среднее из модуля statistics.
principle: mean возвращает точное среднее (Fraction-подобные вычисления для int).
pros: Говорящее имя функции
cons: Медленнее sum / len
when: В статистических задачах.
readability: 5
```python
from statistics import mean

a = list(map(int, input().split()))
m = mean(a)
print(len([x for x in a if x {CMP} m]))
```

# skill: longest_equal_run
title: Самая длинная серия одинаковых подряд элементов
topics: Списки; Группировка
match: LONGEST & (CONSECUTIVE | DUPLICATE | EQUAL) & !SUBSTRING & !SUBSEQUENCE & !INCREASING & !WORD
priority: 2.2
input: list
input_desc: Одна строка: элементы через пробел.
output_desc: Длина самой длинной серии одинаковых подряд идущих элементов.
understood: Дана последовательность. Найти длину самой длинной серии одинаковых подряд идущих элементов.
algorithm: Подсчёт текущей серии
why: Если элемент равен предыдущему — серия растёт, иначе начинается новая.
ideas: itertools.groupby; Текущая и лучшая длина
structures: list
links: lib:itertools.groupby, algo:runs
edge: Один элемент — 1.
sample: 1 1 2 2 2 3 => 3
sample: 5 => 1
sample: 1 2 3 => 1
sample: 7 7 7 7 => 4

## Текущая серия
approach: loop
role: beginner
time: O(n)
memory: O(1)
idea: cur — длина текущей серии, best — лучшая.
principle: При равенстве соседей cur += 1, иначе cur = 1.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
a = input().split()
best = cur = 1
for i in range(1, len(a)):
    cur = cur + 1 if a[i] == a[i - 1] else 1
    best = max(best, cur)
print(best)
```

## itertools.groupby
approach: groupby
role: short
time: O(n)
memory: O(1)
idea: groupby разбивает на группы одинаковых подряд элементов.
principle: max длины групп.
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
from itertools import groupby

print(max(len(list(g)) for _, g in groupby(input().split())))
```

## Индексы смены значения
approach: boundaries
role: alternative
time: O(n)
memory: O(n)
idea: Находим позиции, где значение меняется; длина серии — разность соседних позиций.
principle: Добавляем 0 и n как границы.
pros: Удобно, если нужны сами границы серий
cons: Длиннее
when: Когда нужны позиции серий.
readability: 3
```python
a = input().split()
cuts = [0] + [i for i in range(1, len(a)) if a[i] != a[i - 1]] + [len(a)]
print(max(cuts[i + 1] - cuts[i] for i in range(len(cuts) - 1)))
```

# skill: longest_increasing_run
title: Самый длинный возрастающий отрезок
topics: Списки
match: LONGEST & INCREASING & !SUBSEQUENCE
priority: 2.4
input: list
input_desc: Одна строка: числа.
output_desc: Длина самого длинного отрезка подряд идущих строго возрастающих элементов.
understood: Дан массив. Найти длину самого длинного отрезка, где каждый следующий элемент больше предыдущего.
algorithm: Подсчёт текущего отрезка
why: Если a[i] > a[i−1], отрезок продолжается, иначе начинается заново.
ideas: Один проход; zip(a, a[1:])
structures: list
links: algo:runs, py:builtin:zip
edge: Один элемент — 1.
sample: 1 2 3 1 2 => 3
sample: 5 4 3 => 1
sample: 1 2 3 4 => 4
sample: 3 => 1

## Один проход
approach: loop
role: beginner
time: O(n)
memory: O(1)
idea: Текущая длина растёт, пока элементы возрастают.
principle: cur = cur + 1 при a[i] > a[i−1], иначе 1.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
a = list(map(int, input().split()))
best = cur = 1
for i in range(1, len(a)):
    cur = cur + 1 if a[i] > a[i - 1] else 1
    best = max(best, cur)
print(best)
```

## zip соседей
approach: zip
role: pythonic
time: O(n)
memory: O(1)
idea: Перебираем пары соседей через zip(a, a[1:]).
principle: Для каждой пары решаем: продолжить или начать заново.
pros: Без индексов
cons: —
when: Для идиоматичного кода.
readability: 4
```python
a = list(map(int, input().split()))
best = cur = 1
for x, y in zip(a, a[1:]):
    cur = cur + 1 if y > x else 1
    best = max(best, cur)
print(best)
```

## groupby по признаку возрастания
approach: groupby
role: alternative
time: O(n)
memory: O(n)
idea: Признак «a[i] > a[i−1]» группируем; длинная группа True длины L даёт отрезок L + 1.
principle: Серии True в списке признаков соответствуют возрастающим отрезкам.
pros: Показывает группировку
cons: Неочевидно
when: Для разнообразия.
readability: 3
```python
from itertools import groupby

a = list(map(int, input().split()))
flags = [y > x for x, y in zip(a, a[1:])]
print(max([len(list(g)) + 1 for k, g in groupby(flags) if k], default=1))
```

# skill: local_maxima
title: Количество локальных максимумов
topics: Списки
match: LOCAL & (MAX | MIN)
priority: 2.6
param: CMP = < if MIN else >
param: WHAT = минимумов if MIN else максимумов
input: list
input_desc: Одна строка: числа.
output_desc: Количество элементов (не крайних), которые строго {CMP} обоих соседей.
understood: Дан массив. Посчитать количество локальных {WHAT} — элементов, строго {CMP} обоих соседей (крайние не учитываются).
algorithm: Сравнение с соседями
why: Проверяем каждый внутренний элемент.
ideas: a[i−1] < a[i] > a[i+1]; zip трёх сдвигов
structures: list
links: py:builtin:zip, algo:arrays
edge: Меньше трёх элементов — 0.
sample: 1 3 2 4 1
sample: 1 2 3
sample: 5 5 5

## Цикл по индексам
approach: loop
role: beginner
time: O(n)
memory: O(1)
idea: Для i от 1 до n − 2 сравниваем с соседями.
principle: Цепочка сравнений a[i - 1] {CMP} ... записывается через and.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
a = list(map(int, input().split()))
count = 0
for i in range(1, len(a) - 1):
    if a[i] {CMP} a[i - 1] and a[i] {CMP} a[i + 1]:
        count += 1
print(count)
```

## zip трёх сдвигов
approach: zip
role: pythonic
time: O(n)
memory: O(n)
idea: zip(a, a[1:], a[2:]) даёт тройки соседей.
principle: Проверяем среднюю в каждой тройке.
pros: Без индексов
cons: Создаёт срезы
when: Для краткости.
readability: 4
```python
a = list(map(int, input().split()))
print(sum(1 for x, y, z in zip(a, a[1:], a[2:]) if y {CMP} x and y {CMP} z))
```

# skill: kth_smallest
title: k-й по величине элемент
topics: Сортировка; Кучи
match: KTH & (MIN | MAX | ELEMENT | LIST | NUMBER) & !DIGIT
priority: 2.4
param: K = num(KTH, FIRST) default 2
param: FN = nlargest if MAX else nsmallest
param: REV = True if MAX else False
input: list
input_desc: Одна строка: числа (не меньше {K}).
output_desc: {K}-й элемент в отсортированном порядке (с учётом повторов).
understood: Дан список чисел. Найти {K}-й элемент в порядке сортировки (повторы учитываются).
algorithm: Частичная сортировка
why: sorted(a)[k−1] — O(n log n); heapq находит k лучших за O(n log k); quickselect — в среднем O(n).
ideas: sorted()[k−1]; heapq; Быстрый выбор (quickselect)
structures: list
links: py:builtin:sorted, lib:heapq, algo:quickselect
edge: k = 1 — минимум (или максимум).
edge: Повторяющиеся значения учитываются отдельно.
sample: 7 10 4 3 20 15
sample: 1 1 2
sample: 5 4

## sorted
approach: sorted
role: short
time: O(n log n)
memory: O(n)
idea: Сортируем и берём элемент с индексом k − 1.
principle: Индексы Python начинаются с 0.
pros: Просто
cons: Сортирует весь массив
when: Обычно.
readability: 5
```python
a = list(map(int, input().split()))
print(sorted(a, reverse={REV})[{K} - 1])
```

## heapq
approach: heap
role: efficient
time: O(n log k)
memory: O(k)
idea: Берём k лучших элементов кучей.
principle: heapq.{FN}(k, a) возвращает k лучших в порядке; последний — ответ.
pros: Быстрее при маленьком k
cons: —
when: Когда k ≪ n.
readability: 4
```python
import heapq

a = list(map(int, input().split()))
print(heapq.{FN}({K}, a)[-1])
```

## Quickselect
approach: quickselect
role: alternative
time: O(n) в среднем
memory: O(n)
idea: Как быстрая сортировка, но рекурсия идёт только в нужную часть.
principle: Делим по случайному опорному элементу на меньшие, равные, большие и выбираем часть, где лежит k-й.
pros: Линейное среднее время
cons: Сложнее
when: Для огромных массивов.
readability: 3
```python
import random


def select(a, k):
    pivot = random.choice(a)
    less = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    if k < len(less):
        return select(less, k)
    if k < len(less) + len(equal):
        return pivot
    return select([x for x in a if x > pivot], k - len(less) - len(equal))


a = list(map(int, input().split()))
k = {K} - 1
print(select(a, len(a) - 1 - k if {REV} else k))
```

# skill: cumulative_sum
title: Накопленные (префиксные) суммы
topics: Префиксные суммы
match: CUMULATIVE & !QUERY
priority: 2.5
input: list
input_desc: Одна строка: числа.
output_desc: Последовательность сумм первых 1, 2, …, n элементов.
understood: Дан массив. Вывести накопленные суммы: a1, a1+a2, a1+a2+a3, …
algorithm: Накопление суммы
why: Каждая следующая сумма = предыдущая + новый элемент.
ideas: itertools.accumulate; Одна переменная-сумма
structures: list
links: algo:prefix-sums, lib:itertools.accumulate
edge: Один элемент.
sample: 1 2 3 4 => 1 3 6 10
sample: 5 => 5
sample: -1 1 -1 => -1 0 -1

## Цикл
approach: loop
role: beginner
time: O(n)
memory: O(n)
idea: Прибавляем элемент к сумме и запоминаем результат.
principle: s += x; result.append(s).
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
a = list(map(int, input().split()))
s = 0
result = []
for x in a:
    s += x
    result.append(s)
print(*result)
```

## itertools.accumulate
approach: accumulate
role: short
time: O(n)
memory: O(n)
idea: Готовая функция накопления.
principle: accumulate(a) лениво выдаёт префиксные суммы.
pros: Одна строка
cons: —
when: Всегда.
readability: 5
```python
from itertools import accumulate

print(*accumulate(map(int, input().split())))
```

## Сумма срезов (для сравнения)
approach: slices
role: alternative
time: O(n²)
memory: O(n)
idea: i-я накопленная сумма — sum(a[:i+1]).
principle: Пересчитываем сумму каждого префикса заново.
pros: Очевидно
cons: Квадратично
when: Для понимания, почему накопление лучше.
readability: 5
```python
a = list(map(int, input().split()))
print(*[sum(a[:i + 1]) for i in range(len(a))])
```

# skill: next_greater
title: Следующий больший элемент
topics: Стек; Монотонный стек
match: NEXT_GREATER
priority: 2.6
input: list
input_desc: Одна строка: числа.
output_desc: Для каждого элемента — ближайший справа элемент больше него, или -1.
understood: Дан массив. Для каждого элемента найти первый элемент справа, который больше него (или -1).
algorithm: Монотонный стек
why: Стек хранит индексы элементов, для которых ответ ещё не найден; их значения убывают. Новый элемент «закрывает» все меньшие.
ideas: Монотонный стек; Каждый индекс кладётся и снимается один раз
structures: list (стек)
links: algo:monotonic-stack, algo:stack
edge: Последний элемент всегда -1.
edge: Равные элементы не считаются большими.
sample: 4 5 2 25 => 5 25 25 -1
sample: 13 7 6 12 => -1 12 12 -1
sample: 1 1 1 => -1 -1 -1

## Монотонный стек
approach: stack
role: efficient
time: O(n)
memory: O(n)
idea: Пока текущий элемент больше вершины стека — он ответ для вершины.
principle: Каждый индекс один раз кладётся и один раз снимается — O(n).
pros: Линейное время
cons: Нужно понять идею
when: Обычно.
readability: 4
```python
a = list(map(int, input().split()))
result = [-1] * len(a)
stack = []
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        result[stack.pop()] = x
    stack.append(i)
print(*result)
```

## Перебор вправо
approach: brute
role: beginner
time: O(n²)
memory: O(n)
idea: Для каждого i ищем первый больший справа.
principle: Вложенный цикл.
pros: Очевидно
cons: O(n²)
when: Для проверки.
readability: 5
```python
a = list(map(int, input().split()))
result = []
for i in range(len(a)):
    answer = -1
    for j in range(i + 1, len(a)):
        if a[j] > a[i]:
            answer = a[j]
            break
    result.append(answer)
print(*result)
```

## Стек справа налево
approach: stack-right
role: alternative
time: O(n)
memory: O(n)
idea: Идём справа налево, стек хранит кандидатов-«больших» справа.
principle: Снимаем со стека всё ≤ x; вершина (если есть) — ответ; затем кладём x.
pros: Тот же монотонный стек в другой формулировке
cons: —
when: Для разнообразия.
readability: 4
```python
a = list(map(int, input().split()))
result = [-1] * len(a)
stack = []
for i in range(len(a) - 1, -1, -1):
    while stack and stack[-1] <= a[i]:
        stack.pop()
    if stack:
        result[i] = stack[-1]
    stack.append(a[i])
print(*result)
```

# skill: merge_intervals
title: Объединение пересекающихся отрезков
topics: Сортировка; Жадные алгоритмы
match: (MERGE | OVERLAP) & (INTERVALS | RANGE | SUBARRAY) & !MAX & !COUNT
priority: 2.5
input_desc: Первая строка: n. Далее n строк «l r» (l ≤ r).
output_desc: Объединённые отрезки в порядке возрастания, каждый на отдельной строке «l r».
understood: Дано n отрезков. Объединить пересекающиеся (и касающиеся) отрезки.
algorithm: Сортировка по левому концу и слияние
why: После сортировки пересекающиеся отрезки идут подряд; текущий отрезок расширяем, пока следующий начинается не правее его конца.
ideas: Сортировка по началу; Сравнение с концом последнего объединённого
structures: list[tuple]
links: algo:intervals, algo:greedy, py:builtin:sorted
edge: Касающиеся отрезки [1, 3] и [3, 5] объединяются.
edge: Вложенные отрезки.
sample: 4\n1 3\n2 6\n8 10\n15 18 => 1 6\n8 10\n15 18
sample: 2\n1 4\n4 5 => 1 5
sample: 3\n1 10\n2 3\n4 5 => 1 10

## Сортировка и слияние
approach: sort
role: beginner
time: O(n log n)
memory: O(n)
idea: Идём по отсортированным отрезкам и расширяем последний объединённый.
principle: Если l ≤ конца последнего — пересекаются, иначе начинается новый.
pros: Стандартное решение
cons: —
when: Всегда.
readability: 5
```python
n = int(input())
segs = sorted(tuple(map(int, input().split())) for _ in range(n))
merged = []
for l, r in segs:
    if merged and l <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], r)
    else:
        merged.append([l, r])
for l, r in merged:
    print(l, r)
```

## Сканирующая прямая
approach: sweep
role: alternative
time: O(n log n)
memory: O(n)
idea: События «+1» в начале и «−1» в конце; отрезок объединения — пока счётчик > 0.
principle: При равной координате начало обрабатывается раньше конца, чтобы касающиеся отрезки слились.
pros: Обобщается на подсчёт покрытий
cons: Сложнее
when: Для задач о покрытии точек.
readability: 3
```python
n = int(input())
events = []
for _ in range(n):
    l, r = map(int, input().split())
    events.append((l, 0))
    events.append((r, 1))
events.sort()
depth = 0
start = None
for x, kind in events:
    if kind == 0:
        if depth == 0:
            start = x
        depth += 1
    else:
        depth -= 1
        if depth == 0:
            print(start, x)
```

# skill: activity_selection
title: Максимум непересекающихся отрезков
topics: Жадные алгоритмы
match: INTERVALS & (MAX | COUNT) | (OVERLAP & MAX & COUNT)
priority: 2.5
input_desc: Первая строка: n. Далее n строк «начало конец».
output_desc: Наибольшее количество попарно непересекающихся отрезков (отрезок может начинаться в момент окончания предыдущего).
understood: Дано n заявок (отрезков времени). Выбрать максимальное количество непересекающихся.
algorithm: Жадный выбор по раннему окончанию
why: Выгодно брать отрезок, который заканчивается раньше всех: он оставляет больше места остальным (доказывается обменом).
ideas: Сортировка по концу; Жадный алгоритм; Доказательство «замены»
structures: list[tuple]
links: algo:greedy, algo:intervals
edge: Отрезки, начинающиеся в момент конца другого, совместимы.
sample: 4\n1 3\n2 5\n3 9\n6 8 => 2
sample: 3\n1 2\n2 3\n3 4 => 3
sample: 1\n0 10 => 1

## Жадно по концу
approach: greedy
role: efficient
time: O(n log n)
memory: O(n)
idea: Сортируем по окончанию и берём каждый отрезок, начинающийся не раньше конца последнего выбранного.
principle: Жадный выбор оптимален: самый ранний конец никогда не хуже.
pros: Быстро и просто
cons: Нужно знать доказательство
when: Всегда.
readability: 5
```python
n = int(input())
segs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda s: s[1])
count = 0
end = float("-inf")
for l, r in segs:
    if l >= end:
        count += 1
        end = r
print(count)
```

## ДП по отсортированным отрезкам
approach: dp
role: alternative
time: O(n log n)
memory: O(n)
idea: dp[i] — лучший ответ среди первых i отрезков (по концу); либо пропускаем i-й, либо берём и прыгаем к последнему совместимому.
principle: bisect находит последний отрезок с концом ≤ начала текущего.
pros: Обобщается на взвешенные заявки
cons: Сложнее жадного
when: Когда у заявок есть веса.
readability: 3
```python
from bisect import bisect_right

n = int(input())
segs = sorted((tuple(map(int, input().split())) for _ in range(n)), key=lambda s: s[1])
ends = [r for _, r in segs]
dp = [0] * (n + 1)
for i, (l, r) in enumerate(segs):
    j = bisect_right(ends, l, 0, i)
    dp[i + 1] = max(dp[i], dp[j] + 1)
print(dp[n])
```

# skill: majority
title: Элемент большинства
topics: Списки; Подсчёт
match: MAJORITY
priority: 2.6
input: list
input_desc: Одна строка: числа.
output_desc: Элемент, встречающийся больше n/2 раз, или NO.
understood: Дан массив. Найти элемент, который встречается больше половины раз.
algorithm: Голосование Бойера–Мура
why: Пары различных элементов «взаимно уничтожаются»; элемент большинства остаётся кандидатом. Затем проверяем кандидата подсчётом.
ideas: Алгоритм голосования; Проверка кандидата
structures: list
links: algo:boyer-moore-voting, lib:collections.Counter
edge: Элемента большинства может не быть — нужен второй проход.
sample: 2 2 1 1 1 2 2 => 2
sample: 1 2 3 => NO
sample: 5 => 5

## Голосование Бойера–Мура
approach: voting
role: efficient
time: O(n)
memory: O(1)
idea: Счётчик растёт для кандидата и уменьшается для других; при нуле меняем кандидата.
principle: Если большинство существует, оно останется кандидатом; проверяем это подсчётом.
pros: O(1) памяти
cons: Нужна проверка
when: Для огромных потоков данных.
readability: 3
```python
a = input().split()
candidate, count = None, 0
for x in a:
    if count == 0:
        candidate = x
    count += 1 if x == candidate else -1
print(candidate if a.count(candidate) * 2 > len(a) else "NO")
```

## Counter
approach: counter
role: short
time: O(n)
memory: O(n)
idea: Самый частый элемент и проверка его частоты.
principle: most_common(1).
pros: Коротко
cons: Память O(n)
when: Обычно.
readability: 5
```python
from collections import Counter

a = input().split()
value, freq = Counter(a).most_common(1)[0]
print(value if freq * 2 > len(a) else "NO")
```

## Сортировка
approach: sort
role: alternative
time: O(n log n)
memory: O(n)
idea: Если большинство есть, оно стоит в середине отсортированного массива.
principle: Элемент, занимающий больше половины позиций, обязательно покрывает индекс n // 2.
pros: Красивое наблюдение
cons: O(n log n), нужна проверка
when: Как идея для доказательств.
readability: 4
```python
a = input().split()
mid = sorted(a)[len(a) // 2]
print(mid if a.count(mid) * 2 > len(a) else "NO")
```

# skill: element_frequency
title: Сколько раз встречается каждый элемент
topics: Списки; Словари; Подсчёт
match: (EACH | FREQUENCY) & (LIST | ELEMENT | NUMBER) & (COUNT | OCCURRENCE | FREQUENCY) & !MOST_FREQUENT & !CHAR & !LETTER & !WORD & !STRING & !DIGIT & !UNIQUE & !DIVISOR
priority: 2.3
input: list
input_desc: Одна строка: целые числа через пробел.
output_desc: Для каждого значения в порядке первого появления — строка «значение количество».
understood: Дан список чисел. Посчитать, сколько раз встречается каждое значение (в порядке первого появления).
algorithm: Подсчёт частот словарём
why: Один проход заполняет словарь «значение → количество»; порядок ключей совпадает с порядком первого появления.
ideas: dict.get(x, 0) + 1; collections.Counter; a.count(x) для различных значений
structures: list, dict
links: lib:collections.Counter, py:method:dict.get, py:method:list.count, algo:hashing
edge: Все элементы различны — у каждого количество 1.
edge: Отрицательные числа и ноль считаются так же, как остальные.
sample: 1 3 2 3 1 3 => 1 2\n3 3\n2 1
sample: 5 => 5 1
sample: -1 0 -1 => -1 2\n0 1

## Словарь вручную
approach: dict
role: beginner
time: O(n)
memory: O(k), k — число различных значений
idea: Для каждого элемента увеличиваем его счётчик в словаре.
principle: count.get(x, 0) + 1 — текущее количество плюс один; словарь хранит ключи в порядке вставки.
pros: Понятно новичку; Один проход
cons: Длиннее Counter
when: Для обучения.
readability: 5
```python
a = list(map(int, input().split()))
count = {}
for x in a:
    count[x] = count.get(x, 0) + 1
for x, c in count.items():
    print(x, c)
```

## collections.Counter
approach: counter
role: short
time: O(n)
memory: O(k)
idea: Counter(a) строит словарь частот одной строкой.
principle: Counter — словарь «значение → количество» с порядком первого появления.
pros: Коротко; Есть most_common и арифметика счётчиков
cons: Нужен импорт
when: Обычно.
readability: 5
```python
from collections import Counter

a = list(map(int, input().split()))
for x, c in Counter(a).items():
    print(x, c)
```

## list.count для различных значений
approach: list-count
role: alternative
time: O(n·k)
memory: O(n)
idea: dict.fromkeys(a) даёт различные значения по порядку, a.count(x) — их количество.
principle: Каждый a.count(x) — отдельный проход по списку.
pros: Очень читаемо
cons: O(n·k) — медленно, если различных значений много
when: Для небольших списков.
readability: 5
```python
a = list(map(int, input().split()))
for x in dict.fromkeys(a):
    print(x, a.count(x))
```

# skill: dedupe_list
title: Удалить повторы из списка с сохранением порядка
topics: Списки; Множества
match: DUPLICATE & REMOVE & !STRING & !CHAR & !LETTER & !WORD
boost: LIST, ELEMENT, NUMBER
priority: 2.3
input: list
input_desc: Одна строка: целые числа через пробел.
output_desc: Элементы без повторов (остаётся первое вхождение), через пробел.
understood: Дан список. Удалить повторяющиеся элементы, оставив первое вхождение каждого и сохранив порядок.
algorithm: Множество просмотренных элементов
why: Проверка «уже встречалось?» по множеству выполняется за O(1), поэтому весь проход — O(n).
ideas: set seen + список результата; dict.fromkeys; sorted(set(a), key=a.index)
structures: list, set, dict
links: py:builtin:set, py:method:dict.fromkeys, py:method:list.index, py:topic:sets
edge: Порядок сохраняется: set(a) без дополнительных шагов порядок не гарантирует.
edge: Все элементы равны — остаётся один.
sample: 1 2 2 3 1 => 1 2 3
sample: 5 5 5 => 5
sample: 3 -1 3 0 -1 => 3 -1 0
sample: 7 => 7

## Множество seen
approach: seen-set
role: efficient
time: O(n)
memory: O(n)
idea: Идём по списку и добавляем элемент в ответ, только если его ещё нет в множестве seen.
principle: Проверка x in seen для множества — O(1) в среднем (хеш-таблица), поэтому весь проход линейный.
pros: O(n); Легко добавить своё условие уникальности (например, по ключу)
cons: Несколько строк
when: Для больших списков и когда важен понятный алгоритм.
readability: 5
```python
a = list(map(int, input().split()))
seen = set()
result = []
for x in a:
    if x not in seen:
        seen.add(x)
        result.append(x)
print(*result)
```

## dict.fromkeys
approach: fromkeys
role: short
time: O(n)
memory: O(n)
idea: Ключи словаря уникальны и хранятся в порядке вставки (Python 3.7+).
principle: dict.fromkeys(a) оставляет первое вхождение каждого значения; распаковка печатает ключи.
pros: Одна строка; O(n)
cons: Неочевидно для новичка
when: По умолчанию в коротких решениях.
readability: 4
python: 3.7
```python
a = list(map(int, input().split()))
print(*dict.fromkeys(a))
```

## Проверка «нет ли уже в ответе»
approach: not-in-list
role: beginner
time: O(n²)
memory: O(n)
idea: Добавляем элемент, если его ещё нет в списке результата.
principle: x not in result просматривает список result целиком, поэтому в худшем случае O(n²).
pros: Без множеств и словарей; Работает и для нехешируемых элементов (списков)
cons: Квадратичное время
when: Для небольших списков и элементов, которые нельзя положить в set.
readability: 5
```python
a = list(map(int, input().split()))
result = []
for x in a:
    if x not in result:
        result.append(x)
print(*result)
```

## sorted(set(a), key=a.index)
approach: set-index
role: alternative
time: O(n·k)
memory: O(n)
idea: set убирает повторы, а сортировка по индексу первого вхождения возвращает исходный порядок.
principle: a.index(x) — позиция первого вхождения x; сортировка по ней восстанавливает порядок. Каждый index — проход по списку.
pros: Одна строка; Показывает приём «сортировка по ключу»
cons: O(n·k) из-за a.index
when: Для небольших списков.
readability: 3
```python
a = list(map(int, input().split()))
print(*sorted(set(a), key=a.index))
```
