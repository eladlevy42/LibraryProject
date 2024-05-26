
const apiKey = 'AIzaSyBr44eXMiG4uM7nz0--vgitm2I8OYQ0J9I';
const jsonServerUrl = 'http://localhost:8001/books'; 
const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=a&key=${apiKey}`

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


async function createBook(identifier){
    let bookIdentifier = document.getElementById(`book${identifier}`).value
    console.log(bookName);
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(bookIdentifier)}&key=${apiKey}&langRestrict=en`
    try{
       const response = await axios.get(url)
       let items = response.data.items;
       if (!items || items.length === 0) {
        alert('No matching books found');
        return;
    }
       let book = await getBookWithHighestAverageRating(response.data.items)
       let parsedBook = parseBookInfo(book)
       console.log(parsedBook);
       await axios.post(jsonServerUrl, parsedBook)
       alert('Created book successfuly!')
    }
    catch(error){
        console.log(error);
        alert(error)
    }
}

// createBook()
async function getBookWithHighestAverageRating(items) {
    let highestAverageRating = 0;
    let bookWithHighestRating;
    for (const item of items) {
        const averageRating = item.volumeInfo.averageRating;

        if (averageRating > highestAverageRating) {
            highestAverageRating = averageRating;
            bookWithHighestRating = item;
        }
    }
    return bookWithHighestRating;
}


const createBookByName = document.getElementById('createBookByName').addEventListener('submit', function(event){
    event.preventDefault()
    createBook('Name')
    document.getElementById('bookName').value = ''
})
const createBookByISBN = document.getElementById('createBookByISBN').addEventListener('submit', function(event){
    event.preventDefault()
    createBook('ISBN')
    document.getElementById('bookName').value = ''
})