##Создание endpoint'а:

Замена фрагмента(-ов) в параметризованном роуте:
```
/items/cars/{brand}/models

getEndpoint('brandModels', {brand: brand.id})
```

Передача параметров в query:
```
/items/test_drives?brand={brand.id}

[getEndpoint('testDrives'), {brand: brand.id}]
```
