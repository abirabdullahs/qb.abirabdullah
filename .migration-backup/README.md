# Online Smart Question Bank

A modern, scalable, and intelligent question bank platform for academic and admission exam preparation.

The platform is designed to organize questions from SSC, HSC, Dakhil, Alim, and admission examinations in a structured way. It supports MCQ, CQ, and written questions, hierarchical academic classification, admission exam structures, cluster exams, centralized exams, Bangla content, LaTeX-based mathematical expressions, image attachments, question review workflows, tagging, duplicate detection, mock tests, and performance analytics.

---

Features

Question Management

- MCQ, CQ, and Written question support
- Bangla and English question support
- Bangla text with inline and block LaTeX
- Question difficulty classification
- Marks and year tracking
- Previous-year question support
- Question explanation and answer support
- Video solution URL support
- Duplicate question detection
- Question status workflow

pending → approved
        ↘ rejected

---

Academic Structure

The platform supports hierarchical academic classification:

Segment
   ↓
Group
   ↓
Subject
   ↓
Chapter
   ↓
Topic
   ↓
Sub-topic

Example:

HSC
 └── Science
      └── Physics
           └── Mechanics
                └── Motion
                     └── Projectile Motion

Supported academic entities:

- Segments
- Groups
- Subjects
- Subject-group mappings
- Chapters
- Topics
- Sub-topics
- Education boards

---

Admission Exam Support

The system supports different types of admission examinations.

Single Institute Exam

BUET Admission Exam
        ↓
BUET

Cluster Exam

GST Admission Exam
        ↓
       Units
     ┌──┼──┐
     A  B  C
     │
     └── Multiple Institutes

Centralized Exam

Medical Admission Exam
        ↓
 One National Question Set
        ↓
 Allocation Happens Separately

Supported admission entities:

- Admission segments
- Institutes
- Admission exams
- Admission units
- Unit-institute mappings
- Negative marking

---

Question Types

MCQ

Question
   └── Options
       ├── A
       ├── B
       ├── C
       └── D

Each option can contain:

- Option text
- Correctness
- Explanation
- Ordering

---

CQ

Question
   ├── ক
   ├── খ
   ├── গ
   └── ঘ

Each sub-part supports:

- Question text
- Marks
- Cognitive level
- Answer
- Explanation

---

Written Question

Written questions support:

- Question text
- Answer
- Explanation
- Image attachments
- Mathematical expressions

---

Content Support

The platform supports Bangla, English, and mathematical expressions in the same content.

Example:

একটি বস্তুর ভর $m = 5\,kg$ এবং ত্বরণ $a = 2\,m/s^2$।

The frontend can render mathematical expressions using a LaTeX-compatible renderer.

Supported content areas:

- Question text
- Stimulus
- Options
- CQ sub-parts
- Answers
- Explanations

---

Question Review Workflow

Questions can be submitted by contributors and reviewed by moderators.

Contributor
     │
     ▼
  Create
 Question
     │
     ▼
  Pending
     │
     ├──────────────┐
     ▼              ▼
 Approved        Rejected

Available roles:

Role| Responsibility
Admin| Full system access
Moderator| Review and approve questions
Teacher| Create and manage educational content
Contributor| Submit questions

---

Question Organization

Questions can be classified using multiple dimensions:

Question
│
├── Academic / Admission
│
├── Segment
│
├── Group
│
├── Subject
│
├── Chapter
│
├── Topic
│
├── Sub-topic
│
├── Exam
│
├── Board
│
├── Year
│
├── Difficulty
│
├── Tags
│
└── Question Type

---

Mock Tests and Question Sets

The platform supports custom question sets and mock tests.

Question Set
    │
    ├── Question 1
    ├── Question 2
    ├── Question 3
    └── Question N

Features:

- Custom question set creation
- Question ordering
- Marks override
- Negative marking
- Question selection
- Mock test support

---

Analytics

Question usage statistics can be tracked.

Available statistics include:

- Attempt count
- Correct answer count
- Average solving time
- Accuracy

Example:

Question Statistics

Attempts:       12,540
Correct:         8,921
Accuracy:        71.14%
Average Time:       42s

---

Architecture

The project follows a domain-based modular monolith architecture.

┌─────────────────────────────┐
│           Next.js           │
│        App Router           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│            Domains          │
│                             │
│  Academic                   │
│  Admission                  │
│  Question                   │
│  Review                     │
│  User                       │
│  Question Set               │
│  Attachment                 │
│  Statistics                 │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Services           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Repositories         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
└─────────────────────────────┘

---

Project Structure

question-bank/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── layout.tsx
│   │
│   ├── domains/
│   │   │
│   │   ├── academic/
│   │   ├── admission/
│   │   ├── question/
│   │   ├── content/
│   │   ├── attachment/
│   │   ├── tag/
│   │   ├── review/
│   │   ├── user/
│   │   ├── question-set/
│   │   ├── statistics/
│   │   └── search/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── providers/
│   │
│   ├── lib/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── http/
│   │   ├── cache/
│   │   ├── logger/
│   │   └── utils/
│   │
│   ├── config/
│   ├── hooks/
│   ├── types/
│   └── styles/
│
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── factories/
│
├── scripts/
├── tests/
├── docs/
│
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── README.md

---

Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js Server Actions
- Next.js Route Handlers
- Domain-based services
- Repository pattern

Database

- PostgreSQL
- Drizzle ORM

Validation

- Zod

Authentication

- Role-based authentication and authorization

Content

- Bangla Unicode support
- LaTeX rendering
- Rich text support

Storage

- Object storage for image attachments

---

Database Domains

The database is divided into the following logical domains.

Academic

segments
groups
boards
subjects
subject_groups
chapters
topics
sub_topics

Admission

admission_segments
institutes
admission_exams
admission_units
admission_unit_institutes

Questions

questions
question_options
question_sub_parts
question_boards

Content

attachments
tags
question_tags

Users and Review

users

Statistics

question_stats

Question Sets

question_sets
question_set_items

---

Getting Started

Prerequisites

Make sure the following are installed:

- Node.js
- PostgreSQL
- npm, pnpm, or yarn

---

Clone the Repository

git clone <repository-url>

cd question-bank

---

Install Dependencies

npm install

or:

pnpm install

---

Environment Variables

Create a ".env" file:

DATABASE_URL="postgresql://username:password@localhost:5432/question_bank"

AUTH_SECRET="your-auth-secret"

STORAGE_ENDPOINT=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
STORAGE_BUCKET=""

---

Setup Database

Create the PostgreSQL database:

CREATE DATABASE question_bank
WITH ENCODING 'UTF8'
TEMPLATE template0;

Run database migrations:

npm run db:migrate

Seed initial data:

npm run db:seed

---

Start Development Server

npm run dev

The application will be available at:

http://localhost:3000

---

Database Commands

# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Push schema
npm run db:push

# Seed database
npm run db:seed

# Open database studio
npm run db:studio

---

Development Workflow

A typical question creation flow:

User
 │
 ▼
Question Form
 │
 ▼
Zod Validation
 │
 ▼
Server Action
 │
 ▼
Question Service
 │
 ▼
Question Repository
 │
 ▼
Database Transaction
 │
 ├── questions
 ├── question_options
 ├── question_sub_parts
 ├── question_tags
 └── attachments

---

API Example

Get Questions

GET /api/questions

Example filters:

/api/questions?
segment=HSC
&group=Science
&subject=Physics
&chapter=Mechanics
&type=MCQ
&difficulty=hard
&year=2025
&status=approved

---

Get a Single Question

GET /api/questions/:id

---

Create a Question

POST /api/questions

---

Update a Question

PATCH /api/questions/:id

---

Delete a Question

DELETE /api/questions/:id

---

Coding Principles

Domain-Based Architecture

Business logic should stay inside the appropriate domain.

Question Logic
    ↓
domains/question

Admission Logic
    ↓
domains/admission

Review Logic
    ↓
domains/review

---

Service and Repository Separation

Component
    ↓
Service
    ↓
Repository
    ↓
Database

Components should not directly communicate with the database.

Bad:

Component
    ↓
Database

Good:

Component
    ↓
Server Action
    ↓
Service
    ↓
Repository
    ↓
Database

---

Testing

Tests are organized into three levels.

tests/
│
├── unit/
│   ├── question/
│   ├── admission/
│   └── review/
│
├── integration/
│   ├── question-api/
│   └── database/
│
└── e2e/
    ├── authentication/
    ├── question-creation/
    └── question-review/

Run tests:

npm run test

Run end-to-end tests:

npm run test:e2e

---

Future Roadmap

- [ ] Advanced full-text question search
- [ ] AI-powered duplicate detection
- [ ] AI-generated question explanation
- [ ] AI-powered question categorization
- [ ] Personalized question recommendation
- [ ] Adaptive mock tests
- [ ] Student performance tracking
- [ ] Question difficulty prediction
- [ ] Mobile application
- [ ] Offline question access
- [ ] Community contribution system
- [ ] Teacher dashboard
- [ ] Advanced analytics
- [ ] PDF question paper generation
- [ ] Exam result analysis

---

Contribution

Contributions are welcome.

Before submitting a pull request:

1. Create a new branch.
2. Follow the existing domain structure.
3. Keep business logic inside the correct domain.
4. Add validation for new inputs.
5. Add tests where necessary.
6. Run linting and tests before submitting.

Example:

git checkout -b feature/question-search

---

License

This project is currently under development.

License information will be added in the future.

---

Project Vision

The goal of Online Smart Question Bank is to build a structured, searchable, intelligent, and community-driven question platform for students, teachers, and educational contributors.

The system is designed to grow from a traditional question bank into a complete intelligent learning platform.
