const jsonServerUrl = "http://localhost:8001/books";
const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=a&key=${apiKey}`;
const historyUrl = `http://localhost:8001/history`;
const favURL = `http://localhost:8001/favorites`;
let allBooks = [];
let getBooks;
let totalPages;
let currentPage = 1; //the current page of the grid. the total pages will be 9 when the 9th page is only 4 books.
let spinner = document.querySelector(".spinner");
let generalFailSnackbar = document.querySelector(".generalMessage");
let deleteSuccessSnackbar = document.querySelector(".deleteSuccess");
let addBookSuccessSnackbar = document.querySelector(".addBookSuccess");
let noBooksFailSnackbar = document.querySelector(".noBooksFound");
let bookExistsFailSnackbar = document.querySelector(".bookAlreadyExists");
let addByNameSnackbar = document.querySelector(".addByName");
let enterNameFailSnackbar = document.querySelector(".enterName");
let removedFavoriteFailSnackbar = document.querySelector(".removeFavorite");
let addedFavoriteSuccessSnackbar = document.querySelector(".addFavorite");

function parseBookInfo(book) {
  let volumeInfo = book.volumeInfo;
  const formattedBook = {
    id: book.id,
    book_name: volumeInfo.title || "No Title",
    authors_name: volumeInfo.authors || ["Unknown Author"],
    num_pages: volumeInfo.pageCount || 0,
    short_description: volumeInfo.description || "No Description",
    image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "No Image",
    num_copies: Math.floor(Math.random() * 10) + 1, // Random number of copies between 1 and 10
    categories: volumeInfo.categories || ["Uncategorized"],
    ISBN: volumeInfo.industryIdentifiers
      ? volumeInfo.industryIdentifiers.find(
          (identifier) =>
            identifier.type === "ISBN_13" || identifier.type === "ISBN_10"
        )?.identifier
      : "No ISBN",
  };
  return formattedBook;
}
async function initBookArr() {
  try {
    const response = await axios.get(jsonServerUrl);
    allBooks = response.data;
    totalPages = Math.ceil(allBooks.length / 9);
  } catch (error) {
    showSnackbar(generalFailSnackbar);
  }
}

function buildHistoryObject(book, action) {
  let bookName = book.book_name;
  let bookISBN = book.ISBN;
  let bookAction = action;
  let bookId = book.id;
  let actionTime = getCurrentDateTime();
  const historyObject = {
    id: bookId,
    book_name: bookName,
    ISBN: bookISBN,
    action: bookAction,
    time: actionTime,
    timeAdded: Date.now(),
  };
  return historyObject;
}

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function showSpinner() {
  document.querySelector(".spinner").style.display = "block";
}

function showSnackbar(snackbarMessage) {
  snackbarMessage.classList.remove("show");
  void snackbarMessage.offsetWidth; // Trigger reflow to restart the animation
  snackbarMessage.classList.add("show");

  // Clear any existing timeout associated with this snackbar
  if (snackbarMessage.timeoutId) {
    clearTimeout(snackbarMessage.timeoutId);
  }

  // Set a new timeout to hide the snackbar
  snackbarMessage.timeoutId = setTimeout(function () {
    snackbarMessage.classList.remove("show");
  }, 2400);
}
document.querySelector("#Xside").addEventListener("click", () => {
  document.querySelector(".sideBar").classList.remove("show");
  document.querySelector("#burger").style.visibility = "visible";
});
document.querySelector("#burger").addEventListener("click", () => {
  document.querySelector(".sideBar").classList.add("show");
  document.querySelector("#burger").style.visibility = "hidden";
});
