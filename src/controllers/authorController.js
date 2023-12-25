const authorController = {
    createArticle: async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (userRole !== 'author') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { title, content, imageData, categoryId, categoryName, status } = req.body;

            const newArticle = await prisma.article.create({
                data: {
                    userId: userId,
                    title: title,
                    content: content,
                    imageData: imageData,
                    categoryId: categoryId,
                    categoryName: categoryName,
                    status: status,
                },
            });

            res.json(newArticle);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};