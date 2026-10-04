# id: err:ZeroDivisionError
kind: error
title: ZeroDivisionError
exception: ZeroDivisionError
category: Арифметика
level: 1
summary: Деление или взятие остатка по нулю.
tags: деление на ноль
## Причина
Делитель равен нулю.
## Неправильный код
```python
a = 10
b = 0
print(a / b)
```
## Исправленный код
```python
a = 10
b = 0
if b != 0:
    print(a / b)
else:
    print("Делить на ноль нельзя")
```
## Объяснение
Деление на ноль не определено, поэтому Python бросает исключение.
