# Environment Setup

## Local Development

1. Copy `.env.development` to `.env`:
   ```bash
   cp .env.development .env
   ```

2. Update values in `.env` as needed for your local environment.

## GitHub Secrets Required

### For Staging (frontend-staging branch):
- `STAGING_API_URL`: Your staging API URL
- `STAGING_PAYSTACK_PUBLIC_KEY`: Your staging Paystack public key

### For Production (main branch):
- `PRODUCTION_API_URL`: Your production API URL  
- `PRODUCTION_PAYSTACK_PUBLIC_KEY`: Your production Paystack public key

### For Deployment:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `VPS_HOST`: VPS server IP/hostname
- `VPS_USERNAME`: VPS username
- `VPS_PASSWORD`: VPS password

## Environment Files

- `.env.example`: Template with all required variables
- `.env.development`: Development environment values
- `.env.staging`: Staging environment values  
- `.env.production`: Production environment values 