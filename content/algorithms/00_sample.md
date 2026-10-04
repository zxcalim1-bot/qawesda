# id: algo:digits
kind: algorithm
category: Математика
title: Цифры числа
summary: Разбор числа на цифры: n % 10 и n // 10.
level: beginner
complexity: O(log n)
## Теория
Последняя цифра — остаток от деления на 10.
## Шаблон
```python
n = 9876
while n > 0:
    print(n % 10)
    n //= 10
```
