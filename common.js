const jsonServerUrl = 'http://localhost:8001/books'; 
const apiKey = 'AIzaSyBr44eXMiG4uM7nz0--vgitm2I8OYQ0J9I';
const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=a&key=${apiKey}`
let allBooks = [];
let getBooks;
let currentPage = 1; //the current page of the grid. the total pages will be 9 when the 9th page is only 4 books.
function parseBookInfo(book){
    let volumeInfo = book.volumeInfo
        const formattedBook = {
          id: book.id,
          book_name: volumeInfo.title || 'No Title',
          authors_name: volumeInfo.authors || ['Unknown Author'],
          num_pages: volumeInfo.pageCount || 0,
          short_description: volumeInfo.description || 'No Description',
          image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'No Image',
          num_copies: Math.floor(Math.random() * 10) + 1,  // Random number of copies between 1 and 10
          categories: volumeInfo.categories || ['Uncategorized'],
          ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(identifier => identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10')?.identifier : 'No ISBN'
        };  
        return formattedBook
}

    async function initBookArr() {
        try {
            const response = await axios.get(jsonServerUrl);
            allBooks = response.data;
            console.log('Books initialized:', allBooks); // Debugging statement
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

