function displayTable(transactions, tableType) {
    if (!transactions) {
        alert('Please upload a CSV file first.');
        return;
    }

    const stocksTable = document.getElementById('stocksTableContainer');
    const optionsTable = document.getElementById('optionsTableContainer');
    const completedTradesTable = document.getElementById('completedTradesTableContainer');

    if (tableType === 'stocks') {
        displayStocksTableAll(transactions);
        stocksTable.style.display = 'block';
        optionsTable.style.display = 'none';
        completedTradesTable.style.display = 'none';
    } else if (tableType === 'options') {
        displayOptionsTable(transactions);
        stocksTable.style.display = 'none';
        optionsTable.style.display = 'block';
        completedTradesTable.style.display = 'none';
    } else if (tableType === 'completed') {
        displayCompletedTradesTable(transactions);
        stocksTable.style.display = 'none';
        optionsTable.style.display = 'none';
        completedTradesTable.style.display = 'block';
    }
}


function addEventListeners() {
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
            localStorage.setItem('tradingData', JSON.stringify(tradingData));
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

    restoreHomePageState();
}

const processDataButton = document.getElementById('processData');
if (processDataButton) {
    addEventListeners();
}

let tradingData;

function removeDuplicateTransactions(transactions) {
    const uniqueTransactions = [];

    transactions.forEach(transaction => {
        const duplicate = uniqueTransactions.find(existingTransaction => {
            return existingTransaction.date === transaction.date &&
                existingTransaction.action === transaction.action &&
                existingTransaction.symbol === transaction.symbol &&
                existingTransaction.quantity === transaction.quantity &&
                existingTransaction.price === transaction.price;
        });

        if (!duplicate) {
            uniqueTransactions.push(transaction);
        }
    });

    return uniqueTransactions;
}


function parseTradingData(data) {
    const rows = data.split(/\r?\n/).filter(row => row.trim());
    let transactions = [];

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
            index: i,
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

    // Remove duplicate transactions
    transactions = removeDuplicateTransactions(transactions);

    // Sort transactions by date, and prioritize BUY actions over SELL actions for the same date
    transactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA - dateB !== 0) {
            return dateA - dateB;
        } else {
            // If dates are equal, prioritize BUY actions over SELL actions
            const actionA = a.action.startsWith("YOU BOUGHT") ? -1 : 1;
            const actionB = b.action.startsWith("YOU BOUGHT") ? -1 : 1;

            if (actionA !== actionB) {
                return actionA - actionB;
            } else {
                // If both transactions have the same action, use the index property to sort
                return b.index - a.index;
            }
        }
    });

    return transactions;
}

function createTable(data, columns, hyperlinkCallback = null, clickCallback = null) {
    const table = document.createElement('table');
    const header = table.createTHead();
    const headerRow = header.insertRow(0);

    columns.forEach((name) => {
        const cell = headerRow.insertCell(-1);
        cell.innerHTML = name;
    });

    data.forEach((row) => {
        const tableRow = table.insertRow(-1);
        columns.forEach((column, index) => {
            const cell = tableRow.insertCell(-1);
            if (hyperlinkCallback && index === 1) {
                const hyperlink = document.createElement('a');
                hyperlink.href = hyperlinkCallback(row);
                hyperlink.innerHTML = row[column];
                cell.appendChild(hyperlink);

                if (clickCallback) {
                    hyperlink.addEventListener('click', (event) => {
                        clickCallback(row);
                    });
                }
            } else {
                cell.innerHTML = row[column];
            }
        });
    });

    return table;
}


function displayStocksTableAll(transactions) {
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

function displayStocksTable(transactions, symbolFilter = '') {
    const stocksTransactions = transactions.filter((transaction) => symbolFilter === '' || transaction.symbol === symbolFilter &&
        (transaction.action.startsWith('YOU SOLD') || transaction.action.startsWith('YOU BOUGHT')));

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

    const container = symbolFilter === '' ? document.getElementById('stocksTableContainer') : document.getElementById('filteredTransactionsTableContainer');
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

let totalPL = 0;

function calculateCompletedTrades(transactions) {
    let totalPL = 0;
    const completedTrades = [];
    const openPositions = {};

    transactions.forEach((transaction) => {
        if (!transaction.symbol || transaction.symbol.startsWith('-')) {
            return;
        }
        const { action, symbol } = transaction;
        const upperSymbol = symbol.toUpperCase();

        if (action.startsWith("YOU BOUGHT")) {
            console.log("BUYING " + transaction.symbol + " at price " + transaction.price + " i: " + transaction.index);
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
            console.log("SELLING " + transaction.symbol + " at price " + transaction.price + " i: " + transaction.index);
            const position = openPositions[upperSymbol];
            if (position && position.totalShares >= transaction.quantity) {
                pl = parseFloat(((transaction.price - position.averagePrice) * Math.abs(transaction.quantity)).toFixed(2));
                completedTrades.push({
                    symbol: transaction.symbol,
                    quantity: Math.abs(transaction.quantity),
                    buyDate: "", // We no longer have a specific buy date
                    sellDate: transaction.date,
                    buyPrice: parseFloat(position.averagePrice).toFixed(2),
                    sellPrice: transaction.price,
                    pl: pl
                });
                position.totalShares += transaction.quantity;
                if (position.totalShares === 0) {
                    delete openPositions[upperSymbol];
                }
                totalPL += pl;
            }
        }
    });

    return {completedTrades, totalPL};
}

function displayCompletedTradesTable(transactions) {
    const {completedTrades, totalPL} = calculateCompletedTrades(transactions);
    const table = createTable(completedTrades, [
        'sellDate',
        'symbol',
        'buyPrice',
        'sellPrice',
        'quantity',
        'pl'
    ], createSymbolLink, saveHomePageState);

    const container = document.getElementById('completedTradesTableContainer');
    container.innerHTML = '';
    container.appendChild(table);

    container.append(totalPL);
}

function displayCompletedTradesTableSpecific(transactions, symbol) {

    transactions = transactions.filter((transaction) => {
        return transaction.symbol && transaction.symbol == symbol;
    });
    const {completedTrades, totalPL} = calculateCompletedTrades(transactions);
    const table = createTable(completedTrades, [
        'sellDate',
        'symbol',
        'buyPrice',
        'sellPrice',
        'quantity',
        'pl'
    ], createSymbolLink);

    const container = document.getElementById('completedTradesTableSpecificContainer');
    container.innerHTML = '';
    container.appendChild(table);
    container.append(totalPL);
}

function createSymbolLink(row) {
    const symbol = row.symbol;
    return `symbol_details.html?symbol=${encodeURIComponent(symbol)}`;
}

function loadSymbolDetails() {
    const symbolHeader = document.getElementById('symbolHeader');

    if (!symbolHeader) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');

    symbolHeader.innerHTML = `Symbol details for ${symbol}`;

    if (symbol) {
        const tradingData = JSON.parse(localStorage.getItem('tradingData'));
        displayStocksTable(tradingData, symbol);
        displayCompletedTradesTableSpecific(tradingData, symbol);
    } else {
        alert('Invalid symbol');
    }
}

function loadTradingDataFromLocalStorage() {
    const tradingDataString = localStorage.getItem('tradingData');
    if (tradingDataString) {
        tradingData = JSON.parse(tradingDataString);
    }
}

function saveHomePageState() {
    localStorage.setItem('completedTradesTableContainer', document.getElementById('completedTradesTableContainer').innerHTML);
    // Save other elements' states here...
}


function restoreHomePageState() {
    const searchInput = localStorage.getItem('completedTradesTableContainer');
    console.log('Restoring home page state...'); // Add this line
    if (searchInput !== null) {
        console.log('Restored data:', searchInput); // Add this line
        document.getElementById('completedTradesTableContainer').innerHTML = searchInput;
    } else {
        console.log('No data to restore.'); // Add this line
    }
    // Restore other elements' states here...
}


loadTradingDataFromLocalStorage();
