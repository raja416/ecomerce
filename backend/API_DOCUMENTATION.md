# eCommerce API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Optional message",
  "error": {
    "message": "Error message",
    "details": [ ... ]
  }
}
```

---

## Authentication Routes

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Get Current User
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "+1234567890"
  }
  ```

### Change Password
- **PUT** `/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

### Forgot Password
- **POST** `/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```

### Reset Password
- **POST** `/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset-token",
    "password": "newpassword123"
  }
  ```

---

## User Routes

### Get User Profile
- **GET** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`

### Update User Profile
- **PUT** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "+1234567890",
    "addresses": [
      {
        "type": "home",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    ]
  }
  ```

### Upload Avatar
- **POST** `/users/avatar`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "avatarUrl": "https://example.com/avatar.jpg"
  }
  ```

### Get User Orders
- **GET** `/users/orders?status=pending&page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

### Get User Reviews
- **GET** `/users/reviews`
- **Headers:** `Authorization: Bearer <token>`

### Get User Wishlists
- **GET** `/users/wishlists`
- **Headers:** `Authorization: Bearer <token>`

### Get User Statistics
- **GET** `/users/stats`
- **Headers:** `Authorization: Bearer <token>`

### Delete Account
- **DELETE** `/users/account`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "password": "currentpassword"
  }
  ```

---

## Product Routes

### Get All Products
- **GET** `/products?page=1&limit=20&category=electronics&minPrice=100&maxPrice=1000&sort=price&order=asc`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `category`: Category ID or slug
  - `brand`: Brand name
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `rating`: Minimum rating
  - `sort`: Sort field (price, rating, createdAt, name)
  - `order`: Sort order (asc, desc)
  - `search`: Search term
  - `isFeatured`: Featured products only
  - `isOnSale`: On sale products only

### Get Featured Products
- **GET** `/products/featured`

### Get Products on Sale
- **GET** `/products/on-sale`

### Search Products
- **GET** `/products/search?q=laptop&page=1&limit=20`

### Get Single Product
- **GET** `/products/:id` or `/products/slug/:slug`

### Create Product (Admin)
- **POST** `/products`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "category-id",
    "brand": "Brand Name",
    "stock": 100,
    "images": ["url1", "url2"],
    "isFeatured": true,
    "isOnSale": false
  }
  ```

### Update Product (Admin)
- **PUT** `/products/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Delete Product (Admin)
- **DELETE** `/products/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Product Statistics (Admin)
- **GET** `/products/stats`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## Category Routes

### Get All Categories
- **GET** `/categories?tree=true&featured=true`

### Get Single Category
- **GET** `/categories/:id` or `/categories/slug/:slug`

### Create Category (Admin)
- **POST** `/categories`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "name": "Category Name",
    "description": "Category description",
    "parent": "parent-category-id",
    "image": "category-image-url"
  }
  ```

### Update Category (Admin)
- **PUT** `/categories/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Delete Category (Admin)
- **DELETE** `/categories/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## Cart Routes

### Get User Cart
- **GET** `/cart`
- **Headers:** `Authorization: Bearer <token>`

### Add Item to Cart
- **POST** `/cart/items`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "productId": "product-id",
    "quantity": 2,
    "variant": "variant-id"
  }
  ```

### Update Cart Item
- **PUT** `/cart/items/:itemId`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "quantity": 3
  }
  ```

### Remove Item from Cart
- **DELETE** `/cart/items/:itemId`
- **Headers:** `Authorization: Bearer <token>`

### Clear Cart
- **DELETE** `/cart`
- **Headers:** `Authorization: Bearer <token>`

### Apply Coupon
- **POST** `/cart/coupon`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "code": "DISCOUNT20"
  }
  ```

### Remove Coupon
- **DELETE** `/cart/coupon`
- **Headers:** `Authorization: Bearer <token>`

### Set Shipping Address
- **PUT** `/cart/shipping-address`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }
  ```

### Set Shipping Method
- **PUT** `/cart/shipping-method`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "method": "standard",
    "cost": 5.99
  }
  ```

---

## Order Routes

### Get User Orders
- **GET** `/orders?status=pending&page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

### Get Single Order
- **GET** `/orders/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Order from Cart
- **POST** `/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "stripe",
    "notes": "Delivery instructions"
  }
  ```

### Cancel Order
- **PUT** `/orders/:id/cancel`
- **Headers:** `Authorization: Bearer <token>`

### Get All Orders (Admin)
- **GET** `/orders/admin/all?status=pending&page=1&limit=20`
- **Headers:** `Authorization: Bearer <admin-token>`

### Update Order Status (Admin)
- **PUT** `/orders/admin/:id/status`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "status": "shipped",
    "trackingNumber": "TRK123456789",
    "trackingUrl": "https://tracking.com/TRK123456789"
  }
  ```

### Process Refund (Admin)
- **POST** `/orders/admin/:id/refund`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "amount": 50.00,
    "reason": "Customer request"
  }
  ```

### Get Order Statistics (Admin)
- **GET** `/orders/admin/stats?period=30`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## Payment Routes

### Create Payment Intent
- **POST** `/payments/create-intent`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "orderId": "order-id",
    "amount": 99.99
  }
  ```

### Confirm Payment
- **POST** `/payments/confirm`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "paymentIntentId": "pi_123456789",
    "orderId": "order-id"
  }
  ```

### Get Payment Methods
- **GET** `/payments/methods`
- **Headers:** `Authorization: Bearer <token>`

### Create Setup Intent
- **POST** `/payments/setup-intent`
- **Headers:** `Authorization: Bearer <token>`

### Process Refund (Admin)
- **POST** `/payments/admin/refund`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "paymentIntentId": "pi_123456789",
    "amount": 50.00
  }
  ```

---

## Review Routes

### Get Product Reviews
- **GET** `/reviews/product/:productId?page=1&limit=10&rating=5&sort=helpful`

### Get User Reviews
- **GET** `/reviews/user/:userId?page=1&limit=10`

### Create Review
- **POST** `/reviews`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "productId": "product-id",
    "orderId": "order-id",
    "rating": 5,
    "title": "Great Product!",
    "comment": "This product exceeded my expectations.",
    "images": ["url1", "url2"]
  }
  ```

### Update Review
- **PUT** `/reviews/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "rating": 4,
    "title": "Updated Title",
    "comment": "Updated comment"
  }
  ```

### Delete Review
- **DELETE** `/reviews/:id`
- **Headers:** `Authorization: Bearer <token>`

### Mark Review Helpful
- **POST** `/reviews/:id/helpful`
- **Headers:** `Authorization: Bearer <token>`

### Report Review
- **POST** `/reviews/:id/report`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "reason": "spam"
  }
  ```

### Get Pending Reviews (Admin)
- **GET** `/reviews/admin/pending`
- **Headers:** `Authorization: Bearer <admin-token>`

### Moderate Review (Admin)
- **PUT** `/reviews/admin/:id/moderate`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "status": "approved",
    "reason": "Review meets guidelines"
  }
  ```

---

## Wishlist Routes

### Get User Wishlists
- **GET** `/wishlist`
- **Headers:** `Authorization: Bearer <token>`

### Get Single Wishlist
- **GET** `/wishlist/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Wishlist
- **POST** `/wishlist`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Birthday Wishlist",
    "description": "Items I want for my birthday",
    "isPublic": true
  }
  ```

### Add Item to Wishlist
- **POST** `/wishlist/:id/items`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "productId": "product-id",
    "notes": "Want this for my birthday"
  }
  ```

### Remove Item from Wishlist
- **DELETE** `/wishlist/:id/items/:itemId`
- **Headers:** `Authorization: Bearer <token>`

### Share Wishlist
- **POST** `/wishlist/:id/share`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "userEmail": "friend@example.com"
  }
  ```

### Get Wishlist Statistics
- **GET** `/wishlist/:id/stats`
- **Headers:** `Authorization: Bearer <token>`

---

## Coupon Routes

### Get Active Coupons
- **GET** `/coupons?category=electronics&type=percentage`

### Get Coupon by Code
- **GET** `/coupons/:code`

### Validate Coupon
- **POST** `/coupons/validate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "code": "DISCOUNT20",
    "cartTotal": 150.00,
    "userId": "user-id"
  }
  ```

### Create Coupon (Admin)
- **POST** `/coupons/admin`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "code": "DISCOUNT20",
    "type": "percentage",
    "value": 20,
    "minOrderAmount": 100,
    "maxDiscount": 50,
    "usageLimit": 100,
    "userUsageLimit": 1,
    "expiresAt": "2024-12-31T23:59:59Z",
    "description": "20% off orders over $100"
  }
  ```

### Get All Coupons (Admin)
- **GET** `/coupons/admin/all?isActive=true&type=percentage`

### Update Coupon (Admin)
- **PUT** `/coupons/admin/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Delete Coupon (Admin)
- **DELETE** `/coupons/admin/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Coupon Statistics (Admin)
- **GET** `/coupons/admin/stats`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## Admin Routes

### Get Dashboard Overview
- **GET** `/admin/dashboard`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get All Users (Admin)
- **GET** `/admin/users?role=user&isActive=true&page=1&limit=20`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Single User (Admin)
- **GET** `/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Update User (Admin)
- **PUT** `/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
  ```json
  {
    "role": "admin",
    "isActive": true
  }
  ```

### Delete User (Admin)
- **DELETE** `/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get System Statistics
- **GET** `/admin/stats?period=30`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Low Stock Alerts
- **GET** `/admin/alerts/low-stock`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Pending Reviews
- **GET** `/admin/alerts/pending-reviews`
- **Headers:** `Authorization: Bearer <admin-token>`

### Get Recent Activity
- **GET** `/admin/activity?limit=20`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **File uploads:** 10 requests per 15 minutes per IP

## File Upload

For file uploads (images, avatars), use multipart/form-data:

```
Content-Type: multipart/form-data
```

Supported formats: JPG, PNG, GIF, WebP
Maximum file size: 5MB

## Webhooks

### Stripe Webhooks
- **POST** `/payments/webhooks/stripe`
- **Headers:** `Stripe-Signature: <signature>`

Handles:
- Payment success
- Payment failure
- Refund processing
- Subscription events








