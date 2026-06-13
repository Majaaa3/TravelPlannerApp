import axios from 'axios';
import { Expense } from '../models/Expense';

const BASE_URL = import.meta.env.VITE_ACTIVITY_SERVICE_URL;

export const expenseService = {
    async getExpensesByTrip(tripId) {
        const response = await axios.get(`${BASE_URL}/api/expenses/trip/${tripId}`);
        return response.data.map(e => new Expense(
            e.id, e.name, e.category,
            e.amount, e.date, e.description, e.tripId
        ));
    },

    async createExpense(expenseData) {
        const response = await axios.post(`${BASE_URL}/api/expenses`, expenseData);
        const e = response.data;
        return new Expense(
            e.id, e.name, e.category,
            e.amount, e.date, e.description, e.tripId
        );
    },

    async deleteExpense(id) {
        const response = await axios.delete(`${BASE_URL}/api/expenses/${id}`);
        return response.data;
    }
};