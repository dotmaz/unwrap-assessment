## Library Management API

To start app, run `npm install && npm start`.

## Design decisions

- For simplicity, I used a persisted JSON database stored in db.json (automatically created by app).
- CORS is enabled to ensure anybody can test the API with no issues.

## Assumptions made

- If a book is added with an ISBN that already exists in the library, the amount of copies will increment only if the author and title match exactly. Otherwise, an error is returned mentioning that "a book with the given ISBN and different title/author already exist".
- Customer IDs are case sensitive - so CUST001 and CuST001 are two separate valid IDs.
- Since no return date or checkout date is provided when you return/checkout a book, the current date (in UTC) will be set as the return_date/checkout_date in the API response.
- A customer is allowed to checkout several copies of the same book. When they return one, the last checkout of that book is returned.