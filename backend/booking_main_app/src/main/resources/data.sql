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
SELECT * FROM (VALUES (4, 'Агентство недвижимости "Северная Столица"', 'https://booking-service.storage.yandexcloud.net/photos/b776a0a4-41db-4e5d-ba23-fa4dc0b64dc0.JPG'),
                      (5, 'Real Estate Pro СПб', 'https://booking-service.storage.yandexcloud.net/photos/c760dde6-c41a-4eff-ac78-39f10d36d43c.JPG'))
                  AS t(user_id, company_name, avatar)
WHERE NOT EXISTS (SELECT 1 FROM "agents" LIMIT 1);

-- Проверяем и вставляем квартиры
INSERT INTO "apartment" ("status", "address", "house_date", "floor", "square", "room_number", "price", "agent_id", "photo", "description", "district")
SELECT * FROM (VALUES
                   (1, 'Невский проспект, 45', 2020, 5, 75, 2, 18500000, 1, 'https://booking-service.storage.yandexcloud.net/photos/a26d5dcb-8204-4acc-a7b1-7d7dbe2d627c.jpg, https://booking-service.storage.yandexcloud.net/photos/69b70587-a604-4b41-a011-d8a06b1af639.jpg, https://booking-service.storage.yandexcloud.net/photos/917ef668-fb91-4386-9cf9-e5a43a59f64a.jpg, https://booking-service.storage.yandexcloud.net/photos/019d466c-31ab-4c30-88d7-ff3caa52505a.jpg', 'Просторная квартира в историческом центре с видом на канал', 'Центральный' ),
                   (0, 'ул. Большая Морская, 15', 2019, 3, 65, 1, 12500000, 1, 'https://booking-service.storage.yandexcloud.net/photos/6b8c06a0-76da-4f1f-991f-2322f359cd46.jpg, https://booking-service.storage.yandexcloud.net/photos/5fbc23da-16b9-4a64-87f0-f52536447836.jpg, https://booking-service.storage.yandexcloud.net/photos/727cdf73-f701-4034-969f-703a9a73f4e3.jpg', 'Уютная квартира с камином в центре города', 'Адмиралтейский' ),
                   (1, 'Васильевский остров, 6-я линия, 23', 2021, 7, 85, 3, 21500000, 2, 'https://booking-service.storage.yandexcloud.net/photos/002208b8-8da3-4c40-a1a7-1c54e7bb6940.jpg, https://booking-service.storage.yandexcloud.net/photos/1ff475a8-b375-4199-8bad-1abd6e98a826.jpg, https://booking-service.storage.yandexcloud.net/photos/95ccb8bf-ea66-489e-8936-9791fc9bfd16.jpg, https://booking-service.storage.yandexcloud.net/photos/828c3b1d-e914-414f-a5a1-9327b4466e2f.jpg', 'Светлая трехкомнатная квартира с ремонтом', 'Василеостровский')
              ) AS t(status, address, house_date, floor, square, room_number, price, agent_id, photo, description, district)
WHERE NOT EXISTS (SELECT 1 FROM "apartment" LIMIT 1);
