document.getElementById('processData').addEventListener('click', () => {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a CSV file.');
      return;
    }
  
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt) => {
      const data = evt.target.result;
      tradingData = parseTradingData(data);
      displayStocksTable(tradingData);
  
      document.getElementById('toggleButton').addEventListener('click', toggleTable);
    };
  });

let currentTable = 'stocks';

function toggleTable() {
    if (!tradingData) {
      alert('Please upload a CSV file first.');
      return;
    }
  
    if (currentTable === 'stocks') {
      currentTable = 'options';
      displayOptionsTable(tradingData);
    } else {
      currentTable = 'stocks';
      displayStocksTable(tradingData);
    }
  }  

let tradingData;

function parseTradingData(data) {
    const rows = data.split(/\r?\n/).filter(row => row.trim());
    const transactions = [];

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(',');
        const date = cells[0].trim();
        const account = cells[1].trim();
        const action = cells[2].trim();
        const symbol = cells[3].trim();
        const securityDescription = cells[4].trim();
        const securityType = cells[5].trim();
        const quantity = Number(cells[6].trim());
        const price = Number(cells[7].trim());
        const commission = Number(cells[8].trim());
        const fees = Number(cells[9].trim());
        const accruedInterest = Number(cells[10].trim());
        const amount = Number(cells[11].trim());

        if (isNaN(quantity) || isNaN(price) || isNaN(commission) || isNaN(fees) || isNaN(accruedInterest) || isNaN(amount)) {
            continue;
        }

        transactions.push({
            date,
            account,
            action,
            symbol,
            securityDescription,
            securityType,
            quantity,
            price,
            commission,
            fees,
            accruedInterest,
            amount
        });
    }

    return transactions;
}

function createTable(data, columns) {
    const table = document.createElement('table');
    const header = table.createTHead();
    const headerRow = header.insertRow(0);

    columns.forEach((name) => {
        const cell = headerRow.insertCell(-1);
        cell.innerHTML = name;
    });

    data.forEach((row) => {
        const tableRow = table.insertRow(-1);
        columns.forEach((column) => {
            const cell = tableRow.insertCell(-1);
            cell.innerHTML = row[column];
        });
    });

    return table;
}

function displayStocksTable(transactions) {
    const stocksTransactions = transactions.filter((transaction) => {
        return transaction.symbol && !transaction.symbol.startsWith('-') &&
            (transaction.action.startsWith('YOU SOLD') || transaction.action.startsWith('YOU BOUGHT'));
    });

    const table = createTable(stocksTransactions, [
        'date',
        'account',
        'action',
        'symbol',
        'securityDescription',
        'quantity',
        'price',
        'amount'
    ]);

    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    container.appendChild(table);
}

function displayOptionsTable(transactions) {
    const optionsTransactions = transactions.filter((transaction) => {
        return transaction.symbol && transaction.symbol.startsWith('-');
    });

    const table = createTable(optionsTransactions, [
        'date',
        'account',
        'action',
        'symbol',
        'securityDescription',
        'quantity',
        'price',
        'commission',
        'fees',
        'accruedInterest',
        'amount'
    ]);

    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    container.appendChild(table);
}
