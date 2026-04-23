const express = require("express");
const fs = require("fs");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static("public"));

const data_file = "books.json";


// SAFE READ
const getBooks = () => {
    try {
        if (!fs.existsSync(data_file)) return [];

        const data = fs.readFileSync(data_file, "utf-8");

        if (!data || data.trim() === "") return [];

        return JSON.parse(data);

    } catch (err) {
        console.error("Error reading books.json:", err);
        return [];
    }
};


// SAFE WRITE
const writeBooks = (books) => {
    try {
        fs.writeFileSync(data_file, JSON.stringify(books, null, 2));
    } catch (err) {
        console.error("Error writing books.json:", err);
    }
};


// GET ALL BOOKS
app.get("/books", (req, res) => {
    try {
        let books = getBooks();
        const { search, genre, status } = req.query;

        if (search) {
            const s = search.toLowerCase();
            books = books.filter(b =>
                (b.name || "").toLowerCase().includes(s) ||
                (b.genre || "").toLowerCase().includes(s)
            );
        }

        if (genre) {
            books = books.filter(b =>
                (b.genre || "").toLowerCase() === genre.toLowerCase()
            );
        }

          // 🔥 THIS IS THE FIX
    if (status) {
        books = books.filter(b =>
            (b.status || "Not Started").toLowerCase() === status.toLowerCase()
        );
    }

        res.json(books);

    } catch (err) {
        console.error("GET /books error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ADD BOOK
app.post("/books", (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Missing request body" });
        }

        const { name, genre, description, author, rating, status } = req.body;

        if (!name || !genre) {
            return res.status(400).json({ error: "Name and Genre are required" });
        }

        const books = getBooks();

        const newBook = {
            id: Date.now().toString(),
            name: name.trim(),
            genre: genre.trim(),
            description: description || "",
            author: author || "",
            rating: rating || "",
            status: status || "Not Started",
            date: new Date().toLocaleString()
        };

        books.push(newBook);
        writeBooks(books);

        res.status(201).json(newBook);

    } catch (err) {
        console.error("POST /books error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/books/:id", (req, res) => {
    const books = getBooks();
    const book = books.find(b => b.id === req.params.id);

    if (!book) return res.status(404).json({ error: "Book not found" });

    res.json(book);
});


// UPDATE BOOK
app.put("/books/:id", (req, res) => {
    const books = getBooks();

    const book = books.find(b => b.id === req.params.id);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    if (req.body.name !== undefined) book.name = req.body.name;
    if (req.body.genre !== undefined) book.genre = req.body.genre;
    if (req.body.description !== undefined) book.description = req.body.description;
    if (req.body.author !== undefined) book.author = req.body.author;
    if (req.body.rating !== undefined) book.rating = req.body.rating;
    if (req.body.status !== undefined) book.status = req.body.status;

    if (req.body.status !== undefined) {
    book.status = req.body.status;
}

    writeBooks(books);
    res.json(book);
});

// DELETE BOOK
app.delete("/books/:id", (req, res) => {
    try {
        let books = getBooks();

        const filtered = books.filter(b => b.id !== req.params.id);

        if (filtered.length === books.length) {
            return res.status(404).json({ error: "Book not found" });
        }

        writeBooks(filtered);

        res.json({ message: "Book deleted" });

    } catch (err) {
        console.error("DELETE /books error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// START SERVER
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});