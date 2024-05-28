let tableWrapper = document.querySelector('.tableWrapper');

async function printInfoToTable() {
    try {
        const historyInfo = await axios.get(historyUrl);
        console.log(historyInfo);
        const sortedHistoryInfo = historyInfo.data.sort((a, b) => b.timeAdded - a.timeAdded);
        console.log(sortedHistoryInfo);
        if (sortedHistoryInfo.length === 0) {
            tableWrapper.textContent = 'No items yet!';
            return;
        }
        let table = buildTableHeader();
        for (let historyElement of sortedHistoryInfo) {
            table += buildTableRow(historyElement);
        }
        table += `</table>`;
        tableWrapper.innerHTML += table;
        const actionTable = document.querySelector('.actionTable');
    } catch (error) {
        showSnackbar(generalFailSnackbar)
    }
}

function buildTableHeader() {
    let table = `<table class="actionTable">`;
    table += `<tr><th>Book name</th><th>Book ISBN</th><th>Action</th><th>Time of action</th></tr>`;
    return table;
}

function buildTableRow(element) {
    let tr = `<tr>`;
    tr += `<td>${element.book_name}</td><td>${element.ISBN}</td><td>${element.action}</td><td>${element.time}</td>`;
    tr += `</tr>`;
    return tr;
}

printInfoToTable();
