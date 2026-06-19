# Stage 1

## Introduction

This document contains the REST API design for a campus notification system. The main use of this system is to show notifications to students after they login. These notifications can be about placements, college events, results, or any general announcement.

## Assumptions

- User login and registration are already handled.
- The frontend will send the access token in the request header.
- One notification can be sent to one student or to many students.
- All API responses will be in JSON format.

## Common Headers

For normal API requests:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```


## Notification JSON Structure

This is the common notification object which the API can return:

```json
{
  "id": "notif_101",
  "title": "Placement drive scheduled",
  "message": "ABC Technologies placement drive is scheduled for Monday.",
  "type": "placement",
  "priority": "normal",
  "isRead": false,
  "createdAt": "2026-06-19T09:30:00Z",
  "readAt": null,
  "metadata": {
    "company": "ABC Technologies",
    "driveDate": "2026-06-22"
  }
}
```

## Core Actions

The notification system should mainly support these actions:

- Get all notifications of the logged-in user.
- Filter notifications by type and read status.
- Get unread notification count for badge display.
- Mark one notification as read.
- Mark all notifications as read.
- Create notification from admin/backend side.
- Archive a notification.
- Send new notifications in real time.

## API Endpoints

### 1. Get Notifications List

This API returns notifications of the logged-in user. Pagination is used because there can be many notifications.

```http
GET /api/v1/notifications?page=1&limit=10&type=placement&isRead=false
```

Request body:

No request body is required.

Response:

```json
{
  "data": [
    {
      "id": "notif_101",
      "title": "Placement drive scheduled",
      "message": "ABC Technologies placement drive is scheduled for Monday.",
      "type": "placement",
      "priority": "normal",
      "isRead": false,
      "createdAt": "2026-06-19T09:30:00Z",
      "readAt": null,
      "metadata": {
        "company": "ABC Technologies",
        "driveDate": "2026-06-22"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 34,
    "totalPages": 4
  }
}
```

### 2. Get Single Notification

This API returns details of one notification.

```http
GET /api/v1/notifications/notif_101
```

Request body:

No request body is required.

Response:

```json
{
  "id": "notif_101",
  "title": "Placement drive scheduled",
  "message": "ABC Technologies placement drive is scheduled for Monday.",
  "type": "placement",
  "priority": "normal",
  "isRead": false,
  "createdAt": "2026-06-19T09:30:00Z",
  "readAt": null,
  "metadata": {
    "company": "ABC Technologies",
    "driveDate": "2026-06-22"
  }
}
```

### 3. Get Unread Count

This API returns how many notifications are still unread. The frontend can use this number near the notification bell icon.

```http
GET /api/v1/notifications/unread-count
```

Request body:

No request body is required.

Response:

```json
{
  "unreadCount": 7
}
```

### 4. Mark Single Notification As Read

This API is called when the user opens or clicks a notification.

```http
PATCH /api/v1/notifications/notif_101/read
```

Request:

```json
{
  "isRead": true
}
```

Response:

```json
{
  "id": "notif_101",
  "isRead": true,
  "readAt": "2026-06-19T10:15:00Z",
  "message": "Notification marked as read"
}
```

### 5. Mark All Notifications As Read

This API marks all unread notifications as read for the current user.

```http
PATCH /api/v1/notifications/read-all
```

Request:

```json
{
  "type": "placement"
}
```

Here `type` is optional. If we do not send type, then all notifications can be marked as read.

Response:

```json
{
  "updatedCount": 5,
  "message": "Notifications marked as read"
}
```

### 6. Create Notification

This API is mainly used by admin or backend service to create a new notification.

```http
POST /api/v1/notifications
```

Request:

```json
{
  "title": "Semester result published",
  "message": "Your semester result is now available in the student portal.",
  "type": "result",
  "priority": "high",
  "target": {
    "userIds": ["user_101", "user_102"],
    "department": "CSE",
    "year": 3
  },
  "metadata": {
    "semester": 6,
    "resultUrl": "/results/semester-6"
  }
}
```

Response:

```json
{
  "id": "notif_205",
  "title": "Semester result published",
  "type": "result",
  "priority": "high",
  "createdAt": "2026-06-19T10:20:00Z",
  "message": "Notification created"
}
```

### 7. Archive Notification

This API can be used when the user wants to remove a notification from the visible list. It is better to archive instead of direct delete, so old data can still be kept.

```http
PATCH /api/v1/notifications/notif_101/archive
```

Request:

```json
{
  "isArchived": true
}
```

Response:

```json
{
  "id": "notif_101",
  "isArchived": true,
  "message": "Notification archived"
}
```

### 8. Real-Time Notifications

For real-time notifications, I would use Server-Sent Events. In this case, most messages are coming from server to frontend only, so SSE is enough and easier compared to WebSocket.

```http
GET /api/v1/notifications/stream
```

Headers:

```http
Authorization: Bearer <access_token>
Accept: text/event-stream
```

Server event:

```text
event: notification.created
data: {
  "id": "notif_205",
  "title": "Semester result published",
  "message": "Your semester result is now available in the student portal.",
  "type": "result",
  "priority": "high",
  "isRead": false,
  "createdAt": "2026-06-19T10:20:00Z"
}
```

Frontend side flow:

- After login, frontend opens the stream.
- When a new notification comes, add it on top of the list.
- Increase unread count.
- If stream disconnects, frontend can reconnect.
- If real-time does not work, frontend can call normal `GET /api/v1/notifications` again.

## Error Response Format

All APIs can follow this same error response format:

```json
{
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "message": "Notification not found"
  }
}
```

Common HTTP status codes:

- `200 OK` for successful reads and updates.
- `201 Created` when new notification is created.
- `400 Bad Request` for wrong request data.
- `401 Unauthorized` when token is missing or invalid.
- `403 Forbidden` when user does not have permission.
- `404 Not Found` when notification is not found.
- `500 Internal Server Error` for server side issue.

## Frontend Usage Notes

- Use `GET /api/v1/notifications` for the main list.
- Use `GET /api/v1/notifications/unread-count` to show badge count.
- Use `PATCH /api/v1/notifications/{id}/read` when notification is opened.
- Use SSE stream for live updates.
- Also refresh notifications once when page loads, because real-time connection may miss old notifications.

# Stage 2

## Database Choice

For this notification system, I would use PostgreSQL as the main database.

The reason is that notifications have proper relations. For example, one notification can be sent to many users, and every user can have their own read or unread status. This fits well in a relational database. PostgreSQL also supports `JSONB`, so we can store extra data like company name, result link, event date, etc. without creating too many separate columns.

So the main benefits are:

- It is reliable for important data.
- It supports relations between notifications and users.
- It supports indexes, which will help when data increases.
- `JSONB` can be used for flexible metadata.
- SQL queries are easy to understand and maintain.

## Database Schema

I am assuming that the `users` table already exists because login and registration are already handled. So here I am only showing the notification related tables.

### notifications table

This table stores the main notification content.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### notification_recipients table

This table stores which user received which notification. Read status and archive status are kept here because they are different for every user.

```sql
CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, user_id)
);
```

### Indexes

Indexes are needed because the frontend will mostly query notifications by user, read status, type, and latest created time.

```sql
CREATE INDEX idx_notification_recipients_user
ON notification_recipients(user_id);

CREATE INDEX idx_notification_recipients_user_read
ON notification_recipients(user_id, is_read);

CREATE INDEX idx_notifications_type_created
ON notifications(type, created_at DESC);

CREATE INDEX idx_notification_recipients_notification
ON notification_recipients(notification_id);
```

## How API Data Maps To DB

- `notifications` table stores common data like title, message, type, priority, metadata.
- `notification_recipients` stores user specific data like `is_read`, `read_at`, and `is_archived`.
- If one notification is sent to 100 students, the notification data is stored once, and 100 rows are added in `notification_recipients`.

This avoids storing the same title and message again and again for every student.

## SQL Queries

### 1. Get Notifications List

This query is for:

```http
GET /api/v1/notifications?page=1&limit=10&type=placement&isRead=false
```

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.type,
  n.priority,
  nr.is_read AS "isRead",
  nr.read_at AS "readAt",
  n.metadata,
  n.created_at AS "createdAt"
FROM notification_recipients nr
JOIN notifications n ON n.id = nr.notification_id
WHERE nr.user_id = :userId
  AND nr.is_archived = FALSE
  AND (:type IS NULL OR n.type = :type)
  AND (:isRead IS NULL OR nr.is_read = :isRead)
ORDER BY n.created_at DESC
LIMIT :limit OFFSET :offset;
```

### 2. Get Single Notification

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.type,
  n.priority,
  nr.is_read AS "isRead",
  nr.read_at AS "readAt",
  n.metadata,
  n.created_at AS "createdAt"
FROM notification_recipients nr
JOIN notifications n ON n.id = nr.notification_id
WHERE nr.user_id = :userId
  AND n.id = :notificationId
  AND nr.is_archived = FALSE;
```

### 3. Get Unread Count

This query is for the notification bell count.

```sql
SELECT COUNT(*) AS unread_count
FROM notification_recipients
WHERE user_id = :userId
  AND is_read = FALSE
  AND is_archived = FALSE;
```

### 4. Mark One Notification As Read

```sql
UPDATE notification_recipients
SET
  is_read = TRUE,
  read_at = NOW()
WHERE user_id = :userId
  AND notification_id = :notificationId;
```

### 5. Mark All Notifications As Read

If type is not passed, all notifications will be marked as read.

```sql
UPDATE notification_recipients nr
SET
  is_read = TRUE,
  read_at = NOW()
FROM notifications n
WHERE n.id = nr.notification_id
  AND nr.user_id = :userId
  AND nr.is_read = FALSE
  AND (:type IS NULL OR n.type = :type);
```

### 6. Create Notification

First insert the notification:

```sql
INSERT INTO notifications (
  title,
  message,
  type,
  priority,
  metadata,
  created_by
)
VALUES (
  :title,
  :message,
  :type,
  :priority,
  :metadata,
  :createdBy
)
RETURNING id;
```

Then insert recipients:

```sql
INSERT INTO notification_recipients (
  notification_id,
  user_id
)
SELECT
  :notificationId,
  id
FROM users
WHERE department = :department
  AND year = :year;
```

If exact user ids are sent:

```sql
INSERT INTO notification_recipients (
  notification_id,
  user_id
)
SELECT
  :notificationId,
  unnest(:userIds::uuid[]);
```

### 7. Archive Notification

```sql
UPDATE notification_recipients
SET is_archived = TRUE
WHERE user_id = :userId
  AND notification_id = :notificationId;
```

## Problems When Data Volume Increases

### 1. Notification list can become slow

If there are lakhs of notifications, listing notifications for a user can become slow.

Solution:

- Add indexes on `user_id`, `is_read`, and `created_at`.
- Use pagination.
- Avoid loading old notifications unless user asks for them.

### 2. Unread count can be calculated again and again

Counting unread notifications every time can become costly.

Solution:

- Keep proper index on `(user_id, is_read)`.
- If traffic is very high, store unread count in a separate user summary table or cache.

### 3. Sending one notification to many users can create many rows

For example, sending one event notification to all students can insert thousands of rows in `notification_recipients`.

Solution:

- Insert recipients in batches.
- Use background job for bulk notification creation.
- For very common announcements, we can store audience rules like department and year, and expand recipients slowly in background.

### 4. Real-time connection can increase server load

If many students are online, many SSE connections will stay open.

Solution:

- Keep SSE only for logged-in users.
- Use Redis Pub/Sub or a message queue between backend instances.
- Reconnect from frontend if connection breaks.
- Still keep normal REST API as fallback.

### 5. Old notifications will keep growing

Notification data will increase every semester.

Solution:

- Archive old notifications after some months.
- Keep only recent notifications in active queries.
- Move very old records to archive table if needed.

## Final DB Flow

When admin creates a notification, one row is added in `notifications`. Then rows are added in `notification_recipients` for all target students. When a student opens the notification page, API joins both tables and returns only that student's notifications. When the student reads or archives a notification, only the row in `notification_recipients` is updated.

This design is simple and should work well for a campus notification system.

# Stage 3

## Given Query

The slow query given is:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

## Is This Query Accurate?

This query is only partly correct.

If the database has one single `notifications` table where every notification row belongs to one student, then this query can return unread notifications for student `1042`.

But based on my Stage 2 design, this query is not fully accurate because I separated the data into two tables:

- `notifications` stores the actual notification message.
- `notification_recipients` stores which student got the notification and whether it is read or unread.

So in my design, `isRead` should not be inside the main `notifications` table. It should be in the recipient table because one student may read a notification and another student may not read the same notification.

Also, the query returns all unread notifications without any limit. That is the biggest issue when the data becomes large.

## Why This Query Is Slow?

The database has around `50,000` students and `5,000,000` notifications. So the table is very large.

This query can be slow because:

- It uses `SELECT *`, so it fetches all columns even if the frontend needs only a few.
- There is no pagination or `LIMIT`.
- It returns all unread notifications of the student.
- It sorts the records using `createdAt`.
- It shows oldest notifications first because of `ASC`, but usually latest notifications are more useful.
- If there is no proper index, the database may need to check a large number of rows.

## Better Query

If the database uses one simple `notifications` table, then I would change the query like this:

```sql
SELECT
  id,
  title,
  message,
  notificationType,
  createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt DESC
LIMIT 20;
```

I used `DESC` because normally latest notifications should be shown first. `LIMIT 20` is used for pagination.

For this query, a useful index will be:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

This index is useful because the query filters using `studentID` and `isRead`, and then sorts using `createdAt`.

## Query Based On My Stage 2 Design

In my Stage 2 design, the better query will use join:

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.type,
  n.priority,
  nr.is_read AS "isRead",
  n.created_at AS "createdAt"
FROM notification_recipients nr
JOIN notifications n ON n.id = nr.notification_id
WHERE nr.user_id = :studentId
  AND nr.is_read = false
  AND nr.is_archived = false
ORDER BY n.created_at DESC
LIMIT 20;
```

Useful indexes for this design:

```sql
CREATE INDEX idx_recipients_user_read_notification
ON notification_recipients(user_id, is_read, notification_id);

CREATE INDEX idx_notifications_created
ON notifications(created_at DESC);
```

## Likely Computation Cost

Without a proper index, the database may need to scan a large portion of the table before finding the required unread notifications.

After finding the matching rows, it also has to sort them by `createdAt`. Since there are around 50 lakh notifications, this can become slow as the data keeps increasing.

With a suitable composite index, the database can find the matching rows faster. Pagination also reduces the number of records returned in one API call.

## Should We Add Indexes On Every Column?

No. Adding indexes on every column is not a good idea.

Indexes improve read performance, but they also have disadvantages:

- They need extra storage.
- `INSERT`, `UPDATE`, and `DELETE` operations can become slower.
- Indexes also need to be updated whenever table data changes.
- Many indexes may never be used.
- Separate indexes on every column may not help for queries that use multiple columns together.

Instead of creating indexes on every column, it is better to create indexes only on columns that are frequently used in `WHERE`, `JOIN`, and `ORDER BY`.

Good index:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

This is better than creating separate indexes on every column.

## Query To Find Students Who Got Placement Notification In Last 7 Days

As per the question, if the table has `notificationType` column with enum values like `Event`, `Result`, and `Placement`, then the query can be:

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL '7 days';
```

Useful index for this query:

```sql
CREATE INDEX idx_notification_type_created
ON notifications(notificationType, createdAt);
```

If we also want some basic notification details:

```sql
SELECT
  studentID,
  id AS notificationId,
  title,
  createdAt
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL '7 days'
ORDER BY createdAt DESC;
```

For my Stage 2 normalized schema, the same query will be:

```sql
SELECT DISTINCT
  nr.user_id
FROM notification_recipients nr
JOIN notifications n ON n.id = nr.notification_id
WHERE n.type = 'placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

## Final Answer

The original query may work in a very simple table design, but it is not good for a large database. It should avoid `SELECT *`, use pagination, show latest notifications first, and use a proper composite index. Adding indexes on every column is not a good solution. Indexes should be added based on the queries that are actually used often.

# Stage 6

## Priority Inbox

In this stage, the requirement is to show the top important unread notifications first. The notification API gives notifications with `Type`, `Message`, `ID`, and `Timestamp`.

I used JavaScript for this because the frontend app is already in JavaScript.

The implementation file is:

```text
notification-app-fe/src/api/priorityNotifications.js
```

## Priority Logic

I used both notification type and recency to calculate priority.

Type weight:

- `Placement` = 3
- `Result` = 2
- `Event` = 1

Then I added a recency score. Newer notifications get more score than older notifications.

Basic idea:

```text
priority score = type weight + recency score
```

In the code, type weight is multiplied by `100` so that placement notifications stay more important than result and event notifications.

## Steps Used In Code

- Fetch notifications from the given API.
- Keep only unread notifications.
- Calculate priority score for each notification.
- Sort notifications by priority score.
- If two notifications have same score, show the latest one first.
- Return only top 10 notifications.

## How Top 10 Is Maintained

New notifications can keep coming. So instead of sorting the complete list again in the UI manually, I added a helper function:

```text
addNotificationToPriorityList(currentList, newNotification, limit)
```

This function adds the new notification to the current list, sorts it again using the same priority logic, and keeps only top 10.

For this small test, sorting the list is simple and easy to understand. If the number of notifications becomes very large, then we can use a min heap to maintain only top 10 efficiently. But for this stage, the simple approach is enough.

## API Used

```http
GET http://4.224.186.213/evaluation-service/notifications
```

The API is protected, so the code sends the token in the `Authorization` header when token is available.

## Logging

I used the logging middleware while fetching and preparing the priority inbox. Logs are added for:

- Fetching notifications for priority inbox.
- Error while fetching notifications.
- Priority inbox prepared successfully.
