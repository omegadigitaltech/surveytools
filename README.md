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

## Deployment

This project uses GitHub Actions to automatically deploy to a VPS using Docker.

### Prerequisites

1. A VPS with Docker installed
2. A Docker Hub account
3. SSH access to your VPS

### Setting up GitHub Secrets

To enable automated deployments, you need to set up the following secrets in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token
- `VPS_HOST`: The IP address or hostname of your VPS
- `VPS_USERNAME`: The SSH username for your VPS
- `VPS_SSH_KEY`: Your private SSH key for accessing the VPS (content of your `id_rsa` file)

### How Deployment Works

When you push to the main branch:

1. GitHub Actions builds a Docker image of your application
2. The image is pushed to Docker Hub
3. GitHub Actions connects to your VPS via SSH
4. The VPS pulls the latest Docker image
5. The application is deployed in a Docker container

### Manual Deployment

If you need to deploy manually, you can run these commands on your VPS:

```bash
# Pull the latest image
docker pull your-dockerhub-username/surveypro:latest

# Stop and remove the current container if it exists
docker stop surveypro-container
docker rm surveypro-container

# Run the new container
docker run -d --name surveypro-container \
  -p 80:80 \
  --restart unless-stopped \
  your-dockerhub-username/surveypro:latest
```
