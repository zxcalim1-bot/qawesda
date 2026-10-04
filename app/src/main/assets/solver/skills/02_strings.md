# Solver skills: strings.

# skill: string_palindrome
title: Строка-палиндром
topics: Строки; Палиндромы; Два указателя
match: PALINDROME & (STRING | WORD | CHAR | LETTER) & !COUNT & !LONGEST & !SUBSTRING & !NUMBER
boost: CHECK
priority: 1.6
input: str
input_desc: Одна строка (буквы, цифры, пробелы и знаки препинания).
output_desc: YES, если строка — палиндром без учёта регистра, пробелов и знаков препинания; иначе NO.
understood: Дана строка. Проверить, читается ли она одинаково слева направо и справа налево (без учёта регистра, пробелов и знаков препинания).
algorithm: Очистка строки и сравнение с разворотом
why: Оставляем только буквы и цифры в нижнем регистре; палиндром совпадает со своим разворотом.
ideas: ch.isalnum() — буква или цифра; s.lower(); s[::-1]
structures: str
links: algo:palindromes, py:method:str.lower, py:method:str.isalnum, py:topic:slicing, algo:two-pointers
edge: Пустая строка и строка из одного символа — палиндромы.
edge: «А роза упала на лапу Азора» — палиндром после удаления пробелов и приведения регистра.
edge: Если нужно учитывать регистр и пробелы, сравнивайте исходную строку s == s[::-1].
sample: А роза упала на лапу Азора => YES
sample: hello => NO
sample: Was it a car or a cat I saw? => YES
sample: a => YES
sample: ab => NO

## Очистка и срез
approach: slice
role: short
time: O(n)
memory: O(n)
idea: Оставляем буквы и цифры в нижнем регистре и сравниваем с разворотом.
principle: "".join(ch.lower() for ch in s if ch.isalnum()) — очищенная строка; t[::-1] — она же задом наперёд.
pros: Коротко
cons: Создаёт две новые строки
when: Обычно.
readability: 5
```python
s = input()
t = "".join(ch.lower() for ch in s if ch.isalnum())
print("YES" if t == t[::-1] else "NO")
```

## Два указателя без копий
approach: two-pointers
role: efficient
time: O(n)
memory: O(1)
idea: Указатели идут навстречу друг другу, пропуская пробелы и знаки.
principle: i слева, j справа; пропускаем символы, не являющиеся буквой/цифрой; сравниваем в нижнем регистре.
pros: O(1) памяти, ранний выход
cons: Больше кода
when: Когда строка огромная.
readability: 3
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

## reversed + filter
approach: reversed
role: pythonic
time: O(n)
memory: O(n)
idea: Сравниваем очищенный список символов с его обратным итератором.
principle: list(reversed(t)) — символы с конца; списки сравниваются поэлементно.
pros: Показывает filter и reversed
cons: —
when: Для разнообразия.
readability: 4
```python
s = input()
t = list(filter(str.isalnum, s.lower()))
print("YES" if t == list(reversed(t)) else "NO")
```

## Рекурсия
approach: recursion
role: alternative
time: O(n)
memory: O(n)
idea: Строка — палиндром, если крайние символы равны и середина — палиндром.
principle: is_pal(t, i, j): если i ≥ j — да; иначе t[i] == t[j] и is_pal(t, i+1, j−1).
pros: Классический рекурсивный пример
cons: Глубина рекурсии ~n/2
when: Для изучения рекурсии.
readability: 4
```python
import sys

sys.setrecursionlimit(10000)


def is_pal(t, i, j):
    if i >= j:
        return True
    return t[i] == t[j] and is_pal(t, i + 1, j - 1)


t = "".join(ch.lower() for ch in input() if ch.isalnum())
print("YES" if is_pal(t, 0, len(t) - 1) else "NO")
```

# skill: anagram
title: Являются ли строки анаграммами
topics: Строки; Подсчёт; Сортировка
match: ANAGRAM
priority: 2.5
input: str | str
input_desc: Две строки (каждая на отдельной строке ввода).
output_desc: YES, если строки состоят из одних и тех же букв (без учёта регистра и пробелов), иначе NO.
understood: Даны две строки. Проверить, являются ли они анаграммами (одна получается перестановкой букв другой).
algorithm: Сравнение мультимножеств символов
why: Анаграммы имеют одинаковые отсортированные символы или одинаковые частоты символов.
ideas: sorted(s) == sorted(t); collections.Counter
structures: str, dict
links: algo:anagrams, lib:collections.Counter, py:builtin:sorted
edge: Разная длина — сразу NO.
edge: Регистр и пробелы игнорируются: «Listen» и «Silent» — анаграммы.
sample: listen\nsilent => YES
sample: Listen\nSilent => YES
sample: hello\nworld => NO
sample: dormitory\ndirty room => YES
sample: aab\nabb => NO

## Сортировка символов
approach: sorted
role: short
time: O(n log n)
memory: O(n)
idea: Отсортированные символы анаграмм совпадают.
principle: После удаления пробелов и приведения к нижнему регистру сравниваем sorted(a) и sorted(b).
pros: Коротко
cons: O(n log n)
when: Обычно.
readability: 5
```python
a = input().replace(" ", "").lower()
b = input().replace(" ", "").lower()
print("YES" if sorted(a) == sorted(b) else "NO")
```

## Counter
approach: counter
role: efficient
time: O(n)
memory: O(k)
idea: Сравниваем частоты символов.
principle: Counter(a) == Counter(b) — словари «символ → количество» равны.
pros: Линейное время
cons: Нужен импорт
when: Для длинных строк.
readability: 5
```python
from collections import Counter

a = input().replace(" ", "").lower()
b = input().replace(" ", "").lower()
print("YES" if Counter(a) == Counter(b) else "NO")
```

## Словарь вручную
approach: dict
role: beginner
time: O(n)
memory: O(k)
idea: Прибавляем 1 за каждый символ первой строки и вычитаем за второй; в конце все счётчики нулевые.
principle: Если какой-то счётчик ненулевой — количество этой буквы различается.
pros: Показывает подсчёт частот словарём
cons: Больше кода
when: Для обучения словарям.
readability: 4
```python
a = input().replace(" ", "").lower()
b = input().replace(" ", "").lower()
count = {}
for ch in a:
    count[ch] = count.get(ch, 0) + 1
for ch in b:
    count[ch] = count.get(ch, 0) - 1
print("YES" if all(v == 0 for v in count.values()) else "NO")
```

# skill: capitalize_words
title: Каждое слово с заглавной буквы
topics: Строки; Методы строк
match: UPPER & (FIRST | EACH) & WORD & !COUNT
priority: 2.3
input: str
input_desc: Одна строка из слов через пробел.
output_desc: Та же строка, где каждое слово начинается с заглавной буквы, остальные буквы строчные.
understood: Дана строка. Сделать первую букву каждого слова заглавной, остальные — строчными.
algorithm: Обработка слов по отдельности
why: Разбиваем строку на слова, преобразуем каждое и собираем обратно.
ideas: str.capitalize(); str.title(); split + join
structures: list[str]
links: py:method:str.capitalize, py:method:str.title, py:method:str.split, py:method:str.join
edge: str.title() считает границей слова любой не-буквенный символ: «it's» → «It'S».
edge: split() + join() схлопывают несколько пробелов в один.
sample: hello world => Hello World
sample: пРИВЕТ мИР => Привет Мир
sample: python IS fun => Python Is Fun

## split + capitalize + join
approach: capitalize
role: short
time: O(n)
memory: O(n)
idea: Каждое слово преобразуем методом capitalize.
principle: capitalize делает первую букву заглавной, остальные строчными.
pros: Коротко и правильно для апострофов
cons: Схлопывает лишние пробелы
when: Обычно.
readability: 5
```python
print(" ".join(w.capitalize() for w in input().split()))
```

## str.title
approach: title
role: alternative
time: O(n)
memory: O(n)
idea: Встроенный метод title делает то же для всей строки.
principle: title() делает заглавной каждую букву, перед которой стоит не буква.
pros: Сохраняет пробелы
cons: Ошибается на апострофах и дефисах
when: Для простого текста.
readability: 5
```python
print(input().title())
```

## Цикл по символам
approach: loop
role: beginner
time: O(n)
memory: O(n)
idea: Буква заглавная, если перед ней пробел или это начало строки.
principle: Флаг new_word = True после пробела; первая буква слова — upper(), остальные — lower().
pros: Полный контроль над правилом
cons: Длиннее
when: Для обучения.
readability: 4
```python
s = input()
result = []
new_word = True
for ch in s:
    if ch == " ":
        new_word = True
        result.append(ch)
    elif new_word:
        result.append(ch.upper())
        new_word = False
    else:
        result.append(ch.lower())
print("".join(result))
```

## Регулярное выражение
approach: regex
role: pythonic
time: O(n)
memory: O(n)
idea: re.sub с функцией заменяет каждое слово его capitalize-версией.
principle: Шаблон \S+ находит слова; lambda m: m.group().capitalize() — замена.
pros: Сохраняет исходные пробелы
cons: Нужно знать re
when: Когда важно сохранить форматирование.
readability: 3
```python
import re

print(re.sub(r"\S+", lambda m: m.group().capitalize(), input()))
```

# skill: most_frequent_char
title: Самый частый символ строки
topics: Строки; Словари; Подсчёт
match: MOST_FREQUENT & (CHAR | LETTER | STRING) & !WORD & !LIST & !ELEMENT
priority: 2.2
input: str
input_desc: Одна строка.
output_desc: Символ (кроме пробела), встречающийся чаще всего; при равенстве — тот, что встретился раньше.
understood: Дана строка. Найти символ (не пробел), который встречается чаще всего.
algorithm: Подсчёт частот
why: Словарь «символ → количество» строится за один проход, затем выбирается максимум.
ideas: collections.Counter.most_common; dict.get(ch, 0) + 1; Порядок словаря = порядок вставки
structures: dict
links: lib:collections.Counter, py:method:dict.get, py:builtin:max
edge: При равенстве частот выводится символ, встретившийся первым.
edge: Регистр различается: 'A' и 'a' — разные символы.
sample: hello world => l
sample: abcabc => a
sample: Mississippi => i
sample: zz yy x => z

## Counter.most_common
approach: counter
role: short
time: O(n)
memory: O(k)
idea: Counter считает частоты, most_common(1) возвращает самый частый.
principle: При равных частотах most_common сохраняет порядок первого появления.
pros: Две строки
cons: —
when: Обычно.
readability: 5
```python
from collections import Counter

s = input().replace(" ", "")
print(Counter(s).most_common(1)[0][0])
```

## Словарь вручную
approach: dict
role: beginner
time: O(n)
memory: O(k)
idea: Считаем частоты в словаре, затем ищем максимум.
principle: Перебираем ключи в порядке вставки и обновляем лучший только при строго большей частоте — так при равенстве остаётся первый.
pros: Показывает работу со словарём
cons: Длиннее
when: Для обучения.
readability: 5
```python
s = input()
count = {}
for ch in s:
    if ch != " ":
        count[ch] = count.get(ch, 0) + 1
best = None
for ch in count:
    if best is None or count[ch] > count[best]:
        best = ch
print(best)
```

## max с key=count
approach: max-count
role: alternative
time: O(n²)
memory: O(n)
idea: Выбираем символ с наибольшим s.count(ch).
principle: max проходит по символам по порядку и возвращает первый с максимальным ключом.
pros: Одна строка логики
cons: O(n²) — для длинных строк медленно
when: Для коротких строк.
readability: 4
```python
s = input().replace(" ", "")
print(max(s, key=s.count))
```

# skill: most_frequent_element
title: Самый частый элемент списка
topics: Списки; Словари; Подсчёт
match: MOST_FREQUENT & (LIST | ELEMENT | NUMBER) & !CHAR & !LETTER & !WORD
priority: 2.2
input: list
input_desc: Одна строка: целые числа через пробел.
output_desc: Число, встречающееся чаще всего; при равенстве — то, что встретилось раньше.
understood: Дан список чисел. Найти элемент, который встречается чаще всего (мода).
algorithm: Подсчёт частот словарём
why: Один проход строит частоты, затем выбирается максимум.
ideas: collections.Counter; dict.get; max(a, key=a.count)
structures: list, dict
links: lib:collections.Counter, py:method:dict.get, lib:statistics.mode
edge: При равенстве частот выводится элемент, встретившийся первым.
edge: Один элемент — он и ответ.
sample: 1 3 2 3 1 3 => 3
sample: 5 => 5
sample: 4 4 2 2 => 4
sample: -1 7 -1 7 7 => 7

## Counter.most_common
approach: counter
role: short
time: O(n)
memory: O(k)
idea: Counter и most_common(1).
principle: Порядок равных частот — по первому появлению.
pros: Коротко
cons: —
when: Обычно.
readability: 5
```python
from collections import Counter

a = list(map(int, input().split()))
print(Counter(a).most_common(1)[0][0])
```

## Словарь вручную
approach: dict
role: beginner
time: O(n)
memory: O(k)
idea: Считаем частоты, затем ищем максимум со строгим сравнением.
principle: Строгое > оставляет первый элемент при равенстве.
pros: Понятно
cons: Длиннее
when: Для обучения.
readability: 5
```python
a = list(map(int, input().split()))
count = {}
for x in a:
    count[x] = count.get(x, 0) + 1
best = a[0]
for x in count:
    if count[x] > count[best]:
        best = x
print(best)
```

## statistics.mode
approach: mode
role: alternative
time: O(n)
memory: O(k)
idea: Стандартная функция моды.
principle: С Python 3.8 statistics.mode при нескольких модах возвращает первую встреченную.
pros: Говорящее название
cons: Поведение при равенстве зависит от версии Python (до 3.8 — ошибка)
when: В статистических задачах.
readability: 5
python: 3.8
```python
import statistics

print(statistics.mode(map(int, input().split())))
```

## max с key=count
approach: max-count
role: alternative
time: O(n²)
memory: O(n)
idea: Элемент с наибольшим a.count(x).
principle: max возвращает первый элемент с максимальным ключом.
pros: Одна строка
cons: O(n²)
when: Для коротких списков.
readability: 4
```python
a = list(map(int, input().split()))
print(max(a, key=a.count))
```

# skill: most_frequent_word
title: Самое частое слово
topics: Строки; Словари
match: MOST_FREQUENT & WORD
priority: 2.4
input: str
input_desc: Одна строка из слов через пробел.
output_desc: Слово, встречающееся чаще всего (при равенстве — первое).
understood: Дан текст. Найти слово, которое встречается чаще всего.
algorithm: Подсчёт частот слов
why: split() разбивает текст на слова, словарь считает их частоты.
ideas: Counter(words); split()
structures: list[str], dict
links: lib:collections.Counter, py:method:str.split
edge: Регистр учитывается: «Кот» и «кот» — разные слова (используйте lower(), если нужно иначе).
sample: the cat and the dog => the
sample: a b c => a
sample: мама мыла раму мама => мама

## Counter
approach: counter
role: short
time: O(n)
memory: O(k)
idea: Counter по списку слов.
principle: most_common(1)[0][0] — самое частое слово.
pros: Коротко
cons: —
when: Обычно.
readability: 5
```python
from collections import Counter

print(Counter(input().split()).most_common(1)[0][0])
```

## Словарь
approach: dict
role: beginner
time: O(n)
memory: O(k)
idea: Считаем частоты словарём и ищем максимум.
principle: Строгое > сохраняет первое слово при равенстве.
pros: Понятно
cons: Длиннее
when: Для обучения.
readability: 5
```python
words = input().split()
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1
best = words[0]
for w in count:
    if count[w] > count[best]:
        best = w
print(best)
```

## max с key
approach: max
role: alternative
time: O(n·k)
memory: O(n)
idea: max(words, key=words.count).
principle: Для каждого слова считаем его количество в списке.
pros: Одна строка
cons: Квадратичное время
when: Для коротких текстов.
readability: 4
```python
words = input().split()
print(max(words, key=words.count))
```

# skill: remove_duplicate_chars
title: Удалить повторяющиеся символы
topics: Строки; Множества
match: DUPLICATE & REMOVE & (CHAR | STRING | LETTER)
priority: 2.3
input: str
input_desc: Одна строка.
output_desc: Строка, в которой оставлено только первое вхождение каждого символа.
understood: Дана строка. Удалить повторы символов, оставив первое вхождение каждого.
algorithm: Множество уже встреченных символов
why: Проходим слева направо и пропускаем символы, которые уже видели.
ideas: dict.fromkeys сохраняет порядок; set для быстрой проверки
structures: str, set
links: py:builtin:set, py:method:dict.fromkeys
edge: Пробел тоже символ и тоже остаётся один раз.
sample: hello world => helo wrd
sample: aaaa => a
sample: abc => abc

## dict.fromkeys
approach: fromkeys
role: short
time: O(n)
memory: O(k)
idea: Ключи словаря уникальны и хранятся в порядке вставки.
principle: dict.fromkeys(s) создаёт словарь с ключами — символами s без повторов.
pros: Одна строка
cons: Неочевидный приём
when: Обычно.
readability: 4
```python
print("".join(dict.fromkeys(input())))
```

## Цикл и множество
approach: set
role: beginner
time: O(n)
memory: O(k)
idea: Добавляем символ в ответ, только если его ещё нет в множестве seen.
principle: Проверка ch in seen для множества — O(1).
pros: Понятно
cons: Длиннее
when: Для обучения.
readability: 5
```python
s = input()
seen = set()
result = []
for ch in s:
    if ch not in seen:
        seen.add(ch)
        result.append(ch)
print("".join(result))
```

## Проверка через срез
approach: index
role: alternative
time: O(n²)
memory: O(n)
idea: Символ оставляем, если он не встречался раньше в строке.
principle: s.index(ch) == i — это первое вхождение символа.
pros: Без дополнительных структур
cons: O(n²)
when: Для коротких строк.
readability: 4
```python
s = input()
print("".join(ch for i, ch in enumerate(s) if s.index(ch) == i))
```

# skill: caesar
title: Шифр Цезаря
topics: Строки; Коды символов
match: CIPHER
priority: 2.5
param: K = num(CIPHER, ROTATE) default 3
input: str
input_desc: Одна строка текста (латиница).
output_desc: Текст, где каждая латинская буква сдвинута на {K} позиций вперёд по алфавиту (с переходом Z → A); регистр и остальные символы сохраняются.
understood: Зашифровать строку шифром Цезаря со сдвигом {K}: каждая латинская буква заменяется буквой, стоящей на {K} позиций дальше.
algorithm: Сдвиг кодов символов по модулю 26
why: Номер буквы (ord(ch) − ord('a')) сдвигаем на k по модулю 26 и получаем новую букву через chr.
ideas: ord / chr; % 26 для зацикливания алфавита; str.maketrans
structures: str
links: algo:caesar, py:builtin:ord, py:builtin:chr, py:method:str.maketrans, py:method:str.translate
edge: Буквы в конце алфавита переходят в начало: z → c при сдвиге 3.
edge: Цифры, пробелы и знаки не меняются.
edge: Для расшифровки используйте сдвиг −k (или 26 − k).
sample: Hello, World!
sample: xyz XYZ
sample: abc

## ord и chr
approach: ord
role: beginner
time: O(n)
memory: O(n)
idea: Переводим букву в номер 0..25, сдвигаем по модулю 26 и обратно.
principle: (ord(ch) − base + k) % 26 + base, где base = ord('a') или ord('A').
pros: Показывает коды символов
cons: Несколько условий
when: Для обучения.
readability: 4
```python
s = input()
k = {K}
result = []
for ch in s:
    if "a" <= ch <= "z":
        result.append(chr((ord(ch) - ord("a") + k) % 26 + ord("a")))
    elif "A" <= ch <= "Z":
        result.append(chr((ord(ch) - ord("A") + k) % 26 + ord("A")))
    else:
        result.append(ch)
print("".join(result))
```

## str.maketrans
approach: maketrans
role: short
time: O(n)
memory: O(1)
idea: Строим таблицу замены «буква → сдвинутая буква» и применяем translate.
principle: Сдвинутый алфавит — это срез lower[k:] + lower[:k].
pros: Быстро (C-реализация)
cons: Нужно знать maketrans
when: Для больших текстов.
readability: 4
```python
import string

k = {K} % 26
low, up = string.ascii_lowercase, string.ascii_uppercase
table = str.maketrans(low + up, low[k:] + low[:k] + up[k:] + up[:k])
print(input().translate(table))
```

## Функция и генератор
approach: function
role: alternative
time: O(n)
memory: O(n)
idea: Функция shift(ch) для одного символа и join по всей строке.
principle: str.isascii() and ch.isalpha() — только латинские буквы.
pros: Удобно переиспользовать
cons: —
when: Когда шифрование нужно в нескольких местах.
readability: 4
```python
def shift(ch, k):
    if ch.isascii() and ch.isalpha():
        base = ord("A") if ch.isupper() else ord("a")
        return chr((ord(ch) - base + k) % 26 + base)
    return ch


s = input()
print("".join(shift(ch, {K}) for ch in s))
```

# skill: rle
title: Сжатие строки (RLE)
topics: Строки; Группировка
match: COMPRESS
priority: 2.5
input: str
input_desc: Одна строка.
output_desc: Строка вида «символ + количество» для каждой группы одинаковых соседних символов (aaabcc → a3b1c2).
understood: Сжать строку алгоритмом RLE: каждую серию одинаковых подряд идущих символов заменить символом и длиной серии.
algorithm: Проход с подсчётом серий
why: Сравниваем текущий символ с предыдущим: совпадает — увеличиваем счётчик, иначе записываем серию.
ideas: itertools.groupby; Обработка последней серии после цикла
structures: str, list
links: algo:rle, lib:itertools.groupby, lib:re
edge: Пустая строка — пустой ответ.
edge: Не забудьте записать последнюю серию после цикла.
sample: aaabcc => a3b1c2
sample: abc => a1b1c1
sample: zzzzzzzzzzzz => z12
sample: aabbaa => a2b2a2

## Цикл со счётчиком
approach: loop
role: beginner
time: O(n)
memory: O(n)
idea: Считаем длину текущей серии и записываем её при смене символа.
principle: После цикла добавляем последнюю серию — частая ошибка её забыть.
pros: Понятно
cons: Нужно аккуратно с концом
when: Для обучения.
readability: 5
```python
s = input()
result = []
i = 0
while i < len(s):
    j = i
    while j < len(s) and s[j] == s[i]:
        j += 1
    result.append(s[i] + str(j - i))
    i = j
print("".join(result))
```

## itertools.groupby
approach: groupby
role: short
time: O(n)
memory: O(n)
idea: groupby группирует подряд идущие одинаковые элементы.
principle: Для каждой группы (символ, итератор) длина = sum(1 for _ in группа).
pros: Коротко
cons: Нужно знать groupby
when: Обычно.
readability: 4
```python
from itertools import groupby

s = input()
print("".join(ch + str(len(list(group))) for ch, group in groupby(s)))
```

## Регулярное выражение
approach: regex
role: pythonic
time: O(n)
memory: O(n)
idea: Шаблон (.)\1* находит серию одинаковых символов.
principle: \1 — обратная ссылка на первую группу, * — сколько угодно повторов.
pros: Мощный шаблон
cons: Сложно читать
when: Для любителей регулярных выражений.
readability: 3
```python
import re

s = input()
print("".join(m.group(1) + str(len(m.group(0))) for m in re.finditer(r"(.)\1*", s)))
```

# skill: count_substring
title: Количество вхождений подстроки
topics: Строки; Поиск подстроки
match: (OCCURRENCE | COUNT) & SUBSTRING | (OCCURRENCE & (STRING | WORD) & COUNT & !CHAR & !LETTER & !VOWEL)
priority: 1.8
input: str | str
input_desc: Первая строка — текст s, вторая — подстрока t.
output_desc: Количество непересекающихся вхождений t в s.
understood: Даны строка s и подстрока t. Посчитать, сколько раз t встречается в s (без пересечений).
algorithm: Поиск подстроки
why: str.count считает непересекающиеся вхождения; вручную — find с продолжением после найденного вхождения.
ideas: s.count(t); s.find(t, start); Пересекающиеся вхождения считаются иначе
structures: str
links: py:method:str.count, py:method:str.find, lib:re
edge: Пересекающиеся вхождения: в «aaaa» подстрока «aa» без пересечений встречается 2 раза, с пересечениями — 3.
edge: Пустая подстрока t: s.count("") == len(s) + 1 — обычно такое не допускается.
sample: abababab\naba => 2
sample: hello world\no => 2
sample: aaaa\naa => 2
sample: abc\nd => 0

## str.count
approach: count
role: short
time: O(n)
memory: O(1)
idea: Встроенный метод.
principle: s.count(t) ищет вхождения слева направо, продолжая поиск после конца найденного.
pros: Одна строка, быстро
cons: Только без пересечений
when: Обычно.
readability: 5
```python
s = input()
t = input()
print(s.count(t))
```

## Цикл с find
approach: find
role: beginner
time: O(n·m)
memory: O(1)
idea: Находим вхождение, сдвигаемся за его конец и ищем снова.
principle: s.find(t, start) возвращает позицию или −1.
pros: Легко переделать для пересечений (start = pos + 1)
cons: Больше кода
when: Когда нужна гибкость.
readability: 4
```python
s = input()
t = input()
count = 0
pos = s.find(t)
while pos != -1:
    count += 1
    pos = s.find(t, pos + len(t))
print(count)
```

## re.findall
approach: regex
role: alternative
time: O(n)
memory: O(n)
idea: Регулярное выражение с экранированной подстрокой.
principle: re.escape(t) защищает спецсимволы; findall возвращает непересекающиеся совпадения.
pros: Легко добавить условия (например, только целые слова \b)
cons: Нужен re
when: Для сложных условий поиска.
readability: 4
```python
import re

s = input()
t = input()
print(len(re.findall(re.escape(t), s)))
```

# skill: replace_substring
title: Замена подстроки
topics: Строки
match: REPLACE & (STRING | SUBSTRING | WORD | CHAR | LETTER)
priority: 2
input: str | str | str
input_desc: Три строки: текст s, что заменить (old), на что заменить (new).
output_desc: Строка s, в которой все вхождения old заменены на new.
understood: Даны строка s и подстроки old и new. Заменить все вхождения old на new.
algorithm: Замена подстроки
why: str.replace делает замену за один проход; эквивалентно split(old) + join(new).
ideas: s.replace(old, new); new.join(s.split(old))
structures: str
links: py:method:str.replace, py:method:str.split, py:method:str.join, lib:re
edge: Строки неизменяемы: replace возвращает новую строку.
edge: Если old не встречается, строка не меняется.
sample: hello world\no\n0 => hell0 w0rld
sample: aaa\na\nbb => bbbbbb
sample: abc\nx\ny => abc

## str.replace
approach: replace
role: short
time: O(n)
memory: O(n)
idea: Встроенный метод замены.
principle: Возвращает новую строку; исходная не меняется.
pros: Одна строка
cons: —
when: Обычно.
readability: 5
```python
s = input()
old = input()
new = input()
print(s.replace(old, new))
```

## split + join
approach: split-join
role: alternative
time: O(n)
memory: O(n)
idea: Разрезаем по old и склеиваем через new.
principle: s.split(old) — куски между вхождениями; new.join(куски) вставляет new между ними.
pros: Показывает связь split и join
cons: —
when: Для понимания методов строк.
readability: 4
```python
s = input()
old = input()
new = input()
print(new.join(s.split(old)))
```

## Ручной проход
approach: loop
role: beginner
time: O(n·m)
memory: O(n)
idea: Идём по строке: если с позиции i начинается old — добавляем new и прыгаем, иначе добавляем символ.
principle: s.startswith(old, i) проверяет вхождение на позиции i.
pros: Полный контроль
cons: Длиннее
when: Для обучения.
readability: 4
```python
s = input()
old = input()
new = input()
result = []
i = 0
while i < len(s):
    if old and s.startswith(old, i):
        result.append(new)
        i += len(old)
    else:
        result.append(s[i])
        i += 1
print("".join(result))
```

# skill: brackets
title: Правильная скобочная последовательность
topics: Стек; Строки
match: BRACKETS
priority: 2.5
input: str
input_desc: Одна строка из скобок ( ) [ ] { }.
output_desc: YES, если скобки расставлены правильно, иначе NO.
understood: Дана строка из скобок трёх видов. Проверить, является ли она правильной скобочной последовательностью.
algorithm: Стек
why: Открывающую скобку кладём в стек; закрывающая должна соответствовать вершине стека. В конце стек пуст.
ideas: Стек на списке: append / pop; Словарь пар скобок
structures: list (стек), dict
links: algo:stack, py:method:list.append, py:method:list.pop
edge: Пустая строка — правильная.
edge: Лишняя закрывающая скобка при пустом стеке — NO.
edge: Если остались открытые скобки — NO.
sample: ()[]{} => YES
sample: ([)] => NO
sample: {[()()]} => YES
sample: (( => NO
sample: ) => NO

## Стек
approach: stack
role: beginner
time: O(n)
memory: O(n)
idea: Открывающие скобки кладём в стек, закрывающие сверяем с вершиной.
principle: pairs[')'] == '(' — пара для каждой закрывающей скобки. Любое несоответствие или пустой стек — ошибка.
pros: Линейное время, стандартное решение
cons: —
when: Всегда.
readability: 5
```python
s = input().strip()
pairs = {")": "(", "]": "[", "}": "{"}
stack = []
ok = True
for ch in s:
    if ch in "([{":
        stack.append(ch)
    elif ch in pairs:
        if not stack or stack.pop() != pairs[ch]:
            ok = False
            break
print("YES" if ok and not stack else "NO")
```

## Удаление пар
approach: replace
role: alternative
time: O(n²)
memory: O(n)
idea: Пока в строке есть «()», «[]» или «{}», удаляем их; правильная строка исчезнет полностью.
principle: Каждая замена убирает хотя бы одну пару соседних скобок.
pros: Очень наглядно
cons: Квадратичное время
when: Для коротких строк и объяснения.
readability: 5
```python
s = input().strip()
prev = None
while s != prev:
    prev = s
    s = s.replace("()", "").replace("[]", "").replace("{}", "")
print("YES" if s == "" else "NO")
```

## Стек с ожидаемыми скобками
approach: expected
role: pythonic
time: O(n)
memory: O(n)
idea: При открывающей скобке кладём в стек ожидаемую закрывающую.
principle: Закрывающая скобка должна совпасть с вершиной стека.
pros: Сравнение без словаря на этапе закрытия
cons: —
when: Альтернативная запись стека.
readability: 4
```python
s = input().strip()
closing = {"(": ")", "[": "]", "{": "}"}
stack = []
for ch in s:
    if ch in closing:
        stack.append(closing[ch])
    elif not stack or stack.pop() != ch:
        stack = None
        break
print("YES" if stack == [] else "NO")
```

# skill: first_unique_char
title: Первый неповторяющийся символ
topics: Строки; Словари
match: FIRST & (UNIQUE | DUPLICATE) & (CHAR | LETTER | STRING)
priority: 2.4
input: str
input_desc: Одна строка.
output_desc: Первый символ, встречающийся в строке ровно один раз, или NO.
understood: Дана строка. Найти первый символ, который встречается в ней ровно один раз.
algorithm: Подсчёт частот + второй проход
why: Сначала считаем частоты, затем идём по строке и берём первый символ с частотой 1.
ideas: Counter; Два прохода
structures: dict
links: lib:collections.Counter, py:method:str.count
edge: Все символы повторяются — NO.
sample: swiss => w
sample: aabb => NO
sample: abcab => c
sample: x => x

## Counter + проход
approach: counter
role: short
time: O(n)
memory: O(k)
idea: Частоты через Counter, затем первый с частотой 1.
principle: next(..., "NO") возвращает "NO", если подходящего нет.
pros: Коротко и линейно
cons: —
when: Обычно.
readability: 4
```python
from collections import Counter

s = input()
count = Counter(s)
print(next((ch for ch in s if count[ch] == 1), "NO"))
```

## Словарь вручную
approach: dict
role: beginner
time: O(n)
memory: O(k)
idea: Строим словарь частот и делаем второй проход.
principle: Первый проход — подсчёт, второй — поиск.
pros: Понятно
cons: —
when: Для обучения.
readability: 5
```python
s = input()
count = {}
for ch in s:
    count[ch] = count.get(ch, 0) + 1
answer = "NO"
for ch in s:
    if count[ch] == 1:
        answer = ch
        break
print(answer)
```

## s.count
approach: count
role: alternative
time: O(n²)
memory: O(1)
idea: Для каждого символа считаем вхождения методом count.
principle: s.count(ch) == 1 — символ уникален.
pros: Без словаря
cons: O(n²)
when: Для коротких строк.
readability: 5
```python
s = input()
print(next((ch for ch in s if s.count(ch) == 1), "NO"))
```

# skill: common_prefix
title: Наибольший общий префикс слов
topics: Строки
match: PREFIX & (COMMON | LONGEST)
priority: 2.5
input: str
input_desc: Одна строка: слова через пробел.
output_desc: Наибольший общий префикс всех слов (возможно пустой).
understood: Дан набор слов. Найти их наибольший общий префикс.
algorithm: Посимвольное сравнение
why: Префикс растёт, пока на очередной позиции у всех слов одинаковый символ.
ideas: zip(*words); os.path.commonprefix; Сравнение min и max после сортировки
structures: list[str]
links: py:builtin:zip, py:builtin:min, py:builtin:max
edge: Общего префикса нет — пустая строка.
edge: Одно слово — оно само.
sample: flower flow flight => fl
sample: dog racecar car => 
sample: interview internet interval => inter
sample: abc => abc

## zip по символам
approach: zip
role: short
time: O(S)
memory: O(1)
idea: zip(*words) перебирает символы на одной позиции у всех слов.
principle: Если в кортеже все символы одинаковы (len(set) == 1), добавляем символ к префиксу.
pros: Коротко
cons: —
when: Обычно.
readability: 4
```python
words = input().split()
prefix = []
for chars in zip(*words):
    if len(set(chars)) != 1:
        break
    prefix.append(chars[0])
print("".join(prefix))
```

## min и max
approach: minmax
role: efficient
time: O(S)
memory: O(1)
idea: Общий префикс всех слов = общий префикс лексикографически минимального и максимального слова.
principle: Все остальные слова лежат между ними, поэтому совпадают с ними на общем префиксе.
pros: Сравниваем только два слова
cons: Неочевидная идея
when: Как олимпиадный приём.
readability: 3
```python
words = input().split()
a, b = min(words), max(words)
i = 0
while i < len(a) and i < len(b) and a[i] == b[i]:
    i += 1
print(a[:i])
```

## Укорачивание префикса
approach: shrink
role: beginner
time: O(S·L)
memory: O(L)
idea: Берём первое слово и укорачиваем его, пока каждое слово не начнётся с него.
principle: w.startswith(prefix) — проверка префикса.
pros: Понятно
cons: Медленнее
when: Для обучения.
readability: 5
```python
words = input().split()
prefix = words[0]
for w in words[1:]:
    while not w.startswith(prefix):
        prefix = prefix[:-1]
print(prefix)
```

## os.path.commonprefix
approach: os
role: pythonic
time: O(S)
memory: O(1)
idea: Функция модуля os.path работает посимвольно для любых строк.
principle: Несмотря на название, commonprefix не анализирует пути — просто общий префикс строк.
pros: Готовая функция
cons: Неожиданное место для такой функции
when: Для краткости.
readability: 4
```python
import os

print(os.path.commonprefix(input().split()))
```

# skill: case_convert
title: Перевод строки в верхний или нижний регистр
topics: Строки; Методы строк
match: (UPPER | LOWER) & (CONVERT | REPLACE | PRINT) & (STRING | LETTER | WORD) & !COUNT & !FIRST & !EACH & !REMOVE
priority: 1.8
param: FN = lower if LOWER else upper
param: CASE = нижний if LOWER else верхний
input: str
input_desc: Одна строка.
output_desc: Та же строка, переведённая в {CASE} регистр (метод str.{FN}).
understood: Дана строка. Перевести все буквы в {CASE} регистр.
algorithm: Метод строки {FN}
why: str.{FN}() возвращает новую строку; работает для латиницы, кириллицы и других алфавитов.
ideas: Строки неизменяемы; upper / lower / swapcase
structures: str
links: py:method:str.upper, py:method:str.lower, py:method:str.swapcase
edge: Цифры и знаки не меняются.
sample: Hello, World!
sample: ПрИвЕт 123
sample: abc

## Метод {FN}
approach: method
role: short
time: O(n)
memory: O(n)
idea: Встроенный метод строки.
principle: Возвращает копию строки с изменённым регистром.
pros: Одна строка, учитывает Unicode
cons: —
when: Всегда.
readability: 5
```python
print(input().{FN}())
```

## Посимвольно
approach: chars
role: beginner
time: O(n)
memory: O(n)
idea: Применяем метод к каждому символу и склеиваем.
principle: "".join(ch.{FN}() for ch in s).
pros: Показывает обработку символов
cons: Медленнее
when: Когда правило для символов сложнее.
readability: 4
```python
s = input()
print("".join(ch.{FN}() for ch in s))
```

## map(str.{FN})
approach: map
role: pythonic
time: O(n)
memory: O(n)
idea: Метод класса str как функция для map.
principle: str.{FN} — обычная функция, принимающая строку.
pros: Функциональный стиль
cons: —
when: Для разнообразия.
readability: 4
```python
print("".join(map(str.{FN}, input())))
```

# skill: pangram
title: Панграмма
topics: Строки; Множества
match: PANGRAM
priority: 2.5
input: str
input_desc: Одна строка на английском.
output_desc: YES, если строка содержит все 26 букв латинского алфавита, иначе NO.
understood: Дана строка. Проверить, содержит ли она все буквы английского алфавита (панграмма).
algorithm: Множество букв
why: Строка — панграмма, если множество её букв содержит весь алфавит.
ideas: set(s.lower()) >= set(ascii_lowercase); all()
structures: set
links: py:builtin:set, lib:string.ascii_lowercase, py:builtin:all
edge: Регистр не важен.
sample: The quick brown fox jumps over the lazy dog => YES
sample: Hello world => NO
sample: Pack my box with five dozen liquor jugs => YES

## Множества
approach: set
role: short
time: O(n)
memory: O(1)
idea: Алфавит должен быть подмножеством букв строки.
principle: set(ascii_lowercase) <= set(s.lower()).
pros: Одна строка
cons: —
when: Обычно.
readability: 5
```python
import string

s = input().lower()
print("YES" if set(string.ascii_lowercase) <= set(s) else "NO")
```

## all по буквам алфавита
approach: all
role: beginner
time: O(26·n)
memory: O(1)
idea: Каждая буква алфавита встречается в строке.
principle: all(ch in s for ch in алфавит).
pros: Читается как определение
cons: Медленнее
when: Для обучения.
readability: 5
```python
s = input().lower()
print("YES" if all(ch in s for ch in "abcdefghijklmnopqrstuvwxyz") else "NO")
```

## Подсчёт различных букв
approach: count
role: alternative
time: O(n)
memory: O(1)
idea: Различных латинских букв должно быть 26.
principle: Множество символов, которые являются латинскими буквами.
pros: Легко вывести, сколько букв не хватает
cons: —
when: Когда нужен ещё и счёт.
readability: 4
```python
s = input().lower()
letters = {ch for ch in s if "a" <= ch <= "z"}
print("YES" if len(letters) == 26 else "NO")
```

# skill: string_rotation
title: Является ли строка циклическим сдвигом другой
topics: Строки
match: ROTATE & (STRING | WORD) & !MATRIX & !LIST & !CIPHER
priority: 2.2
input: str | str
input_desc: Две строки s и t.
output_desc: YES, если t — циклический сдвиг s, иначе NO.
understood: Даны строки s и t. Проверить, можно ли получить t циклическим сдвигом s.
algorithm: Поиск в удвоенной строке
why: Все циклические сдвиги s — это подстроки s + s длины |s|.
ideas: t in s + s; Равенство длин
structures: str
links: py:topic:strings, algo:string-rotation
edge: Длины разные — сразу NO.
sample: abcde\ncdeab => YES
sample: abc\nacb => NO
sample: aa\naa => YES

## t in s + s
approach: double
role: short
time: O(n) в среднем
memory: O(n)
idea: Сдвиг t обязательно встретится в удвоенной строке.
principle: s + s содержит все n сдвигов как подстроки.
pros: Одна строка
cons: —
when: Обычно.
readability: 5
```python
s = input()
t = input()
print("YES" if len(s) == len(t) and t in s + s else "NO")
```

## Перебор сдвигов
approach: brute
role: beginner
time: O(n²)
memory: O(n)
idea: Проверяем каждый сдвиг s[i:] + s[:i].
principle: Сдвиг на i позиций влево.
pros: Прямо по определению
cons: O(n²)
when: Для обучения.
readability: 5
```python
s = input()
t = input()
ok = len(s) == len(t) and any(s[i:] + s[:i] == t for i in range(max(1, len(s))))
print("YES" if ok else "NO")
```

## deque.rotate
approach: deque
role: alternative
time: O(n²)
memory: O(n)
idea: Сдвигаем дек по одной позиции и сравниваем.
principle: deque.rotate(-1) переносит первый символ в конец за O(1).
pros: Показывает collections.deque
cons: Сравнение всё равно O(n)
when: Для изучения deque.
readability: 4
```python
from collections import deque

s = input()
t = input()
d = deque(s)
ok = False
if len(s) == len(t):
    for _ in range(max(1, len(s))):
        if "".join(d) == t:
            ok = True
            break
        d.rotate(-1)
print("YES" if ok else "NO")
```

# skill: longest_unique_substring
title: Самая длинная подстрока без повторяющихся символов
topics: Строки; Скользящее окно; Два указателя
match: LONGEST & SUBSTRING & (DUPLICATE | UNIQUE | WITHOUT)
priority: 2.6
input: str
input_desc: Одна строка.
output_desc: Длина самой длинной подстроки, в которой все символы различны.
understood: Дана строка. Найти длину самой длинной подстроки без повторяющихся символов.
algorithm: Скользящее окно
why: Правая граница идёт по строке; при повторе левую границу сдвигаем за предыдущее вхождение символа. Каждый символ входит и выходит из окна один раз.
ideas: Два указателя; Словарь «символ → последняя позиция»
structures: dict, set
links: algo:sliding-window, algo:two-pointers
edge: Пустая строка — 0.
edge: Все символы одинаковые — 1.
sample: abcabcbb => 3
sample: bbbbb => 1
sample: pwwkew => 3
sample: abcdef => 6

## Окно со словарём позиций
approach: window-dict
role: efficient
time: O(n)
memory: O(k)
idea: Храним последнюю позицию каждого символа; при повторе прыгаем левой границей.
principle: left = max(left, last[ch] + 1) — окно [left, i] всегда без повторов.
pros: Один проход
cons: Нужно понимать max для left
when: Обычно.
readability: 4
```python
s = input()
last = {}
left = best = 0
for i, ch in enumerate(s):
    if ch in last and last[ch] >= left:
        left = last[ch] + 1
    last[ch] = i
    best = max(best, i - left + 1)
print(best)
```

## Окно с множеством
approach: window-set
role: beginner
time: O(n)
memory: O(k)
idea: Расширяем окно справа; пока символ повторяется — удаляем символы слева.
principle: Каждый символ добавляется и удаляется из множества не более одного раза.
pros: Понятная механика окна
cons: —
when: Для обучения технике окна.
readability: 5
```python
s = input()
window = set()
left = best = 0
for right, ch in enumerate(s):
    while ch in window:
        window.remove(s[left])
        left += 1
    window.add(ch)
    best = max(best, right - left + 1)
print(best)
```

## Перебор начала
approach: brute
role: alternative
time: O(n·k)
memory: O(k)
idea: Для каждого начала растим подстроку, пока не встретим повтор.
principle: Внутренний цикл останавливается на первом повторе.
pros: Просто
cons: Квадратично в худшем случае
when: Для проверки.
readability: 5
```python
s = input()
best = 0
for i in range(len(s)):
    seen = set()
    for ch in s[i:]:
        if ch in seen:
            break
        seen.add(ch)
    best = max(best, len(seen))
print(best)
```

# skill: reverse_each_word
title: Перевернуть каждое слово
topics: Строки; Срезы
match: REVERSE & EACH & WORD
priority: 2.6
input: str
input_desc: Одна строка из слов через пробел.
output_desc: Строка, в которой каждое слово записано задом наперёд, порядок слов сохранён.
understood: Дана строка. Перевернуть каждое слово, не меняя порядок слов.
algorithm: split + срез + join
why: Каждое слово разворачиваем срезом [::-1] и склеиваем через пробел.
ideas: w[::-1]; " ".join
structures: list[str]
links: py:topic:slicing, py:method:str.split, py:method:str.join
edge: Несколько пробелов подряд схлопываются в один.
sample: hello world => olleh dlrow
sample: abc => cba
sample: Привет мир => тевирП рим

## Генератор
approach: gen
role: short
time: O(n)
memory: O(n)
idea: join по развёрнутым словам.
principle: " ".join(w[::-1] for w in s.split()).
pros: Коротко
cons: —
when: Обычно.
readability: 5
```python
print(" ".join(w[::-1] for w in input().split()))
```

## Цикл
approach: loop
role: beginner
time: O(n)
memory: O(n)
idea: Разворачиваем слова по одному и собираем список.
principle: result.append(w[::-1]).
pros: Понятно
cons: Длиннее
when: Для обучения.
readability: 5
```python
words = input().split()
result = []
for w in words:
    result.append(w[::-1])
print(" ".join(result))
```

## Двойной разворот
approach: double-reverse
role: alternative
time: O(n)
memory: O(n)
idea: Разворот всей строки меняет и порядок слов, и буквы; разворот порядка слов возвращает порядок.
principle: s[::-1].split()[::-1] — слова в исходном порядке, но перевёрнутые.
pros: Красивый трюк
cons: Неочевидно
when: Как головоломка.
readability: 3
```python
print(" ".join(input()[::-1].split()[::-1]))
```

# skill: string_length
title: Длина строки
topics: Строки
match: LENGTH & STRING & !WORD & !LONGEST & !SUBSTRING & !LIST
priority: 1.8
input: str
input_desc: Одна строка.
output_desc: Количество символов в строке.
understood: Дана строка. Найти количество символов в ней.
algorithm: Функция len
why: len возвращает длину строки за O(1).
ideas: len(s); Пробелы тоже символы
structures: str
links: py:builtin:len
edge: Пустая строка — 0.
edge: Пробелы и знаки тоже считаются.
sample: hello => 5
sample: hello world => 11
sample: Привет => 6

## len
approach: len
role: short
time: O(1)
memory: O(1)
idea: Встроенная функция длины.
principle: Строка хранит свою длину, поэтому len работает мгновенно.
pros: Одна строка
cons: —
when: Всегда.
readability: 5
```python
print(len(input()))
```

## Подсчёт в цикле
approach: loop
role: beginner
time: O(n)
memory: O(1)
idea: Считаем символы циклом.
principle: count += 1 для каждого символа.
pros: Показывает, что такое длина
cons: Бессмысленно медленнее len
when: Для обучения.
readability: 5
```python
count = 0
for _ in input():
    count += 1
print(count)
```

## sum по генератору
approach: sum
role: alternative
time: O(n)
memory: O(1)
idea: Каждый символ даёт 1.
principle: sum(1 for _ in s).
pros: Работает для любых итераторов без len
cons: —
when: Когда длина итератора заранее неизвестна.
readability: 4
```python
print(sum(1 for _ in input()))
```
