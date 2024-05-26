
const apiKey = 'AIzaSyBr44eXMiG4uM7nz0--vgitm2I8OYQ0J9I';
const jsonServerUrl = 'http://localhost:8001/books';  // Your JSON server URL
const allBooks = [];

function parseBookInfo(identifier){
    const volumeInfo = identifier.volumeInfo;
        const formattedBook = {
          id: identifier.id,
          bookName: volumeInfo.title || 'No Title',
          authorsName: volumeInfo.authors || ['Unknown Author'],
          numPages: volumeInfo.pageCount || 0,
          shortDescription: volumeInfo.description || 'No Description',
          image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'No Image',
          numCopies: Math.floor(Math.random() * 10) + 1,  // Random number of copies between 1 and 10
          categories: volumeInfo.categories || ['Uncategorized'],
          ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(identifier => identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10')?.identifier : 'No ISBN'
        };  
        return formattedBook
}


