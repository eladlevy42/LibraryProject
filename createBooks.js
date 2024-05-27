const createBookGoogleUrl = `https://www.googleapis.com/books/v1/volumes?`
initBookArr()


async function createNewBookByISBN(){
    const identifier = 'ISBN'
    let bookIdentifier = document.getElementById(`book${identifier}`)
    let bookIdentifierValue = bookIdentifier.value
    const url = `${createBookGoogleUrl}q=isbn:${bookIdentifierValue}&key=${apiKey}`
    try{
       const response = await axios.get(url)
       let items = response.data.items;
       if (!items || items.length === 0) {
        alert('No matching books found');
        return;
    }
       let book = items[0]
       let parsedBook = parseBookInfo(book, identifier)
       await axios.post(jsonServerUrl, parsedBook)
       alert('Created book successfuly!')
    }
    catch(error){
        console.log(error);
        alert(error)
    }
}

async function createNewBookByName(){
    const identifier = 'Name'
    let bookIdentifier = document.getElementById(`book${identifier}`)
    let bookIdentifierValue = bookIdentifier.value
    const url = `${createBookGoogleUrl}q=${bookIdentifierValue}&key=${apiKey}`
    try {
        const response = await axios.get(url)
        let items = response.data.items;
        console.log(items);
        if (!items || items.length === 0) {
            alert('No matching books found');
            return;
        }
        if(allBooks.some(book => book.book_name === bookIdentifierValue)){
            alert('Book already exists!')
            return
        }
        let newBookWrapper = document.querySelector('.detailWrapper')
        for(let item of items){
            let book = parseBookInfo(item);
            console.log(book);
            let bookDiv = document.createElement('div')
            let bookImg = document.createElement('img')
            bookImg.src = book.image
            bookImg.alt = book.book_name
            let bookTitle = document.createElement('span')
            bookTitle.classList.add("book-title");
            bookTitle.textContent = book.book_name;
            let author = document.createElement("span");
            author.classList.add("book-author");
            author.textContent = book.authors_name;
            bookDiv.appendChild(bookImg)
            bookDiv.appendChild(bookTitle)
            bookDiv.appendChild(author)
            let newBooksDetails = document.querySelector('.newBooksDetails');
            newBooksDetails.appendChild(bookDiv)
        }
        newBookWrapper.style.display = 'flex'
        console.log('flex');
    } catch (error) {
        
    }
}

function hideBooksWrapper(){
    document.querySelector('.detailWrapper').style.display = 'none'
    document.querySelector('.newBooksDetails').innerHTML = ''
}
const createBookByName = document.getElementById('createBookByName').addEventListener('submit', function(event){
    event.preventDefault()
    createNewBookByName()
    document.getElementById('bookName').value = ''
})
const createBookByISBN = document.getElementById('createBookByISBN').addEventListener('submit', function(event){
    event.preventDefault()
    createNewBookByISBN()
    document.getElementById('ISBN').value = ''
})