# id: quiz:basics:001
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(7 // 2, 7 % 2)
wrong: 3.5 1 | 4 1 | 3 1.0
explain: // — целочисленное деление, % — остаток.

# id: quiz:basics:002
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: 7 / 7
wrong: int | bool | str
explain: Оператор / всегда возвращает float.

# id: quiz:basics:003
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: input
wrong: str | type | NoneType
explain: input без скобок — сама встроенная функция (builtin_function_or_method), а не результат её вызова.

# id: quiz:basics:004
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: 3 > 2
wrong: int | str | NoneType
explain: Сравнения возвращают bool: True или False.

# id: quiz:basics:005
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: "5" * 3
wrong: int | list | float
explain: Строка, умноженная на число, повторяется: "555".

# id: quiz:basics:006
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print("5" * 3)
wrong: 15 | 5 5 5 | TypeError
explain: Умножение строки на число повторяет её.

# id: quiz:basics:007
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(2 ** 3 ** 2)
wrong: 64 | 12 | 36
explain: Возведение в степень правоассоциативно: 2 ** (3 ** 2) = 2 ** 9.

# id: quiz:basics:008
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(-7 // 2)
wrong: -3 | -3.5 | 3
explain: // округляет вниз, к минус бесконечности.

# id: quiz:basics:009
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(-7 % 3)
wrong: -1 | 1 | -2
explain: В Python остаток имеет знак делителя: -7 = 3·(−3) + 2.

# id: quiz:basics:010
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(int("12") + int(3.9))
wrong: 16 | 15.9 | 123
explain: int(3.9) отбрасывает дробную часть: 3.

# id: quiz:basics:011
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(round(2.5), round(3.5))
wrong: 3 4 | 2 3 | 3 3
explain: round использует банковское округление — к ближайшему чётному.

# id: quiz:basics:012
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(0.1 + 0.2 == 0.3)
wrong: True | 0.3 | Ошибка
explain: 0.1 и 0.2 не представимы точно в двоичном float.

# id: quiz:basics:013
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print("a", "b", "c", sep="-", end="!")
wrong: a b c! | a-b-c | abc-!
explain: sep — разделитель между аргументами, end — что печатается в конце.

# id: quiz:basics:014
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: x = 5\nx += 3\nx *= 2\nprint(x)
wrong: 13 | 11 | 10
explain: (5 + 3) · 2 = 16.

# id: quiz:basics:015
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: a, b = 1, 2\na, b = b, a\nprint(a, b)
wrong: 1 2 | 2 2 | 1 1
explain: Множественное присваивание меняет значения местами.

# id: quiz:basics:016
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(bool(""), bool("0"), bool(0))
wrong: False False False | True True False | False True True
explain: Пустая строка и 0 — ложь, непустая строка "0" — истина.

# id: quiz:basics:017
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(len("Привет"))
wrong: 12 | 7 | 5
explain: len считает символы, а не байты.

# id: quiz:basics:018
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: s = "python"\nprint(s[1], s[-1], s[1:4])
wrong: p n pyt | y o yth | y n ytho
explain: Индексы с 0, срез [1:4] — символы 1, 2, 3.

# id: quiz:basics:019
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(list(range(2, 10, 3)))
wrong: [2, 5, 8, 11] | [2, 4, 6, 8] | [3, 6, 9]
explain: range(начало, конец, шаг) не включает конец.

# id: quiz:basics:020
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: for i in range(3):\n    pass\nprint(i)
wrong: 3 | 0 | NameError
explain: После цикла переменная хранит последнее значение: 2.

# id: quiz:basics:021
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: n = 0\nwhile n < 10:\n    n += 3\nprint(n)
wrong: 9 | 10 | 3
explain: 0 → 3 → 6 → 9 → 12; условие 12 < 10 ложно.

# id: quiz:basics:022
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: for i in range(5):\n    if i == 3:\n        break\nelse:\n    print("все")\nprint(i)
wrong: все ⏎ 3 | 4 | все ⏎ 4
explain: else у цикла выполняется, только если не было break.

# id: quiz:basics:023
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: total = 0\nfor i in range(1, 6):\n    if i % 2 == 0:\n        continue\n    total += i\nprint(total)
wrong: 15 | 6 | 8
explain: Складываются только нечётные: 1 + 3 + 5.

# id: quiz:basics:024
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: x = 7\nprint("чёт" if x % 2 == 0 else "нечёт")
wrong: чёт | True | 1
explain: Условное выражение: A if условие else B.

# id: quiz:basics:025
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(1 < 3 < 2)
wrong: True | 1 | SyntaxError
explain: Цепочка сравнений означает 1 < 3 and 3 < 2.

# id: quiz:basics:026
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(0 or "" or "x" or "y")
wrong: True | y | 0
explain: or возвращает первое истинное значение, а не True.

# id: quiz:basics:027
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(3 and 0 and 5)
wrong: 5 | False | 3
explain: and возвращает первое ложное значение (или последнее, если все истинны).

# id: quiz:basics:028
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: name = "Ali"\nage = 15\nprint(f"{name} - {age + 1}")
wrong: {name} - {age + 1} | Ali - 15 | Ali - 151
explain: В f-строке выражения в фигурных скобках вычисляются.

# id: quiz:basics:029
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(f"{3.14159:.2f}|{42:5d}|{7:03d}")
wrong: 3.14|42|7 | 3.1|   42|007 | 3.14|42   |700
explain: .2f — два знака после точки, 5d — ширина 5, 03d — дополнить нулями до 3 знаков.

# id: quiz:basics:030
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: def f(x, y=10):\n    return x + y\nprint(f(1), f(1, 2))
wrong: 11 11 | 1 3 | TypeError
explain: y имеет значение по умолчанию.

# id: quiz:basics:031
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: def f():\n    print("hi")\nprint(f())
wrong: hi | None | hi hi
explain: Функция без return возвращает None; print(f()) сначала печатает hi, потом None.

# id: quiz:basics:032
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: x = 10\ndef f():\n    x = 20\n    return x\nprint(f(), x)
wrong: 20 20 | 10 10 | UnboundLocalError
explain: Присваивание внутри функции создаёт локальную переменную.

# id: quiz:basics:033
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: sq = lambda x: x * x\nprint(sq(sq(2)))
wrong: 4 | 8 | 256
explain: sq(2) = 4, sq(4) = 16.

# id: quiz:basics:034
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(list(map(int, "1 2 3".split())))
wrong: ['1', '2', '3'] | [123] | 6
explain: split даёт строки, map(int, ...) превращает их в числа.

# id: quiz:basics:035
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print([x * 2 for x in range(5) if x % 2])
wrong: [0, 4, 8] | [2, 6, 10] | [1, 3]
explain: Берутся нечётные x (1 и 3) и удваиваются.

# id: quiz:basics:036
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: (1,)
wrong: int | list | set
explain: Запятая делает кортеж; (1) — просто число.

# id: quiz:basics:037
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: {}
wrong: set | tuple | list
explain: Пустые фигурные скобки — пустой словарь; пустое множество — set().

# id: quiz:basics:038
kind: quiz
type: type
category: basics
level: 2
q: Какой тип у выражения?
expr: range(5)
wrong: list | tuple | generator
explain: range — отдельный ленивый тип последовательности.

# id: quiz:basics:039
kind: quiz
type: type
category: basics
level: 2
q: Какой тип у выражения?
expr: (x for x in range(3))
wrong: tuple | list | range
explain: Круглые скобки с for внутри создают генератор, а не кортеж.

# id: quiz:basics:040
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: 10 // 3
wrong: float | bool | str
explain: Целочисленное деление двух int даёт int.

# id: quiz:basics:041
kind: quiz
type: type
category: basics
level: 2
q: Какой тип у выражения?
expr: 10 // 3.0
wrong: int | bool | complex
explain: Если хоть один операнд float, результат // тоже float (3.0).

# id: quiz:basics:042
kind: quiz
type: type
category: basics
level: 2
q: Какой тип у выражения?
expr: True + True
wrong: bool | str | float
explain: bool — подкласс int, True + True == 2 (тип int).

# id: quiz:basics:043
kind: quiz
type: type
category: basics
level: 2
q: Какой тип у выражения?
expr: print("")
wrong: str | bool | int
explain: print возвращает None.

# id: quiz:basics:044
kind: quiz
type: choose_code
category: basics
level: 1
q: Какой вариант выводит сумму чисел 1..10 (55)?
expect: 55
answer: 2
explain: range(1, 11) включает 10; range(10) — числа 0..9.
## Варианты
```python
print(sum(range(10)))
```
```python
print(sum(range(1, 11)))
```
```python
print(sum(range(1, 10)))
```

# id: quiz:basics:045
kind: quiz
type: choose_code
category: basics
level: 1
q: Какой код выводит строку в обратном порядке (cba)?
expect: cba
answer: 3
explain: Срез с шагом −1 разворачивает строку; reversed возвращает итератор, его нужно склеить join.
## Варианты
```python
print("abc".reverse())
```
```python
print(reversed("abc"))
```
```python
print("abc"[::-1])
```

# id: quiz:basics:046
kind: quiz
type: choose_code
category: basics
level: 2
q: Какой код печатает числа 1 2 3 в одну строку через пробел?
expect: 1 2 3
answer: 1
explain: Звёздочка распаковывает список в отдельные аргументы print.
## Варианты
```python
print(*[1, 2, 3])
```
```python
print([1, 2, 3])
```
```python
print("".join(["1", "2", "3"]))
```

# id: quiz:basics:047
kind: quiz
type: fact
category: basics
level: 1
q: Что возвращает функция input()?
options: Всегда строку | Число, если введено число | Список слов | None
answer: 1
explain: input() всегда возвращает str — для чисел нужно int() или float().

# id: quiz:basics:048
kind: quiz
type: fact
category: basics
level: 1
q: Как в Python обозначается блок кода (тело if, for, функции)?
options: Отступом | Фигурными скобках { } | Словами begin/end | Точкой с запятой
answer: 1
explain: Блоки задаются отступами (обычно 4 пробела) после строки с двоеточием.

# id: quiz:basics:049
kind: quiz
type: fact
category: basics
level: 2
q: Какое имя переменной допустимо в Python?
options: _count2 | 2count | my-var | class
answer: 1
explain: Имя не может начинаться с цифры, содержать «-» и совпадать с ключевым словом.

# id: quiz:basics:050
kind: quiz
type: fact
category: basics
level: 2
q: Чем отличается is от ==?
options: is сравнивает идентичность объектов, == — значения | Ничем | == сравнивает идентичность, is — значения | is работает только для чисел
answer: 1
explain: a is b истинно, только если это один и тот же объект; для None используйте is None.

# id: quiz:basics:051
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: a = [1, 2]\nb = a\nb.append(3)\nprint(a)
wrong: [1, 2] | [1, 2, 3, 3] | [3]
explain: b = a не копирует список — обе переменные ссылаются на один объект.

# id: quiz:basics:052
kind: quiz
type: output
category: basics
level: 2
q: Что выведет программа?
code: print(int("101", 2), int("ff", 16), hex(255))
wrong: 101 ff 255 | 5 255 255 | 5 15 0xff
explain: int(строка, основание) переводит из системы счисления; hex — в шестнадцатеричную запись.

# id: quiz:basics:053
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
code: print(max(3, 7, 2), min("b", "a", "c"), abs(-4))
wrong: 7 c 4 | 3 a -4 | 7 a -4
explain: max и min работают и для строк (по алфавиту), abs — модуль числа.
