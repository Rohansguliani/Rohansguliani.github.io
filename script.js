function displayTable(transactions, tableType) {
    if (!transactions) {
      alert('Please upload a CSV file first.');
      return;
    }
  
    if (tableType === 'stocks') {
      displayStocksTable(transactions);
    } else if (tableType === 'options') {
      displayOptionsTable(transactions);
    } else if (tableType === 'completed') {
      displayCompletedTradesTable(transactions);
    }
  }
  
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
  
      displayTable(tradingData, 'completed');
    };
  });
  
  document.getElementById('toggleAllTrades').addEventListener('click', () => {
    displayTable(tradingData, 'stocks');
  });
  
  document.getElementById('toggleOptionsTrades').addEventListener('click', () => {
    displayTable(tradingData, 'options');
  });
  
  document.getElementById('toggleCompletedTrades').addEventListener('click', () => {
    displayTable(tradingData, 'completed');
  });  

let tradingData;

function parseTradingData(data) {
    const rows = data.split(/\r?\n/).filter(row => row.trim());
    const transactions = [];

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(',');

        // Check if the row has at least 12 columns
        if (cells.length < 12) {
            continue;
        }

        // Check if the first column contains a valid date format
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(cells[0].trim())) {
            continue;
        }

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

    // Sort transactions by date
    transactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

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

    const container = document.getElementById('stocksTableContainer');
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

    const container = document.getElementById('optionsTableContainer');
    container.innerHTML = '';
    container.appendChild(table);
}

// ... (rest of the code remains unchanged)

function calculateCompletedTrades(transactions) {
    const completedTrades = [];
    const openPositions = {};
  
    transactions.forEach((transaction) => {
      if (!transaction.symbol || transaction.symbol.startsWith('-')) {
        return;
      }
      const { action, symbol } = transaction;
      const upperSymbol = symbol.toUpperCase();
  
      if (action.startsWith("YOU BOUGHT")) {
        console.log("BUYING " + transaction.symbol + " at price " + transaction.price);
        if (!openPositions[upperSymbol]) {
          openPositions[upperSymbol] = {
            totalShares: 0,
            averagePrice: 0,
          };
        }
        const position = openPositions[upperSymbol];
        const newTotalShares = position.totalShares + transaction.quantity;
        position.averagePrice = (position.averagePrice * position.totalShares + transaction.price * transaction.quantity) / newTotalShares;
        position.totalShares = newTotalShares;
      } else if (action.startsWith("YOU SOLD")) {
        console.log("SELLING " + transaction.symbol + " at price " + transaction.price);
        const position = openPositions[upperSymbol];
        if (position && position.totalShares >= transaction.quantity) {
          completedTrades.push({
            symbol: transaction.symbol,
            quantity: Math.abs(transaction.quantity),
            buyDate: "", // We no longer have a specific buy date
            sellDate: transaction.date,
            buyPrice: parseFloat(position.averagePrice).toFixed(2),
            sellPrice: transaction.price,
            pl: parseFloat(((transaction.price - position.averagePrice) * Math.abs(transaction.quantity)).toFixed(2))
          });
          position.totalShares -= transaction.quantity;
          if (position.totalShares === 0) {
            delete openPositions[upperSymbol];
          }
        }
      }
    });
  
    return completedTrades;
  }  

function displayCompletedTradesTable(transactions) {
    const completedTrades = calculateCompletedTrades(transactions);
    const table = createTable(completedTrades, [
        'sellDate',
        'symbol',
        'buyPrice',
        'sellPrice',
        'quantity',
        'pl'
    ]);

    const container = document.getElementById('completedTradesTableContainer');
    container.innerHTML = '';
    container.appendChild(table);
}