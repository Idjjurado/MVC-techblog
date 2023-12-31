const router = require('express').Router();
const sequelize = require('../../config/connection');
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', async (req, res) => {
	console.log(req.body);
	try {
		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
		});
		console.log('newUser', newUser);
		req.session.save(() => {
			(req.session.userId = newUser.id), (req.session.loggedIn = true);
			res.status(201).json(newUser); // 201 - Created
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/', async (req, res) => {
	try {
		const users = await User.findAll({
			attributes: {
				exclude: ['password'],
				include: [
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM post WHERE post.userId = user.id)'
						),
						'postsCount',
					],
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.userId = user.id)'
						),
						'commentsCount',
					],
				],
			},
		});
		res.status(200).json(users); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/profile', withAuth, async (req, res) => {
	try {
		const user = await User.findByPk(req.session.userId, {
			include: [
				{ model: Post },
				{ model: Comment, include: { model: Post, attributes: ['title'] } },
			],
			attributes: {
				exclude: ['password'],
				include: [
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM post WHERE post.userId = user.id)'
						),
						'postsCount',
					],
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.userId = user.id)'
						),
						'commentsCount',
					],
				],
			},
		});

		if (!user) return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(200).json(user); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/:userId', async (req, res) => {
	try {
		const user = await User.findByPk(req.params.userId, {
			include: [
				{ model: Post },
				{ model: Comment, include: { model: Post, attributes: ['title'] } },
			],
			attributes: {
				exclude: ['password'],
				include: [
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM post WHERE post.userId = user.id)'
						),
						'postsCount',
					],
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.userId = user.id)'
						),
						'commentsCount',
					],
				],
			},
		});

		if (!user) return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(200).json(user); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.put('/profile', withAuth, async (req, res) => {
	try {
		const updatedUser = await User.update(req.body, {
			where: {
				id: req.session.userId,
			},
			individualHooks: true,
		});

		if (!updatedUser[0])
			return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(202).json(updatedUser); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.delete('/profile', withAuth, async (req, res) => {
	try {
		const deletedUser = await User.destroy({
			where: {
				id: req.session.userId,
			},
		});

		if (!deletedUser)
			return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(202).json(deletedUser); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.delete('/:userId', async (req, res) => {
	try {
		const deletedUser = await User.destroy({
			where: {
				id: req.params.userId,
			},
		});
		console.log(deletedUser);

		if (!deletedUser)
			return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(202).json(deletedUser); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({
			where: { email: req.body.email },
		});

		if (!user)
			return res.status(400).json({ message: 'Credentials not valid.' }); // 400 - Bad Request

		const validPw = await user.checkPassword(req.body.password);
		if (!validPw)
			return res.status(400).json({ message: 'Credentials not valid.' }); // 400 - Bad Request

		req.session.save(() => {
			req.session.userId = user.id;
			req.session.loggedIn = true;
			res.status(200).json(user); // 200 - OK
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.post('/logout', async (req, res) => {
	if (req.session.loggedIn) {
		req.session.destroy(() => {
			res.status(204).end(); // 204 - No Content
		});
	} else {
		res.status(404).end(); // 404 - Not Found
	}
});

module.exports = router;
