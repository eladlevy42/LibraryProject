let actionTable = document.getElementById('actionTable')

async function printInfoToTable(){
    try {
        const historyInfo = await axios.get(historyUrl)
        const sortedHistoryInfo = historyInfo.data.sort((a, b) => b.timeAdded - a.timeAdded);
        console.log(sortedHistoryInfo);
        for(let historyElement of sortedHistoryInfo){
            let tr = buildTable(historyElement)
            actionTable.innerHTML += tr
        }
        actionTable.style.display = 'block'
    } catch (error) {
        alert(error)
    }
}

printInfoToTable()
function buildTable(element){
    let tr = `<tr>`
    tr += `<td>${element.book_name}</td><td>${element.ISBN}</td><td>${element.action}</td><td>${element.time}</td>`
    tr+= `</tr>`
    return tr
}