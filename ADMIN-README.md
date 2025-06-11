# Admin Endpoints Documentation

This document outlines the admin-only endpoints available in the SurveyPro application. These endpoints are protected by both authentication and admin authorization middleware.

## Authentication & Authorization

All admin endpoints require:
1. **Authentication**: Valid JWT token in the `Authorization` header (`Bearer <token>`)
2. **Admin Access**: User must have `admin: true` in their user profile

### Setting Admin Status

To make a user an admin, update their user document in the database:
```javascript
// Using MongoDB shell or database management tool
db.users.updateOne(
  { id: "user_id_here" },
  { $set: { admin: true } }
)
```

### Headers Required
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Admin Endpoints

### 1. Get All Users

**GET** `/admin/users`

Retrieve all users with pagination, search, and sorting capabilities.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search in fullname, email, id, or institution
- `sortBy` (optional): Field to sort by (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /admin/users?page=1&limit=25&search=john&sortBy=fullname&sortOrder=asc
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "users": [
      {
        "id": "user123",
        "fullname": "John Doe",
        "email": "john@example.com",
        "pointBalance": 150,
        "verified": true,
        "admin": false,
        // ... other user fields (password excluded)
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 123,
      "limit": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Make User Admin

**PATCH** `/admin/users/:userId/admin`

Grant or revoke admin privileges for a specific user.

#### Path Parameters
- `userId`: The user ID to update admin status for

#### Request Body
```json
{
  "adminStatus": true
}
```

#### Example Request
```bash
PATCH /admin/users/user123/admin
Content-Type: application/json

{
  "adminStatus": true
}
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "msg": "User granted admin privileges successfully",
  "data": {
    "userId": "user123",
    "fullname": "John Doe",
    "email": "john@example.com",
    "admin": true
  }
}
```

### 3. Get All Surveys (Admin Dashboard)

**GET** `/admin/surveys`

Retrieve all surveys with comprehensive filtering options for admin dashboard.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `userId` (optional): Filter by specific user ID
- `published` (optional): Filter by published status ('true' or 'false')
- `paid` (optional): Filter by payment status ('true' or 'false')
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `minPoints` (optional): Minimum points filter
- `maxPoints` (optional): Maximum points filter
- `search` (optional): Search in title or description
- `sortBy` (optional): Field to sort by (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /admin/surveys?published=true&paid=false&startDate=2024-01-01&page=1&limit=20
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "surveys": [
      {
        "_id": "survey_id",
        "title": "Customer Satisfaction Survey",
        "description": "Survey description",
        "published": true,
        "isPaid": false,
        "no_of_participants": 100,
        "filledCount": 45,
        "remainingSpots": 55,
        "user_id": {
          "fullname": "John Doe",
          "email": "john@example.com",
          "id": "user123",
          "pointBalance": 150
        },
        "payment": null,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSurveys": 45,
      "limit": 20,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "userId": "",
      "published": "true",
      "paid": "false",
      "startDate": "2024-01-01",
      "endDate": "",
      "minPoints": "",
      "maxPoints": "",
      "search": ""
    }
  }
}
```

### 4. Mark Survey as Paid

**POST** `/admin/surveys/:surveyId/mark-paid`

Mark a survey as paid and create a payment record. The payment amount is automatically calculated using the platform's base rate formula.

#### Payment Calculation Formula
```
Total Amount = BASE_RATE + (QUESTION_RATE × Number of Questions) + (PARTICIPANT_RATE × Number of Participants)

Where:
- BASE_RATE = ₦2,000
- QUESTION_RATE = ₦10 per question
- PARTICIPANT_RATE = ₦40 per participant

Points per user = ceil((QUESTION_RATE × Number of Questions + PARTICIPANT_RATE × Number of Participants) / Number of Participants)
```

#### Path Parameters
- `surveyId`: The survey ID to mark as paid

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Example Request
```bash
POST /admin/surveys/survey123/mark-paid
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "msg": "Survey marked as paid successfully",
  "data": {
    "surveyId": "survey123",
    "surveyTitle": "Customer Satisfaction Survey",
    "amount": 2500,
    "calculationBreakdown": {
      "baseRate": 2000,
      "questionsCost": 100,
      "participantsCost": 400,
      "totalQuestions": 10,
      "totalParticipants": 10,
      "pointsPerUser": 50
    },
    "referenceNumber": "ADMIN_1642234567890_abc123def",
    "paymentDate": "2024-01-15T10:30:00Z",
    "userEmail": "john@example.com"
  }
}
```

### 5. Unpublish Survey

**PATCH** `/admin/surveys/:surveyId/unpublish`

Unpublish a survey and optionally provide a reason.

#### Path Parameters
- `surveyId`: The survey ID to unpublish

#### Request Body
```json
{
  "reason": "Survey violates platform guidelines"
}
```

#### Example Request
```bash
PATCH /admin/surveys/survey123/unpublish
Content-Type: application/json

{
  "reason": "Survey violates platform guidelines"
}
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "msg": "Survey unpublished successfully",
  "data": {
    "surveyId": "survey123",
    "title": "Customer Satisfaction Survey",
    "published": false,
    "unpublishedAt": "2024-01-15T10:30:00Z",
    "unpublishReason": "Survey violates platform guidelines",
    "owner": {
      "id": "user123",
      "fullname": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 6. Get All Redemptions

**GET** `/admin/redemptions`

Retrieve all redemption history records with filtering and pagination.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status ('pending', 'successful', 'failed')
- `type` (optional): Filter by type ('airtime', 'data')
- `network` (optional): Filter by network name
- `userId` (optional): Filter by specific user ID
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `sortBy` (optional): Field to sort by (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /admin/redemptions?status=successful&type=airtime&page=1&limit=20
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "redemptions": [
      {
        "_id": "redemption_id",
        "userId": "user123",
        "type": "airtime",
        "network": "MTN",
        "phoneNumber": "1234567890",
        "pointsRedeemed": 100,
        "valueReceived": 50,
        "status": "successful",
        "createdAt": "2024-01-15T10:30:00Z",
        "userId": {
          "fullname": "John Doe",
          "email": "john@example.com",
          "id": "user123"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRedemptions": 45,
      "limit": 20,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "successful",
      "type": "airtime",
      "network": "",
      "userId": "",
      "startDate": "",
      "endDate": ""
    }
  }
}
```

### 7. Get Redemption Statistics

**GET** `/admin/redemptions/stats`

Get comprehensive statistics about redemptions including counts by status, overall metrics, and breakdowns.

#### Query Parameters
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `userId` (optional): Get stats for specific user

#### Example Request
```bash
GET /admin/redemptions/stats?startDate=2024-01-01&endDate=2024-01-31
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "statusCounts": {
      "total": 250,
      "successful": 200,
      "pending": 25,
      "failed": 25
    },
    "overallStats": {
      "totalPointsRedeemed": 25000,
      "totalValueRedeemed": 12500,
      "avgPointsPerRedemption": 100,
      "avgValuePerRedemption": 50
    },
    "typeBreakdown": [
      {
        "_id": "airtime",
        "count": 150,
        "totalPoints": 15000,
        "totalValue": 7500
      },
      {
        "_id": "data",
        "count": 100,
        "totalPoints": 10000,
        "totalValue": 5000
      }
    ],
    "networkBreakdown": [
      {
        "_id": "MTN",
        "count": 100,
        "totalPoints": 10000,
        "totalValue": 5000
      },
      {
        "_id": "Airtel",
        "count": 80,
        "totalPoints": 8000,
        "totalValue": 4000
      }
    ],
    "filters": {
      "userId": "",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

### 8. Get User's Redemption History

**GET** `/admin/users/:userId/redemptions`

Get detailed redemption history for a specific user.

#### Path Parameters
- `userId`: The user ID to get redemption history for

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status ('pending', 'successful', 'failed')
- `type` (optional): Filter by type ('airtime', 'data')
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `sortBy` (optional): Field to sort by (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /admin/users/user123/redemptions?status=successful&page=1&limit=10
```

#### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "user": {
      "fullname": "John Doe",
      "email": "john@example.com",
      "id": "user123",
      "pointBalance": 150
    },
    "redemptions": [
      {
        "_id": "redemption_id",
        "userId": "user123",
        "type": "airtime",
        "network": "MTN",
        "phoneNumber": "1234567890",
        "pointsRedeemed": 100,
        "valueReceived": 50,
        "status": "successful",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "userStats": {
      "totalRedemptions": 15,
      "totalPointsRedeemed": 1500,
      "totalValueRedeemed": 750,
      "successfulRedemptions": 12,
      "pendingRedemptions": 2,
      "failedRedemptions": 1
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRedemptions": 15,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "successful",
      "type": "",
      "startDate": "",
      "endDate": ""
    }
  }
}
```

## Error Responses

### Authentication Required (401)
```json
{
  "status": "failure",
  "code": 401,
  "msg": "Authentication required"
}
```

### Admin Access Required (403)
```json
{
  "status": "failure",
  "code": 403,
  "msg": "Admin access required"
}
```

### User Not Found (404)
```json
{
  "status": "failure",
  "code": 404,
  "msg": "User not found"
}
```

### Server Error (500)
```json
{
  "status": "failure",
  "code": 500,
  "msg": "Internal server error"
}
```

## Usage Examples

### JavaScript/Node.js Example
```javascript
const adminToken = 'your_admin_jwt_token';

// Get all users
const getAllUsers = async () => {
  try {
    const response = await fetch('/admin/users?page=1&limit=50', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get redemption stats
const getRedemptionStats = async () => {
  try {
    const response = await fetch('/admin/redemptions/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### cURL Examples

#### Get all users
```bash
curl -X GET "http://localhost:5000/admin/users?page=1&limit=25" \
  -H "Authorization: Bearer your_admin_jwt_token" \
  -H "Content-Type: application/json"
```

#### Get redemption stats with date filter
```bash
curl -X GET "http://localhost:5000/admin/redemptions/stats?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer your_admin_jwt_token" \
  -H "Content-Type: application/json"
```

#### Get user's redemption history
```bash
curl -X GET "http://localhost:5000/admin/users/user123/redemptions?status=successful" \
  -H "Authorization: Bearer your_admin_jwt_token" \
  -H "Content-Type: application/json"
```

## Security Notes

1. **Admin Access Control**: Only users with `admin: true` can access these endpoints
2. **JWT Authentication**: All requests must include a valid JWT token
3. **Password Exclusion**: User data returned excludes password fields for security
4. **Rate Limiting**: Consider implementing rate limiting for admin endpoints in production
5. **Audit Logging**: Consider adding audit logs for admin actions

## Database Schema Updates

### User Model
The user model now includes an `admin` field:
```javascript
admin: {
  type: Boolean,
  default: false
}
```

This field determines whether a user has admin privileges to access these endpoints. 