# surveypro


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

    {
        status: "success",
        code: 200,
        msg: "User successfully logged in",
        data: {
            redirectUrl: "redirectUrl"
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

Every other field are required except department.

.Request:

    {
        "first_name": "test"
        'last_name": "user"
        "email": "test@gmail.com",
        "department": "elect"
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
            redirectUrl: redirectUrl
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

Fix in the route to the href. It logins in the user with google account and redirect to either verification page or home.

#### Error handling
If an error occured it redirects to /login page with query parameter /login?error='error message'

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
