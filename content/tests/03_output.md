# id: quiz:output:001
kind: quiz
type: output
category: output
level: 1
q: Что выведет программа?
code: a = [1, 2, 3, 4, 5]\nprint(a[1:4], a[::2], a[-2:])
wrong: [2, 3, 4, 5] [1, 3, 5] [4, 5] | [1, 2, 3] [1, 3, 5] [4] | [2, 3, 4] [2, 4] [4, 5]
explain: Срез [1:4] — индексы 1..3; [::2] — каждый второй; [-2:] — два последних.

# id: quiz:output:002
kind: quiz
type: output
category: output
level: 1
q: Что выведет программа?
code: s = "hello world"\nprint(s.title(), s.count("o"), s.find("w"))
wrong: Hello world 2 6 | HELLO WORLD 1 6 | Hello World 2 7
explain: title — каждое слово с заглавной; find возвращает индекс первого вхождения.

# id: quiz:output:003
kind: quiz
type: output
category: output
level: 1
q: Что выведет программа?
code: print("a,b,,c".split(","))
wrong: ['a', 'b', 'c'] | ['a,b,,c'] | ['a', 'b', None, 'c']
explain: split с явным разделителем сохраняет пустые строки между соседними разделителями.

# id: quiz:output:004
kind: quiz
type: output
category: output
level: 1
q: Что выведет программа?
code: print("  a  b ".split(), "-".join("abc"))
wrong: ['', 'a', 'b', ''] a-b-c | ['a', 'b'] abc | ['a  b'] a-b-c
explain: split() без аргумента делит по любым пробелам и отбрасывает пустые части; join вставляет разделитель между символами.

# id: quiz:output:005
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: a = [3, 1, 2]\nb = sorted(a)\na.reverse()\nprint(a, b)
wrong: [1, 2, 3] [1, 2, 3] | [3, 1, 2] [1, 2, 3] | [2, 1, 3] [3, 2, 1]
explain: sorted создаёт новый список, reverse разворачивает исходный на месте.

# id: quiz:output:006
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: a = [1, 2, 3]\na.append([4, 5])\na.extend([6, 7])\nprint(len(a))
wrong: 7 | 5 | 8
explain: append добавляет один элемент (список целиком), extend — каждый элемент.

# id: quiz:output:007
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: a = [1, 2, 3, 4]\na.insert(1, 9)\nprint(a.pop(), a)
wrong: 1 [9, 2, 3, 4] | 4 [1, 2, 3, 9] | 9 [1, 2, 3, 4]
explain: insert(1, 9) вставляет перед индексом 1; pop() удаляет последний элемент.

# id: quiz:output:008
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: grid = [[0] * 2] * 2\ngrid[0][0] = 1\nprint(grid)
wrong: [[1, 0], [0, 0]] | [[1, 1], [0, 0]] | [[1, 0, 0, 0]]
explain: [[0] * 2] * 2 — две ссылки на одну и ту же строку.

# id: quiz:output:009
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: d = {"a": 1, "b": 2}\nd["a"] = 5\nd["c"] = 0\nprint(list(d.items()))
wrong: [('a', 1), ('b', 2), ('c', 0)] | [('b', 2), ('c', 0), ('a', 5)] | {'a': 5, 'b': 2, 'c': 0}
explain: Словари сохраняют порядок вставки; изменение значения не меняет позицию ключа.

# id: quiz:output:010
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: d = {"x": 1}\nprint(d.get("y"), d.get("y", 0), "x" in d)
wrong: KeyError | 0 0 True | None None True
explain: get возвращает None или значение по умолчанию, если ключа нет.

# id: quiz:output:011
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: s = {3, 1, 2, 3, 1}\nprint(len(s), sorted(s))
wrong: 5 [1, 1, 2, 3, 3] | 3 [3, 1, 2] | 5 [1, 2, 3]
explain: Множество хранит только уникальные значения.

# id: quiz:output:012
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: a, b = {1, 2, 3}, {2, 3, 4}\nprint(sorted(a & b), sorted(a | b), sorted(a - b), sorted(a ^ b))
wrong: [2, 3] [1, 2, 3, 4] [4] [1, 4] | [1, 4] [1, 2, 3, 4] [1] [2, 3] | [2, 3] [1, 2, 3, 4] [1] [2, 3]
explain: & — пересечение, | — объединение, - — разность, ^ — симметрическая разность.

# id: quiz:output:013
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: for i, ch in enumerate("ab", 1):\n    print(i, ch)
wrong: 0 a ⏎ 1 b | 1 b ⏎ 2 a | (1, 'a') ⏎ (2, 'b')
explain: enumerate(..., 1) нумерует с единицы.

# id: quiz:output:014
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(list(zip([1, 2, 3], "ab")))
wrong: [(1, 'a'), (2, 'b'), (3, None)] | [(1, 2, 3), ('a', 'b')] | [1, 'a', 2, 'b']
explain: zip останавливается на самой короткой последовательности.

# id: quiz:output:015
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(sorted(["bb", "a", "ccc"], key=len, reverse=True))
wrong: ['a', 'bb', 'ccc'] | ['ccc', 'a', 'bb'] | ['bb', 'ccc', 'a']
explain: Сортировка по длине строк по убыванию.

# id: quiz:output:016
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(sorted("Banana"))
wrong: ['a', 'a', 'a', 'B', 'n', 'n'] | ['B', 'a', 'n'] | Banana
explain: Заглавные буквы имеют меньшие коды, чем строчные.

# id: quiz:output:017
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(list(filter(None, [0, 1, "", "a", [], [0]])))
wrong: [0, 1, '', 'a', [], [0]] | [1, 'a'] | [1, 'a', []]
explain: filter(None, …) оставляет только истинные значения; [0] — непустой список, он истинен.

# id: quiz:output:018
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(any([0, "", None]), all([]), any([[], [0]]))
wrong: False False False | True True True | False True False
explain: all([]) истинно (нет ложных элементов); [0] — истинный объект.

# id: quiz:output:019
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: def add(x, a=[]):\n    a.append(x)\n    return a\nadd(1)\nprint(add(2))
wrong: [2] | [1] | []
explain: Значение по умолчанию создаётся один раз при определении функции и разделяется между вызовами.

# id: quiz:output:020
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: fs = [lambda: i for i in range(3)]\nprint([f() for f in fs])
wrong: [0, 1, 2] | [0, 0, 0] | [3, 3, 3]
explain: Лямбды запоминают переменную i, а не её значение; к моменту вызова i = 2.

# id: quiz:output:021
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: def f(*args, **kw):\n    print(args, kw)\nf(1, 2, x=3)
wrong: [1, 2] {'x': 3} | (1, 2, 3) {} | 1 2 x=3
explain: *args собирает позиционные аргументы в кортеж, **kw — именованные в словарь.

# id: quiz:output:022
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: def gen():\n    yield 1\n    yield 2\ng = gen()\nprint(next(g), list(g), list(g))
wrong: 1 [1, 2] [1, 2] | 1 [2] [2] | 1 2 []
explain: Генератор исчерпывается и второй раз ничего не выдаёт.

# id: quiz:output:023
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(sum(x * x for x in range(4)), max(range(5), key=lambda v: -v))
wrong: 30 4 | 14 4 | 9 0
explain: 0 + 1 + 4 + 9 = 14; максимум по ключу −v — это наименьшее v.

# id: quiz:output:024
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: try:\n    print(1 / 0)\nexcept ZeroDivisionError:\n    print("ошибка")\nelse:\n    print("ok")\nfinally:\n    print("конец")
wrong: ошибка ⏎ ok ⏎ конец | ошибка | ok ⏎ конец
explain: else выполняется, только если исключения не было; finally — всегда.

# id: quiz:output:025
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: def f():\n    try:\n        return "try"\n    finally:\n        print("finally")\nprint(f())
wrong: try | try ⏎ finally | finally
explain: finally выполняется перед фактическим возвратом из функции.

# id: quiz:output:026
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: x = [1, 2, 3]\ny = x[:]\ny[0] = 9\nprint(x[0], y[0])
wrong: 9 9 | 1 1 | 9 1
explain: Срез [:] создаёт новый (поверхностный) список.

# id: quiz:output:027
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: import copy\na = [[1], [2]]\nb = copy.copy(a)\nc = copy.deepcopy(a)\na[0].append(9)\nprint(b[0], c[0])
wrong: [1] [1] | [1, 9] [1, 9] | [1] [1, 9]
explain: Поверхностная копия делит вложенные списки, глубокая — нет.

# id: quiz:output:028
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print("{} + {} = {}".format(2, 3, 2 + 3), "%d%%" % 50)
wrong: {} + {} = {} 50% | 2 + 3 = 5 50%% | 2 + 3 = 23 50%
explain: format подставляет аргументы по порядку; %% в старом форматировании — знак процента.

# id: quiz:output:029
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(f"{'ab':>5}|{'ab':<5}|{'ab':^6}|")
wrong: ab   |   ab|  ab  | | ab|ab|ab| |    ab|ab    |ab    |
explain: > — выравнивание вправо, < — влево, ^ — по центру.

# id: quiz:output:030
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print(divmod(17, 5), pow(2, 10, 1000), abs(-3.5))
wrong: (3, 2) 1024 3.5 | 3 2 24 3.5 | (3.4, 2) 24 -3.5
explain: divmod → (частное, остаток); pow с третьим аргументом — по модулю.

# id: quiz:output:031
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: from collections import Counter\nprint(Counter("abracadabra").most_common(2))
wrong: [('a', 5), ('r', 2)] | [('a', 5), ('b', 2), ('r', 2)] | {'a': 5, 'b': 2}
explain: most_common(2) — два самых частых; при равенстве частот порядок первого появления.

# id: quiz:output:032
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: from collections import deque\nd = deque([1, 2, 3])\nd.rotate(1)\nd.appendleft(0)\nprint(list(d))
wrong: [0, 1, 2, 3] | [0, 2, 3, 1] | [3, 1, 2, 0]
explain: rotate(1) сдвигает вправо: [3, 1, 2], затем 0 в начало.

# id: quiz:output:033
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: import heapq\nh = [5, 1, 4]\nheapq.heapify(h)\nheapq.heappush(h, 0)\nprint(heapq.heappop(h), heapq.heappop(h))
wrong: 5 4 | 0 4 | 1 0
explain: heapq — min-куча: извлекаются наименьшие.

# id: quiz:output:034
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: from itertools import accumulate, product\nprint(list(accumulate([1, 2, 3])), len(list(product("ab", repeat=2))))
wrong: [1, 2, 3] 4 | [1, 3, 6] 2 | [6] 4
explain: accumulate даёт накопленные суммы; product("ab", repeat=2) — 2² = 4 пары.

# id: quiz:output:035
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: class A:\n    n = 0\n    def __init__(self):\n        A.n += 1\nA(); A()\nprint(A.n)
wrong: 0 | 1 | AttributeError
explain: Атрибут класса общий для всех объектов.

# id: quiz:output:036
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: class P:\n    def hi(self):\n        return "P"\nclass C(P):\n    def hi(self):\n        return "C" + super().hi()\nprint(C().hi())
wrong: C | P | PC
explain: super().hi() вызывает метод родителя.

# id: quiz:output:037
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: class V:\n    def __init__(self, x):\n        self.x = x\n    def __add__(self, o):\n        return V(self.x + o.x)\n    def __repr__(self):\n        return f"V({self.x})"\nprint(V(1) + V(2))
wrong: V(1)V(2) | 3 | TypeError
explain: + вызывает __add__, print использует __repr__ (если нет __str__).

# id: quiz:output:038
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: x = 5\ny = x\nx += 1\nprint(x, y)
wrong: 6 6 | 5 5 | 5 6
explain: Числа неизменяемы: x += 1 создаёт новый объект, y по-прежнему 5.

# id: quiz:output:039
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: print("Python"[::-2], "abc" * 0 == "")
wrong: otP True | nhy False | nohtyP True
explain: Срез с шагом −2 берёт символы с конца через один.

# id: quiz:output:040
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: n = 1234\nprint(n % 10, n // 10 % 10, sum(map(int, str(n))))
wrong: 1 2 10 | 4 3 1234 | 4 2 10
explain: Последняя цифра — n % 10, цифра десятков — n // 10 % 10.

# id: quiz:output:041
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: m = [[1, 2], [3, 4]]\nprint([list(r) for r in zip(*m)], [x for r in m for x in r])
wrong: [[1, 2], [3, 4]] [1, 2, 3, 4] | [[1, 3], [2, 4]] [[1, 2], [3, 4]] | [[4, 3], [2, 1]] [1, 3, 2, 4]
explain: zip(*m) транспонирует; двойной генератор «выпрямляет» матрицу.

# id: quiz:output:042
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: words = ["kiwi", "fig", "apple"]\nprint({w: len(w) for w in words}["fig"], max(words, key=len))
wrong: 4 kiwi | 3 kiwi | fig apple
explain: Генератор словаря; max по длине возвращает самое длинное слово.

# id: quiz:output:043
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: i = 0\nwhile True:\n    i += 1\n    if i * i > 20:\n        break\nprint(i)
wrong: 4 | 20 | 6
explain: 5² = 25 > 20 — первое такое i.

# id: quiz:output:044
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: for i in range(1, 4):\n    print("*" * i, end=" ")
wrong: * ⏎ ** ⏎ *** | *** ** * | * * * 
explain: end=" " заменяет перевод строки пробелом.

# id: quiz:output:045
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: print(round(2.675, 2), f"{2.675:.2f}")
wrong: 2.68 2.68 | 2.67 2.68 | 2.7 2.68
explain: 2.675 хранится как 2.67499999…, поэтому округляется вниз.

# id: quiz:output:046
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: print(1_000_000 + 0b11 + 0o10 + 0x10)
wrong: 1000029 | 1000000 | 1000037
explain: 0b11 = 3, 0o10 = 8, 0x10 = 16; подчёркивания в числах игнорируются.

# id: quiz:output:047
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: a = [2, 4, 6, 7]\nfor x in a:\n    if x % 2 == 0:\n        a.remove(x)\nprint(a)
wrong: [7] | [2, 4, 6, 7] | [4, 6, 7]
explain: Удаление во время обхода сдвигает элементы, и цикл пропускает следующий: 2 удалено, 4 пропущено, 6 удалено. Фильтруйте в новый список: [x for x in a if x % 2].

# id: quiz:output:048
kind: quiz
type: output
category: output
level: 2
q: Что выведет программа?
code: s = "Hello"\nprint(s.upper(), s.lower(), s.swapcase(), s)
wrong: HELLO hello hELLO HELLO | HELLO hello HeLlO Hello | Hello Hello Hello Hello
explain: Методы строк возвращают новые строки, исходная не меняется.

# id: quiz:output:049
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: x = 10\ndef outer():\n    x = 20\n    def inner():\n        nonlocal x\n        x += 1\n        return x\n    return inner()\nprint(outer(), x)
wrong: 11 10 | 21 21 | 11 11
explain: nonlocal изменяет переменную ближайшей внешней функции, глобальная x не меняется.

# id: quiz:output:050
kind: quiz
type: output
category: output
level: 3
q: Что выведет программа?
code: print(*sorted({"b": 1, "a": 3, "c": 2}.items(), key=lambda kv: kv[1]))
wrong: ('a', 3) ('b', 1) ('c', 2) | b c a | ('a', 3) ('c', 2) ('b', 1)
explain: Сортировка пар (ключ, значение) по значению.
