initBookArr()
console.log(allBooks);

async function initHomeBooks(){
    await openPage();
}

async function openPage() {
    const url = `http://localhost:8001/books/?_page=${currentPage}&_per_page=9`;
    let booksArr = [];
    const bookGridElement = document.querySelector("#booksGrid");
    booksArr = await axios.get(url).then((response) => {
      return response.data.data;
    });
    document.getElementById("booksGrid").innerHTML =
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
  
 
  