const jsonServerUrl = "http://localhost:8001/books";
const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=a&key=${apiKey}`;
const historyUrl = `http://localhost:8001/history`;
const favURL = `http://localhost:8001/favorites`;
let allBooks = [];
let getBooks;
let totalPages;
let currentPage = 1; //the current page of the grid. the total pages will be 9 when the 9th page is only 4 books.
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
    console.error("Error fetching books:", error);
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
