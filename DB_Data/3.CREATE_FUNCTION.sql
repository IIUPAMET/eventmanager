CREATE OR REPLACE FUNCTION event_countdown_message(event_id uuid)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  name        TEXT;
  time_left        INTERVAL;
BEGIN
  SELECT
    e.name,
    age(date_trunc('day', e.start_time), date_trunc('day', now()))
  INTO name, time_left
  FROM "Event" e
  WHERE id = $1;
  RETURN 'Don''t forget! The event '|| ''''||name||''''|| ' will begin in '||time_left;
END
$$;

CREATE OR REPLACE FUNCTION "isFriends"(first_id uuid, second_id uuid)
  RETURNS boolean
LANGUAGE SQL
AS $$
SELECT EXISTS ((SELECT *
FROM "Relationship"
WHERE
recipient_friend_id in (first_id, second_id) AND
sender_friend_id in (first_id, second_id) AND
status = (SELECT id
   		FROM "Relation_Status"
		WHERE name = 'ACCEPTED')))
$$;


CREATE OR REPLACE FUNCTION delete_tag()
RETURNS trigger AS
$$
BEGIN
  DELETE 
  FROM "Tag"
  WHERE "id" = old.id;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrease_tag_count()
RETURNS trigger AS
$$
BEGIN
  UPDATE "Tag"
  SET count = count-1
  WHERE id = OLD.tag_id;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

create or replace function "customer_events"(_customer_id uuid, _from timestamp, _to timestamp)
  returns table(id uuid, name text, start_time timestamp, end_time timestamp, description text, visibility text, status text)
language sql
as $$
SELECT
  "Event".id              AS id,
  "Event".name            AS name,
  start_time,
  end_time,
  "Event".description     AS description,
  "Event_Visibility".name AS visibility,
  "Event_Status".name     AS status
FROM "Event"
  INNER JOIN "Event_Visibility"
    ON "Event".visibility = "Event_Visibility".id
  INNER JOIN "Event_Status"
    ON "Event".status = "Event_Status".id
WHERE creator_id = _customer_id
      AND "Event_Status".name = 'EVENT'
      and (start_time >= _from or end_time >= _from)
      and (start_time <= _to or end_time <= _to)
$$;


create or replace function "participates_events"(_customer_id uuid, _from timestamp, _to timestamp)
  returns table(id uuid, name text, start_time timestamp, end_time timestamp, description text, visibility text, status text)
language sql
as $$
SELECT
  "Event".id              AS id,
  "Event".name            AS name,
  start_time,
  end_time,
  "Event".description     AS description,
  "Event_Visibility".name AS visibility,
  "Event_Status".name     AS status
FROM "Event"
  INNER JOIN "Event_Status"
    ON status = "Event_Status".id
  INNER JOIN "Customer_Event"
    ON "Event".id = "Customer_Event".event_id
  INNER JOIN "Event_Visibility"
    ON "Event".visibility = "Event_Visibility".id
WHERE "Event_Status".name = 'EVENT'
      AND "Customer_Event".status = (SELECT id
                                     FROM "Customer_Event_Status"
                                     WHERE name = 'ACCEPTED')
      AND "Customer_Event".customer_id = _customer_id
      and (start_time >= _from or end_time >= _from)
      and (start_time <= _to or end_time <= _to)
$$;

create or replace function "timeline"(_customer_id uuid, _from timestamp, _to timestamp)
  returns table(date date, busy numeric, tentative numeric)
language sql
as $$
SELECT
  date,
  coalesce(sum(busy), 0)      as busy,
  coalesce(sum(tentative), 0) as tentative
FROM ((
        SELECT
          cast(start_time as date) "date",
          count(*) as              busy
        FROM customer_events(_customer_id, _from,_to)
        where visibility != 'PRIVATE'
        GROUP BY cast(start_time as date)

        UNION

        SELECT
          cast(start_time as date) "date",
          count(*) as              busy
        FROM participates_events(_customer_id, _from,_to)
        where visibility != 'PRIVATE'
        GROUP BY cast(start_time as date)
      )

      UNION ALL
      (
        SELECT
          cast(end_time as date) "date",
          count(*) as            busy
        FROM customer_events(_customer_id, _from,_to)
        WHERE visibility != 'PRIVATE'
        GROUP BY cast(end_time as date)

        UNION

        SELECT
          cast(end_time as date) "date",
          count(*) as            busy
        FROM customer_events(_customer_id, _from,_to)
        WHERE visibility != 'PRIVATE'
        GROUP BY cast(end_time as date)
      )
     ) AS PUBLIC_COUNT

  FULL OUTER JOIN

  (
    SELECT
      cast(start_time as date) "date",
      count(*) as              tentative
    FROM customer_events(_customer_id, _from,_to)
    where visibility = 'PRIVATE'
    GROUP BY cast(start_time as date)

    UNION ALL

    SELECT
      cast(end_time as date) "date",
      count(*) as            tentative
    FROM customer_events(_customer_id, _from,_to)
    WHERE visibility = 'PRIVATE'
    GROUP BY cast(end_time as date)
  ) AS PRIVATE_COUNT USING (date)
GROUP BY date
order by date;
$$;

create function "isFriendsByLogin"(current character varying, customer character varying)
  returns boolean
language sql
as $$
SELECT EXISTS ((SELECT *
                FROM "Relationship"
                WHERE
                  recipient_friend_id in ((SELECT id FROM "Customer" WHERE login = current), (SELECT id FROM "Customer" WHERE login = customer)) AND
                  sender_friend_id in ((SELECT id FROM "Customer" WHERE login = current), (SELECT id FROM "Customer" WHERE login = customer)) AND
                  status = (SELECT id
                            FROM "Relation_Status"
                            WHERE name = 'ACCEPTED')))
$$;

create function "isRequest"(current character varying, customer character varying)
  returns boolean
language sql
as $$
SELECT EXISTS ((SELECT *
                FROM "Relationship"
                WHERE
                  recipient_friend_id in ((SELECT id FROM "Customer" WHERE login = current), (SELECT id FROM "Customer" WHERE login = customer)) AND
                  sender_friend_id in ((SELECT id FROM "Customer" WHERE login = current), (SELECT id FROM "Customer" WHERE login = customer)) AND
                  status = (SELECT id
                            FROM "Relation_Status"
                            WHERE name = 'REQUEST')))
$$;
