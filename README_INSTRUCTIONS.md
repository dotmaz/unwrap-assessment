# Unwrap.ai - Take Home Challenge

## Overview

You are the engineer for a startup that is building fancy library software. Your job is the laydown the groundwork for the library management system.
To start with, you will build a REST API for a library management system. Your solution should allow librarians to manage books, customers, and the borrowing process.

Upon successful completion of this library management system, you will be invited to a follow-up interview where you will be extending your work with additional features.

## Requirements

### Functionality

Your API must support the following operations:

1. **Book Management**

   - Add a new book to the library with a specified number of copies
   - View book details and availability

2. **Customer Management**

   - Create a new customer
   - View customer information

3. **Borrowing Operations**
   - Check out a book for a customer with a due date
   - Return a book for a customer
   - View all books currently checked out by a customer, including due dates

### Business Rules

- A customer cannot have more than 5 books checked out at any time
- A book cannot be checked out if all copies are already borrowed
- The system should track due dates for all borrowed books

## Technical Requirements

- Build a RESTful API using a framework of your choice
- Use appropriate data structures to manage the state of the library
- Implement proper error handling with meaningful error messages
- Include appropriate status codes in API responses
- Design clean, maintainable code with proper separation of concerns

## Evaluation Criteria

Your submission will be evaluated based on:

- Correctness of functionality
- Code quality and organization
- Handling of edge cases

## Testing

We've provided a Python test script (`test_library_api.py`) that will test your API endpoints. Your API should pass all these tests to be considered complete. Keep in mind that there are some edge cases that are not covered by the test script.

## Submission Instructions

1. Implement the API according to the requirements
2. Include documentation on how to run your API
3. If you make any assumptions or trade-offs, document them
4. Submit your code as instructed in the email

## Time Expectation

We expect this challenge to take approximately 3-4 hours. We value quality over completeness, and completing product requirements over fancy infrastructure. Solutions that use a file system data store or in-memory data structures are completely acceptable.

Keep in mind that during our interview, we will be extending your API with additional requirements.

Good luck!

## Submission

Please submit your code via a git repo, zip file, or any other method you prefer. Please include a README with instructions on how to run your API.

Please do not submit a pull request to this repo.

## API Specification

The test script expects your API to implement the following endpoints:

### Book Management

#### Add a Book

- **Method**: POST
- **Endpoint**: `/api/books`
- **Request Body**:
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "copies": 3
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "copies": 3,
    "available_copies": 3
  }
  ```

#### Get Book Details

- **Method**: GET
- **Endpoint**: `/api/books/{isbn}`
- **Response (200 OK)**:
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "copies": 3,
    "available_copies": 3
  }
  ```

### Customer Management

#### Create a Customer

- **Method**: POST
- **Endpoint**: `/api/customers`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "customer_id": "CUST001"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "customer_id": "CUST001"
  }
  ```

#### Get Customer Details

- **Method**: GET
- **Endpoint**: `/api/customers/{customer_id}`
- **Response (200 OK)**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "customer_id": "CUST001"
  }
  ```

### Borrowing Operations

#### Checkout a Book

- **Method**: POST
- **Endpoint**: `/api/checkouts`
- **Request Body**:
  ```json
  {
    "isbn": "9780743273565",
    "customer_id": "CUST001",
    "due_date": "2023-12-31"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "checkout_id": "CKO123456",
    "isbn": "9780743273565",
    "title": "The Great Gatsby",
    "customer_id": "CUST001",
    "checkout_date": "2023-12-01",
    "due_date": "2023-12-31"
  }
  ```

#### Return a Book

- **Method**: POST
- **Endpoint**: `/api/returns`
- **Request Body**:
  ```json
  {
    "isbn": "9780743273565",
    "customer_id": "CUST001"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Book returned successfully",
    "isbn": "9780743273565",
    "customer_id": "CUST001",
    "return_date": "2023-12-15"
  }
  ```

#### Get Customer's Checked Out Books

- **Method**: GET
- **Endpoint**: `/api/customers/{customer_id}/books`
- **Response (200 OK)**:
  ```json
  [
    {
      "isbn": "9780743273565",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "checkout_date": "2023-12-01",
      "due_date": "2023-12-31"
    },
    {
      "isbn": "9780451524935",
      "title": "1984",
      "author": "George Orwell",
      "checkout_date": "2023-12-05",
      "due_date": "2023-12-20"
    }
  ]
  ```

### System Management

#### Reset System (for testing)

- **Method**: POST
- **Endpoint**: `/api/reset`
- **Response (200 OK)**:
  ```json
  {
    "message": "System reset successful"
  }
  ```

## Testing the API with the test script

### Installing python

Skip if you have python already installed.

#### Mac/Linux

```bash
brew install pyenv

export PYENV_ROOT="$HOME/.pyenv" [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH" eval "$(pyenv init -)"

source ~/.zprofile


pyenv install 3.12
```

#### Windows

Follow the instructions [here](https://docs.python.org/3/using/windows.html#windows-full)

### Setuping up the environment

#### Mac/Linux

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Running the test script

```bash
python test_library_api.py
```

If you've changed the url you can run

```bash
python test_library_api.py --url http://localhost:5000/api
```
