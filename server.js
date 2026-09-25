const express = require('express');
const app = express();

app.use(express.json());

// 1. Get all students
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM students ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch student records.' });
    }
});

// 2. Create a new student
app.post('/api/students', async (req, res) => {
    const { name, email, course } = req.body;
    if (!name || !email || !course) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        await db.execute('INSERT INTO students (name, email, course) VALUES (?, ?, ?)', [name, email, course]);
        res.status(201).json({ message: 'Student created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// 3. Update an existing student
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, course } = req.body;
    if (!name || !email || !course) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        await db.execute('UPDATE students SET name = ?, email = ?, course = ? WHERE id = ?', [name, email, course, id]);
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'This email is already registered by another student.' });
        }
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// 4. Delete a student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM students WHERE id = ?', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student.' });
    }
});