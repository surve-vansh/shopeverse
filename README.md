# ShopVerse 🛍️

A premium e-commerce SPA built with React + Vite.

## Features
- 🌗 Dark / Light theme toggle (persisted)
- 📱 OTP-based phone login (3-step flow)
- 🛒 Cart with quantity controls + localStorage sync
- ❤️ Wishlist / favorites
- 💳 Premium checkout (Address → Payment → Review → Success)
- 📦 FakeStore API product listing with category filters
- 📱 Fully responsive

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── App.jsx
├── main.jsx
├── context/AppContext.jsx       # Global state + ThemeSync
├── styles/global.css            # All CSS + dark mode variables
├── components/
│   ├── layout/Navbar.jsx + Footer.jsx
│   ├── sections/                # Hero, Products, About, Contact
│   ├── modals/                  # AuthModal (OTP), CartPanel, ProfileModal
│   ├── product/ProductCard.jsx
│   ├── ui/Notification.jsx
│   └── checkout/CheckoutPage.jsx # 3-step premium checkout
```

## OTP Login (Dev Mode)
Use phone number: any 10-digit number  
OTP: **123456**
