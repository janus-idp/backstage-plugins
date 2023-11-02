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

## REST API

### Posting a notification

Request:

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "targetUsers": ["jdoe"], "targetGroups": ["jdoe"], "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

Response:

```json
{ "msgid": "2daac6ff-3aaa-420d-b755-d94e54248310" }
```

### Get notifications

Request:

```bash
curl 'http://localhost:7007/api/notifications/notifications?pageNumber=0&pageSize=0'
```

Response:

```json
[
  {
    "id": "2daac6ff-3aaa-420d-b755-d94e54248310",
    "created": "2023-10-30T13:48:34.931Z",
    "readByUser": false,
    "origin": "my-origin",
    "title": "My title",
    "message": "I have nothing to tell",
    "topic": "my-topic",
    "actions": []
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
{ "count": "1" }
```
