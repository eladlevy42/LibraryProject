const createBookGoogleUrl = `https://www.googleapis.com/books/v1/volumes?`;
let newBooksDetails = document.querySelector(".newBooksDetails");
let newBookWrapper = document.querySelector(".detailWrapper");
let createBookByName = document.querySelector('#createBookByName')
let createBookByISBN = document.getElementById("createBookByISBN")
let formChange = document.getElementById('formSelect')
let isbnBookForm = document.querySelector('.formISBNWrapper')
let nameBookForm = document.querySelector('.formNameWrapper')
let tempPopup = document.querySelector('.spinnerPopup')


function handleFormVisibility() {
  if (formChange.value == 'Name') {
      createBookByName.style.display = 'block';
      nameBookForm.style.display = 'flex'
      createBookByISBN.style.display = 'none';
      isbnBookForm.style.display = 'none'
  } else if (formChange.value == 'ISBN') {
      nameBookForm.style.display = 'none'
      createBookByName.style.display = 'none';
      createBookByISBN.style.display = 'block';
      isbnBookForm.style.display = 'flex'
  }
}
formChange.addEventListener('change', handleFormVisibility);
handleFormVisibility()


async function createNewBookByISBN() {
  const identifier = "ISBN";
  let bookIdentifier = document.getElementById(`book${identifier}`);
  let bookIdentifierValue = bookIdentifier.value;
  const url = `${createBookGoogleUrl}q=isbn:${bookIdentifierValue}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    let items = response.data.items;
    if (!items || items.length === 0) {
      showSnackbar(noBooksFailSnackbar)
      return;
    }
    let book = items[0];
    let parsedBook = parseBookInfo(book);
    const bookExists = await checkBookExists(parsedBook.book_name);
    if (bookExists) {
      showSnackbar(bookExistsFailSnackbar)
      return;
    }
    const historyObject = buildHistoryObject(parsedBook, "Created Book");
    await axios.post(jsonServerUrl, parsedBook);
    await axios.post(historyUrl, historyObject);
    showSnackbar(addBookSuccessSnackbar)
  } catch (error) {
    console.log(error);
    showSnackbar(generalFailSnackbar)
  }
}

async function createNewBookByName() {
  let booksAdded = 0
  let bookIdentifier = document.getElementById("bookName");
  let bookIdentifierValue = bookIdentifier.value;
  const url = `${createBookGoogleUrl}q=${bookIdentifierValue}&key=${apiKey}`;
  try {
    tempPopup.style.display = 'block'
    const response = await axios.get(url);
    let items = response.data.items;
    if (!items || items.length === 0) {
      showSnackbar(noBooksFailSnackbar)
      tempPopup.style.display = 'none'
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
      tempPopup.style.display = 'none'
        showSnackbar(noBooksFailSnackbar)
        return
    }
    tempPopup.style.display = 'none'
    newBookWrapper.style.display = "flex";
    let addButton = addButtonToPopup();
    addButton.addEventListener("click", addItemToServer);
    newBooksDetails.appendChild(addButton);
  } catch (error) {
    console.log(error);
    showSnackbar(generalFailSnackbar)
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
  bookDiv.classList.add('newBook')
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
  const results = { success: [], failure: [] };
  for (let book of selectedBooks) {
    try {
      const historyObject = buildHistoryObject(book, "Created Book");
      await axios.post(historyUrl, historyObject);
      await axios.post(jsonServerUrl, book);
      results.success.push(book.book_name);
    } catch (error) {
      results.failure.push({ book: book.book_name, error: error.message });
    }
  }
  resetPopup();
  showResultsSummary(results);
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
  try {
  const bookExists = await checkBookExists(formDataObj.book_name);
  if (bookExists) {
    showSnackbar(bookExistsFailSnackbar)
    return;
  }
    console.log(formDataObj);
    const historyObject = buildHistoryObject(formDataObj, "Created Book");
    await axios.post(jsonServerUrl, formDataObj, {
      headers: { "Content-Type": "application/json" },
    });
    await axios.post(historyUrl, historyObject);
    console.log(`${historyObject} succeded`);
    showSnackbar(addBookSuccessSnackbar)
  } catch (error) {
    showSnackbar(generalFailSnackbar)
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

createBookByName.addEventListener("submit", function (event) {
    event.preventDefault();
    createNewBookByName();
    document.getElementById("bookName").value = "";
  });


createBookByISBN.addEventListener("submit", function (event) {
    event.preventDefault();
    createNewBookByISBN();
    document.getElementById("bookISBN").value = "";
  });

mainForm.addEventListener("submit", function (event) {
  event.preventDefault();
  createBookByDetails();
  mainForm.reset();
});


function showResultsSummary(results) {
  let summaryMessage = `Books successfully added: ${results.success.length}\n`;
  if (results.failure.length > 0) {
    summaryMessage += `Books failed to add:\n`;
    results.failure.forEach(failure => {
      summaryMessage += `${failure.book}: ${failure.error}\n`;
    });
  }
  if (results.success.length == 0) {
    console.log('hi');
    addByNameSnackbar.classList.remove('successSnackbar');
    addByNameSnackbar.classList.add('failSnackbar');
  } else {
    console.log('hi');
    addByNameSnackbar.classList.remove('failSnackbar');
    addByNameSnackbar.classList.add('successSnackbar');
  }
  addByNameSnackbar.textContent = summaryMessage
  showSnackbar(addByNameSnackbar)
}