import Content from '../models/Content.js';

export const getContent = async (req, res) => {
  let content = await Content.findOne();
  if (!content) content = await Content.create({});
  res.json(content);
};

export const updateContent = async (req, res) => {
  let content = await Content.findOne();
  if (!content) content = await Content.create({});
  content.about = req.body.about || content.about;
  content.contact = req.body.contact || content.contact;
  await content.save();
  res.json(content);
};
