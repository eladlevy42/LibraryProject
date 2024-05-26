const createBookGoogleUrl = `https://www.googleapis.com/books/v1/volumes?`
console.log(allBooks);
initBookArr()
async function createBook(identifier){
    let bookIdentifier = document.getElementById(`book${identifier}`)
    let bookIdentifierValue = bookIdentifier.value
    console.log(bookIdentifier);
    const url = getCorrectUrl(identifier, bookIdentifierValue)
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

function getCorrectUrl(identifier, bookIdentifierValue){
    let url = identifier === 'Name' ? `${createBookGoogleUrl}q=intitle:${encodeURIComponent(bookIdentifierValue)}&key=${apiKey}` : `${createBookGoogleUrl}q=isbn:${bookIdentifierValue}&key=${apiKey}`
    return url
}

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