# id: py:builtin:sorted
kind: builtin
category: Встроенные функции
title: sorted()
summary: Возвращает новый отсортированный список из элементов итерируемого объекта.
sig: sorted(iterable, /, *, key=None, reverse=False)
check: sorted
tags: сортировка, sort, упорядочить
related: py:method:list.sort, algo:sorting
## Пример
```python
print(sorted([3, 1, 2]))
print(sorted("банан"))
print(sorted(["bb", "a", "ccc"], key=len, reverse=True))
```
