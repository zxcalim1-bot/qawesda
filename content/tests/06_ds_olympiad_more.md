# id: quiz:ds:031
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: a = [5, 3, 5, 1]\nprint(a.index(5), a.count(5), a[::-1].index(5))
wrong: 0 2 0 | 2 2 0 | 0 1 1
explain: index — первая позиция; в развёрнутом списке 5 стоит на позиции 1.

# id: quiz:ds:032
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: d = {}\nd.setdefault("k", []).append(1)\nd.setdefault("k", []).append(2)\nprint(d)
wrong: {'k': [2]} | {'k': [1]} | {'k': [[1], [2]]}
explain: setdefault возвращает существующее значение, если ключ уже есть.

# id: quiz:ds:033
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: d = {"a": 1, "b": 2}\nprint(d.pop("a"), d, d.pop("z", 0))
wrong: a {'b': 2} 0 | 1 {'a': 1, 'b': 2} 0 | 1 {'b': 2} KeyError
explain: pop с значением по умолчанию не бросает KeyError.

# id: quiz:ds:034
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: a = {1, 2}\na.add(2)\na.discard(5)\na.update([3, 4])\nprint(sorted(a))
wrong: [1, 2, 2, 3, 4] | KeyError | [1, 2, 3, 4, 5]
explain: discard не бросает ошибку при отсутствии элемента (remove бросил бы KeyError).

# id: quiz:ds:035
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: m = [[0] * 3 for _ in range(2)]\nm[0][1] = 7\nprint(m)
wrong: [[0, 7, 0], [0, 7, 0]] | [[7, 0, 0], [0, 0, 0]] | [[0, 0], [7, 0], [0, 0]]
explain: Генератор создаёт независимые строки.

# id: quiz:ds:036
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: from collections import deque\nd = deque(maxlen=3)\nfor x in range(6):\n    d.append(x)\nprint(list(d))
wrong: [0, 1, 2] | [0, 1, 2, 3, 4, 5] | [5, 4, 3]
explain: При переполнении deque с maxlen удаляет элементы с другого конца.

# id: quiz:ds:037
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: import heapq\ntasks = [(2, "b"), (1, "z"), (1, "a")]\nheapq.heapify(tasks)\nprint([heapq.heappop(tasks)[1] for _ in range(3)])
wrong: ['z', 'a', 'b'] | ['b', 'z', 'a'] | ['a', 'b', 'z']
explain: Кортежи сравниваются поэлементно: при равном приоритете — по строке.

# id: quiz:ds:038
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: from collections import Counter\na = Counter("aab")\nb = Counter("abc")\nprint(sorted((a - b).items()), sorted((a & b).items()))
wrong: [('a', 1), ('c', -1)] [('a', 1), ('b', 1)] | [('a', 2)] [('b', 1)] | [] [('a', 1), ('b', 1), ('c', 1)]
explain: Вычитание Counter отбрасывает неположительные счётчики; & — минимум счётчиков.

# id: quiz:ds:039
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: from collections import ChainMap\ndefaults = {"color": "red", "size": 1}\nuser = {"size": 3}\nc = ChainMap(user, defaults)\nprint(c["color"], c["size"])
wrong: red 1 | KeyError | None 3
explain: ChainMap ищет ключ по очереди в словарях.

# id: quiz:ds:040
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: s = "level"\nst = list(s)\nprint(all(st.pop() == ch for ch in s))
wrong: False | level | IndexError
explain: Стек отдаёт символы в обратном порядке — строка палиндром.

# id: quiz:ds:041
kind: quiz
type: fact
category: ds
level: 2
q: Какая структура позволяет за O(1) брать и добавлять элементы с обоих концов?
options: collections.deque | list | str | tuple
answer: 1
explain: list быстрый только с конца.

# id: quiz:ds:042
kind: quiz
type: fact
category: ds
level: 3
q: Чем dict.keys() отличается от list(d)?
options: keys() — «живое» представление, которое отражает изменения словаря | keys() возвращает отсортированный список | Ничем, оба — копии | keys() содержит значения
answer: 1
explain: Представления (views) меняются вместе со словарём.

# id: quiz:ds:043
kind: quiz
type: fact
category: ds
level: 3
q: Что из этого НЕ гарантирует порядок элементов при обходе?
options: set | dict (Python 3.7+) | list | collections.deque
answer: 1
explain: Порядок обхода множества зависит от хешей.

# id: quiz:ds:044
kind: quiz
type: fact
category: ds
level: 3
q: Для чего array.array из стандартной библиотеки?
options: Компактное хранение чисел одного типа | Многомерные матрицы с операциями линейной алгебры | Хранение строк разной длины | Многопоточная очередь
answer: 1
explain: array хранит «сырые» числа — экономит память по сравнению со списком объектов int.

# id: quiz:ds:045
kind: quiz
type: complexity
category: ds
level: 2
q: Какая сложность у len(a) для списка?
options: O(1) | O(n) | O(log n) | Зависит от элементов
answer: 1
explain: Длина хранится в объекте списка.

# id: quiz:ds:046
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность поиска наименьшего элемента в куче heapq?
options: O(1) — это h[0] | O(log n) | O(n) | O(n log n)
answer: 1
explain: Корень кучи всегда минимален.

# id: quiz:ds:047
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность объединения двух множеств a | b размеров n и m?
options: O(n + m) | O(n·m) | O(log(n + m)) | O(1)
answer: 1
explain: Каждый элемент вставляется в новое множество.

# id: quiz:ds:048
kind: quiz
type: algorithm
category: ds
level: 3
q: Нужно хранить отсортированный набор с быстрым добавлением и поиском k-го элемента при n до 10^5. Что подойдёт в Python без внешних библиотек?
options: Дерево Фенвика по сжатым значениям | Список с insert | Обычный set | Строка
answer: 1
explain: Фенвик даёт добавление и поиск k-го за O(log n); insert в список — O(n).

# id: quiz:ds:049
kind: quiz
type: algorithm
category: ds
level: 3
q: Нужно проверять сбалансированность скобок трёх типов. Структура?
options: Стек | Очередь | Куча | Множество
answer: 1
explain: Последняя открытая скобка должна закрываться первой.

# id: quiz:ds:050
kind: quiz
type: algorithm
category: ds
level: 3
q: Нужно для каждого элемента найти ближайший больший справа за O(n). Структура?
options: Монотонный стек | Куча | Словарь | Двоичный поиск по массиву
answer: 1
explain: Каждый элемент кладётся и снимается со стека один раз.

# id: quiz:olympiad:031
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (поиск цикла)?
code: x, seen, i = 1, {}, 0\nwhile x not in seen:\n    seen[x] = i\n    x = x * 2 % 7\n    i += 1\nprint(seen[x], i - seen[x])
wrong: 1 3 | 0 6 | 3 0
explain: 1 → 2 → 4 → 1: цикл длины 3 начинается сразу.

# id: quiz:olympiad:032
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (разностный массив)?
code: d = [0] * 6\nfor l, r, v in [(0, 2, 1), (1, 4, 2)]:\n    d[l] += v\n    d[r + 1] -= v\ncur, out = 0, []\nfor x in d[:5]:\n    cur += x\n    out.append(cur)\nprint(out)
wrong: [1, 2, 2, 0, 0] | [1, 3, 3, 0, 0] | [3, 3, 3, 2, 2]
explain: К [0..2] прибавили 1, к [1..4] — 2.

# id: quiz:olympiad:033
kind: quiz
type: output
category: olympiad
level: 4
q: Что выведет программа (битсет сумм)?
code: reach = 1\nfor x in [3, 5]:\n    reach |= reach << x\nprint([s for s in range(10) if reach >> s & 1])
wrong: [3, 5, 8] | [0, 3, 5] | [0, 1, 3, 5, 8]
explain: Достижимые суммы подмножеств: 0, 3, 5, 8.

# id: quiz:olympiad:034
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (комбинаторика)?
code: import math\nprint(math.comb(5, 2), math.perm(5, 2), math.comb(6, 3) // 4)
wrong: 20 10 5 | 10 10 5 | 10 20 4
explain: C(5,2) = 10, A(5,2) = 20, C(6,3)/4 = 5 — число Каталана C₃.

# id: quiz:olympiad:035
kind: quiz
type: output
category: olympiad
level: 4
q: Что выведет программа (Z-функция)?
code: s = "aaabaab"\nn = len(s)\nz = [0] * n\nl = r = 0\nfor i in range(1, n):\n    if i < r:\n        z[i] = min(r - i, z[i - l])\n    while i + z[i] < n and s[z[i]] == s[i + z[i]]:\n        z[i] += 1\n    if i + z[i] > r:\n        l, r = i, i + z[i]\nprint(z)
wrong: [7, 2, 1, 0, 2, 1, 0] | [0, 1, 2, 0, 1, 2, 0] | [0, 2, 1, 0, 3, 1, 0]
explain: z[0] по соглашению 0; например, с позиции 4 совпадает «aab» — но префикс «aaa», поэтому z[4] = 2.

# id: quiz:olympiad:036
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (расстояние Левенштейна)?
code: a, b = "cat", "cut"\nprev = list(range(len(b) + 1))\nfor i, ca in enumerate(a, 1):\n    cur = [i]\n    for j, cb in enumerate(b, 1):\n        cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))\n    prev = cur\nprint(prev[-1])
wrong: 0 | 2 | 3
explain: Одна замена a → u.

# id: quiz:olympiad:037
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (топологическая сортировка)?
code: from graphlib import TopologicalSorter\nts = TopologicalSorter({"c": {"a", "b"}, "b": {"a"}})\nprint(list(ts.static_order()))
wrong: ['c', 'b', 'a'] | ['b', 'a', 'c'] | ['a', 'c', 'b']
explain: Сначала a (нет зависимостей), затем b, затем c.

# id: quiz:olympiad:038
kind: quiz
type: output
category: olympiad
level: 4
q: Что выведет программа (векторное произведение)?
code: def cross(o, a, b):\n    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])\nprint(cross((0, 0), (1, 0), (0, 1)), cross((0, 0), (1, 1), (2, 2)))
wrong: -1 0 | 1 1 | 0 1
explain: Положительное значение — поворот налево; 0 — точки на одной прямой.

# id: quiz:olympiad:039
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа?
code: from functools import lru_cache\n@lru_cache(maxsize=None)\ndef ways(n):\n    return 1 if n <= 1 else ways(n - 1) + ways(n - 2)\nprint(ways(30), ways.cache_info().currsize)
wrong: 832040 30 | 1346269 1 | 514229 31
explain: ways(n) = F(n+1); в кэше 31 значение (n = 0..30).

# id: quiz:olympiad:040
kind: quiz
type: output
category: olympiad
level: 4
q: Что выведет программа (функция Эйлера)?
code: n, phi, p = 36, 36, 2\nm = n\nwhile p * p <= m:\n    if m % p == 0:\n        while m % p == 0:\n            m //= p\n        phi -= phi // p\n    p += 1\nif m > 1:\n    phi -= phi // m\nprint(phi)
wrong: 18 | 24 | 6
explain: φ(36) = 36 · (1 − 1/2) · (1 − 1/3) = 12.

# id: quiz:olympiad:041
kind: quiz
type: fact
category: olympiad
level: 3
q: Почему сравнивать float через == опасно в геометрии?
options: Ошибки округления делают «равные» значения слегка различными | float не поддерживает == | == сравнивает только целые | Это медленно
answer: 1
explain: Сравнивайте с допуском eps или переходите к целочисленной арифметике.

# id: quiz:olympiad:042
kind: quiz
type: fact
category: olympiad
level: 4
q: Что означает «амортизированная» сложность O(1) у list.append?
options: Отдельная операция иногда дорогая (перевыделение памяти), но в среднем по серии — O(1) | Каждая операция строго O(1) | O(1) только для маленьких списков | O(1) при включённой оптимизации
answer: 1
explain: Ёмкость растёт с запасом, поэтому перевыделения редки.

# id: quiz:olympiad:043
kind: quiz
type: fact
category: olympiad
level: 4
q: Какой приём уменьшает память DP по двум строкам LCS с O(n·m) до O(m)?
options: Хранить только предыдущую и текущую строку таблицы | Использовать рекурсию | Сортировать строки | Хранить таблицу в словаре
answer: 1
explain: Переход использует только строку i−1 (но тогда сложнее восстановить ответ).

# id: quiz:olympiad:044
kind: quiz
type: fact
category: olympiad
level: 4
q: Что такое сжатие координат?
options: Замена значений их рангами 0..k−1 с сохранением порядка | Удаление дубликатов из ввода | Сжатие ввода в архив | Округление чисел
answer: 1
explain: Позволяет индексировать массивы (Фенвик, разностный массив) по огромным значениям.

# id: quiz:olympiad:045
kind: quiz
type: complexity
category: olympiad
level: 4
q: Сколько операций примерно в DP по цифрам для N до 10^18 с суммой цифр до 162?
options: Около 19 · 163 · 10 · 2 | Около 10^18 | Около 2^19 | Около 162!
answer: 1
explain: Позиций 19, сумм 163, цифр 10, флаг tight — 2 значения.

# id: quiz:olympiad:046
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти минимальный период строки (наименьшую T, повторением которой получается S). Что использовать?
options: Префикс-функцию: p = n − π[n−1], если n делится на p | Сортировку символов | BFS по подстрокам | Решето
answer: 1
explain: Это классическое свойство префикс-функции.

# id: quiz:olympiad:047
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти максимальную прибыль от непересекающихся заказов с весами. Метод?
options: DP по заказам, отсортированным по концу, + бинарный поиск совместимого | Жадный выбор по концу | Жадный выбор по прибыли | Перебор для n до 2·10^5
answer: 1
explain: Жадный выбор по концу верен только без весов.

# id: quiz:olympiad:048
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти площадь объединения прямоугольников при N ≤ 50. Простой метод?
options: Сжатие координат и подсчёт покрытых клеток сетки | Сумма площадей всех прямоугольников | Выпуклая оболочка | BFS
answer: 1
explain: После сжатия получается сетка не больше 100×100 «клеток» разных размеров.

# id: quiz:olympiad:049
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Расстояние между вершинами дерева для 10^5 запросов. Подход?
options: LCA двоичными подъёмами: dist = depth[u] + depth[v] − 2·depth[lca] | BFS для каждого запроса | Флойд | Топологическая сортировка
answer: 1
explain: O(log n) на запрос после O(n log n) предподсчёта.

# id: quiz:olympiad:050
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Нужно минимальное время, за которое K рабочих выполнят все задачи (каждая задача целиком одному рабочему, задачи по порядку). Идея?
options: Бинарный поиск по ответу T с жадной проверкой «хватит ли K рабочих» | Сортировка задач | DP по маскам при n до 10^5 | Жадно отдавать каждую задачу свободному рабочему
answer: 1
explain: Если можно уложиться в T, то можно и в любое большее — предикат монотонен.
