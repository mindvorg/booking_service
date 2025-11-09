ALTER TABLE "apartment"
    ADD FOREIGN KEY("agent_id") REFERENCES "agents"("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;