# Comment Management System Backend

> A production-grade, full-featured comment system backend built with the MERN stack (MongoDB, Express, React, Node.js), TypeScript, and Socket.io.

## 📖 Overview

This backend service provides a robust API for handling comments, nested replies, and user reactions (likes/dislikes), similar to platforms like YouTube or Reddit. It is designed with scalability, security, and performance in mind, featuring a layered architecture (Controller-Service-Repository) and real-time capabilities.

## ✨ Key Features

- **Robust Authentication**: Supports both JWT Bearer tokens and HTTP-only cookies.
- **Advanced Commenting**:
  - CRUD operations for comments.
  - Support for nested replies (threaded discussions).
  - Pagination and sorting (Newest, Most Liked, Most Disliked).
- **Reaction System**:
  - Scalable "Like" and "Dislike" functionality.
  - Uses a dedicated `reactions` collection with unique compound indexes to prevent race conditions and ensure data integrity.
  - transactional updates for accurate count maintenance.
- **Real-time Updates**:
  - Powered by **Socket.io**.
  - Instant reflection of new comments, edits, deletions, and reactions across all connected clients.
- **Security First**:
  - Implements **Helmet** for secure HTTP headers.
  - Rate limiting on sensitive routes.
  - Data sanitization against XSS and NoSQL injection attacks.
- **Validation**: Strict centralized request validation using **Zod**.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/comment-system-backend.git
    cd comment-system-backend
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    PORT=4000
    MONGO_URI=mongodb://localhost:27017/comment-db
    jwt_secret=your_super_secret_key
    AUTH_MODE=bearer # or 'cookie'
    CORS_ORIGIN=http://localhost:5173
    ```

### Running the Application

**Development Mode** (with hot-reload):

```bash
npm run dev
```

**Production Build**:

```bash
npm run build
npm start
```

### Running Tests

Execute the test suite using Jest:

```bash
npm test
```

## 📂 Project Structure

```
src/
├── config/         # Environment variables and configuration
├── controllers/    # Request handlers (input parsing, response formatting)
├── middleware/     # Auth, Validation, Rate Limiting, Error Handling
├── models/         # Mongoose Schemas/Models
├── repositories/   # Database access layer (DAL)
├── routes/         # API Route definitions
├── services/       # Business logic
├── sockets/        # Socket.io event handlers
├── types/          # TypeScript type definitions
├── utils/          # Helper functions (Async wrapper, AppError, etc.)
└── validators/     # Zod schemas for request validation
```

## 🔌 API Documentation

### Authentication

| Method | Endpoint             | Description                              |
| :----- | :------------------- | :--------------------------------------- |
| `POST` | `/api/auth/register` | Register a new user                      |
| `POST` | `/api/auth/login`    | Log in and receive token/cookie          |
| `POST` | `/api/auth/logout`   | Clear auth cookie (if in cookie mode)    |
| `GET`  | `/api/auth/me`       | Get current user profile (Auth required) |

### Comments

| Method   | Endpoint                      | Description                                                                    |
| :------- | :---------------------------- | :----------------------------------------------------------------------------- |
| `GET`    | `/api/comments`               | List comments. Query params: `entityId`, `entityType`, `sort`, `page`, `limit` |
| `POST`   | `/api/comments`               | Create a new comment. Body: `{ content, entityId, entityType, parentId? }`     |
| `PATCH`  | `/api/comments/:id`           | Update comment content (Auth + Owner only)                                     |
| `DELETE` | `/api/comments/:id`           | Delete comment and its descendants (Auth + Owner only)                         |
| `POST`   | `/api/comments/:id/reactions` | React to a comment. Body: `{ action: "like" \| "dislike" \| "clear" }`         |

### Sorting Options

- `newest`: Sort by creation date (descending)
- `mostLiked`: Sort by like count (descending)
- `mostDisliked`: Sort by dislike count (descending)

## ⚡ Real-time Events (Socket.io)

Clients can join a room identified by `${entityType}:${entityId}` to receive updates.

- `comment:create` -> Payload: `CommentDTO`
- `comment:update` -> Payload: `CommentDTO`
- `comment:delete` -> Payload: `{ deletedIds: string[] }`
- `comment:reaction` -> Payload: `{ _id, likeCount, dislikeCount, myReaction }`

## 🔒 Security Measures

- **Sanitization**: Middleware uses `express-mongo-sanitize` to prevent query injection and `xss` to sanitize HTML input.
- **Rate Limiting**: Applied to auth routes to prevent brute-force attacks.
- **Helmet**: Secures HTTP headers.
- **Authorization**: Strict ownership checks for update/delete operations.

# comment-management-backend
