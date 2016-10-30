CREATE ROLE dev WITH LOGIN PASSWORD 'developer';

CREATE DATABASE paf WITH OWNER dev;

CREATE TABLE members (
    member_id       char(12) PRIMARY KEY,
    email           varchar (255),
    phone           varchar (255),
    last_activity   timestamp,
    created         timestamp,
    modified        timestamp
);

CREATE FUNCTION update_member_activity_timestamp () RETURNS TRIGGER AS
    $$
    BEGIN
        UPDATE members
        SET    last_activity = current_timestamp
        WHERE  member_id = NEW.member_id;
    END;
    $$
    LANGUAGE plpgsql;

CREATE TABLE options (
    option_id   serial PRIMARY KEY,
    title       varchar (255) UNIQUE NOT NULL
);

CREATE TABLE voting_systems (
    voting_system_id varchar (255) PRIMARY KEY,
    description text
);

INSERT INTO voting_systems (voting_system_id) VALUES ('instant runoff');

CREATE TABLE polls (
    poll_id         serial PRIMARY KEY,
    title           varchar (255) NOT NULL,
    description     text,
    voting_opens    timestamp DEFAULT current_timestamp,
    voting_closes   timestamp DEFAULT (current_timestamp + interval '7 days'),
    voting_system   varchar (255) DEFAULT 'instant runoff'
        REFERENCES voting_systems (voting_system_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    CONSTRAINT closes_after_opens CHECK (voting_closes > voting_opens)
);

CREATE TABLE polls_options (
    poll_id integer
        REFERENCES polls (poll_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    option_id integer
        REFERENCES options (option_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    PRIMARY KEY (poll_id, option_id)
);

CREATE TABLE votes (
    poll_id     integer,
    option_id   integer,
    rank        smallint,
    sealed      boolean,
    created     timestamp,
    modified    timestamp,
    member_id   char (12)
        REFERENCES members (member_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    UNIQUE (poll_id, option_id, member_id)
);

CREATE TRIGGER trg_member_activity_votes AFTER INSERT OR UPDATE OR DELETE
    ON votes
    EXECUTE PROCEDURE update_member_activity_timestamp();
