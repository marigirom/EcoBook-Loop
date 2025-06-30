# EcoBook-Loop

EcoBook Loop is a modular material exchange platform that simplifies book donations and paper recycling across Kenya. The system connects households, businesses, and paper mills to promote resource reuse and environmental sustainability through efficient scheduling, request management, and incentive payments.

## Project Overview

EcoBook Loop is built as a **Progressive Web App (PWA)** with **USSD integration** to ensure accessibility for both smartphone and feature phone users.

**Key User Groups:**
- Households donating books or recyclable paper
- Recipients requesting books
- Paper mills sourcing recyclable materials

## Technology Stack

**Frontend:**
- React (PWA)
- Tailwind CSS for styling

**Backend:**
- Node.js with Express
- PostgreSQL with Sequelize ORM

**Other Integrations:**
- JWT Authentication
- bcrypt for secure password storage
- Africa's Talking API for USSD functionality
- M-Pesa C2B simulation for donor incentive payments
- Cloudflared for local USSD testing

## Core Features

- User registration, login, and secure JWT-based authentication
- Book listing and requests with status tracking
- Recyclable material listing and request handling for paper mills
- Delivery scheduling for recyclable pickups
- Notification system for real-time request and delivery updates
- Incentive payments via EcoPay after verified recyclable deliveries
- USSD support for registration and material listing on feature phones
- Admin dashboard for managing users, materials, and system reports

## Setup & Configuration

- React frontend initialized with `create-react-app`
- Express backend configured for PostgreSQL with UTC timezone enforcement
- Environment variables required for:
  - JWT secret
  - Database credentials
  - Africa's Talking API keys
  - M-Pesa sandbox or live credentials

## Limitations & Future Considerations

- Africa's Talking USSD network currently unstable; Cloudflared tunnel used for local USSD testing
- Scaling plans include:
  - Full GPS tracking for deliveries
  - Enhanced USSD support once network stability is resolved
  - Expanded payment capabilities beyond M-Pesa simulation

## Useful Links

- Africa's Talking API Documentation: https://developers.africastalking.com
- M-Pesa Daraja API (C2B Simulation Reference): https://developer.safaricom.co.ke/daraja/apis/post/simulate-c2b-transaction
- PostgreSQL Timezone Configuration Guide: https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES
- Paper Recycling Industry Overview (IEA): https://www.iea.org/energy-system/industry/paper
- Sustainable Paper Recycling Reference: https://sustainablebrands.com/read/corporate-member-update/paper-recycling-as-a-means-of-protecting-world-forests
