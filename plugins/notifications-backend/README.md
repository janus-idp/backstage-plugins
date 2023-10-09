# Notifications

Welcome to the Notifications backend plugin!

## Getting started

- Install [PostgresSQL DB](https://www.postgresql.org/download/)
- Configure Postgres for tcp/ip
  Open Postgres conf file for editing:

```bash
sudo vi /var/lib/pgsql/data/pg_hba.conf
```

Add this line:

```bash
host   all             postgres       127.0.0.1/32                          password
```

- Start Postgres server:

```bash
sudo systemctl enable --now postgresql.service
```

- Clone this repo
- Start this repo's backstage instance.

```
yarn start:backstage
```

A new DB will be created: backstage_plugin_notifications

- Create a table for messages. In order to login to Postgres use these command:

```bash
sudo su - postgres
psql
```

In the psql prompt use these commands for creating the table:

```sql
\c backstage_plugin_notifications
create table messages (id SERIAL, subject VARCHAR(255), body TEXT);
```

## REST API

### Posting a notification

Request:

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json"  -d '{"subject": "my first message", "body": "I have nothing to talk about"}'
```

Response:

```json
{ "status": "ok", "msgid": [{ "id": 1 }] }
```

### Get notifications

Request:

```bash
curl http://localhost:7007/api/notifications/notifications
```

Response:

```json
[
  {
    "id": 1,
    "subject": "my first message",
    "body": "I have nothing to talk about"
  },
  {
    "id": 2,
    "subject": "my second message",
    "body": "I still dont have anything to talk about"
  }
]
```

### Get count of notifications

Request:

```bash
curl http://localhost:7007/api/notifications/notifications/count
```

Response:

```json
{ "status": "ok", "count": "0" }
```
