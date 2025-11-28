// Simple in-memory store (replace with database in production)
let transactions = [];

export function addTransaction(tx) {
  transactions.push(tx);
  console.log('Transaction added:', tx); // For debugging
}

export function updateTransaction(id, updates) {
  const index = transactions.findIndex(tx => tx.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    console.log('Transaction updated:', transactions[index]); // For debugging
  }
}

export function getTransaction(id) {
  return transactions.find(tx => tx.id === id);
}

export function getTransactions() {
  return transactions;
}