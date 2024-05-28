// Initialize the book array and the home page books
let searchPageIndex = 0;
let searchResultsPages = [];
let url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9`;
let sorted = false;
initBookArr();
initHomeBooks();
async function checkInFav() {
  let btn = document.querySelector("#fav");
  let bookName = document.querySelector("#bookTitle").textContent;
  let url = `${jsonServerUrl}/?book_name=${bookName}`;

  let response = await axios.get(url);
  let bookDetail = response.data[0];
  url = `${favURL}/?id=${bookDetail.id}`;
  try {
    response = await axios.get(url);
    if (response.data.length > 0) {
      btn.classList.remove("fa-regular");
      btn.classList.add("fa-solid");
      return true;
    } else {
      btn.classList.remove("fa-solid");
      btn.classList.add("fa-regular");
      return false;
    }
  } catch (error) {
    alert("1error");
  }
}
async function addToFav() {
  let btn = document.querySelector("#fav");
  let bookName = document.querySelector("#bookTitle").textContent;
  let url = `${jsonServerUrl}/?book_name=${bookName}`;
  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    try {
      const historyObject = buildHistoryObject(bookDetail, "Added to favorite");
      await axios.post(favURL, bookDetail);
      await axios.post(historyUrl, historyObject)
      btn.classList.remove("fa-regular");
      btn.classList.add("fa-solid");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    alert("2error");
  }
}
async function removeFromFav() {
  let btn = document.querySelector("#fav");
  let bookName = document.querySelector("#bookTitle").textContent;
  let url = `${jsonServerUrl}/?book_name=${bookName}`;
  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    url = `${favURL}/${bookDetail.id}`;
    try {
      const historyObject = buildHistoryObject(bookDetail, "Removed from favorite");
      await axios.delete(url);
      await axios.post(historyUrl, historyObject)
      btn.classList.add("fa-regular");
      btn.classList.remove("fa-solid");
    } catch (error) {
      console.log("3error");
    }
  } catch (error) {
    alert("4error");
  }
}
async function sortAZ() {
  sorted = !sorted;
  if (sorted) {
    document.querySelector("#sort").innerText = "reset sort";
    url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9&_sort=book_name`;
  } else {
    document.querySelector("#sort").innerText = "sort A-Z";
    url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9`;
  }

  await openPage();
}
function updateUrl() {
  if (sorted) {
    url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9&_sort=book_name`;
  } else {
    url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9`;
  }
}
async function initHomeBooks() {
  await openPage();
}
async function showMore(book) {
  const bookId = book.id;
  const url = `${jsonServerUrl}/?id=${bookId}`;
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
  let btn = document.querySelector("#fav");
  if (await checkInFav()) {
    btn.classList.remove("fa-regular");
    btn.classList.add("fa-solid");
  } else {
    btn.classList.add("fa-regular");
    btn.classList.remove("fa-solid");
  }
}
// Function to hide the detail wrapper
function hideDetailWrapper() {
  document.querySelector(".detailWrapper").style.display = "none";
}

// Function to open a specific page of books
async function openPage() {
  updateUrl();
  let booksArr = [];
  const bookGridElement = document.querySelector("#booksGrid");
  booksArr = await axios.get(url).then((response) => {
    return response.data.data;
  });
  bookGridElement.innerHTML = "";
  document.querySelector("#back").style.visibility = "hidden";
  document.querySelector("#next").style.visibility = "hidden";
  const imagePromises = booksArr.map((book) => loadImage(book.image));
  const images = await Promise.all(imagePromises);
  booksArr.forEach((book, index) => {
    spinner.style.display = "none";
    document.querySelector("#back").style.visibility = "visible";
    document.querySelector("#next").style.visibility = "visible";
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
  if (booksArr.length < 9) {
    //fill the empty grid items with empty book divs
    for (let i = 0; i < 9 - booksArr.length; i++) {
      let gridItem = document.createElement("div");
      gridItem.classList.add("book");
      bookGridElement.appendChild(gridItem);
    }
  }
  if (currentPage == 1) {
    document.querySelector("#back").style.visibility = "hidden";
  } else {
    document.querySelector("#back").style.visibility = "visible";
  }
  if (currentPage == totalPages) {
    document.querySelector("#next").style.visibility = "hidden";
  } else {
    document.querySelector("#next").style.visibility = "visible";
  }
}

// Function to switch pages based on the direction (next or back)
async function switchPage(direction) {
  if (direction == "next" && currentPage != totalPages) {
    currentPage++;
  } else if (currentPage != 1 && direction == "back") {
    currentPage--;
  }
  showSpinner();
  await openPage();
}

// Function to show the loading spinner
function showSpinner() {
  spinner.style.display = 'block'
}

// Function to load an image with a fallback to a placeholder
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => resolve(`public/placeholder.jpg`); // Replace with a placeholder image if the original fails
  });
}

// Function to remove a copy of a book
async function removeCopy() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `${jsonServerUrl}/?ISBN=${bookISBN}`;
  let response = await axios.get(url);
  let bookDetail = response.data[0];
  let copies = bookDetail.num_copies;
  if (copies > 0) {
    copies--;
    bookDetail.num_copies = copies;
    url = `${jsonServerUrl}/${bookDetail.id}`;
    const historyObject = buildHistoryObject(bookDetail, "Removed copy");
    await axios.patch(url, bookDetail);
    await axios.post(historyUrl, historyObject);

    document.querySelector("#bookNumCopies").textContent = `copies: ${copies}`;
  }
}

async function addCopy() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `${jsonServerUrl}/?ISBN=${bookISBN}`;
  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    let copies = bookDetail.num_copies;
    copies++;
    bookDetail.num_copies = copies;
    url = `${jsonServerUrl}/${bookDetail.id}`;
    const historyObject = buildHistoryObject(bookDetail, "Added copy");
    await axios.patch(url, bookDetail);
    await axios.post(historyUrl, historyObject);

    document.querySelector("#bookNumCopies").textContent = `copies: ${copies}`;
  } catch (error) {
    alert(error);
  }
}

async function deleteBook() {
  let bookISBN = document.querySelector("#bookISBN").textContent;
  bookISBN = bookISBN.substring(6);
  let url = `${jsonServerUrl}/?ISBN=${bookISBN}`;
  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    url = `${jsonServerUrl}/${bookDetail.id}`;
    console.log(bookDetail);
    const historyObject = buildHistoryObject(bookDetail, "Deleted Book");
    console.log(historyObject);
    await axios.delete(url);
    console.log('deleted');
    await axios.post(historyUrl, historyObject);
    console.log('posted');
    hideDetailWrapper();
    await openPage();
  } catch (error) {
    alert(error);
  }
}

// Function to search for books by name
async function searchBook() {
  currentBooks = [];
  const bookName = document.querySelector("#searchInput").value.toUpperCase();
  // /////////might cause bugs
  document.querySelector('#searchInput').value = ''
  while (currentBooks.length < 9) {
    let newUrl = `${jsonServerUrl}/?_page=${currentPage}&_per_page=9`;
    let response = await axios.get(newUrl);
    let newBookArr = response.data.data;
    for (let book of newBookArr) {
      if (
        book.book_name.toUpperCase().includes(bookName) &&
        currentBooks.length < 9 &&
        !currentBooks.some((b) => b.id === book.id)
      ) {
        currentBooks.push(book);
      }
    }
    currentPage++;
    if (currentPage > totalPages + 1) {
      document.querySelector("#next").style.visibility = "hidden";
      break;
    }
  }
  if (currentBooks[0] != undefined) {
    searchResultsPages.push(currentBooks);
    printSearched();
  } else {
    document.querySelector("#next").style.visibility = "visible";
    alert("No books found");
  }
}

// Function to print the searched books
async function printSearched() {
  let currentPageArr = searchResultsPages[searchPageIndex];
  if (currentPageArr != undefined) {
    document.querySelector("#booksGrid").innerHTML = "";
    currentPageArr.forEach((book) => {
      let bookElem = document.createElement("div");
      bookElem.classList.add("book");
      bookElem.id = book.id;

      let image = document.createElement("img");
      image.src = book.image;
      image.alt = book.book_name;
      let title = document.createElement("span");
      title.classList.add("book-title");
      title.textContent = book.book_name;
      let author = document.createElement("span");
      author.classList.add("book-author");
      author.textContent = book.authors_name;
      bookElem.appendChild(image);
      bookElem.appendChild(title);
      bookElem.appendChild(author);
      bookElem.addEventListener("click", () => {
        showMore(bookElem);
      });
      document.querySelector("#booksGrid").appendChild(bookElem);
    });
    if (currentPageArr.length < 9) {
      //fill the empty grid items with empty book divs
      for (let i = 0; i < 9 - currentPageArr.length; i++) {
        let bookElem = document.createElement("div");
        bookElem.classList.add("book");
        document.querySelector("#booksGrid").appendChild(bookElem);
      }
    }

    if (searchPageIndex <= 0) {
      document.querySelector("#back").style.visibility = "hidden";
      searchPageIndex = 0;
    } else {
      document.querySelector("#back").style.visibility = "visible";
      document.querySelector("#back").onclick = () => {
        if (searchPageIndex > 0) {
          searchPageIndex--;
          currentPage--;
          printSearched();
        }
      };
    }
    if (currentPage > totalPages + 1) {
      document.querySelector("#next").style.visibility = "hidden";
    } else {
      document.querySelector("#next").style.visibility = "visible";
      document.querySelector("#next").onclick = () => {
        searchPageIndex++;
        if (searchPageIndex > searchResultsPages.length - 1) {
          searchBook();
        } else {
          currentPage++;
          printSearched();
        }
      };
    }
  } else {
    openPage();
  }
}
/////// Event listeners ///////////
document.querySelector("#removeCopy").addEventListener("click", removeCopy);
document.querySelector("#addCopy").addEventListener("click", addCopy);
document.querySelector("#deleteBook").addEventListener("click", deleteBook);
document.querySelector("#sort").addEventListener("click", sortAZ);
document.querySelector("#fav").addEventListener("click", async () => {
  if (await checkInFav()) {
    removeFromFav();
  } else {
    addToFav();
  }
});
document.querySelector("#searchButton").addEventListener("click", (event) => {
  event.preventDefault();
  if (document.querySelector("#searchInput").value != "") {
    //resets the variables because its a new search
    searchResultsPages = [];
    searchPageIndex = 0;
    currentPage = 1;
    searchBook();
  } else {
    alert("Please enter a book name");
  }
});