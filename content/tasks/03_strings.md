# id: task:count-char
kind: task
title: Сколько раз встречается символ
category: Строки
level: beginner
tags: count, строка, символ
related: py:method:str.count
## Условие
Дана строка S и символ C. Выведите, сколько раз C встречается в S.
## Входные данные
В первой строке S (длина до 10^5), во второй — один символ C.
## Выходные данные
Количество вхождений.
## Примеры
```in
banana
a
```
```out
3
```
## Подсказки
- Пройдите по строке и сравнивайте каждый символ с C.
- Считайте совпадения в переменной-счётчике.
- У строк есть метод count.
## Решение: метод count
@time: O(n) @memory: O(1)
```python
s = input()
c = input()
print(s.count(c))
```
## Решение: цикл
@time: O(n) @memory: O(1)
```python
s = input()
c = input()
k = 0
for ch in s:
    if ch == c:
        k += 1
print(k)
```
## Решение: sum по генератору
@time: O(n) @memory: O(1)
True в сумме считается как 1.
```python
s = input()
c = input()
print(sum(ch == c for ch in s))
```
## Объяснение
str.count считает непересекающиеся вхождения подстроки; для одного символа это просто число совпадений.
## Генератор
```python
import json, random
random.seed(31)
t = []
for _ in range(6):
    s = "".join(random.choice("abc") for _ in range(random.randint(1, 50)))
    t.append(s + "\n" + random.choice("abcd"))
print(json.dumps(t))
```

# id: task:vowels-count
kind: task
title: Подсчёт гласных
category: Строки
level: beginner
tags: гласные, множество, in, lower
related: py:method:str.lower, py:topic:sets
## Условие
Дана строка из русских и латинских букв, пробелов и знаков препинания. Посчитайте количество гласных букв (русские: а е ё и о у ы э ю я, латинские: a e i o u), регистр не важен.
## Входные данные
Одна строка длиной до 10^5.
## Выходные данные
Количество гласных.
## Примеры
```in
Привет, World!
```
```out
3
```
## Подсказки
- Приведите строку к нижнему регистру.
- Сложите все гласные в одну строку или множество.
- Для каждого символа проверьте ch in vowels.
## Решение: множество гласных
@time: O(n) @memory: O(1)
```python
vowels = set("аеёиоуыэюяaeiou")
print(sum(1 for ch in input().lower() if ch in vowels))
```
## Решение: цикл со счётчиком
@time: O(n) @memory: O(1)
```python
s = input().lower()
count = 0
for ch in s:
    if ch in "аеёиоуыэюяaeiou":
        count += 1
print(count)
```
## Решение: регулярное выражение
@time: O(n) @memory: O(n)
re.findall возвращает все найденные гласные списком.
```python
import re
print(len(re.findall(r"[аеёиоуыэюяaeiou]", input(), flags=re.IGNORECASE)))
```
## Объяснение
Проверка ch in set выполняется за O(1); in по короткой строке из 15 символов — тоже быстро.
## Генератор
```python
import json
print(json.dumps(["", "xyz", "AEIOU", "Съешь же ещё этих мягких французских булок", "Python is AWESOME", "ЁЖ"]))
```

# id: task:word-count
kind: task
title: Количество слов
category: Строки
level: beginner
tags: split, слова, пробелы
related: py:method:str.split
## Условие
Дана строка. Слова разделены одним или несколькими пробелами, в начале и конце строки тоже могут быть пробелы. Выведите количество слов.
## Входные данные
Одна строка длиной до 10^5.
## Выходные данные
Количество слов.
## Примеры
```in
  hello   big world 
```
```out
3
```
## Подсказки
- split() без аргументов разделяет по любым пробельным символам.
- Пустые строки при этом не появляются.
- Ответ — длина полученного списка.
## Решение: split()
@time: O(n) @memory: O(n)
```python
print(len(input().split()))
```
## Решение: подсчёт начал слов
@time: O(n) @memory: O(1)
Слово начинается там, где после пробела (или начала строки) идёт не пробел.
```python
s = input()
count = 0
prev = " "
for ch in s:
    if ch != " " and prev == " ":
        count += 1
    prev = ch
print(count)
```
## Объяснение
split(" ") с явным разделителем вернул бы пустые строки между пробелами, поэтому используем split() без аргумента.
## Генератор
```python
import json
print(json.dumps(["one", "a b c", "   x   ", "word  word   word", "Salom dunyo bu Python"]))
```

# id: task:longest-word
kind: task
title: Самое длинное слово
category: Строки
level: easy
tags: max, key=len, split
related: py:builtin:max, py:method:str.split
## Условие
Дана строка из слов, разделённых пробелами. Выведите самое длинное слово; если таких несколько — первое из них.
## Входные данные
Одна строка, хотя бы одно слово.
## Выходные данные
Самое длинное слово.
## Примеры
```in
мама мыла раму долго
```
```out
долго
```
## Подсказки
- Разбейте строку на слова.
- Сравнивайте слова по длине.
- max(words, key=len) возвращает первое слово максимальной длины.
## Решение: max с key
@time: O(n) @memory: O(n)
```python
print(max(input().split(), key=len))
```
## Решение: цикл
@time: O(n) @memory: O(n)
Обновляем ответ только при строго большей длине — так сохраняется первое слово.
```python
best = ""
for w in input().split():
    if len(w) > len(best):
        best = w
print(best)
```
## Объяснение
max при равенстве ключей возвращает первый встреченный элемент.
## Генератор
```python
import json
print(json.dumps(["a", "ab abc abd", "xx yy zz", "Python dasturlash tili", "один два три четыре"]))
```

# id: task:title-case
kind: task
title: Каждое слово с большой буквы
category: Строки
level: beginner
tags: capitalize, upper, title, split, join
related: py:method:str.capitalize, py:method:str.join
## Условие
Дана строка из слов, разделённых одиночными пробелами, все буквы строчные. Сделайте первую букву каждого слова заглавной.
## Входные данные
Одна строка из строчных букв и пробелов.
## Выходные данные
Изменённая строка.
## Примеры
```in
hello world from python
```
```out
Hello World From Python
```
## Подсказки
- Разбейте строку на слова.
- word[0].upper() + word[1:] делает первую букву заглавной.
- Соберите слова обратно через " ".join(...).
## Решение: capitalize и join
@time: O(n) @memory: O(n)
```python
print(" ".join(w.capitalize() for w in input().split(" ")))
```
## Решение: срезы
@time: O(n) @memory: O(n)
```python
words = input().split(" ")
print(" ".join(w[:1].upper() + w[1:] for w in words))
```
## Решение: метод title
@time: O(n) @memory: O(n)
str.title() делает заглавной первую букву после любого не-буквенного символа — для строк из букв и пробелов результат тот же.
```python
print(input().title())
```
## Объяснение
Осторожно: "don't".title() даёт "Don'T" — title считает апостроф границей слова. Для этой задачи апострофов нет.
## Генератор
```python
import json
print(json.dumps(["a", "python", "a b c", "salom dunyo", "привет мир"]))
```

# id: task:phrase-palindrome
kind: task
title: Фраза-палиндром
category: Строки
level: easy
tags: палиндром, isalnum, lower, фильтр
related: algo:palindromes, py:method:str.isalnum
## Условие
Дана фраза. Проверьте, является ли она палиндромом, если не учитывать регистр, пробелы и знаки препинания (учитываются только буквы и цифры). Выведите YES или NO.
## Входные данные
Одна строка длиной до 10^5.
## Выходные данные
YES или NO.
## Примеры
```in
А роза упала на лапу Азора
```
```out
YES
```
```in
Hello, world
```
```out
NO
```
## Подсказки
- Оставьте только буквы и цифры: ch.isalnum().
- Приведите к одному регистру.
- Сравните строку с её разворотом.
## Решение: фильтр и разворот
@time: O(n) @memory: O(n)
```python
s = [ch.lower() for ch in input() if ch.isalnum()]
print("YES" if s == s[::-1] else "NO")
```
## Решение: два указателя без копии
@time: O(n) @memory: O(1)
Указатели пропускают лишние символы и сравнивают буквы с двух концов.
```python
s = input()
i, j = 0, len(s) - 1
ok = True
while i < j:
    if not s[i].isalnum():
        i += 1
    elif not s[j].isalnum():
        j -= 1
    elif s[i].lower() != s[j].lower():
        ok = False
        break
    else:
        i += 1
        j -= 1
print("YES" if ok else "NO")
```
## Объяснение
Второй способ не создаёт новую строку — память O(1).
## Генератор
```python
import json
print(json.dumps(["", "a", "ab", "Madam, I'm Adam", "Was it a car or a cat I saw?", "12321", "123 21", "Топот"]))
```

# id: task:anagram
kind: task
title: Анаграммы
category: Строки
level: easy
tags: анаграмма, sorted, Counter
related: lib:collections.Counter, py:builtin:sorted, algo:hashing
## Условие
Даны два слова. Выведите YES, если одно можно получить из другого перестановкой букв, иначе NO.
## Входные данные
Два слова на отдельных строках (длина до 10^5).
## Выходные данные
YES или NO.
## Примеры
```in
listen
silent
```
```out
YES
```
## Подсказки
- У анаграмм одинаковый набор букв с учётом повторов.
- Отсортированные буквы анаграмм совпадают.
- Counter считает буквы за O(n).
## Решение: сортировка
@time: O(n log n) @memory: O(n)
```python
a = input().strip()
b = input().strip()
print("YES" if sorted(a) == sorted(b) else "NO")
```
## Решение: Counter
@time: O(n) @memory: O(k)
```python
from collections import Counter
a = input().strip()
b = input().strip()
print("YES" if Counter(a) == Counter(b) else "NO")
```
## Решение: массив счётчиков
@time: O(n) @memory: O(k)
Словарь счётчиков: увеличиваем для букв первого слова, уменьшаем для второго.
```python
a = input().strip()
b = input().strip()
cnt = {}
for ch in a:
    cnt[ch] = cnt.get(ch, 0) + 1
for ch in b:
    cnt[ch] = cnt.get(ch, 0) - 1
print("YES" if all(v == 0 for v in cnt.values()) else "NO")
```
## Объяснение
Сортировка проще всего записывается, Counter быстрее на длинных строках.
## Генератор
```python
import json, random
random.seed(32)
t = ["a\na", "ab\nba", "aab\nabb", "abc\nabcd"]
for _ in range(4):
    s = "".join(random.choice("abcde") for _ in range(30))
    l = list(s); random.shuffle(l)
    if random.random() < 0.5:
        l[0] = "z"
    t.append(s + "\n" + "".join(l))
print(json.dumps(t))
```

# id: task:caesar
kind: task
title: Шифр Цезаря
category: Строки
level: easy
tags: шифр, ord, chr, сдвиг, остаток
related: py:builtin:ord, py:builtin:chr, py:method:str.translate
## Условие
Зашифруйте строку шифром Цезаря со сдвигом K: каждая латинская буква заменяется на букву, стоящую на K позиций дальше по алфавиту (по кругу), регистр сохраняется, остальные символы не меняются.
## Входные данные
В первой строке K (0 ≤ K ≤ 10^9), во второй — текст.
## Выходные данные
Зашифрованный текст.
## Примеры
```in
3
Hello, World!
```
```out
Khoor, Zruog!
```
## Подсказки
- Номер буквы: ord(ch) - ord('a').
- Новый номер: (номер + K) % 26.
- Обратно в символ: chr(ord('a') + новый номер); для заглавных — от 'A'.
## Решение: ord и chr
@time: O(n) @memory: O(n)
```python
k = int(input()) % 26
res = []
for ch in input():
    if "a" <= ch <= "z":
        res.append(chr((ord(ch) - 97 + k) % 26 + 97))
    elif "A" <= ch <= "Z":
        res.append(chr((ord(ch) - 65 + k) % 26 + 65))
    else:
        res.append(ch)
print("".join(res))
```
## Решение: таблица перевода
@time: O(n) @memory: O(1)
str.maketrans строит таблицу замены, translate применяет её ко всей строке.
```python
import string
k = int(input()) % 26
low, up = string.ascii_lowercase, string.ascii_uppercase
table = str.maketrans(low + up, low[k:] + low[:k] + up[k:] + up[:k])
print(input().translate(table))
```
## Объяснение
K % 26 сокращает огромный сдвиг: сдвиг на 26 возвращает алфавит на место.
## Генератор
```python
import json
print(json.dumps(["0\nabc", "1\nxyz XYZ", "25\nHello", "1000000000\nThe quick brown fox!", "13\nПривет, abc"]))
```

# id: task:unique-chars-order
kind: task
title: Удалить повторяющиеся символы
category: Строки
level: easy
tags: множество, порядок, dict.fromkeys
related: py:method:dict.fromkeys, py:topic:sets
## Условие
Дана строка. Удалите из неё все повторные вхождения символов, оставив только первое вхождение каждого.
## Входные данные
Одна строка длиной до 10^5.
## Выходные данные
Строка без повторов.
## Примеры
```in
programming
```
```out
progamin
```
## Подсказки
- Нужно помнить, какие символы уже встречались.
- Множество seen и проверка ch in seen работают за O(1).
- dict.fromkeys(s) сохраняет порядок первых вхождений.
## Решение: множество seen
@time: O(n) @memory: O(k)
```python
seen = set()
out = []
for ch in input():
    if ch not in seen:
        seen.add(ch)
        out.append(ch)
print("".join(out))
```
## Решение: dict.fromkeys
@time: O(n) @memory: O(k)
Словарь хранит ключи в порядке вставки (Python 3.7+), повторные ключи игнорируются.
```python
print("".join(dict.fromkeys(input())))
```
## Объяснение
set(s) удаляет повторы, но теряет порядок — поэтому нужен seen или dict.
## Генератор
```python
import json
print(json.dumps(["a", "aaaa", "abcabc", "mississippi", "Hello World", "абракадабра"]))
```

# id: task:char-frequency
kind: task
title: Частота символов
category: Строки
level: easy
tags: Counter, словарь, сортировка
related: lib:collections.Counter, py:builtin:sorted
## Условие
Дана строка из строчных латинских букв. Для каждой встречающейся буквы выведите строку «буква количество» в алфавитном порядке букв.
## Входные данные
Строка длиной до 10^5.
## Выходные данные
Строки вида «a 3».
## Примеры
```in
banana
```
```out
a 3
b 1
n 2
```
## Подсказки
- Посчитайте каждую букву в словаре.
- Отсортируйте ключи словаря.
- Counter(s) делает подсчёт за вас.
## Решение: Counter
@time: O(n + k log k) @memory: O(k)
```python
from collections import Counter
for ch, c in sorted(Counter(input().strip()).items()):
    print(ch, c)
```
## Решение: массив на 26 букв
@time: O(n) @memory: O(1)
Индекс буквы — ord(ch) - ord('a'); сортировка не нужна, массив уже упорядочен.
```python
cnt = [0] * 26
for ch in input().strip():
    cnt[ord(ch) - 97] += 1
for i in range(26):
    if cnt[i]:
        print(chr(97 + i), cnt[i])
```
## Объяснение
Массив счётчиков — классический олимпиадный приём для маленького алфавита.
## Генератор
```python
import json, random
random.seed(33)
print(json.dumps(["a", "zzz", "abcxyz"] + ["".join(random.choice("abcdefz") for _ in range(random.randint(1, 60))) for _ in range(4)]))
```

# id: task:rle-encode
kind: task
title: Сжатие RLE
category: Строки
level: easy
tags: RLE, groupby, группы символов
related: lib:itertools.groupby
## Условие
Сожмите строку: каждую группу одинаковых подряд идущих символов замените на символ и длину группы (длину 1 тоже пишем). Например, aaabcc → a3b1c2.
## Входные данные
Непустая строка из латинских букв длиной до 10^5.
## Выходные данные
Сжатая строка.
## Примеры
```in
aaabcc
```
```out
a3b1c2
```
## Подсказки
- Идите по строке и считайте длину текущей группы.
- Когда символ меняется — записывайте группу и начинайте новую.
- itertools.groupby разбивает строку на группы сам.
## Решение: groupby
@time: O(n) @memory: O(n)
```python
from itertools import groupby
print("".join(ch + str(len(list(g))) for ch, g in groupby(input().strip())))
```
## Решение: ручной проход
@time: O(n) @memory: O(n)
```python
s = input().strip()
out = []
i = 0
while i < len(s):
    j = i
    while j < len(s) and s[j] == s[i]:
        j += 1
    out.append(s[i] + str(j - i))
    i = j
print("".join(out))
```
## Решение: регулярное выражение
@time: O(n) @memory: O(n)
(.)\1* находит символ и все его повторы подряд.
```python
import re
print("".join(m.group(1) + str(len(m.group(0))) for m in re.finditer(r"(.)\1*", input().strip())))
```
## Объяснение
groupby группирует только соседние одинаковые элементы — ровно то, что нужно для RLE.
## Генератор
```python
import json, random
random.seed(34)
print(json.dumps(["a", "ab", "aaaaaaaaaaaa", "abba"] + ["".join(random.choice("ab") * random.randint(1, 5) for _ in range(10)) for _ in range(4)]))
```

# id: task:rle-decode
kind: task
title: Распаковка RLE
category: Строки
level: easy
tags: RLE, распаковка, регулярные выражения
related: lib:re.findall
## Условие
Дана сжатая строка вида a3b12c1: буква и число повторов (число может быть многозначным). Распакуйте её.
## Входные данные
Сжатая строка; длина результата не больше 10^5.
## Выходные данные
Исходная строка.
## Примеры
```in
a3b1c2
```
```out
aaabcc
```
## Подсказки
- После каждой буквы идёт число, возможно из нескольких цифр.
- Накапливайте цифры, пока не встретите следующую букву.
- re.findall(r"([a-z])(\d+)", s) вернёт пары (буква, число).
## Решение: регулярное выражение
@time: O(n) @memory: O(n)
```python
import re
print("".join(ch * int(k) for ch, k in re.findall(r"([A-Za-z])(\d+)", input().strip())))
```
## Решение: посимвольный разбор
@time: O(n) @memory: O(n)
```python
s = input().strip()
out = []
ch = ""
num = 0
for c in s + "#":
    if c.isdigit():
        num = num * 10 + int(c)
    else:
        if ch:
            out.append(ch * num)
        ch, num = c, 0
print("".join(out))
```
## Объяснение
Маркер "#" в конце позволяет записать последнюю группу без отдельного кода после цикла.
## Генератор
```python
import json
print(json.dumps(["a1", "a10", "a1b1c1", "z12y3", "a100b200"]))
```

# id: task:reverse-words
kind: task
title: Слова в обратном порядке
category: Строки
level: beginner
tags: split, reversed, join
related: py:builtin:reversed, py:method:str.join
## Условие
Дана строка из слов, разделённых пробелами. Выведите слова в обратном порядке, разделив их одним пробелом.
## Входные данные
Одна строка.
## Выходные данные
Слова в обратном порядке.
## Примеры
```in
я люблю python
```
```out
python люблю я
```
## Подсказки
- Разбейте строку на список слов.
- Переверните список: [::-1] или reversed().
- Соедините через " ".join().
## Решение: срез
@time: O(n) @memory: O(n)
```python
print(" ".join(input().split()[::-1]))
```
## Решение: reversed
@time: O(n) @memory: O(n)
```python
print(*reversed(input().split()))
```
## Решение: стек
@time: O(n) @memory: O(n)
Последнее положенное в стек слово снимается первым.
```python
stack = input().split()
out = []
while stack:
    out.append(stack.pop())
print(" ".join(out))
```
## Объяснение
split() без аргумента также убирает лишние пробелы.
## Генератор
```python
import json
print(json.dumps(["one", "a b", "  a  b  c ", "bir ikki uch"]))
```

# id: task:swap-case
kind: task
title: Поменять регистр
category: Строки
level: beginner
tags: swapcase, upper, lower, isupper
related: py:method:str.swapcase
## Условие
Дана строка. Замените все строчные буквы заглавными, а заглавные — строчными.
## Входные данные
Одна строка.
## Выходные данные
Изменённая строка.
## Примеры
```in
Hello Мир 2024
```
```out
hELLO мИР 2024
```
## Подсказки
- Проверяйте каждый символ: isupper() / islower().
- Меняйте регистр через lower() / upper().
- Готовый метод — swapcase().
## Решение: swapcase
@time: O(n) @memory: O(n)
```python
print(input().swapcase())
```
## Решение: посимвольно
@time: O(n) @memory: O(n)
```python
print("".join(ch.lower() if ch.isupper() else ch.upper() for ch in input()))
```
## Объяснение
Методы работают и для кириллицы — строки в Python хранят Unicode.
## Генератор
```python
import json
print(json.dumps(["abc", "ABC", "PyThOn 3.11", "Ёлка ёЛКА", "123"]))
```

# id: task:substring-occurrences
kind: task
title: Вхождения подстроки с перекрытием
category: Строки
level: medium
tags: find, подстрока, перекрытия, KMP
related: py:method:str.find, algo:string-algorithms
## Условие
Даны строки S и P. Найдите количество вхождений P в S, считая перекрывающиеся (в «aaaa» строка «aa» встречается 3 раза).
## Входные данные
S в первой строке (длина до 10^5), P во второй (1 ≤ |P| ≤ |S|).
## Выходные данные
Количество вхождений.
## Примеры
```in
aaaa
aa
```
```out
3
```
## Подсказки
- str.count не подходит: он считает только непересекающиеся вхождения.
- Ищите следующее вхождение с позиции «предыдущее + 1» методом find.
- Для гарантированного O(n + m) используйте префикс-функцию (KMP).
## Решение: find в цикле
@time: O(n·m) в худшем случае @memory: O(1)
```python
s = input()
p = input()
count = 0
i = s.find(p)
while i != -1:
    count += 1
    i = s.find(p, i + 1)
print(count)
```
## Решение: префикс-функция (KMP)
@time: O(n + m) @memory: O(n + m)
Префикс-функция строки P#S: позиции со значением |P| — концы вхождений.
```python
s = input()
p = input()
t = p + "\0" + s
pi = [0] * len(t)
count = 0
for i in range(1, len(t)):
    k = pi[i - 1]
    while k and t[i] != t[k]:
        k = pi[k - 1]
    if t[i] == t[k]:
        k += 1
    pi[i] = k
    if k == len(p):
        count += 1
print(count)
```
## Решение: сравнение срезов
@time: O(n·m) @memory: O(m)
Проверяем каждую позицию начала.
```python
s = input()
p = input()
m = len(p)
print(sum(1 for i in range(len(s) - m + 1) if s[i:i + m] == p))
```
## Объяснение
Символ "\0" не встречается во входе и разделяет P и S, чтобы префикс-функция не «перескочила» через границу.
## Генератор
```python
import json, random
random.seed(35)
t = ["a\na", "abc\nd", "abababa\naba", "aaaaaaaaaa\naaa"]
for _ in range(4):
    s = "".join(random.choice("ab") for _ in range(200))
    t.append(s + "\n" + "".join(random.choice("ab") for _ in range(random.randint(1, 4))))
print(json.dumps(t))
```

# id: task:first-unique
kind: task
title: Первый неповторяющийся символ
category: Строки
level: easy
tags: Counter, уникальный, порядок
related: lib:collections.Counter
## Условие
Дана строка. Выведите первый символ, который встречается в ней ровно один раз, или −1, если таких нет.
## Входные данные
Строка длиной до 10^5.
## Выходные данные
Символ или −1.
## Примеры
```in
swiss
```
```out
w
```
## Подсказки
- Сначала посчитайте, сколько раз встречается каждый символ.
- Вторым проходом найдите первый символ со счётчиком 1.
- s.count(ch) в цикле дал бы O(n²) — медленно.
## Решение: Counter и второй проход
@time: O(n) @memory: O(k)
```python
from collections import Counter
s = input()
cnt = Counter(s)
print(next((ch for ch in s if cnt[ch] == 1), -1))
```
## Решение: словарь вручную
@time: O(n) @memory: O(k)
```python
s = input()
cnt = {}
for ch in s:
    cnt[ch] = cnt.get(ch, 0) + 1
ans = -1
for ch in s:
    if cnt[ch] == 1:
        ans = ch
        break
print(ans)
```
## Объяснение
next(генератор, по_умолчанию) возвращает первый элемент генератора или значение по умолчанию.
## Генератор
```python
import json
print(json.dumps(["a", "aa", "abcabc", "aabbc", "leetcode", "loveleetcode"]))
```

# id: task:pangram
kind: task
title: Панграмма
category: Строки
level: easy
tags: множество, алфавит, issubset
related: lib:string.ascii_lowercase, py:topic:sets
## Условие
Дана английская фраза. Выведите YES, если в ней встречаются все 26 букв латинского алфавита (без учёта регистра), иначе NO.
## Входные данные
Строка длиной до 10^5.
## Выходные данные
YES или NO.
## Примеры
```in
The quick brown fox jumps over the lazy dog
```
```out
YES
```
## Подсказки
- Соберите множество букв фразы в нижнем регистре.
- Сравните с множеством всех букв алфавита.
- set(string.ascii_lowercase) <= set(s.lower()).
## Решение: множества
@time: O(n) @memory: O(1)
```python
import string
print("YES" if set(string.ascii_lowercase) <= set(input().lower()) else "NO")
```
## Решение: проверка каждой буквы
@time: O(26·n) @memory: O(1)
```python
s = input().lower()
print("YES" if all(chr(c) in s for c in range(ord("a"), ord("z") + 1)) else "NO")
```
## Объяснение
Оператор <= для множеств проверяет «является подмножеством».
## Генератор
```python
import json
print(json.dumps(["abc", "abcdefghijklmnopqrstuvwxyz", "Pack my box with five dozen liquor jugs", "Hello world"]))
```

# id: task:common-prefix
kind: task
title: Общий префикс
category: Строки
level: easy
tags: префикс, zip, os.path.commonprefix
related: py:builtin:zip, lib:os.path.commonprefix
## Условие
Даны N слов. Найдите их самый длинный общий префикс. Если он пустой, выведите -.
## Входные данные
В первой строке N (1 ≤ N ≤ 1000), далее N слов по одному в строке.
## Выходные данные
Общий префикс или -.
## Примеры
```in
3
flower
flow
flight
```
```out
fl
```
## Подсказки
- Префикс не длиннее самого короткого слова.
- Сравнивайте символы на одной позиции во всех словах.
- zip(*words) группирует символы по позициям.
## Решение: zip по позициям
@time: O(N·L) @memory: O(N)
```python
n = int(input())
words = [input().strip() for _ in range(n)]
prefix = []
for chars in zip(*words):
    if len(set(chars)) != 1:
        break
    prefix.append(chars[0])
print("".join(prefix) or "-")
```
## Решение: сравнение минимума и максимума
@time: O(N·L) @memory: O(N)
Общий префикс всех слов равен общему префиксу лексикографически минимального и максимального.
```python
n = int(input())
words = [input().strip() for _ in range(n)]
a, b = min(words), max(words)
i = 0
while i < len(a) and a[i] == b[i]:
    i += 1
print(a[:i] or "-")
```
## Решение: os.path.commonprefix
@time: O(N·L) @memory: O(N)
Функция работает посимвольно для любых строк, не только путей.
```python
import os
n = int(input())
words = [input().strip() for _ in range(n)]
print(os.path.commonprefix(words) or "-")
```
## Объяснение
Строки между min и max в лексикографическом порядке разделяют их общий префикс.
## Генератор
```python
import json
print(json.dumps(["1\nabc", "2\nabc\nabd", "2\nabc\nxyz", "3\na\nab\nabc", "4\ninterview\ninternet\ninterval\ninternal"]))
```

# id: task:camel-to-snake
kind: task
title: camelCase в snake_case
category: Строки
level: easy
tags: camelCase, snake_case, регулярные выражения
related: lib:re.sub, py:method:str.isupper
## Условие
Дано имя переменной в стиле camelCase (первая буква строчная, без цифр). Переведите его в snake_case: каждая заглавная буква заменяется на «_» и ту же букву в нижнем регистре.
## Входные данные
Строка из латинских букв.
## Выходные данные
Имя в snake_case.
## Примеры
```in
myVariableName
```
```out
my_variable_name
```
## Подсказки
- Найдите заглавные буквы: ch.isupper().
- Перед каждой из них добавьте "_".
- re.sub(r"([A-Z])", r"_\1", s).lower() делает это одной строкой.
## Решение: посимвольно
@time: O(n) @memory: O(n)
```python
out = []
for ch in input().strip():
    if ch.isupper():
        out.append("_" + ch.lower())
    else:
        out.append(ch)
print("".join(out))
```
## Решение: re.sub
@time: O(n) @memory: O(n)
```python
import re
print(re.sub(r"([A-Z])", r"_\1", input().strip()).lower())
```
## Объяснение
\1 в строке замены — первая захваченная группа (найденная буква).
## Генератор
```python
import json
print(json.dumps(["x", "camelCase", "aBC", "getHttpResponseCode", "simple"]))
```

# id: task:sum-digits-in-string
kind: task
title: Числа в тексте
category: Строки
level: easy
tags: регулярные выражения, isdigit, числа в строке
related: lib:re.findall, py:method:str.isdigit
## Условие
Дан текст. Найдите сумму всех целых неотрицательных чисел, записанных в нём (число — максимальная последовательность цифр подряд).
## Входные данные
Строка длиной до 10^5.
## Выходные данные
Сумма чисел.
## Примеры
```in
abc12de3f45
```
```out
60
```
## Подсказки
- Цифры, стоящие подряд, образуют одно число.
- Накапливайте текущее число, пока идут цифры, и прибавляйте его к сумме при встрече не-цифры.
- re.findall(r"\d+", s) находит все числа сразу.
## Решение: регулярное выражение
@time: O(n) @memory: O(n)
```python
import re
print(sum(map(int, re.findall(r"[0-9]+", input()))))
```
## Решение: конечный автомат
@time: O(n) @memory: O(1)
```python
total = 0
cur = 0
for ch in input() + " ":
    if "0" <= ch <= "9":
        cur = cur * 10 + int(ch)
    else:
        total += cur
        cur = 0
print(total)
```
## Объяснение
Класс [0-9] берёт только ASCII-цифры; \d в Python совпадает и с другими цифрами Unicode.
## Генератор
```python
import json
print(json.dumps(["", "abc", "123", "a1b2c3", "007 and 008", "x99999999999999999999y1"]))
```

# id: task:cyclic-shift
kind: task
title: Циклический сдвиг строки
category: Строки
level: easy
tags: срезы, сдвиг, deque.rotate
related: py:topic:slicing, lib:collections.deque.rotate
## Условие
Дана строка S и целое число K. Выполните циклический сдвиг строки вправо на K позиций (K может быть больше длины или отрицательным — тогда сдвиг влево).
## Входные данные
S в первой строке (непустая), K во второй (|K| ≤ 10^18).
## Выходные данные
Сдвинутая строка.
## Примеры
```in
abcdef
2
```
```out
efabcd
```
## Подсказки
- Сдвиг на длину строки ничего не меняет — используйте K % len(S).
- Правый сдвиг на k: последние k символов переезжают в начало.
- s[-k:] + s[:-k] (осторожно с k = 0).
## Решение: срезы
@time: O(n) @memory: O(n)
```python
s = input()
k = int(input()) % len(s)
print(s[len(s) - k:] + s[:len(s) - k])
```
## Решение: deque.rotate
@time: O(n) @memory: O(n)
rotate(k) сдвигает элементы дека вправо на k.
```python
from collections import deque
s = input()
d = deque(s)
d.rotate(int(input()) % len(s))
print("".join(d))
```
## Объяснение
В Python остаток от деления отрицательного K на len(S) неотрицателен, поэтому сдвиг влево тоже обрабатывается.
## Генератор
```python
import json
print(json.dumps(["a\n5", "abc\n0", "abc\n3", "abc\n-1", "hello\n1000000000000000000", "xyz\n-1000000000000000001"]))
```

# id: task:longest-palindrome-substring
kind: task
title: Самый длинный палиндром-подстрока
category: Строки
level: hard
tags: палиндром, расширение от центра, Манакер, DP
related: algo:palindromes, algo:dp
## Условие
Дана строка S. Найдите длину самой длинной её подстроки, которая является палиндромом.
## Входные данные
Строка из строчных латинских букв, длина до 2000.
## Выходные данные
Длина самого длинного палиндрома-подстроки.
## Примеры
```in
babad
```
```out
3
```
```in
cbbd
```
```out
2
```
## Подсказки
- Проверка всех подстрок «в лоб» — O(n³), слишком долго для 2000.
- У каждого палиндрома есть центр: символ или промежуток между символами.
- Расширяйтесь от каждого из 2n−1 центров, пока символы по краям совпадают — O(n²).
## Решение: расширение от центра
@time: O(n²) @memory: O(1)
```python
s = input().strip()
n = len(s)
best = 0
for c in range(2 * n - 1):
    l, r = c // 2, (c + 1) // 2
    while l >= 0 and r < n and s[l] == s[r]:
        l -= 1
        r += 1
    best = max(best, r - l - 1)
print(best)
```
## Решение: алгоритм Манакера
@time: O(n) @memory: O(n)
Строка с разделителями #a#b#a# позволяет одинаково обрабатывать палиндромы чётной и нечётной длины.
```python
s = input().strip()
t = "#" + "#".join(s) + "#"
n = len(t)
p = [0] * n
c = r = 0
for i in range(n):
    if i < r:
        p[i] = min(r - i, p[2 * c - i])
    while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
        p[i] += 1
    if i + p[i] > r:
        c, r = i, i + p[i]
print(max(p))
```
## Решение: динамика по отрезкам
@time: O(n²) @memory: O(n)
pal[i] для текущего j — является ли s[i..j] палиндромом; храним одну строку таблицы.
```python
s = input().strip()
n = len(s)
best = 1
pal = [False] * n
for j in range(n):
    for i in range(j + 1):
        pal[i] = s[i] == s[j] and (j - i < 2 or pal[i + 1])
        if pal[i] and j - i + 1 > best:
            best = j - i + 1
print(best)
```
## Объяснение
В динамике pal[i + 1] ещё хранит значение для (i+1, j−1), потому что i идёт по возрастанию и pal[i + 1] будет обновлён позже.
## Генератор
```python
import json, random
random.seed(36)
t = ["a", "ab", "aaaa", "abacdfgdcaba"]
for n in (50, 300, 2000):
    t.append("".join(random.choice("ab") for _ in range(n)))
t.append("a" * 2000)
print(json.dumps(t))
```
