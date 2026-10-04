# id: py:method:str.split
kind: method
category: str
title: str.split()
summary: Разбивает строку на список частей по разделителю (по умолчанию — по любым пробельным символам).
sig: str.split(sep=None, maxsplit=-1)
check: str.split
complexity: O(n)
tags: разбить строку, разделить, слова, split
related: py:method:str.join, py:method:str.rsplit, py:builtin:input
## Пример
```python
print("  a b   c ".split(), "a,b,,c".split(","), "k=v=w".split("=", 1), "".split(), "".split(","))
```
## Особенности
Без аргумента пустые части отбрасываются; с явным sep — сохраняются. str.splitlines() делит по переводам строк.

# id: py:method:str.join
kind: method
category: str
title: str.join()
summary: Склеивает строки из итерируемого объекта, вставляя между ними строку-разделитель.
sig: str.join(iterable, /)
check: str.join
complexity: O(суммарной длины)
tags: склеить, соединить, объединить строки
related: py:method:str.split, py:builtin:map
## Пример
```python
print("-".join(["a", "b", "c"]), "".join(reversed("abc")), ", ".join(map(str, [1, 2, 3])))
```
## Ошибки
Элементы должны быть строками: ", ".join([1, 2]) — TypeError.

# id: py:method:str.strip
kind: method
category: str
title: str.strip(), lstrip(), rstrip()
summary: Убирают символы (по умолчанию пробельные) с обоих концов, слева или справа.
sig: str.strip(chars=None, /)
check: str.strip, str.lstrip, str.rstrip
tags: обрезать пробелы, trim, убрать перевод строки
related: py:method:str.removeprefix
## Пример
```python
print(repr("  hi \n".strip()), "xxhixx".strip("x"), "000123".lstrip("0"), "file.txt\n".rstrip("\n"))
```
## Особенности
chars — набор символов, а не подстрока: "abcba".strip("ab") == "c".

# id: py:method:str.replace
kind: method
category: str
title: str.replace()
summary: Возвращает копию строки с заменой всех (или первых count) вхождений подстроки.
sig: str.replace(old, new, count=-1, /)
check: str.replace
complexity: O(n)
tags: заменить, замена подстроки
related: py:method:str.translate, lib:re.sub
## Пример
```python
s = "мама мыла раму"
print(s.replace("ма", "МА"), s.replace("ма", "", 1), s.replace(" ", ""))
```

# id: py:method:str.find
kind: method
category: str
title: str.find() и str.index()
summary: Позиция первого вхождения подстроки; find возвращает −1, index бросает ValueError.
sig: str.find(sub[, start[, end]])
check: str.find, str.index, str.rfind, str.rindex
complexity: O(n·m) в худшем
tags: найти подстроку, позиция, поиск
related: py:method:str.count, py:keyword:in, task:substring-occurrences
## Пример
```python
s = "hello world"
print(s.find("o"), s.rfind("o"), s.find("o", 5), s.find("z"), s.index("w"))
```

# id: py:method:str.count
kind: method
category: str
title: str.count()
summary: Количество непересекающихся вхождений подстроки.
sig: str.count(sub[, start[, end]])
check: str.count
tags: посчитать символы, сколько раз встречается
related: lib:collections.Counter, task:count-char
## Пример
```python
print("banana".count("a"), "aaaa".count("aa"), "banana".count("an", 2))
```

# id: py:method:str.startswith
kind: method
category: str
title: str.startswith() и str.endswith()
summary: Проверяют начало и конец строки; принимают и кортеж вариантов.
sig: str.startswith(prefix[, start[, end]])
check: str.startswith, str.endswith
tags: начинается с, заканчивается на, расширение файла
related: py:method:str.removeprefix
## Пример
```python
name = "report.pdf"
print(name.endswith(".pdf"), name.endswith((".png", ".jpg")), "https://x".startswith(("http://", "https://")))
```

# id: py:method:str.removeprefix
kind: method
category: str
title: str.removeprefix() и str.removesuffix()
summary: Удаляют префикс или суффикс, если он есть (Python 3.9+).
sig: str.removeprefix(prefix, /)
check: str.removeprefix, str.removesuffix
tags: убрать префикс, убрать суффикс
related: py:method:str.strip
## Пример
```python
print("test_case".removeprefix("test_"), "photo.jpeg".removesuffix(".jpeg"), "abc".removeprefix("x"))
```

# id: py:method:str.lower
kind: method
category: str
title: str.lower(), upper(), capitalize(), title(), swapcase(), casefold()
summary: Преобразования регистра букв.
sig: str.lower()
check: str.lower, str.upper, str.capitalize, str.title, str.swapcase, str.casefold
tags: регистр, заглавные, строчные, большие буквы
related: task:title-case, task:swap-case
## Пример
```python
s = "hello WORLD"
print(s.lower(), s.upper(), s.capitalize(), s.title(), s.swapcase())
print("Straße".casefold() == "STRASSE".casefold())
```

# id: py:method:str.isdigit
kind: method
category: str
title: str.isdigit(), isalpha(), isalnum(), isspace(), isupper(), islower()
summary: Проверки состава строки.
sig: str.isdigit()
check: str.isdigit, str.isalpha, str.isalnum, str.isspace, str.isupper, str.islower, str.isdecimal, str.isnumeric
tags: проверка строки, только цифры, только буквы
related: err:ValueError
## Пример
```python
print("123".isdigit(), "-5".isdigit(), "abc".isalpha(), "Ёж".isalpha(), "a1".isalnum(), " \t".isspace(), "ABC".isupper())
```
## Особенности
isdigit не принимает знак минус и точку. Для проверки числа надёжнее try: int(s).

# id: py:method:str.format
kind: method
category: str
title: str.format()
summary: Подстановка значений в шаблон с фигурными скобками.
sig: str.format(*args, **kwargs)
check: str.format
tags: форматирование строки, шаблон, подстановка
related: py:topic:f-strings, py:builtin:format
## Пример
```python
print("{} + {} = {}".format(2, 3, 5), "{0}{1}{0}".format("ab", "-"), "{name}: {val:.2f}".format(name="pi", val=3.14159))
```

# id: py:method:str.zfill
kind: method
category: str
title: str.zfill(), center(), ljust(), rjust()
summary: Дополнение строки до нужной ширины нулями или символами.
sig: str.zfill(width, /)
check: str.zfill, str.center, str.ljust, str.rjust
tags: ведущие нули, выравнивание, ширина
related: py:topic:f-strings
## Пример
```python
print("7".zfill(3), "-7".zfill(4), "ab".center(6, "*"), "ab".ljust(5, ".") + "|", "ab".rjust(5) + "|")
```

# id: py:method:str.partition
kind: method
category: str
title: str.partition() и rpartition()
summary: Делят строку на три части по первому (последнему) вхождению разделителя.
sig: str.partition(sep, /)
check: str.partition, str.rpartition
tags: разделить на две части, ключ и значение
related: py:method:str.split
## Пример
```python
print("key=value=x".partition("="), "a/b/c.txt".rpartition("/"), "abc".partition("-"))
```

# id: py:method:str.translate
kind: method
category: str
title: str.translate() и str.maketrans()
summary: Посимвольная замена и удаление символов по таблице.
sig: str.translate(table, /)
check: str.translate, str.maketrans
tags: замена символов, таблица перевода, шифр
related: task:caesar
## Пример
```python
table = str.maketrans("abc", "xyz", "!")
print("a-b-c!".translate(table))
print("hello".translate(str.maketrans({"l": "L", "o": None})))
```

# id: py:method:str.encode
kind: method
category: str
title: str.encode() и bytes.decode()
summary: Перевод строки в байты в заданной кодировке и обратно.
sig: str.encode(encoding='utf-8', errors='strict')
check: str.encode, bytes.decode
tags: кодировка, utf-8, байты
related: py:builtin:bytes, err:UnicodeDecodeError
## Пример
```python
b = "Привет".encode("utf-8")
print(len(b), b[:4], b.decode("utf-8"), "ok".encode("ascii"))
```

# id: py:method:str.splitlines
kind: method
category: str
title: str.splitlines()
summary: Разбивает текст на строки по любым переводам строк.
sig: str.splitlines(keepends=False)
check: str.splitlines
tags: строки текста, построчно
related: py:method:str.split
## Пример
```python
text = "a\nb\r\nc\n"
print(text.splitlines(), text.split("\n"), text.splitlines(keepends=True))
```

# id: py:method:list.append
kind: method
category: list
title: list.append()
summary: Добавляет один элемент в конец списка (амортизированно O(1)).
sig: list.append(object, /)
check: list.append
complexity: O(1) амортизированно
tags: добавить в конец, push, добавить элемент
related: py:method:list.extend, py:method:list.insert, algo:stack
## Пример
```python
a = [1, 2]
a.append(3)
a.append([4, 5])
print(a, len(a))
```
## Особенности
Метод изменяет список на месте и возвращает None: a = a.append(x) — ошибка.

# id: py:method:list.extend
kind: method
category: list
title: list.extend()
summary: Добавляет в конец все элементы итерируемого объекта.
sig: list.extend(iterable, /)
check: list.extend
complexity: O(k)
tags: добавить несколько, объединить списки
related: py:method:list.append
## Пример
```python
a = [1, 2]
a.extend([3, 4])
a.extend("ab")
a += (5,)
print(a)
```

# id: py:method:list.insert
kind: method
category: list
title: list.insert()
summary: Вставляет элемент перед позицией index.
sig: list.insert(index, object, /)
check: list.insert
complexity: O(n)
tags: вставить, вставка в начало
related: lib:collections.deque, lib:bisect.insort
## Пример
```python
a = [1, 2, 3]
a.insert(0, 0)
a.insert(2, 9)
a.insert(100, 4)
print(a)
```
## Особенности
Вставка в начало сдвигает все элементы — для частых вставок в начало используйте deque.

# id: py:method:list.pop
kind: method
category: list
title: list.pop()
summary: Удаляет и возвращает элемент по индексу (по умолчанию последний).
sig: list.pop(index=-1, /)
check: list.pop
complexity: O(1) с конца, O(n) из начала
tags: удалить последний, извлечь, снять со стека
related: algo:stack, err:IndexError
## Пример
```python
a = [10, 20, 30, 40]
print(a.pop(), a.pop(0), a)
```

# id: py:method:list.remove
kind: method
category: list
title: list.remove()
summary: Удаляет первое вхождение значения.
sig: list.remove(value, /)
check: list.remove
complexity: O(n)
tags: удалить элемент по значению
related: py:keyword:del, py:method:list.pop
## Пример
```python
a = [3, 1, 3, 2]
a.remove(3)
print(a)
try:
    a.remove(9)
except ValueError as e:
    print(e)
```

# id: py:method:list.sort
kind: method
category: list
title: list.sort()
summary: Сортирует список на месте (устойчиво), возвращает None.
sig: list.sort(*, key=None, reverse=False)
check: list.sort
complexity: O(n log n)
tags: сортировка на месте, упорядочить список
related: py:builtin:sorted, algo:sorting
## Пример
```python
a = ["bb", "A", "c"]
a.sort()
print(a)
a.sort(key=str.lower)
print(a)
a.sort(key=len, reverse=True)
print(a)
```

# id: py:method:list.reverse
kind: method
category: list
title: list.reverse()
summary: Разворачивает список на месте.
sig: list.reverse()
check: list.reverse
complexity: O(n)
tags: развернуть список
related: py:builtin:reversed, py:topic:slicing
## Пример
```python
a = [1, 2, 3]
a.reverse()
print(a, a[::-1])
```

# id: py:method:list.index
kind: method
category: list
title: list.index() и list.count()
summary: Позиция первого вхождения значения и количество вхождений.
sig: list.index(value, start=0, stop=sys.maxsize, /)
check: list.index, list.count
complexity: O(n)
tags: найти индекс, сколько раз
related: py:builtin:enumerate
## Пример
```python
a = [5, 3, 5, 1]
print(a.index(5), a.index(5, 1), a.count(5), a.count(9))
```

# id: py:method:list.copy
kind: method
category: list
title: list.copy() и list.clear()
summary: Поверхностная копия списка; очистка списка.
sig: list.copy() · list.clear()
check: list.copy, list.clear
tags: копия списка, очистить
related: lib:copy.deepcopy
## Пример
```python
a = [[1], [2]]
b = a.copy()
b.append([3])
b[0].append(9)
print(a, b)
b.clear()
print(b)
```
## Особенности
copy() копирует только внешний список; вложенные объекты общие. Для полной копии — copy.deepcopy.

# id: py:method:dict.get
kind: method
category: dict
title: dict.get()
summary: Значение по ключу или значение по умолчанию (None), без KeyError.
sig: dict.get(key, default=None, /)
check: dict.get
complexity: O(1)
tags: значение по ключу, по умолчанию, безопасный доступ
related: err:KeyError, py:method:dict.setdefault
## Пример
```python
d = {"a": 1}
print(d.get("a"), d.get("b"), d.get("b", 0))
cnt = {}
for ch in "abca":
    cnt[ch] = cnt.get(ch, 0) + 1
print(cnt)
```

# id: py:method:dict.items
kind: method
category: dict
title: dict.items(), keys(), values()
summary: Представления пар, ключей и значений словаря для обхода.
sig: dict.items()
check: dict.items, dict.keys, dict.values
tags: обход словаря, ключи, значения, пары
related: py:keyword:for, py:topic:dicts
## Пример
```python
d = {"b": 2, "a": 1}
for k, v in sorted(d.items()):
    print(k, v)
print(list(d.keys()), sum(d.values()), max(d.items(), key=lambda kv: kv[1]))
```

# id: py:method:dict.setdefault
kind: method
category: dict
title: dict.setdefault()
summary: Возвращает значение ключа, а если его нет — сначала записывает default.
sig: dict.setdefault(key, default=None, /)
check: dict.setdefault
tags: значение по умолчанию, группировка
related: lib:collections.defaultdict, py:method:dict.get
## Пример
```python
groups = {}
for w in ["apple", "avocado", "banana"]:
    groups.setdefault(w[0], []).append(w)
print(groups)
```

# id: py:method:dict.update
kind: method
category: dict
title: dict.update() и оператор |
summary: Добавляет или перезаписывает пары из другого словаря; d1 | d2 создаёт новый (3.9+).
sig: dict.update([other], **kwargs)
check: dict.update
tags: объединить словари, слияние
related: py:op:unpacking
## Пример
```python
a = {"x": 1, "y": 2}
a.update({"y": 20, "z": 3})
print(a, {"p": 1} | {"q": 2}, {**a, "x": 0})
```

# id: py:method:dict.pop
kind: method
category: dict
title: dict.pop() и popitem()
summary: Удаляют ключ и возвращают значение; popitem — последнюю добавленную пару.
sig: dict.pop(key[, default])
check: dict.pop, dict.popitem
tags: удалить ключ, извлечь
related: py:keyword:del
## Пример
```python
d = {"a": 1, "b": 2, "c": 3}
print(d.pop("a"), d.pop("z", None), d.popitem(), d)
```

# id: py:method:dict.fromkeys
kind: method
category: dict
title: dict.fromkeys()
summary: Создаёт словарь с заданными ключами и одинаковым значением.
sig: dict.fromkeys(iterable, value=None, /)
check: dict.fromkeys
tags: словарь из ключей, уникальные в порядке
related: task:unique-chars-order
## Пример
```python
print(dict.fromkeys("abc", 0), list(dict.fromkeys([3, 1, 3, 2])))
```
## Ошибки
Значение общее для всех ключей: dict.fromkeys("ab", []) — один и тот же список у обоих ключей.

# id: py:method:set.add
kind: method
category: set
title: set.add(), remove(), discard(), pop()
summary: Добавление и удаление элементов множества.
sig: set.add(elem, /)
check: set.add, set.remove, set.discard, set.pop
complexity: O(1)
tags: добавить во множество, удалить
related: py:topic:sets
## Пример
```python
s = {1, 2}
s.add(3)
s.add(2)
s.discard(10)
s.remove(1)
print(s, len(s))
```
## Особенности
remove бросает KeyError при отсутствии элемента, discard — нет.

# id: py:method:set.intersection
kind: method
category: set
title: Операции над множествами: & | - ^
summary: Пересечение, объединение, разность и симметрическая разность (методы и операторы).
sig: set.intersection(*others) · set.union(*others) · set.difference(*others) · set.symmetric_difference(other)
check: set.intersection, set.union, set.difference, set.symmetric_difference, set.issubset, set.issuperset, set.isdisjoint
tags: пересечение, объединение, разность, подмножество
related: py:topic:sets, task:intersect-lists
## Пример
```python
a, b = {1, 2, 3}, {2, 3, 4}
print(a & b, a | b, a - b, a ^ b, {2} <= a, a.isdisjoint({9}))
print(a.intersection([2, 9], (2, 3)))
```

# id: py:method:tuple.count
kind: method
category: tuple
title: tuple.count() и tuple.index()
summary: Единственные методы кортежа: количество вхождений и индекс первого вхождения.
sig: tuple.count(value, /) · tuple.index(value[, start[, stop]])
check: tuple.count, tuple.index
tags: кортеж, методы кортежа
related: py:topic:tuples
## Пример
```python
t = (1, 2, 2, 3)
print(t.count(2), t.index(3))
```

# id: py:method:int.bit_length
kind: method
category: int
title: int.bit_length(), int.bit_count(), int.to_bytes()
summary: Число бит, число единичных бит (3.10+), перевод в байты.
sig: int.bit_length() · int.bit_count() · int.to_bytes(length=1, byteorder='big', *, signed=False)
check: int.bit_length, int.bit_count, int.to_bytes, int.from_bytes
tags: биты, двоичная длина, popcount
related: algo:bits
## Пример
```python
n = 300
print(n.bit_length(), n.bit_count(), n.to_bytes(2, "big"), int.from_bytes(b"\x01\x2c", "big"))
```

# id: py:method:float.is_integer
kind: method
category: float
title: float.is_integer() и float.as_integer_ratio()
summary: Проверка целого значения и точное представление float дробью.
sig: float.is_integer() · float.as_integer_ratio()
check: float.is_integer, float.as_integer_ratio
tags: дробь, точное значение, целое ли число
related: py:builtin:float, lib:fractions.Fraction
## Пример
```python
print((3.0).is_integer(), (3.5).is_integer(), (0.1).as_integer_ratio(), (0.5).as_integer_ratio())
```
