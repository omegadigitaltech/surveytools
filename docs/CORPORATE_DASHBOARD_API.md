# Corporate Dashboard API Documentation

The Corporate Dashboard provides a richer set of analytics and tools for **Institutional-tier** researchers (users registered with `researcherType: 'corporate'`).

All endpoints in this suite are protected by a two-stage gate:
1. `authMiddleware` verifies the researcher is logged in via Bearer token.
2. `attachResearcherTier` + `requireResearcherTier(['Institutional'])` strictly enforces that the user holds the correct tier.

**Base URL Mount:** `/v1/dashboard/corporate`

---

## Error Handling (Global Shape)

The application handles all errors globally using a unified structure. Unless otherwise noted, expect all 4xx and 5xx responses to follow this shape:

```json
{
  "status": "failure",
  "code": 403,
  "msg": "Access denied. Requires one of the following tiers: Institutional"
}
```

*Note: For `401 Unauthorized` specifically (missing or invalid token), the `authMiddleware` attaches an extra `data.isLoggedIn: false` property:*
```json
{
  "status": "failure",
  "code": 401,
  "msg": "User is not Logged In: Token not found",
  "data": { "isLoggedIn": false }
}
```

---

## 1. Get Organization Overview
Retrieves high-level summary statistics for all surveys owned by the researcher's organization.

- **Method:** `GET`
- **Path:** `/overview`
- **Auth:** Required (Bearer Token, Institutional Tier)
- **Query Params:** None

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "totalSurveys": 12,
    "activeSurveys": 3,
    "totalResponses": 1540
  }
}
```

---

## 2. Get Survey Analytics (Demographics)
Retrieves aggregated demographic data for a specific survey. To ensure PII is never dynamically decrypted on the fly (for performance and security), this endpoint queries a deduplicated aggregation ledger (`DemographicAggregate`).

- **Method:** `GET`
- **Path:** `/analytics`
- **Auth:** Required (Bearer Token, Institutional Tier)
- **Query Params:**
  - `surveyId` (string, **required**): The ID of the survey.
  - `filters` (array or comma-separated string, *optional*): Restricts the returned analytics to specific demographic fields.

### Allowed `filters` Values
The frontend filter UI must strictly use these exact keys:
`gender`, `stateOfOrigin`, `stateOfResidence`, `lgaOfResidence`, `isStudent`, `academicLevel`, `levelOfStudy`, `institution`, `faculty`, `department`, `professionalOccupation`, `employmentSector`, `graduateStatus`, `educationLevel`, `employmentStatus`, `incomeRange`, `maritalStatus`, `bloodGroup`, `religion`, `housingType`.

### Success Response (200 OK)
Returns an object where each requested demographic field maps to an array of value/count pairs. Array-valued layers (e.g. `chronicHealthConditions`) are pre-exploded so each element is counted independently.

```json
{
  "status": "success",
  "data": {
    "gender": [
      { "value": "Male", "count": 450 },
      { "value": "Female", "count": 520 }
    ],
    "stateOfResidence": [
      { "value": "Lagos", "count": 800 },
      { "value": "Abuja", "count": 170 }
    ]
  }
}
```

### Error Responses
- **400 Bad Request** (`msg: "Invalid analytics query parameters"`) — Thrown if `surveyId` is missing or if `filters` contains unrecognized keys.
- **404 Not Found** (`msg: "Survey not found or access denied"`) — Thrown if the survey doesn't exist or isn't owned by the requester.

---

## 3. Generate & Retrieve Invoice
Generates a formal PDF invoice for corporate dashboard access or survey utilization. The invoice is generated idempotently based on the `orgUserId` and `surveyId`.

- **Method:** `GET`
- **Path:** `/invoice/:id` (where `:id` is the `surveyId`)
- **Auth:** Required (Bearer Token, Institutional Tier)

### Success Response (200 OK)
Returns both the raw MongoDB Invoice record and the Base64-encoded PDF payload.

```json
{
  "status": "success",
  "data": {
    "invoice": {
      "_id": "648a7b9e2f8c... ",
      "orgUserId": "647f1234...",
      "surveyIds": ["648a7a50..."],
      "rcNumber": "RC-123456",
      "billingAddress": "123 Corporate Way, Lagos",
      "poReference": "PO-1685987103421",
      "amount": 500,
      "status": "Pending",
      "lineItems": [
        {
          "description": "Corporate Dashboard Access & Analytics",
          "quantity": 1,
          "unitPrice": 500,
          "total": 500
        }
      ],
      "issuedAt": "2023-06-05T17:45:03.421Z",
      "createdAt": "2023-06-05T17:45:03.421Z",
      "updatedAt": "2023-06-05T17:45:03.421Z"
    },
    "pdfBase64": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iag..."
  }
}
```
*Note: The frontend should render the PDF using `data:application/pdf;base64,` concatenated with the `pdfBase64` string.*

### Error Responses
- **404 Not Found** (`msg: "Billing details not found"`) — Thrown if the researcher hasn't completed their ResearcherProfile with billing details.

---

## 4. Export Survey Data
Exports the full survey structure with populated respondent answers.

- **Method:** `GET`
- **Path:** `/export`
- **Auth:** Required (Bearer Token, Institutional Tier)
- **Query Params:**
  - `surveyId` (string, **required**): The ID of the survey.
  - `format` (enum, *optional*): Options are `csv`, `pdf`, `xlsx`, `json`, `pptx`, or `spss`. Defaults to `csv`.

### Success Response (200 OK)
Instead of a JSON response, this endpoint returns the raw file bytes directly with appropriate `Content-Type` and `Content-Disposition` headers to trigger a browser download.

- **CSV Request (`?format=csv`)**
  - Content-Type: `text/csv`
  - Download: `survey_export_<id>.csv`
  - Content: Comma-separated values flattening respondent answers.

- **PDF Request (`?format=pdf`)**
  - Content-Type: `application/pdf`
  - Download: `survey_export_<id>.pdf`
  - Content: PDF document summarizing the survey questions and responses.

- **XLSX Request (`?format=xlsx`)**
  - Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Download: `survey_export_<id>.xlsx`
  - Content: Excel Workbook with two sheets: 1. Raw Responses, 2. Demographic Summary.

- **JSON Request (`?format=json`)**
  - Content-Type: `application/json`
  - Download: `survey_export_<id>.json`
  - Content: Raw serialized JSON of the entire survey object.

- **PPTX Request (`?format=pptx`)**
  - Content-Type: `application/vnd.openxmlformats-officedocument.presentationml.presentation`
  - Download: `survey_export_<id>.pptx`
  - Content: Slide deck summarizing the key demographics in a chart.

### Error Responses
- **400 Bad Request** (`msg: "Invalid export query parameters"`)
- **404 Not Found** (`msg: "Survey not found or access denied"`)
- **501 Not Implemented** (`msg: "SPSS export is not yet implemented"`) — Thrown if `format=spss` is requested.
