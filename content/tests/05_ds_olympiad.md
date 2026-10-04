# id: quiz:ds:001
kind: quiz
type: fact
category: ds
level: 1
q: Какая структура данных работает по принципу «последним пришёл — первым ушёл» (LIFO)?
options: Стек | Очередь | Множество | Словарь
answer: 1
explain: Стек: append кладёт на вершину, pop снимает с вершины.

# id: quiz:ds:002
kind: quiz
type: fact
category: ds
level: 1
q: Какая структура в Python лучше всего подходит для очереди (FIFO)?
options: collections.deque | list с pop(0) | set | tuple
answer: 1
explain: deque.popleft() работает за O(1), а list.pop(0) — за O(n).

# id: quiz:ds:003
kind: quiz
type: fact
category: ds
level: 1
q: Что из перечисленного может быть ключом словаря?
options: (1, 2) | [1, 2] | {1, 2} | {"a": 1}
answer: 1
explain: Ключ должен быть хешируемым (неизменяемым): кортеж подходит.

# id: quiz:ds:004
kind: quiz
type: fact
category: ds
level: 2
q: Чем tuple отличается от list?
options: tuple неизменяем | tuple быстрее сортируется | В tuple нельзя хранить строки | tuple хранит только уникальные элементы
answer: 1
explain: Кортеж нельзя изменить после создания, поэтому он хешируем (если все элементы хешируемы).

# id: quiz:ds:005
kind: quiz
type: fact
category: ds
level: 2
q: Какой модуль реализует двоичную кучу в стандартной библиотеке?
options: heapq | queue.Stack | bisect | array
answer: 1
explain: heapq работает с обычным списком как с min-кучей.

# id: quiz:ds:006
kind: quiz
type: fact
category: ds
level: 2
q: Что делает collections.defaultdict(list)?
options: Создаёт пустой список для отсутствующего ключа при обращении | Запрещает добавление новых ключей | Сортирует ключи | Хранит только списки в качестве ключей
answer: 1
explain: d[k].append(x) работает даже для нового ключа k.

# id: quiz:ds:007
kind: quiz
type: fact
category: ds
level: 2
q: Как получить пустое множество?
options: set() | {} | [] | ()
answer: 1
explain: {} — это пустой словарь.

# id: quiz:ds:008
kind: quiz
type: complexity
category: ds
level: 2
q: Сложность доступа к элементу списка по индексу a[i]?
options: O(1) | O(log n) | O(n) | O(i)
answer: 1
explain: list — динамический массив.

# id: quiz:ds:009
kind: quiz
type: complexity
category: ds
level: 2
q: Сложность list.insert(0, x) для списка длины n?
options: O(n) | O(1) | O(log n) | O(n log n)
answer: 1
explain: Все элементы сдвигаются на одну позицию.

# id: quiz:ds:010
kind: quiz
type: complexity
category: ds
level: 2
q: Сложность поиска ключа в словаре dict в среднем?
options: O(1) | O(log n) | O(n) | O(n²)
answer: 1
explain: dict — хеш-таблица.

# id: quiz:ds:011
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность heapq.heappush и heapq.heappop?
options: O(log n) | O(1) | O(n) | O(n log n)
answer: 1
explain: Элемент «просеивается» по высоте кучи.

# id: quiz:ds:012
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность heapq.heapify для списка из n элементов?
options: O(n) | O(n log n) | O(log n) | O(n²)
answer: 1
explain: Построение кучи снизу вверх — линейное.

# id: quiz:ds:013
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность bisect.insort в список длины n?
options: O(n) | O(log n) | O(1) | O(n log n)
answer: 1
explain: Позиция ищется за O(log n), но вставка в список сдвигает элементы — O(n).

# id: quiz:ds:014
kind: quiz
type: complexity
category: ds
level: 3
q: Сложность x in s, где s — строка длины n, x — один символ?
options: O(n) | O(1) | O(log n) | O(n²)
answer: 1
explain: Строка просматривается последовательно.

# id: quiz:ds:015
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: st = []\nfor ch in "abc":\n    st.append(ch)\nprint(st.pop() + st.pop())
wrong: ab | ac | ca
explain: Стек отдаёт последний добавленный: сначала c, потом b.

# id: quiz:ds:016
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: from collections import deque\nq = deque()\nfor x in [1, 2, 3]:\n    q.append(x)\nprint(q.popleft(), q.pop(), list(q))
wrong: 3 1 [2] | 1 2 [3] | 1 3 [1, 2, 3]
explain: popleft — из начала, pop — из конца.

# id: quiz:ds:017
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: import heapq\nh = []\nfor x in [5, 3, 8, 1]:\n    heapq.heappush(h, -x)\nprint(-heapq.heappop(h))
wrong: 1 | -8 | 5
explain: Отрицательные значения превращают min-кучу в max-кучу.

# id: quiz:ds:018
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: from collections import defaultdict\nd = defaultdict(list)\nd["a"].append(1)\nd["b"]\nprint(len(d), d["a"])
wrong: 1 [1] | 2 1 | KeyError
explain: Даже простое обращение d["b"] создаёт ключ со значением [].

# id: quiz:ds:019
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: from collections import Counter\nc = Counter("aab")\nc.update("bc")\nprint(c["b"], c["z"], len(c))
wrong: 1 0 3 | 2 KeyError 3 | 2 0 4
explain: Counter для отсутствующего ключа возвращает 0, не создавая его.

# id: quiz:ds:020
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: d = {"b": 2, "a": 1}\nprint(sorted(d), list(d.values()), max(d, key=d.get))
wrong: [('a', 1), ('b', 2)] [2, 1] a | ['b', 'a'] [1, 2] b | ['a', 'b'] [1, 2] a
explain: sorted(d) сортирует ключи; max по ключу d.get — ключ с наибольшим значением.

# id: quiz:ds:021
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: s = {1, 2, 3}\nfs = frozenset(s)\nd = {fs: "ok"}\nprint(d[frozenset({3, 2, 1})])
wrong: KeyError | TypeError | None
explain: frozenset неизменяем и хешируем; порядок элементов не важен.

# id: quiz:ds:022
kind: quiz
type: output
category: ds
level: 2
q: Что выведет программа?
code: a = [1, 2, 3]\nb = a\nc = a.copy()\na.append(4)\nprint(len(b), len(c))
wrong: 3 3 | 4 4 | 3 4
explain: b — та же ссылка, c — отдельная копия.

# id: quiz:ds:023
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: from collections import OrderedDict\nod = OrderedDict.fromkeys("abc")\nod.move_to_end("a")\nprint("".join(od))
wrong: abc | cab | acb
explain: move_to_end переносит ключ в конец.

# id: quiz:ds:024
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: from collections import namedtuple\nP = namedtuple("P", "x y")\np = P(1, 2)\nprint(p.x + p[1], p._replace(x=5))
wrong: 3 P(1, 2) | 3 (5, 2) | 12 P(x=5, y=2)
explain: namedtuple доступен и по имени, и по индексу; _replace создаёт новый кортеж.

# id: quiz:ds:025
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: import bisect\na = []\nfor x in [5, 1, 4, 2]:\n    bisect.insort(a, x)\nprint(a, bisect.bisect(a, 3))
wrong: [5, 1, 4, 2] 2 | [1, 2, 4, 5] 3 | [1, 2, 4, 5] 1
explain: insort поддерживает список отсортированным; bisect(a, 3) = 2.

# id: quiz:ds:026
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: parent = list(range(5))\ndef find(x):\n    while parent[x] != x:\n        x = parent[x]\n    return x\nparent[1] = 0\nparent[2] = 1\nparent[4] = 3\nprint(find(2) == find(0), find(4) == find(2))
wrong: True True | False False | False True
explain: 2 → 1 → 0 — одно множество; 4 → 3 — другое.

# id: quiz:ds:027
kind: quiz
type: output
category: ds
level: 3
q: Что выведет программа?
code: g = {1: [2, 3], 2: [4], 3: [], 4: []}\norder, stack = [], [1]\nwhile stack:\n    v = stack.pop()\n    order.append(v)\n    stack.extend(reversed(g[v]))\nprint(order)
wrong: [1, 3, 2, 4] | [1, 2, 3, 4] | [4, 2, 3, 1]
explain: Итеративный DFS: reversed сохраняет порядок соседей — 1, 2, 4, затем 3.

# id: quiz:ds:028
kind: quiz
type: fact
category: ds
level: 3
q: Что хранит дерево Фенвика в ячейке t[i]?
options: Сумму отрезка длины (i & −i), заканчивающегося в i | Сумму всех элементов до i | Минимум до i | Количество элементов, равных i
answer: 1
explain: Отсюда операции i += i & −i и i −= i & −i.

# id: quiz:ds:029
kind: quiz
type: fact
category: ds
level: 3
q: Для чего удобна монотонная очередь (дек)?
options: Максимум/минимум в скользящем окне за O(1) на сдвиг | Сортировка массива | Поиск кратчайшего пути с весами | Хранение уникальных элементов
answer: 1
explain: Дек хранит кандидатов в порядке убывания значений.

# id: quiz:ds:030
kind: quiz
type: fact
category: ds
level: 2
q: Какую структуру лучше выбрать, чтобы быстро проверять, встречалось ли значение?
options: set | list | tuple | str
answer: 1
explain: Проверка x in set — в среднем O(1).

# id: quiz:olympiad:001
kind: quiz
type: algorithm
category: olympiad
level: 3
q: N ≤ 20. Нужно выбрать подмножество предметов с наилучшим значением сложной функции. Какой подход реалистичен?
options: Перебор всех 2^N подмножеств | Перебор всех N! перестановок | Жадный выбор | Бинарный поиск
answer: 1
explain: 2^20 ≈ 10^6 — укладывается в ограничения.

# id: quiz:olympiad:002
kind: quiz
type: algorithm
category: olympiad
level: 4
q: N ≤ 40, нужно посчитать подмножества с суммой ≤ S. Подход?
options: Meet in the middle: две половины по 2^20 и бинарный поиск | Полный перебор 2^40 | Динамика по сумме при S до 10^18 | Жадный алгоритм
answer: 1
explain: 2·2^20 вариантов вместо 2^40.

# id: quiz:olympiad:003
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Сколько чисел от 1 до 10^18 имеют сумму цифр, равную S? Метод?
options: DP по цифрам с флагом «прижат к границе» | Перебор чисел | Решето | Формула Гаусса
answer: 1
explain: Состояние (позиция, сумма, tight) — всего порядка 19·163·2.

# id: quiz:olympiad:004
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Игра: N кучек, ход — взять любое число камней из одной кучки. Кто выигрывает?
options: Первый, если XOR размеров кучек ≠ 0 | Первый, если сумма нечётна | Всегда первый | Второй, если N чётно
answer: 1
explain: Теорема Бутона для игры Ним.

# id: quiz:olympiad:005
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Нужно отвечать на запросы суммы на отрезке и изменения элемента (до 2·10^5 каждого). Что выбрать?
options: Дерево Фенвика или дерево отрезков | Префиксные суммы с пересчётом | Сортировку | Перебор отрезка
answer: 1
explain: Обе структуры — O(log n) на операцию.

# id: quiz:olympiad:006
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти количество различных подстрок строки длины 2000. Подходящий метод?
options: Хеширование подстрок или суффиксный массив с LCP | Перебор с сохранением всех подстрок длины до 2000 в set строк | Решето | BFS
answer: 1
explain: Хранить все подстроки строками — сотни миллионов символов.

# id: quiz:olympiad:007
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти количество мостов в графе. Ключевая идея?
options: DFS с временем входа tin и значением low: ребро — мост, если low[u] > tin[v] | Удалить каждое ребро и проверить связность за O(1) | Топологическая сортировка | Алгоритм Дейкстры
answer: 1
explain: Один обход DFS — O(V + E).

# id: quiz:olympiad:008
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Решить систему сравнений x ≡ a_i (mod m_i). Какой инструмент?
options: Китайская теорема об остатках с расширенным Евклидом | Решето Эратосфена | Бинарный поиск по x до 10^18 | Жадный перебор
answer: 1
explain: Сравнения объединяются попарно, модуль — НОК.

# id: quiz:olympiad:009
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Нужен k-й предок вершины дерева для многих запросов. Метод?
options: Двоичные подъёмы up[j][v] | Подъём по одному родителю | BFS для каждого запроса | Сортировка вершин
answer: 1
explain: k раскладывается по битам — O(log n) на запрос.

# id: quiz:olympiad:010
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Путь на поле, где шаг по прямой бесплатен, а поворот стоит 1. Эффективный алгоритм?
options: 0-1 BFS по состояниям (клетка, направление) | Обычный BFS по клеткам | DFS | Флойд
answer: 1
explain: Веса 0 и 1 — дек вместо кучи.

# id: quiz:olympiad:011
kind: quiz
type: complexity
category: olympiad
level: 4
q: Какова сложность DP по подмножествам для коммивояжёра на N городах?
options: O(2^N · N²) | O(N!) | O(N³) | O(2^N)
answer: 1
explain: Состояний 2^N·N, переходов из каждого — N.

# id: quiz:olympiad:012
kind: quiz
type: complexity
category: olympiad
level: 4
q: Сложность алгоритма Манакера для поиска палиндромов?
options: O(n) | O(n²) | O(n log n) | O(n³)
answer: 1
explain: Используются уже найденные палиндромы — правая граница только растёт.

# id: quiz:olympiad:013
kind: quiz
type: complexity
category: olympiad
level: 4
q: Сложность построения выпуклой оболочки алгоритмом Эндрю?
options: O(n log n) | O(n) | O(n²) | O(n·h)
answer: 1
explain: Основное время — сортировка точек.

# id: quiz:olympiad:014
kind: quiz
type: complexity
category: olympiad
level: 4
q: Сложность корневой декомпозиции для запроса суммы на отрезке?
options: O(√n) | O(1) | O(log n) | O(n)
answer: 1
explain: Не более 2√n отдельных элементов и √n блоков.

# id: quiz:olympiad:015
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (функция Гранди)?
code: S = [1, 2]\ng = [0] * 7\nfor x in range(1, 7):\n    seen = {g[x - s] for s in S if s <= x}\n    m = 0\n    while m in seen:\n        m += 1\n    g[x] = m\nprint(g)
wrong: [0, 1, 0, 1, 0, 1, 0] | [0, 1, 2, 3, 4, 5, 6] | [0, 0, 1, 1, 2, 2, 3]
explain: Для ходов {1, 2} значения повторяются с периодом 3.

# id: quiz:olympiad:016
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (префикс-функция)?
code: s = "abacaba"\npi = [0] * len(s)\nfor i in range(1, len(s)):\n    k = pi[i - 1]\n    while k and s[i] != s[k]:\n        k = pi[k - 1]\n    if s[i] == s[k]:\n        k += 1\n    pi[i] = k\nprint(pi)
wrong: [0, 0, 1, 0, 1, 2, 3, 4] | [0, 1, 0, 1, 0, 1, 0] | [1, 0, 1, 0, 1, 2, 3]
explain: Например, для всей строки наибольший префикс-суффикс — «aba» длины 3.

# id: quiz:olympiad:017
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (подмаски)?
code: m = 0b1010\ns = m\ncnt = 0\nwhile s:\n    cnt += 1\n    s = (s - 1) & m\nprint(cnt)
wrong: 4 | 2 | 10
explain: Непустых подмасок у маски с двумя единицами — 2² − 1 = 3.

# id: quiz:olympiad:018
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа?
code: MOD = 7\nprint(pow(3, -1, MOD), 3 * pow(3, -1, MOD) % MOD)
wrong: 2 6 | 3 1 | 4 5
explain: 3 · 5 = 15 ≡ 1 (mod 7), значит обратный к 3 — это 5.

# id: quiz:olympiad:019
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (xor от 1 до n)?
code: n = 10\nx = 0\nfor i in range(1, n + 1):\n    x ^= i\nprint(x, [n, 1, n + 1, 0][n % 4])
wrong: 1 1 | 10 11 | 0 0
explain: Для n % 4 == 2 ответ n + 1 = 11; цикл даёт то же самое.

# id: quiz:olympiad:020
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (рюкзак 0/1)?
code: items = [(2, 3), (3, 4), (4, 5)]\nW = 5\ndp = [0] * (W + 1)\nfor w, c in items:\n    for x in range(W, w - 1, -1):\n        dp[x] = max(dp[x], dp[x - w] + c)\nprint(dp[W])
wrong: 8 | 5 | 12
explain: Лучший выбор — предметы весом 2 и 3: стоимость 3 + 4 = 7.

# id: quiz:olympiad:021
kind: quiz
type: output
category: olympiad
level: 3
q: Что выведет программа (LIS через bisect)?
code: from bisect import bisect_left\ntails = []\nfor x in [3, 1, 4, 1, 5, 9, 2, 6]:\n    i = bisect_left(tails, x)\n    tails[i:i + 1] = [x]\nprint(len(tails), tails)
wrong: 5 [1, 4, 5, 9, 6] | 3 [1, 2, 6] | 4 [3, 4, 5, 9]
explain: Длина LIS = 4 (например, 1 4 5 9); tails — не сама подпоследовательность, а минимальные «хвосты».

# id: quiz:olympiad:022
kind: quiz
type: fact
category: olympiad
level: 3
q: Почему в олимпиадных задачах на Python ввод часто читают через sys.stdin.buffer.read().split()?
options: Это намного быстрее многократных input() на больших данных | input() не умеет читать числа | Так требует стандарт языка | Это уменьшает объём памяти программы в 10 раз
answer: 1
explain: Чтение всего ввода за один вызов экономит время на сотнях тысяч строк.

# id: quiz:olympiad:023
kind: quiz
type: fact
category: olympiad
level: 3
q: Что делает sys.setrecursionlimit(10**6)?
options: Разрешает более глубокую рекурсию, но не увеличивает стек C — возможен аварийный выход | Делает рекурсию быстрее | Ускоряет циклы | Отключает рекурсию
answer: 1
explain: Для очень глубокой рекурсии дополнительно запускают поток с большим стеком или переписывают алгоритм итеративно.

# id: quiz:olympiad:024
kind: quiz
type: fact
category: olympiad
level: 3
q: Что такое стресс-тестирование решения?
options: Сравнение быстрого решения с медленным, но надёжным на множестве случайных маленьких тестов | Запуск на самом большом тесте | Проверка стиля кода | Измерение памяти
answer: 1
explain: Первый расхождение даёт конкретный тест с ошибкой.

# id: quiz:olympiad:025
kind: quiz
type: fact
category: olympiad
level: 3
q: Зачем ответ просят выводить «по модулю 10^9 + 7»?
options: Ответ слишком велик; 10^9 + 7 — простое число, по нему удобно делить через обратный элемент | Чтобы ответ был чётным | Так быстрее ввод | Потому что int в Python ограничен
answer: 1
explain: Простота модуля позволяет использовать малую теорему Ферма.

# id: quiz:olympiad:026
kind: quiz
type: complexity
category: olympiad
level: 3
q: Ограничения: N ≤ 500. Какая сложность решения допустима?
options: O(N³) | O(2^N) | O(N!) | O(N^4) с большой константой
answer: 1
explain: 500³ = 1.25·10^8 — на пределе для Python, но обычно проходит с простыми операциями.

# id: quiz:olympiad:027
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти количество инверсий в массиве из 10^5 элементов. Подход?
options: Сортировка слиянием с подсчётом или дерево Фенвика | Двойной цикл | Сортировка подсчётом без изменений | Двоичный поиск ответа
answer: 1
explain: Оба способа — O(n log n).

# id: quiz:olympiad:028
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Найти компоненты сильной связности ориентированного графа. Алгоритм?
options: Косарайю или Тарьян | Краскал | Дейкстра | BFS из вершины 1
answer: 1
explain: Оба работают за O(V + E).

# id: quiz:olympiad:029
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Посчитать числа ≤ N, делящиеся хотя бы на одно из K ≤ 15 чисел. Метод?
options: Формула включений-исключений по подмножествам делителей | Перебор всех чисел до 10^18 | Решето до N | Жадный алгоритм
answer: 1
explain: 2^15 подмножеств, для каждого — НОК и N // НОК.

# id: quiz:olympiad:030
kind: quiz
type: algorithm
category: olympiad
level: 4
q: Линейная рекуррента порядка k для n до 10^18. Как вычислить?
options: Возведение матрицы k×k в степень (или метод Фидуччи) | Цикл до n | Рекурсия с lru_cache | Перебор
answer: 1
explain: O(k³ log n) умножений матриц.
