const express = require('express');
const router = express.Router();
const BankService = require('../../services/BankService');
const UserRoles = require('../../constants/UserRole')

/**
 * @swagger
 * /banks:
 *   get:
 *     summary: Retrieve a list of all corporate bank accounts
 *     tags: [Banks]
 *     responses:
 *       200:
 *         description: A list of corporate bank accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Internal server error
 */
router.get('/banks', async (req, res) => {
    try {
        const bankService = new BankService();
        const corporateBanks = await bankService.getCorporateBanks();
        res.status(200).json( { corporateBanks } );

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


/**
 * @swagger
 * /banks:
 *   post:
 *     summary: Create a new corporate bank account
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: The created bank account
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.post('/banks', async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        await bankService.addCorporateBank(req.body, userRole).then(
            data => res.status(200).json( { data })
        )
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /banks/{bankId}:
 *   delete:
 *     summary: Delete a corporate bank account
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bank account ID
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */

router.delete('/banks/:bankId', async (req, res) => {
    try {
        const { bankId } = req.params;
        const userRole = req.user.role;

        if (userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        await bankService.deleteCorporateBank(bankId, userRole);
        res.status(200).json({ message: 'Corporate bank account deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /banks/{bankId}:
 *   put:
 *     summary: Update a corporate bank account
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: The updated bank account
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.put('/banks/:bankId', async (req, res) => {
    try {
        const { bankId } = req.params;
        const userRole = req.user.role;

        if (userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        const updatedCorporateBank = await bankService.updateCorporateBank(bankId, req.body, userRole);
        res.status(200).json(updatedCorporateBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;
