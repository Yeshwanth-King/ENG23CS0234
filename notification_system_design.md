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
