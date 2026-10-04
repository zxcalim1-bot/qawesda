# id: quiz:syntax:001
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: a = [1, 2, 3]\nprint(a[3])
wrong: TypeError | NameError | Ошибки нет
explain: Индексы списка из трёх элементов — 0, 1, 2.

# id: quiz:syntax:002
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: x = 5\nif x > 3\n    print(x)
wrong: IndentationError | NameError | Ошибки нет
explain: После условия if нужно двоеточие.

# id: quiz:syntax:003
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: def f():\nreturn 1
wrong: TabError | NameError | Ошибки нет
explain: Тело функции должно иметь отступ — IndentationError (подкласс SyntaxError).

# id: quiz:syntax:004
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: print(Count)
wrong: SyntaxError | TypeError | ValueError
explain: Имя Count не определено.

# id: quiz:syntax:005
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: print("Возраст: " + 15)
wrong: ValueError | SyntaxError | Ошибки нет
explain: Нельзя складывать str и int.

# id: quiz:syntax:006
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: print(int("12a"))
wrong: TypeError | SyntaxError | Ошибки нет
explain: Тип аргумента верный (строка), но значение не является числом.

# id: quiz:syntax:007
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: d = {"a": 1}\nprint(d["b"])
wrong: IndexError | AttributeError | Ошибки нет
explain: В словаре нет ключа "b".

# id: quiz:syntax:008
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: a = [1, 2]\na.push(3)
wrong: NameError | TypeError | Ошибки нет
explain: У списков нет метода push, есть append.

# id: quiz:syntax:009
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: print(10 / 0)
wrong: ValueError | OverflowError | Ошибки нет
explain: Деление на ноль.

# id: quiz:syntax:010
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: s = "abc"\ns[0] = "x"
wrong: IndexError | AttributeError | Ошибки нет
explain: Строки неизменяемы: 'str' object does not support item assignment.

# id: quiz:syntax:011
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: a, b = "1 2 3".split()
wrong: TypeError | IndexError | Ошибки нет
explain: too many values to unpack.

# id: quiz:syntax:012
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: x = 1\ndef f():\n    x += 1\nf()
wrong: NameError | SyntaxError | Ошибки нет
explain: x внутри функции локальная (есть присваивание) и читается до присваивания.

# id: quiz:syntax:013
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: s = {[1, 2]}
wrong: ValueError | SyntaxError | Ошибки нет
explain: Список нельзя положить во множество: unhashable type.

# id: quiz:syntax:014
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: a = [3, 1, 2]\na = a.sort()\nprint(a[0])
wrong: IndexError | AttributeError | Ошибки нет
explain: a.sort() возвращает None, а None[0] — TypeError.

# id: quiz:syntax:015
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: import mathh
wrong: ImportError | NameError | SyntaxError
explain: Модуля с таким именем нет.

# id: quiz:syntax:016
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: from math import root
wrong: ModuleNotFoundError | AttributeError | NameError
explain: Модуль math есть, но имени root в нём нет.

# id: quiz:syntax:017
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: def f(n):\n    return f(n - 1)\nf(5)
wrong: StopIteration | OverflowError | Ошибки нет
explain: Нет базы рекурсии — превышена максимальная глубина.

# id: quiz:syntax:018
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: it = iter([])\nnext(it)
wrong: IndexError | ValueError | Ошибки нет
explain: Итератор пуст.

# id: quiz:syntax:019
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: def f(a, b):\n    return a + b\nprint(f(1))
wrong: ValueError | NameError | Ошибки нет
explain: missing 1 required positional argument: 'b'.

# id: quiz:syntax:020
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print(len(5))
wrong: ValueError | AttributeError | Ошибки нет
explain: object of type 'int' has no len().

# id: quiz:syntax:021
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: x = None\nprint(x.upper())
wrong: TypeError | NameError | Ошибки нет
explain: У None нет метода upper.

# id: quiz:syntax:022
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: print("Привет)
wrong: NameError | IndentationError | Ошибки нет
explain: Строка не закрыта кавычкой: unterminated string literal.

# id: quiz:syntax:023
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
code: a = (1, 2\nprint(a)
wrong: NameError | TypeError | Ошибки нет
explain: Скобка не закрыта.

# id: quiz:syntax:024
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: for i in range(3):\n    print(i)\n  print("x")
wrong: NameError | TabError | Ошибки нет
explain: Отступ не совпадает ни с одним внешним уровнем — IndentationError.

# id: quiz:syntax:025
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: d = {"a": 1, "b": 2}\nfor k in d:\n    d["c"] = 3
wrong: KeyError | TypeError | Ошибки нет
explain: dictionary changed size during iteration.

# id: quiz:syntax:026
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print([1, 2] + 3)
wrong: ValueError | IndexError | Ошибки нет
explain: К списку можно прибавить только список.

# id: quiz:syntax:027
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print([1, 2] * 2)
wrong: TypeError | ValueError | SyntaxError
explain: Умножение списка на число повторяет его: [1, 2, 1, 2].

# id: quiz:syntax:028
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: x = int(input())
wrong: ValueError | TypeError | Ошибки нет
explain: Ввод пуст — input() не может прочитать строку.

# id: quiz:syntax:029
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: a = []\na.pop()
wrong: KeyError | ValueError | Ошибки нет
explain: pop from empty list — IndexError.

# id: quiz:syntax:030
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: a = [1, 2, 3]\na.remove(5)
wrong: IndexError | KeyError | Ошибки нет
explain: list.remove(x): x not in list.

# id: quiz:syntax:031
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print("abc".index("z"))
wrong: IndexError | KeyError | Ошибки нет
explain: str.index бросает ValueError, а str.find вернул бы −1.

# id: quiz:syntax:032
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print("abc".find("z"))
wrong: ValueError | IndexError | TypeError
explain: find возвращает −1, если подстрока не найдена.

# id: quiz:syntax:033
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: import math\nprint(math.sqrt(-1))
wrong: TypeError | ZeroDivisionError | Ошибки нет
explain: math domain error — ValueError; для комплексных корней есть cmath.sqrt.

# id: quiz:syntax:034
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: import math\nprint(math.exp(1000))
wrong: ValueError | MemoryError | Ошибки нет
explain: Результат больше максимального float.

# id: quiz:syntax:035
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: print(2 ** 10000 > 0)
wrong: OverflowError | MemoryError | ValueError
explain: Целые числа Python не переполняются.

# id: quiz:syntax:036
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: x = 10 ** 5000\nprint(x)
wrong: OverflowError | MemoryError | Ошибки нет
explain: С Python 3.11 str() для чисел длиннее 4300 цифр запрещён по умолчанию (ValueError).

# id: quiz:syntax:037
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: class A:\n    def hello():\n        return 1\nA().hello()
wrong: AttributeError | NameError | Ошибки нет
explain: Метод вызывается с self, а параметра для него нет.

# id: quiz:syntax:038
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: t = (1, 2, 3)\nt[0] = 5
wrong: AttributeError | IndexError | Ошибки нет
explain: Кортеж неизменяем.

# id: quiz:syntax:039
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print(sum(["1", "2"]))
wrong: ValueError | SyntaxError | Ошибки нет
explain: sum начинает с 0 и не может прибавить строку к числу.

# id: quiz:syntax:040
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: print(max([]))
wrong: IndexError | TypeError | Ошибки нет
explain: max() arg is an empty sequence — ValueError (можно передать default=).

# id: quiz:syntax:041
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: x = 5\nassert x < 3, "слишком много"
wrong: ValueError | RuntimeError | Ошибки нет
explain: Условие assert ложно.

# id: quiz:syntax:042
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: print(b"\xff".decode("utf-8"))
wrong: UnicodeEncodeError | TypeError | Ошибки нет
explain: 0xff не может быть первым байтом символа UTF-8 — UnicodeDecodeError.

# id: quiz:syntax:043
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: def f():\n    pass\nf = 5\nf()
wrong: NameError | SyntaxError | Ошибки нет
explain: f перезаписана числом, а число нельзя вызвать: 'int' object is not callable.

# id: quiz:syntax:044
kind: quiz
type: error
category: syntax
level: 2
q: Какая ошибка возникнет?
code: list = [1, 2]\nprint(list("abc"))
wrong: NameError | AttributeError | Ошибки нет
explain: Имя list перекрыто переменной — встроенная функция недоступна.

# id: quiz:syntax:045
kind: quiz
type: error
category: syntax
level: 3
q: Какая ошибка возникнет?
code: print(open("no_such_file_xyz.txt").read())
wrong: PermissionError | NameError | Ошибки нет
explain: Файла не существует.

# id: quiz:syntax:046
kind: quiz
type: choose_code
category: syntax
level: 1
q: Какой код синтаксически верен и печатает YES?
expect: YES
answer: 3
explain: Нужны двоеточие и сравнение ==.
## Варианты
```python
x = 1
if x = 1:
    print("YES")
```
```python
x = 1
if x == 1
    print("YES")
```
```python
x = 1
if x == 1:
    print("YES")
```

# id: quiz:syntax:047
kind: quiz
type: choose_code
category: syntax
level: 2
q: Какой вариант печатает «Ann 15» без ошибки?
expect: Ann 15
answer: 2
explain: Склеивать строку с числом нельзя; print с несколькими аргументами или f-строка работают.
## Варианты
```python
age = 15
print("Ann " + age)
```
```python
age = 15
print("Ann", age)
```
```python
age = 15
print("Ann" age)
```

# id: quiz:syntax:048
kind: quiz
type: fact
category: syntax
level: 1
q: Что означает сообщение «IndentationError: expected an indented block»?
options: После двоеточия нет блока с отступом | Лишний пробел в конце строки | Неизвестное имя переменной | Деление на ноль
answer: 1
explain: После if/for/def/… тело блока должно быть сдвинуто вправо.

# id: quiz:syntax:049
kind: quiz
type: fact
category: syntax
level: 2
q: Чем SyntaxError отличается от остальных ошибок?
options: Возникает до выполнения программы, при разборе кода | Возникает только в функциях | Возникает только при вводе данных | Её нельзя исправить
answer: 1
explain: Программа с синтаксической ошибкой не начинает выполняться вовсе.

# id: quiz:syntax:050
kind: quiz
type: fact
category: syntax
level: 2
q: Как перехватить ошибку деления на ноль?
options: try: ... except ZeroDivisionError: ... | catch (ZeroDivisionError) {...} | on error resume next | if error: ...
answer: 1
explain: В Python исключения обрабатываются конструкцией try/except.
