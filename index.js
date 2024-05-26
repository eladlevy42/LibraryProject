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
function hideDetailWrapper() {
  document.querySelector("#detailWrapper").style.display = "none";
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
  bookGridElement.innerHTML = "";
  let spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.style.display = "block";
  bookGridElement.appendChild(spinner);
  document.querySelector("#back").style.display = "none";
  document.querySelector("#next").style.display = "none";
  const imagePromises = booksArr.map((book) => loadImage(book.image));
  const images = await Promise.all(imagePromises);
  booksArr.forEach((book, index) => {
    spinner.style.display = "none";
    document.querySelector("#back").style.display = "block";
    document.querySelector("#next").style.display = "block";
    let gridItem = document.createElement("div");
    gridItem.id = book.id;
    gridItem.classList.add("book");
    let image = document.createElement("img");
    image.src = images[index];
    image.alt = book.bookName;
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
    gridItem.addEventListener("click", () => {
      showMore(gridItem);
    });
  });
}
async function showMore(book) {
  const bookId = book.id;
  const url = `http://localhost:8001/books/?id=${bookId}`;
  let bookDetail = await axios.get(url).then((response) => {
    return response.data[0];
  });

  let detailWrapperElem = document.querySelector("#detailWrapper");
  detailWrapperElem.style.display = "flex";
  document.querySelector("#bookTitle").textContent = bookDetail.book_name;
  document.querySelector("#bookAuthor").textContent = bookDetail.authors_name;
  document.querySelector(
    "#bookDescription"
  ).textContent = `decription: ${bookDetail.short_description}`;
  document.querySelector("#bookISBN").textContent = `ISBN: ${bookDetail.ISBN}`;
  document.querySelector(
    "#bookNumPages"
  ).textContent = `pages: ${bookDetail.num_pages}`;
  document.querySelector(
    "#bookNumCopies"
  ).textContent = `copies: ${bookDetail.num_copies}`;
  document.querySelector(
    "#bookGenre"
  ).textContent = `categories: ${bookDetail.categories}`;
  document.querySelector("#bookImage").src = bookDetail.image;
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

  await openPage();
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => resolve("placeholder.jpg"); // Replace with a placeholder image if the original fails
  });
}
