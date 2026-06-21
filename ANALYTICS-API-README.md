# Analytics & Visualizations API Documentation

This document outlines the API endpoints necessary for the frontend to fetch and render comprehensive analytics and all 14 supported graphical visualizations.

---

## 0. Initial Setup: Fetching "My Surveys"

Before drilling down into analytics, the dashboard needs to know which surveys the logged-in user owns so they can select one to analyze.

### 0.1 Get Logged-In User's Surveys
- **Endpoint:** `GET /surveys/my-surveys`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Data:** An array of survey objects including participation counts (`mySurveys: [{ _id, title, participantCounts, ... }]`).
- **Frontend Usage:** Use this to populate a sidebar list or a dropdown menu. When the user selects a survey from this list, pass its `_id` as the `surveyId` parameter for all the analytics requests below.

---

## 1. Survey-Level Analytics

These endpoints provide an overarching summary of a survey's performance, useful for high-level dashboard metric cards.

### 1.1 Survey Overview Metrics
- **Endpoint:** `GET /surveys/:surveyId/analytics/overview`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Data:** Total responses, completion rate, average time taken, bounce/drop-off rate.

---

## 2. Question-Level Analytics & All 14 Visualizations

This is the primary endpoint for fetching granular, graph-ready data.

### 2.1 Fetch Visualization Data
- **Endpoint:** `GET /surveys/:surveyId/visualizations`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `graphType` (Required): The exact string of the visual format requested (e.g. `bar`, `stacked_bar`).
  - `questionId` (Required for most): The primary question `_id`.
  - `crossQuestionId` (Required for Intermediate cross-tabulation): A secondary question `_id` used for comparison.

---

### 2.2 Supported `graphType` Reference Guide for Frontend

Here are all 14 supported chart types from your requirements, exactly how to request them, and what JSON format the backend will return for the frontend to render:

#### A. Basic Level (Single Question Distribution)
Best rendered using standard Recharts (BarChart, PieChart, LineChart, AreaChart).
- **Types:** `bar`, `pie`, `histogram`, `line`, `area`
- **Required Params:** `questionId`
- **Data Returned:** 
  ```json
  { "labels": ["Option A", "Option B"], "values": [15, 30] }
  ```
- **Frontend Note:** Map the labels and values array into an array of objects `{ name: labels[i], count: values[i] }` for Recharts.

#### B. Intermediate Level (Cross-Tabulation & Stats)
Requires comparing the primary question against a secondary variable (e.g. Course Satisfaction vs. Gender).
- **Types:** `stacked_bar`, `clustered_bar`, `heatmap`
- **Required Params:** `questionId`, `crossQuestionId`
- **Data Returned:** 
  ```json
  { 
    "labels": ["Male", "Female"], 
    "datasets": [
      { "label": "Satisfied", "data": [10, 15] },
      { "label": "Dissatisfied", "data": [2, 1] }
    ] 
  }
  ```

- **Type:** `scatter` (Scatter Plot)
- **Required Params:** `questionId`, `crossQuestionId`
- **Data Returned:** An array of X/Y coordinates for each user's response.
  ```json
  [ { "x": 4.5, "y": 3.2 }, { "x": 1.0, "y": 2.5 } ]
  ```

- **Type:** `box_plot` (Box & Whisker)
- **Required Params:** `questionId`
- **Data Returned:** 5-number statistical summary.
  ```json
  { "min": 1, "q1": 2.5, "median": 4, "q3": 4.5, "max": 5, "outliers": [] }
  ```

#### C. Advanced Level (Complex & ML Clustering)

- **Type:** `treemap`
- **Required Params:** `questionId`
- **Data Returned:** Standard hierarchy format for D3/Recharts Treemaps.
  ```json
  { "tree": [ { "name": "Option A", "value": 15 }, { "name": "Option B", "value": 30 } ] }
  ```

- **Type:** `dendrogram` (Hierarchical Clustering Powered by Python)
- **Required Params:** None (Analyzes the whole survey automatically).
- **Data Returned:** A nested JSON Tree structure detailing user personas/groupings.
  ```json
  { "name": "Survey Responses", "children": [ { "name": "Cluster 1", "children": [...] } ] }
  ```

- **Type:** `network` (Relationship Graph)
- **Required Params:** None
- **Data Returned:** Node and Link graph logic.
  ```json
  { "nodes": [{ "id": "q1", "label": "Course Rating" }], "links": [{ "source": "q1", "target": "ans_5", "value": 10 }] }
  ```

- **Type:** `map` (Geospatial/Location Data)
- **Required Params:** None
- **Data Returned:** Aggregated counts based on user's demographic/faculty locations.
  ```json
  { "locations": [ { "name": "Science Faculty", "value": 45 }, { "name": "Arts Faculty", "value": 20 } ] }
  ```
