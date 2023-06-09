In this project, I am building a web application to process and display trading data from a CSV file. The primary goal is to create an easy-to-read table with chronologically ordered completed trades, which allows users to accurately calculate profit and loss (P/L) from their trading activities. The application is designed with user-friendliness in mind and utilizes HTML, CSS, and JavaScript to create an interactive interface for users to engage with their trading data.

Parsing trading data: Users can upload a CSV file containing their trading data, and the application parses the file to extract relevant information about each transaction. To achieve accurate parsing and ignore lines that do not contain essential data, the following steps are taken:

Splitting the CSV file into rows based on line breaks and filtering out empty rows.
Ignoring rows with less than 12 columns to exclude those that do not contain complete transaction information.
Verifying if the first column (date) follows a valid date format (MM/DD/YYYY) using a regular expression.
Converting numerical values (quantity, price, commission, fees, accrued interest, and amount) to the appropriate data type (Number), and ignoring rows with invalid numerical values.
Filtering and displaying transaction data: The application allows users to view the transactions in different ways based on their preferences. They can choose to see all trades, only stock trades, only options trades, or only completed trades. The data is displayed in a tabular format, with relevant columns shown for each type of transaction.

Displaying trade details by symbol: When users view the completed trades table, they can click on a symbol to see all trades associated with that particular symbol. This is achieved by generating a hyperlink for each symbol, which opens a new page with a filtered view of the transactions containing only those involving the selected symbol.

Calculation of profit/loss: For each completed trade, the application calculates the profit/loss based on the difference between the buying and selling prices, multiplied by the quantity of shares traded. To obtain an accurate P/L calculation, the transactions are sorted chronologically before processing. The application uses an algorithm to compute completed trades, considering the remaining open positions and average buying prices of each security. This approach allows users to get a precise understanding of their P/L for each completed trade.

In summary, this web application provides users with a comprehensive tool to analyze their trading data, focusing on chronologically ordered completed trades for accurate P/L calculations. By carefully parsing the CSV file and filtering out irrelevant lines, the application ensures that only valid transaction data is processed and displayed, making it easy for users to gain insights into their trading activities.


Remaining Tasks:
- Figure out a better way to download fidelity reports holistically so that no transactions are missed
- add filtered completed trade table to symbol details page