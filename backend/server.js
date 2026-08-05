// server.js - Berkas utama untuk menjalankan server Express.js
// Express digunakan untuk membuat web server dan menangani request HTTP.

// dotenv memuat variabel dari file .env (contoh: DATABASE_URL)
require('dotenv/config');

const express = require('express');
const cors = require('cors');

// Prisma Client adalah ORM untuk mengakses PostgreSQL.
// Client di-generate dari prisma/schema.prisma ke folder generated/prisma.
const { PrismaClient } = require('@prisma/client');
// PrismaPg adalah driver adapter yang menghubungkan Prisma ke PostgreSQL.
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

// Buat adapter koneksi database dari DATABASE_URL di file .env
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Inisialisasi Prisma Client dengan adapter tersebut
const prisma = new PrismaClient({ adapter });

// CORS middleware digunakan untuk mengizinkan frontend mengakses API dari domain/port yang berbeda
app.use(cors());

// Express middleware untuk membaca request body berformat JSON
app.use(express.json());

// Regex untuk memvalidasi format UUID (karena id Project adalah UUID)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Middleware untuk mengecek apakah :id adalah UUID yang valid
// Berguna agar id tidak valid (misal "abc") langsung dijawab 404, bukan error 500
app.use('/api/projects/:id', (req, res, next) => {
    if (!UUID_PATTERN.test(req.params.id)) {
        return res.status(404).json({
            success: false,
            message: "Project not found."
        });
    }
    next();
});

// Endpoint sederhana untuk pengetesan awal
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: "Backend server is running successfully!"
    });
});

// GET /api/projects - Mengambil semua project dari database
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects."
        });
    }
});

// GET /api/projects/:id - Mengambil satu project berdasarkan id
app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project."
        });
    }
});

// POST /api/projects - Menambah project baru ke database
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, link } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                link: link || ""
            }
        });

        res.status(201).json({
            success: true,
            data: newProject
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create project."
        });
    }
});

// PUT /api/projects/:id - Memperbarui project yang sudah ada
app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                link: link || ""
            }
        });

        res.json({
            success: true,
            data: updatedProject
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update project."
        });
    }
});

// DELETE /api/projects/:id - Menghapus project berdasarkan id
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.project.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        await prisma.project.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: "Project deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete project."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;