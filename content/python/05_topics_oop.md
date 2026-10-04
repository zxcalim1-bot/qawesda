# id: py:topic:oop
kind: topic
category: ООП
title: Классы и объекты
summary: Объектно-ориентированное программирование в Python: класс, экземпляр, атрибуты, методы, self, __init__.
level: intermediate
tags: ООП, класс, объект, экземпляр, self, __init__, атрибут, метод
related: py:keyword:class, py:topic:inheritance, py:topic:encapsulation, py:topic:magic-methods, task:bank-account
## Класс и экземпляры
Класс описывает данные (атрибуты) и поведение (методы). Каждый объект — экземпляр класса со своими атрибутами.
```python
class Student:
    school = "№1"
    def __init__(self, name, grades=None):
        self.name = name
        self.grades = grades or []
    def add(self, g):
        self.grades.append(g)
    def average(self):
        return sum(self.grades) / len(self.grades) if self.grades else 0
s = Student("Ali")
s.add(5); s.add(4)
print(s.name, s.average(), s.school, Student.school, isinstance(s, Student))
```
## Атрибуты класса и экземпляра
Атрибут класса общий для всех объектов, атрибут экземпляра хранится в объекте (s.__dict__).
## self
Первый параметр метода — сам объект. s.add(5) — это Student.add(s, 5).

# id: py:topic:inheritance
kind: topic
category: ООП
title: Наследование
summary: Подклассы, переопределение методов, super(), множественное наследование и порядок MRO.
level: intermediate
tags: наследование, подкласс, super, MRO, переопределение
related: py:builtin:super, py:builtin:issubclass, py:topic:polymorphism
## Пример
```python
class Shape:
    def __init__(self, name):
        self.name = name
    def area(self):
        return 0
    def __str__(self):
        return f"{self.name}: {self.area():.2f}"
class Rect(Shape):
    def __init__(self, w, h):
        super().__init__("прямоугольник")
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h
class Square(Rect):
    def __init__(self, a):
        super().__init__(a, a)
        self.name = "квадрат"
print(Rect(2, 3), Square(4), [c.__name__ for c in Square.__mro__])
```
## Множественное наследование
Порядок поиска методов определяет MRO (линеаризация C3). super() вызывает следующий класс по MRO, а не обязательно «родителя».

# id: py:topic:polymorphism
kind: topic
category: ООП
title: Полиморфизм и утиная типизация
summary: Один интерфейс — разные реализации; «если крякает как утка» — важно поведение, а не тип.
level: intermediate
tags: полиморфизм, утиная типизация, duck typing, интерфейс, протокол
related: py:topic:inheritance, py:topic:abstraction, py:topic:magic-methods
## Пример
```python
class Cat:
    def sound(self):
        return "мяу"
class Duck:
    def sound(self):
        return "кря"
class Robot:
    def sound(self):
        return "бип"
for thing in (Cat(), Duck(), Robot()):
    print(thing.sound(), end=" ")
print()
print(len("abc"), len([1, 2]), len({"a": 1}))
```
## Идея
Функции, которые используют только нужные методы объекта, работают с любыми объектами, имеющими эти методы, — наследование не обязательно.

# id: py:topic:encapsulation
kind: topic
category: ООП
title: Инкапсуляция
summary: Сокрытие внутреннего устройства: соглашение _имя, искажение имён __имя, свойства вместо прямого доступа.
level: intermediate
tags: инкапсуляция, приватный атрибут, _, __, name mangling
related: py:topic:properties, py:topic:oop
## Соглашения
- _name — «внутренний» атрибут: доступ возможен, но не рекомендуется.
- __name — искажение имени (name mangling): превращается в _Класс__name, защищает от случайных конфликтов в подклассах.
```python
class Account:
    def __init__(self, balance):
        self._balance = balance
        self.__pin = 1234
    def deposit(self, x):
        if x <= 0:
            raise ValueError("сумма должна быть положительной")
        self._balance += x
    @property
    def balance(self):
        return self._balance
a = Account(100)
a.deposit(50)
print(a.balance, hasattr(a, "__pin"), a._Account__pin)
```
## Идея
Python не запрещает доступ жёстко: инкапсуляция держится на соглашениях и на понятном публичном интерфейсе.

# id: py:topic:abstraction
kind: topic
category: ООП
title: Абстракция и абстрактные классы
summary: Модуль abc: абстрактные методы, которые обязаны реализовать подклассы.
level: intermediate
tags: абстракция, абстрактный класс, ABC, abstractmethod, интерфейс
related: lib:abc.ABC, lib:abc.abstractmethod, err:NotImplementedError
## Пример
```python
from abc import ABC, abstractmethod
class Storage(ABC):
    @abstractmethod
    def save(self, key, value): ...
    @abstractmethod
    def load(self, key): ...
class Memory(Storage):
    def __init__(self):
        self.d = {}
    def save(self, key, value):
        self.d[key] = value
    def load(self, key):
        return self.d.get(key)
m = Memory()
m.save("x", 1)
print(m.load("x"))
try:
    Storage()
except TypeError as e:
    print("нельзя создать:", type(e).__name__)
```

# id: py:topic:properties
kind: topic
category: ООП
title: Свойства (@property)
summary: Атрибуты с логикой чтения, записи и проверки; вычисляемые атрибуты.
level: intermediate
tags: property, геттер, сеттер, вычисляемый атрибут
related: py:builtin:property, py:topic:descriptors, py:topic:encapsulation
## Пример
```python
class Circle:
    def __init__(self, r):
        self.r = r
    @property
    def r(self):
        return self._r
    @r.setter
    def r(self, value):
        if value < 0:
            raise ValueError("радиус < 0")
        self._r = value
    @property
    def area(self):
        return 3.14159 * self._r ** 2
c = Circle(2)
c.r = 3
print(c.r, round(c.area, 2))
try:
    c.r = -1
except ValueError as e:
    print(e)
```

# id: py:topic:staticmethod-classmethod
kind: topic
category: ООП
title: staticmethod и classmethod
summary: Методы без self: служебные функции класса и альтернативные конструкторы.
level: intermediate
tags: staticmethod, classmethod, cls, альтернативный конструктор
related: py:builtin:staticmethod, py:topic:oop
## Пример
```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
    @classmethod
    def from_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)
    @staticmethod
    def valid(c):
        return c >= -273.15
t = Temperature.from_fahrenheit(212)
print(t.celsius, Temperature.valid(-300))
```
## Когда что
classmethod получает класс (cls) и подходит для фабрик, учитывающих наследование. staticmethod — обычная функция, логически связанная с классом.

# id: py:topic:magic-methods
kind: topic
category: ООП
title: Магические методы
summary: __init__, __str__, __repr__, __eq__, __lt__, __len__, __getitem__, __add__, __call__, __hash__ и другие.
level: intermediate
tags: магические методы, dunder, перегрузка операторов, __str__, __eq__
related: py:topic:oop, task:fraction-class, task:vector-class, lib:functools.total_ordering
## Пример
```python
from functools import total_ordering
@total_ordering
class Money:
    def __init__(self, rub):
        self.rub = rub
    def __repr__(self):
        return f"Money({self.rub})"
    def __str__(self):
        return f"{self.rub} ₽"
    def __add__(self, other):
        return Money(self.rub + other.rub)
    def __eq__(self, other):
        return self.rub == other.rub
    def __lt__(self, other):
        return self.rub < other.rub
    def __hash__(self):
        return hash(self.rub)
    def __bool__(self):
        return self.rub != 0
a, b = Money(100), Money(50)
print(a + b, repr(a), a > b, sorted([a, b]), bool(Money(0)), len({a, Money(100)}))
```
## Основные группы
- Создание и представление: __new__, __init__, __repr__, __str__, __format__.
- Сравнение: __eq__, __lt__, __le__, …, __hash__.
- Арифметика: __add__, __sub__, __mul__, __truediv__, __radd__, __iadd__ …
- Контейнеры: __len__, __getitem__, __setitem__, __contains__, __iter__.
- Вызов и контекст: __call__, __enter__, __exit__.

# id: py:topic:descriptors
kind: topic
category: ООП
title: Дескрипторы
summary: Объекты с методами __get__/__set__, управляющие доступом к атрибутам класса; основа property и методов.
level: advanced
tags: дескриптор, __get__, __set__, __set_name__, property
related: py:topic:properties, py:topic:metaclasses
## Пример: проверка типа атрибута
```python
class Typed:
    def __init__(self, kind):
        self.kind = kind
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"ожидался {self.kind.__name__}")
        setattr(obj, self.name, value)
class Person:
    age = Typed(int)
    def __init__(self, age):
        self.age = age
p = Person(30)
print(p.age)
try:
    p.age = "старый"
except TypeError as e:
    print(e)
```
## Где используются
property, staticmethod, classmethod и даже обычные методы (функции — дескрипторы, создающие связанные методы).

# id: py:topic:metaclasses
kind: topic
category: ООП
title: Метаклассы
summary: «Классы классов»: type создаёт классы; метакласс позволяет вмешаться в создание класса. Часто хватает __init_subclass__.
level: advanced
tags: метакласс, type, __init_subclass__, создание класса
related: py:builtin:type, py:topic:descriptors
## Классы — тоже объекты
```python
class A:
    pass
print(type(A), type(type))
B = type("B", (A,), {"x": 1})
print(B.x, B.__mro__[1].__name__)
```
## Регистрация подклассов
```python
class Plugin:
    registry = {}
    def __init_subclass__(cls, name=None, **kw):
        super().__init_subclass__(**kw)
        Plugin.registry[name or cls.__name__] = cls
class Csv(Plugin, name="csv"):
    pass
class Json(Plugin, name="json"):
    pass
print(sorted(Plugin.registry))
class Meta(type):
    def __new__(mcls, name, bases, ns):
        ns["created_by"] = "Meta"
        return super().__new__(mcls, name, bases, ns)
class C(metaclass=Meta):
    pass
print(C.created_by)
```

# id: py:topic:dataclasses
kind: topic
category: ООП
title: dataclasses
summary: Декоратор @dataclass генерирует __init__, __repr__, __eq__ (и сортировку, заморозку) по аннотациям полей.
level: intermediate
tags: dataclass, поля, frozen, order, field
related: lib:dataclasses.dataclass, py:topic:typing, gh:attrs
## Пример
```python
from dataclasses import dataclass, field, asdict
@dataclass(order=True, frozen=True)
class Version:
    major: int
    minor: int = 0
@dataclass
class Team:
    name: str
    members: list = field(default_factory=list)
v = sorted([Version(2, 1), Version(1, 9), Version(2)])
t = Team("A")
t.members.append("Ali")
print(v, t, asdict(t), Version(1) == Version(1, 0))
```

# id: py:topic:typing
kind: topic
category: ООП
title: Аннотации типов и typing
summary: Подсказки типов для функций и переменных: list[int], dict[str, int], Optional, Union (|), Callable, TypeVar, Protocol.
level: intermediate
tags: аннотации типов, typing, type hints, Optional, Union, mypy
related: lib:typing, gh:mypy, py:topic:dataclasses
## Пример
```python
from typing import Callable, Optional, Protocol, TypeVar
T = TypeVar("T")
def first(items: list[T]) -> Optional[T]:
    return items[0] if items else None
def apply(f: Callable[[int], int], x: int) -> int:
    return f(x)
class HasLen(Protocol):
    def __len__(self) -> int: ...
def size(x: HasLen) -> int:
    return len(x)
scores: dict[str, int | None] = {"a": 1, "b": None}
print(first([3, 4]), first([]), apply(abs, -5), size("abc"), first.__annotations__)
```
## Важно
Интерпретатор не проверяет аннотации во время выполнения — это делают инструменты (mypy, pyright) и IDE.

# id: py:topic:exceptions
kind: topic
category: Ошибки и отладка
title: Исключения
summary: Иерархия исключений, try/except/else/finally, свои исключения, цепочки, группы исключений (3.11).
level: intermediate
tags: исключения, try, except, raise, finally, свои исключения, ExceptionGroup
related: py:keyword:try, py:keyword:raise, py:exception:BaseException
## Обработка
```python
def parse(s):
    try:
        return int(s)
    except ValueError:
        return None
    finally:
        pass
print(parse("42"), parse("x"))
```
## Свои исключения и цепочки
```python
class InsufficientFunds(Exception):
    def __init__(self, need):
        super().__init__(f"не хватает {need}")
        self.need = need
try:
    try:
        raise InsufficientFunds(50)
    except InsufficientFunds as e:
        raise RuntimeError("платёж отклонён") from e
except RuntimeError as e:
    print(e, "<-", e.__cause__)
```
## Группы исключений (Python 3.11)
```python
try:
    raise ExceptionGroup("несколько ошибок", [ValueError("a"), TypeError("b")])
except* ValueError as eg:
    print("ValueError:", eg.exceptions)
except* TypeError as eg:
    print("TypeError:", eg.exceptions)
```
## Иерархия
BaseException → Exception → (ArithmeticError → ZeroDivisionError, OverflowError), (LookupError → IndexError, KeyError), ValueError, TypeError, OSError → FileNotFoundError, … Ловите конкретные исключения, а не голый except.

# id: py:topic:testing
kind: topic
category: Ошибки и отладка
title: Тестирование
summary: assert, unittest, doctest и pytest; что и как тестировать, стресс-тесты для алгоритмов.
level: intermediate
tags: тестирование, unittest, pytest, doctest, assert, тесты
related: lib:unittest, lib:doctest, gh:pytest, algo:brute-force
## unittest
```python
import unittest
def is_palindrome(s):
    return s == s[::-1]
class T(unittest.TestCase):
    def test_yes(self):
        self.assertTrue(is_palindrome("level"))
    def test_no(self):
        self.assertFalse(is_palindrome("abc"))
result = unittest.TextTestRunner(verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(result.wasSuccessful(), result.testsRun)
```
## doctest
```python
def square(x):
    """
    >>> square(3)
    9
    """
    return x * x
import doctest
print(doctest.testmod(verbose=False))
```
## pytest
Внешний фреймворк: тест — функция test_* с обычными assert; запуск командой pytest. На часах не установлен.

# id: py:topic:files
kind: topic
category: Файлы и ввод-вывод
title: Работа с файлами
summary: open и with, режимы, чтение построчно, запись, кодировки, pathlib, CSV и JSON.
level: beginner
tags: файлы, open, with, чтение, запись, pathlib, csv, json, кодировка
related: py:builtin:open, lib:pathlib.Path, lib:csv, lib:json, err:FileNotFoundError
## Чтение и запись
```python
from pathlib import Path
import tempfile
p = Path(tempfile.mkdtemp()) / "notes.txt"
with open(p, "w", encoding="utf-8") as f:
    f.write("первая\n")
    print("вторая", file=f)
with open(p, "a", encoding="utf-8") as f:
    f.writelines(["третья\n"])
with open(p, encoding="utf-8") as f:
    print(f.readline().strip(), [line.strip() for line in f])
print(p.read_text(encoding="utf-8").count("\n"), p.suffix, p.stem, p.exists())
```
## JSON и CSV
```python
import json, csv, io
data = {"name": "Ali", "scores": [5, 4]}
s = json.dumps(data, ensure_ascii=False)
print(s, json.loads(s)["scores"])
buf = io.StringIO()
csv.writer(buf).writerows([["a", "b"], [1, "x, y"]])
print(buf.getvalue().strip().splitlines(), list(csv.reader(io.StringIO(buf.getvalue()))))
```
## Советы
Используйте with, явно указывайте encoding="utf-8", для путей — pathlib. На часах приложение может писать только во временные и свои папки.

# id: py:topic:modules
kind: topic
category: Модули и пакеты
title: Модули и пакеты
summary: Модуль — файл .py, пакет — папка с модулями; import, __name__ == "__main__", __init__.py, относительный импорт.
level: intermediate
tags: модуль, пакет, import, __init__, __main__, __name__
related: py:keyword:import, py:topic:import-system, py:topic:packaging
## Модуль
Любой файл .py — модуль. При импорте его код выполняется один раз, объект модуля кешируется в sys.modules.
```python
import sys, math
print(math.__name__, "math" in sys.modules, __name__)
if __name__ == "__main__":
    print("запущен как программа")
```
## Пакет
Папка с модулями (обычно с __init__.py). Импорт: from package.module import name; внутри пакета — относительный: from . import utils.

# id: py:topic:import-system
kind: topic
category: Модули и пакеты
title: Система импорта
summary: Как Python находит модули: sys.path, sys.modules, кеш __pycache__, importlib, ленивый импорт.
level: advanced
tags: import, sys.path, sys.modules, importlib, __pycache__, поиск модулей
related: py:topic:modules, lib:importlib, py:builtin:__import__, err:ModuleNotFoundError
## Порядок поиска
1) sys.modules — уже загруженные модули; 2) встроенные и замороженные модули; 3) поиск по путям sys.path (папка скрипта, PYTHONPATH, стандартная библиотека, site-packages). Скомпилированный байт-код кешируется в __pycache__/*.pyc.
```python
import sys, importlib, importlib.util
print(type(sys.path).__name__, "json" in sys.modules)
spec = importlib.util.find_spec("json")
print(spec.name, spec.origin is not None)
json = importlib.import_module("json")
print(json.dumps({"ok": True}))
```

# id: py:topic:venv
kind: topic
category: Модули и пакеты
title: Виртуальные окружения (venv) и pip
summary: Изолированные окружения для проектов: python -m venv, активация, pip install, requirements.txt.
level: beginner
tags: venv, виртуальное окружение, pip, requirements, установка пакетов
related: gh:pip, gh:poetry, lib:venv
## Команды (на компьютере)
```text
python -m venv .venv
.venv\Scripts\activate          (Windows)
source .venv/bin/activate       (Linux, macOS)
pip install requests
pip freeze > requirements.txt
pip install -r requirements.txt
deactivate
```
## Зачем
У каждого проекта свои версии библиотек; окружение не смешивает их с системным Python.
```python
import sys
print(sys.prefix != sys.base_prefix)
```
## На часах
Встроенный Python приложения уже содержит стандартную библиотеку; pip и venv на часах не используются.

# id: py:topic:packaging
kind: topic
category: Модули и пакеты
title: Упаковка и публикация пакетов
summary: pyproject.toml, сборка wheel, версии, публикация в PyPI.
level: advanced
tags: packaging, pyproject.toml, wheel, PyPI, сборка пакета
related: gh:setuptools, gh:poetry, py:topic:venv
## pyproject.toml
```text
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "my-tool"
version = "0.1.0"
dependencies = ["requests>=2"]
```
## Сборка
python -m build создаёт wheel (.whl) и sdist (.tar.gz); twine upload публикует их на PyPI. Стандартный модуль tomllib (3.11+) читает TOML.
```python
import tomllib
cfg = tomllib.loads('[project]\nname = "my-tool"\nversion = "0.1.0"\n')
print(cfg["project"]["name"], cfg["project"]["version"])
```
