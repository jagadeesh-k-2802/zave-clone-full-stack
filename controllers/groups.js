const fetch = require('node-fetch');
const cheerio = require('cheerio');
const catchAsync = require('../utils/catchAsync');
const Group = require('../models/Group');
const ErrorResponse = require('../utils/errorResponse');

const fetchTitleAndIcon = async url => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html, { decodeEntities: true });
    const { origin } = new URL(url);

    const name = $('title').text();
    let icon;
    const selectors = [
      $('link[rel="icon"]').attr('href'),
      $('link[rel="shortcut icon"]').attr('href'),
      $('meta[property="og:image"]').attr('content')
    ];

    for (let i = 0; i < selectors.length; i++) {
      if (icon) {
        break;
      }

      icon = selectors[i];
    }

    if (!icon.includes(origin)) {
      icon = origin + icon;
    }

    return { name, icon };
  } catch (err) {
    return { title: '', icon: '' };
  }
};

/**
 * @route POST /groups
 * @desc Creates a group in database
 */
exports.createGroup = catchAsync(async (req, res) => {
  const { name, color } = req.body;
  await Group.create({ name, color, user: req.user.id });
  return res.status(200).json({ success: true });
});

/**
 * @route PUT /groups/:id
 * @desc Edits a group in database
 */
exports.editGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, color, groupVisibility } = req.body;
  const group = await Group.findById(id);

  // Not Found
  if (!group) {
    return next(new ErrorResponse('Group Not found', 404));
  }

  // Not Authorized
  if (group.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not Authorized', 401));
  }

  if (name) {
    group.name = name;
  }

  if (color) {
    group.color = color;
  }

  if (groupVisibility) {
    group.groupVisibility = groupVisibility;
  }

  await group.save();
  return res.status(200).json({ success: true });
});

/**
 * @route DELETE /groups/:id
 * @desc Removes a group from database
 */
exports.deleteGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const group = await Group.findById(id);

  // Not Found
  if (!group) {
    return next(new ErrorResponse('Group Not found', 404));
  }

  // Not Authorized
  if (group.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not Authorized', 401));
  }

  await group.remove();
  return res.status(200).json({ success: true });
});

/**
 * @route POST /groups/:id/add-card
 * @desc Adds a card to a group in database
 */
exports.addCard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { url } = req.body;
  const group = await Group.findById(id);

  // Not Authorized
  if (group.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not Authorized', 401));
  }

  // Not Found
  if (!group) {
    return next(new ErrorResponse('Group Not found', 404));
  }

  // Find Title And Favicon
  const { name, icon } = await fetchTitleAndIcon(url);
  group.items.push({ name, url, icon });
  await group.save();

  return res.status(200).json({ success: true });
});

/**
 * @route PUT /groups/:id/edit-card/:cardId
 * @desc Edits a card in a group in database
 */
exports.editCard = catchAsync(async (req, res) => {
  const { id, cardId } = req.params;
  const { name, url } = req.body;
  const group = await Group.findById(id);
  const { icon } = await fetchTitleAndIcon(url);

  // Not Authorized
  if (group.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not Authorized', 401));
  }

  // Not Found
  if (!group) {
    return next(new ErrorResponse('Group Not found', 404));
  }

  // Edit Card
  group.items.filter(item => {
    if (item.id === cardId) {
      item.name = name;
      item.url = url;
      item.icon = icon;
    }
  });

  await group.save();
  return res.status(200).json({ success: true });
});

/**
 * @route DELETE /groups/:id/delete-card/:cardId
 * @desc Removes a card from a group in database
 */
exports.deleteCard = catchAsync(async (req, res) => {
  const { id, cardId } = req.params;
  const group = await Group.findById(id);

  // Not Authorized
  if (group.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not Authorized', 401));
  }

  // Not Found
  if (!group) {
    return next(new ErrorResponse('Group Not found', 404));
  }

  group.items = group.items.filter(item => item.id !== cardId);
  await group.save();
  return res.status(200).json({ success: true });
});
