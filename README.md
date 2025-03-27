# SurveyPro


## Introduction

API Routes for Surveypro

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.      

- MongoDB set up and running.

- Git (for cloning the repository).

## Installation

1. Clone the repository:

   ```shell

   git clone https://github.com/okikiareo/surveypro.git 

   git branch -m main backend 

2. Install dependencies

    npm install

## Configuration

1. Create a .env file in the project root and configure your Mongodb connection. Also, add the port on which you want the server to listen to (optional, server listen to 5000 by default)

    MONGODB_URI = your_mongodb-uri

    PORT = your_port_value

## Running the API

To start the API Locally, run:

npm start

Your API will be accessible at `http://localhost:PORT`

## API Full Documentation

## Examples
Here are some examples on how to use the API:

## Authentication

### Login a user

POST /login

Content-Type: application/json

.Request:

    {
        "email": "test@gmail.com",
        "password": "1234"
    }

Redirect url is to /verification page by default. Except if verified then will redirect somewhere else.

.Response:

    user_data should look like this: 
    {
      "notification_settings": {
        "email": [],
        "push_notification": []
      },
      "pointBalance": 0,
      "_id": "663643b079c52919d22753ac",
      "id": "100526437312614893169",
      "__v": 0,
      "createdAt": "2024-05-04T14:18:24.796Z",
      "email": "akinluaolorunfunminiyi@gmail.com",
      "fullname": "Olorunfunminiyi Akinlua",
      "type": "Google",
      "updatedAt": "2024-09-08T20:20:56.611Z",
      "verified": false,
      "code": 9837
    }

    {
        status: "success",
        code: 200,
        msg: "User successfully logged in",
        data: {
            redirectUrl: "redirectUrl",
            user: user_data
        }
    }
#### Error handling
.Error-Response:

If user is not Found or password is invalid

    {
        status: "failure",
        code: 404,
        msg: "Invalid credentials"
    }

If the user uses a normal login but registered with either Facebook or Google

    {
        status: "failure",
        code: 400,
        msg: "User test@gmail.com uses Google Login`
    }

### Post a new User

POST /register

Content-Type: application/json

Every other field are required except instituition.

.Request:

    {
        "first_name": "test"
        'last_name": "user"
        "email": "test@gmail.com",
        "instituition": "elect"
        "password": "1234",
        "confirm_password": "1234",

    }

Redirect url is to /verification page by default. Except if verified then will redirect somewhere else.

.Response:

    {
        status: "success",
        code: 201,
        msg: "User successfully created and signed in",
        data: {
            redirectUrl: redirectUrl,
            user: user_data

        }
    }

#### Error handling
.Error-Response:
If password or confirm password is empty

    {
        status: "failure",
        code: 400,
        msg: "You must fill in a password"
    }

If passwords does not match

    {
        status: "failure",
        code: 400,
        msg: "The passwords does not match"
    }

If user exists

    {
        status: "failure",
        code: 400,
        msg: "User exists"
    }
    

### Check if a user is Logged in

GET /isLoggedIn

.Response:

    {
        status: "success",
        code: 200,
        msg: "User is Logged in",
        data: {
            isLoggedIn: true,
        }
    }

#### Error handling
.Error-Response:

If user is not logged in

    {
        status: "failure",
        code: 401,
        msg: "User is not Logged in",
        data: {
            isLoggedIn: false,
        }
    }

If an error occured
    {
        status: "failure",
        code: 401,
        msg: "An Error Occured: User is not Logged in",
        data: {
            isLoggedIn: false,
            error: error
        }
    }

If the code provided does not match what is in db it returns a 400 Bad Request

    {
        status: "failure",
        code: 400,
        msg: "OTP invalid or expired"
    }

### verify code
POST /verify

Content-Type: application/json

.Request:

    {
        "code": "2345"
    }

.Response:

    {
        status: "success",
        code: 200,
        msg: "User verified"
    }

#### Error handling
.Error-Response:

If user is already verified it returns a 400 Bad Request

    {
        status: "failure",
        code: 400,
        msg: "User verified"
    }

If the code provided does not match what is in db it returns a 400 Bad Request

    {
        status: "failure",
        code: 400,
        msg: "OTP invalid or expired"
    }

### Google Login
GET /auth/google

Content-Type: application/json

.Response:

    {
        status: "success",
        code: 200,
        msg: "User successfully logged in",
        data: {
            redirectUrl: redirectUrl,
            user: user_data
        }
    }

Fix in the route to the href. It logins in the user with google account and redirect to either verification page or home.

#### Error handling
.Error-Response:

If an error occured with login for example duplicate email found in db.

    {
        status: "failure",
        code: 400,
        msg: "Duplicate Value entered for email field, please choose another value"
    }
    
If the google login fails to work, it redirects back to /login page with query parameter /login?error='error message'

### Logout Route

GET /auth/logout

.Response:

    {
        status: "success",
        code: 200,
        msg: "Successfully logged out"
    }



## General Error Responses
For each route. The following error should be put in mind as well

#### HTTP Status: 404 Not Found
Content-Type: application/json

If a page or route does not exist

. Body: 

    { 
        status: "failure",
        code: 404,
        msg: "Page Not Found"
    }
    
Cast error: If the user or item is not found in the database.

. Body: 

    { 
        status: "failure",
        code: 404,
        msg: "No item found with id 000"
    }

#### HTTP Status: 400 Bad Request
Content-Type: application/json

Validation error: if there was an error with your input such as not providing a name you will receive a similar error to the one below with the exact problem

. Body: 

    {
        status: "failure",
        code: 400,
        msg: "Validation Error: must provide a name"
    }

Duplicate error: If for example an input with with same email or field in the db already. The below error occurs

. Body: 

    {
        status: "failure",
        code: 400,
        msg: "Duplicate Value entered for email field, please choose another value"
    }
    

#### HTTP Status: 500 Internal Server Error
Content-Type: application/json

If there was any other error with the server, you will get the below error

.Body:

    {
        status: "failure",
        code: 500,
        msg: "An error Occured"
    }

# Survey System API

This API provides endpoints for creating and managing surveys, questions, and participant responses.

## AI-Powered Questionnaire Upload

This system includes an AI-powered feature that allows survey creators to upload questionnaire documents (PDF, DOCX, DOC, TXT) and automatically extract questions into their survey.

### How It Works

1. First, create a survey using the `/surveys` endpoint.
2. Then, upload a questionnaire document using the `/surveys/:surveyId/upload-questionnaire` endpoint.
3. The system will use Google's Gemini AI to analyze the document and extract questions.
4. Extracted questions will be automatically added to your survey.

### Supported Question Types

The AI can identify and extract these question types:

- **Multiple Choice Questions** (`multiple_choice`): Questions with specific answer options
- **Rating Questions** (`five_point`): Scale questions with ratings from 1 to 5
- **Open-Ended Questions** (`fill_in`): Questions that require text responses

### API Usage

To upload a questionnaire document:

```
POST /surveys/:surveyId/upload-questionnaire
Content-Type: multipart/form-data

file: [Your questionnaire document file]
```

#### Response

```json
{
  "status": "success",
  "code": 200,
  "msg": "5 questions successfully added to survey from uploaded document",
  "survey": { ... }
}
```

### Technical Details

- Maximum file size: 5MB
- Supported file types: PDF, DOCX, DOC, TXT
- PDF and TXT files are sent directly to the Gemini AI for better analysis
- For other formats, extracted text is sent to the AI

## Environment Setup

Ensure you have the following environment variables set:

```
GEMINI_API_KEY=your_gemini_api_key
```

## Dependencies

- @google/generative-ai: For AI-powered question extraction
- multer: For file uploads
- pdf-parse: For PDF text extraction
- docx-parser: For DOCX text extraction
