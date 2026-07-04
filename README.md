# 🛒 TechMart - AI Powered Electronics E-Commerce Platform

TechMart is a full-stack Electronics E-Commerce platform built using **Spring Boot 3**, **React 19**, **MySQL**, **Elasticsearch**, **Redis**, and **AI**. 

The project demonstrates modern backend development with secure authentication, caching, search relevance tuning, automated email updates, secure Razorpay payments, and an intelligent AI shopping assistant.

---

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure stateless authentication using JWT tokens.
- **HttpOnly Cookie Authentication**: Tokens are stored in secure, HttpOnly cookies for enhanced protection against XSS attacks.
- **Role-Based Authorization**: Restricts access to endpoints based on roles: `ROLE_CUSTOMER` and `ROLE_ADMIN`.
- **Spring Security Configuration**: Custom filters and security rules governing public and protected routes.

---

### 📦 Product Management (Admin Only)
- **CRUD Operations**: Admins can add, update, delete, and view products.
- **Bulk Import**: Endpoint supporting bulk insertion of product data.
- **Product Categories**: Dynamic management of category relationships.
- **Cloudinary Image Upload**: Automatic uploading of product images to Cloudinary from image URLs.

---

### 🛍 Shopping & Ordering (Customer)
- **Shopping Cart**: Add items, update quantities, and remove products dynamically.
- **Wishlist**: Save favorite products for later purchase.
- **Profile & Address Management**: Add, view, edit, and delete multiple shipping addresses.
- **Secure Checkout & Buy Now**: Guided checkout flow with address selection and payment verification.
- **Payment Gateway Integration**: Embedded **Razorpay** integration for secure payments.
- **Order History**: View complete personal order details, statuses, and payment states.

---

### 📦 Order & Inventory Management (Admin Only)
- **Global Order Overview**: View all orders placed across the system.
- **Order Status Updates**: Change order states (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Automated Inventory Stock Handling**: 
  - Stock is automatically decremented upon a successful purchase.
  - Stock is automatically restored (restocked) if an order is cancelled by the Admin.

---

### ✉️ Automated Email Notifications
- **Spring Mail Service**: Automatically sends a detailed HTML/text order confirmation email (via Gmail SMTP) upon successful payment verification.
- Includes details like Order ID, products, quantity, total amount, and delivery message.

---

### ⭐ Reviews & Ratings
- **Customer Reviews**: Write text feedback and rate products from 1 to 5 stars.
- **Dynamic Aggregate Metrics**: Automatically calculates average ratings and counts reviews per product.

---

### 🔍 Smart Search
Powered by **Elasticsearch** and optimized with **Redis Caching**:
- **Full Text Search**: Queries matching name (boosted `^3`), category (boosted `^2`), and description.
- **Typo Tolerance**: Enabled using Elasticsearch fuzzy search query configuration (`"fuzziness": "AUTO"`).
- **Advanced Relevance & Popularity Score**: Custom `function_score` query combining text relevance with a calculated `salesScore` (popularity factor based on ratings, sales volume, stock availability, review count, and product freshness).
- **Search Autocomplete suggestions**: Quick suggestions starting with the query prefix.
- **Redis Cache Layer**: Caches search queries, autocomplete suggestions, product lists, and details. Automatically evicts relevant cache namespaces when products are added, modified, or deleted.

---

### 🤖 AI Shopping Assistant
Powered by **Groq API** (`llama-3.3-70b-versatile` model):
- **Intent Extraction**: Parses user queries using structured JSON format into categories, brand, budget constraints, keywords, purpose, and sort criteria.
- **Filtered Product Feeds**: Before sending to the LLM, the system queries Elasticsearch and filters products programmatically by category, brand, budget range, and stock availability.
- **Context-Aware Conversations**: Stores conversation history in MySQL to handle follow-up queries (e.g., *"cheaper options"*, *"what about Dell?"*, *"battery life?"*).
- **Formatted Recommendations**: Returns clean, beautifully structured markdown templates displaying rank, name, product ID, pricing, ratings, review count, total sold, and detailed reasoning.
- **Chat Management**: Supports creating, switching, and deleting multiple chat threads.

---

## 🛠 Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.3**
- **Spring Security**
- **Spring Data JPA & Hibernate**
- **Spring Data Elasticsearch**
- **Spring Data Redis**
- **Spring Boot Starter Mail**
- **Lombok**
- **Maven**

### Frontend
- **React 19**
- **Vite**
- **Axios**
- **React Router DOM 7**
- **React Icons**
- **Vanilla CSS (CSS Modules)**

### Database & Third-Party Services
- **MySQL** (Relational storage)
- **Elasticsearch** (Search engine)
- **Redis** (Caching server)
- **Groq API** (Llama 3.3 70B LLM)
- **Cloudinary** (Image hosting)
- **Razorpay** (Payment gateway)

---

## 🏗 Architecture

```
React (Vite)
      │
      ▼ (Axios + HttpOnly JWT Cookie)
Spring Boot REST API
      │
      ├──────────────► MySQL
      │
      ├──────────────► Elasticsearch
      │
      ├──────────────► Redis
      │
      ├──────────────► Cloudinary
      │
      ├──────────────► Razorpay API
      │
      ├──────────────► SMTP Mail (Gmail)
      │
      └──────────────► Groq AI (Llama 3.3)
```

---

## 📂 Project Structure

### Backend Package Structure
```
src/main/java/com/example/TechMart/
 ├── auth           # Register, Login, Current User, Jwt cookies
 ├── user           # Users entity & repository
 ├── category       # Category controller, entity & repository
 ├── product        # Product controller, image uploads, services
 ├── review         # Review and Rating controller, entity & repository
 ├── wishlist       # Wishlist and Wishlist Item management
 ├── cart           # Cart and Cart Item management
 ├── order          # Order, Order Items, Payments & Email services
 ├── elasticsearch  # Search services, indexing documents, repositories
 ├── ai             # Chat, Conversations, Intent, Groq API services
 ├── profile        # Shipping Address entities, controllers & services
 ├── security       # JWT Filter, security filters & CORS settings
 └── config         # Third-party credentials & Bean configurations
```

---

## 🤖 AI Workflow

```
User Query
      │
      ▼
Intent Extraction (Groq JSON Mode)
      │
      ▼
Elasticsearch Search (Function Score Query)
      │
      ▼
Category, Brand, Budget, & Stock Filters (Spring Boot Service)
      │
      ▼
Popularity & Freshness Ranking (Based on Sales Score)
      │
      ▼
Groq AI Recommendation (llama-3.3-70b Context)
      │
      ▼
Response Saved to MySQL Chat History
```

---

## 📊 Database Schema

### Main Tables
- **Users**: Authentication data, emails, and roles (`ADMIN` / `CUSTOMER`).
- **Products**: Electronic items details, prices, stocks, sales counters, and ratings.
- **Categories**: Parent groupings for products (e.g., Laptops, Mobiles, Tablets).
- **Address**: Shipping address info linked to Users and Orders.
- **Reviews**: Customer text reviews and star ratings.
- **Cart & Cart Items**: Temporary customer shopping cart records.
- **Wishlist & Wishlist Items**: Customer marked favorites.
- **Orders & Order Items**: Purchased records, shipping destinations, and quantities.
- **Payment**: Payment transaction records, Razorpay IDs, and transaction status (`CREATED`, `SUCCESS`, `FAILED`).
- **Conversation**: Grouping records for AI chat histories.
- **Chat Messages**: Chat exchanges containing messages and roles (`USER` / `ASSISTANT`).

---

## 🔒 Roles & Access Control

### Customer
- Register & Login
- Browse, detail-view, and search products
- Maintain Cart & Wishlist
- Add & edit shipping addresses
- Order products via secure checkout & verify payment
- Review and rate products
- Create, manage, and hold chats with the AI Shopping Assistant
- View order history & transaction logs

### Admin
- Complete Product CRUD (Add, Edit, Delete, Bulk import)
- Category Management
- Global Order Management (view all orders and change statuses)
- Stock monitoring & inventory management

---

## ⚙️ Setup & Configuration

### Prerequisites
Make sure you have the following installed:
- Java 17 SDK
- Maven
- MySQL Server
- Elasticsearch (running on http://localhost:9200)
- Redis Server (running on port 6379)
- Node.js & npm

### 1. Database & Service Setup
Create a MySQL database named `techmart`:
```sql
CREATE DATABASE techmart;
```

### 2. Configure Backend Applications
Modify `TechMart_Backend/src/main/resources/application.properties` with your configurations:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/techmart
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Cloudinary
cloudinary.cloud-name=YOUR_CLOUDINARY_NAME
cloudinary.api-key=YOUR_CLOUDINARY_API_KEY
cloudinary.api-secret=YOUR_CLOUDINARY_API_SECRET

# Razorpay
razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET

# Elasticsearch
spring.elasticsearch.uris=http://localhost:9200

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# SMTP Email (Gmail Example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Groq AI Key
groq.api.key=YOUR_GROQ_API_KEY
```

> [!NOTE]
> On startup, if the database is empty, the application runs the `AdminInitializer` to seed a default Administrator account:
> - **Email:** `admin@gmail.com`
> - **Password:** `Admin@453`
> - **Name:** `Prashanth`

### 3. Run Backend
```bash
cd TechMart_Backend
mvn clean spring-boot:run
```

### 4. Configure & Run Frontend
Create a `.env` file under `TechMart_Frontend/` (or update it):
```env
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
```
Install dependencies and run the development server:
```bash
cd TechMart_Frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📸 Screenshots
*(Add application screenshots here)*

---

## 🚀 Future Improvements
- **Microservices Architecture**: Transition backend services to Spring Cloud.
- **Dockerization**: Create Docker containers for the Backend, Frontend, MySQL, Redis, and Elasticsearch.
- **Kubernetes**: Orchestrate containers using K8s clusters.
- **Event Streaming**: Implement Apache Kafka for order processing events.
- **AI Recommendation Engine**: Advanced user recommendation engine based on collaborative filtering.
- **Voice & Image Search**: Support searching products via voice commands or uploaded product images.

---

## 👨‍💻 Author
**Prashanth**

Full Stack Developer | Spring Boot | React | Java | Elasticsearch | Redis | AI Integrations

```
