# Points Redemption System

This feature allows users to redeem their earned points for airtime or data bundles across Nigerian telecommunication networks.

## Features

- Convert points to airtime at a 1:1 ratio (1 point = 1 naira)
- Convert points to data bundles based on the actual price of data plans
- Supports all major Nigerian networks (MTN, Airtel, 9Mobile, Glo)
- Minimum airtime redemption of 100 points (₦100)
- Transaction history tracking
- Direct integration with Cardri.ng API for real-time data and airtime purchases
- Robust database transaction handling for data consistency

## API Endpoints

### Get Available Data Plans

```
GET /redemption/plans
```

Returns all available data plans from Cardri.ng API, which the frontend can display for users to choose from.

### Redeem Points for Airtime

```
POST /redemption/airtime
```

Request Body:
```json
{
  "amount": 200,
  "network": "1",
  "phoneNumber": "08012345678"
}
```

### Redeem Points for Data

```
POST /redemption/data
```

Request Body:
```json
{
  "planId": "51",
  "network": "1",
  "phoneNumber": "08012345678"
}
```

### Get Redemption History

```
GET /redemption/history
```

Returns the user's redemption history.

## Conversion Rates

### Airtime

- Direct 1:1 conversion (100 points = ₦100 airtime)
- Minimum redemption: 100 points (₦100)

### Data

Data plans are priced according to the current rates from the provider. Points required equal the naira cost of the plan.

For example:
- 1GB MTN SME Data (1 Month) costs ₦880, requiring 880 points
- 500MB GLO CG (1 Month) costs ₦235, requiring 235 points

## Implementation Details

The system follows this process flow:
1. For data, the frontend fetches available plans via GET /redemption/plans
2. User selects a plan or enters airtime amount
3. Backend starts a database transaction
4. Backend validates if user has sufficient points
5. Backend deducts points from user's balance (within transaction)
6. Backend creates a redemption record with status 'pending' (within transaction)
7. Backend makes a direct API call to Cardri.ng to purchase the airtime or data
8. If successful, redemption status is updated to 'successful' and transaction is committed
9. If failed, transaction is aborted (automatically rolling back all database changes)
10. Response is sent to the user with confirmation or error details

## Transaction Handling

The system uses MongoDB transactions to ensure data consistency during the redemption process:

- All database operations (points deduction, history creation, status updates) are wrapped in a transaction
- If any part of the process fails (validation, API call, etc.), all database changes are rolled back
- This ensures that users don't lose points without receiving their airtime or data
- Transaction middleware provides centralized error handling and resource cleanup

## API Integration

The system integrates directly with Cardri.ng API:

### Airtime Purchase API
```
POST https://api.cardri.ng/api/merchant/airtime/
```

Form Parameters:
- amount: Amount of airtime to purchase
- network: Network ID
- phonenumber: Recipient's phone number
- reference: Unique transaction reference

### Data Purchase API
```
POST https://api.cardri.ng/api/merchant/data
```

Form Parameters:
- plan: Plan ID to purchase
- network: Network ID
- phonenumber: Recipient's phone number
- reference: Unique transaction reference

## Supported Networks

| Network ID | Network Name | Phone Number Prefixes |
|------------|--------------|------------------------|
| 1          | MTN          | 0703, 0706, 0803, 0806, 0810, 0813, 0814, 0816, 0903, 0906, 0913, 0916, 0926 |
| 2          | Airtel       | 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0904, 0907, 0912 |
| 3          | 9Mobile      | 0809, 0817, 0818, 0908, 0909 |
| 4          | Glo          | 0705, 0805, 0807, 0811, 0815, 0905, 0915 | 