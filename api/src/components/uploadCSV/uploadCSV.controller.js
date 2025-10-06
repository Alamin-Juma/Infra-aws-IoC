import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const saltRounds = 10;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Function to process and store CSV data
const uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', async () => {
    try {
      const users = [];

      for (const row of results) {
        // Trim values and handle potential formatting issues
        const firstName = row['First Name']?.trim();
        const lastName = row['Last Name']?.trim();
        const email = row.Email?.trim();

        if (!firstName || !lastName || !email) {
          continue;
        }

        users.push({ firstName, lastName, email });
      }

      await prisma.user.createMany({
        data: users,
        skipDuplicates: true, // Ensure existing users don't cause errors
      });

      fs.unlinkSync(filePath); // Clean up file

      res.json({ message: 'CSV uploaded successfully!', inserted: users.length });
    } catch (error) {
      res.status(500).json({ error: 'Error processing CSV file', details: error.message });
    }
  });

};

export { upload, uploadCSV };
