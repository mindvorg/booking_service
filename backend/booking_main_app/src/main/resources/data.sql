-- Проверяем и вставляем пользователей
INSERT INTO "users" ("email", "password", "name", "role")
SELECT * FROM (VALUES
                   ('ivan.petrov@example.com', 'hashed_password_1', 'Иван Петров', 'USER'),
                   ('maria.sidorova@example.com', 'hashed_password_2', 'Мария Сидорова', 'USER'),
                   ('alexei.kozlov@example.com', 'hashed_password_3', 'Алексей Козлов', 'USER'),
                   ('anna.agent@example.com', 'hashed_password_4', 'Анна Иванова', 'AGENT'),
                   ('sergei.agent@example.com', 'hashed_password_5', 'Сергей Смирнов', 'AGENT')
              ) AS t(email, password, name, role)
WHERE NOT EXISTS (SELECT 1 FROM "users" LIMIT 1);

-- Проверяем и вставляем агентов
INSERT INTO "agents" ("user_id", "company_name", "avatar")
SELECT * FROM (VALUES (4, 'Агентство недвижимости "Северная Столица"', 'avatar_anna.jpg'),
                      (5, 'Real Estate Pro СПб', 'avatar_sergei.jpg'))
                  AS t(user_id, company_name, avatar)
WHERE NOT EXISTS (SELECT 1 FROM "agents" LIMIT 1);

-- Проверяем и вставляем квартиры
INSERT INTO "apartment" ("status", "address", "house_date", "floor", "square", "room_number", "price", "agent_id", "photo", "description", "district", "apart_type", "geotag")
SELECT * FROM (VALUES
                   ('свободно', 'Невский проспект, 45', 2020, 5, 75, 2, 18500000, 1, 'photo1.jpg', 'Просторная квартира в историческом центре с видом на канал', 'Центральный', 'квартира', '59.9350,30.3256'),
                   ('бронь', 'ул. Большая Морская, 15', 2019, 3, 65, 1, 12500000, 1, 'photo2.jpg', 'Уютная квартира с камином в центре города', 'Адмиралтейский', 'квартира', '59.9343,30.3061'),
                   ('свободно', 'Васильевский остров, 6-я линия, 23', 2021, 7, 85, 3, 21500000, 2, 'photo3.jpg', 'Светлая трехкомнатная квартира с ремонтом', 'Василеостровский', 'квартира', '59.9419,30.2821')
              ) AS t(status, address, house_date, floor, square, room_number, price, agent_id, photo, description, district, apart_type, geotag)
WHERE NOT EXISTS (SELECT 1 FROM "apartment" LIMIT 1);
