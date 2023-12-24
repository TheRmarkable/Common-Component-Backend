const express = require('express');
const router = express.Router();
const BankService = require('../../services/BankService');
const UserService = require('../../services/UserService');
const UserRoles = require('../../constants/UserRole')

/**
 * @swagger
 * /{id}/banks:
 *   get:
 *     summary: Retrieve a user's bank accounts
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: A list of the user's bank accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/:id/banks', async (req, res) => {
    try {
        const userId = req.params.id;
        const requesterId = req.user.id;

        const userService = new UserService();
        const user = await userService.getUserById(requesterId)

        if (requesterId === userId || user.role === UserRoles.FINANCE_USER) {
            const bankService = new BankService();
            const userBanks = await bankService.getUserBanks(userId);
            res.status(200).json( { userBanks } );
        } else {
            res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{userId}/banks:
 *   post:
 *     summary: Add a bank account for a user
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
router.post('/:userId/banks', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userRole = req.user.role;

        if (req.user.id !== userId && userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        await bankService.addUserBank(userId, req.body, userRole).then(
            data => res.status(200).json({ data })
        )
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{userId}/banks/{bankId}:
 *   delete:
 *     summary: Delete a user's bank account
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank Account ID
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.delete('/:userId/banks/:bankId', async (req, res) => {
    try {
        const { userId, bankId } = req.params;
        const userRole = req.user.role;

        if (req.user.id !== userId && userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        await bankService.deleteUserBank(userId, bankId, userRole);
        res.status(200).json({ message: 'Bank account deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /{userId}/banks/{bankId}:
 *   put:
 *     summary: Update a user's bank account
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank Account ID
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
router.put('/:userId/banks/:bankId', async (req, res) => {
    try {
        const { userId, bankId } = req.params;
        const userRole = req.user.role;

        if (req.user.id !== userId && userRole !==  UserRoles.FINANCE_USER) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bankService = new BankService();
        const updatedBank = await bankService.updateUserBank(userId, bankId, req.body, userRole);
        res.status(200).json(updatedBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: The created user
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {

    const {identityNumber,name,surname,email,role,mobileNumber,is_inactive} = req.body;
    try {
        const userService = new UserService();
        await userService.addUser({identityNumber,name,surname,email,role,mobileNumber,is_inactive}).then(data =>  res.status(200).json( data ))
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: The user details
 *         content:
 *           application/json:
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request
 */
router.get('/:id', async (req, res) => {
    try {
        const userService = new UserService();
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /users/{userId}/verify:
 *   post:
 *     summary: Verify a user's identity and phone number
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to verify
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Bad request
 */
router.post('/users/:userId/verify', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userService = new UserService();
        const verifiedUser = await userService.verifyUser(userId);
        res.status(200).json({ message: 'User verified successfully', user: verifiedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
