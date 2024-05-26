const apiKey = "AIzaSyBr44eXMiG4uM7nz0--vgitm2I8OYQ0J9I";
const searchQuery = "a";
const maxResults = 40; // Maximum number of results per page (10 to 40)
const totalBooksToFetch = 400; // Total number of books you want to fetch
const jsonServerUrl = "http://localhost:8001/books"; // Your JSON server URL
let allBooks = [];
let currentPage = 1; //the current page of the grid. the total pages will be 9 when the 9th page is only 4 books.
init();
function parseBookInfo(identifier) {
  const volumeInfo = identifier.volumeInfo;
  const formattedBook = {
    id: identifier.id,
    bookName: volumeInfo.title || "No Title",
    authorsName: volumeInfo.authors || ["Unknown Author"],
    numPages: volumeInfo.pageCount || 0,
    shortDescription: volumeInfo.description || "No Description",
    image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "No Image",
    numCopies: Math.floor(Math.random() * 10) + 1, // Random number of copies between 1 and 10
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
async function init() {
  allBooks = await axios.get(jsonServerUrl).then((response) => {
    return response.data;
  });
  await openPage();
}
async function openPage() {
  const url = `http://localhost:8001/books/?_page=${currentPage}&_per_page=9`;
  let booksArr = [];
  const bookGridElement = document.querySelector("#booksGrid");
  booksArr = await axios.get(url).then((response) => {
    return response.data.data;
  });
  document.querySelector("#booksGrid").innerHTML =
    "  <div class='spinner'></div>";
  document.querySelector(".spinner").style.display = "none";
  booksArr.forEach((book) => {
    let gridItem = document.createElement("div");
    gridItem.id = book.id;
    gridItem.classList.add("book");
    let image = document.createElement("img");
    image.src = book.image;
    let title = document.createElement("span");
    title.classList.add("book-title");
    title.textContent = book.book_name;
    let author = document.createElement("span");
    author.classList.add("book-author");
    author.textContent = book.authors_name;
    gridItem.appendChild(image);
    gridItem.appendChild(title);
    gridItem.appendChild(author);
    bookGridElement.appendChild(gridItem);
  });
}
async function switchPage(direction) {
  if (
    direction == "next" &&
    currentPage != Math.floor(allBooks.length / 9) + 1
  ) {
    currentPage++;
  } else if (currentPage != 1 && direction == "back") {
    currentPage--;
  }
  showSpinner();
  await openPage();
}

function showSpinner() {
  document.querySelector(".spinner").style.display = "block";
}
