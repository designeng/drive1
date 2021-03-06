##Создание endpoint'а
может происходить на уровне функции `getEndpoint` из `config/api`, где происходит замена фрагмента(-ов) в параметризованном роуте:
```
/items/cars/{brand}/models

let endpoint = getEndpoint('brandModels', {brand: brand.id})
```

##Request плагин

Получает на вход endpoint, который может быть строкой или массивом.
В случае строки - происходит обычный вызов.
Если передан массив, endpoint вычисляется так: элементы массива складываются по возрастанию, формируя строку. Как только оказывается, что элемент является простым объектом, его пары ключ-значение превращаются в параметры query и добавляются к строке.
Например, нам нужно получить endpoint `/items/test_drives?brand={brand.id}`:
```
let endpoint = [getEndpoint('testDrives'), {brand: brand.id}]
```
и далее в wire-спецификации:

```
testDrivesData: {
    request: {
        endpoint: {$ref: 'testDrivesEndpoint'}
    }
}
```

##TODO
Возможно, вычисление endpoint'а должно происходить <i>только</i> в request-плагине.