# id: task:most-frequent-word
kind: task
title: Самое частое слово
category: Словари
level: easy
tags: Counter, словарь, частота, сортировка
related: lib:collections.Counter, py:builtin:max
## Условие
Дан текст из слов, разделённых пробелами и переводами строк. Выведите слово, которое встречается чаще всего. Если таких несколько — лексикографически наименьшее.
## Входные данные
Несколько строк текста (всего до 10^5 слов).
## Выходные данные
Самое частое слово.
## Примеры
```in
apple banana apple
banana cherry
```
```out
apple
```
## Подсказки
- Прочитайте весь текст: sys.stdin.read().split().
- Посчитайте слова словарём или Counter.
- Выберите максимум по ключу (−частота, слово).
## Решение: Counter и min по ключу
@time: O(N) @memory: O(K)
```python
import sys
from collections import Counter
cnt = Counter(sys.stdin.read().split())
print(min(cnt, key=lambda w: (-cnt[w], w)))
```
## Решение: словарь и сортировка
@time: O(N + K log K) @memory: O(K)
```python
import sys
freq = {}
for w in sys.stdin.read().split():
    freq[w] = freq.get(w, 0) + 1
print(sorted(freq.items(), key=lambda p: (-p[1], p[0]))[0][0])
```
## Объяснение
Кортежи сравниваются поэлементно: сначала большая частота (через минус), затем алфавит.
## Генератор
```python
import json, random
random.seed(61)
words = ["a", "b", "c", "dd", "ee"]
t = ["x", "b a", "z z y y"]
for _ in range(4):
    t.append("\n".join(" ".join(random.choice(words) for _ in range(10)) for _ in range(3)))
print(json.dumps(t))
```

# id: task:phone-book
kind: task
title: Телефонная книга
category: Словари
level: easy
tags: словарь, запросы, get
related: py:method:dict.get
## Условие
Дана телефонная книга из N записей «имя номер» (имена различны) и M запросов-имён. На каждый запрос выведите номер или «Not found».
## Входные данные
N, затем N строк «имя номер»; M, затем M имён.
## Выходные данные
M строк с ответами.
## Примеры
```in
2
anna 123
bob 456
3
bob
carl
anna
```
```out
456
Not found
123
```
## Подсказки
- Словарь хранит пары «ключ → значение».
- book[name] = number при чтении записей.
- book.get(name, "Not found") не вызовет KeyError.
## Решение: словарь и get
@time: O(N + M) @memory: O(N)
```python
n = int(input())
book = {}
for _ in range(n):
    name, number = input().split()
    book[name] = number
m = int(input())
for _ in range(m):
    print(book.get(input().strip(), "Not found"))
```
## Решение: dict из генератора и быстрый ввод
@time: O(N + M) @memory: O(N)
sys.stdin.readline быстрее input при больших объёмах.
```python
import sys
data = sys.stdin.read().split("\n")
n = int(data[0])
book = dict(line.split() for line in data[1:n + 1])
m = int(data[n + 1])
out = [book.get(q.strip(), "Not found") for q in data[n + 2:n + 2 + m]]
print("\n".join(out))
```
## Объяснение
Поиск в словаре — в среднем O(1), независимо от размера книги.
## Генератор
```python
import json
print(json.dumps(["1\na 1\n1\nb", "1\na 1\n2\na\na", "3\nx 10\ny 20\nz 30\n4\nz\ny\nw\nx"]))
```

# id: task:anagram-groups
kind: task
title: Группы анаграмм
category: Словари
level: medium
tags: анаграммы, defaultdict, ключ-сортировка
related: lib:collections.defaultdict
## Условие
Дано N слов. Разбейте их на группы анаграмм и выведите количество групп и размер самой большой группы.
## Входные данные
N (1 ≤ N ≤ 10^5), затем N слов по одному в строке (длина слова до 20).
## Выходные данные
Два числа: количество групп и размер наибольшей.
## Примеры
```in
6
eat
tea
tan
ate
nat
bat
```
```out
3 3
```
## Подсказки
- У анаграмм одинаковое отсортированное представление букв.
- Сделайте ключ "".join(sorted(word)).
- Сгруппируйте слова по ключу в словаре.
## Решение: ключ — отсортированные буквы
@time: O(N·L log L) @memory: O(N·L)
```python
from collections import defaultdict
n = int(input())
groups = defaultdict(int)
for _ in range(n):
    groups["".join(sorted(input().strip()))] += 1
print(len(groups), max(groups.values()))
```
## Решение: ключ — счётчик букв
@time: O(N·L) @memory: O(N·L)
Кортеж из 26 счётчиков — тоже однозначный «отпечаток» набора букв.
```python
from collections import Counter
n = int(input())
keys = Counter()
for _ in range(n):
    c = [0] * 26
    for ch in input().strip():
        c[ord(ch) - 97] += 1
    keys[tuple(c)] += 1
print(len(keys), max(keys.values()))
```
## Объяснение
Ключ словаря должен быть неизменяемым: строка или кортеж подходят, список — нет.
## Генератор
```python
import json, random
random.seed(62)
t = ["1\nabc", "2\nab\nba", "3\na\nb\nc"]
for n in (20, 200):
    t.append("%d\n%s" % (n, "\n".join("".join(random.choice("abc") for _ in range(3)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:synonyms
kind: task
title: Словарь синонимов
category: Словари
level: easy
tags: словарь, обратный словарь
related: py:topic:dicts
## Условие
Дано N пар слов-синонимов (все слова различны). Затем дано слово из одной из пар. Выведите его синоним.
## Входные данные
N, затем N строк по два слова, затем одно слово.
## Выходные данные
Синоним.
## Примеры
```in
3
hello hi
bye goodbye
day sun
goodbye
```
```out
bye
```
## Подсказки
- Слово может быть как первым, так и вторым в паре.
- Добавьте в словарь обе связи: a → b и b → a.
- Тогда ответ — d[word].
## Решение: двусторонний словарь
@time: O(N) @memory: O(N)
```python
n = int(input())
d = {}
for _ in range(n):
    a, b = input().split()
    d[a] = b
    d[b] = a
print(d[input().strip()])
```
## Решение: поиск по парам
@time: O(N) @memory: O(N)
Без словаря — один проход по списку пар.
```python
n = int(input())
pairs = [input().split() for _ in range(n)]
w = input().strip()
for a, b in pairs:
    if w == a:
        print(b)
    elif w == b:
        print(a)
```
## Объяснение
Для одного запроса оба способа линейны; при многих запросах выгоднее словарь.
## Генератор
```python
import json
print(json.dumps(["1\na b\na", "1\na b\nb", "2\nx y\nu v\nu"]))
```

# id: task:average-grades
kind: task
title: Средний балл учеников
category: Словари
level: easy
tags: словарь списков, среднее, сортировка
related: lib:collections.defaultdict, py:builtin:sorted
## Условие
Дано N записей «фамилия оценка». У одного ученика может быть несколько оценок. Выведите для каждого ученика его фамилию и средний балл (два знака после точки) в алфавитном порядке фамилий.
## Входные данные
N, затем N строк «фамилия оценка» (оценка от 1 до 5).
## Выходные данные
Строки «фамилия среднее».
## Примеры
```in
4
ivanov 5
petrov 3
ivanov 4
petrov 4
```
```out
ivanov 4.50
petrov 3.50
```
## Подсказки
- Соберите оценки каждого ученика в список.
- defaultdict(list) создаёт пустой список для нового ключа.
- Среднее = sum / len, сортировка — sorted(d).
## Решение: defaultdict(list)
@time: O(N log N) @memory: O(N)
```python
from collections import defaultdict
n = int(input())
marks = defaultdict(list)
for _ in range(n):
    name, m = input().split()
    marks[name].append(int(m))
for name in sorted(marks):
    print(name, "%.2f" % (sum(marks[name]) / len(marks[name])))
```
## Решение: сумма и количество
@time: O(N log N) @memory: O(K)
Храним только пару (сумма, количество) — меньше памяти.
```python
n = int(input())
acc = {}
for _ in range(n):
    name, m = input().split()
    s, c = acc.get(name, (0, 0))
    acc[name] = (s + int(m), c + 1)
for name, (s, c) in sorted(acc.items()):
    print(f"{name} {s / c:.2f}")
```
## Объяснение
Сортировка по ключам словаря даёт алфавитный порядок фамилий.
## Генератор
```python
import json, random
random.seed(63)
names = ["ali", "bob", "vali", "zara"]
t = ["1\nx 5"]
for _ in range(4):
    n = random.randint(1, 15)
    t.append("%d\n%s" % (n, "\n".join("%s %d" % (random.choice(names), random.randint(1, 5)) for _ in range(n))))
print(json.dumps(t))
```

# id: task:roman-to-int
kind: task
title: Римские цифры в число
category: Словари
level: medium
tags: римские цифры, словарь, разбор
related: algo:number-systems
## Условие
Дано число, записанное римскими цифрами (от 1 до 3999). Выведите его в десятичной записи.
## Входные данные
Строка из символов I, V, X, L, C, D, M.
## Выходные данные
Число.
## Примеры
```in
MCMXCIV
```
```out
1994
```
## Подсказки
- Сопоставьте каждой цифре значение словарём.
- Если цифра меньше следующей, её нужно вычесть (IV = 4).
- Иначе — прибавить.
## Решение: сравнение с соседом
@time: O(n) @memory: O(1)
```python
v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
s = input().strip()
total = 0
for i, ch in enumerate(s):
    if i + 1 < len(s) and v[ch] < v[s[i + 1]]:
        total -= v[ch]
    else:
        total += v[ch]
print(total)
```
## Решение: проход справа налево
@time: O(n) @memory: O(1)
Справа налево: если цифра меньше максимума, уже встреченного правее, — вычитаем.
```python
v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
total = 0
mx = 0
for ch in reversed(input().strip()):
    if v[ch] < mx:
        total -= v[ch]
    else:
        total += v[ch]
        mx = v[ch]
print(total)
```
## Объяснение
MCMXCIV = 1000 + (1000 − 100) + (100 − 10) + (5 − 1) = 1994.
## Генератор
```python
import json
print(json.dumps(["I", "IV", "IX", "LVIII", "MMMCMXCIX", "XLII", "CDXLIV"]))
```

# id: task:int-to-roman
kind: task
title: Число в римские цифры
category: Словари
level: medium
tags: римские цифры, жадный, divmod
related: algo:greedy, algo:number-systems
## Условие
Дано целое число от 1 до 3999. Запишите его римскими цифрами.
## Входные данные
Число N.
## Выходные данные
Римская запись.
## Примеры
```in
1994
```
```out
MCMXCIV
```
## Подсказки
- Включите в таблицу и «вычитательные» пары: CM, CD, XC, XL, IX, IV.
- Идите от больших значений к меньшим.
- Пока N ≥ значения — дописывайте символы и вычитайте значение.
## Решение: жадный по таблице
@time: O(1) @memory: O(1)
```python
table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
         (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
n = int(input())
out = []
for value, sym in table:
    q, n = divmod(n, value)
    out.append(sym * q)
print("".join(out))
```
## Решение: по разрядам
@time: O(1) @memory: O(1)
Каждый десятичный разряд записывается своим набором из 10 вариантов.
```python
th = ["", "M", "MM", "MMM"]
hu = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
te = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"]
on = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
n = int(input())
print(th[n // 1000] + hu[n // 100 % 10] + te[n // 10 % 10] + on[n % 10])
```
## Объяснение
Жадный выбор корректен, потому что таблица включает все вычитательные пары.
## Генератор
```python
import json
print(json.dumps(["1", "4", "9", "14", "40", "3999", "2024", "444"]))
```

# id: task:isomorphic
kind: task
title: Изоморфные строки
category: Словари
level: medium
tags: отображение, биекция, словарь
related: py:builtin:zip
## Условие
Две строки одинаковой длины изоморфны, если символы первой можно взаимно однозначно заменить так, чтобы получилась вторая (egg и add изоморфны, foo и bar — нет). Выведите YES или NO.
## Входные данные
Две строки одинаковой длины (до 10^5).
## Выходные данные
YES или NO.
## Примеры
```in
paper
title
```
```out
YES
```
```in
badc
baba
```
```out
NO
```
## Подсказки
- Каждому символу первой строки должен соответствовать один символ второй.
- И наоборот: два разных символа не могут перейти в один.
- Проверьте оба словаря соответствий или сравните «шаблоны» строк.
## Решение: два словаря
@time: O(n) @memory: O(k)
```python
a = input().strip()
b = input().strip()
ab, ba = {}, {}
ok = True
for x, y in zip(a, b):
    if ab.setdefault(x, y) != y or ba.setdefault(y, x) != x:
        ok = False
        break
print("YES" if ok else "NO")
```
## Решение: сравнение шаблонов
@time: O(n) @memory: O(n)
Заменим каждый символ на номер его первого появления: «paper» → [0,1,0,2,3].
```python
def pattern(s):
    first = {}
    return [first.setdefault(ch, len(first)) for ch in s]

a = input().strip()
b = input().strip()
print("YES" if pattern(a) == pattern(b) else "NO")
```
## Решение: подсчёт различных пар
@time: O(n) @memory: O(k)
Изоморфность ⇔ число различных символов в a, в b и различных пар (a_i, b_i) совпадает.
```python
a = input().strip()
b = input().strip()
print("YES" if len(set(a)) == len(set(b)) == len(set(zip(a, b))) else "NO")
```
## Объяснение
setdefault возвращает уже сохранённое значение, если ключ есть, иначе сохраняет и возвращает новое.
## Генератор
```python
import json
print(json.dumps(["a\nb", "ab\naa", "aa\nab", "egg\nadd", "foo\nbar", "abcabc\nxyzxyz", "abab\nbaba"]))
```

# id: task:hanoi
kind: task
title: Ханойские башни
category: Рекурсия
level: medium
tags: рекурсия, ханойская башня, 2^n − 1
related: algo:recursion, py:topic:recursion
## Условие
Есть три стержня 1, 2, 3 и N дисков на стержне 1. Переложите все диски на стержень 3, перемещая по одному диску и никогда не кладя больший на меньший. Выведите количество ходов, затем сами ходы в формате «откуда куда».
## Входные данные
Число N (1 ≤ N ≤ 12).
## Выходные данные
Число ходов и ходы, каждый на отдельной строке.
## Примеры
```in
2
```
```out
3
1 2
1 3
2 3
```
## Подсказки
- Чтобы переложить N дисков, сначала уберите N−1 верхних на вспомогательный стержень.
- Затем переложите самый большой диск и верните N−1 дисков на него.
- Номер вспомогательного стержня: 6 − from − to.
## Решение: рекурсия
@time: O(2^N) @memory: O(N)
```python
def hanoi(n, a, b, moves):
    if n == 0:
        return
    c = 6 - a - b
    hanoi(n - 1, a, c, moves)
    moves.append(f"{a} {b}")
    hanoi(n - 1, c, b, moves)

n = int(input())
moves = []
hanoi(n, 1, 3, moves)
print(len(moves))
print("\n".join(moves))
```
## Решение: итеративно через биты номера хода
@time: O(2^N) @memory: O(1) на ход
На ходе m перекладывается диск с номером, равным числу младших нулей m; стержни считаются по формуле.
```python
n = int(input())
total = (1 << n) - 1
print(total)
out = []
for m in range(1, total + 1):
    src = (m & (m - 1)) % 3
    dst = ((m | (m - 1)) + 1) % 3
    if n % 2 == 0:
        out.append(f"{[1, 3, 2][src]} {[1, 3, 2][dst]}")
    else:
        out.append(f"{src + 1} {dst + 1}")
print("\n".join(out))
```
## Объяснение
Число ходов T(N) = 2·T(N−1) + 1 = 2^N − 1. Во втором способе формулы (m & (m−1)) % 3 и ((m | (m−1)) + 1) % 3 дают стержни для нечётного N; для чётного N стержни 2 и 3 меняются ролями.
## Генератор
```python
import json
print(json.dumps(["1", "3", "4", "5", "10"]))
```

# id: task:permutations
kind: task
title: Все перестановки
category: Рекурсия
level: medium
tags: перестановки, backtracking, itertools.permutations
related: lib:itertools.permutations, algo:backtracking
## Условие
Дано N. Выведите все перестановки чисел 1..N в лексикографическом порядке, каждую на отдельной строке.
## Входные данные
Число N (1 ≤ N ≤ 7).
## Выходные данные
N! строк.
## Примеры
```in
3
```
```out
1 2 3
1 3 2
2 1 3
2 3 1
3 1 2
3 2 1
```
## Подсказки
- Перестановку строят по позициям: на каждое место ставят ещё не использованное число.
- Рекурсия + массив used — классический перебор с возвратом.
- itertools.permutations выдаёт перестановки в лексикографическом порядке для отсортированного входа.
## Решение: перебор с возвратом
@time: O(N·N!) @memory: O(N)
```python
n = int(input())
used = [False] * (n + 1)
cur = []
out = []

def go():
    if len(cur) == n:
        out.append(" ".join(map(str, cur)))
        return
    for x in range(1, n + 1):
        if not used[x]:
            used[x] = True
            cur.append(x)
            go()
            cur.pop()
            used[x] = False

go()
print("\n".join(out))
```
## Решение: itertools.permutations
@time: O(N·N!) @memory: O(N)
```python
from itertools import permutations
n = int(input())
for p in permutations(range(1, n + 1)):
    print(*p)
```
## Решение: следующая перестановка
@time: O(N·N!) @memory: O(N)
Алгоритм next_permutation: найти самый правый спад, обменять с наименьшим большим справа, развернуть хвост.
```python
n = int(input())
a = list(range(1, n + 1))
out = []
while True:
    out.append(" ".join(map(str, a)))
    i = n - 2
    while i >= 0 and a[i] >= a[i + 1]:
        i -= 1
    if i < 0:
        break
    j = n - 1
    while a[j] <= a[i]:
        j -= 1
    a[i], a[j] = a[j], a[i]
    a[i + 1:] = reversed(a[i + 1:])
print("\n".join(out))
```
## Объяснение
next_permutation работает и для массивов с повторами — тогда перестановки не повторяются.
## Генератор
```python
import json
print(json.dumps(["1", "2", "4", "5"]))
```

# id: task:subsets
kind: task
title: Все подмножества
category: Рекурсия
level: medium
tags: подмножества, битовые маски, рекурсия
related: algo:bits, algo:backtracking, lib:itertools.combinations
## Условие
Дано N. Выведите все непустые подмножества множества {1..N}: сначала по возрастанию размера, внутри одного размера — в лексикографическом порядке. Элементы подмножества — по возрастанию.
## Входные данные
N (1 ≤ N ≤ 10).
## Выходные данные
2^N − 1 строк.
## Примеры
```in
3
```
```out
1
2
3
1 2
1 3
2 3
1 2 3
```
## Подсказки
- Подмножества размера k — это сочетания из N по k.
- itertools.combinations выдаёт их в лексикографическом порядке.
- Без библиотек: перебор масок 0..2^N−1 и сортировка по (размер, элементы).
## Решение: combinations по размерам
@time: O(N·2^N) @memory: O(N)
```python
from itertools import combinations
n = int(input())
for k in range(1, n + 1):
    for c in combinations(range(1, n + 1), k):
        print(*c)
```
## Решение: битовые маски
@time: O(N·2^N·log) @memory: O(N·2^N)
Бит i маски показывает, входит ли число i+1 в подмножество.
```python
n = int(input())
subs = []
for mask in range(1, 1 << n):
    subs.append([i + 1 for i in range(n) if mask >> i & 1])
subs.sort(key=lambda s: (len(s), s))
for s in subs:
    print(*s)
```
## Решение: рекурсия по сочетаниям
@time: O(N·2^N) @memory: O(N)
```python
n = int(input())
out = []

def gen(start, k, cur):
    if len(cur) == k:
        out.append(" ".join(map(str, cur)))
        return
    for x in range(start, n + 1):
        cur.append(x)
        gen(x + 1, k, cur)
        cur.pop()

for k in range(1, n + 1):
    gen(1, k, [])
print("\n".join(out))
```
## Объяснение
Всего подмножеств 2^N, так как каждый элемент либо входит, либо нет.
## Генератор
```python
import json
print(json.dumps(["1", "2", "4", "6"]))
```

# id: task:no-adjacent-ones
kind: task
title: Строки без двух единиц подряд
category: Рекурсия
level: medium
tags: генерация, рекурсия, Фибоначчи
related: algo:backtracking, algo:dp
## Условие
Выведите в лексикографическом порядке все двоичные строки длины N, в которых нет двух единиц подряд, а затем их количество.
## Входные данные
N (1 ≤ N ≤ 15).
## Выходные данные
Строки, затем количество.
## Примеры
```in
3
```
```out
000
001
010
100
101
5
```
## Подсказки
- Строим строку слева направо: 0 можно поставить всегда.
- 1 — только если предыдущий символ не 1.
- Количество таких строк — число Фибоначчи F(N+2).
## Решение: рекурсивная генерация
@time: O(N·F(N)) @memory: O(N)
```python
n = int(input())
out = []

def gen(s):
    if len(s) == n:
        out.append(s)
        return
    gen(s + "0")
    if not s or s[-1] != "1":
        gen(s + "1")

gen("")
print("\n".join(out))
print(len(out))
```
## Решение: перебор масок с фильтром
@time: O(N·2^N) @memory: O(1)
x & (x >> 1) == 0 ⇔ в двоичной записи x нет соседних единиц.
```python
n = int(input())
cnt = 0
for x in range(1 << n):
    if x & (x >> 1) == 0:
        print(format(x, "0%db" % n))
        cnt += 1
print(cnt)
```
## Объяснение
Порядок масок 0, 1, 2, … совпадает с лексикографическим порядком строк фиксированной длины.
## Генератор
```python
import json
print(json.dumps(["1", "2", "5", "10", "15"]))
```

# id: task:n-queens
kind: task
title: N ферзей
category: Рекурсия
level: hard
tags: backtracking, ферзи, битовые маски
related: algo:backtracking, algo:bits
## Условие
Сколькими способами можно расставить N ферзей на доске N×N так, чтобы они не били друг друга?
## Входные данные
N (1 ≤ N ≤ 10).
## Выходные данные
Количество расстановок.
## Примеры
```in
4
```
```out
2
```
```in
8
```
```out
92
```
## Подсказки
- В каждой строке ровно один ферзь — ставьте их построчно.
- Храните занятые столбцы и диагонали (r−c и r+c).
- Битовые маски делают проверку очень быстрой.
## Решение: перебор с возвратом
@time: O(N!) в худшем @memory: O(N)
```python
n = int(input())
cols, d1, d2 = set(), set(), set()

def place(r):
    if r == n:
        return 1
    total = 0
    for c in range(n):
        if c in cols or r - c in d1 or r + c in d2:
            continue
        cols.add(c); d1.add(r - c); d2.add(r + c)
        total += place(r + 1)
        cols.remove(c); d1.remove(r - c); d2.remove(r + c)
    return total

print(place(0))
```
## Решение: битовые маски
@time: O(N!) в худшем, очень малая константа @memory: O(N)
Свободные позиции строки — биты, не занятые столбцами и диагоналями; x & -x выделяет младший бит.
```python
n = int(input())
full = (1 << n) - 1

def solve(cols, ld, rd):
    if cols == full:
        return 1
    count = 0
    free = full & ~(cols | ld | rd)
    while free:
        bit = free & -free
        free -= bit
        count += solve(cols | bit, (ld | bit) << 1 & full, (rd | bit) >> 1)
    return count

print(solve(0, 0, 0))
```
## Объяснение
Диагонали при переходе на следующую строку сдвигаются на одну клетку — отсюда сдвиги масок.
## Генератор
```python
import json
print(json.dumps(["1", "2", "3", "5", "6", "7", "9", "10"]))
```

# id: task:parentheses-gen
kind: task
title: Правильные скобочные последовательности
category: Рекурсия
level: medium
tags: скобки, генерация, Каталан
related: algo:backtracking, algo:combinatorics
## Условие
Выведите в лексикографическом порядке все правильные скобочные последовательности из N пар круглых скобок (считаем, что «(» < «)»).
## Входные данные
N (1 ≤ N ≤ 8).
## Выходные данные
Последовательности, по одной в строке.
## Примеры
```in
2
```
```out
(())
()()
```
## Подсказки
- Открывающую скобку можно поставить, если их меньше N.
- Закрывающую — если закрытых меньше, чем открытых.
- Сначала пробуйте «(», потом «)» — получится лексикографический порядок.
## Решение: рекурсия со счётчиками
@time: O(N·C_N) @memory: O(N)
```python
n = int(input())
out = []

def gen(s, opened, closed):
    if len(s) == 2 * n:
        out.append(s)
        return
    if opened < n:
        gen(s + "(", opened + 1, closed)
    if closed < opened:
        gen(s + ")", opened, closed + 1)

gen("", 0, 0)
print("\n".join(out))
```
## Решение: перебор строк с проверкой баланса
@time: O(N·4^N) @memory: O(N)
Перебираем все строки из 2N скобок в лексикографическом порядке и оставляем правильные.
```python
from itertools import product
n = int(input())
for p in product("()", repeat=2 * n):
    bal = 0
    for ch in p:
        bal += 1 if ch == "(" else -1
        if bal < 0:
            break
    if bal == 0:
        print("".join(p))
```
## Объяснение
Количество последовательностей — число Каталана C_N = C(2N, N) / (N + 1). Второй способ годится для проверки на маленьких N.
## Генератор
```python
import json
print(json.dumps(["1", "3", "4", "6"]))
```
