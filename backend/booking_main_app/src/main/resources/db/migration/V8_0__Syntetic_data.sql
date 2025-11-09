-- V8_1__Insert_test_data.sql

-- Вставка пользователей
INSERT INTO "users" ("email", "password", "name", "role")
VALUES ('ivan.petrov@example.com', 'hashed_password_1', 'Иван Петров', 'user'),
       ('maria.sidorova@example.com', 'hashed_password_2', 'Мария Сидорова', 'user'),
       ('alexei.kozlov@example.com', 'hashed_password_3', 'Алексей Козлов', 'user'),
       ('anna.agent@example.com', 'hashed_password_4', 'Анна Иванова', 'agent'),
       ('sergei.agent@example.com', 'hashed_password_5', 'Сергей Смирнов', 'agent');

-- Вставка агентов (используем пользователей с ролью agent)
INSERT INTO "agents" ("user_id", "company_name", "avatar")
VALUES (4, 'Агентство недвижимости "Северная Столица"', 'avatar_anna.jpg'),
       (5, 'Real Estate Pro СПб', 'avatar_sergei.jpg');

-- Вставка квартир для агента 1 (Анна Иванова)
INSERT INTO "apartment" ("status", "address", "house_date", "floor", "square", "room_number", "price", "agent_id",
                         "photo", "description", "district", "apart_type", "geotag")
VALUES ('свободно', 'Невский проспект, 45', 2020, 5, 75, 2, 18500000, 1, 'photo1.jpg',
        'Просторная квартира в историческом центре с видом на канал', 'Центральный', 'квартира', '59.9350,30.3256'),
       ('бронь', 'ул. Большая Морская, 15', 2019, 3, 65, 1, 12500000, 1, 'photo2.jpg',
        'Уютная квартира с камином в центре города', 'Адмиралтейский', 'квартира', '59.9343,30.3061');

-- Вставка квартир для агента 2 (Сергей Смирнов)
INSERT INTO "apartment" ("status", "address", "house_date", "floor", "square", "room_number", "price", "agent_id",
                         "photo", "description", "district", "apart_type", "geotag")
VALUES ('свободно', 'Васильевский остров, 6-я линия, 23', 2021, 7, 85, 3, 21500000, 2, 'photo3.jpg',
        'Светлая трехкомнатная квартира с ремонтом', 'Василеостровский', 'квартира', '59.9419,30.2821')