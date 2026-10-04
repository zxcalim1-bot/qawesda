# id: quiz:basics:001
kind: quiz
type: output
category: basics
level: 1
q: Что выведет программа?
wrong: 3.5 1 | 4 1 | 3 1.0
## Код
```python
print(7 // 2, 7 % 2)
```
## Пояснение
// — целочисленное деление, % — остаток.

# id: quiz:basics:002
kind: quiz
type: type
category: basics
level: 1
q: Какой тип у выражения?
expr: 7 / 7
wrong: int | bool | str
## Пояснение
Оператор / всегда возвращает float.

# id: quiz:syntax:001
kind: quiz
type: error
category: syntax
level: 1
q: Какая ошибка возникнет?
wrong: TypeError | NameError | Ошибки нет
## Код
```python
a = [1, 2, 3]
print(a[3])
```
## Пояснение
Индексы списка из трёх элементов — 0, 1, 2.

# id: quiz:algo:001
kind: quiz
type: complexity
category: algorithms
level: 2
q: Какова сложность бинарного поиска в отсортированном массиве из n элементов?
options: O(log n) | O(n) | O(n log n) | O(1)
answer: 1
## Пояснение
Отрезок поиска каждый раз уменьшается вдвое.
