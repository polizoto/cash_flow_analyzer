
let db;

const request = indexedDB.open('budget-app', 1);


request.onupgradeneeded = function(event) {

    const db = event.target.result;

    db.createObjectStore('new_transaction', { autoIncrement: true });
  };

request.onsuccess = function(event) {

    db = event.target.result;
  
    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
  request.onerror = function(event) {

    console.log(event.target.errorCode);
  }; 
  
// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {

    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    transactionObjectStore.add(record);
  }

  function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    const getAll = transactionObjectStore.getAll();
  
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');

          const transactionObjectStore = transaction.objectStore('new_transaction');

          transactionObjectStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  }

window.addEventListener('online', uploadTransaction);
  