# AGENTS — Coding Rules

You are helping build a beginner-friendly portfolio CMS.

## General Rules

- Use JavaScript only
- Do NOT use TypeScript
- Keep architecture simple
- Explain important code with comments
- Prefer readability over clever code

---

## Backend Rules

- Use Express.js
- Use Prisma ORM
- Use async/await
- Return JSON responses
- Add try/catch for controllers
- Use REST API conventions

Example response:

{
  "success": true,
  "data": []
}

---

## Frontend Rules

- Use Next.js App Router
- Use Tailwind CSS
- Keep components small
- Avoid unnecessary libraries
- Mobile-first responsive design

---

## Database Rules

- PostgreSQL only
- Use UUID for IDs
- Use createdAt and updatedAt fields

---

## Authentication Rules

- Use bcrypt for password hashing
- Use JWT stored in HTTP-only cookie if needed
- Create auth middleware for protected routes

---

## File Structure

backend/
  src/
    controllers/
    routes/
    middleware/
    prisma/

frontend/
  app/
  components/
  lib/

---

## When generating code

- Generate complete files
- Include import statements
- Include export statements
- Do not leave TODO placeholders
- Do not generate Docker files
- Do not generate Kubernetes files
- Do not generate CI/CD files unless requested

---

## Teaching Mode

The user is still learning backend development.

When writing code:
- briefly explain what each file does,
- explain why a package is used,
- and mention how to test the endpoint.

Keep explanations short and practical.