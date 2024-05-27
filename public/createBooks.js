const createBookGoogleUrl = `https://www.googleapis.com/books/v1/volumes?`;
let newBooksDetails = document.querySelector(".newBooksDetails");
let newBookWrapper = document.querySelector(".detailWrapper");

async function createNewBookByISBN() {
  const identifier = "ISBN";
  let bookIdentifier = document.getElementById(`book${identifier}`);
  let bookIdentifierValue = bookIdentifier.value;
  const url = `${createBookGoogleUrl}q=isbn:${bookIdentifierValue}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    let items = response.data.items;
    if (!items || items.length === 0) {
      alert("No matching books found");
      return;
    }
    let book = items[0];
    let parsedBook = parseBookInfo(book);
    const bookExists = await checkBookExists(parsedBook.book_name);
    if (bookExists) {
      alert("Book already exists!");
      return;
    }
    await axios.post(jsonServerUrl, parsedBook);
    const historyObject = buildHistoryObject(parsedBook, "Created Book");
    await axios.post(historyUrl, historyObject);
    alert("Created book successfully!");
  } catch (error) {
    console.log(error);
    alert(error);
  }
}

async function createNewBookByName() {
  let booksAdded = 0
  let bookIdentifier = document.getElementById("bookName");
  let bookIdentifierValue = bookIdentifier.value;
  const url = `${createBookGoogleUrl}q=${bookIdentifierValue}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    let items = response.data.items;
    if (!items || items.length === 0) {
      alert("No matching books found");
      return;
    }
    for (let item of items) {
      let book = parseBookInfo(item);
      const bookExists = await checkBookExists(book.book_name);
      if (bookExists) {
        continue;
      }
      processNewBooks(book);
      booksAdded++
    }
    if(booksAdded === 0){
        alert('no books found')
        return
    }
    newBookWrapper.style.display = "flex";
    let addButton = addButtonToPopup();
    addButton.addEventListener("click", addItemToServer);
    newBooksDetails.appendChild(addButton);
  } catch (error) {
    console.log(error);
    alert(error);
  }
}

function addButtonToPopup() {
  let addButton = document.createElement("button");
  addButton.classList.add("add-books-button");
  addButton.textContent = "Add books";

  return addButton;
}

function processNewBooks(book) {
  let bookDiv = document.createElement("div");
  bookDiv.classList.add("book");
  let bookImg = document.createElement("img");
  bookImg.src = book.image;
  bookImg.alt = book.book_name;
  bookImg.title = "Add to library";
  bookImg.classList.add("book-image");
  let bookTitle = document.createElement("span");
  bookTitle.classList.add("book-title");
  bookTitle.textContent = book.book_name;
  let author = document.createElement("span");
  author.classList.add("book-author");
  author.textContent = book.authors_name;
  bookDiv.appendChild(bookImg);
  bookDiv.appendChild(bookTitle);
  bookDiv.appendChild(author);
  bookDiv.addEventListener("click", function () {
    toggleBookSelection(book, bookDiv);
  });
  newBooksDetails.appendChild(bookDiv);
}

let selectedBooks = [];

async function addItemToServer() {
  try {
    for (let book of selectedBooks) {
      const historyObject = buildHistoryObject(book, "Created Book");
      console.log("Posting history object:", historyObject);
      await axios
        .post(historyUrl, historyObject)
        .then((response) => console.log("History added:", response.data))
        .catch((error) => console.error("Error adding to history:", error));

      await axios
        .post(jsonServerUrl, book)
        .then((response) => console.log("Book added:", response.data))
        .catch((error) => console.error("Error adding book:", error));
    }
    resetPopup();
  } catch (error) {
    alert(error);
  }
}

function toggleBookSelection(book, bookDiv) {
  let index = selectedBooks.findIndex((b) => b.book_name === book.book_name);
  if (index > -1) {
    selectedBooks.splice(index, 1);
    bookDiv.classList.remove("selected");
    console.log(selectedBooks);
  } else {
    selectedBooks.push(book);
    bookDiv.classList.add("selected");
    console.log(selectedBooks);
  }
}

function resetPopup() {
  newBookWrapper.style.display = "none";
  selectedBooks = [];
  newBooksDetails.innerHTML = "";
}

let mainForm = document.getElementById("createBookByDetails");

async function createBookByDetails() {
  let formData = new FormData(mainForm);
  const formDataObj = handleFormData(formData);
  const bookExists = await checkBookExists(formDataObj.book_name);
  if (bookExists) {
    alert("Book already exists");
    return;
  }
  console.log(formDataObj);
  try {
    await axios.post(jsonServerUrl, formDataObj, {
      headers: { "Content-Type": "application/json" },
    });
    const historyObject = buildHistoryObject(formDataObj, "Created Book");
    await axios.post(historyUrl, historyObject);
  } catch (error) {
    alert(error);
  }
}

async function checkBookExists(bookName) {
  try {
    const response = await axios.get(
      `${jsonServerUrl}?book_name=${encodeURIComponent(bookName)}`
    );
    return response.data.length > 0;
  } catch (error) {
    console.error("Error checking if book exists:", error);
    return false;
  }
}

function handleFormData(formData) {
  let formDataObj = {};
  formData.forEach((value, key) => {
    if (key === "authors_name" || key === "categories") {
      formDataObj[key] = value.split(",").map((item) => item.trim());
    } else {
      formDataObj[key] = value;
    }
  });
  if (formDataObj.ISBN.trim() === "") {
    formDataObj.ISBN = undefined;
  }
  if (!formDataObj.image) {
    formDataObj.image = ""; // Set to empty string if no image provided
  }
  return formDataObj;
}

function hideBooksWrapper() {
  resetPopup();
}

document
  .getElementById("createBookByName")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    createNewBookByName();
    document.getElementById("bookName").value = "";
  });

document
  .getElementById("createBookByISBN")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    createNewBookByISBN();
    document.getElementById("ISBN").value = "";
  });

mainForm.addEventListener("submit", function (event) {
  event.preventDefault();
  createBookByDetails();
  mainForm.reset();
});
