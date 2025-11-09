ALTER TABLE "feedbacks"
    ADD FOREIGN KEY ("apart_id") REFERENCES "apartment" ("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "feedbacks"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "feedback_on_agent"
    ADD FOREIGN KEY ("agent_id") REFERENCES "agents" ("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "feedback_on_agent"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;