# booking_service

## ЛОГИН
/auth/login - POST = логин (БЕЗ ТОКЕНА)
/auth/logout - GET = выход из аккаунта (на клиенте удаляем токен, на бекенде удаляем токен)

## ПОЛЬЗОВАТЕЛИ
/users/registration - POST = регистрация (БЕЗ ТОКЕНА) 
/users/edit - PATCH = редактирование своего профиля {
	токен:
	id: 
	данные которые хотим изменить:
} (С ТОКЕНОМ)
/users/all = - GET список пользователей (ТОЛЬКО ДЛЯ АДМИНА + ТОКЕН)
/users/agents/all = - GET список агентов (БЕЗ ТОКЕНА)
/users/agents/{id} - GET = {
	  "role": "USER",
    "name": "7",
    "email": "7",
} = данные о юзере (агент/пользователь) (БЕЗ ТОКЕНА)
/users/agents/feedback/{id} - GET = список отзывов на данного агента (БЕЗ ТОКЕНА)
/users/agents/feedback/add - POST = добавление отзыва на агента (С ТОКЕНОМ)

## КВАРТИРЫ
/apartments/all - GET = получить список всех квартир (БЕЗ ТОКЕНА)
/apartments/{id} - GET PATCH DELETE = получить данные о кв/изменить кв/удалить кв(БЕЗ ТОКЕНА, С ТОКЕНОМ + РОЛЬ АГЕНТ, С ТОКЕНОМ + РОЛЬ АГЕНТ)
/apartments/add - POST = добавление квартиры (С ТОКЕНОМ + РОЛЬ АГЕНТ)

### ФИЛЬТРАЦИЯ
/apartments/search?
1. agentId={id} - по агенту
2. status={0 или 1} - покупка или аренда
3. district={string} - по району
4. minSquare + maxSquare={Integer+Integer} - по площади от и до
5. minRooms + maxRooms={Integer+Integer} - по количеству комнат от и до
6. minFloor + maxFloor={Integer+Integer} - по этажу от и до
7. minPrice + maxPrice={Integer+Integer} - по цене от и до
8. minHouseDate + maxHouseDate={Integer+Integer} - по году постройки от и до
### СОРТИРОВКА
1. по цене sort=DESC or ASC

http://localhost:8080/apartments/search?minPrice=12500001&minRooms=3&sort=ASC&maxHouseDate=2025&district=купчино&status=0


/apartments/feedback/{id} - GET = список отзывов на данную квартиру (БЕЗ ТОКЕНА)
/apartments/feedback/add - POST = добавление отзыва на квартиру (С ТОКЕНОМ)

## ФОТО
/foto/upload - POST = добавление списка фото (С ТОКЕНОМ)
/foto/delete - DELETE = удаление списка фото (С ТОКЕНОМ + РОЛЬ НЕ USER)


## АДМИН
/admin/changeRole - PATCH = изменение роли для любого пользователя по его id (ТОЛЬКО ДЛЯ АДМИНА + ТОКЕН)

