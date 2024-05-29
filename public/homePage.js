// Initialize the book array and the home page books
let searchPageIndex = 0;
let searchResultsPages = [];
currentPage = 1;
let url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=12`;
let sorted = false;
let showFav = false;
let pages = totalPages;
let searched = false;
let timer;
initBookArr();
initHomeBooks();

async function resetAll() {
  url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=12`;
  currentPage = 1;
  showFav = false;
  sorted = false;
  searched = false;
  updateFavLable();
  resetSearched();
  document.getElementById("searchInput").value = "";
  await openPage();
}
function updateFavLable() {
  if (showFav) {
    document.querySelector("#showFav").textContent = "Show All Books";
  } else {
    document.querySelector("#showFav").textContent = "Show Favorites";
  }
}
async function checkInFav() {
  let btn = document.querySelector("#fav");
  let bookName = document.querySelector("#bookTitle").textContent;
  let url = `${favURL}/?book_name=${bookName}`;
  console.log(url);
  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    if (bookDetail != undefined) {
      btn.classList.remove("fa-regular");
      btn.classList.add("fa-solid");
      return true;
    } else {
      btn.classList.remove("fa-solid");
      btn.classList.add("fa-regular");
      return false;
    }
  } catch (error) {
    showSnackbar(generalFailSnackbar);
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
      await axios.post(historyUrl, historyObject);
      btn.classList.remove("fa-regular");
      btn.classList.add("fa-solid");
      showSnackbar(addedFavoriteSuccessSnackbar);
    } catch (error) {
      showSnackbar(generalFailSnackbar);
    }
  } catch (error) {
    showSnackbar(generalFailSnackbar);
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
      const historyObject = buildHistoryObject(
        bookDetail,
        "Removed from favorite"
      );
      await axios.delete(url);
      await axios.post(historyUrl, historyObject);
      btn.classList.add("fa-regular");
      btn.classList.remove("fa-solid");
      showSnackbar(removedFavoriteFailSnackbar);
    } catch (error) {
      showSnackbar(generalFailSnackbar);
    }
  } catch (error) {
    showSnackbar(generalFailSnackbar);
  }
}
async function showFavorite() {
  currentPage = 1;
  sorted = false;
  resetSearched();
  showFav = !showFav;
  updateFavLable();
  await openPage();
}
async function sortAZ() {
  sorted = !sorted;
  updateFavLable();
  if (searched) {
    await printSearched();
  } else {
    currentPage = 1;
    await openPage();
  }
}
function updateUrl() {
  url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=12`;
  if (sorted) {
    url = `${url}&_sort=book_name`;
    if (showFav) {
      url = `${favURL}/?_page=${currentPage}&_per_page=12&_sort=book_name`;
    }
  } else if (showFav) {
    url = `${favURL}/?_page=${currentPage}&_per_page=12`;
  }
}
async function initHomeBooks() {
  await openPage();
}
async function showMore(bookName) {
  console.log(bookName);
  let url = `${jsonServerUrl}/?book_name=${bookName}`;
  console.log(url);
  let bookDetail = await axios.get(url).then((response) => {
    console.log(response.data[0]);
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
async function buildBookGrid(booksArr) {
  const bookGridElement = document.querySelector("#booksGrid");
  bookGridElement.innerHTML = "";
  document.getElementById("next").style.visibility = "hidden";
  document.getElementById("back").style.visibility = "hidden";
  const imagePromises = booksArr.map((book) => loadImage(book.image));
  const images = await Promise.all(imagePromises);
  booksArr.forEach((book, index) => {
    spinner.style.display = "none";
    let bookName = book.book_name;
    let gridItem = document.createElement("div");
    gridItem.id = book.id;
    gridItem.classList.add("book");
    let image = document.createElement("img");
    image.src = images[index];
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
    bookGridElement.appendChild(gridItem);
    gridItem.addEventListener("click", () => {
      showMore(bookName);
    });
  });
  if (booksArr.length < 12) {
    //fill the empty grid items with empty book divs
    for (let i = 0; i < 12 - booksArr.length; i++) {
      let gridItem = document.createElement("div");
      gridItem.classList.add("emptyBook");
      bookGridElement.appendChild(gridItem);
    }
  }
}
// Function to open a specific page of books
async function openPage() {
  searched = false;
  updateUrl();
  let booksArr = [];
  const bookGridElement = document.querySelector("#booksGrid");
  booksArr = await axios.get(url).then((response) => {
    return response.data.data;
  });
  buildBookGrid(booksArr);
  document.querySelector("#booksGrid").visibility = "hidden";
  if (currentPage == 1) {
    document.getElementById("back").style.visibility = "hidden";
    console.log(currentPage);
  } else {
    document.getElementById("back").style.visibility = "visible";
  }
  if (currentPage == pages || booksArr.length < 12) {
    document.querySelector("#next").style.visibility = "hidden";
  } else {
    document.querySelector("#next").style.visibility = "visible";
  }
}

// Function to switch pages based on the direction (next or back)
async function switchPage(direction) {
  if (direction == "next" && currentPage != pages) {
    currentPage++;
  } else if (currentPage != 1 && direction == "back") {
    currentPage--;
  }
  showSpinner();
  try {
    await openPage();
    document.getElementById("booksGrid").style.visibility = "visible";
  } catch (error) {
    console.log(error);
  }
}

// Function to show the loading spinner
function showSpinner() {
  document.getElementById("booksGrid").style.visibility = "hidden";
  document.getElementById("next").style.visibility = "hidden";
  document.getElementById("back").style.visibility = "hidden";
  spinner.style.display = "block";
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

async function removeCopy() {
  let bookName = document.querySelector("#bookTitle").textContent;

  let url = `${jsonServerUrl}/?book_name=${bookName}`;
  try {
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
      document.querySelector(
        "#bookNumCopies"
      ).textContent = `copies: ${copies}`;
    }
  } catch (error) {
    console.error(error);
    showSnackbar(generalFailSnackbar);
  }
}

async function addCopy() {
  let bookName = document.querySelector("#bookTitle").textContent;

  let url = `${jsonServerUrl}/?book_name=${bookName}`;
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
    console.error(error);
    showSnackbar(generalFailSnackbar);
  }
}

async function deleteBook() {
  let bookName = document.querySelector("#bookTitle").textContent;
  let url = `${jsonServerUrl}/?book_name=${bookName}`;

  try {
    let response = await axios.get(url);
    let bookDetail = response.data[0];
    url = `${jsonServerUrl}/${bookDetail.id}`;
    const historyObject = buildHistoryObject(bookDetail, "Deleted Book");
    await axios.delete(url);
    if (await checkInFav()) {
      url = `${favURL}/${bookDetail.id}`;
      await axios.delete(url);
    }
    showSnackbar(deleteSuccessSnackbar);
    await axios.post(historyUrl, historyObject);
    hideDetailWrapper();

    await openPage();
  } catch (error) {
    console.error(error);
    showSnackbar(generalFailSnackbar);
  }
}
function resetSearched() {
  searched = false;
  currentPage = 1;
  document.querySelector("#back").onclick = () => {
    switchPage("back");
  };
  document.querySelector("#next").onclick = () => {
    switchPage("next");
  };
}
// Function to search for books by name
async function searchBook() {
  showFav = false;
  searched = true;
  updateFavLable();
  currentBooks = [];
  const bookName = document.querySelector("#searchInput").value.toUpperCase();

  // document.querySelector("#searchInput").value = "";
  while (currentBooks.length < 12) {
    url = `${jsonServerUrl}/?_page=${currentPage}&_per_page=12`;
    let response = await axios.get(url);
    let newBookArr = response.data.data;

    for (let book of newBookArr) {
      if (
        book.book_name.toUpperCase().includes(bookName) &&
        currentBooks.length < 12 &&
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
    showSnackbar(noBooksFailSnackbar);
  }
}
function buildSearchBookGrid(currentPageArr) {
  document.querySelector("#booksGrid").visibility = "visible";
  document.querySelector("#booksGrid").innerHTML = "";
  currentPageArr.forEach((book) => {
    let bookName = book.book_name;
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
    // bookElem.addEventListener("click", () => {
    //   showMore(bookElem);
    // });
    bookElem.addEventListener("click", () => {
      showMore(bookName);
    });
    document.querySelector("#booksGrid").appendChild(bookElem);
  });
  if (currentPageArr.length < 12) {
    //fill the empty grid items with empty book divs
    for (let i = 0; i < 12 - currentPageArr.length; i++) {
      let bookElem = document.createElement("div");
      bookElem.classList.add("emptyBook");
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
  if (currentPage > pages + 1 || currentPageArr.length < 12) {
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
}
// Function to print the searched books
async function printSearched() {
  let currentPageArr = searchResultsPages[searchPageIndex].slice();
  if (sorted) {
    currentPageArr.sort((a, b) => a.book_name.localeCompare(b.book_name));
  }
  buildSearchBookGrid(currentPageArr);
}

function debounce() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (document.querySelector("#searchInput").value != "") {
      //resets the variables because its a new search
      searchResultsPages = [];
      searchPageIndex = 0;
      currentPage = 1;
      searchBook();
    }
  }, 1000);
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
    showSnackbar(enterNameFailSnackbar);
  }
});
document.querySelector("#showFav").addEventListener("click", showFavorite);
document.querySelector("#searchInput").addEventListener("input", debounce);
document.querySelector("#reset").addEventListener("click", resetAll);
