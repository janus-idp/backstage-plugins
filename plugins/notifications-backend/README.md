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

Request (User message and then system message):

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "targetUsers": ["jdoe"], "targetGroups": ["jdoe"], "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

Response:

```json
{ "msgid": "2daac6ff-3aaa-420d-b755-d94e54248310" }
```

### Get notifications

Page number starts at '1'. Page number '0' along with page size '0' means no paging.
User parameter is mandatory because it is needed for message status and filtering (read/unread).

Query parameters:

- pageSize. 0 means no paging.
- pageNumber. first page is 1. 0 means no paging.
- orderBy.
- orderByDirec. asc/desc
- user. name of user to retrieve notification for
- containsText. filter title and message containing this text (case insensitive)
- createdAfter. fetch notifications created after this point in time
- messageScope. all/user/system. fetch notifications intended for specific user or system notifications or both
- read. true/false (read/unread)

Request:

```bash
curl 'http://localhost:7007/api/notifications/notifications?user=loggedinuser&read=false&pageNumber=0&pageSize=0'
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

Query parameters:

- user. name of user to retrieve notification for
- containsText. filter title and message containing this text (case insensitive)
- createdAfter. fetch notifications created after this point in time
- messageScope. all/user/system. fetch notifications intended for specific user or system notifications or both
- read. true/false (read/unread)

Request:

```bash
curl http://localhost:7007/api/notifications/notifications/count?user=loggedinuser
```

Response:

```json
{ "count": "1" }
```

### Set notification as read/unread

Request:

```bash
curl -X PUT 'http://localhost:7007/api/notifications/notifications/read?messageID=48bbf896-4b7c-4b68-a446-246b6a801000&user=dummy&read=true'
```

Response: just HTTP status

## Users

A user the notifications are filtered for, all targetUsers or targetGroups must have corresponding entities created in the Catalog.
Refer [Backstage documentation](https://backstage.io/docs/auth/) for details.

For the purpose of development, there is `users.yaml` listing example data.

## Building a client for the API

We supply an Open API spec YAML file: openapi.yaml.
