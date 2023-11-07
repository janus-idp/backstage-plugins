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

A notification without users or groups is considered a system notification. That means it is is intended for all users.

Request:

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "targetUsers": ["jdoe"], "targetGroups": ["jdoe"], "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

Response:

```json
{ "msgid": "2daac6ff-3aaa-420d-b755-d94e54248310" }
```

### Get notifications

Page number starts at '1'. Page number '0' along with page size '0' means no paging.
User parameter is mandatory because it is needed for message status and filtering (read/unread).

Request:

```bash
curl 'http://localhost:7007/api/notifications/notifications?user=loggedinuser&pageNumber=0&pageSize=0'
```

Response:

```json
[
  {
    "id": "2daac6ff-3aaa-420d-b755-d94e54248310",
    "created": "2023-10-30T13:48:34.931Z",
    "isSystem": false,
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

User parameter is mandatory because it is needed for filtering (read/unread).

Request:

```bash
curl http://localhost:7007/api/notifications/notifications/count?user=loggedinuser
```

Response:

```json
{ "count": "1" }
```
