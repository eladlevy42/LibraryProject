const apiKey = "AIzaSyBr44eXMiG4uM7nz0--vgitm2I8OYQ0J9I";
const searchQuery = "a";
const maxResults = 40; // Maximum number of results per page (10 to 40)
const totalBooksToFetch = 400; // Total number of books you want to fetch
const jsonServerUrl = "http://localhost:8001/books"; // Your JSON server URL
const allBooks = [];
let currentPage = 1; //the current page of the grid. the total pages will be 9 when the 9th page is only 4 books.
let pageLink = `http://localhost:8001/books/?i_page=${currentPage}&_limit=12`;
let currentBooks = []; //an array of the current books in the page, get it by the pageLink.

async function getBooks() {
  let startIndex = 0;
  try {
    while (allBooks.length < totalBooksToFetch) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${apiKey}&langRestrict=en&startIndex=${startIndex}&maxResults=${maxResults}`;
      const response = await axios.get(url);
      const books = response.data.items;
      if (!books || books.length === 0) break; // Exit if no more books are found
      books.forEach((book) => {
        allBooks.push(parseBookInfo(book));
      });
      startIndex += maxResults; // Move to the next page
    }
    console.log(`Fetched ${allBooks.length} books`);
    // Now post the collected books to your JSON server
    await axios.post(jsonServerUrl, allBooks);
    console.log("Books posted to JSON server successfully");
  } catch (error) {
    console.error("Error fetching or posting books:", error);
  }
}

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
