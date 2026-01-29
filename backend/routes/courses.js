
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection pool

// Example: Get all courses
router.get('/', async (req, res) => {
  try {
    // In a real scenario, you'd fetch from the database:
    const [rows] = await db.query('SELECT id, code, name, creditHours, \`group\` FROM courses');
    // Ensure creditHours is a number
    const courses = rows.map(course => ({
      ...course,
      creditHours: Number(course.creditHours)
    }));
    res.json(courses);

    // For now, returning mock data similar to your initial frontend data
    // Ensure this structure matches your frontend's Course type
    // const mockCourses = [
    //   { id: 'crs1', code: 'CS101', name: 'Introduction to Computer Science (API)', creditHours: 3, group: 'Core' },
    //   { id: 'crs2', code: 'PHY201', name: 'Classical Mechanics (API)', creditHours: 4, group: 'Physics Core' },
    //   { id: 'crs3', code: 'BIO105', name: 'Principles of Biology (API)', creditHours: 3, group: 'Biology Core' },
    //   { id: 'crs4', code: 'MAT300', name: 'Advanced Calculus (API)', creditHours: 3, group: 'Math Elective' },
    //   { id: 'crs5', code: 'CHEM101', name: 'General Chemistry (API)', creditHours: 4, group: 'Chemistry Core'}
    // ];
    // res.json(mockCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Send a more structured error response
    res.status(500).json({ error: 'Failed to fetch courses from database.', details: error.message });
  }
});

// Example: Add a new course
router.post('/', async (req, res) => {
  const { code, name, creditHours, group } = req.body;
  if (!code || !name || !creditHours) {
    return res.status(400).json({ error: 'Missing required fields: code, name, creditHours' });
  }
  if (typeof creditHours !== 'number' || creditHours <= 0) {
    return res.status(400).json({ error: 'Credit hours must be a positive number.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO courses (code, name, creditHours, `group`) VALUES (?, ?, ?, ?)',
      [code, name, creditHours, group || null]
    );
    // MySQL insertId returns a BigInt with some drivers, ensure it's a string for consistency with 'crs' prefix later if needed
    const newCourseId = result.insertId.toString(); 
    
    // Fetch the newly created course to return it
    const [newCourseRows] = await db.query('SELECT id, code, name, creditHours, `group` FROM courses WHERE id = ?', [newCourseId]);
    if (newCourseRows.length === 0) {
      // This should ideally not happen if insert was successful
      return res.status(500).json({ error: 'Failed to retrieve course after adding.' });
    }
    const newCourse = {
        ...newCourseRows[0],
        creditHours: Number(newCourseRows[0].creditHours) // Ensure creditHours is a number
    };
    res.status(201).json(newCourse);
    
  } catch (error) {
    console.error('Error adding course to database:', error);
    res.status(500).json({ error: 'Failed to add course to database.', details: error.message });
  }
});

// GET a single course by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming id might have 'crs' prefix, remove it for DB query if your DB IDs are numeric
    const numericId = id.startsWith('crs') ? id.substring(3) : id;
    const [rows] = await db.query('SELECT id, code, name, creditHours, `group` FROM courses WHERE id = ?', [numericId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
     const course = {
        ...rows[0],
        creditHours: Number(rows[0].creditHours)
    };
    res.json(course);
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    res.status(500).json({ error: `Failed to fetch course with ID ${id}.`, details: error.message });
  }
});

// PUT (Update) an existing course
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { code, name, creditHours, group } = req.body;

  if (!code || !name || !creditHours) {
    return res.status(400).json({ error: 'Missing required fields: code, name, creditHours' });
  }
  if (typeof creditHours !== 'number' || creditHours <= 0) {
    return res.status(400).json({ error: 'Credit hours must be a positive number.' });
  }
  
  // Assuming id might have 'crs' prefix, remove it for DB query
  const numericId = id.startsWith('crs') ? id.substring(3) : id;

  try {
    const [result] = await db.query(
      'UPDATE courses SET code = ?, name = ?, creditHours = ?, `group` = ? WHERE id = ?',
      [code, name, creditHours, group || null, numericId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found or no changes made' });
    }

    // Fetch the updated course to return it
    const [updatedCourseRows] = await db.query('SELECT id, code, name, creditHours, `group` FROM courses WHERE id = ?', [numericId]);
    if (updatedCourseRows.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve course after update.' });
    }
    const updatedCourse = {
        ...updatedCourseRows[0],
        creditHours: Number(updatedCourseRows[0].creditHours)
    };
    res.json(updatedCourse);

  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    res.status(500).json({ error: `Failed to update course with ID ${id}.`, details: error.message });
  }
});

// DELETE a course
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = id.startsWith('crs') ? id.substring(3) : id;

  try {
    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [numericId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' }); // Or 204 No Content
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    res.status(500).json({ error: `Failed to delete course with ID ${id}.`, details: error.message });
  }
});


module.exports = router;
