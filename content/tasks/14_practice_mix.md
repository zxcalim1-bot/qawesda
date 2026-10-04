# id: task:even-index-elements
kind: task
title: Элементы с чётными индексами
category: Списки
level: beginner
tags: срез с шагом, индексы
related: py:topic:slicing
## Условие
Дан список чисел. Выведите элементы, стоящие на чётных позициях (0, 2, 4, …).
## Входные данные
Одна строка с числами.
## Выходные данные
Элементы через пробел.
## Примеры
```in
5 8 1 7 3
```
```out
5 1 3
```
## Подсказки
- Индексы начинаются с 0.
- Срез с шагом 2: a[::2].
- Или цикл range(0, len(a), 2).
## Решение: срез
@time: O(n) @memory: O(n)
```python
print(*input().split()[::2])
```
## Решение: enumerate
@time: O(n) @memory: O(n)
```python
print(*[x for i, x in enumerate(input().split()) if i % 2 == 0])
```
## Объяснение
Срез с шагом — самый короткий способ выбрать каждый k-й элемент.
## Генератор
```python
import json
print(json.dumps(["1", "1 2", "9 8 7 6 5 4 3"]))
```

# id: task:swap-min-max
kind: task
title: Поменять местами минимум и максимум
category: Списки
level: easy
tags: индекс минимума, индекс максимума, обмен
related: py:builtin:min, py:builtin:max
## Условие
Дан список различных чисел. Поменяйте местами наименьший и наибольший элементы и выведите список.
## Входные данные
Одна строка с различными числами.
## Выходные данные
Изменённый список.
## Примеры
```in
3 9 1 4
```
```out
3 1 9 4
```
## Подсказки
- Нужны индексы минимума и максимума.
- a.index(min(a)) — индекс минимума.
- Обмен: a[i], a[j] = a[j], a[i].
## Решение: index(min/max)
@time: O(n) @memory: O(n)
```python
a = list(map(int, input().split()))
i, j = a.index(min(a)), a.index(max(a))
a[i], a[j] = a[j], a[i]
print(*a)
```
## Решение: один проход
@time: O(n) @memory: O(n)
```python
a = list(map(int, input().split()))
lo = hi = 0
for k in range(1, len(a)):
    if a[k] < a[lo]:
        lo = k
    if a[k] > a[hi]:
        hi = k
a[lo], a[hi] = a[hi], a[lo]
print(*a)
```
## Объяснение
Первый способ делает четыре прохода по списку, второй — один.
## Генератор
```python
import json, random
random.seed(301)
print(json.dumps(["5", "1 2", "2 1"] + [" ".join(map(str, random.sample(range(-50, 50), random.randint(1, 15)))) for _ in range(3)]))
```

# id: task:list-without-duplicates-count
kind: task
title: Элементы, встречающиеся один раз
category: Списки
level: easy
tags: уникальные элементы, Counter, частота
related: lib:collections.Counter
## Условие
Дан список чисел. Выведите в порядке появления те числа, которые встречаются ровно один раз (или -, если таких нет).
## Входные данные
Одна строка с числами.
## Выходные данные
Числа через пробел или -.
## Примеры
```in
4 3 5 3 4 1
```
```out
5 1
```
## Подсказки
- Сначала посчитайте частоту каждого числа.
- Затем пройдите по списку и оставьте числа с частотой 1.
- a.count(x) в цикле — O(n²), лучше Counter.
## Решение: Counter
@time: O(n) @memory: O(n)
```python
from collections import Counter
a = input().split()
c = Counter(a)
res = [x for x in a if c[x] == 1]
print(*res if res else "-")
```
## Решение: count (малые списки)
@time: O(n²) @memory: O(n)
```python
a = input().split()
res = [x for x in a if a.count(x) == 1]
print(" ".join(res) or "-")
```
## Объяснение
Второй способ проще, но для длинных списков медленный.
## Генератор
```python
import json, random
random.seed(302)
print(json.dumps(["1", "2 2", "1 2 3"] + [" ".join(str(random.randint(0, 9)) for _ in range(15)) for _ in range(3)]))
```

# id: task:flatten-matrix-sum
kind: task
title: Сумма элементов по столбцам
category: Матрицы
level: easy
tags: матрица, суммы столбцов, zip
related: algo:matrices, py:builtin:zip
## Условие
Дана матрица N×M. Выведите сумму каждого столбца.
## Входные данные
N и M, затем матрица.
## Выходные данные
M чисел.
## Примеры
```in
2 3
1 2 3
4 5 6
```
```out
5 7 9
```
## Подсказки
- Столбец j — элементы a[i][j] для всех i.
- zip(*a) выдаёт столбцы.
- sum для каждого столбца.
## Решение: zip(*a)
@time: O(N·M) @memory: O(N·M)
```python
n, m = map(int, input().split())
a = [list(map(int, input().split())) for _ in range(n)]
print(*map(sum, zip(*a)))
```
## Решение: накопление по строкам
@time: O(N·M) @memory: O(M)
Не храним матрицу целиком — прибавляем каждую строку к массиву сумм.
```python
n, m = map(int, input().split())
s = [0] * m
for _ in range(n):
    for j, x in enumerate(map(int, input().split())):
        s[j] += x
print(*s)
```
## Объяснение
Второй способ использует O(M) памяти — удобно для очень высоких матриц.
## Генератор
```python
import json, random
random.seed(303)
t = ["1 1\n5"]
for _ in range(4):
    n, m = random.randint(1, 6), random.randint(1, 6)
    t.append("%d %d\n%s" % (n, m, "\n".join(" ".join(str(random.randint(-9, 9)) for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:diagonals-difference
kind: task
title: Разность диагоналей
category: Матрицы
level: easy
tags: матрица, главная диагональ, побочная диагональ
related: algo:matrices
## Условие
Дана квадратная матрица. Выведите модуль разности сумм главной и побочной диагоналей.
## Входные данные
N, затем матрица N×N.
## Выходные данные
Число.
## Примеры
```in
3
11 2 4
4 5 6
10 8 -12
```
```out
15
```
## Подсказки
- Главная диагональ — a[i][i].
- Побочная — a[i][n − 1 − i].
- Ответ — abs(разность сумм).
## Решение: суммы по индексам
@time: O(N) @memory: O(N²)
```python
n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
print(abs(sum(a[i][i] for i in range(n)) - sum(a[i][n - 1 - i] for i in range(n))))
```
## Решение: построчно без хранения матрицы
@time: O(N²) чтение @memory: O(N)
```python
n = int(input())
d = 0
for i in range(n):
    row = list(map(int, input().split()))
    d += row[i] - row[n - 1 - i]
print(abs(d))
```
## Объяснение
В примере главная диагональ: 11 + 5 − 12 = 4, побочная: 4 + 5 + 10 = 19.
## Генератор
```python
import json, random
random.seed(304)
t = ["1\n7"]
for n in (2, 3, 5):
    t.append("%d\n%s" % (n, "\n".join(" ".join(str(random.randint(-20, 20)) for _ in range(n)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:word-lengths
kind: task
title: Длины слов
category: Строки
level: beginner
tags: split, len, генератор
related: py:method:str.split, py:builtin:len
## Условие
Дана строка из слов. Выведите длины всех слов через пробел, а на следующей строке — среднюю длину с двумя знаками.
## Входные данные
Строка хотя бы с одним словом.
## Выходные данные
Две строки.
## Примеры
```in
я учу python
```
```out
1 3 6
3.33
```
## Подсказки
- split() разбивает строку на слова.
- len(w) для каждого слова.
- Среднее = сумма / количество.
## Решение: генератор
@time: O(n) @memory: O(n)
```python
lens = [len(w) for w in input().split()]
print(*lens)
print(f"{sum(lens) / len(lens):.2f}")
```
## Решение: map
@time: O(n) @memory: O(n)
```python
from statistics import fmean
lens = list(map(len, input().split()))
print(" ".join(map(str, lens)))
print("%.2f" % fmean(lens))
```
## Объяснение
statistics.fmean быстро считает среднее как float.
## Генератор
```python
import json
print(json.dumps(["a", "hello world", "  много   пробелов  здесь "]))
```

# id: task:count-words-starting
kind: task
title: Слова на заданную букву
category: Строки
level: beginner
tags: startswith, регистр, подсчёт
related: py:method:str.startswith
## Условие
Дана буква C и строка текста. Сколько слов начинается с этой буквы (без учёта регистра)?
## Входные данные
Буква в первой строке, текст во второй.
## Выходные данные
Количество слов.
## Примеры
```in
м
Мама мыла раму, а Маша — посуду
```
```out
3
```
## Подсказки
- Приведите и букву, и слова к одному регистру.
- Проверьте w.startswith(c) для каждого слова.
- Сумма логических значений даёт количество.
## Решение: startswith
@time: O(n) @memory: O(n)
```python
c = input().strip().lower()
print(sum(w.lower().startswith(c) for w in input().split()))
```
## Решение: первый символ слова
@time: O(n) @memory: O(n)
```python
c = input().strip().lower()
count = 0
for w in input().split():
    if w[0].lower() == c:
        count += 1
print(count)
```
## Объяснение
«Маша» начинается с «М», а «—» — отдельное «слово» из одного символа, которое не подходит.
## Генератор
```python
import json
print(json.dumps(["a\nApple avocado Banana", "x\nnothing here", "б\nбыстро Бежал бы"]))
```

# id: task:string-compress-check
kind: task
title: Проверка пароля
category: Строки
level: easy
tags: проверка строки, isdigit, isupper, any
related: py:builtin:any, py:method:str.isdigit
## Условие
Пароль надёжный, если в нём не меньше 8 символов, есть хотя бы одна заглавная латинская буква, одна строчная латинская буква и одна цифра. Выведите YES или NO.
## Входные данные
Строка-пароль без пробелов.
## Выходные данные
YES или NO.
## Примеры
```in
Python311
```
```out
YES
```
## Подсказки
- Проверьте длину.
- any(ch.isdigit() for ch in s) — есть ли цифра.
- Для латинских букв удобны проверки "A" <= ch <= "Z" и "a" <= ch <= "z".
## Решение: any
@time: O(n) @memory: O(1)
```python
s = input().strip()
ok = (len(s) >= 8 and any("A" <= c <= "Z" for c in s)
      and any("a" <= c <= "z" for c in s) and any(c.isdigit() for c in s))
print("YES" if ok else "NO")
```
## Решение: регулярные выражения
@time: O(n) @memory: O(1)
```python
import re
s = input().strip()
ok = len(s) >= 8 and all(re.search(p, s) for p in (r"[A-Z]", r"[a-z]", r"[0-9]"))
print("YES" if ok else "NO")
```
## Объяснение
str.isupper() вернул бы True и для кириллических заглавных — поэтому проверяем латинский диапазон явно.
## Генератор
```python
import json
print(json.dumps(["short1A", "alllowercase1", "ALLUPPER123", "NoDigitsHere", "Pass1234", "ПарольA1b"]))
```

# id: task:char-positions
kind: task
title: Позиции символа в строке
category: Строки
level: beginner
tags: enumerate, поиск символа
related: py:builtin:enumerate, py:method:str.find
## Условие
Даны строка S и символ C. Выведите все позиции (с 0), на которых стоит C, или -1.
## Входные данные
S в первой строке, C во второй.
## Выходные данные
Позиции через пробел или -1.
## Примеры
```in
abracadabra
a
```
```out
0 3 5 7 10
```
## Подсказки
- Перебирайте символы вместе с индексами.
- enumerate(s) даёт пары (индекс, символ).
- Или ищите find(c, start) в цикле.
## Решение: enumerate
@time: O(n) @memory: O(n)
```python
s = input()
c = input()
pos = [i for i, ch in enumerate(s) if ch == c]
print(*pos if pos else [-1])
```
## Решение: find в цикле
@time: O(n) @memory: O(n)
```python
s = input()
c = input()
pos = []
i = s.find(c)
while i != -1:
    pos.append(i)
    i = s.find(c, i + 1)
print(" ".join(map(str, pos)) or -1)
```
## Объяснение
find со вторым аргументом ищет, начиная с указанной позиции.
## Генератор
```python
import json
print(json.dumps(["a\na", "abc\nd", "aaaa\na", "hello world\no"]))
```

# id: task:dict-invert
kind: task
title: Обратный словарь переводов
category: Словари
level: easy
tags: словарь, инверсия, несколько значений
related: lib:collections.defaultdict
## Условие
Дан англо-русский словарь: N строк «слово - перевод1, перевод2, …». Постройте русско-английский словарь: для каждого русского слова (в алфавитном порядке) выведите «слово - англ1, англ2» (английские слова тоже по алфавиту).
## Входные данные
N, затем N строк словаря.
## Выходные данные
Строки обратного словаря.
## Примеры
```in
2
apple - яблоко
bear - медведь, мишка
```
```out
медведь - bear
мишка - bear
яблоко - apple
```
## Подсказки
- Разбейте каждую строку по « - », переводы — по «, ».
- Для каждого перевода добавьте английское слово в список.
- Отсортируйте ключи и значения.
## Решение: defaultdict(list)
@time: O(K log K) @memory: O(K)
```python
from collections import defaultdict
n = int(input())
inv = defaultdict(list)
for _ in range(n):
    en, ru = input().split(" - ")
    for w in ru.split(", "):
        inv[w].append(en)
for w in sorted(inv):
    print(w, "-", ", ".join(sorted(inv[w])))
```
## Решение: словарь множеств
@time: O(K log K) @memory: O(K)
```python
n = int(input())
inv = {}
for _ in range(n):
    en, ru = input().split(" - ")
    for w in ru.split(", "):
        inv.setdefault(w, set()).add(en)
print("\n".join(f"{w} - {', '.join(sorted(v))}" for w, v in sorted(inv.items())))
```
## Объяснение
Множество автоматически убирает повторы, если один перевод встречается у слова дважды.
## Генератор
```python
import json
print(json.dumps(["1\ncat - кот", "3\nbig - большой, крупный\nlarge - большой\nhuge - огромный, большой"]))
```

# id: task:students-best
kind: task
title: Лучший ученик в каждом классе
category: Словари
level: medium
tags: словарь, группировка, максимум
related: py:topic:dicts
## Условие
Дано N записей «класс фамилия балл». Для каждого класса (в порядке возрастания номера) выведите фамилию ученика с наибольшим баллом; при равенстве — лексикографически меньшую.
## Входные данные
N, затем N строк (класс — натуральное число).
## Выходные данные
Строки «класс фамилия».
## Примеры
```in
4
9 ivanov 80
10 petrov 90
9 sidorov 95
10 abramov 90
```
```out
9 sidorov
10 abramov
```
## Подсказки
- Храните для каждого класса лучшую пару (балл, фамилия).
- Сравнивайте по ключу (−балл, фамилия).
- Ключи словаря — числа, сортируйте их.
## Решение: словарь лучших
@time: O(N + K log K) @memory: O(K)
```python
n = int(input())
best = {}
for _ in range(n):
    cls, name, score = input().split()
    key = (-int(score), name)
    c = int(cls)
    if c not in best or key < best[c]:
        best[c] = key
for c in sorted(best):
    print(c, best[c][1])
```
## Решение: сортировка всех записей
@time: O(N log N) @memory: O(N)
После сортировки по (класс, −балл, фамилия) лучший в классе идёт первым.
```python
n = int(input())
rows = []
for _ in range(n):
    cls, name, score = input().split()
    rows.append((int(cls), -int(score), name))
rows.sort()
seen = set()
for c, _, name in rows:
    if c not in seen:
        seen.add(c)
        print(c, name)
```
## Объяснение
Ключ (−балл, фамилия) превращает «наибольший балл, затем алфавит» в простое сравнение кортежей.
## Генератор
```python
import json, random
random.seed(305)
names = ["ali", "bek", "dina", "egor", "fara", "gulya"]
t = []
for _ in range(4):
    n = random.randint(1, 12)
    t.append("%d\n%s" % (n, "\n".join("%d %s %d" % (random.randint(9, 11), random.choice(names), random.choice([70, 80, 90])) for _ in range(n))))
print(json.dumps(t))
```

# id: task:bracket-depth
kind: task
title: Глубина вложенности скобок
category: Стек и очередь
level: easy
tags: скобки, баланс, максимальная глубина
related: algo:stack
## Условие
Дана правильная скобочная последовательность из круглых скобок. Найдите максимальную глубину вложенности.
## Входные данные
Строка из скобок (может быть пустой).
## Выходные данные
Максимальная глубина.
## Примеры
```in
(()(()))
```
```out
3
```
## Подсказки
- Достаточно счётчика текущей глубины.
- «(» увеличивает глубину, «)» уменьшает.
- Запоминайте максимум.
## Решение: счётчик
@time: O(n) @memory: O(1)
```python
depth = best = 0
for ch in input().strip():
    depth += 1 if ch == "(" else -1
    best = max(best, depth)
print(best)
```
## Решение: накопленные суммы
@time: O(n) @memory: O(n)
```python
from itertools import accumulate
s = input().strip()
print(max(accumulate(1 if c == "(" else -1 for c in s), default=0))
```
## Объяснение
Глубина — префиксная сумма, где «(» = +1, «)» = −1.
## Генератор
```python
import json
print(json.dumps(["", "()", "()()", "((()))", "(()(()))((()))"]))
```

# id: task:hot-potato
kind: task
title: Горячая картошка
category: Стек и очередь
level: easy
tags: очередь, deque, моделирование, круг
related: lib:collections.deque, task:josephus
## Условие
Дети стоят в кругу (имена даны по порядку) и передают картошку. После каждых K передач тот, у кого картошка, выбывает, а следующий за ним начинает новый круг передач. Выведите порядок выбывания.
## Входные данные
K (1 ≤ K ≤ 100), затем строка имён (до 1000).
## Выходные данные
Имена в порядке выбывания, последним — победитель.
## Примеры
```in
2
A B C D
```
```out
C B D A
```
## Подсказки
- Очередь моделирует круг: передача — переставить первого в конец.
- После K передач выбывает тот, кто оказался первым.
- deque.rotate(-K) делает K передач сразу.
## Решение: deque.rotate
@time: O(N·K) @memory: O(N)
```python
from collections import deque
k = int(input())
q = deque(input().split())
out = []
while q:
    q.rotate(-k)
    out.append(q.popleft())
print(*out)
```
## Решение: список и индекс
@time: O(N²) @memory: O(N)
```python
k = int(input())
people = input().split()
out = []
i = 0
while people:
    i = (i + k) % len(people)
    out.append(people.pop(i))
print(*out)
```
## Объяснение
Картошка у первого в очереди; после K передач у человека с индексом (текущий + K) mod длина.
## Генератор
```python
import json
print(json.dumps(["1\nA", "1\nA B C", "3\nA B C D E F G", "7\nAli Vali Gani"]))
```

# id: task:graph-path-exists
kind: task
title: Есть ли путь между вершинами
category: Графы
level: easy
tags: граф, достижимость, BFS, DFS
related: algo:bfs, algo:dsu
## Условие
Дан неориентированный граф и две вершины S и T. Выведите YES, если из S можно попасть в T, иначе NO.
## Входные данные
N и M, затем M рёбер «u v», затем S и T.
## Выходные данные
YES или NO.
## Примеры
```in
5 3
1 2
2 3
4 5
1 3
```
```out
YES
```
## Подсказки
- Запустите обход из S.
- Если T посещена — путь есть.
- Или объедините вершины рёбрами в DSU и сравните представителей.
## Решение: BFS
@time: O(N + M) @memory: O(N + M)
```python
from collections import deque
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
s, t = map(int, input().split())
seen = {s}
q = deque([s])
while q:
    u = q.popleft()
    for v in g[u]:
        if v not in seen:
            seen.add(v)
            q.append(v)
print("YES" if t in seen else "NO")
```
## Решение: DSU
@time: O(M α(N)) @memory: O(N)
```python
n, m = map(int, input().split())
p = list(range(n + 1))
def find(x):
    while p[x] != x:
        p[x] = p[p[x]]
        x = p[x]
    return x
for _ in range(m):
    u, v = map(int, input().split())
    p[find(u)] = find(v)
s, t = map(int, input().split())
print("YES" if find(s) == find(t) else "NO")
```
## Объяснение
Путь из S в T есть тогда и только тогда, когда вершины в одной компоненте связности.
## Генератор
```python
import json, random
random.seed(306)
t = ["1 0\n1 1", "2 0\n1 2"]
for _ in range(4):
    n = random.randint(2, 12); m = random.randint(0, 10)
    edges = []
    for _ in range(m):
        u, v = random.sample(range(1, n + 1), 2); edges.append("%d %d" % (u, v))
    t.append("%d %d\n%s%s%d %d" % (n, m, "\n".join(edges), "\n" if edges else "", random.randint(1, n), random.randint(1, n)))
print(json.dumps(t))
```

# id: task:adjacency-list
kind: task
title: Списки смежности
category: Графы
level: beginner
tags: граф, представление, списки смежности
related: algo:graphs
## Условие
Дан неориентированный граф из N вершин и M рёбер. Для каждой вершины выведите на отдельной строке её соседей в порядке возрастания (или пустую строку).
## Входные данные
N и M, затем M рёбер.
## Выходные данные
N строк.
## Примеры
```in
4 3
1 2
1 3
3 2
```
```out
2 3
1 3
1 2

```
## Подсказки
- Создайте список пустых списков длины N + 1.
- Ребро u–v добавляет v к соседям u и u к соседям v.
- Отсортируйте списки перед выводом.
## Решение: список списков
@time: O(N + M log M) @memory: O(N + M)
```python
n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
for v in range(1, n + 1):
    print(*sorted(g[v]))
```
## Решение: матрица смежности
@time: O(N² + M) @memory: O(N²)
```python
n, m = map(int, input().split())
adj = [[False] * (n + 1) for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    adj[u][v] = adj[v][u] = True
for v in range(1, n + 1):
    print(" ".join(str(u) for u in range(1, n + 1) if adj[v][u]))
```
## Объяснение
Матрица удобна для плотных графов, списки — для разреженных.
## Генератор
```python
import json, random
random.seed(307)
t = ["1 0", "3 1\n1 3"]
for _ in range(3):
    n = random.randint(2, 8)
    pairs = [(u, v) for u in range(1, n + 1) for v in range(u + 1, n + 1)]
    edges = random.sample(pairs, random.randint(0, len(pairs)))
    t.append("%d %d\n%s" % (n, len(edges), "\n".join("%d %d" % e for e in edges)))
print(json.dumps(t))
```

# id: task:tree-leaves
kind: task
title: Листья дерева
category: Деревья
level: easy
tags: дерево, лист, степень вершины
related: algo:trees
## Условие
Дано дерево из N вершин с корнем 1 (рёбра без направления). Выведите все листья — вершины, у которых нет детей, — в порядке возрастания.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N−1 рёбер.
## Выходные данные
Номера листьев.
## Примеры
```in
5
1 2
1 3
3 4
3 5
```
```out
2 4 5
```
## Подсказки
- Лист (кроме корня) — вершина степени 1.
- Корень — лист, только если N = 1.
- Посчитайте степени вершин.
## Решение: степени вершин
@time: O(N) @memory: O(N)
```python
n = int(input())
deg = [0] * (n + 1)
for _ in range(n - 1):
    u, v = map(int, input().split())
    deg[u] += 1
    deg[v] += 1
print(*(v for v in range(1, n + 1) if (deg[v] == 1 and v != 1) or n == 1))
```
## Решение: обход от корня
@time: O(N) @memory: O(N)
```python
n = int(input())
g = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = map(int, input().split())
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
children = [0] * (n + 1)
for v in order[1:]:
    children[parent[v]] += 1
print(*(v for v in range(1, n + 1) if children[v] == 0))
```
## Объяснение
Корень со степенью 1 листом не считается — у него есть ребёнок.
## Генератор
```python
import json, random
random.seed(308)
t = ["1", "2\n1 2", "3\n2 1\n1 3"]
for _ in range(3):
    n = random.randint(2, 30)
    t.append("%d\n%s" % (n, "\n".join("%d %d" % (random.randint(1, i - 1), i) for i in range(2, n + 1))))
print(json.dumps(t))
```

# id: task:sum-of-divisors
kind: task
title: Сумма делителей
category: Теория чисел
level: easy
tags: делители, сумма делителей, перебор до корня
related: algo:divisors
## Условие
Дано N. Найдите сумму всех его делителей (включая 1 и N).
## Входные данные
N (1 ≤ N ≤ 10^12).
## Выходные данные
Сумма делителей.
## Примеры
```in
12
```
```out
28
```
## Подсказки
- Делители идут парами d и N/d.
- Перебирайте d до √N.
- Не прибавляйте корень дважды у полных квадратов.
## Решение: пары делителей
@time: O(√N) @memory: O(1)
```python
import math
n = int(input())
s = 0
for d in range(1, math.isqrt(n) + 1):
    if n % d == 0:
        s += d
        if d != n // d:
            s += n // d
print(s)
```
## Решение: формула по разложению
@time: O(√N) @memory: O(1)
σ(p^a) = (p^(a+1) − 1)/(p − 1), функция мультипликативна.
```python
n = int(input())
res = 1
m = n
p = 2
while p * p <= m:
    if m % p == 0:
        pk = 1
        while m % p == 0:
            m //= p
            pk *= p
        res *= (pk * p - 1) // (p - 1)
    p += 1
if m > 1:
    res *= m + 1
print(res)
```
## Объяснение
12 = 2² · 3: σ = (1 + 2 + 4)(1 + 3) = 28.
## Генератор
```python
import json
print(json.dumps(["1", "2", "12", "97", "720720", "1000000000000", "999999999989"]))
```

# id: task:fraction-reduce
kind: task
title: Сократить дробь
category: Теория чисел
level: easy
tags: НОД, дробь, сокращение
related: lib:math.gcd, lib:fractions.Fraction
## Условие
Дана дробь A/B. Выведите её в несократимом виде (знак — у числителя).
## Входные данные
Строка «A/B» (|A|, |B| ≤ 10^18, B ≠ 0).
## Выходные данные
Несократимая дробь.
## Примеры
```in
12/-18
```
```out
-2/3
```
## Подсказки
- Разделите числитель и знаменатель на их НОД.
- Если знаменатель отрицательный, поменяйте знаки обоих.
- Fraction делает это автоматически.
## Решение: math.gcd
@time: O(log) @memory: O(1)
```python
import math
a, b = map(int, input().split("/"))
if b < 0:
    a, b = -a, -b
g = math.gcd(a, b)
print(f"{a // g}/{b // g}")
```
## Решение: Fraction
@time: O(log) @memory: O(1)
```python
from fractions import Fraction
a, b = map(int, input().split("/"))
f = Fraction(a, b)
print(f"{f.numerator}/{f.denominator}")
```
## Объяснение
gcd(0, b) = |b|, поэтому 0/b превращается в 0/1.
## Генератор
```python
import json
print(json.dumps(["1/1", "0/5", "4/8", "-6/-9", "1000000000000000000/-999999999999999999", "7/3"]))
```

# id: task:binary-palindrome
kind: task
title: Двоичный палиндром
category: Битовые операции
level: easy
tags: двоичная запись, палиндром, bin
related: py:builtin:bin, algo:palindromes
## Условие
Дано натуральное N. Выведите YES, если его двоичная запись (без ведущих нулей) — палиндром.
## Входные данные
N (1 ≤ N ≤ 10^18).
## Выходные данные
YES или NO.
## Примеры
```in
9
```
```out
YES
```
## Подсказки
- bin(n)[2:] — двоичная запись.
- Сравните её с разворотом.
- Без строк: постройте число из битов в обратном порядке.
## Решение: строка
@time: O(log N) @memory: O(log N)
```python
s = bin(int(input()))[2:]
print("YES" if s == s[::-1] else "NO")
```
## Решение: разворот битов
@time: O(log N) @memory: O(1)
```python
n = int(input())
r, m = 0, n
while m:
    r = (r << 1) | (m & 1)
    m >>= 1
print("YES" if r == n else "NO")
```
## Объяснение
9 = 1001₂ — палиндром.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "5", "6", "9", str(2**59 + 1), str(2**60)]))
```

# id: task:lonely-integer-bits
kind: task
title: Ближайшая большая степень двойки
category: Битовые операции
level: easy
tags: степень двойки, bit_length, округление вверх
related: py:method:int.bit_length
## Условие
Дано натуральное N. Выведите наименьшую степень двойки, не меньшую N.
## Входные данные
N (1 ≤ N ≤ 10^18).
## Выходные данные
Степень двойки.
## Примеры
```in
17
```
```out
32
```
## Подсказки
- Если N — степень двойки, ответ N.
- Иначе — 2^(число бит N).
- (N − 1).bit_length() даёт нужный показатель для обоих случаев.
## Решение: bit_length
@time: O(1) @memory: O(1)
```python
n = int(input())
print(1 << (n - 1).bit_length())
```
## Решение: удвоение
@time: O(log N) @memory: O(1)
```python
n = int(input())
p = 1
while p < n:
    p *= 2
print(p)
```
## Объяснение
Для N = 1: (0).bit_length() = 0, ответ 1.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "17", "1024", "1025", "1000000000000000000"]))
```

# id: task:poly-evaluate
kind: task
title: Значение многочлена
category: Арифметика
level: medium
tags: схема Горнера, многочлен
related: algo:number-systems
## Условие
Дан многочлен степени N коэффициентами a_N, …, a_0 (от старшего к младшему) и число X. Вычислите значение многочлена в точке X по модулю 10^9 + 7.
## Входные данные
N и X, затем N + 1 коэффициентов (целые, |a_i| ≤ 10^9, |X| ≤ 10^9).
## Выходные данные
Значение по модулю (от 0 до 10^9 + 6).
## Примеры
```in
2 3
1 -2 5
```
```out
8
```
## Подсказки
- Вычислять каждую степень X отдельно долго.
- Схема Горнера: ((a_N · X + a_{N−1}) · X + …) + a_0.
- Берите модуль на каждом шаге.
## Решение: схема Горнера
@time: O(N) @memory: O(1)
```python
n, x = map(int, input().split())
MOD = 10**9 + 7
res = 0
for a in map(int, input().split()):
    res = (res * x + a) % MOD
print(res)
```
## Решение: сумма степеней
@time: O(N) @memory: O(N)
```python
n, x = map(int, input().split())
MOD = 10**9 + 7
coef = list(map(int, input().split()))[::-1]
res, p = 0, 1
for a in coef:
    res = (res + a * p) % MOD
    p = p * x % MOD
print(res)
```
## Объяснение
x² − 2x + 5 при x = 3: 9 − 6 + 5 = 8.
## Генератор
```python
import json, random
random.seed(309)
t = ["0 5\n7", "1 -1\n1 1"]
for _ in range(4):
    n = random.randint(0, 30)
    t.append("%d %d\n%s" % (n, random.randint(-10**9, 10**9), " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n + 1))))
print(json.dumps(t))
```

# id: task:triangle-type
kind: task
title: Тип треугольника по углам
category: Геометрия
level: easy
tags: треугольник, теорема косинусов, остроугольный, тупоугольный
related: algo:geometry
## Условие
Даны стороны невырожденного треугольника. Определите, какой он: «acute» (остроугольный), «right» (прямоугольный) или «obtuse» (тупоугольный).
## Входные данные
Три натуральных числа (до 10^6).
## Выходные данные
acute, right или obtuse.
## Примеры
```in
3 4 5
```
```out
right
```
## Подсказки
- Тип угла против наибольшей стороны c определяет тип треугольника.
- Сравните c² с a² + b².
- Равенство — прямой угол, больше — тупой.
## Решение: сравнение квадратов
@time: O(1) @memory: O(1)
```python
a, b, c = sorted(map(int, input().split()))
d = a * a + b * b - c * c
print("right" if d == 0 else ("acute" if d > 0 else "obtuse"))
```
## Решение: через косинус наибольшего угла
@time: O(1) @memory: O(1)
Знак косинуса совпадает со знаком a² + b² − c² — вычисляем его целочисленно.
```python
a, b, c = sorted(map(int, input().split()))
cos_num = a * a + b * b - c * c
sign = (cos_num > 0) - (cos_num < 0)
print({1: "acute", 0: "right", -1: "obtuse"}[sign])
```
## Объяснение
Целочисленное сравнение избегает погрешностей float.
## Генератор
```python
import json
print(json.dumps(["3 4 5", "2 2 3", "5 5 5", "6 8 10", "2 3 4", "1000000 1000000 1000000"]))
```

# id: task:point-in-circle
kind: task
title: Точка в круге
category: Геометрия
level: beginner
tags: окружность, расстояние, сравнение квадратов
related: algo:geometry
## Условие
Даны центр круга (cx, cy), радиус R и точка (x, y). Выведите IN, если точка внутри круга, ON — на окружности, OUT — снаружи.
## Входные данные
cx cy R x y — целые числа (|координаты| ≤ 10^9, 1 ≤ R ≤ 10^9).
## Выходные данные
IN, ON или OUT.
## Примеры
```in
0 0 5 3 4
```
```out
ON
```
## Подсказки
- Сравните расстояние до центра с радиусом.
- Чтобы не извлекать корень, сравнивайте квадраты.
- dx² + dy² против R².
## Решение: квадраты расстояний
@time: O(1) @memory: O(1)
```python
cx, cy, r, x, y = map(int, input().split())
d2 = (x - cx) ** 2 + (y - cy) ** 2
print("IN" if d2 < r * r else ("ON" if d2 == r * r else "OUT"))
```
## Решение: math.dist (с осторожностью)
@time: O(1) @memory: O(1)
Для сравнения на равенство корень ненадёжен — используем isqrt и проверку точного квадрата.
```python
import math
cx, cy, r, x, y = map(int, input().split())
d2 = (x - cx) ** 2 + (y - cy) ** 2
root = math.isqrt(d2)
if root * root == d2:
    print("IN" if root < r else ("ON" if root == r else "OUT"))
else:
    print("IN" if root < r else "OUT")
```
## Объяснение
Если d² не полный квадрат, то √d² лежит строго между root и root + 1: точка внутри при root < r.
## Генератор
```python
import json
print(json.dumps(["0 0 5 3 4", "0 0 5 0 0", "0 0 5 4 4", "1 1 1 1 2", "-1000000000 0 1000000000 0 0", "0 0 2 1 2"]))
```

# id: task:traffic-light
kind: task
title: Светофор
category: Моделирование
level: easy
tags: цикл, остаток, периодический процесс
related: algo:simulation
## Условие
Светофор работает циклически: G секунд зелёный, Y секунд жёлтый, R секунд красный, затем снова зелёный. В момент 0 включился зелёный. Какой сигнал горит в момент T? (Момент смены относится к новому сигналу.)
## Входные данные
G, Y, R, T (1 ≤ G, Y, R ≤ 10^9, 0 ≤ T ≤ 10^18).
## Выходные данные
green, yellow или red.
## Примеры
```in
30 5 25 33
```
```out
yellow
```
## Подсказки
- Процесс повторяется с периодом G + Y + R.
- t = T mod период.
- Сравните t с границами G и G + Y.
## Решение: остаток от периода
@time: O(1) @memory: O(1)
```python
g, y, r, t = map(int, input().split())
t %= g + y + r
print("green" if t < g else ("yellow" if t < g + y else "red"))
```
## Решение: bisect по границам
@time: O(1) @memory: O(1)
```python
from bisect import bisect_right
g, y, r, t = map(int, input().split())
t %= g + y + r
print(["green", "yellow", "red"][bisect_right([g, g + y], t)])
```
## Объяснение
Поиск по отсортированным границам обобщается на светофор с любым числом фаз.
## Генератор
```python
import json
print(json.dumps(["1 1 1 0", "1 1 1 1", "1 1 1 2", "1 1 1 3", "30 5 25 33", "1000000000 1 1 1000000000000000000"]))
```

# id: task:bus-stop-simulation
kind: task
title: Автобус и пассажиры
category: Моделирование
level: easy
tags: моделирование, вместимость, минимум
related: algo:simulation
## Условие
Автобус вместимостью C проезжает N остановок. На i-й остановке выходит out_i пассажиров (не больше, чем едет), затем ждут in_i человек — садятся, сколько поместится, остальные остаются. Сколько человек всего не смогли уехать?
## Входные данные
C и N, затем N строк «out in».
## Выходные данные
Количество не уехавших.
## Примеры
```in
10 3
0 7
2 6
5 4
```
```out
1
```
## Подсказки
- Храните текущее число пассажиров.
- На остановке: сначала вычесть вышедших, потом добавить min(in, свободные места).
- Не поместившиеся — in − посадившиеся.
## Решение: моделирование
@time: O(N) @memory: O(1)
```python
c, n = map(int, input().split())
inside = left = 0
for _ in range(n):
    out, wait = map(int, input().split())
    inside -= out
    board = min(wait, c - inside)
    inside += board
    left += wait - board
print(left)
```
## Решение: функция шага
@time: O(N) @memory: O(1)
```python
def stop(inside, out, wait, cap):
    inside -= out
    board = min(wait, cap - inside)
    return inside + board, wait - board

c, n = map(int, input().split())
state, missed = 0, 0
for _ in range(n):
    state, m = stop(state, *map(int, input().split()), c)
    missed += m
print(missed)
```
## Объяснение
Остановка 1: 7 вошли. Остановка 2: вышли 2, вошли 5 из 6 (1 остался). Остановка 3: вышли 5, вошли 4.
## Генератор
```python
import json, random
random.seed(310)
t = []
for _ in range(4):
    c, n = random.randint(1, 20), random.randint(1, 10)
    inside, rows = 0, []
    for _ in range(n):
        out = random.randint(0, inside); inside -= out
        wait = random.randint(0, 10)
        inside += min(wait, c - inside)
        rows.append("%d %d" % (out, wait))
    t.append("%d %d\n%s" % (c, n, "\n".join(rows)))
print(json.dumps(t))
```

# id: task:class-rectangle
kind: task
title: Класс «Прямоугольник»
category: ООП
level: easy
tags: класс, методы, __str__, сравнение
related: py:topic:oop, py:topic:magic-methods
## Условие
Даны N прямоугольников (ширина и высота). Создайте класс Rect с методами area() и perimeter() и выведите прямоугольник с наибольшей площадью в формате «WxH area perimeter» (при равенстве — первый).
## Входные данные
N, затем N строк «W H».
## Выходные данные
Строка с описанием.
## Примеры
```in
3
2 5
3 3
1 10
```
```out
2x5 10 14
```
## Подсказки
- __init__ сохраняет стороны.
- max(rects, key=lambda r: r.area()) находит первый с максимальной площадью.
- __str__ задаёт формат вывода.
## Решение: класс с методами
@time: O(N) @memory: O(N)
```python
class Rect:
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h
    def perimeter(self):
        return 2 * (self.w + self.h)
    def __str__(self):
        return f"{self.w}x{self.h} {self.area()} {self.perimeter()}"

n = int(input())
rects = [Rect(*map(int, input().split())) for _ in range(n)]
print(max(rects, key=Rect.area))
```
## Решение: dataclass со свойствами
@time: O(N) @memory: O(N)
```python
from dataclasses import dataclass

@dataclass
class Rect:
    w: int
    h: int
    @property
    def area(self):
        return self.w * self.h
    @property
    def perimeter(self):
        return 2 * (self.w + self.h)

n = int(input())
best = max((Rect(*map(int, input().split())) for _ in range(n)), key=lambda r: r.area)
print(f"{best.w}x{best.h} {best.area} {best.perimeter}")
```
## Объяснение
key=Rect.area передаёт несвязанный метод как функцию одного аргумента.
## Генератор
```python
import json, random
random.seed(311)
t = ["1\n1 1"]
for _ in range(4):
    n = random.randint(1, 8)
    t.append("%d\n%s" % (n, "\n".join("%d %d" % (random.randint(1, 10), random.randint(1, 10)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:class-inventory
kind: task
title: Склад товаров
category: ООП
level: medium
tags: класс, словарь, команды, инкапсуляция
related: py:topic:oop, py:topic:encapsulation
## Условие
Реализуйте класс Inventory с командами: «add ITEM K» — добавить K штук, «remove ITEM K» — убрать K штук (если не хватает — вывести «not enough» и ничего не менять), «count ITEM» — вывести количество, «report» — вывести все товары с ненулевым количеством в алфавитном порядке в формате «ITEM:K» через пробел (или «empty»).
## Входные данные
Q, затем Q команд.
## Выходные данные
Ответы на команды.
## Примеры
```in
6
add apple 5
add pear 2
remove apple 7
remove apple 5
count apple
report
```
```out
not enough
0
pear:2
```
## Подсказки
- Класс хранит словарь «товар → количество».
- remove проверяет остаток до изменения.
- report фильтрует нулевые остатки и сортирует.
## Решение: класс-обёртка над словарём
@time: O(Q + K log K) @memory: O(K)
```python
class Inventory:
    def __init__(self):
        self._items = {}
    def add(self, item, k):
        self._items[item] = self._items.get(item, 0) + k
    def remove(self, item, k):
        if self._items.get(item, 0) < k:
            return False
        self._items[item] -= k
        return True
    def count(self, item):
        return self._items.get(item, 0)
    def report(self):
        items = [f"{i}:{k}" for i, k in sorted(self._items.items()) if k > 0]
        return " ".join(items) or "empty"

inv = Inventory()
for _ in range(int(input())):
    p = input().split()
    if p[0] == "add":
        inv.add(p[1], int(p[2]))
    elif p[0] == "remove":
        if not inv.remove(p[1], int(p[2])):
            print("not enough")
    elif p[0] == "count":
        print(inv.count(p[1]))
    else:
        print(inv.report())
```
## Решение: Counter
@time: O(Q + K log K) @memory: O(K)
```python
from collections import Counter
stock = Counter()
for _ in range(int(input())):
    p = input().split()
    if p[0] == "add":
        stock[p[1]] += int(p[2])
    elif p[0] == "remove":
        if stock[p[1]] < int(p[2]):
            print("not enough")
        else:
            stock[p[1]] -= int(p[2])
    elif p[0] == "count":
        print(stock[p[1]])
    else:
        print(" ".join(f"{i}:{k}" for i, k in sorted(stock.items()) if k > 0) or "empty")
```
## Объяснение
Класс скрывает словарь (атрибут _items) и даёт понятный интерфейс операций.
## Генератор
```python
import json, random
random.seed(312)
t = ["1\nreport"]
for _ in range(4):
    q = random.randint(1, 20)
    cmds = []
    for _ in range(q):
        c = random.choice(["add", "remove", "count", "report"])
        it = random.choice(["apple", "pear", "plum"])
        cmds.append("%s %s %d" % (c, it, random.randint(1, 5)) if c in ("add", "remove") else ("count %s" % it if c == "count" else "report"))
    t.append("%d\n%s" % (q, "\n".join(cmds)))
print(json.dumps(t))
```

# id: task:read-table-file
kind: task
title: Средняя оценка из таблицы
category: Файлы
level: easy
tags: чтение файла построчно, разбор строк, среднее
related: py:topic:files, lib:sys.stdin
## Условие
На вход подаётся содержимое файла: первая строка — заголовок «name;math;physics;cs», дальше — строки учеников. Выведите имя ученика с максимальным средним баллом и сам средний балл с двумя знаками (при равенстве — первый по порядку).
## Входные данные
Строки файла (не менее одного ученика).
## Выходные данные
Имя и средний балл.
## Примеры
```in
name;math;physics;cs
ali;5;4;5
vali;5;5;5
gani;3;4;5
```
```out
vali 5.00
```
## Подсказки
- Пропустите строку заголовка.
- Разделите строку по «;», баллы преобразуйте в числа.
- Сравнивайте средние, запоминая лучшего.
## Решение: построчное чтение
@time: O(N) @memory: O(1)
```python
import sys
lines = iter(sys.stdin)
next(lines)
best_name, best = None, -1.0
for line in lines:
    line = line.strip()
    if not line:
        continue
    name, *marks = line.split(";")
    avg = sum(map(int, marks)) / len(marks)
    if avg > best:
        best_name, best = name, avg
print(best_name, f"{best:.2f}")
```
## Решение: модуль csv
@time: O(N) @memory: O(N)
```python
import csv
import sys
rows = list(csv.reader(sys.stdin, delimiter=";"))[1:]
rows = [r for r in rows if r]
name, *marks = max(rows, key=lambda r: sum(map(int, r[1:])) / len(r[1:]))
print(name, "%.2f" % (sum(map(int, marks)) / len(marks)))
```
## Объяснение
max возвращает первый элемент с наибольшим ключом — это совпадает с условием при равенстве.
## Генератор
```python
import json, random
random.seed(313)
t = []
for _ in range(4):
    rows = ["name;math;physics;cs"]
    for i in range(random.randint(1, 8)):
        rows.append("st%d;%d;%d;%d" % (i, random.randint(2, 5), random.randint(2, 5), random.randint(2, 5)))
    t.append("\n".join(rows))
print(json.dumps(t))
```

# id: task:dp-min-path-triangle
kind: task
title: Путь в числовом треугольнике
category: Динамическое программирование
level: medium
tags: DP, треугольник, снизу вверх
related: algo:dp
## Условие
Дан числовой треугольник из N строк (в i-й строке i чисел). Двигаясь от вершины вниз, можно переходить к одному из двух соседних чисел строки ниже. Найдите максимальную сумму пути.
## Входные данные
N (1 ≤ N ≤ 1000), затем N строк треугольника.
## Выходные данные
Максимальная сумма.
## Примеры
```in
4
3
7 4
2 4 6
8 5 9 3
```
```out
23
```
## Подсказки
- Перебор путей — 2^(N−1) вариантов.
- Идите снизу вверх: лучший путь из клетки = значение + max(двух лучших снизу).
- Ответ окажется в вершине.
## Решение: снизу вверх
@time: O(N²) @memory: O(N)
```python
n = int(input())
rows = [list(map(int, input().split())) for _ in range(n)]
best = rows[-1][:]
for i in range(n - 2, -1, -1):
    best = [rows[i][j] + max(best[j], best[j + 1]) for j in range(i + 1)]
print(best[0])
```
## Решение: сверху вниз
@time: O(N²) @memory: O(N)
```python
n = int(input())
cur = list(map(int, input().split()))
for _ in range(n - 1):
    row = list(map(int, input().split()))
    nxt = []
    for j, x in enumerate(row):
        left = cur[j - 1] if j > 0 else float("-inf")
        right = cur[j] if j < len(cur) else float("-inf")
        nxt.append(x + max(left, right))
    cur = nxt
print(max(cur))
```
## Объяснение
Путь в примере: 3 → 7 → 4 → 9.
## Генератор
```python
import json, random
random.seed(314)
t = ["1\n5"]
for n in (2, 5, 30):
    t.append("%d\n%s" % (n, "\n".join(" ".join(str(random.randint(0, 99)) for _ in range(i + 1)) for i in range(n))))
print(json.dumps(t))
```

# id: task:dp-max-square
kind: task
title: Наибольший квадрат из единиц
category: Динамическое программирование
level: hard
tags: DP по сетке, квадрат, матрица
related: algo:dp, algo:matrices
## Условие
Дана матрица из 0 и 1. Найдите площадь наибольшего квадрата, состоящего только из единиц.
## Входные данные
N и M (до 1000), затем N строк из символов 0 и 1.
## Выходные данные
Площадь квадрата.
## Примеры
```in
4 5
10100
10111
11111
10010
```
```out
4
```
## Подсказки
- dp[i][j] — сторона наибольшего квадрата с правым нижним углом в (i, j).
- dp[i][j] = 1 + min(сверху, слева, по диагонали), если клетка равна 1.
- Ответ — квадрат максимума dp.
## Решение: динамика
@time: O(N·M) @memory: O(M)
```python
n, m = map(int, input().split())
prev = [0] * (m + 1)
best = 0
for _ in range(n):
    row = input().strip()
    cur = [0] * (m + 1)
    for j in range(1, m + 1):
        if row[j - 1] == "1":
            cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
            best = max(best, cur[j])
    prev = cur
print(best * best)
```
## Решение: префиксные суммы и перебор размера
@time: O(N·M·min(N, M)) @memory: O(N·M)
Для каждого угла и размера проверяем сумму квадрата за O(1).
```python
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
P = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(n):
    for j in range(m):
        P[i + 1][j + 1] = (g[i][j] == "1") + P[i][j + 1] + P[i + 1][j] - P[i][j]
best = 0
for i in range(n):
    for j in range(m):
        k = best + 1
        while i + k <= n and j + k <= m and P[i + k][j + k] - P[i][j + k] - P[i + k][j] + P[i][j] == k * k:
            best = k
            k += 1
print(best * best)
```
## Объяснение
Во втором способе проверяются только размеры больше уже найденного — это заметно ускоряет перебор.
## Генератор
```python
import json, random
random.seed(315)
t = ["1 1\n0", "1 1\n1", "2 2\n11\n11"]
for _ in range(3):
    n, m = random.randint(1, 12), random.randint(1, 12)
    t.append("%d %d\n%s" % (n, m, "\n".join("".join(random.choice("1110") for _ in range(m)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:subsequence-check
kind: task
title: Является ли строка подпоследовательностью
category: Два указателя
level: easy
tags: подпоследовательность, два указателя, итератор
related: algo:two-pointers
## Условие
Даны строки S и T. Выведите YES, если S можно получить из T удалением некоторых символов (S — подпоследовательность T).
## Входные данные
S и T на отдельных строках (до 10^5).
## Выходные данные
YES или NO.
## Примеры
```in
ace
abcde
```
```out
YES
```
## Подсказки
- Идите по T, сдвигая указатель в S при совпадении.
- Если указатель дошёл до конца S — ответ YES.
- Трюк с итератором: all(ch in it for ch in s).
## Решение: два указателя
@time: O(|T|) @memory: O(1)
```python
s = input()
t = input()
i = 0
for ch in t:
    if i < len(s) and s[i] == ch:
        i += 1
print("YES" if i == len(s) else "NO")
```
## Решение: итератор
@time: O(|T|) @memory: O(1)
Проверка ch in it «съедает» итератор до найденного символа включительно.
```python
s = input()
it = iter(input())
print("YES" if all(ch in it for ch in s) else "NO")
```
## Объяснение
Порядок символов важен: «aec» не является подпоследовательностью «abcde».
## Генератор
```python
import json
print(json.dumps(["\nabc", "a\na", "abc\nacb", "aaa\naa", "ace\nabcde", "z\nabc"]))
```

# id: task:three-sum-zero
kind: task
title: Тройки с нулевой суммой
category: Два указателя
level: hard
tags: три суммы, сортировка, два указателя, уникальные тройки
related: algo:two-pointers, task:pair-sum-sorted
## Условие
Дан массив чисел. Найдите количество различных (по значениям) троек a ≤ b ≤ c из элементов массива (разных позиций), сумма которых равна 0.
## Входные данные
N (3 ≤ N ≤ 3000), затем N чисел.
## Выходные данные
Количество различных троек.
## Примеры
```in
6
-1 0 1 2 -1 -4
```
```out
2
```
## Подсказки
- Перебор троек — O(N³).
- Отсортируйте массив и зафиксируйте первый элемент.
- Для остальных двух — два указателя; пропускайте повторяющиеся значения.
## Решение: сортировка + два указателя
@time: O(N²) @memory: O(N)
```python
n = int(input())
a = sorted(map(int, input().split()))
count = 0
for i in range(n - 2):
    if i and a[i] == a[i - 1]:
        continue
    l, r = i + 1, n - 1
    while l < r:
        s = a[i] + a[l] + a[r]
        if s < 0:
            l += 1
        elif s > 0:
            r -= 1
        else:
            count += 1
            lv, rv = a[l], a[r]
            while l < r and a[l] == lv:
                l += 1
            while l < r and a[r] == rv:
                r -= 1
print(count)
```
## Решение: множество троек
@time: O(N²) @memory: O(N²) в худшем
Для каждой пары ищем третье значение среди уже просмотренных элементов.
```python
n = int(input())
a = list(map(int, input().split()))
triples = set()
for j in range(n):
    seen = set()
    for k in range(j + 1, n):
        need = -a[j] - a[k]
        if need in seen:
            triples.add(tuple(sorted((a[j], a[k], need))))
        seen.add(a[k])
print(len(triples))
```
## Объяснение
Пропуск одинаковых значений в первом способе гарантирует, что каждая тройка значений считается один раз.
## Генератор
```python
import json, random
random.seed(316)
t = ["3\n0 0 0", "4\n0 0 0 0", "3\n1 2 3"]
for n in (10, 50, 300):
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-15, 15)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:kth-missing
kind: task
title: K-е пропущенное натуральное
category: Бинарный поиск
level: medium
tags: бинарный поиск, пропущенные числа
related: algo:binary-search
## Условие
Дан строго возрастающий массив натуральных чисел и число K. Найдите K-е по счёту натуральное число, которого нет в массиве.
## Входные данные
N и K (1 ≤ N ≤ 2·10^5, 1 ≤ K ≤ 10^9), затем N чисел (до 10^9).
## Выходные данные
K-е пропущенное число.
## Примеры
```in
5 5
2 3 4 7 11
```
```out
9
```
## Подсказки
- До элемента a[i] пропущено a[i] − (i + 1) чисел.
- Эта величина не убывает — подходит бинарный поиск.
- Найдите, сколько элементов массива меньше ответа: ответ = K + это количество.
## Решение: бинарный поиск
@time: O(log N) @memory: O(N)
```python
n, k = map(int, input().split())
a = list(map(int, input().split()))
lo, hi = 0, n
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] - (mid + 1) < k:
        lo = mid + 1
    else:
        hi = mid
print(k + lo)
```
## Решение: линейный проход
@time: O(N) @memory: O(1)
```python
n, k = map(int, input().split())
ans = k
for x in map(int, input().split()):
    if x <= ans:
        ans += 1
    else:
        break
print(ans)
```
## Объяснение
Каждый элемент массива, не превосходящий текущего кандидата, «сдвигает» ответ на 1.
## Генератор
```python
import json, random
random.seed(317)
t = ["1 1\n1", "1 1\n2", "3 2\n1 2 3"]
for _ in range(4):
    n = random.randint(1, 30)
    a = sorted(random.sample(range(1, 80), n))
    t.append("%d %d\n%s" % (n, random.randint(1, 60), " ".join(map(str, a))))
print(json.dumps(t))
```

# id: task:heap-task-scheduler
kind: task
title: Обработка заявок по приоритету
category: Куча
level: medium
tags: куча, приоритет, порядок поступления
related: algo:heap, lib:heapq.heappush
## Условие
Поступают команды: «add NAME P» — заявка с приоритетом P (чем больше, тем важнее), «next» — обработать самую важную заявку (при равных приоритетах — раньше добавленную) и вывести её имя, или «none», если заявок нет.
## Входные данные
Q, затем Q команд.
## Выходные данные
Ответы на команды next.
## Примеры
```in
6
add a 2
add b 5
add c 5
next
next
next
```
```out
b
c
a
```
## Подсказки
- Нужна очередь с приоритетом — куча.
- heapq — min-куча, поэтому кладите −P.
- Порядок добавления — счётчик во втором элементе кортежа.
## Решение: heapq с счётчиком
@time: O(Q log Q) @memory: O(Q)
```python
import heapq
h = []
counter = 0
for _ in range(int(input())):
    p = input().split()
    if p[0] == "add":
        heapq.heappush(h, (-int(p[2]), counter, p[1]))
        counter += 1
    else:
        print(heapq.heappop(h)[2] if h else "none")
```
## Решение: queue.PriorityQueue
@time: O(Q log Q) @memory: O(Q)
```python
from queue import PriorityQueue
pq = PriorityQueue()
for i in range(int(input())):
    p = input().split()
    if p[0] == "add":
        pq.put((-int(p[2]), i, p[1]))
    else:
        print(pq.get()[2] if not pq.empty() else "none")
```
## Объяснение
Счётчик в кортеже делает сравнение однозначным и сохраняет порядок поступления.
## Генератор
```python
import json, random
random.seed(318)
t = ["1\nnext"]
for _ in range(4):
    q = random.randint(1, 25)
    cmds = ["add t%d %d" % (i, random.randint(1, 3)) if random.random() < 0.6 else "next" for i in range(q)]
    t.append("%d\n%s" % (q, "\n".join(cmds)))
print(json.dumps(t))
```

# id: task:max-product-pair
kind: task
title: Максимальное произведение пары
category: Сортировка
level: medium
tags: произведение, отрицательные числа, сортировка
related: algo:sorting, lib:heapq.nlargest
## Условие
Дан массив из N целых чисел (возможно отрицательных). Найдите максимальное произведение двух элементов на разных позициях.
## Входные данные
N (2 ≤ N ≤ 2·10^5), затем N чисел (|a_i| ≤ 10^9).
## Выходные данные
Максимальное произведение.
## Примеры
```in
5
-10 -4 5 6 -2
```
```out
40
```
## Подсказки
- Максимум даёт либо пара наибольших, либо пара наименьших (двух отрицательных).
- После сортировки сравните a[0]·a[1] и a[−1]·a[−2].
- Без сортировки — найдите два минимума и два максимума за один проход.
## Решение: сортировка
@time: O(N log N) @memory: O(N)
```python
input()
a = sorted(map(int, input().split()))
print(max(a[0] * a[1], a[-1] * a[-2]))
```
## Решение: nlargest и nsmallest
@time: O(N) @memory: O(N)
```python
import heapq
input()
a = list(map(int, input().split()))
x1, x2 = heapq.nlargest(2, a)
y1, y2 = heapq.nsmallest(2, a)
print(max(x1 * x2, y1 * y2))
```
## Объяснение
В примере произведение двух отрицательных −10 · −4 = 40 больше, чем произведение двух наибольших 6 · 5 = 30.
## Генератор
```python
import json, random
random.seed(319)
t = ["2\n-5 -5", "2\n-5 5", "3\n0 0 -1"]
for _ in range(4):
    n = random.randint(2, 100)
    t.append("%d\n%s" % (n, " ".join(str(random.randint(-10**9, 10**9)) for _ in range(n))))
print(json.dumps(t))
```
