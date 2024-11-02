## Testing the API

You can test the endpoints using tools like **Postman** or **cURL**. Below are examples of how to perform the tests.

### Test the POST Endpoint

This endpoint allows you to store JSON data. Here’s how to test it:

#### Using Postman

1. Open Postman and create a new request.
2. Set the request type to **POST**.
3. Enter the following URL:   ```https://jkhoijboqh.execute-api.eu-north-1.amazonaws.com/dev/store```
4. Under the **Body** tab, select **raw** and set the format to **JSON**.
5. Input the JSON data you want to store, for example:
```json
{
    "name": "John",
    "age": 30
}
```

#### Using cURL
You can also test the POST endpoint using the command line with cURL:
```
curl -X POST https://jkhoijboqh.execute-api.eu-north-1.amazonaws.com/dev/store \
-H "Content-Type: application/json" \
-d '{"name": "John", "age": 30}'
```

#### Test the GET Endpoint
This endpoint retrieves all stored JSON data. Here’s how to test it:

#### Using Postman
1. Open Postman and create a new request.
2. Set the request type to GET.
3. Enter the following URL:  ```https://jkhoijboqh.execute-api.eu-north-1.amazonaws.com/dev```

#### Using cURL
You can also test the GET endpoint using cURL:
```
curl -X GET https://jkhoijboqh.execute-api.eu-north-1.amazonaws.com/dev
```


### Summary of Testing Section

- **Testing Tools**: Describes how to use Postman and cURL for testing.
- **Detailed Instructions**: Step-by-step guides for testing both the POST and GET endpoints.
- **Expected Results**: What to expect when tests are successful.
- **Error Handling**: Information on how the API responds to errors.

