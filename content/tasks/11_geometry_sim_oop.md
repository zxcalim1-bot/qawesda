# id: task:distance-points
kind: task
title: Расстояние между точками
category: Геометрия
level: beginner
tags: расстояние, math.dist, теорема Пифагора
related: lib:math.dist, lib:math.hypot, algo:geometry
## Условие
Даны координаты двух точек на плоскости. Найдите расстояние между ними с 6 знаками после точки.
## Входные данные
x1 y1 x2 y2 — целые числа по модулю до 10^6.
## Выходные данные
Расстояние.
## Примеры
```in
0 0 3 4
```
```out
5.000000
```
## Подсказки
- Разности координат — катеты прямоугольного треугольника.
- d = √((x2−x1)² + (y2−y1)²).
- math.dist принимает две точки как кортежи.
## Решение: формула
@time: O(1) @memory: O(1)
```python
x1, y1, x2, y2 = map(int, input().split())
print(f"{((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5:.6f}")
```
## Решение: math.dist
@time: O(1) @memory: O(1)
```python
import math
x1, y1, x2, y2 = map(int, input().split())
print(f"{math.dist((x1, y1), (x2, y2)):.6f}")
```
## Решение: комплексные числа
@time: O(1) @memory: O(1)
Точка — комплексное число x + yi; расстояние — модуль разности.
```python
x1, y1, x2, y2 = map(int, input().split())
print(f"{abs(complex(x2, y2) - complex(x1, y1)):.6f}")
```
## Объяснение
Комплексные числа удобны в геометрии: поворот — умножение, расстояние — abs.
## Генератор
```python
import json, random
random.seed(161)
t = ["0 0 0 0", "1 1 2 2", "-1000000 -1000000 1000000 1000000"]
t += [" ".join(str(random.randint(-1000, 1000)) for _ in range(4)) for _ in range(4)]
print(json.dumps(t))
```

# id: task:polygon-area
kind: task
title: Площадь многоугольника
category: Геометрия
level: medium
tags: формула шнурования, площадь, векторное произведение
related: algo:geometry
## Условие
Даны вершины простого многоугольника в порядке обхода. Найдите его площадь с одним знаком после точки.
## Входные данные
N (3 ≤ N ≤ 10^5), затем N строк «x y» (целые, по модулю до 10^6).
## Выходные данные
Площадь.
## Примеры
```in
4
0 0
4 0
4 3
0 3
```
```out
12.0
```
## Подсказки
- Формула Гаусса (шнурования): S = |Σ (x_i·y_{i+1} − x_{i+1}·y_i)| / 2.
- Последняя вершина соединяется с первой.
- Удвоенная площадь — целое число, поэтому ответ кончается на .0 или .5.
## Решение: формула шнурования
@time: O(N) @memory: O(N)
```python
n = int(input())
p = [tuple(map(int, input().split())) for _ in range(n)]
s = 0
for i in range(n):
    x1, y1 = p[i]
    x2, y2 = p[(i + 1) % n]
    s += x1 * y2 - x2 * y1
s = abs(s)
print(f"{s // 2}.{5 if s % 2 else 0}")
```
## Решение: трапеции
@time: O(N) @memory: O(N)
Сумма площадей трапеций под рёбрами со знаком: (x2 − x1)(y1 + y2) / 2.
```python
n = int(input())
p = [tuple(map(int, input().split())) for _ in range(n)]
s = 0
for (x1, y1), (x2, y2) in zip(p, p[1:] + p[:1]):
    s += (x2 - x1) * (y1 + y2)
print(f"{abs(s) / 2:.1f}")
```
## Объяснение
Первый способ печатает ответ без float — точно даже для огромных координат.
## Генератор
```python
import json
print(json.dumps(["3\n0 0\n1 0\n0 1", "3\n0 0\n0 1\n1 0", "4\n0 0\n1000000 0\n1000000 1000000\n0 1000000", "5\n0 0\n4 0\n4 4\n2 2\n0 4"]))
```

# id: task:segments-intersect
kind: task
title: Пересекаются ли отрезки
category: Геометрия
level: hard
tags: векторное произведение, ориентация, отрезки
related: algo:geometry
## Условие
Даны два отрезка на плоскости. Выведите YES, если у них есть хотя бы одна общая точка, иначе NO.
## Входные данные
Две строки «x1 y1 x2 y2» — концы отрезков (целые, по модулю до 10^9).
## Выходные данные
YES или NO.
## Примеры
```in
0 0 2 2
0 2 2 0
```
```out
YES
```
```in
0 0 1 1
2 2 3 3
```
```out
NO
```
## Подсказки
- Ориентация тройки точек — знак векторного произведения.
- Отрезки пересекаются, если концы каждого лежат по разные стороны (или на) прямой другого.
- Отдельно проверьте коллинеарный случай: пересечение проекций на оси.
## Решение: ориентации и проекции
@time: O(1) @memory: O(1)
```python
def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def on_seg(p, a, b):
    return min(a[0], b[0]) <= p[0] <= max(a[0], b[0]) and min(a[1], b[1]) <= p[1] <= max(a[1], b[1])

x1, y1, x2, y2 = map(int, input().split())
x3, y3, x4, y4 = map(int, input().split())
A, B, C, D = (x1, y1), (x2, y2), (x3, y3), (x4, y4)
d1, d2, d3, d4 = cross(C, D, A), cross(C, D, B), cross(A, B, C), cross(A, B, D)
if ((d1 > 0) != (d2 > 0) and d1 != 0 and d2 != 0) and ((d3 > 0) != (d4 > 0) and d3 != 0 and d4 != 0):
    ok = True
else:
    ok = (d1 == 0 and on_seg(A, C, D)) or (d2 == 0 and on_seg(B, C, D)) or \
         (d3 == 0 and on_seg(C, A, B)) or (d4 == 0 and on_seg(D, A, B))
print("YES" if ok else "NO")
```
## Решение: знаки произведений и проверка ограничивающих прямоугольников
@time: O(1) @memory: O(1)
Отрезки пересекаются ⇔ пересекаются их ограничивающие прямоугольники и произведения ориентаций ≤ 0.
```python
def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

x1, y1, x2, y2 = map(int, input().split())
x3, y3, x4, y4 = map(int, input().split())
A, B, C, D = (x1, y1), (x2, y2), (x3, y3), (x4, y4)
box = (max(min(x1, x2), min(x3, x4)) <= min(max(x1, x2), max(x3, x4)) and
       max(min(y1, y2), min(y3, y4)) <= min(max(y1, y2), max(y3, y4)))
ok = box and cross(A, B, C) * cross(A, B, D) <= 0 and cross(C, D, A) * cross(C, D, B) <= 0
print("YES" if ok else "NO")
```
## Объяснение
Целочисленная арифметика Python делает проверки точными — без погрешностей float.
## Генератор
```python
import json, random
random.seed(162)
t = ["0 0 1 0\n1 0 2 0", "0 0 1 0\n2 0 3 0", "0 0 0 0\n0 0 0 0", "0 0 4 4\n1 1 2 2", "0 0 1 1\n1 0 2 1"]
for _ in range(6):
    t.append("\n".join(" ".join(str(random.randint(-3, 3)) for _ in range(4)) for _ in range(2)))
print(json.dumps(t))
```

# id: task:clock-angle
kind: task
title: Угол между стрелками часов
category: Геометрия
level: easy
tags: часы, угол, модуль
related: algo:geometry
## Условие
Дано время H:M. Найдите меньший угол между часовой и минутной стрелками в градусах (с одним знаком после точки).
## Входные данные
H и M (0 ≤ H ≤ 23, 0 ≤ M ≤ 59).
## Выходные данные
Угол.
## Примеры
```in
3 30
```
```out
75.0
```
## Подсказки
- Минутная стрелка: 6° в минуту.
- Часовая: 30° в час + 0.5° в минуту (часы берите по модулю 12).
- Угол = |разница|, а меньший — min(угол, 360 − угол).
## Решение: формула
@time: O(1) @memory: O(1)
```python
h, m = map(int, input().split())
diff = abs(30 * (h % 12) + 0.5 * m - 6 * m)
print(f"{min(diff, 360 - diff):.1f}")
```
## Решение: в половинках градуса (целые числа)
@time: O(1) @memory: O(1)
Умножаем всё на 2, чтобы не было дробей.
```python
h, m = map(int, input().split())
diff2 = abs(60 * (h % 12) + m - 12 * m)
best2 = min(diff2, 720 - diff2)
print(f"{best2 // 2}.{5 if best2 % 2 else 0}")
```
## Объяснение
В 3:30 часовая стрелка стоит посередине между 3 и 4 (105°), минутная — на 180°.
## Генератор
```python
import json
print(json.dumps(["0 0", "12 0", "6 0", "9 0", "23 59", "12 30", "1 5"]))
```

# id: task:days-between
kind: task
title: Дней между датами
category: Моделирование
level: easy
tags: datetime, date, разница дат
related: lib:datetime.date
## Условие
Даны две даты в формате ДД.ММ.ГГГГ. Сколько дней между ними (модуль разности)?
## Входные данные
Две даты на отдельных строках (годы от 1 до 9999).
## Выходные данные
Количество дней.
## Примеры
```in
01.01.2024
01.03.2024
```
```out
60
```
## Подсказки
- datetime.date(год, месяц, день) создаёт дату.
- Разность дат — timedelta, у неё есть .days.
- Без библиотек: переведите каждую дату в «номер дня от начала эпохи».
## Решение: datetime
@time: O(1) @memory: O(1)
```python
from datetime import date

def parse(s):
    d, m, y = map(int, s.split("."))
    return date(y, m, d)

a = parse(input().strip())
b = parse(input().strip())
print(abs((b - a).days))
```
## Решение: номер дня вручную
@time: O(1) @memory: O(1)
Считаем дни до начала года, месяца и прибавляем число — с учётом високосных лет.
```python
def leap(y):
    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)

MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

def day_number(s):
    d, m, y = map(int, s.split("."))
    y1 = y - 1
    days = y1 * 365 + y1 // 4 - y1 // 100 + y1 // 400
    days += sum(MONTH[:m - 1]) + (1 if m > 2 and leap(y) else 0)
    return days + d

print(abs(day_number(input().strip()) - day_number(input().strip())))
```
## Объяснение
date.toordinal() даёт тот же «номер дня» по пролептическому григорианскому календарю.
## Генератор
```python
import json
print(json.dumps(["01.01.2000\n01.01.2000", "28.02.2023\n01.03.2023", "28.02.2024\n01.03.2024", "31.12.9999\n01.01.0001", "15.06.1990\n04.10.2026"]))
```

# id: task:weekday
kind: task
title: День недели
category: Моделирование
level: easy
tags: datetime, weekday, формула Зеллера
related: lib:datetime.date, lib:calendar.weekday
## Условие
Дана дата ДД ММ ГГГГ. Выведите день недели по-русски (понедельник, вторник, …).
## Входные данные
Три числа: день, месяц, год (1 ≤ год ≤ 9999).
## Выходные данные
Название дня недели.
## Примеры
```in
4 10 2026
```
```out
воскресенье
```
## Подсказки
- date(y, m, d).weekday() возвращает 0 для понедельника.
- Названия храните в списке.
- Без библиотек — формула Зеллера или алгоритм Сакамото.
## Решение: datetime.weekday
@time: O(1) @memory: O(1)
```python
from datetime import date
NAMES = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
d, m, y = map(int, input().split())
print(NAMES[date(y, m, d).weekday()])
```
## Решение: алгоритм Сакамото
@time: O(1) @memory: O(1)
Возвращает 0 для воскресенья.
```python
NAMES = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"]
T = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
d, m, y = map(int, input().split())
if m < 3:
    y -= 1
print(NAMES[(y + y // 4 - y // 100 + y // 400 + T[m - 1] + d) % 7])
```
## Решение: calendar.weekday
@time: O(1) @memory: O(1)
```python
import calendar
NAMES = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
d, m, y = map(int, input().split())
print(NAMES[calendar.weekday(y, m, d)])
```
## Объяснение
Все три способа используют пролептический григорианский календарь.
## Генератор
```python
import json
print(json.dumps(["1 1 1", "1 1 2000", "29 2 2024", "31 12 9999", "9 5 1945", "12 4 1961"]))
```

# id: task:life-step
kind: task
title: Игра «Жизнь»: один шаг
category: Моделирование
level: medium
tags: клеточный автомат, соседи, моделирование
related: algo:simulation, algo:matrices
## Условие
Дано поле N×M игры «Жизнь» («#» — живая клетка, «.» — мёртвая). За поле выходить нельзя (клетки за границей мёртвые). Выведите поле после одного шага: живая клетка выживает при 2 или 3 живых соседях, мёртвая оживает при ровно 3 (соседи — 8 клеток вокруг).
## Входные данные
N и M (до 200), затем N строк.
## Выходные данные
Новое поле.
## Примеры
```in
3 3
.#.
.#.
.#.
```
```out
...
###
...
```
## Подсказки
- Новое поле строится по старому — не изменяйте старое на ходу.
- Для каждой клетки посчитайте живых соседей в квадрате 3×3 без неё самой.
- Можно сначала посчитать соседей через Counter по всем живым клеткам.
## Решение: двойной цикл по соседям
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
out = []
for i in range(n):
    row = []
    for j in range(m):
        c = 0
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                if (di or dj) and 0 <= i + di < n and 0 <= j + dj < m and g[i + di][j + dj] == "#":
                    c += 1
        alive = g[i][j] == "#"
        row.append("#" if c == 3 or (alive and c == 2) else ".")
    out.append("".join(row))
print("\n".join(out))
```
## Решение: Counter соседей живых клеток
@time: O(живых) @memory: O(живых)
Каждая живая клетка «голосует» за 8 соседей; затем применяем правила.
```python
from collections import Counter
n, m = map(int, input().split())
live = {(i, j) for i in range(n) for j, ch in enumerate(input().strip()) if ch == "#"}
cnt = Counter((i + di, j + dj) for i, j in live for di in (-1, 0, 1) for dj in (-1, 0, 1) if di or dj)
new = {cell for cell, c in cnt.items() if (c == 3 or (c == 2 and cell in live)) and 0 <= cell[0] < n and 0 <= cell[1] < m}
for i in range(n):
    print("".join("#" if (i, j) in new else "." for j in range(m)))
```
## Объяснение
Второй способ хорош для разреженных полей и бесконечной плоскости.
## Генератор
```python
import json, random
random.seed(163)
t = ["1 1\n#", "2 2\n##\n##"]
for _ in range(4):
    n, m = random.randint(1, 12), random.randint(1, 12)
    t.append("%d %d\n%s" % (n, m, "\n".join("".join("#" if random.random() < 0.35 else "." for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:robot-commands
kind: task
title: Робот на плоскости
category: Моделирование
level: easy
tags: моделирование, направления, словарь
related: algo:simulation
## Условие
Робот стоит в точке (0, 0) и смотрит на север. Дана строка команд: F — шаг вперёд, L — поворот налево на 90°, R — направо. Выведите конечные координаты и итоговое расстояние Манхэттена от начала.
## Входные данные
Строка команд (до 10^5 символов).
## Выходные данные
x y и расстояние |x| + |y|.
## Примеры
```in
FFRFFLF
```
```out
2 3 5
```
## Подсказки
- Направления: север (0, 1), восток (1, 0), юг (0, −1), запад (−1, 0).
- Поворот направо — следующий индекс в списке направлений, налево — предыдущий.
- Шаг вперёд прибавляет текущее направление.
## Решение: список направлений
@time: O(n) @memory: O(1)
```python
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
x = y = d = 0
for c in input().strip():
    if c == "F":
        x += dirs[d][0]
        y += dirs[d][1]
    elif c == "R":
        d = (d + 1) % 4
    elif c == "L":
        d = (d - 1) % 4
print(x, y, abs(x) + abs(y))
```
## Решение: комплексные числа
@time: O(n) @memory: O(1)
Направление — комплексное число; поворот налево — умножение на i, направо — на −i.
```python
pos = 0j
d = 1j
for c in input().strip():
    if c == "F":
        pos += d
    elif c == "L":
        d *= 1j
    elif c == "R":
        d *= -1j
x, y = int(pos.real), int(pos.imag)
print(x, y, abs(x) + abs(y))
```
## Объяснение
Умножение на i поворачивает вектор на 90° против часовой стрелки.
## Генератор
```python
import json, random
random.seed(164)
print(json.dumps(["", "F", "RRRR", "LFLFLFLF"] + ["".join(random.choice("FFFLR") for _ in range(200)) for _ in range(3)]))
```

# id: task:josephus
kind: task
title: Считалочка Иосифа
category: Моделирование
level: medium
tags: Иосиф Флавий, рекуррентная формула, deque
related: algo:simulation, lib:collections.deque, algo:dp
## Условие
N человек стоят по кругу, пронумерованы от 1 до N. Начиная с первого, считают до K, K-й выбывает, счёт продолжается со следующего. Какой номер останется последним?
## Входные данные
N и K (1 ≤ N ≤ 10^6, 1 ≤ K ≤ 10^9).
## Выходные данные
Номер оставшегося.
## Примеры
```in
7 3
```
```out
4
```
## Подсказки
- Моделирование через deque.rotate — O(N·K) в худшем случае.
- Есть рекуррентная формула: J(1) = 0, J(n) = (J(n−1) + K) % n (нумерация с 0).
- Ответ — J(N) + 1.
## Решение: рекуррентная формула
@time: O(N) @memory: O(1)
```python
n, k = map(int, input().split())
j = 0
for m in range(2, n + 1):
    j = (j + k) % m
print(j + 1)
```
## Решение: моделирование списком
@time: O(N²) @memory: O(N)
Индекс выбывающего: (idx + K − 1) % len; pop из списка — O(N).
```python
n, k = map(int, input().split())
people = list(range(1, n + 1))
idx = 0
while len(people) > 1:
    idx = (idx + k - 1) % len(people)
    people.pop(idx)
print(people[0])
```
## Объяснение
Формула получается так: после первого выбывания задача сводится к кругу из n−1 человек, сдвинутому на K.
## Генератор
```python
import json
print(json.dumps(["1 1", "1 100", "5 1", "5 2", "10 3", "2000 7", "3000 1000000000"]))
```

# id: task:elevator
kind: task
title: Лифт
category: Моделирование
level: easy
tags: моделирование, сумма модулей
related: algo:simulation
## Условие
Лифт стоит на этаже 1. Он по очереди едет на этажи из списка вызовов. Подъём на один этаж занимает 5 секунд, спуск — 3 секунды, остановка на этаже вызова — 10 секунд (если лифт уже на нужном этаже, он всё равно останавливается). Сколько секунд займёт выполнение всех вызовов?
## Входные данные
N (до 10^5), затем N номеров этажей.
## Выходные данные
Время в секундах.
## Примеры
```in
3
5 2 2
```
```out
59
```
## Подсказки
- Обрабатывайте вызовы по порядку, помня текущий этаж.
- Если цель выше — 5·разница, ниже — 3·разница.
- Каждый вызов добавляет 10 секунд остановки.
## Решение: прямое моделирование
@time: O(N) @memory: O(1)
```python
input()
cur = 1
total = 0
for f in map(int, input().split()):
    total += 5 * (f - cur) if f > cur else 3 * (cur - f)
    total += 10
    cur = f
print(total)
```
## Решение: пары соседних этажей
@time: O(N) @memory: O(N)
```python
n = int(input())
floors = [1] + list(map(int, input().split()))
print(sum(5 * max(b - a, 0) + 3 * max(a - b, 0) for a, b in zip(floors, floors[1:])) + 10 * n)
```
## Объяснение
В примере: подъём 1→5 — 20 с, спуск 5→2 — 9 с, 2→2 — 0 с, плюс три остановки по 10 с: 20 + 9 + 30 = 59.
## Генератор
```python
import json, random
random.seed(165)
t = ["1\n1", "2\n10 1"]
for _ in range(4):
    n = random.randint(1, 50)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(1, 30)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:fraction-class
kind: task
title: Класс «Дробь»
category: ООП
level: medium
tags: класс, магические методы, __add__, fractions
related: py:topic:oop, py:topic:magic-methods, lib:fractions.Fraction
## Условие
Даны две дроби a/b и c/d. Выведите их сумму, разность, произведение и частное в виде несократимых дробей p/q (знаменатель положительный; целое число выводится как p/1). Реализуйте класс с методами __add__, __sub__, __mul__, __truediv__ и __str__.
## Входные данные
Две строки вида «a/b» (|a|, |b| ≤ 10^9, b ≠ 0, c ≠ 0).
## Выходные данные
Четыре строки.
## Примеры
```in
1/2
1/3
```
```out
5/6
1/6
1/6
3/2
```
## Подсказки
- В конструкторе сокращайте дробь на gcd и переносите знак в числитель.
- a/b + c/d = (ad + cb) / bd.
- Для проверки сравните с fractions.Fraction.
## Решение: свой класс
@time: O(log) на операцию @memory: O(1)
```python
from math import gcd

class Frac:
    def __init__(self, p, q):
        if q < 0:
            p, q = -p, -q
        g = gcd(p, q)
        self.p, self.q = p // g, q // g

    def __add__(self, o):
        return Frac(self.p * o.q + o.p * self.q, self.q * o.q)

    def __sub__(self, o):
        return Frac(self.p * o.q - o.p * self.q, self.q * o.q)

    def __mul__(self, o):
        return Frac(self.p * o.p, self.q * o.q)

    def __truediv__(self, o):
        return Frac(self.p * o.q, self.q * o.p)

    def __str__(self):
        return f"{self.p}/{self.q}"

def read():
    a, b = map(int, input().split("/"))
    return Frac(a, b)

x, y = read(), read()
for r in (x + y, x - y, x * y, x / y):
    print(r)
```
## Решение: fractions.Fraction
@time: O(log) на операцию @memory: O(1)
Стандартный класс уже умеет всё. Строку «3/-4» Fraction не принимает, поэтому передаём числитель и знаменатель числами; str у целого значения не содержит «/1», поэтому печатаем их явно.
```python
from fractions import Fraction
x = Fraction(*map(int, input().split("/")))
y = Fraction(*map(int, input().split("/")))
for r in (x + y, x - y, x * y, x / y):
    print(f"{r.numerator}/{r.denominator}")
```
## Объяснение
Магические методы позволяют писать x + y для своих объектов — Python вызывает x.__add__(y).
## Генератор
```python
import json
print(json.dumps(["1/2\n1/2", "-1/2\n1/3", "3/-4\n5/6", "0/5\n7/3", "1000000000/3\n-999999999/7", "2/4\n-6/8"]))
```

# id: task:bank-account
kind: task
title: Банковские счета
category: ООП
level: medium
tags: класс, исключения, словарь объектов
related: py:topic:oop, py:topic:exceptions
## Условие
Моделируйте банк. Команды: «open NAME» — открыть счёт с нулевым балансом (если уже есть — ERROR), «deposit NAME X» — положить X, «withdraw NAME X» — снять X (если денег не хватает — ERROR, баланс не меняется), «balance NAME» — вывести баланс. Для операций с несуществующим счётом выведите ERROR.
## Входные данные
Q (до 10^5), затем Q команд (суммы — натуральные числа до 10^9).
## Выходные данные
Результаты balance и сообщения ERROR, каждое на отдельной строке.
## Примеры
```in
6
open ali
deposit ali 100
withdraw ali 150
withdraw ali 30
balance ali
balance vali
```
```out
ERROR
70
ERROR
```
## Подсказки
- Класс Account хранит баланс и умеет deposit/withdraw.
- Ошибки удобно сигнализировать исключением и ловить в цикле обработки команд.
- Счета храните в словаре «имя → объект».
## Решение: классы и исключения
@time: O(Q) @memory: O(число счетов)
```python
class BankError(Exception):
    pass

class Account:
    def __init__(self):
        self.balance = 0

    def deposit(self, x):
        self.balance += x

    def withdraw(self, x):
        if x > self.balance:
            raise BankError
        self.balance -= x

class Bank:
    def __init__(self):
        self.accounts = {}

    def get(self, name):
        if name not in self.accounts:
            raise BankError
        return self.accounts[name]

    def run(self, cmd, name, arg=None):
        if cmd == "open":
            if name in self.accounts:
                raise BankError
            self.accounts[name] = Account()
        elif cmd == "deposit":
            self.get(name).deposit(int(arg))
        elif cmd == "withdraw":
            self.get(name).withdraw(int(arg))
        else:
            return self.get(name).balance

bank = Bank()
for _ in range(int(input())):
    parts = input().split()
    try:
        r = bank.run(*parts)
        if r is not None:
            print(r)
    except BankError:
        print("ERROR")
```
## Решение: словарь балансов
@time: O(Q) @memory: O(число счетов)
Без классов — только словарь; удобно для маленьких программ.
```python
bal = {}
for _ in range(int(input())):
    p = input().split()
    cmd, name = p[0], p[1]
    if cmd == "open":
        if name in bal:
            print("ERROR")
        else:
            bal[name] = 0
    elif name not in bal:
        print("ERROR")
    elif cmd == "deposit":
        bal[name] += int(p[2])
    elif cmd == "withdraw":
        x = int(p[2])
        if x > bal[name]:
            print("ERROR")
        else:
            bal[name] -= x
    else:
        print(bal[name])
```
## Объяснение
Классовое решение легче расширять: проценты, история операций, переводы между счетами.
## Генератор
```python
import json, random
random.seed(166)
t = []
for _ in range(4):
    q = random.randint(1, 30)
    names = ["a", "b", "c"]
    cmds = []
    for _ in range(q):
        c = random.choice(["open", "deposit", "withdraw", "balance"])
        n = random.choice(names)
        cmds.append("%s %s %d" % (c, n, random.randint(1, 100)) if c in ("deposit", "withdraw") else "%s %s" % (c, n))
    t.append("%d\n%s" % (q, "\n".join(cmds)))
print(json.dumps(t))
```

# id: task:min-stack
kind: task
title: Стек с минимумом
category: ООП
level: medium
tags: класс, стек, минимум за O(1)
related: algo:stack, py:topic:oop
## Условие
Реализуйте стек с операциями: «push X», «pop» (удалить верхний; если стек пуст — вывести EMPTY), «min» (вывести минимум элементов стека или EMPTY). Все операции — за O(1).
## Входные данные
Q (до 2·10^5), затем Q команд.
## Выходные данные
Ответы на min и сообщения EMPTY.
## Примеры
```in
6
push 3
push 1
min
pop
min
pop
```
```out
1
3
```
## Подсказки
- Минимум после pop должен «откатиться» к предыдущему.
- Храните вместе с каждым элементом минимум стека на момент его добавления.
- Тогда min — это сохранённый минимум верхнего элемента.
## Решение: пары (значение, минимум)
@time: O(1) на операцию @memory: O(Q)
```python
import sys

class MinStack:
    def __init__(self):
        self.items = []

    def push(self, x):
        m = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, m))

    def pop(self):
        if not self.items:
            return False
        self.items.pop()
        return True

    def min(self):
        return self.items[-1][1] if self.items else None

s = MinStack()
lines = sys.stdin.read().split("\n")
out = []
for line in lines[1:int(lines[0]) + 1]:
    p = line.split()
    if p[0] == "push":
        s.push(int(p[1]))
    elif p[0] == "pop":
        if not s.pop():
            out.append("EMPTY")
    else:
        m = s.min()
        out.append("EMPTY" if m is None else str(m))
print("\n".join(out))
```
## Решение: второй стек минимумов
@time: O(1) на операцию @memory: O(Q)
Во втором стеке храним только «новые рекорды» (значения ≤ текущего минимума).
```python
stack, mins = [], []
for _ in range(int(input())):
    p = input().split()
    if p[0] == "push":
        x = int(p[1])
        stack.append(x)
        if not mins or x <= mins[-1]:
            mins.append(x)
    elif p[0] == "pop":
        if not stack:
            print("EMPTY")
        elif stack.pop() == mins[-1]:
            mins.pop()
    else:
        print(mins[-1] if mins else "EMPTY")
```
## Объяснение
Во втором способе условие x <= mins[-1] (а не <) правильно обрабатывает повторяющиеся минимумы.
## Генератор
```python
import json, random
random.seed(167)
t = ["1\nmin", "1\npop"]
for _ in range(4):
    q = random.randint(1, 40)
    cmds = []
    for _ in range(q):
        r = random.random()
        cmds.append("push %d" % random.randint(-5, 5) if r < 0.5 else ("pop" if r < 0.75 else "min"))
    t.append("%d\n%s" % (q, "\n".join(cmds)))
print(json.dumps(t))
```

# id: task:vector-class
kind: task
title: Класс «Вектор»
category: ООП
level: easy
tags: класс, __add__, __mul__, скалярное произведение
related: py:topic:oop, py:topic:magic-methods
## Условие
Даны два вектора на плоскости. Выведите их сумму, разность, скалярное произведение и длину первого вектора (6 знаков после точки). Используйте класс с перегрузкой операторов.
## Входные данные
Две строки «x y» (целые числа).
## Выходные данные
Четыре строки: «x y» суммы, «x y» разности, скалярное произведение, длина.
## Примеры
```in
1 2
3 4
```
```out
4 6
-2 -2
11
2.236068
```
## Подсказки
- __add__ и __sub__ возвращают новый вектор.
- __mul__ можно сделать скалярным произведением.
- __abs__ — длина вектора, вызывается через abs(v).
## Решение: класс с магическими методами
@time: O(1) @memory: O(1)
```python
import math

class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, o):
        return Vec(self.x + o.x, self.y + o.y)

    def __sub__(self, o):
        return Vec(self.x - o.x, self.y - o.y)

    def __mul__(self, o):
        return self.x * o.x + self.y * o.y

    def __abs__(self):
        return math.hypot(self.x, self.y)

    def __str__(self):
        return f"{self.x} {self.y}"

a = Vec(*map(int, input().split()))
b = Vec(*map(int, input().split()))
print(a + b)
print(a - b)
print(a * b)
print(f"{abs(a):.6f}")
```
## Решение: dataclass
@time: O(1) @memory: O(1)
@dataclass генерирует __init__, __repr__ и __eq__ автоматически.
```python
from dataclasses import dataclass
import math

@dataclass(frozen=True)
class Vec:
    x: int
    y: int

    def __add__(self, o):
        return Vec(self.x + o.x, self.y + o.y)

    def __sub__(self, o):
        return Vec(self.x - o.x, self.y - o.y)

    def dot(self, o):
        return self.x * o.x + self.y * o.y

a = Vec(*map(int, input().split()))
b = Vec(*map(int, input().split()))
s, d = a + b, a - b
print(s.x, s.y)
print(d.x, d.y)
print(a.dot(b))
print("%.6f" % math.hypot(a.x, a.y))
```
## Объяснение
frozen=True делает объекты неизменяемыми и хешируемыми — их можно класть в множества.
## Генератор
```python
import json
print(json.dumps(["0 0\n0 0", "-1 5\n2 -3", "1000000 1000000\n-1000000 1"]))
```

# id: task:csv-report
kind: task
title: Отчёт по CSV-файлу
category: Файлы
level: medium
tags: csv, DictReader, группировка, файловый объект
related: lib:csv.DictReader, lib:collections.defaultdict
## Условие
На вход подаётся CSV-файл с заголовком «city,product,amount» (поля могут быть в кавычках и содержать запятые). Выведите для каждого города сумму amount в алфавитном порядке городов в формате «город: сумма».
## Входные данные
CSV-текст: первая строка — заголовок, далее записи (до 10^5).
## Выходные данные
Строки «город: сумма».
## Примеры
```in
city,product,amount
Tashkent,apple,10
Moscow,"pear, green",5
Tashkent,plum,7
```
```out
Moscow: 5
Tashkent: 17
```
## Подсказки
- Простой split(",") сломается на полях в кавычках с запятыми.
- Модуль csv правильно разбирает кавычки; sys.stdin — тоже файловый объект.
- csv.DictReader выдаёт строки как словари по заголовку.
## Решение: csv.DictReader
@time: O(N log K) @memory: O(K)
```python
import csv
import sys
from collections import defaultdict
total = defaultdict(int)
for row in csv.DictReader(sys.stdin):
    total[row["city"]] += int(row["amount"])
for city in sorted(total):
    print(f"{city}: {total[city]}")
```
## Решение: csv.reader и индексы колонок
@time: O(N log K) @memory: O(K)
Находим номера колонок по заголовку — порядок колонок может быть любым.
```python
import csv
import sys
reader = csv.reader(sys.stdin)
header = next(reader)
ci, ai = header.index("city"), header.index("amount")
total = {}
for row in reader:
    if row:
        total[row[ci]] = total.get(row[ci], 0) + int(row[ai])
print("\n".join(f"{c}: {v}" for c, v in sorted(total.items())))
```
## Объяснение
С обычным файлом код тот же: with open("sales.csv", newline="") as f: csv.DictReader(f). Параметр newline="" рекомендован документацией модуля csv.
## Генератор
```python
import json, random
random.seed(168)
t = ["city,product,amount"]
for _ in range(4):
    rows = ["city,product,amount"]
    for _ in range(random.randint(1, 15)):
        rows.append('%s,"%s",%d' % (random.choice(["Kazan", "Samarkand", "Bukhara", "Omsk"]), random.choice(["a, b", "c", "d \"x\""]).replace('"', '""'), random.randint(0, 100)))
    t.append("\n".join(rows))
print(json.dumps(t))
```

# id: task:log-analysis
kind: task
title: Анализ журнала событий
category: Файлы
level: medium
tags: чтение строк, регулярные выражения, Counter
related: lib:re.match, lib:collections.Counter
## Условие
Дан журнал сервера: строки вида «2026-10-04 12:00:01 LEVEL message». Уровни: INFO, WARNING, ERROR. Выведите количество строк каждого уровня (в порядке INFO, WARNING, ERROR) и самое частое сообщение среди ERROR (при равенстве — лексикографически наименьшее), или «-», если ошибок нет.
## Входные данные
Строки журнала до конца ввода (могут встречаться пустые строки — их пропускайте).
## Выходные данные
Три строки «LEVEL count», затем самое частое сообщение ошибки.
## Примеры
```in
2026-10-04 12:00:01 INFO started
2026-10-04 12:00:02 ERROR disk full
2026-10-04 12:00:03 ERROR disk full
2026-10-04 12:00:04 WARNING slow
```
```out
INFO 1
WARNING 1
ERROR 2
disk full
```
## Подсказки
- Читайте ввод построчно как файл: for line in sys.stdin.
- split(maxsplit=3) отделит дату, время, уровень и сообщение.
- Counter считает уровни и сообщения ошибок.
## Решение: split с maxsplit
@time: O(N) @memory: O(K)
```python
import sys
from collections import Counter
levels = Counter()
errors = Counter()
for line in sys.stdin:
    parts = line.rstrip("\n").split(maxsplit=3)
    if len(parts) < 3:
        continue
    lvl = parts[2]
    levels[lvl] += 1
    if lvl == "ERROR":
        errors[parts[3] if len(parts) > 3 else ""] += 1
for lvl in ("INFO", "WARNING", "ERROR"):
    print(lvl, levels[lvl])
print(min(errors, key=lambda m: (-errors[m], m)) if errors else "-")
```
## Решение: регулярное выражение
@time: O(N) @memory: O(K)
Шаблон проверяет формат строки и сразу выделяет части.
```python
import re
import sys
from collections import Counter
pat = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (INFO|WARNING|ERROR) ?(.*)$")
levels = Counter()
errors = Counter()
for line in sys.stdin.read().splitlines():
    m = pat.match(line)
    if not m:
        continue
    levels[m.group(1)] += 1
    if m.group(1) == "ERROR":
        errors[m.group(2)] += 1
for lvl in ("INFO", "WARNING", "ERROR"):
    print(lvl, levels[lvl])
best = sorted(errors.items(), key=lambda p: (-p[1], p[0]))
print(best[0][0] if best else "-")
```
## Объяснение
sys.stdin — текстовый файловый объект; with open("server.log", encoding="utf-8") as f: работает так же.
## Генератор
```python
import json, random
random.seed(169)
t = ["2026-01-01 00:00:00 INFO x"]
msgs = ["disk full", "timeout", "bad request", "ok"]
for _ in range(4):
    lines = []
    for i in range(random.randint(1, 20)):
        lines.append("2026-10-%02d 12:%02d:%02d %s %s" % (random.randint(1, 28), random.randint(0, 59), random.randint(0, 59), random.choice(["INFO", "WARNING", "ERROR"]), random.choice(msgs)))
        if random.random() < 0.1:
            lines.append("")
    t.append("\n".join(lines))
print(json.dumps(t))
```

# id: task:json-sum
kind: task
title: Сумма чисел в JSON
category: Файлы
level: medium
tags: json, рекурсия, вложенные структуры
related: lib:json.loads, algo:recursion
## Условие
На вход подаётся JSON-документ (объекты, массивы, строки, числа, true/false/null). Найдите сумму всех целых чисел в нём (числа внутри строк не учитываются; true/false — не числа).
## Входные данные
JSON-текст (до 10^5 символов, может занимать несколько строк).
## Выходные данные
Сумма.
## Примеры
```in
{"a": [1, 2, {"b": 3}], "c": "4", "d": true}
```
```out
6
```
## Подсказки
- json.loads превращает текст в словари, списки и числа Python.
- Обойдите структуру рекурсивно.
- bool — подкласс int, поэтому True нужно исключить отдельно.
## Решение: json и рекурсия
@time: O(размер) @memory: O(глубина)
```python
import json
import sys

def total(x):
    if isinstance(x, bool):
        return 0
    if isinstance(x, int):
        return x
    if isinstance(x, dict):
        return sum(total(v) for v in x.values())
    if isinstance(x, list):
        return sum(total(v) for v in x)
    return 0

print(total(json.loads(sys.stdin.read())))
```
## Решение: обход стеком
@time: O(размер) @memory: O(размер)
Без рекурсии — для очень глубоко вложенных документов.
```python
import json
import sys
stack = [json.loads(sys.stdin.read())]
s = 0
while stack:
    x = stack.pop()
    if type(x) is int:
        s += x
    elif isinstance(x, dict):
        stack.extend(x.values())
    elif isinstance(x, list):
        stack.extend(x)
print(s)
```
## Объяснение
type(x) is int отсекает bool, потому что type(True) — это bool, а не int.
## Генератор
```python
import json, random
random.seed(170)
def gen(d):
    r = random.random()
    if d == 0 or r < 0.3:
        return random.choice([random.randint(-100, 100), "7", True, None, 1.5])
    if r < 0.65:
        return [gen(d - 1) for _ in range(random.randint(0, 4))]
    return {"k%d" % i: gen(d - 1) for i in range(random.randint(0, 4))}
t = ["[]", "5", "[true, false, 1]"]
for _ in range(4):
    t.append(json.dumps(gen(4), indent=random.choice([None, 2])))
print(json.dumps(t))
```
