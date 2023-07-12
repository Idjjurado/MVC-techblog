const router = require('express').Router();
const { Comment, User, Post } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', withAuth, async (req, res) => {
	try {
		const newComment = await Comment.create({
			text: req.body.text,
			postId: req.body.postId,
			userId: req.session.userId,
		});
		res.status(201).json(newComment); // 201 - Created
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/', async (req, res) => {
	try {
		const comments = await Comment.findAll({
			include: [
				{ model: User, attributes: ['username'] },
				{ model: Post, include: { model: User, attributes: ['username'] } },
			],
		});
		res.status(200).json(comments); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.get('/:commentId', async (req, res) => {
	try {
		const comment = await Comment.findByPk(req.params.commentId, {
			include: [
				{ model: User, attributes: ['username'] },
				{ model: Post, include: { model: User, attributes: ['username'] } },
			],
		});
		res.status(200).json(comment); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.put('/:commentId', withAuth, async (req, res) => {
	try {
		const updatedComment = await Comment.update(req.body, {
			where: {
				id: req.params.commentId,
				userId: req.session.userId,
			},
		});

		if (!updatedComment[0])
			return res
				.status(406)
				.json({ message: 'This request cannot be completed.' }); // 406 - Not Acceptable

		res.status(202).json(updatedComment); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

router.delete('/:commentId', withAuth, async (req, res) => {
	try {
		const deletedComment = await Comment.destroy({
			where: {
				id: req.params.commentId,
				userId: req.session.userId,
			},
		});

		if (!deletedComment)
			return res
				.status(406)
				.json({ message: 'This request cannot be completed.' }); // 406 - Not Acceptable

		res.status(202).json(deletedComment); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

module.exports = router;
