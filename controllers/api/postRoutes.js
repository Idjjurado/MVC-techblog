// create instance of express Router
const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', withAuth, async (req, res) => {
	try {
		const newPost = await Post.create({
			title: req.body.title,
			text: req.body.text,
			userId: req.session.userId,
		});
		res.status(201).json(newPost); // 201 - Created
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/', async (req, res) => {
	try {
		const posts = await Post.findAll({
			include: [{ model: User, attributes: ['username'] }],
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.postId = post.id)'
						),
						'commentsCount',
					],
				],
			},
		});
		res.status(200).json(posts); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/:postId', async (req, res) => {
	try {
		const post = await Post.findByPk(req.params.postId, {
			include: [
				{ model: User, attributes: ['username'] },
				{ model: Comment, include: { model: User, attributes: ['username'] } },
			],
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.postId = post.id)'
						),
						'commentsCount',
					],
				],
			},
		});
		res.status(200).json(post); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.put('/:postId', withAuth, async (req, res) => {
	try {
		const updatedPost = await Post.update(req.body, {
			where: {
				id: req.params.postId,
				userId: req.session.userId,
			},
		});

		if (!updatedPost[0])
			return res
				.status(406)
				.json({ message: 'This request cannot be completed.' }); // 406 - Not Acceptable

		res.status(202).json(updatedPost); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.delete('/:postId', withAuth, async (req, res) => {
	try {
		const deletedPost = await Post.destroy({
			where: {
				id: req.params.postId,
				userId: req.session.userId,
			},
		});

		if (!deletedPost)
			return res
				.status(406)
				.json({ message: 'This request cannot be completed.' }); // 406 - Not Acceptable

		res.status(202).json(deletedPost); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

module.exports = router;
