initBookArr();
initHomeBooks();
let totalBookArr = [];
let bookArr = [];
let searchPage = 0;
async function initHomeBooks() {
  await openPage();
}
async function showMore(book) {
  const bookId = book.id;
  const url = `http://localhost:8001/books/?id=${bookId}`;
  let bookDetail = await axios.get(url).then((response) => {
    return response.data[0];
  });
  let detailWrapperElem = document.querySelector(".detailWrapper");
  detailWrapperElem.style.display = "flex";
  document.querySelector("#bookTitle").textContent = bookDetail.book_name;
  document.querySelector("#bookAuthor").textContent = bookDetail.authors_name;
  document.querySelector(
    "#bookDescription"
  ).textContent = `${bookDetail.short_description}`;
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

function hideDetailWrapper() {
  document.querySelector(".detailWrapper").style.display = "none";
}
async function openPage() {
  console.log(currentPage);

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
  if (currentPage == 1) {
    document.querySelector("#back").style.display = "none";
  } else {
    document.querySelector("#back").style.display = "block";
  }
  if (currentPage == Math.floor(allBooks.length / 9)) {
    document.querySelector("#next").style.display = "none";
  } else {
    document.querySelector("#next").style.display = "block";
  }
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

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => resolve("placeholder.jpg"); // Replace with a placeholder image if the original fails
  });
}

async function removeCopy() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `http://localhost:8001/books/?ISBN=${bookISBN}`;
  let response = await axios.get(url);
  let bookDetail = response.data[0];
  let copies = bookDetail.num_copies;
  if (copies > 0) {
    copies--;
    bookDetail.num_copies = copies;
    url = `http://localhost:8001/books/${bookDetail.id}`;
    await axios.patch(url, bookDetail);

    document.querySelector("#bookNumCopies").textContent = `copies: ${copies}`;
  }
}

async function addCopy() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `http://localhost:8001/books/?ISBN=${bookISBN}`;
  let response = await axios.get(url);
  let bookDetail = response.data[0];
  let copies = bookDetail.num_copies;
  copies++;
  bookDetail.num_copies = copies;
  url = `http://localhost:8001/books/${bookDetail.id}`;
  await axios.patch(url, bookDetail);
  document.querySelector("#bookNumCopies").textContent = `copies: ${copies}`;
}
async function deleteBook() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `http://localhost:8001/books/?ISBN=${bookISBN}`;
  let response = await axios.get(url);
  let bookDetail = response.data[0];
  url = `http://localhost:8001/books/${bookDetail.id}`;
  await axios.delete(url);
  hideDetailWrapper();
  openPage();
}

async function searchBook() {
  bookArr = [];
  let totalBookArr = allBooks;
  let bookName = document.querySelector("#searchInput").value.toUpperCase();
  totalBookArr.forEach((book) => {
    if (book.book_name.toUpperCase().includes(bookName)) {
      bookArr.push(book);
    }
  });
  console.log(bookArr);
  searchPage = 0;
  printSearched();
}

function printSearched() {
  let startIndex = searchPage * 9;
  let endIndex = (searchPage + 1) * 9;
  document.querySelector("#booksGrid").innerHTML = "";
  for (let i = startIndex; i < endIndex; i++) {
    let book = bookArr[i];
    if (bookArr[i] != undefined) {
      let gridItem = document.createElement("div");
      gridItem.id = book.id;
      gridItem.classList.add("book");
      let image = document.createElement("img");
      image.src = book.image;
      image.alt = book.book_name;
      let title = document.createElement("span");
      title.classList.add("book-title");
      title.textContent = book.book_name;
      let author = document.createElement("span");
      author.classList.add("book-author");
      author.textContent = book.authors_name;
      gridItem.appendChild(image);
      gridItem.appendChild(title);
      gridItem.appendChild(author);
      document.querySelector("#booksGrid").appendChild(gridItem);
      gridItem.addEventListener("click", () => {
        showMore(gridItem);
      });
    } else {
      let gridItem = document.createElement("div");
      gridItem.classList.add("book");
      document.querySelector("#booksGrid").appendChild(gridItem);
    }
  }

  if (searchPage <= 0) {
    document.querySelector("#back").style.display = "none";
  } else {
    document.querySelector("#back").style.display = "block";
    document.querySelector("#back").onclick = () => {
      searchPage--;
      printSearched();
    };
  }
  if (searchPage < Math.floor(bookArr.length / 9)) {
    document.querySelector("#next").style.display = "block";
    document.querySelector("#next").onclick = () => {
      searchPage++;
      printSearched();
    };
  } else {
    document.querySelector("#next").style.display = "none";
  }
}

/////// event listeners ///////////
document.querySelector("#removeCopy").addEventListener("click", removeCopy);
document.querySelector("#addCopy").addEventListener("click", addCopy);
document.querySelector("#deleteBook").addEventListener("click", deleteBook);
document.querySelector("#searchButton").addEventListener("click", (event) => {
  totalBookArr = [];
  event.preventDefault();
  searchBook();
});
