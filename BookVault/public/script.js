const API = "/books"; //This is the base URL for your backend.

async function loadBooks(url = API) {
    //Fetch data
    const res = await fetch(url); //Fetches books from backend

    if (!res.ok) { //Checks for errors
        const text = await res.text();
        console.error("Server error:", text);
        return;
    }

    //Convert to JSON
    const books = await res.json();

    const list = document.getElementById("BookList");
    //Clear Screen
    list.innerHTML = "";

    //Book information - loop through books and display them
    books.forEach(book => {
        list.innerHTML += `
        <div class="book">
        <h3>${book.name}</h3>
        <p><b>Genre: </b>${book.genre}</p>
        <p><b>Description: </b>${book.description}</p>
        <p><b>Author: </b>${book.author}</p>
        <p><b>Rating: </b>${book.rating}</p>
        <p><b>Status:</b> ${book.status || "Not Started"}</p>
       <button onclick="deleteBook('${book.id}')">Delete</button>
    <button onclick="editBook('${book.id}')">Edit</button>
    <button onclick="toggleStatus('${book.id}', '${book.status || "Not Started"}')">Toggle Status</button>
        </div>
        `;
    });
}

//Add book- takes input from frontend and sends it to backend
async function addBook() {
    

    const name = document.getElementById("bookTitle").value.trim();
    const genre = document.getElementById("bookGenre").value.trim();
    const description = document.getElementById("bookDescription").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const rating = document.getElementById("bookRating").value.trim();

    //Validation 
    if (!name || !genre) {
        showError("Please enter the name and genre!");
        return;
    }
//Send POST request
    const res = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, genre, description, author, rating })
    });
//Handles request
    if (!res.ok) {
        const data = await res.json();
        showError(data.error || "Something went wrong");
        return;
    }

    const data = await res.json();

    clearError();

    document.getElementById("bookTitle").value = ""; 
    document.getElementById("bookGenre").value = "";
    document.getElementById("bookDescription").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookRating").value = "";

    loadBooks();
}

//Edit existing Book name, genre, description, author, status and rating - Updates Book
async function editBook(id, currentName, currentGenre, currentDescription, currentAuthor, currentRating, currentStatus) {

    const newName = prompt("Edit Book Name:", currentName);
    if (newName === null) return;

    let newGenre = prompt("Edit Genre:", currentGenre);
    if (newGenre === null) return;

    let newDescription = prompt("Edit Description:", currentDescription);
    if (newDescription === null) return;

    let newAuthor = prompt("Edit Author:", currentAuthor);
    if (newAuthor === null) return;

    let newRating = prompt("Edit Rating", currentRating);
    if (newRating === null) return;

    let newStatus = prompt(
    "Edit Status (Not Started / Currently Reading / Finished):",
    currentStatus
);

if (newStatus === null) return;
    

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newName,
            genre: newGenre,
            description: newDescription,
            author: newAuthor,
            rating: newRating,
            status: newStatus
        })
    });

    loadBooks();
}

async function toggleStatus(id, currentStatus = "Not Started") {

    let newStatus;

    if (currentStatus === "Not Started") {
        newStatus = "Currently Reading";
    } 
    else if (currentStatus === "Currently Reading") {
        newStatus = "Finished";
    } 
    else {
        newStatus = "Not Started";
    }

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
    });

    loadBooks();
}
//Delete Book
async function deleteBook(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadBooks();
}

//Search for a book
function searchBooks() {
    const value = document.getElementById("search").value;
    loadBooks(`${API}?search=${value}`);
}

//Filters Books
function filterBooks(status) {
    loadBooks(`${API}?status=${status}`);
}

function showError(message) {
    document.getElementById("errorMsg").innerText = message;
}

function clearError() {
    document.getElementById("errorMsg").innerText = "";
}

loadBooks();