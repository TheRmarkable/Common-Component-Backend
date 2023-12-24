const express = require('express');
const router = express.Router();
const AccountService = require('../../services/AccountService');


/**
 * @swagger
 * /accounts/{id}/deposit:
 *   post:
 *     summary: Deposit money into an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to deposit
 *               currency:
 *                 type: string
 *                 description: Currency of the amount
 *     responses:
 *       200:
 *         description: The account with updated balance
 *         content:
 *           application/json:
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 */
router.post('/:id/deposit', async (req, res) => {
    try {
        const accountId = req.params.id;
        const depositData = req.body; // should contain amount and currency
        const accountService = new AccountService();
        const updatedAccount = await accountService.deposit(accountId, depositData);
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /accounts/{id}/withdraw:
 *   post:
 *     summary: Withdraw money from an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *               currency:
 *                 type: string
 *                 description: Currency of the amount
 *     responses:
 *       200:
 *         description: The account with updated balance
 *         content:
 *           application/json:
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 */
router.post('/:id/withdraw', async (req, res) => {
    try {
        const accountId = req.params.id;
        const { amount, currency,  } = req.body;
        const accountService = new AccountService();
        const updatedAccount = await accountService.withdrawOrTransfer('withdraw', accountId, { amount, currency });
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /accounts/{id}/transfer:
 *   post:
 *     summary: Transfer money from an account to another account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to transfer
 *               currency:
 *                 type: string
 *                 description: Currency of the amount
 *     responses:
 *       200:
 *         description: The account with updated balance
 *         content:
 *           application/json:
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 */
router.post('/:id/transfer', async (req, res) => {
    try {
        const accountId = req.params.id;
        const { amount, currency, } = req.body;
        const accountService = new AccountService();
        const updatedAccount = await accountService.withdrawOrTransfer('transfer', accountId, { amount, currency });
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /accounts/{accountId}/withdrawal-request:
 *   post:
 *     summary: Create a withdrawal request for an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *               currency:
 *                 type: string
 *                 description: Currency of the amount
 *     responses:
 *       200:
 *         description: Withdrawal request created successfully
 *       400:
 *         description: Bad request
 */
router.post('/accounts/:accountId/withdrawal-request', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const { amount, currency } = req.body;
        const userId = req.user.id;

        const accountService = new AccountService();
        const account = await accountService.requestWithdrawal(accountId, { amount, currency, userId });
        res.status(200).json({ message: 'Withdrawal request created', account });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /accounts/{accountId}/transactions/{transactionId}/approve-reject:
 *   put:
 *     summary: Approve or reject a withdrawal request
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approve:
 *                 type: boolean
 *                 description: Approval status of the withdrawal request
 *     responses:
 *       200:
 *         description: Withdrawal request updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/accounts/:accountId/transactions/:transactionId/approve-reject', async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;
        const { approve } = req.body;
        const userRole = req.user.role;

        if (userRole !== UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const accountService = new AccountService();
        const account = await accountService.approveOrRejectWithdrawal(accountId, transactionId, approve);
        res.status(200).json({ message: `Withdrawal request ${approve ? 'approved' : 'rejected'}`, account });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /accounts/{accountId}/transactions/{transactionId}:
 *   delete:
 *     summary: Cancel an unprocessed withdrawal request
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to cancel
 *     responses:
 *       200:
 *         description: Withdrawal request cancelled successfully
 *       400:
 *         description: Bad request
 */
router.delete('/accounts/:accountId/transactions/:transactionId', async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;
        const userId = req.user.id; // Assuming the user's ID is available via authentication

        const accountService = new AccountService();
        const account = await accountService.cancelWithdrawalRequest(accountId, transactionId, userId);
        res.status(200).json({ message: 'Withdrawal request cancelled successfully', account });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



module.exports = router;
