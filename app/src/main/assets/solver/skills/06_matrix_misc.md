# Solver skills: matrices, recursion and combinatorics, dates, geometry, stacks/queues.

# skill: matrix_diagonal_sum
title: Сумма элементов диагонали матрицы
topics: Матрицы
match: DIAGONAL & MATRIX & !SYMMETRIC
boost: SUM
priority: 2.4
param: WHICH = 1 if SECONDARY else 0
param: NAME = побочной if SECONDARY else главной
input_desc: Первая строка: n. Далее n строк по n чисел (квадратная матрица).
output_desc: Сумма элементов {NAME} диагонали.
understood: Дана квадратная матрица n × n. Найти сумму элементов {NAME} диагонали.
algorithm: Обход диагонали по индексам
why: Главная диагональ — элементы a[i][i], побочная — a[i][n − 1 − i]. Всего n элементов.
ideas: a[i][i]; a[i][n − 1 − i]; Генератор sum(...)
structures: list[list]
links: algo:matrices, py:builtin:sum
edge: n = 1 — один элемент.
sample: 3\n1 2 3\n4 5 6\n7 8 9
sample: 1\n5
sample: 2\n1 -2\n-3 4

## Цикл по индексу
approach: loop
role: beginner
time: O(n)
memory: O(n²) на хранение матрицы
idea: Перебираем i и берём элемент диагонали в строке i.
principle: Для главной диагонали столбец равен строке, для побочной — n − 1 − i.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
total = 0
for i in range(n):
    j = i if {WHICH} == 0 else n - 1 - i
    total += a[i][j]
print(total)
```

## sum по генератору
approach: sum
role: short
time: O(n)
memory: O(n²)
idea: Одно выражение суммы по диагонали.
principle: sum(a[i][…] for i in range(n)).
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
print(sum(a[i][i] if {WHICH} == 0 else a[i][n - 1 - i] for i in range(n)))
```

## Чтение без хранения матрицы
approach: stream
role: efficient
time: O(n²) на чтение
memory: O(n)
idea: Берём нужный элемент сразу при чтении строки.
principle: Строку i используем только чтобы взять один элемент.
pros: Не хранит всю матрицу
cons: —
when: Для огромных матриц.
readability: 4
```python
n = int(input())
total = 0
for i in range(n):
    row = input().split()
    total += int(row[i] if {WHICH} == 0 else row[n - 1 - i])
print(total)
```

# skill: transpose
title: Транспонирование матрицы
topics: Матрицы
match: TRANSPOSE
priority: 2.6
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: Транспонированная матрица m × n (строки становятся столбцами).
understood: Дана матрица n × m. Вывести транспонированную матрицу.
algorithm: Обмен индексов
why: Элемент b[j][i] = a[i][j].
ideas: zip(*a); Вложенные генераторы
structures: list[list]
links: algo:matrices, py:builtin:zip
edge: Матрица из одной строки превращается в столбец.
sample: 2 3\n1 2 3\n4 5 6 => 1 4\n2 5\n3 6
sample: 1 1\n7 => 7

## zip(*a)
approach: zip
role: short
time: O(n·m)
memory: O(n·m)
idea: zip склеивает i-е элементы всех строк — это и есть столбцы.
principle: *a передаёт строки как отдельные аргументы zip.
pros: Одна строка
cons: Неочевидно новичку
when: Обычно.
readability: 4
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
for column in zip(*a):
    print(*column)
```

## Вложенные циклы
approach: loops
role: beginner
time: O(n·m)
memory: O(n·m)
idea: Строка j результата — это j-й столбец исходной матрицы.
principle: b[j][i] = a[i][j].
pros: Понятно
cons: —
when: Для обучения.
readability: 5
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
for j in range(m):
    row = []
    for i in range(n):
        row.append(a[i][j])
    print(*row)
```

## Генератор списков
approach: comprehension
role: alternative
time: O(n·m)
memory: O(n·m)
idea: Вложенный генератор строит матрицу результата.
principle: [[a[i][j] for i in range(n)] for j in range(m)].
pros: Результат сразу в виде матрицы
cons: —
when: Когда матрица нужна дальше.
readability: 4
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
b = [[a[i][j] for i in range(n)] for j in range(m)]
for row in b:
    print(*row)
```

# skill: matrix_row_sums
title: Сумма каждой строки матрицы
topics: Матрицы
match: MATRIX & SUM & (ROW | EACH | STRING) & !COLUMN & !DIAGONAL & !PATH
priority: 2.3
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: n чисел — суммы строк.
understood: Дана матрица n × m. Для каждой строки вывести сумму её элементов.
algorithm: Сумма по строкам
why: sum(row) для каждой строки.
ideas: map(sum, a); Цикл по строкам
structures: list[list]
links: algo:matrices, py:builtin:sum
edge: Отрицательные элементы.
sample: 2 3\n1 2 3\n4 5 6 => 6 15
sample: 1 1\n-5 => -5

## sum для каждой строки
approach: loop
role: beginner
time: O(n·m)
memory: O(m)
idea: Читаем строку и сразу считаем её сумму.
principle: Матрицу целиком хранить не нужно.
pros: Просто
cons: —
when: Обычно.
readability: 5
```python
n, m = map(int, input().split())
result = []
for _ in range(n):
    result.append(sum(map(int, input().split())))
print(*result)
```

## map(sum, a)
approach: map
role: short
time: O(n·m)
memory: O(n·m)
idea: sum применяется к каждой строке.
principle: map возвращает ленивый итератор сумм.
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
print(*map(sum, a))
```

## Вложенный цикл
approach: nested
role: alternative
time: O(n·m)
memory: O(n·m)
idea: Суммируем элементы строки вручную.
principle: s += a[i][j].
pros: Показывает индексы
cons: Длиннее
when: Для обучения.
readability: 5
```python
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
sums = []
for i in range(n):
    s = 0
    for j in range(m):
        s += a[i][j]
    sums.append(s)
print(*sums)
```

# skill: matrix_col_sums
title: Сумма каждого столбца матрицы
topics: Матрицы
match: MATRIX & SUM & COLUMN
priority: 2.5
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: m чисел — суммы столбцов.
understood: Дана матрица n × m. Для каждого столбца вывести сумму его элементов.
algorithm: Сумма по столбцам
why: Столбцы получаются транспонированием zip(*a).
ideas: zip(*a); Накопление в массиве сумм
structures: list[list]
links: algo:matrices, py:builtin:zip
edge: Одна строка — суммы равны элементам.
sample: 2 3\n1 2 3\n4 5 6 => 5 7 9
sample: 3 1\n1\n2\n3 => 6

## zip(*a)
approach: zip
role: short
time: O(n·m)
memory: O(n·m)
idea: Столбцы — это zip строк.
principle: sum по каждому кортежу-столбцу.
pros: Коротко
cons: —
when: Обычно.
readability: 4
```python
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
print(*[sum(col) for col in zip(*a)])
```

## Массив сумм
approach: acc
role: beginner
time: O(n·m)
memory: O(m)
idea: sums[j] накапливает сумму j-го столбца при чтении строк.
principle: Матрицу хранить не нужно.
pros: O(m) памяти
cons: —
when: Для больших матриц.
readability: 5
```python
n, m = map(int, input().split())
sums = [0] * m
for _ in range(n):
    row = list(map(int, input().split()))
    for j in range(m):
        sums[j] += row[j]
print(*sums)
```

# skill: matrix_multiply
title: Умножение матриц
topics: Матрицы; Линейная алгебра
match: MATRIX & PRODUCT & (TWO | MATRIX)
avoid: DIAGONAL, ROW, COLUMN
priority: 2.3
input_desc: Первая строка: n m p. Далее n строк по m чисел (матрица A), затем m строк по p чисел (матрица B).
output_desc: Матрица C = A · B размером n × p.
understood: Даны матрицы A (n × m) и B (m × p). Найти их произведение C = A · B.
algorithm: Тройной цикл
why: C[i][j] = Σ A[i][k] · B[k][j] — скалярное произведение строки A и столбца B.
ideas: Скалярное произведение; zip(*B) — столбцы B
structures: list[list]
links: algo:matrices, py:builtin:zip
edge: Число столбцов A должно равняться числу строк B.
sample: 2 2 2\n1 2\n3 4\n5 6\n7 8 => 19 22\n43 50
sample: 1 3 1\n1 2 3\n4\n5\n6 => 32

## Тройной цикл
approach: loops
role: beginner
time: O(n·m·p)
memory: O(n·p)
idea: Для каждой пары (i, j) считаем сумму произведений.
principle: Классическое определение.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
n, m, p = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
b = [list(map(int, input().split())) for _ in range(m)]
for i in range(n):
    row = []
    for j in range(p):
        s = 0
        for k in range(m):
            s += a[i][k] * b[k][j]
        row.append(s)
    print(*row)
```

## zip столбцов
approach: zip
role: short
time: O(n·m·p)
memory: O(n·p)
idea: Скалярное произведение строки A и столбца B через zip.
principle: zip(*b) — столбцы B; sum(x * y for x, y in zip(row, col)).
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
n, m, p = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
b = [list(map(int, input().split())) for _ in range(m)]
cols = list(zip(*b))
for row in a:
    print(*[sum(x * y for x, y in zip(row, col)) for col in cols])
```

## Порядок циклов i-k-j
approach: ikj
role: efficient
time: O(n·m·p)
memory: O(n·p)
idea: Меняем порядок циклов, чтобы во внутреннем цикле идти по строке B.
principle: Последовательный доступ к памяти — быстрее на практике.
pros: Быстрее на больших матрицах
cons: Неочевидно
when: Для больших матриц.
readability: 3
```python
n, m, p = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
b = [list(map(int, input().split())) for _ in range(m)]
c = [[0] * p for _ in range(n)]
for i in range(n):
    ci = c[i]
    for k in range(m):
        aik = a[i][k]
        bk = b[k]
        for j in range(p):
            ci[j] += aik * bk[j]
for row in c:
    print(*row)
```

# skill: spiral
title: Обход матрицы по спирали
topics: Матрицы; Симуляция
match: SPIRAL
priority: 2.7
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: Элементы матрицы в порядке обхода по спирали по часовой стрелке, начиная с левого верхнего.
understood: Дана матрица n × m. Вывести её элементы по спирали (по часовой стрелке).
algorithm: Сужающиеся границы
why: Обходим верхнюю строку, правый столбец, нижнюю строку, левый столбец и сдвигаем границы внутрь.
ideas: Четыре границы top/bottom/left/right; Поворот матрицы
structures: list[list]
links: algo:matrices, algo:simulation
edge: Одна строка или один столбец.
sample: 3 3\n1 2 3\n4 5 6\n7 8 9 => 1 2 3 6 9 8 7 4 5
sample: 3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12 => 1 2 3 4 8 12 11 10 9 5 6 7
sample: 1 3\n1 2 3 => 1 2 3

## Четыре границы
approach: bounds
role: beginner
time: O(n·m)
memory: O(n·m)
idea: Проходим периметр текущей «рамки» и сужаем её.
principle: Проверки top ≤ bottom и left ≤ right нужны, чтобы не пройти строку/столбец дважды.
pros: Понятно и эффективно
cons: Легко ошибиться в границах
when: Обычно.
readability: 4
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
top, bottom, left, right = 0, n - 1, 0, m - 1
result = []
while top <= bottom and left <= right:
    for j in range(left, right + 1):
        result.append(a[top][j])
    top += 1
    for i in range(top, bottom + 1):
        result.append(a[i][right])
    right -= 1
    if top <= bottom:
        for j in range(right, left - 1, -1):
            result.append(a[bottom][j])
        bottom -= 1
    if left <= right:
        for i in range(bottom, top - 1, -1):
            result.append(a[i][left])
        left += 1
print(*result)
```

## Срезать строку и повернуть
approach: rotate
role: pythonic
time: O(n·m · min(n, m))
memory: O(n·m)
idea: Берём первую строку, остаток поворачиваем против часовой стрелки и повторяем.
principle: list(zip(*a))[::-1] — поворот на 90° против часовой стрелки.
pros: Очень коротко
cons: Медленнее из-за поворотов
when: Для небольших матриц.
readability: 3
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
result = []
while a:
    result.extend(a.pop(0))
    a = [list(row) for row in zip(*a)][::-1]
print(*result)
```

## Симуляция направлений
approach: directions
role: alternative
time: O(n·m)
memory: O(n·m)
idea: Идём вперёд, а при упоре в край или посещённую клетку поворачиваем направо.
principle: Направления (0,1), (1,0), (0,−1), (−1,0) по кругу.
pros: Обобщается на другие обходы
cons: Нужна матрица посещений
when: Для задач-симуляций.
readability: 4
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
seen = [[False] * m for _ in range(n)]
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
i = j = d = 0
result = []
for _ in range(n * m):
    result.append(a[i][j])
    seen[i][j] = True
    ni, nj = i + dirs[d][0], j + dirs[d][1]
    if not (0 <= ni < n and 0 <= nj < m) or seen[ni][nj]:
        d = (d + 1) % 4
        ni, nj = i + dirs[d][0], j + dirs[d][1]
    i, j = ni, nj
print(*result)
```

# skill: rotate_matrix
title: Поворот матрицы на 90°
topics: Матрицы
match: ROTATE & MATRIX
priority: 2.6
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: Матрица, повёрнутая на 90° по часовой стрелке (m строк по n чисел).
understood: Дана матрица n × m. Повернуть её на 90° по часовой стрелке.
algorithm: Транспонирование + разворот строк
why: Поворот по часовой = развернуть порядок строк и транспонировать: b[j][i] = a[n − 1 − i][j].
ideas: zip(*a[::-1]); Индексная формула
structures: list[list]
links: algo:matrices, py:builtin:zip
edge: Неквадратная матрица меняет размеры.
sample: 2 3\n1 2 3\n4 5 6 => 4 1\n5 2\n6 3
sample: 1 1\n9 => 9

## zip(*a[::-1])
approach: zip
role: short
time: O(n·m)
memory: O(n·m)
idea: Развернуть строки и транспонировать.
principle: Первая строка результата — первый столбец снизу вверх.
pros: Одна строка
cons: Неочевидно
when: Обычно.
readability: 4
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
for row in zip(*a[::-1]):
    print(*row)
```

## Индексная формула
approach: index
role: beginner
time: O(n·m)
memory: O(n·m)
idea: b[j][i] = a[n − 1 − i][j].
principle: Явные индексы.
pros: Понятно
cons: —
when: Для обучения.
readability: 5
```python
n, m = map(int, input().split())
a = [input().split() for _ in range(n)]
for j in range(m):
    print(*[a[n - 1 - i][j] for i in range(n)])
```

# skill: symmetric_matrix
title: Симметрична ли матрица
topics: Матрицы
match: SYMMETRIC & MATRIX
priority: 2.6
input_desc: Первая строка: n. Далее n строк по n чисел.
output_desc: YES, если a[i][j] = a[j][i] для всех i, j, иначе NO.
understood: Дана квадратная матрица. Проверить, симметрична ли она относительно главной диагонали.
algorithm: Сравнение с транспонированной
why: Матрица симметрична, если совпадает со своей транспонированной.
ideas: a[i][j] == a[j][i]; Достаточно проверить элементы выше диагонали
structures: list[list]
links: algo:matrices, py:builtin:all
edge: n = 1 — симметрична.
sample: 3\n1 2 3\n2 5 6\n3 6 9 => YES
sample: 2\n1 2\n3 4 => NO
sample: 1\n7 => YES

## Проверка над диагональю
approach: loop
role: beginner
time: O(n²)
memory: O(n²)
idea: Сравниваем a[i][j] и a[j][i] для j > i.
principle: Элементы на диагонали сравнивать не нужно.
pros: Ранний выход
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
a = [input().split() for _ in range(n)]
ok = all(a[i][j] == a[j][i] for i in range(n) for j in range(i + 1, n))
print("YES" if ok else "NO")
```

## Сравнение с zip(*a)
approach: zip
role: short
time: O(n²)
memory: O(n²)
idea: Транспонированная матрица должна совпасть с исходной.
principle: list(zip(*a)) — столбцы как кортежи; сравниваем с кортежами строк.
pros: Коротко
cons: Строит транспонированную целиком
when: Для краткости.
readability: 4
```python
n = int(input())
a = [tuple(input().split()) for _ in range(n)]
print("YES" if list(zip(*a)) == a else "NO")
```

# skill: matrix_row_max
title: Максимум в каждой строке матрицы
topics: Матрицы
match: MATRIX & (MAX | MIN) & (ROW | EACH | STRING) & !PATH & !SUM
priority: 2.4
param: FN = min if MIN else max
input_desc: Первая строка: n m. Далее n строк по m чисел.
output_desc: n чисел — {FN} каждой строки.
understood: Дана матрица n × m. Для каждой строки найти {FN} её элементов.
algorithm: {FN} по каждой строке
why: Встроенная функция {FN} к каждой строке.
ideas: map({FN}, a)
structures: list[list]
links: py:builtin:{FN}, algo:matrices
edge: Одна строка.
sample: 2 3\n1 5 3\n-4 -2 -9
sample: 1 1\n7

## {FN} по строкам
approach: loop
role: beginner
time: O(n·m)
memory: O(m)
idea: Читаем строку и сразу берём {FN}.
principle: Матрица не хранится целиком.
pros: Просто
cons: —
when: Обычно.
readability: 5
```python
n, m = map(int, input().split())
result = []
for _ in range(n):
    result.append({FN}(map(int, input().split())))
print(*result)
```

## map
approach: map
role: short
time: O(n·m)
memory: O(n·m)
idea: map({FN}, a).
principle: {FN} применяется к каждой строке-списку.
pros: Коротко
cons: —
when: Для краткости.
readability: 4
```python
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
print(*map({FN}, a))
```

# skill: hanoi
title: Ханойская башня
topics: Рекурсия
match: HANOI
priority: 2.8
input: n
input_desc: Одна строка: число дисков n (1 ≤ n ≤ 10).
output_desc: Последовательность ходов «откуда куда» (стержни 1, 2, 3), переносящая башню с 1 на 3; всего 2ⁿ − 1 ходов.
understood: Перенести башню из n дисков со стержня 1 на стержень 3 (большой диск нельзя класть на меньший). Вывести ходы.
algorithm: Рекурсия
why: Перенести n дисков = перенести n−1 на вспомогательный, переложить нижний, перенести n−1 на целевой. Всего 2ⁿ − 1 ходов — это минимум.
ideas: hanoi(n) = hanoi(n−1) + ход + hanoi(n−1); Число ходов 2ⁿ − 1
structures: —
links: algo:hanoi, py:topic:recursion
edge: n = 1: один ход «1 3».
sample: 1 => 1 3
sample: 2 => 1 2\n1 3\n2 3
sample: 3 => 1 3\n1 2\n3 2\n1 3\n2 1\n2 3\n1 3

## Рекурсия
approach: recursion
role: beginner
time: O(2ⁿ)
memory: O(n) — стек
idea: Сводим задачу для n дисков к задаче для n − 1.
principle: hanoi(n, a, b, c): перенести n−1 с a на c (через b)… точнее: с a на b через c, затем ход a → c, затем с b на c через a.
pros: Классический пример рекурсии
cons: Экспоненциальное число ходов неизбежно
when: Всегда.
readability: 5
```python
def hanoi(n, src, dst, tmp):
    if n == 0:
        return
    hanoi(n - 1, src, tmp, dst)
    print(src, dst)
    hanoi(n - 1, tmp, dst, src)


hanoi(int(input()), 1, 3, 2)
```

## Итеративный алгоритм по битам
approach: bits
role: alternative
time: O(2ⁿ)
memory: O(1)
idea: Ход номер i переносит диск со стержня (i & (i−1)) % 3 на ((i | (i−1)) + 1) % 3.
principle: Формула перемещает башню со стержня 0 на 2 при нечётном n и на 1 при чётном, поэтому для чётного n меняем местами метки стержней 2 и 3.
pros: Без рекурсии
cons: Магическая формула
when: Как головоломка.
readability: 2
```python
n = int(input())
names = [1, 2, 3] if n % 2 == 1 else [1, 3, 2]
for i in range(1, 1 << n):
    print(names[(i & (i - 1)) % 3], names[((i | (i - 1)) + 1) % 3])
```

## Явный стек
approach: stack
role: alternative
time: O(2ⁿ)
memory: O(n)
idea: Имитируем рекурсию стеком задач.
principle: Задача (n, src, dst, tmp) раскладывается в обратном порядке: сначала кладём последнюю подзадачу.
pros: Показывает, как устроена рекурсия
cons: Больше кода
when: Для понимания стека вызовов.
readability: 3
```python
n = int(input())
stack = [(n, 1, 3, 2)]
while stack:
    k, src, dst, tmp = stack.pop()
    if k == 0:
        continue
    if k < 0:
        print(src, dst)
        continue
    stack.append((k - 1, tmp, dst, src))
    stack.append((-1, src, dst, tmp))
    stack.append((k - 1, src, tmp, dst))
```

# skill: permutations_print
title: Все перестановки
topics: Перебор; Рекурсия; Комбинаторика
match: PERMUTATION & !COUNT & !COMBINATION
priority: 2.5
input: n
input_desc: Одна строка: n (1 ≤ n ≤ 7).
output_desc: Все перестановки чисел 1..n в лексикографическом порядке, каждая на отдельной строке.
understood: Дано n. Вывести все перестановки чисел от 1 до n в лексикографическом порядке.
algorithm: Перебор с возвратом (backtracking)
why: На каждой позиции перебираем ещё не использованные числа по возрастанию — так порядок получается лексикографическим. Всего n! перестановок.
ideas: itertools.permutations; Рекурсия с массивом used; Алгоритм следующей перестановки
structures: list
links: algo:backtracking, lib:itertools.permutations, algo:next-permutation
edge: n = 1: одна перестановка.
sample: 3 => 1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1
sample: 1 => 1

## itertools.permutations
approach: itertools
role: short
time: O(n! · n)
memory: O(n)
idea: Готовый генератор перестановок.
principle: Для отсортированного входа порядок лексикографический.
pros: Одна строка
cons: —
when: Обычно.
readability: 5
```python
from itertools import permutations

n = int(input())
for p in permutations(range(1, n + 1)):
    print(*p)
```

## Рекурсивный перебор
approach: backtracking
role: beginner
time: O(n! · n)
memory: O(n)
idea: Строим перестановку по одной позиции, отмечая использованные числа.
principle: Добавили число → рекурсия → убрали (возврат).
pros: Основа всех переборов
cons: Больше кода
when: Для изучения backtracking.
readability: 4
```python
n = int(input())
used = [False] * (n + 1)
current = []


def go():
    if len(current) == n:
        print(*current)
        return
    for x in range(1, n + 1):
        if not used[x]:
            used[x] = True
            current.append(x)
            go()
            current.pop()
            used[x] = False


go()
```

## Следующая перестановка
approach: next-perm
role: alternative
time: O(n! · n)
memory: O(n)
idea: Из текущей перестановки получаем следующую в лексикографическом порядке.
principle: Найти самый правый i с p[i] < p[i+1], обменять p[i] с наименьшим большим справа, развернуть хвост.
pros: Не нужна рекурсия; работает и с повторами
cons: Нужно знать алгоритм
when: Когда нужно перебирать перестановки по одной.
readability: 3
```python
n = int(input())
p = list(range(1, n + 1))
while True:
    print(*p)
    i = n - 2
    while i >= 0 and p[i] >= p[i + 1]:
        i -= 1
    if i < 0:
        break
    j = n - 1
    while p[j] <= p[i]:
        j -= 1
    p[i], p[j] = p[j], p[i]
    p[i + 1:] = reversed(p[i + 1:])
```

# skill: subsets_print
title: Все подмножества
topics: Перебор; Битовые маски
match: SUBSET & (PRINT | ALL | EACH) & !SUM
priority: 2.5
input: n
input_desc: Одна строка: n (1 ≤ n ≤ 10).
output_desc: Все подмножества {1..n} по возрастанию размера, внутри размера — в лексикографическом порядке; пустое подмножество — пустая строка.
understood: Дано n. Вывести все подмножества множества {1, …, n}.
algorithm: Перебор подмножеств
why: Подмножеств 2ⁿ; их можно перечислить битовыми масками или сочетаниями по размерам.
ideas: Битовые маски 0..2ⁿ−1; itertools.combinations; Рекурсия «взять / не взять»
structures: list
links: algo:bitmasks, lib:itertools.combinations, algo:backtracking
edge: Пустое подмножество тоже считается.
sample: 2 => \n1\n2\n1 2
sample: 1 => \n1

## combinations по размерам
approach: combinations
role: short
time: O(2ⁿ · n)
memory: O(n)
idea: Для каждого k выводим все сочетания из n по k.
principle: combinations выдаёт сочетания в лексикографическом порядке.
pros: Порядок получается автоматически
cons: —
when: Обычно.
readability: 5
```python
from itertools import combinations

n = int(input())
for k in range(n + 1):
    for c in combinations(range(1, n + 1), k):
        print(*c)
```

## Битовые маски
approach: bitmask
role: alternative
time: O(2ⁿ · n)
memory: O(2ⁿ · n)
idea: Маска от 0 до 2ⁿ − 1: бит i означает «элемент i + 1 входит».
principle: Собираем все подмножества и сортируем по (размер, элементы).
pros: Главный инструмент перебора подмножеств
cons: Нужна сортировка для требуемого порядка
when: Когда порядок не важен — без сортировки.
readability: 4
```python
n = int(input())
subsets = []
for mask in range(1 << n):
    subsets.append([i + 1 for i in range(n) if mask >> i & 1])
subsets.sort(key=lambda s: (len(s), s))
for s in subsets:
    print(*s)
```

## Рекурсия «взять / не взять»
approach: recursion
role: beginner
time: O(2ⁿ · n)
memory: O(2ⁿ · n)
idea: Для каждого элемента решаем: включить или нет.
principle: Дерево решений глубины n имеет 2ⁿ листьев — по одному на подмножество.
pros: Наглядно
cons: Нужна сортировка для порядка
when: Для обучения.
readability: 4
```python
n = int(input())
result = []


def go(i, current):
    if i > n:
        result.append(current[:])
        return
    current.append(i)
    go(i + 1, current)
    current.pop()
    go(i + 1, current)


go(1, [])
result.sort(key=lambda s: (len(s), s))
for s in result:
    print(*s)
```

# skill: combinations_print
title: Все сочетания из n по k
topics: Перебор; Комбинаторика
match: COMBINATION & (PRINT | ALL | EACH)
priority: 2.6
input: n k
input_desc: Одна строка: n и k.
output_desc: Все k-элементные подмножества {1..n} в лексикографическом порядке.
understood: Даны n и k. Вывести все сочетания из n чисел 1..n по k в лексикографическом порядке.
algorithm: Перебор с возвратом
why: Числа в сочетании идут по возрастанию; следующий элемент выбираем правее предыдущего.
ideas: itertools.combinations; Рекурсия со стартовой позицией
structures: list
links: algo:backtracking, lib:itertools.combinations
edge: k = 0 — одна пустая строка; k > n — ничего.
sample: 4 2 => 1 2\n1 3\n1 4\n2 3\n2 4\n3 4
sample: 3 3 => 1 2 3

## itertools.combinations
approach: itertools
role: short
time: O(C(n,k) · k)
memory: O(k)
idea: Готовая функция.
principle: Лексикографический порядок для отсортированного входа.
pros: Одна строка
cons: —
when: Обычно.
readability: 5
```python
from itertools import combinations

n, k = map(int, input().split())
for c in combinations(range(1, n + 1), k):
    print(*c)
```

## Рекурсия
approach: backtracking
role: beginner
time: O(C(n,k) · k)
memory: O(k)
idea: Добавляем следующий элемент, начиная с позиции после предыдущего.
principle: go(start) перебирает x от start до n.
pros: Основа перебора
cons: —
when: Для изучения.
readability: 4
```python
n, k = map(int, input().split())
current = []


def go(start):
    if len(current) == k:
        print(*current)
        return
    for x in range(start, n + 1):
        current.append(x)
        go(x + 1)
        current.pop()


go(1)
```

# skill: n_queens
title: Расстановка n ферзей
topics: Перебор с возвратом
match: QUEEN
priority: 2.8
input: n
input_desc: Одна строка: n (1 ≤ n ≤ 9).
output_desc: Количество способов расставить n ферзей на доске n × n так, чтобы они не били друг друга.
understood: Дано n. Найти количество расстановок n ферзей на доске n × n без взаимных атак.
algorithm: Перебор с возвратом по строкам
why: В каждой строке ровно один ферзь; храним занятые столбцы и диагонали (r + c и r − c).
ideas: Диагонали r + c и r − c; Битовые маски
structures: set
links: algo:backtracking, algo:bitmasks
edge: n = 2 и n = 3 — решений нет.
sample: 4 => 2
sample: 1 => 1
sample: 8 => 92
sample: 3 => 0

## Перебор с множествами
approach: sets
role: beginner
time: O(n!)
memory: O(n)
idea: Ставим ферзя в строку r в свободный столбец, не на занятой диагонали.
principle: Множества cols, diag1 (r + c), diag2 (r − c).
pros: Понятно
cons: —
when: Обычно.
readability: 4
```python
n = int(input())
cols, d1, d2 = set(), set(), set()


def place(r):
    if r == n:
        return 1
    total = 0
    for c in range(n):
        if c in cols or r + c in d1 or r - c in d2:
            continue
        cols.add(c)
        d1.add(r + c)
        d2.add(r - c)
        total += place(r + 1)
        cols.remove(c)
        d1.remove(r + c)
        d2.remove(r - c)
    return total


print(place(0))
```

## Битовые маски
approach: bitmask
role: efficient
time: O(n!) с малой константой
memory: O(n)
idea: Занятые столбцы и диагонали храним битами; свободные позиции — одна операция.
principle: free = ~(cols | d1 | d2) & full; младший бит free — следующий столбец.
pros: Очень быстро
cons: Сложно читать
when: Для больших n.
readability: 2
```python
n = int(input())
full = (1 << n) - 1


def solve(cols, d1, d2):
    if cols == full:
        return 1
    total = 0
    free = ~(cols | d1 | d2) & full
    while free:
        bit = free & -free
        free -= bit
        total += solve(cols | bit, (d1 | bit) << 1 & full, (d2 | bit) >> 1)
    return total


print(solve(0, 0, 0))
```

## Перебор перестановок
approach: permutations
role: alternative
time: O(n! · n²)
memory: O(n)
idea: Ферзи в разных строках и столбцах — это перестановка; проверяем диагонали.
principle: Перестановка p: ферзь в строке r стоит в столбце p[r].
pros: Очень коротко
cons: Медленно
when: Для n ≤ 8.
readability: 4
```python
from itertools import permutations

n = int(input())
print(sum(1 for p in permutations(range(n))
          if len({r + c for r, c in enumerate(p)}) == n and len({r - c for r, c in enumerate(p)}) == n))
```

# skill: binary_strings
title: Все двоичные строки длины n
topics: Перебор
match: BINARY & (STRING | PRINT | ALL) & !NUMBER & !CONVERT & !DECIMAL & !COUNT
priority: 2.1
input: n
input_desc: Одна строка: n (1 ≤ n ≤ 12).
output_desc: Все строки из 0 и 1 длины n в порядке возрастания.
understood: Дано n. Вывести все двоичные строки длины n в порядке возрастания.
algorithm: Перебор чисел 0..2ⁿ − 1
why: Двоичные записи чисел от 0 до 2ⁿ − 1 с ведущими нулями — это все строки по возрастанию.
ideas: format(i, "0nb"); itertools.product
structures: str
links: lib:itertools.product, py:builtin:format
edge: n = 1: 0 и 1.
sample: 2 => 00\n01\n10\n11
sample: 1 => 0\n1

## format
approach: format
role: short
time: O(2ⁿ · n)
memory: O(n)
idea: Двоичная запись числа i с ведущими нулями.
principle: format(i, "03b") для n = 3.
pros: Коротко
cons: —
when: Обычно.
readability: 5
```python
n = int(input())
for i in range(2 ** n):
    print(format(i, "0{}b".format(n)))
```

## itertools.product
approach: product
role: pythonic
time: O(2ⁿ · n)
memory: O(n)
idea: Декартово произведение "01" на себя n раз.
principle: product("01", repeat=n) перебирает в лексикографическом порядке.
pros: Обобщается на любой алфавит
cons: —
when: Для других алфавитов.
readability: 5
```python
from itertools import product

n = int(input())
for p in product("01", repeat=n):
    print("".join(p))
```

## Рекурсия
approach: recursion
role: beginner
time: O(2ⁿ · n)
memory: O(n)
idea: Дописываем 0, затем 1 и рекурсивно продолжаем.
principle: Сначала ветка с 0 — порядок возрастающий.
pros: Показывает дерево перебора
cons: —
when: Для обучения.
readability: 5
```python
def go(prefix, n):
    if len(prefix) == n:
        print(prefix)
        return
    go(prefix + "0", n)
    go(prefix + "1", n)


go("", int(input()))
```

# skill: josephus
title: Задача Иосифа Флавия
topics: Очереди; Рекурсия
match: JOSEPHUS
priority: 2.8
input: n k
input_desc: Одна строка: n — число людей по кругу, k — шаг счёта.
output_desc: Номер (с 1) последнего оставшегося человека.
understood: n человек стоят по кругу; каждый k-й выбывает. Найти номер последнего оставшегося.
algorithm: Рекуррентная формула J(n) = (J(n−1) + k) mod n
why: После удаления первого человека задача сводится к n − 1 людям со сдвигом нумерации на k.
ideas: Рекуррента; Моделирование очередью deque
structures: int, deque
links: algo:josephus, lib:collections.deque
edge: n = 1 — ответ 1.
sample: 7 3 => 4
sample: 1 5 => 1
sample: 5 2 => 3
sample: 10 1 => 10

## Формула
approach: formula
role: efficient
time: O(n)
memory: O(1)
idea: Считаем позицию выжившего для 1, 2, …, n человек.
principle: r = (r + k) % i для i от 2 до n (нумерация с 0), ответ r + 1.
pros: Быстро
cons: Нужно понять рекурренту
when: Для больших n.
readability: 4
```python
n, k = map(int, input().split())
r = 0
for i in range(2, n + 1):
    r = (r + k) % i
print(r + 1)
```

## Моделирование deque
approach: deque
role: beginner
time: O(n · k)
memory: O(n)
idea: Вращаем круг на k − 1 и удаляем первого.
principle: deque.rotate(-(k - 1)) переносит k − 1 человек в конец.
pros: Прямое моделирование
cons: Медленнее
when: Когда нужен и порядок выбывания.
readability: 5
```python
from collections import deque

n, k = map(int, input().split())
circle = deque(range(1, n + 1))
while len(circle) > 1:
    circle.rotate(-(k - 1))
    circle.popleft()
print(circle[0])
```

## Список с индексом
approach: list
role: alternative
time: O(n²)
memory: O(n)
idea: Удаляем элемент с позиции (idx + k − 1) % len.
principle: pop(i) удаляет и сдвигает остальных.
pros: Понятно
cons: O(n²)
when: Для небольших n.
readability: 5
```python
n, k = map(int, input().split())
people = list(range(1, n + 1))
idx = 0
while len(people) > 1:
    idx = (idx + k - 1) % len(people)
    people.pop(idx)
print(people[0])
```

# skill: postfix_eval
title: Вычисление выражения в обратной польской записи
topics: Стек
match: POSTFIX
priority: 2.8
input_desc: Одна строка: числа и операции + - * через пробел в постфиксной записи.
output_desc: Значение выражения.
understood: Дано выражение в обратной польской (постфиксной) записи. Вычислить его значение.
algorithm: Стек
why: Числа кладём в стек; операция снимает два верхних числа и кладёт результат.
ideas: Стек; Порядок операндов для вычитания
structures: list (стек)
links: algo:stack, lib:operator
edge: Для вычитания порядок важен: a b - означает a − b.
sample: 2 3 + 4 * => 20
sample: 5 1 2 + 4 * + 3 - => 14
sample: 7 => 7

## Стек
approach: stack
role: beginner
time: O(n)
memory: O(n)
idea: Стек операндов.
principle: При операции: b = pop(), a = pop(), push(a op b).
pros: Классика
cons: —
when: Всегда.
readability: 5
```python
stack = []
for token in input().split():
    if token in "+-*":
        b = stack.pop()
        a = stack.pop()
        if token == "+":
            stack.append(a + b)
        elif token == "-":
            stack.append(a - b)
        else:
            stack.append(a * b)
    else:
        stack.append(int(token))
print(stack[0])
```

## Словарь операций
approach: operator
role: pythonic
time: O(n)
memory: O(n)
idea: Операции хранятся в словаре функций модуля operator.
principle: ops[token](a, b).
pros: Легко добавить операции
cons: —
when: Когда операций много.
readability: 4
```python
import operator

ops = {"+": operator.add, "-": operator.sub, "*": operator.mul}
stack = []
for token in input().split():
    if token in ops:
        b, a = stack.pop(), stack.pop()
        stack.append(ops[token](a, b))
    else:
        stack.append(int(token))
print(stack[0])
```

## Рекурсия справа налево
approach: recursion
role: alternative
time: O(n)
memory: O(n)
idea: Последний токен — операция корня; её правый и левый операнды вычисляются рекурсивно с конца.
principle: Читаем токены с конца: операция → сначала правый операнд, затем левый.
pros: Показывает дерево выражения
cons: Сложнее
when: Для понимания синтаксических деревьев.
readability: 3
```python
tokens = input().split()


def evaluate():
    token = tokens.pop()
    if token not in "+-*":
        return int(token)
    right = evaluate()
    left = evaluate()
    return left + right if token == "+" else left - right if token == "-" else left * right


print(evaluate())
```

# skill: day_of_week
title: День недели по дате
topics: Даты; Модуль datetime
match: WEEKDAY
priority: 2.8
input: d m y
input_desc: Одна строка: день, месяц, год.
output_desc: Название дня недели по-русски.
understood: Дана дата (день, месяц, год). Определить день недели.
algorithm: datetime.date.weekday или формула Зеллера
why: datetime знает григорианский календарь; формула Зеллера вычисляет то же арифметикой.
ideas: date(y, m, d).weekday(); Формула Зеллера
structures: datetime.date
links: lib:datetime, lib:calendar, algo:zeller
edge: Високосные годы и 29 февраля.
sample: 4 10 2026 => воскресенье
sample: 1 1 2000 => суббота
sample: 29 2 2024 => четверг

## datetime
approach: datetime
role: short
time: O(1)
memory: O(1)
idea: weekday() возвращает 0 для понедельника … 6 для воскресенья.
principle: Индекс в списке названий.
pros: Надёжно
cons: —
when: Обычно.
readability: 5
```python
from datetime import date

DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
d, m, y = map(int, input().split())
print(DAYS[date(y, m, d).weekday()])
```

## Формула Зеллера
approach: zeller
role: alternative
time: O(1)
memory: O(1)
idea: Январь и февраль считаются 13-м и 14-м месяцами прошлого года.
principle: h = (d + 13(m+1)/5 + K + K/4 + J/4 + 5J) mod 7, где 0 — суббота.
pros: Без библиотек
cons: Легко ошибиться
when: Если нельзя импортировать модули.
readability: 3
```python
NAMES = ["суббота", "воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница"]
d, m, y = map(int, input().split())
if m < 3:
    m += 12
    y -= 1
k, j = y % 100, y // 100
h = (d + 13 * (m + 1) // 5 + k + k // 4 + j // 4 + 5 * j) % 7
print(NAMES[h])
```

## calendar.weekday
approach: calendar
role: alternative
time: O(1)
memory: O(1)
idea: Функция модуля calendar.
principle: calendar.weekday(y, m, d) — тот же номер, что date.weekday().
pros: Коротко
cons: —
when: Для разнообразия.
readability: 5
```python
import calendar

DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
d, m, y = map(int, input().split())
print(DAYS[calendar.weekday(y, m, d)])
```

# skill: days_between
title: Количество дней между датами
topics: Даты
match: DAYS & (DATE | DIFF | RANGE) & !WEEKDAY
priority: 2.6
input_desc: Две строки: даты в формате «день месяц год».
output_desc: Количество дней между датами (по модулю).
understood: Даны две даты. Найти количество дней между ними.
algorithm: Разность дат
why: Вычитание объектов date даёт timedelta с полем days.
ideas: date2 − date1; Номер дня от начала эпохи
structures: datetime.date
links: lib:datetime
edge: Даты в обратном порядке — берём модуль.
sample: 1 1 2024\n1 3 2024 => 60
sample: 31 12 2023\n1 1 2024 => 1
sample: 5 5 2020\n5 5 2020 => 0

## datetime
approach: datetime
role: short
time: O(1)
memory: O(1)
idea: Разность объектов date.
principle: (b − a).days.
pros: Надёжно
cons: —
when: Обычно.
readability: 5
```python
from datetime import date

d1, m1, y1 = map(int, input().split())
d2, m2, y2 = map(int, input().split())
print(abs((date(y2, m2, d2) - date(y1, m1, d1)).days))
```

## Номер дня вручную
approach: manual
role: beginner
time: O(1)
memory: O(1)
idea: Переводим каждую дату в номер дня от условного начала и вычитаем.
principle: Сдвиг года так, чтобы март был первым месяцем — тогда високосный день в конце года (формула «дни от 0 марта 0 года»).
pros: Без библиотек
cons: Нужно знать формулу
when: Если datetime нельзя использовать.
readability: 3
```python
def day_number(d, m, y):
    if m < 3:
        y -= 1
        m += 12
    return 365 * y + y // 4 - y // 100 + y // 400 + (153 * (m - 3) + 2) // 5 + d


d1, m1, y1 = map(int, input().split())
d2, m2, y2 = map(int, input().split())
print(abs(day_number(d2, m2, y2) - day_number(d1, m1, y1)))
```

# skill: distance_points
title: Расстояние между двумя точками
topics: Геометрия
match: DISTANCE & POINT
priority: 2.6
input: x1 y1 x2 y2
input_desc: Одна строка: x1 y1 x2 y2.
output_desc: Расстояние с 6 знаками после точки.
understood: Даны координаты двух точек на плоскости. Найти расстояние между ними.
algorithm: Теорема Пифагора
why: d = √((x2 − x1)² + (y2 − y1)²).
ideas: math.hypot; math.dist
structures: float
links: lib:math.hypot, lib:math.dist, algo:geometry
edge: Совпадающие точки — 0.
sample: 0 0 3 4 => 5.000000
sample: 1 1 1 1 => 0.000000
sample: -1 -1 2 3 => 5.000000

## Формула
approach: formula
role: beginner
time: O(1)
memory: O(1)
idea: Корень из суммы квадратов разностей.
principle: Теорема Пифагора.
pros: Понятно
cons: —
when: Обычно.
readability: 5
```python
import math

x1, y1, x2, y2 = map(float, input().split())
print(f"{math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2):.6f}")
```

## math.hypot
approach: hypot
role: short
time: O(1)
memory: O(1)
idea: hypot(dx, dy) — длина гипотенузы.
principle: Вычисляется без переполнения промежуточных квадратов.
pros: Точнее и короче
cons: —
when: Всегда.
readability: 5
```python
import math

x1, y1, x2, y2 = map(float, input().split())
print(f"{math.hypot(x2 - x1, y2 - y1):.6f}")
```

## math.dist
approach: dist
role: pythonic
time: O(1)
memory: O(1)
idea: Расстояние между точками-кортежами (Python 3.8+).
principle: math.dist(p, q) работает в любой размерности.
pros: Обобщается на 3D
cons: Python 3.8+
when: В новых версиях Python.
readability: 5
python: 3.8
```python
import math

x1, y1, x2, y2 = map(float, input().split())
print(f"{math.dist((x1, y1), (x2, y2)):.6f}")
```

# skill: circle
title: Площадь и длина окружности
topics: Геометрия
match: CIRCLE & (AREA | PERIMETER | RADIUS | LENGTH)
priority: 2.6
input: n
input_desc: Одна строка: радиус r.
output_desc: Две строки: площадь круга и длина окружности с 6 знаками после точки.
understood: Дан радиус r. Найти площадь круга и длину окружности.
algorithm: Формулы S = πr² и L = 2πr
why: Стандартные формулы геометрии.
ideas: math.pi
structures: float
links: lib:math.pi
edge: r = 0 — оба значения 0.
sample: 1 => 3.141593\n6.283185
sample: 0 => 0.000000\n0.000000
sample: 2.5 => 19.634954\n15.707963

## math.pi
approach: pi
role: beginner
time: O(1)
memory: O(1)
idea: Подставляем радиус в формулы.
principle: math.pi — число π с двойной точностью.
pros: Просто
cons: —
when: Всегда.
readability: 5
```python
import math

r = float(input())
print(f"{math.pi * r * r:.6f}")
print(f"{2 * math.pi * r:.6f}")
```

## Функции
approach: functions
role: alternative
time: O(1)
memory: O(1)
idea: Формулы оформлены функциями.
principle: math.tau = 2π.
pros: Переиспользуемо
cons: —
when: Когда формулы нужны в нескольких местах.
readability: 5
```python
import math


def area(r):
    return math.pi * r ** 2


def length(r):
    return math.tau * r


r = float(input())
print(f"{area(r):.6f}")
print(f"{length(r):.6f}")
```

# skill: rectangle
title: Площадь и периметр прямоугольника
topics: Геометрия; Арифметика
match: RECTANGLE & (AREA | PERIMETER)
priority: 2.6
input: a b
input_desc: Одна строка: стороны a и b.
output_desc: Две строки: площадь и периметр.
understood: Даны стороны прямоугольника a и b. Найти площадь и периметр.
algorithm: S = a · b, P = 2(a + b)
why: Формулы для прямоугольника.
ideas: Целые и дробные стороны
structures: int
links: algo:geometry
edge: Квадрат (a = b).
sample: 3 4 => 12\n14
sample: 5 5 => 25\n20

## Формулы
approach: formula
role: beginner
time: O(1)
memory: O(1)
idea: Прямая подстановка.
principle: S = a·b, P = 2(a + b).
pros: Просто
cons: —
when: Всегда.
readability: 5
```python
a, b = map(int, input().split())
print(a * b)
print(2 * (a + b))
```

## Один print
approach: sep
role: short
time: O(1)
memory: O(1)
idea: Выводим оба значения одним print с sep="\n".
principle: sep задаёт разделитель между значениями.
pros: Одна строка вывода
cons: —
when: Для краткости.
readability: 5
```python
a, b = map(int, input().split())
print(a * b, 2 * (a + b), sep="\n")
```

# skill: right_triangle
title: Прямоугольный ли треугольник
topics: Геометрия
match: PYTHAGOREAN | (RIGHT_ANGLE & TRIANGLE)
priority: 2.6
input: a b c
input_desc: Одна строка: длины трёх сторон.
output_desc: YES, если треугольник прямоугольный (a² + b² = c² для наибольшей стороны c), иначе NO.
understood: Даны три стороны. Проверить, является ли треугольник прямоугольным.
algorithm: Обратная теорема Пифагора
why: Сортируем стороны; прямоугольный, если сумма квадратов двух меньших равна квадрату наибольшей.
ideas: Сортировка сторон; Целые стороны — точное сравнение
structures: int
links: algo:geometry, py:builtin:sorted
edge: Вырожденный «треугольник» не прямоугольный.
sample: 3 4 5 => YES
sample: 5 12 13 => YES
sample: 2 3 4 => NO
sample: 13 5 12 => YES

## Сортировка
approach: sorted
role: short
time: O(1)
memory: O(1)
idea: После сортировки гипотенуза — последняя.
principle: x² + y² == z².
pros: Коротко
cons: —
when: Обычно.
readability: 5
```python
x, y, z = sorted(map(int, input().split()))
print("YES" if x > 0 and x * x + y * y == z * z else "NO")
```

## Три проверки
approach: three
role: beginner
time: O(1)
memory: O(1)
idea: Любая из сторон может быть гипотенузой — проверяем все три варианта.
principle: or трёх равенств.
pros: Без сортировки
cons: Длиннее
when: Для обучения.
readability: 5
```python
a, b, c = map(int, input().split())
ok = a * a + b * b == c * c or a * a + c * c == b * b or b * b + c * c == a * a
print("YES" if ok and min(a, b, c) > 0 else "NO")
```
