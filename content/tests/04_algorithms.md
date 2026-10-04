# id: quiz:algo:001
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность бинарного поиска в отсортированном массиве из n элементов?
options: O(log n) | O(n) | O(n log n) | O(1)
answer: 1
explain: Отрезок поиска каждый раз уменьшается вдвое.

# id: quiz:algo:002
kind: quiz
type: complexity
category: algorithms
level: 1
q: Какова сложность этого кода?
code: for i in range(n):\n    for j in range(n):\n        s += i * j
options: O(n²) | O(n) | O(2n) | O(log n)
answer: 1
explain: Два вложенных цикла по n — n·n итераций.

# id: quiz:algo:003
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность этого кода?
code: i = 1\nwhile i < n:\n    i *= 2
options: O(log n) | O(n) | O(√n) | O(n²)
answer: 1
explain: i удваивается — до n нужно log₂ n шагов.

# id: quiz:algo:004
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность этого кода?
code: for i in range(n):\n    j = i\n    while j > 0:\n        j //= 2
options: O(n log n) | O(n²) | O(n) | O(log n)
answer: 1
explain: Внешний цикл n раз, внутренний — log i раз.

# id: quiz:algo:005
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность проверки простоты перебором делителей до √n?
options: O(√n) | O(n) | O(log n) | O(n²)
answer: 1
explain: Перебираются делители от 2 до √n.

# id: quiz:algo:006
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность sorted() для списка из n элементов?
options: O(n log n) | O(n) | O(n²) | O(log n)
answer: 1
explain: Timsort — O(n log n) в худшем случае.

# id: quiz:algo:007
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность наивной рекурсии fib(n) = fib(n−1) + fib(n−2) без запоминания?
options: Экспоненциальная (около 1.6^n) | O(n) | O(n²) | O(log n)
answer: 1
explain: Одни и те же значения пересчитываются огромное число раз; с @lru_cache — O(n).

# id: quiz:algo:008
kind: quiz
type: complexity
category: algorithms
level: 2
q: Сколько времени займёт решето Эратосфена до n?
options: O(n log log n) | O(n²) | O(n√n) | O(log n)
answer: 1
explain: Сумма n/p по простым p даёт n log log n.

# id: quiz:algo:009
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность алгоритма Евклида для gcd(a, b)?
options: O(log min(a, b)) | O(min(a, b)) | O(a·b) | O(1)
answer: 1
explain: Каждые два шага число уменьшается как минимум вдвое.

# id: quiz:algo:010
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность быстрого возведения в степень pow(a, n, m)?
options: O(log n) | O(n) | O(√n) | O(n log n)
answer: 1
explain: Показатель делится пополам на каждом шаге.

# id: quiz:algo:011
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность перебора всех подмножеств множества из n элементов?
options: O(2^n) | O(n!) | O(n²) | O(n log n)
answer: 1
explain: Каждый элемент либо входит, либо нет — 2^n вариантов.

# id: quiz:algo:012
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность BFS на графе из V вершин и E рёбер (списки смежности)?
options: O(V + E) | O(V·E) | O(V²) | O(E log V)
answer: 1
explain: Каждая вершина и каждое ребро обрабатываются по одному разу.

# id: quiz:algo:013
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность алгоритма Дейкстры с двоичной кучей?
options: O((V + E) log V) | O(V + E) | O(V³) | O(V·E)
answer: 1
explain: Каждое ребро может положить вершину в кучу; операция с кучей — O(log V).

# id: quiz:algo:014
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность алгоритма Флойда–Уоршелла?
options: O(V³) | O(V²) | O(E log V) | O(V + E)
answer: 1
explain: Три вложенных цикла по вершинам.

# id: quiz:algo:015
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность кода с проверкой x in lst внутри цикла по n элементам (lst — список длины n)?
code: for x in data:\n    if x in lst:\n        cnt += 1
options: O(n²) | O(n) | O(n log n) | O(1)
answer: 1
explain: in для списка — линейный поиск; замените список на set.

# id: quiz:algo:016
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность двух указателей на отсортированном массиве (поиск пары с суммой)?
options: O(n) | O(n²) | O(n log n) | O(log n)
answer: 1
explain: Каждый указатель двигается только в одну сторону.

# id: quiz:algo:017
kind: quiz
type: algorithm
category: algorithms
level: 2
q: Нужно найти кратчайший путь (по числу ходов) в лабиринте. Какой алгоритм подходит лучше всего?
options: Обход в ширину (BFS) | Обход в глубину (DFS) | Сортировка слиянием | Жадный выбор ближайшей клетки
answer: 1
explain: BFS обходит клетки по слоям расстояния и находит кратчайший путь в невзвешенном графе.

# id: quiz:algo:018
kind: quiz
type: algorithm
category: algorithms
level: 2
q: Нужно много раз узнавать сумму элементов массива на отрезке [l, r]; массив не меняется. Что использовать?
options: Префиксные суммы | Сортировку | Бинарный поиск | Стек
answer: 1
explain: После O(n) предподсчёта каждая сумма — O(1).

# id: quiz:algo:019
kind: quiz
type: algorithm
category: algorithms
level: 2
q: Нужно найти все простые числа до 10^7. Что выбрать?
options: Решето Эратосфена | Проверку каждого числа перебором до n | Бинарный поиск | BFS
answer: 1
explain: Решето работает почти линейно, перебор для каждого числа — слишком долго.

# id: quiz:algo:020
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Найти минимальное число монет для суммы S при произвольных номиналах. Подходящий метод?
options: Динамическое программирование | Жадный выбор крупных монет | Сортировка | Бинарный поиск
answer: 1
explain: Жадный выбор ошибается, например для {1, 3, 4} и S = 6.

# id: quiz:algo:021
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Найти максимальное возможное минимальное расстояние при расстановке K объектов в N точках. Ключевая идея?
options: Бинарный поиск по ответу с жадной проверкой | Перебор всех сочетаний | Динамика по подмножествам | Сортировка подсчётом
answer: 1
explain: Если расстояние D достижимо, то достижимо и меньшее — предикат монотонен.

# id: quiz:algo:022
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Нужно проверять, связаны ли вершины, при постоянном добавлении рёбер. Что использовать?
options: Систему непересекающихся множеств (DSU) | BFS после каждого запроса | Флойда | Стек
answer: 1
explain: DSU отвечает почти за O(1) на запрос.

# id: quiz:algo:023
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Нужно выполнить задачи с зависимостями «A до B» в допустимом порядке. Какой алгоритм?
options: Топологическая сортировка | Дейкстра | Бинарный поиск | Сортировка по алфавиту
answer: 1
explain: Порядок, где каждое ребро идёт вперёд, — топологическая сортировка DAG.

# id: quiz:algo:024
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Найти максимальную сумму подотрезка массива (числа могут быть отрицательными) за O(n). Какой алгоритм?
options: Алгоритм Кадане | Скользящее окно фиксированной длины | Сортировка | Решето
answer: 1
explain: cur = max(x, cur + x), ответ — максимум cur.

# id: quiz:algo:025
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Выбрать максимум непересекающихся отрезков-занятий. Какое жадное правило верно?
options: Брать занятие, которое раньше всех заканчивается | Брать самое короткое | Брать самое раннее по началу | Брать самое длинное
answer: 1
explain: Ранний конец оставляет максимум времени для остальных занятий.

# id: quiz:algo:026
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Найти кратчайшие пути во взвешенном графе с неотрицательными весами. Что выбрать?
options: Дейкстру | BFS | DFS | Краскала
answer: 1
explain: BFS учитывает только число рёбер, а не веса.

# id: quiz:algo:027
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Найти все вхождения образца в длинный текст за линейное время. Подходит:
options: Префикс-функция (КМП) или Z-функция | Сортировка подстрок | Перебор всех пар позиций | Решето Эратосфена
answer: 1
explain: Обе функции вычисляются за O(n + m).

# id: quiz:algo:028
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Сосчитать число путей в сетке из угла в угол (только вправо/вниз) с препятствиями. Метод?
options: Динамика по клеткам | Перебор всех путей | Бинарный поиск | Жадный выбор
answer: 1
explain: ways[i][j] = ways[i−1][j] + ways[i][j−1].

# id: quiz:algo:029
kind: quiz
type: algorithm
category: algorithms
level: 2
q: Нужно k-е по величине число в потоке после каждого нового числа. Удобнее всего:
options: Min-куча размера k | Сортировка после каждого числа | Стек | Словарь
answer: 1
explain: Вершина min-кучи из k наибольших — k-е по величине.

# id: quiz:algo:030
kind: quiz
type: algorithm
category: algorithms
level: 4
q: Коммивояжёр для n ≤ 15 городов. Подходящий точный метод?
options: DP по подмножествам (битовые маски) | Жадный ближайший сосед | BFS | Перебор всех перестановок для любых n
answer: 1
explain: 2^n·n² — допустимо для n ≤ 15–16; жадный метод не гарантирует оптимум.

# id: quiz:algo:031
kind: quiz
type: output
category: algorithms
level: 2
q: Что выведет программа (бинарный поиск)?
code: from bisect import bisect_left, bisect_right\na = [1, 2, 2, 2, 5]\nprint(bisect_left(a, 2), bisect_right(a, 2), bisect_left(a, 3))
wrong: 1 3 3 | 2 4 4 | 1 4 3
explain: bisect_left — первая позиция ≥ x, bisect_right — первая позиция > x.

# id: quiz:algo:032
kind: quiz
type: output
category: algorithms
level: 2
q: Что выведет программа?
code: from itertools import accumulate\na = [2, 5, 1, 3]\np = [0, *accumulate(a)]\nprint(p[3] - p[1])
wrong: 8 | 7 | 9
explain: p[3] − p[1] = a[1] + a[2] = 5 + 1.

# id: quiz:algo:033
kind: quiz
type: output
category: algorithms
level: 2
q: Что выведет программа (алгоритм Евклида)?
code: a, b = 84, 36\nwhile b:\n    a, b = b, a % b\nprint(a)
wrong: 6 | 36 | 3
explain: gcd(84, 36) = 12.

# id: quiz:algo:034
kind: quiz
type: output
category: algorithms
level: 2
q: Что выведет программа (сортировка пузырьком, один проход)?
code: a = [4, 3, 2, 1]\nfor i in range(len(a) - 1):\n    if a[i] > a[i + 1]:\n        a[i], a[i + 1] = a[i + 1], a[i]\nprint(a)
wrong: [1, 2, 3, 4] | [3, 4, 2, 1] | [3, 2, 1, 4, 4]
explain: За один проход наибольший элемент «всплывает» в конец.

# id: quiz:algo:035
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (BFS)?
code: from collections import deque\ng = {1: [2, 3], 2: [4], 3: [4], 4: []}\nd = {1: 0}\nq = deque([1])\nwhile q:\n    u = q.popleft()\n    for v in g[u]:\n        if v not in d:\n            d[v] = d[u] + 1\n            q.append(v)\nprint(d[4], len(d))
wrong: 3 4 | 1 4 | 2 3
explain: Путь 1 → 2 → 4 длины 2; посещены все 4 вершины.

# id: quiz:algo:036
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (динамика)?
code: dp = [1, 1]\nfor i in range(2, 6):\n    dp.append(dp[-1] + dp[-2])\nprint(dp[5])
wrong: 5 | 13 | 6
explain: 1, 1, 2, 3, 5, 8 — шестой элемент (индекс 5) равен 8.

# id: quiz:algo:037
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (жадный размен)?
code: coins = [25, 10, 5, 1]\ns, cnt = 63, 0\nfor c in coins:\n    cnt += s // c\n    s %= c\nprint(cnt)
wrong: 5 | 7 | 63
explain: 25+25+10+1+1+1 — шесть монет.

# id: quiz:algo:038
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (решето)?
code: n = 30\np = [True] * (n + 1)\np[0] = p[1] = False\nfor i in range(2, 6):\n    if p[i]:\n        for k in range(i * i, n + 1, i):\n            p[k] = False\nprint(sum(p))
wrong: 9 | 11 | 15
explain: Простых до 30 десять: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.

# id: quiz:algo:039
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (два указателя)?
code: a = [1, 2, 3, 5, 8]\ni, j, s = 0, 4, 8\nwhile a[i] + a[j] != s:\n    if a[i] + a[j] < s:\n        i += 1\n    else:\n        j -= 1\nprint(a[i], a[j])
wrong: 1 8 | 0 8 | 2 5
explain: 1 + 8 = 9 > 8 → j влево; 1 + 5 = 6 < 8 → i вправо; 2 + 5 = 7 → i вправо; 3 + 5 = 8.

# id: quiz:algo:040
kind: quiz
type: output
category: algorithms
level: 3
q: Что выведет программа (Кадане)?
code: best = cur = -10**9\nfor x in [-2, 1, -3, 4, -1, 2, 1, -5, 4]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)
wrong: 7 | 4 | 11
explain: Максимальный подотрезок [4, −1, 2, 1] имеет сумму 6.

# id: quiz:algo:041
kind: quiz
type: fact
category: algorithms
level: 2
q: Что такое устойчивая (стабильная) сортировка?
options: Сохраняет порядок равных элементов | Всегда работает за O(n log n) | Не использует дополнительную память | Сортирует только числа
answer: 1
explain: sorted и list.sort в Python устойчивы — на этом строится сортировка по нескольким ключам.

# id: quiz:algo:042
kind: quiz
type: fact
category: algorithms
level: 2
q: Когда жадный алгоритм гарантированно даёт оптимальный ответ?
options: Когда доказано, что локально лучший выбор входит в некоторое оптимальное решение | Всегда | Когда входных данных мало | Никогда
answer: 1
explain: Нужно доказательство (например, обменом аргументов) или проверка перебором.

# id: quiz:algo:043
kind: quiz
type: fact
category: algorithms
level: 3
q: Какие два свойства нужны задаче, чтобы применить динамическое программирование?
options: Оптимальная подструктура и перекрывающиеся подзадачи | Отсортированный вход и уникальные элементы | Граф без циклов и положительные веса | Только целые числа
answer: 1
explain: Ответ строится из ответов подзадач, а подзадачи повторяются — их выгодно запоминать.

# id: quiz:algo:044
kind: quiz
type: fact
category: algorithms
level: 3
q: Почему алгоритм Дейкстры не работает с отрицательными весами рёбер?
options: Вершина считается окончательно обработанной, а отрицательное ребро позже может уменьшить её расстояние | Из-за переполнения | Потому что heapq не хранит отрицательные числа | Работает без проблем
answer: 1
explain: Для отрицательных весов используют Беллмана–Форда.

# id: quiz:algo:045
kind: quiz
type: fact
category: algorithms
level: 3
q: Что делает «сжатие путей» в системе непересекающихся множеств?
options: Подвешивает вершины прямо к корню при поиске | Удаляет лишние рёбра графа | Сортирует множества | Объединяет все множества в одно
answer: 1
explain: После сжатия следующие find выполняются почти мгновенно.

# id: quiz:algo:046
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность построения разреженной таблицы и одного запроса минимума?
options: O(n log n) и O(1) | O(n) и O(log n) | O(n²) и O(1) | O(log n) и O(n)
answer: 1
explain: Таблица хранит минимумы отрезков длины 2^k; запрос — два перекрывающихся отрезка.

# id: quiz:algo:047
kind: quiz
type: complexity
category: algorithms
level: 3
q: Какова сложность сортировки слиянием по памяти?
options: O(n) | O(1) | O(log n) | O(n²)
answer: 1
explain: При слиянии нужен дополнительный массив.

# id: quiz:algo:048
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова средняя сложность операций x in s, s.add(x) для множества set?
options: O(1) | O(log n) | O(n) | O(n log n)
answer: 1
explain: set — хеш-таблица.

# id: quiz:algo:049
kind: quiz
type: complexity
category: algorithms
level: 3
q: Задача: N ≤ 2·10^5. Какая максимальная сложность обычно укладывается в 1–2 секунды на Python?
options: O(N log N) | O(N²) | O(N³) | O(2^N)
answer: 1
explain: N² = 4·10^10 — слишком много, N log N ≈ 3.5·10^6.

# id: quiz:algo:050
kind: quiz
type: algorithm
category: algorithms
level: 3
q: Числа Фибоначчи нужны для n до 10^18 по модулю. Как быстро?
options: Возведение матрицы 2×2 в степень | Цикл до n | Наивная рекурсия | Решето
answer: 1
explain: [[1,1],[1,0]]^n вычисляется за O(log n) умножений.
