// mongoose paginations

const firstHandlerFunction = tryCatchMiddleware(async (req, res, next) => {
    let userExist = true;
  
    if (userExist) {
      return next(new ErrorHandler("User exists", 401));
    }
  
    return res.json({
      status: "User Created",
    });
  });
  const secondHandlerFunction = tryCatchMiddleware(async (req, res, next) => {
    return res.json({
      status: "Post request test",
    });
  });
  
  
  const moviesHandler = tryCatchMiddleware(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    let data = await movies
      .find({})
      .skip(startIndex)
      .limit(limit)
      .select(["title", "fullplot"])
      .lean();
  
    const count = await movies.countDocuments({});
    const totalPages = Math.ceil(count / limit);
    const prevPage = page - 1 < 1 ? 1 : page - 1;
  
    return res.json({
      data: data,
      currentPage: page,
      previousPage: prevPage,
      totalPages: totalPages,
    });
  });
  
  const commentHandler = tryCatchMiddleware(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    let data = await comments
      .find({})
      .skip(startIndex)
      .limit(limit)
      .select([])
      // .populate('movie_id', ['title', 'fullplot'])
      .populate('movie_id')
      .lean();
  
    const count = await comments.countDocuments({});
    const totalPages = Math.ceil(count / limit);
    const prevPage = page - 1 < 1 ? false : page - 1;
  
    return res.json({
      data: data,
      currentPage: page,
      previousPage: prevPage,
      totalPages: totalPages,
    });
  });