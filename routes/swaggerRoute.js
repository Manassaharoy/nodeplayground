const router = require("express").Router();
/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *   Error:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *       message:
 *         type: string
 *   ApiResponse:
 *               properties:
 *                 encoded:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       description: Indicates if the request was successful or not
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                     isError:
 *                       type: boolean
 *                       description: Indicates if there was an error or not
 *                     error:
 *                       type: object
 *                       nullable: true
 *                       description: Details of the error, if any
 *                       $ref: '#/definitions/Error'
 *                 jrn:
 *                   type: number
 *
 * /user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided name
 *     parameters:
 *       - name: name
 *         description: Name of the user to create
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   patch:
 *     summary: Update an user
 *     description: Update the name of an existing user with the provided ID
 *     parameters:
 *       - name: id
 *         description: ID of the user to update
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   delete:
 *     summary: Delete an user
 *     description: Delete an existing user with the provided ID
 *     parameters:
 *       - name: id
 *         description: ID of the user to delete
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 * /device/devices:
 *   get:
 *     summary: Get all devices
 *     description: Retrieve a list of all devices
 *     responses:
 *       200:
 *         description: A list of devices
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided name
 *     parameters:
 *       - name: name
 *         description: Name of the user to create
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   patch:
 *     summary: Update an user
 *     description: Update the name of an existing user with the provided ID
 *     parameters:
 *       - name: id
 *         description: ID of the user to update
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *
 *   delete:
 *     summary: Delete an user
 *     description: Delete an existing user with the provided ID
 *     parameters:
 *       - name: id
 *         description: ID of the user to delete
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 */


module.exports = router;
